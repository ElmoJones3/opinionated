# State owned by another library

Use the repository's existing state owner before adding React state. Inspect `package.json`, nearby components, router setup, and query setup first.

## Contents

- [Ownership map](#ownership-map)
- [Forms use TanStack React Form by default](#forms-use-tanstack-react-form-by-default)
- [Server state stays in the query cache](#server-state-stays-in-the-query-cache)
- [Shareable state stays in the URL](#shareable-state-stays-in-the-url)

## Ownership map

| State | Owner | Do not add |
| --- | --- | --- |
| Remote records, loading, errors, invalidation | Existing query library | A second `data`, `loading`, or `error` state |
| Filters, tabs, page, sort, selected route entity | Existing router and URL search params | Mirrored component state synchronized by an effect |
| Values, validation, touched, dirty, submission | Existing form library | A reducer or local state copy of the form |

Derive display values directly from the owner's current value. Test application code at the boundary you own, such as the query function, URL parser, validator, or submit transformation.

## Forms use TanStack React Form by default

Apply this package policy exactly:

1. If `@tanstack/react-form` exists, use it.
2. If `react-hook-form` exists, use it for the current task and offer to migrate to TanStack React Form. Do not migrate without approval.
3. If another form library exists, use it only as needed to avoid an unrequested rewrite and offer the TanStack migration.
4. If no form library exists, run `pnpm add @tanstack/react-form` and use TanStack React Form.

The form library owns its internal transitions. Keep application validation and submission rules independently callable and test those functions directly.

Do not render the form to prove that the library tracks touched, dirty, validating, or
submitting state. Do not simulate edits to retest its validation schedule. Those are the
library's transitions. A thin component test may verify that an application callback is
wired to the form, but it comes after direct tests of every validator, adapter, and submit
transformation the application owns.

```tsx
import { useForm } from '@tanstack/react-form'

type Profile = {
  age: number
  name: string
}

export const profileDefaults: Profile = {
  age: 0,
  name: '',
}

export function validateAdultProfile(value: Profile) {
  return value.age >= 18 ? undefined : 'Must be at least 18'
}

export function ProfileForm() {
  const form = useForm({
    defaultValues: profileDefaults,
    onSubmit: async ({ value }) => saveProfile(value),
  })

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        void form.handleSubmit()
      }}
    >
      <form.Field
        name="age"
        validators={{ onChange: ({ value }) => validateAdultProfile({ ...form.state.values, age: value }) }}
      >
        {(field) => (
          <input
            aria-invalid={!field.state.meta.isValid}
            name={field.name}
            onBlur={field.handleBlur}
            onChange={(event) => field.handleChange(event.target.valueAsNumber)}
            type="number"
            value={field.state.value}
          />
        )}
      </form.Field>
    </form>
  )
}
```

Test the rule without simulating an input event:

```ts
import { describe, expect, it } from 'vitest'

describe('validateAdultProfile', () => {
  it('rejects a minor', () => {
    expect(validateAdultProfile({ age: 17, name: 'Ari' })).toBe('Must be at least 18')
  })

  it('accepts an adult', () => {
    expect(validateAdultProfile({ age: 18, name: 'Ari' })).toBeUndefined()
  })
})
```

## Server state stays in the query cache

Use the repository's query hook and derive presentation data from its result:

```tsx
const usersQuery = useUsersQuery()
const activeUsers = usersQuery.data?.filter((user) => user.active) ?? []
```

Do not copy `usersQuery.data` or `usersQuery.isPending` into component state. Test the query function and any non-trivial transformation directly.

## Shareable state stays in the URL

Use the router's typed search API when available:

```tsx
const search = Route.useSearch()
const navigate = Route.useNavigate()

function selectTab(tab: 'activity' | 'settings') {
  void navigate({ search: (current) => ({ ...current, tab }) })
}
```

Do not mirror `search.tab` into component state. Test custom parse and serialize functions directly when the router does not provide typed validation.

## Official references

- [TanStack Form installation](https://tanstack.com/form/latest/docs/installation)
- [TanStack React Form quick start](https://tanstack.com/form/latest/docs/framework/react/quick-start)
- [React Hook Form](https://github.com/react-hook-form/react-hook-form)
- [React state structure](https://react.dev/learn/choosing-the-state-structure)
