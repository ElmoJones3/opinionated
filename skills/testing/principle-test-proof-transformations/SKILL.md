---
name: principle-test-proof-transformations
description: Prove exact input-to-output behavior, composition order, failure policy, and non-mutation. Mandatory when testing validators, modifiers, pure calculations, or pipelines.
---

# Prove the transformation

Call the transformation directly with explicit values and pin the complete result that matters.

- Assert exact output for representative inputs and boundaries.
- Assert the original input and reachable mutable members remain unchanged when non-mutation is claimed.
- For a pipeline, prove order, short-circuiting or accumulation, and whether later steps run after failure.
- Pass time, configuration, policy, and randomness as controlled inputs.
- Use `principle-test-proof-failures` for structured rejection evidence.
- Use `principle-test-proof-state-transitions` when the main contract is a legal next state rather than a calculation.

For new behavior, use `principle-test-tdd`. The first red must identify the missing output or pipeline behavior, not fail because setup, compilation, or an earlier guard is wrong.

When available, load the matching Go, Python, or TypeScript reference from `principle-prefer-pure-functional-patterns`. Those references show modifier pipelines, reusable validation rules, exact outputs, short-circuiting, explicit time, and nested non-mutation in the language's normal style.
