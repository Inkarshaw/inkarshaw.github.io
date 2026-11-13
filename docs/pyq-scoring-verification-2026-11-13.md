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

**13 November follow-up — five study-text repairs:** Compared the unofficial TNPSC Factory 2026 PDF by screenshot and reconstructed Q13 (person/place table; guide Q154/PDF p183), Q35 (243-series Article table; guide Q8/p10), Q94 (HCF exponents; guide Q174/p209), Q96 (Fibonacci formula; guide Q125/p149), Q192 (cube and fractions; guide Q97/p118). Each record stores its source URL, third-party guide number and PDF page. These are not visually certified original TNPSC booklet texts. Only **Q98 and Q200** still lack the authentic printed dice figures. The count improves from **193 to 198 readable study entries**; all 200 remain unscored because the TNPSC key's source-position correspondence has not been authenticated. Guide: https://tnpscfactory.com/blog/tnpsc-factory-group-1-2026-answer-key.pdf

## Remaining 63 exceptions outside the 2026 key mapping

- **31 special ALL entries** are not fabricated answer gaps. They remain excluded under the current ClearExams indicative scoring policy pending an explicit board-by-board final marking-policy decision.
- **32 source disputes** remain: TNUSRB SI 2015 accounts for **24**, TNUSRB SI 2020 for **7**, and TNUSRB SI 2010 for **1**.
- Particularly risky entries: 2015 production-chart Q99–104 use an approximate comparison drawing, *not verified original booklet point values*. The seven 2020 disputed source records include Q47 matrices and Q84/Q95/Q103 illustrative/redrawn figures. The 2010 Q64 mirror key conflicts. None is assigned marks.

## Working review ledger and publication gate

The source register is `data/quizzes/pyq-scoring-review.json`. Run `python3 scripts/build_pyq_scoring_queue.py` to generate the exact 263-row `data/quizzes/pyq-source-review-queue.csv`; PR CI executes `--check` to reject stale reviews.

For each candidate, capture the exact paper edition/series and printed Q number; verify the stem and all options; inspect source diagrams when applicable; compare the correct edition's official key; record the source URL and review conclusion; change data and score eligibility only after both content and key checks; update the derived register, catalog and public text; run Node/Chromium tests. Keep a disputed question ungraded when the underlying primary source cannot be reached or independently reconciled.

## 13 November follow-up — Q98 and Q200 secondary visual recovery

Q98 and Q200 now display **originally redrawn, source-attributed ClearExams study SVGs**, based on separately indexed illustrated 2026 question pages, not scanned TNPSC-hosted specimen images. Sources: [Q98 visual](https://arivark.com/assets/img/pyq/g1-2026-q98-dice.png) and [Q200 visual](https://arivark.com/assets/img/pyq/g1-2026-q200-dice-nets.png) under [2026 question page](https://arivark.com/tnpsc-group-1-question-paper-2026). Both figures remain **source-review warnings** and are *not* independently original-verified. Neither figure is supplied as an official correct answer.

Q98 earlier OCR alternatives read `A=2, B=3, C=5, D=6`. The published indexed paper versions at ArivArk, GovtJobsNet and Athiyaman independently align on **`A=2, B=4, C=5, D=6`**; Q98 B was corrected to **4** and the source provenance is attached. Q200 A–D previously displayed meaningless `[Image A]` placeholders; they now show labelled candidate nets in the original editorial SVG and legible `Figure (A)` etc. Neither gets marks until the official TNPSC specimen and tick mark are checked.

The 2026 Group I bank still records **198 independently readable text entries + 2 secondary visual study entries with original-source verification pending** and **zero scored answers**. Across all eight papers: **1,420 playable / 1,157 provisionally scorable / 263 ungraded**.

## 13 November — TNUSRB SI 2015 Open Candidates bilingual graph study review

I re-inspected the separate Athiyaman 2015 subject-grouped coaching PDF screenshots at [page 25](https://athiyamanteam.com/wp-content/uploads/2019/05/TN-Taluk-SI-2015-Question-Paper-140-Questions-Police-SI-Athiyaman-Team.pdf#page=25) and [page 26](https://athiyamanteam.com/wp-content/uploads/2019/05/TN-Taluk-SI-2015-Question-Paper-140-Questions-Police-SI-Athiyaman-Team.pdf#page=26). Their compiled Q84–89 are aligned by stem/choices to original-numbered secondary transcript Q99–104; this does **not** establish primary TNUSRB booklet identity or original graph point coordinates.

All six Q99–104 now have original editorial Tamil *study translations* and bilingual **method-only** explanations: compare P+Q, percentage change in Q, 1992 P-to-Q percentage, two-year Q difference, P percentage decrease, and P increase. No value is read from an imprecise plot for purposes of a declared correct answer; no scoring, answer-key tokens or option letters were changed. Each record carries a third-party source URL, compiled question number and printed page, and explicitly states that the original TNUSRB booklet is unverified.

**Q100 discrepancy is still open:** the original-numbered secondary study archive prints C=1996, whereas the independently grouped 2015 Athiyaman PDF page 26 prints C=1995 (same as a separate We Shine Academy indexed source). The public quiz preserves the numbered archive's text and visibly discloses both alternatives, but awards **zero marks**. The public index at [ExamSiri](https://www.examsiri.com/stategovt/TamilNadu/tnusrb-si/2015/tamil-nadu-tnusrb-si-23-may-2015) links an additional 2015 paper (Drive-hosted); its bytes and printed booklet/series were not independently inspected and should be treated as a *source lead*, not certification.

Updated language coverage: **16 editorial Tamil study entries** (Q11–20 and Q99–104); not 16 TNUSRB-original-certified translations. Totals stay **140 playable / 116 provisionally scorable / 24 ungraded** for SI 2015 and **1,420 / 1,157 / 263** across eight published typed banks. Only the Open Candidates material is in scope.
