# JavaScript and TypeScript examples

These are illustrative assertion excerpts, not standalone tests or a required
application API. Fixture fields, budgets, reasons, and capacities are local choices.

## Example setup

Gate an independently running producer before completion. Receive a real SDK live
record while its completion span remains open. Under the fixture's declared
budget, fresh activity without useful advancement means suspected spinning; an
old heartbeat arriving now leaves progress unknown. Cancel and join the producer
without consuming a terminal product event. Expect one completion after exit.

## What the language changes

A ReadableStream, async iterator, and producer promise have different lifetimes.
For the example, expose a producer-completion promise or the runtime's equivalent
so the test can join it. Abort an actual producer through AbortController. An
async generator can remain suspended at yield; breaking consumption needs the
iterator's closure contract. Put finalization around the producer, not the factory.

Use a deferred promise as a work gate and a controlled clock for evidence ages.
Do not use Promise.race alone to claim that its losing producer stopped. Keep
per-run data isolated across concurrent promises; object spread is shallow.
Capture the operation's OTel context for its progress records. Looking up the
active context later can attach the parent's update to a currently active child.

## Assertions at the claimed boundary

```js
assert.equal(completedSpans.length, 0);
assert.equal(receivedProgress.traceId, runningSpan.spanContext().traceId);
assert.equal(receivedProgress.spanId, runningSpan.spanContext().spanId);
assert.equal(receivedProgress.sequence, 1);
assert.equal(reportFreshActivityOnly.state, "suspected_spinning");
assert.equal(reportDelayedHeartbeat.state, "unknown");
controller.abort();
await producerDone;
assert.equal(completionsForProducer.length, 1);
```

Assert native span identity and sequence on live evidence, plus retained-record
and concurrent-run isolation. Repeated waits and phase re-entry must preserve the
fixture's declared cumulative budgets. A timeout used as a test guard is not proof
that the producer exited.

If `principle-observe-operations` is also installed, its
[shared contract](../../principle-observe-operations/references/parity.md),
[JavaScript guidance](../../principle-observe-operations/references/javascript.md),
and [OTel mapping](../../principle-observe-operations/references/opentelemetry.md)
extend this example. This skill's proof does not require those references.
