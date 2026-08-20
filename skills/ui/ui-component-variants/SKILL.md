---
name: ui-component-variants
description: Model conditional visual output as named variants. Mandatory when React props or derived state select classes or style objects.
user-invocable: false
---

# Model component visuals as variants

Turn prop-driven and derived-state styling into one named schema. Do not assemble conditional classes or style objects in JSX.

## Load the implementation reference

- Read [references/tailwind-cva.md](references/tailwind-cva.md) when the component uses Tailwind.
- Read [references/stylex.md](references/stylex.md) when the component uses StyleX.

Apply `ui-component-style-groups` to the declarations inside each variant. Apply `ui-component-prop-contracts` when exposing variant props or controlled semantic attributes.

Apply `ui-principle-state-management` when the component owns the state that selects a variant. This skill maps state to appearance; it does not own behavioral transitions.

## Model the state

- Name each independent visual axis, such as `size`, `intent`, `density`, `orientation`, or `disabled`.
- Collapse mutually exclusive states into one enum. Prefer `status: 'idle' | 'loading' | 'valid' | 'invalid'` over four booleans.
- Keep an independent binary state such as `disabled` as a boolean variant.
- Set a default for every optional variant. Leave a variant required only when no default is valid.
- Use a compound variant only when two axes produce a visual rule that neither axis owns alone.
- Keep caller override order explicit and consistent with the component contract.

Static selectors such as `disabled:`, `aria-invalid:`, and `data-[state=open]:` stay in base styling when the DOM or ARIA attribute is the sole source of truth. Do not mirror browser-owned state into JavaScript. When a prop or derived value selects a class or style object, model that selection as a variant.

## Resolve once

Pass named values to one variant recipe or resolver. JSX may merge the resolved result with the caller's approved override, but it must not contain conditional class or style fragments.

Preserve semantics separately from appearance. A visual `disabled` variant does not replace the native `disabled` attribute. Loading and validation states must still set the applicable ARIA or data attributes.

## Check the result

- No conditional class or StyleX arguments remain in JSX.
- Mutually exclusive states cannot be combined.
- Public variant props come from the declared schema.
- Optional variants have explicit defaults.
- The formatter, lint, and type checks pass.
