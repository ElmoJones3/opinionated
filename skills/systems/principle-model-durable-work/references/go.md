# Go reference

The durable record owns the payment obligation. Workers only receive temporary permission to make
attempts. Recovery keeps the receiver effect key and records a call that may have left as unknown.

```go
// Package durablework demonstrates recovery state; a production Store must enforce its transaction claims.
package durablework

import "context"

// CaptureOutcome names the knowledge earned about the receiver effect.
type CaptureOutcome string

const (
	// OutcomeRequested means the effect is still owed.
	OutcomeRequested CaptureOutcome = "requested"
	// OutcomeConfirmed requires an identity-bound receiver result.
	OutcomeConfirmed CaptureOutcome = "confirmed"
	// OutcomeRefused requires stable receiver refusal evidence.
	OutcomeRefused CaptureOutcome = "refused"
	// OutcomeUnknown preserves an invocation that may have left.
	OutcomeUnknown CaptureOutcome = "unknown"
	// OutcomeNeedsAttention stops automation without erasing uncertainty.
	OutcomeNeedsAttention CaptureOutcome = "needs_attention"
)

// CaptureKnowledge retains identity-bound evidence instead of only a status label.
type CaptureKnowledge struct {
	// Outcome names requested, confirmed, refused, unknown, or intervention state.
	Outcome CaptureOutcome
	// ReceiverID identifies a confirmed effect or stable refusal when one exists.
	ReceiverID string
	// AttemptID identifies the execution whose result is unknown.
	AttemptID string
	// Reason explains refusal or why automation needs attention.
	Reason string
}

// CaptureRecord separates one obligation from the executions used to satisfy it.
type CaptureRecord struct {
	// ObligationID names the one payment obligation for the order.
	ObligationID string
	// StepID names the separately recoverable capture stage.
	StepID string
	// EffectKey remains stable for every equivalent receiver call.
	EffectKey string
	// RequestDigest rejects changed meaning under the stable key.
	RequestDigest [32]byte
	// Version is compared by the store during every state change.
	Version uint64
	// Knowledge records only identity-bound evidence and explicit intervention.
	Knowledge CaptureKnowledge
}

// ReservedAttempt proves storage authorized one physical execution before its call.
type ReservedAttempt struct {
	// ObligationID binds this execution to one durable business obligation.
	ObligationID string
	// AttemptID changes for each authorized execution.
	AttemptID string
	// InvocationID changes for each provider call inside the attempt.
	InvocationID string
	// EffectKey remains the receiver identity of the obligation.
	EffectKey string
	// ExpectedVersion binds completion to the reserved record generation.
	ExpectedVersion uint64
}

// Store owns real transaction, uniqueness, and conditional-write behavior.
type Store interface {
	// ReserveAttempt atomically reserves one execution for existing current work.
	ReserveAttempt(context.Context, string, uint64) (ReservedAttempt, error)
	// MarkUnknown changes only the current reservation and reports lost authority as false.
	MarkUnknown(context.Context, string, uint64) (bool, error)
}

// RecoveryInput contains only durable facts a replacement worker may trust.
type RecoveryInput struct {
	// Record carries immutable identity and the latest outcome.
	Record CaptureRecord
	// Attempt is nil when no reservation committed.
	Attempt *ReservedAttempt
	// CallMayHaveLeft means the invocation reached a send boundary.
	CallMayHaveLeft bool
}

// RecoveryOutcome refuses to infer effect count from execution count.
func RecoveryOutcome(input RecoveryInput) CaptureKnowledge {
	if input.Record.Knowledge.Outcome != OutcomeRequested {
		return input.Record.Knowledge
	}
	if input.Attempt == nil {
		return CaptureKnowledge{Outcome: OutcomeRequested}
	}
	if input.Attempt.ObligationID != input.Record.ObligationID ||
		input.Attempt.EffectKey != input.Record.EffectKey ||
		input.Attempt.ExpectedVersion != input.Record.Version {
		return CaptureKnowledge{Outcome: OutcomeNeedsAttention, Reason: "reservation_not_current"}
	}
	if !input.CallMayHaveLeft {
		return CaptureKnowledge{Outcome: OutcomeRequested}
	}
	return CaptureKnowledge{Outcome: OutcomeUnknown, AttemptID: input.Attempt.AttemptID}
}
```

A `database/sql` adapter can implement `Store` when the repository already uses it. Its production
transaction must verify the obligation and expected version, allocate unique attempt and invocation
IDs, bind the reservation to the obligation and stable effect key, and advance the record to the
reservation's expected version. Go interfaces do not make those operations atomic.

Use table tests for the four crash windows. Use the deployed database for concurrent uniqueness and
conditional-update tests. If it cannot run, leave the storage guarantee unverified.
