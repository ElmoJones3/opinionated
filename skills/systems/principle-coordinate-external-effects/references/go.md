# Go

Keep provider observations separate from policy. The local outbox, receiver idempotency contract, and authoritative lookup each enforce one part of the protocol.

```go
// Package effects coordinates payment evidence without claiming cross-system atomicity.
package effects

import "context"

// PaymentIdentity binds recovery to one provider account, environment, request, and effect.
type PaymentIdentity struct {
	// Provider names the adapter and its reconciliation contract.
	Provider string
	// AccountID prevents cross-account evidence from authorizing state.
	AccountID string
	// Environment prevents test and production identities from colliding.
	Environment string
	// Operation prevents capture evidence from authorizing another provider operation.
	Operation string
	// EffectID remains stable across delivery attempts.
	EffectID string
	// RequestDigest binds evidence to the exact capture request.
	RequestDigest string
}

// DeliveryIntent is the durable local obligation created with requiring state.
type DeliveryIntent struct {
	// IntentID identifies the local business obligation.
	IntentID string
	// DeliveryID identifies broker progress separately from the provider effect.
	DeliveryID string
	// Identity preserves the receiver key and complete reconciliation scope.
	Identity PaymentIdentity
	// State is requested, pending, confirmed, refused, unknown, or needs_attention.
	State string
}

// Observation states only what the authoritative provider lookup proves.
type Observation struct {
	// Identity repeats the complete lookup scope established by the receiver.
	Identity PaymentIdentity
	// Kind is confirmed, refused, pending, or unknown.
	Kind string
	// ProviderEffectID identifies a confirmed receiver-side effect.
	ProviderEffectID string
	// Reason records refusal or uncertainty without inventing absence.
	Reason string
}

// Provider sends idempotently and reconciles across its documented retention window.
type Provider interface {
	// Capture may commit remotely before its response reaches this process.
	Capture(ctx context.Context, identity PaymentIdentity, body []byte) Observation
	// Observe includes every provider state the recovery guarantee relies on.
	Observe(ctx context.Context, identity PaymentIdentity) Observation
}

// SameIdentity compares every receiver field before evidence may authorize local state.
func SameIdentity(expected, observed PaymentIdentity) bool {
	return expected == observed
}

// ChooseRecovery maps only identity-matched receiver evidence to a durable local transition.
func ChooseRecovery(expected PaymentIdentity, observation Observation) string {
	if !SameIdentity(expected, observation.Identity) {
		return "needs_attention"
	}
	switch observation.Kind {
	case "confirmed":
		return "confirm"
	case "refused":
		return "refuse"
	case "pending":
		return "reconcile_later"
	default:
		return "needs_attention"
	}
}

// RefundIntent records compensation as a new external obligation.
type RefundIntent struct {
	// CompensationID is unique and never reuses the original effect identity.
	CompensationID string
	// OriginalEffectID links the refund to immutable capture history.
	OriginalEffectID string
	// Reason explains why trusted policy requested compensation.
	Reason string
}
```

On reply loss, persist `unknown` and later call `Observe` with every identity field. The adapter returns the receiver-established identity with its evidence; `ChooseRecovery` sends mismatches to `needs_attention`. A fresh call to a lagging or incomplete lookup does not prove absence. If compensation is required, write `RefundIntent` and its outbox row in a new local transaction. Do not mutate the capture into a refund.

## Proof

Script every crash window around local commit, send, provider commit, reply, and local confirmation. Use the real store for outbox atomicity. Prove repeated sends reuse `EffectID`, reconciliation rejects identity drift, and restore cannot replace newer provider evidence. Mark provider idempotency or lookup guarantees unverified when its contract cannot be exercised.
