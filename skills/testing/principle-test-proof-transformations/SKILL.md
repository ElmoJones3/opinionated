---
name: principle-test-proof-transformations
description: Prove exact input-to-output behavior, composition order, failure policy, and non-mutation. Mandatory when testing validators, modifiers, pure calculations, or pipelines.
---

# Prove the transformation

Apply the contract and value boundary in `principle-testing-guidelines`. Reuse tests that already exercise the transformation and establish its required result. Add direct cases with explicit values only for required outcomes that remain unproved; a helper or pipeline does not automatically need its own suite.

- Assert exact output for required inputs and boundaries not already covered by sufficient evidence.
- Assert the original input and reachable mutable members remain unchanged when non-mutation is claimed.
- For a pipeline, prove its required order and failure policy, including short-circuiting, accumulation, or whether later steps run after failure when those belong to the contract.
- Pass time, configuration, policy, and randomness as controlled inputs.
- Use `principle-test-proof-failures` for structured rejection evidence.
- Use `principle-test-proof-state-transitions` when the main contract is a legal next state rather than a calculation.

For new behavior, use `principle-test-tdd`. The first red must identify the missing output or pipeline behavior, not fail because setup, compilation, or an earlier guard is wrong.

Consult the matching language reference in `principle-prefer-pure-functional-patterns` when language-specific copying, error, or composition choices affect the proof. Those references explain ownership and effect boundaries; they do not require a modifier pipeline or generic result carrier. Test the operation's existing contract rather than reshaping its API to fit a test pattern.
