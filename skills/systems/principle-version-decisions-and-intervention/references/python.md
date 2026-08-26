# Python

Evidence, trusted decision, approval, local intent, and external activation remain separate states.

## Automated evidence

```python
"""Bind protected changes to trusted policy and durable history."""

from dataclasses import dataclass
import math
from typing import Literal


@dataclass(frozen=True)
class EvaluatorEvidence:
    """Carry validated measurements whose self-reported decision has no authority."""

    subject_digest: str  # Exact content identity evaluated.
    evaluator_version: str  # Measurement procedure version.
    risk_score: float  # Finite measurement from zero through one.
    suggested_allow: bool  # Diagnostic evaluator output ignored by policy.


@dataclass(frozen=True)
class Decision:
    """Record what trusted versioned policy derived from evidence."""

    kind: Literal["allow", "refuse", "review"]  # Local protected-gate result.
    evaluator_version: str  # Measurement procedure bound to the decision.
    policy_version: str  # Thresholds and gate behavior used.
    subject_digest: str  # Prevents reuse for changed content.


def derive_decision(
    evidence: EvaluatorEvidence, threshold: float, policy_version: str
) -> Decision:
    """Own decision authority without trusting the evaluator's suggestion."""
    if not math.isfinite(evidence.risk_score) or not 0 <= evidence.risk_score <= 1:
        raise ValueError("risk score must be finite and in [0, 1]")
    if not math.isfinite(threshold) or not 0 <= threshold <= 1:
        raise ValueError("policy threshold must be finite and in [0, 1]")
    # kind remains conservative unless trusted threshold policy permits the subject.
    kind: Literal["allow", "review"] = (
        "allow" if evidence.risk_score <= threshold else "review"
    )
    return Decision(kind, evidence.evaluator_version, policy_version, evidence.subject_digest)
```

Name whether policy enforces a hard gate or records a soft signal. When uncertain evidence carries the claim, measure false acceptance and false rejection plus applicable calibration, reviewer agreement, leakage, drift, and remediation bounds.

## Approval and activation

```python
from dataclasses import dataclass
import hashlib
from typing import Protocol


@dataclass(frozen=True)
class Approval:
    """Bind current actor authority and policy to immutable subject bytes."""

    approval_id: str  # Stable identity for idempotent local settlement.
    subject_digest: bytes  # SHA-256 digest of reviewed bytes.
    policy_version: str  # Approval rules used by the reviewer.
    approver_id: str  # Accountable actor whose authority is rechecked as policy requires.
    scope: str  # Exact allowed action, such as activate.


class ActivationStore(Protocol):
    """Own one local transaction for state, outbound intent, and audit."""

    def record_intent_if_current(
        self, approval: Approval, current_digest: bytes, expected_version: int
    ) -> str:
        """Recheck subject, policy, authority, and version before local commit."""
        ...


def subject_digest(subject: bytes) -> bytes:
    """Hash the exact reviewed bytes with the standard cryptographic implementation."""
    return hashlib.sha256(subject).digest()
```

Use `hmac.compare_digest` when the digest comparison participates in a secret-sensitive protocol. The store can atomically record a local activation intent and append-only audit. External activation remains a later, separately observed effect.

## Operator redrive

```python
from dataclasses import dataclass
from typing import Protocol


@dataclass(frozen=True)
class RedriveCommand:
    """Identify one authorized intervention and its expected durable state."""

    command_id: str  # Stable identity for duplicate delivery and unknown lookup.
    actor_id: str  # Actor checked for current redrive authority.
    obligation_id: str  # Blocked work selected by the operator.
    expected_version: int  # Refuses a stale operator view.
    new_attempt_id: str  # Adds an attempt without rewriting history.
    reason: str  # Retained in append-only audit.


class InterventionStore(Protocol):
    """Apply normal authority, budget, version, and effect protections."""

    def redrive(self, command: RedriveCommand) -> str:
        """Atomically record command, new attempt, enqueue intent, and audit."""
        ...
```

An ambiguous result stays unknown and is queried by `command_id`. It does not authorize a differently identified retry.

## Proof

Test threshold edges, non-finite evidence, and that `suggested_allow` cannot authorize. Change content, policy, evidence, or actor authority during review. Use the production store for conditional intent plus audit, duplicates, simultaneous redrives, stale versions, and ambiguous commit outcomes. Observe external activation by complete identity. Mark evaluator quality, audit immutability, or external observation claims unverified when their real evidence or dependency is unavailable.
