# Go

Evidence, trusted decision, approval, local intent, and external activation remain separate states.

## Automated evidence

```go
// Package decisions binds protected changes to trusted policy and durable history.
package decisions

import (
	"fmt"
	"math"
)

// EvaluatorEvidence is validated data whose suggested decision has no authority.
type EvaluatorEvidence struct {
	// SubjectDigest binds the measurement to exact content.
	SubjectDigest string
	// EvaluatorVersion identifies the measurement procedure.
	EvaluatorVersion string
	// RiskScore is a finite value from zero through one.
	RiskScore float64
	// SuggestedAllow remains diagnostic and is ignored by policy.
	SuggestedAllow bool
}

// Decision records what trusted versioned policy derived.
type Decision struct {
	// Kind is allow, refuse, or review and controls the local gate.
	Kind string
	// EvaluatorVersion binds the decision to its measurement procedure.
	EvaluatorVersion string
	// PolicyVersion fixes thresholds and gate behavior.
	PolicyVersion string
	// SubjectDigest prevents use with changed content.
	SubjectDigest string
}

// DeriveDecision owns authority instead of trusting the evaluator's suggestion.
func DeriveDecision(evidence EvaluatorEvidence, threshold float64, policyVersion string) (Decision, error) {
	if math.IsNaN(evidence.RiskScore) || math.IsInf(evidence.RiskScore, 0) || evidence.RiskScore < 0 || evidence.RiskScore > 1 {
		return Decision{}, fmt.Errorf("risk score %f outside [0,1]", evidence.RiskScore)
	}
	if math.IsNaN(threshold) || math.IsInf(threshold, 0) || threshold < 0 || threshold > 1 {
		return Decision{}, fmt.Errorf("policy threshold %f outside [0,1]", threshold)
	}
	// kind starts conservative and changes only under trusted threshold policy.
	kind := "review"
	if evidence.RiskScore <= threshold {
		kind = "allow"
	}
	return Decision{
		Kind:             kind,
		EvaluatorVersion: evidence.EvaluatorVersion,
		PolicyVersion:    policyVersion,
		SubjectDigest:    evidence.SubjectDigest,
	}, nil
}
```

State whether policy enforces a hard gate or records a soft signal. Evaluate both false acceptance and false rejection whenever uncertain evidence carries the guarantee.

## Approval and activation

```go
import "crypto/sha256"

// Approval binds current actor authority and policy to immutable subject bytes.
type Approval struct {
	// ApprovalID supports idempotent local settlement.
	ApprovalID string
	// SubjectDigest identifies reviewed bytes.
	SubjectDigest [sha256.Size]byte
	// PolicyVersion identifies approval rules.
	PolicyVersion string
	// ApproverID names the accountable actor.
	ApproverID string
	// Scope names the exact authorized action.
	Scope string
}

// ActivationStore owns one local transaction for state, outbound intent, and audit.
type ActivationStore interface {
	// RecordIntentIfCurrent rechecks subject, policy, authority, and version before commit.
	RecordIntentIfCurrent(approval Approval, current [sha256.Size]byte, expectedVersion int64) (string, error)
}

// SubjectDigest hashes the exact reviewed bytes.
func SubjectDigest(subject []byte) [sha256.Size]byte { return sha256.Sum256(subject) }
```

The transaction may record a durable outbound activation intent and append-only audit. The external activation occurs later under its own delivery and reconciliation protocol.

## Operator redrive

```go
// RedriveCommand identifies one authorized intervention and expected durable state.
type RedriveCommand struct {
	// CommandID makes duplicate delivery idempotent.
	CommandID string
	// ActorID is checked for current redrive authority.
	ActorID string
	// ObligationID names blocked work.
	ObligationID string
	// ExpectedVersion rejects a stale operator view.
	ExpectedVersion int64
	// NewAttemptID preserves prior attempts.
	NewAttemptID string
	// Reason is retained in append-only audit.
	Reason string
}

// InterventionStore applies normal authority, budget, version, and effect protections.
type InterventionStore interface {
	// Redrive atomically records command, attempt, enqueue intent, and audit.
	Redrive(command RedriveCommand) (string, error)
}
```

An ambiguous local result remains unknown and is queried by `CommandID`. Redrive never mutates away earlier attempts.

## Proof

Test threshold edges, NaN, and that `SuggestedAllow` cannot authorize. Change subject, policy, evidence, or authority during review. Use the production store for local transition plus audit, simultaneous and duplicate redrives, stale versions, and ambiguous commit. Observe external activation by complete identity. Mark unavailable evaluator quality, audit, or provider guarantees unverified.
