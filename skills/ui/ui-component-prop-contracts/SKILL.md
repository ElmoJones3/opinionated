---
name: ui-component-prop-contracts
description: Spread consumer props first, then apply component-owned behavior. Mandatory when a React component forwards props.
user-invocable: false
---

# Spread props first

A component owns the behavior and structural attributes it defines. Spread consumer props first. Apply merged and controlled props after.

## Prevent careless overrides

A trailing spread lets the caller replace the component's classes, structural markers, and controlled behavior:

```tsx
<InputPrimitive
  className={cn(componentClasses, className)}
  data-slot="input"
  {...props}
/>
```

Destructure anything the component merges or controls, then spread the rest first:

```tsx
function Input({ className, ...props }: React.ComponentProps<'input'>) {
  return (
    <InputPrimitive
      {...props}
      className={cn(componentClasses, className)}
      data-slot="input"
    />
  )
}
```

- Merge extensible values such as `className`.
- Set component-owned attributes after the spread.
- Leave ordinary consumer props in the spread.
- Every prop after the spread must be intentionally merged or owned.

## Compose shared handlers

Prop order can only choose one handler. When the component and consumer both need an event, use the component library's prop merger. Base UI provides `mergeProps` and `render`.

Do not replace the consumer's handler or recreate ordering and cancellation rules by hand.

## Check the result

- The consumer spread comes first.
- Merged and component-owned props come after.
- Shared handlers use the library's composition mechanism.
