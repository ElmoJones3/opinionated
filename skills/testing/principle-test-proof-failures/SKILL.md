---
name: principle-test-proof-failures
description: Prove the exact rejection and preserved state. Mandatory when testing validation, refused transitions, errors, rollback, or other failure behavior.
---

# Pin the failure surface

Apply the contract and value boundary in `principle-testing-guidelines`. Prove rejections and failure behavior required by that contract where existing evidence does not establish them. For each such case, assert enough stable structure to distinguish the named failure from earlier guards: code, field, rule, event, state, or another contract-specific detail. A bare error or shared status is insufficient when an unrelated failure would satisfy it.

- Start from a valid fixture and change one condition.
- Make preceding guards pass so the case reaches the failure it names.
- Assert the exact failure identity and any caller-visible details.
- Assert the input, owned state, persisted state, and effects remain unchanged or roll back as promised.
- Add separate normal-entry and untrusted-input cases only when they establish distinct required behavior not already proved.
- Use tables for required cases with shared setup. Do not enumerate every guard or label several rows differently when all stop at the same first guard.

Load `principle-test-fixtures` for every failure fixture. If production cannot create the state needed by a normal behavior test, the fixture is not permission to invent it. Surface the unreachable-state defect.
