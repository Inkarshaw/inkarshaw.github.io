# CDS II 2018 General Knowledge — source-order transcription audit

Date: 19 November 2026

## Source and scope

- User-provided `CDS-II-2018.pdf`, 12-page annotated/third-party study PDF (Gradeup watermark); not an independently verified UPSC official booklet.
- Output: `data/quizzes/cds-gk/cds-ii-2018-gk.json`; site reader: `pyq-cds.html?paper=cds-ii-2018-gk`.
- All 120 original numbered positions were extracted in source column reading order, with strings for alternatives A–D. This is **source-transcribed, provisional text**, not a certified verbatim official copy.
- Grading remains disabled; official final answer key has not been mapped; `correctAnswer: null` and `scoreEligible: false` for every position.

## Corrections

1. Reassembled all 120 numbered positions from PDF pages 2–12 using per-page two-column layout rather than the previous cross-column text stream.
2. Repaired original Q2, which had previously been overwritten with unrelated Government of India Act content; that content belongs to Q61.
3. Restored the displayed fractions in Q8 as four selectable mathematical expressions.
4. Repeated the shared printed Assertion–Reason answer code for original Q72–75 in each interactive question.
5. Separated Q71 (MSP crop choices) from the following shared instructions.
6. Checked Q114 (the original short stem `SWAYAM is`) as legitimate text, not a missing question.
7. Preserved source question numbers and did not infer correct options or allow provisional scoring.

## Remaining source-verification exceptions

- **Q2:** The PDF text extraction reads `CH3(g) + ½ O2 → CO + 2H2` whereas the stem references `CH4`. This is explicitly flagged in JSON; inspect the exact printed mathematical line in an official booklet before declaring verbatim or amending the chemical formula.
- **Q8:** Source fractions and the symbols for liquid densities were reconstructed from the study PDF's two-dimensional text layout; check the mathematical display against the printed original.
- **Q27 and other chemistry/mathematics:** Subscripts, superscripts and stacked fractions can be lossy in machine text. These remain provisional until source-image review.
- **Q72–75:** Shared Assertion–Reason instructions are repeated for accessibility; those full sentences are not individually repeated at every question position in the paper.
- **All 120:** Official source, printed bilingual wording/diagrams and official answer key require separate validation. Structural completeness is not evidence of exact official reproduction.

## Validation checklist

- [x] 120 ordered question objects, numbered 1 through 120.
- [x] Every question has nonempty stem and A–D text.
- [x] Table/fraction/shared-code issues above recorded in source issues.
- [x] JSON index reports 120 stems and 120 provisional four-option sets.
- [x] No official-verbatim certification, key inference or scoring enabled.
- [ ] Compare every item and all figures against an official UPSC CDS II 2018 GK question paper.
- [ ] Independently map the UPSC official final answer key to this paper version.
- [ ] Conduct rendered interactive-quiz and screen-reader QA on the live deployed site.

**Status:** complete *ungraded study transcription*, pending source-fidelity and final-key audit.
