# ClearExams PYQ scoring source audit — 13 November 2026

## Scope and verification boundaries

Eight published TNPSC/TNUSRB original-numbered text quizzes contain 1,420 attendable positions. After this patch, **1,157 may receive provisional practice marks**, and **263 remain ungraded**. Provisional marking does not mean that the complete original paper has been visually certified verbatim, that a final key is always available, or that the quiz is an official result.

Do not increase the scorable count simply because an editorial or coaching answer seems mathematically correct. Original-numbered question text, all four/five answer alternatives, any figures, source booklet version, and the board's appropriate key must align.

## Resolved on this pass — TNPSC Group IV 2022 Q19

- Defect: the supplied Q19 transcription retained ordinary numeric entries **876, 543, 321, 369** but lost the printed Tamil-digit matching column. The record was incorrectly incomplete and excluded from grading.
- Restored candidates are **1=௩௬௯ (369); 2=௩௨௧ (321); 3=௫௪௩ (543); 4=௮௭௬ (876)**. Matching gives **(a)4, (b)3, (c)2, (d)1 = C**.
- A copy of the scanned `CCS4T/2022` booklet preserves the Tamil numeral column at original Q19, printed page 7: https://govtjobsnet.com/docs/q-and-a/tnpsc-group-4-tamil-question-paper-2022.pdf
- The independently indexed Q19 text corroborates original-numbered inputs and A–D matching pattern, though its extracted Tamil-digit words are visibly corrupted: https://aspirantsync.com/tutorials/previous-year-questions/group-4/2022/general-tamil/
- The independently recorded official TNPSC Version A final-key choice is **C**: https://www.tnpsc.gov.in/Document/Answerkeyfinalresult/07_22_GR_IV_FINAL_KEY.pdf
- Outcome: mark Q19 **secondary-source-text-cross-checked / provisionally scorable**; do **not** certify the paper or Q19 as TNPSC-hosted visually verbatim on this evidence alone. Q19's local answer/exam sessions still retain the original question number and option letters.
- Coverage changes: 2022 Group IV **195 → 196 provisionally scorable**. The four `ALL` final-key entries remain ungraded.

## Highest priority — TNPSC Group I 2026, 200 unmapped

TNPSC's official dashboard confirms 27 September 2026 preliminary exam, Subject Code **497**, and a **6 October 2026 tentative answer key**. TNPSC states that answers are ticked in its *specimen booklet* and that key objections use that specimen's numbering irrespective of the question booklet code received by a candidate:

- Official dashboard: https://tnpsc.gov.in/web/examdashboard/index.aspx?notid=33aa5415-6205-4ae9-842e-212d62d088f1
- Official tentative subject notice: https://tnpsc.gov.in/english/Tentativesubjects.aspx?key=04ac5d92-6953-47c2-aab9-d963014ae443
- Official specimen PDF: https://tnpsc.gov.in/Tentative/Document/05_2026_CCSEI-GS.pdf

**Critical numbering trap:** a separate 2026 coaching answer guide lists the diseases matching question (Minamata/Itai-Itai/Black foot/Blue baby) at its question 1, but ClearExams' supplied numbered text has that question at **Q4**. Its correct-choice letter `B` cannot be copied into original-numbered ClearExams Q1. Question-text and all A–E options must be matched to the official specimen; the coaching guide is *not* the TNPSC key.

The seven corrupted/nontext-safe supplied questions remain **Q13, Q35, Q94, Q96, Q98, Q192 and Q200**. Source figures for Q98 and Q200 cannot be invented. Source 2026 Group I grading remains disabled until the complete specimen-number, printed choice and tick correspondence is independently verified.

## Remaining 63 exceptions outside the 2026 key mapping

- **31 special ALL entries** are not fabricated answer gaps. They remain excluded under the current ClearExams indicative scoring policy pending an explicit board-by-board final marking-policy decision.
- **32 source disputes** remain: TNUSRB SI 2015 accounts for **24**, TNUSRB SI 2020 for **7**, and TNUSRB SI 2010 for **1**.
- Particularly risky entries: 2015 production-chart Q99–104 use an approximate comparison drawing, *not verified original booklet point values*. The seven 2020 disputed source records include Q47 matrices and Q84/Q95/Q103 illustrative/redrawn figures. The 2010 Q64 mirror key conflicts. None is assigned marks.

## Working review ledger and publication gate

The source register is `data/quizzes/pyq-scoring-review.json`. Run `python3 scripts/build_pyq_scoring_queue.py` to generate the exact 263-row `data/quizzes/pyq-source-review-queue.csv`; PR CI executes `--check` to reject stale reviews.

For each candidate, capture the exact paper edition/series and printed Q number; verify the stem and all options; inspect source diagrams when applicable; compare the correct edition's official key; record the source URL and review conclusion; change data and score eligibility only after both content and key checks; update the derived register, catalog and public text; run Node/Chromium tests. Keep a disputed question ungraded when the underlying primary source cannot be reached or independently reconciled.
