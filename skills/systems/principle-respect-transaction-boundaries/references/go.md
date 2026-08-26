# Go

Use `database/sql` with the production PostgreSQL driver. Every local write receives the same `*sql.Tx`; broker delivery starts after `Commit` returns.

```go
// Package settlement owns the local PostgreSQL boundary for an order payment request.
package settlement

import (
	"context"
	"database/sql"
	"fmt"
)

// Input carries identities that survive database retries and worker replacement.
type Input struct {
	// CommandID identifies the logical settlement and is unique in the database.
	CommandID string
	// OrderID names the order changed by this settlement.
	OrderID string
	// ExpectedVersion prevents stale writers from committing.
	ExpectedVersion int64
	// EffectID remains stable across later provider delivery attempts.
	EffectID string
	// OutboxID identifies the durable broker-delivery obligation.
	OutboxID string
}

// Outcome distinguishes proved non-commit failures from an ambiguous commit response.
type Outcome struct {
	// Kind is committed, stale, not_committed, or unknown; unknown requires lookup.
	Kind string
	// CommandID is the stable recovery lookup key.
	CommandID string
	// Err records known pre-commit failure or ambiguous commit diagnostics.
	Err error
}

// Settle commits the order, effect, and outbox rows under one database transaction.
func Settle(ctx context.Context, db *sql.DB, input Input) (out Outcome) {
	out = Outcome{Kind: "not_committed", CommandID: input.CommandID}
	// tx is the sole commit owner for every local row in this settlement.
	tx, err := db.BeginTx(ctx, &sql.TxOptions{Isolation: sql.LevelSerializable})
	if err != nil {
		out.Err = fmt.Errorf("begin settlement: %w", err)
		return out
	}
	// committed prevents deferred rollback from obscuring the successful ownership transfer.
	committed := false
	defer func() {
		if !committed {
			_ = tx.Rollback()
		}
	}()

	// result carries the in-transaction version check that arbitrates stale writers.
	result, err := tx.ExecContext(ctx,
		`UPDATE orders SET state='payment_requested', version=version+1 WHERE id=$1 AND version=$2`,
		input.OrderID, input.ExpectedVersion)
	if err != nil {
		out.Err = fmt.Errorf("update order: %w", err)
		return out
	}
	// rows proves whether this expected version still owned the transition.
	rows, err := result.RowsAffected()
	if err != nil {
		out.Err = fmt.Errorf("read update result: %w", err)
		return out
	}
	if rows != 1 {
		out.Kind = "stale"
		return out
	}
	if _, err = tx.ExecContext(ctx,
		`INSERT INTO payment_effects(effect_id,command_id,order_id,state) VALUES($1,$2,$3,'requested')`,
		input.EffectID, input.CommandID, input.OrderID); err != nil {
		out.Err = fmt.Errorf("record effect: %w", err)
		return out
	}
	if _, err = tx.ExecContext(ctx,
		`INSERT INTO outbox(message_id,effect_id,topic,state) VALUES($1,$2,'capture-payment','pending')`,
		input.OutboxID, input.EffectID); err != nil {
		out.Err = fmt.Errorf("record outbox: %w", err)
		return out
	}
	// unknown begins only when Commit may have reached PostgreSQL.
	out.Kind = "unknown"
	if err = tx.Commit(); err != nil {
		// Commit errors are unknown because PostgreSQL may have committed before the reply failed.
		out.Err = fmt.Errorf("commit settlement: %w", err)
		return out
	}
	committed = true
	out.Kind = "committed"
	return out
}
```

`BeginTx`, statement, result, and constraint failures return `not_committed`; deferred `Rollback` prevents a caller from later committing that work. Only a `Commit` error returns `unknown`. Give `payment_effects.command_id` and `outbox.message_id` unique constraints. Query by `CommandID` after `unknown`. A later dispatcher publishes `OutboxID` with `EffectID`; `*sql.Tx` never includes that broker.

## Proof

Use the real PostgreSQL schema and configured isolation. Exercise begin failure, stale updates, constraint rollback as `not_committed`, concurrent writers, a crash after local commit before broker publish, and connection termination around server commit as `unknown`. A fake `*sql.Tx` cannot prove database isolation or ambiguous commit. Mark those claims unverified when the engine is unavailable.
