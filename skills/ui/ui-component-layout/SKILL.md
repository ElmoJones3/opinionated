---
name: ui-component-layout
description: Structure layout-bearing React components as Shell, Constraint, and Layout layers driven by container queries. Use for cards, forms, sections, visualizations, page templates, responsive grids, and flex layouts. Do not use for single controls.
user-invocable: false
---

# Structure component layouts

Separate layout responsibilities into Shell, Constraint, and Layout elements. Each element owns one job. The component then responds to the space it receives instead of assuming where the page placed it.

## Choose the required layers

Use the smallest complete structure for the component:

- A single control such as `Button`, `Input`, `Icon`, or `Badge` uses none of these layers.
- A small composition that only arranges children may use Layout by itself.
- A component that needs horizontal limits or container queries uses Constraint and Layout.
- A component that owns positioning, full width, or vertical rhythm uses all three layers.

If the component arranges other components and owns all three responsibilities, use the full structure.

## Give each layer one job

| Layer | Owns | Typical classes |
| --- | --- | --- |
| Shell | Position, vertical rhythm, full width | `relative`, `fixed`, `w-full`, `py-*`, `my-*`, `h-*` |
| Constraint | Horizontal size, centering, container root | `mx-auto`, `max-w-*`, `px-*`, `w-full`, `@container` |
| Layout | Child arrangement and reflow | `grid`, `flex`, `gap-*`, `min-h-0`, `min-w-0`, `@md:*` |

Keep the ownership strict:

- Shell fills its slot with `w-full`. It may establish position and vertical rhythm. It never sets `max-w-*` or another constraining width.
- Constraint owns horizontal padding, width limits, centering, and `@container`.
- Layout owns grid, flex, gaps, alignment, and responsive arrangement. Give it `min-h-0 min-w-0` by default so it can shrink when an ancestor bounds either axis.

Do not put horizontal constraints on Shell. Do not put vertical rhythm on Constraint or Layout.

## Use container queries for component reflow

A container query cannot style the element that declares the container. Constraint must declare `@container`, and its child Layout must consume variants such as `@md:*`.

Use viewport variants only when behavior truly depends on the viewport. A reusable component should normally reflow from its available container width.

## Build a full component

```tsx
function StatsPanel({ className, children, ...props }: React.ComponentProps<'section'>) {
  return (
    <section
      {...props}
      className={cn('relative w-full py-12', className)}
      data-slot="stats-panel"
    >
      <div
        className="mx-auto w-full max-w-5xl px-4 @container"
        data-slot="stats-panel-constraint"
      >
        <div
          className={cn([
            // Layout
            'grid min-h-0 min-w-0 grid-cols-1 gap-4',
            // Responsive
            '@md:grid-cols-2 @4xl:grid-cols-4',
          ])}
          data-slot="stats-panel-grid"
        >
          {children}
        </div>
      </div>
    </section>
  );
}
```

Merge the consumer `className` into Shell because Shell is the component root. Spread consumer props before the attributes the component owns.

The same component can render four columns in a wide band and one column in a sidebar. Its container variants respond to Constraint, so placement does not require another prop or breakpoint.

## Name nested containers

An unnamed container variant targets the nearest container. Name Constraint when nested components make that ambiguous:

```tsx
<div className="@container/panel">
  <div className="grid grid-cols-1 @md/panel:grid-cols-2">...</div>
</div>
```

Name only the containers that need explicit targeting.

## Keep bounded tracks shrinkable

Flex and grid items default to `min-height: auto` and `min-width: auto`. Those defaults can make a track expand with its content instead of respecting a bound.

Add shrink overrides where the bounded layout needs them:

| Element | Add |
| --- | --- |
| Layout | `min-h-0 min-w-0` by default |
| Shell used as a bounded flex or grid cell | `min-h-0` or `min-w-0` for the bounded axis |
| A child that must shrink inside Layout | `min-h-0` or `min-w-0` for the bounded axis |

These classes affect shrink behavior only when an ancestor caps the available size. An unconstrained layout still grows with its content.

## Put vertical scrolling on Shell

Shell owns the vertical axis, so place `overflow-y-auto` there. A working scroll region needs all of these conditions:

1. An ancestor sets a real height through `h-screen`, a fixed parent with `h-full`, or a bounded grid or flex track.
2. The scrolling Shell can shrink within that track. Add `min-h-0` when Shell is the grid or flex cell.
3. Constraint and Layout inside the scrolling Shell keep their natural height. Do not add `h-full` to them.
4. The scrolling Shell does not also set `overflow-hidden`.

```tsx
<main className="h-screen overflow-hidden">
  <div className="grid h-full min-h-0 grid-cols-[1fr_auto]">
    <section className="min-h-0 overflow-y-auto">
      <div className="mx-auto w-full max-w-5xl px-4 @container">
        <div className="grid min-h-0 min-w-0 gap-4 @md:grid-cols-2">
          {/* Natural-height content scrolls when it exceeds the track. */}
        </div>
      </div>
    </section>
  </div>
</main>
```

## Check the result

- Use only the layers whose responsibilities the component owns.
- Keep Shell full width and free of horizontal constraints.
- Keep horizontal sizing and `@container` on Constraint.
- Keep arrangement and container variants on Layout.
- Keep single controls out of the layout grammar.
- Add shrink overrides only at bounded flex and grid tracks.
- Keep descendants of a scrolling Shell at natural height.
