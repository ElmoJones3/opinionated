#!/usr/bin/env python3
"""Keep the Codex and Claude plugin versions on one explicit release number."""

import argparse
import json
import re
import sys
from pathlib import Path

from scripts.common import atomic_write_text

# These are the only manifests that publish an Opinionated plugin version.
VERSIONED_MANIFESTS = (
    Path(".codex-plugin/plugin.json"),
    Path(".claude-plugin/plugin.json"),
)
# Accept the complete SemVer 2.0.0 shape, including prerelease and build identifiers.
SEMVER = re.compile(
    r"^(?:0|[1-9]\d*)\."
    r"(?:0|[1-9]\d*)\."
    r"(?:0|[1-9]\d*)"
    r"(?:-(?:0|[1-9]\d*|\d*[A-Za-z-][0-9A-Za-z-]*)"
    r"(?:\.(?:0|[1-9]\d*|\d*[A-Za-z-][0-9A-Za-z-]*))*)?"
    r"(?:\+[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?$"
)


def validate_version(version: str) -> None:
    """Reject values that are not complete semantic versions."""
    if not SEMVER.fullmatch(version):
        raise ValueError(f"invalid-semver:{version}")


def update_manifest_versions(root: Path, version: str) -> tuple[Path, ...]:
    """Apply one version to every manifest and restore earlier writes on failure."""
    validate_version(version)

    # Parse every manifest before the first write so malformed input changes nothing.
    manifests: list[tuple[Path, str, dict[str, object]]] = []
    for relative_path in VERSIONED_MANIFESTS:
        manifest_path = root / relative_path
        original = manifest_path.read_text()
        manifest = json.loads(original)
        if not isinstance(manifest, dict):
            raise ValueError(f"manifest-object-required:{manifest_path}")
        manifests.append((manifest_path, original, manifest))

    # Each output keeps insertion order and unrelated metadata from the source JSON.
    changed_paths: list[Path] = []
    originals_by_path = {manifest_path: original for manifest_path, original, _ in manifests}
    try:
        for manifest_path, _, manifest in manifests:
            manifest["version"] = version
            atomic_write_text(manifest_path, f"{json.dumps(manifest, indent=2)}\n")
            changed_paths.append(manifest_path)
    except BaseException as update_error:
        # Restore in reverse order so callers never observe a deliberate partial release.
        rollback_errors: list[OSError] = []
        for changed_path in reversed(changed_paths):
            try:
                atomic_write_text(changed_path, originals_by_path[changed_path])
            except OSError as rollback_error:
                rollback_errors.append(rollback_error)
        if rollback_errors:
            raise RuntimeError(f"version-rollback-failed:{rollback_errors}") from update_error
        raise
    return tuple(changed_paths)


def main() -> int:
    """Apply the command-line version to manifests rooted at this checkout."""
    # The checkout root follows from this script so callers can run it from anywhere.
    repository_root = Path(__file__).resolve().parents[1]
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("version", help="Semantic version to write, such as 0.2.0")
    arguments = parser.parse_args()

    try:
        changed = update_manifest_versions(repository_root, arguments.version)
    except (OSError, ValueError, json.JSONDecodeError) as error:
        print(f"version: {error}", file=sys.stderr)
        return 1

    for manifest_path in changed:
        print(f"Updated {manifest_path} -> {arguments.version}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
