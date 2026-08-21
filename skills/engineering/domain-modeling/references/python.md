# Python reference

Use this reference when implementing or reviewing a Python domain model. Load the [Python pure-pattern reference](../../principle-prefer-pure-functional-patterns/references/python.md) and import its shared `Modifier`, `EmittingModifier`, `Change`, `apply`, and `apply_emitting` definitions. Do not redeclare their generic aliases inside a domain package.

Use Pydantic to validate domain state, not as a transport DTO or ORM record. Keep aliases, request parsing, response serialization, persistence mapping, and I/O in adapters. Configure domain state as frozen, strict, revalidated, and closed to extra fields.

Python has no private constructor. Close normal construction deliberately: export a public domain wrapper with `create` and behavior, keep validated Pydantic snapshots and the construction token inside the module, and expose hydration only to adapters. This is more code than exporting a `BaseModel`, but it prevents ordinary callers and fixtures from manufacturing earned state with `Account(state="locked")`.

## Worked contract

An `Account` starts active with no failed login attempts.

- Recording a failed login is a consequence of failed credential verification.
- Only an active account may record it.
- The third failed login locks the account and produces `AccountLocked`.
- Unlocking is a command invoked after application authorization. The account accepts it only while locked and resets the failed count.
- An active account has zero to two failures. A locked account has exactly three.

Failed-login recording owes state plus a fact, so it uses an emitting modifier. Unlocking owes only state, so it uses an ordinary modifier.

```python
from __future__ import annotations

from dataclasses import dataclass
from enum import StrEnum
from typing import Annotated, Literal, Self, TypeAlias

from pydantic import ConfigDict, Field, TypeAdapter
from returns.result import Failure, Result, Success

from app.domains.base import Object
from app.functional import Change, EmittingModifier, Modifier


MAX_FAILED_LOGINS = 3
_CONSTRUCTION_TOKEN = object()


class AccountState(StrEnum):
    ACTIVE = "active"
    LOCKED = "locked"


_DOMAIN_CONFIG = ConfigDict(
    frozen=True,
    strict=True,
    extra="forbid",
    revalidate_instances="always",
)


class _ActiveAccount(Object):
    model_config = _DOMAIN_CONFIG

    state: Literal[AccountState.ACTIVE]
    failed_login_attempts: int = Field(ge=0, lt=MAX_FAILED_LOGINS)


class _LockedAccount(Object):
    model_config = _DOMAIN_CONFIG

    state: Literal[AccountState.LOCKED]
    failed_login_attempts: Literal[3]


_AccountSnapshot: TypeAlias = Annotated[
    _ActiveAccount | _LockedAccount,
    Field(discriminator="state"),
]
_account_snapshot: TypeAdapter[_AccountSnapshot] = TypeAdapter(_AccountSnapshot)


@dataclass(frozen=True, slots=True, init=False)
class Account:
    _snapshot: _AccountSnapshot

    def __init__(self, snapshot: _AccountSnapshot, *, _token: object) -> None:
        if _token is not _CONSTRUCTION_TOKEN:
            raise TypeError("use Account.create or the adapter hydration path")
        object.__setattr__(self, "_snapshot", snapshot)

    @classmethod
    def _from_snapshot(cls, snapshot: _AccountSnapshot) -> Self:
        return cls(snapshot, _token=_CONSTRUCTION_TOKEN)

    @classmethod
    def create(cls, account_id: str) -> Self:
        snapshot = _account_snapshot.validate_python(
            {
                "id": account_id,
                "state": AccountState.ACTIVE,
                "failed_login_attempts": 0,
            }
        )
        return cls._from_snapshot(snapshot)

    @property
    def id(self) -> str:
        return self._snapshot.id

    @property
    def state(self) -> AccountState:
        return self._snapshot.state

    @property
    def failed_login_attempts(self) -> int:
        return self._snapshot.failed_login_attempts


class AccountTransitionCode(StrEnum):
    NOT_ACTIVE = "account_not_active"
    NOT_LOCKED = "account_not_locked"


@dataclass(frozen=True)
class AccountTransitionError:
    code: AccountTransitionCode
    message: str


@dataclass(frozen=True)
class AccountLocked:
    account_id: str


AccountFact: TypeAlias = AccountLocked
AccountModifier: TypeAlias = Modifier[Account, AccountTransitionError]
AccountEmittingModifier: TypeAlias = EmittingModifier[
    Account,
    AccountTransitionError,
    AccountFact,
]


def _rebuild(account: Account, **changes: object) -> Account:
    values = account._snapshot.model_dump(mode="python")
    values.update(changes)
    return Account._from_snapshot(_account_snapshot.validate_python(values))


class AccountModifiers:
    @staticmethod
    def with_failed_login_recorded() -> AccountEmittingModifier:
        def modify(
            account: Account,
        ) -> Result[Change[Account, AccountFact], AccountTransitionError]:
            if account.state is not AccountState.ACTIVE:
                return Failure(
                    AccountTransitionError(
                        AccountTransitionCode.NOT_ACTIVE,
                        "only an active account can record a failed login",
                    )
                )

            attempts = account.failed_login_attempts + 1
            state = (
                AccountState.LOCKED
                if attempts == MAX_FAILED_LOGINS
                else AccountState.ACTIVE
            )
            next_account = _rebuild(
                account,
                state=state,
                failed_login_attempts=attempts,
            )
            facts: tuple[AccountFact, ...] = (
                (AccountLocked(account.id),)
                if state is AccountState.LOCKED
                else ()
            )
            return Success(Change(value=next_account, facts=facts))

        return modify

    @staticmethod
    def with_unlock() -> AccountModifier:
        def modify(account: Account) -> Result[Account, AccountTransitionError]:
            if account.state is not AccountState.LOCKED:
                return Failure(
                    AccountTransitionError(
                        AccountTransitionCode.NOT_LOCKED,
                        "only a locked account can be unlocked",
                    )
                )
            return Success(
                _rebuild(
                    account,
                    state=AccountState.ACTIVE,
                    failed_login_attempts=0,
                )
            )

        return modify
```

The Pydantic union makes impossible shapes fail validation. The wrapper and modifier entry points decide how legal later states are earned. `_rebuild` validates every successful modifier result; an unexpected validation exception there is a programmer defect, not an expected transition refusal.

Put hydration in an adapter-facing module that is absent from the domain package's public exports:

```python
# app/domains/accounts/hydration.py
from collections.abc import Mapping

from .model import Account, _account_snapshot


def hydrate_account(values: Mapping[str, object]) -> Account:
    return Account._from_snapshot(_account_snapshot.validate_python(dict(values)))
```

`hydrate_account` expects domain values. A repository adapter maps a stored string to `AccountState` before calling it. Strict domain validation must not quietly perform wire coercion.

## Call without restating rules

```python
account = repository.get(account_id)
result = apply_emitting(account, AccountModifiers.with_failed_login_recorded())
if isinstance(result, Failure):
    return result

change = result.unwrap()
settlement.settle_account(change)
```

`settle_account` accepts the complete `Change` and writes state plus mapped outbox records in one real transaction. The application verifies credentials and maps records. It does not reproduce the threshold, assign locked state, or invent `AccountLocked`.

## Prove earned state and restoration

```python
import pytest
from pydantic import ValidationError
from returns.result import Failure, Success

from app.domains.accounts import (
    Account,
    AccountLocked,
    AccountModifiers,
    AccountState,
    AccountTransitionCode,
)
from app.domains.accounts.hydration import hydrate_account
from app.functional import apply, apply_emitting


def locked_account() -> Account:
    account = Account.create("acct-1")
    for _ in range(3):
        result = apply_emitting(account, AccountModifiers.with_failed_login_recorded())
        assert isinstance(result, Success)
        account = result.unwrap().value
    return account


def test_third_failed_login_earns_lock_and_fact() -> None:
    account = Account.create("acct-1")
    first = apply_emitting(account, AccountModifiers.with_failed_login_recorded()).unwrap()
    second = apply_emitting(first.value, AccountModifiers.with_failed_login_recorded()).unwrap()
    third = apply_emitting(second.value, AccountModifiers.with_failed_login_recorded())

    assert isinstance(third, Success)
    change = third.unwrap()
    assert change.value.id == "acct-1"
    assert change.value.state is AccountState.LOCKED
    assert change.value.failed_login_attempts == 3
    assert change.facts == (AccountLocked("acct-1"),)
    assert first.facts == ()
    assert second.facts == ()


def test_locked_account_rejects_failure_without_leaking_change() -> None:
    account = locked_account()
    result = apply_emitting(account, AccountModifiers.with_failed_login_recorded())

    assert isinstance(result, Failure)
    assert result.failure().code is AccountTransitionCode.NOT_ACTIVE
    assert account.id == "acct-1"
    assert account.state is AccountState.LOCKED
    assert account.failed_login_attempts == 3


def test_active_account_rejects_unlock() -> None:
    account = Account.create("acct-1")
    result = apply(account, AccountModifiers.with_unlock())
    assert isinstance(result, Failure)
    assert result.failure().code is AccountTransitionCode.NOT_LOCKED
    assert account.id == "acct-1"
    assert account.state is AccountState.ACTIVE
    assert account.failed_login_attempts == 0


def test_unlock_restores_active_state() -> None:
    result = apply(locked_account(), AccountModifiers.with_unlock())
    assert isinstance(result, Success)
    assert result.unwrap() == Account.create("acct-1")


def test_hydration_accepts_valid_state_and_rejects_exact_invariant() -> None:
    valid = hydrate_account(
        {
            "id": "acct-1",
            "state": AccountState.LOCKED,
            "failed_login_attempts": 3,
        }
    )
    assert valid == locked_account()

    with pytest.raises(ValidationError) as exc_info:
        hydrate_account(
            {
                "id": "acct-1",
                "state": AccountState.LOCKED,
                "failed_login_attempts": 1,
            }
        )

    issue = exc_info.value.errors()[0]
    assert issue["loc"] == ("locked", "failed_login_attempts")
    assert issue["type"] == "literal_error"
```

Do not import `accounts.hydration` to stage earned state in ordinary behavior tests. `model_construct` and `model_copy(update=...)` are bypasses too. Build the fixture through production behavior, then use hydration only to prove that the backstop accepts a real stored state and rejects the exact broken invariant.

Keep authorization, repositories, clocks, DTO mapping, transactions, and publication outside the module. When several aggregates change, compute every pure result first, then coordinate persistence. The modifier contract does not create transaction atomicity by itself.
