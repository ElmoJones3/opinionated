---
name: principle-bound-retries
description: Make retries safe, classified, budgeted, and capacity-aware across every execution layer. Mandatory when adding, changing, reviewing, or diagnosing automated retry, redelivery, redrive, or hidden retry layers that affect effects, deadlines, cost, or capacity.
---

# Bound every repeated execution

A retry trades possible omission for possible duplication. It is safe only when the prior observation and receiver contract permit another equivalent execution.

## Decide before retrying

Classify the prior result:

- Local refusal before a call proves no remote request was made.
- A receiver-defined stable refusal can permit another attempt when policy allows.
- A missing reply, intermediary error, or pending response leaves the effect possible.
- A programmer defect, invariant violation, changed identity, or exhausted protection is not repaired by repetition.

For an unknown outcome, query first when the lookup is authoritative. Otherwise retry only under a receiver-enforced idempotency contract, accept a documented duplicate risk, or stop in an unresolved state. Backoff and jitter spread load; neither makes a non-idempotent effect safe.

## Own the whole retry stack

Inventory every layer that can repeat work: workflow, queue redelivery, application loop, HTTP or database client, proxy, SDK, operator redrive, and transport. Name the layer being retried and bound their composition. Use one authoritative shared budget when all layers can debit it; otherwise allocate nested budgets whose worst-case multiplication stays within the logical limit, or separately cap and measure opaque layers as explicit assumptions.

Immediately before an effectful invocation:

1. reserve the attempt and debit the durable retry or cost budget in one authoritative change;
2. acquire capacity at the required local, tenant, dependency, or global scope;
3. recheck and propagate the absolute deadline; and
4. make one invocation, or account for built-in client retries inside that reservation.

The authoritative mechanism may be a workflow engine's server-side retry state rather than an application table. Do not duplicate its attempt ledger. Add application durability only for a separate business, effect, audit, query, or retention requirement, and still account for retry layers the engine cannot see.

Use a finite attempt, elapsed-time, cost, or risk budget chosen from the operation contract. Exhaustion ends automatic execution for now; it does not rewrite an unknown effect as failure. Poison work enters an explicit terminal, blocked, or `needs_attention` state with its evidence intact.

Temporal Activity retry policies, queue redelivery counts, and SDK retry defaults are mechanisms at particular layers. When Temporal is in use, load `distributed-systems-guidelines` and read its Temporal reference before accepting those defaults.

## Coordinate adjacent principles

Use `principle-handle-message-uncertainty` to classify the prior observation, `principle-enforce-idempotent-effects` for safe equivalent calls, `principle-operational-control` for load and capacity, and `principle-model-durable-work` for attempt history. Use `principle-state-consistency-contracts` when an authoritative lookup decides whether another call is safe.

## Prove it

Load `principle-testing-guidelines`, `principle-test-determinism`, `principle-test-boundaries`, `principle-test-proof-state-transitions`, and `principle-test-execution`. Control clocks and schedules. Prove each behavior the retry protocol permits: classification, the worst-case physical-call bound across layers, budget reservation under concurrency, deadline propagation, backoff bounds where backoff exists, no retry after terminal refusal, and honest behavior after exhaustion.

## Use the language reference

All four language references must satisfy [the same worked-example contract](references/parity.md).

Read only the reference for the language being changed:

- [TypeScript](references/typescript.md)
- [Go](references/go.md)
- [Python](references/python.md)
- [C++](references/cpp.md)

## Check the result

- Each retry is justified by a named observation and receiver guarantee.
- The complete retry stack has a finite, stated worst-case bound.
- Attempts, capacity, deadlines, and costs are reserved before calls.
- Unknown outcomes stay unknown at exhaustion.
- Recovery traffic cannot bypass normal admission controls.
