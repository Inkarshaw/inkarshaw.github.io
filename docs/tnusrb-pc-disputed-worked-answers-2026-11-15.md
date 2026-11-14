# TNUSRB Police Constable 2019/2020 — contested worked-answer safeguards (15 November 2026)

## Why this change is necessary

The user-supplied 2019 Booklet B and 2020 Booklet D transcriptions each offer 80 attendable Tamil study questions, but neither booklet has a publication-verified, booklet-matched official final answer key in the ClearExams record. Their workbook answers must not be treated as official marks. Several answers are not merely unverified: the exact source wording conflicts with the reported worked answer, allows several interpretations, or lacks information needed for a single answer.

This update introduces `studyAnswerReliability: "disputed"` only where an existing question's `editorialNote` records a concrete problem. The original numbered question, all four choices, supplied workbook answer(s), and prior metadata remain in source control for editorial comparison. The learner interface **withholds the contested workbook answer and option-by-option worked explanations** while displaying the source caveat. The learner can still attempt the question. No marks are granted.

## Explicit source-review queue

| Paper | Original Q | Issue to resolve |
| --- | ---: | --- |
| 2019 B | 55 | Literal option B uses an AND/OR contradiction; intended zero-product rule requires OR. |
| 2019 B | 64 | More than one original option follows from the stated premises; single answer is unsound. |
| 2019 B | 66 | Missing supporting passage; reported choice C is not demonstrated. |
| 2019 B | 69 | Absolute statement about rabies transmission is not always true; secondary answer conflicts. |
| 2019 B | 71 | Printed grid does not determine one consistent numeric pattern. |
| 2019 B | 72 | Two listed options can both describe the animal group. |
| 2020 D | 4 | Source spells `திரவமானி (Thermometer)`, but Archimedes' principle is a hydrometer principle, not a liquid thermometer principle. |
| 2020 D | 5 | Project-director attribution combines missions with different responsible directors. |
| 2020 D | 34 | State solar-production superlative lacks a date and specified metric. |

For 2020 Q4, the misleading parenthetical **is kept as reported** rather than silently being replaced with `Hydrometer`: at the independently indexed [2020 question page, numbered Q49](https://civilserviceaspirants.in/Tnusrb/Question-Paper-with-Answer/Tnusrb-pc/Tnusrb-pc-2020-5.php), the same `(Thermometer)` and Archimedes alternative appear. This is corroboration of the *source problem*, **not** an official final-key confirmation. The indexed page's numbering is not the ClearExams Booklet D numbering; never use it to map a key letter automatically.

## Release invariants

- All 310 Police Constable 2019/2020/2022 source-numbered questions remain playable. Original-number positions and option letters are unchanged.
- 2019: 80 questions ungraded; 6 contested workbook answers withheld.
- 2020: 80 questions ungraded; 3 contested workbook answers withheld.
- 2022: 141 provisionally scorable of 150; its two all-options-accepted positions and seven unverified original-figure positions stay ungraded.
- No source dispute is automatically assigned a "correct" or "incorrect" label. The `studyAnswer` field is retained only in the audit data, not endorsed in the student view for disputed positions.
- The separate eight-paper TNPSC/SI scoring register remains 1,420 playable / 1,157 provisionally scorable / 263 ungraded; these 310 PC questions remain in their independent catalogue.
- To clear an item, obtain the precise paper booklet/series and printed page, inspect all original alternatives and any figures, compare the authentic matched final key, and record editorial approval. Do not clear merely because a coaching-page answer agrees with a textbook concept.

Automated guards: `tests/test_tnusrb_pc_pyq.mjs` checks exact reviewed numbers and zero score eligibility; `assets/js/tnusrb-pc-quiz.js` hides disputed workbook answer letters and solution claims on check and end-of-paper review while continuing to show full source cautions.
