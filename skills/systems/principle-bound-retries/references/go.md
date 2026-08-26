# Go reference

The decision stays independent of `time.Now` and random globals. The shell converts a transmitted
deadline to local timing, reserves durable budget, acquires capacity, and issues one accounted call.

```go
// Package boundedretry decides payment retries without hiding clocks, randomness, or storage claims.
package boundedretry

import (
	"context"
	"errors"
	"time"
)

// PriorEvidence records what the previous provider invocation established.
type PriorEvidence string

const (
	// LocalRefusal proves the invocation never left.
	LocalRefusal PriorEvidence = "local_refusal"
	// TransientReceiverRefusal is retryable under receiver policy.
	TransientReceiverRefusal PriorEvidence = "transient_receiver_refusal"
	// TerminalReceiverRefusal forbids an equivalent retry.
	TerminalReceiverRefusal PriorEvidence = "terminal_receiver_refusal"
	// Pending means the receiver may still complete.
	Pending PriorEvidence = "pending"
	// Unknown means the provider effect may exist.
	Unknown PriorEvidence = "unknown"
	// ProgrammerDefect means repetition cannot repair the call.
	ProgrammerDefect PriorEvidence = "programmer_defect"
)

// RetryInput contains the full policy state before another provider call.
type RetryInput struct {
	// EffectKey remains stable across equivalent provider invocations.
	EffectKey string
	// CapacityScope names the tenant and dependency admission limit charged by this call.
	CapacityScope string
	// Prior explains why another invocation is being considered.
	Prior PriorEvidence
	// ReceiverEnforcesIdempotency means equivalent calls converge at the receiver.
	ReceiverEnforcesIdempotency bool
	// RemainingCalls counts physical calls across visible retry layers.
	RemainingCalls uint
	// RemainingCostCents limits additional provider cost in minor units.
	RemainingCostCents uint64
	// NextCallCostCents charges the next physical call in minor units.
	NextCallCostCents uint64
	// Now is supplied by the caller so tests own time.
	Now time.Time
	// Deadline is the absolute protocol deadline for starting another call.
	Deadline time.Time
}

// RetryDecision names the only permitted next actions.
type RetryDecision string

const (
	// ReserveRetry permits reservation, not an uncounted call.
	ReserveRetry RetryDecision = "reserve_retry"
	// StopTerminalRefusal preserves a final receiver decision.
	StopTerminalRefusal RetryDecision = "stop_terminal_refusal"
	// StopDefect prevents repetition of broken local logic.
	StopDefect RetryDecision = "stop_defect"
	// StopBudgetExhausted ends calls without changing an unknown outcome.
	StopBudgetExhausted RetryDecision = "stop_budget_exhausted"
	// StopDeadlineExpired rejects a call that can no longer start in time.
	StopDeadlineExpired RetryDecision = "stop_deadline_expired"
	// NeedsAttention preserves an unknown unprotected effect.
	NeedsAttention RetryDecision = "needs_attention"
)

// DecideRetry allows an unknown repeat only under receiver-enforced idempotency.
func DecideRetry(input RetryInput) RetryDecision {
	if input.Prior == TerminalReceiverRefusal {
		return StopTerminalRefusal
	}
	if input.Prior == ProgrammerDefect {
		return StopDefect
	}
	if (input.Prior == Unknown || input.Prior == Pending) && !input.ReceiverEnforcesIdempotency {
		return NeedsAttention
	}
	if input.RemainingCalls == 0 || input.RemainingCostCents < input.NextCallCostCents {
		return StopBudgetExhausted
	}
	if !input.Now.Before(input.Deadline) {
		return StopDeadlineExpired
	}
	return ReserveRetry
}

// FullJitterDelay spreads one retry inside a capped exponential duration.
func FullJitterDelay(attempt uint, base time.Duration, cap time.Duration, sample uint64) (time.Duration, error) {
	if base < 0 || cap < 0 || sample >= 1_000_000 {
		return 0, errors.New("retry inputs violate non-negative durations or sample ppm range")
	}
	// Upper stops doubling at cap to avoid duration overflow.
	upper := base
	if cap < upper {
		upper = cap
	}
	// Step counts completed policy doublings without reading a clock.
	for step := uint(0); step < attempt && upper < cap; step++ {
		if upper > cap/2 {
			upper = cap
		} else {
			upper *= 2
		}
	}
	// Whole and remainder avoid overflowing a duration during fixed-point scaling.
	whole, remainder := upper/1_000_000, upper%1_000_000
	return whole*time.Duration(sample) + remainder*time.Duration(sample)/1_000_000, nil
}

// WorstCasePhysicalCalls exposes multiplication between independent retry layers.
func WorstCasePhysicalCalls(orchestratorAttempts uint64, clientCallsPerAttempt uint64) (uint64, error) {
	// Maximum is the largest call count representable by this accounting type.
	maximum := ^uint64(0)
	if clientCallsPerAttempt != 0 && orchestratorAttempts > maximum/clientCallsPerAttempt {
		return 0, errors.New("nested retry call count overflows uint64")
	}
	return orchestratorAttempts * clientCallsPerAttempt, nil
}

// RetryStore owns one atomic attempt-and-budget reservation immediately before a call.
type RetryStore interface {
	// Reserve returns false when concurrency or exhaustion consumed the budget.
	Reserve(context.Context, string, uint, uint64) (bool, error)
}

// CapacityPermit holds one admitted slot until the invocation settles locally.
type CapacityPermit interface {
	// Release returns the shared slot exactly once after the call.
	Release()
}

// CapacityAuthority enforces the configured local, tenant, dependency, or global scope.
type CapacityAuthority interface {
	// TryAcquire returns no permit when recovery traffic reached the shared limit.
	TryAcquire(context.Context, string) (CapacityPermit, bool, error)
}
```

Serialized `time.Time` values lose their monotonic component. Carry an absolute timestamp or
remaining budget across processes, then convert it to local monotonic timing. The call order remains
durable reservation, capacity admission, deadline recheck, then one invocation. Include client
retries in the worst-case multiplication.

If the repository uses the Temporal Go SDK, Activity retry state is one layer. Keep the business
effect key stable across Activity retries and Continue-As-New. Activity attempt numbers and Workflow
Run IDs are not effect keys. Account for client retries Temporal cannot see. Heartbeats record
resumable progress; timeout or cancellation does not prove the provider stopped.

Test policy, jitter bounds, and exact nested call counts with supplied time and samples. Prove
concurrent reservation against the production store or mark it unverified.
