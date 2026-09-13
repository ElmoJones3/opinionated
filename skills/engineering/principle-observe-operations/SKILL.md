---
name: principle-observe-operations
description: Establish operation ownership and one coherent completion observation when adding or reviewing instrumentation across logs, traces, or metrics. Use for execution boundaries and outcome meaning; pure calculations and ordinary getters do not require instrumentation.
---

# Observe owned work

An observation identifies which logical component did what, over which lifetime,
and what its evidence permits a reader to conclude. Start with the operation and
its reporting contract. Choose signal representations that preserve that meaning.

## Own the actual execution

Identify the owner, start, and completion before adding instrumentation. A public
service result, transport response, dependency invocation, and durable submission
have different meanings. Private forwarding helpers normally borrow their work
owner's observation. A stream belongs to its producer until producer exit.

Propagate the actual execution context downstream. A logger carrying an ID does
not establish causal parentage or cancellation. Independent children own separate
state. Join local children whose lifetimes belong to the operation before ending
it. Parent completion neither ends remote work nor confirms its effects.

One owner finalizes an execution once, including refusal, cancellation, and
failure. Final reporting remains possible after request cancellation without
restarting abandoned business work. Define abrupt process loss as missing
completion, not a synthetic successful exit. Use the project's context principle
for lifetime checks; do not add I/O to pure domain methods to follow this skill.

## Give completion one meaning

A wide completion observation is the accumulated, structured account of one
finished operation. A completed span can carry that account with native identity,
parentage, timing, attributes, and outcome. Treat its trace view and wide-record
view as projections of the same evidence, governed by the same reporting contract.

When OpenTelemetry is in use, prefer the owned span as the canonical completion
observation. A backend or exporter can expose it as a wide record. Preserve the
contract's required fields and identity in that projection. Do not independently
reconstruct and emit a second completion in each caller. Correlation alone does
not make two independently authored records equivalent.

An individual diagnostic or progress update has its own time and purpose. It can
carry the operation's native trace/span context without becoming another operation
completion. Preserve standard signal semantics, sampling, and delivery behavior.
A trace span and an OTel LogRecord have distinct wire schemas; the operation
meaning is shared. Do not claim that arbitrary logs and spans are interchangeable.

Installed native instrumentation retains ownership of its span and protocol
status. Enrich or bind that operation through its supported contract; do not add
another CLIENT or SERVER span for the same invocation. Application work beyond a
dependency call may have its own operation with a distinct lifetime.

## Declare the result the owner knows

The owner supplies result expectations, allowed degraded modes, measurement
points and units, population, version, and bounded reasons. Instrumentation
validates representation; it does not authorize fallback or judge arbitrary
business quality.

Keep local execution, result completeness, result quality, performance, and
knowledge of effects distinct. A complete read can succeed with stale data and
miss its latency target. Preserve missing assessment. A timeout does not prove
remote refusal, and a successful statement does not prove transaction commit.

Count distinct effects within an explicit inventory, not attempts or descendant
spans. Business work, processing attempts, and observation executions have their
own identities. Work status and settlement remain with their business/runtime
authorities. Later reconciliation supplies new evidence for the same effect;
it does not edit a completed execution.

Diagnostics add an actionable fact with bounded, admitted fields and reasons.
Avoid repeating a propagated error at every layer or copying raw error text and
payloads into telemetry. Instrumentation failures have their own reporting path
and must not replace the admitted business result.

## Compose only the applicable guidance

Each principle can be installed independently. Load available companions only
when their decisions apply:

- Live advancement, legitimate waits, or suspected stalls: `principle-observe-progress`.
- Receiving records, operational reports, populations, or coverage: `principle-interpret-observations`.
- Collection capacity, sensitive fields, export failure, or shutdown: `principle-bound-telemetry`.

Existing domain, context, transaction, retry, and authority principles retain
those decisions. Observing their evidence does not authorize changing them.

## Prove the operational answer

Follow the project's testing strategy, using `principle-testing-guidelines` when
installed. Exercise emitted evidence through receiving
and interpretation when that composition is the claim. Prove the owner count,
causal context, lifetime, and exact result assessment. A populated field or a
manually constructed expected report does not prove that an operator can answer
the question. Limit claims to the tested SDK, adapter, and receiving boundary.

[The shared example contract](references/parity.md) defines the illustrative
questions and assertions. [OpenTelemetry mapping](references/opentelemetry.md)
connects standard signals to one operation meaning. Language examples are
conditional: [JavaScript](references/javascript.md), [Python](references/python.md),
and [Go](references/go.md). Their APIs and fixture choices are examples, not a
required framework or application schema.
