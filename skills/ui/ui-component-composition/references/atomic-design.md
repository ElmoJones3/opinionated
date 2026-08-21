# Atomic Design as a boundary model

Brad Frost presents Atomic Design as five stages that work together, not a linear process for manufacturing pages. Use the stages to reason about the relationship between a part and the interface around it.

## The five stages

| Stage | Boundary question | Typical examples |
| --- | --- | --- |
| Atom | Does breaking this down further destroy its useful interface function? | Button, Input, Icon, Label |
| Molecule | Do a few elements work together as one simple responsibility? | Field, SearchForm, CardHeader |
| Organism | Does this form a distinct, reusable interface section? | Header, ProductGrid, CheckoutSummary |
| Template | Does this define page-level slots and content structure? | DashboardTemplate, ArticleTemplate |
| Page | Does this bind real content and expose meaningful variations? | A customer dashboard, an empty search page |

These names describe relative responsibility. A component can be a molecule in one system and an organism in another.

## House interpretation

- Use the taxonomy during decomposition and review. Do not require matching `atoms/`, `molecules/`, or `organisms/` folders.
- Move between stages in either direction. Build upward, decompose an existing page, or refine both at once.
- Keep a component boundary when it captures one recognizable job, not merely because a DOM subtree exists.
- Use pages with real data to test truncation, missing content, permissions, loading, empty, and error states.
- Do not infer layout wrappers from an Atomic Design label. `ui-component-layout` chooses Shell, Constraint, and Layout by owned responsibility.

## Sources

- [Atomic Design Methodology](https://atomicdesign.bradfrost.com/chapter-2/)
- [Tools of the Trade](https://atomicdesign.bradfrost.com/chapter-3/)
