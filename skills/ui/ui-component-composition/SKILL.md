---
name: ui-component-composition
description: Choose React component boundaries by responsibility. Mandatory when deciding whether UI markup belongs in one component or several.
user-invocable: false
---

# Set component boundaries

A component owns one recognizable interface job. Split where a part has its own meaning or behavior. Combine pieces that only make sense as one interaction.

Use Atomic Design as a mental model for parts and wholes, not as a required folder structure or build sequence. Read [references/atomic-design.md](references/atomic-design.md) when deciding how a component fits into the larger interface.

## Keep the smallest useful control whole

Do not split markup merely because smaller elements can be named. A `Button`, `Input`, or `Icon` is already a coherent control.

```tsx
function Button(props: React.ComponentProps<'button'>) {
  return <button {...props} />
}
```

Create a child component only when it earns a separate responsibility, API, behavior, or reusable identity.

## Combine parts around one job

A label, input, and submit button form one search interaction. Give that interaction a component boundary:

```tsx
function SearchForm({ onSubmit }: SearchFormProps) {
  const inputId = React.useId()

  return (
    <form onSubmit={onSubmit}>
      <label htmlFor={inputId}>Search</label>
      <input id={inputId} name="query" type="search" />
      <button type="submit">Search</button>
    </form>
  )
}
```

The elements remain replaceable parts, but `SearchForm` owns their shared semantics and behavior.

## Extract a distinct section

Extract a child when it:

- repeats as a recognizable unit;
- owns behavior, state, or an API;
- can be understood and tested independently; or
- forms a distinct interface section.

For example, `ProductGrid` arranges products while `ProductCard` presents and operates on one product. Keep a passive wrapper inside its parent when extracting it would only rename markup.

## Separate template structure from page data

A template owns slots and content structure. A page binds real route data and exercises loading, empty, error, permission, and content-length cases.

```tsx
function DashboardTemplate({ navigation, main }: DashboardTemplateProps) {
  return <DashboardFrame navigation={navigation} main={main} />
}

function DashboardPage() {
  const dashboard = useDashboard()
  return <DashboardTemplate navigation={<Navigation />} main={<Dashboard data={dashboard} />} />
}
```

## Hand off implementation details

- Load `ui-component-layout` when the component arranges children or owns responsive layout.
- Load `ui-compound-components` when consumers combine interdependent parts to build one control.
- Load `ui-component-style-groups` when creating, changing, or reviewing component visuals.
- Load `ui-component-variants` when props or derived state select classes or style objects.
- Load `ui-component-prop-contracts` when the component forwards consumer props.
- Load `ui-principle-state-management` when the component owns interactive behavior, derives state, consumes ongoing events, or coordinates animation.

## Check the boundaries

- Each component owns one recognizable job.
- Extracted children own responsibility, not merely markup.
- Interdependent parts remain one conceptual control.
- Templates describe content structure; pages bind real data and states.
- Atomic labels do not dictate folders, exports, or wrapper elements.
