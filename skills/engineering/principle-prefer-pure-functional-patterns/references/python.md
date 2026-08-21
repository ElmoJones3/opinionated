# Python reference

Use this reference when choosing or implementing a pure Python pattern.

## Defaults

| Operation owes | Use |
| --- | --- |
| one calculated value | an ordinary function; `toolz.pipe` for an established multi-step pipeline |
| a converted value that may be refused | an ordinary function returning `Result[U, E]` |
| reusable constraints | a callable rule plus a fail-fast or accumulating evaluator |
| state folded from accepted inputs | a total pure reducer |
| state or an expected refusal | `Modifier`, `apply`, and `returns.Result` |
| a value plus ordered facts with no refusal | `Change[U, F]` directly |
| state plus ordered facts or a receipt | `EmittingModifier`, `apply_emitting`, `returns.Result`, and a frozen `Change` |
| values over time | a stateful shell around a pure reducer |

Use frozen dataclasses or the repository's frozen Pydantic models for values. Prefer tuples and frozen sets for nested collections. `frozen=True` does not freeze a list or dictionary stored in a field.

`returns` has no Writer carrier. Do not add one. A frozen `Change` inside the already-standard outer `Result` gives the required WriterT-over-Result semantics without another dependency or vocabulary.

## Keep effects outside

Bad code mutates caller-owned data and reads ambient services:

```python
def schedule_renewal(change: dict[str, object]) -> None:
    change["starts_at"] = datetime.now(UTC) + timedelta(days=7)
    change.setdefault("tags", []).append("scheduled")
    repository.save(change)
    event_bus.emit("renewal_scheduled", change)
```

Read time, configuration, authorization, and stored data at the application boundary. Pass the needed values into a pure function. Repository writes and event delivery happen only after the result succeeds.

## State-only modifiers

Use one shared generic contract:

```python
from collections.abc import Callable
from typing import TypeAlias, TypeVar

from returns.result import Failure, Result, Success


T = TypeVar("T")
E = TypeVar("E")
Modifier: TypeAlias = Callable[[T], Result[T, E]]


def apply(initial: T, *modifiers: Modifier[T, E]) -> Result[T, E]:
    state: Result[T, E] = Success(initial)
    for modify in modifiers:
        state = state.bind(modify)
    return state
```

Use it when success owes only the next value:

```python
def with_tag(tag: str) -> Modifier[Renewal, RenewalError]:
    def modify(current: Renewal) -> Result[Renewal, RenewalError]:
        if not tag:
            return Failure(RenewalError("missing_tag", "tag is required"))
        return Success(replace(current, tags=(*current.tags, tag)))

    return modify
```

Expected business refusals are `Failure` values with stable domain codes. Programmer defects still raise. Untrusted construction and hydration errors use the model's validation convention, not a transition `Failure`.

Keep a total calculation as an ordinary function. Use `apply` when a state change has an expected refusal, including a single modifier, so the call site and later composition keep one contract.

## Emitting modifiers

Use the emitting branch when success also owes domain facts. Add this to the same shared module; it reuses `Callable`, `T`, and `E` above:

```python
from dataclasses import dataclass
from typing import Generic, TypeAliasType

from returns.result import Failure, Result, Success


F = TypeVar("F")


@dataclass(frozen=True)
class Change(Generic[T, F]):
    value: T
    facts: tuple[F, ...] = ()


EmittingModifier = TypeAliasType(
    "EmittingModifier",
    Callable[[T], Result[Change[T, F], E]],
    type_params=(T, E, F),
)


def lift_modifier(
    modify: Modifier[T, E],
) -> EmittingModifier[T, E, F]:
    def lifted(value: T) -> Result[Change[T, F], E]:
        result = modify(value)
        if isinstance(result, Failure):
            return result
        return Success(Change(value=result.unwrap()))

    return lifted


def apply_emitting(
    initial: T,
    *modifiers: EmittingModifier[T, E, F],
) -> Result[Change[T, F], E]:
    current = initial
    facts: tuple[F, ...] = ()

    for modify in modifiers:
        result = modify(current)
        if isinstance(result, Failure):
            return result
        change = result.unwrap()
        current = change.value
        facts = (*facts, *change.facts)

    return Success(Change(value=current, facts=facts))
```

`TypeAliasType` pins the public parameters as `T, E, F`. Do not shorten it to this tempting alias:

```python
# BAD: parameters bind by first appearance as T, F, E.
EmittingModifier: TypeAlias = Callable[[T], Result[Change[T, F], E]]
```

That alias runs, so pytest can stay green while the error and fact types are reversed. Import the shared alias instead of recreating it, and run mypy with the `returns` plugin.

The example targets Python 3.12 or later and uses `typing.TypeAliasType`. If the project supports an older runtime, declare `typing_extensions` directly and import `TypeAliasType` from it. Do not rely on another library's transitive dependency.

This is Writer-style accumulation with `Result` outside `Change`. A final `Failure` therefore contains neither earlier facts nor tentative state.

Each modifier returns only its local facts:

```python
@dataclass(frozen=True)
class RenewalScheduled:
    starts_at: datetime


@dataclass(frozen=True)
class RenewalTagged:
    tag: str


RenewalFact: TypeAlias = RenewalScheduled | RenewalTagged


def with_schedule(
    now: datetime,
    delay: timedelta,
) -> EmittingModifier[Renewal, RenewalError, RenewalFact]:
    def modify(current: Renewal) -> Result[Change[Renewal, RenewalFact], RenewalError]:
        if delay < timedelta(0):
            return Failure(RenewalError("negative_delay", "delay must not be negative"))
        starts_at = now + delay
        return Success(
            Change(
                value=replace(current, starts_at=starts_at),
                facts=(RenewalScheduled(starts_at),),
            )
        )

    return modify


def with_recorded_tag(
    tag: str,
) -> EmittingModifier[Renewal, RenewalError, RenewalFact]:
    def modify(current: Renewal) -> Result[Change[Renewal, RenewalFact], RenewalError]:
        if not tag:
            return Failure(RenewalError("missing_tag", "tag is required"))
        return Success(
            Change(
                value=replace(current, tags=(*current.tags, tag)),
                facts=(RenewalTagged(tag),),
            )
        )

    return modify
```

The laws are part of the helper's contract:

- `apply_emitting(initial)` returns `initial` and an empty tuple.
- Modifiers run left to right; later modifiers receive the previous successful value.
- Facts preserve modifier order and within-modifier order. Duplicates remain unless the domain forbids them.
- A no-op normally returns the unchanged value and no facts.
- The first `Failure` wins; later modifiers do not run.
- A late `Failure` exposes no earlier tentative value or facts.
- This is logical rollback, not compensation. It requires immutable values and no I/O.

Facts are frozen domain values, not log records, framework events, or broker payloads.

Use `lift_modifier` when an independently valid state-only modifier participates in one emitting pipeline. Do not run two pipelines or duplicate the modifier. If a state change forces a fact, keep both in one emitting modifier rather than lifting the state-only half.

## Total functions, rules, and reducers

Do not wrap a total calculation in `Result`:

```python
from toolz import pipe

normalized_name = pipe(raw_name, str.strip, str.casefold, collapse_whitespace)
```

Use `toolz.pipe` only when the repository already depends on Toolz. Ordinary nested or sequential calls are fine.

A reusable rule returns a structured problem or `None`. Keep field paths and presentation in its evaluator. A reducer is an ordinary function such as `(balance, entry) -> next_balance`; test it without the queue, iterator, or framework that supplies inputs.

## Settle after pure success

```python
result = apply_emitting(
    current,
    with_schedule(now, delay),
    with_recorded_tag("scheduled"),
)
if isinstance(result, Failure):
    return result

change = result.unwrap()
settlement.settle_renewal(change)
```

`settle_renewal` accepts the complete `Change` and writes the state plus mapped outbox records in one real transaction. `IOResult` and `FutureResult` may model settlement or asynchronous delivery in an application already using `returns`; they do not replace the pure modifier contract. An event-sourcing library may own pending events and a notification log when the whole application uses that architecture. Do not add one for this helper.

Map domain facts to integration messages outside the domain module. If state and delivered messages must become durable together, use the real transaction and an outbox. Delivery retries and idempotency remain adapter concerns.

## Prove the contracts

When the shared helpers are created or changed, put their law suite beside `functional.py`. Do not rely on domain tests to cover generic composition. Direct tests must prove exact values, stable error codes, order, short-circuiting, and non-mutation. For emitting pipelines, also prove:

- exact ordered facts across several modifiers;
- a successful no-fact modifier preserves the accumulator;
- a late failure returns the exact `Failure`, exposes no earlier facts, and skips later work; and
- tuples, frozen models, and rebuilt nested values do not alias mutable input storage.

Run the project's static type checker as part of the proof. Runtime tests cannot detect a generic alias whose error and fact parameters were declared in the wrong order.

Test settlement separately. A focused boundary test proves failure never invokes settlement and success supplies the exact change once. Use an integration test only for a guarantee owned by the real system, such as state and outbox rows committing or rolling back together. Never reshape a fixture into a state production cannot create merely to make that proof green.

## Pattern sources

- [WriterT](https://hackage.haskell.org/package/transformers/docs/Control-Monad-Trans-Writer-CPS.html) defines the `m (value, output)` algebra implemented by `Result[Change, Error]`.
- [`returns.Result`](https://returns.readthedocs.io/en/latest/pages/result.html) supplies the fail-fast carrier; the [module index](https://returns.readthedocs.io/en/latest/py-modindex.html) confirms that `returns` does not supply Writer.
- [The eventsourcing application layer](https://eventsourcing.readthedocs.io/en/stable/topics/application.html) is an optional full event-sourcing precedent for saving pending events and exposing a notification log. It is not required for the concrete helper.
- [Transactional outbox guidance](https://docs.aws.amazon.com/prescriptive-guidance/latest/cloud-design-patterns/transactional-outbox.html) defines the durability and idempotency concerns that begin after pure planning.
