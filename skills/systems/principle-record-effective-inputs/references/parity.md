# Worked-example parity contract

- **Scenario:** one recovery decision is deterministic, retry jitter is stochastic, a concurrent schedule admits several legal orders, and a provider outcome is externally controlled.
- **Invariant:** each claim names every effective input it relies on, and replay cannot reach production effects.
- **Identity and state:** exact request artifact or explicitly redacted record, operation and dependency versions, clock value, random sample, schedule evidence, and recorded outcome.
- **Enforcement boundary:** pure decision inputs, versioned artifact storage, controlled scheduler or fault harness, and isolated side-effect sink.
- **Required failures:** hidden clock/configuration, negative or unsupported jitter maximum, non-finite or out-of-range random source, library/version change, uncontrolled ordering, incomplete redaction claim, and unsafe replay route.
- **Required proof:** exact deterministic assertions, inclusive jitter bounds for every accepted input, contract-matched distribution trials only when uniformity is claimed, controlled interleavings, and effect-sink verification.
- **Language freedom:** clock, random, and serialization APIs may vary; the classification and evidence must not.
