# Worked-example parity contract

- **Scenario:** concurrent equivalent requests reach a receiver-owned payment-ledger operation.
- **Invariant:** one receiver-scoped identity maps to at most one ledger effect and one authoritative response for one canonical request meaning.
- **Identity and state:** receiver scope, stable key, canonical-request version and digest, pending or committed effect, and stored response.
- **Enforcement boundary:** one receiver transaction or equivalent protocol arbitrates identity, applies the receiver-owned effect, and stores the response. It never wraps an unrelated external provider call.
- **Required failures:** concurrent first calls, equivalent replay, changed payload, crash windows, pending result, and reuse after normal retention.
- **Required proof:** the production store's uniqueness and isolation plus the written late-arrival contract, or a clearly unverified dependency claim.
- **Language freedom:** hashing and SQL libraries may vary; canonicalization, scope, and atomic receiver behavior may not.
