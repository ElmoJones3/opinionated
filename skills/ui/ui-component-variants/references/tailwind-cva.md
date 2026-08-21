# Tailwind and CVA reference

Use CVA when a Tailwind component accepts a visual preset or when props or derived state select classes. One preset axis or one stateful branch is enough to require it.

## Define one recipe

Keep base classes and every long variant value grouped under `ui-component-style-groups`:

```tsx
import { cva, type VariantProps } from 'class-variance-authority'

const buttonVariants = cva(
  [
    // Layout
    'inline-flex items-center justify-center rounded-md border px-4',
    // Typography
    'font-medium',
    // Color
    'border-transparent bg-primary text-primary-foreground',
    // State
    'transition-colors focus-visible:outline-none',
  ],
  {
    variants: {
      size: {
        sm: 'h-8 px-3 text-xs',
        md: 'h-9 px-4 text-sm',
        lg: 'h-10 px-6 text-base',
      },
      status: {
        idle: null,
        loading: 'cursor-wait',
        valid: 'border-emerald-500 ring-1 ring-emerald-500/20',
        invalid: 'border-destructive ring-1 ring-destructive/20',
      },
      disabled: {
        true: 'pointer-events-none opacity-50',
        false: null,
      },
    },
    defaultVariants: {
      size: 'md',
      status: 'idle',
      disabled: false,
    },
  },
)

type ButtonVariantProps = Omit<VariantProps<typeof buttonVariants>, 'disabled'>
type ButtonProps = React.ComponentProps<'button'> & ButtonVariantProps

function Button({ className, disabled = false, size, status, ...props }: ButtonProps) {
  const isLoading = status === 'loading'
  const isDisabled = disabled || isLoading

  return (
    <button
      {...props}
      aria-busy={isLoading || undefined}
      aria-invalid={status === 'invalid' || undefined}
      className={cn(buttonVariants({ disabled: isDisabled, size, status }), className)}
      disabled={isDisabled}
    />
  )
}
```

The `cn` call may merge the completed recipe with caller `className`. Do not put conditions, preset lookups, or state-specific class strings in that call.

## Keep the schema honest

- Use `VariantProps<typeof recipe>` instead of rewriting its union types.
- Omit a native prop such as `disabled` from `VariantProps` when the element already owns the same prop.
- Use TypeScript utility types to require a variant. CVA does not make variants required itself.
- Put shared classes in the base. Put one-axis changes in `variants` and true interactions in `compoundVariants`.
- Use `null` when a variant value intentionally adds no classes.
- Set every optional value in `defaultVariants`.
- Preserve the order passed to CVA and the repository class merger. CVA does not resolve conflicting Tailwind utilities by itself. Confirm the final merger uses `tailwind-merge` when recipe layers contain conflicts.

Configure Tailwind tooling to recognize CVA calls when the repository supports it. The Tailwind language server uses `classFunctions`, while `prettier-plugin-tailwindcss` uses `tailwindFunctions` for custom function strings.

## Official references

- [CVA variants and compound variants](https://cva.style/getting-started/variants/)
- [CVA TypeScript and VariantProps](https://cva.style/getting-started/typescript/)
- [CVA API reference](https://cva.style/api-reference/)
- [CVA Tailwind setup and conflict handling](https://cva.style/getting-started/installation/)
