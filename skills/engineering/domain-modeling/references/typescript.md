# TypeScript reference

Use this reference when implementing or reviewing a TypeScript domain model.

Reuse the project's shared object interface or base class for identity and lifecycle fields. Keep state readonly, expose complete behaviors from the domain-owned module, and make transitions return a new value. Runtime validation remains necessary for hydrated data even when the compiler can describe the valid type.

The shared object contract must validate its own hydration data. The worked example assumes the base module exports `Object`, its untrusted `ObjectData` shape, and `Object.hydrate`. Adapt those names to the project instead of validating only the identifier and skipping shared lifecycle fields.

Plain domain values may be JSON-compatible. Do not make transport field names, API schemas, persistence decorators, or serializer behavior part of the domain contract. Adapters map their inputs into domain properties before hydration.

## Worked contract

An `Account` starts active with no failed login attempts.

- Recording a failed login is a consequence of failed credential verification.
- Only an active account may record the consequence.
- The third failed login locks the account.
- Unlocking is a command. It is legal only while locked and resets the failed count.
- An active account has zero to two failures. A locked account has exactly three.

The application verifies credentials and authorizes an unlock. The account owns what those facts do to its state.

```ts
import { Object, type ObjectData } from '../base/object'

const MAX_FAILED_LOGINS = 3

export type AccountState = 'active' | 'locked'

export interface Account extends Object {
  readonly state: AccountState
  readonly failedLoginAttempts: number
}

export interface AccountData extends ObjectData {
  readonly state: unknown
  readonly failedLoginAttempts: unknown
}

export class IllegalAccountTransition extends Error {}

export const Account = {
  create(object: Object): Account {
    return validate({ ...object, state: 'active', failedLoginAttempts: 0 })
  },

  hydrate(data: AccountData): Account {
    return validate(data)
  },

  recordFailedLogin(account: Account): Account {
    if (account.state !== 'active') {
      throw new IllegalAccountTransition('only an active account can record a failed login')
    }

    const failedLoginAttempts = account.failedLoginAttempts + 1
    const state = failedLoginAttempts === MAX_FAILED_LOGINS ? 'locked' : 'active'
    return validate({ ...account, state, failedLoginAttempts })
  },

  unlock(account: Account): Account {
    if (account.state !== 'locked') {
      throw new IllegalAccountTransition('only a locked account can be unlocked')
    }

    return validate({ ...account, state: 'active', failedLoginAttempts: 0 })
  },
}

function validate(account: AccountData): Account {
  const object = Object.hydrate(account)
  if (account.state !== 'active' && account.state !== 'locked') {
    throw new Error('account state must be active or locked')
  }
  if (typeof account.failedLoginAttempts !== 'number') {
    throw new Error('failed login attempts must be a number')
  }
  if (!Number.isInteger(account.failedLoginAttempts)) {
    throw new Error('failed login attempts must be an integer')
  }
  if (account.failedLoginAttempts < 0 || account.failedLoginAttempts > MAX_FAILED_LOGINS) {
    throw new Error('failed login attempts must be between zero and three')
  }
  if (account.state === 'active' && account.failedLoginAttempts === MAX_FAILED_LOGINS) {
    throw new Error('active account cannot have three failed logins')
  }
  if (account.state === 'locked' && account.failedLoginAttempts !== MAX_FAILED_LOGINS) {
    throw new Error('locked account must have three failed logins')
  }
  return globalThis.Object.freeze({
    ...account,
    ...object,
    state: account.state,
    failedLoginAttempts: account.failedLoginAttempts,
  })
}
```

The application service coordinates persistence without reproducing the threshold:

```ts
const account = await repository.get(accountId)
const nextAccount = Account.recordFailedLogin(account)
await repository.save(nextAccount)
```

Test behavior through the public API. Use the project's test runner. This example uses Vitest:

```ts
import { describe, expect, it } from 'vitest'

import { Account, IllegalAccountTransition } from './account'

function lockedAccount(): Account {
  let account = Account.create({ id: 'acct-1' })
  for (let attempt = 0; attempt < 3; attempt += 1) {
    account = Account.recordFailedLogin(account)
  }
  return account
}

describe('Account', () => {
  it('locks on the third failed login', () => {
    let account = Account.create({ id: 'acct-1' })

    for (let attempt = 0; attempt < 3; attempt += 1) {
      account = Account.recordFailedLogin(account)
    }

    expect(account.state).toBe('locked')
    expect(account.failedLoginAttempts).toBe(3)
  })

  it('rejects another failed login while locked', () => {
    const account = lockedAccount()

    expect(() => Account.recordFailedLogin(account)).toThrow(IllegalAccountTransition)
    expect(() => Account.recordFailedLogin(account)).toThrow(
      'only an active account can record a failed login',
    )
    expect(account).toEqual({ id: 'acct-1', state: 'locked', failedLoginAttempts: 3 })
  })

  it('unlocks and resets the failed count', () => {
    const account = lockedAccount()

    const nextAccount = Account.unlock(account)

    expect(nextAccount.state).toBe('active')
    expect(nextAccount.failedLoginAttempts).toBe(0)
  })

  it('rejects unlocking an active account', () => {
    const account = Account.create({ id: 'acct-1' })

    expect(() => Account.unlock(account)).toThrow(IllegalAccountTransition)
    expect(() => Account.unlock(account)).toThrow('only a locked account can be unlocked')
    expect(account).toEqual({ id: 'acct-1', state: 'active', failedLoginAttempts: 0 })
  })

  it('rejects impossible hydrated state', () => {
    expect(() =>
      Account.hydrate({
        id: 'acct-1',
        state: 'locked',
        failedLoginAttempts: 1,
      }),
    ).toThrow('locked account must have three failed logins')
  })

  it('rejects an unknown hydrated state', () => {
    expect(() =>
      Account.hydrate({
        id: 'acct-1',
        state: 'disabled',
        failedLoginAttempts: 0,
      }),
    ).toThrow('account state must be active or locked')
  })
})
```

If the repository already uses a runtime validation library, keep the domain schema beside the model and have `hydrate` call it. Do not add a validation dependency merely to avoid a short pure validator.
