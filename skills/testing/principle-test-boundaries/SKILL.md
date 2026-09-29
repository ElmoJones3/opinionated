---
name: principle-test-boundaries
description: Choose the narrowest test that preserves the dependency semantics under claim. Mandatory when selecting a direct, boundary, integration, or end-to-end test, or choosing a test double or real dependency.
---

# Use the narrowest faithful boundary

Apply the contract and value boundary in `principle-testing-guidelines` first. Choose the narrowest boundary that proves the required outcome. Do not split a caller operation into smaller claims to avoid exercising its integration.

- **Direct:** call a function, object, reducer, validator, or stream when the claim is fully observable there.
- **Boundary:** exercise serialization, adapter mapping, or an outgoing call. A recording fake is enough when the claim is the handoff itself.
- **Integration:** use a real dependency or faithful harness when correctness depends on its query, transaction, TTL, encryption, serialization, cancellation, protocol, or failure semantics.
- **End to end:** cross the assembled user or system path when the requested behavior depends on the parts working together. Make that path an early implementation target.

Do not mock the semantics under test. Do not require an integration test when a direct or recording boundary test contains the complete claim. Existing tests at a faithful boundary count toward the contract they actually exercise. Add a separate direct, wiring, or integration test only when a required outcome remains unproved; no layer owes its own copy of the same proof.

Treat a substitute as faithful only when the dependency owns it or the same contract tests have been observed against the real dependency. Otherwise state the dependency contract as unproven. A convenient fake does not turn missing semantics into evidence.
