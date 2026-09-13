---
name: principle-bound-telemetry
description: Bound collection cost and protect business outcomes when configuring or reviewing telemetry fields, cardinality, queues, exporters, sampling, loss reporting, or shutdown. Does not authorize infrastructure deployment or payload capture.
---

# Bound observation cost and loss

Telemetry consumes application and collection resources. Make its admission,
limits, failure behavior, and delivery evidence explicit without turning the
observation path into another unbounded business dependency.

When installed, use `principle-observe-operations` for execution ownership and
`principle-interpret-observations` for what collection evidence permits a report
to conclude. Existing operational-control principles own business admission.

## Configure the collection owner

Initialize shared SDK providers, component definitions, and exporters in the
application's configured owner. Validate definitions and finite limits at
bootstrap. Reuse the project's SDK and integrations; do not introduce a tracing
engine or global-provider replacement merely to follow this skill.

Bound field counts and sizes, metric dimensions, active tracking, queue and batch
capacity, in-flight exports, sampling work, export/flush deadlines, and cleanup. Define limit scope
and overflow behavior. A configuration key is not proof that an exporter honors
a deadline or that a queue remains bounded under pressure.

Keep metric dimensions drawn from admitted finite sets. Stable component and
operation names describe work classes. Trace, request, user, and work identifiers
can correlate individual evidence under access controls; they are not ordinary
metric dimensions. Bound per-record attributes and payload construction too.

## Admit safe evidence

Use explicit field and reason contracts. Exclude credentials, raw queries and
arguments, URLs carrying sensitive data, documents, prompts/responses, vectors,
and uncontrolled exception text from ordinary observations. Identifiers and
references can also be sensitive. Correlation does not confer tenant access.

Apply access, retention, and deletion policy to exported copies and derived views.
Exceptional payload capture needs its own accepted collection contract. Neither
this skill nor an instrumentation task authorizes deploying collectors, changing
retention policy, or enabling capture in an unrelated application.

## Preserve business outcomes under collection failure

Configuration refusal belongs at bootstrap. Once an operation is admitted,
invalid observation reports and export failures remain instrumentation outcomes.
Expose them through a bounded, independently observable health path. Do not
silently ignore loss or replace a business success with a telemetry error.

Full queues or a slow exporter follow the declared drop/backpressure policy.
Business callers must not wait indefinitely on collection. A timeout can stop
waiting without stopping a non-cooperative exporter; do not advertise bounded
resource release without testing the actual exporter contract.

Join producers owned by the application before collection shutdown. Operation
completion and provider cleanup are separate lifetimes. Cleanup may release
abandoned tracking without claiming that the business producer completed.
Specify repeated shutdown and concurrent cleanup behavior when supported.

Track known drops, invalid reports, queue pressure, export outcomes, and abandoned
tracking without recursively depending on the same failing path. Interpret flush
and shutdown results according to the actual API contract. Neither proves exporter
acceptance or remote receipt; exporter success still describes only its handoff.
Verify what each health signal counts. A rate-limited warning is not a dropped-
record count, and a processor handoff may not establish exporter acceptance.
Population measurements remain separate from trace sampling and remain subject
to process loss, export failure, and their own collection limits.

## Prove the pressure boundary

Follow the project's testing strategy, using `principle-testing-guidelines` when
installed. With the actual SDK and a controlled exporter,
exercise queue pressure, a blocked or failing export, cancellation, and shutdown
where the configuration claims those guarantees. Control scheduling with barriers
or faithful clocks. Distinguish a recording exporter test from proof of a real
network exporter's cooperation.

Assert the original business result, observable loss, bounded retained work, and
cleanup at the tested boundary. Verify admitted fields and bounded dimensions on
real emitted signals. Do not claim complete delivery from an empty local queue,
a successful flush, or a passing shared-library test.

Read the matching example: [JavaScript](references/javascript.md),
[Python](references/python.md), or [Go](references/go.md). Fixture capacities and
failure mechanisms illustrate the contract; they are not production defaults.
