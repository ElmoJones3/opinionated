# Go reference

The store's clock decides lease expiry. Worker 17 can resume after worker 18 takes over, so every
protected write compares the exact authority term and record version in PostgreSQL.

```go
// Package distributedauthority carries fencing values without claiming that Go types enforce PostgreSQL behavior.
package distributedauthority

import (
	"context"
	"time"
)

// AuthorityTerm prevents ownership generations from being reused after restore.
type AuthorityTerm struct {
	// DisasterEpoch comes from a source outside the restored database snapshot.
	DisasterEpoch uint64
	// FencingToken increases for each ownership change within the epoch.
	FencingToken uint64
}

// WorkClaim is temporary permission granted by database time and the current row.
type WorkClaim struct {
	// WorkID selects the one protected work row.
	WorkID string
	// OwnerID names the worker for audit, not fencing by itself.
	OwnerID string
	// Term identifies the exact ownership generation.
	Term AuthorityTerm
	// RecordVersion rejects equal-token completion races.
	RecordVersion uint64
	// LeaseExpiresAt is produced by PostgreSQL and must not be recomputed from worker time.
	LeaseExpiresAt time.Time
}

// Completion binds output to the ownership generation that produced it.
type Completion struct {
	// WorkID repeats the claimed work identity.
	WorkID string
	// Term repeats the exact claim term.
	Term AuthorityTerm
	// ExpectedVersion repeats the claimed record version.
	ExpectedVersion uint64
	// Result is stored only if PostgreSQL accepts current authority.
	Result []byte
}

// WorkStore owns PostgreSQL claim, renewal, and conditional completion transactions.
type WorkStore interface {
	// Claim selects one row in a short transaction and uses database time for expiry.
	Claim(context.Context, string, time.Duration, uint64) (WorkClaim, bool, error)
	// Renew succeeds only while owner, term, version, and running state remain current.
	Renew(context.Context, WorkClaim, time.Duration) (WorkClaim, bool, error)
	// Complete returns false after lost authority and guarantees no result write occurred.
	Complete(context.Context, Completion) (bool, error)
}

// Finalize reports a rejected conditional update as stale authority.
func Finalize(ctx context.Context, store WorkStore, completion Completion) (string, error) {
	// Accepted and err preserve stale authority separately from an unavailable store.
	accepted, err := store.Complete(ctx, completion)
	if err != nil {
		return "", err
	}
	if !accepted {
		return "stale", nil
	}
	return "completed", nil
}
```

A `database/sql` adapter can use a short PostgreSQL `FOR UPDATE SKIP LOCKED` claim transaction. Its
completion statement must do the protected comparison itself:

```sql
-- PostgreSQL enforces exact-current epoch, token, state, and version in the protected write.
UPDATE work
SET state = 'completed', result = $5, version = version + 1
WHERE work_id = $1
  AND state = 'running'
  AND disaster_epoch = $2
  AND fencing_token = $3
  AND version = $4;
-- Zero changed rows means authority was lost; it is not a transient completion error.
```

Never keep the row lock open during long work. Local fencing cannot stop an external provider call
unless that receiver checks the term. Otherwise preserve a stable idempotency identity and define
what happens to a late effect.

Test simultaneous claims, renewal races, pause-takeover-resume, and equal-token writes against real
PostgreSQL. Restore must obtain a new epoch from a non-rollbackable source outside the snapshot and
prove it exceeds every earlier epoch before claims reopen. Without that dependency, keep restore
authority unverified and claims closed.
