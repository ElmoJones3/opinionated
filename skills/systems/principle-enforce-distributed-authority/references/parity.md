# Worked-example parity contract

- **Scenario:** worker 17 pauses, its lease expires, worker 18 takes over, and worker 17 later tries to complete the same work.
- **Invariant:** only the authority generation accepted by the protected resource can commit; lease expiry alone never claims the old worker stopped.
- **Identity and state:** work ID, owner, database-decided expiry, record version, fencing token, and disaster epoch.
- **Enforcement boundary:** atomic claim and conditional protected write at the production store; external effects remain outside local fencing unless their receiver checks the token.
- **Required failures:** simultaneous claim, renewal race, stale completion, equal-token concurrency, and restore behind a pre-disaster token.
- **Required proof:** real coordination/storage semantics and a non-rollbackable epoch source outside the restored snapshot, or an explicit unverified dependency.
- **Language freedom:** SQL syntax may be engine-specific; the reference must name the engine rather than imply portability.
