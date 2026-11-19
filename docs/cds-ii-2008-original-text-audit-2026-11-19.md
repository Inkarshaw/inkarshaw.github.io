# UPSC CDS II 2008 General Knowledge — typewritten source-paper audit

**Date:** 19 November 2026  
**Question JSON:** `data/quizzes/cds-gk/cds-ii-2008-gk.json`  
**Reader:** `https://clearexams.ink/pyq-cds.html?paper=cds-ii-2008-gk`

## Input and process

- The user-uploaded source is **`CDS-II-2008.pdf`**, a **10-page English selectable-text, two-column UPSCPortal-marked study-paper reprint**, including a printed answer table on the last page.
- All 120 question numbers were recovered by reading left and right columns in the original source-page order. The earlier automatic parser had 95 nominally complete A–D records; many were contaminated by adjacent-column stems, answer codes or marginal annotations. A nominally complete item is not necessarily an officially verified original question.
- The edited JSON now contains **120/120 nonblank provisional English stems and all four options**. **No official answer keys were imported**, despite the study reprint displaying its own answer table.
- Source classification remains unverified: `officialOriginalConfirmed=false`, `officialAnswerKeyChecked=false`, `grading="disabled"`, and `correctAnswer=null` / `scoreEligible=false` / `ungraded=true` for every question.
- An exact visual comparison with a UPSC-issued original CDS II 2008 booklet and its corresponding official answer key has **not** occurred.

## Source repairs

1. **Q1:** reprint labels both Northern and Southern Blotting as `(c)`. Retained four visible printed choices and provisionally assigned the final alternative to letter D. Exact official printing still unconfirmed.
2. **Q5:** reprint labels the final Black Phosphorus alternative as a duplicate `(b)`. Repaired A–D labelling. The printed chemical formula for phosphorus trioxide appears malformed (`PP3`) and requires official verification.
3. **Q9:** recovered original Sarkaria Commission question and A–D options, previously lost among marginal “1983” notes and the first page's columns.
4. **Q13, Q15, Q26–27, Q38, Q47, Q76:** removed reprint margin commentary such as nuclear plant locations, anniversary dates, historical years, geography hints and gas percentages mistakenly merged into options or question text.
5. **Q18, Q20–21:** recovered four-option codes and their matching-list entries for sportspersons, occupations and artists.
6. **Q35–36, Q38, Q62, Q65, Q69–70, Q79, Q95, Q110, Q113, Q115 and Q119:** reassembled numbered statements, matching tables and their source-order letter alternatives.
7. **Q40:** corrected answer alternatives previously mixed with the following shared Assertion–Reason instructions.
8. **Q41–45:** restored source Assertion and Reason stems and repeated the four common printed answer-code descriptions for independently selectable questions; removed the misread `Assertion (A)` source marker from alternative A.
9. **Q97 and Q99–103:** corrected right-column order and separated a large composite question/option corruption; reconstructed Q101 source location matching table.
10. **Q120:** removed the printed study-booklet **answer table** that was mistakenly merged into options for the last question.

## Remaining source fidelity issues

- Study paper includes obvious apparent typos and editing in chemistry formula/option letters; a complete **official UPSC booklet visual review** is needed before treating the paper as verbatim.
- The four-option strings are source-order English study transcriptions, not validated official-answer alternatives.
- Original diagrams, fonts, punctuation, capitalization and tabular presentation may differ from the typeset source, even when readable text is captured.
- The study reprint has an answer table on PDF page 10, but its keys have **not** been compared with any UPSC final official key and are **not** used for scoring.

## Structural verification

- [x] Exactly 120 numbered questions, 1–120 in order.
- [x] All 120 positions have a nonblank stem and A, B, C, D nonblank strings.
- [x] Catalog totals reflect 120 stems, 120 provisional text-choice sets, zero blank text positions.
- [x] Printed answer table excluded from Q120 and not imported as grades.
- [x] No `correctAnswer` assigned; all scoring disabled.
- [x] Added regression source checks for Q1, Q5, Q8, Q9, Q18, Q40–45, Q76, Q99, Q101 and Q120.
- [ ] Inspect every item against the original UPSC CDS II 2008 General Knowledge examination paper, including any figure and handwritten/source-layer anomalies.
- [ ] Identify booklet series, confirm precise question text and A–D option order, and verify official final key.
- [ ] Run complete automated repository CI and smoke-test the production ClearExams reader.

**Classification:** structurally complete **provisional English study-source transcription**. This is not a certified verbatim UPSC original, not official-key-validated, and not scored.
