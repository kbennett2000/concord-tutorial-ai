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
`tool_calls`, accepts `role: "tool"` results); runs on an 8 GB machine
at default quantization; open license; available by one `ollama pull`.

**Candidates to evaluate** (verify the current landscape at T0; this
list is a starting point, not the answer): `llama3.1:8b` (the
long-proven tool-calling baseline), the current small Qwen instruct
line, and one ~3B-class fallback candidate.

**The 10-trial protocol.** For each candidate: fresh chat per trial; the
exact lesson-3 system + user setup ("What does John 3:16 say?" with the
single `lookup_verse` tool declared); pass = the model emits a
well-formed `lookup_verse` call and, given the tool result, answers
quoting the supplied text. **Pin requires ≥ 9/10.** The full transcript
of the winning run set is committed under `docs/model-pin/` — the pin is
evidence, not opinion. The fallback model passes the same protocol with
≥ 7/10 and its weaker score is stated honestly in SETUP.md ("works, but
you'll see it fumble sometimes — that's the smaller brain trading
reliability for fitting in your RAM").

**Hardware honesty.** SETUP.md states plainly what an 8B model feels
like on CPU-only hardware (it works; it types slowly) and routes low-RAM
machines to the fallback. No machine is silently abandoned.

## 5. Technical foundations (T0 verifies; lessons depend)

To be verified against installed reality in T0 and recorded in the T0
PR — never assumed from memory:

- **Ollama chat shape**: `POST /api/chat` with `model`, `messages`,
  `tools`, `stream: false`; tool calls arrive at
  `message.tool_calls[].function.{name, arguments}`; tool results return
  as `role: "tool"` messages. `stream: false` everywhere in v1 — one
  fewer concept, and `fetch().then(r => r.json())` is exactly what
  course 1 taught.
- **Browser → Ollama CORS** from the course's localhost preview origin:
  verify it works out of the box; if any OS/config needs an
  `OLLAMA_ORIGINS` step, SETUP.md carries it per-OS with the course's
  usual gentleness.
- **Concord CORS** is known-good from course 1 (default `*`).
- **Error surfaces**: what the page sees when Ollama is stopped, the
  model isn't pulled, or Concord is down — feeding the graceful-offline
  blocks (§7).

## 6. The five lessons

Common anatomy, inherited from course 1: working files given first
(Reciprocity); one new idea; a banked win; a "when it goes wrong"
section; a graceful-offline guidance block; any model output shown is a
real labeled capture (voice rule 9); every "you should see" written as a
range (voice rule 8).

### Lesson 1 — `01-hello-model` · *Another local server*

**New idea:** a model is just another HTTP service on your machine — the
same `fetch()` you already know, pointed at a different port.
**Build:** a given page with a text box that POSTs to Ollama and prints
the reply. The student talks to an AI running entirely on their own
computer, from a page they control.
**The turn:** ask it for John 3:16, word for word. Then check it against
your course-1 verse fetcher. **Range handling (rule 8):** maybe it's
nearly perfect; maybe it blends translations; maybe it drifts. The
lesson lands on *you had no way to know without checking* — formalized
next lesson.
**Win:** "an AI runs on my computer and I just talked to it from my own
page."

### Lesson 2 — `02-the-fact-check` · *Catch it making things up*

**New idea:** hallucination — models answer from compressed memory, and
memory blurs. Experienced, not lectured.
**Build:** a given page that asks the model for several verses on a
theme *with exact KJV text*, then renders each claim beside the live
Concord lookup (the student's course-1 skill, now a fact-checking
machine). The student marks match / mismatch with their own eyes.
**Range handling:** the lesson supplies a harder follow-up prompt for
students whose model aced round one, and the text makes the deeper
point either way: *the only reason you know is that you checked.*
**Win:** "I personally caught an AI fabricating Scripture — with code I
understand."

### Lesson 3 — `03-the-one-rule` · *Give it a tool*

**The heart of the course. New idea:** the tool loop. The model never
runs anything — it *writes a request*; your code decides, executes
against Concord, and hands the result back. Model proposes, your code
disposes.
**Build:** a given working loop (~40 readable lines) with one tool —
`lookup_verse`, backed by Concord `/v1/verses/{ref}` — declared with a
name, a description, and parameters. The lesson walks the loop with the
course's own diagram of question → tool call → your code → Concord →
answer.
**The payoff:** re-run lesson 2's fact-check through the tooled
assistant. Errors collapse to zero — *and the student can say exactly
why*: every quote now arrives over the wire from their own Concord.
**Win:** "the errors stopped because of code I can read."

### Lesson 4 — `04-the-menu` · *Let it choose*

**New idea:** with several tools on the menu, the model chooses by
*reading your descriptions* — plain English you wrote is now steering
software.
**Build:** add `search_by_meaning` (Concord `/v1/semantic-search`) and
`places_for_passage` (`/v1/verses/{ref}/places`) to the loop. Ask mixed
questions and watch routing. Then the lab: deliberately blunt one
description (the lesson names the exact edit), watch the model misroute
or flounder, restore it, watch competence return.
**Range handling:** misrouting under a blunted description varies by
run; the lesson frames it as *tilting odds*, and the restoration as why
production projects treat descriptions as reviewed product copy.
**Win:** "I changed a sentence and changed how an AI behaves — on
purpose."

### Lesson 5 — `05-the-real-thing` · *It has a name*

**New idea:** the loop they hand-rolled is a standardized pattern — MCP
— and a production implementation exists for the exact tools they
built.
**Build:** first, a light polish pass turning lessons 3–4 into a small
chat page they'd show someone. Then the reveal, mirroring course 2's
songbird ending: open `concord-mcp` on GitHub **at the `v1.0.0` tag**
and walk the map — your tool descriptions ↔ `server.py`'s reviewed
copy; your fetch to Concord ↔ `backends/http.py`; your error messages ↔
the rendering that lets a model self-correct; your loop ↔ what the MCP
standard runs for you. Close on the banner: *looked up, never made up —
you just built why.* Optional outbound pointer for the curious:
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

- The model is a co-star, not a villain: lesson 2's framing is *memory
  blurs*, not *the machine lies to you* — the fix is the star.
- Forbidden register, same as concord-mcp's front door: "never wrong,"
  "always accurate," or any claim covering the assistant's *words*
  rather than its *quotes*. Lesson 3's claim is precise: the quotes are
  real; the commentary is still an AI talking.
- No dark patterns of wonder: when something works, the course explains
  *why* it worked, in the student's own vocabulary, within the same
  lesson (rule 5's timing).

## 9. Slice plan

One PR per slice; every lesson slice opens draft and stays draft until
Bobby has performed the lesson live (Ollama + Concord running) as the
student.

| # | Branch | Scope | Gate |
|---|---|---|---|
| T0 | `feat/front-door` | README (promise, reader, ladder placement), SETUP.md (Ollama, the pinned model, hardware honesty + fallback, Concord ritual, preview server), the §4 model-pin protocol executed with transcripts in `docs/model-pin/`, §5 verifications recorded, CI skeleton (graceful-offline Playwright smoke). | Bobby reproduces SETUP.md from scratch on the G434; pin transcripts reviewed. |
| T1–T5 | `feat/lesson-0N` | One lesson each per §6: lesson page(s) + given working files + offline blocks + real captured transcripts. | Bobby performs the lesson start to finish; CI green. |
| T6 | `feat/freebies` | `recipes.md` (copy-paste patterns: add a tool, swap the model, harden an error message) and `ideas.md` (what to build next — a memory trainer, a study-group page), in the family tradition. | Read-through. |
| T7 | `feat/branding-polish` | Banner (family sibling; tagline proposed in-slice for ruling), README final pass, cross-link sweep — plus prepared upstream prompts for Bobby: concord README's course list gains the third course; concord-tutorial-react's ending links onward; concord-mcp's README gains "want to build this yourself?" | Banner on light+dark; upstream prompts reviewed. |

## 10. Deferred (post-v1)

The cloud-model appendix (Claude/OpenAI APIs — key handling deserves
adult supervision and its own moment); streaming responses in the
lesson-5 chat page; an automated transcript-refresh harness; translating
the course's Concord queries to non-English translations.
