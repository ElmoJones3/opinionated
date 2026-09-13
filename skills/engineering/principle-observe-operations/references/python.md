# Owned operation examples in Python

These examples illustrate [one shared reporting contract](parity.md). The fixture
service, helper names, attributes, budgets, and types are examples. Use the
project's public API and actual SDK version; do not recreate a private framework.

## What the language changes

Python's `start_as_current_span` context manager activates and normally ends a
span when the with block exits. Keep that scope around the owned operation,
including awaited work. Context propagation into asyncio tasks does not grant
those tasks the parent's completion authority. Explicitly handle thread and
executor boundaries according to the actual runtime integration.

Context managers can automatically record exceptions and set status. Select those
options deliberately when raw exception content is excluded or an expected refusal
has a separate business classification. Preserve cancellation exceptions and
business failures while finalizing evidence. Pure validation keeps its existing
effect boundary.

Python integers preserve nanosecond epoch values, but JSON consumers in other
languages may not. Choose an exact representation at the receiving boundary.

## Assert one operation meaning

Exercise a real SDK service span and dependency span for the admitted stale-page
case. Derive a wide completion view from the ended service export, serialize it,
and decode it as the receiver would. Both paths use the same declared reporting
contract. `expectedAssessment` or `expected_assessment` is independently specified
as successful execution, complete result, degraded quality, and a latency miss.

This assertion excerpt uses fixture-local received records and report results;
they are not additional OTel APIs or an Opinionated library:

```python
self.assertEqual(dependency.parent.span_id, service.context.span_id)
self.assertEqual(from_span, expected_assessment)
self.assertEqual(from_received_wide_record, expected_assessment)
self.assertEqual(len(service_completions), 1)
self.assertIs(returned_page, admitted_page)
```

Assert native identity and measured timing as well. Remove a required assessment
field in a separate wire-corruption test and prove the named refusal or unavailable
assessment. Two paths agreeing because both omitted a field is not this proof.

Use local SDK exporters for emission claims. A synthetic span-shaped dictionary
can test a decoder in isolation, but cannot prove context propagation or SDK
emission. Sampling-disabled execution is a separate population proof.

Language API reference: [OpenTelemetry instrumentation](https://opentelemetry.io/docs/languages/python/instrumentation/).
