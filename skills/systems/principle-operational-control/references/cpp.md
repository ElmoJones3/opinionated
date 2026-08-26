# C++

Each example owns one control. `std::counting_semaphore` is process-local; a global promise needs the deployed coordinator.

## Admission and concurrency

```cpp
/** @file operational_control.cpp
 *  @brief Bounds provider work admitted by one process.
 */
#include <cstddef>
#include <optional>
#include <semaphore>
#include <stdexcept>
#include <utility>

/** @brief Owns one process-local slot and releases it once through RAII. */
class Permit {
 public:
  /** @brief Takes ownership of one already-acquired semaphore slot. */
  explicit Permit(std::counting_semaphore<1024>& slots) : slots_(&slots) {}
  /** @brief Transfers release ownership without duplicating the permit. */
  Permit(Permit&& other) noexcept : slots_(std::exchange(other.slots_, nullptr)) {}
  /** @brief Returns the slot on normal return, exception, or cancellation unwind. */
  ~Permit() { if (slots_ != nullptr) slots_->release(); }
  Permit(const Permit&) = delete;
  Permit& operator=(const Permit&) = delete;
 private:
  /** @brief Non-owning pointer whose presence means this object owns one release. */
  std::counting_semaphore<1024>* slots_;
};

/** @brief Refuses immediately unless this process can reserve a provider slot. */
class LocalGate {
 public:
  /** @brief Creates a positive gate whose bound cannot exceed the semaphore maximum. */
  explicit LocalGate(std::ptrdiff_t capacity) : slots_(validated_capacity(capacity)) {}
  /** @brief Returns an owning permit, or empty before work starts at capacity. */
  std::optional<Permit> try_acquire() {
    if (!slots_.try_acquire()) return std::nullopt;
    return Permit{slots_};
  }
 private:
  /** @brief Rejects invalid configuration before constructing the semaphore. */
  static std::ptrdiff_t validated_capacity(std::ptrdiff_t capacity) {
    if (capacity < 1 || capacity > 1024) throw std::invalid_argument("provider capacity must be in [1, 1024]");
    return capacity;
  }
  /** @brief Enforces the process-local physical-call bound atomically. */
  std::counting_semaphore<1024> slots_;
};
```

Ordinary and recovery calls must receive the same `LocalGate` when they share one provider limit.

Permit destruction says only that the local adapter call returned or unwound; remote work may still be running. Represent a deliberately closed gate as an explicit admission mode instead of constructing one with zero capacity.

## Retry amplification

```cpp
#include <cstdint>
#include <optional>
/** @brief Counts physical provider calls across every retry layer. */
struct CallBudget { /** @brief Calls still allowed; unknown outcomes consume one. */ std::uint32_t remaining; };
/** @brief Reserves one physical call or refuses before contacting the provider. */
std::optional<CallBudget> consume(CallBudget budget) {
  if (budget.remaining == 0) return std::nullopt;
  --budget.remaining;
  return budget;
}
```

Pass the returned value through workflow, client, and recovery retries. A shared or durable budget needs one atomic store owner.

Cancellation or a deadline can end local waiting and release a permit. It does not prove that a provider effect already sent was cancelled or failed.

## Circuit breaking

```cpp
#include <cstdint>
#include <string>
#include <utility>
/** @brief Holds serialized circuit state at the scope named by the claim. */
struct BreakerState { /** @brief Closed, open, or half_open. */ std::string kind; /** @brief Injected monotonic deadline in milliseconds. */ std::int64_t retry_at_ms; /** @brief Sole authorized probe caller. */ std::string probe_owner; };
/** @brief Contains the proposed serialized state and this caller's probe authority. */
struct ProbeDecision { /** @brief State committed by conditional version update. */ BreakerState state; /** @brief True only for the chosen probe owner. */ bool allowed; };
/** @brief Derives half-open ownership without reading a clock or shared state. */
ProbeDecision request_probe(BreakerState state, std::int64_t now_ms, const std::string& caller_id) {
  if (state.kind == "open" && now_ms >= state.retry_at_ms) return {{"half_open", 0, caller_id}, true};
  return {state, state.kind == "half_open" && state.probe_owner == caller_id};
}
```

## Global limit and objective

```cpp
#include <cstdint>
#include <string>
/** @brief Uses the deployed coordinator for a global rather than process-local limit. */
class GlobalLimiter { public: /** @brief Atomically returns reserved, limited, or coordinator_unavailable. */ virtual std::string reserve(std::string tenant_id, std::uint64_t cost_units) = 0; /** @brief Allows destruction through the adapter. */ virtual ~GlobalLimiter() = default; };
/** @brief Defines one member of the delivery SLI population. */
struct DeliverySample { /** @brief Fixed label such as ordinary or recovery. */ std::string workload_class; /** @brief UTC epoch population start in milliseconds. */ std::int64_t accepted_at_ms; /** @brief Completion point, or negative while unresolved. */ std::int64_t terminal_at_ms; };
```

State coordinator-outage behavior. Fail closed, preallocated local shares, or a documented weaker promise are distinct. Keep unique identities out of metric labels.

## Proof

Use C++20 latches or barriers to hold calls and assert the exact peak. Throw from each call path and prove RAII releases once. Count physical calls across every retry layer. Race half-open requests against the actual state owner. Exercise the deployed global coordinator and outage mode; otherwise mark global enforcement unverified.
