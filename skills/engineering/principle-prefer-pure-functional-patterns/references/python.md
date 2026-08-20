# Python reference

Use this reference when creating or reviewing a Python transformation.

Prefer ordinary functions, frozen dataclasses, or the repository's immutable Pydantic models. Do not add a functional-programming library to spell a sequence Python already expresses clearly.

## A hidden, stateful operation

This version mutates caller-owned data, reads ambient time and configuration, and performs I/O:

```python
def schedule_renewal(change: dict[str, object]) -> None:
    change["plan"] = settings.default_plan
    change["starts_at"] = datetime.now(UTC) + timedelta(days=7)
    change.setdefault("tags", []).append("scheduled")
    repository.save(change)
```

Tests must patch settings, the clock, and the repository. A shallow copy would still share the tag list.

## Compose fallible value transformations

Use closures for configured transformations. Python exceptions are a reasonable fail-fast contract when the repository does not already use a result type.

```python
from __future__ import annotations

from dataclasses import dataclass, replace
from datetime import datetime, timedelta
from typing import Callable, TypeVar


T = TypeVar("T")
Modifier = Callable[[T], T]


def apply(initial: T, *modifiers: Modifier[T]) -> T:
    state = initial
    for modify in modifiers:
        state = modify(state)
    return state


@dataclass(frozen=True)
class Renewal:
    plan: str = "basic"
    starts_at: datetime | None = None
    tags: tuple[str, ...] = ()


def with_plan(plan: str) -> Modifier[Renewal]:
    def modify(change: Renewal) -> Renewal:
        if plan not in {"basic", "pro"}:
            raise ValueError(f"unknown plan {plan!r}")
        return replace(change, plan=plan)

    return modify


def starting_in(now: datetime, delay: timedelta) -> Modifier[Renewal]:
    def modify(change: Renewal) -> Renewal:
        if delay < timedelta(0):
            raise ValueError("renewal delay must not be negative")
        return replace(change, starts_at=now + delay)

    return modify


def with_tag(tag: str) -> Modifier[Renewal]:
    def modify(change: Renewal) -> Renewal:
        if not tag:
            raise ValueError("tag is required")
        return replace(change, tags=(*change.tags, tag))

    return modify
```

The caller supplies the clock and performs I/O:

```python
next_change = apply(
    current,
    with_plan("pro"),
    starting_in(now, timedelta(days=7)),
    with_tag("scheduled"),
)
repository.save(next_change)
```

Use direct calls when every caller runs the same two or three operations. Keep `apply` when callers compose a varying set of transformations or the shared signature improves tests and reuse.

## Reuse configured rules

Return structured problems from pure rules. Raise, stop, or collect in a separate evaluator.

```python
from dataclasses import dataclass


@dataclass(frozen=True)
class Problem:
    rule: str
    message: str


Rule = Callable[[T], Problem | None]


def one_of(*allowed: T) -> Rule[T]:
    def check(value: T) -> Problem | None:
        if value in allowed:
            return None
        return Problem(rule="one_of", message="must be an allowed value")

    return check
```

Avoid rules that read settings, query a repository, mutate the value, or format an HTTP response. Those actions prevent isolated rule tests and bind validation to one caller.

## Watch Python's mutable aliases

`@dataclass(frozen=True)` prevents attribute assignment. It does not freeze a list or dictionary stored in a field. Prefer immutable members such as tuples and frozen sets, or create fresh nested values during every transformation.

The same warning applies to Pydantic frozen models. A frozen model can still contain a mutable list, and `model_copy` performs a shallow copy unless told otherwise. Use the project's validated reconstruction path when the transformation must preserve model invariants.

## Test the contract

```python
from datetime import UTC, datetime, timedelta

import pytest


def test_renewal_pipeline_is_deterministic_and_keeps_input_unchanged() -> None:
    now = datetime(2026, 8, 20, 9, tzinfo=UTC)
    current = Renewal(tags=("customer-requested",))

    next_change = apply(
        current,
        with_plan("pro"),
        starting_in(now, timedelta(days=7)),
        with_tag("scheduled"),
    )

    assert next_change == Renewal(
        plan="pro",
        starts_at=now + timedelta(days=7),
        tags=("customer-requested", "scheduled"),
    )
    assert current == Renewal(tags=("customer-requested",))


def test_apply_stops_after_failure() -> None:
    calls: list[str] = []

    def after_failure(change: Renewal) -> Renewal:
        calls.append("called")
        return change

    with pytest.raises(ValueError, match="unknown plan"):
        apply(Renewal(), with_plan("enterprise"), after_failure)

    assert calls == []
```

Writing to a local variable or building a fresh list inside the function is fine. The caller must not observe a changed input or hidden external effect.
