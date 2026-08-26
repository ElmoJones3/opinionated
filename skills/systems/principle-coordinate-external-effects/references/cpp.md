# C++

Keep provider evidence separate from policy. The local outbox, provider idempotency contract, and authoritative lookup remain different enforcement boundaries.

```cpp
/** @file payment_recovery.cpp
 *  @brief Coordinates payment recovery without claiming cross-system atomicity.
 */

#include <cstddef>
#include <string>
#include <variant>
#include <vector>

/** @brief Binds evidence to one provider account, environment, request, and effect. */
struct PaymentIdentity {
  /** @brief Names the provider adapter and lookup contract. */ std::string provider;
  /** @brief Prevents cross-account evidence from authorizing state. */ std::string account_id;
  /** @brief Prevents test and production identities from colliding. */ std::string environment;
  /** @brief Prevents capture evidence from authorizing another operation. */ std::string operation;
  /** @brief Stable provider idempotency key across attempts. */ std::string effect_id;
  /** @brief Binds observations to exact effective request bytes. */ std::string request_digest;
};

/** @brief Represents the durable local obligation created with requiring state. */
struct DeliveryIntent {
  /** @brief Local business obligation identity. */ std::string intent_id;
  /** @brief Broker progress identity, separate from provider effect. */ std::string delivery_id;
  /** @brief Receiver key and complete reconciliation scope. */ PaymentIdentity identity;
  /** @brief Requested, pending, confirmed, refused, unknown, or needs_attention. */ std::string state;
};

/** @brief Proves the provider accepted and identifies the receiver effect. */
struct Confirmed { /** @brief Receiver-owned effect identity. */ std::string provider_effect_id; };
/** @brief Proves the provider refused the identified request. */
struct Refused { /** @brief Provider refusal that policy may inspect. */ std::string reason; };
/** @brief Says the provider still owns unfinished work. */ struct Pending {};
/** @brief Preserves uncertainty when the lookup cannot settle the outcome. */
struct Unknown { /** @brief Reason no authoritative result is available. */ std::string reason; };
/** @brief Enumerates the only provider result classes recovery may consume. */
using ProviderEvidence = std::variant<Confirmed, Refused, Pending, Unknown>;

/** @brief Keeps provider evidence bound to the complete identity it describes. */
struct Observation {
  /** @brief Repeats the exact lookup scope established by the receiver. */ PaymentIdentity identity;
  /** @brief Carries the normalized provider result for that identity. */ ProviderEvidence evidence;
};

/** @brief Supplies idempotent delivery and identity-complete reconciliation. */
class Provider {
 public:
  /** @brief Sends a capture that may commit before its reply is lost. */
  virtual Observation capture(const PaymentIdentity&, const std::vector<std::byte>&) = 0;
  /** @brief Searches every state and retention window promised by the adapter. */
  virtual Observation observe(const PaymentIdentity&) = 0;
  /** @brief Allows destruction through the adapter. */ virtual ~Provider() = default;
};

/** @brief Compares every receiver field before evidence may authorize local state. */
bool same_identity(const PaymentIdentity& expected, const PaymentIdentity& observed) {
  return expected.provider == observed.provider && expected.account_id == observed.account_id &&
      expected.environment == observed.environment && expected.operation == observed.operation &&
      expected.effect_id == observed.effect_id && expected.request_digest == observed.request_digest;
}

/** @brief Maps only identity-matched authoritative evidence to a local recovery action. */
std::string choose_recovery(const PaymentIdentity& expected, const Observation& observation) {
  if (!same_identity(expected, observation.identity)) return "needs_attention";
  if (std::holds_alternative<Confirmed>(observation.evidence)) return "confirm";
  if (std::holds_alternative<Refused>(observation.evidence)) return "refuse";
  if (std::holds_alternative<Pending>(observation.evidence)) return "reconcile_later";
  return "needs_attention";
}

/** @brief Identifies compensation as new work without erasing capture history. */
struct RefundIntent {
  /** @brief New idempotency identity for the refund. */ std::string compensation_id;
  /** @brief Link to the immutable original capture. */ std::string original_effect_id;
  /** @brief Trusted policy reason for compensation. */ std::string reason;
};
```

Store `Unknown` on reply loss, then call `observe` with every identity field. The adapter returns the receiver-established identity with its evidence; `choose_recovery` sends mismatches to `needs_attention`. A recent result from an incomplete or lagging lookup is not freshness and cannot prove absence. Write any `RefundIntent` plus its delivery intent in a new local transaction.

## Proof

Script crashes after local commit, send, provider commit, acknowledgement, and local confirmation. Use the production store for outbox semantics. Exercise duplicate delivery, identity mismatch, pending lookup, separate refund identity, and restore older than provider state. State which provider claims remain unverified when its real contract is unavailable.
