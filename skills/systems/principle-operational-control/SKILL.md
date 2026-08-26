---
name: principle-operational-control
description: Keep accepted and recovery work within finite capacity through explicit budgets, backpressure, admission, isolation, and observable objectives. Mandatory when changing acceptance, buffering, concurrency, retry amplification, rate or cost limits, tenant isolation, or overload behavior.
---

# Make overload behavior part of correctness

A queue absorbs a burst; it does not create capacity. When arrival exceeds completion for long enough, queue age and storage grow, callers time out, and retries add more work. Decide how the system behaves before saturation.

## Bound the pressure

Select the changed control: admission and concurrency, retry amplification, rate or cost limits, isolation, circuit breaking, or operating objectives. Do not add every control to every workload.

- Admit new obligations only when their durable storage and service capacity are available.
- Apply backpressure toward the producer instead of hiding indefinite growth inside the system.
- Bound concurrency at each scarce dependency, tenant, and workload class.
- Use rate and cost budgets with explicit scope and accounting for ambiguous in-flight work.
- Isolate unrelated work with a bulkhead—capacity reserved for one dependency, tenant, or workload—when one class can consume everything.
- Shed only work whose contract permits refusal or loss, before acceptance when possible.
- Use circuit breakers to stop wasteful calls during a dependency failure; they do not settle abandoned outcomes or make retries safe.

State whether a limit is process-local, per tenant, per region, or global. Ten calls per process across twenty processes permit two hundred. Use coordinated admission or deliberately allocated local shares when the promise is global.

Validate configured capacity at construction. A closed gate must be an explicit operating mode, not an accidental zero or negative limit. A process-local slot accounts the lifetime of the local adapter call. Releasing it after the adapter returns or local cancellation does not prove that already-sent remote work stopped.

Accepted work needs a durable deferral, cancellation, terminal, or compensation path. A caller deadline does not delete queued work or stop a remote effect. Recovery scanners, redrives, backfills, and nested retries use the same capacity and cost budgets as ordinary traffic.

## Make the behavior observable

Connect logs and traces to stable run, step, attempt, invocation, effect, version, and ownership identities. Use bounded metric labels chosen from small fixed sets rather than unique IDs. Measure queue age, in-flight work, admission refusal, retry amplification, unresolved outcomes, dependency latency, and cost where they carry the operating claim.

Define a service-level indicator by population, measurement point, exclusions, and window. A service-level objective, or SLO, adds a target and response policy. Alerts should name affected behavior and a first diagnostic path. Logs, traces, and dashboards do not replace durable recovery state.

## Coordinate adjacent principles

Use `principle-bound-retries` for retry amplification, `principle-model-durable-work` for accepted work, and `principle-state-consistency-contracts` when distributed limit state may lag.

## Prove it

Load `principle-testing-guidelines`, `principle-test-determinism`, `principle-test-boundaries`, `principle-test-proof-state-transitions`, and `principle-test-execution`. Prove every applicable control: atomic capacity reservation and release, refusal without starting work, scope across instances, recovery-traffic sharing, queued-deadline behavior, circuit probe coordination, or metrics tied to the promised population. Load tests measure the tested environment; they do not prove unlimited future capacity.

## Use the language reference

All four language references must satisfy [the same worked-example contract](references/parity.md).

Read only the reference for the language being changed:

- [TypeScript](references/typescript.md)
- [Go](references/go.md)
- [Python](references/python.md)
- [C++](references/cpp.md)

## Check the result

- Acceptance, deferral, refusal, and shedding are explicit outcomes.
- Capacity and budgets have enforceable scope.
- Recovery work cannot bypass limits.
- Deadlines do not masquerade as cancellation.
- Operational signals answer concrete recovery and objective questions.
