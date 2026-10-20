# Class 10 Science — Laws of Motion bilingual MCQ audit

**Date:** 20 October 2026  
**Bank:** `data/textbook/class-10/science/unit-1.json`  
**Textbook:** [Tamil Nadu State Board Class 10 Science, Unit 1 (2019 English chapter PDF)](https://cdn1.byjus.com/wp-content/uploads/2019/04/Tamilnadu-Board-Class-10-Science-Textbook-Chapter-1.pdf)

## Inventory and completed review batches

The chapter has **580 MCQs in 29 sets of 20**. Six consecutive quality batches now review **all 29 quiz sets (questions 1–580)** and preserve all 580 question IDs, the existing 29 quiz sets, and the answer concepts while clarifying equivalent numerical display options.

Review improvements:
- Make both English and Tamil explanations identify their actual keyed answer, then explain the physical principle or calculation.
- Extend inadequate numerical explanations and retain signed vectors, units and relevant formulas.
- Standardise answer-option formats for Earth's central gravity, the inverse-square altitude example and lunar fall-time calculation.
- Remove metatextual stems asking for the answer *in the textbook*: question 77 (gravitational constant), 122 (parallel forces), 130 (Newton's second law), and 138 (Earth's mass). These questions now test physics directly.
- Confirm the chapter concepts against the printed government textbook, especially inertia, forces, torque, impulse, gravitation and the value of G.

All 580 questions now meet the targeted basic criteria: four distinguishable options in both languages, explicitly keyed bilingual explanation, adequate rationale length and consistent numerical answer format. Separate frozen-answer tests cover all six batches; the full-bank audit is required to pass CI before merge.

## Second review batch: quizzes 6–10

Questions 101–200 received additional EN/Tamil explanation alignment and worked calculations. Eleven MCQs also received clearer, consistent answer-option presentation for gravitation, vectors, circular motion, impulse and torque (Q115, Q116, Q120, Q124, Q142, Q148, Q169, Q178, Q188, Q191, Q196). Q124 and Q196 specifically align the order of numerical values across the languages; these had represented formatting mismatches rather than different mathematical answers.

A dedicated `tests/test_class10_science_unit1_review6_10.py` freezes the 100 bilingual keyed answers and requires the unchanged 580-question bank plus a zero-error and zero-warning audit of that window. The additional review batches are documented below.

## Third review batch: quizzes 11–15

Questions **201–300** now have keyed English–Tamil explanations and expanded rationales for shorter numericals. Seven option sets required targeted revision: Q213 (zero momentum), Q215 (zero gravitational field between unequal masses), Q218 (elevator scale), Q255 (equilateral-force resultant), Q286 (balanced forces), Q293 (perpendicular inelastic collision), and Q295 (surface gravity ratio). The Q215 correct answer's numeric sequence was aligned across English and Tamil without changing its physical meaning.

The new `tests/test_class10_science_unit1_review11_15.py` freezes 100 bilingual answer keys, the original 580-question count, the balanced positions, distinct options, explicit keyed explanations and a zero-error/zero-warning structural audit. First three review batches now have regression coverage.

## Fourth review batch: quizzes 16–20

Questions **301–400** received updated keyed bilingual explanations and more substantial derivations for selected short gravitation, lift, projectile and braking numericals. Ten option sets were clarified to avoid mixing values and descriptive labels: **Q319, Q329, Q337, Q345, Q355, Q364, Q365, Q374, Q394 and Q396**. The revised options maintain their original correct-answer positions and retain the actual physics. No English–Tamil numeral-order mismatch was detected in this 100-question batch.

The newly added `tests/test_class10_science_unit1_review16_20.py` locks the 100 keyed English and Tamil answers and checks the 580-question structure, explanatory sufficiency, choice uniqueness, and no errors or warnings from the existing audit at offset 300. All four earlier and current review windows are separately regression-tested.

## Fifth review batch: quizzes 21–25

Questions **401–500** received more explicit English–Tamil keyed explanations, targeted expansion of short derivations, and consistent units and terminology. **19 mixed numerical-option sets** were reformatted with meaningful physical-quantity labels (forces, moments, energy, speed and collision outcomes). English and Tamil number order was synchronised for zero-field Q437 and three-fragment momentum Q452. The physical answers and all question IDs remain unchanged.

The `tests/test_class10_science_unit1_review21_25.py` suite locks the exact 100 bilingual answer keys and runs the existing structural auditor over the reviewed window. This batch's tests passed the focused checks; the last 80 items are documented below.

## Sixth review batch: quizzes 26–29

Questions **501–580** received bilingual keyed-answer explanation alignment. Six answer-option sets were clarified for consistent numerical presentation: **Q511, Q515, Q529, Q547, Q568, Q574**. The correct English answer's numerical order for three-fragment momentum **Q514** now matches Tamil without altering the underlying result. The short planetary-density explanation at **Q517** was extended with the relevant physical relationship. All original keys, IDs, and the 29 quiz sets are preserved.

The new `tests/test_class10_science_unit1_review26_29.py` freezes **80 bilingual answer pairs** and checks the final review window. It also runs the standard quality auditor across **all 580 questions**, requiring zero errors and zero warnings. Prior review tests freeze the other 500 bilingual answer pairs.

## Review coverage and independent editorial follow-up

**All 580 MCQs (29 quiz sets) have now passed the targeted structural and explanation-alignment preflight.** The six regression tests cover all 580 bilingual correct answers. Preliminary numeric-format checks found zero remaining mixed-format options or English–Tamil numeric-order mismatches.

**Important limitation:** Explicitly including a keyed choice in an explanation does not independently prove the physics or Tamil translation is correct. No automated checker can fully certify the factual accuracy, authenticity of distractors or native-speaker Tamil style. Do not label this an independent, fact-by-fact SCERT editorial certification.

Recommended next actions:
1. Carry out independent Tamil-medium subject-teacher sampling across all 29 quizzes and verify the most complex calculation choices against SCERT examples.
2. Review **Class 10 Science Unit 2** and other previously published textbook banks using the same chapter-by-chapter methodology.
3. Check the live website after GitHub Pages deploys and test answering, explanation feedback and language switching. GitHub merges and green CI do not alone establish live-browser publication.

**Overall Class 10 Science catalogue:** 23 units, 1,040 questions, 52 quiz sets; this QA work changes question text and supporting tests, not counts.
