# Python reference

The pure policy takes time and a random sample as data. The caller still has to reserve durable
budget, acquire capacity, recheck the deadline, and issue one accounted provider call.

```python
"""Decide payment retries without hidden clocks, randomness, or storage guarantees."""

from dataclasses import dataclass
from enum import Enum
from typing import Protocol


class PriorEvidence(Enum):
    """Records what the previous provider invocation established."""

    LOCAL_REFUSAL = "local_refusal"  # The invocation never left.
    TRANSIENT_RECEIVER_REFUSAL = "transient_receiver_refusal"  # Receiver policy permits retry.
    TERMINAL_RECEIVER_REFUSAL = "terminal_receiver_refusal"  # Receiver policy forbids retry.
    PENDING = "pending"  # The receiver may still complete.
    UNKNOWN = "unknown"  # The provider effect may exist.
    PROGRAMMER_DEFECT = "programmer_defect"  # Repetition cannot repair local logic.


@dataclass(frozen=True)
class RetryInput:
    """Contains the full policy state before another provider call."""

    effect_key: str  # Remains stable across equivalent provider invocations.
    capacity_scope: str  # Names the tenant and dependency admission limit charged by the call.
    prior: PriorEvidence  # Explains why another invocation is being considered.
    receiver_enforces_idempotency: bool  # Means equivalent calls converge at the receiver.
    remaining_calls: int  # Counts physical calls across visible retry layers.
    remaining_cost_cents: int  # Limits additional provider cost in minor units.
    next_call_cost_cents: int  # Charges the next physical call in minor units.
    now_ms: int  # Is an explicitly supplied epoch-millisecond protocol value.
    deadline_ms: int  # Ends permission to start calls at this epoch millisecond.


class RetryDecision(Enum):
    """Names the only permitted next actions."""

    RESERVE_RETRY = "reserve_retry"  # Permits reservation, not an uncounted call.
    STOP_TERMINAL_REFUSAL = "stop_terminal_refusal"  # Preserves a final receiver result.
    STOP_DEFECT = "stop_defect"  # Prevents repetition of broken local logic.
    STOP_BUDGET_EXHAUSTED = "stop_budget_exhausted"  # Ends calls without rewriting outcome.
    STOP_DEADLINE_EXPIRED = "stop_deadline_expired"  # Rejects a late new call.
    NEEDS_ATTENTION = "needs_attention"  # Preserves an unknown unprotected effect.


def decide_retry(value: RetryInput) -> RetryDecision:
    """Allow an unknown repeat only under receiver-enforced idempotency."""
    if value.remaining_calls < 0 or value.remaining_cost_cents < 0 or value.next_call_cost_cents < 0:
        return RetryDecision.STOP_DEFECT
    if value.prior is PriorEvidence.TERMINAL_RECEIVER_REFUSAL:
        return RetryDecision.STOP_TERMINAL_REFUSAL
    if value.prior is PriorEvidence.PROGRAMMER_DEFECT:
        return RetryDecision.STOP_DEFECT
    if value.prior in {PriorEvidence.UNKNOWN, PriorEvidence.PENDING} and not value.receiver_enforces_idempotency:
        return RetryDecision.NEEDS_ATTENTION
    if value.remaining_calls < 1 or value.remaining_cost_cents < value.next_call_cost_cents:
        return RetryDecision.STOP_BUDGET_EXHAUSTED
    if value.now_ms >= value.deadline_ms:
        return RetryDecision.STOP_DEADLINE_EXPIRED
    return RetryDecision.RESERVE_RETRY


def full_jitter_delay_ms(attempt: int, base_ms: int, cap_ms: int, sample: float) -> int:
    """Spread one retry inside a capped exponential millisecond window."""
    if attempt < 0 or base_ms < 0 or cap_ms < 0 or not 0.0 <= sample < 1.0:
        raise ValueError("retry inputs violate non-negative units or the [0, 1) sample contract")
    upper_ms = min(base_ms, cap_ms)  # Caps each doubling before integers become needlessly large.
    # _step counts completed policy doublings without reading a clock.
    for _step in range(attempt):
        upper_ms = min(cap_ms, upper_ms * 2)
    return int(sample * upper_ms)


def worst_case_physical_calls(
    orchestrator_attempts: int, client_calls_per_attempt: int
) -> int:
    """Expose multiplication between independent retry layers."""
    if orchestrator_attempts < 0 or client_calls_per_attempt < 0:
        raise ValueError("retry layer counts must be non-negative")
    return orchestrator_attempts * client_calls_per_attempt


class RetryStore(Protocol):
    """Owns one atomic attempt-and-budget reservation immediately before a call."""

    def reserve(self, effect_key: str, expected_calls: int, cost_cents: int) -> bool:
        """Return false when concurrency or exhaustion consumed the budget."""
        ...


class CapacityPermit(Protocol):
    """Holds one admitted slot until the invocation settles locally."""

    def release(self) -> None:
        """Return the shared slot exactly once in the caller's finally block."""
        ...


class CapacityAuthority(Protocol):
    """Enforces the configured local, tenant, dependency, or global scope."""

    def try_acquire(self, scope: str) -> CapacityPermit | None:
        """Return no permit when recovery traffic reached the shared limit."""
        ...
```

Call in this order: durable reservation, capacity admission, deadline recheck, one provider
invocation. Include any HTTP-client retry in the durable physical-call budget.

If the repository uses Temporal's Python SDK, Activity retry policy is one layer. Keep the business
effect key stable across Activity retries and Continue-As-New. Activity attempt numbers and Workflow
Run IDs are not effect keys. Account for client retries Temporal cannot see. Heartbeats record
resumable progress; timeout or cancellation does not prove the provider stopped.

Test each branch, jitter bounds, and exact nested call counts with supplied inputs. Exercise
concurrent reservation against the production store or mark the claim unverified.
