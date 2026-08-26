# Worked-example parity contract

- **Scenario:** durable payment intent is delivered, the provider reply is lost, recovery reconciles by complete identity, and policy may create a separately identified refund.
- **Invariant:** local state advances only from identity-bound receiver evidence; compensation never erases or reuses the original effect.
- **Identity and state:** local intent, delivery, receiver effect, and compensation identities; every observation repeats provider, account or tenant, environment, operation, effect key, and request digest; requested, pending, confirmed, refused, unknown, and needs-attention remain distinct.
- **Enforcement boundary:** local outbox transaction, receiver idempotency contract, and authoritative reconciliation lookup each own only their part.
- **Required failures:** crash after local commit, send, receiver commit, acknowledgement, and local confirmation; duplicate delivery; mismatched observation identity; lagging lookup; restore older than provider state.
- **Required proof:** scripted boundary faults plus production-store outbox semantics and the stated provider lookup scope, or explicit unverified claims.
- **Language freedom:** adapter and SQL libraries may vary; the protocol and failure states may not.
