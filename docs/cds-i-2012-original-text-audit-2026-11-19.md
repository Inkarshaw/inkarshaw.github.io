# UPSC CDS I 2012 GK — original-order English text transcription audit

**Date:** 19 November 2026  
**JSON:** `data/quizzes/cds-gk/cds-i-2012-gk.json`  
**Quiz reader:** `https://clearexams.ink/pyq-cds.html?paper=cds-i-2012-gk`

## Source and method

- Primary source: user-uploaded `CDS-I-2012.pdf`, **25-page English image-scanned UPSCPortal-marked reprint**, visually inspected on the first, middle and closing pages.
- This scan does **not** have a selectable original question text layer (normal text extraction only returns repeated UPSCPortal watermark); previous provisional JSON was legacy OCR that combined unrelated questions.
- The old JSON contained **92 text stems and 54 nominal four-option positions**. Crucially, its first item was the Kalinga Prize question from original **Q57** and its fourth item was a fragment of original **Q114**; many other nominally four-option positions were attached to the wrong original number.
- Rebuilt **all 120 original numbered English question positions** with distinct stems and four A–D text alternatives based on the user-provided scan and a source-numbered English typed comparison.
- Independently typeset **source-order match**: https://examvictor.com/cds-2012-gk-question-paper-1/
- Alternate printed paper comparison: https://www.careerpower.in/2018/CDS_2012_Set_I.pdf — beware this publication uses a **different question numbering order**. It was consulted to compare unclear option text, not used for the original numbering of this upload.
- The uploaded copy contains highlighted study annotations/answers in some places. These were excluded from question and option strings, and **no answer key is imported or inferred**.

## Important repairs

1. **Q1–4:** original starts with lack of atmosphere around the Moon, definition of a magnetic pole, turbulent smoke flow, and piano-wire vibrations. Earlier OCR assigned entirely different source questions to some of these numbers.
2. **Q5–15:** recovered the greenhouse-gas question, fiscal-statements codes, inflation-policy codes, European Union treaty options, cotton species, air pressure, and the three original quo warranto conditions with coded alternatives.
3. **Q16–40:** repaired fundamental duty, India–China trade, globalization, barium X-rays, element-group properties, human blood pH, Wimbledon, International Year of Chemistry, NIFTY statements and WTO source alternatives.
4. **Q23:** one website's OCR dropped leading pH digits. Text alternatives were checked against a separately typeset printed copy; the four values in JSON are **4.5–5.5, 5.5–6.5, 7.5–8.0, 8.5–9.0**, but should still be compared visually with the UPSC original.
5. **Q41–80:** restored geographic borders and longitude options; historic and governance questions; Q57 Kalinga Prize restored to correct number; Q59 DSC South Asian Literature matching codes; Q65 tiger reserve/state and Q69 battle/treaty matching tables; and four separate Permanent Settlement statements at Q73.
6. **Q81–100:** recovered National Commission for Women, Supreme Court language, energy, pendulum, atoms, GAGAN, Rajya Sabha, and the original Q98 naval exercise mapping.
7. **Q101–120:** transcribed final geography and polity, Coriolis statements, Shimla Viceregal Lodge, Hindu-law marriage assertions, first Doctrine of Lapse annexation, chronology, Q111 social reformer/association matching codes, Kanishka scholars, Sabin Award, Himadri, BISIN and PRAHAR missile.
8. **Q111:** visually compared the four source matching-code alternatives on uploaded page 23; kept sequences `4 2 1 3`, `4 3 2 1`, `4 1 2 3`, and `3 2 1 4`.
9. **Q115:** the independent web text extractor lost the second option; uploaded scanned page 24 includes **'reptiles'** as alternative B.
10. **Q108:** removed a study annotation inserted after original choice A in the uploaded scanned document; the question and the original four codes remain readable.

## Structural validation and outstanding items

- [x] Sequential question numbers 1–120.
- [x] All 120 original-numbered positions have English stem text and nonblank A, B, C and D option strings.
- [x] No unrelated question-number contamination remains in the reconstructed four-option positions based on the checks performed.
- [x] All correct answers `null`, each `scoreEligible=false` and `ungraded=true`, and `grading='disabled'`.
- [x] Catalog reports 120 stems, 120 provisional A–D sets and 0 blank text positions.
- [x] Regression guards added for Q1, Q4, Q7, Q8, Q23, Q36, Q44, Q57, Q59, Q65, Q69, Q73, Q98, Q104, Q111, Q115 and Q120.
- [ ] Full *word-for-word* visual comparison of every line against an **official UPSC-issued original paper**, beyond the annotated scan and the independent study versions.
- [ ] Record exact official booklet series/version and verify original formulae, subscripts, typography and punctuation.
- [ ] Map **official final answer key** after question/option-series verification and only then enable scored results.
- [ ] Execute the full Node test suite in an actual CI environment and independently smoke-test live production deployment.

## Publication interpretation

**120/120 English positions structurally complete** as an original-numbered, provisional study-source transcription. **Not yet an official verified verbatim original; not officially scored.** Alternate third-party source numbering must never override the order of the uploaded PDF.
