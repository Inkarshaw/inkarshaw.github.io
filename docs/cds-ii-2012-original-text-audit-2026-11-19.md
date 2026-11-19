# UPSC CDS II 2012 General Knowledge — source-order typewritten audit

**Date:** 19 November 2026  
**Quiz JSON:** `data/quizzes/cds-gk/cds-ii-2012-gk.json`  
**Reader:** `https://clearexams.ink/pyq-cds.html?paper=cds-ii-2012-gk`

## Evidence and scope

- Input uploaded by the user: `CDS-II-2012.pdf`, **56 scanned bilingual English/Hindi pages**, distributed with an UPSCPortal watermark.
- The original English pages were inspected visually. The scanned booklet begins with **Q1: Neptune / methane** and seven Statement I–Statement II questions. Existing auto-OCR JSON had mismatched columns and assigned the **bus-speed** question to Q1; in the uploaded booklet it is **Q47**.
- Independent typed text comparison: https://examvictor.com/cds-2012-gk-question-paper-2/ — matches the original uploaded booklet numbering. Other typed/reprinted sources such as https://www.leadthecompetition.in/QP/CDS/cds-2012-2-solved-paper.html and https://iasexamportal.com/cds/papers/solved-paper-2012-2-paper-1-general-knowledge can differ in ordering or quality, so they were not used to override the uploaded booklet's numbering.
- **All 120 English question positions** have a provisional stem and the four A–D alternative strings in the original uploaded booklet's number order.
- No question is marked as officially verbatim-verified, and **no official answer key** has been mapped. Every `correctAnswer` remains `null`, every `scoreEligible` false, every `ungraded` true.
- The source's **Hindi-language pages remain untranscribed**. This is an *English-only typewritten draft*, not a complete bilingual transcription.

## Important recovered areas

1. Q1–7: original common Statement I–Statement II answer legend repeated for the independently selectable quiz questions.
2. Q8–18: recovered Indo-Iran partnership, army and navy, Sufism, Indian history and the printed multiple-statement options, removing inconsistent OCR assignment.
3. Q19–45: science, geography, polity, original list-code multiple-choice text and the incomplete hill-station map question.
4. Q46 and Q47: restored source order of capacitor and bus-speed questions. Previous OCR had Q47's bus stem at Q1 and unrelated alternatives.
5. Q49–50, Q74, Q92, Q103: restored four sequence/matching-code alternatives and List-I/II definitions instead of treating column labels as answer alternatives.
6. Q54, Q58–59, Q62, Q65, Q80, Q93–95, Q98–99, Q101, Q114–15: recovered separate numbered statements and their coded choices.
7. Q103: checked four historic Indian Councils/Government of India Acts' matching codes against the original scanned page 42. Final `D` code is `1 4 3 2`.
8. Q107: checked mineral-to-map four answer codes against scanned page 44. The map is in the source but not digitized into the quiz.
9. Q116: checked options and existence of the annotated wind-belt diagram on scanned page 50; image not yet embedded in the quiz.

## Outstanding figures — presently not fully playable

- **Q26:** original *hill-station locations* map, required to match Dharamsala, Almora, Nainital and Darjeeling.
- **Q107:** original *mineral-producing centres* numbered map, visible on the uploaded PDF's English page 44.
- **Q116:** original *latitude/wind-belts* diagram, visible on uploaded PDF's English page 50.

All three source question numbers and text choices exist, but JSON sets `diagramRequired: true`, `diagramStatus: 'unresolved-original-figure'`, and `sourceVisualVerified: false`. The ClearExams reader disables selecting an answer for these positions until the actual images are embedded. Do not reconstruct geographical map markers from an answer key.

## Validation

- [x] 120 records in sequential source order, no duplicate numbering.
- [x] All 120 English stems and four A–D strings are populated.
- [x] Shared assertion codes and matching/list questions have individually selectable options.
- [x] Three diagram-dependent questions flagged as not fully playable; no invented graphics.
- [x] Index counts synchronized: 120 English stems, 120 provisional A–D text sets, 0 blank *text* positions.
- [x] Unverified grading disabled and all answers unset.
- [x] English-only language state declared; Hindi scan transcription remains outstanding.
- [x] Regression source guards added for source Q1, Q2, Q47, Q103, Q107 and three visual gaps.
- [ ] Extract/embed original 3 source figures into versioned ClearExams quiz assets.
- [ ] Transcribe/review corresponding Hindi source text where bilingual reproduction is required.
- [ ] Visually check every question/choice against the actual 56-page scanned examination source, including punctuation and formulas.
- [ ] Confirm original booklet identity/series and match final official UPSC answer key.
- [ ] Run CI suite and production deployed quiz smoke test.

**Classification:** 120/120 provisionally typewritten **English** text/choice entries; not a fully playable, source-fidelity-certified or bilingual original paper. 
