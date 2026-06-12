![Concord — now teach it to look things up.](docs/banner.svg)

# concord-tutorial-ai

You've seen an AI invent a Bible verse. In five short lessons you'll catch it
doing that with your own code — and then fix it, yourself, so it can't.

By the end, the AI on your computer answers Scripture questions only from a
real Bible it looks up. And you'll open a real production project and
recognize every part of it — because you just built the small version with
your own hands.

## Who this is for

You finished [concord-tutorial-web](https://github.com/kbennett2000/concord-tutorial-web)
(or you can fetch from Concord and put the result on a page), and that's
all. **No AI experience needed** — not the apps, not the APIs, none of it.
If you've heard of ChatGPT and you're not sure what's actually inside,
you're exactly who this course is for.

> **Already a developer?** Skim freely — this is a beginner's course,
> deliberately unhurried. If you want the production-grade version of what
> it builds, go straight to
> [concord-mcp](https://github.com/kbennett2000/concord-mcp).

**Found this because Scripture matters to you?** Maybe you've personally
watched a chatbot quote a verse that doesn't exist — chapter, number, and
all. That's not a reason to walk away from these tools. It's the exact
problem this course teaches you to fix: by the last lesson, every quote
arrives over the wire from a real Bible on your own computer, and you'll
have written the code that makes it so.

## The ladder

This is the third Concord course. Course 1,
[concord-tutorial-web](https://github.com/kbennett2000/concord-tutorial-web),
taught you that a server is something you can ask questions. Course 2,
[concord-tutorial-react](https://github.com/kbennett2000/concord-tutorial-react),
taught you that real code is something you can read — it's recommended,
**not required**; this course is plain HTML and JavaScript throughout.

## Before you start

Two 30-second checks, both straight from your browser's address bar:

- `http://localhost:8000/healthz` — a short line of data means **Concord**
  is on (course 1's ritual, unchanged).
- `http://localhost:11434` — the words "Ollama is running" mean **the AI**
  is on.

If either check fails — or you've never installed Ollama — that's what
[SETUP.md](SETUP.md) is for. One sitting, and every lesson after just
works.

## The five lessons

1. **[Another local server](lessons/01-hello-model/)** — talk to an AI from
   a page you control, then ask it for John 3:16 word for word — and
   discover you can't tell right from blurred without checking.
   ← **start here**
2. **[Catch it making things up](lessons/02-the-fact-check/)** — five
   claimed verses, five live Concord lookups, your own marking tally.
   Ours came out 1 of 5.
3. **[Give it a tool](lessons/03-the-one-rule/)** — the heart of the
   course: a ~40-line loop and a one-sentence rule (without it, our model
   looked things up in 2 of 6 runs; with it, 6 of 6) — and your tally
   becomes 5 of 5 for a reason you can read.
4. **[Let it choose](lessons/04-the-menu/)** — three tools, and the model
   routes by reading descriptions you wrote (ten for ten in our test).
   Then you sabotage one and learn what production already knows.
5. **[It has a name](lessons/05-the-real-thing/)** — a chat that remembers,
   worth showing someone — then concord-mcp, read at its tag, until you
   recognize your own hands in production code.

## What's next

When you've finished all five, the curious can keep going:
[concord-mcp](https://github.com/kbennett2000/concord-mcp) is the
production implementation of exactly what you built — its README shows the
no-code path to running the real thing. Graduates also get
[recipes.md](recipes.md) and [ideas.md](ideas.md) — steal freely.

## License

MIT © 2026 Kris Bennett — see [`LICENSE`](LICENSE). (Parity with Concord.)

---

_Never trust a quote without a wire line._
