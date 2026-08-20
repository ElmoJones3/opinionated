---
name: principle-test-proof-state-transitions
description: Prove allowed and rejected state changes, forced effects, no-ops, and rollback. Mandatory when state plus an input, command, or event determines what happens next.
---

# Prove the transition table

For each meaningful current state and input, pin the complete contract:

- next state for allowed transitions;
- exact failure and unchanged state for rejected transitions;
- forced field changes, returned facts, emitted events, or outgoing effects;
- deliberate no-op behavior, including identity when callers rely on it; and
- atomic rollback when several values or resources change together.

Call the object, reducer, producer, or stream that owns the transition. UI clicks, handlers, and services may get thin wiring tests, but they do not replace the owned transition proof.

For streams, assert the exact emission sequence and subscriptions when timing or cancellation matters. For file synchronization, cover the state table, conflicts, no-ops, partial-failure rollback, and destination preservation.

Use `principle-test-proof-failures` for rejected edges, `principle-test-determinism` for time or scheduling, and `principle-test-fixtures` for every staged starting state. When available, load `domain-modeling`, `ui-principle-state-management`, or `sops-sync` for the applied contract.
