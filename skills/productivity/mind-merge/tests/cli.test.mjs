import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

const skillRoot = new URL("..", import.meta.url).pathname;

function run(script, args) {
  return execFileSync(process.execPath, [join(skillRoot, "scripts", script), ...args], {
    cwd: skillRoot,
    encoding: "utf8",
  });
}

function initCommand() {
  return {
    id: "session-cli",
    context: {
      trigger: "A public term is unsettled",
      subject: "Choose the operation name",
      startedAt: "2026-08-20T18:00:00.000Z",
      git: { branch: "feature/naming", user: "Ada Lovelace" },
    },
    phase: {
      id: "phase-0",
      capturedAt: "2026-08-20T18:00:00.000Z",
      capturedBy: "Ada Lovelace",
      summary: "Opened the naming question",
      nextQuestionId: "question-name",
      status: "active",
    },
    questions: [
      { id: "question-name", prompt: "What should the operation be called?" },
    ],
  };
}

test("JSON CLI initializes, captures, and validates a session", (context) => {
  const directory = mkdtempSync(join(tmpdir(), "mind-merge-json-"));
  context.after(() => rmSync(directory, { recursive: true, force: true }));
  const inputPath = join(directory, "init.json");
  const phasePath = join(directory, "phase.json");
  const statePath = join(directory, "state.json");
  writeFileSync(inputPath, `${JSON.stringify(initCommand(), null, 2)}\n`);

  const initialized = run("init-session.mjs", [
    "--input",
    inputPath,
    "--state",
    statePath,
  ]);
  assert.match(initialized, /Initialized session-cli/);

  const phase = {
    phase: {
      id: "phase-1",
      capturedAt: "2026-08-20T18:10:00.000Z",
      capturedBy: "Ada Lovelace",
      summary: "Accepted the name",
      nextQuestionId: null,
      status: "closed",
    },
    decisions: [
      {
        id: "decision-name",
        statement: "Use capturePhase.",
        acceptedAt: "2026-08-20T18:09:00.000Z",
        acceptedBy: "Ada Lovelace",
      },
    ],
    provenanceEdges: [
      {
        id: "edge-name-resolved",
        decisionId: "decision-name",
        questionId: "question-name",
        type: "resolves",
      },
    ],
  };
  writeFileSync(phasePath, `${JSON.stringify(phase, null, 2)}\n`);

  const captured = run("capture-phase.mjs", [
    "--state",
    statePath,
    "--input",
    phasePath,
  ]);
  assert.match(captured, /Captured phase-1/);
  assert.match(run("validate-state.mjs", ["--state", statePath]), /valid/);

  const state = JSON.parse(readFileSync(statePath, "utf8"));
  assert.equal(state.headPhaseId, "phase-1");
  assert.equal(state.decisions[0].id, "decision-name");
});

test("YAML CLI round-trips the same canonical model", (context) => {
  const directory = mkdtempSync(join(tmpdir(), "mind-merge-yaml-"));
  context.after(() => rmSync(directory, { recursive: true, force: true }));
  const inputPath = join(directory, "init.json");
  const statePath = join(directory, "state.yaml");
  writeFileSync(inputPath, `${JSON.stringify(initCommand(), null, 2)}\n`);

  run("init-session.mjs", ["--input", inputPath, "--state", statePath]);

  const yaml = readFileSync(statePath, "utf8");
  assert.match(yaml, /^schemaVersion: 1/m);
  assert.match(run("validate-state.mjs", ["--state", statePath]), /valid/);
});

test("a refused capture leaves the state file byte-for-byte unchanged", (context) => {
  const directory = mkdtempSync(join(tmpdir(), "mind-merge-refusal-"));
  context.after(() => rmSync(directory, { recursive: true, force: true }));
  const inputPath = join(directory, "init.json");
  const phasePath = join(directory, "phase.json");
  const statePath = join(directory, "state.json");
  writeFileSync(inputPath, `${JSON.stringify(initCommand(), null, 2)}\n`);
  run("init-session.mjs", ["--input", inputPath, "--state", statePath]);
  const before = readFileSync(statePath, "utf8");
  writeFileSync(
    phasePath,
    `${JSON.stringify(
      {
        phase: {
          id: "phase-bad",
          capturedAt: "2026-08-20T18:10:00.000Z",
          capturedBy: "Ada Lovelace",
          summary: "Malformed phase",
          nextQuestionId: "question-name",
          status: "active",
        },
        provenanceEdges: [
          {
            id: "edge-bad",
            decisionId: "decision-missing",
            questionId: "question-name",
            type: "guesses",
          },
        ],
      },
      null,
      2,
    )}\n`,
  );

  const result = spawnSync(
    process.execPath,
    [
      join(skillRoot, "scripts", "capture-phase.mjs"),
      "--state",
      statePath,
      "--input",
      phasePath,
    ],
    { cwd: skillRoot, encoding: "utf8" },
  );

  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /unknown-edge-type/);
  assert.equal(readFileSync(statePath, "utf8"), before);
});
