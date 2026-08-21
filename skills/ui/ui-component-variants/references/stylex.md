# StyleX variant reference

StyleX does not use CVA. Model the same named state schema with semantic style namespaces, lookup tables for enum variants, and one resolver outside JSX.

## Resolve named styles

```tsx
import * as stylex from '@stylexjs/stylex'
import type { StyleXStyles } from '@stylexjs/stylex'

type Size = 'sm' | 'md' | 'lg'
type Status = 'idle' | 'loading' | 'valid' | 'invalid'

type ButtonStyleOptions = {
  disabled: boolean
  size: Size
  status: Status
}

type ButtonProps = Omit<
  React.ComponentProps<'button'>,
  'className' | 'style'
> & {
  size?: Size
  status?: Status
  style?: StyleXStyles
}

const styles = stylex.create({
  root: {
    // Layout
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    // Typography
    fontWeight: 600,
    // Color
    color: tokens.buttonText,
    backgroundColor: tokens.buttonBackground,
  },
  sizeSm: { minHeight: 32, paddingInline: 12 },
  sizeMd: { minHeight: 36, paddingInline: 16 },
  sizeLg: { minHeight: 40, paddingInline: 24 },
  statusLoading: { cursor: 'wait' },
  statusValid: { borderColor: tokens.success },
  statusInvalid: { borderColor: tokens.danger },
  disabled: { opacity: 0.5, pointerEvents: 'none' },
})

const sizeStyles = {
  sm: styles.sizeSm,
  md: styles.sizeMd,
  lg: styles.sizeLg,
} satisfies Record<Size, StyleXStyles>

const statusStyles = {
  loading: styles.statusLoading,
  valid: styles.statusValid,
  invalid: styles.statusInvalid,
} satisfies Record<Exclude<Status, 'idle'>, StyleXStyles>

function resolveButtonStyles(options: ButtonStyleOptions): StyleXStyles[] {
  const resolved: StyleXStyles[] = [styles.root, sizeStyles[options.size]]

  if (options.status !== 'idle') resolved.push(statusStyles[options.status])
  if (options.disabled) resolved.push(styles.disabled)
  return resolved
}
```

Call the resolver once. Keep state selection out of `stylex.props`:

```tsx
function Button({ disabled = false, size = 'md', status = 'idle', style, ...props }: ButtonProps) {
  const isLoading = status === 'loading'
  const isDisabled = disabled || isLoading

  return (
    <button
      {...props}
      {...stylex.props(
        ...resolveButtonStyles({ disabled: isDisabled, size, status }),
        style,
      )}
      aria-busy={isLoading || undefined}
      aria-invalid={status === 'invalid' || undefined}
      disabled={isDisabled}
    />
  )
}
```

Keep the array order deliberate because `stylex.props` resolves conflicts with the last style. Place caller `style` last only when the component contract permits it.

Do not replace direct pseudo-class, media, or container conditions with a resolver. StyleX requires those conditions inside the property they change. Use the resolver only when component props or derived state select a named style.

## Official reference

- [StyleX authoring guide](https://github.com/facebook/stylex/blob/main/packages/docs/static/llm/stylex-authoring.md)
