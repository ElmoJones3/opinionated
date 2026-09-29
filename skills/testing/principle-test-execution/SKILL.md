---
name: principle-test-execution
description: Prove the intended tests actually ran. Mandatory whenever a test command is cited as evidence or execution can be skipped, filtered, cached, environment-gated, dependency-gated, or split across runners.
---

# Reject false green

Select verification for the required outcomes under `principle-testing-guidelines`. A successful command is evidence only when the intended tests were collected and executed against the required environment. Use focused runs during implementation and required regression checks before completion; repeat broad runs only when changes or findings justify them. Executing a test proves nothing about whether its assertion serves the requested contract.

- Identify the test names, package, project, or shard expected to run.
- Load required harness environment and dependencies before execution.
- Disable or invalidate result caches when a fresh run matters.
- Inspect collection, pass, skip, filter, and shard output. An empty suite, unexpected skip, or permissive no-tests flag is not a pass.
- Distinguish an intentional platform skip from a missing prerequisite that silently bypassed the contract.
- Report the command and observed result separately from behavioral findings.

If the runner cannot prove that the target executed, state that verification is incomplete. Do not infer execution from an exit code alone.
