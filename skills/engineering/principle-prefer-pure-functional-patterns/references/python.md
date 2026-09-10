# Pure calculations in Python

Use ordinary functions for calculations. Follow the project's typed-exception
or result-value convention for expected refusals; do not install `returns`
or introduce modifier aliases just to follow this principle.

## Values and ownership

Tuples and frozen dataclasses can still reference mutable objects. Dictionary
copies and unpacking are shallow. Copy owned nested storage when observations
must remain independent, or use the nested domain's own copy contract.

Local list or dictionary mutation while building an unshared result is
compatible with pure calculation. Avoid rebuilding an entire collection on
each iteration in the name of immutability. Isolated authoring sessions may
also keep mutable candidates under the domain's Edit contract.

## Composition and effects

Sequential calls are sufficient for dependent calculations. Reuse an existing
pipeline library when it clarifies real composition; preserve first-failure
and skipped-work behavior. A lazy iterator or generator may read ambient state
when consumed, not when created. Passing it as an argument does not establish
determinism.

Keep clock reads, I/O, and publication in their declared owners. In-memory
pending facts do not require a new result carrier. Async execution and a
frozen return value prove neither purity nor atomic persistence.
