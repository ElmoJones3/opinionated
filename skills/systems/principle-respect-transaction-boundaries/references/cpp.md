# C++

Use the SQL client already present. If the project uses libpqxx, let the settlement boundary exclusively own one `pqxx::work`, pass it through all local writes, and destroy or roll it back before returning any non-commit result. Publish only after `commit()` returns.

```cpp
/** @file settlement.cpp
 *  @brief Owns the local PostgreSQL boundary for an order payment request.
 */

#include <cstdint>
#include <exception>
#include <memory>
#include <string>
#include <variant>

/** @brief Carries identities that survive SQL retries and worker replacement. */
struct SettlementInput {
  /** @brief Stable logical settlement identity and recovery lookup key. */
  std::string command_id;
  /** @brief Order whose version authorizes the transition. */
  std::string order_id;
  /** @brief Version required by the conditional update. */
  std::int64_t expected_version;
  /** @brief Provider idempotency key retained across deliveries. */
  std::string effect_id;
  /** @brief Durable broker-delivery obligation identity. */
  std::string outbox_id;
};

/** @brief Proves that all named local rows committed. */
struct Committed { /** @brief Stable recovery identity. */ std::string command_id; };
/** @brief Proves the expected version refused the write before commit. */
struct Stale { /** @brief Stable recovery identity. */ std::string command_id; };
/** @brief Proves begin or transactional work failed without a commit. */
struct NotCommitted {
  /** @brief Stable key retained for diagnostics and safe retry policy. */
  std::string command_id;
  /** @brief Diagnostic reason from the known pre-commit failure. */
  std::string reason;
};
/** @brief Preserves a commit-path failure that cannot prove rollback. */
struct Unknown {
  /** @brief Stable key for post-failure lookup. */
  std::string command_id;
  /** @brief Diagnostic reason that grants no settlement authority. */
  std::string reason;
};
/** @brief Enumerates every result the caller may safely act on. */
using SettlementOutcome = std::variant<Committed, Stale, NotCommitted, Unknown>;

/** @brief Minimal adapter implemented by the production SQL transaction type. */
class SqlTransaction {
 public:
  /** @brief Executes a conditional statement and returns affected rows. */
  virtual std::int64_t execute(const std::string& sql,
                               const SettlementInput& input) = 0;
  /** @brief Ends known-uncommitted work so no later owner can commit it. */
  virtual void rollback() noexcept = 0;
  /** @brief Commits only this database transaction; external systems do not participate. */
  virtual void commit() = 0;
  /** @brief Destroys the owned adapter; concrete RAII types abort any open work. */
  virtual ~SqlTransaction() = default;
};

/** @brief Creates the production transaction that settlement exclusively owns. */
class SqlClient {
 public:
  /** @brief Begins one configured PostgreSQL transaction or throws before one exists. */
  virtual std::unique_ptr<SqlTransaction> begin() = 0;
  /** @brief Allows destruction through the production database adapter. */
  virtual ~SqlClient() = default;
};

/** @brief Owns the transaction through completion so failure cannot leak commit authority. */
SettlementOutcome settle(SqlClient& db, const SettlementInput& input) {
  /** tx is never exposed to the caller and dies on every return path. */
  std::unique_ptr<SqlTransaction> tx;
  try {
    tx = db.begin();
  } catch (const std::exception& error) {
    return NotCommitted{input.command_id, error.what()};
  }
  if (!tx) {
    return NotCommitted{input.command_id, "database returned no transaction"};
  }

  try {
    /** updated is the authoritative in-transaction version check. */
    const auto updated = tx->execute(
        "UPDATE orders SET state='payment_requested', version=version+1 "
        "WHERE id=:order_id AND version=:expected_version",
        input);
    if (updated != 1) {
      tx->rollback();
      return Stale{input.command_id};
    }
    tx->execute("INSERT INTO payment_effects(effect_id,command_id,order_id,state) "
                "VALUES(:effect_id,:command_id,:order_id,'requested')", input);
    tx->execute("INSERT INTO outbox(message_id,effect_id,topic,state) "
                "VALUES(:outbox_id,:effect_id,'capture-payment','pending')", input);
  } catch (const std::exception& error) {
    // No commit was attempted, and rollback removes the transaction's commit authority.
    tx->rollback();
    return NotCommitted{input.command_id, error.what()};
  }

  try {
    tx->commit();
    return Committed{input.command_id};
  } catch (const std::exception& error) {
    // COMMIT started, so destruction closes the handle but cannot prove server rollback.
    return Unknown{input.command_id, error.what()};
  }
}
```

`settle` owns the transaction handle; callers never retain a live transaction that could commit after `NotCommitted` or `Stale`. The concrete adapter must abort open work on destruction. Only the separate `commit()` catch returns `Unknown`. Give `payment_effects.command_id` and `outbox.message_id` unique constraints. Query `command_id` after `Unknown`. RAII cannot include a broker or provider in this database transaction.

## Proof

Exercise the production database, schema, and isolation through begin failure, stale updates, constraint rollback as `NotCommitted`, concurrent writers, a crash after local commit before broker publish, and a killed connection around server commit as `Unknown`. Prove the adapter destroys or rolls back every non-commit path. A local fake can check branching but cannot prove transaction or commit-ambiguity guarantees; label them unverified if the production engine is unavailable.
