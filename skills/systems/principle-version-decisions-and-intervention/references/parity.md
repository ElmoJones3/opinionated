# Worked-example parity contract

Every branch shares one invariant: evidence never authorizes itself, and every protected action is bound to exact subject, policy, authority, and durable history. Implement each claimed branch separately.

## Automated evidence

- **Scenario:** external or uncertain evaluator evidence produces a trusted hard or soft decision.
- **Enforcement:** boundary validation followed by versioned trusted policy over subject, evaluator procedure, findings or measurements, threshold, and current state; the resulting decision retains both evaluator and policy versions.
- **Failures and proof:** malformed or self-reported decisions, threshold edges, accepting bad cases, rejecting good cases, and applicable leakage, drift, or bounded-remediation limits.

## Approval and activation

- **Scenario:** reviewed bytes may activate under a policy that states when approver authority is checked.
- **Enforcement:** immutable subject digest, policy and approver identity, conditional local transition or durable outbound intent, and append-only audit; external activation remains another boundary.
- **Failures and proof:** subject, policy, evidence, or authority change; stale approval; duplicate activation; and identity-bound observation of the external result.

## Operator command

- **Scenario:** an authorized operator redrives one blocked obligation.
- **Enforcement:** stable command identity, actor authority, expected state version, new attempt or effect identity where needed, normal budgets and effect protections, and append-only audit.
- **Failures and proof:** concurrent or duplicate command, stale state, denied effect, and ambiguous command outcome without erased history.

Hashing and evaluator libraries may vary. The evidence-decision-authority split may not.
