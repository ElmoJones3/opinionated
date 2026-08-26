# C++ reference

Use a protocol timestamp or remaining budget between processes. Convert it to a local
`steady_clock` deadline for elapsed-time enforcement. The policy below stays independent of both
clock and random-engine globals.

```cpp
/** This excerpt decides payment retries; production adapters own budget and capacity enforcement. */
#include <algorithm>
#include <chrono>
#include <cstdint>
#include <limits>
#include <memory>
#include <stdexcept>
#include <string>

/** Records what the previous provider invocation established. */
enum class PriorEvidence {
  local_refusal,              ///< The invocation never left.
  transient_receiver_refusal,///< Receiver policy permits retry.
  terminal_receiver_refusal, ///< Receiver policy forbids retry.
  pending,                    ///< The receiver may still complete.
  unknown,                    ///< The provider effect may exist.
  programmer_defect,          ///< Repetition cannot repair local logic.
};

/** Contains the full policy state before another provider call. */
struct RetryInput {
  std::string effect_key;             ///< Remains stable across equivalent calls.
  std::string capacity_scope;         ///< Names the admission limit charged by the call.
  PriorEvidence prior;                ///< Explains why retry is being considered.
  bool receiver_enforces_idempotency; ///< Means equivalent calls converge at the receiver.
  std::uint32_t remaining_calls;      ///< Counts calls across visible retry layers.
  std::uint64_t remaining_cost_cents; ///< Limits additional cost in minor units.
  std::uint64_t next_call_cost_cents; ///< Charges the next physical call in minor units.
  std::int64_t now_epoch_ms;          ///< Is supplied protocol time in milliseconds.
  std::int64_t deadline_epoch_ms;     ///< Ends permission to start at this time.
};

/** Names the only permitted next action. */
enum class RetryDecision {
  reserve_retry,         ///< Permits reservation, not an uncounted call.
  stop_terminal_refusal,///< Preserves a final receiver result.
  stop_defect,           ///< Prevents repetition of broken local logic.
  stop_budget_exhausted, ///< Ends calls without rewriting an unknown outcome.
  stop_deadline_expired, ///< Rejects a late new call.
  needs_attention,       ///< Preserves an unknown unprotected effect.
};

/** Allows an unknown repeat only under receiver-enforced idempotency. */
RetryDecision decide_retry(const RetryInput& input) {
  if (input.prior == PriorEvidence::terminal_receiver_refusal) return RetryDecision::stop_terminal_refusal;
  if (input.prior == PriorEvidence::programmer_defect) return RetryDecision::stop_defect;
  if ((input.prior == PriorEvidence::unknown || input.prior == PriorEvidence::pending) &&
      !input.receiver_enforces_idempotency) return RetryDecision::needs_attention;
  if (input.remaining_calls == 0 || input.remaining_cost_cents < input.next_call_cost_cents) {
    return RetryDecision::stop_budget_exhausted;
  }
  return input.now_epoch_ms >= input.deadline_epoch_ms
      ? RetryDecision::stop_deadline_expired
      : RetryDecision::reserve_retry;
}

/** Spreads one retry inside a capped exponential millisecond window. */
std::chrono::milliseconds full_jitter_delay(
    unsigned attempt,
    std::chrono::milliseconds base,
    std::chrono::milliseconds cap,
    std::uint32_t sample_ppm) {
  if (base.count() < 0 || cap.count() < 0 || sample_ppm >= 1'000'000) {
    throw std::invalid_argument("retry inputs violate duration or sample bounds");
  }
  /** Upper stops doubling at cap to avoid duration overflow. */
  auto upper = std::min(base, cap);
  /** Step counts completed policy doublings without reading a clock. */
  for (unsigned step = 0; step < attempt && upper < cap; ++step) {
    upper = upper > cap / 2 ? cap : upper * 2;
  }
  /** Whole and remainder avoid overflowing the duration during fixed-point scaling. */
  const auto whole = upper.count() / 1'000'000;
  /** Remainder retains sub-million precision while its product stays bounded. */
  const auto remainder = upper.count() % 1'000'000;
  return std::chrono::milliseconds{
      whole * sample_ppm + remainder * sample_ppm / 1'000'000};
}

/** Exposes multiplication between independent retry layers. */
std::uint64_t worst_case_physical_calls(
    std::uint64_t orchestrator_attempts,
    std::uint64_t client_calls_per_attempt) {
  if (client_calls_per_attempt != 0 &&
      orchestrator_attempts > std::numeric_limits<std::uint64_t>::max() / client_calls_per_attempt) {
    throw std::overflow_error("nested retry call count overflows uint64");
  }
  return orchestrator_attempts * client_calls_per_attempt;
}

/** Owns one atomic attempt-and-budget reservation immediately before a call. */
class RetryStore {
 public:
  /** Allows cleanup through the durable boundary. */
  virtual ~RetryStore() = default;
  /** Returns false when concurrency or exhaustion consumed the remaining budget. */
  virtual bool reserve(
      const std::string& effect_key,
      std::uint32_t expected_remaining_calls,
      std::uint64_t cost_cents) = 0;
};

/** Holds one admitted slot until its concrete destructor releases capacity. */
class CapacityPermit {
 public:
  /** Releases the shared slot through the concrete RAII implementation. */
  virtual ~CapacityPermit() = default;
};

/** Enforces the configured local, tenant, dependency, or global scope. */
class CapacityAuthority {
 public:
  /** Allows cleanup through the admission boundary. */
  virtual ~CapacityAuthority() = default;
  /** Returns no permit when recovery traffic reached the shared limit. */
  virtual std::unique_ptr<CapacityPermit> try_acquire(const std::string& scope) = 0;
};
```

After `reserve`, acquire the scoped capacity permit with RAII, recheck the local monotonic deadline,
then issue one provider call. Include lower-level client retries in the worst-case call count. This
framework-neutral example makes no Temporal C++ SDK claim.

Use a fake clock and fixed samples for every decision and jitter boundary. Count nested physical
calls exactly. Exercise concurrent budget reservation through the production database client or
mark it unverified.
