# CDS II 2013 General Knowledge — source-transcription audit

**Date:** 19 November 2026  
**Output:** `data/quizzes/cds-gk/cds-ii-2013-gk.json`  
**Quiz reader:** `https://clearexams.ink/pyq-cds.html?paper=cds-ii-2013-gk`

## Source evidence and method

- User-uploaded primary material: **`CDS-II-2013.pdf`**, 46 pages, image-scanned UPSC exam paper distributed with a UPSCPortal watermark. The PDF has no reliable selectable question text; extracted text contains only download watermark on most pages.
- The independent English typewritten mirrors were consulted to restore question-number alignment and printed alternatives from the scan:
  - https://www.myupscsyllabus.in/study-material/cds-2013-2-general-knowledge-paper-questions
  - https://www.careerpower.in/2018/CDS_2013_Set_II.pdf
  - https://www.leadthecompetition.in/QP/CDS/cds-2013-2-solved-paper.html
- Answer columns, where provided by independent mirrors, were **not** imported. Official UPSC key, source-series code, and verbatim comparison remain unverified.
- The earlier OCR records mixed stems and alternatives from unrelated questions. These were replaced for all **120 original numbered positions** with provisional English text and A–D options.
- Reader retains ungraded mode and preserves local response selection, except for unresolved source-figure questions.

## Numbers and definition of “complete”

- **120 / 120** number-sequenced question positions (1–120).
- **120 / 120** entries with nonempty typewritten stems and A–D strings.
- **1 known original map figure not digitized** (Q42). Q42 is **not** independently answerable.
- **0 questions certified verbatim**, **0 official keys matched**, **0 scorable results**.
- This is a *structurally complete provisional text draft*, not a certified reproduction of the UPSC-issued booklet.
- Exact per-question scanned source page locations have not yet been assigned for most positions; the quiz reader displays “Source PDF page not yet mapped” instead of falsely saying the text is missing.

## Important repairs

1. Q1–7: recovered the original common code for paired Statement I/Statement II questions and duplicated the code across individually selectable quiz questions.
2. Q8–30: restored biology, physics, chemistry, ecology and multiple-statement answer choices that had been mixed across different scanned columns.
3. Q38 and Q111: restored matching-list definitions (industrial centres and government commissions) and code alternatives.
4. Q42: the hydroelectric power station question references an original *numbered location map*. The figure is not embedded in the typed JSON. Retained original question-number position and A–D code strings, but marked `diagramRequired: true`, `diagramStatus: 'unresolved-original-figure'`, `sourceVisualVerified: false`. The quiz reader disables answer input for this question pending recovery.
5. Q70: reconstructed a previously garbled paragraph about partial decontrol of sugar industry.
6. Q88, Q95, Q98–100, Q112, Q117–118: recovered all enumerated statements and their separate A–D codes.
7. Q120: a typed mirror has a likely typographical error, writing D as “Neither 1 nor 1.” The provisional JSON uses “Neither 1 nor 2” and flags this normalization for visual check against the source scan.

## Quality / release checklist

- [x] All 120 positions have sequential IDs and nonempty text alternatives.
- [x] Distinct source-page mappings are not invented; missing mappings are represented honestly.
- [x] Original source map Q42 remains visibly unresolved rather than fabricated.
- [x] Correct answers are null and scoring eligibility false for all 120 positions.
- [x] Versioned catalog counts and regression safeguards updated.
- [ ] Recover and embed the actual original map for Q42 (from the uploaded or an official copy), then verify the four location codes match the displayed figure.
- [ ] Perform visual page-by-page checking of all 120 stems and option punctuation against the original scanned English test booklet.
- [ ] Record source test-booklet series and original page for each question.
- [ ] Match UPSC official final answer key to the confirmed booklet series.
- [ ] Run full repository CI and confirm production deployment.

## Publication status

**Typing complete at the text-field level, source fidelity and source-figure completeness incomplete.** No correct choices, official answer validation, or grades should be displayed.
