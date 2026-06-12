# Model-pin protocol (SPEC §4, executed at T0)

Every candidate model runs **10 trials**. Each trial is a fresh
conversation (no carryover), default Ollama options, `stream: false` —
exactly what the lesson code will do. The runner
([`tools/model-pin/run-trials.mjs`](../../tools/model-pin/run-trials.mjs),
zero dependencies) automates the HTTP calls and captures every raw
request and response verbatim; it never edits, trims, or fabricates model
output. Pass/fail per trial is mechanically flagged by the runner and
then human-reviewed; the reviewed verdict with a one-line reason lives in
each candidate's `summary.md`.

## Turn 1 — the question, with one tool on the table

`POST http://localhost:11434/api/chat` with `stream: false` and:

**System message (frozen — the lesson-3 text):**

> You answer questions about the Bible. When the user asks what a verse
> says, use the lookup_verse tool to get its exact text, then answer
> quoting only the text the tool returned.

**User message (frozen):**

> What does John 3:16 say?

**Tools (frozen, the single declaration):**

```json
[
  {
    "type": "function",
    "function": {
      "name": "lookup_verse",
      "description": "Look up the exact text of a Bible verse by reference, e.g. \"John 3:16\".",
      "parameters": {
        "type": "object",
        "required": ["ref"],
        "properties": {
          "ref": {
            "type": "string",
            "description": "The verse reference, like \"John 3:16\""
          }
        }
      }
    }
  }
]
```

**Pass gate 1.** The reply's `message.tool_calls` contains exactly one
call; `function.name === "lookup_verse"`; `function.arguments.ref`
normalizes to John 3:16; `message.content` carries no reasoning artifacts
or invented verse text.

## Turn 2 — the tool result, then the answer

The trial appends the model's assistant message verbatim, then:

```json
{
  "role": "tool",
  "tool_name": "lookup_verse",
  "content": "For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life."
}
```

That content is the live KJV text of John 3:16 as returned by Concord
`v1.2.0` at `GET /v1/verses/John%203:16?translations=KJV` on this
machine, 2026-06-12 — the runner re-fetches it from the running Concord
at startup and aborts if it differs, so the wire never lies.

**Pass gate 2.** The final reply quotes the supplied text — it contains a
verbatim contiguous span of the KJV verse (mechanical flags check the
spans "his only begotten Son" and "should not perish, but have
everlasting life", whitespace-normalized) and contains no contradicting
verse text. Human review confirms.

## Disqualifiers and criteria beyond the score

- **Footprint ceiling (binding ruling):** measured memory while loaded —
  `GET /api/ps`, recorded every trial — must be **≤ 5.5 GB** (an 8 GB
  machine minus ~2.5 GB for the OS and a browser). Over the ceiling =
  disqualified regardless of score.
- Reasoning artifacts leaking into `message.content` at default settings
  fail the trial (lesson 1 prints `content` raw).
- Pin requires **≥ 9/10**; the documented fallback requires **≥ 7/10**
  with its weaker score stated honestly in SETUP.md.

## The CPU-forced feel run

After scoring, one passing trial per shortlisted model is re-run with
`options: {"num_gpu": 0}` — the model fully on CPU — and its measured
generation speed (Ollama's own `eval_count / eval_duration`) is the only
number SETUP.md's hardware-honesty paragraph is allowed to use. This
machine's CPU is an Intel i7-9700KF (8 cores, 2019); the paragraph names
it so nobody mistakes the measurement for a promise.
