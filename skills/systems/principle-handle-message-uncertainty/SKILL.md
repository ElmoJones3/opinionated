---
name: principle-handle-message-uncertainty
description: Preserve honest outcomes when requests, replies, acknowledgements, timeouts, or cancellation can be delayed, lost, duplicated, or reordered. Mandatory when code must decide what a missing, late, repeated, or out-of-order request, reply, acknowledgement, timeout, or cancellation means.
---

# Preserve uncertainty across messages

A timeout proves that one participant stopped waiting without an acceptable reply. It does not prove that the receiver did nothing. A cancellation request proves only that cancellation was requested until the receiver confirms the point before which the effect cannot occur.

## Enumerate the possible histories

For every missing response, consider at least: the request never left, was lost, was refused with a lost reply, committed with a lost reply, or is still in progress. Record the resulting knowledge as `confirmed`, `refused`, `pending`, or `unknown`.

Only a receiver result defined by its operation contract may establish stable refusal or absence. A broken connection, intermediary error, elapsed deadline, `429`, or `503` does not do that by itself.

Define what every acknowledgement proves: bytes accepted by a broker, work durably accepted by a receiver, or final effect committed. Do not advance durable state farther than that evidence earns.

## Treat delivery behavior explicitly

- Keep transport delivery identity separate from logical effect identity.
- Expect redelivery when acknowledgement can be lost after commit.
- If source order matters, scope it to one stream or entity and bind sequence numbers to immutable events.
- Detect gaps and exact redeliveries; do not invent a global order the system does not need.
- Commit a consumed-message receipt and its resulting local state together when duplicate application would be unsafe.
- Propagate absolute deadlines, but recheck them before starting work; a deadline does not stop already queued or remote work.

Do not convert unknown into failure merely to simplify a return type. Preserve enough identity and evidence for query, safe redelivery, reconciliation, compensation, or explicit intervention.

## Coordinate adjacent principles

Use `principle-model-durable-work` for the recovery record, `principle-bound-retries` before repeating a call, `principle-enforce-idempotent-effects` when equivalent deliveries must converge, and `principle-coordinate-external-effects` for durable delivery and reconciliation. Use `principle-state-consistency-contracts` when a status or reconciliation read may authorize another effect.

## Prove it

Load `principle-testing-guidelines`, `principle-test-determinism`, `principle-test-boundaries`, `principle-test-proof-state-transitions`, and `principle-test-execution`. Exercise the message behaviors the protocol permits: loss, delay, duplicates, ordering gaps, acknowledgement loss after commit, cancellation/completion races, or restart where present. Assert the recorded knowledge and subsequent permitted action, not merely that an exception occurred.

## Use the language reference

All four language references must satisfy [the same worked-example contract](references/parity.md).

Read only the reference for the language being changed:

- [TypeScript](references/typescript.md)
- [Go](references/go.md)
- [Python](references/python.md)
- [C++](references/cpp.md)

## Check the result

- Missing replies remain unknown unless receiver evidence narrows them.
- Acknowledgements and cancellation results have exact meanings.
- Delivery identity, effect identity, and source sequence are not conflated.
- Deadline and ordering scope are stated.
- Recovery has a safe action for every recorded observation.
