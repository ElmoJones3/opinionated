#!/usr/bin/env bash

set -Eeuo pipefail

repo_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd -P)"
install_claude=false

usage() {
  printf '%s\n' \
    "Usage: ./install.sh [--claude]" \
    "" \
    "Links every skill below skills/ into ~/.agents/skills." \
    "Pass --claude to link them into ~/.claude/skills too."
}

die() {
  printf 'error: %s\n' "$1" >&2
  exit 1
}

for arg in "$@"; do
  case "$arg" in
    --claude)
      install_claude=true
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      usage >&2
      die "unknown argument: $arg"
      ;;
  esac
done

link_skills() {
  local target_root="$1"
  local skill_file skill_dir skill_name target current_target
  local installed=0

  mkdir -p "$target_root"

  while IFS= read -r -d '' skill_file; do
    skill_dir="${skill_file%/SKILL.md}"
    skill_name="$(basename "$skill_dir")"
    target="$target_root/$skill_name"

    if [[ -L "$target" ]] && [[ "$(readlink "$target")" == "$skill_dir" ]]; then
      printf 'Already linked: %s\n' "$target"
      installed=$((installed + 1))
      continue
    fi

    if [[ -L "$target" ]]; then
      current_target="$(readlink "$target")"

      if [[ "$current_target" == "$repo_dir/skills/"* ]]; then
        ln -sfn "$skill_dir" "$target"
        printf 'Relinked %s -> %s\n' "$target" "$skill_dir"
        installed=$((installed + 1))
        continue
      fi
    fi

    if [[ -e "$target" || -L "$target" ]]; then
      die "$target already exists and is not managed by this checkout"
    fi

    ln -s "$skill_dir" "$target"
    printf 'Linked %s -> %s\n' "$target" "$skill_dir"
    installed=$((installed + 1))
  done < <(find "$repo_dir/skills" -type f -name SKILL.md -print0)

  (( installed > 0 )) || die "no skills found in $repo_dir/skills"
}

link_skills "$HOME/.agents/skills"

if [[ "$install_claude" == true ]]; then
  link_skills "$HOME/.claude/skills"
fi

printf '%s\n' "Installed. Rerun this command after adding another skill."
