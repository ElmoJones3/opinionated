import assert from "node:assert/strict";
import { execFileSync, spawn } from "node:child_process";
import { existsSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import test from "node:test";

import { capturePhase, createSession } from "../scripts/lib/session.mjs";

const skillRoot = new URL("..", import.meta.url).pathname;
const defaultChrome = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const chrome = process.env.MIND_MERGE_CHROME ?? defaultChrome;

function sessionState() {
  const created = createSession({
    id: "session-browser",
    context: {
      trigger: "The offline worksheets need a browser proof",
      subject: "Smoke-test both worksheet runtimes",
      startedAt: "2026-08-20T18:00:00.000Z",
      git: { branch: "feature/browser-proof", user: "Ada Lovelace" },
    },
    phase: {
      id: "phase-0",
      capturedAt: "2026-08-20T18:00:00.000Z",
      capturedBy: "Ada Lovelace",
      summary: "Opened the renderer question",
      nextQuestionId: "question-renderer",
      status: "active",
    },
    questions: [
      {
        id: "question-renderer",
        prompt: "Do both offline runtimes materialize the same Decision?",
      },
    ],
  });
  assert.equal(created.ok, true);
  const captured = capturePhase(created.value, {
    phase: {
      id: "phase-1",
      capturedAt: "2026-08-20T18:10:00.000Z",
      capturedBy: "Ada Lovelace",
      summary: "Accepted the renderer parity contract",
      nextQuestionId: null,
      status: "closed",
    },
    decisions: [
      {
        id: "decision-renderer",
        statement: "Both worksheets project the same canonical state.",
        acceptedAt: "2026-08-20T18:09:00.000Z",
        acceptedBy: "Ada Lovelace",
      },
    ],
    evidence: [
      {
        id: "evidence-offline",
        summary: "Each HTML file contains its complete runtime.",
        source: "assets/",
        observedAt: "2026-08-20T18:08:00.000Z",
      },
    ],
    provenanceEdges: [
      {
        id: "edge-renderer-resolved",
        decisionId: "decision-renderer",
        questionId: "question-renderer",
        type: "resolves",
        evidenceIds: ["evidence-offline"],
      },
    ],
  });
  assert.equal(captured.ok, true);
  return captured.value;
}

function executeWorksheet(path, profile, markers) {
  return new Promise((resolve, reject) => {
    const child = spawn(chrome, [
      "--headless=new",
      "--disable-gpu",
      "--disable-extensions",
      "--disable-background-networking",
      "--disable-component-update",
      "--disable-sync",
      "--disable-crash-reporter",
      "--no-first-run",
      "--no-default-browser-check",
      `--user-data-dir=${profile}`,
      "--virtual-time-budget=4000",
      "--dump-dom",
      pathToFileURL(path).href,
    ]);
    let stdout = "";
    let stderr = "";
    let matched = false;
    const timeout = setTimeout(() => {
      child.kill("SIGKILL");
    }, 30_000);
    child.stdout.setEncoding("utf8");
    child.stderr.setEncoding("utf8");
    child.stdout.on("data", (chunk) => {
      stdout += chunk;
      if (!matched && markers.every((marker) => stdout.includes(marker))) {
        matched = true;
        child.kill("SIGTERM");
      }
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk;
    });
    child.on("error", reject);
    child.on("close", () => {
      clearTimeout(timeout);
      if (matched) resolve(stdout);
      else reject(new Error(`Chrome did not render the expected DOM.\n${stderr}`));
    });
  });
}

test(
  "headless Chrome executes the embedded Mermaid and React Flow worksheets",
  { skip: !existsSync(chrome) && `Chrome was not found at ${chrome}` },
  async (context) => {
    const directory = mkdtempSync(join(tmpdir(), "mind-merge-browser-"));
    context.after(() => rmSync(directory, { recursive: true, force: true }));
    const statePath = join(directory, "state.json");
    writeFileSync(statePath, `${JSON.stringify(sessionState(), null, 2)}\n`);

    for (const renderer of ["mermaid", "rf"]) {
      const output = join(directory, `${renderer}.html`);
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
      const profile = join(directory, `chrome-${renderer}`);
      const rendererMarker =
        renderer === "mermaid" ? "mind-merge-graph-1" : 'class="react-flow';
      const dom = await executeWorksheet(output, profile, [
        "Loaded embedded state",
        "Smoke-test both worksheet runtimes",
        rendererMarker,
      ]);
      assert.match(dom, /Both worksheets project the same canonical state/);
    }
  },
);
