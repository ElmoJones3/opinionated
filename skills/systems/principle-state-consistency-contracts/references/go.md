# Go reference

Catalog display accepts a stated version lag. Payment recovery requires a complete authority read.
The observation time remains diagnostic and never substitutes for an authority watermark.

```go
// Package consistencycontract checks read evidence without claiming that interfaces enforce datastore semantics.
package consistencycontract

import "time"

// ReadStrength separates bounded display reads from effect-authorizing reads.
type ReadStrength string

const (
	// BoundedStale permits a stated version lag from an authority watermark.
	BoundedStale ReadStrength = "bounded_stale"
	// AuthorityComplete requires the write authority and complete effect coverage.
	AuthorityComplete ReadStrength = "authority_complete"
)

// Fallback states what happens when the requested read cannot be earned.
type Fallback string

const (
	// Refuse prevents the decision.
	Refuse Fallback = "refuse"
	// Defer records that a later read is required.
	Defer Fallback = "defer"
)

// ReadRequirement states the contract for one key-scoped decision.
type ReadRequirement struct {
	// KeyScope names the catalog item or payment effect whose versions compare.
	KeyScope string
	// RequiredAuthority names the authority that defines this version space.
	RequiredAuthority string
	// Strength selects bounded stale or complete authority evidence.
	Strength ReadStrength
	// ExpectedEpoch rejects versions from before failover or restore.
	ExpectedEpoch uint64
	// MinimumVersion supplies read-your-writes or other minimum progress.
	MinimumVersion uint64
	// MaxVersionLag limits replica lag and is meaningful only for BoundedStale.
	MaxVersionLag uint64
	// Deadline ends permission to wait for the required read.
	Deadline time.Time
	// Fallback defines unavailable or weak-source behavior.
	Fallback Fallback
}

// ReadObservation reports what one selected data path can prove.
type ReadObservation[T any] struct {
	// Value carries domain data without upgrading its evidence.
	Value T
	// KeyScope repeats the exact object described by this evidence.
	KeyScope string
	// Authority names the authority that issued versions and watermark.
	Authority string
	// Source names the primary, replica, cache, or projection used.
	Source string
	// Authoritative says whether this source owns writes for the decision.
	Authoritative bool
	// Epoch changes when failover or restore can move normal versions backward.
	Epoch uint64
	// Version compares only within the same key scope and epoch.
	Version uint64
	// AuthorityWatermark is a comparable point supplied by the authority.
	AuthorityWatermark uint64
	// ObservedAt records read completion time but does not prove freshness.
	ObservedAt time.Time
	// Complete covers accepted, queued, pending, and completed retained operations.
	Complete bool
}

// ReadDecision reports use, refusal, or deferral without weakening the requirement.
type ReadDecision string

const (
	// Use means the observation met the requested contract.
	Use ReadDecision = "use"
	// DecisionRefused prevents a safety decision on weak evidence.
	DecisionRefused ReadDecision = "refuse"
	// DecisionDeferred requires another read later.
	DecisionDeferred ReadDecision = "defer"
)

// unavailable applies the declared fallback.
func unavailable(requirement ReadRequirement) ReadDecision {
	if requirement.Fallback == Refuse {
		return DecisionRefused
	}
	return DecisionDeferred
}

// DecideRead accepts only evidence that satisfies epoch, progress, and requested strength.
func DecideRead[T any](requirement ReadRequirement, observation *ReadObservation[T], now time.Time) ReadDecision {
	if !now.Before(requirement.Deadline) || observation == nil {
		return unavailable(requirement)
	}
	if observation.KeyScope != requirement.KeyScope ||
		observation.Authority != requirement.RequiredAuthority ||
		observation.Epoch != requirement.ExpectedEpoch ||
		observation.Version < requirement.MinimumVersion {
		return unavailable(requirement)
	}
	if requirement.Strength == AuthorityComplete {
		if observation.Authoritative && observation.Complete {
			return Use
		}
		return unavailable(requirement)
	}
	if requirement.Strength != BoundedStale {
		return unavailable(requirement)
	}
	if observation.AuthorityWatermark < observation.Version {
		return unavailable(requirement)
	}
	if observation.AuthorityWatermark-observation.Version > requirement.MaxVersionLag {
		return unavailable(requirement)
	}
	return Use
}

// SequenceDecision keeps per-payment source order separate from arrival order.
func SequenceDecision(lastApplied uint64, incoming uint64) string {
	if incoming <= lastApplied {
		return "duplicate"
	}
	if incoming == lastApplied+1 {
		return "apply"
	}
	return "gap"
}
```

Use `BoundedStale` plus a maximum version lag for catalog display. Use `AuthorityComplete` for payment
retry authorization and put the complete receiver identity in `KeyScope`. The adapter must obtain its
watermark and completeness evidence from the deployed data service. A Go interface does not provide
read-your-writes or linearizability.

Direct tests cover key and authority mismatch, recent but lagging data, unavailable authority, unmet
session version, sequence gap, and epoch change. Exercise read-after-write, partition fallback, and
failover against the production data system. A test double counts only if it reproduces that system's
replication lag, partition fallback, session progress, and failover behavior; otherwise mark those
guarantees unverified.
