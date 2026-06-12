# Setup — one new program, one download, and two old friends

This is the one-time setup for the whole course. There's exactly one new
thing to install — Ollama — plus one download (the AI model itself), and
then two things you may already have from course 1: Concord and the local
preview server. Do this once, and every lesson after just works.

## Get the files

Right now you're looking at this course on GitHub, in your web browser.
First, get your own copy onto your computer:

1. On this repo's page on GitHub, click the green "Code" button, then
   "Download ZIP."
2. Unzip it — on most computers, just double-click the downloaded file.
   You'll get a folder named `concord-tutorial-ai`.

That unzipped folder holds everything — every lesson and its files. When a
lesson says "this folder," it means one of the lesson folders inside it.

Already use git? `git clone https://github.com/kbennett2000/concord-tutorial-ai`
works too.

## The one new install: Ollama

In course 1, Docker was the program that ran Concord on your computer.
This course has its own version of that: **Ollama**, a free program that
runs an AI model on your own computer. No account, no API key, no cloud —
the model lives on your machine, and nothing you type leaves it.

Install it for your system:

**Windows.** Go to [ollama.com/download](https://ollama.com/download),
click **Windows**, download the installer, and run it like any other
program you've installed.

**Mac.** Go to [ollama.com/download](https://ollama.com/download), click
**macOS**, and you'll get `Ollama.dmg` — open it and drag Ollama into
Applications, the usual Mac ritual. (It needs macOS 14 or newer.)

**Linux.** Open a terminal and run the one-line installer from Ollama:

```
curl -fsSL https://ollama.com/install.sh | sh
```

It may ask for your password — that's normal; it's installing a program.

However you installed it, here's **the 30-second check** (you'll recognize
this move from course 1's `healthz`). Open this in your browser:

```
http://localhost:11434
```

You're ready when the page says, in plain text: **"Ollama is running."**
That's Ollama answering you directly — a little server on your own
computer, just like Concord, on its own port.

## Pull the model

Ollama is the engine; now it needs a model — the actual AI. The whole
course uses one model, and you download it once with one command. Open a
terminal and run:

```
ollama pull qwen3.5:4b
```

That downloads about 3.4 GB — like a long movie, so give it a few
minutes on home internet. You'll see a progress bar crawl to 100% for
the big file, a few quick small ones after it, and then the word
`success`. That's it — the model is on your machine for good.

## Will it run on my computer?

Honest answer: yes on almost anything reasonably recent, and here's what
to expect.

The model uses just under 4 GB of memory while it's loaded (3.78 GB, as
we measured it). If your computer has **8 GB of RAM or more**, you're
fine. If it has a graphics card, replies will feel instant; if not, the
model runs on your processor — it works the same, it just types slower.
On our test machine with the graphics card switched off (a 2019 8-core
processor), it generated about 11 tokens a second — call it eight words
a second, comfortable reading speed. You'll watch sentences appear; you
won't wonder if it's frozen.

If your machine has **less than 8 GB of RAM**, or the model above feels
like wading through mud, there's a smaller cousin from the same family:

```
ollama pull qwen3.5:2b
```

It's a 2.7 GB download and uses about 2.2 GB of memory. Fair statement
of what we know: in our 10-trial course test it scored a perfect 10,
same as the main model — but that test is short and friendly, and a
smaller brain generally has less room for the trickier moments in later
lessons. If it fumbles, that's expected sometimes, and the lessons are
written so a fumble is never a dead end. Wherever a lesson says the
model's name, just use this one instead.

## Concord — same as course 1

The lessons fact-check the AI against a real Bible, and that real Bible
is Concord — the same one from course 1.

**Finished course 1?** Then you've already done this part. The 30-second
check: open `http://localhost:8000/healthz` in your browser. If a short
line of data comes back, Concord is on and you're done with this section.
If it doesn't load, start Concord the same way you did in course 1
(usually: open Docker, start the Concord container).

**New here, or set up on a different computer?** Concord runs inside
Docker — the free program that runs server software on your computer.
Concord's [Quick start](https://github.com/kbennett2000/concord#quick-start)
walks you through it; this course is built against Concord `v1.2.0`, so
when the quick start asks which version, use:

```
docker pull ghcr.io/kbennett2000/concord:v1.2.0
```

Then run it as the quick start shows, and do the `healthz` check above.

## The preview server

Lesson pages are real files you open in a browser — served from
`http://localhost`, exactly the ritual you learned in course 1 (VS Code's
**Go Live** button, or `python3 -m http.server 5500` in the lesson's
folder). If that sentence rang a bell, you're set; if not, course 1's
[SETUP](https://github.com/kbennett2000/concord-tutorial-web/blob/main/SETUP.md#how-to-run-a-lesson)
teaches it gently, once, and it carries over here unchanged.

One thing **is** new. There are now **three** different addresses in
play, on purpose:

- `http://localhost:5500` — where _your page_ lives (the preview server).
- `http://localhost:8000` — where _Concord_ lives (the real Bible).
- `http://localhost:11434` — where _Ollama_ lives (the model).

Your page talks to the other two; the lessons carry the addresses at the
top of their code, like course 1 did. And the course-1 rule still stands:
**opening a lesson file by double-clicking it does not work** — always
through the preview server.

## When it won't connect

If a lesson page sits blank or shows a "can't reach" message, don't worry
— it's almost always one of five small things, and the page itself will
usually tell you which backend it's missing. The fast checks, in order:

| What you see                                                                                        | What it means                                                                          | What to do                                                                                                                                          |
| --------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| The page won't load at `http://localhost:5500` at all                                               | Your preview server isn't running — or you double-clicked the file                     | Click **Go Live** again (or re-run `python3 -m http.server 5500`), and open the page through the preview address                                    |
| The page says **"Ollama isn't running"** — and `http://localhost:11434` won't load either           | Ollama, the program, isn't started                                                     | Start Ollama (on Windows/Mac, launch the Ollama app; on Linux it usually starts itself — `ollama serve` in a terminal if not), then reload the page |
| The page says the **model isn't downloaded**                                                        | Ollama is running, but the model isn't on this machine yet                             | Run the pull command from [Pull the model](#pull-the-model) and wait for `success`                                                                  |
| The page says **"Concord isn't answering"** — and `http://localhost:8000/healthz` won't load either | Concord isn't running                                                                  | Open Docker, start Concord, re-check `healthz` — course 1's ritual, unchanged                                                                       |
| A reply starts and then everything goes quiet for a long time                                       | Nothing is broken — on a computer without a graphics card, the model just types slowly | Give it a moment; if it's regularly painful, switch to the smaller model in [Will it run on my computer?](#will-it-run-on-my-computer)              |
