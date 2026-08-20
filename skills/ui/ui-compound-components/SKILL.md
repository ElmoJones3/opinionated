---
name: ui-compound-components
description: Keep component families under one root export. Mandatory when consumers combine several parts to build one control.
user-invocable: false
---

# Export compound components

Treat one control as one public API, even when its implementation has several parts. Consumers import the root once and discover every part from it.

`ui-component-composition` decides whether the parts belong to one control. This skill owns the public export after that boundary is clear. Apply `ui-component-prop-contracts` to every part that forwards consumer props.

## Recognize a component family

A component family shares state, context, behavior, or structure that makes its parts meaningful together.

`Dialog.Trigger` opens `Dialog.Content`. `Tabs.Trigger` selects `Tabs.Content`. These parts build one control. Do not publish them as a list of peer imports.

```tsx
// Wrong. One control requires a pile of imports.
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './dialog'
```

Expose the family through its root:

```tsx
import { Dialog } from './dialog'

<Dialog>
  <Dialog.Trigger />
  <Dialog.Content>
    <Dialog.Header>
      <Dialog.Title>Account settings</Dialog.Title>
      <Dialog.Description>Update your profile.</Dialog.Description>
    </Dialog.Header>
    <Dialog.Footer />
  </Dialog.Content>
</Dialog>
```

## Build the public API

Define the root and its parts, then attach every public part with `Object.assign`:

```tsx
function Dialog({ ...props }: DialogPrimitive.Root.Props) {
  return <DialogPrimitive.Root {...props} data-slot="dialog" />
}

function DialogTrigger({ ...props }: DialogPrimitive.Trigger.Props) {
  return <DialogPrimitive.Trigger {...props} data-slot="dialog-trigger" />
}

function DialogContent({ ...props }: DialogPrimitive.Content.Props) {
  return <DialogPrimitive.Content {...props} data-slot="dialog-content" />
}

const DialogCompound = Object.assign(Dialog, {
  Trigger: DialogTrigger,
  Content: DialogContent,
  Header: DialogHeader,
  Footer: DialogFooter,
  Title: DialogTitle,
  Description: DialogDescription,
  displayName: 'Dialog',
})

export { DialogCompound as Dialog }
```

- Attach every public part in the family.
- Set `displayName` on the compound for React DevTools.
- Export the compound under the root name.
- Keep implementation files separate when useful. The public import stays unified.
- Keep single-part components such as `Button` and `Input` as plain exports.
- Do not attach independent components merely to shorten imports.

## Ship one public unit

`Object.assign` prevents reliable per-part tree shaking. Compound families ship as one public unit. Do not split their public imports to optimize individual parts.
