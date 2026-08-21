import { readFile, rename, unlink, writeFile } from "node:fs/promises";
import { extname } from "node:path";

import { parse, stringify } from "./yaml.mjs";

function formatOf(path) {
  const extension = extname(path).toLowerCase();
  if (extension === ".yaml" || extension === ".yml") return "yaml";
  if (extension === ".json") return "json";
  throw new Error(`${path} must end in .json, .yaml, or .yml`);
}

export async function readDocument(path) {
  const source = await readFile(path, "utf8");
  try {
    return formatOf(path) === "yaml" ? parse(source) : JSON.parse(source);
  } catch (error) {
    throw new Error(`Could not parse ${path}: ${error.message}`);
  }
}

export function serializeDocument(path, value) {
  return formatOf(path) === "yaml"
    ? stringify(value, { lineWidth: 0 })
    : `${JSON.stringify(value, null, 2)}\n`;
}

export async function createDocument(path, value) {
  await writeFile(path, serializeDocument(path, value), {
    encoding: "utf8",
    flag: "wx",
  });
}

export async function replaceDocument(path, value) {
  const temporaryPath = `${path}.${process.pid}.tmp`;
  await writeFile(temporaryPath, serializeDocument(path, value), {
    encoding: "utf8",
    flag: "wx",
  });
  try {
    await rename(temporaryPath, path);
  } catch (error) {
    await unlink(temporaryPath).catch(() => undefined);
    throw error;
  }
}

