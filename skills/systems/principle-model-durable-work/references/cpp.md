# C++ reference

The value types keep the payment obligation and receiver key distinct from replaceable attempts and
invocations. The store implementation, not these types, must enforce transaction and concurrency
semantics.

```cpp
/** This excerpt models durable recovery facts without claiming to implement a database transaction. */
#include <cstdint>
#include <optional>
#include <string>

/** Names knowledge earned about the receiver effect. */
enum class CaptureOutcome {
  requested,       ///< The effect remains owed.
  confirmed,       ///< Receiver evidence identifies the committed effect.
  refused,         ///< Stable receiver evidence says the request cannot commit.
  unknown,         ///< A call may have left without a recorded final reply.
  needs_attention, ///< Automation stopped without guessing an outcome.
};

/** Retains identity-bound evidence instead of only a status label. */
struct CaptureKnowledge {
  CaptureOutcome outcome;   ///< Names the current knowledge state.
  std::string receiver_id;  ///< Identifies a confirmed effect or stable refusal.
  std::string attempt_id;   ///< Identifies the execution whose result is unknown.
  std::string reason;       ///< Explains refusal or why automation needs attention.
};

/** Separates one business obligation from its physical executions. */
struct CaptureRecord {
  std::string obligation_id;  ///< Names the one payment obligation for the order.
  std::string step_id;        ///< Names the separately recoverable capture stage.
  std::string effect_key;     ///< Remains stable for every equivalent receiver call.
  std::string request_digest; ///< Rejects changed meaning under the stable key.
  std::uint64_t version;      ///< Is compared by storage during every state change.
  CaptureKnowledge knowledge; ///< Records identity-bound evidence and intervention.
};

/** Proves storage authorized one physical execution before its call. */
struct ReservedAttempt {
  std::string obligation_id;      ///< Binds this execution to one durable business obligation.
  std::string attempt_id;         ///< Changes for each authorized execution.
  std::string invocation_id;      ///< Changes for each provider call inside the attempt.
  std::string effect_key;         ///< Reuses the receiver identity of the obligation.
  std::uint64_t expected_version; ///< Binds completion to the reserved record generation.
};

/** Owns real transaction, uniqueness, and conditional-write behavior. */
class CaptureStore {
 public:
  /** Allows cleanup through the storage boundary. */
  virtual ~CaptureStore() = default;
  /** Atomically reserves one execution for existing current work. */
  virtual ReservedAttempt reserve_attempt(
      const std::string& obligation_id, std::uint64_t expected_version) = 0;
  /** Changes only the current reservation and reports lost authority as false. */
  virtual bool mark_unknown(
      const std::string& attempt_id, std::uint64_t expected_version) = 0;
};

/** Contains only durable facts a replacement worker may trust. */
struct RecoveryInput {
  CaptureRecord record;                   ///< Carries identity and the latest outcome.
  std::optional<ReservedAttempt> attempt; ///< Is empty when no reservation committed.
  bool call_may_have_left;                ///< Means the invocation reached a send boundary.
};

/** Refuses to infer effect count from execution count. */
CaptureKnowledge recovery_outcome(const RecoveryInput& input) {
  if (input.record.knowledge.outcome != CaptureOutcome::requested) {
    return input.record.knowledge;
  }
  if (!input.attempt.has_value()) {
    return {CaptureOutcome::requested, "", "", ""};
  }
  if (input.attempt->obligation_id != input.record.obligation_id ||
      input.attempt->effect_key != input.record.effect_key ||
      input.attempt->expected_version != input.record.version) {
    return {CaptureOutcome::needs_attention, "", input.attempt->attempt_id,
            "reservation_not_current"};
  }
  if (!input.call_may_have_left) {
    return {CaptureOutcome::requested, "", "", ""};
  }
  return {CaptureOutcome::unknown, "", input.attempt->attempt_id, ""};
}
```

Use the production SQL client already chosen by the repository. Its transaction must verify the
obligation and expected version, allocate unique attempt and invocation IDs, bind the reservation
to the obligation and effect key, and advance the record to the reservation's expected version. An
abstract class cannot make those steps atomic.

Test the pure decision at all four crash windows. Then exercise uniqueness and conditional writes
against the deployed database client and engine. If that test cannot run, call the guarantee
unverified.
