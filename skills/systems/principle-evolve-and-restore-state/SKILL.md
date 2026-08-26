---
name: principle-evolve-and-restore-state
description: Keep durable data, messages, work, authority, and external effects safe across mixed-version deployment, rollback, migration, failover, backup, and restore. Mandatory when changing a durable representation or protocol, running mixed versions, resuming old work, or designing rollback, migration, backup, restore, or failover.
---

# Change code around durable history

Deployments replace processes, not durable rows, messages, checkpoints, artifacts, or external effects. Assume old and new versions coexist during rollout and that rollback can make older code read newer writes.

## Design the compatibility window

Apply the branch the task changes: mixed-version compatibility, backfill, backup and restore, or failover. A representation change does not by itself require a disaster drill; a restore guarantee does.

- New readers understand every old representation that can still exist.
- Old readers tolerate safe additions from new writers or are retired before those writes begin.
- Semantic changes receive an operation, schema, message, or artifact version; field compatibility alone is insufficient.
- Use expand and contract: add a compatible form, move readers and writers, backfill and verify, then remove the old form in a later deploy.
- Treat backfills as production work with durable identity, checkpoints, retries, capacity limits, terminal states, and observability.
- Version checkpoints and derived artifacts so recovery can decide whether they remain valid.

Test mixed-version sequences, not only a clean all-new deployment: old write/new read, new write/old read, rollback after new writes, duplicate queued messages from either version, and resume of old durable work.

## Restore the whole guarantee

A backup is credible only after restore. Name its scope, retention, integrity, encryption, keys, schemas, configuration, artifact stores, and recovery ordering. Replication is not a backup when deletion or corruption replicates too.

Restoring local state can move it behind brokers, providers, object stores, and other external effects. Stop effect-producing workers and dispatchers. Establish a fresh expected ownership epoch that cannot collide with pre-restore tokens. Before reopening writes, require trusted reconciliation evidence that covers the exact required external range and is bound to that expected epoch. A nonempty cursor or merely present epoch is not proof. When no trusted record can reveal post-snapshot effects, preserve unknown rather than inventing absence.

State the recovery point objective, or RPO—the accepted data-loss window—and recovery time objective, or RTO—the target restoration time—for a named disaster and resource set. Prove them through timed restore drills and integrity checks, not backup listings or failover diagrams.

## Coordinate adjacent principles

Use `principle-enforce-distributed-authority` for post-restore fencing, `principle-coordinate-external-effects` for reconciliation, `principle-state-consistency-contracts` for version epochs, and `principle-operational-control` for migration and recovery load.

## Prove it

Load `principle-testing-guidelines`, `principle-test-boundaries`, `principle-test-determinism`, `principle-test-proof-state-transitions`, `principle-test-proof-failures`, and `principle-test-execution`. Prove the changed branch. For compatibility, exercise every relevant old/new reader-writer and rollback edge. For restore, perform an actual isolated restore and verify the claimed data, keys, schema, artifacts, external reconciliation, fresh authority, RPO, RTO, and safe reopening.

## Use the language reference

All four language references must satisfy [the same worked-example contract](references/parity.md).

Read only the reference for the language being changed:

- [TypeScript](references/typescript.md)
- [Go](references/go.md)
- [Python](references/python.md)
- [C++](references/cpp.md)

## Check the result

- Compatibility covers rollout, durable backlog, and rollback.
- Migration phases are independently deployable and recoverable.
- Restore accounts for external state newer than the snapshot.
- Reopening compares trusted reconciliation evidence with the required range and fresh expected epoch.
- Ownership generations cannot move backward.
- Recovery claims are backed by drills against the named scope.
