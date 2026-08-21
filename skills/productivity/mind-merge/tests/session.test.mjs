import assert from "node:assert/strict";
import test from "node:test";

import {
  capturePhase,
  createSession,
  projectSession,
  validateSession,
} from "../scripts/lib/session.mjs";

function initialCommand() {
  return {
    id: "session-1",
    context: {
      trigger: "The API vocabulary keeps drifting",
      subject: "Choose the public API terms",
      startedAt: "2026-08-20T18:00:00.000Z",
      git: {
        branch: "feature/public-api",
        user: "Ada Lovelace",
      },
    },
    phase: {
      id: "phase-0",
      capturedAt: "2026-08-20T18:00:00.000Z",
      capturedBy: "Ada Lovelace",
      summary: "Opened the initial questions",
      nextQuestionId: "question-name",
      status: "active",
    },
    questions: [
      {
        id: "question-name",
        prompt: "What should the public operation be called?",
      },
      {
        id: "question-result",
        prompt: "What should the operation return?",
      },
    ],
    questionDependencies: [
      {
        id: "dependency-result-on-name",
        prerequisiteQuestionId: "question-name",
        dependentQuestionId: "question-result",
      },
    ],
  };
}

test("createSession establishes the initial phase and leaves Question state derived", () => {
  const command = initialCommand();

  const result = createSession(command);

  assert.deepEqual(result, {
    ok: true,
    value: {
      schemaVersion: 1,
      id: "session-1",
      context: command.context,
      initialQuestionIds: ["question-name", "question-result"],
      questions: [
        {
          id: "question-name",
          prompt: "What should the public operation be called?",
          openedInPhaseId: "phase-0",
          metadata: {},
        },
        {
          id: "question-result",
          prompt: "What should the operation return?",
          openedInPhaseId: "phase-0",
          metadata: {},
        },
      ],
      decisions: [],
      evidence: [],
      provenanceEdges: [],
      questionDependencies: [
        {
          id: "dependency-result-on-name",
          prerequisiteQuestionId: "question-name",
          dependentQuestionId: "question-result",
          createdInPhaseId: "phase-0",
          metadata: {},
        },
      ],
      phases: [
        {
          id: "phase-0",
          parentPhaseId: null,
          capturedAt: "2026-08-20T18:00:00.000Z",
          capturedBy: "Ada Lovelace",
          summary: "Opened the initial questions",
          nextQuestionId: "question-name",
          status: "active",
          added: {
            questionIds: ["question-name", "question-result"],
            decisionIds: [],
            evidenceIds: [],
            provenanceEdgeIds: [],
            questionDependencyIds: ["dependency-result-on-name"],
          },
          metadata: {},
        },
      ],
      headPhaseId: "phase-0",
    },
  });
  assert.deepEqual(command.questions[0], {
    id: "question-name",
    prompt: "What should the public operation be called?",
  });
});

test("projectSession derives Question state and the unblocked frontier", () => {
  const created = createSession(initialCommand());
  assert.equal(created.ok, true);

  const result = projectSession(created.value);

  assert.deepEqual(result, {
    ok: true,
    value: {
      schemaVersion: 1,
      sessionId: "session-1",
      context: created.value.context,
      headPhaseId: "phase-0",
      status: "active",
      nextQuestionId: "question-name",
      initialQuestionIds: ["question-name", "question-result"],
      frontierQuestionIds: ["question-name"],
      activeProvenanceEdgeIds: [],
      questions: [
        {
          ...created.value.questions[0],
          state: "open",
          activeProvenanceEdgeId: null,
          prerequisiteQuestionIds: [],
          blockedByQuestionIds: [],
          inFrontier: true,
        },
        {
          ...created.value.questions[1],
          state: "open",
          activeProvenanceEdgeId: null,
          prerequisiteQuestionIds: ["question-name"],
          blockedByQuestionIds: ["question-name"],
          inFrontier: false,
        },
      ],
      decisions: [],
      evidence: [],
      provenanceEdges: [],
      questionDependencies: created.value.questionDependencies,
      phases: [
        {
          ...created.value.phases[0],
          childPhaseIds: [],
          isHead: true,
        },
      ],
    },
  });
});

test("capturePhase appends an accepted Decision and provenance without mutating history", () => {
  const created = createSession(initialCommand());
  assert.equal(created.ok, true);
  const session = created.value;
  const command = {
    phase: {
      id: "phase-1",
      capturedAt: "2026-08-20T18:10:00.000Z",
      capturedBy: "Ada Lovelace",
      summary: "Accepted the operation name",
      nextQuestionId: "question-result",
      status: "active",
    },
    questions: [],
    decisions: [
      {
        id: "decision-name",
        statement: "Name the operation capturePhase.",
        rationale: "The name describes the durable boundary.",
        acceptedAt: "2026-08-20T18:09:00.000Z",
        acceptedBy: "Ada Lovelace",
      },
    ],
    evidence: [
      {
        id: "evidence-prototype",
        summary: "The prototype already uses capturePhase.",
        source: "scripts/prototype.mjs",
        observedAt: "2026-08-20T18:08:00.000Z",
      },
    ],
    provenanceEdges: [
      {
        id: "edge-name-resolved",
        decisionId: "decision-name",
        questionId: "question-name",
        type: "resolves",
        evidenceIds: ["evidence-prototype"],
        rationale: "The accepted name answers the naming question.",
      },
    ],
    questionDependencies: [],
  };

  const result = capturePhase(session, command);

  assert.equal(result.ok, true);
  assert.deepEqual(result.value.decisions[0], {
    ...command.decisions[0],
    phaseId: "phase-1",
    metadata: {},
  });
  assert.deepEqual(result.value.evidence[0], {
    ...command.evidence[0],
    phaseId: "phase-1",
    metadata: {},
  });
  assert.deepEqual(result.value.provenanceEdges[0], {
    ...command.provenanceEdges[0],
    supersedesEdgeId: null,
    phaseId: "phase-1",
    metadata: {},
  });
  assert.deepEqual(result.value.phases[1], {
    ...command.phase,
    parentPhaseId: "phase-0",
    added: {
      questionIds: [],
      decisionIds: ["decision-name"],
      evidenceIds: ["evidence-prototype"],
      provenanceEdgeIds: ["edge-name-resolved"],
      questionDependencyIds: [],
    },
    metadata: {},
  });
  assert.equal(result.value.headPhaseId, "phase-1");
  assert.equal(session.phases.length, 1);
  assert.equal(session.decisions.length, 0);

  const projection = projectSession(result.value);
  assert.equal(projection.ok, true);
  assert.deepEqual(projection.value.frontierQuestionIds, ["question-result"]);
  assert.equal(projection.value.questions[0].state, "resolved");
  assert.equal(projection.value.questions[1].state, "open");
  assert.deepEqual(projection.value.activeProvenanceEdgeIds, [
    "edge-name-resolved",
  ]);
});

test("validateSession accepts state produced by the domain operations", () => {
  const created = createSession(initialCommand());
  assert.equal(created.ok, true);

  assert.deepEqual(validateSession(created.value), []);
});

test("validateSession rejects unknown provenance and missing references", () => {
  const created = createSession(initialCommand());
  assert.equal(created.ok, true);
  const malformed = structuredClone(created.value);
  malformed.provenanceEdges.push({
    id: "edge-bad",
    decisionId: "decision-missing",
    questionId: "question-name",
    type: "guesses",
    evidenceIds: ["evidence-missing"],
    supersedesEdgeId: null,
    phaseId: "phase-0",
    metadata: {},
  });
  malformed.phases[0].added.provenanceEdgeIds.push("edge-bad");

  const codes = validateSession(malformed).map(({ code }) => code);

  assert.ok(codes.includes("unknown-edge-type"));
  assert.ok(codes.includes("missing-decision"));
  assert.ok(codes.includes("missing-evidence"));
});

test("validateSession rejects dependency cycles", () => {
  const created = createSession(initialCommand());
  assert.equal(created.ok, true);
  const malformed = structuredClone(created.value);
  malformed.questionDependencies.push({
    id: "dependency-name-on-result",
    prerequisiteQuestionId: "question-result",
    dependentQuestionId: "question-name",
    createdInPhaseId: "phase-0",
    metadata: {},
  });
  malformed.phases[0].added.questionDependencyIds.push(
    "dependency-name-on-result",
  );

  assert.ok(
    validateSession(malformed).some(
      ({ code }) => code === "question-dependency-cycle",
    ),
  );
});

test("capturePhase rejects a competing provenance head and preserves state", () => {
  const created = createSession(initialCommand());
  assert.equal(created.ok, true);
  const resolved = capturePhase(created.value, {
    phase: {
      id: "phase-1",
      capturedAt: "2026-08-20T18:10:00.000Z",
      capturedBy: "Ada Lovelace",
      summary: "Resolved the name",
      nextQuestionId: "question-result",
      status: "active",
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
  });
  assert.equal(resolved.ok, true);
  const snapshot = structuredClone(resolved.value);

  const refused = capturePhase(resolved.value, {
    phase: {
      id: "phase-2",
      capturedAt: "2026-08-20T18:20:00.000Z",
      capturedBy: "Ada Lovelace",
      summary: "Attempted a disconnected answer",
      nextQuestionId: "question-result",
      status: "active",
    },
    decisions: [
      {
        id: "decision-name-again",
        statement: "Use recordPhase.",
        acceptedAt: "2026-08-20T18:19:00.000Z",
        acceptedBy: "Ada Lovelace",
      },
    ],
    provenanceEdges: [
      {
        id: "edge-name-resolved-again",
        decisionId: "decision-name-again",
        questionId: "question-name",
        type: "resolves",
      },
    ],
  });

  assert.equal(refused.ok, false);
  assert.ok(
    refused.problems.some(
      ({ code }) => code === "provenance-head-conflict",
    ),
  );
  assert.deepEqual(resolved.value, snapshot);
});

test("capturePhase records exploration without inventing a Decision", () => {
  const created = createSession(initialCommand());
  assert.equal(created.ok, true);

  const result = capturePhase(created.value, {
    phase: {
      id: "phase-exploration",
      capturedAt: "2026-08-20T18:05:00.000Z",
      capturedBy: "Ada Lovelace",
      summary: "A constraint surfaced before an answer was accepted",
      nextQuestionId: "question-name",
      status: "active",
    },
    questions: [
      {
        id: "question-compatibility",
        prompt: "Must the name remain compatible with the old command?",
      },
    ],
    evidence: [
      {
        id: "evidence-existing-command",
        summary: "A released script invokes the old command name.",
        source: "bin/released-script",
        observedAt: "2026-08-20T18:04:00.000Z",
      },
    ],
    questionDependencies: [
      {
        id: "dependency-compatibility-on-name",
        prerequisiteQuestionId: "question-name",
        dependentQuestionId: "question-compatibility",
      },
    ],
  });

  assert.equal(result.ok, true);
  assert.equal(result.value.decisions.length, 0);
  assert.equal(result.value.provenanceEdges.length, 0);
  assert.equal(result.value.evidence.length, 1);
  assert.equal(result.value.questions.length, 3);
});

test("reopens and retracts derive state from immutable edge lineage", () => {
  const created = createSession(initialCommand());
  assert.equal(created.ok, true);
  const resolved = capturePhase(created.value, {
    phase: {
      id: "phase-resolve",
      capturedAt: "2026-08-20T18:10:00.000Z",
      capturedBy: "Ada Lovelace",
      summary: "Accepted a name",
      nextQuestionId: "question-result",
      status: "active",
    },
    decisions: [
      {
        id: "decision-resolve",
        statement: "Use capturePhase.",
        acceptedAt: "2026-08-20T18:09:00.000Z",
        acceptedBy: "Ada Lovelace",
      },
    ],
    provenanceEdges: [
      {
        id: "edge-resolve",
        decisionId: "decision-resolve",
        questionId: "question-name",
        type: "resolves",
      },
    ],
  });
  assert.equal(resolved.ok, true);

  const reopened = capturePhase(resolved.value, {
    phase: {
      id: "phase-reopen",
      capturedAt: "2026-08-20T18:20:00.000Z",
      capturedBy: "Ada Lovelace",
      summary: "Compatibility invalidated the accepted name",
      nextQuestionId: "question-name",
      status: "active",
    },
    decisions: [
      {
        id: "decision-reopen",
        statement: "Reopen the naming question.",
        acceptedAt: "2026-08-20T18:19:00.000Z",
        acceptedBy: "Ada Lovelace",
      },
    ],
    provenanceEdges: [
      {
        id: "edge-reopen",
        decisionId: "decision-reopen",
        questionId: "question-name",
        type: "reopens",
        supersedesEdgeId: "edge-resolve",
      },
    ],
  });
  assert.equal(reopened.ok, true);
  const reopenedProjection = projectSession(reopened.value);
  assert.equal(reopenedProjection.ok, true);
  assert.equal(reopenedProjection.value.questions[0].state, "open");
  assert.equal(
    reopenedProjection.value.questions[0].activeProvenanceEdgeId,
    "edge-reopen",
  );

  const retracted = capturePhase(reopened.value, {
    phase: {
      id: "phase-retract",
      capturedAt: "2026-08-20T18:30:00.000Z",
      capturedBy: "Ada Lovelace",
      summary: "The compatibility concern did not apply",
      nextQuestionId: "question-result",
      status: "active",
    },
    decisions: [
      {
        id: "decision-retract",
        statement: "Retract the reopening.",
        acceptedAt: "2026-08-20T18:29:00.000Z",
        acceptedBy: "Ada Lovelace",
      },
    ],
    provenanceEdges: [
      {
        id: "edge-retract",
        decisionId: "decision-retract",
        questionId: "question-name",
        type: "retracts",
        supersedesEdgeId: "edge-reopen",
      },
    ],
  });
  assert.equal(retracted.ok, true);
  const retractedProjection = projectSession(retracted.value);
  assert.equal(retractedProjection.ok, true);
  assert.equal(retractedProjection.value.questions[0].state, "resolved");
  assert.equal(
    retractedProjection.value.questions[0].activeProvenanceEdgeId,
    "edge-retract",
  );
  assert.deepEqual(retractedProjection.value.frontierQuestionIds, [
    "question-result",
  ]);
});

test("capturePhase requires a new accepted Decision for a retraction", () => {
  const created = createSession(initialCommand());
  assert.equal(created.ok, true);

  const result = capturePhase(created.value, {
    phase: {
      id: "phase-retract",
      capturedAt: "2026-08-20T18:30:00.000Z",
      capturedBy: "Ada Lovelace",
      summary: "Attempted an unowned retraction",
      nextQuestionId: "question-name",
      status: "active",
    },
    provenanceEdges: [
      {
        id: "edge-retract",
        decisionId: "decision-missing",
        questionId: "question-name",
        type: "retracts",
      },
    ],
  });

  assert.equal(result.ok, false);
  assert.ok(
    result.problems.some(({ code }) => code === "missing-decision"),
  );
  assert.ok(
    result.problems.some(({ code }) => code === "missing-superseded-edge"),
  );
});

test("projectSession refuses malformed hydrated state", () => {
  const created = createSession(initialCommand());
  assert.equal(created.ok, true);
  const malformed = structuredClone(created.value);
  malformed.questionDependencies[0].dependentQuestionId = "question-missing";

  const result = projectSession(malformed);

  assert.equal(result.ok, false);
  assert.ok(result.problems.some(({ code }) => code === "missing-question"));
});

test("validateSession rejects malformed required values before a renderer sees them", () => {
  const created = createSession(initialCommand());
  assert.equal(created.ok, true);
  const malformed = structuredClone(created.value);
  malformed.context.subject = "";
  malformed.context.git = null;
  malformed.questions[0].prompt = "   ";
  malformed.phases[0].capturedAt = "next Thursday";
  malformed.phases[0].metadata = [];

  const codes = validateSession(malformed).map(({ code }) => code);

  assert.ok(codes.includes("missing-text"));
  assert.ok(codes.includes("invalid-git-context"));
  assert.ok(codes.includes("invalid-timestamp"));
  assert.ok(codes.includes("invalid-metadata"));
});

test("validateSession rejects a Phase ledger that rewrites history", () => {
  const created = createSession(initialCommand());
  assert.equal(created.ok, true);
  const malformed = structuredClone(created.value);
  malformed.phases[0].added.questionIds.reverse();

  assert.ok(
    validateSession(malformed).some(
      ({ code }) => code === "phase-ledger-mismatch",
    ),
  );
});

test("validateSession keeps the initial Question list tied to the root Phase", () => {
  const created = createSession(initialCommand());
  assert.equal(created.ok, true);
  const malformed = structuredClone(created.value);
  malformed.initialQuestionIds.reverse();

  assert.ok(
    validateSession(malformed).some(
      ({ code }) => code === "initial-question-ledger-mismatch",
    ),
  );
});

test("createSession returns structured problems for a partial recovery command", () => {
  const result = createSession({});

  assert.equal(result.ok, false);
  assert.ok(result.problems.some(({ code }) => code === "missing-text"));
  assert.ok(
    result.problems.some(({ code }) => code === "invalid-git-context"),
  );
  assert.ok(
    result.problems.some(({ code }) => code === "missing-initial-question"),
  );
});

test("capturePhase validates malformed recovered state before applying a command", () => {
  const result = capturePhase({}, {});

  assert.equal(result.ok, false);
  assert.ok(result.problems.some(({ code }) => code === "invalid-collection"));
});

test("capturePhase returns fresh nested history instead of aliasing its input", () => {
  const created = createSession(initialCommand());
  assert.equal(created.ok, true);
  const original = structuredClone(created.value);
  const captured = capturePhase(created.value, {
    phase: {
      id: "phase-1",
      capturedAt: "2026-08-20T18:10:00.000Z",
      capturedBy: "Ada Lovelace",
      summary: "Captured exploration",
      nextQuestionId: "question-name",
      status: "active",
    },
  });
  assert.equal(captured.ok, true);

  captured.value.questions[0].metadata.changed = true;
  captured.value.phases[0].added.questionIds.push("question-injected");
  captured.value.context.git.branch = "mutated";

  assert.deepEqual(created.value, original);
});

test("projectSession returns a detached view", () => {
  const created = createSession(initialCommand());
  assert.equal(created.ok, true);
  const original = structuredClone(created.value);
  const projected = projectSession(created.value);
  assert.equal(projected.ok, true);

  projected.value.context.git.branch = "mutated";
  projected.value.phases[0].added.questionIds.push("question-injected");
  projected.value.questionDependencies[0].metadata.changed = true;

  assert.deepEqual(created.value, original);
});

test("raises and supersedes complete the closed provenance vocabulary", () => {
  const created = createSession({
    ...initialCommand(),
    questions: [
      {
        id: "question-name",
        prompt: "What should the public operation be called?",
      },
    ],
    questionDependencies: [],
  });
  assert.equal(created.ok, true);
  const raised = capturePhase(created.value, {
    phase: {
      id: "phase-raise",
      capturedAt: "2026-08-20T18:10:00.000Z",
      capturedBy: "Ada Lovelace",
      summary: "Made the naming question explicitly relevant",
      nextQuestionId: "question-name",
      status: "active",
    },
    decisions: [
      {
        id: "decision-raise",
        statement: "The public operation needs a stable name.",
        acceptedAt: "2026-08-20T18:09:00.000Z",
        acceptedBy: "Ada Lovelace",
      },
    ],
    provenanceEdges: [
      {
        id: "edge-raise",
        decisionId: "decision-raise",
        questionId: "question-name",
        type: "raises",
      },
    ],
  });
  assert.equal(raised.ok, true);
  assert.equal(projectSession(raised.value).value.questions[0].state, "open");

  const superseded = capturePhase(raised.value, {
    phase: {
      id: "phase-supersede",
      capturedAt: "2026-08-20T18:20:00.000Z",
      capturedBy: "Ada Lovelace",
      summary: "Retired the public operation framing",
      nextQuestionId: null,
      status: "closed",
    },
    decisions: [
      {
        id: "decision-supersede",
        statement: "There will be no public operation.",
        acceptedAt: "2026-08-20T18:19:00.000Z",
        acceptedBy: "Ada Lovelace",
      },
    ],
    provenanceEdges: [
      {
        id: "edge-supersede",
        decisionId: "decision-supersede",
        questionId: "question-name",
        type: "supersedes",
        supersedesEdgeId: "edge-raise",
      },
    ],
  });
  assert.equal(superseded.ok, true);
  assert.equal(
    projectSession(superseded.value).value.questions[0].state,
    "superseded",
  );
});

test("a bounded pass can close without hiding an unresolved Question", () => {
  const created = createSession(initialCommand());
  assert.equal(created.ok, true);

  const closed = capturePhase(created.value, {
    phase: {
      id: "phase-close",
      capturedAt: "2026-08-20T18:10:00.000Z",
      capturedBy: "Ada Lovelace",
      summary: "Closed the bounded pass with disagreement visible",
      nextQuestionId: null,
      status: "closed",
    },
    evidence: [
      {
        id: "evidence-disagreement",
        summary: "The participants retain incompatible naming preferences.",
        observedAt: "2026-08-20T18:09:00.000Z",
      },
    ],
  });

  assert.equal(closed.ok, true);
  const projection = projectSession(closed.value);
  assert.equal(projection.ok, true);
  assert.equal(projection.value.status, "closed");
  assert.equal(projection.value.nextQuestionId, null);
  assert.equal(projection.value.questions[0].state, "open");
  assert.equal(projection.value.decisions.length, 0);
});
