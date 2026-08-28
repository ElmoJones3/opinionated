#!/usr/bin/env python3
"""Calculate a distributed-systems audit grade from applicable principle defects."""

import json
import sys
from collections.abc import Sequence
from typing import TypeAlias

# Severity names are the only defect classifications accepted by the audit skill.
SEVERITIES = frozenset({"minor", "major", "critical"})
# GradePayload keeps the pure calculation independent of JSON serialization.
GradePayload: TypeAlias = dict[str, int | str | bool | list[int]]


def parse_principle(specification: str) -> tuple[str, ...]:
    """Return one principle's defect severities or refuse an unknown grade input."""
    if specification == "pass":
        return ()

    # parsed contains each defect that changes this principle's score.
    parsed = tuple(part.strip() for part in specification.split(",") if part.strip())
    if not parsed:
        raise ValueError("invalid-principle-specification:empty")

    # severity checks every supplied finding before any score can be emitted.
    for severity in parsed:
        if severity not in SEVERITIES:
            raise ValueError(f"invalid-severity:{severity}")
    return parsed


def score_principle(severities: Sequence[str]) -> int:
    """Return the bounded zero-to-four score for one applicable principle."""
    if "critical" in severities:
        return 0

    # penalty applies every distinct finding associated with this principle.
    penalty = severities.count("minor") + (2 * severities.count("major"))
    return max(0, 4 - penalty)


def percentage_grade(percentage: int) -> str:
    """Convert a whole-number percentage into the audit's raw letter grade."""
    if percentage >= 90:
        return "A"
    if percentage >= 80:
        return "B"
    if percentage >= 70:
        return "C"
    if percentage >= 60:
        return "D"
    return "F"


def severity_cap(severities: Sequence[str]) -> str:
    """Return the best grade allowed by the strongest observed defect."""
    if "critical" in severities:
        return "D"
    if "major" in severities:
        return "C"
    if "minor" in severities:
        return "B"
    return "A"


def apply_cap(raw_grade: str, cap: str) -> str:
    """Return the worse of the percentage grade and the severity cap."""
    # grade_order arranges letters from best to worst for a direct index comparison.
    grade_order = ("A", "B", "C", "D", "F")
    return grade_order[max(grade_order.index(raw_grade), grade_order.index(cap))]


def calculate_grade(specifications: Sequence[str]) -> GradePayload:
    """Return the complete grade record for the applicable principle specifications."""
    if not specifications:
        return {
            "applicable_principles": 0,
            "final_grade": "N/A",
            "principle_scores": [],
        }

    # principle_defects preserves input order for the report's principle walk.
    principle_defects = tuple(parse_principle(specification) for specification in specifications)
    # principle_scores expose the exact deductions used in the total.
    principle_scores = tuple(score_principle(defects) for defects in principle_defects)
    # all_severities determines the single strongest cap without changing finding counts.
    all_severities = tuple(severity for principle in principle_defects for severity in principle)
    # earned_points is the numerator before conversion to a percentage.
    earned_points = sum(principle_scores)
    # available_points gives every applicable principle the same four-point weight.
    available_points = 4 * len(principle_scores)
    # percentage uses integer half-up rounding so language defaults cannot change the result.
    percentage = (2 * 100 * earned_points + available_points) // (2 * available_points)
    # raw_grade records the percentage result before risk caps apply.
    raw_grade = percentage_grade(percentage)
    # cap records the strongest defect's maximum permitted grade.
    cap = severity_cap(all_severities)
    # final_grade keeps a weak percentage or a stronger severity cap, whichever is worse.
    final_grade = apply_cap(raw_grade, cap)

    return {
        "applicable_principles": len(principle_scores),
        "available_points": available_points,
        "earned_points": earned_points,
        "final_grade": final_grade,
        "percentage": percentage,
        "principle_scores": list(principle_scores),
        "raw_grade": raw_grade,
        "severity_cap": cap,
        "severity_cap_applied": final_grade != raw_grade,
    }


def main(arguments: tuple[str, ...]) -> int:
    """Write the calculated audit grade for the supplied principle specifications."""
    try:
        # payload remains a value until the CLI boundary serializes it once.
        payload = calculate_grade(arguments)
    except ValueError as error:
        # error carries the exact refused value so a typo cannot become a silent pass.
        print(str(error), file=sys.stderr)
        return 2

    print(json.dumps(payload, sort_keys=True))
    return 0


if __name__ == "__main__":
    raise SystemExit(main(tuple(sys.argv[1:])))
