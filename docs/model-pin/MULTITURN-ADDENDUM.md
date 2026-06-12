# Addendum — the multi-turn protocol (T5, 2026-06-12): the chain's final link

Lesson 5 changes the request shape one last time: **accumulated
history** — every prior turn, tool call, and tool result rides along in
`messages`. Per the standing obligation (DECISION.md →
THINK-ADDENDUM.md → ROUTING-ADDENDUM.md), the protocol re-ran under
that exact shape, through the real chat page: a scripted 3-turn
conversation × ten trials × both course models.

## The script

1. `What does Acts 9:3 say?` → `lookup_verse`
2. `Find me more verses about sudden light from heaven.` →
   `search_by_meaning`
3. `Which places does the passage from my first question name?` →
   `places_for_passage` **with Acts 9:3 recalled from turn-1 history**
   — the stateful probe.

## The instrument repair (disclosed in full)

The first ten pin trials used a different turn-3 wording: _"Which
places does **that first passage** name?"_ It scored **8/10** — and
review of the two misses showed the instrument, not the model, at
fault: turn 2's search had put five new passages on the table, and
"that first passage" is ambiguous English. Trial 01 resolved it to the
**first item of its own search results** (John 1:9); trial 02 to the
parallel road-to-Damascus account (Acts 22:6 — and answered "Damascus,"
factually overlapping the intended answer). **All ten runs used
history; none asked the user; zero showed state loss.** The probe was
re-worded to the unambiguous form above and re-run in full. Both run
sets are committed (`protocol-*` = ambiguous probe, `protocol-v2-*` =
the protocol of record); nothing was discarded.

## Results (protocol of record)

| Model                   | Trials    | Notes (human-reviewed)                                                                        |
| ----------------------- | --------- | --------------------------------------------------------------------------------------------- |
| `qwen3.5:4b` (pin)      | **10/10** | correct routing every turn; Acts 9:3 recalled from history in every trial                     |
| `qwen3.5:2b` (fallback) | **10/10** | same — with its usual enrichment habit (extra lookups after a correct first pick in 4 trials) |

**Tiebreak applied: stateful chat ships.** Lesson 1's "a chat is a list
of turns — today ours has one" pays off as written.

## Context growth (the cost row's measured basis)

`prompt_eval_count` per chat round, pin, across the 3 turns:
**~560 → ~720 → ~1,250 tokens** (the whole conversation re-reads every
round; tool results are the bulk). Instant on a GPU; on a CPU-only
machine prompt re-reading is fast but not free, so the lesson's "when
it goes wrong" carries an honest row: long chats think longer, and
"Start over" resets the list. No deeper warning is invented — at three
turns the budget (4,096 tokens) still has headroom.
