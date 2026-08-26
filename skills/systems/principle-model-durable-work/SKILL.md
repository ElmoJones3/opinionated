---
name: principle-model-durable-work
description: Give recoverable work durable identity, state, progress, attempts, and outcomes independent of its workers. Mandatory when an accepted business obligation must survive the request or process that accepted it, resume after worker loss, or move between workers.
---

# Make work outlive its worker

A worker is a replaceable executor. Its memory, timers, locks, call stack, and local queue disappear with the process. Persist every fact a replacement must know; keep only reconstructable or disposable facts in memory.

## Separate the identities

Model at least these layers when they exist:

- **Obligation or run:** the business work owed, with one durable identity.
- **Step:** one logical stage or separately recoverable effect.
- **Attempt:** one authorized physical execution of a step.
- **Invocation:** one dependency call made by an attempt.
- **Effect identity:** the stable receiver-scoped identity shared by equivalent deliveries.

One obligation may have many attempts and invocations. Attempt count does not reveal effect count. A transport message ID, worker ID, trace ID, and business effect key are not interchangeable.

## Persist recovery facts

Keep intent separate from observation. “Capture requested” records what the system still owes; it does not claim the provider has not captured it. Preserve:

- immutable work and effect identity, including receiver scope and request digest;
- allowed lifecycle state and current version;
- ownership generation when workers compete;
- checkpoints whose meaning and producing operation version are known;
- artifact lineage binding important inputs and outputs to their producing attempt or invocation, operation version, and authority;
- every authorized attempt and its `confirmed`, `refused`, `pending`, or `unknown` outcome; and
- terminal or `needs_attention` decisions with their reason.

Reserve an attempt durably before an invocation that may create an effect. If the worker vanishes after the call may have left, the abandoned attempt is unknown, not absent. Enforce uniqueness and legal transitions in the storage or service that owns the state; an interface or diagram is not enforcement.

Use process-local queues, caches, counters, and progress only when losing them is harmless or durable state can reconstruct them. A heartbeat reports recent contact. A progress signal names useful advancement. Do not substitute either for a durable checkpoint.

When a durable executor already owns orchestration state, use its authority instead of creating a shadow scheduler. Temporal Workflow history and server retry state can own scheduling and Activity attempts. Add application records only for business identity, externally visible effects, audit or query needs, or retention that the workflow history does not provide.

## Coordinate adjacent principles

Use `principle-handle-message-uncertainty` for missing results, `principle-bound-retries` for repeated execution, `principle-enforce-distributed-authority` for competing workers, and `principle-evolve-and-restore-state` when old durable records meet new code. Use `domain-modeling` for legal lifecycle behavior and storage constraints for concurrency invariants.

## Prove it

Load `principle-testing-guidelines`, `principle-test-proof-state-transitions`, `principle-test-proof-failures`, and `principle-test-execution`. Exercise worker loss before reservation, after reservation, after invocation, and around each durable transition. Prove a replacement uses the same obligation and effect identity and never infers an effect from an attempt count.

## Use the language reference

All four language references must satisfy [the same worked-example contract](references/parity.md).

Read only the reference for the language being changed:

- [TypeScript](references/typescript.md)
- [Go](references/go.md)
- [Python](references/python.md)
- [C++](references/cpp.md)

## Check the result

- Required facts survive loss of any one worker.
- Logical work, executions, messages, and effects have distinct identities.
- Intent, observation, and uncertainty are different states.
- Attempts are authorized before calls and retained afterward.
- Illegal, stale, and terminal transitions are refused by the authority that stores them.
