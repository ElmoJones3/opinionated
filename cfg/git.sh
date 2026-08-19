#!/usr/bin/env bash

set -Eeuo pipefail

git_name="${GIT_USER_NAME:-Stanley Fich}"
git_email="${GIT_USER_EMAIL:-sf@jadeiq.com}"
private_key="${SSH_SIGNING_KEY:-$HOME/.ssh/id_ed25519}"
public_key="${private_key}.pub"

log() {
  printf '\n==> %s\n' "$1"
}

git config --global user.name "$git_name"
git config --global user.email "$git_email"

if [[ -f "$private_key" && ! -f "$public_key" ]]; then
  log "Reconstructing the public key from $private_key"
  ssh-keygen -y -f "$private_key" > "$public_key"
fi

if [[ ! -f "$public_key" ]]; then
  reply="n"

  if [[ -t 0 ]]; then
    printf 'No SSH key found at %s. Generate one? [y/N] ' "$private_key"
    read -r reply
  fi

  case "$reply" in
    y|Y|yes|YES)
      mkdir -p "$(dirname "$private_key")"
      chmod 700 "$(dirname "$private_key")"
      ssh-keygen -t ed25519 -C "$git_email" -f "$private_key"
      ;;
    *)
      printf '\nGit identity configured, but SSH signing was skipped.\n'
      printf 'Create a key or rerun with SSH_SIGNING_KEY=/path/to/key.\n'
      exit 0
      ;;
  esac
fi

git config --global gpg.format ssh
git config --global user.signingkey "$public_key"
git config --global commit.gpgsign true

log "Git identity and SSH commit signing configured"
printf '%s\n' \
  "Next steps:" \
  "  1. Verify $git_email on GitHub." \
  "  2. Add $public_key to GitHub as an authentication key." \
  "  3. Add the same public key again as a signing key." \
  "  4. Test authentication with: ssh -T git@github.com" \
  "  5. After your next commit, run: git log --show-signature -1"
