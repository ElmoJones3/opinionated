# C++

Evidence, trusted decision, approval, local intent, and external activation remain separate states.

## Automated evidence

```cpp
/** @file decisions.cpp
 *  @brief Binds protected changes to trusted policy and durable history.
 */
#include <cmath>
#include <stdexcept>
#include <string>
#include <utility>

/** @brief Carries validated measurements whose suggestion has no authority. */
struct EvaluatorEvidence { /** @brief Exact content identity evaluated. */ std::string subject_digest; /** @brief Measurement procedure version. */ std::string evaluator_version; /** @brief Finite measurement from zero through one. */ double risk_score; /** @brief Diagnostic evaluator output ignored by policy. */ bool suggested_allow; };
/** @brief Records what trusted versioned policy derived. */
struct Decision { /** @brief Allow, refuse, or review for the protected local gate. */ std::string kind; /** @brief Measurement procedure bound to this decision. */ std::string evaluator_version; /** @brief Threshold and gate behavior version. */ std::string policy_version; /** @brief Prevents reuse for changed content. */ std::string subject_digest; };
/** @brief Owns decision authority without trusting evaluator self-report. */
Decision derive_decision(const EvaluatorEvidence& evidence, double threshold, std::string policy_version) {
  if (!std::isfinite(evidence.risk_score) || evidence.risk_score < 0.0 || evidence.risk_score > 1.0) throw std::invalid_argument("risk score outside [0,1]");
  if (!std::isfinite(threshold) || threshold < 0.0 || threshold > 1.0) throw std::invalid_argument("policy threshold outside [0,1]");
  return {evidence.risk_score <= threshold ? "allow" : "review", evidence.evaluator_version, std::move(policy_version), evidence.subject_digest};
}
```

Name hard versus soft gate behavior. When uncertain evidence carries the guarantee, measure false acceptance and false rejection plus any claimed calibration, reviewer agreement, leakage, drift, or remediation bounds.

## Approval and activation

```cpp
#include <cstdint>
#include <span>
#include <string>
/** @brief Binds current actor authority and policy to immutable subject bytes. */
struct Approval { /** @brief Stable identity for idempotent local settlement. */ std::string approval_id; /** @brief Maintained-library digest of reviewed bytes. */ std::string subject_digest; /** @brief Approval rules used. */ std::string policy_version; /** @brief Accountable actor whose authority policy rechecks. */ std::string approver_id; /** @brief Exact allowed action. */ std::string scope; };
/** @brief Owns one local transaction for state, outbound intent, and audit. */
class ActivationStore { public: /** @brief Rechecks subject, policy, authority, and version before local commit. */ virtual std::string record_intent_if_current(const Approval& approval, const std::string& current_digest, std::int64_t expected_version) = 0; /** @brief Allows destruction through the store adapter. */ virtual ~ActivationStore() = default; };
```

Hash exact bytes with the cryptographic library already maintained by the repository. The local transaction may record an outbound activation intent and append-only audit. External activation occurs later and needs separate delivery, idempotency, and observation.

## Operator redrive

```cpp
#include <cstdint>
#include <string>
/** @brief Identifies one authorized intervention and expected durable state. */
struct RedriveCommand { /** @brief Stable duplicate and unknown-outcome lookup identity. */ std::string command_id; /** @brief Actor checked for current redrive authority. */ std::string actor_id; /** @brief Blocked work selected by the operator. */ std::string obligation_id; /** @brief Refuses a stale operator view. */ std::int64_t expected_version; /** @brief Adds an attempt without rewriting history. */ std::string new_attempt_id; /** @brief Retained in append-only audit. */ std::string reason; };
/** @brief Applies normal authority, budget, version, and effect protections. */
class InterventionStore { public: /** @brief Atomically records command, new attempt, enqueue intent, and audit. */ virtual std::string redrive(const RedriveCommand& command) = 0; /** @brief Allows destruction through the store adapter. */ virtual ~InterventionStore() = default; };
```

An ambiguous result remains unknown and is resolved by `command_id`. Redrive appends a new attempt and preserves earlier failures.

## Proof

Test threshold edges, non-finite evidence, and that `suggested_allow` never authorizes. Change subject, policy, evidence, and actor authority during review. Use the production store for conditional local intent plus audit, duplicate and simultaneous redrives, stale versions, and ambiguous commit. Observe external activation by complete identity. Mark unavailable evaluator quality, audit, or external-system guarantees unverified.
