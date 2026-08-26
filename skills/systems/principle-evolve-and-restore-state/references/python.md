# Python

Keep compatibility, backfill, restore, and failover as separate procedures. Use Pydantic only when it is already the repository's boundary validator.

## Mixed-version compatibility

```python
"""Keep durable user history meaningful during mixed deployment."""

from dataclasses import dataclass
from typing import Literal


@dataclass(frozen=True)
class StoredUser:
    """Carry every representation that can remain during rollout or rollback."""

    schema_version: Literal[1, 2]  # Selects the persisted codec.
    display_name: str | None  # Canonical value in version two.
    full_name: str  # Derived compatibility value required by old readers.


def read_canonical(stored: StoredUser) -> str:
    """Accept each supported form and reject disagreement between dual-written values."""
    if stored.schema_version == 1:
        return stored.full_name
    if stored.display_name is None or stored.display_name != stored.full_name:
        raise ValueError("canonical and compatibility names disagree")
    return stored.display_name


def write_expanded(display_name: str) -> StoredUser:
    """Derive both forms from one canonical value for one atomic write."""
    return StoredUser(2, display_name, display_name)
```

Keep `full_name` until old processes, queued work, rollback images, and relevant backups leave the compatibility window.

## Resumable backfill

```python
from dataclasses import dataclass
from typing import Protocol


@dataclass(frozen=True)
class BackfillCheckpoint:
    """Bind one resume position to a stable job and transformation version."""

    work_id: str  # Identity retained across worker replacement.
    operation_version: str  # Refuses incompatible code on resume.
    after_id: str | None  # Last row committed by the ordered batch.


class BackfillStore(Protocol):
    """Own the conditional batch transaction and capacity reservation."""

    def commit_batch(
        self, expected: BackfillCheckpoint, limit: int
    ) -> BackfillCheckpoint:
        """Transform a bounded batch and advance its checkpoint atomically."""
        ...
```

Make the transformation repeatable. A crash before commit advances nothing; a lost commit reply is resolved by `work_id`. Recovery and normal traffic share the stated capacity budget.

## Backup and restore

```python
from dataclasses import dataclass
from typing import Protocol


@dataclass(frozen=True)
class RestoreEvidence:
    """Carry a signed or otherwise attestable restore record into the gate."""

    snapshot_verified: bool  # Covers data, schema, keys, config, and artifacts.
    reconciliation_range: str  # Canonical external range the trusted source covered.
    external_epoch: int  # Binds evidence to authority outside restored state.
    attestation: bytes  # Opaque source proof checked by the trusted verifier.


class RestoreEvidenceAuthenticator(Protocol):
    """Own verification of the source attestation before evidence is trusted."""

    def authenticates(self, evidence: RestoreEvidence) -> bool:
        """Return true only for an authentic record covering these exact fields."""
        ...


@dataclass(frozen=True)
class ReopenRequirements:
    """Name facts trusted evidence must match rather than merely contain."""

    required_reconciliation_range: str  # Complete canonical range recovery demanded.
    highest_restored_epoch: int  # Greatest authority epoch found in restored scope.
    expected_external_epoch: int  # Fresh epoch allocated outside restored state.


@dataclass(frozen=True)
class RestoreGate:
    """Keep effect producers closed until trusted evidence meets requirements."""

    evidence: RestoreEvidence | None  # Untrusted until the authenticator accepts it.
    producers_paused: bool  # Remains true until the open transition commits.


def can_reopen(
    gate: RestoreGate,
    required: ReopenRequirements,
    authenticator: RestoreEvidenceAuthenticator,
) -> bool:
    """Authenticate evidence, then require exact range and epoch matches."""
    evidence = gate.evidence  # Candidate record that grants no authority by presence alone.
    return (
        evidence is not None
        and authenticator.authenticates(evidence)
        and evidence.snapshot_verified
        and gate.producers_paused
        and required.expected_external_epoch > required.highest_restored_epoch
        and evidence.reconciliation_range == required.required_reconciliation_range
        and evidence.external_epoch == required.expected_external_epoch
    )
```

The production authenticator must verify that `attestation` covers every evidence field and comes from the authoritative external source. A caller-created record therefore fails before its booleans, range, or epoch can authorize reopening. Scan the restored scope for `highest_restored_epoch`, then ask the independent allocator for `expected_external_epoch`; do not derive the expected value from restored state. The comparison proves only that the grant exceeds every epoch the snapshot reveals. Only the independent allocator can prove freshness relative to authorities and history outside that snapshot. If no complete record can reveal effects after the snapshot, preserve `unknown`. Measure RPO and RTO during a timed isolated restore against the named disaster and resources.

## Failover authority

```python
from dataclasses import dataclass


@dataclass(frozen=True)
class FailoverGrant:
    """Bind routing to a fresh fencing epoch old authorities cannot mint."""

    route_generation: int  # Active service destination generation.
    disaster_epoch: int  # Monotonic value from authority outside failed or restored state.
    owner: str  # Only writer authorized for this generation and epoch.


def accepts_write(current: FailoverGrant, presented: FailoverGrant) -> bool:
    """Require both routing and fencing authority; routing alone is insufficient."""
    return presented == current
```

## Proof

Exercise every old/new reader-writer pair and rollback after new writes. Crash a backfill before and after commit, repeat it, and reject a different operation version. Restore the production datastore into isolation with its keys and artifacts, then reject a forged attestation, a mismatched required range, and expected external epochs equal to or below the highest restored epoch before proving exact authenticated evidence reopens dispatch. Race stale and current failover grants. Mark restore, RPO, RTO, or fencing claims unverified when the real dependency cannot run.
