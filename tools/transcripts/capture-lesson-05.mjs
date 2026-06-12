// Lesson-5 multi-turn capture (voice rule 9: real runs only, never doctored).
// Drives the ACTUAL chat page in Chromium, sending a scripted sequence of
// messages into the SAME session — the conversation accumulates, exactly as
// the student's would. Records every /api/chat round (incl. prompt_eval_count
// for the context-growth question), every Concord call, per-turn screenshots.
// Dev tooling — never in CI.
//
// Usage:
//   node capture-lesson-05.mjs --session protocol-01 \
//     --turns "What does Acts 9:3 say?||Find me more verses about sudden light from heaven.||Which places does that first passage name?"

import http from "node:http";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join, extname } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "../smoke/node_modules/playwright/index.mjs";

const ROOT = join(fileURLToPath(import.meta.url), "..", "..", "..");
const PORT = 5500;
const PAGE = `http://localhost:${PORT}/lessons/05-the-real-thing/index.html`;
const OUT = join(ROOT, "docs", "transcripts", "lesson-05");

function arg(name, fallback) {
  const i = process.argv.indexOf(`--${name}`);
  return i > -1 ? process.argv[i + 1] : fallback;
}
const session = arg("session");
const turns = (arg("turns") ?? "").split("||").filter(Boolean);
const outRoot = arg("outdir", OUT);
if (!session || turns.length === 0) {
  console.error("--session and --turns are required");
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
const page = await browser.newPage({ viewport: { width: 860, height: 1300 } });

const record = {
  session,
  capturedAt: new Date().toISOString(),
  page: "lessons/05-the-real-thing/index.html (one continuous session, driven in Chromium)",
  turns: [],
  concordCalls: [],
};
let currentTurn = null;
page.on("response", async (res) => {
  try {
    if (res.url().endsWith("/api/chat")) {
      const body = await res.json();
      currentTurn?.rounds.push({
        request: JSON.parse(res.request().postData()),
        status: res.status(),
        response: body,
        promptEvalCount: body.prompt_eval_count ?? null,
        evalCount: body.eval_count ?? null,
      });
    } else if (res.url().includes("/v1/")) {
      record.concordCalls.push({
        turn: currentTurn?.n ?? null,
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

for (let t = 0; t < turns.length; t++) {
  currentTurn = { n: t + 1, message: turns[t], rounds: [] };
  record.turns.push(currentTurn);
  await page.fill("#prompt", turns[t]);
  await page.click("#ask");
  // the turn has started when the busy note shows…
  await page.waitForFunction(
    () => !document.getElementById("busy").hidden,
    null,
    { timeout: 15000 },
  );
  // …and finished when it clears again.
  await page.waitForFunction(
    () => document.getElementById("busy").hidden,
    null,
    { timeout: 600000 },
  );
  await page.waitForTimeout(300);
  await page.screenshot({
    path: join(outDir, `turn-${t + 1}.png`),
    fullPage: true,
  });
}

record.finalChatText = (await page.locator("#chat").textContent())?.trim();
record.wirePanelText = (await page.locator("#wireLines").textContent())?.trim();
await writeFile(join(outDir, "session.json"), JSON.stringify(record, null, 2));

for (const turn of record.turns) {
  const tools = turn.rounds.flatMap(
    (r) =>
      r.response?.message?.tool_calls?.map(
        (c) => `${c.function.name}(${JSON.stringify(c.function.arguments)})`,
      ) ?? [],
  );
  const evals = turn.rounds.map((r) => r.promptEvalCount).join(",");
  console.log(
    `turn ${turn.n}: tools=[${tools.join("; ") || "NONE"}] prompt_eval=[${evals}]`,
  );
}
console.log(`session ${session} → ${outDir}`);

await browser.close();
server.close();
