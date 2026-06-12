// Graceful-offline smoke (SPEC §7). Hermetic by construction: no Concord, no
// Ollama, no model — the run proves every page renders friendly guidance when
// its backends are dead.
//
// For every page (the landing page + each lessons/*/index.html, a glob that
// passes when empty) on every engine (Chromium, Firefox, WebKit):
//   1. any request leaving the smoke server's origin is ABORTED (and logged),
//   2. the body must render non-empty — never a blank page,
//   3. every [data-offline-guidance] block must become visible,
//   4. zero uncaught page errors.

import http from "node:http";
import { readdir, readFile, stat } from "node:fs/promises";
import { join, extname, normalize } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium, firefox, webkit } from "playwright";

const ROOT = join(fileURLToPath(import.meta.url), "..", "..", "..");
const PORT = 4173;
const ORIGIN = `http://127.0.0.1:${PORT}`;
const ENGINES = process.env.SMOKE_ENGINES
  ? process.env.SMOKE_ENGINES.split(",")
  : ["chromium", "firefox", "webkit"];

const MIME = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "text/javascript",
  ".mjs": "text/javascript",
  ".json": "application/json",
  ".md": "text/markdown",
  ".svg": "image/svg+xml",
  ".png": "image/png",
};

async function pages() {
  const list = ["index.html"];
  try {
    for (const entry of (await readdir(join(ROOT, "lessons"))).sort()) {
      try {
        await stat(join(ROOT, "lessons", entry, "index.html"));
        list.push(`lessons/${entry}/index.html`);
      } catch {
        /* lesson folder without an index — not a page, skip */
      }
    }
  } catch {
    /* no lessons yet — the landing page alone is the suite (empty glob = pass) */
  }
  return list;
}

function serve() {
  const server = http.createServer(async (req, res) => {
    try {
      const path = normalize(decodeURIComponent(req.url.split("?")[0])).replace(
        /^\/+/,
        "",
      );
      if (path.includes("..")) throw new Error("traversal");
      const file = join(ROOT, path === "" ? "index.html" : path);
      const body = await readFile(file);
      res.writeHead(200, {
        "Content-Type": MIME[extname(file)] ?? "application/octet-stream",
      });
      res.end(body);
    } catch {
      res.writeHead(404);
      res.end("not found");
    }
  });
  return new Promise((resolve) => server.listen(PORT, () => resolve(server)));
}

async function run() {
  const server = await serve();
  const suite = await pages();
  console.log(`pages: ${suite.join(", ")} | engines: ${ENGINES.join(", ")}`);
  let failures = 0;
  const blockedProof = [];

  for (const engineName of ENGINES) {
    const browser = await { chromium, firefox, webkit }[engineName].launch();
    const context = await browser.newContext();

    // The hermetic wall: anything that isn't the smoke server is aborted.
    await context.route("**/*", (route) => {
      const url = route.request().url();
      if (url.startsWith(ORIGIN)) return route.continue();
      blockedProof.push(`[${engineName}] blocked: ${url}`);
      return route.abort();
    });

    for (const page of suite) {
      const tab = await context.newPage();
      const pageErrors = [];
      tab.on("pageerror", (e) => pageErrors.push(String(e)));
      const problems = [];
      try {
        await tab.goto(`${ORIGIN}/${page}`, { waitUntil: "load" });

        const bodyText = (await tab.textContent("body"))?.trim() ?? "";
        if (bodyText.length === 0) problems.push("body rendered empty");

        const guidance = tab.locator("[data-offline-guidance]");
        const count = await guidance.count();
        if (count === 0) problems.push("no [data-offline-guidance] blocks");
        for (let i = 0; i < count; i++) {
          await guidance
            .nth(i)
            .waitFor({ state: "visible", timeout: 10000 })
            .catch(async () => {
              problems.push(
                `guidance block ${await guidance.nth(i).getAttribute("data-offline-guidance")} never became visible`,
              );
            });
        }
        if (pageErrors.length)
          problems.push(`page errors: ${pageErrors.join("; ")}`);
      } catch (e) {
        problems.push(`navigation failed: ${e}`);
      }
      if (problems.length) {
        failures++;
        console.error(
          `FAIL [${engineName}] ${page}\n  - ${problems.join("\n  - ")}`,
        );
      } else {
        console.log(`pass [${engineName}] ${page}`);
      }
      await tab.close();
    }
    await browser.close();
  }

  server.close();
  if (blockedProof.length) {
    console.log(
      `\nhermetic wall held — ${blockedProof.length} request(s) aborted:`,
    );
    for (const line of blockedProof) console.log(`  ${line}`);
  } else {
    console.log("\nno outbound requests attempted (nothing to block).");
  }
  if (failures) {
    console.error(`\n${failures} failure(s).`);
    process.exit(1);
  }
  console.log("\nsmoke green.");
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
