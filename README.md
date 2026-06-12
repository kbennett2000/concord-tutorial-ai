# concord-tutorial-ai

> 🚧 **Under construction.** The front door (this README, SETUP, and the
> course's groundwork) is in review; lessons land one at a time, and
> everything merged here is followable up to the last finished lesson.

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

1. **[Another local server](lessons/01-hello-model/)** — a model is just
   another HTTP service on your machine; talk to an AI from a page you
   control. ← **start here**
2. **[Catch it making things up](lessons/02-the-fact-check/)** — render its claims beside the live
   Concord lookup, and mark the mismatches with your own eyes.
3. **[Give it a tool](lessons/03-the-one-rule/)** — the heart of the course: the model writes a
   request, _your code_ looks the verse up, and the errors stop — for a
   reason you can read.
4. **[Let it choose](lessons/04-the-menu/)** — give it a menu of tools and steer it with plain
   English descriptions you wrote.
5. **It has a name** — the pattern you hand-rolled is called MCP; open a
   real production project and recognize every part.

## What's next

When you've finished all five, the curious can keep going:
[concord-mcp](https://github.com/kbennett2000/concord-mcp) is the
production implementation of exactly what you built — its README shows the
no-code path to running the real thing.

## License

MIT © 2026 Kris Bennett — see [`LICENSE`](LICENSE). (Parity with Concord.)
