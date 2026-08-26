---
name: principle-version-decisions-and-intervention
description: Separate evaluator evidence from the policy that authorizes a durable or sensitive transition, then enforce approvals and operator commands as audited state changes. Mandatory when findings, scores, evaluator output, human review, approval, activation, or an operator command is evidence for a separate protected state change or external effect. Do not invoke for an exact validation rule enforced directly by the transition owner.
---

# Bind decisions to versioned evidence and policy

Evidence, decision, approval, delivery, and activation are separate states. A finding, score, evaluator response, or human review is evidence. Trusted, versioned policy derives the decision that may authorize a transition. An approval authorizes a specific subject and version under that policy; it does not prove the subject was delivered, activated, or produced the intended external result.

An exact rule implemented and enforced by the trusted transition owner may refuse directly. Use the evidence-to-policy split when evidence comes from another component or person, can be uncertain, or must be versioned and audited separately.

Apply the branch the task changes: automated decision, approval and activation, or operator command. Do not add a human gate to an exact rule or make a probabilistic evaluator authoritative merely because it returned `accepted: true`.

Keep each applied branch at the narrowest enforceable boundary the task needs. Represent adjacent stores, evaluators, delivery systems, and capacity controls with their existing interfaces and explicit unverified guarantees; do not build a complete orchestration framework just to demonstrate the principle.

## Derive automated decisions

- Validate evaluator output and bind it to the exact subject, evaluator version, request, and recorded outcome.
- Treat deterministic validators as exact only for the rules they implement. Treat probabilistic evaluators as measurements that can be wrong in both directions.
- Use trusted policy to turn findings, measurements, thresholds, and current state into an allow, refuse, review, or bounded-remediation decision.
- A hard gate blocks the protected transition. A soft gate records or routes evidence without pretending it blocked anything.
- Version the policy, thresholds, and evaluator. Keep a self-reported evaluator decision separate from the derived authoritative decision.
- Bound automatic remediation by attempts, cost, time, and scope, then reevaluate from a new immutable subject version.

When an uncertain evaluator carries the claim, measure both ways it can be wrong: accepting a bad case and rejecting a good one. Check whether scores match observed rates, whether independent reviewers agree when human judgment defines the expected result, whether evaluation cases influenced development, and whether evaluator behavior changes over time. Apply only the checks relevant to the claim.

## Version the decision

Record the approver identity and authority, immutable subject digest or version, requested action, scope, policy version, evidence presented, decision, and time. Compare the approved version again at the effect boundary.

Changing subject bytes creates a new unapproved version unless policy explicitly defines an allowed class of changes. Policy must choose whether approver authority is checked at decision time, again at activation, continuously until use, or through explicit revocation. Invalidate according to that rule when the subject, policy, authority, scope, or required evidence changes. Retain the old decision for history while preventing unauthorized reuse.

A human gate is still a system boundary. Present the exact subject and relevant evidence, resolve what happens when it changes during review, and make refusal or expiry explicit. A signature or attestation is evidence; authorization policy decides whether it is sufficient for this action.

## Make intervention a first-class command

Operators need the current durable state, ownership, attempts, artifacts, uncertainty, and failure reason before acting. Model retry, redrive, skip, cancel, compensate, replace, reopen, and mark-resolved as authorized state transitions with:

- preconditions and current-version checks;
- a new attempt or effect identity where the action creates one;
- the same idempotency, retry, capacity, and transaction rules as automation;
- an append-only audit record of actor, authority, reason, subject version, command, and result, with restricted mutation, integrity protection, and stated retention; and
- an honest unknown state when the command's outcome is ambiguous.

Do not repair work through direct database edits or mutable “approved” flags. Manual does not mean outside the invariants. Redrive re-enqueues eligible work; it does not erase prior attempts or change the meaning of the original obligation.

## Coordinate adjacent principles

Use `principle-record-effective-inputs` for stochastic evaluators and reproducible evidence, `principle-bound-retries` for repeated evaluation or remediation, `principle-operational-control` for evaluator cost and capacity, `principle-state-consistency-contracts` when an observation may be stale but authorizes an effect, `principle-coordinate-external-effects` for delivery and activation observation, `principle-enforce-distributed-authority` for competing operators and workers, `principle-contain-untrusted-work` for evaluator, reviewer, and tool capabilities, and `principle-evolve-and-restore-state` when decisions cross deployment or restore.

## Prove it

Load `principle-testing-guidelines`, `principle-test-boundaries`, `principle-test-proof-state-transitions`, `principle-test-proof-failures`, `principle-test-fixtures`, and `principle-test-execution`. Prove the applicable branch. Automated decisions cover exact evidence-to-decision mapping plus calibration, error tradeoffs, leakage, drift, or bounded remediation when claimed. Approvals cover subject, policy, authority, and activation versions. Interventions cover simultaneous and duplicate commands, ambiguous outcomes, durable audit, and preserved state with no denied effect.

## Use the language reference

All four language references must satisfy [the same worked-example contract](references/parity.md).

Read only the reference for the language being changed:

- [TypeScript](references/typescript.md)
- [Go](references/go.md)
- [Python](references/python.md)
- [C++](references/cpp.md)

## Check the result

- Evaluator evidence never grants itself authority; trusted versioned policy derives the decision.
- Approval names exact immutable content and policy scope.
- Activation rechecks the approved version and current authority.
- Every intervention is an audited command with enforced preconditions.
- Manual actions preserve history and normal effect protections.
- A human decision never becomes a mutable bypass around the system.
