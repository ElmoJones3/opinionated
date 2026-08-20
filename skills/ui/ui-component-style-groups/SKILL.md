---
name: ui-component-style-groups
description: Format component-local styling as labeled concern groups. Mandatory when creating, changing, or reviewing component visuals.
user-invocable: false
---

# Group component styles by concern

Organize component-local visual decisions for the person reading the component. Preserve the styling system's syntax, composition rules, and override order.

## Load the relevant references

Inspect the component and its imports before editing:

- Read [references/tailwind.md](references/tailwind.md) for Tailwind utilities in `className`, `cn`, `clsx`, or `cva`.
- Read [references/stylex.md](references/stylex.md) for `@stylexjs/stylex`, `stylex.create`, or `stylex.props`.
- Read [references/motion.md](references/motion.md) for `motion/react`, Motion components, variants, Motion values, or gesture animation props.

Motion is additive. When a component uses Motion with Tailwind or StyleX, read both relevant references.

When component props or derived state select visual output, also load `ui-component-variants`. That skill owns selection. This skill still owns the declarations inside each variant.

For inline styles or another CSS-in-JS library, apply the invariant below using the repository's existing syntax. Do not introduce a new styling system.

## Apply the invariant

- Group visual decisions by concern in the styling system's native structure.
- Label groups with comments, semantic object names, or named animation states.
- Keep short, single-concern values inline.
- Preserve merge order, cascade behavior, conditions, and caller override contracts.
- Keep related state and responsive rules beside the property or concern they modify when the styling system requires it.
- Do not add empty labels or split code that becomes harder to scan.

Use these concern names when they fit: `Layout`, `Typography`, `Color`, `State`, `Responsive`, `Dark`, `Animation`, `Transform`, `Appearance`, and `Timing`. Omit irrelevant groups and use a more precise label when the code calls for one.

Run the repository formatter and the relevant static checks after editing.
