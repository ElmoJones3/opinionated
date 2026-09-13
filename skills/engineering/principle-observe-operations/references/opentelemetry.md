# OpenTelemetry and wide completion observations

This is the standard-signal binding for projects using OpenTelemetry. It is an
example of applying the portable principles, not an instruction to replace a
project's telemetry stack or install every signal SDK.

## One reporting contract

An ended span already describes one operation with identity, parentage, timing,
attributes, events, links, and status. Enrich the owned operation with the bounded
business evidence its report requires. A wide completion record can be a projection
of that ended span. Application callers do not need a second completion API.
[OTel's trace API](https://opentelemetry.io/docs/specs/otel/trace/api/) defines the
native fields and the lifecycle of recorded span data.

A selected projection is equivalent only for the reporting contract it preserves.
Retain required Resource, instrumentation scope, operation/definition identity,
parent or causal links, times with declared units, and assessment fields. Preserve
unknowns and detect dropped attributes or unsupported versions. A backend offering
two views need not export two records. If a system deliberately exports both,
identify their common origin, deduplicate completion counts, and state each path's
sampling and delivery coverage.

LogRecord is a distinct standard envelope with event and observed timestamps,
body, severity, attributes, and optional native trace/span correlation. It can
represent a projection of completion evidence when the application defines that
mapping. An arbitrary correlated diagnostic does not carry the span's complete
lifetime. See the [logs data model](https://opentelemetry.io/docs/specs/otel/logs/data-model/).

## Keep timing and signals honest

Use the context returned or activated by the SDK for dependent operations. Enrich
installed native instrumentation through its supported binding instead of wrapping
the same invocation in another span. Preserve native protocol status separately
from business completeness, quality, and performance assessments.

Span events belong to the span and are commonly exported with its completion.
For live evidence required before completion, verify an actual live signal path,
such as correlated log SDK emission. A local event or snapshot alone does not
prove that a receiver can observe a running operation.

Record population measurements through the metric SDK's declared population,
independently of retained trace records. Sampling can remove the canonical span
from the receiving dataset without changing what the operation meant. Equivalence
of representations never implies equal delivery coverage. The [trace SDK](https://opentelemetry.io/docs/specs/otel/trace/sdk/)
and [metric SDK](https://opentelemetry.io/docs/specs/otel/metrics/sdk/) define their
separate processing, sampling, and aggregation contracts.

## Bind SDK behavior, then prove it

Choose the actual language SDK and integration versions. Test completed spans,
correlated logs, and measurements through local SDK exporters/readers. An API
facade with no recording SDK can execute without supplying the evidence a report
needs. A log facade likewise needs an actual provider or bridge when emission is
claimed.

Inspect the implementation's export, queue, error, and shutdown contracts. SDK
methods and exporters do not all offer the same deadline or cancellation model.
[OTel error handling](https://opentelemetry.io/docs/specs/otel/error-handling/)
keeps instrumentation errors from breaking the application; bootstrap validation
and an observable bounded failure path remain responsibilities to verify.

Read [the example contract](parity.md) and the relevant language reference.
No private wrapper, receiver framework, or application-wide rollout is implied.
