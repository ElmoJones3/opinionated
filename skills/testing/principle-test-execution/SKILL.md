---
name: principle-test-execution
description: Prove the intended tests actually ran. Mandatory whenever a test command is cited as evidence or execution can be skipped, filtered, cached, environment-gated, dependency-gated, or split across runners.
---

# Reject false green

A successful command is evidence only when the intended tests were collected and executed against the required environment.

- Identify the test names, package, project, or shard expected to run.
- Load required harness environment and dependencies before execution.
- Disable or invalidate result caches when a fresh run matters.
- Inspect collection, pass, skip, filter, and shard output. An empty suite, unexpected skip, or permissive no-tests flag is not a pass.
- Distinguish an intentional platform skip from a missing prerequisite that silently bypassed the contract.
- Report the command and observed result separately from behavioral findings.

If the runner cannot prove that the target executed, state that verification is incomplete. Do not infer execution from an exit code alone.
