// Lesson-5 quote verifier (rule 9, extended to code): every line the walk
// quotes from concord-mcp must exist, verbatim, at the v1.0.0 tag.
// LOCAL-ONLY tooling — never wired into CI (CI is hermetic by law). Run at
// implementation and again before the gate; the pass output is committed
// beside the transcripts as the audit trail.
//
//   node tools/transcripts/verify-quotes-lesson-05.mjs

const TAG = "v1.0.0";
const RAW = `https://raw.githubusercontent.com/kbennett2000/concord-mcp/${TAG}`;

// Matching is whitespace-, quote-mark-, and comment-marker-insensitive,
// because Python wraps long strings across concatenated source lines and
// long comments across `#` continuations. The words themselves are not
// forgiven anything.
const normalize = (s) => s.replace(/[\s"'#]+/g, "");

const QUOTES = [
  {
    file: "/src/concord_mcp/server.py",
    why: "stop 2 — the lab's moral as the file's opening law",
    text: "Tool descriptions are product copy for the model (ADR 0003). Editing one is a reviewed change with rationale, never a drive-by edit.",
  },
  {
    file: "/src/concord_mcp/server.py",
    why: "stop 1 — the honesty beat inside the production rule",
    text: "Place statuses and journey attributions are honest: 'unknown' means no one knows, never guess coordinates.",
  },
  {
    file: "/src/concord_mcp/server.py",
    why: "stop 1 — the production rule routes a ten-tool menu",
    text: "Routing: lookup_verse when you have a reference; search_keyword for exact wording; search_by_meaning for ideas and themes;",
  },
  {
    file: "/src/concord_mcp/server.py",
    why: "stop 2 — the description constant the student's declaration grew into",
    text: "If you don't have a reference, use search_keyword for exact wording or search_by_meaning for ideas and themes.",
  },
  {
    file: "/src/concord_mcp/backends/http.py",
    why: "stop 3 — the explicit translation send, with its why",
    text: "Sent explicitly even when the caller omits it: the endpoint's own default is WEB, not our configured default",
  },
  {
    file: "/src/concord_mcp/backends/http.py",
    why: "stop 3 — the polite single retry",
    text: "One polite retry (SPEC §8) — never more.",
  },
  {
    file: "/src/concord_mcp/server.py",
    why: "stop 4 — errors the model can self-correct from",
    text: "SPEC §8: errors the model can self-correct from",
  },
  {
    file: "/src/concord_mcp/server.py",
    why: "stop 4 — the error that asks the student's own question",
    text: "Concord isn't reachable at {exc.url}. Is it running?",
  },
  {
    file: "/src/concord_mcp/render.py",
    why: "stop 5 — the line the student's page prints word for word",
    text: "No places are named in {reference}.",
  },
];

let failures = 0;
const cache = new Map();
for (const q of QUOTES) {
  if (!cache.has(q.file)) {
    const res = await fetch(RAW + q.file);
    if (!res.ok) {
      console.error(`FAIL fetch ${q.file}: HTTP ${res.status}`);
      failures++;
      cache.set(q.file, "");
      continue;
    }
    cache.set(q.file, normalize(await res.text()));
  }
  const ok = cache.get(q.file).includes(normalize(q.text));
  console.log(`${ok ? "match" : "MISSING"} | ${q.file} | ${q.why}`);
  if (!ok) failures++;
}
console.log(
  failures
    ? `\n${failures} quote(s) NOT found at ${TAG} — the walk may not ship these.`
    : `\nall ${QUOTES.length} quotes verified verbatim at ${TAG}.`,
);
process.exit(failures ? 1 : 0);
