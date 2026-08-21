---
name: sops-sync
description: Encrypt local secret files for Git and restore them without overwriting newer local work.
user-invocable: false
---

# Sync encrypted copies

Keep plaintext files and encrypted Git copies in sync without losing local work or producing half-written batches. This setup uses age recipients and `SOPS_AGE_KEY_FILE`.

Apply `sops-naming` to every managed path. Preserve a repository's existing script when it already enforces the same rules.

## Load the relevant references

- Read [references/cipher.sh](references/cipher.sh) before creating or changing a Bash encrypt/decrypt script. It keeps path mapping, staging, and rollback shared between both commands.
- Read [references/cipher_test.sh](references/cipher_test.sh) when changing the script's behavior. Adapt its test files with the script.

Copy the behavior, not the example paths or task-runner names.

## Preserve these rules

When plaintext exists, its contents win:

| Plaintext | Encrypted copy | Encrypt | Decrypt |
| --- | --- | --- | --- |
| Missing | Present | Error | Create plaintext |
| Present | Missing | Create encrypted copy | Error |
| Present | Present | Update only when content changed | Keep plaintext |
| Missing | Missing | Error | Error |

Replacing existing plaintext is a separate recovery action. Require an explicit force option and make dry-run available for it.

## Keep each operation safe

- Keep an explicit list of plaintext files. Reject unknown paths, duplicates, symlinks, missing inputs, and non-regular files.
- Validate the whole batch before staging any result. Stage every result before replacing any managed destination.
- Create temporary files beside their destinations so the final rename stays on one filesystem.
- Start with a private umask. Write plaintext as `0600` and ciphertext as `0644`.
- Remove staged files on exit. If a multi-file commit fails or receives a terminating signal, restore destinations already replaced.
- Pass explicit input and output types to SOPS. Do not trust a renamed or extensionless file to infer the intended store.
- Never print decrypted values. Reports should contain paths and state changes only.
- Do not add, commit, or push files. Syncing encrypted copies does not authorize Git changes.

## Encrypt

Encryption needs the configured public recipient, not the private identity.

When a usable identity is available, decrypt the existing and staged copies to private temporary files and compare their normalized plaintext. Keep the existing encrypted copy when they match. SOPS encryption is randomized, so ciphertext bytes alone cannot answer whether content changed.

When no identity is available, report that comparison was impossible and write the newly encrypted copy. Do not pretend its contents changed because the ciphertext differs.

## Decrypt

Require a usable private identity before planning decryption.

Create missing plaintext. If plaintext already exists, compare it with the decrypted copy after normalizing YAML through the same SOPS path. Keep matching plaintext untouched. Report a conflict and preserve differing plaintext unless the caller explicitly requested recovery with force.

## Dry-run and test

Load `principle-testing-guidelines`. Apply `principle-test-proof-state-transitions`, `principle-test-fixtures`, `principle-test-boundaries`, and `principle-test-execution` to this workflow.

Dry-run must execute the same validation, staging, normalization, and comparison path while skipping destination replacement. It may decrypt into private temporary files, so do not describe it as a no-access operation.

Test observable state transitions with generated identities and synthetic secrets. Cover permissions, conflicts, unchanged content, missing inputs, corrupt ciphertext, dry-run, forced recovery, and batch preflight failure.
