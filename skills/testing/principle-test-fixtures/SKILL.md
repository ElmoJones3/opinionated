---
name: principle-test-fixtures
description: Build test data that production can actually produce. Mandatory when creating or changing test fixtures, factories, builders, seeds, hydrated objects, or shared example data.
---

# Keep fixtures honest

Apply the contract and value boundary in `principle-testing-guidelines` before building test setup. A normal fixture must represent valid state production can reach. When construction or a transition is part of the required outcome, exercise that production path. For later behavior, reuse a valid constructor, builder, or restored snapshot whose reachability is established by the production contract or existing evidence. Do not replay unrelated lifecycle steps in every test.

## Build the case

- Start from a valid, recognizable production instance.
- Change one relevant condition for a negative case.
- Make every earlier guard pass so the fixture reaches the rule named by the test.
- Use synthetic values and identities. Never copy operational secrets or customer data.
- Reuse production-faithful test support. Do not hide impossible shortcuts in a builder or build a general fixture framework for one case.

Do not hand-set a discriminating field to conceal the behavior's defect. A fixture called `system`, `verified`, `approved`, or `admin` must preserve the state production actually creates. If reachability is in doubt, use the real path to settle that doubt. Keep an honest reproduction red and report the defect instead of repairing the fixture around it.

Direct values or restored snapshots can establish a known valid starting state when its creation is outside the claim and the model permits that construction. They do not prove the transition that earns it. Do not bypass encapsulation or invariants to assemble them. Impossible states belong only in named corruption, deserialization, or other untrusted-input cases.

Read [production reachability](references/production-reachability.md) when a fixture has more than one construction path or a failing test tempts direct assignment.
