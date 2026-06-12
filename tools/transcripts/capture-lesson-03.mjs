// Lesson-3 session capture (voice rule 9: real runs only, never doctored).
// Drives the ACTUAL loop page in Chromium: types a question, clicks Ask, and
// records EVERY /api/chat round and every Concord call the loop makes, plus
// wire-panel screenshots and the final answer. Dev tooling — never in CI.
//
// Usage:
//   node capture-lesson-03.mjs --session pin-rerun-1 --lesson2
//   node capture-lesson-03.mjs --session simple-1
//   node capture-lesson-03.mjs --session provoke-1 --prompt "What does John 3:99 say?"

import http from "node:http";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join, extname } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "../smoke/node_modules/playwright/index.mjs";

const ROOT = join(fileURLToPath(import.meta.url), "..", "..", "..");
const PORT = 5500;
const PAGE = `http://localhost:${PORT}/lessons/03-the-one-rule/index.html`;
const OUT = join(ROOT, "docs", "transcripts", "lesson-03");

function arg(name, fallback) {
  const i = process.argv.indexOf(`--${name}`);
  return i > -1 ? process.argv[i + 1] : fallback;
}
const session = arg("session");
const prompt = arg("prompt", null);
const useLesson2 = process.argv.includes("--lesson2");
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

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 860, height: 1100 } });

const record = {
  session,
  capturedAt: new Date().toISOString(),
  page: "lessons/03-the-one-rule/index.html (driven as the student, in Chromium)",
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
    } else if (res.url().includes("/v1/verses/")) {
      record.concordCalls.push({
        url: res.url(),
        status: res.status(),
        response: await res.json(),
      });
    }
  } catch {
    /* page may have closed mid-flight; the session JSON keeps what landed */
  }
});

await page.goto(PAGE, { waitUntil: "load" });
if (useLesson2) {
  await page.click("#useLesson2");
} else if (prompt) {
  await page.fill("#prompt", prompt);
}
record.promptInBox = await page.inputValue("#prompt");

await page.click("#ask");
await page.waitForSelector(".reply, .message", { timeout: 600000 });
await page.waitForTimeout(300);

record.finalAnswer = (
  await page.locator(".reply, .message").first().textContent()
)?.trim();
record.wirePanelText = (await page.locator("#wireLines").textContent())?.trim();
await page.screenshot({ path: join(outDir, "session.png"), fullPage: true });
await writeFile(join(outDir, "session.json"), JSON.stringify(record, null, 2));

console.log(
  `session ${session}: ${record.rounds.length} chat round(s), ${record.concordCalls.length} Concord call(s)`,
);
for (const [i, r] of record.rounds.entries()) {
  const calls = r.response?.message?.tool_calls;
  console.log(
    `  round ${i + 1}: ${calls ? calls.map((c) => `${c.function.name}(${JSON.stringify(c.function.arguments)})`).join(", ") : "final answer"}`,
  );
}
console.log(
  "answer: " +
    (record.finalAnswer ?? "(none)").slice(0, 220).replace(/\n/g, " "),
);

await browser.close();
server.close();
