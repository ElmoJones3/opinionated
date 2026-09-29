---
name: domain-modeling
description: Make business objects own their behavior, construction, invariants, and consequences. Use when creating, changing, reviewing, or diagnosing domain models and their public contracts.
---

# Model domain behavior

A domain owns what an operation means, when it is legal, what changes, and what
follows from it. Callers should express the complete intent without assembling
the model's internal state or restating its rules.

Read the relevant project terms and local contract before changing the model.
Use `semantic-mapping` when establishing or changing terminology or ownership.

## Establish the responsible owner

Identify the object or aggregate whose invariant changes. Its public contract
owns the operation and its required consequences. When several owners
participate, each supplies its own behavior; an application coordinates them.

Keep private representations behind the owner's contract. Do not expose fields,
downcast an interface, copy another owner's internals, or duplicate its
validation algorithm to work around a missing operation. Extend the appropriate
contract within the requested scope. This applies even when two types share a
package. Shared immutable values do not need interfaces just to cross a boundary.

Adapters own transport, storage, policy evaluation, and external integration.
Domains own business decisions and any attribution or policy defaults assigned
to them by the project. A domain-owned document or event may have a serialized
representation without making a business entity a transport or database record.

## Distinguish construction, behavior, and restoration

A complete constructor accepts the caller's construction inputs, validates the
owned model, and returns its complete result. Nested construction belongs to the
owner, not a caller's sequence of internal builders. Follow the project's input
and return conventions.

A bare seed may be an intentional first step in incremental construction.
Distinguish it from a complete value eligible for use or persistence. Commands
enforce the invariants required at their stage; completion enforces the final
contract. Do not make ordinary construction possible only through hydration.

For independently valid aggregates, complete and incremental construction must
represent equivalent caller-controlled state when both paths are provided.
They need not share an algorithm or reproduce generated identities byte for
byte. Bulk construction must not be forced to replay incremental commands.
Children do not independently earn membership or structural changes owned by
their aggregate.

Restoration accepts recorded state through a separate, validated adapter-facing
capability. It preserves identity and history without reissuing creation
consequences. The domain owns the admitted recorded representation and its
invariants; the adapter owns retrieval and storage layout. A transport projection
does not define restoration merely because both representations serialize.

When partial loading is supported, distinguish unknown data from known absence.
The caller selects the data required for its task through the owner's contract.
Those requirements do not waive validation of supplied values. Operations that
need more data must refuse explicitly, not treat unloaded state as empty or
fetch it implicitly.

A declared import format may accept authored lifecycle or version facts when
its domain permits them. Neither restoration nor import is a setter for
bypassing the behavior of an existing object.

## Name behavior and its consequences

A command expresses an actor's intent. A consequence follows from accepted
behavior or an established fact. Let the owner compute it instead of asking
callers to set a derived status, version, or event by hand.

Make accepted inputs, legal starting states, resulting state, required facts,
no-ops, and expected refusals visible in the contract. Whole-object validation
checks valid shape, including restored state; it does not prove that a
transition was earned.

Choose the public API for the domain's use, following its project conventions.
Methods, value-returning commands, and discardable edits can all express valid
behavior. Refusal or event production does not require a modifier pipeline.
Use `principle-prefer-pure-functional-patterns` for calculations and effect
separation, not as a second authority over domain signatures.

Each operation must honor its promised failure boundary. Refusal preserves the
previous accepted state and does not expose tentative consequences. The domain
returns or retains all required consequences using its established contract;
the application owns persistence and delivery.

## Versioned immutable artifacts

When the domain is a semantic snapshot, immutable refers to its definitive
meaning and behavior. Administrative lifecycle actions may remain legal when
the domain says so. A durable Draft status and a temporary Edit are different
concepts.

Put semantic authoring commands on the Edit, not on both Edit and snapshot.
The Edit isolates proposed state from its source and supports inspection before
acceptance. Completion derives the consequences of effective changes, including
version and successor identity where required. It is not a database commit.
Define session consumption and retained-observation behavior explicitly.

This pattern applies to domains whose meaning calls for immutable revisions.
It does not make every entity versioned or require an Edit for ordinary state
changes.

## Prove the caller's task

Use `principle-testing-guidelines` to select necessary evidence for the caller's
task and reuse existing coverage. Use `principle-test-fixtures` for valid,
production-reachable starting states. Exercise construction and transitions
when they belong to the claim; later behavior need not replay unrelated history.

For iterative domains, demonstrate a caller creating, inspecting, correcting,
and accepting or discarding work. Small validator cases cannot substitute for
that narrative. A restored fixture cannot establish that creation or an earlier
transition works.

Language-specific ownership guidance is available when needed:
[Go](references/go.md), [Python](references/python.md), and
[TypeScript](references/typescript.md). These references do not prescribe a
functional framework or replace the project's domain conventions.
Load the matching reference for language-specific work. The Go reference routes
context-bearing operations to the shared context principle.
