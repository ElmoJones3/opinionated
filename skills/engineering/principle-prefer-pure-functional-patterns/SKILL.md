---
name: principle-prefer-pure-functional-patterns
description: Prefer explicit, testable value transformations for calculations, validators, reducers, pipelines, and state changes. Mandatory when creating, changing, reviewing, or diagnosing those operations.
---

# Prefer pure functional patterns

Start with a function whose result depends only on its arguments. Pass in every fact it needs, return its decision as a value, and leave the input and external state unchanged.

This skill is a decision tree, not a demand that every operation use the same abstraction. Choose the smallest contract that expresses what the operation owes:

- **Total transformation:** `T -> U` for a calculation or normalization with no expected refusal.
- **Fallible transformation:** `T -> Result[U, E]` for parsing or conversion that may be refused but does not represent a state transition.
- **Rule:** `T -> Problem?` when one reusable constraint needs fail-fast and accumulating evaluators.
- **Reducer:** `(State, AcceptedInput) -> State` for a total fold over inputs that have already been accepted.
- **Modifier pipeline:** `T -> Result[T, E]` when a value change may be refused.
- **Emitting modifier pipeline:** `T -> Result[Change[T, F], E]` when the accepted change also owes ordered domain facts or a change receipt.
- **Stream shell with a pure reducer:** when values arrive over time and subscription, scheduling, cancellation, or resource ownership matters.

Use ordinary calls for one total step and the language's established pipe or flow helper when several total steps form a readable operation. Do not introduce a library for a one-line composition.

If a reducer input may be refused, curry the input into a modifier. If acceptance also owes facts, use an emitting modifier. If a total transformation owes facts without any possible refusal, return `Change[U, F]` directly instead of inventing an error.

## Use one contract per fallible branch

A state-only modifier uses:

```text
Modifier[T, E] = T -> Result[T, E]
Apply(initial, modifiers...) -> Result[T, E]
```

An emitting modifier uses:

```text
Change[T, F] = { value: T, facts: ordered F[] }
EmittingModifier[T, E, F] = T -> Result[Change[T, F], E]
ApplyEmitting(initial, modifiers...) -> Result[Change[T, F], E]
```

`Apply` and `ApplyEmitting` run left to right, stop at the first expected failure, and skip later work. `ApplyEmitting` appends facts in modifier order. Its result carrier stays outside `Change`, so failure exposes neither tentative state nor earlier facts. This is Writer-style accumulation over a fail-fast result, named in domain terms instead of library terms.

When one atomic pipeline contains an existing state-only modifier, use the language reference's canonical lift:

```text
LiftModifier(Modifier[T, E]) -> EmittingModifier[T, E, F]
```

The lifted step returns its next value with no local facts. Lift only independently valid modifiers. A state change and the fact it forces remain one emitting modifier.

Choose the emitting branch only when the operation owes facts. A deliberate no-op returns the unchanged value and no facts unless recording the accepted attempt is itself part of the contract. Facts are domain-owned values, not logs, callbacks, broker messages, or promises of delivery.

Keep required changes and facts inside the modifier that owns the behavior. Callers may compose independently valid modifiers, but they must not assemble half of one domain transition.

## Keep settlement outside the pipeline

An ordinary modifier result may be returned or persisted as state. Emitting pipeline success produces one planned value and its pending facts. The application either returns that complete planned change as a domain receipt or settles the value and facts together. Committed facts may then pass to an in-process or asynchronous delivery adapter.

When emitted facts must become durable with state, pass the complete `Change` to one settlement operation. Do not expose separate save-state and save-facts calls that make dropping half the result easy. A domain receipt reports the planned change; it is not a database commit, broker acknowledgement, or delivery receipt.

Do not send on a channel, emit an event, write a row, call a repository, or publish to a broker inside a modifier. Those effects cannot be discarded if a later modifier fails. A transactional outbox is the default when state and externally delivered messages must become durable together. Delivery, retries, ordering guarantees, deduplication, and idempotency belong to the adapter contract.

## Preserve the purity claim

- Make time, time zones, randomness, configuration, and policy limits explicit inputs.
- Return fresh values. Copy mutable storage reachable through slices, maps, arrays, lists, pointers, dates, or nested objects before changing it.
- Keep expected business refusals in the result carrier. Let programmer defects panic or throw.
- Keep validation of untrusted or hydrated data distinct from an expected behavior refusal.
- Accumulate independent validation problems; fail fast when a later operation depends on the current one succeeding.
- Keep I/O and framework lifecycles around the transformation, never hidden inside it.

A value-returning signature does not prove purity. Closures can read changing globals, copies can share mutable members, and an effect type can still perform effects.

## Prove the selected contract

Load `principle-testing-guidelines`. New behavior uses `principle-test-tdd`; unsettled refactors use `principle-test-characterization`; transformations and both modifier pipelines use `principle-test-proof-transformations`; modifiers and reducers use `principle-test-proof-state-transitions`; every expected refusal uses `principle-test-proof-failures`; settlement uses `principle-test-boundaries` and `principle-test-execution`.

Direct proofs cover exact output, order, first failure, skipped later work, deliberate no-op behavior, and relevant non-mutation. Emitting pipelines also prove the exact ordered facts and that a late failure exposes none. Run the language's static checker when generic contracts carry the proof. Integration tests are required only for guarantees owned by a real boundary, such as one transaction committing state and outbox rows.

When a shared helper is created or changed, its owning package gets the laws for that helper only:

- `Apply`: empty identity, order, first failure, skipped work, and non-mutation.
- `ApplyEmitting`: the `Apply` laws plus ordered facts, no-fact success, and late-failure discard.
- Lift: the successful value with no facts and the unchanged refusal.

Domain tests prove domain behavior; they do not substitute for or repeat generic helper laws. Do not add an unused helper merely to satisfy this rule.

## Use the language reference

Read only the reference for the language being changed:

- [Go](references/go.md)
- [Python](references/python.md)
- [TypeScript](references/typescript.md)

Each reference defines the preferred carriers, helpers, copying rules, emitting strategy, settlement boundary, and worked good and bad examples.

## Check the result

- The selected pattern matches what the operation owes.
- Hidden inputs became arguments or remained in a named effect boundary.
- Pure transformations do not observably mutate their inputs.
- Expected refusals use the language's canonical result carrier.
- Emitting modifiers return ordered domain facts only on complete success.
- Behavior returns required changes and facts together; durable settlement accepts the complete `Change`.
- Persistence and delivery occur after pure planning, with a real transaction when atomic durability is promised.
- Tests prove the selected contract rather than a fixture-shaped imitation of it.
