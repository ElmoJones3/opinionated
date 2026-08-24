"""Prove repository validation discovers and executes every skill contract."""

import tempfile
import unittest
from pathlib import Path

from scripts.quick_validate import (
    brewfile_comment_problems,
    discover_skill_directories,
    manifest_skill_problems,
    readme_count_problems,
    validate_skill_directories,
)


class QuickValidationTests(unittest.TestCase):
    """Pin discovery boundaries and canonical-validator execution."""

    def test_discovers_skills_but_excludes_vendored_node_modules(self) -> None:
        """Only repository-owned SKILL files may enter manifest and count checks."""
        # A private tree proves discovery without depending on this repository's count.
        with tempfile.TemporaryDirectory() as temporary_directory:
            # fixture_root owns every path the discovery walk may observe.
            fixture_root = Path(temporary_directory)
            # owned_skill represents a skill maintained by this repository.
            owned_skill = fixture_root / "skills" / "ui" / "owned"
            # vendored_skill reproduces a dependency that must never enter our manifest.
            vendored_skill = fixture_root / "skills" / "ui" / "node_modules" / "vendored"
            owned_skill.mkdir(parents=True)
            vendored_skill.mkdir(parents=True)
            (owned_skill / "SKILL.md").write_text("owned\n")
            (vendored_skill / "SKILL.md").write_text("vendored\n")

            # discovered is the complete ordered result under assertion.
            discovered = discover_skill_directories(fixture_root)

            self.assertEqual(discovered, (owned_skill,))

    def test_runs_the_canonical_validator_for_every_discovered_skill(self) -> None:
        """Validation must identify the exact skill rejected by the delegated tool."""
        # The isolated validator gives deterministic success and failure without PyYAML.
        with tempfile.TemporaryDirectory() as temporary_directory:
            # fixture_root owns both skills and the executable boundary double.
            fixture_root = Path(temporary_directory)
            # passing_skill proves validation continues past another skill's failure.
            passing_skill = fixture_root / "passing"
            # failing_skill supplies the stable path required in the reported problem.
            failing_skill = fixture_root / "failing"
            passing_skill.mkdir()
            failing_skill.mkdir()
            # validator behaves like the canonical CLI while selecting by directory name.
            validator = fixture_root / "validator.py"
            validator.write_text(
                "import pathlib, sys\n"
                "name = pathlib.Path(sys.argv[1]).name\n"
                "print('invalid frontmatter' if name == 'failing' else 'Skill is valid!')\n"
                "raise SystemExit(1 if name == 'failing' else 0)\n"
            )

            # problems must contain the rejected skill and the validator's exact reason.
            problems = validate_skill_directories(
                (failing_skill, passing_skill),
                validator,
                Path(__import__("sys").executable),
            )

            self.assertEqual(problems, (f"skill-validator:{failing_skill}:invalid frontmatter",))

    def test_reports_exact_missing_and_extra_claude_skill_paths(self) -> None:
        """Manifest parity must distinguish omissions from stale declarations."""
        # A private manifest makes both mismatch directions reachable in one fixture.
        with tempfile.TemporaryDirectory() as temporary_directory:
            # fixture_root stands in for a minimal checkout root.
            fixture_root = Path(temporary_directory)
            # skill_directory exists on disk but is deliberately absent from the manifest.
            skill_directory = fixture_root / "skills" / "ui" / "owned"
            # manifest declares a stale path so extra detection runs after missing detection.
            manifest = fixture_root / ".claude-plugin" / "plugin.json"
            skill_directory.mkdir(parents=True)
            manifest.parent.mkdir()
            manifest.write_text('{"skills":["./skills/ui/stale/"]}\n')

            # problems pins ordering as well as the two distinct mismatch identities.
            problems = manifest_skill_problems(fixture_root, (skill_directory,))

            self.assertEqual(
                problems,
                (
                    "claude-skill-missing:./skills/ui/owned/",
                    "claude-skill-extra:./skills/ui/stale/",
                ),
            )

    def test_known_claude_frontmatter_is_removed_only_for_canonical_validation(self) -> None:
        """Claude invocation flags must not hide invalid base Agent Skills frontmatter."""
        # This fixture forces delegation to fail if platform keys reach the canonical tool.
        with tempfile.TemporaryDirectory() as temporary_directory:
            # fixture_root owns the extended skill and its strict validator double.
            fixture_root = Path(temporary_directory)
            # skill_directory contains valid base frontmatter plus supported Claude fields.
            skill_directory = fixture_root / "review"
            skill_directory.mkdir()
            (skill_directory / "SKILL.md").write_text(
                "---\n"
                "name: review\n"
                "description: Review one thing.\n"
                "user-invocable: true\n"
                "disable-model-invocation: true\n"
                "---\n"
                "\n"
                "# Review\n"
            )
            # validator rejects leaked platform fields and accepts the portable copy.
            validator = fixture_root / "validator.py"
            validator.write_text(
                "import pathlib, sys\n"
                "content = (pathlib.Path(sys.argv[1]) / 'SKILL.md').read_text()\n"
                "if 'user-invocable:' in content or 'disable-model-invocation:' in content:\n"
                "    print('platform extension leaked')\n"
                "    raise SystemExit(1)\n"
                "print('Skill is valid!')\n"
            )

            # problems must remain empty only after the delegated input is sanitized.
            problems = validate_skill_directories(
                (skill_directory,),
                validator,
                Path(__import__("sys").executable),
            )

            self.assertEqual(problems, ())

    def test_ui_category_keeps_its_public_initialism(self) -> None:
        """Derived README counts must map the ui directory to the UI table label."""
        # The minimal catalog isolates label normalization from other category counts.
        with tempfile.TemporaryDirectory() as temporary_directory:
            # fixture_root supplies the root README and one discovered UI skill.
            fixture_root = Path(temporary_directory)
            # skill_directory derives the lowercase filesystem category under test.
            skill_directory = fixture_root / "skills" / "ui" / "button"
            skill_directory.mkdir(parents=True)
            (fixture_root / "README.md").write_text(
                "The repository currently has 1 skills in six categories.\n"
                "| [UI](skills/ui/README.md) | 1 | Components. |\n"
            )

            # problems proves both the total and public category label match.
            problems = readme_count_problems(fixture_root, (skill_directory,))

            self.assertEqual(problems, ())

    def test_brewfile_declarations_require_a_recorded_reason(self) -> None:
        """Generated entries without comments must remain visibly incomplete."""
        # The fixture pairs one explained declaration with one raw generated entry.
        with tempfile.TemporaryDirectory() as temporary_directory:
            # fixture_root supplies the cfg path expected by repository validation.
            fixture_root = Path(temporary_directory)
            # brewfile is valid Bundle syntax but intentionally incomplete documentation.
            brewfile = fixture_root / "cfg" / "Brewfile"
            brewfile.parent.mkdir()
            brewfile.write_text(
                "# Used for repository search.\n" 'brew "ripgrep"\n' 'vscode "golang.go"\n'
            )

            # problems must name only the declaration without preceding rationale.
            problems = brewfile_comment_problems(fixture_root)

            self.assertEqual(problems, ('brew-rationale-missing:vscode "golang.go"',))


if __name__ == "__main__":
    unittest.main()
