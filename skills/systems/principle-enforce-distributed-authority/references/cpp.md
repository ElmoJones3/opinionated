# C++ reference

The database clock decides expiry. Worker 17 can resume after worker 18 takes over, so the protected
PostgreSQL write compares both the exact authority term and the record version.

```cpp
/** This excerpt carries fencing values; PostgreSQL performs the actual conditional write. */
#include <chrono>
#include <cstddef>
#include <cstdint>
#include <optional>
#include <string>
#include <vector>

/** Prevents ownership generations from being reused after restore. */
struct AuthorityTerm {
  std::uint64_t disaster_epoch; ///< Comes from outside the restored snapshot.
  std::uint64_t fencing_token;  ///< Increases for each ownership change in the epoch.
};

/** Is temporary permission granted by database time and the current row. */
struct WorkClaim {
  std::string work_id;          ///< Selects the one protected work row.
  std::string owner_id;         ///< Names the worker for audit, not fencing by itself.
  AuthorityTerm term;           ///< Identifies the exact ownership generation.
  std::uint64_t record_version; ///< Rejects equal-token completion races.
  std::int64_t lease_expires_at_epoch_ms; ///< Is produced by PostgreSQL in milliseconds.
};

/** Binds output to the ownership generation that produced it. */
struct Completion {
  std::string work_id;          ///< Repeats the claimed work identity.
  AuthorityTerm term;           ///< Repeats the exact claim term.
  std::uint64_t expected_version; ///< Repeats the claimed record version.
  std::vector<std::byte> result; ///< Is stored only if PostgreSQL accepts authority.
};

/** Owns PostgreSQL claim, renewal, and conditional completion transactions. */
class WorkStore {
 public:
  /** Allows cleanup through the authority boundary. */
  virtual ~WorkStore() = default;
  /** Claims one row in a short transaction and uses database time for expiry. */
  virtual std::optional<WorkClaim> claim(
      const std::string& owner_id,
      std::chrono::milliseconds lease_duration,
      std::uint64_t active_epoch) = 0;
  /** Renews only while owner, term, version, and running state remain current. */
  virtual std::optional<WorkClaim> renew(
      const WorkClaim& claim, std::chrono::milliseconds lease_duration) = 0;
  /** Returns false after lost authority and guarantees no result write occurred. */
  virtual bool complete(const Completion& completion) = 0;
};

/** Reports a rejected conditional write as stale authority. */
std::string finalize(WorkStore& store, const Completion& completion) {
  return store.complete(completion) ? "completed" : "stale";
}
```

Use the production SQL client already selected by the repository. A PostgreSQL adapter may use a
short `FOR UPDATE SKIP LOCKED` claim transaction and this protected completion:

```sql
-- PostgreSQL enforces exact-current epoch, token, state, and version in the protected write.
UPDATE work
SET state = 'completed', result = $5, version = version + 1
WHERE work_id = $1
  AND state = 'running'
  AND disaster_epoch = $2
  AND fencing_token = $3
  AND version = $4;
-- Zero changed rows means authority was lost; no result was committed.
```

Do not keep the claim lock open during work. Local fencing cannot stop an external provider unless
that receiver checks the term. Otherwise use stable receiver idempotency and define late-effect
handling.

Run claim, renewal, takeover, stale completion, and equal-token races against real PostgreSQL. A
restore test must obtain an epoch from a non-rollbackable source outside the snapshot and prove it
exceeds every earlier epoch before claims reopen. Without that source, mark restore authority
unverified and leave claims closed.
