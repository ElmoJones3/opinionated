# Engineering skills

These skills make code state its contracts plainly. Business rules belong to the object whose state changes. Calculations should take explicit inputs and return values. Project terms need one meaning, and accepted decisions need a record.

## The skills

| Skill | Trigger | What it owns |
| --- | --- | --- |
| [`domain-modeling`](domain-modeling/SKILL.md) | Mandatory for domain work | Puts behavior, valid state, transitions, consequences, and validation on the responsible business object. |
| [`principle-prefer-pure-functional-patterns`](principle-prefer-pure-functional-patterns/SKILL.md) | Mandatory for transformations | Prefers explicit, testable value transformations while keeping necessary effects at named boundaries. |
| [`semantic-mapping`](semantic-mapping/SKILL.md) | Mandatory when terminology settles | Keeps canonical terms and ownership boundaries in `SEMANTICS.md` and `SEMANTIC-MAP.md`. |
| [`semantic-snapshot`](semantic-snapshot/SKILL.md) | Explicit only | Reconciles accepted terminology and decisions from the conversation with semantic files and ADRs. |

## Where the boundaries sit

`domain-modeling` owns behavior. It distinguishes commands from consequences, rejects illegal transitions through the public contract, and keeps callers from duplicating business rules. Its Go, Python, and TypeScript references express the same contract in each language.

`principle-prefer-pure-functional-patterns` owns calculations, validators, reducers, pipelines, and state changes. It does not ban state. It keeps time, randomness, configuration, I/O, and framework lifecycles visible instead of letting them leak into otherwise testable transformations.

`semantic-mapping` owns what project terms mean and which boundary owns them. It does not store behavior or decision history. `semantic-snapshot` is the explicit recording pass that also writes missing ADRs for decisions the user actually accepted. Recommendations and guesses do not qualify.

The split is strict. Semantic files define language. Domain objects enforce behavior. ADRs explain accepted decisions. Mixing those jobs produces documentation that cannot be trusted.
