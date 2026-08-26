---
name: principle-respect-transaction-boundaries
description: Limit atomicity and isolation claims to resources in one enforced commit boundary. Mandatory when several changes or effects are claimed to commit or roll back together, a read-then-write invariant depends on isolation, or state and outbound intent are settled together.
---

# Keep atomicity inside its real boundary

A transaction protects only its participants under its configured isolation and durability contract. An application function that calls two repositories, a database followed by a broker, or a database followed by an API does not create one atomic commit.

## Locate the indivisible decision

State the invariant first, then identify the database constraint, conditional update, serialized authority, or distributed transaction protocol that preserves it. Keep validation of the business transition separate from commit outcome.

When business state and outbound intent share one database, commit both in one transaction:

```text
one local transaction
├── domain state transition
├── immutable effect or command identity
└── outbox delivery intent
```

The later broker publish or provider call is outside that transaction and may repeat. Use `principle-coordinate-external-effects` for that protocol. An inbox can commit a consumed-message identity with the state it changes.

Choose isolation from the invariant. A transaction may still permit lost updates, write skew, stale reads, or phantoms under a weaker level. Put uniqueness and conditional state/version checks at the authoritative store rather than relying on an earlier read.

A commit reply can disappear after the database commits. Give the settlement command stable identity and distinguish committed, known not committed, and unknown. Begin failures and work or constraint failures belong to known not committed only when the adapter proves no commit was attempted or the transaction rolled back. Once `COMMIT` starts, a missing acknowledgement is unknown. Query or repeat the stable conditional command; do not infer rollback from a broken connection.

Use two-phase commit only when every required participant implements the protocol and its availability trade is accepted. Otherwise design explicit delivery, reconciliation, or compensation across boundaries.

## Coordinate adjacent principles

Use `domain-modeling` for legal transitions, `principle-prefer-pure-functional-patterns` for pure planning before settlement, `principle-enforce-distributed-authority` for stale writers, and `principle-enforce-idempotent-effects` for repeated settlement or delivery. Use `principle-handle-message-uncertainty` when a commit acknowledgement can disappear.

## Prove it

Load `principle-testing-guidelines`, `principle-test-boundaries`, `principle-test-determinism`, `principle-test-proof-state-transitions`, `principle-test-proof-failures`, and `principle-test-execution`. Use the real engine, schema, constraints, and isolation configuration. Exercise concurrent writes, rollback, constraint refusal, and commit-reply loss where each can occur. Test crashes between operations outside the transaction only when the design has those operations.

## Use the language reference

All four language references must satisfy [the same worked-example contract](references/parity.md).

Read only the reference for the language being changed:

- [TypeScript](references/typescript.md)
- [Go](references/go.md)
- [Python](references/python.md)
- [C++](references/cpp.md)

## Check the result

- Atomicity names exact resources, engine, transaction, and isolation assumptions.
- Related local state and outbox or inbox records commit together when promised.
- External effects are not described as rolled back by local exceptions.
- Begin, work, and constraint failures are separated from an ambiguous `COMMIT` acknowledgement.
- Ambiguous commit outcomes remain queryable under stable identity.
- Concurrency invariants are enforced at the store, not by timing.
