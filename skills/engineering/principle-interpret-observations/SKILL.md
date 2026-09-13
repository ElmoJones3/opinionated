---
name: principle-interpret-observations
description: Preserve evidence meaning when receiving observations, selecting current execution evidence, or calculating operational reports, rates, and coverage. Use for reporting correctness; does not grant authority to settle work or change recovery behavior.
---

# Interpret received evidence

State the operator's question and the evidence needed to answer it. A received
record proves only what its declared contract, source, and coverage support.
When installed, use `principle-observe-operations` for the companion decisions
about the emitting operation itself.

## Receive the actual representation

Decode the evidence that crossed the reporting boundary. Preserve its execution
identity, causal links, source time, actual start/end, ordering, versions, and
assessments, plus the receiver's own arrival time. Do not fill missing wire fields
from an in-process snapshot, a lookup in a test fixture, or invented defaults.

Admit a named representation with explicit supported versions and required fields.
Distinguish absent optional assessment from invalid or truncated required evidence.
Malformed input returns a named refusal and preserves previously accepted evidence.
A newer representation must not silently lose facts through an older decoder.

If a wide completion view derives from a completed span, normalize both through
the same reporting contract. Assert the same execution, timing, result assessment,
and operator conclusion. Shared IDs alone do not prove this equivalence. A
projection that omits required evidence is incomplete, even when it is valid JSON.

## Select evidence for its execution

Define the authority and ordering scope for each source sequence. Preserve source
ordering through delayed and duplicated delivery. A duplicate cannot advance work
or reset freshness. A late live update cannot reopen an ended execution.
Conflicting identity or contradictory terminal evidence requires explicit handling;
arrival order alone must not silently choose the truth.

Keep attempts distinct from their business work identity. Additional runtime
references can enrich an execution only when they preserve its established
identity. Reconciliation creates new evidence under its declared authority.
Observation storage does not become the durable work or transaction authority.

Compute freshness at report time from the source's as-of evidence, including clock
uncertainty. Fetch time and receiver arrival do not refresh old facts. When an
authority lookup is part of the report, sample report time after it returns and
preserve lookup failure, stale truth, and unavailable capability explicitly.

## Preserve populations and expectations

The owner declares result promises, measurements and units, population, exclusions,
window, and applicable expectations. Version changes to observation meaning. Keep component,
operation definition, expectation profile, signal schema, and deployed release
identities distinct. Same-named profiles from different owners cannot merge by name.

Use measurements for their declared population independently of retained traces.
One completion that misses both quality and latency contributes once to a combined
miss count. Define missing-assessment treatment separately; unknown is not success.
Sampled or preferentially retained failure traces are not a population denominator.

Expose source loss, resets, missing assessment, retention, and known delivery
coverage. Local exporter success does not prove receiver completeness. Unknown
coverage limits a rate's interpretation even if its arithmetic is exact.
Derive configured inventory from registered definitions where available, while
keeping configuration, deployment health, and observed traffic distinct.

## Prove the answer from emitted evidence

Follow the project's testing strategy, using `principle-testing-guidelines` when
installed. For an emitting-to-reporting claim, start with
real SDK exports, decode their representation, select records, and calculate the
actual report. Introduce one malformed or reordered transport fact for a named
negative case. Direct interpreter tests may supply explicit records when no export
or transport claim is made.

Exercise degraded success, a latency miss, combined misses, unassessed outcomes,
old source evidence arriving now, duplicated and out-of-order updates, terminal
preservation, incompatible versions, and incomplete coverage where applicable.
Assert the exact answer and its limitations, not merely that fields exist.

When installed, use `principle-observe-progress` for useful-work and wait semantics
and `principle-bound-telemetry` for collection-loss evidence. Conditional language
examples: [JavaScript](references/javascript.md), [Python](references/python.md),
and [Go](references/go.md). Example schemas are local to the proofs.
