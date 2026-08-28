---
name: distributed-systems-audit
description: Audit a repository or named system against every installed distributed-systems principle, write a Markdown defect report, and assign a traceable overall grade. Use only when explicitly requested.
disable-model-invocation: true
user-invocable: true
---

# Audit distributed-system guarantees

Audit the requested scope without changing the reviewed implementation unless the user also asks for fixes. Creating or updating the audit report is part of the audit.

## Set the scope and report path

- Use the repository, subsystem, service, or paths named by the user. Otherwise audit the current repository.
- Write to the path named by the user. Otherwise write `distributed-systems-audit.md` at the audited repository root.
- Exclude the report itself from audit evidence and findings.
- Record the audited paths and Git revision. If the worktree is dirty, say so. For a non-Git scope, record the inspected paths and audit date.
- Read the architecture, source, schemas, migrations, deployment and runtime configuration, tests, runbooks, and operational documentation needed to trace the guarantees in scope.
- Treat unavailable services, configuration, or evidence as an explicit limitation. Do not infer a guarantee from a framework, provider, or product name.

## Load every systems rule

Load `distributed-systems-guidelines` first, then load every systems principle named in its `Route the work` section. The current set is:

- `principle-model-durable-work`
- `principle-handle-message-uncertainty`
- `principle-bound-retries`
- `principle-enforce-idempotent-effects`
- `principle-enforce-distributed-authority`
- `principle-state-consistency-contracts`
- `principle-respect-transaction-boundaries`
- `principle-coordinate-external-effects`
- `principle-record-effective-inputs`
- `principle-operational-control`
- `principle-evolve-and-restore-state`
- `principle-contain-untrusted-work`
- `principle-version-decisions-and-intervention`

Report a missing skill and do not reconstruct its rules from memory. Do not silently omit a principle added to the router after this list was written. When a principle applies, follow its `Prove it` routing and load the testing skills it names before judging evidence.

## Walk the principles

Review every principle even when it does not apply:

1. Mark it `applicable` or `not applicable`. A `not applicable` result needs one concrete reason tied to the audited system.
2. For each applicable principle, identify the reliability claims in scope. Check each claim, scope, assumption, invariant where applicable, enforcement or measurement, failure behavior, and evidence using the guarantee-record reference from `distributed-systems-guidelines`.
3. Trace the actual path from acceptance or input through durable state, concurrency boundaries, messages, effects, recovery, and proof. Inspect the authoritative schema, configuration, or dependency contract instead of relying on wrappers and names.
4. Run existing read-only static checks and tests when they fit the scope and dependencies are already available. Do not invoke production effects, decrypt secrets, run failover or restore procedures, or change external state during an audit.
5. Report a defect only when evidence shows an applicable rule is violated or a claimed guarantee lacks its required enforcement or proof. Do not demand a mechanism from an inapplicable principle.

Assign one primary principle to a root defect and list every other principle it affects. Count the finding once in the report totals. Apply its severity to the score of every affected principle so a shared root cause does not leave a violated principle at 4/4.

## Classify defects

Use severity to describe the consequence, not the repair effort:

- `critical`: a permitted history can cause an unauthorized, duplicate, irreversible, cross-tenant, or corrupted effect, lose accepted work, or reopen recovery without an enforcing safety barrier.
- `major`: an applicable correctness, recovery, boundedness, or evidence requirement can fail under an expected fault, but the inspected evidence does not establish a critical consequence.
- `minor`: a scoped contract, observability, or proof gap weakens operation or confidence without defeating the enforced guarantee by itself.

Order defects by severity, then by the cost of leaving them unfixed. For each defect include its ID, severity, file and line, primary principle and exact rule, other affected principles, violated claim, evidence, failure behavior, and smallest correction. Use `path:line` references when the evidence is in a file. Omit the affected-principles line when there are none. Do not pad the report with praise or restate rules the system follows.

## Calculate the grade

Score each applicable principle from every distinct defect that names it as primary or affected:

- Start at 4 points.
- Each `minor` defect subtracts 1 point.
- Each `major` defect subtracts 2 points.
- Any `critical` defect sets the principle to 0 points.
- A principle cannot score below 0.

Use the bundled `scripts/grade.py` with one positional argument per applicable principle in walk-table order. Pass `pass` when no defect affects the principle. Otherwise pass the comma-separated severity of each distinct finding that affects it. A cross-referenced finding therefore appears in more than one principle argument even though the report counts it once:

```bash
python3 <skill-directory>/scripts/grade.py critical major,minor pass critical
```

The script starts each principle at 4, subtracts 1 per `minor`, subtracts 2 per `major`, sets the score to 0 for any `critical`, and floors the score at 0. It calculates the nearest whole percentage with half values rounded up. Available points are four times the number of applicable principles. It converts the percentage to `A` for 90 through 100, `B` for 80 through 89, `C` for 70 through 79, `D` for 60 through 69, or `F` below 60. It then applies these caps so one severe defect cannot disappear inside a broad audit:

- Any defect caps the grade at `B`.
- Any `major` defect caps the grade at `C`.
- Any `critical` defect caps the grade at `D`.

Use the script's principle scores, earned points, percentage, raw grade, severity cap, and final grade in the report. If Python 3 or the bundled script cannot run, calculate the same values manually and name that limitation. When no principle applies, use grade `N/A` instead of inventing a score. If a missing rule or inaccessible source prevents the requested walk, label the grade `Incomplete` and name the missing coverage rather than presenting a partial score as final.

## Write the Markdown report

Keep the grade near the top and use this structure:

```markdown
# Distributed systems audit

- Scope: ...
- Revision: ...
- Overall grade: C (94/100; capped from A by major defects)
- Defects: 0 critical, 2 major, 1 minor

## Principle walk

| Principle | Applicability | Score | Evidence or reason |
| --- | --- | ---: | --- |
| `principle-model-durable-work` | Applicable | 2/4 | DS-001; `src/jobs.ts:40` |
| `principle-state-consistency-contracts` | Not applicable | N/A | The scope has no replicas, caches, or asynchronous projections. |

## Defects

### DS-001 [major] `src/jobs.ts:40` loses accepted work on process exit

- Principle: `principle-model-durable-work`, persist recovery facts
- Affected principles: `principle-evolve-and-restore-state`
- Violated claim: Accepted exports survive worker loss.
- Evidence: The handler acknowledges before placing the export in a process-local queue.
- Failure behavior: A process exit after acknowledgement removes the only copy of the obligation.
- Correction: Commit the accepted export to durable storage before acknowledgement and recover pending exports after restart.

## Commands and limitations

- `make test`: passed, 42 tests ran.
- Provider retry configuration was not present in the audited scope.

## Grading method

State the applicable points, percentage calculation, and any severity cap applied.
```

List every principle named by the router in the walk table. When there are no defects, write `None.` under `## Defects`, assign `A (100/100)`, and still retain the principle walk, commands, limitations, and grading method.

Before finishing, reopen the written report and verify that every principle appears once, every defect has concrete evidence and a correction, and the counts match the defect list. Rerun `scripts/grade.py` from the principle table and verify that its output produces the displayed scores, arithmetic, and final grade.
