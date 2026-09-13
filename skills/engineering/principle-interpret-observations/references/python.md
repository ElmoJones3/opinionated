# Python examples

These are illustrative assertion excerpts, not standalone tests or a required
application API. Fixture fields, budgets, reasons, and capacities are local choices.

## Example setup

Receive SDK exports and introduce delayed, duplicate, or incompatible records
through the wire boundary. Preserve terminal evidence and source age. In the
population case, two measured completions include one that misses both quality
and latency; tracing is unsampled, combined misses equal one, and receiver
coverage remains unknown. Unsupported versions produce a named refusal.

## What the language changes

A dictionary's get default can collapse missing evidence into a passing value.
Use explicit presence checks and the project's validation/error convention.
Booleans are instances of int in Python, so schema checks must distinguish them
when a sequence or count requires an integer. Copies of nested records are shallow.

Preserve exact time units through serialization and parse versions before applying
expectations. Use a controlled Clock callable for report-time freshness and sample
it after any awaited or blocking authority lookup.

## Assertions at the claimed boundary

```python
self.assertEqual(select(terminal, late_live).kind, "completion")
self.assertEqual(inspect(old_source_arriving_now, report_time).freshness, "stale")
self.assertEqual(population.completed, 2)
self.assertEqual(population.combined_misses, 1)
self.assertEqual(population.coverage, "unknown")
with self.assertRaises(UnsupportedVersion):
    receive(unsupported_version_record)
```

Establish the accepted record through real emission when testing that composition.
After each named refusal, assert the previous accepted evidence is unchanged.
Missing required fields and absent optional assessment have distinct outcomes;
neither can default to healthy. State expected report values independently of
the projection being tested.

If `principle-observe-operations` is also installed, its
[shared contract](../../principle-observe-operations/references/parity.md),
[Python guidance](../../principle-observe-operations/references/python.md),
and [OTel mapping](../../principle-observe-operations/references/opentelemetry.md)
extend this example. This skill's proof does not require those references.
