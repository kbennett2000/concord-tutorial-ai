# llama3.1:8b — trial summary (reviewed)

Score: **9/10** (mechanical flags and human review agree).
Measured footprint while loaded (`/api/ps`, max across trials): **5.27 GB**.

9/10. Trial 03's tool call was perfect but the final reply DESCRIBED the verse instead of quoting it — a real instruction miss, human-confirmed. All other replies quote verbatim.

| Trial | Verdict | Reviewed reason                                                                                                               |
| ----- | ------- | ----------------------------------------------------------------------------------------------------------------------------- |
| 01    | pass    | tool call + verbatim quote, human-confirmed                                                                                   |
| 02    | pass    | tool call + verbatim quote, human-confirmed                                                                                   |
| 03    | FAIL    | Reply described the verse ('states the fundamental message of Christianity…') instead of quoting the tool text — gate 2 fail. |
| 04    | pass    | tool call + verbatim quote, human-confirmed                                                                                   |
| 05    | pass    | tool call + verbatim quote, human-confirmed                                                                                   |
| 06    | pass    | tool call + verbatim quote, human-confirmed                                                                                   |
| 07    | pass    | tool call + verbatim quote, human-confirmed                                                                                   |
| 08    | pass    | tool call + verbatim quote, human-confirmed                                                                                   |
| 09    | pass    | tool call + verbatim quote, human-confirmed                                                                                   |
| 10    | pass    | tool call + verbatim quote, human-confirmed                                                                                   |

Raw evidence: `trial-NN.json` beside this file (full request/response
JSON, untrimmed); CPU-forced feel run in `cpu-forced/`.
