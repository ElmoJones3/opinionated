import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import test from "node:test";

const skillRoot = new URL("..", import.meta.url).pathname;
const repositoryRoot = resolve(skillRoot, "../../..");
const documents = [
  join(repositoryRoot, "skills/productivity/README.md"),
  join(skillRoot, "SKILL.md"),
  join(skillRoot, "SEMANTICS.md"),
  join(skillRoot, "THIRD_PARTY_NOTICES.md"),
  join(skillRoot, "references/adjudication.md"),
  join(skillRoot, "references/state-model.md"),
  join(skillRoot, "references/worksheet.md"),
];

test("Mind Merge documentation has no broken relative links", () => {
  for (const document of documents) {
    const source = readFileSync(document, "utf8");
    for (const match of source.matchAll(/\[[^\]]+\]\(([^)]+)\)/g)) {
      const target = match[1];
      if (/^(?:https?:|#)/.test(target)) continue;
      const path = resolve(dirname(document), target.split("#", 1)[0]);
      assert.equal(existsSync(path), true, `${document} links to missing ${target}`);
    }
  }
});

test("the skill names the adjudicator loop, both templates, and the full vocabulary", () => {
  const skill = readFileSync(join(skillRoot, "SKILL.md"), "utf8");
  const semantics = readFileSync(join(skillRoot, "SEMANTICS.md"), "utf8");
  const worksheet = readFileSync(
    join(skillRoot, "references/worksheet.md"),
    "utf8",
  );

  assert.match(skill, /Act as the Adjudicator/);
  assert.match(skill, /Capture the Phase/);
  assert.match(skill, /Pose the next nominated Question/);
  assert.match(worksheet, /mind-merge\.mermaid\.html/);
  assert.match(worksheet, /mind-merge\.rf\.html/);
  for (const relationship of [
    "raises",
    "resolves",
    "supersedes",
    "reopens",
    "retracts",
    "requires",
  ]) {
    assert.match(semantics, new RegExp("### `" + relationship + "`"));
  }
});
