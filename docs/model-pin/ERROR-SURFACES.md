# Error surfaces — captured from real pages, 2026-06-12

What lesson JavaScript actually sees when each backend is missing.
Captured via a probe page served from `http://localhost:5500` (and
re-confirmed from `http://127.0.0.1:5500`), in Chromium and Firefox,
against the same Ollama v0.30.7 / Concord v1.2.0 used for the trials.
WebKit runs in CI only (its system libraries can't install on the dev
box); its surfaces should be spot-checked when the first lesson lands.
The graceful-offline blocks (SPEC §7) are written from these exact
behaviors.

## 1. Ollama stopped (the program isn't running)

`fetch` **rejects** — there is no HTTP status to read:

| Engine   | What `catch` receives                                        | Console shows                                                                                  |
| -------- | ------------------------------------------------------------ | ---------------------------------------------------------------------------------------------- |
| Chromium | `TypeError: Failed to fetch`                                 | `net::ERR_CONNECTION_REFUSED`                                                                  |
| Firefox  | `TypeError: NetworkError when attempting to fetch resource.` | `Cross-Origin Request Blocked: … (Reason: CORS request did not succeed). Status code: (null).` |

Note Firefox's console message _mentions CORS even though the real cause
is connection-refused_ — lesson troubleshooting text must not send
students chasing CORS ghosts; the page-level fix is "is Ollama running?"

## 2. Model not pulled (Ollama running, model absent)

The request **succeeds at the HTTP level** — CORS allows the page to
read it — and returns:

```
HTTP 404
{"error":"model 'definitely-not-pulled' not found"}
```

(Captured verbatim from `POST /api/chat` with a deliberately absent
model name.) So pages can — and should — distinguish "Ollama is off"
(fetch throws) from "the model isn't downloaded" (`response.ok` false,
JSON `error` mentions "not found") and give different guidance.

## 3. Concord down

Identical class to surface 1 (fetch rejects with the same per-engine
`TypeError`s) — and identical to what course 1's lessons already handle.
The landing page and lessons name Concord's own check
(`http://localhost:8000/healthz`) in their guidance.

## The pattern the lessons inherit

```js
fetch(url)
  .then((r) => (r.ok ? r.json() : r.json().then(handleApiError)))
  .catch(showOfflineGuidance); // backend unreachable — show the friendly block
```

`index.html` (the landing page) is the first committed user of this
pattern, with one `[data-offline-guidance]` block per backend — which is
exactly what CI's hermetic smoke asserts on every page.
