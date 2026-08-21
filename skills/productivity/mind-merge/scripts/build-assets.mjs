#!/usr/bin/env node
import { readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { build } from "esbuild";

const skillRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const sourceRoot = join(skillRoot, "template-src");

async function browserBundle(entry) {
  const result = await build({
    entryPoints: [join(sourceRoot, entry)],
    bundle: true,
    minify: true,
    write: false,
    outfile: "app.js",
    platform: "browser",
    format: "iife",
    target: "es2022",
    legalComments: "eof",
    define: { "process.env.NODE_ENV": '"production"' },
  });
  return {
    js: result.outputFiles.find(({ path }) => path.endsWith(".js"))?.text ?? "",
    css: result.outputFiles.find(({ path }) => path.endsWith(".css"))?.text ?? "",
  };
}

function safeInlineScript(source) {
  return source.replaceAll("</script", "<\\/script");
}

async function writeTemplate({ entry, id, name, output }) {
  const [shell, sharedCss, bundle] = await Promise.all([
    readFile(join(sourceRoot, "shell.html"), "utf8"),
    readFile(join(sourceRoot, "styles.css"), "utf8"),
    browserBundle(entry),
  ]);
  const html = shell
    .replaceAll("__RENDERER_ID__", id)
    .replaceAll("__RENDERER_NAME__", name)
    .replace("__APP_CSS__", () => `${sharedCss}\n${bundle.css}`)
    .replace("__APP_JS__", () => safeInlineScript(bundle.js));
  await writeFile(join(skillRoot, "assets", output), html);
}

await build({
  entryPoints: [join(sourceRoot, "yaml-vendor-entry.mjs")],
  bundle: true,
  minify: true,
  outfile: join(skillRoot, "scripts", "lib", "yaml.mjs"),
  platform: "browser",
  format: "esm",
  target: "es2022",
  legalComments: "eof",
});

await Promise.all([
  writeTemplate({
    entry: "mermaid-app.mjs",
    id: "mermaid",
    name: "Mermaid",
    output: "mind-merge.mermaid.html",
  }),
  writeTemplate({
    entry: "rf-app.jsx",
    id: "react-flow",
    name: "React Flow",
    output: "mind-merge.rf.html",
  }),
]);

console.log("Built offline Mermaid and React Flow worksheet templates.");
