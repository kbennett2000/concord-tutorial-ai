// Lesson-2 pre-study (design evidence, voice rule 9: raw, untrimmed).
// 3 candidate themes × 2 runs × N=5 claims, raw /api/chat JSON saved per run.
// API-level on purpose — this measured the MODEL's behavior to choose the
// frozen theme before the page existed; the lesson's shown sessions are
// captured separately, through the real page. Dev tooling — never in CI.

import { mkdir, writeFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const OUT = join(
  dirname(fileURLToPath(import.meta.url)),
  "..",
  "..",
  "docs",
  "transcripts",
  "lesson-02",
  "pre-study",
);
const PROMPT = (theme) =>
  `List exactly 5 Bible verses about ${theme}. Reply with exactly 5 lines and nothing else. ` +
  `Each line must look like this: Reference | the exact verse text, word for word, in the King James Version`;

await mkdir(OUT, { recursive: true });
for (const theme of ["comfort in hard times", "money", "forgiveness"]) {
  for (const run of [1, 2]) {
    const request = {
      model: "qwen3.5:4b",
      messages: [{ role: "user", content: PROMPT(theme) }],
      stream: false,
      think: false,
    };
    const res = await fetch("http://localhost:11434/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    });
    const record = {
      study: "lesson-02 theme pre-study",
      theme,
      run,
      capturedAt: new Date().toISOString(),
      request,
      status: res.status,
      response: await res.json(),
    };
    const slug = theme.replace(/\s+/g, "-");
    await writeFile(
      join(OUT, `${slug}-run${run}.json`),
      JSON.stringify(record, null, 2),
    );
    console.log(`${slug} run ${run}: saved`);
  }
}
