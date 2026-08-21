export const EDGE_TYPES = Object.freeze([
  "raises",
  "resolves",
  "supersedes",
  "reopens",
  "retracts",
]);

function metadataOf(value = {}) {
  return { ...(value.metadata ?? {}) };
}

export function createSession(command) {
  const source =
    command !== null && typeof command === "object" && !Array.isArray(command)
      ? command
      : {};
  const phaseCommand =
    source.phase !== null && typeof source.phase === "object"
      ? source.phase
      : {};
  const contextCommand =
    source.context !== null && typeof source.context === "object"
      ? source.context
      : {};
  const gitCommand =
    contextCommand.git !== null && typeof contextCommand.git === "object"
      ? contextCommand.git
      : {};
  const questionCommands = Array.isArray(source.questions)
    ? source.questions
    : [];
  const questions = questionCommands.map((question) => ({
    id: question.id,
    prompt: question.prompt,
    openedInPhaseId: phaseCommand.id,
    metadata: metadataOf(question),
  }));
  const questionDependencies = (
    Array.isArray(source.questionDependencies)
      ? source.questionDependencies
      : []
  ).map((dependency) => ({
    id: dependency.id,
    prerequisiteQuestionId: dependency.prerequisiteQuestionId,
    dependentQuestionId: dependency.dependentQuestionId,
    createdInPhaseId: phaseCommand.id,
    metadata: metadataOf(dependency),
  }));
  const phase = {
    id: phaseCommand.id,
    parentPhaseId: null,
    capturedAt: phaseCommand.capturedAt,
    capturedBy: phaseCommand.capturedBy,
    summary: phaseCommand.summary,
    nextQuestionId: phaseCommand.nextQuestionId,
    status: phaseCommand.status,
    added: {
      questionIds: questions.map(({ id }) => id),
      decisionIds: [],
      evidenceIds: [],
      provenanceEdgeIds: [],
      questionDependencyIds: questionDependencies.map(({ id }) => id),
    },
    metadata: metadataOf(phaseCommand),
  };

  const value = {
    schemaVersion: 1,
    id: source.id,
    context: {
      ...contextCommand,
      git: { ...gitCommand },
    },
    initialQuestionIds: questions.map(({ id }) => id),
    questions,
    decisions: [],
    evidence: [],
    provenanceEdges: [],
    questionDependencies,
    phases: [phase],
    headPhaseId: phase.id,
  };
  const problems = validateSession(value);
  return problems.length > 0 ? { ok: false, problems } : { ok: true, value };
}

export function capturePhase(session, command) {
  const currentProblems = validateSession(session);
  if (currentProblems.length > 0) {
    return { ok: false, problems: currentProblems };
  }
  session = structuredClone(session);
  const source =
    command !== null && typeof command === "object" && !Array.isArray(command)
      ? command
      : {};
  const phaseCommand =
    source.phase !== null && typeof source.phase === "object"
      ? source.phase
      : {};
  const phaseId = phaseCommand.id;
  const questions = (
    Array.isArray(source.questions) ? source.questions : []
  ).map((question) => ({
    id: question.id,
    prompt: question.prompt,
    openedInPhaseId: phaseId,
    metadata: metadataOf(question),
  }));
  const decisions = (
    Array.isArray(source.decisions) ? source.decisions : []
  ).map((decision) => ({
    ...decision,
    phaseId,
    metadata: metadataOf(decision),
  }));
  const evidence = (
    Array.isArray(source.evidence) ? source.evidence : []
  ).map((item) => ({
    ...item,
    phaseId,
    metadata: metadataOf(item),
  }));
  const provenanceEdges = (
    Array.isArray(source.provenanceEdges) ? source.provenanceEdges : []
  ).map((edge) => ({
    ...edge,
    evidenceIds: [...(edge.evidenceIds ?? [])],
    supersedesEdgeId: edge.supersedesEdgeId ?? null,
    phaseId,
    metadata: metadataOf(edge),
  }));
  const questionDependencies = (
    Array.isArray(source.questionDependencies)
      ? source.questionDependencies
      : []
  ).map((dependency) => ({
    id: dependency.id,
    prerequisiteQuestionId: dependency.prerequisiteQuestionId,
    dependentQuestionId: dependency.dependentQuestionId,
    createdInPhaseId: phaseId,
    metadata: metadataOf(dependency),
  }));
  const phase = {
    ...phaseCommand,
    parentPhaseId: session.headPhaseId,
    added: {
      questionIds: questions.map(({ id }) => id),
      decisionIds: decisions.map(({ id }) => id),
      evidenceIds: evidence.map(({ id }) => id),
      provenanceEdgeIds: provenanceEdges.map(({ id }) => id),
      questionDependencyIds: questionDependencies.map(({ id }) => id),
    },
    metadata: metadataOf(phaseCommand),
  };

  const value = {
    ...session,
    questions: [...session.questions, ...questions],
    decisions: [...session.decisions, ...decisions],
    evidence: [...session.evidence, ...evidence],
    provenanceEdges: [...session.provenanceEdges, ...provenanceEdges],
    questionDependencies: [
      ...session.questionDependencies,
      ...questionDependencies,
    ],
    phases: [...session.phases, phase],
    headPhaseId: phaseId,
  };
  const problems = validateSession(value);
  return problems.length > 0 ? { ok: false, problems } : { ok: true, value };
}

function collectionOf(session, key, problems) {
  if (Array.isArray(session[key])) return session[key];
  problems.push({
    code: "invalid-collection",
    path: key,
    message: `${key} must be an array.`,
  });
  return [];
}

function findCycle(vertices, outgoing) {
  const visited = new Set();
  const visiting = new Set();

  function visit(vertex) {
    if (visiting.has(vertex)) return true;
    if (visited.has(vertex)) return false;
    visiting.add(vertex);
    for (const next of outgoing.get(vertex) ?? []) {
      if (visit(next)) return true;
    }
    visiting.delete(vertex);
    visited.add(vertex);
    return false;
  }

  return vertices.some(visit);
}

function idsMatch(actual, recorded) {
  if (!Array.isArray(recorded) || actual.length !== recorded.length) return false;
  return actual.every((id, index) => id === recorded[index]);
}

export function validateSession(session) {
  const problems = [];
  const add = (code, path, message) => problems.push({ code, path, message });
  const requireText = (value, path) => {
    if (typeof value !== "string" || value.trim().length === 0) {
      add("missing-text", path, `${path} must be non-empty text.`);
    }
  };
  const requireTimestamp = (value, path) => {
    if (
      typeof value !== "string" ||
      !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/.test(
        value,
      ) ||
      Number.isNaN(Date.parse(value))
    ) {
      add("invalid-timestamp", path, `${path} must be an ISO 8601 date-time.`);
    }
  };
  const requireMetadata = (value, path) => {
    if (value === null || typeof value !== "object" || Array.isArray(value)) {
      add("invalid-metadata", path, `${path} must be an object.`);
    }
  };
  if (session === null || typeof session !== "object" || Array.isArray(session)) {
    add("invalid-session", "", "The session must be an object.");
    return problems;
  }
  if (session.schemaVersion !== 1) {
    add(
      "unsupported-schema-version",
      "schemaVersion",
      "schemaVersion must be 1.",
    );
  }
  requireText(session.id, "id");
  if (
    session.context === null ||
    typeof session.context !== "object" ||
    Array.isArray(session.context)
  ) {
    add("invalid-context", "context", "context must be an object.");
  } else {
    requireText(session.context.trigger, "context.trigger");
    requireText(session.context.subject, "context.subject");
    requireTimestamp(session.context.startedAt, "context.startedAt");
    if (
      session.context.git === null ||
      typeof session.context.git !== "object" ||
      Array.isArray(session.context.git)
    ) {
      add(
        "invalid-git-context",
        "context.git",
        "context.git must contain the current branch and user.",
      );
    } else {
      if (
        typeof session.context.git.branch !== "string" ||
        session.context.git.branch.trim().length === 0 ||
        typeof session.context.git.user !== "string" ||
        session.context.git.user.trim().length === 0
      ) {
        add(
          "invalid-git-context",
          "context.git",
          "context.git must contain the current branch and user.",
        );
      }
      requireText(session.context.git.branch, "context.git.branch");
      requireText(session.context.git.user, "context.git.user");
    }
  }

  const collectionKeys = [
    "questions",
    "decisions",
    "evidence",
    "provenanceEdges",
    "questionDependencies",
    "phases",
  ];
  const collections = Object.fromEntries(
    collectionKeys.map((key) => [key, collectionOf(session, key, problems)]),
  );
  if (collections.questions.length === 0) {
    add(
      "missing-initial-question",
      "questions",
      "A session must begin with at least one Question.",
    );
  }
  if (collections.phases.length === 0) {
    add(
      "missing-initial-phase",
      "phases",
      "A session must contain an initial Phase.",
    );
  }
  const idsByCollection = Object.fromEntries(
    collectionKeys.map((key) => [
      key,
      new Set(collections[key].map(({ id }) => id)),
    ]),
  );

  for (const key of collectionKeys) {
    const seen = new Set();
    collections[key].forEach((item, index) => {
      if (typeof item?.id !== "string" || item.id.length === 0) {
        add("missing-id", `${key}[${index}].id`, "An id is required.");
      } else if (seen.has(item.id)) {
        add("duplicate-id", `${key}[${index}].id`, `${item.id} is duplicated.`);
      }
      seen.add(item?.id);
    });
  }

  const allIds = new Map();
  for (const key of collectionKeys) {
    collections[key].forEach((item, index) => {
      if (typeof item?.id !== "string") return;
      const previous = allIds.get(item.id);
      if (previous && previous.key !== key) {
        add(
          "id-collision",
          `${key}[${index}].id`,
          `${item.id} is already used by ${previous.key}.`,
        );
      } else {
        allIds.set(item.id, { key, index });
      }
    });
  }

  const questionIds = idsByCollection.questions;
  const decisionIds = idsByCollection.decisions;
  const evidenceIds = idsByCollection.evidence;
  const phaseIds = idsByCollection.phases;

  if (!Array.isArray(session.initialQuestionIds)) {
    add(
      "invalid-initial-questions",
      "initialQuestionIds",
      "initialQuestionIds must be an array.",
    );
  } else {
    session.initialQuestionIds.forEach((id, index) => {
      if (!questionIds.has(id)) {
        add(
          "missing-question",
          `initialQuestionIds[${index}]`,
          `${id} does not identify a Question.`,
        );
      }
    });
    const rootPhaseId = collections.phases[0]?.id;
    const rootQuestionIds = collections.questions
      .filter(({ openedInPhaseId }) => openedInPhaseId === rootPhaseId)
      .map(({ id }) => id);
    if (!idsMatch(rootQuestionIds, session.initialQuestionIds)) {
      add(
        "initial-question-ledger-mismatch",
        "initialQuestionIds",
        "initialQuestionIds must exactly match Questions opened by the root Phase.",
      );
    }
  }

  collections.questions.forEach((question, index) => {
    requireText(question.prompt, `questions[${index}].prompt`);
    requireMetadata(question.metadata, `questions[${index}].metadata`);
    if (!phaseIds.has(question.openedInPhaseId)) {
      add(
        "missing-phase",
        `questions[${index}].openedInPhaseId`,
        `${question.openedInPhaseId} does not identify a Phase.`,
      );
    }
  });
  collections.decisions.forEach((decision, index) => {
    requireText(decision.statement, `decisions[${index}].statement`);
    requireText(decision.acceptedBy, `decisions[${index}].acceptedBy`);
    requireTimestamp(decision.acceptedAt, `decisions[${index}].acceptedAt`);
    requireMetadata(decision.metadata, `decisions[${index}].metadata`);
    if (!phaseIds.has(decision.phaseId)) {
      add(
        "missing-phase",
        `decisions[${index}].phaseId`,
        `${decision.phaseId} does not identify a Phase.`,
      );
    }
  });
  collections.evidence.forEach((item, index) => {
    requireText(item.summary, `evidence[${index}].summary`);
    requireTimestamp(item.observedAt, `evidence[${index}].observedAt`);
    requireMetadata(item.metadata, `evidence[${index}].metadata`);
    if (!phaseIds.has(item.phaseId)) {
      add(
        "missing-phase",
        `evidence[${index}].phaseId`,
        `${item.phaseId} does not identify a Phase.`,
      );
    }
  });

  const outgoingQuestions = new Map(
    collections.questions.map(({ id }) => [id, []]),
  );
  collections.questionDependencies.forEach((dependency, index) => {
    requireMetadata(
      dependency.metadata,
      `questionDependencies[${index}].metadata`,
    );
    if (!questionIds.has(dependency.prerequisiteQuestionId)) {
      add(
        "missing-question",
        `questionDependencies[${index}].prerequisiteQuestionId`,
        `${dependency.prerequisiteQuestionId} does not identify a Question.`,
      );
    }
    if (!questionIds.has(dependency.dependentQuestionId)) {
      add(
        "missing-question",
        `questionDependencies[${index}].dependentQuestionId`,
        `${dependency.dependentQuestionId} does not identify a Question.`,
      );
    }
    if (!phaseIds.has(dependency.createdInPhaseId)) {
      add(
        "missing-phase",
        `questionDependencies[${index}].createdInPhaseId`,
        `${dependency.createdInPhaseId} does not identify a Phase.`,
      );
    }
    outgoingQuestions
      .get(dependency.prerequisiteQuestionId)
      ?.push(dependency.dependentQuestionId);
  });
  if (findCycle([...questionIds], outgoingQuestions)) {
    add(
      "question-dependency-cycle",
      "questionDependencies",
      "Question Dependencies must be acyclic.",
    );
  }

  const seenEdges = new Map();
  const activeEdges = new Map();
  collections.provenanceEdges.forEach((edge, index) => {
    const path = `provenanceEdges[${index}]`;
    requireMetadata(edge.metadata, `${path}.metadata`);
    if (!EDGE_TYPES.includes(edge.type)) {
      add(
        "unknown-edge-type",
        `${path}.type`,
        `${edge.type} is not in the closed edge vocabulary.`,
      );
    }
    if (!decisionIds.has(edge.decisionId)) {
      add(
        "missing-decision",
        `${path}.decisionId`,
        `${edge.decisionId} does not identify a Decision.`,
      );
    }
    if (!questionIds.has(edge.questionId)) {
      add(
        "missing-question",
        `${path}.questionId`,
        `${edge.questionId} does not identify a Question.`,
      );
    }
    if (!phaseIds.has(edge.phaseId)) {
      add(
        "missing-phase",
        `${path}.phaseId`,
        `${edge.phaseId} does not identify a Phase.`,
      );
    }
    if (!Array.isArray(edge.evidenceIds)) {
      add(
        "invalid-evidence-references",
        `${path}.evidenceIds`,
        "evidenceIds must be an array.",
      );
    } else {
      edge.evidenceIds.forEach((id, evidenceIndex) => {
        if (!evidenceIds.has(id)) {
          add(
            "missing-evidence",
            `${path}.evidenceIds[${evidenceIndex}]`,
            `${id} does not identify Evidence.`,
          );
        }
      });
    }

    const predecessor = edge.supersedesEdgeId
      ? seenEdges.get(edge.supersedesEdgeId)
      : undefined;
    if (edge.supersedesEdgeId && !predecessor) {
      add(
        "missing-provenance-edge",
        `${path}.supersedesEdgeId`,
        `${edge.supersedesEdgeId} must identify an earlier Provenance Edge.`,
      );
    } else if (predecessor && predecessor.questionId !== edge.questionId) {
      add(
        "cross-question-supersession",
        `${path}.supersedesEdgeId`,
        "A Provenance Edge may supersede only an edge on the same Question.",
      );
    }
    if (
      (edge.type === "reopens" || edge.type === "retracts") &&
      !edge.supersedesEdgeId
    ) {
      add(
        "missing-superseded-edge",
        `${path}.supersedesEdgeId`,
        `${edge.type} requires the active edge it changes.`,
      );
    }

    const active = activeEdges.get(edge.questionId);
    if (active && edge.supersedesEdgeId !== active.id) {
      add(
        "provenance-head-conflict",
        `${path}.supersedesEdgeId`,
        `The active edge is ${active.id}; a new edge must supersede it.`,
      );
    } else if (!active && edge.supersedesEdgeId) {
      add(
        "provenance-head-conflict",
        `${path}.supersedesEdgeId`,
        "The superseded edge is not the active edge for this Question.",
      );
    } else {
      activeEdges.set(edge.questionId, edge);
    }
    seenEdges.set(edge.id, edge);
  });

  const phaseOutgoing = new Map(
    collections.phases.map(({ id }) => [id, []]),
  );
  collections.phases.forEach((phase, index) => {
    const path = `phases[${index}]`;
    requireTimestamp(phase.capturedAt, `${path}.capturedAt`);
    requireText(phase.capturedBy, `${path}.capturedBy`);
    requireText(phase.summary, `${path}.summary`);
    requireMetadata(phase.metadata, `${path}.metadata`);
    if (index === 0 && phase.parentPhaseId !== null) {
      add(
        "invalid-root-phase",
        `${path}.parentPhaseId`,
        "The initial Phase must not have a parent.",
      );
    }
    if (phase.parentPhaseId !== null) {
      if (!phaseIds.has(phase.parentPhaseId)) {
        add(
          "missing-phase",
          `${path}.parentPhaseId`,
          `${phase.parentPhaseId} does not identify a Phase.`,
        );
      } else {
        phaseOutgoing.get(phase.parentPhaseId)?.push(phase.id);
      }
    }
    if (!new Set(["active", "closed"]).has(phase.status)) {
      add(
        "invalid-phase-status",
        `${path}.status`,
        "Phase status must be active or closed.",
      );
    }
    if (phase.nextQuestionId !== null && !questionIds.has(phase.nextQuestionId)) {
      add(
        "missing-question",
        `${path}.nextQuestionId`,
        `${phase.nextQuestionId} does not identify a Question.`,
      );
    }

    const expected = {
      questionIds: collections.questions
        .filter(({ openedInPhaseId }) => openedInPhaseId === phase.id)
        .map(({ id }) => id),
      decisionIds: collections.decisions
        .filter(({ phaseId }) => phaseId === phase.id)
        .map(({ id }) => id),
      evidenceIds: collections.evidence
        .filter(({ phaseId }) => phaseId === phase.id)
        .map(({ id }) => id),
      provenanceEdgeIds: collections.provenanceEdges
        .filter(({ phaseId }) => phaseId === phase.id)
        .map(({ id }) => id),
      questionDependencyIds: collections.questionDependencies
        .filter(({ createdInPhaseId }) => createdInPhaseId === phase.id)
        .map(({ id }) => id),
    };
    for (const [key, ids] of Object.entries(expected)) {
      if (!idsMatch(ids, phase.added?.[key])) {
        add(
          "phase-ledger-mismatch",
          `${path}.added.${key}`,
          `${key} must exactly record the entities added by this Phase.`,
        );
      }
    }
  });
  if (findCycle([...phaseIds], phaseOutgoing)) {
    add("phase-cycle", "phases", "The Phase tree must be acyclic.");
  }
  if (!phaseIds.has(session.headPhaseId)) {
    add(
      "missing-head-phase",
      "headPhaseId",
      `${session.headPhaseId} does not identify a Phase.`,
    );
  } else {
    const head = collections.phases.find(({ id }) => id === session.headPhaseId);
    if (head.status === "active" && head.nextQuestionId === null) {
      add(
        "missing-next-question",
        "headPhaseId",
        "An active head Phase must nominate the next Question.",
      );
    }
    if (head.status === "closed" && head.nextQuestionId !== null) {
      add(
        "closed-phase-has-next-question",
        "headPhaseId",
        "A closed head Phase must not nominate a next Question.",
      );
    }
    if (head.status === "active" && questionIds.has(head.nextQuestionId)) {
      const edgeById = new Map(
        collections.provenanceEdges.map((edge) => [edge.id, edge]),
      );
      const active = activeEdges.get(head.nextQuestionId);
      const state = active ? stateAfterEdge(active, edgeById) : "open";
      const blocking = collections.questionDependencies.filter(
        ({ dependentQuestionId, prerequisiteQuestionId }) => {
          if (dependentQuestionId !== head.nextQuestionId) return false;
          const prerequisiteEdge = activeEdges.get(prerequisiteQuestionId);
          return (
            prerequisiteEdge === undefined ||
            stateAfterEdge(prerequisiteEdge, edgeById) === "open"
          );
        },
      );
      if (state !== "open" || blocking.length > 0) {
        add(
          "next-question-not-in-frontier",
          "headPhaseId",
          "The next Question must be open and unblocked in the current frontier.",
        );
      }
    }
  }

  return problems;
}

function activeEdgesByQuestion(session) {
  const active = new Map();
  for (const edge of session.provenanceEdges) {
    if (
      !active.has(edge.questionId) ||
      active.get(edge.questionId)?.id === edge.supersedesEdgeId
    ) {
      active.set(edge.questionId, edge);
    }
  }
  return active;
}

function stateAfterEdge(edge, edgeById, seen = new Set()) {
  if (seen.has(edge.id)) return "open";
  const lineage = new Set(seen).add(edge.id);
  switch (edge.type) {
    case "resolves":
      return "resolved";
    case "supersedes":
      return "superseded";
    case "raises":
    case "reopens":
      return "open";
    case "retracts": {
      const retracted = edgeById.get(edge.supersedesEdgeId);
      const predecessor = retracted?.supersedesEdgeId
        ? edgeById.get(retracted.supersedesEdgeId)
        : undefined;
      return predecessor
        ? stateAfterEdge(predecessor, edgeById, lineage)
        : "open";
    }
    default:
      return "open";
  }
}

export function projectSession(session) {
  const problems = validateSession(session);
  if (problems.length > 0) return { ok: false, problems };
  session = structuredClone(session);
  const edgeById = new Map(
    session.provenanceEdges.map((edge) => [edge.id, edge]),
  );
  const activeEdges = activeEdgesByQuestion(session);
  const questionStates = new Map(
    session.questions.map((question) => {
      const activeEdge = activeEdges.get(question.id);
      return [
        question.id,
        activeEdge ? stateAfterEdge(activeEdge, edgeById) : "open",
      ];
    }),
  );
  const prerequisitesByQuestion = new Map(
    session.questions.map(({ id }) => [id, []]),
  );
  for (const dependency of session.questionDependencies) {
    prerequisitesByQuestion
      .get(dependency.dependentQuestionId)
      ?.push(dependency.prerequisiteQuestionId);
  }
  const questions = session.questions.map((question) => {
    const prerequisiteQuestionIds = [
      ...(prerequisitesByQuestion.get(question.id) ?? []),
    ];
    const blockedByQuestionIds = prerequisiteQuestionIds.filter(
      (questionId) => questionStates.get(questionId) === "open",
    );
    const state = questionStates.get(question.id);
    return {
      ...question,
      metadata: metadataOf(question),
      state,
      activeProvenanceEdgeId: activeEdges.get(question.id)?.id ?? null,
      prerequisiteQuestionIds,
      blockedByQuestionIds,
      inFrontier: state === "open" && blockedByQuestionIds.length === 0,
    };
  });
  const frontierQuestionIds = questions
    .filter(({ inFrontier }) => inFrontier)
    .map(({ id }) => id);
  const childrenByPhase = new Map(
    session.phases.map(({ id }) => [id, []]),
  );
  for (const phase of session.phases) {
    if (phase.parentPhaseId !== null) {
      childrenByPhase.get(phase.parentPhaseId)?.push(phase.id);
    }
  }
  const headPhase = session.phases.find(
    ({ id }) => id === session.headPhaseId,
  );

  return {
    ok: true,
    value: {
      schemaVersion: session.schemaVersion,
      sessionId: session.id,
      context: session.context,
      headPhaseId: session.headPhaseId,
      status: headPhase.status,
      nextQuestionId: headPhase.nextQuestionId,
      initialQuestionIds: [...session.initialQuestionIds],
      frontierQuestionIds,
      activeProvenanceEdgeIds: session.provenanceEdges
        .filter((edge) => activeEdges.get(edge.questionId)?.id === edge.id)
        .map(({ id }) => id),
      questions,
      decisions: session.decisions,
      evidence: session.evidence,
      provenanceEdges: session.provenanceEdges.map((edge) => ({
        ...edge,
        active: activeEdges.get(edge.questionId)?.id === edge.id,
        derivedQuestionStateAfter: stateAfterEdge(edge, edgeById),
      })),
      questionDependencies: session.questionDependencies,
      phases: session.phases.map((phase) => ({
        ...phase,
        childPhaseIds: [...(childrenByPhase.get(phase.id) ?? [])],
        isHead: phase.id === session.headPhaseId,
      })),
    },
  };
}
