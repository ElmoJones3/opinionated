# StyleX Base anatomy

Use this reference when a StyleX package is missing the shared Base layout family or has an incomplete equivalent. Inspect the repository first. Extend the existing family instead of adding another one.

The public API matches the Tailwind Base. StyleX changes how styles and variants are declared, not the Shell -> Constraint -> Layout contract.

## Required public family

| Export | Contract |
| --- | --- |
| `Base` | Shell shorthand and root compound export |
| `Base.Shell` | Full-width boundary; bounded by default, with an explicit flow profile |
| `Base.Page` | Flow Shell rendered as `main`; viewport mode selects the bounded profile |
| `Base.Section` | Flow Shell rendered as `section` |
| `Base.Constraint` | Horizontal bound and container-query root |
| `Base.Layout` | Row, column, or grid arrangement |
| `Base.Layout.Row` | Row preset with centered, space-between alignment |

StyleX does not use CVA. Declare semantic namespaces with `stylex.create`, select typed variants through lookup tables and resolvers, and call `stylex.props` once per rendered element. Omit native `className` and React `style` from the public props.

The implementation below assumes React 19. For React 18 or earlier, wrap each public component with `React.forwardRef` and pass the forwarded ref through `useRender`.

## Canonical implementation

```tsx
import { useRender } from '@base-ui/react/use-render'
import * as stylex from '@stylexjs/stylex'
import type { StyleXStyles } from '@stylexjs/stylex'

type Position = 'relative' | 'absolute' | 'fixed' | 'sticky' | 'static'
type ShellProfile = 'bounded' | 'flow'
type PageVariant = 'default' | 'viewport'
type ConstraintWidth =
  | 'none'
  | 'xs'
  | 'sm'
  | 'md'
  | 'lg'
  | 'xl'
  | '2xl'
  | '3xl'
  | '4xl'
  | '5xl'
  | '6xl'
  | '7xl'
type LayoutVariant = 'row' | 'column' | 'grid'
type LayoutGap = 'none' | 'xs' | 'sm' | 'md' | 'lg'
type LayoutAlign = 'start' | 'center' | 'end' | 'stretch'
type LayoutJustify = 'start' | 'center' | 'end' | 'between'

type BaseElementProps = Omit<
  useRender.ComponentProps<'div'>,
  'className' | 'style'
>

type ShellProps = BaseElementProps & {
  position?: Position
  profile?: ShellProfile
  scrollX?: boolean
  scrollY?: boolean
  style?: StyleXStyles
}

type PageProps = Omit<ShellProps, 'profile'> & {
  variant?: PageVariant
}

type ConstraintProps = BaseElementProps & {
  style?: StyleXStyles
  width?: ConstraintWidth
}

type LayoutProps = BaseElementProps & {
  align?: LayoutAlign
  gap?: LayoutGap
  justify?: LayoutJustify
  style?: StyleXStyles
  variant?: LayoutVariant
}

const styles = stylex.create({
  shell: {
    // Layout
    width: '100%',
  },
  shellBounded: {
    // Layout
    height: '100%',
    overflowX: 'hidden',
    overflowY: 'hidden',
  },
  shellFlow: {
    // Layout
    height: 'auto',
    overflowX: 'visible',
    overflowY: 'visible',
  },
  pageViewport: {
    // Layout
    width: '100vw',
    height: '100vh',
  },
  constraint: {
    // Layout
    width: '100%',
    marginInline: 'auto',
    paddingInline: 16,
    containerType: 'inline-size',
  },
  layout: {
    // Layout
    minWidth: 0,
    minHeight: 0,
  },
  scrollY: {
    overflowY: 'auto',
  },
  scrollX: {
    overflowX: 'auto',
  },
  hideScrollbar: {
    scrollbarWidth: 'none',
    '::-webkit-scrollbar': {
      display: 'none',
    },
  },
  positionRelative: { position: 'relative' },
  positionAbsolute: { position: 'absolute' },
  positionFixed: { position: 'fixed' },
  positionSticky: { position: 'sticky' },
  positionStatic: { position: 'static' },
  widthXs: { maxWidth: '20rem' },
  widthSm: { maxWidth: '24rem' },
  widthMd: { maxWidth: '28rem' },
  widthLg: { maxWidth: '32rem' },
  widthXl: { maxWidth: '36rem' },
  width2xl: { maxWidth: '42rem' },
  width3xl: { maxWidth: '48rem' },
  width4xl: { maxWidth: '56rem' },
  width5xl: { maxWidth: '64rem' },
  width6xl: { maxWidth: '72rem' },
  width7xl: { maxWidth: '80rem' },
  variantRow: { display: 'flex', flexDirection: 'row' },
  variantColumn: { display: 'flex', flexDirection: 'column' },
  variantGrid: { display: 'grid' },
  gapNone: { gap: 0 },
  gapXs: { gap: 4 },
  gapSm: { gap: 8 },
  gapMd: { gap: 16 },
  gapLg: { gap: 24 },
  alignStart: { alignItems: 'flex-start' },
  alignCenter: { alignItems: 'center' },
  alignEnd: { alignItems: 'flex-end' },
  alignStretch: { alignItems: 'stretch' },
  justifyStart: { justifyContent: 'flex-start' },
  justifyCenter: { justifyContent: 'center' },
  justifyEnd: { justifyContent: 'flex-end' },
  justifyBetween: { justifyContent: 'space-between' },
})

const positionStyles = {
  relative: styles.positionRelative,
  absolute: styles.positionAbsolute,
  fixed: styles.positionFixed,
  sticky: styles.positionSticky,
  static: styles.positionStatic,
} satisfies Record<Position, StyleXStyles>

const profileStyles = {
  bounded: styles.shellBounded,
  flow: styles.shellFlow,
} satisfies Record<ShellProfile, StyleXStyles>

const widthStyles = {
  xs: styles.widthXs,
  sm: styles.widthSm,
  md: styles.widthMd,
  lg: styles.widthLg,
  xl: styles.widthXl,
  '2xl': styles.width2xl,
  '3xl': styles.width3xl,
  '4xl': styles.width4xl,
  '5xl': styles.width5xl,
  '6xl': styles.width6xl,
  '7xl': styles.width7xl,
} satisfies Record<Exclude<ConstraintWidth, 'none'>, StyleXStyles>

const layoutVariantStyles = {
  row: styles.variantRow,
  column: styles.variantColumn,
  grid: styles.variantGrid,
} satisfies Record<LayoutVariant, StyleXStyles>

const gapStyles = {
  none: styles.gapNone,
  xs: styles.gapXs,
  sm: styles.gapSm,
  md: styles.gapMd,
  lg: styles.gapLg,
} satisfies Record<LayoutGap, StyleXStyles>

const alignStyles = {
  start: styles.alignStart,
  center: styles.alignCenter,
  end: styles.alignEnd,
  stretch: styles.alignStretch,
} satisfies Record<LayoutAlign, StyleXStyles>

const justifyStyles = {
  start: styles.justifyStart,
  center: styles.justifyCenter,
  end: styles.justifyEnd,
  between: styles.justifyBetween,
} satisfies Record<LayoutJustify, StyleXStyles>

function resolveShellStyles({
  position,
  profile,
  scrollX,
  scrollY,
}: Required<
  Pick<ShellProps, 'position' | 'profile' | 'scrollX' | 'scrollY'>
>): StyleXStyles[] {
  const resolved: StyleXStyles[] = [
    styles.shell,
    profileStyles[profile],
    positionStyles[position],
  ]

  if (scrollY) resolved.push(styles.scrollY)
  if (scrollX) resolved.push(styles.scrollX)
  if (scrollY || scrollX) resolved.push(styles.hideScrollbar)
  return resolved
}

function resolvePageStyles(variant: PageVariant): StyleXStyles[] {
  return variant === 'viewport' ? [styles.pageViewport] : []
}

function resolveConstraintStyles(width: ConstraintWidth): StyleXStyles[] {
  const resolved: StyleXStyles[] = [styles.constraint]

  if (width !== 'none') resolved.push(widthStyles[width])
  return resolved
}

function resolveLayoutStyles({
  align,
  gap,
  justify,
  variant,
}: Required<Pick<LayoutProps, 'gap' | 'variant'>> &
  Pick<LayoutProps, 'align' | 'justify'>): StyleXStyles[] {
  const resolved: StyleXStyles[] = [
    styles.layout,
    layoutVariantStyles[variant],
    gapStyles[gap],
  ]

  if (align) resolved.push(alignStyles[align])
  if (justify) resolved.push(justifyStyles[justify])
  return resolved
}

function Shell({
  render,
  position = 'relative',
  profile = 'bounded',
  scrollX = false,
  scrollY = false,
  style,
  ...props
}: ShellProps) {
  return useRender({
    defaultTagName: 'div',
    render,
    props: {
      ...props,
      ...stylex.props(
        ...resolveShellStyles({ position, profile, scrollX, scrollY }),
        style,
      ),
      'data-slot': 'base-shell',
    },
  })
}

const pageProfiles = {
  default: 'flow',
  viewport: 'bounded',
} as const

function Page({ render, style, variant = 'default', ...props }: PageProps) {
  return (
    <Shell
      {...props}
      profile={pageProfiles[variant]}
      render={render ?? <main />}
      style={[...resolvePageStyles(variant), style]}
    />
  )
}

function Section({ render, ...props }: Omit<ShellProps, 'profile'>) {
  return <Shell {...props} profile="flow" render={render ?? <section />} />
}

function Constraint({ render, style, width = 'none', ...props }: ConstraintProps) {
  return useRender({
    defaultTagName: 'div',
    render,
    props: {
      ...props,
      ...stylex.props(...resolveConstraintStyles(width), style),
      'data-slot': 'base-constraint',
    },
  })
}

function LayoutRoot({
  align,
  gap = 'md',
  justify,
  render,
  style,
  variant = 'column',
  ...props
}: LayoutProps) {
  return useRender({
    defaultTagName: 'div',
    render,
    props: {
      ...props,
      ...stylex.props(
        ...resolveLayoutStyles({ align, gap, justify, variant }),
        style,
      ),
      'data-slot': 'base-layout',
    },
  })
}

function LayoutRow({
  align = 'center',
  justify = 'between',
  ...props
}: Omit<LayoutProps, 'variant'>) {
  return <LayoutRoot {...props} align={align} justify={justify} variant="row" />
}

Shell.displayName = 'Base.Shell'
Page.displayName = 'Base.Page'
Section.displayName = 'Base.Section'
Constraint.displayName = 'Base.Constraint'
LayoutRoot.displayName = 'Base.Layout'
LayoutRow.displayName = 'Base.Layout.Row'

const Layout = Object.assign(LayoutRoot, {
  Row: LayoutRow,
})

function BaseRoot(props: ShellProps) {
  return <Shell {...props} />
}

BaseRoot.displayName = 'Base'

const Base = Object.assign(BaseRoot, {
  Shell,
  Page,
  Section,
  Constraint,
  Layout,
})

export { Base }
export type { ShellProps, PageProps, ConstraintProps, LayoutProps }
```

## Preserve the contract

- Keep `width: '100%'` on every Shell.
- Keep standalone Shell bounded by default. Keep Section and default Page in flow. Viewport Page selects bounded.
- Use longhand `overflowX` and `overflowY` so scroll variants replace one axis without disturbing the other.
- Keep `containerType: 'inline-size'` on every Constraint.
- Keep `minWidth: 0` and `minHeight: 0` on every Layout.
- Keep all prop-driven style selection in resolvers. Do not put conditional styles in `stylex.props` calls.
- Put component-specific container conditions in semantic StyleX namespaces.
- Preserve the existing polymorphic mechanism. This implementation uses Base UI `useRender`.
- Use `render` to change the semantic element only. Pass a bare element with no `className`, React `style`, or `data-slot`.
- Omit native `className` and React `style` from public props.
- Apply caller StyleX styles last only where the public contract permits overrides.
- Keep `data-slot` owned by Base.
- Add members to the existing compound. Do not publish peer layout imports.

Use `StyleXStylesWithout` when a package wants the type system to prevent callers from replacing another layer's axis. Shell may forbid horizontal constraints and child arrangement. Constraint may forbid vertical sizing and arrangement. Layout may forbid outer spacing, horizontal constraints, and overflow.

## Optional tests

Do not add tests merely because Base exists. If the project already tests Base, useful cases cover compound membership, resolver defaults, controlled `data-slot` values, polymorphic rendering, and scroll style output. Avoid snapshots that only freeze wrapper markup or generated class names.

## Official references

- [StyleX authoring guide](https://github.com/facebook/stylex/blob/main/packages/docs/static/llm/stylex-authoring.md)
- [StyleX variants](https://stylexjs.com/docs/learn/recipes/variants/)
- [Base UI useRender](https://base-ui.com/react/utils/use-render)
