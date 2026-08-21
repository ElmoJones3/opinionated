#!/usr/bin/env node
import { readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { projectSession } from "./lib/session.mjs";
import { parseOptions, printProblems, run } from "./lib/cli.mjs";
import { readDocument } from "./lib/document.mjs";

const skillRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const assets = {
  mermaid: "mind-merge.mermaid.html",
  rf: "mind-merge.rf.html",
};

run(async () => {
  const options = parseOptions(process.argv.slice(2), [
    "state",
    "renderer",
    "output",
  ]);
  const asset = assets[options.renderer];
  if (!asset) throw new Error("--renderer must be mermaid or rf");
  const state = await readDocument(options.state);
  const projection = projectSession(state);
  if (!projection.ok) {
    printProblems(projection.problems);
    process.exitCode = 1;
    return;
  }
  const template = await readFile(join(skillRoot, "assets", asset), "utf8");
  const embedded = JSON.stringify(state).replaceAll("<", "\\u003c");
  const marker = 'id="mind-merge-state" type="application/json">null</script>';
  if (!template.includes(marker)) throw new Error(`${asset} has no state marker`);
  const html = template.replace(
    marker,
    `id="mind-merge-state" type="application/json">${embedded}</script>`,
  );
  await writeFile(options.output, html, { encoding: "utf8", flag: "wx" });
  console.log(`Rendered ${options.renderer} worksheet to ${options.output}`);
});
