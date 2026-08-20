# Security skills

These skills define one safe SOPS workflow for repository secrets. Encryption alone is not enough. Plaintext must stay out of Git, encrypted copies need predictable names, and decrypt must never destroy newer local work.

## The skills

| Skill | Trigger | What it owns |
| --- | --- | --- |
| [`sops-naming`](sops-naming/SKILL.md) | Automatic for managed paths | Maps local `*.secret.yaml` files to tracked `*.secret.sops.yaml` copies unless the repository already has a convention. |
| [`sops-sync`](sops-sync/SKILL.md) | Automatic for sync behavior | Defines validation, staging, comparison, rollback, permissions, dry runs, and forced recovery. |
| [`sops-setup`](sops-setup/SKILL.md) | SOPS setup work | Adds repository-specific names, ignore rules, commands, tests, and documentation without creating or encrypting operational secrets. |
| [`sops-audit`](sops-audit/SKILL.md) | Explicit only | Reviews naming and sync behavior without decrypting secrets or changing the repository unless fixes were also requested. |

## The rules that matter

Plaintext wins when both copies exist. Ordinary decrypt creates missing plaintext, keeps matching plaintext, and reports a conflict when local content differs. Replacing it requires an explicit force option. Quietly clobbering a local secret is not synchronization.

Sync commands validate the whole batch before replacing any destination. They reject unknown paths, duplicates, symlinks, and invalid inputs. Temporary plaintext stays private, destination replacement stays on one filesystem, and a failed batch rolls back work already applied.

Dry-run uses the same validation, staging, decryption, normalization, and comparison path as the real command. It skips the final replacement. Calling it a no-access operation would be false.

The audit skill is deliberately read-only. It may inspect SOPS document structure and Git tracking state, but it does not decrypt operational values or run repository recovery commands.
