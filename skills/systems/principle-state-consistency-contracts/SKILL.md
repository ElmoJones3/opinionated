---
name: principle-state-consistency-contracts
description: State the consistency, freshness, ordering, authority, and fallback required by each read or decision. Mandatory when code reads replicas, caches, projections, asynchronously synchronized state, or any source that may lag or disagree.
---

# Make freshness part of the read contract

“Read current state” is incomplete. Name the object or key scope, required freshness, ordering relation, authority, deadline, and fallback for the decision using the data.

## Choose from the decision

- Use a local cache or eventual view only when convergence without a deadline is enough or a separate staleness bound is enforced.
- Require read-your-writes behavior when a client must observe its own completed update.
- Require a linearizable read—a read ordered after every write that finished before it began—or equivalent authority when a safety decision needs that real-time order.
- Use a versioned snapshot when several values must be mutually consistent at one known point.
- Refuse or defer the decision when the required authority is unavailable; do not silently fall back to stale data.

Linearizability still needs an object scope and does not decide an incomplete operation. Eventual consistency promises convergence only if updates stop and communication continues. A quorum, meaning a required subset of replicas, does not prove either property from its count alone; the replication protocol and its assumptions own the guarantee.

Carry source, observed version, and observation time when downstream code must judge freshness. Observation time proves when the read happened, not how current its data is. A maximum-staleness claim needs an authority watermark, a comparable minimum version or session token, or a documented source guarantee. Version numbers also need an epoch or ordering scheme that does not move backward across restore and failover.

Separate arrival order from source truth. If one entity's events require order, preserve a source-owned sequence and define gap handling. Do not derive causality or global order from timestamps, trace IDs, or which message arrived first.

## Coordinate adjacent principles

Use `principle-handle-message-uncertainty` for delayed or reordered messages, `principle-enforce-distributed-authority` for the writer authority, and `principle-evolve-and-restore-state` when versions may move backward or old and new schemas coexist. For reconciliation, require the lookup contract to say whether it includes accepted, queued, pending, and completed work over the complete identity-retention window.

## Prove it

Load `principle-testing-guidelines`, `principle-test-boundaries`, `principle-test-determinism`, `principle-test-proof-state-transitions`, and `principle-test-execution`. Prove every applicable path: fresh, recently observed but lagging, authority unavailable, read-after-write, sequence gap, rollback or failover epoch, and the stated fallback. Use the real dependency for guarantees owned by its replication and isolation semantics. A test double is sufficient only when it reproduces the production system's relevant replication lag, partition fallback, session progress, and failover behavior.

## Use the language reference

All four language references must satisfy [the same worked-example contract](references/parity.md).

Read only the reference for the language being changed:

- [TypeScript](references/typescript.md)
- [Go](references/go.md)
- [Python](references/python.md)
- [C++](references/cpp.md)

## Check the result

- Every safety decision names the authoritative source it requires.
- Staleness, ordering, key scope, deadline, and fallback are explicit.
- The implementation never upgrades a weaker read into a stronger claim.
- Version ordering remains valid after restore and failover.
- Tests exercise the real consistency semantics when those semantics carry the guarantee.
