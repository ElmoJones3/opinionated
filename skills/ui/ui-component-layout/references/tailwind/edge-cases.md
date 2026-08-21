# Tailwind layout edge cases

Use this reference when the three-layer structure exists but height, overflow, scrolling, containment, or viewport behavior is wrong. Add new recurring failures here instead of weakening the main rule.

## Choose the Shell profile deliberately

Standalone `Base.Shell` uses the bounded profile: `h-full overflow-hidden`, with scrolling opt-in through `scrollY` or `scrollX`. This keeps dashboard frames, panes, tables, and visualizations inside the box that owns them.

`Base.Section` and the default `Base.Page` use the flow profile: `h-auto overflow-visible`. `Base.Page variant="viewport"` selects bounded. If a product needs another policy, encode it once as a named Shell or Page CVA variant. Do not scatter `overflow-visible`, `h-auto`, and competing height rules through feature components. Keep Shell -> Constraint -> Layout unchanged.

## Vertical scrolling needs a real height chain

Put vertical scrolling on the Shell that owns the vertical axis. All of these conditions must hold:

1. An ancestor caps height through a viewport box, fixed parent, or bounded grid or flex track.
2. A scrolling Shell used as a grid or flex cell has `min-h-0`.
3. Constraint and Layout inside that Shell keep natural height. Do not set `h-full` on them.
4. The final class merge leaves vertical overflow on `auto`.

```tsx
<Base.Page variant="viewport">
  <Base.Layout
    className="h-full grid-cols-[minmax(0,1fr)_auto]"
    gap="none"
    variant="grid"
  >
    <Base.Shell className="min-h-0" scrollY>
      <Base.Constraint>
        <Base.Layout>{/* Natural-height content */}</Base.Layout>
      </Base.Constraint>
    </Base.Shell>
    <InspectorPanel />
  </Base.Layout>
</Base.Page>
```

The viewport is the horizontal bound for this application frame, so the outer Layout may sit directly under Page. Do not generalize that exception to ordinary sections or content pages.

If `scrollHeight` equals `clientHeight` when content should overflow, inspect the ancestor height chain and remove `h-full` from inner Constraint or Layout elements.

## Bounded grid and flex items must shrink

Flex and grid items default to `min-height: auto` and `min-width: auto`. Content can expand the track instead of respecting its bound.

| Element | Default | Add when |
| --- | --- | --- |
| `Base.Layout` | `min-h-0 min-w-0` | Already supplied by Base |
| `Base.Shell` | None | Shell occupies a bounded grid or flex track |
| Child inside Layout | None | The child must shrink within a bounded axis |

Use `min-h-0` for the vertical axis and `min-w-0` for the horizontal axis. Unbounded layouts still grow with content.

## Mobile viewport height is not one number

Tailwind maps `h-screen` to `100vh` and `h-dvh` to `100dvh`. Use `h-dvh` when a pinned application must follow mobile browser controls as they expand or retract. Keep `h-screen` only when the large viewport height is intentional.

- [Tailwind height utilities](https://tailwindcss.com/docs/height)
- [MDN viewport length units](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/length)

Treat this as a Page variant decision in Base. Do not repair mobile height inside a feature component.

## Nested containers may need names

An unnamed container variant targets the nearest container. Name Constraint when a nested component must query a specific ancestor:

```tsx
<Base.Constraint className="@container/panel">
  <Base.Layout className="@md/panel:grid-cols-2" variant="grid">
    {children}
  </Base.Layout>
</Base.Constraint>
```

Name only the container that needs explicit targeting.

## Portals change the ancestor chain

A dialog, popover, or tooltip rendered through a portal no longer sees the container around its trigger. Its responsive content must query a Constraint inside the portal. Inspect the rendered DOM, not the component source tree.

## Confirm the final overflow classes

The dashboard profile combines Shell's base `overflow-hidden` with `scrollY` or `scrollX`. Inspect the repository `cn` helper and the rendered class list when scrolling fails. The merger must leave the intended axis scrollable while the other axis remains clipped.

Do not add an automated layout test by default. If Base already has focused tests, overflow variant output is a useful case to keep there.
