# Owned operation examples in Go

These examples illustrate [one shared reporting contract](parity.md). The fixture
service, helper names, attributes, budgets, and types are examples. Use the
project's public API and actual SDK version; do not recreate a private framework.

## What the language changes

Go's `tracer.Start` returns the context containing the new span. Pass that
context to dependencies; retaining only the span or a logger drops the causal
relationship. It does not grant a new lifetime to work whose context was canceled.
Use the existing Go context principle for entry checks and error identity.

Register `defer span.End()` in the function that actually owns the work. If that
function returns a channel while a goroutine continues, transfer finalization to
the producer and join owned children. OTel End reports completion without taking
the business context as a cancellation prerequisite. Concurrent observations still
need isolated state and synchronization.

Use native time values and explicit wire units. JSON-decoding generic numbers
through float64 can lose nanosecond epoch precision; preserve integers or another
exact representation in the declared receiving contract.

## Assert one operation meaning

Exercise a real SDK service span and dependency span for the admitted stale-page
case. Derive a wide completion view from the ended service export, serialize it,
and decode it as the receiver would. Both paths use the same declared reporting
contract. `expectedAssessment` or `expected_assessment` is independently specified
as successful execution, complete result, degraded quality, and a latency miss.

This assertion excerpt uses fixture-local received records and report results;
they are not additional OTel APIs or an Opinionated library:

```go
if dependency.Parent().SpanID() != service.SpanContext().SpanID() {
    t.Fatal("dependency lost its operation parent")
}
if !reflect.DeepEqual(fromSpan, expectedAssessment) ||
    !reflect.DeepEqual(fromReceivedWideRecord, expectedAssessment) {
    t.Fatal("the two views changed the declared operator answer")
}
if serviceCompletionCount != 1 {
    t.Fatal("one invocation produced multiple completions")
}
```

Assert native identity and measured timing as well. Remove a required assessment
field in a separate wire-corruption test and prove the named refusal or unavailable
assessment. Two paths agreeing because both omitted a field is not this proof.

Use local SDK exporters for emission claims. A synthetic span-shaped dictionary
can test a decoder in isolation, but cannot prove context propagation or SDK
emission. Sampling-disabled execution is a separate population proof.

Language API reference: [OpenTelemetry instrumentation](https://opentelemetry.io/docs/languages/go/instrumentation/).
