#!/usr/bin/env bash

# Rebuild a macOS workstation from tracked configuration without making the
# repository the live owner of shell edits. zsh is copied for later capture;
# mise remains linked because its tracked runtime policy is not machine-authored.
set -Eeuo pipefail

# Repository paths anchor every install and avoid dependence on the caller's cwd.
repo_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd -P)"
brewfile="$repo_dir/cfg/Brewfile"
mise_config="$repo_dir/cfg/mise.toml"
zsh_config="$repo_dir/cfg/zshrc"

# log marks major install phases without hiding the commands that perform them.
log() {
  printf '\n==> %s\n' "$1"
}

# die reports an unrecoverable bootstrap contract and stops before later mutation.
die() {
  printf 'error: %s\n' "$1" >&2
  exit 1
}

# backup_existing moves one live path aside before an install replaces it.
# Timestamped siblings keep recovery local and never overwrite an older backup.
backup_existing() {
  # target_path may name a file or symlink; both must survive replacement.
  local target_path="$1"
  # backup_path records the exact recovery location reported to the caller.
  local backup_path

  if [[ ! -e "$target_path" && ! -L "$target_path" ]]; then
    return
  fi

  backup_path="${target_path}.pre-opinionated.$(date +%Y%m%d%H%M%S)"
  mv "$target_path" "$backup_path"
  printf 'Backed up %s to %s\n' "$target_path" "$backup_path"
}

# backup_and_link keeps repository-owned configuration live at its target path.
backup_and_link() {
  # source_path is the stable tracked file the symlink must resolve to exactly.
  local source_path="$1"
  # target_path is replaced only after any prior value receives a backup.
  local target_path="$2"
  # target_dir may not exist on a new workstation.
  local target_dir

  target_dir="$(dirname "$target_path")"
  mkdir -p "$target_dir"

  if [[ -L "$target_path" ]] && [[ "$(readlink "$target_path")" == "$source_path" ]]; then
    printf 'Already linked: %s\n' "$target_path"
    return
  fi

  backup_existing "$target_path"
  ln -s "$source_path" "$target_path"
  printf 'Linked %s -> %s\n' "$target_path" "$source_path"
}

# backup_and_copy installs an editable live file for later machine-to-repo capture.
# A symlink is replaced even when its bytes match because capture rejects same-file state.
backup_and_copy() {
  # source_path is the last committed workstation snapshot.
  local source_path="$1"
  # target_path becomes the primary machine-owned copy.
  local target_path="$2"
  # target_dir may not exist on a new workstation.
  local target_dir

  target_dir="$(dirname "$target_path")"
  mkdir -p "$target_dir"

  if [[ -f "$target_path" && ! -L "$target_path" ]] && cmp -s "$source_path" "$target_path"; then
    printf 'Already copied: %s\n' "$target_path"
    return
  fi

  backup_existing "$target_path"
  cp "$source_path" "$target_path"
  printf 'Copied %s -> %s\n' "$source_path" "$target_path"
}

# install_homebrew supplies the package manager used by the tracked Brewfile.
install_homebrew() {
  if command -v brew >/dev/null 2>&1; then
    return
  fi

  log "Installing Homebrew"
  /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

  if [[ -x /opt/homebrew/bin/brew ]]; then
    eval "$(/opt/homebrew/bin/brew shellenv)"
  elif [[ -x /usr/local/bin/brew ]]; then
    eval "$(/usr/local/bin/brew shellenv)"
  else
    die "Homebrew installed, but brew was not found in a standard prefix"
  fi
}

# install_oh_my_zsh runs before zshrc installation so its installer cannot edit the snapshot.
install_oh_my_zsh() {
  if [[ -d "$HOME/.oh-my-zsh" ]]; then
    return
  fi

  log "Installing Oh My Zsh"
  sh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)" "" --unattended --keep-zshrc
}

# install_grok installs the external CLI whose path and completions zshrc activates.
install_grok() {
  if [[ -x "$HOME/.grok/bin/grok" ]] || command -v grok >/dev/null 2>&1; then
    return
  fi

  log "Installing Grok Build"
  curl -fsSL https://x.ai/cli/install.sh | bash
}

# install_mise uses the upstream release binary because README.md records that policy.
install_mise() {
  if [[ -x "$HOME/.local/bin/mise" ]]; then
    return
  fi

  log "Installing mise from the preferred official release"
  curl -fsSL https://mise.run | sh
}

# main performs the ordered machine rebuild when this file is executed directly.
main() {
  [[ "$(uname -s)" == "Darwin" ]] || die "this bootstrap currently supports macOS only"

  install_homebrew

  log "Installing Homebrew formulae and applications"
  brew bundle --file="$brewfile"

  # Run installers before copying zshrc so generated edits cannot enter the live copy.
  install_oh_my_zsh
  install_grok
  install_mise

  log "Installing tracked configuration"
  backup_and_link "$mise_config" "$HOME/.config/mise/config.toml"
  backup_and_copy "$zsh_config" "$HOME/.zshrc"

  log "Installing mise-managed runtimes"
  "$HOME/.local/bin/mise" install --yes

  log "Configuring Git"
  "$repo_dir/cfg/git.sh"

  log "Bootstrap complete"
  printf '%s\n' \
    "Manual follow-up:" \
    "  - Download and sign in to Raycast." \
    "  - Download and sign in to Cursor." \
    "  - Launch Grok Build and Codex once to authenticate."
}

# Sourcing exposes tested helpers without starting a machine rebuild.
if [[ "${BASH_SOURCE[0]}" == "$0" ]]; then
  main "$@"
fi
