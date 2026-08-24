#!/usr/bin/env python3
"""Capture installed Homebrew state without discarding repository rationale.

Homebrew owns discovery of installed declarations. This module keeps comments
written for unchanged declarations, uses Homebrew descriptions for new entries,
and removes declarations absent from the machine snapshot.
"""

import argparse
import re
import subprocess
import sys
import tempfile
from dataclasses import dataclass
from pathlib import Path

from scripts.common import atomic_write_text

# Homebrew Bundle recognizes these declaration families in generated snapshots.
BREW_DECLARATION = re.compile(
    r"^(?:brew|cask|tap|mas|vscode|go|cargo|uv|flatpak|krew|npm|whalebrew)\s+"
)
# mise's Go distribution already owns these standard commands and their versions.
IGNORED_BREW_DECLARATIONS = frozenset({'go "cmd/go"', 'go "cmd/gofmt"'})


@dataclass(frozen=True)
class BrewBlock:
    """Keep one declaration beside the comments that explain its inclusion."""

    # Declaration is the exact executable Brewfile line used as the merge identity.
    declaration: str
    # Comments retain authored rationale or Homebrew's description for a new tool.
    comments: tuple[str, ...]


def parse_brewfile(content: str) -> tuple[BrewBlock, ...]:
    """Parse comment-prefixed declarations while preserving their original order."""
    # Pending comments belong to the next declaration, matching Brewfile convention.
    pending_comments: list[str] = []
    blocks: list[BrewBlock] = []

    for line in content.splitlines():
        if BREW_DECLARATION.match(line):
            blocks.append(
                BrewBlock(
                    declaration=line,
                    comments=tuple(comment for comment in pending_comments if comment),
                )
            )
            pending_comments = []
            continue
        if line and not line.startswith("#"):
            raise ValueError(f"unsupported-brewfile-line:{line}")
        pending_comments.append(line)

    if any(line for line in pending_comments):
        raise ValueError("orphaned-brewfile-comment")
    return tuple(blocks)


def merge_brewfiles(snapshot: str, current: str) -> str:
    """Return snapshot declarations with existing comments kept for exact matches."""
    # Exact declarations preserve user rationale; changed declarations are new state.
    current_comments = {block.declaration: block.comments for block in parse_brewfile(current)}
    snapshot_blocks = parse_brewfile(snapshot)
    merged_lines: list[str] = []

    for block in snapshot_blocks:
        if block.declaration in IGNORED_BREW_DECLARATIONS:
            continue
        comments = current_comments.get(block.declaration, block.comments)
        merged_lines.extend(comments)
        merged_lines.append(block.declaration)

    return f"{'\n'.join(merged_lines)}\n"


def capture_brew(brewfile: Path, brew: Path) -> None:
    """Dump, validate, and atomically replace the tracked Homebrew snapshot."""
    # A private temporary directory prevents partial dump files entering the checkout.
    with tempfile.TemporaryDirectory(prefix="opinionated-brew-") as temporary_directory:
        temporary_root = Path(temporary_directory)
        dumped_brewfile = temporary_root / "Brewfile.dump"
        candidate_brewfile = temporary_root / "Brewfile.candidate"

        subprocess.run(
            (
                str(brew),
                "bundle",
                "dump",
                "--force",
                f"--file={dumped_brewfile}",
            ),
            check=True,
        )

        # Merge is pure; filesystem replacement waits until Homebrew accepts the result.
        current = brewfile.read_text() if brewfile.exists() else ""
        merged = merge_brewfiles(dumped_brewfile.read_text(), current)
        candidate_brewfile.write_text(merged)
        subprocess.run(
            (str(brew), "bundle", "list", f"--file={candidate_brewfile}"),
            check=True,
        )
        atomic_write_text(brewfile, merged)


def main() -> int:
    """Capture the local Homebrew installation for Makefile callers."""
    # The default paths bind this command to the current checkout and Homebrew prefix.
    repository_root = Path(__file__).resolve().parents[1]
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--brewfile", type=Path, default=repository_root / "cfg" / "Brewfile")
    parser.add_argument("--brew", type=Path, default=Path("/opt/homebrew/bin/brew"))
    arguments = parser.parse_args()

    try:
        capture_brew(arguments.brewfile, arguments.brew)
    except (OSError, subprocess.CalledProcessError, ValueError) as error:
        print(f"sync-brew: {error}", file=sys.stderr)
        return 1

    print(f"Captured installed Homebrew state -> {arguments.brewfile}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
