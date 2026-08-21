# TypeScript reference

Use this reference when implementing or reviewing a TypeScript domain model. Load the [TypeScript pure-pattern reference](../../principle-prefer-pure-functional-patterns/references/typescript.md) for `Modifier`, `EmittingModifier`, `Change`, `apply`, and `applyEmitting`.

For plain domain values, pair a strict Zod schema with its inferred branded type. The schema owns valid shape; the brand prevents a matching object literal from satisfying the domain type without parsing. Use `create` for legal initial state, named modifiers for earned changes, and a separate adapter hydration capability for stored state.

Keep transport aliases, API schemas, persistence decorators, `toJSON`, and I/O outside the domain module. Zod's readonly wrapper and TypeScript's `readonly` are shallow. Return fresh arrays, objects, maps, sets, and dates when aliases would be unsafe.

## Worked contract

An `Account` starts active with no failed login attempts.

- Recording a failed login is a consequence of failed credential verification.
- Only an active account may record it.
- The third failed login locks the account and produces `AccountLocked`.
- Unlocking is a command invoked after application authorization. The account accepts it only while locked and resets the failed count.
- An active account has zero to two failures. A locked account has exactly three.

Failed-login recording owes state plus a fact, so it uses an emitting modifier. Unlocking owes only state, so it uses an ordinary modifier.

```ts
import * as E from 'fp-ts/Either'
import { z } from 'zod'

import { ObjectSchema, type ObjectValue } from '../base/object'
import type { EmittingModifier, Modifier } from '../functional'

const MAX_FAILED_LOGINS = 3

const ActiveAccountSchema = z.strictObject({
  ...ObjectSchema.shape,
  state: z.literal('active'),
  failedLoginAttempts: z.number().int().min(0).max(MAX_FAILED_LOGINS - 1),
})

const LockedAccountSchema = z.strictObject({
  ...ObjectSchema.shape,
  state: z.literal('locked'),
  failedLoginAttempts: z.literal(MAX_FAILED_LOGINS),
})

export const AccountSchema = z
  .discriminatedUnion('state', [ActiveAccountSchema, LockedAccountSchema])
  .brand<'Account'>()
  .readonly()

export type Account = z.infer<typeof AccountSchema>

export type AccountTransitionError =
  | { readonly code: 'account_not_active' }
  | { readonly code: 'account_not_locked' }

export type AccountFact = {
  readonly type: 'accountLocked'
  readonly accountId: string
}

export const Account = {
  create(object: ObjectValue): Account {
    return AccountSchema.parse({
      ...object,
      state: 'active',
      failedLoginAttempts: 0,
    })
  },
}

export const AccountModifiers = {
  withFailedLoginRecorded(): EmittingModifier<
    Account,
    AccountTransitionError,
    AccountFact
  > {
    return account => {
      if (account.state !== 'active') {
        return E.left({ code: 'account_not_active' })
      }

      const failedLoginAttempts = account.failedLoginAttempts + 1
      const state = failedLoginAttempts === MAX_FAILED_LOGINS ? 'locked' : 'active'
      const next = AccountSchema.parse({ ...account, state, failedLoginAttempts })
      const facts: readonly AccountFact[] =
        state === 'locked'
          ? [{ type: 'accountLocked', accountId: account.id }]
          : []

      return E.right({ value: next, facts })
    }
  },

  withUnlock(): Modifier<Account, AccountTransitionError> {
    return account => {
      if (account.state !== 'locked') {
        return E.left({ code: 'account_not_locked' })
      }

      return E.right(
        AccountSchema.parse({
          ...account,
          state: 'active',
          failedLoginAttempts: 0,
        }),
      )
    }
  },
}
```

`z.strictObject` rejects unexpected stored fields instead of silently stripping them. The brand means this does not compile:

```ts
// BAD: matching shape is not an Account and cannot earn locked state.
const forged: Account = {
  id: 'acct-1',
  state: 'locked',
  failedLoginAttempts: 3,
}
```

Put hydration behind an internal, adapter-facing path. The application barrel exports `Account`, `AccountModifiers`, and the `Account` type, but not `AccountSchema` or this function:

```ts
// domains/accounts/internal/hydration.ts
import { AccountSchema, type Account } from '../account'

export function hydrateAccount(data: unknown): Account {
  return AccountSchema.parse(data)
}
```

Only parsing can produce the brand. `create` chooses legal initial state; behavior earns later state. Hydration can restore a valid locked account, so keep that capability out of ordinary application imports and never use it as a command.

Parsing every successful modifier result keeps whole-object invariants in force. A schema exception after valid domain input is a programmer defect, not an expected `Left`.

## Call without restating rules

```ts
const account = await repository.get(accountId)
const result = applyEmitting(
  account,
  AccountModifiers.withFailedLoginRecorded(),
)
if (E.isLeft(result)) return result

await settlement.settleAccount(result.right)
```

`settleAccount` accepts the complete `Change` and writes state plus mapped outbox records in one real transaction. The application verifies credentials and maps stored values. It does not reproduce the threshold, assign locked state, or invent `AccountLocked`.

## Prove earned state and restoration

```ts
import * as E from 'fp-ts/Either'
import { describe, expect, it } from 'vitest'
import { z } from 'zod'

import { apply, applyEmitting } from '../functional'
import {
  Account,
  AccountModifiers,
  type Account as AccountValue,
} from './account'
import { hydrateAccount } from './internal/hydration'

function expectRight<A>(result: E.Either<unknown, A>): A {
  if (E.isLeft(result)) throw new Error(`unexpected failure: ${JSON.stringify(result.left)}`)
  return result.right
}

function lockedAccount(): AccountValue {
  let account = Account.create({ id: 'acct-1' })
  for (let attempt = 0; attempt < 3; attempt += 1) {
    account = expectRight(
      applyEmitting(account, AccountModifiers.withFailedLoginRecorded()),
    ).value
  }
  return account
}

describe('Account', () => {
  it('earns locked state and its fact on the third failure', () => {
    const initial = Account.create({ id: 'acct-1' })
    const first = expectRight(
      applyEmitting(initial, AccountModifiers.withFailedLoginRecorded()),
    )
    const second = expectRight(
      applyEmitting(first.value, AccountModifiers.withFailedLoginRecorded()),
    )
    const third = expectRight(
      applyEmitting(second.value, AccountModifiers.withFailedLoginRecorded()),
    )

    expect(third.value.id).toBe('acct-1')
    expect(third.value.state).toBe('locked')
    expect(third.value.failedLoginAttempts).toBe(3)
    expect(third.facts).toEqual([
      { type: 'accountLocked', accountId: 'acct-1' },
    ])
    expect(first.facts).toEqual([])
    expect(second.facts).toEqual([])
  })

  it('rejects another failed login without leaking change', () => {
    const account = lockedAccount()
    const result = applyEmitting(
      account,
      AccountModifiers.withFailedLoginRecorded(),
    )

    expect(result).toEqual(E.left({ code: 'account_not_active' }))
    expect(account).toEqual({
      id: 'acct-1',
      state: 'locked',
      failedLoginAttempts: 3,
    })
  })

  it('rejects unlock from active state', () => {
    const account = Account.create({ id: 'acct-1' })
    expect(apply(account, AccountModifiers.withUnlock())).toEqual(
      E.left({ code: 'account_not_locked' }),
    )
    expect(account).toEqual({
      id: 'acct-1',
      state: 'active',
      failedLoginAttempts: 0,
    })
  })

  it('unlocks through behavior', () => {
    expect(expectRight(apply(lockedAccount(), AccountModifiers.withUnlock()))).toEqual(
      Account.create({ id: 'acct-1' }),
    )
  })

  it('accepts valid hydration and rejects the exact broken field', () => {
    expect(
      hydrateAccount({
        id: 'acct-1',
        state: 'locked',
        failedLoginAttempts: 3,
      }),
    ).toEqual(lockedAccount())

    try {
      hydrateAccount({
        id: 'acct-1',
        state: 'locked',
        failedLoginAttempts: 1,
      })
      throw new Error('expected hydration to fail')
    } catch (error) {
      expect(error).toBeInstanceOf(z.ZodError)
      const issue = (error as z.ZodError).issues[0]
      expect(issue.path).toEqual(['failedLoginAttempts'])
      expect(issue.code).toBe('invalid_value')
    }
  })
})
```

Do not import `internal/hydration` to stage earned state in ordinary behavior tests. Build the fixture through production behavior. The valid hydration case prevents a validator that rejects every stored record from passing; the negative pins the exact field and issue code.

## Class alternative

Use a class when the repository already models domain identity and behavior with classes or needs several meaningful construction routes. Keep its constructor private, fields readonly, and creation explicit:

```ts
class AccountEntity {
  private constructor(private readonly value: Account) {}

  static create(object: ObjectValue): AccountEntity {
    return new AccountEntity(Account.create(object))
  }

  // Keep this static behind the adapter-facing export. Do not expose the
  // AccountEntity constructor value from the application module.
  static hydrate(data: unknown): AccountEntity {
    return new AccountEntity(AccountSchema.parse(data))
  }
}
```

Expose `create` through the application-facing factory and `hydrate` through the repository adapter; do not export the class constructor value to ordinary callers. Add named `fromX` factories or constructor overloads only for distinct legal sources. Do not add setters, public raw-state constructors, `serialize`, `toJSON`, or transport decorators. Class methods still return the same ordinary or emitting modifier result when behavior may be refused.

Keep authorization, repositories, clocks, DTO mapping, transactions, and publication outside the module. When several aggregates change, compute every pure result first, then coordinate persistence. The modifier contract does not create transaction atomicity by itself.
