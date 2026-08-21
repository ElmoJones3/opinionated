import {
  Background,
  Controls,
  MiniMap,
  ReactFlow,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import React, { useCallback, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";

import { boot, clear, element } from "./shared.mjs";

const Base = {
  Shell({ children }) {
    return <div className="rf-shell">{children}</div>;
  },
  Constraint({ children }) {
    return <div className="rf-constraint">{children}</div>;
  },
  Layout({ children }) {
    return <div className="rf-layout">{children}</div>;
  },
};

function NodeLabel({ kind, text }) {
  return (
    <div className="node-label">
      <small>{kind}</small>
      <span>{text}</span>
    </div>
  );
}

const questionVariant = {
  open: "question-open",
  resolved: "question-resolved",
  superseded: "question-superseded",
};

function graphElements(projection) {
  const nodes = [];
  const edges = [];
  projection.questions.forEach((question, index) => {
    nodes.push({
      id: question.id,
      position: { x: 0, y: index * 145 },
      data: {
        label: <NodeLabel kind={`Question · ${question.state}`} text={question.prompt} />,
        entity: question,
        kind: "Question",
      },
      className: `${questionVariant[question.state]}${question.inFrontier ? " question-frontier" : ""}`,
    });
  });
  projection.decisions.forEach((decision, index) => {
    nodes.push({
      id: decision.id,
      position: { x: 410, y: index * 165 + 30 },
      data: {
        label: <NodeLabel kind="Decision" text={decision.statement} />,
        entity: decision,
        kind: "Decision",
      },
      className: "decision",
    });
  });
  projection.evidence.forEach((item, index) => {
    nodes.push({
      id: item.id,
      position: { x: 820, y: index * 135 + 60 },
      data: {
        label: <NodeLabel kind="Evidence" text={item.summary} />,
        entity: item,
        kind: "Evidence",
      },
      className: "evidence",
    });
  });
  for (const dependency of projection.questionDependencies) {
    edges.push({
      id: dependency.id,
      source: dependency.prerequisiteQuestionId,
      target: dependency.dependentQuestionId,
      label: "requires",
      animated: false,
      style: { stroke: "#aaa59b", strokeDasharray: "5 5" },
      data: { entity: dependency, kind: "Question Dependency" },
    });
  }
  for (const edge of projection.provenanceEdges) {
    edges.push({
      id: edge.id,
      source: edge.decisionId,
      target: edge.questionId,
      label: edge.type,
      animated: edge.active,
      style: {
        stroke: edge.active ? "#c7f36b" : "#777b74",
        strokeDasharray: edge.active ? undefined : "5 5",
      },
      data: { entity: edge, kind: "Provenance Edge" },
    });
    for (const evidenceId of edge.evidenceIds) {
      edges.push({
        id: `${edge.id}:${evidenceId}`,
        source: evidenceId,
        target: edge.decisionId,
        label: "supports",
        style: { stroke: "#aaa59b", strokeDasharray: "3 5" },
        data: {
          entity: projection.evidence.find(({ id }) => id === evidenceId),
          kind: "Evidence link",
        },
      });
    }
  }
  return { nodes, edges };
}

function storedViewport(sessionId) {
  try {
    const value = localStorage.getItem(`mind-merge:${sessionId}:viewport`);
    return value ? JSON.parse(value) : null;
  } catch {
    return null;
  }
}

function Inspector({ selection }) {
  return (
    <aside className="rf-inspector">
      <h3>{selection ? selection.kind : "Inspect the graph"}</h3>
      <pre>
        {selection
          ? JSON.stringify(selection.entity, null, 2)
          : "Select a Question, Decision, Evidence item, or edge. Graph interaction changes only this view; canonical state remains untouched."}
      </pre>
    </aside>
  );
}

function App({ projection }) {
  const [selection, setSelection] = useState(null);
  const graph = useMemo(() => graphElements(projection), [projection]);
  const viewport = useMemo(() => storedViewport(projection.sessionId), [projection.sessionId]);
  const preserveViewport = useCallback(
    (_event, nextViewport) => {
      try {
        localStorage.setItem(
          `mind-merge:${projection.sessionId}:viewport`,
          JSON.stringify(nextViewport),
        );
      } catch {
        // A private browsing policy may refuse presentation-state persistence.
      }
    },
    [projection.sessionId],
  );

  return (
    <Base.Shell>
      <Base.Constraint>
        <Base.Layout>
          <div className="rf-canvas">
            <ReactFlow
              nodes={graph.nodes}
              edges={graph.edges}
              defaultViewport={viewport ?? { x: 80, y: 80, zoom: 0.85 }}
              fitView={viewport === null}
              nodesDraggable={false}
              nodesConnectable={false}
              elementsSelectable
              minZoom={0.15}
              maxZoom={2.5}
              onMoveEnd={preserveViewport}
              onNodeClick={(_event, node) => setSelection(node.data)}
              onEdgeClick={(_event, edge) => setSelection(edge.data)}
            >
              <Background color="#323831" gap={22} />
              <MiniMap pannable zoomable />
              <Controls showInteractive={false} />
            </ReactFlow>
          </div>
          <Inspector selection={selection} />
        </Base.Layout>
      </Base.Constraint>
    </Base.Shell>
  );
}

let root;
boot(async (projection) => {
  const target = element("decision-graph-content");
  clear(target);
  root ??= createRoot(target);
  root.render(<App projection={projection} />);
});

