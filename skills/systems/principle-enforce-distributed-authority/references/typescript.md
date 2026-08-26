# TypeScript reference

Worker 17 may resume after worker 18 takes over. The completion call therefore carries the exact
authority term and record version accepted by the protected PostgreSQL row.

```ts
/** This excerpt carries authority values; PostgreSQL performs the actual conditional write. */

/** AuthorityTerm survives worker changes and prevents token reuse after restore. */
interface AuthorityTerm {
  /** Comes from a source outside the restored database snapshot. */ readonly disasterEpoch: bigint
  /** Increases for each ownership change within the epoch. */ readonly fencingToken: bigint
}

/** WorkClaim is temporary permission granted by the database clock and current row. */
interface WorkClaim {
  /** Selects the one protected work row. */ readonly workId: string
  /** Names the worker for audit, not for fencing by itself. */ readonly ownerId: string
  /** Identifies the exact ownership generation. */ readonly term: AuthorityTerm
  /** Rejects equal-token completion races. */ readonly recordVersion: bigint
  /** Uses database-produced epoch milliseconds for diagnosis and renewal. */ readonly leaseExpiresAtMs: bigint
}

/** Completion carries output bound to the generation that produced it. */
interface Completion {
  /** Repeats the claimed work identity. */ readonly workId: string
  /** Repeats the exact claim term. */ readonly term: AuthorityTerm
  /** Repeats the claimed record version. */ readonly expectedVersion: bigint
  /** Stores the immutable result only if authority is current. */ readonly result: Uint8Array
}

/** WorkStore owns PostgreSQL claim, renewal, and conditional completion transactions. */
interface WorkStore {
  /** Claims one eligible row in a short transaction using database time. */
  claim(ownerId: string, leaseDurationMs: bigint, activeEpoch: bigint): Promise<WorkClaim | undefined>
  /** Renews only while owner, term, version, and running state remain current. */
  renew(claim: WorkClaim, leaseDurationMs: bigint): Promise<WorkClaim | undefined>
  /** Returns false when the worker lost authority and guarantees no result write occurred. */
  complete(completion: Completion): Promise<boolean>
}

/** finalize turns a rejected conditional write into lost authority, not a retryable storage error. */
async function finalize(store: WorkStore, completion: Completion): Promise<'completed' | 'stale'> {
  return (await store.complete(completion)) ? 'completed' : 'stale'
}
```

The PostgreSQL adapter can use a short `FOR UPDATE SKIP LOCKED` claim transaction. It must use
PostgreSQL time for expiry. Completion needs one statement like this:

```sql
-- PostgreSQL enforces exact-current epoch, token, state, and version in the protected write.
UPDATE work
SET state = 'completed', result = $5, version = version + 1
WHERE work_id = $1
  AND state = 'running'
  AND disaster_epoch = $2
  AND fencing_token = $3
  AND version = $4;
-- Zero changed rows means authority was lost; callers must not retry this completion as current.
```

Do not hold the claim row lock while work runs. Lease expiry only permits takeover. It does not stop
worker 17 or fence an external provider. Such a provider must validate the term itself, or receive a
stable idempotency key under an irrevocable authorization and an explicit late-effect policy.

Use real PostgreSQL transactions for simultaneous claim, renewal race, takeover followed by worker
17 completion, and two equal-token completions at one record version. Restore tests must obtain a
new epoch from a non-rollbackable source outside the snapshot and prove it exceeds every old epoch
before claims reopen. If that source cannot run, leave restore authority unverified and claims
closed.
