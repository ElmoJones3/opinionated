# C++

Keep compatibility, backfill, restore, and failover as separate procedures. Use the codec and storage libraries already adopted by the repository.

## Mixed-version compatibility

```cpp
/** @file state_evolution.cpp
 *  @brief Keeps durable user history readable during mixed deployment.
 */
#include <cstdint>
#include <optional>
#include <stdexcept>
#include <string>
#include <utility>

/** @brief Carries every representation that can remain during rollout or rollback. */
struct StoredUser {
  /** @brief Selects the persisted codec. */ std::uint32_t schema_version;
  /** @brief Canonical value in version two; absent in version one. */ std::optional<std::string> display_name;
  /** @brief Derived compatibility value needed by old readers. */ std::string full_name;
};
/** @brief Accepts supported forms and rejects disagreement between dual-written values. */
std::string read_canonical(const StoredUser& stored) {
  if (stored.schema_version == 1) return stored.full_name;
  if (stored.schema_version != 2 || !stored.display_name || *stored.display_name != stored.full_name) throw std::invalid_argument("incompatible user representation");
  return *stored.display_name;
}
/** @brief Derives both forms from one canonical value for one atomic write. */
StoredUser write_expanded(std::string display_name) {
  return {2, display_name, std::move(display_name)};
}
```

Keep `full_name` until old processes, queued work, rollback images, and relevant backups leave the compatibility window.

## Resumable backfill

```cpp
#include <cstdint>
#include <string>
/** @brief Binds one resume position to a stable job and operation version. */
struct BackfillCheckpoint { /** @brief Identity retained across worker replacement. */ std::string work_id; /** @brief Refuses incompatible code on resume. */ std::string operation_version; /** @brief Last row committed by the ordered batch. */ std::string after_id; };
/** @brief Owns the conditional batch transaction and its production capacity reservation. */
class BackfillStore { public: /** @brief Transforms a bounded batch and advances its checkpoint atomically. */ virtual BackfillCheckpoint commit_batch(const BackfillCheckpoint& expected, std::uint32_t limit) = 0; /** @brief Allows destruction through the store adapter. */ virtual ~BackfillStore() = default; };
```

The repeated transformation must be harmless. A crash before commit advances neither rows nor checkpoint; resolve an ambiguous commit by `work_id`.

## Backup and restore

```cpp
#include <cstdint>
#include <optional>
#include <string>
/** @brief Owns authentication before trusted restore evidence can be constructed. */
class RestoreEvidenceVerifier;
/** @brief Carries restore evidence only after its source and scope are authenticated. */
class TrustedRestoreEvidence {
 public:
  /** @brief Proves data, schema, keys, config, and artifacts in scope. */
  bool snapshot_verified() const { return snapshot_verified_; }
  /** @brief Returns the canonical external range the trusted source covered. */
  const std::string& reconciliation_range() const { return reconciliation_range_; }
  /** @brief Returns the epoch binding this evidence to external authority. */
  std::uint64_t external_epoch() const { return external_epoch_; }

 private:
  /** @brief Lets only the authenticating adapter create trusted evidence. */
  friend class RestoreEvidenceVerifier;
  /** @brief Constructs evidence after the friend verifies source and scope. */
  TrustedRestoreEvidence(bool snapshot_verified, std::string reconciliation_range,
                         std::uint64_t external_epoch);
  /** @brief Retains verified snapshot scope. */
  bool snapshot_verified_;
  /** @brief Retains the canonical range proven by the external record. */
  std::string reconciliation_range_;
  /** @brief Retains the external epoch covered by this evidence. */
  std::uint64_t external_epoch_;
};
/** @brief Names facts trusted evidence must match exactly. */
struct ReopenRequirements {
  /** @brief Complete canonical external range recovery demanded. */
  std::string required_reconciliation_range;
  /** @brief Greatest authority epoch found anywhere in the restored snapshot. */
  std::uint64_t highest_restored_epoch;
  /** @brief Fresh epoch allocated outside restored state. */
  std::uint64_t expected_external_epoch;
};
/** @brief Keeps producers closed until trusted evidence satisfies requirements. */
struct RestoreGate {
  /** @brief Remains empty until the authenticating adapter verifies evidence. */
  std::optional<TrustedRestoreEvidence> evidence;
  /** @brief Remains true until the open transition commits. */
  bool producers_paused;
};
/** @brief Requires exact trusted range and epoch matches instead of token presence. */
bool can_reopen(const RestoreGate& gate, const ReopenRequirements& required) {
  if (!gate.producers_paused || !gate.evidence ||
      required.expected_external_epoch <= required.highest_restored_epoch) {
    return false;
  }
  /** evidence is authenticated but must still describe this recovery operation. */
  const auto& evidence = *gate.evidence;
  return evidence.snapshot_verified() &&
         evidence.reconciliation_range() == required.required_reconciliation_range &&
         evidence.external_epoch() == required.expected_external_epoch;
}
```

`RestoreEvidenceVerifier` must authenticate the signed or otherwise authoritative external record and canonicalize its range before constructing evidence. Scan the restored scope for `highest_restored_epoch`, then ask the independent allocator for `expected_external_epoch`; do not derive the expected value from restored state. The comparison proves only that the grant exceeds every epoch the snapshot reveals. Only the independent allocator can prove freshness relative to authorities and history outside that snapshot. No complete external record means the effect remains unknown. Measure RPO and RTO in a timed isolated restore for the named disaster and resources.

## Failover authority

```cpp
#include <cstdint>
#include <string>
/** @brief Binds routing to an independent fencing epoch. */
struct FailoverGrant { /** @brief Active destination generation. */ std::uint64_t route_generation; /** @brief Monotonic value unavailable to old or restored state. */ std::uint64_t disaster_epoch; /** @brief Sole writer for this generation and epoch. */ std::string owner; };
/** @brief Requires both routing and fencing authority to match. */
bool accepts_write(const FailoverGrant& current, const FailoverGrant& presented) { return current.route_generation == presented.route_generation && current.disaster_epoch == presented.disaster_epoch && current.owner == presented.owner; }
```

## Proof

Exercise every old/new codec pair and rollback after expanded writes. Crash backfill before and after commit, repeat a batch, and reject another operation version. Restore production storage into isolation with keys, schema, and artifacts, then reject untrusted evidence, a mismatched required range, and expected external epochs equal to or below the highest restored epoch before proving exact trusted evidence reopens dispatch. Race stale and current failover grants. Mark guarantees unverified when production storage, external history, or independent epoch authority is unavailable.
