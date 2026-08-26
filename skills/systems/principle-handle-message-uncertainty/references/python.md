# Python reference

The adapter normalizes network behavior into observations. The decision keeps timeout and requested
cancellation uncertain until receiver evidence proves a stronger result.

```python
"""Classify payment evidence without treating transport exceptions as remote absence."""

from dataclasses import dataclass
from enum import Enum
from typing import Protocol


class ObservationKind(Enum):
    """Identifies the strongest evidence from one receiver exchange."""

    LOCAL_REFUSAL = "local_refusal"  # This invocation never left.
    RECEIVER_REFUSAL = "receiver_refusal"  # This request cannot later commit.
    CONFIRMED = "confirmed"  # The receiver identified a committed effect.
    PENDING = "pending"  # The receiver may still finish.
    NO_REPLY = "no_reply"  # Timeout or connection loss leaves remote state open.
    CANCELLATION_REQUESTED = "cancellation_requested"  # The cancellation race is unresolved.
    CANCELLED_BEFORE_COMMIT = "cancelled_before_commit"  # Receiver proof excludes commit.


@dataclass(frozen=True)
class Observation:
    """Carries receiver identity only when the operation contract supplies it."""

    kind: ObservationKind  # Selects the evidence rule.
    receiver_id: str | None  # Names the effect, operation, refusal, or cancellation evidence.


class KnowledgeKind(Enum):
    """Names the durable conclusion permitted by evidence."""

    CONFIRMED = "confirmed"  # Receiver evidence binds the effect.
    REFUSED = "refused"  # Established evidence excludes this invocation.
    PENDING = "pending"  # Later receiver observation remains necessary.
    UNKNOWN = "unknown"  # The effect may have committed.


@dataclass(frozen=True)
class Knowledge:
    """Keeps the conclusion beside the receiver evidence that earned it."""

    kind: KnowledgeKind  # Names confirmed, refused, pending, or unknown knowledge.
    receiver_id: str | None  # Preserves identity supplied by receiver evidence.
    evidence_source: str | None  # Distinguishes local refusal from receiver proof.


def classify(observation: Observation) -> Knowledge:
    """Record no stronger claim than one observation earns."""
    if observation.kind is ObservationKind.LOCAL_REFUSAL:
        return Knowledge(KnowledgeKind.REFUSED, None, "local")
    if observation.kind in {ObservationKind.RECEIVER_REFUSAL, ObservationKind.CANCELLED_BEFORE_COMMIT}:
        return Knowledge(KnowledgeKind.REFUSED, observation.receiver_id, "receiver")
    if observation.kind is ObservationKind.CONFIRMED:
        return Knowledge(KnowledgeKind.CONFIRMED, observation.receiver_id, "receiver")
    if observation.kind is ObservationKind.PENDING:
        return Knowledge(KnowledgeKind.PENDING, observation.receiver_id, "receiver")
    return Knowledge(KnowledgeKind.UNKNOWN, None, None)


@dataclass(frozen=True)
class OrderedDelivery:
    """Separates broker redelivery, source order, and logical effect identity."""

    delivery_id: str  # Detects an exact broker redelivery.
    source_sequence: int  # Orders immutable events within one payment stream.
    effect_key: str  # Names the logical payment effect across deliveries.


class InboxResult(Enum):
    """States what one receipt transaction decided."""

    APPLIED = "applied"  # Receipt and local state committed together.
    DUPLICATE = "duplicate"  # The delivery was already applied.
    SEQUENCE_GAP = "sequence_gap"  # An earlier source event is missing.


class PaymentInbox(Protocol):
    """Owns one transaction spanning receipt uniqueness and the local state change."""

    def apply_once(
        self, delivery: OrderedDelivery, expected_sequence: int
    ) -> InboxResult:
        """Apply only the next source event and never skip a gap."""
        ...
```

The receiver's operation contract decides which response establishes absence or completion. The
protocol and enum only keep that decision explicit. The production inbox adapter must use one real
transaction for its receipt and state change.

Use a scripted adapter, not sleeps, for lost request, lost refusal, lost success reply, pending work,
acknowledgement loss after inbox commit, exact redelivery, sequence gaps, and both cancellation
orderings. Prove inbox atomicity against the production
database or label it unverified.
