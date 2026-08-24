"""Prove zsh capture accepts portable state and preserves tracked state on refusal."""

import tempfile
import unittest
from pathlib import Path

from scripts.sync_zsh import capture_zsh, normalize_zsh_snapshot, zsh_snapshot_problems


class ZshSnapshotTests(unittest.TestCase):
    """Pin the portable snapshot contract independently of the live home directory."""

    def test_reports_every_conflicting_path_owner_without_mutating_input(self) -> None:
        """PNPM_HOME and a literal home path must produce ordered stable codes."""
        # content reaches both independent path-owner checks in their declared order.
        content = (
            'export PNPM_HOME="/Users/thanos/Library/pnpm"\n'
            'export PATH="/Users/thanos/.local/bin:$PATH"\n'
        )

        # problems is the exact immutable decision returned to the capture boundary.
        problems = zsh_snapshot_problems(content, Path("/Users/thanos"))

        self.assertEqual(problems, ("pnpm-path-owner", "hard-coded-home"))
        self.assertEqual(
            content,
            'export PNPM_HOME="/Users/thanos/Library/pnpm"\n'
            'export PATH="/Users/thanos/.local/bin:$PATH"\n',
        )

    def test_normalizes_only_the_trailing_newline(self) -> None:
        """Snapshot normalization must preserve content while ending with one newline."""
        self.assertEqual(normalize_zsh_snapshot("alias x='mise x --'\n\n"), "alias x='mise x --'\n")

    def test_rejected_capture_preserves_the_existing_snapshot(self) -> None:
        """A pnpm-owned path must fail before the tracked target changes."""
        # The private tree proves failure preservation without touching the real cfg file.
        with tempfile.TemporaryDirectory() as temporary_directory:
            # fixture_root owns both sides of the one-way capture.
            fixture_root = Path(temporary_directory)
            # source reproduces the pnpm installer block that conflicted with mise.
            source = fixture_root / ".zshrc"
            # target records the bytes that must survive validation failure.
            target = fixture_root / "zshrc"
            source.write_text('export PNPM_HOME="$HOME/Library/pnpm"\n')
            target.write_text("tracked\n")

            with self.assertRaisesRegex(ValueError, "pnpm-path-owner"):
                capture_zsh(source, target, fixture_root, Path("/bin/zsh"))

            self.assertEqual(target.read_text(), "tracked\n")

    def test_valid_capture_accepts_spaces_and_replaces_the_snapshot(self) -> None:
        """A portable, syntactically valid live file becomes the exact tracked copy."""
        # Spaces in both paths catch accidental shell-string command construction.
        with tempfile.TemporaryDirectory() as temporary_directory:
            # fixture_root owns a normal source and stale destination.
            fixture_root = Path(temporary_directory)
            # source carries the portable mise alias selected for the real live file.
            source = fixture_root / "live zshrc"
            # target must receive normalized source bytes after zsh accepts them.
            target = fixture_root / "tracked zshrc"
            source.write_text("# Portable mise shortcut.\nalias x='mise x --'\n\n")
            target.write_text("old\n")

            capture_zsh(source, target, fixture_root, Path("/bin/zsh"))

            self.assertEqual(target.read_text(), "# Portable mise shortcut.\nalias x='mise x --'\n")


if __name__ == "__main__":
    unittest.main()
