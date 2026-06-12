# CLAUDE.md — concord-tutorial-ai

## What this is

The third course in the Concord learning ladder. Course 1
(concord-tutorial-web) taught "a server is something you can ask
questions." Course 2 (concord-tutorial-react) taught "real code is
something you can read." This course teaches the single most useful
practical AI idea there is: **an AI that looks things up instead of
remembering.** Five lessons, one new idea each, ending with the student
opening a real production codebase — concord-mcp, pinned at `v1.0.0` —
and recognizing every part as the thing they just hand-rolled.

## The reader

A graduate of course 1 (or equivalent): they can fetch from Concord and
put the result on a page in plain HTML and JavaScript. Course 2 is
recommended, **not required** — this course is vanilla JS throughout.
They have heard of ChatGPT. They have **zero** experience with AI APIs,
models, or tool calling, and the course never assumes any. Many of them
found this ladder because Scripture matters to them; several have
personally watched a chatbot invent a Bible verse. That experience is
this course's fuel.

## How we work

- **Spec first.** `docs/v1/SPEC.md` is the source of truth. Read it and
  this file before any work. Plan Mode before implementing any slice;
  present the plan for approval before writing.
- **One PR per slice** (T0–T7 in SPEC §9). Branches `feat/<short-name>`
  off `main`. Conventional commits. Format/lint gates before every
  commit.
- **Bobby (kbennett2000) merges every PR.** Never self-merge, never push
  to `main` after bootstrap, never force-push.
- **Draft PRs at human gates.** Every lesson slice's gate is Bobby
  _performing the lesson live_ — Ollama running, Concord running, as the
  student. The PR opens draft and stays draft until that run passes.
- **Read the source, don't guess.** Ollama API shapes, CORS behavior,
  model capabilities, and concord-mcp internals are verified against the
  installed software and current docs at implementation time. Spec/
  reality conflicts stop work and get surfaced; the spec is amended in
  the same PR.
- **Stop and report** after every slice: verification output, PR URL,
  deviations with rationale.

## Voice rules (law)

Rules 1–7 were earned in course 1 and carry over verbatim in spirit:

1. **The umbrella: write for one real reader.** Never ask the reader to
   perform an action whose only purpose is to exercise the code.
2. **Break the wall.** Scannable pages reassure; long unbroken prose
   frightens.
3. **No unexplained jargon** — especially tooling jargon. Every term
   earns its place or gets a plain-words introduction at first use.
4. **Just-in-time, not just-in-case.** Teach a thing at the moment it's
   needed, never earlier.
5. **Motivation timed after wins.** Celebrate, then explain why it
   mattered.
6. **Working-first.** Show the win before the explanation. Give working
   files first; the reader modifies, then understands.
7. **Setup-once.** Never re-gate something the reader already proved
   works.

Rules 8–9 are new to this course, because this course has a co-star
nobody controls:

8. **Write for a non-deterministic co-star.** No lesson's success may
   depend on the model saying any particular thing. Every "you should
   see" is written as a _range_ of plausible outcomes, and every range
   lands the lesson. If the model is perfect where we expected a flaw
   (or worse where we expected fine), the lesson text must already have
   met that student. The point of lesson 1's "almost right" is the
   _can't-trust-it_, not the specific error.
9. **Real transcripts only, labeled as one run.** Any model output shown
   in course material was genuinely captured, and is marked "one real
   run — yours will differ." Scripting a fake model reply, even a
   realistic one, is a firing offense for a course whose entire thesis
   is _don't let the machine make things up_.

## Technical laws

- **Vanilla stack.** Plain HTML/CSS/JS, no build step, no npm, no
  dependencies in lesson code. (Dev tooling like Playwright lives in CI
  only.)
- **Ollama-only.** The course's main path requires no account, no API
  key, no cloud. A cloud-model appendix is explicitly deferred
  (SPEC §10) — do not add one.
- **The pinned model is load-bearing.** Its name appears in SETUP.md and
  lessons; changing it requires re-running the SPEC §4 verification
  protocol and amending the spec in the same PR.
- **Graceful offline, CI-verified.** Every lesson page must render
  useful, friendly guidance when Ollama and/or Concord are unreachable —
  never a blank page or raw console error. CI's Playwright smoke loads
  every page with no backends and asserts the guidance renders.
- **Gates pull the published Concord image** —
  `docker pull ghcr.io/kbennett2000/concord:<pinned>` — never a source
  build. Earned the hard way in course 1.
- **Lesson 5 reads, never installs.** concord-mcp is read on GitHub at
  the `v1.0.0` tag. No Claude Desktop, no accounts, no installs beyond
  what SETUP.md already established.
- `data/private/` stays gitignored (family convention), though this repo
  should never need it.

## Releases

Semver after the course is complete; tags on explicit authorization only
(two-stop gate). During the build, `main` is always a coherent,
followable course up to the last merged lesson.
