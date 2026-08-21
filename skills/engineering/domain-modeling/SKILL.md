---
name: domain-modeling
description: Make business objects own their behavior and valid state. Mandatory when creating, changing, reviewing, or diagnosing domain objects, business rules, state changes, or domain invariants.
user-invocable: false
---

# Model domain behavior

A domain model is the smallest contract that behaves. It owns what may happen, when it may happen, what changes, what else follows, and how failure appears.

Make illegal states unreachable through ordinary behavior APIs. A schema can reject an impossible shape and still admit a valid state that was never earned. Constructors establish legal initial states. Domain behavior earns later states. Hydration restores and validates existing state, but it does not earn a transition. Keep hydration off the application-facing API when the language can enforce that boundary; otherwise make the bypass explicit and adapter-only by architecture.

Before naming or renaming a domain concept, load `semantic-mapping` when it is available and read the existing project terms. Semantic files own the vocabulary. This skill owns the behavior.

## Build the contract

1. Trace the real operation through its caller, checks, state changes, persistence, and effects.
2. Identify the responsible domain object: the thing whose state or invariant changes.
3. Classify each change as a command or consequence.
4. Define its inputs, legal starting states, resulting state, forced effects, facts, and failures.
5. Load `principle-testing-guidelines`, choose the proof skills those claims require, and write the behavioral tests before the model.
6. Load `principle-prefer-pure-functional-patterns`. Give the object one entry point with the smallest complete contract: a total function or direct `Change` when it cannot refuse, a modifier when it may refuse, and an emitting modifier when refusal and domain facts both apply.
7. Keep callers responsible for orchestration, not for restating domain rules.
8. Add whole-object validation for hydration and other paths that bypass normal behavior.
9. Finish only when the implemented object behaves according to the contract.

If several objects change, each owns its own rules. The application computes all pure results before writes, then coordinates persistence and external effects. Use a transaction or unit of work when the operation promises atomic persistence.

## Distinguish commands from consequences

A command represents an explicit decision by an actor or system. Its entry point checks the state and inputs that make the decision legal.

A consequence occurs because a domain fact happened. Name its entry point for that fact or trigger, then let the object derive the result. Do not expose a shortcut that sets the consequence without earning it.

For every behavior, make these answers visible in code and its domain proofs:

- accepted inputs and any actor or policy relevant to legality;
- legal and illegal starting states;
- resulting state and forced changes;
- returned value and ordered domain facts; and
- exact expected failure when the contract is violated.

## Make the legal path the easy path

Use factories or validated constructors for initial values. Use a separate validated hydration entry point for stored values. Do not use hydration, direct construction, schema parsing, setters, public state fields, or raw copies to manufacture an earned state.

Normal fallible behavior uses one of the shared pure-pattern contracts:

```text
Modifier[T, E] = T -> Result[T, E]
EmittingModifier[T, E, F] = T -> Result[Change[T, F], E]
```

Each successful entry point returns one complete valid value and every fact forced by that behavior. Failure exposes no partial state or tentative facts. A deliberate no-op is explicit. The behavior cannot return changed state without its forced facts. When those facts must be durable, the application passes the complete `Change` to one settlement operation.

Expected business refusals belong in the result. Invalid untrusted or hydrated data belongs in whole-object validation. An invariant failure after a modifier received valid inputs is a programmer defect, not another business outcome.

## Keep the model independent

- Keep state, behavior, and validation in the same domain-owned package or module.
- Reuse the project's shared identity and lifecycle type.
- Keep transport names, serialization rules, database annotations, framework objects, and I/O outside the model.
- Pass facts needed for a decision as plain values. Obtain time, configuration, authorization, and external data before calling the model.
- Keep validators and modifiers pure. Return fresh values and immutable domain facts.
- Map domain facts to integration messages outside the model.

Whole-object validation is a backstop, not the behavior API. It catches invalid hydration and bypass paths. It cannot prove that a structurally valid transition was earned.

## Use the language reference

Read only the reference for the language being changed:

- [Go](references/go.md)
- [Python](references/python.md)
- [TypeScript](references/typescript.md)

Each reference shows how its ecosystem closes construction, earns later states, validates hydration, and selects the state-only or fact-emitting pipeline without importing wire concerns.

## Check the result

- The responsible object owns every legal transition and invariant.
- Constructors expose only legal initial states; hydration validates without acting as behavior.
- Ordinary behavior APIs make illegal and unearned states unreachable; any unavoidable exported hydration path is an explicit, validated adapter capability.
- Each success includes every forced state change and domain fact; durable settlement accepts them together.
- Each refusal preserves the original value and exposes no tentative facts.
- Callers load, authorize, call, settle, and publish without duplicating domain rules.
- Domain proofs cover legal behavior, exact refusals, forced effects, facts, and hydration backstops through the public contract.
- Validators and transitions avoid I/O and hidden ambient state.

After a successful model establishes settled terms or ownership, load `semantic-mapping` if needed and apply it. Record the vocabulary, not the behavior contract.
