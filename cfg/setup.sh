#!/usr/bin/env bash

set -Eeuo pipefail

repo_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd -P)"
brewfile="$repo_dir/cfg/Brewfile"
mise_config="$repo_dir/cfg/mise.toml"
zsh_config="$repo_dir/cfg/zshrc"

log() {
  printf '\n==> %s\n' "$1"
}

die() {
  printf 'error: %s\n' "$1" >&2
  exit 1
}

backup_and_link() {
  local source_path="$1"
  local target_path="$2"
  local target_dir backup_path

  target_dir="$(dirname "$target_path")"
  mkdir -p "$target_dir"

  if [[ -L "$target_path" ]] && [[ "$(readlink "$target_path")" == "$source_path" ]]; then
    printf 'Already linked: %s\n' "$target_path"
    return
  fi

  if [[ -e "$target_path" || -L "$target_path" ]]; then
    backup_path="${target_path}.pre-opinionated.$(date +%Y%m%d%H%M%S)"
    mv "$target_path" "$backup_path"
    printf 'Backed up %s to %s\n' "$target_path" "$backup_path"
  fi

  ln -s "$source_path" "$target_path"
  printf 'Linked %s -> %s\n' "$target_path" "$source_path"
}

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

install_oh_my_zsh() {
  if [[ -d "$HOME/.oh-my-zsh" ]]; then
    return
  fi

  log "Installing Oh My Zsh"
  sh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)" "" --unattended --keep-zshrc
}

install_grok() {
  if [[ -x "$HOME/.grok/bin/grok" ]] || command -v grok >/dev/null 2>&1; then
    return
  fi

  log "Installing Grok Build"
  curl -fsSL https://x.ai/cli/install.sh | bash
}

install_mise() {
  if [[ -x "$HOME/.local/bin/mise" ]]; then
    return
  fi

  log "Installing mise from the preferred official release"
  curl -fsSL https://mise.run | sh
}

[[ "$(uname -s)" == "Darwin" ]] || die "this bootstrap currently supports macOS only"

install_homebrew

log "Installing Homebrew formulae and applications"
brew bundle --file="$brewfile"

# Run installers before linking the tracked zshrc so installer-generated edits
# cannot modify the repository through the symlink.
install_oh_my_zsh
install_grok
install_mise

log "Linking tracked configuration"
backup_and_link "$mise_config" "$HOME/.config/mise/config.toml"
backup_and_link "$zsh_config" "$HOME/.zshrc"

log "Installing mise-managed runtimes"
"$HOME/.local/bin/mise" install --yes

log "Bootstrap complete"
printf '%s\n' \
  "Manual follow-up:" \
  "  - Download and sign in to Raycast." \
  "  - Download and sign in to Cursor." \
  "  - Launch Grok Build and Codex once to authenticate."
