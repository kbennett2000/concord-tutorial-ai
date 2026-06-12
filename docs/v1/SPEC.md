# concord-tutorial-ai — v1 course specification

Status: **draft, pre-implementation**. Source of truth; amended in the
same PR whenever reality disagrees.

## 1. The promise

> You've seen an AI invent a Bible verse. In five short lessons you'll
> catch it doing that with your own code — and then fix it, yourself, so
> it can't. By the end, the AI on your computer answers Scripture
> questions only from a real Bible it looks up, and you'll open a real
> production project and recognize every part, because you just built
> the small version with your own hands.

One new idea per lesson. Every lesson ends in a banked win. Everything
runs on the student's own computer: no accounts, no API keys, no cloud.

## 2. The one idea

Models answer from compressed memory, and their memory of Scripture is
imperfect — so the fix is not a smarter model, it's a changed job:
**look it up, don't recall it.** The student experiences the failure
(lesson 2), builds the fix (lesson 3), learns to steer it (lesson 4),
and discovers the industry standardized their hand-rolled pattern under
the name MCP (lesson 5). This is the single most transferable practical
AI skill of the moment, taught through the subject this audience already
cares about.

## 3. Prerequisites & environment (decisions, stated)

- **Prerequisite: course 1** (fetch from Concord, render to a page).
  Course 2 recommended, not required — **this course is vanilla
  HTML/JS**; no React anywhere. Widens the door.
- **Concord** running at `localhost:8000` exactly as in course 1, via the
  published image. SETUP.md re-uses course 1's check ritual (healthz in
  the browser), honoring setup-once for returning students while
  carrying the full path for new ones.
- **Ollama** is the one new install: the free program that runs an AI
  model on your own computer. SETUP.md treats it with the same care
  course 1 gave Docker — what it is in one paragraph, install per-OS,
  one `ollama pull` command, and what success looks like.
- **Local preview server** from course 1's SETUP — same ritual, because
  lesson pages must be served from `http://localhost:*` (a) for fetch,
  as in course 1, and (b) because Ollama's browser-access rules key on
  origin (§5 verification).
- **concord-mcp is read, never installed** — on GitHub at the `v1.0.0`
  tag, in lesson 5 only.

## 4. The pinned model (T0 decision, made empirically)

The course names exactly one model in SETUP.md and all lessons, plus one
documented smaller fallback for low-RAM machines. The pin is **made in
T0 by protocol, not by preference**:

**Criteria.** Native tool-calling via Ollama `/api/chat` (emits
`tool_calls`, accepts `role: "tool"` results); fits an 8 GB machine —
operationalized in T0 as **measured `ollama ps` footprint ≤ 5.5 GB**
(8 GB minus ~2.5 GB for the OS and a browser; adjustable only by
measured evidence argued in a PR); open license; available by one
`ollama pull`.

**Candidates evaluated in T0** (the original list — `llama3.1:8b`, "the
current small Qwen instruct line," a ~3B fallback — refreshed against
the June 2026 landscape): `qwen3.5:9b`, `qwen3.5:4b`, `llama3.1:8b`,
`lfm2.5:8b`, and `qwen3.5:2b` as the fallback class.

**The 10-trial protocol.** For each candidate: fresh chat per trial; the
exact lesson-3 system + user setup ("What does John 3:16 say?" with the
single `lookup_verse` tool declared); pass = the model emits a
well-formed `lookup_verse` call and, given the tool result, answers
quoting the supplied text. **Pin requires ≥ 9/10.** Full transcripts of
**every** candidate's run set — winners and losers — are committed under
`docs/model-pin/`; the pin is evidence, not opinion. The fallback model
passes the same protocol with ≥ 7/10 and its score is stated honestly in
SETUP.md.

**The pin, as executed (2026-06-12, evidence in `docs/model-pin/`):**

| Candidate     | Score | Footprint | Verdict                                                                                                    |
| ------------- | ----- | --------- | ---------------------------------------------------------------------------------------------------------- |
| `qwen3.5:4b`  | 10/10 | 3.78 GB   | **PINNED** — perfect score, Apache 2.0, widest headroom                                                    |
| `qwen3.5:2b`  | 10/10 | 2.19 GB   | **FALLBACK** — perfect on this protocol; smaller brain, documented honestly                                |
| `qwen3.5:9b`  | 10/10 | 5.64 GB   | over the 5.5 GB ceiling — great model, wrong course                                                        |
| `lfm2.5:8b`   | 10/10 | 5.25 GB   | under ceiling, but custom license (LFM Open License v1.0) and one-week-old release lose to an equal scorer |
| `llama3.1:8b` | 9/10  | 5.27 GB   | one genuine quote-vs-describe miss; custom community license                                               |

**Hardware honesty.** SETUP.md states plainly what the pinned model
feels like on CPU-only hardware, using only the measured `num_gpu: 0`
numbers from `docs/model-pin/` (no 8 GB machine was available; the
criterion is enforced via the measured footprint ceiling), and routes
low-RAM machines to the fallback. No machine is silently abandoned.

## 5. Technical foundations (T0 verifies; lessons depend)

Verified against installed reality in T0 (Ollama v0.30.7, this repo's
`docs/model-pin/`) — amended where the wire disagreed with memory:

- **Ollama chat shape** _(verified T0)_: `POST /api/chat` with `model`,
  `messages`, `tools`, `stream: false`; tool calls arrive at
  `message.tool_calls[].function.{name, arguments}` with `arguments`
  already a JSON **object** (not a string); tool results return as
  `{"role": "tool", "tool_name": "<the tool's name>", "content": "…"}` —
  the `tool_name` field is required wire shape, found in T0.
  `stream: false` everywhere in v1 — one fewer concept, and
  `fetch().then(r => r.json())` is exactly what course 1 taught.
- **Browser → Ollama CORS** _(verified T0, real browsers)_: works out of
  the box from both `http://localhost:5500` and `http://127.0.0.1:5500`
  origins, in Chromium and Firefox, including the preflighted
  `POST /api/chat`. No `OLLAMA_ORIGINS` step needed; the course
  standardizes on `localhost` everywhere for consistency with course 1.
- **Concord CORS** is known-good from course 1 (default `*`);
  re-confirmed against `v1.2.0` in T0.
- **Thinking models in bare chat** _(found T1, evidence in
  `docs/transcripts/lesson-01/default-think/`)_: the pinned model
  "thinks" by default; in tool-free chat it can spend the entire default
  token budget on `message.thinking` and return **empty**
  `message.content` (5 of 10 real runs, `done_reason: "length"`). Lesson
  pages that hold a bare conversation therefore send `think: false` —
  taught as the second etiquette flag beside `stream: false`. The T0 pin
  protocol (tool turns) is unaffected; if a later lesson changes request
  conditions again, the §4 protocol is re-run under those conditions.
- **Tool lessons also send `think: false`** _(settled T3 by protocol
  re-run — `docs/model-pin/THINK-ADDENDUM.md`)_: pin and fallback both
  scored 10/10 under the lesson-3 shape (`tools` + `stream: false` +
  `think: false`), so every lesson's parcel carries the same two
  etiquette flags and lesson 3 adds exactly one field. This discharges
  DECISION.md's re-run obligation for this shape; the obligation stands
  for future condition changes (T4's multi-tool shape included).
- **Multi-turn (accumulated history) verified** _(T5, the chain's final
  link — `docs/model-pin/MULTITURN-ADDENDUM.md`)_: both course models
  10/10 on the scripted three-turn protocol with a history-recall
  probe; stateful chat ships in lesson 5. Measured context growth
  ~560 → ~1,250 prompt tokens across three turns (headroom remains at
  the 4,096 default) — the lesson's "long chats think longer" row
  quotes it.
- **Error surfaces** _(captured T0, `docs/model-pin/ERROR-SURFACES.md`)_:
  Ollama stopped / Concord down → the page's `fetch` rejects
  (`TypeError: Failed to fetch` and engine equivalents); model not pulled
  → HTTP 404 with body `{"error":"model '<name>' not found"}`, readable
  by page JavaScript. These feed the graceful-offline blocks (§7).
- **Concord's reference-error taxonomy** _(verified live, T2)_ — three
  codes in the `{error: {code, message}}` envelope course 1 taught:
  `no_verses_found` (404; real-looking reference, no verse there),
  `unknown_book` (404), `unparseable_reference` (400). Lesson 2's
  marking language maps one card message to each.

## 6. The five lessons

Common anatomy, inherited from course 1: working files given first
(Reciprocity); one new idea; a banked win; a "when it goes wrong"
section; a graceful-offline guidance block; any model output shown is a
real labeled capture (voice rule 9); every "you should see" written as a
range (voice rule 8).

### Lesson 1 — `01-hello-model` · _Another local server_

**New idea:** a model is just another HTTP service on your machine — the
same `fetch()` you already know, pointed at a different port.
**Build:** a given page with a text box that POSTs to Ollama and prints
the reply. The student talks to an AI running entirely on their own
computer, from a page they control.
**The turn:** ask it for John 3:16, word for word. Then check it against
your course-1 verse fetcher. **Range handling (rule 8):** maybe it's
nearly perfect; maybe it blends translations; maybe it drifts. The
lesson lands on _you had no way to know without checking_ — formalized
next lesson.
**Win:** "an AI runs on my computer and I just talked to it from my own
page."

### Lesson 2 — `02-the-fact-check` · _Catch it making things up_

**New idea:** hallucination — models answer from compressed memory, and
memory blurs. Experienced, not lectured.
**Build:** a given page that asks the model for several verses on a
theme _with exact KJV text_, then renders each claim with the live
Concord lookup — paired within one card, the model's line stacked
directly above Concord's, which is what "beside" means here: long KJV
verses defeat true side-by-side columns at lesson width (T2 finding).
The student marks match / mismatch — or can't-check, often the
strongest catch (the model cited what Scripture's own index can't
locate) — with their own eyes.
**Format drift (T2 finding, evidence in
`docs/transcripts/lesson-02/`):** the model routinely ignores the
requested line format (separator swapped or dropped, counts off,
commentary mid-list), so the page's split is deliberately dumb and a
visible manual path — an editable reference box on every card — is
load-bearing, not a fallback: rule 8 applied to format as well as
content.
**Range handling:** the lesson supplies a harder follow-up prompt for
students whose model aced round one, and the text makes the deeper
point either way: _the only reason you know is that you checked._
**Win:** "I personally caught an AI fabricating Scripture — with code I
understand."

### Lesson 3 — `03-the-one-rule` · _Give it a tool_

**The heart of the course. New idea:** the tool loop. The model never
runs anything — it _writes a request_; your code decides, executes
against Concord, and hands the result back. Model proposes, your code
disposes.
**Build:** a given working loop (~40 readable lines) with one tool —
`lookup_verse`, backed by Concord `/v1/verses/{ref}` — declared with a
name, a description, and parameters, **plus the lesson's namesake: a
one-sentence system rule** ("never quote a verse from memory: always
look it up…"). The rule ships because T3 measured it load-bearing:
without it the model looked up every claim in only **2 of 6** runs
(three never touched the tool); with it, **6 of 6**
(`docs/transcripts/lesson-03/compliance-pre-study/`). The lesson walks
the loop with the course's own diagram
(`docs/diagrams/tool-loop.svg`) of question → tool call → your code →
Concord → answer, and a wire panel that renders the actual `messages`
the loop sends.
**The payoff (scoped claim — T3 measured):** re-run lesson 2's
fact-check through the tooled assistant. What collapses is fabricated
_text_ — every quote arrives over the wire from their own Concord with
a checkable address. Still the model's: which verses it picks, the
commentary around the quotes, and addresses can still blur — but a
blurred address now fails loudly (Concord's error returns as the tool
result — the model's second chance) or fetches a real-but-different
verse, visible on the wire. A model can also still skip the tool
(the rule cuts that from 4-in-6 runs to 0-in-6 in T3's study); the
lesson teaches the tell: a quote with no wire line. T3 field note:
lesson 2's frozen prompt cannot be reused verbatim here — its
"exactly 5 lines and nothing else" scaffolding collided with the rule
and produced refusals 6/6; the re-run relaxes to the bare ask.
**Win:** "the errors stopped because of code I can read."

### Lesson 4 — `04-the-menu` · _Let it choose_

**New idea:** with several tools on the menu, the model chooses by
_reading your words_ — names and descriptions, plain English you wrote,
now steering software.
**Build:** add `search_by_meaning` (Concord `/v1/semantic-search`) and
`places_for_passage` (`/v1/verses/{ref}/places`) to the loop. The
semantic tool passes `translation=KJV` explicitly: _the matching
happens in one translation's meaning-space; the text comes back in
yours_ — the same explicit-send the production server makes (verified
against Concord v1.2.0's API.md, T4). Places results carry coordinates
or an honest "location unknown" — never an invented 0,0. Ask mixed
questions and watch routing (T4 measured the pin at **10/10** on the
frozen routing set; the fallback at 9/10 — DECISION.md's wager note).
Then the lab: deliberately blunt one description (the lesson names the
exact edit), observe, restore.
**Range handling (T4 measured — the lab teaches the true finding):**
this model shrugged the blunting off — 18/18 blunted runs still routed
correctly, and even the fallback went 6/6 on first pick — because **the
name is a description too**: three tools with honest names route on
names alone. The lesson lands the deeper moral: production menus are
bigger, names vaguer, models weaker, stakes higher — which is why
production treats names _and_ descriptions as reviewed product copy.
If a student's run does misroute, the text meets them (odds, not law).
The honesty beat ships: Genesis 4:16 crosses Eden _and_ Nod as
`location unknown` on the student's own wire — and T4's capture shows
the model's _commentary_ still embellishing around the honest data,
lesson 3's scoped claim holding.
**Win:** "I changed a sentence and watched what an AI did about it — on
purpose, with receipts."

### Lesson 5 — `05-the-real-thing` · _It has a name_

**New idea:** the loop they hand-rolled is a standardized pattern — MCP
— and a production implementation exists for the exact tools they
built.
**Build:** first, a light polish pass turning lessons 3–4 into a small
**stateful** chat page they'd show someone — the T5 multi-turn protocol
measured both course models at 10/10 on a scripted three-turn
conversation with a history-recall probe
(`docs/model-pin/MULTITURN-ADDENDUM.md`, the changed-shape chain's
final link; the addendum also records an instrument repair: the first
probe wording was ambiguous English and both run sets are committed).
The chat bubbles and the wire panel render the same live `messages`
array — the single-source ruling's finale. Personalization is one
heading edit; the T5 cut list (no timestamps, avatars, persistence, or
markdown rendering) is recorded so later slices don't re-grow it.
Then the reveal, staged as **recognition, not surprise** (the name has
been on the front door since the README), mirroring course 2's
songbird ending: open `concord-mcp` on GitHub **at the `v1.0.0` tag**
and walk six stops, every quoted line verified verbatim at the tag
(local-only verifier; output committed) — their one rule ↔ the
`INSTRUCTIONS` constant in `src/concord_mcp/server.py` (which carries
lesson 4's honesty beat as law); their declarations ↔ the description
constants under the "product copy… never a drive-by edit" docstring,
plus `search_keyword`, the tool they never built; their fetch ↔
`src/concord_mcp/backends/http.py` (the same explicit `translation`
send, with its why in a comment); their error handling ↔
`render_error`, "errors the model can self-correct from"; their places
formatter ↔ `render_places`, which prints their own line word for word
(designed kinship, owned in one sentence); and **the seam** — the T3
diagram returns with one dotted line (`docs/diagrams/tool-loop-seam.svg`)
showing where MCP standardizes the cut: their loop is what an MCP
client runs; the right half is what concord-mcp is. A one-paragraph
Python Rosetta (def/decorator/f-string/indentation) sits immediately
before the first stop. Close on the banner: _looked up, never made up —
you just built why._ Optional outbound pointer for the curious:
concord-mcp's README shows the no-code path to running the real thing.
**Win — the identity move:** "I can read a production AI project,
because I built the small version myself."

## 7. Graceful offline (testable pedagogy)

Every lesson page detects its dead backends and renders friendly,
specific guidance — "Ollama isn't running; here's the 30-second check"
/ "Concord isn't answering; here's course 1's ritual" — never a blank
page or a raw console error. This is voice rule 1 applied to failure,
and it is **CI's job to prove it**: the Playwright smoke loads every
lesson page with no backends present and asserts the guidance renders.
(CI never runs Ollama or Concord; the live paths are the per-lesson
human gate.)

## 8. Tone & honesty constraints

- The model is a co-star, not a villain: lesson 2's framing is _memory
  blurs_, not _the machine lies to you_ — the fix is the star.
- Forbidden register, same as concord-mcp's front door: "never wrong,"
  "always accurate," or any claim covering the assistant's _words_
  rather than its _quotes_. Lesson 3's claim is precise: the quotes are
  real; the commentary is still an AI talking.
- No dark patterns of wonder: when something works, the course explains
  _why_ it worked, in the student's own vocabulary, within the same
  lesson (rule 5's timing).

## 9. Slice plan

One PR per slice; every lesson slice opens draft and stays draft until
Bobby has performed the lesson live (Ollama + Concord running) as the
student.

| #     | Branch                 | Scope                                                                                                                                                                                                                                                                                                       | Gate                                                                          |
| ----- | ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| T0    | `feat/front-door`      | README (promise, reader, ladder placement), SETUP.md (Ollama, the pinned model, hardware honesty + fallback, Concord ritual, preview server), the §4 model-pin protocol executed with transcripts in `docs/model-pin/`, §5 verifications recorded, CI skeleton (graceful-offline Playwright smoke).         | Bobby reproduces SETUP.md from scratch on the G434; pin transcripts reviewed. |
| T1–T5 | `feat/lesson-0N`       | One lesson each per §6: lesson page(s) + given working files + offline blocks + real captured transcripts.                                                                                                                                                                                                  | Bobby performs the lesson start to finish; CI green.                          |
| T6    | `feat/freebies`        | `recipes.md` (copy-paste patterns: add a tool, swap the model, harden an error message) and `ideas.md` (what to build next — a memory trainer, a study-group page), in the family tradition.                                                                                                                | Read-through.                                                                 |
| T7    | `feat/branding-polish` | Banner (family sibling; tagline proposed in-slice for ruling), README final pass, cross-link sweep — plus prepared upstream prompts for Bobby: concord README's course list gains the third course; concord-tutorial-react's ending links onward; concord-mcp's README gains "want to build this yourself?" | Banner on light+dark; upstream prompts reviewed.                              |

## 10. Deferred (post-v1)

The cloud-model appendix (Claude/OpenAI APIs — key handling deserves
adult supervision and its own moment); streaming responses in the
lesson-5 chat page; an automated transcript-refresh harness; translating
the course's Concord queries to non-English translations.
