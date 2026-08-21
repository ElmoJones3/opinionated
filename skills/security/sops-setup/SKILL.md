---
name: sops-setup
description: Add SOPS file names, Git ignore rules, encrypt/decrypt commands, and tests to a repository.
user-invocable: true
---

# Set up SOPS file handling

Set up a repository where plaintext secret files stay local and encrypted copies are committed to Git.

## Load the rules

Load these skills before writing files:

- `sops-naming`
- `sops-sync`

Report a missing skill. Do not recreate its rules from memory.

Read the sync skill's script and test references before implementing them. Adapt the managed paths, environment loading, and task-runner commands to the target repository. Keep the state table and failure behavior intact.

Load `principle-testing-guidelines` before adding or changing the test. The sync skill supplies the SOPS-specific contract; the testing skills own fixtures, state-transition proof, dependency boundaries, and execution evidence.

## Inspect the repository

- Find existing SOPS configuration, secret names, ignore rules, task runners, environment loaders, scripts, tests, and application consumers.
- Preserve an established SOPS setup unless the user asked to migrate it.
- Identify the plaintext files the repository will manage. Do not make the script discover them with a broad filename pattern.
- Use the public age recipient chosen for this repository. Keep private identities outside the repository.

If a required managed path or public recipient cannot be inferred, ask for that value. Do not copy one from an unrelated repository.

## Add the files and commands

1. Add or merge `.sops.yaml` with a creation rule for managed plaintext paths and the repository's public recipient.
2. Add the plaintext ignore rule without hiding encrypted copies.
3. Add the repository script from the sync reference, replace its example file list with the actual plaintext paths, and install it with mode `0755`.
4. Add task-runner commands for encrypt, encrypt dry-run, decrypt, and decrypt dry-run. Load local environment configuration through the repository's existing tool when available.
5. Point application and operator commands at plaintext paths.
6. Add the synthetic state-transition test from the sync reference, install it with mode `0755`, and wire it into the repository's test command.
7. Document the two filenames, the rule that plaintext wins, the private identity variable, ordinary decrypt behavior, forced recovery path, and dry-run commands.

Merge with existing files. Do not replace unrelated ignore rules, task targets, scripts, or documentation.

## Verify the result

- Confirm the script and test are executable and have valid shell syntax.
- Run the synthetic state-transition test with its generated identity.
- Confirm representative plaintext paths are ignored and encrypted-copy paths are not.
- Confirm no managed plaintext is tracked.
- Inspect the working-tree diff for private identities or secret values.

Set up the files and commands only. Do not create application secrets, encrypt operational plaintext, commit files, or push changes unless the user separately asks for those actions.
