# TypeScript

Evidence, policy decision, approval, local activation intent, and external activation are different states. Keep the examples separate.

## Automated evidence

```ts
/** EvaluatorEvidence is validated data; its self-reported decision has no authority. */
interface EvaluatorEvidence { /** subjectDigest binds the evaluated bytes. */ readonly subjectDigest: string; /** evaluatorVersion identifies the measurement procedure. */ readonly evaluatorVersion: string; /** riskScore is a validated finite value from zero through one. */ readonly riskScore: number; /** suggestedAllow remains diagnostic and is ignored by policy. */ readonly suggestedAllow: boolean; }
/** Decision records what trusted policy derived from evidence and current state. */
interface Decision { /** kind controls the local protected transition. */ readonly kind: "allow" | "refuse" | "review"; /** evaluatorVersion binds the decision to its measurement procedure. */ readonly evaluatorVersion: string; /** policyVersion fixes thresholds and gate behavior. */ readonly policyVersion: string; /** subjectDigest prevents reuse for changed content. */ readonly subjectDigest: string; }
/** deriveDecision, not the evaluator, owns gate authority. */
function deriveDecision(evidence: EvaluatorEvidence, threshold: number, policyVersion: string): Decision {
  if (!Number.isFinite(evidence.riskScore) || evidence.riskScore < 0 || evidence.riskScore > 1) throw new RangeError("risk score outside [0,1]");
  if (!Number.isFinite(threshold) || threshold < 0 || threshold > 1) throw new RangeError("policy threshold outside [0,1]");
  return { kind: evidence.riskScore <= threshold ? "allow" : "review", evaluatorVersion: evidence.evaluatorVersion, policyVersion, subjectDigest: evidence.subjectDigest };
}
```

State whether this is a hard gate or a soft recorded signal. If evaluator uncertainty carries the claim, measure false acceptance and false rejection on held-out cases, plus applicable calibration, reviewer agreement, leakage, drift, and remediation bounds.

## Approval and activation

```ts
import { createHash } from "node:crypto";

/** Approval binds actor authority and policy to immutable subject bytes. */
interface Approval { /** approvalId supports idempotent local settlement. */ readonly approvalId: string; /** subjectDigest identifies reviewed bytes. */ readonly subjectDigest: string; /** policyVersion identifies approval rules. */ readonly policyVersion: string; /** approverId names the accountable actor. */ readonly approverId: string; /** scope names the exact allowed action. */ readonly scope: "activate"; }
/** ActivationStore owns one local transaction for intent, state, and append-only audit. */
interface ActivationStore { /** recordIntentIfCurrent rechecks subject, policy, authority, and version before local commit. */ recordIntentIfCurrent(approval: Approval, currentDigest: string, expectedVersion: number): Promise<"recorded" | "stale_or_denied" | "unknown">; }
/** subjectDigest hashes exact reviewed bytes with the platform crypto library. */
function subjectDigest(bytes: Uint8Array): string { return createHash("sha256").update(bytes).digest("hex"); }
```

The store may atomically record a durable outbound activation intent and audit entry. The external activation happens later and needs its own idempotency, observation, and recovery protocol. It is never inside that local audit transaction.

## Operator redrive

```ts
/** RedriveCommand identifies one authorized intervention and expected durable state. */
interface RedriveCommand { /** commandId makes duplicate delivery idempotent. */ readonly commandId: string; /** actorId is checked for current redrive authority. */ readonly actorId: string; /** obligationId names blocked work. */ readonly obligationId: string; /** expectedVersion rejects stale operator views. */ readonly expectedVersion: number; /** newAttemptId preserves prior attempts. */ readonly newAttemptId: string; /** reason is retained in append-only audit. */ readonly reason: string; }
/** InterventionStore applies normal budget, authority, version, and effect protections. */
interface InterventionStore { /** redrive records command, new attempt, enqueue intent, and audit in one local transaction. */ redrive(command: RedriveCommand): Promise<"accepted" | "duplicate" | "stale_or_denied" | "unknown">; }
```

`unknown` triggers lookup by `commandId`; it never justifies another differently identified intervention. Redrive appends a new attempt and leaves earlier failures intact.

## Proof

Test exact threshold edges and prove `suggestedAllow` cannot change the decision. Change subject bytes, policy, evidence, and authority between review and activation. Use the production store for conditional local intent plus audit, duplicate activation, simultaneous redrives, stale versions, and ambiguous commit outcomes. Reconcile external activation by complete identity. Mark evaluator quality, audit immutability, or external observation guarantees unverified when their real evidence or dependency is unavailable.
