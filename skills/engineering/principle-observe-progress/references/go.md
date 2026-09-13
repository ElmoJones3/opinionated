# Go examples

These are illustrative assertion excerpts, not standalone tests or a required
application API. Fixture fields, budgets, reasons, and capacities are local choices.

## Example setup

Gate an independently running producer before completion. Receive a real SDK live
record while its completion span remains open. Under the fixture's declared
budget, fresh activity without useful advancement means suspected spinning; an
old heartbeat arriving now leaves progress unknown. Cancel and join the producer
without consuming a terminal product event. Expect one completion after exit.

## What the language changes

A goroutine producing into a channel owns the stream lifetime. Place End in its
exit path and make blocked sends cancellation-aware. A done channel or WaitGroup
joins its completion separately from the product channel. Closing a channel or
returning it from a factory cannot substitute for proving actual producer exit.

Use channels as barriers and an injected clock for progress budgets. Copy owned
slices, maps, or pointer-backed state before publishing snapshots. Run race
detection when concurrent reads and writes are part of the example.
Use the producer operation's derived context when emitting its progress, even
when the code doing the emission is also executing inside a dependency span.

## Assertions at the claimed boundary

```go
if len(exporter.GetSpans()) != 0 {
    t.Fatal("returning the stream ended the producer")
}
if progress.SpanID != runningSpan.SpanContext().SpanID() || progress.Sequence != 1 {
    t.Fatal("live evidence lost its operation identity or sequence")
}
if freshActivityOnly.State != "suspected_spinning" || delayedHeartbeat.State != "unknown" {
    t.Fatal("activity or arrival time replaced useful fresh evidence")
}
cancel()
<-producerDone
if producerCompletionCount != 1 {
    t.Fatal("producer exit did not finalize exactly once")
}
```

Assert native span identity and sequence on live evidence, plus retained-record
and concurrent-run isolation. Repeated waits and phase re-entry must preserve the
fixture's declared cumulative budgets. A timeout used as a test guard is not proof
that the producer exited.

If `principle-observe-operations` is also installed, its
[shared contract](../../principle-observe-operations/references/parity.md),
[Go guidance](../../principle-observe-operations/references/go.md),
and [OTel mapping](../../principle-observe-operations/references/opentelemetry.md)
extend this example. This skill's proof does not require those references.
