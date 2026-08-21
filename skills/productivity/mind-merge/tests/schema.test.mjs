import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";

import {
  EDGE_TYPES,
  createSession,
  validateSession,
} from "../scripts/lib/session.mjs";

const schema = JSON.parse(
  readFileSync(new URL("../references/state.schema.json", import.meta.url), "utf8"),
);
const ajv = new Ajv2020({ allErrors: true, strict: true });
addFormats(ajv);
const validateSchema = ajv.compile(schema);

function reachableState() {
  const result = createSession({
    id: "session-schema",
    context: {
      trigger: "The schema needs an executable example",
      subject: "Prove the canonical record",
      startedAt: "2026-08-20T18:00:00.000Z",
      git: { branch: "feature/schema", user: "Ada Lovelace" },
    },
    phase: {
      id: "phase-0",
      capturedAt: "2026-08-20T18:00:00.000Z",
      capturedBy: "Ada Lovelace",
      summary: "Opened the schema question",
      nextQuestionId: "question-schema",
      status: "active",
    },
    questions: [
      { id: "question-schema", prompt: "What must the schema prove?" },
    ],
  });
  assert.equal(result.ok, true);
  return result.value;
}

test("the JSON Schema accepts state produced by createSession", () => {
  const state = reachableState();

  assert.equal(validateSchema(state), true, JSON.stringify(validateSchema.errors));
});

test("the schema and domain model expose the same closed edge vocabulary", () => {
  assert.deepEqual(schema.$defs.provenanceEdge.properties.type.enum, EDGE_TYPES);
  assert.equal("state" in schema.$defs.question.properties, false);
});

test("runtime validation owns referential invariants JSON Schema cannot express", () => {
  const state = reachableState();
  state.initialQuestionIds = ["question-missing"];

  assert.equal(validateSchema(state), true);
  assert.ok(
    validateSession(state).some(({ code }) => code === "missing-question"),
  );
});
