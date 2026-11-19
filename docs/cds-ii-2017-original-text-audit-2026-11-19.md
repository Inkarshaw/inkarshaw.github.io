# CDS II 2017 GK — source-order transcription audit

Date: 19 November 2026

## Evidence and publication status

- Input: user-uploaded **CDS-II-2017.pdf** (Gradeup-marked, third-party annotated/re-typeset English study paper; 14 pages).
- Indexed output: `data/quizzes/cds-gk/cds-ii-2017-gk.json`.
- Reader: `pyq-cds.html?paper=cds-ii-2017-gk`.
- All **120 printed positions** now have a provisional question stem and four option strings (A–D). Existing 107 records were changed in the two-column reassembly and special-case handling.
- **Not a certified verbatim official transcription**. The uploaded source and OCR/text-layer data need comparison with UPSC's original printed booklet, including all visuals and math.
- **Ungraded**: all 120 `correctAnswer: null`, `scoreEligible: false`, `ungraded: true`; no official answer key mapped.

## Material recovery changes

1. Reassembled page-specific left and right text columns from PDF pages 2–13, avoiding the previous cross-column mixing of stems and options.
2. **Q1/Q4:** removed side-margin location annotations that were previously treated as printed question text.
3. **Q7:** reconstructed cell organelle/function matching list and four code options. This third-party PDF repeats label `B.` for *Lysosomes*; list label normalized by position to `D.` while retaining the source discrepancy as an issue.
4. **Q16:** source identifier is rendered `16S.` in the uploaded PDF; original-numbered question 16 restored using the visible text and options. Official source spelling/numbering remains to be confirmed.
5. **Q32–36:** reconstructed all five Statement I/II stems and repeated the common printed Assertion–Reason code. Q36 Statement II continues onto the following page.
6. **Q49–52, Q76, Q79, Q81–82, Q99, Q101, Q104:** reconstructed source matching tables and their A–D choice mappings in a text-readable format.
7. **Q58:** the study source lists `ferromagnetic material` for both A and B. This potentially incorrect duplication is preserved and flagged rather than silently corrected.

## Incomplete source illustrations — do not treat as playable

- **Q82 (page 9)** refers to the numbered locations of Satpura, Vindhya, Aravalli and Mahadeo ranges **on a map**; the map figure is not digitized in the source text.
- **Q101 (page 11)** refers to numbered locations of Tripura, Mizoram, Nagaland and Manipur **on a map**; the map figure is not digitized in the source text.
- Both questions retain source-numbered positions and A–D code choices, but are marked `diagramRequired: true`, `diagramStatus: unresolved-original-figure`, `sourceVisualVerified: false`.
- The ClearExams reader has been updated to mark these questions incomplete and **disable answer-selection controls** until the map artwork is recovered.
- Neither figure nor map identifiers have been fabricated.

## Audit checklist

- [x] Positions 1–120 present in order, no duplicate numbers.
- [x] Each numbered record has a nonempty stem and four provisional text alternatives.
- [x] Unresolved original map figures explicitly flagged for Q82 and Q101.
- [x] Shared answer-code alternatives preserved; no correct answers inferred.
- [x] Catalog index matches JSON provisional coverage counts.
- [x] Reader disables selections for missing-map questions.
- [ ] Recover original Q82 and Q101 map graphics from the UPSC-issued paper.
- [ ] Confirm source-specific formatting, chemistry notation, maps and handwritten annotation removal against official paper.
- [ ] Map official final key only after the printed original version is confirmed.
- [ ] Verify production deployment and smoke-test all 120 positions on the live website.

**Current classification:** a structurally complete **provisional typed study draft**, not a complete fully answerable or officially verified original PYQ paper.
