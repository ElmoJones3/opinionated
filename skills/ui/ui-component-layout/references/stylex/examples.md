# StyleX Base examples

Use these examples after locating the project's StyleX Base family. Preserve its existing variant names when they differ from the canonical anatomy.

## Single controls opt out

An atom does not arrange other controls. `Input`, `Button`, `Icon`, and `Badge` do not use Base layout parts. Their own StyleX contract still applies.

## Small compositions use Base.Layout

```tsx
type ToolbarProps = Omit<React.ComponentProps<'header'>, 'className' | 'style'> & {
  style?: StyleXStyles
}

function Toolbar({ style, ...props }: ToolbarProps) {
  return (
    <Base.Layout.Row
      {...props}
      data-component="toolbar"
      gap="sm"
      render={<header />}
      style={style}
    />
  )
}
```

Do not replace `Base.Layout.Row` with a local flex style.

## Sections use the full grammar

Container conditions belong inside the property they change and include a default value:

```tsx
import * as stylex from '@stylexjs/stylex'
import type { StyleXStyles } from '@stylexjs/stylex'

const styles = stylex.create({
  section: {
    // Layout
    paddingBlock: 48,
  },
  metricsGrid: {
    // Responsive
    gridTemplateColumns: {
      default: 'minmax(0, 1fr)',
      '@container (min-width: 28rem)': 'repeat(2, minmax(0, 1fr))',
      '@container (min-width: 56rem)': 'repeat(4, minmax(0, 1fr))',
    },
  },
})

type MetricsSectionProps = Omit<
  React.ComponentProps<'section'>,
  'className' | 'style'
> & {
  style?: StyleXStyles
}

function MetricsSection({ children, style, ...props }: MetricsSectionProps) {
  return (
    <Base.Section
      {...props}
      data-component="metrics"
      style={[styles.section, style]}
    >
      <Base.Constraint width="5xl">
        <Base.Layout gap="md" style={styles.metricsGrid} variant="grid">
          {children}
        </Base.Layout>
      </Base.Constraint>
    </Base.Section>
  )
}
```

`Base.Constraint` supplies `containerType: 'inline-size'`. The property-level conditions respond to that container instead of the viewport.

## Pages preserve the same order

```tsx
function ReportsPage() {
  return (
    <Base.Page>
      <Base.Constraint width="7xl">
        <Base.Layout gap="lg">
          <ReportsHeader />
          <ReportsFilters />
          <ReportsTable />
        </Base.Layout>
      </Base.Constraint>
    </Base.Page>
  )
}
```

## Viewport applications bound scrolling deliberately

```tsx
const dashboardStyles = stylex.create({
  frame: {
    // Layout
    height: '100%',
    gridTemplateColumns: 'auto minmax(0, 1fr)',
  },
  scrollPane: {
    // Layout
    minHeight: 0,
  },
})

function DashboardFrame() {
  return (
    <Base.Page variant="viewport">
      <Base.Layout gap="none" style={dashboardStyles.frame} variant="grid">
        <DashboardNavigation />

        <Base.Shell scrollY style={dashboardStyles.scrollPane}>
          <Base.Constraint width="7xl">
            <Base.Layout>
              <DashboardHeader />
              <DashboardContent />
            </Base.Layout>
          </Base.Constraint>
        </Base.Shell>
      </Base.Layout>
    </Base.Page>
  )
}
```

The viewport Page is already the horizontal bound for the application frame. The inner Shell is the grid cell and scroll container. Its Constraint and Layout keep natural height.

## One responsive panel survives every placement

The component carries its own Constraint, so the same StyleX conditions work in a page band, sidebar, or portalled modal:

```tsx
const placementStyles = stylex.create({
  panelGrid: {
    // Responsive
    gridTemplateColumns: {
      default: 'minmax(0, 1fr)',
      '@container (min-width: 28rem)': 'repeat(2, minmax(0, 1fr))',
      '@container (min-width: 56rem)': 'repeat(4, minmax(0, 1fr))',
    },
  },
  sidebar: {
    // Layout
    width: 320,
  },
})

function ResponsivePanel({ children }: { children: React.ReactNode }) {
  return (
    <Base.Section>
      <Base.Constraint width="5xl">
        <Base.Layout gap="md" style={placementStyles.panelGrid} variant="grid">
          {children}
        </Base.Layout>
      </Base.Constraint>
    </Base.Section>
  )
}

<ResponsivePanel>{cards}</ResponsivePanel>

<aside {...stylex.props(placementStyles.sidebar)}>
  <ResponsivePanel>{cards}</ResponsivePanel>
</aside>

<Dialog.Root open>
  <Dialog.Portal>
    <Dialog.Popup>
      <ResponsivePanel>{cards}</ResponsivePanel>
    </Dialog.Popup>
  </Dialog.Portal>
</Dialog.Root>
```

Do not add `sidebar`, `modal`, or `mobile` props. The available width selects the layout.

## Bars use the Row preset

```tsx
<Base.Layout.Row gap="sm" render={<nav />}>
  <Brand />
  <AccountMenu />
</Base.Layout.Row>
```

Use typed `align`, `justify`, and `gap` props for the preset axes. Use the StyleX `style` prop for component-specific declarations. Do not add `className` or React `style` to a Base element.
