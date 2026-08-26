# Go

Each branch owns one control. A buffered channel is process-local. Use `golang.org/x/sync/semaphore` only when the repository already depends on it and queued admission matches the contract.

## Admission and concurrency

```go
// Package control bounds provider work accepted by one process.
package control

import (
	"context"
	"sync/atomic"
)

// LocalGate atomically accounts process-local provider slots.
type LocalGate struct {
	// slots contains one token per available slot and has fixed capacity.
	slots chan struct{}
}

// NewLocalGate creates a process-scoped gate with exactly positive capacity slots.
func NewLocalGate(capacity int) *LocalGate {
	if capacity < 1 {
		panic("provider capacity must be positive")
	}
	// slots is the only process-local owner of the configured provider capacity.
	slots := make(chan struct{}, capacity)
	// index exists only to mint exactly the configured number of indistinguishable permits.
	for index := 0; index < capacity; index++ {
		slots <- struct{}{}
	}
	return &LocalGate{slots: slots}
}

// Try reserves a slot immediately or refuses before work starts.
func (gate *LocalGate) Try() (release func(), accepted bool) {
	select {
	case <-gate.slots:
		// released rejects accidental double release from competing exit paths.
		var released atomic.Bool
		return func() {
			if !released.CompareAndSwap(false, true) {
				panic("provider permit released twice")
			}
			gate.slots <- struct{}{}
		}, true
	default:
		return nil, false
	}
}

// WithProviderSlot makes ordinary and recovery calls share one local budget.
func WithProviderSlot(ctx context.Context, gate *LocalGate, call func(context.Context) error) error {
	// release carries ownership only when accepted is true.
	release, accepted := gate.Try()
	if !accepted {
		return ErrCapacityRefused
	}
	defer release()
	return call(ctx)
}

// ErrCapacityRefused proves the provider call never started.
var ErrCapacityRefused = &admissionError{}

// admissionError carries refusal without implying a transient provider failure.
type admissionError struct{}

// Error implements error with the stable admission reason.
func (*admissionError) Error() string { return "provider capacity refused" }
```

## Retry amplification

```go
// CallBudget counts physical provider calls across workflow, client, and recovery retries.
type CallBudget struct {
	// Remaining is decremented before a physical call and not refunded for unknown outcomes.
	Remaining uint32
}

// Consume reserves one provider call or refuses without contacting it.
func (budget *CallBudget) Consume() bool {
	if budget.Remaining == 0 {
		return false
	}
	budget.Remaining--
	return true
}
```

Do not share the mutable value across goroutines without one owner or synchronization. A durable/global budget belongs in an atomic store. Include recovery scanners in the same bound.

A context deadline stops local waiting. It does not prove that a provider call already sent was cancelled or failed.

Releasing the permit says only that the local adapter call returned or unwound. It ends local accounting; remote provider work may still be running. Represent a deliberately closed gate with an explicit admission mode instead of constructing one with zero capacity.

## Circuit breaking

```go
// BreakerState is serialized at the scope claimed by the circuit.
type BreakerState struct {
	// Kind is closed, open, or half_open.
	Kind string
	// RetryAtMillis is injected monotonic time translated to integer milliseconds.
	RetryAtMillis int64
	// ProbeOwner identifies the only permitted half-open caller.
	ProbeOwner string
}

// RequestProbe is pure; the caller commits its result with a conditional version update.
func RequestProbe(state BreakerState, nowMillis int64, callerID string) (BreakerState, bool) {
	if state.Kind == "open" && nowMillis >= state.RetryAtMillis {
		return BreakerState{Kind: "half_open", ProbeOwner: callerID}, true
	}
	return state, state.Kind == "half_open" && state.ProbeOwner == callerID
}
```

## Global limit and objective

```go
// GlobalLimiter uses the deployed coordinator rather than process memory.
type GlobalLimiter interface {
	// Reserve atomically accounts tenant cost or reports coordinator failure.
	Reserve(ctx context.Context, tenantID string, costUnits uint64) (string, error)
}

// DeliverySample defines one member of the delivery SLI population.
type DeliverySample struct {
	// WorkloadClass is ordinary or recovery and remains a bounded metric label.
	WorkloadClass string
	// AcceptedAtMillis is the population's UTC epoch start point.
	AcceptedAtMillis int64
	// TerminalAtMillis is the completion point; zero means still unresolved.
	TerminalAtMillis int64
}
```

State the coordinator-outage policy. Failing closed, preallocated local shares, and weakening the promise have different guarantees. Never silently multiply a global limit by instance count.

## Proof

Coordinate goroutines with channels or barriers and assert exact peak calls. Exercise errors and cancellation for one release. Count physical calls across nested retries. Commit simultaneous half-open requests against the actual state owner. Test the deployed global limiter and outage mode; label global enforcement unverified if that dependency is unavailable.
