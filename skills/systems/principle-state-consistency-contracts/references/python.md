# Python reference

A catalog read may accept a stated version lag. Payment recovery needs a complete authority
observation before it can authorize another effect. The policy never uses observation age as proof
of data freshness.

```python
"""Check read evidence without claiming that Python protocols enforce datastore semantics."""

from dataclasses import dataclass
from enum import Enum
from typing import Generic, TypeVar


T = TypeVar("T")  # Preserves the observed domain value type through the decision.


class ReadStrength(Enum):
    """Separates bounded display reads from effect-authorizing reads."""

    BOUNDED_STALE = "bounded_stale"  # Permits a stated lag from authority watermark.
    AUTHORITY_COMPLETE = "authority_complete"  # Requires authority and complete effect coverage.


class Fallback(Enum):
    """States what happens when the required read cannot be earned."""

    REFUSE = "refuse"  # Prevents the decision.
    DEFER = "defer"  # Records that a later read is required.


@dataclass(frozen=True)
class ReadRequirement:
    """States the contract for one key-scoped decision."""

    key_scope: str  # Names the catalog item or payment effect whose versions compare.
    required_authority: str  # Authority that defines this version space.
    strength: ReadStrength  # Selects bounded stale or complete authority evidence.
    expected_epoch: int  # Rejects versions from before failover or restore.
    minimum_version: int  # Supplies read-your-writes or other minimum progress.
    max_version_lag: int | None  # Limits lag only for bounded-stale reads.
    deadline_ms: int  # Ends permission to wait at this epoch millisecond.
    fallback: Fallback  # Defines unavailable or weak-source behavior.


@dataclass(frozen=True)
class ReadObservation(Generic[T]):
    """Reports what one selected data path can prove."""

    value: T  # Carries domain data without upgrading its evidence.
    key_scope: str  # Repeats the exact object described by this evidence.
    authority: str  # Authority that issued versions and watermark.
    source: str  # Names the primary, replica, cache, or projection used.
    authoritative: bool  # Says whether this source owns writes for the decision.
    epoch: int  # Changes when failover or restore can move versions backward.
    version: int  # Compares only within the same key scope and epoch.
    authority_watermark: int  # Is a comparable point supplied by the authority.
    observed_at_ms: int  # Records read completion time but does not prove freshness.
    complete: bool  # Covers accepted, queued, pending, and completed retained operations.


class ReadDecision(Enum):
    """Reports use, refusal, or deferral without weakening the requirement."""

    USE = "use"  # The observation met the contract.
    REFUSE = "refuse"  # Weak evidence cannot authorize the decision.
    DEFER = "defer"  # Another read is required later.


def _unavailable(requirement: ReadRequirement) -> ReadDecision:
    """Apply the declared fallback without silently changing strength."""
    return ReadDecision.REFUSE if requirement.fallback is Fallback.REFUSE else ReadDecision.DEFER


def decide_read(
    requirement: ReadRequirement,
    observation: ReadObservation[T] | None,
    now_ms: int,
) -> ReadDecision:
    """Accept only evidence that meets epoch, progress, and requested strength."""
    if now_ms >= requirement.deadline_ms or observation is None:
        return _unavailable(requirement)
    if (
        observation.key_scope != requirement.key_scope
        or observation.authority != requirement.required_authority
        or observation.epoch != requirement.expected_epoch
        or observation.version < requirement.minimum_version
    ):
        return _unavailable(requirement)
    if requirement.strength is ReadStrength.AUTHORITY_COMPLETE:
        return ReadDecision.USE if observation.authoritative and observation.complete else _unavailable(requirement)
    if requirement.max_version_lag is None or observation.authority_watermark < observation.version:
        return _unavailable(requirement)
    lag = observation.authority_watermark - observation.version  # Compares progress, not read age.
    return ReadDecision.USE if lag <= requirement.max_version_lag else _unavailable(requirement)


def sequence_decision(last_applied: int, incoming: int) -> str:
    """Keep per-payment source order separate from arrival order."""
    if incoming <= last_applied:
        return "duplicate"
    return "apply" if incoming == last_applied + 1 else "gap"
```

Use `BOUNDED_STALE` with a maximum version lag for catalog display. Use `AUTHORITY_COMPLETE` for
payment retry authorization and include the complete receiver identity in `key_scope`. The production adapter
must get a comparable authority watermark and completeness evidence from the actual data service.
Dataclasses cannot provide read-your-writes or linearizability.

Direct tests cover key and authority mismatch, a recent but lagging result, unavailable authority,
unmet session version, sequence gap, and failover epoch. Run dependency tests for read-after-write,
partition fallback, and failover against the deployed service. A test double counts only if it
reproduces that system's replication lag, partition fallback, session progress, and failover
behavior; otherwise mark those guarantees unverified.
