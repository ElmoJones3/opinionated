import { parse as parseYaml } from "yaml";

import { projectSession } from "../scripts/lib/session.mjs";

export function element(id) {
  return document.getElementById(id);
}

export function clear(target) {
  target.replaceChildren();
  target.classList.remove("empty-state");
}

export function appendText(parent, tag, value, className) {
  const child = document.createElement(tag);
  child.textContent = value;
  if (className) child.className = className;
  parent.append(child);
  return child;
}

function cardForQuestion(question) {
  const card = document.createElement("article");
  card.className = "card";
  const top = document.createElement("div");
  top.className = "card__top";
  appendText(top, "span", question.id, "card__id");
  const badge = appendText(top, "span", question.state, `badge badge--${question.state}`);
  if (question.inFrontier) badge.classList.add("badge--frontier");
  card.append(top);
  appendText(card, "p", question.prompt, "card__statement");
  if (question.blockedByQuestionIds.length > 0) {
    appendText(
      card,
      "p",
      `Blocked by ${question.blockedByQuestionIds.join(", ")}`,
      "card__detail",
    );
  }
  return card;
}

function renderContext(projection) {
  element("subject").textContent = projection.context.subject;
  const next = projection.questions.find(({ id }) => id === projection.nextQuestionId);
  element("next-question").textContent = next?.prompt ?? "Session closed — no next Question";
  const values = [
    ["Trigger", projection.context.trigger],
    ["Subject matter", projection.context.subject],
    ["Started", projection.context.startedAt],
    ["Branch", projection.context.git.branch],
    ["User", projection.context.git.user],
    ["Session", projection.sessionId],
  ];
  const target = element("context-content");
  clear(target);
  for (const [label, value] of values) {
    const item = document.createElement("dl");
    item.className = "context-item";
    appendText(item, "dt", label);
    appendText(item, "dd", value);
    target.append(item);
  }
}

function renderInitialQuestions(projection) {
  const target = element("initial-questions-content");
  clear(target);
  for (const id of projection.initialQuestionIds) {
    const question = projection.questions.find((candidate) => candidate.id === id);
    if (question) target.append(cardForQuestion(question));
  }
}

function renderDecisions(projection) {
  const target = element("decision-answers-content");
  clear(target);
  if (projection.decisions.length === 0) {
    target.classList.add("empty-state");
    target.textContent = "No accepted Decisions yet. Evidence and Questions may still have changed.";
    return;
  }
  for (const decision of projection.decisions) {
    const card = document.createElement("article");
    card.className = "card";
    const top = document.createElement("div");
    top.className = "card__top";
    appendText(top, "span", decision.id, "card__id");
    appendText(top, "span", "accepted", "badge");
    card.append(top);
    appendText(card, "p", decision.statement, "card__statement");
    if (decision.rationale) appendText(card, "p", decision.rationale, "card__detail");
    appendText(
      card,
      "p",
      `${decision.acceptedBy} · ${decision.acceptedAt}`,
      "card__detail",
    );
    for (const edge of projection.provenanceEdges.filter(
      ({ decisionId }) => decisionId === decision.id,
    )) {
      const question = projection.questions.find(({ id }) => id === edge.questionId);
      const record = document.createElement("div");
      record.className = "edge-record";
      appendText(record, "strong", `${edge.type} · `);
      record.append(document.createTextNode(question?.prompt ?? edge.questionId));
      if (edge.rationale) appendText(record, "div", edge.rationale);
      if (edge.evidenceIds.length > 0) {
        appendText(record, "div", `Evidence: ${edge.evidenceIds.join(", ")}`);
      }
      card.append(record);
    }
    target.append(card);
  }
}

function phaseDepth(phase, byId) {
  let depth = 0;
  let current = phase;
  const seen = new Set();
  while (current.parentPhaseId && !seen.has(current.id)) {
    seen.add(current.id);
    current = byId.get(current.parentPhaseId);
    if (!current) break;
    depth += 1;
  }
  return depth;
}

function renderPhases(projection) {
  const target = element("phase-tree-content");
  clear(target);
  const byId = new Map(projection.phases.map((phase) => [phase.id, phase]));
  for (const phase of projection.phases) {
    const depth = phaseDepth(phase, byId);
    const card = document.createElement("article");
    card.className = "phase";
    card.dataset.depth = String(depth);
    card.style.setProperty("--depth", depth);
    const head = document.createElement("div");
    head.className = "phase__head";
    appendText(head, "span", phase.id, "card__id");
    appendText(head, "span", phase.isHead ? phase.status : "captured", "badge");
    card.append(head);
    appendText(card, "p", phase.summary, "phase__summary");
    const counts = Object.entries(phase.added)
      .filter(([, ids]) => ids.length > 0)
      .map(([kind, ids]) => `+${ids.length} ${kind.replace(/Ids$/, "")}`)
      .join(" · ") || "No graph entities added";
    appendText(card, "div", counts, "phase__diff");
    const next = projection.questions.find(({ id }) => id === phase.nextQuestionId);
    appendText(
      card,
      "div",
      next ? `Next: ${next.prompt}` : "Next: none",
      "phase__diff",
    );
    target.append(card);
  }
}

function showProblems(problems) {
  const target = element("problems");
  target.hidden = false;
  target.textContent = problems
    .map(({ code, path, message }) => `${code}${path ? ` at ${path}` : ""}: ${message}`)
    .join("\n");
}

function hideProblems() {
  element("problems").hidden = true;
}

function parseDocument(name, source) {
  return /\.ya?ml$/i.test(name) ? parseYaml(source) : JSON.parse(source);
}

async function siblingSession() {
  if (window.location.protocol === "file:") return null;
  for (const name of ["state.json", "state.yaml", "state.yml"]) {
    const response = await fetch(name);
    if (response.ok) return parseDocument(name, await response.text());
  }
  return null;
}

export async function boot(renderGraph) {
  async function render(session, sourceLabel) {
    const result = projectSession(session);
    if (!result.ok) {
      showProblems(result.problems);
      element("load-status").textContent = `${sourceLabel} is invalid`;
      return;
    }
    hideProblems();
    renderContext(result.value);
    renderInitialQuestions(result.value);
    renderDecisions(result.value);
    renderPhases(result.value);
    await renderGraph(result.value);
    element("load-status").textContent = `Loaded ${sourceLabel}`;
  }

  element("state-file").addEventListener("change", async (event) => {
    const [file] = event.target.files;
    if (!file) return;
    try {
      await render(parseDocument(file.name, await file.text()), file.name);
    } catch (error) {
      showProblems([{ code: "unreadable-state", path: "", message: error.message }]);
    }
  });

  try {
    const embedded = element("mind-merge-state").textContent.trim();
    if (embedded !== "null") {
      await render(JSON.parse(embedded), "embedded state");
      return;
    }
    const sibling = await siblingSession();
    if (sibling) {
      await render(sibling, "sibling state file");
    } else {
      element("load-status").textContent =
        window.location.protocol === "file:"
          ? "Choose a state file; browsers do not expose sibling files from file://"
          : "No sibling state.json or state.yaml found; choose one above";
    }
  } catch (error) {
    showProblems([{ code: "unreadable-state", path: "", message: error.message }]);
  }
}

