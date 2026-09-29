---
name: principle-test-proof-derived-results
description: Prove required consumer results from behavior-bearing data. Mandatory when a requested change affects a model's downstream calculation, projection, traversal, score, series, or aggregate.
---

# Prove the consequence

Apply the contract and value boundary in `principle-testing-guidelines`. Start with the result the actual consumer requires, then classify the data:

- **Shape-only:** stored and returned without driving a calculation. Reuse existing validation and boundary coverage. Do not add a getter test that repeats assignment.
- **Behavior-bearing:** read downstream to compute, derive, project, traverse, normalize, score, or aggregate. Evidence must establish the required consumer result. An existing caller test can supply it; separate validation and consequence suites are not mandatory.

For a required result that existing evidence does not establish, use a production-reachable instance, exercise the operation that computes what the consumer needs, and assert that result. Add variants only for distinct required outcomes that remain unproved. Apply `principle-test-fixtures` to decide which construction steps belong in the claim.

Validation proves that data is well formed. It does not prove that the representation can perform its job. If the model cannot produce the claimed consequence without invented values or an impossible fixture, keep the test red and report the design gap.

Load `domain-modeling` when the result belongs on a business object. Load `principle-test-proof-transformations` when the consequence is a pure calculation.
