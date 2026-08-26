---
name: principle-record-effective-inputs
description: Expose or retain every input that can change a result, and match evidence to deterministic, stochastic, concurrent, or externally controlled behavior. Mandatory when a durable, audited, replayed, reproduced, or cached result depends on time, randomness, versions, external outcomes, or execution order, or when a deterministic or stochastic contract is claimed.
---

# Make variable inputs visible

An effective input is anything that can change the result: explicit arguments, clock readings, random choices, configuration, policy, operation and dependency versions, request assembly, external responses, mutable state, and relevant execution order.

## Classify the contract

- **Deterministic:** the same complete effective input owes the same result.
- **Stochastic:** the operation intentionally samples from a named distribution or random source.
- **Concurrent:** several schedules may be legal without assigning probabilities to them.
- **Externally controlled:** another system chooses an outcome the caller cannot recreate.
- **Uncontrolled nondeterminism:** variation exists but the system neither controls nor records its cause.

Move time, randomness, configuration, and policy into explicit inputs where practical. Define ordering for collections whose iteration order must not change the result. Record values that cannot be controlled but matter to audit, recovery, or replay.

When exact replay matters, retain the final request after defaults, normalization, encoding, truncation, and replay-relevant headers, subject to security and retention policy. A redacted request is diagnostic evidence, not proof of exact bytes. Store accepted externally controlled or stochastic outcomes immutably when history matters.

Record operation, dependency, runtime, artifact, and policy versions that participate in the result. A random seed alone does not freeze generator algorithms, parallel schedules, floating-point behavior, libraries, or external services.

Replayability means the procedure can run again; reproducibility means it yields the same result under stated conditions. Isolate or replace side effects during replay so diagnosis cannot repeat production effects.

## Match evidence to the claim

- Deterministic behavior: assert exact input-to-output results.
- Stochastic behavior: test bounds, invariants, distributional properties, and repeated trials appropriate to the claim.
- Concurrent behavior: control schedules and inject faults around named atomic windows.
- External behavior: preserve the observation and test the adapter and decision separately.

Use `principle-test-determinism` to control test inputs and schedules. Do not force a stochastic contract into one mocked exact output and call it proven.

Use `principle-coordinate-external-effects` whenever replay could reach a real effect. Use a side-effect sink or isolated environment rather than relying on a “replay” flag inside production adapters.

## Use the language reference

All four language references must satisfy [the same worked-example contract](references/parity.md).

Read only the reference for the language being changed:

- [TypeScript](references/typescript.md)
- [Go](references/go.md)
- [Python](references/python.md)
- [C++](references/cpp.md)

## Check the result

- Every result-changing input is explicit, fixed, recorded, or named as a limitation.
- Deterministic, stochastic, concurrent, and external claims remain distinct.
- Request records say whether they are exact or redacted.
- Replays cannot repeat production effects.
- Tests provide evidence appropriate to the contract rather than convenient fixtures.
