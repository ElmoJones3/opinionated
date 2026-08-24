#!/usr/bin/env python3
"""Capture the primary workstation's zsh configuration into the repository.

The live file owns day-to-day edits. Capture refuses package-manager path blocks
that compete with mise and literal home paths that would make the public snapshot
specific to one checkout owner.
"""

import argparse
import subprocess
import sys
from pathlib import Path

from scripts.common import atomic_write_text

# This repository uses mise as the sole owner of Node package-manager paths.
PNPM_PATH_MARKERS = ("PNPM_HOME", "/Library/pnpm", "/.local/share/pnpm")


def zsh_snapshot_problems(content: str, home_directory: Path) -> tuple[str, ...]:
    """Return stable rejection codes without changing the supplied shell text."""
    # Stable codes let Make and tests distinguish policy failures from syntax errors.
    problems: list[str] = []
    if any(marker in content for marker in PNPM_PATH_MARKERS):
        problems.append("pnpm-path-owner")

    # A literal home directory leaks one machine into a snapshot meant for rebuilds.
    literal_home = str(home_directory)
    if literal_home not in ("", "/") and literal_home in content:
        problems.append("hard-coded-home")
    return tuple(problems)


def normalize_zsh_snapshot(content: str) -> str:
    """Return shell text with the repository's single trailing-newline contract."""
    return content.rstrip("\n") + "\n"


def capture_zsh(
    source: Path,
    target: Path,
    home_directory: Path,
    shell: Path,
) -> None:
    """Validate one live zsh file and atomically replace its tracked snapshot."""
    if source.resolve() == target.resolve():
        raise ValueError("same-file: live zsh file must remain separate from its snapshot")

    # Read once so validation and the eventual write observe the same source bytes.
    content = source.read_text()
    problems = zsh_snapshot_problems(content, home_directory)
    if problems:
        raise ValueError(",".join(problems))

    # zsh owns syntax acceptance; a failed parse must leave the tracked copy intact.
    syntax = subprocess.run(
        (str(shell), "-n", str(source)),
        check=False,
        capture_output=True,
        text=True,
    )
    if syntax.returncode != 0:
        detail = syntax.stderr.strip() or syntax.stdout.strip() or "zsh rejected the file"
        raise ValueError(f"zsh-syntax:{detail}")

    atomic_write_text(target, normalize_zsh_snapshot(content))


def main() -> int:
    """Capture the current user's live zsh configuration for Makefile callers."""
    # Defaults describe the one-way primary-workstation capture contract.
    repository_root = Path(__file__).resolve().parents[1]
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--source", type=Path, default=Path.home() / ".zshrc")
    parser.add_argument("--target", type=Path, default=repository_root / "cfg" / "zshrc")
    parser.add_argument("--home", type=Path, default=Path.home())
    parser.add_argument("--shell", type=Path, default=Path("/bin/zsh"))
    arguments = parser.parse_args()

    try:
        capture_zsh(arguments.source, arguments.target, arguments.home, arguments.shell)
    except (OSError, ValueError) as error:
        print(f"sync-zsh: {error}", file=sys.stderr)
        return 1

    print(f"Captured {arguments.source} -> {arguments.target}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
