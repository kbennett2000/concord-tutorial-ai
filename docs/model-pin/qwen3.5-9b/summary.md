# qwen3.5:9b — trial summary (reviewed)

Score: **10/10** (mechanical flags and human review agree).
Measured footprint while loaded (`/api/ps`, max across trials): **5.64 GB**.

Perfect run. Every reply quotes the wire text verbatim; trials 04/06 quote bare, the rest add a one-line lead-in. DISQUALIFIED on the footprint ceiling: 5.64 GB measured > 5.5 GB.

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
