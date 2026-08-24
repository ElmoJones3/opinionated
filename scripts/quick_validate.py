#!/usr/bin/env python3
"""Run the canonical skill validator and repository-wide consistency checks.

The installed skill-creator remains the authority for SKILL.md frontmatter. This
wrapper proves every repository skill reaches it, then checks the manifests,
catalog counts, agent metadata, shell configuration, Brewfile, and Git whitespace.
"""

import json
import os
import re
import subprocess
import sys
import tempfile
from pathlib import Path

from scripts.sync_brew import parse_brewfile

# Root README text carries the public total and category counts for human readers.
ROOT_SKILL_COUNT = re.compile(r"currently has (\d+) skills")
# Table rows expose category counts in a stable Markdown shape.
CATEGORY_COUNT = re.compile(r"^\| \[([^]]+)]\([^)]*\) \| (\d+) \|", re.MULTILINE)
# Claude adds these booleans beside portable Agent Skills frontmatter.
PLATFORM_FRONTMATTER_KEYS = ("user-invocable", "disable-model-invocation")
# Directory names normally title-case; UI remains an initialism in public docs.
CATEGORY_LABELS = {"ui": "UI"}


def discover_skill_directories(root: Path) -> tuple[Path, ...]:
    """Return tracked skill directories while excluding vendored dependencies."""
    # A vendored package may contain its own AGENTS or SKILL files; those are not ours.
    discovered = (
        skill_file.parent
        for skill_file in (root / "skills").rglob("SKILL.md")
        if "node_modules" not in skill_file.parts
    )
    return tuple(sorted(discovered))


def validate_skill_directories(
    skill_directories: tuple[Path, ...],
    validator: Path,
    python: Path,
) -> tuple[str, ...]:
    """Run portable frontmatter through the canonical validator and return failures."""
    # Collect all failures so one run reports the complete repair set.
    problems: list[str] = []
    with tempfile.TemporaryDirectory(prefix="opinionated-skills-") as temporary_directory:
        temporary_root = Path(temporary_directory)
        for index, skill_directory in enumerate(skill_directories):
            canonical_directory = canonical_skill_directory(
                skill_directory,
                temporary_root / f"{index}-{skill_directory.name}",
            )
            result = subprocess.run(
                (str(python), str(validator), str(canonical_directory)),
                check=False,
                capture_output=True,
                text=True,
            )
            if result.returncode == 0:
                continue
            detail = result.stdout.strip() or result.stderr.strip() or f"exit {result.returncode}"
            problems.append(f"skill-validator:{skill_directory}:{detail}")
    return tuple(problems)


def canonical_skill_directory(skill_directory: Path, temporary_directory: Path) -> Path:
    """Return a temporary skill copy only when Claude frontmatter needs removal."""
    # A fixture without SKILL.md lets boundary tests exercise delegation in isolation.
    skill_file = skill_directory / "SKILL.md"
    if not skill_file.is_file():
        return skill_directory

    content = skill_file.read_text()
    frontmatter_match = re.match(r"^---\n(.*?)\n---", content, re.DOTALL)
    if frontmatter_match is None:
        return skill_directory

    # Platform keys are removed only from YAML; identical body text remains instruction.
    platform_lines = tuple(f"{key}:" for key in PLATFORM_FRONTMATTER_KEYS)
    sanitized_frontmatter_lines = [
        line
        for line in frontmatter_match.group(1).splitlines()
        if not any(line.startswith(prefix) for prefix in platform_lines)
    ]
    sanitized_frontmatter = "\n".join(sanitized_frontmatter_lines)
    sanitized = (
        content[: frontmatter_match.start(1)]
        + sanitized_frontmatter
        + content[frontmatter_match.end(1) :]
    )
    if sanitized == content:
        return skill_directory

    temporary_directory.mkdir(parents=True)
    (temporary_directory / "SKILL.md").write_text(sanitized)
    return temporary_directory


def platform_frontmatter_problems(
    skill_directories: tuple[Path, ...],
) -> tuple[str, ...]:
    """Return non-boolean Claude invocation fields omitted from canonical validation."""
    # PyYAML validates actual field types after the canonical validator checks the base.
    import yaml

    problems: list[str] = []
    for skill_directory in skill_directories:
        content = (skill_directory / "SKILL.md").read_text()
        frontmatter_match = re.match(r"^---\n(.*?)\n---", content, re.DOTALL)
        if frontmatter_match is None:
            continue
        frontmatter = yaml.safe_load(frontmatter_match.group(1))
        if not isinstance(frontmatter, dict):
            continue
        for key in PLATFORM_FRONTMATTER_KEYS:
            if key in frontmatter and not isinstance(frontmatter[key], bool):
                problems.append(f"platform-frontmatter-boolean:{skill_directory}:{key}")
    return tuple(problems)


def manifest_skill_problems(
    root: Path,
    skill_directories: tuple[Path, ...],
) -> tuple[str, ...]:
    """Return mismatches between discovered skills and the Claude manifest."""
    # Claude requires explicit directories; filesystem discovery defines completeness.
    manifest_path = root / ".claude-plugin" / "plugin.json"
    manifest = json.loads(manifest_path.read_text())
    declared = manifest.get("skills")
    if not isinstance(declared, list) or not all(isinstance(item, str) for item in declared):
        return ("claude-skills-array-required",)

    expected = tuple(f"./{path.relative_to(root).as_posix()}/" for path in skill_directories)
    actual = tuple(declared)
    problems: list[str] = []
    for missing in sorted(set(expected) - set(actual)):
        problems.append(f"claude-skill-missing:{missing}")
    for extra in sorted(set(actual) - set(expected)):
        problems.append(f"claude-skill-extra:{extra}")
    if actual != tuple(sorted(actual)):
        problems.append("claude-skills-not-sorted")
    return tuple(problems)


def find_skill_validator() -> Path:
    """Locate the installed skill-creator validator or reject an ambiguous environment."""
    # An explicit override supports nonstandard Codex installations and CI fixtures.
    override = os.environ.get("OPINIONATED_SKILL_VALIDATOR")
    candidates: list[Path] = []
    if override:
        candidates.append(Path(override))

    # CODEX_HOME takes precedence over the conventional user directory when set.
    codex_home = os.environ.get("CODEX_HOME")
    if codex_home:
        candidates.append(
            Path(codex_home) / "skills/.system/skill-creator/scripts/quick_validate.py"
        )
    candidates.append(Path.home() / ".codex/skills/.system/skill-creator/scripts/quick_validate.py")

    for candidate in candidates:
        if candidate.is_file():
            return candidate
    raise FileNotFoundError("canonical-skill-validator-not-found")


def version_problems(root: Path) -> tuple[str, ...]:
    """Return plugin version disagreement after proving both manifests are objects."""
    # The marketplace consumes both manifests, so one release number must name the batch.
    codex = json.loads((root / ".codex-plugin/plugin.json").read_text())
    claude = json.loads((root / ".claude-plugin/plugin.json").read_text())
    codex_version = codex.get("version") if isinstance(codex, dict) else None
    claude_version = claude.get("version") if isinstance(claude, dict) else None
    if codex_version != claude_version:
        return (f"plugin-version-mismatch:{codex_version}:{claude_version}",)
    return ()


def readme_count_problems(
    root: Path,
    skill_directories: tuple[Path, ...],
) -> tuple[str, ...]:
    """Return stale root totals and category counts from the public catalog."""
    # Counts are derived facts; README claims must equal filesystem reality exactly.
    readme = (root / "README.md").read_text()
    total_match = ROOT_SKILL_COUNT.search(readme)
    problems: list[str] = []
    if total_match is None or int(total_match.group(1)) != len(skill_directories):
        claimed = total_match.group(1) if total_match else "missing"
        problems.append(f"readme-total:{claimed}:{len(skill_directories)}")

    # Category paths are the source of truth for each root table row.
    actual_counts: dict[str, int] = {}
    for skill_directory in skill_directories:
        category_directory = skill_directory.relative_to(root / "skills").parts[0]
        category = CATEGORY_LABELS.get(category_directory, category_directory.title())
        actual_counts[category] = actual_counts.get(category, 0) + 1
    claimed_counts = {name: int(count) for name, count in CATEGORY_COUNT.findall(readme)}
    for category, actual_count in sorted(actual_counts.items()):
        claimed_count = claimed_counts.get(category)
        if claimed_count != actual_count:
            problems.append(f"readme-category:{category}:{claimed_count}:{actual_count}")
    return tuple(problems)


def agent_metadata_problems(
    skill_directories: tuple[Path, ...],
) -> tuple[str, ...]:
    """Return missing or malformed OpenAI presentation metadata for each skill."""
    # PyYAML is a dev dependency because YAML syntax should not be approximated by regex.
    import yaml

    problems: list[str] = []
    for skill_directory in skill_directories:
        metadata_path = skill_directory / "agents/openai.yaml"
        if not metadata_path.is_file():
            problems.append(f"openai-metadata-missing:{skill_directory}")
            continue
        try:
            metadata = yaml.safe_load(metadata_path.read_text())
        except yaml.YAMLError as error:
            problems.append(f"openai-metadata-yaml:{metadata_path}:{error}")
            continue
        if not isinstance(metadata, dict) or not isinstance(metadata.get("interface"), dict):
            problems.append(f"openai-interface-required:{metadata_path}")
    return tuple(problems)


def brewfile_comment_problems(root: Path) -> tuple[str, ...]:
    """Return captured Brewfile declarations that lack an authored reason."""
    # Machine discovery cannot explain intent; every new entry needs human rationale.
    blocks = parse_brewfile((root / "cfg/Brewfile").read_text())
    return tuple(
        f"brew-rationale-missing:{block.declaration}" for block in blocks if not block.comments
    )


def command_problem(name: str, command: tuple[str, ...], root: Path) -> tuple[str, ...]:
    """Return one stable failure containing command output, or no problem on success."""
    # Repository checks must expose the tool's own reason rather than a generic status.
    result = subprocess.run(command, cwd=root, check=False, capture_output=True, text=True)
    if result.returncode == 0:
        return ()
    detail = result.stderr.strip() or result.stdout.strip() or f"exit {result.returncode}"
    return (f"{name}:{detail}",)


def main() -> int:
    """Validate this checkout and print each failed contract once."""
    # Every check reports into one ordered batch so later failures are not hidden.
    repository_root = Path(__file__).resolve().parents[1]
    skill_directories = discover_skill_directories(repository_root)
    try:
        validator = find_skill_validator()
        problems = [
            *validate_skill_directories(
                skill_directories,
                validator,
                Path(sys.executable),
            ),
            *manifest_skill_problems(repository_root, skill_directories),
            *platform_frontmatter_problems(skill_directories),
            *version_problems(repository_root),
            *readme_count_problems(repository_root, skill_directories),
            *agent_metadata_problems(skill_directories),
            *brewfile_comment_problems(repository_root),
            *command_problem(
                "bash-syntax",
                ("bash", "-n", "cfg/setup.sh", "cfg/git.sh", "install.sh"),
                repository_root,
            ),
            *command_problem("zsh-syntax", ("zsh", "-n", "cfg/zshrc"), repository_root),
            *command_problem(
                "brewfile",
                ("brew", "bundle", "list", "--file=cfg/Brewfile"),
                repository_root,
            ),
            *command_problem("git-diff", ("git", "diff", "--check"), repository_root),
        ]
    except (FileNotFoundError, json.JSONDecodeError, OSError, ValueError) as error:
        problems = [f"validator-setup:{error}"]

    if problems:
        for problem in problems:
            print(problem, file=sys.stderr)
        return 1

    print(f"Validated {len(skill_directories)} skills and repository metadata.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
