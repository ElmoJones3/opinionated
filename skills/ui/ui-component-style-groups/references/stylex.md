# StyleX reference

Use this reference when a component defines styles with `stylex.create` and applies them with `stylex.props`.

When props or derived state select style objects, apply `ui-component-variants` and resolve them outside JSX. This reference still governs the declarations inside each named style.

## Group semantic style objects

Name each StyleX namespace for the element, role, or variant it styles. Within a long namespace, label related property concerns:

```tsx
const styles = stylex.create({
  root: {
    // Layout
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: {
      default: 8,
      '@media (min-width: 768px)': 16,
    },
    // Typography
    fontSize: 14,
    fontWeight: 600,
    // Color
    color: tokens.text,
    backgroundColor: {
      default: tokens.surface,
      ':hover': tokens.surfaceHover,
    },
  },
  disabled: {
    opacity: 0.5,
  },
})
```

Do not create separate `layout`, `typography`, and `color` namespaces merely to imitate a Tailwind array. StyleX namespaces are composed style rules, so name them for semantic elements and variants.

Keep pseudo-class, media, and container conditions nested under the property they change. Include the required `default` branch, using `null` when the property has no default value. This preserves StyleX's property-level condition model.

## Preserve merge order

`stylex.props` merges styles in argument order and the last style wins:

```tsx
<div {...stylex.props(styles.root, styles.emphasized, style)} />
```

Place a caller-provided style last only when the public API permits that override. Use `StyleXStylesWithout` when callers may style the component but must not replace structural properties.

Do not add `className` or a normal React `style` prop to the same element as a `stylex.props()` spread. If Motion needs a `style` prop for Motion values, animate a wrapper or follow an established project adapter. Do not invent a composition mechanism.

## Official references

- [StyleX authoring guide](https://github.com/facebook/stylex/blob/main/packages/docs/static/llm/stylex-authoring.md)
- [StyleX documentation](https://stylexjs.com/docs/)
