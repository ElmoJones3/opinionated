# Tailwind Base anatomy

Use this reference when a shared Base layout component is missing, incomplete, or unfamiliar. Inspect the repository first. Extend an existing equivalent instead of adding a second layout family.

The canonical implementation uses Tailwind, CVA, Base UI's `useRender`, and the repository `cn` helper. Adapt import paths to the package. Keep the public family, responsibilities, defaults, and controlled attributes intact.

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

Every Base preset and prop-driven Tailwind branch belongs in a CVA recipe. Public variant types come from `VariantProps`. Consumer props enter first; the recipe, caller `className`, and `data-slot` are applied afterward.

The implementation below assumes React 19. For React 18 or earlier, wrap each public component with `React.forwardRef` and pass the forwarded ref through `useRender`.

## Canonical implementation

```tsx
import { useRender } from '@base-ui/react/use-render'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@jadeiq/iris/lib/utils'

const shellVariants = cva(
  [
    // Layout
    'w-full',
  ],
  {
    variants: {
      position: {
        relative: 'relative',
        absolute: 'absolute',
        fixed: 'fixed',
        sticky: 'sticky',
        static: 'static',
      },
      profile: {
        bounded: 'h-full overflow-hidden',
        flow: 'h-auto overflow-visible',
      },
      scrollY: {
        true: 'scrollbar-none overflow-y-auto',
      },
      scrollX: {
        true: 'scrollbar-none overflow-x-auto',
      },
    },
    defaultVariants: {
      position: 'relative',
      profile: 'bounded',
    },
  },
)

const pageVariants = cva('', {
  variants: {
    variant: {
      default: '',
      viewport: 'h-screen w-screen',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
})

const constraintVariants = cva(
  [
    // Layout
    'mx-auto w-full px-4',
    '@container',
  ],
  {
    variants: {
      width: {
        none: '',
        xs: 'max-w-xs',
        sm: 'max-w-sm',
        md: 'max-w-md',
        lg: 'max-w-lg',
        xl: 'max-w-xl',
        '2xl': 'max-w-2xl',
        '3xl': 'max-w-3xl',
        '4xl': 'max-w-4xl',
        '5xl': 'max-w-5xl',
        '6xl': 'max-w-6xl',
        '7xl': 'max-w-7xl',
      },
    },
    defaultVariants: {
      width: 'none',
    },
  },
)

const layoutVariants = cva(
  [
    // Layout
    'min-h-0',
    'min-w-0',
  ],
  {
    variants: {
      variant: {
        row: 'flex flex-row',
        column: 'flex flex-col',
        grid: 'grid',
      },
      gap: {
        none: 'gap-0',
        xs: 'gap-1',
        sm: 'gap-2',
        md: 'gap-4',
        lg: 'gap-6',
      },
      align: {
        start: 'items-start',
        center: 'items-center',
        end: 'items-end',
        stretch: 'items-stretch',
      },
      justify: {
        start: 'justify-start',
        center: 'justify-center',
        end: 'justify-end',
        between: 'justify-between',
      },
    },
    defaultVariants: {
      variant: 'column',
      gap: 'md',
    },
  },
)

type ShellProps = useRender.ComponentProps<'div'> & VariantProps<typeof shellVariants>
type PageProps = Omit<ShellProps, 'profile'> & VariantProps<typeof pageVariants>
type ConstraintProps = useRender.ComponentProps<'div'> &
  VariantProps<typeof constraintVariants>
type LayoutProps = useRender.ComponentProps<'div'> & VariantProps<typeof layoutVariants>

function Shell({
  render,
  className,
  position = 'relative',
  profile = 'bounded',
  scrollY = false,
  scrollX = false,
  ...props
}: ShellProps) {
  return useRender({
    defaultTagName: 'div',
    render,
    props: {
      ...props,
      className: cn(
        shellVariants({ position, profile, scrollY, scrollX }),
        className,
      ),
      'data-slot': 'base-shell',
    },
  })
}

const pageProfiles = {
  default: 'flow',
  viewport: 'bounded',
} as const

function Page({ render, className, variant = 'default', ...props }: PageProps) {
  return (
    <Shell
      {...props}
      className={cn(pageVariants({ variant }), className)}
      profile={pageProfiles[variant ?? 'default']}
      render={render ?? <main />}
    />
  )
}

function Section({ render, ...props }: Omit<ShellProps, 'profile'>) {
  return <Shell {...props} profile="flow" render={render ?? <section />} />
}

function Constraint({ render, className, width = 'none', ...props }: ConstraintProps) {
  return useRender({
    defaultTagName: 'div',
    render,
    props: {
      ...props,
      className: cn(constraintVariants({ width }), className),
      'data-slot': 'base-constraint',
    },
  })
}

function LayoutRoot({
  render,
  className,
  variant = 'column',
  gap = 'md',
  align,
  justify,
  ...props
}: LayoutProps) {
  return useRender({
    defaultTagName: 'div',
    render,
    props: {
      ...props,
      className: cn(layoutVariants({ variant, gap, align, justify }), className),
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

export { Base, shellVariants, pageVariants, constraintVariants, layoutVariants }
export type { ShellProps, PageProps, ConstraintProps, LayoutProps }
```

## Preserve the contract

- Keep `w-full` on every Shell.
- Keep standalone Shell bounded by default. Keep Section and default Page in flow. Viewport Page selects bounded.
- Keep `@container` on every Constraint.
- Keep `min-h-0 min-w-0` on every Layout.
- Add component-specific columns, tracks, and container variants through `className`.
- Add reusable presets through CVA instead of conditional class assembly.
- Preserve the existing polymorphic mechanism. This implementation uses Base UI `useRender`.
- Treat `render` as a semantic tag replacement. Pass a bare element with no `className`, `style`, or `data-slot`.
- Keep caller `className` last in `cn` when the project permits caller style overrides.
- Keep `data-slot` owned by Base.
- Add members to the existing compound. Do not publish peer layout imports.

## Optional tests

Do not add tests merely because Base exists. If the project already tests Base, useful cases cover compound membership, CVA defaults, controlled `data-slot` values, polymorphic rendering, and scroll variant output. Avoid snapshots that only freeze wrapper markup or class strings.

## Official references

- [CVA variants](https://cva.style/getting-started/variants/)
- [Tailwind container queries](https://tailwindcss.com/docs/responsive-design#container-queries)
- [Base UI useRender](https://base-ui.com/react/utils/use-render)
