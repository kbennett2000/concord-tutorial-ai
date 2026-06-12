# Ideas — what could you build?

You're a Concord builder with an AI on the bench now. The hard parts —
the data, the loop, the rule, the honesty — are already in your hands,
in files you understand to the bone. What's left is the fun part:
pointing it all at something your people actually need.

Nothing below is harder than what you've finished. Each idea is one
honest paragraph and ends with its real starting point — a file you
already have, and the endpoint it leans on.

## An evening

### A verse-of-the-day screen that looks it up

A full-screen page for a church lobby or a kitchen tablet: one verse,
big and calm — and unlike every verse-a-day app you've seen, you _know_
this one never paraphrases, because you'll fetch the text the same way
your chat does. Add the model only if you want a gentle one-sentence
reflection under it (clearly an AI talking — you know the scoped claim).
_Starts from:_ `lessons/05-the-real-thing/index.html` minus the chat
box; `GET /v1/verses/{ref}` or `GET /v1/random`.

### The memory-verse trainer

Show a reference, say the verse aloud (or type it), then reveal the
real text and compare with your own eyes — lesson 2's marking, turned
on yourself, kindly. The honest twist that makes it work: the page
never judges, the wire is the answer key. Blank out a few words for
the harder rounds.
_Starts from:_ lesson 2's cards (`lessons/02-the-fact-check/index.html`);
`GET /v1/verses/{ref}`.

## A weekend

### The study-group page

Your lesson-5 chat with a sidebar: this week's passage and three or
four prepared questions, each a click away from being asked. The group
reads, someone clicks, the wire panel keeps everyone honest about
where every quote came from. This is the page you build for _your_
Tuesday group, with their questions.
_Starts from:_ `lessons/05-the-real-thing/index.html` + the lesson-4
fill-link pattern; `search_by_meaning` for the "where else does
Scripture say this?" moments.

### The preacher's fact-checker

Paste a sermon draft's quotes — yours or anyone's — and check each one
against the wire, lesson-2 style, before Sunday. The same cards, the
same three buttons, pointed at the quotes that are about to be said
out loud.
_Starts from:_ `lessons/02-the-fact-check/index.html` (the cards and
the manual path are exactly this); `GET /v1/verses/{ref}`.

## A season

### Run the real thing

concord-mcp — the production server you read in lesson 5 — runs on the
same Concord you already have, and its
[README](https://github.com/kbennett2000/concord-mcp/tree/v1.0.0#readme)
shows the no-code path. Ten tools instead of your three, in any MCP
client you care to try. You've read its source; running it is the
smaller step.
_Starts from:_ lesson 5's walk; nothing new to build — that's the
point.

### Build your own server

The seam diagram told you which half is which. Pick data _you_ care
about — your church's sermon archive, a hymnal's index, your reading
group's notes — and build the right-hand side of the dotted line for
it: tools, descriptions someone reviews, honest errors, honest
absences. You know what good looks like now; you've read it twice, once
in your own handwriting.
_Starts from:_ `docs/diagrams/tool-loop-seam.svg` for the shape;
concord-mcp at the tag for the worked example.

---

Whatever you pick: keep the wire panel for yourself a while, even in
pages you'd never show anyone. It's the habit under everything this
course taught — _the only reason you know is that you checked._
