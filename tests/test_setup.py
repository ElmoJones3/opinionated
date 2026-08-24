"""Prove bootstrap installs an editable zsh copy instead of a repository symlink."""

import subprocess
import tempfile
import unittest
from pathlib import Path


class SetupContractTests(unittest.TestCase):
    """Pin the bootstrap direction required by workstation-to-repository capture."""

    def test_setup_copies_the_zsh_snapshot_into_the_live_file(self) -> None:
        """A rebuilt workstation must receive a regular file that it can later capture."""
        # setup_script is inspected directly because running main would mutate the machine.
        setup_script = Path(__file__).resolve().parents[1] / "cfg/setup.sh"
        # content lets this contract distinguish the zsh call site from the mise link.
        content = setup_script.read_text()

        self.assertIn('backup_and_copy "$zsh_config" "$HOME/.zshrc"', content)
        self.assertNotIn('backup_and_link "$zsh_config" "$HOME/.zshrc"', content)

    def test_backup_and_copy_preserves_the_replaced_live_file(self) -> None:
        """Replacing a live file must create one recoverable sibling and a regular copy."""
        # A private directory makes backup discovery exact and prevents home-directory writes.
        with tempfile.TemporaryDirectory() as temporary_directory:
            # fixture_root owns the source, destination, and timestamped backup sibling.
            fixture_root = Path(temporary_directory)
            # source represents the last committed workstation snapshot.
            source = fixture_root / "tracked zshrc"
            # target represents an independently editable live zsh file.
            target = fixture_root / "live zshrc"
            # setup_script is sourced under Bash so main does not run.
            setup_script = Path(__file__).resolve().parents[1] / "cfg/setup.sh"
            source.write_text("new\n")
            target.write_text("old\n")

            subprocess.run(
                (
                    "bash",
                    "-c",
                    'source "$1"; backup_and_copy "$2" "$3"',
                    "setup-test",
                    str(setup_script),
                    str(source),
                    str(target),
                ),
                check=True,
                capture_output=True,
                text=True,
            )

            # backups must contain exactly the displaced live bytes for recovery.
            backups = tuple(fixture_root.glob("live zshrc.pre-opinionated.*"))
            self.assertEqual(target.read_text(), "new\n")
            self.assertFalse(target.is_symlink())
            self.assertEqual(len(backups), 1)
            self.assertEqual(backups[0].read_text(), "old\n")


if __name__ == "__main__":
    unittest.main()
