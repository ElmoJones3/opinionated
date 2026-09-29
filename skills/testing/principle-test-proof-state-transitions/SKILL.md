---
name: principle-test-proof-state-transitions
description: Prove required state changes and their promised effects. Mandatory when testing or reviewing transitions affected by the requested change.
---

# Prove the required transitions

Apply the contract and value boundary in `principle-testing-guidelines`. Prove the required transition outcomes and constraints that existing evidence does not establish. A state machine's existence does not require an exhaustive transition matrix. For each required case, assert the relevant promised behavior:

- next state for allowed transitions;
- exact failure and unchanged state for rejected transitions;
- forced field changes, returned facts, emitted events, or outgoing effects;
- deliberate no-op behavior, including identity when callers rely on it; and
- the actual failure boundary, including atomic rollback only for resources covered by that guarantee, or partial completion and compensation when those are the contract.

Exercise the object, reducer, producer, or stream that owns the transition, directly or through the caller operation. An existing test that exercises the owner and establishes the relevant state and effects supplies that evidence. Add direct cases only for required outcomes it leaves unproved.

For streams, assert the emission sequence and subscriptions required by the changed timing or cancellation contract. For file synchronization, cover affected conflicts, no-ops, failure handling, and destination preservation where existing evidence is insufficient.

Use `principle-test-proof-failures` for rejected edges, `principle-test-determinism` for time or scheduling, and `principle-test-fixtures` for every staged starting state. When available, load `domain-modeling`, `ui-principle-state-management`, or `sops-sync` for the applied contract.
