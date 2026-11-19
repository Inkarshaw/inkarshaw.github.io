# CDS I 2017 General Knowledge — source-order typewritten audit

Date: 19 November 2026

## Source material

- User-uploaded `CDS-I 2017.pdf`, a 14-page Gradeup/third-party re-typeset study PDF.
- Reassembled the English question text in original numbered sequence from PDF pages 2–13, retaining 120 numbered records in `data/quizzes/cds-gk/cds-i-2017-gk.json`.
- The final source PDF page 14 is a blank/footer page and does not introduce question 121.
- Corrected 104 existing question records, using per-page column boundaries rather than the previous mixed-column stream.

## Recovery details

- **Q11:** restored the stacked fraction `C/7` among the capacitor alternatives.
- **Q28:** restored the fractional resistance options `5R`, `(5/4)R`, `(4/5)R`, `R/5`.
- **Q29:** represented PDF private-font rho symbols and inequality signs with readable Unicode.
- **Q81:** restored the two matching lists (Rowlatt Act, Salt March, Chauri Chaura Incident, Second Round Table Conference) and their four codes separately.
- **Q110:** separated the subsequent assertion-reason directions that previously contaminated the printed answer alternatives.
- **Q111–112:** transcribed both statements and repeated the source's shared four-code answer legend so each question is individually selectable; excluded handwritten/third-party margin answer annotations.
- **Q113:** repaired option segmentation caused by the internal initials `Dr. B. R. Ambedkar`.

## Structural validation

- [x] Exactly 120 positions, original-numbered 1–120.
- [x] Each numbered position contains a nonblank question stem and A–D choice text.
- [x] No cross-column numbered question was detected inside another question's option text.
- [x] Index and paper's reported provisional text counts both equal 120.
- [x] No answer key mapping; each record retains `correctAnswer: null`, `scoreEligible: false`, `ungraded: true`.
- [x] Regression tests cover restored mathematical notation, source numbering, shared-code questions, and ungraded status.
- [ ] Confirm all wording, mathematical signs, answer-code layout and any diagrams against the official UPSC CDS I 2017 General Knowledge question paper.
- [ ] Independently reconcile official final answer key to the exact original series.
- [ ] Verify deployed full-paper reader on the live ClearExams site.

## Publication claim

**Structurally complete typewritten study draft, not a verified verbatim official original.** The input is a third-party annotated PDF; source text itself can contain re-typing and mathematical notation errors. Scoring is intentionally disabled pending official verification.

Official archive (for later checking): https://www.upsc.gov.in/examinations/previous-question-papers/archives
