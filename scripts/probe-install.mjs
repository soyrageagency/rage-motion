/*
 * Checks the MCP server the way a user gets it: installed from a tarball,
 * resolving the library as a sibling package rather than as a parent folder.
 *
 * This catches the failure that no test inside the repository can. In here,
 * `../src` happens to be the library, so everything works even if the package
 * ships without it or the `files` list is wrong. Installed, the server has to
 * resolve `@soyrageagency/rage-motion` properly — and if the library's
 * `exports` map does not expose `package.json`, it silently cannot.
 *
 *   node scripts/probe-install.mjs <directory with both packages installed>
 *
 * Crafted by SoyRage Agency — https://soyrage.es/
 */

import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";
import { resolve } from "node:path";

const where = process.argv[2];
if (!where) {
  console.error("usage: node scripts/probe-install.mjs <install directory>");
  process.exit(2);
}

// Resolve from inside the probe project, so this finds the installed copies
// and not the ones in this repository.
const require = createRequire(pathToFileURL(resolve(where, "index.js")));
const entry = require.resolve("@soyrageagency/rage-motion-mcp/server.js");

const client = new Client({ name: "install-probe", version: "0" });
await client.connect(
  new StdioClientTransport({ command: process.execPath, args: [entry], stderr: "ignore" }),
);

const failures = [];
const check = (label, condition, detail = "") => {
  console.log(`  ${condition ? "ok  " : "FAIL"}  ${label}${condition || !detail ? "" : ` — ${detail}`}`);
  if (!condition) failures.push(label);
};

const text = (result) => result.content.map((part) => part.text ?? "").join("\n");

const listing = text(await client.callTool({ name: "list_components", arguments: {} }));
check("the catalogue is served", /marquee/.test(listing) && /typewriter/.test(listing));

const marquee = text(await client.callTool({ name: "get_component", arguments: { name: "marquee" } }));
check("the real source is resolved from the installed package", /export function marquee\(/.test(marquee), marquee.slice(0, 120));
check("the source is the whole file, not a fragment", marquee.length > 6000, `${marquee.length} chars`);

const css = text(await client.callTool({ name: "get_stylesheet", arguments: { section: "cursor" } }));
check("the stylesheet ships and is readable", /\.rm-cursor/.test(css));

const tokens = text(await client.callTool({ name: "get_tokens", arguments: {} }));
check("the tokens are served", /--rm-accent/.test(tokens));

await client.close();

if (failures.length) {
  console.error(`\n${failures.length} check(s) failed on the installed package.`);
  process.exit(1);
}
console.log("\nThe installed package works.");
