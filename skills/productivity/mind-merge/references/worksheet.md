# Worksheet and command reference

The skill ships two self-contained templates:

- `assets/mind-merge.mermaid.html` for a compact, reviewable graph;
- `assets/mind-merge.rf.html` for pan, zoom, minimap navigation, entity inspection, and session-scoped viewport persistence.

Both display the same five sections: Context, Initial open Questions, Decision graph, Answers per Decision, and Phase tree. Both bundle their runtime and YAML parser. Neither needs a CDN or network connection.

## Session files

Use a repository's existing design-artifact location. When none exists, default to `docs/mind-merge/<subject-slug>/`. Keep `state.json` or `state.yaml` beside the rendered worksheet so a local server can load it automatically.

Under `file://`, browser security prevents automatic sibling-file access. Use the worksheet's file picker, or generate a standalone worksheet with embedded state.

## Initialize

Create an initialization command containing explicit time and Git values, then run:

```bash
node <skill-directory>/scripts/init-session.mjs \
  --input init.json \
  --state state.json
```

The command shape is:

```json
{
  "id": "session-public-api",
  "context": {
    "trigger": "Public terms are drifting",
    "subject": "Choose the public API vocabulary",
    "startedAt": "2026-08-20T18:00:00.000Z",
    "git": { "branch": "feature/public-api", "user": "Ada Lovelace" }
  },
  "phase": {
    "id": "phase-0",
    "capturedAt": "2026-08-20T18:00:00.000Z",
    "capturedBy": "Ada Lovelace",
    "summary": "Opened the initial questions",
    "nextQuestionId": "question-name",
    "status": "active"
  },
  "questions": [
    { "id": "question-name", "prompt": "What should the operation be called?" }
  ],
  "questionDependencies": []
}
```

The initializer refuses to overwrite an existing state file.

## Capture

Create a Phase command with only the entities added by this capture:

```bash
node <skill-directory>/scripts/capture-phase.mjs \
  --state state.json \
  --input phase.json
```

Omitted collections default to empty arrays. The operation validates the existing record and complete candidate before atomically replacing the state file. On refusal, the original bytes remain unchanged.

## Validate

```bash
node <skill-directory>/scripts/validate-state.mjs --state state.json
```

Validation reports stable problem codes and field paths. It covers structural requirements, references, closed vocabulary, acyclic dependencies and Phases, active-edge lineage, Phase ledgers, and the nominated frontier Question.

## Render

Generate a standalone artifact with embedded canonical state:

```bash
node <skill-directory>/scripts/render-session.mjs \
  --state state.json \
  --renderer mermaid \
  --output mind-merge.html
```

Use `--renderer rf` for React Flow. Rendering refuses malformed state and refuses to overwrite an existing output file. Delete or move a disposable output deliberately before regenerating it; keep canonical state untouched.

To use the unembedded templates, copy either HTML asset beside `state.json` or `state.yaml` and serve the directory. Visual interaction never edits the domain record.

## Rebuild the bundled templates

Template maintenance requires Node and the pinned development packages:

```bash
npm install
npm run build
npm test
```

Run these commands from the skill directory. Generated HTML and the vendored YAML runtime are committed so ordinary sessions do not need `npm install`.
