"""Prove Homebrew snapshots preserve authored rationale for unchanged entries."""

import tempfile
import unittest
from pathlib import Path

from scripts.sync_brew import capture_brew, merge_brewfiles


class BrewfileMergeTests(unittest.TestCase):
    """Pin exact comment and declaration output for machine snapshots."""

    def test_preserves_existing_rationale_and_uses_descriptions_for_new_entries(self) -> None:
        """Exact declarations keep authored comments while new tools keep dump comments."""
        # current carries user intent plus a declaration absent from installed state.
        current = (
            "# Search repositories because agents need fast, bounded discovery.\n"
            'brew "ripgrep"\n'
            "# This stale tool is no longer installed.\n"
            'brew "old-tool"\n'
        )
        # snapshot is machine order and includes two mise-owned commands to exclude.
        snapshot = (
            "# Fast recursive text search.\n"
            'brew "ripgrep"\n'
            "# Swiss-army knife for HTTP.\n"
            'brew "httpie"\n'
            'go "cmd/go"\n'
            'go "cmd/gofmt"\n'
        )

        # merged is the complete deterministic output; both inputs must remain unchanged.
        merged = merge_brewfiles(snapshot, current)

        self.assertEqual(
            merged,
            "# Search repositories because agents need fast, bounded discovery.\n"
            'brew "ripgrep"\n'
            "# Swiss-army knife for HTTP.\n"
            'brew "httpie"\n',
        )
        self.assertEqual(
            current,
            "# Search repositories because agents need fast, bounded discovery.\n"
            'brew "ripgrep"\n'
            "# This stale tool is no longer installed.\n"
            'brew "old-tool"\n',
        )

    def test_failed_homebrew_validation_preserves_the_tracked_brewfile(self) -> None:
        """A rejected generated snapshot must not replace the last valid Brewfile."""
        # The private tree contains a state-changing dump followed by a failed validation.
        with tempfile.TemporaryDirectory() as temporary_directory:
            # fixture_root owns the tracked target and executable Homebrew boundary double.
            fixture_root = Path(temporary_directory)
            # brewfile begins with valid state that must survive the later refusal.
            brewfile = fixture_root / "Brewfile"
            # fake_brew writes a different valid dump, then rejects its list validation.
            fake_brew = fixture_root / "brew"
            brewfile.write_text("# Existing rationale.\n" 'brew "ripgrep"\n')
            fake_brew.write_text(
                "#!/usr/bin/env python3\n"
                "import pathlib, sys\n"
                "target = next((arg.split('=', 1)[1] for arg in sys.argv if arg.startswith('--file=')), None)\n"
                "if 'dump' in sys.argv:\n"
                "    pathlib.Path(target).write_text('# Generated.\\nbrew \"httpie\"\\n')\n"
                "    raise SystemExit(0)\n"
                "raise SystemExit(7)\n"
            )
            fake_brew.chmod(0o755)

            with self.assertRaisesRegex(Exception, "exit status 7"):
                capture_brew(brewfile, fake_brew)

            self.assertEqual(brewfile.read_text(), "# Existing rationale.\n" 'brew "ripgrep"\n')


if __name__ == "__main__":
    unittest.main()
