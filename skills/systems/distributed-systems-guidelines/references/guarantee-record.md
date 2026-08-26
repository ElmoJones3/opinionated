# Guarantee record

Use one record for each behavior important enough to call safe, durable, ordered, idempotent, atomic, fresh, available, recoverable, or bounded.

| Field | Required content |
| --- | --- |
| Claim | The user-visible, business, or operating behavior promised. |
| Scope | The operation, identities, resources, deployment, and time window covered. |
| Assumptions | Facts outside the mechanism that must remain true. |
| Invariant | The condition that must never be violated, when the claim is a safety property. |
| Enforcement or measurement | The authoritative mechanism that prevents violation or measures the objective. |
| Failure behavior | The state or signal exposed when safe continuation is impossible. |
| Evidence | Tests, analyses, observations, fault injections, and drills supporting this exact claim. |

## Review it

Reject a record when its enforcement is only a code convention, comment, diagram, log, or test. Those may explain or exercise a mechanism; they do not arbitrate production state.

Separate safety from progress. “At most one capture” does not promise that capture eventually occurs. “Ninety-nine percent of accepted captures settle within ten minutes” needs a measured population, window, and response policy rather than an invariant.

When a dependency owns the mechanism, record its account, environment, configuration, retention, isolation, and failure assumptions. A product name alone is not a contract.

Match evidence to the claim. Direct and integration tests cover the cases and environment that ran. Fault injection covers the named windows reached. Production-path parity establishes that a test used the same adapter, schema, or policy path as deployment. Model checking can exhaust the bounded model and assumptions supplied to it, not every production state. Monitoring records past behavior. A restore claim needs a restore drill.

Record evidence that the intended test ran, the fault hook activated, and removal or breakage of the enforcing mechanism makes the relevant check fail. State any engine, schema, isolation, provider, retention, and configuration assumptions the evidence did not establish.
