---
name: principle-test-proof-derived-results
description: Prove behavior-bearing data produces its intended calculation, projection, traversal, score, series, or aggregate. Mandatory when a model feeds a derived result.
---

# Prove the consequence

First classify the data:

- **Shape-only:** stored and returned without driving a calculation. Validation and boundary proofs are enough. Do not add a getter test that repeats assignment.
- **Behavior-bearing:** read downstream to compute, derive, project, traverse, normalize, score, or aggregate. It owes a consequence proof in addition to validation.

For behavior-bearing data, build a recognizable instance through the production path, compute what a real consumer needs, and assert a faithful result. Cover meaningful variants and axes that change the result.

Validation proves that data is well formed. It does not prove that the representation can perform its job. If the model cannot produce the claimed consequence without invented values or an impossible fixture, keep the test red and report the design gap.

Load `domain-modeling` when the result belongs on a business object. Load `principle-test-proof-transformations` when the consequence is a pure calculation.
