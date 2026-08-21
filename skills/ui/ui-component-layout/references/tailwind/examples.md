# Tailwind Base examples

Use these examples after locating the project's shared Base family. Preserve its existing variant names when they differ from the canonical anatomy.

## Single controls opt out

An atom does not arrange other controls. Keep it outside the layout grammar:

```tsx
function Input(props: React.ComponentProps<'input'>) {
  return <input {...props} />
}
```

## Small compositions use Base.Layout

A toolbar owns arrangement but not a page band or horizontal constraint:

```tsx
function Toolbar({ className, ...props }: React.ComponentProps<'header'>) {
  return (
    <Base.Layout.Row
      {...props}
      className={className}
      data-component="toolbar"
      gap="sm"
      render={<header />}
    />
  )
}
```

Do not replace `Base.Layout.Row` with a local `flex` wrapper.

## Sections use the full grammar

```tsx
function MetricsSection({
  className,
  children,
  ...props
}: React.ComponentProps<'section'>) {
  return (
    <Base.Section {...props} className={cn('py-12', className)} data-component="metrics">
      <Base.Constraint width="5xl">
        <Base.Layout
          className="@md:grid-cols-2 @4xl:grid-cols-4"
          gap="md"
          variant="grid"
        >
          {children}
        </Base.Layout>
      </Base.Constraint>
    </Base.Section>
  )
}
```

The container variants respond to `Base.Constraint`. The component does not need a sidebar prop, modal prop, or duplicate mobile implementation.

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

`Base.Page` supplies the semantic `main` element. Constraint still owns horizontal width. Layout still owns arrangement.

## Viewport applications bound scrolling deliberately

```tsx
function DashboardFrame() {
  return (
    <Base.Page variant="viewport">
      <Base.Layout
        className="h-full grid-cols-[auto_minmax(0,1fr)]"
        gap="none"
        variant="grid"
      >
        <DashboardNavigation />

        <Base.Shell className="min-h-0" scrollY>
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

The viewport Page is already the horizontal bound for the application frame, so the outer Layout is the documented exception to the full trio. The inner Shell is the grid cell and scroll container, so it carries `min-h-0`. Its Constraint and Layout keep natural height.

## One responsive panel survives every placement

The component carries its own Constraint, so the same container variants work in a page band, sidebar, or portalled modal:

```tsx
function ResponsivePanel({ children }: { children: React.ReactNode }) {
  return (
    <Base.Section>
      <Base.Constraint width="5xl">
        <Base.Layout
          className="@md:grid-cols-2 @4xl:grid-cols-4"
          gap="md"
          variant="grid"
        >
          {children}
        </Base.Layout>
      </Base.Constraint>
    </Base.Section>
  )
}

<ResponsivePanel>{cards}</ResponsivePanel>

<aside className="w-80">
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

`Base.Layout.Row` fixes `variant="row"` and defaults to centered, space-between alignment. Change `align`, `justify`, or `gap` through its typed props instead of conditional classes.
