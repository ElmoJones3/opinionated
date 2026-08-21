#!/usr/bin/env node
import { capturePhase } from "./lib/session.mjs";
import { parseOptions, printProblems, run } from "./lib/cli.mjs";
import {
  readDocument,
  replaceDocument,
} from "./lib/document.mjs";

run(async () => {
  const options = parseOptions(process.argv.slice(2), ["state", "input"]);
  const [session, command] = await Promise.all([
    readDocument(options.state),
    readDocument(options.input),
  ]);
  const result = capturePhase(session, command);
  if (!result.ok) {
    printProblems(result.problems);
    process.exitCode = 1;
    return;
  }
  await replaceDocument(options.state, result.value);
  console.log(`Captured ${result.value.headPhaseId} in ${options.state}`);
});

