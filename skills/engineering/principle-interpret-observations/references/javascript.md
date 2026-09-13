# JavaScript and TypeScript examples

These are illustrative assertion excerpts, not standalone tests or a required
application API. Fixture fields, budgets, reasons, and capacities are local choices.

## Example setup

Receive SDK exports and introduce delayed, duplicate, or incompatible records
through the wire boundary. Preserve terminal evidence and source age. In the
population case, two measured completions include one that misses both quality
and latency; tracing is unsampled, combined misses equal one, and receiver
coverage remains unknown. Unsupported versions produce a named refusal.

## What the language changes

Validate received values at runtime, including in TypeScript. JSON.parse does
not establish a reporting contract. Distinguish an absent property from null,
false, and zero; avoid truthiness defaults for assessments or timestamps.

Use exact wire encodings for timestamps and sequence numbers beyond Number's
safe integer range. Compare source sequence within its defined authority. Keep
previous accepted evidence immutable when decoding or selecting the next record.
Measure report time after awaited authority lookup, not before it starts.

## Assertions at the claimed boundary

```js
assert.equal(select(terminal, lateLive).kind, "completion");
assert.equal(inspect(oldSourceArrivingNow, reportTime).freshness, "stale");
assert.equal(population.completed, 2);
assert.equal(population.combinedMisses, 1);
assert.equal(population.coverage, "unknown");
assert.throws(() => receive(unsupportedVersionRecord), { code: "unsupported_version" });
```

Establish the accepted record through real emission when testing that composition.
After each named refusal, assert the previous accepted evidence is unchanged.
Missing required fields and absent optional assessment have distinct outcomes;
neither can default to healthy. State expected report values independently of
the projection being tested.

If `principle-observe-operations` is also installed, its
[shared contract](../../principle-observe-operations/references/parity.md),
[JavaScript guidance](../../principle-observe-operations/references/javascript.md),
and [OTel mapping](../../principle-observe-operations/references/opentelemetry.md)
extend this example. This skill's proof does not require those references.
