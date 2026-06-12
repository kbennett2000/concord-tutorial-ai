# Addendum — the tool-lesson request shape (T3, 2026-06-12)

**Decision: tool lessons send `think: false`,** the same etiquette flag
lessons 1–2 already carry — so lesson 3's parcel is exactly "the parcel
you know, plus `tools`."

## Why this needed measuring

[DECISION.md](DECISION.md) recorded a standing obligation: any lesson
that changes request conditions re-runs the §4 protocol under those
conditions. T0's trials ran at default think (clean 10/10, with tool
turns keeping deliberation short — 147–185 chars in the raws). T1 then
caught the same model burning its entire budget thinking in _bare_ chat
(5/10 empty replies), which is why lessons 1–2 send `think: false`.
Nobody had measured the tool loop's answer-from-tool-result turn at
`think: false`. Now it's measured.

## The re-run (PROTOCOL.md, verbatim, plus `"think": false`)

| Model                   | Trials    | Footprint (`/api/ps`) | Verdict                                                   |
| ----------------------- | --------- | --------------------- | --------------------------------------------------------- |
| `qwen3.5:4b` (pin)      | **10/10** | 2.97 GB               | ships — clean tool calls, verbatim quotes, human-reviewed |
| `qwen3.5:2b` (fallback) | **10/10** | 2.19 GB               | ships                                                     |

Raw trials: [`qwen3.5-4b/think-false/`](qwen3.5-4b/think-false/) and
[`qwen3.5-2b/think-false/`](qwen3.5-2b/think-false/). Ruling-2 tiebreak
(both shapes ≥ 9/10 → `think: false` wins for lesson-family
consistency) applied. One incidental observation, recorded not relied
on: the pin's measured footprint at `think: false` came in _lower_ than
T0's default-think measurement (2.97 GB vs 3.78 GB).

This discharges DECISION.md's re-run obligation for the lesson-3 shape;
the obligation itself stands for any future condition change (T4's
multi-tool shape included).
