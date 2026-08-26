# TypeScript

Each example owns one control. Do not call a process-local gate global, and do not make a circuit breaker responsible for settling abandoned effects.

## Admission and concurrency

```ts
/** Permit releases one process-local provider slot exactly once. */
interface Permit { /** release returns capacity after success, failure, or cancellation. */ release(): void; }
/** LocalGate atomically refuses work when this process has no provider slot. */
interface LocalGate { /** tryAcquire never queues or starts refused work. */ tryAcquire(): Permit | undefined; }
/** AdmissionResult keeps gate refusal distinct from every value returned by the call. */
type AdmissionResult<T> =
  | { /** Completed carries the admitted call's value. */ readonly kind: "completed"; /** value may have any application type. */ readonly value: T }
  | { /** Capacity refused proves the call did not start. */ readonly kind: "capacity_refused" }

/** withProviderSlot puts ordinary and recovery calls through the same local gate. */
async function withProviderSlot<T>(gate: LocalGate, call: () => Promise<T>): Promise<AdmissionResult<T>> {
  /** permit exists only when the provider call has been admitted and must be released. */
  const permit = gate.tryAcquire();
  if (permit === undefined) return { kind: "capacity_refused" };
  try {
    return { kind: "completed", value: await call() };
  } finally {
    permit.release();
  }
}
```

Implement `tryAcquire` with one synchronous counter owner or the gate already used by the project. JavaScript's run-to-completion makes a counter update process-atomic only when no `await` occurs inside it.

Reject a configured capacity below one. If operations need a deliberately closed gate, model that as an explicit admission mode rather than an accidental zero. Releasing the permit says the local adapter call returned or unwound; it does not prove already-sent remote work stopped.

## Retry amplification

```ts
/** CallBudget counts physical provider calls across workflow, client, and recovery layers. */
interface CallBudget { /** remaining is decremented before each physical call and never refunded for unknown outcomes. */ readonly remaining: number; }
/** consume reserves one physical call or refuses before contacting the provider. */
function consume(budget: CallBudget): CallBudget | undefined {
  return budget.remaining > 0 ? { remaining: budget.remaining - 1 } : undefined;
}
```

Pass the reduced budget through nested retries. Three layers with independent maxima multiply; one shared budget of five proves at most five physical calls for the obligation, including recovery.

A caller timeout or cancellation stops waiting and releases local admission ownership. It does not prove that a provider call already sent was cancelled or failed.

## Circuit breaking

```ts
/** BreakerState is serialized at the scope claimed by the circuit. */
type BreakerState =
  | {
      /** kind admits normal calls while failure policy remains satisfied. */ readonly kind: "closed";
      /** failures is the serialized count under the configured opening rule. */ readonly failures: number;
    }
  | {
      /** kind refuses calls until the injected monotonic deadline. */ readonly kind: "open";
      /** retryAtMs is monotonic time in milliseconds. */ readonly retryAtMs: number;
    }
  | {
      /** kind admits only the chosen recovery probe. */ readonly kind: "half_open";
      /** probeOwner identifies the only caller permitted to probe. */ readonly probeOwner: string;
    };
/** ProbeDecision contains the next state and whether this caller owns the only probe. */
interface ProbeDecision { /** state must be committed by conditional version update. */ readonly state: BreakerState; /** allowed authorizes one probe only. */ readonly allowed: boolean; }

/** requestProbe is pure over injected monotonic time and caller identity. */
function requestProbe(state: BreakerState, nowMs: number, callerId: string): ProbeDecision {
  if (state.kind === "open" && nowMs >= state.retryAtMs) return { state: { kind: "half_open", probeOwner: callerId }, allowed: true };
  return { state, allowed: state.kind === "half_open" && state.probeOwner === callerId };
}
```

## Global limit and objective

```ts
/** GlobalLimiter is backed by the deployed coordinator, never by one process counter. */
interface GlobalLimiter { /** reserve atomically accounts one tenant call or returns coordinator_unavailable. */ reserve(tenantId: string, costUnits: number): Promise<"reserved" | "limited" | "coordinator_unavailable">; }
/** DeliverySample supplies bounded metric labels and an explicit measurement point. */
interface DeliverySample { /** workloadClass comes from a fixed enum. */ readonly workloadClass: "ordinary" | "recovery"; /** acceptedAtMs starts the SLI population clock. */ readonly acceptedAtMs: number; /** terminalAtMs ends it or remains absent while unresolved. */ readonly terminalAtMs?: number; }
```

Define the coordinator-outage policy explicitly. Fail closed, use preallocated local shares, or weaken the promise. Never silently exceed a global limit. Define the SLI population, measurement points, exclusions, and window; do not put tenant, run, or effect IDs into metric labels.

## Proof

Use controlled promises to hold slots and assert the exact peak without sleeps. Exercise every return, throw, and cancellation path for one release. Count physical calls across all retry layers and recovery. Serialize simultaneous half-open requests against the real state owner. Exercise the deployed global coordinator and its outage policy; otherwise mark global enforcement unverified.
