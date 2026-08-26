# Python

Each example owns one control. An `asyncio` gate is process-local; use the application's deployed coordinator for a global promise.

## Admission and concurrency

```python
"""Bound provider work admitted by one asyncio event loop."""

from collections.abc import Awaitable, Callable
from dataclasses import dataclass
from typing import Generic, TypeVar

# Result preserves the admitted callable's value without hiding refusal as an exception.
Result = TypeVar("Result")


@dataclass(frozen=True)
class Completed(Generic[Result]):
    """Carry any value returned by an admitted provider call."""

    value: Result  # Application result kept distinct from admission state.


@dataclass(frozen=True)
class CapacityRefused:
    """Prove the provider call did not start because no local slot was available."""


class LocalGate:
    """Refuse immediately when this process has no provider slot."""

    def __init__(self, capacity: int) -> None:
        """Create exactly `capacity` slots owned by this event loop."""
        if capacity < 1:
            raise ValueError("provider capacity must be positive")
        self._capacity = capacity  # Fixed process-local promise.
        self._in_flight = 0  # Count changed only by synchronous event-loop methods.

    def try_acquire(self) -> bool:
        """Reserve one slot without yielding, or refuse before work starts."""
        if self._in_flight >= self._capacity:
            return False
        self._in_flight += 1
        return True

    def release(self) -> None:
        """Return one owned slot without yielding; underflow exposes a defect."""
        if self._in_flight == 0:
            raise RuntimeError("provider permit released without ownership")
        self._in_flight -= 1


async def with_provider_slot(
    gate: LocalGate, call: Callable[[], Awaitable[Result]]
) -> Completed[Result] | CapacityRefused:
    """Put ordinary and recovery calls through one unambiguous admission result."""
    if not gate.try_acquire():
        return CapacityRefused()
    try:
        return Completed(await call())
    finally:
        # Synchronous release completes before cancellation propagates to the caller.
        gate.release()
```

## Retry amplification

```python
from dataclasses import dataclass


@dataclass(frozen=True)
class CallBudget:
    """Count physical provider calls across workflow, client, and recovery retries."""

    remaining: int  # Calls still allowed; unknown outcomes consume one.

    def consume(self) -> "CallBudget | None":
        """Reserve one physical call or refuse before contacting the provider."""
        return CallBudget(self.remaining - 1) if self.remaining > 0 else None
```

Pass the returned budget into the next layer. For shared or durable scope, store and decrement the budget atomically instead of sharing this value between tasks.

Task cancellation stops local waiting and releases the local permit. It does not prove that a provider effect already sent was cancelled or failed.

Permit release says only that the local adapter call returned or unwound; remote work may still be running. Represent a deliberately closed gate as an explicit admission mode rather than constructing one with zero capacity.

## Circuit breaking

```python
from dataclasses import dataclass
from typing import Literal


@dataclass(frozen=True)
class BreakerState:
    """Represent serialized circuit state at the scope named by the claim."""

    kind: Literal["closed", "open", "half_open"]  # Current admission state.
    retry_at_ms: int = 0  # Injected monotonic deadline in milliseconds.
    probe_owner: str | None = None  # Only caller allowed to issue the half-open probe.


def request_probe(
    state: BreakerState, now_ms: int, caller_id: str
) -> tuple[BreakerState, bool]:
    """Derive probe ownership without reading wall time or mutating shared state."""
    if state.kind == "open" and now_ms >= state.retry_at_ms:
        return BreakerState("half_open", probe_owner=caller_id), True
    return state, state.kind == "half_open" and state.probe_owner == caller_id
```

The caller must commit the returned state with a conditional version update. The breaker reduces waste; it does not mark in-flight external effects failed.

## Global limit and objective

```python
from dataclasses import dataclass
from typing import Protocol


class GlobalLimiter(Protocol):
    """Use the deployed coordinator instead of one process counter."""

    async def reserve(self, tenant_id: str, cost_units: int) -> str:
        """Return reserved, limited, or coordinator_unavailable atomically."""
        ...


@dataclass(frozen=True)
class DeliverySample:
    """Define one member of the measured delivery population."""

    workload_class: str  # Fixed label such as ordinary or recovery.
    accepted_at_ms: int  # UTC epoch measurement start in milliseconds.
    terminal_at_ms: int | None  # Completion point; None means unresolved.
```

State the coordinator-outage policy and the SLI population, points, exclusions, and window. Do not use tenant, run, or effect identities as metric labels.

## Proof

Use events to hold calls and assert exact peak concurrency without sleeps. Cancel calls at each await and prove one release. Count all physical calls, including recovery. Race half-open candidates against the production state owner. Exercise the deployed limiter and its outage behavior; mark global enforcement unverified when that system is unavailable.
