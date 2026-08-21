import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

const skillRoot = new URL("..", import.meta.url).pathname;
const assets = ["mind-merge.mermaid.html", "mind-merge.rf.html"];

test("both worksheet templates are offline, stateful five-section mini-apps", () => {
  for (const asset of assets) {
    const html = readFileSync(join(skillRoot, "assets", asset), "utf8");
    assert.match(html, /id="mind-merge-state" type="application\/json">null/);
    assert.match(html, /id="context"/);
    assert.match(html, /id="initial-questions"/);
    assert.match(html, /id="decision-graph"/);
    assert.match(html, /id="decision-answers"/);
    assert.match(html, /id="phase-tree"/);
    assert.match(html, /id="state-file"/);
    assert.doesNotMatch(html, /<script[^>]+src=/i);
    assert.doesNotMatch(html, /<link[^>]+href=/i);
    assert.equal(html.match(/<!doctype html>/gi)?.length, 1);
    assert.equal(html.match(/id="mind-merge-state"/g)?.length, 1);
    assert.ok(html.length > 100_000, `${asset} must contain its runtime`);
  }
});

test("render-session embeds identical canonical state in either renderer", (context) => {
  const directory = mkdtempSync(join(tmpdir(), "mind-merge-render-"));
  context.after(() => rmSync(directory, { recursive: true, force: true }));
  const statePath = join(directory, "state.json");
  const mermaidPath = join(directory, "session.mermaid.html");
  const rfPath = join(directory, "session.rf.html");
  const state = {
    schemaVersion: 1,
    id: "session-render",
    context: {
      trigger: "A decision needs provenance",
      subject: "Choose the persistence boundary",
      startedAt: "2026-08-20T18:00:00.000Z",
      git: { branch: "feature/provenance", user: "Ada Lovelace" },
    },
    initialQuestionIds: ["question-boundary"],
    questions: [
      {
        id: "question-boundary",
        prompt: "Where should state settle?",
        openedInPhaseId: "phase-0",
        metadata: {},
      },
    ],
    decisions: [],
    evidence: [],
    provenanceEdges: [],
    questionDependencies: [],
    phases: [
      {
        id: "phase-0",
        parentPhaseId: null,
        capturedAt: "2026-08-20T18:00:00.000Z",
        capturedBy: "Ada Lovelace",
        summary: "Opened the boundary question",
        nextQuestionId: "question-boundary",
        status: "active",
        added: {
          questionIds: ["question-boundary"],
          decisionIds: [],
          evidenceIds: [],
          provenanceEdgeIds: [],
          questionDependencyIds: [],
        },
        metadata: {},
      },
    ],
    headPhaseId: "phase-0",
  };
  writeFileSync(statePath, `${JSON.stringify(state, null, 2)}\n`);

  for (const [renderer, output] of [
    ["mermaid", mermaidPath],
    ["rf", rfPath],
  ]) {
    execFileSync(
      process.execPath,
      [
        join(skillRoot, "scripts", "render-session.mjs"),
        "--state",
        statePath,
        "--renderer",
        renderer,
        "--output",
        output,
      ],
      { cwd: skillRoot },
    );
  }

  function embedded(path) {
    const html = readFileSync(path, "utf8");
    const match = html.match(
      /id="mind-merge-state" type="application\/json">([\s\S]*?)<\/script>/,
    );
    assert.ok(match);
    return JSON.parse(match[1]);
  }

  assert.deepEqual(embedded(mermaidPath), state);
  assert.deepEqual(embedded(rfPath), state);
});
