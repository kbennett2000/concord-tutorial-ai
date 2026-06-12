# qwen3.5:4b — trial summary (reviewed)

Score: **10/10** (mechanical flags and human review agree).
Measured footprint while loaded (`/api/ps`, max across trials): **3.78 GB**.

Perfect run. Every reply quotes the wire text verbatim (bare quote or one-line lead-in). 3.78 GB measured — well under ceiling.

| Trial | Verdict | Reviewed reason                             |
| ----- | ------- | ------------------------------------------- |
| 01    | pass    | tool call + verbatim quote, human-confirmed |
| 02    | pass    | tool call + verbatim quote, human-confirmed |
| 03    | pass    | tool call + verbatim quote, human-confirmed |
| 04    | pass    | tool call + verbatim quote, human-confirmed |
| 05    | pass    | tool call + verbatim quote, human-confirmed |
| 06    | pass    | tool call + verbatim quote, human-confirmed |
| 07    | pass    | tool call + verbatim quote, human-confirmed |
| 08    | pass    | tool call + verbatim quote, human-confirmed |
| 09    | pass    | tool call + verbatim quote, human-confirmed |
| 10    | pass    | tool call + verbatim quote, human-confirmed |

Raw evidence: `trial-NN.json` beside this file (full request/response
JSON, untrimmed); CPU-forced feel run in `cpu-forced/`.
