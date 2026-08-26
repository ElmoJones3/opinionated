# TypeScript reference

This example records one payment-capture obligation before any worker owns it. A replacement worker
keeps the same obligation and effect key. It creates a new attempt and invocation instead of
pretending the abandoned execution did not happen.

```ts
/** This excerpt models recovery facts; a production repository must enforce its transaction claims. */

/** CaptureOutcome records only knowledge earned from the provider or explicit intervention. */
type CaptureOutcome =
  | { /** Requested means the effect is still owed. */ readonly kind: 'requested' }
  | {
      /** Confirmed binds a provider result to this obligation. */ readonly kind: 'confirmed'
      /** Provider effect identity. */ readonly captureId: string
    }
  | {
      /** Refused requires stable receiver evidence. */ readonly kind: 'refused'
      /** Receiver refusal reason. */ readonly code: string
    }
  | {
      /** Unknown preserves a call that may have left. */ readonly kind: 'unknown'
      /** Attempt whose result was lost. */ readonly attemptId: string
    }
  | {
      /** Needs attention stops unsafe automation. */ readonly kind: 'needs_attention'
      /** Why no safe action remains. */ readonly reason: string
    }

/** CaptureRecord separates the business obligation from its physical executions. */
interface CaptureRecord {
  /** Names the one payment obligation for the order. */ readonly obligationId: string
  /** Names the separately recoverable capture step. */ readonly stepId: string
  /** Stays stable across equivalent provider deliveries. */ readonly effectKey: string
  /** Rejects changed request meaning under the stable key. */ readonly requestDigest: string
  /** Selects the current conditional-write generation. */ readonly version: bigint
  /** Records the latest earned knowledge. */ readonly outcome: CaptureOutcome
}

/** ReservedAttempt proves storage authorized one physical execution before its call. */
interface ReservedAttempt {
  /** Binds the execution to one durable business obligation. */ readonly obligationId: string
  /** Changes for each authorized execution. */ readonly attemptId: string
  /** Changes for each provider call inside the attempt. */ readonly invocationId: string
  /** Reuses the logical receiver identity across retries. */ readonly effectKey: string
  /** Binds the reservation to the record version it may change. */ readonly expectedVersion: bigint
}

/** CaptureStore owns real transactions, uniqueness, and compare-and-set behavior. */
interface CaptureStore {
  /** Atomically reserves an attempt for the existing obligation or refuses stale state. */
  reserveAttempt(obligationId: string, expectedVersion: bigint): Promise<ReservedAttempt>
  /** Marks an abandoned reservation unknown only if its version is still current. */
  markUnknown(attemptId: string, expectedVersion: bigint): Promise<boolean>
}

/** RecoveryInput describes the last durable point a replacement can trust. */
interface RecoveryInput {
  /** Holds immutable identity and current outcome. */ readonly record: CaptureRecord
  /** Exists only when storage committed an attempt reservation. */ readonly reservedAttempt?: ReservedAttempt
  /** Means the invocation record says a provider call may have started. */ readonly callMayHaveLeft: boolean
}

/** recoveryOutcome refuses to infer a provider effect from attempt count or worker loss. */
function recoveryOutcome(input: RecoveryInput): CaptureOutcome {
  if (input.record.outcome.kind !== 'requested') return input.record.outcome
  if (input.reservedAttempt === undefined) return { kind: 'requested' }
  if (
    input.reservedAttempt.obligationId !== input.record.obligationId ||
    input.reservedAttempt.effectKey !== input.record.effectKey ||
    input.reservedAttempt.expectedVersion !== input.record.version
  ) {
    return { kind: 'needs_attention', reason: 'reservation_not_current' }
  }
  return input.callMayHaveLeft
    ? { kind: 'unknown', attemptId: input.reservedAttempt.attemptId }
    : { kind: 'requested' }
}
```

`reserveAttempt` needs one production-store transaction. It must verify the obligation and expected
version, allocate a unique attempt and invocation, bind the reservation to the obligation and
preserved effect key, and advance the record to `ReservedAttempt.expectedVersion`. `markUnknown`
needs a conditional update. The interface promises that behavior but
cannot supply it. A PostgreSQL adapter, if PostgreSQL is the deployed store, should prove a unique
obligation identity and `UPDATE ... WHERE version = $expected` against PostgreSQL itself.

Test `recoveryOutcome` directly for crashes before reservation, after reservation, after send, and
before local confirmation. Then run concurrent uniqueness and compare-and-set tests against the
production database. If that database cannot run, report those storage guarantees as unverified.
