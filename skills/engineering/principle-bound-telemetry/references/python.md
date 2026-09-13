# Python examples

These are illustrative assertion excerpts, not standalone tests or a required
application API. Fixture fields, budgets, reasons, and capacities are local choices.

## Example setup

Configure a finite SDK queue and a controlled exporter. Gate an in-flight export,
fill the queue, and exceed its capacity under the declared drop policy. Exercise
export failure and cooperative cancellation separately. Expect the admitted
business result, independently visible loss, bounded queued work, and no active
exports after the claimed cleanup. Remote receipt remains unknown.

## What the language changes

A timeout on Future.result stops waiting; it does not kill the worker thread.
Exporter deadlines require the actual exporter or transport to cooperate. Avoid
claiming that a batch processor's timeout argument interrupts arbitrary blocking
Python. Document SDK-version-specific shutdown behavior.

Use threading.Event or asyncio primitives to control a failing or blocked export.
Record failure through a bounded independent path. Automatic exception recording
and logging formatters can expose raw exception text; inspect emitted fields.
SDK warnings can be rate-limited. Prove loss counts through a signal that counts
records, and check whether processor metrics account for exporter refusal or only
invocation. These behaviors depend on the installed SDK version.

## Assertions at the claimed boundary

```python
self.assertEqual(returned_business_value, expected_business_value)
self.assertGreater(known_loss, 0)
self.assertLessEqual(maximum_queued, configured_capacity)
self.assertTrue(producer_joined)
self.assertTrue(collection_closed)
self.assertEqual(active_exports, 0)
self.assertEqual(receiver_coverage, "unknown")
```

Measure the actual SDK's queue boundary and loss mechanism; distinguish queued,
in-flight, and dropped work. An independent test counter alone does not prove
that a deployed health path exposes loss. Release gated exporters during cleanup
even if an assertion fails. A network exporter needs its own cooperation proof.

If `principle-observe-operations` is also installed, its
[shared contract](../../principle-observe-operations/references/parity.md),
[Python guidance](../../principle-observe-operations/references/python.md),
and [OTel mapping](../../principle-observe-operations/references/opentelemetry.md)
extend this example. This skill's proof does not require those references.
