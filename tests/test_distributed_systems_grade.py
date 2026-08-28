"""Prove the distributed-systems audit grade is calculated from principle defects."""

import json
import subprocess
import sys
import unittest
from pathlib import Path

# REPOSITORY_ROOT anchors the public CLI path independently of the invoking directory.
REPOSITORY_ROOT = Path(__file__).resolve().parents[1]
# GRADE_SCRIPT is the deterministic owner of the audit skill's grading arithmetic.
GRADE_SCRIPT = (
    REPOSITORY_ROOT / "skills" / "systems" / "distributed-systems-audit" / "scripts" / "grade.py"
)


class DistributedSystemsGradeTests(unittest.TestCase):
    """Pin scoring, severity caps, empty audits, and invalid input at the CLI boundary."""

    def run_grade(self, *principles: str) -> subprocess.CompletedProcess[str]:
        """Run the grade CLI with one defect specification per applicable principle."""
        return subprocess.run(
            (sys.executable, str(GRADE_SCRIPT), *principles),
            check=False,
            capture_output=True,
            text=True,
        )

    def test_calculates_the_forward_test_grade(self) -> None:
        """Cross-referenced defects may reduce several principle scores without changing counts."""
        # result reproduces the eight applicable principles from the isolated audit fixture.
        result = self.run_grade(
            "critical",
            "critical,major",
            "critical,major",
            "critical",
            "major",
            "major",
            "major",
            "critical",
        )

        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertEqual(
            json.loads(result.stdout),
            {
                "applicable_principles": 8,
                "available_points": 32,
                "earned_points": 6,
                "final_grade": "F",
                "percentage": 19,
                "principle_scores": [0, 0, 0, 0, 2, 2, 2, 0],
                "raw_grade": "F",
                "severity_cap": "D",
                "severity_cap_applied": False,
            },
        )

    def test_applies_each_severity_cap_to_an_otherwise_a_grade(self) -> None:
        """One severe defect must remain visible across many passing principles."""
        # expected_grades binds each strongest defect to the maximum permitted letter.
        expected_grades = {"minor": "B", "major": "C", "critical": "D"}
        # expected_percentages also pins half-up rounding for the minor case at 97.5.
        expected_percentages = {"minor": 98, "major": 95, "critical": 90}
        # severity and expected_grade enumerate the complete cap policy.
        for severity, expected_grade in expected_grades.items():
            with self.subTest(severity=severity):
                # Ten principles keep each raw percentage in the A range before the cap.
                result = self.run_grade(severity, *("pass",) * 9)
                # payload exposes both the uncapped and final decision for comparison.
                payload = json.loads(result.stdout)

                self.assertEqual(result.returncode, 0, result.stderr)
                self.assertEqual(payload["raw_grade"], "A")
                self.assertEqual(payload["final_grade"], expected_grade)
                self.assertEqual(payload["percentage"], expected_percentages[severity])
                self.assertTrue(payload["severity_cap_applied"])

    def test_awards_a_when_every_applicable_principle_passes(self) -> None:
        """An audit without defects must retain its full score and uncapped A grade."""
        # result covers the report's required no-defect outcome with two applicable rules.
        result = self.run_grade("pass", "pass")

        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertEqual(json.loads(result.stdout)["final_grade"], "A")
        self.assertEqual(json.loads(result.stdout)["percentage"], 100)

    def test_combines_penalties_within_one_principle(self) -> None:
        """Several defects reduce one principle without producing a negative score."""
        # result places all three findings on one principle and leaves another clean.
        result = self.run_grade("major,minor,minor", "pass")

        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertEqual(json.loads(result.stdout)["principle_scores"], [0, 4])

    def test_returns_not_applicable_when_no_principle_applies(self) -> None:
        """An empty applicable set must not manufacture a numeric grade."""
        # result omits every principle argument to exercise the explicit N/A branch.
        result = self.run_grade()

        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertEqual(
            json.loads(result.stdout),
            {
                "applicable_principles": 0,
                "final_grade": "N/A",
                "principle_scores": [],
            },
        )

    def test_rejects_an_unknown_severity(self) -> None:
        """A misspelled severity must fail instead of silently changing the grade."""
        # result carries one valid severity so the refusal is pinned to the unknown value.
        result = self.run_grade("major,trivial")

        self.assertEqual(result.returncode, 2)
        self.assertEqual(result.stdout, "")
        self.assertIn("invalid-severity:trivial", result.stderr)


if __name__ == "__main__":
    unittest.main()
