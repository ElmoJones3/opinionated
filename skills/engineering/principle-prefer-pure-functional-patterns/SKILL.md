---
name: principle-prefer-pure-functional-patterns
description: Prefer explicit, testable value transformations for calculations, validators, reducers, pipelines, and state changes. Mandatory when creating, changing, reviewing, or diagnosing those operations.
---

# Prefer pure functional patterns

Start with a function whose result depends only on its arguments. Pass in every fact it needs, return a new value or an explicit failure, and leave the input and external state unchanged.

This is a preference for testable code, not a ban on state. I/O, framework lifecycles, live streams, caches, concurrency, and resource ownership require state or effects. Keep that machinery where it is needed and extract the decision or transformation into a pure function when possible.

## Shape the transformation

- Make time, time zones, randomness, configuration, and policy limits explicit inputs.
- Return a new value. Do not mutate the caller's object or storage reachable through its slices, maps, arrays, lists, or nested objects.
- Compose small transformations in a visible order. State whether failure stops, accumulates, retries, or cancels later work.
- Represent reusable rules and failures as data when several callers or execution policies need them.
- Keep I/O and framework callbacks around the transformation. Do not hide them inside it.

A value-returning signature does not prove purity. Closures can read changing globals, copies can share mutable members, and stream subscription still owns effects.

Do not introduce a pipeline helper, custom result type, immutable collection library, or observable abstraction when ordinary language features already make the operation clear. Prefer the repository's established conventions.

## Prove the behavior directly

For new behavior, write the smallest input, output, or failure test first. Before refactoring existing behavior, characterize what must remain true. Prove the exact output for known inputs and the failure or ordering behavior that matters. When aliasing is possible, also prove that the input and its nested mutable values remain unchanged.

If stateful code is necessary, test its pure decision function separately from the stateful adapter. Give the adapter a focused boundary test. Use an integration test when correctness depends on the real external system.

## Use the language reference

Read only the reference for the language being changed:

- [Go](references/go.md)
- [Python](references/python.md)
- [TypeScript](references/typescript.md)

Each reference applies the same preference using the language's normal error, copying, date, and composition patterns.

## Check the result

- Every hidden input became an argument or remained in a named effect boundary.
- Pure transformations return new values without observable mutation.
- Composition order and failure behavior are visible.
- Stateful machinery exists for a concrete lifecycle, I/O, timing, concurrency, or ownership need.
- Direct tests prove output, failure, and relevant non-mutation behavior.
