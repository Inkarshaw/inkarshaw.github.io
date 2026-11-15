# TNPSC Group I 2022 — typed PYQ source audit (15 November 2026)

## Scope and authority
- Official source: [TNPSC CCS1P/22 bilingual tentative-answer booklet](https://www.tnpsc.gov.in/Tentative/Document/2022_16_CCS1P_2022_TENTATIVE_ANSKEY.pdf).
- Booklet series printed in the PDF: **β**. Printed question numbers Q1–Q60 were inspected on PDF pages 3–40 (PDF page number, first cover counted as page 1).
- Dataset: `data/quizzes/tnpsc-group1-multiyear-typed-draft.json`, entry `year: 2022`.
- Editorial status: **60 adapted English study stems**, each with four A–D choices in the original booklet order. `E` is rendered by the quiz player as **Answer not known**.
- Text and options are **not certified verbatim copies**; Tamil source wording is viewable in the official PDF. No score is calculated while a matching final-key mapping remains incomplete.

## Problems fixed
The prior 2022 adapted set included claims that Q80 was the Lahore Congress session and Q143/Q154–Q157 were miscellaneous history and aptitude items. Their question-number mapping was not independently established. Those records were withdrawn from the playable 2022 list rather than allowing false source-number alignment.

The original booklet places **cigar smoke at Q1**, the **upward-projected ball at Q2**, **DNA unwinding at Q4**, the **Great Trigonometrical Survey at Q22**, and **Tiruchirappalli Proclamation at Q35**. The typed sequence now follows the printed numbers throughout Q1–Q60, with stored `sourcePdfPage` on every item.

## Illustrated item
**Q54, PDF page 37** is a ring/sector diagram. It is presented as an **explicit text-only interpretation** listing the four relevant pairs and centre values; `editorialFigureText: true` is required. It must not be described as a verbatim original figure. The original PDF page is linked directly from the quiz.

## Quality gates
1. Exactly 60 distinct, sequential original positions, Q1–Q60, and complete four-choice A–D alternatives.
2. Explicit visual source metadata on all entries; page range 3–40.
3. All 60 remain `keyStatus: unmapped`, `accepted: []`, and `grading: not-graded`. The 2022 paper’s visible **tentative** tick marks are not a validated final-key mapping.
4. No secondary-reader link is shown for 2022 because the earlier source reorders the numbered items.
5. The year-wise catalogue shows **60/200**; the all-years paper also has separate official-PDF answer-sheet mode.

## Remaining work
- Examine TNPSC 2022 **Q61–Q200**, then certify Tamil study translations separately from the original source text.
- Locate and audit the complete official final key **for this exact 2022 booklet/version**, including any deleted or multiple-accepted entries, before enabling scoring.
- Continue the partial 2015, 2017, 2019, 2021, 2024 and 2025 typed banks, independently checking original numbering and figures rather than following a coaching-site question ordering.
