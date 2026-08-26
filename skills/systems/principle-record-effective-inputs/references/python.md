# Python

Keep deterministic, stochastic, concurrent, and external claims separate. Record the effective value and the code or library version that gave it meaning.

## Deterministic decision and exact artifact

```python
"""Record effective inputs for recovery decisions and replay."""

from dataclasses import dataclass
import hashlib


@dataclass(frozen=True)
class RecoveryInputs:
    """Contain every value allowed to change the deterministic decision."""

    now_ms: int  # Injected UTC epoch time in milliseconds.
    next_eligible_ms: int  # Persisted retry boundary in the same units.
    policy_version: str  # Exact retry-rule version.
    operation_version: str  # Exact decision implementation version.


def may_retry(item: RecoveryInputs) -> bool:
    """Return the same result for the same complete effective input."""
    return (
        item.policy_version == "retry/v3"
        and item.operation_version == "recover/v2"
        and item.now_ms >= item.next_eligible_ms
    )


@dataclass(frozen=True)
class ExactRequest:
    """Retain the final bytes sent after normalization and defaults."""

    body: bytes  # Exact request bytes under the retention and access policy.
    sha256: str  # Hex digest of those exact bytes.


@dataclass(frozen=True)
class RedactedRequest:
    """Carry diagnostics without claiming to preserve exact request bytes."""

    summary: str  # Protected fields removed by policy.
    original_digest: str  # Correlation identity that cannot reconstruct the request.


def record_exact_request(body: bytes) -> ExactRequest:
    """Hash the final immutable bytes rather than an earlier request object."""
    return ExactRequest(body=body, sha256=hashlib.sha256(body).hexdigest())
```

## Stochastic jitter

```python
import math
from dataclasses import dataclass
from typing import Protocol


class UnitRandom(Protocol):
    """Supply one documented random sample in the half-open interval [0, 1)."""

    def random(self) -> float:
        """Return the next intentional stochastic input."""
        ...


@dataclass(frozen=True)
class JitterRecord:
    """Retain the sample and selected delay in milliseconds."""

    sample: float  # Effective random input.
    delay_ms: int  # Integer delay in the inclusive range [0, maximum_ms].


# MAX_EXACT_JITTER_MS leaves room for an inclusive bucket count in binary64.
MAX_EXACT_JITTER_MS = (1 << 53) - 2


def sample_jitter(maximum_ms: int, source: UnitRandom) -> JitterRecord:
    """Map one unit sample into an inclusive, exactly represented integer bound."""
    if (
        isinstance(maximum_ms, bool)
        or not isinstance(maximum_ms, int)
        or not 0 <= maximum_ms <= MAX_EXACT_JITTER_MS
    ):
        raise ValueError(f"maximum_ms must be an integer in [0, {MAX_EXACT_JITTER_MS}]")
    # sample is retained because it is an effective stochastic input.
    sample = source.random()
    if isinstance(sample, bool) or not isinstance(sample, (int, float)):
        raise ValueError("random sample must be numeric")
    # normalized_sample gives math.isfinite one stable binary64 policy input.
    normalized_sample = float(sample)
    if not math.isfinite(normalized_sample) or not 0.0 <= normalized_sample < 1.0:
        raise ValueError("random sample must be finite and in [0, 1)")
    # bucket_count is exact in binary64 because maximum_ms stays below the checked limit.
    bucket_count = maximum_ms + 1
    return JitterRecord(
        sample=normalized_sample,
        delay_ms=int(normalized_sample * bucket_count),
    )
```

## Concurrent schedule evidence

```python
from dataclasses import dataclass
from typing import Protocol


@dataclass(frozen=True)
class ScheduleStep:
    """Record one controlled synchronization decision without assigning probability."""

    sequence: int  # Observed total order for this run.
    actor: str  # Controlled task or thread name.
    event: str  # Named synchronization point reached by the actor.


class ScheduleRecorder(Protocol):
    """Capture interleavings selected by the test coordinator."""

    def reached(self, actor: str, event: str) -> None:
        """Block or record at one named synchronization point."""
        ...
```

## External outcome and replay sink

```python
from dataclasses import dataclass
from typing import Literal, Protocol


@dataclass(frozen=True)
class ProviderOutcome:
    """Retain evidence chosen by an external system and impossible to regenerate."""

    effect_id: str  # Identity that binds the observation to one request.
    state: Literal["confirmed", "refused", "unknown"]  # Normalized provider result.
    observed_at_ms: int  # UTC epoch time in milliseconds.


class EffectSink(Protocol):
    """Receive replay output without production authority or credentials."""

    def emit(self, effect_id: str, body: bytes) -> None:
        """Store one replayed request in an isolated environment."""
        ...


def replay(effect_id: str, request: ExactRequest, sink: EffectSink) -> None:
    """Send replay output only to the explicitly supplied isolated sink."""
    sink.emit(effect_id, request.body)
```

## Proof

Assert exact deterministic mappings and reject hidden clock, configuration, or version reads. Prove rejection of invalid jitter maxima and samples plus the inclusive bound for every accepted input. Use repeated trials only for a distribution claim supported by the random source and numeric mapping. Control async tasks with events or barriers, not sleeps. Build replay without production credentials or adapters. If only redacted evidence survives, mark exact replay unverified.
