---
name: sops-audit
description: Check a repository's SOPS file names and encrypt/decrypt commands for mistakes. Use only when explicitly requested.
disable-model-invocation: true
user-invocable: true
---

# Audit SOPS file handling

Audit the requested repository without editing it unless the user also asks for fixes.

## Load the rules

Load these skills before reviewing:

- `sops-naming`
- `sops-sync`

Report a missing skill. Do not recreate a missing rule from memory.

## Inspect the files and commands

1. Read `.sops.yaml`, ignore rules, the managed-file list, encrypt/decrypt scripts, task-runner commands, consumers of plaintext files, documentation, and tests.
2. Trace every managed plaintext path to its encrypted copy and every consumer. Decide which rules apply before reporting a violation.
3. Inspect encrypted files only far enough to confirm that they are SOPS documents and tracked at the expected paths. Do not decrypt operational secrets or print encrypted values.
4. Use read-only Git checks to confirm tracked and ignored paths.
5. Run static checks and tests that use generated files when they cannot touch managed files. Do not run repository encrypt, decrypt, or recovery commands as part of an audit.
6. Report concrete violations. Do not pad the review with praise, summaries, or rules the repository already follows.

Recipient onboarding, removal, and rotation are outside this audit until a separate rule defines them.

## Report findings

Order findings by the cost of leaving them unfixed. For each finding, include:

- The file and line.
- The skill and rule it violates.
- The exact behavior that is wrong.
- The smallest correction that satisfies the rule.

Use this shape:

```markdown
### scripts/cipher.sh:120

Rule: `sops-sync`, preserve existing plaintext

Ordinary decrypt replaces a differing local plaintext file.
Keep the local file and require an explicit recovery option for replacement.
```

If no violations remain, name the rules that applied and state that the repository passed them. Report commands and results separately from findings.
