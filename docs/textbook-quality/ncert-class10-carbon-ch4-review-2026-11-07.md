# NCERT Class 10 Science — Chapter 4 bilingual quiz expansion

**Date:** 7 November 2026  
**Chapter:** Carbon and its Compounds  
**New content:** 40 original MCQs, four independent 10-question sets. Each item includes English and Tamil stems, four answer choices, one keyed response, English and Tamil explanations, and a printed-page topic reference.

## What is covered

| Set | Questions | Main concepts | Approximate NCERT printed pages |
| --- | ---: | --- | --- |
| Covalent bonding and catenation | 10 | electron sharing, N₂, methane, molecular properties, diamond/graphite, chains, saturation, C₆₀ | 59–63 |
| Homologues and naming | 10 | structural isomerism, alcohol/carboxyl groups, –CH₂– increment, alkene formula, ketones, alkynes, aldehydes | 64–67 |
| Reactions | 10 | balanced combustion, oxygen supply and soot, oxidation, hydrogenation, substitution | 69–71 |
| Alcohols, acids and soaps | 10 | sodium and ethanol, dehydration, vinegar, esterification, saponification, carbonates, micelles, hard water | 72–76 |

## Textbook evidence and limitations

- **Official chapter link:** https://ncert.nic.in/textbook/pdf/jesc104.pdf
- **Readable reference:** https://files.supercop.in/ncert-books/2025/class10/jesc104.pdf — *reprint 2025–26, not proof of 2026–27 correspondence.*
- The chapter text from the 2025–26 PDF was inspected by section to check general concepts and printed-page placement. Direct retrieval of the official chapter link timed out, and a visual screenshot of the large reference PDF could not be obtained. Therefore neither current-edition page alignment nor image-only figure details are independently certified.
- None of the new items requires interpreting an inaccessible figure or diagram as a fact source. No NCERT exercise passage is reproduced as a question stem.
- The English questions, Tamil translations, distractors and explanations were generated as original practice material. The Tamil text has **not** been certified by an independent Tamil-medium textbook reviewer, and no full item-by-item source sign-off has been made.
- Published sets carry `reviewStatus: editorial-review-pending`, `source.mirrorEdition: 2025–26` and `source.pageReferenceEdition: 2025–26` to prevent silent claims of current-edition certification.

## Repository validation

- `node tests/test_ncert_school_book_quiz.mjs`: unique IDs/stems, exactly four distinct options, one numeric answer index, English/Tamil scripts and explanations, chapter page bounds, expected answer indexes and correct chapter source.
- `node tests/test_quiz_coverage.mjs`: current bank totals and 4/13 mapped Class 10 chapters without pretending to certify full chapter coverage.
- `node tests/smoke_student_journey.mjs`: mobile Chromium navigation and dynamic coverage display.

**Remaining:** Independent comparison against the currently prescribed original 2026–27 English source, bilingual language review, adversarial answer-key review and further practice expansion beyond the first 40 questions. Other Class 10 Science chapters remain only partially mapped.
