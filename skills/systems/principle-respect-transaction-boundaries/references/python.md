# Python

Use the SQL library already present. This SQLAlchemy-shaped example commits the order, effect identity, and outbox intent in one production database transaction; it does not include the broker.

```python
"""Own the local database settlement boundary for an order payment request."""

from dataclasses import dataclass
from typing import Literal, Protocol


@dataclass(frozen=True)
class SettlementInput:
    """Carry identities that survive session retries and worker replacement."""

    command_id: str  # Stable logical settlement identity and recovery lookup key.
    order_id: str  # Order whose version authorizes this transition.
    expected_version: int  # Version required by the conditional update.
    effect_id: str  # Provider idempotency key retained across deliveries.
    outbox_id: str  # Durable broker-delivery obligation identity.


@dataclass(frozen=True)
class SettlementOutcome:
    """Separate proved outcomes from a commit response that may have been lost."""

    kind: Literal["committed", "stale", "not_committed", "unknown"]  # Settlement evidence.
    command_id: str  # Stable key used to resolve an unknown result.
    cause: BaseException | None = None  # Failure evidence; it does not imply rollback.


class Transaction(Protocol):
    """Represent one production database transaction shared by all local writes."""

    def execute(self, sql: str, parameters: dict[str, object]) -> int:
        """Execute SQL and return affected rows under this transaction."""
        ...


class SettlementWork(Protocol):
    """Describe the callback accepted by the application's transaction adapter."""

    def __call__(self, transaction: Transaction) -> SettlementOutcome:
        """Return a local result whose writes commit with the callback."""
        ...


class NotCommittedError(Exception):
    """Prove begin or work failed before COMMIT, or after confirmed rollback."""


class CommitUnknownError(Exception):
    """Preserve a failure after COMMIT starts without a trustworthy acknowledgement."""


class Database(Protocol):
    """Create the configured production transaction and isolation boundary."""

    def run_transaction(self, work: SettlementWork) -> SettlementOutcome:
        """Commit work or raise a transaction-phase-specific failure."""
        ...


def settle_order(database: Database, item: SettlementInput) -> SettlementOutcome:
    """Commit local rows and preserve whether COMMIT had started on failure."""

    def write(transaction: Transaction) -> SettlementOutcome:
        """Write every local participant through the same transaction."""
        # updated is the authoritative in-transaction version check.
        updated = transaction.execute(
            "UPDATE orders SET state='payment_requested', version=version+1 "
            "WHERE id=:order_id AND version=:expected_version",
            {"order_id": item.order_id, "expected_version": item.expected_version},
        )
        if updated != 1:
            return SettlementOutcome("stale", item.command_id)
        transaction.execute(
            "INSERT INTO payment_effects(effect_id,command_id,order_id,state) "
            "VALUES(:effect_id,:command_id,:order_id,'requested')",
            {
                "effect_id": item.effect_id,
                "command_id": item.command_id,
                "order_id": item.order_id,
            },
        )
        transaction.execute(
            "INSERT INTO outbox(message_id,effect_id,topic,state) "
            "VALUES(:outbox_id,:effect_id,'capture-payment','pending')",
            {"outbox_id": item.outbox_id, "effect_id": item.effect_id},
        )
        return SettlementOutcome("committed", item.command_id)

    try:
        return database.run_transaction(write)
    except NotCommittedError as cause:
        # The adapter earned this result by proving no commit or confirmed rollback.
        return SettlementOutcome("not_committed", item.command_id, cause)
    except CommitUnknownError as cause:
        # A lost COMMIT reply cannot prove whether the server retained the rows.
        return SettlementOutcome("unknown", item.command_id, cause)
```

When the repository already uses SQLAlchemy, implement `run_transaction` with one `Session.begin()` and adapt `rowcount`. Wrap begin, statement, and constraint failures as `NotCommittedError` only after rollback is known; wrap a missing `COMMIT` acknowledgement as `CommitUnknownError`. Do not catch arbitrary `BaseException` as commit ambiguity. Give the stable identities unique constraints. Resolve `unknown` by querying `command_id`; do not publish until the local transaction returns.

## Proof

Use the production engine, schema, constraints, and isolation setting. Inject begin failure, constraint rollback as `not_committed`, concurrent expected versions, a crash after local commit before broker publish, and a database-aware lost `COMMIT` reply as `unknown`. A mocked session exception does not prove those semantics. Mark the commit-ambiguity claim unverified if the real engine fault cannot run.
