"""Provide recoverable file replacement for repository maintenance commands."""

import os
import tempfile
from pathlib import Path


def atomic_write_text(target: Path, content: str) -> None:
    """Replace one text file without exposing a partially written destination."""
    # New snapshots use ordinary readable configuration permissions.
    target_mode = target.stat().st_mode if target.exists() else 0o100644
    target.parent.mkdir(parents=True, exist_ok=True)

    # The temporary file must share the destination filesystem for atomic replace.
    temporary_path: Path | None = None
    try:
        with tempfile.NamedTemporaryFile(
            mode="w",
            encoding="utf-8",
            dir=target.parent,
            prefix=f".{target.name}.",
            delete=False,
        ) as temporary_file:
            temporary_file.write(content)
            temporary_path = Path(temporary_file.name)
        temporary_path.chmod(target_mode & 0o777)
        os.replace(temporary_path, target)
    except BaseException:
        if temporary_path is not None:
            temporary_path.unlink(missing_ok=True)
        raise
