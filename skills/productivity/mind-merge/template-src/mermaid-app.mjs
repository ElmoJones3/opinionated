import mermaid from "mermaid";

import { boot, clear, element } from "./shared.mjs";

function label(value) {
  return String(value).replaceAll("\\", "\\\\").replaceAll('"', "'").replaceAll("\n", " ");
}

function diagram(projection) {
  const lines = ["flowchart LR"];
  const questionAlias = new Map();
  const decisionAlias = new Map();
  const evidenceAlias = new Map();
  projection.questions.forEach((question, index) => {
    const alias = `q${index}`;
    questionAlias.set(question.id, alias);
    lines.push(`  ${alias}["Q · ${label(question.prompt)}"]:::question_${question.state}`);
    if (question.inFrontier) lines.push(`  class ${alias} frontier`);
  });
  projection.decisions.forEach((decision, index) => {
    const alias = `d${index}`;
    decisionAlias.set(decision.id, alias);
    lines.push(`  ${alias}["D · ${label(decision.statement)}"]:::decision`);
  });
  projection.evidence.forEach((item, index) => {
    const alias = `e${index}`;
    evidenceAlias.set(item.id, alias);
    lines.push(`  ${alias}["E · ${label(item.summary)}"]:::evidence`);
  });
  for (const dependency of projection.questionDependencies) {
    lines.push(
      `  ${questionAlias.get(dependency.prerequisiteQuestionId)} -. "requires" .-> ${questionAlias.get(dependency.dependentQuestionId)}`,
    );
  }
  for (const edge of projection.provenanceEdges) {
    const stroke = edge.active ? "-->" : "-.->";
    lines.push(
      `  ${decisionAlias.get(edge.decisionId)} ${stroke}|"${edge.type}"| ${questionAlias.get(edge.questionId)}`,
    );
    for (const evidenceId of edge.evidenceIds) {
      lines.push(`  ${evidenceAlias.get(evidenceId)} -. "supports" .-> ${decisionAlias.get(edge.decisionId)}`);
    }
  }
  lines.push(
    "  classDef question_open fill:#2b2417,stroke:#ffbf69,color:#f4f0e7",
    "  classDef question_resolved fill:#16243b,stroke:#77a8ff,color:#f4f0e7",
    "  classDef question_superseded fill:#271c36,stroke:#c19cff,color:#f4f0e7",
    "  classDef decision fill:#1e2817,stroke:#c7f36b,color:#f4f0e7",
    "  classDef evidence fill:#181b18,stroke:#aaa59b,color:#aaa59b,stroke-dasharray:5 4",
    "  classDef frontier stroke-width:4px",
  );
  return lines.join("\n");
}

mermaid.initialize({
  startOnLoad: false,
  securityLevel: "strict",
  theme: "base",
  flowchart: { curve: "basis", htmlLabels: false, useMaxWidth: false },
  themeVariables: {
    background: "#0d0f0d",
    primaryTextColor: "#f4f0e7",
    lineColor: "#aaa59b",
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
  },
});

let renderCount = 0;
boot(async (projection) => {
  const target = element("decision-graph-content");
  clear(target);
  target.classList.add("mermaid-scroll");
  const rendered = await mermaid.render(`mind-merge-graph-${renderCount += 1}`, diagram(projection));
  target.innerHTML = rendered.svg;
});

