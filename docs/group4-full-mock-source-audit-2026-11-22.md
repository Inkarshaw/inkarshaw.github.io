# TNPSC Group IV 2022-based practice — source quality review
Date: 22 November 2026

## Source and status
- Practice bank: `data/quizzes/tnpsc-group4-full-mock-1.json`
- Official source scan: https://www.tnpsc.gov.in/Tentative/Document/CCS4T_2022_OPT.pdf
- Final answer key: https://www.tnpsc.gov.in/Document/Answerkeyfinalresult/07_22_GR_IV_FINAL_KEY.pdf
- Official current scheme: https://tnpsc.gov.in/English/scheme.html
- Exam structure implemented: 100 Tamil (150 marks), 75 General Studies, 25 Aptitude, three hours (300 marks total). Part A must reach 60/150 before Part B evaluation; the overall indicative minimum is 90/300.

**Content classification at the time of this audit:** 193 question positions use user-supplied, provisional 2022 paper transcriptions; 7 are separate original ClearExams practice questions substituted for figure-dependent/officially ungradable positions. No draft-derived item has completed a *full independent verbatim and option-by-option source verification*. The total fully certified count remains **zero**. These labels must not be upgraded based only on this spot check.

## Visual spot checks
The official PDF is a scanned, annotated booklet. The following source-numbered positions were manually inspected in its page images, using PDF pages 3 and 23:
- Q1, Q2, Q3, Q4 — PDF page 3.
- Q84, Q85, Q86, Q87 — PDF page 23.

Three editorial discrepancies were corrected in the two linked JSON files:
1. Q1 option D: `தன்னமின்மை` → `தன்னலமின்மை`.
2. Q2 question wording: corrected `இப்படுமொழி` to `இப்பழமொழி` and restored the source phrase `‘சிலை மேல் எழுத்து போல்’`.
3. Q85 verse phrase: `இணையில்மை` → `இணையில்லை`.

The eight sampled positions were visually reviewed but have **not** been independently certified as word-for-word exact in every detail; the unreviewed positions may contain additional typos. The bank cannot be advertised as verified original-paper text.

## Editorial workflow
Use `docs/group4-full-mock-editorial-review-queue.csv` to review *all 200 positions*. For every source-derived question, compare the exact stem, numbers, special Tamil text, all five printed choices (including E), official question number, diagrams and official series-specific final answer. Record original PDF page and reviewer/verification date. Flag every damaged visual or missing source string; never invent a reconstruction.

The source scan may show handwritten answer ticks. Candidates should avoid reading these while attempting the mock.

## Progress preservation when content changes
The player stores compact, per-question fingerprints. If an updated bank differs from the one used to start an unfinished attempt, only answers and review flags belonging to the changed positions are cleared, and the original deadline remains unchanged. Legacy sessions without fingerprints receive the targeted three-position correction (Q1, Q2, Q85); their other responses remain intact. A visible status message explains what happened. Finished results remain saved locally and reopen in the same browser without generating duplicate completions or scores in history.

The full paper is a **provisional practice simulation**, not an authenticated verbatim TNPSC reproduction. Do not imply that zero verified source questions or seven separately authored practice replacements have completed editorial approval.
