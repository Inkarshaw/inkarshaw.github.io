# ClearExams Bulk PYQ Validation Report — 16 November 2026

## Scope
- **TNPSC Group IV 2022, Booklet A**: 200 question positions (Q1–Q200), all have draft text and A–E options. Q1–100 Tamil, Q101–200 English study transcription.
- **TNPSC Group I Preliminary 2011, Series D**: 200 question positions (Q1–Q200), all have official-key entries and links to the authoritative 68-page original TNPSC scanned PDF; typed question text/options/diagrams are not present.

## Automated structural checks
| Check | 2022 Group IV | 2011 Group I |
|---|---:|---:|
| Consecutive unique numbering | 200 / 200 | 200 / 200 |
| Answer-key entries present | 200 / 200 | 200 / 200 |
| Typed question text and all available options | 200 / 200 | 0 / 200 (scan-linked) |
| Verified verbatim full-paper source comparison in this operation | 0 / 200 | 0 / 200 |
| Provisional/indicative scoring positions | 192 | 192 |
| Ungraded special or visual-review positions | 8 | 8 |
| Structural validation errors | 0 | 0 |

## Answer key audit and corrections
**2022 Group IV official key**: Verified all 200 published Version A entries against the TNPSC final-key table at
https://www.tnpsc.gov.in/Document/Answerkeyfinalresult/07_22_GR_IV_FINAL_KEY.pdf .
The former ClearExams stored mapping differed at exactly five positions:
| Question | Previously stored | Correct official Version A |
|---:|:---:|:---:|
| 176 | B | A |
| 177 | C | A |
| 178 | A | B |
| 179 | A | B |
| 180 | B | A |

These five are corrected in the branch's `data/quizzes/original-final-keys.json` and in the new 2022 export. Original special key entries **ALL: Q105, Q117, Q134, Q197**, **A/B/C/D: Q109** remain literal and ungraded. Multiple-accepted keys (A/C, C/D, A/B, B/C) are preserved with accepted letter arrays.

**2011 Group I Series D**: The existing ClearExams Series D key contains 200 entries and references TNPSC's final-answer-key scan at https://www.tnpsc.gov.in/static_pdf/anskeys/05_06_2011_g1_gk.pdf . All key codes are syntactically valid, but this operation has **not independently audited every 2011 letter against the four-page scan**. Eight `ALL` entries are excluded from indicative scoring.

## Source text, figures and unknowns
- **2022 source-text statuses**: 185 `user_transcription_unverified`, 14 previously marked `official_pdf_spot_checked`, 1 `secondary_source_text_cross_checked`. These statuses were inherited from existing ClearExams data; the current operation did not independently re-transcribe the original 2022 booklet. Accordingly **no question is certified verbatim**.
- **2022 original visual items**: Q172 (triangles), Q173 (cube), Q179 (letter-number code). Q172 and Q173 have existing editorial digital figure assets linked in the JSON but their pixel-faithfulness to the original booklet is not certified; Q179 has no image asset. All three are ungraded. Original paper link https://www.tnpsc.gov.in/Tentative/Document/CCS4T_2022_OPT.pdf .
- **2011 original source**: https://tnpsc.gov.in/static_pdf/dptpreviousyearquestion/IDPC.pdf . This scanned PDF is required for all 200 questions. No text or source page mapping has been fabricated. Full transcription, per-question page mapping and diagram inventory remain unresolved.
- **E option** (2022) is *Answer not known*, not a right answer; it is never included in `correctOptions`. `ALL` official entries are kept but not automatically awarded marks pending authoritative rules.

## Explicit limitations
1. **2022 is a complete playable typed-DRAFT quiz, not a verified verbatim original transcription.** All 200 records require visual source comparison before certification.
2. **2011 is a complete original-paper-linked answer-sheet quiz, not a typed quiz.** The official PDF must be opened to read the question and see diagrams.
3. A correct answer-key entry does not prove question wording, answer-option alignment or diagrams have been verified.
4. The HTML viewer contains all 400 positions and can run locally without loading JSON. Original TNPSC PDFs and editorial 2022 SVGs require access to their linked websites.
5. The GitHub changes are confined to a dedicated branch; they are not deployed to the live ClearExams website.

## Deliverables
- `tnpsc-g4-2022-complete.json`
- `tnpsc-g1-2011-complete-paper-linked.json`
- `clearexams-tnpsc-2022-2011-combined.json`
- `clear-exams-pyq-2022-2011-play.html`
- `unresolved-questions.csv` (400 distinct original positions, each with review flags)

**Outcome**: 400/400 original-numbered positions packaged; 200 source-text drafts and 200 scanned-PDF-linked positions; all key fields present; five wrong 2022 website key entries corrected on the review branch; no fabricated missing text, question figures or page numbers.

## 17 Nov 2026 addendum
2011 now incorporates 200 English adapted source-page-inspected questions from the current main quiz; not a certified verbatim original transcript. Q129 and Q185 have typed-answer versus final-key-manifest disagreement and are ungraded, leaving 190 eligible. The new 2015 GS0811 ω paper has 200 official-key positions (32 adapted typed, 168 source-only) and separate 600-position bundle. See validation-report-600.md.
