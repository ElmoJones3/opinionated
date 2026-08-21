# StyleX layout edge cases

Use this reference when the StyleX Base structure exists but height, overflow, scrolling, containment, or viewport behavior is wrong. Add new recurring failures here instead of weakening the main rule.

## Choose the Shell profile deliberately

Standalone `Base.Shell` uses the bounded profile: `height: '100%'` with both overflow axes closed and scrolling opt-in through `scrollY` or `scrollX`. This keeps dashboard frames, panes, tables, and visualizations inside the box that owns them.

`Base.Section` and the default `Base.Page` use the flow profile: automatic height with visible overflow. `Base.Page variant="viewport"` selects bounded. If a product needs another policy, encode it once as a named Shell or Page style variant. Do not scatter visible overflow, automatic height, and competing height rules through feature styles. Keep Shell -> Constraint -> Layout unchanged.

## Vertical scrolling needs a real height chain

Put vertical scrolling on the Shell that owns the vertical axis. All of these conditions must hold:

1. An ancestor caps height through a viewport box, fixed parent, or bounded grid or flex track.
2. A scrolling Shell used as a grid or flex cell has `minHeight: 0`.
3. Constraint and Layout inside that Shell keep natural height. Do not give them `height: '100%'`.
4. The resolved StyleX props leave `overflowY: 'auto'` on Shell.

```tsx
const styles = stylex.create({
  frame: {
    // Layout
    height: '100%',
    gridTemplateColumns: 'minmax(0, 1fr) auto',
  },
  scrollPane: {
    // Layout
    minHeight: 0,
  },
})

<Base.Page variant="viewport">
  <Base.Layout gap="none" style={styles.frame} variant="grid">
    <Base.Shell scrollY style={styles.scrollPane}>
      <Base.Constraint>
        <Base.Layout>{/* Natural-height content */}</Base.Layout>
      </Base.Constraint>
    </Base.Shell>
    <InspectorPanel />
  </Base.Layout>
</Base.Page>
```

The viewport is the horizontal bound for this application frame, so the outer Layout may sit directly under Page. Do not generalize that exception to ordinary sections or content pages.

If `scrollHeight` equals `clientHeight` when content should overflow, inspect the ancestor height chain and remove `height: '100%'` from inner Constraint or Layout styles.

## Bounded grid and flex items must shrink

Flex and grid items default to `min-height: auto` and `min-width: auto`. Content can expand the track instead of respecting its bound.

| Element | Default | Add when |
| --- | --- | --- |
| `Base.Layout` | `minHeight: 0`, `minWidth: 0` | Already supplied by Base |
| `Base.Shell` | None | Shell occupies a bounded grid or flex track |
| Child inside Layout | None | The child must shrink within a bounded axis |

Use `minHeight: 0` for the vertical axis and `minWidth: 0` for the horizontal axis. Unbounded layouts still grow with content.

## Mobile viewport height is not one number

Use `height: '100dvh'` when a pinned application must follow mobile browser controls as they expand or retract. Keep `height: '100vh'` only when the large viewport height is intentional.

- [MDN viewport length units](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/length)

Treat this as a named Page style variant in Base. Do not repair mobile height inside a feature component.

## Nested containers may need names

An unnamed container condition targets the nearest container. Set `containerName` on Constraint when a nested component must query a specific ancestor:

```tsx
const styles = stylex.create({
  panelContainer: {
    containerName: 'panel',
  },
  panelGrid: {
    gridTemplateColumns: {
      default: 'minmax(0, 1fr)',
      '@container panel (min-width: 28rem)': 'repeat(2, minmax(0, 1fr))',
    },
  },
})

<Base.Constraint style={styles.panelContainer}>
  <Base.Layout style={styles.panelGrid} variant="grid">
    {children}
  </Base.Layout>
</Base.Constraint>
```

Name only the container that needs explicit targeting.

## Portals change the ancestor chain

A dialog, popover, or tooltip rendered through a portal no longer sees the container around its trigger. Its responsive content must query a Constraint inside the portal. Inspect the rendered DOM, not the component source tree.

## Confirm resolved overflow

The dashboard profile combines Shell's closed `overflowX` and `overflowY` defaults with one scroll style. `stylex.props` resolves conflicts from left to right, so Base styles must come first and approved caller styles come last.

Do not add an automated layout test by default. If Base already has focused tests, resolved scroll style output is a useful case to keep there.

## Official references

- [StyleX authoring guide](https://github.com/facebook/stylex/blob/main/packages/docs/static/llm/stylex-authoring.md)
- [StyleX defining styles](https://stylexjs.com/docs/learn/styling-ui/defining-styles/)
