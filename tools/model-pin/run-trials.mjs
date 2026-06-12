#!/usr/bin/env node
// Model-pin trial runner (SPEC §4, docs/model-pin/PROTOCOL.md).
// Zero dependencies — Node 20+ built-ins only.
//
// Usage:
//   node run-trials.mjs --model qwen3.5:4b [--trials 10] [--num-gpu N] [--label cpu-forced]
//
// Captures every raw request/response verbatim into
// docs/model-pin/<model-dir>[/<label>]/trial-NN.json plus a results.json.
// Mechanical flags only — the reviewed verdicts live in summary.md.

import { mkdir, writeFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const OLLAMA = "http://localhost:11434";
const CONCORD = "http://localhost:8000";

// Frozen protocol text — see docs/model-pin/PROTOCOL.md. Do not edit
// without re-running every candidate.
const SYSTEM_TEXT =
  "You answer questions about the Bible. When the user asks what a verse says, " +
  "use the lookup_verse tool to get its exact text, then answer quoting only the " +
  "text the tool returned.";
const USER_TEXT = "What does John 3:16 say?";
const TOOLS = [
  {
    type: "function",
    function: {
      name: "lookup_verse",
      description:
        'Look up the exact text of a Bible verse by reference, e.g. "John 3:16".',
      parameters: {
        type: "object",
        required: ["ref"],
        properties: {
          ref: {
            type: "string",
            description: 'The verse reference, like "John 3:16"',
          },
        },
      },
    },
  },
];
// The protocol's canonical tool result (Concord v1.2.0, KJV). The runner
// re-fetches it live at startup and refuses to run if the wire disagrees.
const KJV_JOHN_3_16 =
  "For God so loved the world, that he gave his only begotten Son, that " +
  "whosoever believeth in him should not perish, but have everlasting life.";
const SPAN_A = "his only begotten Son";
const SPAN_B = "should not perish, but have everlasting life";

function arg(name, fallback) {
  const i = process.argv.indexOf(`--${name}`);
  return i > -1 ? process.argv[i + 1] : fallback;
}

const model = arg("model");
const trials = Number(arg("trials", "10"));
const numGpu = arg("num-gpu", null);
const label = arg("label", null);
// --think true|false adds the `think` field to every request (T3 addendum);
// omitting the flag preserves the original T0 protocol shape exactly.
const thinkArg = arg("think", null);
const think =
  thinkArg === null ? undefined : thinkArg === "true" ? true : false;
if (!model) {
  console.error("--model is required");
  process.exit(1);
}

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const modelDir = model.replace(/[:/]/g, "-");
const outDir = join(repoRoot, "docs", "model-pin", modelDir, label ?? "");

const norm = (s) => s.toLowerCase().replace(/\s+/g, " ").trim();

async function post(path, body) {
  const started = Date.now();
  const res = await fetch(`${OLLAMA}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  return { status: res.status, ms: Date.now() - started, json };
}

async function main() {
  // Wire check: the tool result handed to the model must be exactly what
  // Concord serves right now.
  const live = await fetch(
    `${CONCORD}/v1/verses/John%203:16?translations=KJV`,
  ).then((r) => r.json());
  const liveText = live.verses?.[0]?.text?.KJV;
  if (norm(liveText ?? "") !== norm(KJV_JOHN_3_16)) {
    console.error("Concord's live KJV text differs from the protocol's. Stop.");
    console.error("live:", liveText);
    process.exit(1);
  }

  await mkdir(outDir, { recursive: true });
  const options = numGpu !== null ? { num_gpu: Number(numGpu) } : undefined;
  const results = [];

  for (let t = 1; t <= trials; t++) {
    const nn = String(t).padStart(2, "0");
    const record = {
      model,
      trial: t,
      startedAt: new Date().toISOString(),
      options: options ?? "(ollama defaults)",
    };

    // Turn 1 — fresh conversation, the question, one tool declared.
    const req1 = {
      model,
      messages: [
        { role: "system", content: SYSTEM_TEXT },
        { role: "user", content: USER_TEXT },
      ],
      tools: TOOLS,
      stream: false,
      ...(think !== undefined ? { think } : {}),
      ...(options ? { options } : {}),
    };
    const res1 = await post("/api/chat", req1);
    record.request1 = req1;
    record.response1 = res1;

    const msg1 = res1.json?.message ?? {};
    const calls = msg1.tool_calls ?? [];
    const ref = calls[0]?.function?.arguments?.ref ?? "";
    const gate1 = {
      oneCall: calls.length === 1,
      rightTool: calls[0]?.function?.name === "lookup_verse",
      refIsJohn316: /^john\s*3\s*[:.]\s*16$/i.test(String(ref).trim()),
      contentEmpty: !msg1.content || msg1.content.trim() === "",
      noThinkTags: !/<think|<\/think|◁think/i.test(msg1.content ?? ""),
    };
    gate1.pass =
      gate1.oneCall &&
      gate1.rightTool &&
      gate1.refIsJohn316 &&
      gate1.noThinkTags;
    record.gate1 = gate1;

    let gate2 = { skipped: true, pass: false };
    if (calls.length >= 1) {
      // Turn 2 — append the assistant message verbatim, then the tool result.
      const req2 = {
        model,
        messages: [
          ...req1.messages,
          msg1,
          { role: "tool", tool_name: "lookup_verse", content: KJV_JOHN_3_16 },
        ],
        tools: TOOLS,
        stream: false,
        ...(think !== undefined ? { think } : {}),
        ...(options ? { options } : {}),
      };
      const res2 = await post("/api/chat", req2);
      record.request2 = req2;
      record.response2 = res2;

      const reply = res2.json?.message?.content ?? "";
      gate2 = {
        skipped: false,
        spanA: norm(reply).includes(norm(SPAN_A)),
        spanB: norm(reply).includes(norm(SPAN_B)),
        noThinkTags: !/<think|<\/think|◁think/i.test(reply),
        evalCount: res2.json?.eval_count,
        evalDurationNs: res2.json?.eval_duration,
        tokensPerSec:
          res2.json?.eval_count && res2.json?.eval_duration
            ? Number(
                (
                  res2.json.eval_count /
                  (res2.json.eval_duration / 1e9)
                ).toFixed(2),
              )
            : null,
      };
      gate2.pass = (gate2.spanA || gate2.spanB) && gate2.noThinkTags;
    }
    record.gate2 = gate2;

    // Footprint while the model is loaded, from Ollama itself.
    record.ps = await fetch(`${OLLAMA}/api/ps`).then((r) => r.json());

    record.mechanicalPass = record.gate1.pass && record.gate2.pass;
    results.push({
      trial: t,
      gate1: record.gate1.pass,
      gate2: record.gate2.pass,
      mechanicalPass: record.mechanicalPass,
      ref,
      tokensPerSec: gate2.tokensPerSec ?? null,
      psBytes: record.ps?.models?.[0]?.size ?? null,
    });

    await writeFile(
      join(outDir, `trial-${nn}.json`),
      JSON.stringify(record, null, 2),
    );
    console.log(
      `${model} trial ${nn}: gate1=${record.gate1.pass} gate2=${record.gate2.pass}` +
        (gate2.tokensPerSec ? ` (${gate2.tokensPerSec} tok/s)` : ""),
    );
  }

  const passes = results.filter((r) => r.mechanicalPass).length;
  await writeFile(
    join(outDir, "results.json"),
    JSON.stringify(
      { model, trials, mechanicalPasses: passes, results },
      null,
      2,
    ),
  );
  console.log(`${model}: ${passes}/${trials} mechanical passes → ${outDir}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
