# TypeScript

Keep deterministic, stochastic, concurrent, and external claims separate. Recording the value chosen in one category does not turn it into another.

## Deterministic decision and exact artifact

```ts
import { createHash } from "node:crypto";

/** RecoveryInputs contains every value allowed to change the deterministic decision. */
interface RecoveryInputs {
  /** nowMs is the injected UTC epoch time in milliseconds. */ readonly nowMs: number;
  /** nextEligibleMs is the persisted retry boundary in UTC epoch milliseconds. */ readonly nextEligibleMs: number;
  /** policyVersion identifies the exact retry rules. */ readonly policyVersion: string;
  /** operationVersion identifies the decision implementation. */ readonly operationVersion: string;
}

/** mayRetry is deterministic for one complete RecoveryInputs value. */
function mayRetry(input: RecoveryInputs): boolean {
  return input.policyVersion === "retry/v3" && input.operationVersion === "recover/v2" && input.nowMs >= input.nextEligibleMs;
}

/** ExactRequest retains final bytes without exposing its mutable internal array. */
interface ExactRequest {
  /** copyBytes returns a fresh replay copy under the request access policy. */
  copyBytes(): Uint8Array;
  /** sha256 identifies the retained exact bytes. */
  readonly sha256: string;
}
/** RedactedRequest is diagnostic evidence and cannot satisfy an exact-replay contract. */
interface RedactedRequest {
  /** summary omits protected fields by policy. */
  readonly summary: string;
  /** originalDigest can correlate but cannot reconstruct bytes. */
  readonly originalDigest: string;
}

/** recordExactRequest owns a defensive copy of the final bytes and its digest. */
function recordExactRequest(bytes: Uint8Array): ExactRequest {
  /** ownedBytes prevents later caller or replay-sink mutation from changing the record. */
  const ownedBytes = Uint8Array.from(bytes);
  /** copyBytes keeps the retained array private while still supporting isolated replay. */
  const copyBytes = (): Uint8Array => Uint8Array.from(ownedBytes);
  return Object.freeze({
    copyBytes,
    sha256: createHash("sha256").update(ownedBytes).digest("hex"),
  });
}
```

## Stochastic jitter

```ts
/** RandomSource supplies one documented sample in the half-open interval [0, 1). */
interface RandomSource {
  /** nextUnit must reject or never produce values outside [0, 1). */
  nextUnit(): number;
}
/** JitterRecord retains the sampled input and selected delay in milliseconds. */
interface JitterRecord {
  /** sample is the effective random input. */
  readonly sample: number;
  /** delayMs is in the inclusive range [0, maximumMs]. */
  readonly delayMs: number;
}

/** sampleJitter maps one unit sample into the inclusive integer range [0, maximumMs]. */
function sampleJitter(maximumMs: number, random: RandomSource): JitterRecord {
  if (!Number.isSafeInteger(maximumMs) || maximumMs < 0 || maximumMs >= Number.MAX_SAFE_INTEGER) {
    throw new RangeError(
      "maximumMs must be a non-negative safe integer below Number.MAX_SAFE_INTEGER",
    );
  }
  /** sample is retained because it is an effective input to this stochastic result. */
  const sample = random.nextUnit();
  if (!Number.isFinite(sample) || sample < 0 || sample >= 1) {
    throw new RangeError("random sample must be finite and in [0, 1)");
  }
  /** bucketCount stays exactly representable because the maximum check leaves room for one. */
  const bucketCount = maximumMs + 1;
  return { sample, delayMs: Math.floor(sample * bucketCount) };
}
```

## Concurrent schedule evidence

```ts
/** ScheduleStep records one synchronization decision without assigning it a probability. */
interface ScheduleStep { /** sequence is the observed total order in this test run. */ readonly sequence: number; /** actor names the controlled participant. */ readonly actor: string; /** event names the reached synchronization point. */ readonly event: string; }
/** ScheduleRecorder captures controlled interleavings chosen by the test scheduler. */
interface ScheduleRecorder { /** reached appends one synchronization event. */ reached(actor: string, event: string): void; }
```

## External outcome and replay sink

```ts
/** ProviderOutcome retains evidence an external system chose and local code cannot regenerate. */
interface ProviderOutcome { /** effectId binds evidence to the request. */ readonly effectId: string; /** state is the normalized provider result. */ readonly state: "confirmed" | "refused" | "unknown"; /** observedAtMs records UTC epoch milliseconds. */ readonly observedAtMs: number; }
/** EffectSink prevents replay from choosing a production adapter by a hidden flag. */
interface EffectSink { /** emit accepts replay output without external authority. */ emit(effectId: string, request: Uint8Array): Promise<void>; }

/** replay writes only to the caller-supplied isolated sink. */
async function replay(effectId: string, request: ExactRequest, sink: EffectSink): Promise<void> {
  await sink.emit(effectId, request.copyBytes());
}
```

## Proof

Assert exact deterministic outputs for complete inputs and fail when a clock, config, or version is hidden. For jitter, prove rejection of invalid maxima and samples plus the inclusive bound for every accepted input. Use repeated trials only for a distribution claim supported by the random source and numeric mapping. Drive concurrent actors with barriers or controlled promises, not sleeps. Verify replay construction can receive only an isolated sink and that no production credentials or adapter are present. If exact bytes were not retained, call the record redacted and exact replay unverified.
