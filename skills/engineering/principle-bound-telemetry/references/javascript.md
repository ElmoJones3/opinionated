# JavaScript and TypeScript examples

These are illustrative assertion excerpts, not standalone tests or a required
application API. Fixture fields, budgets, reasons, and capacities are local choices.

## Example setup

Configure a finite SDK queue and a controlled exporter. Gate an in-flight export,
fill the queue, and exceed its capacity under the declared drop policy. Exercise
export failure and cooperative cancellation separately. Expect the admitted
business result, independently visible loss, bounded queued work, and no active
exports after the claimed cleanup. Remote receipt remains unknown.

## What the language changes

Promises do not create a finite queue. Configure the SDK's actual batch limits
and inspect its exporter/flush behavior. Promise.race can bound caller waiting
while a losing export continues holding resources. A timer cannot interrupt a
synchronous exporter blocking the event loop. Test the actual cooperation claimed.
Batch size does not set export concurrency. Exercise forceFlush and shutdown as
well as normal batch processing; flushing queued batches may increase the number
of exports in flight while an earlier export remains blocked.

Use SDK diagnostics or a bounded independent health sink for export failures.
Avoid sending that failure recursively through the same broken path. An immediate
in-memory exporter is a test fixture, not a production recommendation.

## Assertions at the claimed boundary

```js
assert.equal(returnedBusinessValue, expectedBusinessValue);
assert.ok(knownLoss > 0);
assert.ok(maximumQueued <= configuredCapacity);
await producerDone;
await collectionClosed;
assert.equal(activeExports, 0);
assert.equal(receiverCoverage, "unknown");
```

Measure the actual SDK's queue boundary and loss mechanism; distinguish queued,
in-flight, and dropped work. An independent test counter alone does not prove
that a deployed health path exposes loss. Release gated exporters during cleanup
even if an assertion fails. A network exporter needs its own cooperation proof.

If `principle-observe-operations` is also installed, its
[shared contract](../../principle-observe-operations/references/parity.md),
[JavaScript guidance](../../principle-observe-operations/references/javascript.md),
and [OTel mapping](../../principle-observe-operations/references/opentelemetry.md)
extend this example. This skill's proof does not require those references.
