---
name: principle-test-fixtures
description: Build test data that production can actually produce. Mandatory when creating or changing test fixtures, factories, builders, seeds, hydrated objects, or shared example data.
---

# Keep fixtures honest

A normal fixture must establish its discriminating state through the constructor, seeder, converter, or transition production uses. A loader may retrieve that state only after the fixture has established it through the production path. A test built from an impossible state proves a different system.

## Build the case

- Start from a valid, recognizable production instance.
- Change one relevant condition for a negative case.
- Make every earlier guard pass so the fixture reaches the rule named by the test.
- Use synthetic values and identities. Never copy operational secrets or customer data.
- Put shared production-faithful construction in test support. Do not hide impossible shortcuts in a builder.

Do not hand-set the discriminating field that makes the behavior pass. If a fixture called `system`, `verified`, `approved`, or `admin` needs manual state production never creates, stop. Build it through the real path. If the test becomes red, preserve the red and report the defect.

Direct state literals, loaders, and hydration shortcuts are reserved for a named persistence-boundary, hydration, deserialization, corruption, or other untrusted-input claim. Label that path explicitly. They do not prove the transition that normally earns the state and do not justify impossible fixtures for later behavior.

Read [production reachability](references/production-reachability.md) when a fixture has more than one construction path or a failing test tempts direct assignment.
