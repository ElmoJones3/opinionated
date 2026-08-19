---
name: ui-compound-components
description: Export multipart React component families through Object.assign. Use when creating or changing APIs with related parts such as Dialog.Trigger, Dialog.Content, or Tabs.List.
user-invocable: false
---

# Export compound components

Expose a multipart component and its related parts through one import. Consumers should discover the complete API from the root component in autocomplete.

## Build the public API

Define the root and each part, then attach the parts with `Object.assign`:

```tsx
function Dialog({ ...props }: DialogPrimitive.Root.Props) {
  return <DialogPrimitive.Root {...props} data-slot="dialog" />;
}

function DialogTrigger({ ...props }: DialogPrimitive.Trigger.Props) {
  return <DialogPrimitive.Trigger {...props} data-slot="dialog-trigger" />;
}

function DialogContent({ ...props }: DialogPrimitive.Content.Props) {
  return <DialogPrimitive.Content {...props} data-slot="dialog-content" />;
}

const DialogCompound = Object.assign(Dialog, {
  Trigger: DialogTrigger,
  Content: DialogContent,
  Header: DialogHeader,
  Footer: DialogFooter,
  Title: DialogTitle,
  Description: DialogDescription,
  displayName: 'Dialog',
});

export { DialogCompound as Dialog };
```

Consumers get one import and one discoverable namespace:

```tsx
<Dialog>
  <Dialog.Trigger />
  <Dialog.Content>
    <Dialog.Title>Account settings</Dialog.Title>
  </Dialog.Content>
</Dialog>
```

## Keep the boundary clear

- Attach every public part that belongs to the component family.
- Set `displayName` on the compound for React DevTools.
- Export the compound under the root name.
- Keep a single-part component such as `Button` or `Input` as a plain named export.
- Do not create a compound merely to collect unrelated components.

## Accept the tradeoff

`Object.assign` prevents bundlers from removing individual attached parts reliably. Accept that cost for component families where one import and autocomplete matter more than per-part tree shaking.

Do not apply this rule to single-part components.
