# Go

Keep deterministic, stochastic, concurrent, and external claims separate. A seed does not freeze library versions, goroutine schedules, or provider behavior.

## Deterministic decision and exact artifact

```go
// Package evidence records inputs needed to explain or replay recovery decisions.
package evidence

import (
	"crypto/sha256"
	"fmt"
	"math"
)

// RecoveryInputs contains every value allowed to change the deterministic decision.
type RecoveryInputs struct {
	// NowMillis is injected UTC epoch time in milliseconds.
	NowMillis int64
	// NextEligibleMillis is the persisted retry boundary in the same units.
	NextEligibleMillis int64
	// PolicyVersion identifies the exact retry rules.
	PolicyVersion string
	// OperationVersion identifies the decision implementation.
	OperationVersion string
}

// MayRetry is deterministic for one complete RecoveryInputs value.
func MayRetry(input RecoveryInputs) bool {
	return input.PolicyVersion == "retry/v3" && input.OperationVersion == "recover/v2" && input.NowMillis >= input.NextEligibleMillis
}

// ExactRequest retains final bytes and digest behind copy-returning accessors.
// Its zero value is not a recorded empty request; construct values with RecordExactRequest.
type ExactRequest struct {
	// body uses immutable string storage so package callers cannot mutate retained bytes.
	body string
	// sha256 identifies body and stays private so callers cannot replace its evidence.
	sha256 [sha256.Size]byte
}

// RedactedRequest is diagnostic evidence and cannot satisfy exact replay.
type RedactedRequest struct {
	// Summary omits protected fields by policy.
	Summary string
	// OriginalDigest correlates evidence but cannot reconstruct bytes.
	OriginalDigest [sha256.Size]byte
}

// RecordExactRequest owns immutable final bytes before hashing the same snapshot.
func RecordExactRequest(body []byte) ExactRequest {
	// owned is an immutable copy, so later caller mutation cannot change retained evidence.
	owned := string(body)
	// digest is calculated after ownership transfer so it names the retained snapshot.
	digest := sha256.Sum256([]byte(owned))
	return ExactRequest{body: owned, sha256: digest}
}

// CopyBytes returns a fresh replay copy without exposing retained storage.
func (request ExactRequest) CopyBytes() []byte {
	return []byte(request.body)
}

// SHA256 returns the digest by value so callers cannot replace retained evidence.
func (request ExactRequest) SHA256() [sha256.Size]byte {
	return request.sha256
}
```

## Stochastic jitter

```go
// UnitRandom supplies one documented sample in the half-open interval [0, 1).
type UnitRandom interface {
	// Float64 returns the next intentional random input.
	Float64() float64
}

// JitterRecord retains the sample and selected delay in milliseconds.
type JitterRecord struct {
	// Sample is the effective stochastic input.
	Sample float64
	// DelayMillis is in the inclusive range [0, maximumMillis].
	DelayMillis int64
}

// maxExactJitterMillis leaves room for an inclusive bucket count in binary64.
const maxExactJitterMillis int64 = 1<<53 - 2

// SampleJitter maps one unit sample into the inclusive range [0, maximumMillis].
func SampleJitter(maximumMillis int64, random UnitRandom) (JitterRecord, error) {
	if maximumMillis < 0 || maximumMillis > maxExactJitterMillis {
		return JitterRecord{}, fmt.Errorf("maximum milliseconds must be in [0,%d]", maxExactJitterMillis)
	}
	// sample is retained because it is an effective input to the stochastic result.
	sample := random.Float64()
	if math.IsNaN(sample) || math.IsInf(sample, 0) || sample < 0 || sample >= 1 {
		return JitterRecord{}, fmt.Errorf("random sample must be finite and in [0,1)")
	}
	// bucketCount is exact in binary64 because maximumMillis stays below the checked limit.
	bucketCount := float64(maximumMillis + 1)
	return JitterRecord{Sample: sample, DelayMillis: int64(sample * bucketCount)}, nil
}
```

## Concurrent schedule evidence

```go
// ScheduleStep records one controlled synchronization decision without assigning probability.
type ScheduleStep struct {
	// Sequence is the observed total order for this run.
	Sequence uint64
	// Actor names the controlled goroutine.
	Actor string
	// Event names the reached synchronization point.
	Event string
}

// ScheduleRecorder captures interleavings selected by the test coordinator.
type ScheduleRecorder interface {
	// Reached blocks or records at one named synchronization point.
	Reached(actor, event string)
}
```

## External outcome and replay sink

```go
// ProviderOutcome retains evidence chosen by an external system.
type ProviderOutcome struct {
	// EffectID binds evidence to the original request.
	EffectID string
	// State is confirmed, refused, or unknown.
	State string
	// ObservedAtMillis is UTC epoch time in milliseconds.
	ObservedAtMillis int64
}

// EffectSink receives replay output without production authority.
type EffectSink interface {
	// Emit stores one replayed request in an isolated environment.
	Emit(effectID string, body []byte) error
}

// Replay can reach only the explicitly supplied isolated sink.
func Replay(effectID string, request ExactRequest, sink EffectSink) error {
	return sink.Emit(effectID, request.CopyBytes())
}
```

## Proof

Assert deterministic outputs and fail on hidden clock, configuration, or version reads. Mutate the source slice and every returned replay copy, then prove retained bytes and digest remain unchanged. Prove rejection of invalid jitter maxima and samples plus the inclusive bound for every accepted input. Use repeated trials only for a distribution claim supported by the random source and numeric mapping. Coordinate goroutines with channels or barriers, never sleeps. Construct replay without production credentials or adapters. A redacted record does not prove exact bytes, so mark exact replay unverified when only that record survives.
