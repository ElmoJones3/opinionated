# Python reference

This value model keeps one capture obligation stable while workers, attempts, and invocations
change. The storage adapter remains responsible for atomic reservation and conditional updates.

```python
"""Model durable payment recovery without claiming that Python types enforce storage semantics."""

from dataclasses import dataclass
from enum import Enum
from typing import Protocol


class CaptureOutcome(Enum):
    """Names knowledge earned about the receiver effect."""

    REQUESTED = "requested"  # The effect remains owed.
    CONFIRMED = "confirmed"  # Receiver evidence identifies the committed effect.
    REFUSED = "refused"  # Stable receiver evidence says this request cannot commit.
    UNKNOWN = "unknown"  # A call may have left but no final reply was recorded.
    NEEDS_ATTENTION = "needs_attention"  # Automation stopped without guessing an outcome.


@dataclass(frozen=True)
class CaptureKnowledge:
    """Retains identity-bound evidence instead of only a status label."""

    outcome: CaptureOutcome  # Names the current knowledge state.
    receiver_id: str | None  # Identifies a confirmed effect or stable refusal.
    attempt_id: str | None  # Identifies the execution whose result is unknown.
    reason: str | None  # Explains refusal or why automation needs attention.


@dataclass(frozen=True)
class CaptureRecord:
    """Separates one business obligation from its physical executions."""

    obligation_id: str  # Names the one payment obligation for the order.
    step_id: str  # Names the separately recoverable capture stage.
    effect_key: str  # Remains stable for every equivalent receiver call.
    request_digest: bytes  # Rejects changed meaning under the stable key.
    version: int  # Is compared by storage during every state change.
    knowledge: CaptureKnowledge  # Records identity-bound evidence and intervention.


@dataclass(frozen=True)
class ReservedAttempt:
    """Proves storage authorized one physical execution before its call."""

    obligation_id: str  # Binds the execution to one durable business obligation.
    attempt_id: str  # Changes for each authorized execution.
    invocation_id: str  # Changes for each provider call inside the attempt.
    effect_key: str  # Reuses the receiver identity of the obligation.
    expected_version: int  # Binds completion to the reserved record generation.


class CaptureStore(Protocol):
    """Owns real transaction, uniqueness, and conditional-write behavior."""

    def reserve_attempt(self, obligation_id: str, expected_version: int) -> ReservedAttempt:
        """Atomically reserve one execution for existing current work."""
        ...

    def mark_unknown(self, attempt_id: str, expected_version: int) -> bool:
        """Change only the current reservation and return false after lost authority."""
        ...


@dataclass(frozen=True)
class RecoveryInput:
    """Contains only durable facts a replacement worker may trust."""

    record: CaptureRecord  # Carries immutable identity and the latest outcome.
    attempt: ReservedAttempt | None  # Is absent when no reservation committed.
    call_may_have_left: bool  # Means the invocation reached a send boundary.


def recovery_outcome(value: RecoveryInput) -> CaptureKnowledge:
    """Refuse to infer effect count from execution count."""
    if value.record.knowledge.outcome is not CaptureOutcome.REQUESTED:
        return value.record.knowledge
    if value.attempt is None:
        return CaptureKnowledge(CaptureOutcome.REQUESTED, None, None, None)
    if (
        value.attempt.obligation_id != value.record.obligation_id
        or value.attempt.effect_key != value.record.effect_key
        or value.attempt.expected_version != value.record.version
    ):
        return CaptureKnowledge(
            CaptureOutcome.NEEDS_ATTENTION,
            None,
            value.attempt.attempt_id,
            "reservation_not_current",
        )
    if not value.call_may_have_left:
        return CaptureKnowledge(CaptureOutcome.REQUESTED, None, None, None)
    return CaptureKnowledge(CaptureOutcome.UNKNOWN, None, value.attempt.attempt_id, None)
```

Use the repository's established SQL layer. SQLAlchemy is suitable only when the project already
uses it. The adapter transaction must verify the obligation and expected version, allocate unique
attempt and invocation IDs, bind the reservation to the obligation and effect key, and advance the
record to the reservation's expected version.

Test the pure decision for crashes before reservation, after reservation, after send, and before
local confirmation. Prove uniqueness and compare-and-set behavior against the production database,
or label those guarantees unverified when that dependency cannot run.
