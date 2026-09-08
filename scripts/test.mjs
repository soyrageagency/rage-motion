/*
 * Finds the test files and hands them to Node's test runner.
 *
 * Neither obvious alternative works everywhere. Passing a glob
 * (`node --test "src/**\/*.test.js"`) needs Node 21 or newer, and Node 20
 * reports "could not find" and exits 1. Passing a directory (`node --test src`)
 * is supported everywhere but hangs on Windows when a test spawns a child
 * process over stdio — which the MCP suite does, by design, because that is
 * the only honest way to test a stdio server.
 *
 * So: walk the tree, collect the files, pass them explicitly. That form has
 * worked since Node 18 on every platform.
 *
 *   node scripts/test.mjs src
 *   node scripts/test.mjs mcp
 *
 * Crafted by SoyRage Agency — https://soyrage.es/
 */

import { spawn } from "node:child_process";
import { readdir } from "node:fs/promises";
import { join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(new URL("../", import.meta.url)));
const where = process.argv.slice(2);
if (!where.length) {
  console.error("usage: node scripts/test.mjs <directory…>");
  process.exit(2);
}

async function find(directory) {
  const found = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "node_modules") continue;
      found.push(...(await find(path)));
    } else if (entry.name.endsWith(".test.js")) {
      found.push(path);
    }
  }
  return found;
}

const files = (await Promise.all(where.map((dir) => find(resolve(root, dir))))).flat();

if (!files.length) {
  console.error(`No test files under ${where.join(", ")}.`);
  process.exit(1);
}

console.log(files.map((file) => `  ${relative(root, file)}`).join("\n"));

const runner = spawn(process.execPath, ["--test", ...files], { stdio: "inherit", cwd: root });
runner.on("exit", (code) => process.exit(code ?? 1));
