# The pin — decision record (T0, 2026-06-12)

**Pinned model: `qwen3.5:4b`. Documented fallback: `qwen3.5:2b`.**

Made by the protocol in [PROTOCOL.md](PROTOCOL.md), on the environment in
[ENVIRONMENT.md](ENVIRONMENT.md), with every candidate's full transcripts
committed beside this file — winners and losers alike. The pin is only as
credible as the runners-up's scores, so here is the whole matrix.

## The matrix

| Candidate     | Trials    | Footprint (`/api/ps`) | Ceiling ≤ 5.5 GB | CPU-forced speed¹ | License               | Verdict                        |
| ------------- | --------- | --------------------- | ---------------- | ----------------- | --------------------- | ------------------------------ |
| `qwen3.5:4b`  | **10/10** | **3.78 GB**           | ✓                | 10.96 tok/s       | Apache 2.0            | **PINNED**                     |
| `qwen3.5:2b`  | **10/10** | **2.19 GB**           | ✓                | 13.38 tok/s       | Apache 2.0            | **FALLBACK**                   |
| `qwen3.5:9b`  | 10/10     | 5.64 GB               | **✗ over**       | 6.82 tok/s        | Apache 2.0            | disqualified — footprint       |
| `lfm2.5:8b`   | 10/10     | 5.25 GB               | ✓                | 27.53 tok/s       | LFM Open License v1.0 | runner-up — license + maturity |
| `llama3.1:8b` | 9/10      | 5.27 GB               | ✓                | 8.67 tok/s        | Llama 3.1 Community   | runner-up — score + license    |

¹ One trial re-run with `options: {"num_gpu": 0}` on the i7-9700KF
(8 cores, 2019); raw run in each candidate's `cpu-forced/` directory.
These are the only numbers SETUP.md's hardware paragraph uses.

## Why `qwen3.5:4b`

- **Perfect protocol score**, human-reviewed: 10/10 trials emitted one
  well-formed `lookup_verse` call and then quoted the wire text verbatim,
  with clean `message.content` (no reasoning artifacts) throughout.
- **3.78 GB measured footprint** — the most headroom of any 10/10 scorer
  on an 8 GB machine; ~1.7 GB more slack than `lfm2.5:8b`.
- **Apache 2.0** — the only fully open license among the 8B-class
  passers; the spec's open-license criterion is met without an asterisk.
- **A general instruct model with mass adoption** (13.5M+ pulls for the
  family): lessons 1–2 need a well-rounded conversational co-star, not
  only a tool-call specialist, and a pin this course depends on should
  not be a week-old release.
- CPU-forced feel: ~11 tok/s on a 2019 8-core CPU — reading speed.

## Why not the others

- **`qwen3.5:9b`** — flawless score, but **5.64 GB measured > the 5.5 GB
  ceiling**. Ruling 2 applied: great model, wrong course. _Borderline
  note for the record:_ in binary units the same measurement is 5.25 GiB;
  if the ceiling were read as GiB it would squeak under. The ruling's
  arithmetic (8 GB minus 2.5 GB) is applied in the same decimal units
  `ollama list`/`ps` display, so it stays out. Either way `qwen3.5:4b`
  dominates it on every other axis, so nothing turns on the reading.
- **`lfm2.5:8b`** — a genuinely impressive 10/10 with the fastest CPU
  speed of the field (27.5 tok/s); its replies were the bare verbatim
  verse, every single time. It loses on the criterion it can't trial its
  way out of: a custom license (LFM Open License v1.0, not OSI) where an
  equal scorer offers Apache 2.0 — plus a release one week old at pin
  time, against a course law that makes the pin load-bearing. Worth
  rechecking at a future course revision.
- **`llama3.1:8b`** — the spec's long-proven baseline came close: 9/10,
  meeting the ≥ 9 bar, with trial 03 a genuine quote-vs-describe miss
  (the reply summarized the verse's message instead of quoting it —
  exactly the failure mode this course teaches students to catch).
  Outscored by three 10/10 candidates, a year stale, custom license.

## Why `qwen3.5:2b` as fallback

10/10 on this protocol (stated as measured — no invented weakness), 2.19
GB measured footprint, Apache 2.0, and the same family as the pin, so
students switch by changing one tag. SETUP.md states honestly that the
protocol is short and friendly and a smaller brain has less headroom in
later lessons; the fallback's ≥ 7/10 spec bar is comfortably met.

**The wager's verdict (T4,
[ROUTING-ADDENDUM.md](ROUTING-ADDENDUM.md)):** the "less headroom"
hedge above was a wager, and on the first genuinely harder task —
three-tool routing — it cashed, modestly: the fallback routed **9/10**
where the pin routed **10/10**, misrouting one where-question and
taking extra rounds on three others. The pin stands; SETUP.md's
fallback paragraph now quotes these numbers instead of the hedge.

## What changing the pin requires

Per course law (CLAUDE.md): re-running this protocol on the new
candidate set, committing the new evidence under `docs/model-pin/`, and
amending SPEC §4 in the same PR.
