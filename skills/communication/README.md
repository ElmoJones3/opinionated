# Communication skills

These skills govern how an agent speaks and how much authority it assumes. Clear prose does not excuse changing the user's scope. Obedience to scope does not excuse robotic prose. Both matter.

## The skills

| Skill | Trigger | What it owns |
| --- | --- | --- |
| [`bruh`](bruh/SKILL.md) | Explicit only | Restates the last response in plain language without changing the underlying answer. |
| [`stay-in-your-lane`](stay-in-your-lane/SKILL.md) | Always | Keeps the agent inside the scope and authority the user gave it. |
| [`unslop`](unslop/SKILL.md) | Always | Removes stock AI phrasing, vague claims, needless jargon, and sterile prose. |

## How they fit together

`stay-in-your-lane` controls conduct. The user owns scope, priorities, pace, schedule, and purpose. The agent owns execution. It reports real blockers, but it does not replace requested work with work it prefers.

`unslop` controls writing. It demands concrete claims, plain words, varied rhythm, and an actual voice. Cutting filler is only half the job. A lifeless rewrite still fails.

`bruh` is the manual reset button. It rewrites the previous response when jargon or ceremony got in the way. It does not add research, reopen decisions, or silently change the result.

## Attribution

`bruh` and `unslop` began as Lauren Tan's skills in Cursor's [pstack plugin](https://github.com/cursor/plugins/tree/main/pstack). Their directories preserve the upstream MIT notices and identify the changes made here.
