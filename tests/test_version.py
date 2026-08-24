"""Prove one semantic version updates both plugin manifests or neither."""

import json
import tempfile
import unittest
from pathlib import Path
from unittest import mock

from scripts.version import update_manifest_versions, validate_version


class VersionTests(unittest.TestCase):
    """Pin validation and coordinated manifest updates in an isolated checkout."""

    def test_updates_both_manifests_and_preserves_unrelated_fields(self) -> None:
        """A valid version must reach Codex and Claude without rewriting identity."""
        # A private checkout proves coordinated output without changing release metadata.
        with tempfile.TemporaryDirectory() as temporary_directory:
            # fixture_root owns both versioned manifest locations.
            fixture_root = Path(temporary_directory)
            # codex_manifest represents the shared plugin package metadata.
            codex_manifest = fixture_root / ".codex-plugin" / "plugin.json"
            # claude_manifest represents the Claude-specific package metadata.
            claude_manifest = fixture_root / ".claude-plugin" / "plugin.json"
            codex_manifest.parent.mkdir()
            claude_manifest.parent.mkdir()
            codex_manifest.write_text('{"name":"opinionated","version":"0.1.0"}\n')
            claude_manifest.write_text('{"name":"opinionated","version":"0.1.0"}\n')

            # changed pins the stable manifest update order reported to the CLI.
            changed = update_manifest_versions(fixture_root, "1.2.3")

            self.assertEqual(changed, (codex_manifest, claude_manifest))
            self.assertEqual(
                json.loads(codex_manifest.read_text()), {"name": "opinionated", "version": "1.2.3"}
            )
            self.assertEqual(
                json.loads(claude_manifest.read_text()), {"name": "opinionated", "version": "1.2.3"}
            )

    def test_invalid_version_is_rejected_before_any_manifest_changes(self) -> None:
        """A partial version must return the named error without filesystem effects."""
        with self.assertRaisesRegex(ValueError, "invalid-semver"):
            validate_version("1.2")

    def test_second_write_failure_restores_the_first_manifest(self) -> None:
        """A coordinated version update must roll back an earlier replaced manifest."""
        # The private checkout makes a partial write safe to induce and inspect.
        with tempfile.TemporaryDirectory() as temporary_directory:
            # fixture_root owns both files participating in the coordinated update.
            fixture_root = Path(temporary_directory)
            # codex_manifest is written first and therefore exercises rollback.
            codex_manifest = fixture_root / ".codex-plugin" / "plugin.json"
            # claude_manifest fails on its attempted second write.
            claude_manifest = fixture_root / ".claude-plugin" / "plugin.json"
            codex_manifest.parent.mkdir()
            claude_manifest.parent.mkdir()
            # original must be restored byte-for-byte after the boundary failure.
            original = '{"name":"opinionated","version":"0.1.0"}\n'
            codex_manifest.write_text(original)
            claude_manifest.write_text(original)
            # The fake boundary fails once, then allows production rollback to execute.
            write_count = 0

            def fail_second_write(target: Path, content: str) -> None:
                """Write normally except for the second coordinated replacement."""
                nonlocal write_count
                write_count += 1
                if write_count == 2:
                    raise OSError("second-write-failed")
                target.write_text(content)

            with mock.patch(
                "scripts.version.atomic_write_text",
                side_effect=fail_second_write,
            ):
                with self.assertRaisesRegex(OSError, "second-write-failed"):
                    update_manifest_versions(fixture_root, "1.2.3")

            self.assertEqual(codex_manifest.read_text(), original)
            self.assertEqual(claude_manifest.read_text(), original)


if __name__ == "__main__":
    unittest.main()
