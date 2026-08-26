# Go reference

This reference uses the same `CAP1` binary format as the other languages: unsigned 64-bit amount
cents, length-prefixed UTF-8 currency, then length-prefixed UTF-8 order ID.

```go
// Package idempotenteffect builds stable receiver input without claiming to enforce database atomicity.
package idempotenteffect

import (
	"bytes"
	"context"
	"crypto/sha256"
	"encoding/binary"
	"errors"
)

// CaptureRequest is the meaning protected by one idempotency identity.
type CaptureRequest struct {
	// AmountCents uses positive integer minor units.
	AmountCents uint64
	// Currency uses the receiver's validated uppercase currency code.
	Currency string
	// OrderID binds the effect to one business obligation.
	OrderID string
}

// ReceiverIdentity scopes a stable key to one receiver namespace.
type ReceiverIdentity struct {
	// ReceiverAccount selects the provider-owned account.
	ReceiverAccount string
	// Environment prevents test and production identities from colliding.
	Environment string
	// Operation prevents one key from naming a different receiver operation.
	Operation string
	// EffectKey remains stable across every equivalent delivery.
	EffectKey string
}

// writeField writes one bounded UTF-8 field without separator ambiguity.
func writeField(buffer *bytes.Buffer, value string) error {
	if len(value) > 0xffff {
		return errors.New("canonical field exceeds 65535 bytes")
	}
	// Length makes adjacent fields unambiguous in the canonical byte sequence.
	var length [2]byte
	binary.BigEndian.PutUint16(length[:], uint16(len(value)))
	buffer.Write(length[:])
	buffer.WriteString(value)
	return nil
}

// CanonicalCaptureBytes creates the versioned byte identity shared by every implementation.
func CanonicalCaptureBytes(request CaptureRequest) ([]byte, error) {
	if request.AmountCents == 0 {
		return nil, errors.New("amount cents must be positive")
	}
	// Buffer owns the exact field order for canonical version CAP1.
	var buffer bytes.Buffer
	buffer.WriteString("CAP1")
	// Amount stores exact minor units in network byte order.
	var amount [8]byte
	binary.BigEndian.PutUint64(amount[:], request.AmountCents)
	buffer.Write(amount[:])
	// Err reports a canonical-field contract violation.
	if err := writeField(&buffer, request.Currency); err != nil {
		return nil, err
	}
	// Err reports the same contract violation for the final field.
	if err := writeField(&buffer, request.OrderID); err != nil {
		return nil, err
	}
	return buffer.Bytes(), nil
}

// CaptureDigest detects key reuse with changed canonical meaning.
func CaptureDigest(request CaptureRequest) ([32]byte, error) {
	// Encoded and err keep invalid meaning out of the digest namespace.
	encoded, err := CanonicalCaptureBytes(request)
	if err != nil {
		return [32]byte{}, err
	}
	return sha256.Sum256(encoded), nil
}

// SettlementKind identifies the receiver authority's arbitration result.
type SettlementKind string

const (
	// SettlementCommitted covers the winner and equivalent replays.
	SettlementCommitted SettlementKind = "committed"
	// SettlementConflict rejects one key carrying a changed digest.
	SettlementConflict SettlementKind = "conflict"
	// SettlementPending requires an authoritative in-flight owner.
	SettlementPending SettlementKind = "pending"
)

// SettlementResult carries the stored response for committed calls.
type SettlementResult struct {
	// Kind identifies committed, conflict, or authoritative pending state.
	Kind SettlementKind
	// LedgerEntryID is stable for the winner and every equivalent replay.
	LedgerEntryID string
	// Replay says whether an earlier call created the ledger entry.
	Replay bool
}

// PaymentLedger owns unique arbitration, ledger mutation, and stored response.
type PaymentLedger interface {
	// SettleOnce performs all receiver-owned changes in one production transaction or equivalent protocol.
	SettleOnce(context.Context, ReceiverIdentity, CaptureRequest, [32]byte) (SettlementResult, error)
}
```

A `database/sql` implementation is appropriate when the repository already uses it. For PostgreSQL,
name that engine and use one receiver transaction with a unique scoped identity, digest comparison,
ledger mutation, and stored response. The interface does not make those steps atomic. Do not claim
that a local transaction covers an unrelated external provider.

Use one shared golden vector: 4,000 cents, `USD`, and `order-123` encode as
`434150310000000000000fa0000355534400096f726465722d313233` and hash to
`d2c10eb12de108dcea8788149a7770b038b513a19f8338af27286a90549a3e78`. Exercise concurrent first
calls, replay, conflict,
transaction fault points, and authoritative pending state against the production database. Test
post-retention delivery under the receiver's tombstone or receiver-clock cutoff contract. Otherwise
mark the database or retention claim unverified.
