# Go

Keep compatibility, backfill, restore, and failover as separate procedures. Use codec or validation libraries already adopted by the repository.

## Mixed-version compatibility

```go
// Package evolution keeps durable user history readable during mixed deployment.
package evolution

import "fmt"

// StoredUser carries every form that can remain during rollout or rollback.
type StoredUser struct {
	// SchemaVersion selects the persisted representation.
	SchemaVersion uint32
	// DisplayName is canonical in version two.
	DisplayName string
	// FullName is the derived compatibility form required by old readers.
	FullName string
}

// ReadCanonical accepts every still-supported representation.
func ReadCanonical(stored StoredUser) (string, error) {
	switch stored.SchemaVersion {
	case 1:
		return stored.FullName, nil
	case 2:
		if stored.DisplayName != stored.FullName {
			return "", fmt.Errorf("canonical and compatibility names disagree")
		}
		return stored.DisplayName, nil
	default:
		return "", fmt.Errorf("unsupported user schema %d", stored.SchemaVersion)
	}
}

// WriteExpanded derives both forms from one canonical value for one atomic write.
func WriteExpanded(displayName string) StoredUser {
	return StoredUser{SchemaVersion: 2, DisplayName: displayName, FullName: displayName}
}
```

Do not remove `FullName` until old binaries, queued work, rollback images, and relevant backups have left the compatibility window.

## Resumable backfill

```go
// BackfillCheckpoint binds resume position to one stable job and operation version.
type BackfillCheckpoint struct {
	// WorkID survives process and worker replacement.
	WorkID string
	// OperationVersion prevents incompatible code from resuming old work.
	OperationVersion string
	// AfterID is the last row committed by the ordered batch.
	AfterID string
}

// BackfillStore owns the conditional batch transaction and capacity reservation.
type BackfillStore interface {
	// CommitBatch transforms a bounded batch and advances its checkpoint atomically.
	CommitBatch(expected BackfillCheckpoint, limit uint32) (BackfillCheckpoint, error)
}
```

The store must make a repeated committed batch harmless and resolve a lost commit reply by `WorkID`. Backfill uses the same production capacity budgets as normal work.

## Backup and restore

```go
// TrustedRestoreEvidence is created only after the package authenticates source and scope.
type TrustedRestoreEvidence struct {
	// snapshotVerified proves data, schema, keys, config, and artifacts in scope.
	snapshotVerified bool
	// reconciliationRange is the canonical external range the trusted source covered.
	reconciliationRange string
	// externalEpoch binds the evidence to authority outside restored state.
	externalEpoch uint64
}

// ReopenRequirements names facts trusted evidence must match exactly.
type ReopenRequirements struct {
	// RequiredReconciliationRange is the complete canonical range recovery demanded.
	RequiredReconciliationRange string
	// HighestRestoredEpoch is the greatest authority epoch found in the restored snapshot.
	HighestRestoredEpoch uint64
	// ExpectedExternalEpoch is freshly allocated outside restored state.
	ExpectedExternalEpoch uint64
}

// RestoreGate keeps effect producers closed until trusted evidence satisfies requirements.
type RestoreGate struct {
	// Evidence remains nil until the package's authenticated evidence adapter verifies it.
	Evidence *TrustedRestoreEvidence
	// ProducersPaused remains true until the gate commits open.
	ProducersPaused bool
}

// CanReopen requires exact range and epoch matches instead of token presence.
func CanReopen(gate RestoreGate, required ReopenRequirements) bool {
	// evidence is package-authenticated but must still describe this recovery operation.
	evidence := gate.Evidence
	return gate.ProducersPaused &&
		evidence != nil &&
		evidence.snapshotVerified &&
		required.ExpectedExternalEpoch > required.HighestRestoredEpoch &&
		evidence.reconciliationRange == required.RequiredReconciliationRange &&
		evidence.externalEpoch == required.ExpectedExternalEpoch
}
```

Keep `TrustedRestoreEvidence` construction inside the adapter that verifies the signed or otherwise authoritative external record. Scan the restored scope for `HighestRestoredEpoch`, then ask the independent allocator for `ExpectedExternalEpoch`; do not derive the expected value from restored state. The comparison proves only that the grant exceeds every epoch the snapshot reveals. Only the independent allocator can prove freshness relative to authorities and history outside that snapshot. If no complete external record covers post-snapshot effects, preserve unknown. Measure RPO and RTO during a timed isolated restore against the named disaster and resource set.

## Failover authority

```go
// FailoverGrant binds routing to a fresh independent fencing epoch.
type FailoverGrant struct {
	// RouteGeneration identifies the active destination.
	RouteGeneration uint64
	// DisasterEpoch cannot be minted from failed or restored storage.
	DisasterEpoch uint64
	// Owner identifies the only current writer.
	Owner string
}

// AcceptsWrite requires routing and fencing authority to match.
func AcceptsWrite(current, presented FailoverGrant) bool {
	return presented == current
}
```

## Proof

Exercise every old/new codec pair and rollback after expanded writes. Crash each backfill batch before and after commit and reject a version mismatch. Restore the production datastore into isolation with its keys, schema, and artifacts, then reject untrusted evidence, a mismatched required range, and expected external epochs equal to or below the highest restored epoch before proving exact trusted evidence reopens dispatch. Race stale and current failover grants. Label guarantees unverified when the production store, independent epoch authority, or external history cannot be exercised.
