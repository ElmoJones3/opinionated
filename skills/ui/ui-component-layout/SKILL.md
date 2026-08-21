---
name: ui-component-layout
description: Enforce the Base.Shell -> Base.Constraint -> Base.Layout grammar. Mandatory when creating or changing a React component that arranges children or responds to available space.
user-invocable: false
---

# Enforce the Base layout grammar

Every project must have one shared `Base` layout compound, or a project-standard equivalent, with `Base.Shell`, `Base.Constraint`, and `Base.Layout`.

Base owns its defaults and reusable presets through one typed variant schema. Tailwind uses CVA. StyleX uses semantic style namespaces, typed lookup tables, and resolvers outside JSX.

Find it before writing layout. If it does not exist, create it in the shared UI package before building the feature. Do not reproduce the contract with local wrappers and copied Tailwind or StyleX rules.

Inspect the component imports and load the matching implementation reference before creating, repairing, or comparing Base:

- Tailwind, `className`, `cn`, or `cva`: read [references/tailwind/base-anatomy.md](references/tailwind/base-anatomy.md).
- `@stylexjs/stylex`, `stylex.create`, or `stylex.props`: read [references/stylex/base-anatomy.md](references/stylex/base-anatomy.md).

Do not mix Tailwind and StyleX on one Base element.

Creating or changing Base also triggers `ui-component-variants`, `ui-component-style-groups`, `ui-component-prop-contracts`, and `ui-compound-components`. This skill owns the three-layer layout contract. Those skills own variant selection, declaration structure, forwarded props, and the public family.

## Use three physical layers

| Part | Owns |
| --- | --- |
| `Base.Shell` | Position, height, vertical rhythm, full-width boundary, overflow |
| `Base.Constraint` | Horizontal gutter, maximum width, centering, container-query root |
| `Base.Layout` | Row, column, grid, gap, alignment, container-driven reflow |

Keep ownership strict:

- Shell never constrains horizontal width.
- Constraint never owns vertical spacing or height.
- Layout never owns page spacing.
- Constraint and Layout remain separate rendered elements. A size container cannot query itself.
- Component reflow uses container queries. Tailwind uses variants such as `@md:`. StyleX uses property conditions such as `@container (min-width: 28rem)`.
- Use viewport queries only when behavior truly depends on the viewport.

## Apply the grammar by scope

- Single controls such as `Button`, `Input`, `Icon`, and `Badge` opt out.
- Small compositions that only arrange controls use `Base.Layout` or `Base.Layout.Row`. They do not create local flex or grid replacements.
- Cards, forms, sections, visualizations, templates, and pages use Shell -> Constraint -> Layout.
- `Base.Page` and `Base.Section` are semantic Shell conveniences. They do not collapse the three-layer structure.
- Standalone Shell is bounded by default. Section and ordinary Page stay in document flow. Viewport Page opts into the bounded profile.
- A viewport application shell may place `Base.Layout` directly under `Base.Page` when the viewport itself is the horizontal bound. Use only the documented split-pane pattern.

The grammar is mandatory. Do not treat these parts as a menu for inventing another layout structure.

## Use the shared component

```tsx
function StatsPanel({ children }: { children: React.ReactNode }) {
  return (
    <Base.Section>
      <Base.Constraint width="5xl">
        <Base.Layout gap="md" variant="grid">
          {children}
        </Base.Layout>
      </Base.Constraint>
    </Base.Section>
  )
}
```

`Base.Section` owns full width and vertical spacing. `Base.Constraint` owns horizontal size and opens the query container. `Base.Layout` arranges children. The matching framework reference adds container-driven columns without changing this structure.

The same component must reflow in a wide band, narrow sidebar, or modal without placement props or a second component.

Read the matching examples before implementing a page, section, toolbar, responsive panel, or split-pane application:

- [Tailwind examples](references/tailwind/examples.md)
- [StyleX examples](references/stylex/examples.md)

## Handle layout failures mechanically

Read the matching edge-case reference when height, overflow, scrolling, nested containers, portals, or mobile viewport behavior is involved:

- [Tailwind edge cases](references/tailwind/edge-cases.md)
- [StyleX edge cases](references/stylex/edge-cases.md)

Inspect the rendered elements in order: Shell, Constraint, Layout. Verify the owner of the failing axis, the actual container width, and the variant that should respond. Do not patch a mobile failure with unrelated width, height, or viewport rules.

## Finish the work

- The shared Base family exists and the feature uses it.
- Each layer owns only its assigned axis.
- Qualifying components render all three physical layers.
- Constraint establishes size containment; Layout consumes the framework's container query.
- Consumer props are spread first. Base applies its resolved styling and controlled `data-slot` afterward.
- Polymorphic render elements are bare semantic replacements with no styling or `data-slot` of their own.
- No local wrapper recreates Base behavior.
- Check narrow and wide container widths when a browser preview is available. Do not add layout tests by default.
