---
name: sops-naming
description: Name unencrypted secret files and their encrypted Git copies consistently.
user-invocable: false
---

# Name secret files

Use the filename to show which file is plaintext and which encrypted copy is committed to Git.

## Apply the mapping

Map each managed file in one direction:

```text
<stem>.secret.yaml -> <stem>.secret.sops.yaml
```

Examples:

```text
config/app.secret.yaml      -> config/app.secret.sops.yaml
secrets/client.secret.yaml  -> secrets/client.secret.sops.yaml
```

Replace only the final `.secret.yaml` suffix. Do not mix this convention with encrypted-file suffixes such as `.enc.yaml`, `.encrypted.yaml`, or `.sops.yaml`.

Preserve an established repository convention unless the user asks to migrate it. Apply this mapping outright in a new SOPS setup.

## Wire the repository

- Ignore `*.secret.yaml` at repository scope so plaintext stays ignored in every directory.
- Keep `*.secret.sops.yaml` visible to Git. Check the result instead of assuming the ignore pattern behaves correctly.
- Match plaintext input paths in `.sops.yaml` creation rules. For this convention, use a path regex such as `.*\.secret\.yaml$`.
- Keep one explicit allowlist of plaintext paths. Derive each encrypted path with the mapping above instead of maintaining a second list.
- Point applications and operator commands at plaintext paths. Point Git instructions at encrypted copies.
- Update task runners, scripts, tests, and documentation when a managed path changes.

## Check the names

- Every managed plaintext path ends in `.secret.yaml`.
- Every encrypted path is derived from its plaintext path.
- `git check-ignore` confirms that plaintext is ignored.
- `git check-ignore` does not match encrypted copies.
- Any encrypted copies that exist are visible to `git ls-files`, and no managed plaintext is tracked.
