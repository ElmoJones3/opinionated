# Go reference

Use this reference when implementing or reviewing a Go domain model.

Keep transition state unexported. Put legal changes on the domain type, expose read accessors, keep pure whole-object validation beside the type, and make adapters construct hydrated values through a validating entry point.

Reuse the repository's shared object type for identity and lifecycle fields. Embed it when that is the established pattern. Domain structs carry no `json`, `db`, ORM, or transport tags. Adapters own their own structs and map them to domain values.

Prefer value receivers that return a new value when the object is small enough to copy safely. Use pointer receivers when the project requires them, but keep partial mutation from escaping after an error.

## Worked contract

An `Account` starts active with no failed login attempts.

- Recording a failed login is a consequence of failed credential verification.
- Only an active account may record the consequence.
- The third failed login locks the account.
- Unlocking is a command. It is legal only while locked and resets the failed count.
- An active account has zero to two failures. A locked account has exactly three.

The application verifies credentials and authorizes an unlock. The account owns what those facts do to its state.

```go
package accounts

import (
	"errors"
	"fmt"

	"example.com/project/internal/domain"
)

const maxFailedLogins = 3

var (
	ErrAccountNotActive = errors.New("account is not active")
	ErrAccountNotLocked = errors.New("account is not locked")
)

type State string

const (
	Active State = "active"
	Locked State = "locked"
)

type Account struct {
	domain.Object
	state               State
	failedLoginAttempts int
}

func New(id string) (Account, error) {
	account := Account{
		Object: domain.Object{ID: id},
		state:  Active,
	}
	if err := account.Validate(); err != nil {
		return Account{}, err
	}
	return account, nil
}

func Hydrate(object domain.Object, state State, failedLoginAttempts int) (Account, error) {
	account := Account{
		Object:              object,
		state:               state,
		failedLoginAttempts: failedLoginAttempts,
	}
	if err := account.Validate(); err != nil {
		return Account{}, err
	}
	return account, nil
}

func (a Account) State() State {
	return a.state
}

func (a Account) FailedLoginAttempts() int {
	return a.failedLoginAttempts
}

func (a Account) RecordFailedLogin() (Account, error) {
	if a.state != Active {
		return a, ErrAccountNotActive
	}

	next := a
	next.failedLoginAttempts++
	if next.failedLoginAttempts == maxFailedLogins {
		next.state = Locked
	}
	if err := next.Validate(); err != nil {
		return a, err
	}
	return next, nil
}

func (a Account) Unlock() (Account, error) {
	if a.state != Locked {
		return a, ErrAccountNotLocked
	}

	next := a
	next.state = Active
	next.failedLoginAttempts = 0
	if err := next.Validate(); err != nil {
		return a, err
	}
	return next, nil
}

func (a Account) Validate() error {
	if a.ID == "" {
		return errors.New("account id is required")
	}
	if a.failedLoginAttempts < 0 || a.failedLoginAttempts > maxFailedLogins {
		return fmt.Errorf("failed login attempts must be between 0 and %d", maxFailedLogins)
	}

	switch a.state {
	case Active:
		if a.failedLoginAttempts == maxFailedLogins {
			return errors.New("active account cannot have three failed logins")
		}
	case Locked:
		if a.failedLoginAttempts != maxFailedLogins {
			return errors.New("locked account must have three failed logins")
		}
	default:
		return fmt.Errorf("unknown account state %q", a.state)
	}
	return nil
}
```

The handler orchestrates the operation without reproducing the threshold or transition:

```go
account, err := repository.Get(ctx, accountID)
if err != nil {
	return err
}

next, err := account.RecordFailedLogin()
if err != nil {
	return err
}

return repository.Save(ctx, next)
```

Test through the exported contract. Prove the threshold, the illegal transitions, the forced reset, and the hydration backstop:

```go
package accounts_test

import (
	"errors"
	"testing"

	"example.com/project/internal/domain"
	"example.com/project/internal/domains/accounts"
)

func TestFailedLoginLocksAccountOnThirdAttempt(t *testing.T) {
	account, err := accounts.New("acct-1")
	if err != nil {
		t.Fatal(err)
	}

	for range 3 {
		account, err = account.RecordFailedLogin()
		if err != nil {
			t.Fatal(err)
		}
	}

	if account.State() != accounts.Locked || account.FailedLoginAttempts() != 3 {
		t.Fatalf("expected locked account after third failure, got %+v", account)
	}
}

func TestLockedAccountRejectsAnotherFailedLogin(t *testing.T) {
	account, err := accounts.Hydrate(domain.Object{ID: "acct-1"}, accounts.Locked, 3)
	if err != nil {
		t.Fatal(err)
	}

	_, err = account.RecordFailedLogin()
	if !errors.Is(err, accounts.ErrAccountNotActive) {
		t.Fatalf("expected ErrAccountNotActive, got %v", err)
	}
}

func TestUnlockResetsFailures(t *testing.T) {
	account, err := accounts.Hydrate(domain.Object{ID: "acct-1"}, accounts.Locked, 3)
	if err != nil {
		t.Fatal(err)
	}

	account, err = account.Unlock()
	if err != nil {
		t.Fatal(err)
	}
	if account.State() != accounts.Active || account.FailedLoginAttempts() != 0 {
		t.Fatalf("expected active account with reset failures, got %+v", account)
	}
}

func TestActiveAccountRejectsUnlock(t *testing.T) {
	account, err := accounts.New("acct-1")
	if err != nil {
		t.Fatal(err)
	}

	_, err = account.Unlock()
	if !errors.Is(err, accounts.ErrAccountNotLocked) {
		t.Fatalf("expected ErrAccountNotLocked, got %v", err)
	}
}

func TestHydrateRejectsImpossibleState(t *testing.T) {
	_, err := accounts.Hydrate(domain.Object{ID: "acct-1"}, accounts.Locked, 1)
	if err == nil {
		t.Fatal("expected invalid locked account to fail")
	}
}
```

Keep repository calls, clock reads, authorization, DTO mapping, and event publication outside the package. Pass any fact the model needs as a method argument.
