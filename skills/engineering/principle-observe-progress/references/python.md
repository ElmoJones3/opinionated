# Python examples

These are illustrative assertion excerpts, not standalone tests or a required
application API. Fixture fields, budgets, reasons, and capacities are local choices.

## Example setup

Gate an independently running producer before completion. Receive a real SDK live
record while its completion span remains open. Under the fixture's declared
budget, fresh activity without useful advancement means suspected spinning; an
old heartbeat arriving now leaves progress unknown. Cancel and join the producer
without consuming a terminal product event. Expect one completion after exit.

## What the language changes

An async generator starts and resumes on iteration, and can remain suspended at
yield. The application must own aclose or equivalent cleanup when abandoning it.
For an independently running producer, use an asyncio Task and await its actual
exit. A context manager wrapped only around generator creation ends too early.

Gate work with asyncio.Event or a Future and supply controlled source/report
instants. Preserve CancelledError after finalization. Context variables isolate
context bindings, not a mutable progress dictionary stored in one binding.
Capture the operation's OTel context for its live logs. Passing that context to
emission preserves the owner even when a child span is current.

## Assertions at the claimed boundary

```python
self.assertEqual(completed_spans, ())
self.assertEqual(progress.trace_id, running_span.get_span_context().trace_id)
self.assertEqual(progress.span_id, running_span.get_span_context().span_id)
self.assertEqual(progress.sequence, 1)
self.assertEqual(fresh_activity_only.state, "suspected_spinning")
self.assertEqual(delayed_heartbeat.state, "unknown")
producer.cancel()
with self.assertRaises(asyncio.CancelledError):
    await producer
self.assertEqual(len(producer_completions), 1)
```

Assert native span identity and sequence on live evidence, plus retained-record
and concurrent-run isolation. Repeated waits and phase re-entry must preserve the
fixture's declared cumulative budgets. A timeout used as a test guard is not proof
that the producer exited.

If `principle-observe-operations` is also installed, its
[shared contract](../../principle-observe-operations/references/parity.md),
[Python guidance](../../principle-observe-operations/references/python.md),
and [OTel mapping](../../principle-observe-operations/references/opentelemetry.md)
extend this example. This skill's proof does not require those references.
