# Worked-example parity contract

- **Scenario:** one payment-capture obligation survives a worker that disappears after an authorized invocation may have left.
- **Invariant:** recovery never creates a second obligation or infers the provider effect from execution count.
- **Identity and state:** distinct obligation, step, attempt, invocation, and receiver effect identities; requested, confirmed, refused, unknown, and needs-attention outcomes.
- **Enforcement boundary:** one production-store transaction reserves an attempt bound to the obligation, receiver effect key, and resulting record version; conditional transitions reject stale or cross-obligation reservations.
- **Required failures:** crash before reservation, after reservation, after send, and before local confirmation.
- **Required proof:** pure lifecycle tests plus real production-engine uniqueness and compare-and-set tests. If that engine cannot run, label its guarantee unverified rather than substituting a convenient fake.
- **Language freedom:** use native value types and the repository's existing SQL or workflow library without changing the scenario or claim.
