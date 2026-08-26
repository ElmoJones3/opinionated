# C++ reference

A local deadline uses `std::chrono::steady_clock`, but expiration still means only that local waiting
ended. Receiver evidence remains a separate value.

```cpp
/** This excerpt classifies payment evidence and leaves inbox atomicity to the production store. */
#include <cstdint>
#include <string>

/** Identifies the strongest evidence from one receiver exchange. */
enum class ObservationKind {
  local_refusal,          ///< This invocation never left.
  receiver_refusal,       ///< This request cannot later commit.
  confirmed,              ///< The receiver identified a committed effect.
  pending,                ///< The receiver may still finish.
  no_reply,               ///< Timeout or connection loss leaves remote state open.
  cancellation_requested, ///< The cancellation race is unresolved.
  cancelled_before_commit,///< Receiver proof excludes commit.
};

/** Carries receiver identity only when the operation contract supplies it. */
struct Observation {
  ObservationKind kind;   ///< Selects the evidence rule.
  std::string receiver_id;///< Names the effect, operation, refusal, or cancellation evidence.
};

/** Names the durable conclusion permitted by evidence. */
enum class Knowledge {
  confirmed, ///< Receiver evidence binds the effect.
  refused,   ///< Established evidence excludes this invocation.
  pending,   ///< Later receiver observation remains necessary.
  unknown,   ///< The effect may have committed.
};

/** Keeps a durable conclusion beside the receiver evidence that earned it. */
struct EstablishedKnowledge {
  Knowledge kind;             ///< Names confirmed, refused, pending, or unknown knowledge.
  std::string receiver_id;    ///< Preserves identity supplied by receiver evidence.
  std::string evidence_source;///< Distinguishes local refusal from receiver proof.
};

/** Records no stronger claim than one observation earns. */
EstablishedKnowledge classify(const Observation& observation) {
  switch (observation.kind) {
    case ObservationKind::local_refusal:
      return {Knowledge::refused, "", "local"};
    case ObservationKind::receiver_refusal:
    case ObservationKind::cancelled_before_commit:
      return {Knowledge::refused, observation.receiver_id, "receiver"};
    case ObservationKind::confirmed:
      return {Knowledge::confirmed, observation.receiver_id, "receiver"};
    case ObservationKind::pending:
      return {Knowledge::pending, observation.receiver_id, "receiver"};
    case ObservationKind::no_reply:
    case ObservationKind::cancellation_requested:
      return {Knowledge::unknown, "", ""};
  }
  return {Knowledge::unknown, "", ""};
}

/** Separates broker redelivery, source order, and logical effect identity. */
struct OrderedDelivery {
  std::string delivery_id;        ///< Detects an exact broker redelivery.
  std::uint64_t source_sequence;  ///< Orders events within one payment stream.
  std::string effect_key;         ///< Names the logical effect across deliveries.
};

/** States what one receipt transaction decided. */
enum class InboxResult {
  applied,      ///< Receipt and local state committed together.
  duplicate,    ///< The delivery was already applied.
  sequence_gap, ///< An earlier source event is missing.
};

/** Owns one transaction spanning receipt uniqueness and the local state change. */
class PaymentInbox {
 public:
  /** Allows cleanup through the storage boundary. */
  virtual ~PaymentInbox() = default;
  /** Applies only the next source event and never skips a gap. */
  virtual InboxResult apply_once(
      const OrderedDelivery& delivery, std::uint64_t expected_sequence) = 0;
};
```

The receiver contract decides which response establishes absence or completion. C++ types cannot.
The inbox implementation must use one transaction in the deployed store for receipt uniqueness and
the payment transition.

Use a deterministic adapter and scheduler for lost request, lost refusal, lost success reply,
pending work, acknowledgement loss after inbox commit, exact redelivery, sequence gaps, and both
cancellation orderings. Exercise inbox atomicity through
the production database client or label it unverified.
