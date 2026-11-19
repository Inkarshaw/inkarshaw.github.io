# UPSC CDS I 2008 GK — original-numbered English transcription audit

**Date:** 19 November 2026  
**Question JSON:** `data/quizzes/cds-gk/cds-i-2008-gk.json`  
**ClearExams reader:** `https://clearexams.ink/pyq-cds.html?paper=cds-i-2008-gk`

## Source and classification

- Primary source: user-uploaded **`CDS-I-2008.pdf`**, a 10-page UPSCPortal-marked **English two-column selectable-text reprint**, with an answer table at the end of the document.
- All 120 original-numbered question positions, 1 through 120, were reassembled left-column then right-column, handling questions continuing between PDF pages.
- An earlier machine parser had only 92 nominally complete A–D sets and wrongly assigned Q93's Consultative Committees text to Q2 and Q11 chronological-event text to Q4.
- Newly committed paper has **120 nonblank English question stems and A–D text alternatives**. Some question/table typography and phrasing are normalized into standalone readable text; this is a **provisional study-source transcription**, not official-booklet word-for-word certification.
- The reprint's embedded answer table was deliberately **not used for grading**. All `correctAnswer=null`, `scoreEligible=false`, `ungraded=true`; `grading='disabled'`, `officialAnswerKeyChecked=false`, `officialOriginalConfirmed=false`.

## Notable repairs

1. **Q2** was restored to the source highest-peak question, correcting wrong cross-column Parliament Committee text.
2. **Q4** recovered the original country/currency matching question (Myanmar–Baht, Thailand–Kyat, Cambodia–Riel, Vietnam–Rupiah).
3. **Q7, Q11 and Q17** restored South-West Monsoon statements, historical-event chronology and pure-water pH options.
4. **Q21** removed the *following* Assertion–Reason shared directions that the source text layer had interleaved into the four fog-question alternatives.
5. **Q22–25** restored complete Assertion–Reason stems and repeated the original four-option shared code for self-contained quiz play.
6. **Q25** study PDF's extracted text truncates Reason (R) after “before any”; a separate original-numbered typeset reproduction provides the final word **“court”**, which is now explicitly documented rather than silently invented. Comparison source: https://iasexamportal.com/CDS/COMBINED-DEFENCE-SERVICE-EXAMINATION-2008-Held-on-17-02-2008-IV
7. **Q42, Q44, Q64, Q87, Q90 and Q98** reconstructed side-by-side matching tables as independently readable sequential List-I and List-II paragraphs, retaining original code alternatives and letter ordering.
8. **Q114** study reprint's choice C is printed as “Both 1 only 2”. It was normalized to “Both 1 and 2” with a per-question issue; exact original wording remains to be checked against the UPSC-issued booklet.
9. **Q120** original final question about easily digestible protein restored, without merging the study reprint's appended answer sheet into the last question.

## Structural checks

- [x] Exactly 120 sequentially numbered English positions; no duplicate numbering.
- [x] Every source position contains a nonempty English stem plus all four text options.
- [x] Index summary matches 120 stems, 120 provisional A–D text sets and 0 incomplete *text* positions.
- [x] Q22–25 share the common Assertion–Reason answer-code alternatives.
- [x] Reconstructed matching tables retain the original A–D numeric code sequences.
- [x] No official answer/key certification, no ungrounded choices, no question enabled for scoring.
- [x] Regression assertions added for source Q2, Q4, Q7, Q11, Q17, Q21–25, Q42, Q44, Q90, Q98, Q114 and Q120.
- [ ] Compare the 120 stems and all options against an **official UPSC-issued CDS I 2008 original** including exact symbols and page layout.
- [ ] Check study-PDF typos (particularly Q25 and Q114) against the actual booklet edition and any alternative numbering/series.
- [ ] Match official final answer key only after series identity and source wording are confirmed.
- [ ] Execute full automated CI suite and live production quiz smoke test.

**Classification:** 120/120 structurally complete English typed positions, **not yet** verified verbatim, not official-key mapped and not scorable.
