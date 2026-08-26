# Worked-example parity contract

- **Scenario:** one order transition, payment effect identity, and outbox intent settle locally before a later broker delivery.
- **Invariant:** all named local rows commit together or none do; no claim extends atomicity to the broker or provider.
- **Identity and state:** stable settlement command, expected state version, planned domain change, and outbox message identity; outcome is committed, stale-without-commit, failed-without-commit, or unknown after `COMMIT` starts.
- **Enforcement boundary:** one production database transaction with named schema, constraints, and isolation.
- **Required failures:** business refusal, begin failure, stale version, constraint rollback, concurrent writes, crash outside the transaction, and lost `COMMIT` acknowledgement. Begin, work, and constraint failures are known not committed only when the adapter proves no commit was attempted or rollback completed.
- **Required proof:** real engine and database-aware commit fault, not only a mocked commit exception; unavailable dependencies remain explicitly unverified.
- **Language freedom:** transaction APIs may vary; participant scope and outcomes may not.
