// Lesson-2 session capture (voice rule 9: real runs only, never doctored).
// Drives the ACTUAL fact-check page in Chromium as the student would: sends
// the prompt in the box, then fires every card's "Check with Concord" button,
// recording the raw /api/chat JSON, every Concord response, and screenshots.
// Dev tooling — never in CI.
//
// Usage:
//   node capture-lesson-02.mjs --session pin-1
//   node capture-lesson-02.mjs --session followup-1 --theme "comfort in hard times"

import http from "node:http";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join, extname } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "../smoke/node_modules/playwright/index.mjs";

const ROOT = join(fileURLToPath(import.meta.url), "..", "..", "..");
const PORT = 5500;
const PAGE = `http://localhost:${PORT}/lessons/02-the-fact-check/index.html`;
const OUT = join(ROOT, "docs", "transcripts", "lesson-02");

function arg(name, fallback) {
  const i = process.argv.indexOf(`--${name}`);
  return i > -1 ? process.argv[i + 1] : fallback;
}
const session = arg("session");
const theme = arg("theme", null); // null = leave the frozen prompt untouched
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
const outDir = join(OUT, session);
await mkdir(outDir, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 860, height: 1100 } });
await page.goto(PAGE, { waitUntil: "load" });

// Optional theme swap — exactly what the lesson tells the student to do:
// edit the one word in the prompt box.
if (theme) {
  const current = await page.inputValue("#prompt");
  await page.fill("#prompt", current.replace("forgiveness", theme));
}

const record = {
  session,
  capturedAt: new Date().toISOString(),
  page: "lessons/02-the-fact-check/index.html (driven as the student, in Chromium)",
  promptInBox: await page.inputValue("#prompt"),
  chat: null,
  checks: [],
};

const chatResponse = page.waitForResponse("**/api/chat", { timeout: 300000 });
await page.click("#ask");
const chat = await chatResponse;
record.chat = {
  request: JSON.parse(chat.request().postData()),
  status: chat.status(),
  response: await chat.json(),
};
await page.waitForSelector(".card, .message", { timeout: 10000 });
await page.screenshot({ path: join(outDir, "after-ask.png"), fullPage: true });

// Fire every card's Check button, top to bottom, recording each Concord call.
const cards = page.locator(".card");
const cardCount = await cards.count();
for (let i = 0; i < cardCount; i++) {
  const card = cards.nth(i);
  let ref = await card.locator("input").inputValue();
  let manualPath = false;
  if (!ref.trim()) {
    // The student's documented manual path, performed by the driver: read the
    // reference off the front of the model's own line and type it in the box.
    const claim = await card.locator(".claim div:not(.label)").textContent();
    const m = claim.match(/[123]?\s?[A-Z][a-z]+\s+\d+:\d+(-\d+)?/);
    if (!m) {
      record.checks.push({
        card: i + 1,
        ref: "",
        skipped: "no reference found in line either",
      });
      continue;
    }
    ref = m[0];
    await card.locator("input").fill(ref);
    manualPath = true;
  }
  const concordResponse = page.waitForResponse("**/v1/verses/**", {
    timeout: 30000,
  });
  await card.locator("button", { hasText: "Check with Concord" }).click();
  const res = await concordResponse;
  record.checks.push({
    card: i + 1,
    ref,
    manualPath,
    url: res.url(),
    status: res.status(),
    response: await res.json(),
  });
}
await page.screenshot({
  path: join(outDir, "after-checks.png"),
  fullPage: true,
});

// --detective: the lesson's fix-the-address move, performed on the first card
// whose check came back as a Concord error — clean the reference (strip any
// "(decoration)", restore a missing leading book number if the line shows
// one) and check again, recording both rounds.
if (process.argv.includes("--detective")) {
  const failed = record.checks.find((c) => c.status && c.status >= 400);
  if (!failed) {
    console.log("detective: no failed check this session");
  } else {
    const card = cards.nth(failed.card - 1);
    let cleaned = failed.ref
      .replace(/\s*\([^)]*\)\s*/g, " ")
      .replace(/[–—]/g, "-")
      .trim();
    // If verse text rode along after the address, keep just the address.
    const lead = cleaned.match(
      /^[123]?\s?[A-Za-z]+(?: [A-Za-z]+)?\s+\d+:\d+(?:-\d+)?/,
    );
    if (lead) cleaned = lead[0];
    await card.locator("input").fill(cleaned);
    const concordResponse = page.waitForResponse("**/v1/verses/**", {
      timeout: 30000,
    });
    await card.locator("button", { hasText: "Check with Concord" }).click();
    const res = await concordResponse;
    record.detective = {
      card: failed.card,
      before: {
        ref: failed.ref,
        status: failed.status,
        response: failed.response,
      },
      after: { ref: cleaned, status: res.status(), response: await res.json() },
    };
    await card.screenshot({ path: join(outDir, "detective-recheck.png") });
    console.log(
      `detective: card ${failed.card} "${failed.ref}" → "${cleaned}" [HTTP ${res.status()}]`,
    );
  }
}

await writeFile(join(outDir, "session.json"), JSON.stringify(record, null, 2));
console.log(
  `session ${session}: ${cardCount} cards, ${record.checks.length} checks → ${outDir}`,
);
for (const c of record.checks) {
  const verdict = c.skipped ? c.skipped : `HTTP ${c.status}`;
  console.log(`  card ${c.card}: ${c.ref || "(empty)"} [${verdict}]`);
}
console.log("model reply:\n" + record.chat.response.message.content);

await browser.close();
server.close();
