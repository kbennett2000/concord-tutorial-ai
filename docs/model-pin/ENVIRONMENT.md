# Trial environment — recorded 2026-06-12

Every transcript in this directory was produced on this machine, in one
session, against these exact versions. One real run set — yours will
differ.

## Software

| Component           | Version                                                                                                     |
| ------------------- | ----------------------------------------------------------------------------------------------------------- |
| Ollama              | `0.30.7` (user-level manual install — see [INSTALL-TRANSCRIPT.md](INSTALL-TRANSCRIPT.md))                   |
| Concord             | `ghcr.io/kbennett2000/concord:v1.2.0` (digest `sha256:1bc5a456…`), healthz: 15 translations, 435,951 verses |
| OS                  | Ubuntu 26.04 LTS, Linux 7.0.0-22-generic x86_64                                                             |
| Node (trial runner) | v22 (zero-dependency runner, built-in `fetch`)                                                              |

## Hardware

| Part | Spec                                            |
| ---- | ----------------------------------------------- |
| GPU  | NVIDIA GeForce RTX 5070, 12 GB VRAM             |
| CPU  | Intel Core i7-9700KF, 8 cores @ 3.60 GHz (2019) |
| RAM  | 60 GB                                           |

Default trials ran with the GPU available (Ollama's default offload).
The `cpu-forced/` runs under each candidate set `options: {"num_gpu": 0}`
— the model entirely on the CPU — to measure what a no-GPU machine
feels like. **No 8 GB machine was available**; the 8 GB criterion is
applied via the measured `ollama ps` footprint ceiling (≤ 5.5 GB), not
via felt experience on real 8 GB hardware.

## Models as pulled (2026-06-12)

| Tag           | ID             | Disk   | Params | Quant  | Requires        |
| ------------- | -------------- | ------ | ------ | ------ | --------------- |
| `qwen3.5:9b`  | `6488c96fa5fa` | 6.6 GB | 9.7B   | Q4_K_M | ollama ≥ 0.17.1 |
| `qwen3.5:4b`  | `2a654d98e6fb` | 3.4 GB | 4.7B   | Q4_K_M | ollama ≥ 0.17.1 |
| `llama3.1:8b` | `46e0c10c039e` | 4.9 GB | 8.0B   | Q4_K_M | —               |
| `lfm2.5:8b`   | `9cf756159fc2` | 5.2 GB | 8.5B   | Q4_K_M | ollama ≥ 0.30.0 |
| `qwen3.5:2b`  | `324d162be6ca` | 2.7 GB | 2.3B   | Q8_0   | ollama ≥ 0.17.1 |

Licenses, from `ollama show --license`: the qwen3.5 line is
**Apache 2.0**; `llama3.1:8b` is the Llama 3.1 Community License;
`lfm2.5:8b` is the LFM Open License v1.0.
