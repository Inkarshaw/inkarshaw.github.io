# CDS II 2016 General Knowledge — source-text transcription audit

**Date:** 19 November 2026  
**Output:** `data/quizzes/cds-gk/cds-ii-2016-gk.json`  
**Reader:** `https://clearexams.ink/pyq-cds.html?paper=cds-ii-2016-gk`

## Source and classification

- Input source: user-uploaded `CDS-II-2016.pdf`, 14 pages, Gradeup-marked third-party study PDF with embedded notes and annotation overlays.
- All 120 numbered study-PDF positions were reassembled from page-specific two-column text layouts on printed pages 2–13.
- Every position contains a typewritten provisional stem and four A–D option strings.
- No original UPSC booklet-series numbering is asserted. A separately printed **CDS II 2016 Series B** copy was used to cross-check several damaged strings; the source series may number the same question differently.
- **Provisional, ungraded study transcription:** `officialOriginalConfirmed=false`, `officialAnswerKeyChecked=false`, `grading="disabled"`. No inferred correct answers.

## Repairs and recoveries

- **Q1, Q3, Q8, Q10, Q12, Q15, Q87, Q108, Q109, Q119:** removed side-margin study annotations, percentages, and unrelated commentary accidentally merged into question or option text.
- **Q6:** restored all three numbered biological-reproduction possibilities and four answer choices.
- **Q14:** recovered four complete earthquake statements and the separate A–D coded answers.
- **Q26, Q32, Q34, Q41, Q42, Q44, Q65, Q116:** restored matching-list titles, List-I/II definitions, and code alternatives as readable text.
- **Q50:** removed subsequent shared directions from the previous question's four choices.
- **Q51–Q53:** restored the shared Statement-I/Statement-II choice legend to each playable item.
- **Q29:** source PDF drops option C and corrupts option B. Restored the original alternative text from an independent printed 2016 Series B paper (same question appears as Q119 in that version).
- **Q34:** study PDF prints a duplicated digit in the first matching-code option; recovered alternative A from independently printed Series B.
- **Q76:** recovered the source-omitted fourth answer alternative from separately printed Series B and normalized source's lowercase `c.` to option C.
- **Q96:** source text prints identical choices C/D, but separately printed Series B shows distinct choice C; recorded the correction in per-question issues.

## Cross-reference used

- UPSC examination archive: https://www.upsc.gov.in/examinations/previous-question-papers/archives
- Alternate printed Series B copy consulted for missing source options: https://ssbcrackexams.com/wp-content/uploads/2016/10/CDS-2-2016-GENERAL-KNOWLEDGE-QUESTION-PAPER-SET-B-PDF.pdf

**Important:** The alternate copy is hosted by a third-party publisher. References to its content are not a certification of official provenance or completeness.

## Structural checks

- [x] Exactly 120 sequential question numbers.
- [x] Every question has a nonempty stem and A, B, C, D text choices.
- [x] No remaining detected cross-question numbering in A–D choices.
- [x] Index reports 120 stems, 120 provisional choice sets and zero blank text positions.
- [x] Correct answers remain unset, and scoring disabled.
- [x] Tests added for repaired Q6, Q14, Q26, Q29, Q34, Q51–53, Q76, Q96, Q108, Q116.
- [ ] Word-for-word visual comparison of all 120 questions with an original UPSC CDS II 2016 booklet, recording its test booklet series and official question numbers.
- [ ] Check superscripts, subscripts, punctuation, and the formatting of all matching-list tables against images of the official booklet.
- [ ] Match an official final answer key to a confirmed booklet series.
- [ ] Smoke-test the live deployed ClearExams reader and verify hosting/CDN synchronization.

## Status

**Source study transcription structurally complete; official verbatim/source-fidelity verification and scoring incomplete.** 
