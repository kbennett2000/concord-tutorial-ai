# Recipes — steal these

These are yours to keep, in the family tradition. Every recipe below was
cooked once on the real lesson pages before it shipped — the proof of
each cook is committed under
[`docs/transcripts/freebies/`](docs/transcripts/freebies/), so when a
recipe quotes a number, the number has a receipt. Most recipes start
from your lesson-5 chat page (`lessons/05-the-real-thing/index.html`),
because that's the page you'll actually be living in.

One habit before you start: **make a copy of the page before you cook.**
Recipes change code; copies make courage cheap.

## 1. Build the tool you saw but never built

_What it does: adds `search_keyword` — exact-word search — to your
menu. Lesson 5 showed you the production version; tonight you build
yours._

Before you paste anything: try writing the description yourself. One
paragraph — what the tool does, when to reach for it. You've read
enough reviewed product copy to have opinions now. Then compare with
ours below, and keep whichever steers better.

**Ingredient 1 — the declaration.** Add this to your `TOOLS` array,
after `places_for_passage`:

```js
{
  type: "function",
  function: {
    name: "search_keyword",
    description:
      "Find verses containing an exact word or phrase. Use this when the wording " +
      "itself matters — a phrase someone remembers, a word being traced — rather " +
      "than a theme or a reference.",
    parameters: {
      type: "object",
      required: ["query"],
      properties: {
        query: {
          type: "string",
          description: "The exact word or phrase to find",
        },
      },
    },
  },
},
```

**Ingredient 2 — your code's side.** Add this function beside
`searchByMeaning`:

```js
async function searchKeyword(query) {
  let response;
  try {
    response = await fetch(
      `${CONCORD}/v1/search?q=${encodeURIComponent(query)}&limit=5`,
    );
  } catch (e) {
    guidance("concord").hidden = false;
    return {
      content: "Couldn't reach Concord — it appears to be off.",
      isError: true,
    };
  }
  const data = await response.json();
  if (!response.ok) return { content: data.error.message, isError: true };
  if (data.hits.length === 0) {
    return { content: `No verses contain "${query}".`, isError: false };
  }
  const lines = data.hits.map((h) => {
    // Concord highlights matches for web pages; the model doesn't need
    // the costume.
    const text = h.snippet.replaceAll("<mark>", "").replaceAll("</mark>", "");
    // An "…" means the search trimmed a long verse. A fragment must never
    // dress as a whole verse — you learned to catch exactly this in
    // lesson 2 — so the line says what it is and where the whole one is.
    const excerpt = text.includes("…")
      ? " [excerpt — lookup_verse for the full text]"
      : "";
    return `${h.reference}: ${text}${excerpt}`;
  });
  return {
    content:
      `Verses containing the words (KJV), ${data.total} total:\n` +
      lines.join("\n"),
    isError: false,
  };
}
```

**Ingredient 3 — the dispatcher case.** In `runTool`, add one case:

```js
case "search_keyword":
  return searchKeyword(args.query);
```

(Optional tidiness: add `search_keyword` to the list in the
no-such-tool message below it.)

**You've cooked it when:** you ask
`Which verses contain the exact phrase "still waters"?` and the wire
panel shows `search_keyword` chosen — by your description — with
snippets crossing, references attached.

**Now read the production version.** With yours working, open
[`SEARCH_BY_MEANING`'s neighbor, `SEARCH_KEYWORD_DESCRIPTION`](https://github.com/kbennett2000/concord-mcp/blob/v1.0.0/src/concord_mcp/server.py)
and [`http.py`'s `search`](https://github.com/kbennett2000/concord-mcp/blob/v1.0.0/src/concord_mcp/backends/http.py)
at the tag. Note the quoted-phrase advice, the `[excerpt]` honesty —
the same decision your formatter just made — and steal any wording you
like. That's what reviewed copy is for.

## 2. The fast one with the asterisk

_What it does: swaps in `lfm2.5:8b` — the speed king of our T0 trials —
for an evening of test piloting._

```
ollama pull lfm2.5:8b
```

…then the one-line `MODEL` swap you've made since lesson 1, to
`"lfm2.5:8b"`.

The numbers, from the [T0 record](docs/model-pin/DECISION.md), measured
not remembered: 10/10 on the single-tool protocol, the fastest
CPU-forced speed of the whole field (27.53 tokens/sec, vs the pin's
10.96), 5.25 GB loaded. The asterisk, stated plainly: it isn't the
course pin because its license is custom (LFM Open License v1.0, not
OSI-approved) where an equal scorer offered Apache 2.0 — and because we
only ever measured it once, at T0, with one tool. It never ran the
routing or multi-turn protocols. Beyond that single measurement you're
the test pilot, which is rather the fun of this recipe.

**You've cooked it when:** a lesson-5 chat lands with quotes crossing
the wire at a speed that makes you grin. (In our cook it ran the
three-tool page without complaint — one session, not a protocol; see
the receipt.)

## 3. Read it in another translation

_What it does: the whole course speaks KJV. Two one-line edits make it
speak any of the fifteen translations Concord carries._

Open `http://localhost:8000/v1/translations` in your browser — there's
the menu. Then, in your chat page, four one-line edits — two asks, two
reads:

- In `lookupVerse`: change `translations=KJV` → `translations=WEB`,
  **and** two lines below it, `v.text.KJV` → `v.text.WEB` (the response
  is keyed by translation — the shape course 1 taught you; ask for WEB,
  read WEB).
- In `searchByMeaning`: change `translation=KJV` → `translation=WEB`,
  **and** the `"Closest matches (KJV text)"` label to say WEB — a label
  that lies is worse than no label.

(Yes, we first cooked this with only the two ask-lines changed. The
verse crossed the wire as WEB, the formatter read the KJV key that
wasn't there, and the model got handed an empty result — and quietly
paraphrased from memory. The broken cook is in the receipts folder too:
what you request and what you read must agree, and a quiet empty result
is exactly the failure lesson 3 taught you to spot — no wire line, no
trust.)

And notice what you just learned: the `translation` parameter was
always a **choice** — lesson 4 chose KJV on purpose, the production
server chooses its configured default on purpose (lesson 5, stop 3),
and now you've chosen too. One honest note: lessons 1–2's fact-check
pages compare against KJV by design — make this edit on your chat page,
not on theirs.

**You've cooked it when:** "For God so loved the world, that he gave
his only begotten Son…" comes back as "For God so loved the world, that
he gave his one and only Son…" — same verse, the World English Bible's
voice, live on your wire.

## 4. Watch it think (and what the flag was costing)

_What it does: turns the model's thinking back on — the thing the
course switched off in lesson 1 — so you can watch the diary, and feel
why the flag ships off._

On your **lesson-1** page (`lessons/01-hello-model/index.html` — the
simplest surface for this):

1. Change `think: false` → `think: true` in the parcel.
2. Replace the `showReply(data.message.content);` line with:

```js
showReply(
  (data.message.thinking
    ? "[the diary — not the answer]\n" +
      data.message.thinking +
      "\n\n[the answer]\n"
    : "") + data.message.content,
);
```

Fair warning, with a receipt: when we measured this model thinking at
default settings in bare chat ([the T1 record](docs/transcripts/lesson-01/default-think/)),
**5 of 10 runs spent their entire budget on the diary and returned no
answer at all.** That's why the course ships the flag off. Expect long
waits; expect the occasional empty answer; that's not breakage — that's
the cost you've been not paying all course.

**You've cooked it when:** a diary appears above an answer — or instead
of one — and either way you understand the flag forever.

## 5. Rewrite the law

_What it does: edits the one-sentence RULE that steers your whole
assistant — with the respect a measured sentence deserves._

A worked variant. In your chat page, change the end of `RULE` so it
reads:

```js
const RULE =
  "You answer questions about the Bible. Never quote a verse from memory: " +
  "always look it up with the lookup_verse tool, and quote only what it returns. " +
  "After each quote, name the reference it came from.";
```

Ask for a verse; in our cook, the citations duly appeared. Two measured
cautions before you go further on your own:

- This sentence is **load-bearing**: without it, our model looked up
  every claim in only 2 of 6 runs; with it, 6 of 6
  ([the T3 record](docs/transcripts/lesson-03/compliance-pre-study/)).
  Edit like you're editing brakes.
- **Instructions can collide.** When we once gave the model a prompt
  whose formatting demands fought the rule, it refused to answer — six
  times out of six (the refusals are on file in the same folder). If
  the model gets weird after your edit, your two texts are fighting.

When you want to see what a grown-up law reads like, production's is
the `INSTRUCTIONS` constant you met at lesson 5's first stop.

## 6. Concord on another computer

_What it does: your page on the laptop, Concord on the closet server —
the family move, inherited straight from course 1's recipe 1._

In your chat page, one line:

```js
const CONCORD = "http://<your-concord-host>:8000"; // the machine Concord runs on
```

…and leave `OLLAMA` alone: the two constants are independent dials, and
the model can stay right where it is. Course 1's
[SETUP](https://github.com/kbennett2000/concord-tutorial-web/blob/main/SETUP.md)
covers finding the address and the port rules; nothing new is needed
here.

**You've cooked it when:** `http://<your-concord-host>:8000/healthz`
answers in your browser, and a chat turn's wire line crosses from that
address. (We cooked this against a second address on our own network —
we tested the dial, not your network.)
