# Addendum — the multi-tool routing protocol (T4, 2026-06-12)

The standing obligation (DECISION.md, re-affirmed in THINK-ADDENDUM.md)
comes due again: lesson 4 changes the request shape to **three tools +
the lesson-3 rule + `stream/think: false`**, so the protocol re-runs
under that exact shape. The task this time is **routing**: a frozen
ten-question set with known-correct tools, driven through the real
lesson page.

## The frozen set

| #   | Question                                      | Correct tool         |
| --- | --------------------------------------------- | -------------------- |
| q01 | What does Romans 8:28 say?                    | `lookup_verse`       |
| q02 | What does Psalm 23:1 say?                     | `lookup_verse`       |
| q03 | What does Genesis 1:1 say?                    | `lookup_verse`       |
| q04 | What does Philippians 4:13 say?               | `lookup_verse`       |
| q05 | Find verses about courage when you're afraid. | `search_by_meaning`  |
| q06 | I need verses about hope in dark times.       | `search_by_meaning`  |
| q07 | Show me verses about being thankful.          | `search_by_meaning`  |
| q08 | Which places are named in Acts 9:1-9?         | `places_for_passage` |
| q09 | Which places are named in John 4:1-6?         | `places_for_passage` |
| q10 | Which places appear in Exodus 19:1-2?         | `places_for_passage` |

Pass per trial = correct **first** tool, well-formed arguments, answer
drawn from the tool result (mechanical flags + human review; raws under
`routing-addendum/<model>/qNN/`).

## Results

| Model                   | Routing   | Notes (human-reviewed)                                                                                                                                                                                                           |
| ----------------------- | --------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `qwen3.5:4b` (pin)      | **10/10** | every question: correct tool, one round of calls, answer from the result                                                                                                                                                         |
| `qwen3.5:2b` (fallback) | **9/10**  | q10 misrouted (looked the verses up and read place names out of the verse _text_ — right facts, wrong tool); q05/q07/q08 took extra rounds ("the scenic route"); q07's answer carried confused commentary around correct results |

## The T0 wager's verdict (ruling 4: on the record)

T0 pinned `qwen3.5:4b` over `qwen3.5:2b` partly on the wager that the
smaller brain would fumble harder tasks even though it matched the pin
10/10 on the simple lesson-3 protocol. **The wager cashes — modestly.**
On the first genuinely harder task (three-tool routing), the fallback
dropped one of ten and wandered where the pin went straight.
**The pin does not move** (pre-committed posture), and SETUP.md's
fallback paragraph now carries these numbers instead of a hedge.

## Rule-carry check (pre-work C)

Lesson 3's RULE, verbatim, under three tools: **6/6 correct routing**
(two runs each of a reference, a meaning, and a where question — raws
under `docs/transcripts/lesson-04/rule-carry/`). The feared
lookup_verse-naming bias did not materialize. **The rule carries
unchanged**; no revision ships.
