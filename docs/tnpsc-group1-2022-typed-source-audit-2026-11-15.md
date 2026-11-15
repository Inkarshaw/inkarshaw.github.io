# TNPSC Group I 2022 — typed PYQ source audit (15 November 2026)

## Scope and authority
- Official source: [TNPSC CCS1P/22 bilingual tentative-answer booklet](https://www.tnpsc.gov.in/Tentative/Document/2022_16_CCS1P_2022_TENTATIVE_ANSKEY.pdf).
- Booklet series printed in the PDF: **β**. Printed Q1–Q60 were source-checked on PDF pages 3–40; Q61–Q100 were additionally aligned to the official searchable bilingual text and representative PDF screenshots on pages 41–66 (PDF page number, first cover counted as page 1).
- Dataset: `data/quizzes/tnpsc-group1-multiyear-typed-draft.json`, entry `year: 2022`.
- Editorial status: **100 adapted English study stems**, each with four A–D choices in the original booklet order. `E` is rendered by the quiz player as **Answer not known**.
- Text and options are **not certified verbatim copies**; Tamil source wording is viewable in the official PDF. No score is calculated while a matching final-key mapping remains incomplete.

## Problems fixed
The earlier coaching-derived 2022 items were withdrawn when their numbering could not be trusted. Subsequent direct comparison with the TNPSC booklet **confirmed** that Q80 does in fact concern the 1929 Lahore Purna Swaraj declaration; it is now restored from the official source, rather than the coaching sequence. Q143 and Q154–Q157 remain excluded from this typed source-checked segment pending their own page audit.

The original booklet places **cigar smoke at Q1**, the **upward-projected ball at Q2**, **DNA unwinding at Q4**, the **Great Trigonometrical Survey at Q22**, and **Tiruchirappalli Proclamation at Q35**. The typed sequence now follows the printed numbers throughout Q1–Q100, with stored `sourcePdfPage` on every item.

## Illustrated item
**Q54, PDF page 37** is a ring/sector diagram. It is presented as an **explicit text-only interpretation** listing the four relevant pairs and centre values; `editorialFigureText: true` is required. It must not be described as a verbatim original figure. The original PDF page is linked directly from the quiz.

## Quality gates
1. Exactly 100 distinct, sequential original positions, Q1–Q100, and complete four-choice A–D alternatives.
2. Stored source pages on all entries, PDF pages 3–66. The first sixty have earlier visual-review provenance; Q61–Q100 were checked against the official PDF text layer with visual samples on Q61–62, Q65–66, Q73, Q89 and Q99.
3. All 100 remain `keyStatus: unmapped`, `accepted: []`, and `grading: not-graded`. The 2022 paper’s visible **tentative** tick marks are not a validated final-key mapping.
4. No secondary-reader link is shown for 2022 because the earlier source reorders the numbered items.
5. The year-wise catalogue shows **100/200**; the all-years paper also has separate official-PDF answer-sheet mode.

## Remaining work
- Examine TNPSC 2022 **Q101–Q200**, then certify Tamil study translations separately from the original source text.
- Locate and audit the complete official final key **for this exact 2022 booklet/version**, including any deleted or multiple-accepted entries, before enabling scoring.
- Continue the partial 2015, 2017, 2019, 2021, 2024 and 2025 typed banks, independently checking original numbering and figures rather than following a coaching-site question ordering.

## Follow-on batch: Q61–Q100
- Official booklet source pages: 41–66; all 40 positions align to the TNPSC numbering and A–D option ordering. The A–D alternatives are compressed/rewritten for readability and need verbatim certification separately.
- Representative printed-page screenshots were inspected at Q61/Q62, Q65/Q66, Q73, Q89/Q90 and Q99. The other positions were compared to the indexed official PDF text layer, **not individually visually certified**.
- Q80 is the verified 1929 Lahore Congress item; Q86 retains clearly dated and scientifically outdated human-race terminology from the historical examination, without presenting that typology as current science.
- Official source PDFs contain visible *tentative* answer ticks. All entries remain **ungraded** until the appropriate **final** booklet-specific key has been mapped.
