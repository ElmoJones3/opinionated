export function parseOptions(argv, required) {
  const options = {};
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (!token.startsWith("--")) {
      throw new Error(`Unexpected argument: ${token}`);
    }
    const name = token.slice(2);
    const value = argv[index + 1];
    if (value === undefined || value.startsWith("--")) {
      throw new Error(`Missing value for --${name}`);
    }
    options[name] = value;
    index += 1;
  }
  for (const name of required) {
    if (!options[name]) throw new Error(`Missing required option: --${name}`);
  }
  return options;
}

export function printProblems(problems) {
  for (const problem of problems) {
    const location = problem.path ? ` at ${problem.path}` : "";
    console.error(`${problem.code}${location}: ${problem.message}`);
  }
}

export async function run(main) {
  try {
    await main();
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}

