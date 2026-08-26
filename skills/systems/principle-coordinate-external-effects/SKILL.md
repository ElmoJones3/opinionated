---
name: principle-coordinate-external-effects
description: Move durable intent across transaction and ownership boundaries through explicit delivery, reconciliation, and compensation protocols. Mandatory when committed local work must call a provider, publish a message, control a device, send a notification, or otherwise change an external system.
---

# Give every external effect a protocol

An external effect does not roll back because local code throws or a local transaction aborts. Separate the internal decision, durable delivery intent, receiver observation, and any repair effect.

## Choose the required protocol

Apply only the protocol or protocols the changed effect needs. Do not add compensation, desired-state machinery, or reconciliation when delivery and receiver idempotency already satisfy the claim.

- **Delivery** keeps durable intent moving after the process that created it dies. Record target, effect identity, request version, attempts, acknowledgement meaning, and outcome.
- **Reconciliation** compares durable intent with an authoritative observation bound to the complete receiver identity. It can confirm, find pending work, establish contract-defined absence, or preserve unknown.
- **Compensation** creates a new effect to address an unwanted committed effect. It has its own identity, uncertainty, retry policy, and idempotency contract. It does not erase history.
- **Desired/observed convergence** keeps applying or reconciling a versioned target until trusted observation matches it. Use this when final state matters more than one command execution.

Create durable intent in the same local transaction as the state that requires it, commonly with an outbox. A dispatcher claims and delivers later. If publish succeeds but its acknowledgement or delivery record is lost, redelivery is expected; the receiver must handle the repeated logical effect.

Validate observations against provider, account or tenant, environment, operation, effect key, and request digest before advancing local state. The lookup contract must say whether it includes accepted, queued, pending, and completed work across the relevant retention window. A recently queried lagging replica does not prove current absence. A provider acceptance receipt proves only what that protocol defines, not downstream human receipt or activation.

Define terminal automatic states and the path to `needs_attention`. A saga may organize several local commits and compensations, but intermediate states remain visible and need valid behavior.

## Coordinate adjacent principles

Use `principle-respect-transaction-boundaries` for durable local intent, `principle-handle-message-uncertainty` for missing acknowledgements, `principle-enforce-idempotent-effects` for redelivery, `principle-bound-retries` for attempts, and `principle-version-decisions-and-intervention` when approval or operators authorize an effect. Use `principle-state-consistency-contracts` when an observation authorizes another effect and `principle-evolve-and-restore-state` when local history can restore behind the receiver.

## Prove it

Load `principle-testing-guidelines`, `principle-test-boundaries`, `principle-test-determinism`, `principle-test-proof-state-transitions`, `principle-test-proof-failures`, and `principle-test-execution`. Prove each applicable protocol and claimed failure window. Fault after local commit, after send, after receiver commit, after acknowledgement, and during local confirmation where those windows exist. Exercise reconciliation identity and freshness, duplicate delivery, pending and unknown outcomes, compensation as a new effect, and restore older than the external state only when the design relies on them.

## Use the language reference

All four language references must satisfy [the same worked-example contract](references/parity.md).

Read only the reference for the language being changed:

- [TypeScript](references/typescript.md)
- [Go](references/go.md)
- [Python](references/python.md)
- [C++](references/cpp.md)

## Check the result

- The local transaction stores the intent it actually owns.
- Every acknowledgement has a documented meaning.
- Redelivery preserves one stable effect identity.
- Reconciliation uses an authoritative, identity-bound observation.
- Compensation is modeled as another fallible effect, never a rollback claim.
