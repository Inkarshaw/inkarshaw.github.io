# UPSC CDS I 2010 General Knowledge — original-numbered English transcription audit

**Date:** 19 November 2026  
**Question JSON:** `data/quizzes/cds-gk/cds-i-2010-gk.json`  
**Reader:** `https://clearexams.ink/pyq-cds.html?paper=cds-i-2010-gk`

## Primary source and methods

- Input: user-uploaded `CDS-I-2010.pdf`, 14-page **selectable-text, two-column study-paper reprint** marked UPSCPortal. The original Q1 is the noodles flavouring-agent question, Q4 is about the coil of a heater, Q21 is the global economic crisis, and Q120 is the four-stone projectile-angle question.
- Cross-checked the source through a second online copy: https://static.upscportal.com/files/CDS_Exam-Paper-1-General-Knowledge-2010_www.upscportal.in.pdf
- Independent numbered text used for source-reprint discrepancy checks: https://examvictor.com/cds-2010-gk-question-paper-1/
- The original machine-extracted JSON had **80** nominal four-option positions, but several were **wrongly matched** to other numbers due to left/right column interleaving and embedded table code letters. These should not be counted as validated original MCQs.
- Corrected **all 40 originally incomplete positions**: first 18 with targeted source-page transcription and then 22 remaining positions from the numbered source PDF. Some additional already four-option records were repaired due to incorrect original question assignment.
- Final JSON contains **120 original-numbered English stems and four A–D text alternative strings**, sequentially 1–120.
- No official answer key was imported. All `correctAnswer` values remain `null`, all `scoreEligible` values `false` and `ungraded` `true`. `grading` remains `disabled`.

## Notable repairs

1. **Q2–4:** original roadside-pollution plant, sugar-source matching-list and *heater-coil* questions; older OCR Q2 and Q4 contained material from unrelated Q21 and Q80.
2. **Q16–17, Q21–24 and Q26–27:** recovered full numbered sub-statements and options across the source's two columns.
3. **Q35, Q41–42, Q53 and Q56:** restored the rain-sequence and matching-list definitions with separate A–D coded answers.
4. **Q62, Q66, Q70, Q74–75, Q77 and Q79–81:** restored multistatement questions and four choices, rather than the original OCR's blank alternatives.
5. **Q92:** contains a printed shaded-district map of India. The four group-name choices and question text are available, but **the original map has not been embedded in the quiz**. JSON sets `diagramRequired: true`, `diagramStatus: 'unresolved-original-figure'`, `sourceVisualVerified: false`; reader disables answer selection until the actual figure is supplied.
6. **Q97:** the uploaded PDF text extraction presented a clearly corrupted year and inserted `Rohit Sharma` for **2020**, a decade after the paper's exam year. The second PDF indexed online and an independent numbered paper instead present the question as the **2008** joint Khel Ratna awards with four lettered options. These original-order text choices were recovered; exact official source-year fidelity remains to be checked.
7. **Q100:** source question and four aircraft-carrier choices continue over PDF pages 11–12; restored the full stem.
8. **Q110–115:** restored organic farming true/false codes, toxic-substance table, eyesight, iodine, alloys and Eucalyptus questions.
9. **Q120:** restored the second column continuation and 15°/30°/45°/60° alternatives.

## Integrity and outstanding work

- [x] 120/120 original-numbered positions in the paper JSON and index.
- [x] 120/120 English positions have nonempty stems and A–D text values.
- [x] Q92 missing visual flagged and disabled, not fabricated.
- [x] Q97 reprint-date anomaly explicitly recorded on the question.
- [x] Correct answers unset, grades disabled, and original-verbatim status false.
- [x] Added paper-specific regression assertions covering Q4, Q21, Q42, Q53, Q78, Q92, Q97, Q100, Q110–114 and Q120.
- [ ] Digitize and verify **Q92's original shaded map**. Do not infer/replace map geography from the answer choices.
- [ ] Review all 120 options for exact source letter order and reprint punctuation, including list/matching tables.
- [ ] Independently compare the supplied study reprint against an **official UPSC-issued CDS I 2010** paper and identify the question-booklet series.
- [ ] Match the official answer key only after establishing series/printing identity.
- [ ] Execute the complete automated CI suite and verify actual live hosting/deployment of the updated quiz.

**Important:** This is a **structurally complete provisional English text draft**, not a certified verbatim official booklet, not fully visual-complete, and not a scorable answer-key-validated paper.
