# Python

Normalize provider evidence without letting the adapter choose business policy. Local outbox settlement, provider idempotency, and reconciliation remain separate boundaries.

```python
"""Coordinate a payment after its provider response becomes uncertain."""

from dataclasses import dataclass
from typing import Literal, Protocol


@dataclass(frozen=True)
class PaymentIdentity:
    """Bind evidence to one provider account, environment, request, and effect."""

    provider: str  # Adapter and reconciliation contract name.
    account_id: str  # Receiver account whose evidence may authorize the transition.
    environment: Literal["test", "production"]  # Isolation domain for the effect.
    operation: Literal["capture"]  # Prevents evidence from authorizing another operation.
    effect_id: str  # Stable provider idempotency key.
    request_digest: str  # Digest of amount, currency, and other effective request fields.


@dataclass(frozen=True)
class DeliveryIntent:
    """Represent the durable local obligation created with requiring state."""

    intent_id: str  # Local business obligation identity.
    delivery_id: str  # Broker progress identity, separate from provider effect.
    identity: PaymentIdentity  # Receiver key and complete reconciliation scope.
    state: Literal[
        "requested", "pending", "confirmed", "refused", "unknown", "needs_attention"
    ]  # Evidence currently retained by the local coordinator.


@dataclass(frozen=True)
class Observation:
    """State only what the authoritative provider lookup proves."""

    identity: PaymentIdentity  # Complete lookup scope established by the receiver.
    kind: Literal["confirmed", "refused", "pending", "unknown"]  # Evidence class.
    provider_effect_id: str | None = None  # Receiver identity when confirmed.
    reason: str | None = None  # Refusal or uncertainty evidence.


class Provider(Protocol):
    """Deliver idempotently and query the documented authoritative history."""

    def capture(self, identity: PaymentIdentity, body: bytes) -> Observation:
        """Send a capture whose remote commit may outlive a lost reply."""
        ...

    def observe(self, identity: PaymentIdentity) -> Observation:
        """Search all states and retention periods named by the recovery contract."""
        ...


def choose_recovery(expected: PaymentIdentity, observation: Observation) -> str:
    """Advance local state only when every receiver identity field matches."""
    if observation.identity != expected:
        return "needs_attention"
    return {
        "confirmed": "confirm",
        "refused": "refuse",
        "pending": "reconcile_later",
        "unknown": "needs_attention",
    }[observation.kind]


@dataclass(frozen=True)
class RefundIntent:
    """Represent compensation as a separate durable effect."""

    compensation_id: str  # New idempotency identity for the refund.
    original_effect_id: str  # Link to immutable capture history.
    reason: str  # Trusted policy reason for creating compensation.
```

Persist `unknown` when the reply is lost, then query with the complete `PaymentIdentity`. The adapter returns the receiver-established identity with its evidence; `choose_recovery` sends mismatches to `needs_attention`. A recently read lagging replica does not prove absence. Only a lookup whose documented scope includes accepted, queued, pending, and completed work across the required retention can settle absence. Create the refund and its outbox row in a later local transaction.

## Proof

Script failure after each local and remote boundary. Use the real database for outbox settlement. Check duplicate capture identity, mismatched reconciliation identity, pending and unknown outcomes, separately identified compensation, and restore behind provider state. Mark any provider behavior the test environment cannot supply as unverified.
