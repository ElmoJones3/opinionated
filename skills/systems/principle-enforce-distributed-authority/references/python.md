# Python reference

Database time owns lease expiry. The worker receives an authority value, but only PostgreSQL can
decide whether that value is still current when the protected row changes.

```python
"""Carry fencing values without claiming that Python objects enforce database authority."""

from dataclasses import dataclass
from datetime import datetime, timedelta
from typing import Protocol


@dataclass(frozen=True)
class AuthorityTerm:
    """Prevents ownership generations from being reused after restore."""

    disaster_epoch: int  # Comes from a source outside the restored snapshot.
    fencing_token: int  # Increases for each ownership change within the epoch.


@dataclass(frozen=True)
class WorkClaim:
    """Is temporary permission granted by database time and the current row."""

    work_id: str  # Selects the one protected work row.
    owner_id: str  # Names the worker for audit, not fencing by itself.
    term: AuthorityTerm  # Identifies the exact ownership generation.
    record_version: int  # Rejects equal-token completion races.
    lease_expires_at: datetime  # Is produced by PostgreSQL, not worker time.


@dataclass(frozen=True)
class Completion:
    """Binds output to the ownership generation that produced it."""

    work_id: str  # Repeats the claimed work identity.
    term: AuthorityTerm  # Repeats the exact claim term.
    expected_version: int  # Repeats the claimed record version.
    result: bytes  # Is stored only if PostgreSQL accepts current authority.


class WorkStore(Protocol):
    """Owns PostgreSQL claim, renewal, and conditional completion transactions."""

    def claim(
        self, owner_id: str, lease_duration: timedelta, active_epoch: int
    ) -> WorkClaim | None:
        """Select one row in a short transaction and use database time for expiry."""
        ...

    def renew(self, claim: WorkClaim, lease_duration: timedelta) -> WorkClaim | None:
        """Renew only while owner, term, version, and running state remain current."""
        ...

    def complete(self, completion: Completion) -> bool:
        """Return false after lost authority and guarantee no result write occurred."""
        ...


def finalize(store: WorkStore, completion: Completion) -> str:
    """Report a rejected conditional update as stale authority."""
    return "completed" if store.complete(completion) else "stale"
```

Use the application's established SQL layer. SQLAlchemy is relevant only if the repository already
uses it. The PostgreSQL adapter may claim with a short `FOR UPDATE SKIP LOCKED` transaction, then
complete with this separate statement:

```sql
-- PostgreSQL enforces exact-current epoch, token, state, and version in the protected write.
UPDATE work
SET state = 'completed', result = %(result)s, version = version + 1
WHERE work_id = %(work_id)s
  AND state = 'running'
  AND disaster_epoch = %(epoch)s
  AND fencing_token = %(token)s
  AND version = %(version)s;
-- Zero changed rows means authority was lost; no result was committed.
```

Do not hold the claim lock while work runs. Local fencing cannot reject an external provider call
unless that provider accepts and checks the term. Otherwise use receiver idempotency and define a
late-effect response.

Exercise simultaneous claims, renewal races, pause-takeover-resume, and equal-token writes against
real PostgreSQL. A restore test needs a new epoch from a non-rollbackable source outside the snapshot
and must prove it exceeds every old epoch before claims reopen. Without that source, mark the claim
unverified and keep claims closed.
