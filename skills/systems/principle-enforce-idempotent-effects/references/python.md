# Python reference

The canonical request is the same in every language: `CAP1`, unsigned 64-bit amount cents,
length-prefixed UTF-8 currency, and length-prefixed UTF-8 order ID.

```python
"""Build stable receiver input without claiming that Python values enforce storage semantics."""

from dataclasses import dataclass
from enum import Enum
from hashlib import sha256
from struct import pack
from typing import Protocol


@dataclass(frozen=True)
class CaptureRequest:
    """Is the meaning protected by one idempotency identity."""

    amount_cents: int  # Uses positive unsigned 64-bit integer minor units.
    currency: str  # Uses the receiver's validated uppercase currency code.
    order_id: str  # Binds the effect to one business obligation.


@dataclass(frozen=True)
class ReceiverIdentity:
    """Scopes a stable key to one receiver namespace."""

    receiver_account: str  # Selects the provider-owned account.
    environment: str  # Prevents test and production identities from colliding.
    operation: str  # Prevents one key from naming a different receiver operation.
    effect_key: str  # Remains stable across every equivalent delivery.


def _encode_field(value: str) -> bytes:
    """Write one bounded UTF-8 field without separator ambiguity."""
    encoded = value.encode("utf-8")  # Preserves the receiver's normalized text representation.
    if len(encoded) > 0xFFFF:
        raise ValueError("canonical field exceeds 65535 bytes")
    return pack(">H", len(encoded)) + encoded


def canonical_capture_bytes(request: CaptureRequest) -> bytes:
    """Create the versioned byte identity shared by every implementation."""
    if not 0 < request.amount_cents <= 0xFFFF_FFFF_FFFF_FFFF:
        raise ValueError("amount_cents must fit positive uint64 minor units")
    return b"CAP1" + pack(">Q", request.amount_cents) + _encode_field(request.currency) + _encode_field(request.order_id)


def capture_digest(request: CaptureRequest) -> bytes:
    """Detect key reuse with changed canonical meaning."""
    return sha256(canonical_capture_bytes(request)).digest()


class SettlementKind(Enum):
    """Identifies the receiver authority's arbitration result."""

    COMMITTED = "committed"  # Covers the winner and equivalent replays.
    CONFLICT = "conflict"  # Rejects one key carrying a changed digest.
    PENDING = "pending"  # Requires an authoritative in-flight owner.


@dataclass(frozen=True)
class SettlementResult:
    """Carries the stored response for committed calls."""

    kind: SettlementKind  # Identifies committed, conflict, or authoritative pending state.
    ledger_entry_id: str | None  # Is stable for the winner and equivalent replays.
    replay: bool  # Says whether an earlier call created the ledger entry.


class PaymentLedger(Protocol):
    """Owns unique arbitration, ledger mutation, and stored response."""

    def settle_once(
        self,
        identity: ReceiverIdentity,
        request: CaptureRequest,
        digest: bytes,
    ) -> SettlementResult:
        """Perform all receiver-owned changes in one transaction or equivalent protocol."""
        ...
```

Use SQLAlchemy only when it is the repository's existing database layer. A PostgreSQL adapter must
use one receiver transaction with a unique scoped identity, digest comparison, ledger mutation, and
stored response. The protocol cannot make these steps atomic. It must not wrap an unrelated external
provider call and imply cross-system atomicity.

Use one shared golden vector: 4,000 cents, `USD`, and `order-123` encode as
`434150310000000000000fa0000355534400096f726465722d313233` and hash to
`d2c10eb12de108dcea8788149a7770b038b513a19f8338af27286a90549a3e78`. Run concurrent first calls,
replay, conflict,
transaction fault points, and authoritative pending behavior against the production engine. Exercise
delivery after normal retention under a tombstone or receiver-clock cutoff contract. Mark unavailable
database and retention claims unverified.
