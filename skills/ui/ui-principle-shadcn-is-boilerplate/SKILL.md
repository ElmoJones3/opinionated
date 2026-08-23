---
name: ui-principle-shadcn-is-boilerplate
description: Normalize shadcn registry output to the repository's Tailwind and component-export rules. Mandatory whenever the shadcn skill or CLI adds, updates, or reviews a component or block.
---

# Treat shadcn output as boilerplate

The shadcn CLI copies source into the project. That source is the starting point,
not the finished component. Do not report an add or update complete when the CLI
command succeeds.

Use the `shadcn` skill to select registry items, inspect project configuration,
preserve primitive compatibility, and install or update source. Then make the
copied source belong to the repository.

## Finish the installed files

After every shadcn add or update:

1. Read every added or changed component file.
2. Apply `ui-component-style-groups` and its Tailwind reference to all
   component-owned Tailwind and CVA declarations.
3. Apply `ui-component-variants` when props or derived state select visual output.
4. Apply `ui-compound-components` when the installed files form one control. The
   repository's root compound export replaces shadcn's generated peer exports.
   Keep single-part controls as plain exports.
5. Update affected imports and usages, then run the formatter, linter, and type
   checks.

Keep shadcn's semantic tokens, accessibility requirements, primitive APIs, and
built-in variants. Clean the installed source itself. Do not hide the cleanup in
consumer `className` overrides.

## Preserve behavior

This post-install pass owns styles and exports. The presence of registry-managed
state does not mandate a state rewrite. Preserve state, context, effects, event
handlers, and controlled or uncontrolled behavior unless the user requested a
behavior change or a concrete defect requires one.
