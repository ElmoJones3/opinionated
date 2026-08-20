---
name: principle-test-proof-failures
description: Prove the exact rejection and preserved state. Mandatory when testing validation, refused transitions, errors, rollback, or other failure behavior.
---

# Pin the failure surface

A bare error, rejected promise, false boolean, or nonzero status proves only that something failed. Assert enough stable structure to distinguish the named failure from every earlier guard: code, field, rule, event, state, or another contract-specific detail. A shared error type or status alone is insufficient.

- Start from a valid fixture and change one condition.
- Make preceding guards pass so the case reaches the failure it names.
- Assert the exact failure identity and any caller-visible details.
- Assert the input, owned state, persisted state, and effects remain unchanged or roll back as promised.
- Cover the normal entry point and an untrusted-input backstop separately when they defend different paths.
- Table the meaningful failure surface. Do not label several rows differently when all stop at the same first guard.

Load `principle-test-fixtures` for every failure fixture. If production cannot create the state needed by a normal behavior test, the fixture is not permission to invent it. Surface the unreachable-state defect.
