# Why these runs are here

These are the lesson's first ten John 3:16 captures (plus the first
hello run), taken before the page set `think: false` — i.e. with the
model's thinking mode at its default. They are kept, untouched, as the
evidence behind the SPEC §5 amendment in the T1 PR:

**5 of the 10 runs returned an empty reply.** `qwen3.5:4b` is a thinking
model; in bare chat it wrote thousands of tokens of private deliberation
into `message.thinking` and, in those five runs, hit the default token
budget (`done_reason: "length"`, `eval_count: 4067`) before producing a
single word of `message.content`. The T0 pin protocol never surfaced
this because tool-call turns keep its deliberation short.

The fix the lesson ships is `think: false` on the request — verified to
produce direct, complete replies. The captures the lesson actually shows
live one directory up, taken through the real page under the lesson's
real condition.

One real run set — never edited, never trimmed.
