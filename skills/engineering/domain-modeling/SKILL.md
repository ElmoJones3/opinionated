---
name: domain-modeling
description: Make business objects own their behavior and valid state. Mandatory when creating, changing, reviewing, or diagnosing domain objects, business rules, state changes, or domain invariants.
user-invocable: false
---

# Model domain behavior

A domain model is the smallest contract that behaves. It owns what may happen, when it may happen, what changes, what else follows, and how failure appears.

Do not start by adding fields or setters. Trace the operation that needs behavior, then put the complete rule on the object whose state or invariant changes.

Before naming or renaming a domain concept, load `semantic-mapping` when it is available and read the existing project terms. Semantic files own the vocabulary. This skill owns the behavior.

## Build the contract

1. Trace the real operation through its caller, current checks, state changes, persistence, and effects.
2. Identify the responsible domain object. It is the thing whose state or invariant changes.
3. Classify each change as a command or consequence.
4. Define its inputs, legal starting states, resulting state, forced effects, and failures.
5. Write those claims as behavioral tests before implementing the model.
6. Give the responsible object a public entry point that owns the complete contract.
7. Keep callers responsible for orchestration. Do not let them restate domain rules.
8. Add whole-object validation for hydration and other paths that bypass normal behavior.
9. Finish only when the implemented object behaves according to the contract.

If several objects change, each object owns its own rules. The caller coordinates their successful results and external effects.

## Distinguish commands from consequences

A command represents an explicit decision by an actor or system. Its entry point checks the state and inputs that make the decision legal.

A consequence occurs because a domain fact happened. Name its entry point for that fact or trigger, then let the object derive the resulting state. Do not expose a shortcut that sets the consequence without earning it.

For every behavior, make these answers visible in code and tests:

- accepted inputs and relevant actor;
- legal and illegal starting states;
- resulting state and forced changes;
- returned value or emitted domain fact; and
- failure when the contract is violated.

## Keep the model independent

- Keep state, behavior, and validation in the same domain-owned package or module.
- Reuse the project's shared identity and lifecycle type instead of creating another one.
- Keep transport names, serialization rules, database annotations, framework objects, and I/O outside the model. Incidental JSON compatibility does not make a type a transport model.
- Pass facts needed for a decision as plain values. Callers perform I/O, obtain time or configuration, and pass the relevant value in.
- Keep validators pure. Prefer behavior that returns a new valid value when the language and project permit it.

Whole-object validation is a backstop, not the primary behavior API. Normal entry points must reject illegal changes before producing a result. Validation catches invalid hydration, direct assignment, and other bypass paths.

## Use the language reference

Read only the reference for the language being changed:

- [Go](references/go.md)
- [Python](references/python.md)
- [TypeScript](references/typescript.md)

Each reference implements the same contract. Adapt its language pattern to the repository's established base object, error types, test framework, and package layout.

## Check the result

- The responsible object owns every legal transition and invariant.
- The domain API exposes commands and consequences, not state-setting shortcuts. Whole validation rejects framework and hydration bypasses.
- Callers load, authorize, call, persist, and publish without duplicating the object's rules.
- Hydration and bypass paths run whole-object validation.
- Tests prove legal behavior, rejected behavior, forced effects, and validation failures through the public contract.
- Validators and transitions avoid I/O and hidden ambient state.

After a successful model establishes settled terms or ownership, load `semantic-mapping` if needed and apply it. If it is unavailable, report the handoff instead of inventing semantic files. Record the vocabulary, not the behavior contract.
