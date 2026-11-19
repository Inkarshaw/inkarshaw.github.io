# UPSC CDS II 2011 General Knowledge — typewritten English paper audit

**Completed working draft:** 19 November 2026  
**JSON:** `data/quizzes/cds-gk/cds-ii-2011-gk.json`  
**Reader:** `https://clearexams.ink/pyq-cds.html?paper=cds-ii-2011-gk`

## Input and evidence

- User-uploaded `CDS-II-2011.pdf`: 44 scanned bilingual English/Hindi pages (UPSCPortal-marked copy). Original page 2 starts at Q1 with `Statement I: El Nino` and ends the first common-code series at Q7.
- Independently numbered **English** references were consulted for unreadable wording and alignment:
  - https://iasexamportal.com/cds/papers/solved-paper-2011-ii-paper-i-general-knowledge
  - https://examvictor.com/cds-2011-gk-question-paper-2/
- Important distinction: an alternative 2011 PDF at `https://www.careerpower.in/2018/Set_2_CDS_2011.pdf` renumbers the non-Assertion–Reason questions from 1, whereas the uploaded bilingual source numbers them from **8**. **The uploaded source numbering 1–120 is retained**; the alternate paper's question IDs are not copied into the quiz.
- All 120 numbered English question stems and original-order A–D option strings are now **provisionally typed**. Some punctuation and spelling are normalized from OCR; no claim is made of a verified verbatim official printing.
- The source contains Hindi pages; these are **not yet transcribed**.

## Substantive corrections

1. Q1–7: restored the source's original paired Statement I/Statement II questions and repeated the shared four-option code for individual quiz selection. The initial OCR had wrongly assigned Q90's CCTNS question to Q1.
2. Q8–30: corrected source question numbers, geographical alternatives and enumerated sub-statements, including local wind matching table Q27.
3. Q31–40: reconstructed Hollywood actress identification, NCC, international/current affairs and other source questions with each option A–D.
4. Q41–80: reassembled original India/history, political and economics questions, including Q50 state-category options, Q63 Dadabhai Naoroji's drain theory and Q74 legislative list mapping. Removed machine cross-column contamination.
5. Q81–120: retyped original constitutional, chemistry, biology and physics questions, including CCTNS Q90, the Five-Year Plan matching table Q92 and acid/source table Q110.
6. Q95: an image of original scanned page 36 was directly checked for the convex-lens alternatives. Option D reads `maximum for yellow light` in this copy, so it is retained, without inferring the correct choice.

## Integrity and interpretation

- [x] `questions` contains 120 objects, consecutively numbered 1–120.
- [x] Every original position contains a nonblank English stem and four nonblank A–D options.
- [x] Question order matches the uploaded English scan's initial source pages; some remaining positions rely on independent numbered transcriptions pending full visual page-by-page audit.
- [x] `stats.textStems=120`, `stats.provisionalFourOptionSets=120`, `stats.missingOrPartialPositions=0`.
- [x] All correct answers are `null`; all `scoreEligible=false`; `ungraded=true`; full `grading='disabled'`.
- [x] `transcribedLanguages=['English']` and `unresolvedSourceLanguages=['Hindi']`.
- [x] Regression tests cover shared Q1–7 options, CCTNS numbering Q90, Q92 matching codes and last Q120.
- [ ] Compare each exact word, spelling, diagram/table and punctuation against the original UPSC-issued booklet.
- [ ] Complete the original Hindi question text.
- [ ] Independently verify official final answer key for the correct paper/booklet series.
- [ ] Run repository CI and production reader smoke-test.

## Caveats

**Text fields complete does not mean fully source-verified or exam-ready.** The source is a scanned bilingual paper, and the reader is an English-only provisional transcription. Source-markers and separately published answer keys must not be interpreted as official UPSC key provenance.

**Publication state:** Full original-numbered *English* draft; no scoring, answer-key confirmation, bilingual completion or verbatim certification.
