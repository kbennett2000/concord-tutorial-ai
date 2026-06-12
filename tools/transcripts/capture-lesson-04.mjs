// Lesson-4 session capture (voice rule 9: real runs only, never doctored).
// Drives the ACTUAL menu page in Chromium, recording every /api/chat round
// and every Concord call, plus screenshots. Dev tooling — never in CI.
//
// --blunt <tool> performs the lab's exact edit (replace that tool's whole
// description with the blunt text) before the run and restores the file
// after — the same edit the lesson tells the student to make by hand.
//
// Usage:
//   node capture-lesson-04.mjs --session route-q1 --prompt "What does Romans 8:28 say?"
//   node capture-lesson-04.mjs --session blunt-meaning-1 --prompt "Find verses about courage when you're afraid." --blunt search_by_meaning

import http from "node:http";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join, extname } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "../smoke/node_modules/playwright/index.mjs";

const ROOT = join(fileURLToPath(import.meta.url), "..", "..", "..");
const PAGE_FILE = join(ROOT, "lessons", "04-the-menu", "index.html");
const PORT = 5500;
const PAGE = `http://localhost:${PORT}/lessons/04-the-menu/index.html`;
const OUT = join(ROOT, "docs", "transcripts", "lesson-04");

const BLUNTS = {
  search_by_meaning: '"Search."',
  places_for_passage: '"Get data."',
  lookup_verse: '"Get Bible content."',
};

function arg(name, fallback) {
  const i = process.argv.indexOf(`--${name}`);
  return i > -1 ? process.argv[i + 1] : fallback;
}
const session = arg("session");
const prompt = arg("prompt", null);
const blunt = arg("blunt", null);
const outRoot = arg("outdir", OUT);
if (!session) {
  console.error("--session is required");
  process.exit(1);
}

const MIME = {
  ".html": "text/html",
  ".png": "image/png",
  ".md": "text/markdown",
};
const server = http.createServer(async (req, res) => {
  try {
    const path = decodeURIComponent(req.url.split("?")[0]).replace(/^\/+/, "");
    if (path.includes("..")) throw new Error("traversal");
    const body = await readFile(join(ROOT, path));
    res.writeHead(200, {
      "Content-Type": MIME[extname(path)] ?? "application/octet-stream",
    });
    res.end(body);
  } catch {
    res.writeHead(404);
    res.end("not found");
  }
});
await new Promise((r) => server.listen(PORT, r));
const outDir = join(outRoot, session);
await mkdir(outDir, { recursive: true });

// Apply the blunt edit (and remember the original to restore, always).
const originalPage = await readFile(PAGE_FILE, "utf8");
if (blunt) {
  if (!BLUNTS[blunt]) {
    console.error(`unknown --blunt target: ${blunt}`);
    process.exit(1);
  }
  const re = new RegExp(
    `(name: "${blunt}",\\s*description:)[\\s\\S]*?(,\\s*parameters)`,
  );
  if (!re.test(originalPage)) {
    console.error("could not locate the description to blunt");
    process.exit(1);
  }
  await writeFile(PAGE_FILE, originalPage.replace(re, `$1 ${BLUNTS[blunt]}$2`));
}

try {
  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: 860, height: 1100 },
  });

  const record = {
    session,
    capturedAt: new Date().toISOString(),
    page: "lessons/04-the-menu/index.html (driven as the student, in Chromium)",
    blunted: blunt ? { tool: blunt, description: BLUNTS[blunt] } : null,
    rounds: [],
    concordCalls: [],
    finalAnswer: null,
  };
  page.on("response", async (res) => {
    try {
      if (res.url().endsWith("/api/chat")) {
        record.rounds.push({
          request: JSON.parse(res.request().postData()),
          status: res.status(),
          response: await res.json(),
        });
      } else if (res.url().includes("/v1/")) {
        record.concordCalls.push({
          url: res.url(),
          status: res.status(),
          response: await res.json(),
        });
      }
    } catch {
      /* page may have closed mid-flight */
    }
  });

  await page.goto(PAGE, { waitUntil: "load" });
  if (prompt) await page.fill("#prompt", prompt);
  record.promptInBox = await page.inputValue("#prompt");

  await page.click("#ask");
  await page.waitForSelector(".reply, .message", { timeout: 600000 });
  await page.waitForTimeout(300);

  record.finalAnswer = (
    await page.locator(".reply, .message").first().textContent()
  )?.trim();
  record.wirePanelText = (
    await page.locator("#wireLines").textContent()
  )?.trim();
  await page.screenshot({ path: join(outDir, "session.png"), fullPage: true });
  await writeFile(
    join(outDir, "session.json"),
    JSON.stringify(record, null, 2),
  );

  const tools = record.rounds.flatMap(
    (r) => r.response?.message?.tool_calls?.map((c) => c.function.name) ?? [],
  );
  console.log(
    `session ${session}${blunt ? ` [blunted: ${blunt}]` : ""}: rounds=${record.rounds.length} tools=[${tools.join(", ") || "NONE"}]`,
  );
  console.log(
    "answer: " +
      (record.finalAnswer ?? "(none)").slice(0, 180).replace(/\n/g, " "),
  );
  await browser.close();
} finally {
  if (blunt) await writeFile(PAGE_FILE, originalPage); // always restore
  server.close();
}
