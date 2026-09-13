# Owned operation examples in JavaScript and TypeScript

These examples illustrate [one shared reporting contract](parity.md). The fixture
service, helper names, attributes, budgets, and types are examples. Use the
project's public API and actual SDK version; do not recreate a private framework.

## What the language changes

JavaScript uses a configured context manager to preserve active spans through
promises and callbacks. `startSpan` alone does not activate its result.
`startActiveSpan` scopes activation, but the owner still ends the span. Await
owned asynchronous work inside try/finally; returning a promise without awaiting
it can end the span before that work settles. AbortSignal is the application's
cancellation mechanism and is not supplied by OTel context propagation.

Use `AsyncLocalStorageContextManager` or the application's actual configured
manager for a Node example. Browser context and automatic instrumentation need
proof in their actual runtime. Workers and message transports require deliberate
propagation. TypeScript's types do not validate received telemetry at runtime.

SDK times can be high-resolution tuples. Preserve units and precision when
projecting; do not squeeze nanosecond epoch values into an imprecise Number.

## Assert one operation meaning

Exercise a real SDK service span and dependency span for the admitted stale-page
case. Derive a wide completion view from the ended service export, serialize it,
and decode it as the receiver would. Both paths use the same declared reporting
contract. `expectedAssessment` or `expected_assessment` is independently specified
as successful execution, complete result, degraded quality, and a latency miss.

This assertion excerpt uses fixture-local received records and report results;
they are not additional OTel APIs or an Opinionated library:

```js
assert.equal(service.parentSpanContext?.spanId, caller.spanContext().spanId);
assert.equal(dependency.parentSpanContext?.spanId, service.spanContext().spanId);
assert.deepEqual(fromSpan, expectedAssessment);
assert.deepEqual(fromReceivedWideRecord, expectedAssessment);
assert.equal(completionsForService.length, 1);
```

Assert native identity and measured timing as well. Remove a required assessment
field in a separate wire-corruption test and prove the named refusal or unavailable
assessment. Two paths agreeing because both omitted a field is not this proof.

Use local SDK exporters for emission claims. A synthetic span-shaped dictionary
can test a decoder in isolation, but cannot prove context propagation or SDK
emission. Sampling-disabled execution is a separate population proof.

Language API reference: [OpenTelemetry instrumentation](https://opentelemetry.io/docs/languages/js/instrumentation/).
