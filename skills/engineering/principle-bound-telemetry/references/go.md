# Go examples

These are illustrative assertion excerpts, not standalone tests or a required
application API. Fixture fields, budgets, reasons, and capacities are local choices.

## Example setup

Configure a finite SDK queue and a controlled exporter. Gate an in-flight export,
fill the queue, and exceed its capacity under the declared drop policy. Exercise
export failure and cooperative cancellation separately. Expect the admitted
business result, independently visible loss, bounded queued work, and no active
exports after the claimed cleanup. Remote receipt remains unknown.

## What the language changes

Exporter context cancellation is cooperative. A goroutine may outlive the caller
that stopped waiting, so test both return and resource release where claimed.
Configure the actual batch processor's queue/blocking options and export timeout;
a bounded channel alone does not make an entire telemetry pipeline bounded.

Use a controlled exporter that honors its context and a barrier proving export
started. Join business producers before provider shutdown, and release the test
exporter during cleanup so a failed assertion cannot leak goroutines. Use a bounded
independent health path and run race detection for shared counters or queues.
Check how the SDK exposes queue drops separately from exporter errors. An error
handler alone may not receive overflow evidence; any SDK health-metric integration
must be configured and proved at its actual provider boundary.
Test the meaning of a nil ForceFlush or Shutdown error. A processor can report
export failures separately, and a repeated shutdown call may return before an
earlier timed-out cleanup releases its exporter.

## Assertions at the claimed boundary

```go
if result != expectedBusinessValue || knownLoss == 0 {
    t.Fatal("collection failure replaced business success or stayed invisible")
}
if maximumQueued > configuredCapacity {
    t.Fatal("collection exceeded its declared queue capacity")
}
if !producerJoined || !collectionClosed || activeExports != 0 {
    t.Fatal("cleanup returned without releasing the claimed resources")
}
if receiverCoverage != "unknown" {
    t.Fatal("local cleanup fabricated complete receiver coverage")
}
```

Measure the actual SDK's queue boundary and loss mechanism; distinguish queued,
in-flight, and dropped work. An independent test counter alone does not prove
that a deployed health path exposes loss. Release gated exporters during cleanup
even if an assertion fails. A network exporter needs its own cooperation proof.

If `principle-observe-operations` is also installed, its
[shared contract](../../principle-observe-operations/references/parity.md),
[Go guidance](../../principle-observe-operations/references/go.md),
and [OTel mapping](../../principle-observe-operations/references/opentelemetry.md)
extend this example. This skill's proof does not require those references.
