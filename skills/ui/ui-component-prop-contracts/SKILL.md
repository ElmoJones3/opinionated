---
name: ui-component-prop-contracts
description: Protect owned props in React component wrappers while preserving consumer props. Use when a component spreads props and controls className, data-slot, handlers, or other attributes.
user-invocable: false
---

# Protect component prop contracts

Decide which props the component owns. Spread consumer props first, then set owned attributes so callers cannot replace them by accident.

Destructure every value the component merges or controls. Always destructure `className` when the component supplies classes of its own.

## Spread first

Do not let a trailing spread replace `data-slot`, merged classes, or another owned attribute:

```tsx
<InputPrimitive data-slot="input" className={cn(componentClasses, className)} {...props} />
```

Place the spread first and the contract after it:

```tsx
function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <InputPrimitive
      {...props}
      className={cn(componentClasses, className)}
      data-slot="input"
      type={type}
    />
  );
}
```

This keeps unowned props such as `id`, `aria-*`, and event handlers available to the caller. It merges caller classes through `cn` and keeps `data-slot` stable for selectors.

## Own props deliberately

Do not place an attribute after the spread unless the component truly owns it. A wrapper should preserve normal element behavior unless its API says otherwise.

Use these rules:

- Merge extensible values such as `className`.
- Set structural markers such as `data-slot` after the spread.
- Reapply a destructured prop when the wrapper needs it in an explicit position.
- Leave ordinary consumer props in the spread.

## Compose handlers

Prop order cannot compose two handlers. When both the wrapper and the caller must receive an event, use the component library's prop merger. Base UI provides `mergeProps` and `render` for this case.

Do not silently replace the caller's handler. Do not call both handlers by hand when the library already defines ordering and cancellation behavior.

## Check the result

- Spread remaining consumer props before owned attributes.
- Merge `className` instead of replacing it.
- Keep structural markers stable.
- Confirm every attribute after the spread belongs to the component contract.
- Use library-supported composition when internal and consumer handlers must both run.
