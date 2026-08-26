---
name: principle-enforce-idempotent-effects
description: Make equivalent requests converge on one logical effect through receiver-side identity and atomic arbitration. Mandatory when a command or external side effect may be delivered or invoked more than once.
---

# Enforce one logical effect at the receiver

Idempotency is a receiver contract. A caller can preserve and resend a stable key, but only the component that applies the effect can prevent a concurrent or late equivalent request from applying it again.

## Bind identity to the effect

Define one immutable identity scoped to the receiver account or tenant, environment, operation, and business obligation. Derive a digest from the receiver's canonical request representation: one defined byte or field form for requests that mean the same thing. Equivalent requests reuse both. Reusing the key with changed meaning is a conflict, not a replay.

The receiver must make one indivisible decision that:

1. chooses one winner among concurrent requests for the scoped identity;
2. rejects a mismatched request digest;
3. binds the accepted identity to the business effect and authoritative response; and
4. returns the stored response to an equivalent later request.

Recording the key after the effect leaves a duplicate window. Recording success before the effect can replay success for work that never happened. A preflight lookup in the caller does not close either race.

State the retention contract. If a duplicate can arrive after ordinary deduplication expires, permanently reject reuse, retain a tombstone—a small record that prevents an old identity from being reused—or enforce an arrival cutoff with the receiver's clock under explicit delay and skew bounds. Otherwise narrow the claim to the retention window.

If the receiver cannot supply this contract, choose query and reconciliation, tolerate duplicates, redesign the effect, compensate later, or require intervention. Do not label “check then call” or “best effort dedupe” exactly once. Exactly-once effect claims must name the complete scope and assumptions.

## Coordinate adjacent principles

Use `principle-model-durable-work` to bind one obligation to one stable key, `principle-bound-retries` for repeat policy, `principle-respect-transaction-boundaries` for local arbitration, and `principle-coordinate-external-effects` when the receiver is outside the local transaction. Use `principle-evolve-and-restore-state` when deduplication or effect history crosses restore.

## Prove it

Load `principle-testing-guidelines`, `principle-test-boundaries`, `principle-test-determinism`, `principle-test-proof-state-transitions`, `principle-test-proof-failures`, and `principle-test-execution`. Use the real storage or provider harness for uniqueness and transaction semantics. Exercise concurrent first calls, replay, changed payload, crash windows, and pending results. Add late-arrival and restore cases when the claim extends beyond normal retention or across restoration.

## Use the language reference

All four language references must satisfy [the same worked-example contract](references/parity.md).

Read only the reference for the language being changed:

- [TypeScript](references/typescript.md)
- [Go](references/go.md)
- [Python](references/python.md)
- [C++](references/cpp.md)

## Check the result

- One business obligation can acquire only one receiver-scoped identity.
- Canonical payload identity is checked by the receiver.
- Arbitration, effect, and response binding are one protected decision.
- Concurrency and post-retention behavior match the written claim.
- Unsupported duplicates become explicit risk or intervention, not hidden confidence.
