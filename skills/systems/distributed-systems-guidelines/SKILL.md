---
name: distributed-systems-guidelines
description: Choose and apply the required distributed-systems principles. Mandatory when a change creates, relies on, reviews, or diagnoses a correctness or recovery claim across components that can fail independently, including accepted background work, repeated state-changing calls, replicated decisions, multi-resource settlement, or recovery across versions.
---

# Choose the guarantee the work requires

Treat a system as distributed as soon as one participant can continue after another loses contact with it. A web process and its database qualify. So do a worker and a queue, an application and an object store, or a service and an external provider.

Begin with four questions:

1. **What might have happened?** List the histories consistent with each missing, late, repeated, or conflicting observation.
2. **Which facts survive the worker?** Separate process-local convenience from durable recovery state.
3. **How can another worker continue safely?** Name the identity, authority, receiver contract, budget, and evidence recovery relies on.
4. **Where does each guarantee end?** Limit every promise to the resource and time window its mechanism actually controls.

Do not compress `confirmed`, `refused`, `pending`, and `unknown` into a success/failure boolean. Do not let a framework feature stand in for a business guarantee.

## Route the work

Load every principle whose trigger applies:

- Business obligations outlive workers, or runs, steps, attempts, invocations, progress, and outcomes need identities: `principle-model-durable-work`.
- Requests, replies, acknowledgements, timeouts, cancellation, redelivery, or ordering cross a failure boundary: `principle-handle-message-uncertainty`.
- Retry, redelivery, redrive, or a hidden retry layer affects effects, deadlines, cost, or capacity: `principle-bound-retries`.
- Equivalent requests must converge on one effect: `principle-enforce-idempotent-effects`.
- Workers compete, leases expire, failover occurs, or stale writers can resume: `principle-enforce-distributed-authority`.
- A decision depends on replicas, caches, projections, quorum reads, or freshness: `principle-state-consistency-contracts`.
- Several changes are claimed to commit together: `principle-respect-transaction-boundaries`.
- Durable intent must become an effect outside its transaction: `principle-coordinate-external-effects`.
- A durable, audited, replayed, reproduced, or cached result depends on time, randomness, versions, external outcomes, or execution order, or the design claims deterministic or stochastic behavior: `principle-record-effective-inputs`.
- Load, queue growth, recovery traffic, concurrency, latency, or variable cost can exhaust capacity: `principle-operational-control`.
- Durable data or work crosses deployments, migrations, rollback, failover, backup, or restore: `principle-evolve-and-restore-state`.
- Lower-trust input or code receives authority, resources, filesystem access, network access, or secrets: `principle-contain-untrusted-work`.
- Findings, scores, evaluator output, human review, approval, activation, or an operator command become evidence for a separate protected transition or effect: `principle-version-decisions-and-intervention`.

Load `principle-testing-guidelines` for any production behavior or automated proof. Load the domain, pure-transformation, API-boundary, comment, or semantic skills when their independent triggers apply.

Apply only the branch that carries the changed guarantee. Do not introduce a durable workflow, outbox, lease, circuit breaker, sandbox, restore drill, or other mechanism merely because this router or a broad leaf loaded.

## Write the guarantee record

For each important reliability claim the task creates, documents, or reviews, reason through the claim, scope, assumptions, invariant when applicable, enforcement or measurement, failure behavior, and evidence. Use [the guarantee-record reference](references/guarantee-record.md) rather than adjectives such as “safe,” “durable,” or “exactly once” on their own. Put the reasoning in the existing design, code review, test plan, or response as appropriate. Do not create a separate document unless the user or repository requires one.

If the mechanism is supplied by a framework or managed service, name the exact part it owns and design the remaining boundary. Temporal can durably schedule an Activity retry, for example; it cannot make an arbitrary payment API idempotent or undo an Activity effect whose reply was lost.

When the project uses Temporal, read [the Temporal reference](references/temporal.md) before changing Workflow or Activity retry, identity, timeout, heartbeat, cancellation, or external-effect behavior.

## Check the result

- Every accepted obligation has a durable owner and an honest unresolved state.
- Every repeated execution preserves the logical identity its receiver understands.
- Every concurrent write proves current authority at the protected resource.
- Every atomicity, ordering, consistency, and retention claim names its scope.
- Every external effect has a delivery, observation, and repair story.
- Recovery and overload behavior are designed, not left to exception defaults.
- Evidence exercises the actual mechanism and named failure windows.
