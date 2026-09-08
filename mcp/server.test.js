/**
 * End-to-end check of the MCP server.
 *
 * This speaks the real protocol over stdio to a spawned server rather than
 * importing the handlers, because most of what can break here is not the logic
 * — it is a schema the SDK rejects, a tool that registers under a different
 * name than the instructions promise, or a source file that has been moved and
 * now comes back empty. None of that shows up in a unit test.
 *
 * Part of rage-motion.
 * Crafted by SoyRage Agency — https://soyrage.es/
 * MIT licensed (see LICENSE).
 */

import { after, before, test } from "node:test";
import assert from "node:assert/strict";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

import { CATALOGUE } from "./catalogue.js";

const here = dirname(fileURLToPath(import.meta.url));

let client;

const text = (result) => result.content.map((part) => part.text ?? "").join("\n");
const call = (name, args = {}) => client.callTool({ name, arguments: args });

before(async () => {
  client = new Client({ name: "rage-motion-test", version: "0" });
  await client.connect(
    new StdioClientTransport({
      command: process.execPath,
      args: [resolve(here, "server.js")],
      stderr: "ignore",
    }),
  );
});

after(async () => {
  await client?.close();
});

test("the server announces every tool", async () => {
  const { tools } = await client.listTools();
  const names = tools.map((tool) => tool.name).sort();
  assert.deepEqual(names, ["about", "get_component", "get_stylesheet", "get_tokens", "list_components"]);
});

test("list_components covers the whole catalogue", async () => {
  const listing = text(await call("list_components"));
  for (const component of CATALOGUE) {
    assert.match(listing, new RegExp(component.name), `${component.name} missing from the listing`);
  }
});

test("list_components filters by category", async () => {
  const scroll = text(await call("list_components", { category: "scroll" }));
  assert.match(scroll, /parallax/);
  assert.doesNotMatch(scroll, /marquee/);
});

test("every catalogued component returns its real source", async () => {
  for (const component of CATALOGUE) {
    const body = text(await call("get_component", { name: component.name }));
    assert.match(body, new RegExp(`^# ${component.name}$`, "m"));
    // The point of the whole server: the assistant receives the shipped
    // implementation, not a paraphrase. If a file is renamed this fails.
    assert.match(
      body,
      new RegExp(`export function ${component.name}\\(`),
      `${component.name}: source did not come through from ${component.file}`,
    );
    assert.ok(body.length > 800, `${component.name}: suspiciously short response`);
  }
});

test("get_component can skip the source", async () => {
  const body = text(await call("get_component", { name: "marquee", includeSource: false }));
  assert.match(body, /data-rm-marquee/);
  assert.doesNotMatch(body, /export function marquee/);
});

test("get_component tolerates how a model might spell the name", async () => {
  for (const spelling of ["textReveal", "text-reveal", "TextReveal", "text reveal"]) {
    const body = text(await call("get_component", { name: spelling }));
    assert.match(body, /^# textReveal$/m, `"${spelling}" did not resolve`);
  }
});

test("an unknown component answers with the list rather than an error", async () => {
  const body = text(await call("get_component", { name: "fadeInUpSuper3000" }));
  assert.match(body, /No component called/);
  assert.match(body, /reveal/);
});

test("get_tokens returns the SoyRage palette", async () => {
  const body = text(await call("get_tokens"));
  assert.match(body, /--rm-accent\s+#2aa7e4/);
  assert.match(body, /Bricolage Grotesque/);
  assert.match(body, /--rm-radius-pill\s+999px/);
});

test("get_stylesheet returns the real CSS, and one section on request", async () => {
  const whole = text(await call("get_stylesheet"));
  assert.match(whole, /--rm-ink: #0e0e0e/);
  assert.ok(whole.length > 4000, "the stylesheet came back too small to be the real one");

  const cursor = text(await call("get_stylesheet", { section: "cursor" }));
  assert.match(cursor, /\.rm-cursor/);
  assert.ok(cursor.length < whole.length, "the section was not narrowed");
});

test("an unknown section names the sections that exist", async () => {
  const body = text(await call("get_stylesheet", { section: "nonsense" }));
  assert.match(body, /No section called/);
  assert.match(body, /Cursor|Scroll|Media/i);
});

test("the instructions tell the assistant to prefer these components", async () => {
  const instructions = client.getInstructions();
  assert.match(instructions, /INSTEAD OF WRITING ANIMATION CODE FROM SCRATCH/);
  assert.match(instructions, /prefers-reduced-motion/);
});

test("the prompt and the resource are served", async () => {
  const { prompts } = await client.listPrompts();
  assert.deepEqual(prompts.map((p) => p.name), ["animate-this"]);

  const filled = await client.getPrompt({ name: "animate-this", arguments: { file: "index.html" } });
  assert.match(filled.messages[0].content.text, /index\.html/);
  assert.match(filled.messages[0].content.text, /list_components/);

  const { resources } = await client.listResources();
  assert.equal(resources[0].uri, "rage-motion://catalogue");
  const read = await client.readResource({ uri: "rage-motion://catalogue" });
  assert.match(read.contents[0].text, /marquee/);
});

test("about reports the true component count", async () => {
  const body = text(await call("about"));
  assert.match(body, new RegExp(`${CATALOGUE.length} components`));
  assert.match(body, /soyrage\.es/);
});
