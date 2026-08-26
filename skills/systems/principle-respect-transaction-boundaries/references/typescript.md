# TypeScript

Use the PostgreSQL client already adopted by the service. Pass its transaction object into every local write. Publishing starts only after `COMMIT` returns.

```ts
/** Settles an order, payment identity, and outbox intent in one PostgreSQL transaction. */

/** SettlementInput carries identities that survive client retries and worker replacement. */
interface SettlementInput {
  /** commandId identifies this logical settlement, not one database attempt. */
  readonly commandId: string;
  /** orderId names the row whose transition owns the payment request. */
  readonly orderId: string;
  /** expectedVersion prevents a stale planner from overwriting a newer order state. */
  readonly expectedVersion: number;
  /** effectId remains the provider idempotency key if delivery repeats. */
  readonly effectId: string;
  /** outboxId identifies the durable delivery obligation. */
  readonly outboxId: string;
}

/** SettlementOutcome separates a proven refusal from a commit whose reply was lost. */
type SettlementOutcome =
  | {
      /** kind proves the local transaction committed. */ readonly kind: "committed";
      /** commandId remains the stable settlement identity. */ readonly commandId: string;
    }
  | {
      /** kind proves the expected version refused before commit. */ readonly kind: "stale";
      /** commandId remains the stable settlement identity. */ readonly commandId: string;
    }
  | {
      /** kind proves begin or work failed without a commit. */ readonly kind: "not_committed";
      /** commandId remains the stable settlement identity. */ readonly commandId: string;
      /** cause records the known pre-commit failure. */ readonly cause: unknown;
    }
  | {
      /** kind preserves uncertainty after the commit reply failed. */ readonly kind: "unknown";
      /** commandId is the recovery lookup identity. */ readonly commandId: string;
      /** cause is diagnostic and cannot prove rollback. */ readonly cause: unknown;
    };

/** SettlementDecision records what the callback established before the adapter commits. */
type SettlementDecision =
  | { /** kind permits the adapter to commit the complete local settlement. */ readonly kind: "ready" }
  | { /** kind records a stale refusal before any settlement row changed. */ readonly kind: "stale" };

/** TransactionResult requires the adapter to classify failure by whether COMMIT started. */
type TransactionResult<T> =
  | { /** kind proves COMMIT was acknowledged. */ readonly kind: "committed"; /** value is the callback result committed by PostgreSQL. */ readonly value: T }
  | { /** kind proves COMMIT was not attempted or rollback completed. */ readonly kind: "not_committed"; /** cause records the begin, work, or rollback failure. */ readonly cause: unknown }
  | { /** kind preserves uncertainty after COMMIT started without an acknowledgement. */ readonly kind: "commit_unknown"; /** cause is diagnostic and cannot prove rollback. */ readonly cause: unknown };

/** SqlClient exposes the production client's classified transaction boundary. */
interface SqlClient {
  /** runTransaction returns only after classifying begin, work, rollback, and COMMIT outcomes. */
  runTransaction<T>(work: (tx: SqlTransaction) => Promise<T>): Promise<TransactionResult<T>>;
}

/** SqlTransaction is the one participant shared by every local settlement write. */
interface SqlTransaction {
  /** execute returns affected rows so the caller can distinguish stale authority before commit. */
  execute(sql: string, parameters: readonly unknown[]): Promise<{ readonly rowCount: number }>;
}

/** settleOrder commits only local rows and trusts the adapter's transaction-phase evidence. */
async function settleOrder(db: SqlClient, input: SettlementInput): Promise<SettlementOutcome> {
  /** transaction is the adapter's evidence about whether COMMIT began. */
  const transaction = await db.runTransaction<SettlementDecision>(async (tx) => {
    /** updated proves the expected version still owned this transition inside the transaction. */
    const updated = await tx.execute(
      "UPDATE orders SET state = 'payment_requested', version = version + 1 WHERE id = $1 AND version = $2",
      [input.orderId, input.expectedVersion],
    );
    if (updated.rowCount !== 1) return { kind: "stale" };

    await tx.execute(
      "INSERT INTO payment_effects(effect_id, command_id, order_id, state) VALUES ($1,$2,$3,'requested')",
      [input.effectId, input.commandId, input.orderId],
    );
    await tx.execute(
      "INSERT INTO outbox(message_id, effect_id, topic, state) VALUES ($1,$2,'capture-payment','pending')",
      [input.outboxId, input.effectId],
    );
    return { kind: "ready" };
  });
  if (transaction.kind === "committed") {
    return { kind: transaction.value.kind === "ready" ? "committed" : "stale", commandId: input.commandId };
  }
  if (transaction.kind === "not_committed") {
    return { kind: "not_committed", commandId: input.commandId, cause: transaction.cause };
  }
  return { kind: "unknown", commandId: input.commandId, cause: transaction.cause };
}
```

The adapter may return `not_committed` for begin failure or a work or constraint error only after it knows `COMMIT` was not attempted or rollback completed. It returns `commit_unknown` once `COMMIT` starts without a trustworthy acknowledgement. Give `payment_effects.command_id` and `outbox.message_id` unique constraints. Resolve `unknown` by querying `command_id`, or repeat the same conditional command. Publish the outbox row in a later operation with `effectId`; never say a broker publish rolled back with this transaction.

## Proof

Run this against the production PostgreSQL schema and isolation setting. Prove business refusal before the transaction, begin failure, a stale conditional update, constraint rollback as `not_committed`, two concurrent expected versions, a crash after local commit before broker publish, and a killed connection around server commit as `unknown`. A mocked `runTransaction()` result does not prove commit ambiguity. If the real database fault cannot be injected, label that guarantee unverified.
