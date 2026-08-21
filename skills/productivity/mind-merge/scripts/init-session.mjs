#!/usr/bin/env node
import { createSession } from "./lib/session.mjs";
import { parseOptions, printProblems, run } from "./lib/cli.mjs";
import { createDocument, readDocument } from "./lib/document.mjs";

run(async () => {
  const options = parseOptions(process.argv.slice(2), ["input", "state"]);
  const command = await readDocument(options.input);
  const result = createSession(command);
  if (!result.ok) {
    printProblems(result.problems);
    process.exitCode = 1;
    return;
  }
  await createDocument(options.state, result.value);
  console.log(`Initialized ${result.value.id} in ${options.state}`);
});

