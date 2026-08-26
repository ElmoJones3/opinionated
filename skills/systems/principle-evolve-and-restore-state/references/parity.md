# Worked-example parity contract

Every branch shares one invariant: durable history remains meaningful and authoritative when code or recovered storage moves across versions. Implement each claimed branch as a separate short example or procedure.

## Mixed-version compatibility

- **Scenario:** a user representation expands while old and new readers and writers coexist and rollback remains possible.
- **Enforcement:** one canonical value, atomically derived compatibility form, explicit schema and operation versions, and staged contraction.
- **Failures and proof:** every relevant old/new pair, disagreement between forms, and rollback after new writes.

## Backfill

- **Scenario:** a versioned backfill stops after a committed batch and later resumes.
- **Enforcement:** stable work identity, conditional batch commit, durable checkpoint, capacity budget, and repeatable transformation.
- **Failures and proof:** crash before and after batch commit, repeated batch, incompatible operation version, and completion verification.

## Backup and restore

- **Scenario:** a payment database restores behind provider and broker effects.
- **Enforcement:** paused effect producers, trusted snapshot and reconciliation evidence covering the exact required external range, a fresh expected epoch from outside restored state, and a reopening gate that compares the evidence with both requirements.
- **Failures and proof:** missing keys or artifacts, partial restore, forged or untrusted evidence, incomplete or mismatched reconciliation range, stale or mismatched external epoch, newer external effects, expired deduplication history, and an actual isolated restore drill when this guarantee is claimed.

## Failover

- **Scenario:** service authority moves after the previous authority may still run.
- **Enforcement:** routing plus one fresh disaster epoch from a source outside the failed or restored state.
- **Failures and proof:** split authority, replication gap, and reuse of a pre-failover token; no writes reopen without the epoch.

Codec and infrastructure libraries may vary. Migration phases and recovery gates may not.
