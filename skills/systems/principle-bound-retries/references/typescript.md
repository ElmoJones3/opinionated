# TypeScript reference

The pure decision answers whether another payment invocation is permitted. The effectful shell must
still reserve budget, acquire capacity, recheck the absolute deadline, and make one accounted call.

```ts
/** This excerpt decides retry policy; production adapters own durable reservation and capacity. */

/** PriorEvidence records what the last invocation established. */
type PriorEvidence =
  | 'local_refusal'
  | 'transient_receiver_refusal'
  | 'terminal_receiver_refusal'
  | 'pending'
  | 'unknown'
  | 'programmer_defect'

/** RetryInput contains the full policy state before another provider call. */
interface RetryInput {
  /** Remains stable for every equivalent provider invocation. */ readonly effectKey: string
  /** Names the tenant and dependency admission scope charged by this call. */ readonly capacityScope: string
  /** Explains why another invocation is being considered. */ readonly prior: PriorEvidence
  /** Means the receiver atomically converges equivalent calls. */ readonly receiverEnforcesIdempotency: boolean
  /** Counts physical calls still available across visible retry layers. */ readonly remainingCalls: number
  /** Limits additional provider cost in integer minor units. */ readonly remainingCostCents: number
  /** Charges the next physical provider call in integer minor units. */ readonly nextCallCostCents: number
  /** Uses epoch milliseconds only as an explicitly supplied protocol value. */ readonly nowMs: number
  /** Ends permission to start calls at this epoch millisecond. */ readonly deadlineMs: number
}

/** RetryDecision preserves refusal, exhaustion, and unsafe uncertainty as separate outcomes. */
type RetryDecision =
  | { /** Retry permits reservation, not an uncounted call. */ readonly kind: 'reserve_retry' }
  | {
      /** Stop records a terminal or exhausted reason. */ readonly kind: 'stop'
      /** Explains why automation ended. */ readonly reason: 'terminal_refusal' | 'defect' | 'budget_exhausted' | 'deadline_expired'
    }
  | {
      /** Needs attention preserves an unknown effect that cannot safely repeat. */ readonly kind: 'needs_attention'
      /** Names the missing receiver protection. */ readonly reason: 'unknown_unprotected'
    }

/** decideRetry permits an unknown repeat only under receiver-enforced idempotency. */
function decideRetry(input: RetryInput): RetryDecision {
  if (
    ![input.remainingCalls, input.remainingCostCents, input.nextCallCostCents]
      .every((value) => Number.isSafeInteger(value) && value >= 0)
  ) {
    return { kind: 'stop', reason: 'defect' }
  }
  if (input.prior === 'terminal_receiver_refusal') return { kind: 'stop', reason: 'terminal_refusal' }
  if (input.prior === 'programmer_defect') return { kind: 'stop', reason: 'defect' }
  if ((input.prior === 'unknown' || input.prior === 'pending') && !input.receiverEnforcesIdempotency) {
    return { kind: 'needs_attention', reason: 'unknown_unprotected' }
  }
  if (input.remainingCalls < 1 || input.remainingCostCents < input.nextCallCostCents) {
    return { kind: 'stop', reason: 'budget_exhausted' }
  }
  return input.nowMs >= input.deadlineMs
    ? { kind: 'stop', reason: 'deadline_expired' }
    : { kind: 'reserve_retry' }
}

/** fullJitterDelayMs spreads one retry within a capped exponential window. */
function fullJitterDelayMs(
  attemptIndex: number,
  baseMs: number,
  capMs: number,
  sample: number,
): number {
  if (
    !Number.isSafeInteger(attemptIndex) || attemptIndex < 0 ||
    !Number.isSafeInteger(baseMs) || baseMs < 0 ||
    !Number.isSafeInteger(capMs) || capMs < 0 ||
    !Number.isFinite(sample) || sample < 0 || sample >= 1
  ) {
    throw new RangeError('retry inputs violate non-negative units or the [0, 1) sample contract')
  }
  /** upperMs avoids exponent overflow while preserving the configured millisecond cap. */
  let upperMs = Math.min(baseMs, capMs)
  /** step counts completed policy doublings without reading a clock. */
  for (let step = 0; step < attemptIndex && upperMs < capMs; step += 1) {
    upperMs = upperMs > capMs / 2 ? capMs : upperMs * 2
  }
  return Math.floor(sample * upperMs)
}

/** worstCasePhysicalCalls exposes multiplication between independent retry layers. */
function worstCasePhysicalCalls(orchestratorAttempts: number, clientCallsPerAttempt: number): number {
  if (
    !Number.isSafeInteger(orchestratorAttempts) || orchestratorAttempts < 0 ||
    !Number.isSafeInteger(clientCallsPerAttempt) || clientCallsPerAttempt < 0
  ) {
    throw new RangeError('retry layer counts must be safe non-negative integers')
  }
  /** calls exposes hidden multiplication while refusing an imprecise JavaScript result. */
  const calls = orchestratorAttempts * clientCallsPerAttempt
  if (!Number.isSafeInteger(calls) || calls < 0) throw new RangeError('retry layer counts exceed safe non-negative integers')
  return calls
}

/** RetryStore owns one atomic attempt-and-budget reservation immediately before a call. */
interface RetryStore {
  /** Returns false when concurrency or exhaustion consumed the remaining budget. */
  reserve(effectKey: string, expectedRemainingCalls: number, costCents: number): Promise<boolean>
}

/** CapacityPermit holds one admitted slot until the invocation settles locally. */
interface CapacityPermit {
  /** Releases the slot exactly once in the caller's finally block. */ release(): void
}

/** CapacityAuthority enforces the configured local, tenant, dependency, or global scope. */
interface CapacityAuthority {
  /** Returns no permit when recovery traffic has reached the shared limit. */
  tryAcquire(scope: string): Promise<CapacityPermit | undefined>
}
```

The invocation order is fixed: `reserve`, capacity admission, deadline recheck, then one provider
call. Account for any HTTP-client retry in `worstCasePhysicalCalls` and the durable budget. An
interface cannot enforce transaction or semaphore behavior.

If the repository uses Temporal TypeScript, Activity retry policy is one scheduling layer. Keep the
business effect key stable across Activity retries and Continue-As-New. Activity attempt numbers and
Workflow Run IDs are execution identities, not effect keys. Account for HTTP retries that Temporal
cannot see. Heartbeats record resumable progress; do not treat heartbeat timeout or delivered cancellation
as proof that the provider stopped.

Test every decision branch with controlled `nowMs` and jitter samples. Assert exact physical-call
counts for nested layers and use the production store for concurrent budget reservation. Otherwise
mark the atomic-reservation claim unverified.
