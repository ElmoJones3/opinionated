# Go reference

Use this reference when implementing or reviewing a Go domain model. Load the [Go pure-pattern reference](../../principle-prefer-pure-functional-patterns/references/go.md) for `x.Modifier`, `x.EmittingModifier`, `x.Apply`, and `x.ApplyEmitting`.

Keep state unexported. Use `New` for legal initial state, named modifiers for earned changes, and a validating restoration path for adapters. Domain structs carry no `json`, `db`, ORM, or transport tags. Adapters own those shapes.

Embed the repository's shared object type only when it does not expose mutable identity or lifecycle fields. Otherwise store it privately and expose read accessors, as the example does. A copied struct may still share slices, maps, or pointers, so clone referenced storage before changing it.

## Worked contract

An `Account` starts active with no failed login attempts.

- Recording a failed login is a consequence of failed credential verification.
- Only an active account may record it.
- The third failed login locks the account and produces `AccountLocked`.
- Unlocking is a command invoked after application authorization. The account accepts it only while locked and resets the failed count.
- An active account has zero to two failures. A locked account has exactly three.

Failed-login recording owes state plus a fact, so it uses an emitting modifier. Unlocking owes only state, so it uses an ordinary modifier.

```go
package accounts

import (
	"errors"
	"fmt"

	"example.com/project/internal/domain"
	"example.com/project/internal/x"
)

const maxFailedLogins = 3

var (
	ErrAccountNotActive   = errors.New("account is not active")
	ErrAccountNotLocked   = errors.New("account is not locked")
	ErrLockedAttemptCount = errors.New("locked account must have three failed logins")
)

type State string

const (
	Active State = "active"
	Locked State = "locked"
)

type Account struct {
	object              domain.Object
	state               State
	failedLoginAttempts int
}

func New(id string) (Account, error) {
	account := Account{object: domain.Object{ID: id}, state: Active}
	if err := account.Validate(); err != nil {
		return Account{}, err
	}
	return account, nil
}

// Hydrate is a deliberate restoration bypass for a separate adapter package.
// Go has no friend packages: validation protects shape, while architecture and
// review keep this exported function out of ordinary application behavior.
func Hydrate(object domain.Object, state State, attempts int) (Account, error) {
	account := Account{
		object:              object,
		state:               state,
		failedLoginAttempts: attempts,
	}
	if err := account.Validate(); err != nil {
		return Account{}, err
	}
	return account, nil
}

func (a Account) ID() string               { return a.object.ID }
func (a Account) State() State             { return a.state }
func (a Account) FailedLoginAttempts() int { return a.failedLoginAttempts }

type Fact interface{ accountFact() }

type AccountLocked struct{ AccountID string }
func (AccountLocked) accountFact() {}

type accountModifiers struct{}
var Modifiers accountModifiers

func (accountModifiers) WithFailedLoginRecorded() x.EmittingModifier[Account, Fact] {
	return func(account Account) (x.Change[Account, Fact], error) {
		if account.state != Active {
			return x.Change[Account, Fact]{}, ErrAccountNotActive
		}

		next := account
		next.failedLoginAttempts++
		facts := make([]Fact, 0)
		if next.failedLoginAttempts == maxFailedLogins {
			next.state = Locked
			facts = append(facts, AccountLocked{AccountID: next.ID()})
		}
		if err := next.Validate(); err != nil {
			panic(fmt.Errorf("failed-login modifier broke account invariant: %w", err))
		}
		return x.Change[Account, Fact]{Value: next, Facts: facts}, nil
	}
}

func (accountModifiers) WithUnlock() x.Modifier[Account] {
	return func(account Account) (Account, error) {
		if account.state != Locked {
			return Account{}, ErrAccountNotLocked
		}

		next := account
		next.state = Active
		next.failedLoginAttempts = 0
		if err := next.Validate(); err != nil {
			panic(fmt.Errorf("unlock modifier broke account invariant: %w", err))
		}
		return next, nil
	}
}

func (a Account) Validate() error {
	if a.ID() == "" {
		return errors.New("account id is required")
	}
	if a.failedLoginAttempts < 0 || a.failedLoginAttempts > maxFailedLogins {
		return fmt.Errorf("failed login attempts must be between zero and %d", maxFailedLogins)
	}
	if a.state == Active && a.failedLoginAttempts == maxFailedLogins {
		return errors.New("active account cannot have three failed logins")
	}
	if a.state == Locked && a.failedLoginAttempts != maxFailedLogins {
		return ErrLockedAttemptCount
	}
	if a.state != Active && a.state != Locked {
		return fmt.Errorf("unknown account state %q", a.state)
	}
	return nil
}
```

The invariant check after a modifier is a programmer backstop. Valid input plus the modifier's own guard should make it unreachable, so it panics rather than pretending to be another business refusal.

## Call without restating rules

The application verifies credentials and owns persistence. It does not reproduce the threshold or construct `AccountLocked`:

```go
account, err := repository.Get(ctx, accountID)
if err != nil {
	return err
}

change, err := x.ApplyEmitting(account, accounts.Modifiers.WithFailedLoginRecorded())
if err != nil {
	return err
}

return settlement.SettleAccount(ctx, change)
```

`SettleAccount` accepts the complete `Change` and writes state plus mapped outbox records in one real transaction. If the operation returns the planned change directly as a domain receipt and promises no durable delivery, no outbox is needed.

## Prove earned state and restoration

Test through the exported behavior. Build locked state through three failed-login consequences. Use `Hydrate` only for restoration proofs.

```go
package accounts_test

import (
	"errors"
	"reflect"
	"testing"

	"example.com/project/internal/domain"
	"example.com/project/internal/domains/accounts"
	"example.com/project/internal/x"
)

func lockedAccount(t *testing.T) accounts.Account {
	t.Helper()
	account, err := accounts.New("acct-1")
	if err != nil {
		t.Fatal(err)
	}
	for attempt := 0; attempt < 3; attempt++ {
		change, applyErr := x.ApplyEmitting(account, accounts.Modifiers.WithFailedLoginRecorded())
		if applyErr != nil {
			t.Fatal(applyErr)
		}
		account = change.Value
	}
	return account
}

func TestThirdFailedLoginEarnsLockAndFact(t *testing.T) {
	account, err := accounts.New("acct-1")
	if err != nil {
		t.Fatal(err)
	}
	first, err := x.ApplyEmitting(account, accounts.Modifiers.WithFailedLoginRecorded())
	if err != nil {
		t.Fatal(err)
	}
	second, err := x.ApplyEmitting(first.Value, accounts.Modifiers.WithFailedLoginRecorded())
	if err != nil {
		t.Fatal(err)
	}
	third, err := x.ApplyEmitting(second.Value, accounts.Modifiers.WithFailedLoginRecorded())
	if err != nil {
		t.Fatal(err)
	}

	if third.Value.State() != accounts.Locked || third.Value.FailedLoginAttempts() != 3 {
		t.Fatalf("expected earned locked state, got %+v", third.Value)
	}
	want := []accounts.Fact{accounts.AccountLocked{AccountID: "acct-1"}}
	if !reflect.DeepEqual(third.Facts, want) {
		t.Fatalf("facts = %#v, want %#v", third.Facts, want)
	}
	if len(first.Facts) != 0 || len(second.Facts) != 0 {
		t.Fatal("lock fact was emitted before the lock was earned")
	}
}

func TestLockedAccountRejectsAnotherFailure(t *testing.T) {
	account := lockedAccount(t)
	change, err := x.ApplyEmitting(account, accounts.Modifiers.WithFailedLoginRecorded())
	if !errors.Is(err, accounts.ErrAccountNotActive) {
		t.Fatalf("expected ErrAccountNotActive, got %v", err)
	}
	if !reflect.DeepEqual(change, x.Change[accounts.Account, accounts.Fact]{}) {
		t.Fatalf("failed change leaked state or facts: %#v", change)
	}
	if account.State() != accounts.Locked || account.FailedLoginAttempts() != 3 {
		t.Fatalf("rejected transition changed input: %+v", account)
	}
	if account.ID() != "acct-1" {
		t.Fatalf("rejected transition changed identity: %+v", account)
	}
}

func TestActiveAccountRejectsUnlock(t *testing.T) {
	account, err := accounts.New("acct-1")
	if err != nil {
		t.Fatal(err)
	}
	_, err = x.Apply(account, accounts.Modifiers.WithUnlock())
	if !errors.Is(err, accounts.ErrAccountNotLocked) {
		t.Fatalf("expected ErrAccountNotLocked, got %v", err)
	}
	if account.ID() != "acct-1" || account.State() != accounts.Active || account.FailedLoginAttempts() != 0 {
		t.Fatalf("rejected unlock changed input: %+v", account)
	}
}

func TestUnlockRestoresActiveState(t *testing.T) {
	next, err := x.Apply(lockedAccount(t), accounts.Modifiers.WithUnlock())
	if err != nil {
		t.Fatal(err)
	}
	if next.State() != accounts.Active || next.FailedLoginAttempts() != 0 {
		t.Fatalf("unexpected unlocked account: %+v", next)
	}
}

func TestHydrateAcceptsValidAndRejectsExactInvariant(t *testing.T) {
	valid, err := accounts.Hydrate(domain.Object{ID: "acct-1"}, accounts.Locked, 3)
	if err != nil || !reflect.DeepEqual(valid, lockedAccount(t)) {
		t.Fatalf("valid hydration failed: account=%+v err=%v", valid, err)
	}

	_, err = accounts.Hydrate(domain.Object{ID: "acct-1"}, accounts.Locked, 1)
	if !errors.Is(err, accounts.ErrLockedAttemptCount) {
		t.Fatalf("expected ErrLockedAttemptCount, got %v", err)
	}
}
```

Keep authorization, repository calls, clock reads, DTO mapping, transactions, and publication outside the package. When several aggregates change, compute each pure result first, then coordinate the writes. The modifier contract does not create persistence atomicity by itself.
