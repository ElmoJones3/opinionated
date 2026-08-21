---
name: ui-component-review
description: Review React UI components against the installed UI authoring rules and report concrete violations. Use only when the user explicitly requests a UI component audit.
disable-model-invocation: true
user-invocable: true
---

# Review a UI component

Audit the requested component without editing it unless the user also asks for fixes.

## Load the rules

Load these skills before reviewing:

- `ui-component-composition`
- `ui-component-style-groups`
- `ui-component-variants`
- `ui-component-prop-contracts`
- `ui-compound-components`
- `ui-component-layout`
- `ui-principle-state-management`

Report any missing skill. Do not recreate a missing rule from memory.

## Inspect the component

1. Resolve the requested file or component. If the user did not name one, use the component under discussion or the changed React component files.
2. Read related parts, wrappers, utilities, and package scripts needed to understand the public API and available checks.
3. Decide which rules apply before reporting violations. A single control does not need a compound export or layout layers.
4. Run existing formatter, lint, and type checks when they fit the requested scope and the repository already has its dependencies.
5. Report concrete violations. Do not pad the review with praise, summaries, or rules the component already follows.

## Report findings

Order findings by the cost of leaving them unfixed. For each finding, include:

- The file and line.
- The skill and rule it violates.
- The exact code or behavior that is wrong.
- The smallest correction that satisfies the rule.

Use this shape:

```markdown
### path/to/component.tsx:42

Rule: `ui-component-prop-contracts`, spread consumer props first

`{...props}` comes after `data-slot`, so a caller can replace the structural selector.
Move the spread before `data-slot` and the merged `className`.
```

If no violations remain, name the rules that applied and state that the component passed them. Report commands and results separately from code findings.
