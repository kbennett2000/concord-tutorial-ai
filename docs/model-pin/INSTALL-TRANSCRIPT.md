# Install transcript — one real session, this machine, 2026-06-12

Ruling 6(a): the T0 author provisions the gate machine, so the install is
captured for review against SETUP.md's install section. Everything below
is a genuine `script(1)` capture from the gate machine (Linux, RTX 5070,
60 GB RAM), lightly stripped of terminal control codes. Nothing was
re-typed or invented.

## Attempt 1 — SETUP.md's documented path (the official one-liner)

```
Script started on 2026-06-12 11:37:32-06:00
  [COMMAND="curl -fsSL https://ollama.com/install.sh | sh"]
>>> Installing ollama to /usr/local
[sudo: authenticate] Password:
sudo: timed out
Script done on 2026-06-12 11:42:32-06:00 [COMMAND_EXIT_CODE="1"]
```

**What this proves:** the script runs and immediately asks for the user's
password, exactly as SETUP.md warns ("It may ask for your password —
that's normal"). This automated session has no way to type a password, so
the script path could not be completed _by the automation_ — a limitation
of the session, not of the instructions. **The script-install path
therefore remains unvalidated end-to-end**, and the machine was left with
no system-wide install on purpose: Bobby's gate can begin with the true
from-scratch `curl -fsSL https://ollama.com/install.sh | sh`, which is
the strongest possible test of the install section.

## Attempt 2 — Ollama's documented manual install, adapted to a user prefix

From [docs.ollama.com/linux](https://docs.ollama.com/linux) (manual
install: the same release tarball, normally extracted to `/usr`),
extracted to `~/.local/ollama` so no root was needed:

```
Script started on 2026-06-12 11:43:45-06:00
  [COMMAND="set -x; curl -fsSL https://ollama.com/download/ollama-linux-amd64.tar.zst
            | tar --zstd -x -C "$HOME/.local/ollama"
            && ln -sf "$HOME/.local/ollama/bin/ollama" "$HOME/.local/bin/ollama"
            && "$HOME/.local/ollama/bin/ollama" --version"]
+ curl -fsSL https://ollama.com/download/ollama-linux-amd64.tar.zst
+ tar --zstd -x -C /home/kb/.local/ollama
+ ln -sf /home/kb/.local/ollama/bin/ollama /home/kb/.local/bin/ollama
+ /home/kb/.local/ollama/bin/ollama --version
Warning: could not connect to a running Ollama instance
Warning: client version is 0.30.7
Script done on 2026-06-12 11:46:58-06:00 [COMMAND_EXIT_CODE="0"]
```

Then the server was started (`ollama serve`, backgrounded — the user-level
install has no systemd unit) and SETUP.md's 30-second check passed:

```
$ curl -s http://localhost:11434/
Ollama is running
$ curl -s http://localhost:11434/api/version
{"version":"0.30.7"}
```

All trial evidence in this directory was produced against this
`v0.30.7` user-level install.
