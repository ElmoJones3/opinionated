#!/usr/bin/env node
import { validateSession } from "./lib/session.mjs";
import { parseOptions, printProblems, run } from "./lib/cli.mjs";
import { readDocument } from "./lib/document.mjs";

run(async () => {
  const options = parseOptions(process.argv.slice(2), ["state"]);
  const session = await readDocument(options.state);
  const problems = validateSession(session);
  if (problems.length > 0) {
    printProblems(problems);
    process.exitCode = 1;
    return;
  }
  console.log(`${options.state} is valid`);
});
