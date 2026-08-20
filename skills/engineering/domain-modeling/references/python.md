# Python reference

Use this reference when implementing or reviewing a Python domain model.

Use the project's shared Pydantic object model for identity and lifecycle fields. Domain models use Pydantic for construction and whole-object invariants, not as transport DTOs or ORM records. Keep aliases, database mapping, request parsing, response serialization, and I/O in adapters.

Prefer frozen models and methods that return a new validated instance. A method that fails leaves the original value untouched. Put domain failures beside the model and make callers handle them without repeating the rule. Do not use `model_copy(update=...)` for transitions because Pydantic trusts the update without validation.

Pydantic still inherits `model_copy` and `model_construct`. Treat them as bypass paths, not domain behavior. Enable instance revalidation and run `model_validate` at hydration and pre-persistence boundaries so a bypassed value cannot cross the boundary unchecked.

## Worked contract

An `Account` starts active with no failed login attempts.

- Recording a failed login is a consequence of failed credential verification.
- Only an active account may record the consequence.
- The third failed login locks the account.
- Unlocking is a command. It is legal only while locked and resets the failed count.
- An active account has zero to two failures. A locked account has exactly three.

The application verifies credentials and authorizes an unlock. The account owns what those facts do to its state.

```python
from __future__ import annotations

from enum import StrEnum
from typing import Self

from pydantic import ConfigDict, model_validator

from app.domains.base import Object


MAX_FAILED_LOGINS = 3


class IllegalAccountTransition(ValueError):
    pass


class AccountState(StrEnum):
    ACTIVE = "active"
    LOCKED = "locked"


class Account(Object):
    model_config = ConfigDict(frozen=True, revalidate_instances="always")

    state: AccountState = AccountState.ACTIVE
    failed_login_attempts: int = 0

    @classmethod
    def create(cls, account_id: str) -> Self:
        return cls(id=account_id)

    def record_failed_login(self) -> Self:
        if self.state is not AccountState.ACTIVE:
            raise IllegalAccountTransition("only an active account can record a failed login")

        attempts = self.failed_login_attempts + 1
        state = AccountState.LOCKED if attempts == MAX_FAILED_LOGINS else AccountState.ACTIVE
        return self._transition(
            state=state,
            failed_login_attempts=attempts,
        )

    def unlock(self) -> Self:
        if self.state is not AccountState.LOCKED:
            raise IllegalAccountTransition("only a locked account can be unlocked")

        return self._transition(
            state=AccountState.ACTIVE,
            failed_login_attempts=0,
        )

    def _transition(self, **changes: object) -> Self:
        values = {
            name: getattr(self, name)
            for name in type(self).model_fields
        }
        values.update(changes)
        return type(self).model_validate(values)

    @model_validator(mode="after")
    def state_matches_failures(self) -> Self:
        if not 0 <= self.failed_login_attempts <= MAX_FAILED_LOGINS:
            raise ValueError("failed login attempts must be between zero and three")
        if self.state is AccountState.ACTIVE and self.failed_login_attempts == MAX_FAILED_LOGINS:
            raise ValueError("active account cannot have three failed logins")
        if self.state is AccountState.LOCKED and self.failed_login_attempts != MAX_FAILED_LOGINS:
            raise ValueError("locked account must have three failed logins")
        return self
```

Pydantic validates ordinary construction and adapter hydration through `Account.model_validate`. The adapter first maps its record or DTO into domain field names. Do not add wire aliases to make the domain consume the adapter's shape directly.

The application service stays small:

```python
account = repository.get(account_id)
next_account = account.record_failed_login()
repository.save(next_account)
```

Test the exported behavior and the whole-object backstop:

```python
import pytest
from pydantic import ValidationError

from app.domains.accounts import Account, AccountState, IllegalAccountTransition


def test_third_failed_login_locks_account() -> None:
    account = Account.create("acct-1")

    for _ in range(3):
        account = account.record_failed_login()

    assert account.state is AccountState.LOCKED
    assert account.failed_login_attempts == 3


def test_locked_account_rejects_another_failed_login() -> None:
    account = Account(
        id="acct-1",
        state=AccountState.LOCKED,
        failed_login_attempts=3,
    )

    with pytest.raises(IllegalAccountTransition):
        account.record_failed_login()


def test_unlock_resets_failures() -> None:
    account = Account(
        id="acct-1",
        state=AccountState.LOCKED,
        failed_login_attempts=3,
    )

    account = account.unlock()

    assert account.state is AccountState.ACTIVE
    assert account.failed_login_attempts == 0


def test_active_account_rejects_unlock() -> None:
    account = Account.create("acct-1")

    with pytest.raises(IllegalAccountTransition):
        account.unlock()


def test_hydration_rejects_impossible_state() -> None:
    with pytest.raises(ValidationError):
        Account.model_validate(
            {
                "id": "acct-1",
                "state": "locked",
                "failed_login_attempts": 1,
            }
        )


def test_boundary_validation_rejects_bypassed_copy() -> None:
    account = Account.create("acct-1")
    bypassed = account.model_copy(
        update={
            "state": AccountState.LOCKED,
            "failed_login_attempts": 1,
        }
    )

    with pytest.raises(ValidationError):
        Account.model_validate(bypassed)
```

If a behavior needs the current time, a policy limit, or another fact, pass the value into the method. Do not read environment configuration, call a repository, or hide I/O inside a validator.
