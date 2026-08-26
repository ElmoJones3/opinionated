# C++ reference

Catalog display can accept a version-lag bound. Payment recovery requires a complete authority read.
Observation time remains diagnostic and never stands in for source freshness.

```cpp
/** This excerpt checks read evidence; the data service owns the actual consistency guarantees. */
#include <cstdint>
#include <optional>
#include <string>

/** Separates bounded display reads from effect-authorizing reads. */
enum class ReadStrength {
  bounded_stale,     ///< Permits stated lag from an authority watermark.
  authority_complete,///< Requires authority and complete effect coverage.
};

/** States what happens when the required read cannot be earned. */
enum class Fallback {
  refuse, ///< Prevents the decision.
  defer,  ///< Records that a later read is required.
};

/** States the contract for one key-scoped decision. */
struct ReadRequirement {
  std::string key_scope;                 ///< Names the object whose versions compare.
  std::string required_authority;        ///< Names the authority that defines this version space.
  ReadStrength strength;                 ///< Selects bounded stale or authority evidence.
  std::uint64_t expected_epoch;          ///< Rejects pre-failover versions.
  std::uint64_t minimum_version;         ///< Supplies read-your-writes progress.
  std::optional<std::uint64_t> max_version_lag; ///< Limits only bounded-stale reads.
  std::int64_t deadline_epoch_ms;        ///< Ends permission to wait in milliseconds.
  Fallback fallback;                     ///< Defines unavailable-source behavior.
};

/** Reports what one selected data path can prove. */
template <typename T>
struct ReadObservation {
  T value;                         ///< Carries data without upgrading its evidence.
  std::string key_scope;           ///< Repeats the exact object described by this evidence.
  std::string authority;           ///< Names the authority that issued versions and watermark.
  std::string source;              ///< Names primary, replica, cache, or projection.
  bool authoritative;             ///< Says whether this source owns writes.
  std::uint64_t epoch;             ///< Changes when ordinary versions can move backward.
  std::uint64_t version;           ///< Compares only within one key scope and epoch.
  std::uint64_t authority_watermark; ///< Is a comparable point supplied by authority.
  std::int64_t observed_at_epoch_ms; ///< Records read time but does not prove freshness.
  bool complete;                   ///< Covers accepted, queued, pending, and completed work.
};

/** Reports use, refusal, or deferral without weakening the requirement. */
enum class ReadDecision {
  use,    ///< The observation met the contract.
  refuse, ///< Weak evidence cannot authorize the decision.
  defer,  ///< Another read is required later.
};

/** Applies the declared fallback without changing requested strength. */
ReadDecision unavailable(const ReadRequirement& requirement) {
  return requirement.fallback == Fallback::refuse ? ReadDecision::refuse : ReadDecision::defer;
}

/** Accepts only evidence that meets epoch, progress, and requested strength. */
template <typename T>
ReadDecision decide_read(
    const ReadRequirement& requirement,
    const std::optional<ReadObservation<T>>& observation,
    std::int64_t now_epoch_ms) {
  if (now_epoch_ms >= requirement.deadline_epoch_ms || !observation.has_value()) return unavailable(requirement);
  if (observation->key_scope != requirement.key_scope ||
      observation->authority != requirement.required_authority ||
      observation->epoch != requirement.expected_epoch ||
      observation->version < requirement.minimum_version) {
    return unavailable(requirement);
  }
  if (requirement.strength == ReadStrength::authority_complete) {
    return observation->authoritative && observation->complete ? ReadDecision::use : unavailable(requirement);
  }
  if (!requirement.max_version_lag.has_value() || observation->authority_watermark < observation->version) {
    return unavailable(requirement);
  }
  return observation->authority_watermark - observation->version <= *requirement.max_version_lag
      ? ReadDecision::use
      : unavailable(requirement);
}

/** Keeps per-payment source order separate from arrival order. */
std::string sequence_decision(std::uint64_t last_applied, std::uint64_t incoming) {
  if (incoming <= last_applied) return "duplicate";
  return incoming == last_applied + 1 ? "apply" : "gap";
}
```

Use `bounded_stale` plus a maximum version lag for catalog display. Use `authority_complete` for
payment retry authorization and place the complete receiver identity in `key_scope`. The production adapter
must get its watermark and completeness evidence from the actual data service. C++ values cannot
provide read-your-writes or linearizability.

Direct tests cover key and authority mismatch, recent but lagging data, missing authority, unmet
session version, sequence gap, and failover epoch. Run read-after-write, partition fallback, and
failover tests against the deployed data system. A test double counts only if it reproduces that
system's replication lag, partition fallback, session progress, and failover behavior; otherwise
mark those claims unverified.
