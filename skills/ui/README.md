# UI skills

This directory is the house React component model. It is intentionally prescriptive. The point is to stop agents from inventing a new component grammar every time they touch a screen.

Seven authoring skills activate when their descriptions match the work. One explicit skill runs the full audit when asked.

## The skills

| Skill | Trigger | What it owns |
| --- | --- | --- |
| [`ui-component-composition`](ui-component-composition/SKILL.md) | Automatic | Decides whether interface markup belongs in one component or several. |
| [`ui-component-layout`](ui-component-layout/SKILL.md) | Automatic | Requires the shared Shell -> Constraint -> Layout grammar and container-driven reflow. |
| [`ui-component-prop-contracts`](ui-component-prop-contracts/SKILL.md) | Automatic | Spreads consumer props first, then applies behavior and attributes owned by the component. |
| [`ui-component-style-groups`](ui-component-style-groups/SKILL.md) | Automatic | Groups component-local Tailwind, StyleX, and Motion decisions by named visual concern. |
| [`ui-component-variants`](ui-component-variants/SKILL.md) | Automatic | Moves prop-selected and state-selected visuals into typed CVA recipes or StyleX resolvers. |
| [`ui-compound-components`](ui-compound-components/SKILL.md) | Automatic | Exports interdependent component parts through one discoverable root API. |
| [`ui-principle-state-management`](ui-principle-state-management/SKILL.md) | Automatic | Chooses the rightful state owner, then uses RxJS, an Immer reducer, or a named Immer producer with direct tests. |
| [`ui-component-review`](ui-component-review/SKILL.md) | Explicit only | Loads every rule above and reports concrete violations without editing unless fixes were also requested. |

## Where the boundaries sit

`ui-component-composition` decides what a component is. `ui-compound-components` decides how a family of interdependent parts is exported. They answer different questions.

`ui-component-layout` owns spatial structure. `ui-component-style-groups` owns how visual declarations are organized. `ui-component-variants` owns how props and derived state select those declarations. Layout does not replace styling, and style grouping does not hide conditional selection in JSX.

`ui-component-prop-contracts` applies across the set. A wrapper can expose caller props without surrendering the behavior, structural attributes, or merged styles that define the component.

`ui-principle-state-management` owns behavioral state and transition tests. `ui-component-variants` consumes that state when appearance changes. A visual variant never becomes a second copy of the behavioral state.

The explicit reviewer coordinates the rules. It decides which ones apply before reporting anything, so an atom does not receive layout or compound-component ceremony it does not need.

## Why these rules exist

Most UI drift begins with a locally reasonable shortcut: another wrapper, a trailing prop spread, a conditional class in JSX, or a second import path for one component family. Each shortcut is small. Together they make the component harder to inspect and easier to break.

The shared `Base` family gives pages and layout-bearing components the same owners for width, vertical rhythm, arrangement, and scroll. Container queries let the component respond to its slot instead of guessing the viewport or asking for `sidebar` and `modal` props.

Named variants make visual state finite and typed. Labeled style groups keep long declarations reviewable without changing the styling system's merge rules. Compound exports give up reliable per-part tree shaking in exchange for one import and autocomplete that reveals the whole control.

State follows the same ownership rule. Query, router, and form libraries keep the state they already manage. Application-owned behavior uses RxJS for streams, an Immer reducer for finite transitions, and plain Immer for the small remainder. Direct state tests prove behavior without pretending a synthetic click is the behavior.

These are informed tradeoffs, not claims that React has one correct style. Tailwind, StyleX, and Motion each keep their native mechanics in framework-specific references. The opinions stay consistent while the implementation follows the tool actually in use.
