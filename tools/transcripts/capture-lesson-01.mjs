// Lesson-1 transcript capture (voice rule 9: real runs only, never doctored).
// Drives the ACTUAL lesson page in a real browser, records the raw /api/chat
// request + response verbatim, and screenshots the real render.
// Dev tooling — never run in CI. Zero deps beyond the repo's local Playwright.
//
// Usage:
//   node capture-lesson-01.mjs --label hello --prompt "Say hello in one short sentence." --runs 1
//   node capture-lesson-01.mjs --label turn --prompt "Give me John 3:16, word for word, in the King James Version." --runs 10
//   (add --shot images/first-reply.png to also save a screenshot of run 1)

import http from "node:http";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join, extname } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "../smoke/node_modules/playwright/index.mjs";

const ROOT = join(fileURLToPath(import.meta.url), "..", "..", "..");
const PORT = 5500;
const PAGE = `http://localhost:${PORT}/lessons/01-hello-model/index.html`;
const OUT = join(ROOT, "docs", "transcripts", "lesson-01");

function arg(name, fallback) {
  const i = process.argv.indexOf(`--${name}`);
  return i > -1 ? process.argv[i + 1] : fallback;
}
const label = arg("label");
const prompt = arg("prompt");
const runs = Number(arg("runs", "1"));
const shot = arg("shot", null);
const shotAll = process.argv.includes("--shot-all");
if (!label || !prompt) {
  console.error("--label and --prompt are required");
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
await mkdir(OUT, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 860, height: 720 } });

for (let run = 1; run <= runs; run++) {
  await page.goto(PAGE, { waitUntil: "load" });
  await page.fill("#prompt", prompt);

  const responsePromise = page.waitForResponse("**/api/chat", {
    timeout: 180000,
  });
  await page.click("#send");
  const response = await responsePromise;
  const request = response.request();
  const record = {
    label,
    run,
    capturedAt: new Date().toISOString(),
    page: "lessons/01-hello-model/index.html (driven as the student, in Chromium)",
    request: JSON.parse(request.postData()),
    status: response.status(),
    response: await response.json(),
  };
  // wait for the render to settle (reply or message visible)
  await page.waitForSelector(".reply, .message", { timeout: 10000 });

  const nn = String(run).padStart(2, "0");
  const file = join(OUT, `${label}-${nn}.json`);
  await writeFile(file, JSON.stringify(record, null, 2));
  console.log(`${label} run ${nn}: HTTP ${record.status} → ${file}`);
  console.log(
    `  reply: ${(record.response?.message?.content ?? "(none)").slice(0, 160).replace(/\n/g, " ")}`,
  );

  if (shot && run === 1) {
    await page.screenshot({
      path: join(ROOT, "lessons", "01-hello-model", shot),
      fullPage: true,
    });
    console.log(`  screenshot → lessons/01-hello-model/${shot}`);
  }
  if (shotAll) {
    const shotFile = join(OUT, "shots", `${label}-${nn}.png`);
    await mkdir(join(OUT, "shots"), { recursive: true });
    await page.screenshot({ path: shotFile, fullPage: true });
    console.log(`  screenshot → ${shotFile}`);
  }
}

await browser.close();
server.close();
