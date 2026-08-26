# Go reference

`context.Context` can stop local waiting and carry a deadline. It cannot prove that a receiver
stopped. This example makes receiver evidence a separate input to the durable decision.

```go
// Package messageuncertainty classifies payment evidence without upgrading transport failure into absence.
package messageuncertainty

import "context"

// ObservationKind identifies the strongest evidence from one exchange.
type ObservationKind string

const (
	// LocalRefusal proves this invocation never left.
	LocalRefusal ObservationKind = "local_refusal"
	// ReceiverRefusal proves this request cannot later commit.
	ReceiverRefusal ObservationKind = "receiver_refusal"
	// Confirmed identifies a committed receiver effect.
	Confirmed ObservationKind = "confirmed"
	// Pending means the receiver may still finish.
	Pending ObservationKind = "pending"
	// NoReply covers timeout and connection loss without guessing remote state.
	NoReply ObservationKind = "no_reply"
	// CancellationRequested records a request whose race is unresolved.
	CancellationRequested ObservationKind = "cancellation_requested"
	// CancelledBeforeCommit is receiver proof that commit was prevented.
	CancelledBeforeCommit ObservationKind = "cancelled_before_commit"
)

// Observation carries receiver identity only when the operation contract supplies it.
type Observation struct {
	// Kind selects the evidence rule.
	Kind ObservationKind
	// ReceiverID names the capture, pending operation, refusal, or cancellation evidence.
	ReceiverID string
}

// KnowledgeKind names the durable conclusion permitted by evidence.
type KnowledgeKind string

const (
	// KnowledgeConfirmed binds the effect to a receiver result.
	KnowledgeConfirmed KnowledgeKind = "confirmed"
	// KnowledgeRefused records established absence for this invocation.
	KnowledgeRefused KnowledgeKind = "refused"
	// KnowledgePending requires another receiver observation.
	KnowledgePending KnowledgeKind = "pending"
	// KnowledgeUnknown preserves the possibility of a committed effect.
	KnowledgeUnknown KnowledgeKind = "unknown"
)

// Knowledge keeps the conclusion beside the receiver evidence that earned it.
type Knowledge struct {
	// Kind names confirmed, refused, pending, or unknown knowledge.
	Kind KnowledgeKind
	// ReceiverID preserves the identity supplied by receiver evidence.
	ReceiverID string
	// EvidenceSource distinguishes local pre-send refusal from receiver proof.
	EvidenceSource string
}

// Classify records no stronger claim than one observation earns.
func Classify(observation Observation) Knowledge {
	switch observation.Kind {
	case LocalRefusal:
		return Knowledge{Kind: KnowledgeRefused, EvidenceSource: "local"}
	case ReceiverRefusal, CancelledBeforeCommit:
		return Knowledge{Kind: KnowledgeRefused, ReceiverID: observation.ReceiverID, EvidenceSource: "receiver"}
	case Confirmed:
		return Knowledge{Kind: KnowledgeConfirmed, ReceiverID: observation.ReceiverID, EvidenceSource: "receiver"}
	case Pending:
		return Knowledge{Kind: KnowledgePending, ReceiverID: observation.ReceiverID, EvidenceSource: "receiver"}
	default:
		return Knowledge{Kind: KnowledgeUnknown}
	}
}

// OrderedDelivery separates broker redelivery, source order, and logical effect identity.
type OrderedDelivery struct {
	// DeliveryID detects an exact broker redelivery.
	DeliveryID string
	// SourceSequence orders immutable events within one payment stream.
	SourceSequence uint64
	// EffectKey names the logical payment effect across deliveries.
	EffectKey string
}

// InboxResult states what one local receipt transaction decided.
type InboxResult string

const (
	// InboxApplied means receipt and local state committed together.
	InboxApplied InboxResult = "applied"
	// InboxDuplicate means the delivery was already applied.
	InboxDuplicate InboxResult = "duplicate"
	// InboxSequenceGap means an earlier source event is missing.
	InboxSequenceGap InboxResult = "sequence_gap"
)

// PaymentInbox owns one transaction spanning receipt uniqueness and the local state change.
type PaymentInbox interface {
	// ApplyOnce applies only the next source event and never skips a gap.
	ApplyOnce(context.Context, OrderedDelivery, uint64) (InboxResult, error)
}
```

The receiver contract decides which response is stable evidence. Go enums do not. The production
inbox adapter must commit the unique receipt and payment transition in one transaction.

Use a scripted transport and controlled cancellation to cover lost request, lost refusal, lost
success reply, pending work, acknowledgement loss after inbox commit, exact redelivery, sequence
gaps, and cancellation before and after commit. Use the
production database for inbox atomicity, or mark that claim unverified.
