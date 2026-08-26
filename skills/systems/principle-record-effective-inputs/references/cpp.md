# C++

Keep deterministic, stochastic, concurrent, and external claims separate. A seeded engine is reproducible only with its algorithm, implementation versions, and relevant execution order fixed.

## Deterministic decision and exact artifact

```cpp
/** @file effective_inputs.cpp
 *  @brief Makes recovery inputs and retained request evidence explicit.
 */
#include <cstddef>
#include <cstdint>
#include <string>
#include <vector>

/** @brief Contains every value allowed to change the deterministic decision. */
struct RecoveryInputs {
  /** @brief Injected UTC epoch time in milliseconds. */ std::int64_t now_ms;
  /** @brief Persisted retry boundary in the same units. */ std::int64_t next_eligible_ms;
  /** @brief Exact retry-rule version. */ std::string policy_version;
  /** @brief Exact decision implementation version. */ std::string operation_version;
};
/** @brief Returns the same result for the same complete effective input. */
bool may_retry(const RecoveryInputs& input) {
  return input.policy_version == "retry/v3" && input.operation_version == "recover/v2" && input.now_ms >= input.next_eligible_ms;
}
/** @brief Calculates a digest with the cryptographic dependency maintained by the project. */
class RequestHasher {
 public:
  /** @brief Returns the algorithm name and digest for the exact supplied bytes. */
  virtual std::string sha256(const std::vector<std::byte>& bytes) const = 0;
  /** @brief Allows destruction through the hashing interface. */
  virtual ~RequestHasher() = default;
};
/** @brief Retains copied bytes and their digest without exposing mutable storage. */
class ExactRequest {
 public:
  /** @brief Copies final bytes before hashing the retained snapshot. */
  ExactRequest(const std::vector<std::byte>& final_bytes,
               const RequestHasher& hasher)
      : bytes_(final_bytes), digest_(hasher.sha256(bytes_)) {}

  /** @brief Returns a replay copy that cannot change retained evidence. */
  std::vector<std::byte> copy_bytes() const { return bytes_; }

  /** @brief Returns a digest copy that cannot replace retained evidence. */
  std::string digest() const { return digest_; }

 private:
  /** @brief Exact retained bytes under the request access policy. */
  const std::vector<std::byte> bytes_;
  /** @brief Algorithm name and digest for bytes_, for example sha256:hex. */
  const std::string digest_;
};
/** @brief Carries diagnostics but cannot satisfy exact replay. */
struct RedactedRequest { /** @brief Protected fields removed by policy. */ std::string summary; /** @brief Correlation digest that cannot recover bytes. */ std::string original_digest; };
```

Implement `RequestHasher` with the maintained cryptographic library already in the repository. Do not add a second crypto dependency for this example.

## Stochastic jitter

```cpp
#include <cmath>
#include <cstdint>
#include <stdexcept>
/** @brief Supplies one documented sample in the half-open interval [0, 1). */
class UnitRandom {
 public:
  /** @brief Returns the next intentional stochastic input. */
  virtual double next() = 0;
  /** @brief Allows destruction through the interface. */
  virtual ~UnitRandom() = default;
};
/** @brief Retains the sample and selected delay in milliseconds. */
struct JitterRecord {
  /** @brief Effective random input. */ double sample;
  /** @brief Integer delay in the inclusive range [0, maximum_ms]. */ std::int64_t delay_ms;
};
/** @brief Largest maximum whose inclusive bucket count is exact in binary64. */
constexpr std::int64_t max_exact_jitter_ms = (std::int64_t{1} << 53) - 2;
/** @brief Maps one unit sample into an inclusive, exactly represented integer bound. */
JitterRecord sample_jitter(std::int64_t maximum_ms, UnitRandom& source) {
  if (maximum_ms < 0 || maximum_ms > max_exact_jitter_ms) {
    throw std::out_of_range("maximum_ms is outside the exactly represented range");
  }
  /** sample is retained because it is an effective stochastic input. */
  const double sample = source.next();
  if (!std::isfinite(sample) || sample < 0.0 || sample >= 1.0) {
    throw std::out_of_range("random sample must be finite and in [0,1)");
  }
  /** bucket_count is exact in binary64 because maximum_ms stays below the checked limit. */
  const double bucket_count = static_cast<double>(maximum_ms + 1);
  return {sample, static_cast<std::int64_t>(sample * bucket_count)};
}
```

## Concurrent schedule evidence

```cpp
#include <cstdint>
#include <string>
/** @brief Records one controlled synchronization decision without assigning probability. */
struct ScheduleStep { /** @brief Observed total order for this run. */ std::uint64_t sequence; /** @brief Controlled thread name. */ std::string actor; /** @brief Named synchronization point. */ std::string event; };
/** @brief Captures interleavings selected by a test coordinator. */
class ScheduleRecorder { public: /** @brief Blocks or records at one synchronization point. */ virtual void reached(std::string actor, std::string event) = 0; /** @brief Allows destruction through the interface. */ virtual ~ScheduleRecorder() = default; };
```

## External outcome and replay sink

```cpp
#include <cstdint>
#include <string>
#include <vector>
/** @brief Retains evidence chosen by an external system. */
struct ProviderOutcome { /** @brief Identity binding evidence to one request. */ std::string effect_id; /** @brief Confirmed, refused, or unknown. */ std::string state; /** @brief UTC epoch observation time in milliseconds. */ std::int64_t observed_at_ms; };
/** @brief Receives replay output without production authority. */
class EffectSink {
 public:
  /** @brief Takes ownership of one replay copy in an isolated environment. */
  virtual void emit(std::string effect_id, std::vector<std::byte> body) = 0;
  /** @brief Allows destruction through the interface. */
  virtual ~EffectSink() = default;
};
/** @brief Routes replay only through the explicitly supplied isolated sink. */
void replay(const std::string& effect_id, const ExactRequest& request,
            EffectSink& sink) {
  sink.emit(effect_id, request.copy_bytes());
}
```

## Proof

Assert exact deterministic mappings and fail on hidden clocks, configuration, or version reads. Mutate the source vector and every returned replay copy, then prove retained bytes and digest remain unchanged. Prove rejection of invalid jitter maxima and samples plus the inclusive bound for every accepted input. Use repeated trials only for a distribution claim supported by the random source and numeric mapping. Control threads with latches or barriers, never timing guesses. Construct replay without production credentials or adapters. Mark exact replay unverified when only a redacted record survives.
