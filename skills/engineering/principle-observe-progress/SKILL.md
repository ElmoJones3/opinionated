---
name: principle-observe-progress
description: Define useful advancement, legitimate waits, and fresh live evidence when instrumenting or reviewing streams, long-running operations, or stall and spin reports. Does not change durable-work or recovery authority.
---

# Observe useful advancement

Define the question a live observer must answer. Activity, useful advancement,
and source freshness are separate facts. A running timer or repeated heartbeat
cannot establish that the operation is accomplishing its task.

This skill owns live evidence within an operation's lifetime. When installed,
`principle-observe-operations` supplies the companion guidance for establishing
its execution boundary and completion contract.

## Choose the useful measure

The operation owner defines phases, units, useful advancement, activity, cadence,
freshness, clock uncertainty, no-progress and phase budgets, and legitimate waits.
These are workload decisions. A fixture's budget is not a deployment SLO.

For a crawler, distinct frontier entries reaching a terminal disposition can be
useful advancement; fetch attempts and discovered URLs are separate activity.
For an inference stream, output advancement and finish reason are measurable;
produced tokens do not establish semantic correctness. An iterative algorithm
needs its own progress or convergence measure, which need not be monotone.

Define what resets each budget. Repeated wait reports do not extend an admitted
wait indefinitely. Returning to a phase does not erase cumulative phase time.
New attempts retain their separate execution identities and do not manufacture
advancement of a durable business obligation.

## Follow the producer

A returned channel, iterator, or stream handle is not producer completion. Put
finalization in the producer's actual exit path, including cancellation or
failure before a final product event can be delivered. Do not require a consumer
to read that event before telemetry can finalize.

Preserve the existing cancellation and backpressure contract. Join local children
owned by the producer. Independent concurrent runs keep separate progress state.
A synchronous wrapper consuming its own stream does not create a second run.
Generated, delivered, acknowledged, and persisted items have different meanings.

Runtime heartbeats and durable checkpoints keep their existing owners. Observation
sampling neither delivers runtime cancellation nor creates a recovery point.
Missing a sample cannot by itself establish worker death or durable work status.

## Export evidence while work is live

Make live evidence available before completion through a suitable signal path.
An event buffered only inside a span until End does not prove live visibility.
A log record can carry native trace/span context for the still-running operation.
Bind each update to the operation it describes. The currently active span may
belong to a dependency while the update describes its parent's progress.

Preserve source time, execution start and identity, sequence, phase, useful work,
activity, and relevant wait evidence. Receiver arrival time is a separate fact.
Copy or otherwise isolate published observations so later producer mutations
cannot rewrite records that another observer retained.

A sampler can advance source age and sequence; it cannot invent useful work.
When evidence is fresh and applicable budgets are known, activity without useful
advancement may justify suspected spinning. Inactivity may justify suspected
stalling. Stale, missing, or clock-ambiguous evidence leaves the conclusion unknown.
These observations support investigation, not automatic retry or cancellation.

## Prove the live distinction

Use deterministic clocks and scheduling. Follow the project's testing strategy,
using `principle-testing-guidelines` when installed.
Observe an exported live record while the producer is still blocked at a controlled
boundary. Assert its native identity and sequence; do not rely on slice order or
an assumed number of timer ticks.

Advance activity without useful work, age the source while delaying delivery,
repeat an admitted wait, and revisit a phase. Assert the exact justified report.
Then finalize or cancel the producer without consuming a terminal product event
and prove one completion. Test retained observations and independent runs.

When installed, use `principle-interpret-observations` for receiving, selection,
and report-time freshness, and `principle-bound-telemetry` for collection budgets
and lost evidence.
Read the applicable example: [JavaScript](references/javascript.md),
[Python](references/python.md), or [Go](references/go.md). These are illustrative
proofs under stated fixture contracts, not requirements to use one stream API.
