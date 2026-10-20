# Class 10 Science — Laws of Motion bilingual MCQ audit

**Date:** 20 October 2026  
**Bank:** `data/textbook/class-10/science/unit-1.json`  
**Textbook:** [Tamil Nadu State Board Class 10 Science, Unit 1 (2019 English chapter PDF)](https://cdn1.byjus.com/wp-content/uploads/2019/04/Tamilnadu-Board-Class-10-Science-Textbook-Chapter-1.pdf)

## Inventory and first review batch

The chapter has **580 MCQs in 29 sets of 20**. Five consecutive quality batches now review **Quiz sets 1–25 (questions 1–500)** and preserve all 580 question IDs, the existing 29 quiz sets, and the answer concepts while clarifying equivalent numerical display options.

Review improvements:
- Make both English and Tamil explanations identify their actual keyed answer, then explain the physical principle or calculation.
- Extend inadequate numerical explanations and retain signed vectors, units and relevant formulas.
- Standardise answer-option formats for Earth's central gravity, the inverse-square altitude example and lunar fall-time calculation.
- Remove metatextual stems asking for the answer *in the textbook*: question 77 (gravitational constant), 122 (parallel forces), 130 (Newton's second law), and 138 (Earth's mass). These questions now test physics directly.
- Confirm the chapter concepts against the printed government textbook, especially inertia, forces, torque, impulse, gravitation and the value of G.

The first 500 questions now meet the targeted basic criteria: four distinguishable options in both languages, explicitly keyed bilingual explanation, adequate rationale length and consistent numerical answer format. The new focused regression and repository quality workflow must pass before merging.

## Second review batch: quizzes 6–10

Questions 101–200 received additional EN/Tamil explanation alignment and worked calculations. Eleven MCQs also received clearer, consistent answer-option presentation for gravitation, vectors, circular motion, impulse and torque (Q115, Q116, Q120, Q124, Q142, Q148, Q169, Q178, Q188, Q191, Q196). Q124 and Q196 specifically align the order of numerical values across the languages; these had represented formatting mismatches rather than different mathematical answers.

A dedicated `tests/test_class10_science_unit1_review6_10.py` freezes the 100 bilingual keyed answers and requires the unchanged 580-question bank plus a zero-error and zero-warning audit of that window. It does not waive editorial review for Quizzes 11–29.

## Third review batch: quizzes 11–15

Questions **201–300** now have keyed English–Tamil explanations and expanded rationales for shorter numericals. Seven option sets required targeted revision: Q213 (zero momentum), Q215 (zero gravitational field between unequal masses), Q218 (elevator scale), Q255 (equilateral-force resultant), Q286 (balanced forces), Q293 (perpendicular inelastic collision), and Q295 (surface gravity ratio). The Q215 correct answer's numeric sequence was aligned across English and Tamil without changing its physical meaning.

The new `tests/test_class10_science_unit1_review11_15.py` freezes 100 bilingual answer keys, the original 580-question count, the balanced positions, distinct options, explicit keyed explanations and a zero-error/zero-warning structural audit. First three review batches now have regression coverage.

## Fourth review batch: quizzes 16–20

Questions **301–400** received updated keyed bilingual explanations and more substantial derivations for selected short gravitation, lift, projectile and braking numericals. Ten option sets were clarified to avoid mixing values and descriptive labels: **Q319, Q329, Q337, Q345, Q355, Q364, Q365, Q374, Q394 and Q396**. The revised options maintain their original correct-answer positions and retain the actual physics. No English–Tamil numeral-order mismatch was detected in this 100-question batch.

The newly added `tests/test_class10_science_unit1_review16_20.py` locks the 100 keyed English and Tamil answers and checks the 580-question structure, explanatory sufficiency, choice uniqueness, and no errors or warnings from the existing audit at offset 300. All four earlier and current review windows are separately regression-tested.

## Fifth review batch: quizzes 21–25

Questions **401–500** received more explicit English–Tamil keyed explanations, targeted expansion of short derivations, and consistent units and terminology. **19 mixed numerical-option sets** were reformatted with meaningful physical-quantity labels (forces, moments, energy, speed and collision outcomes). English and Tamil number order was synchronised for zero-field Q437 and three-fragment momentum Q452. The physical answers and all question IDs remain unchanged.

The `tests/test_class10_science_unit1_review21_25.py` suite locks the exact 100 bilingual answer keys and runs the existing structural auditor over the reviewed window. All first 500 items now meet the focus checks, leaving 80 items for the final chapter audit batch.

## Outstanding editorial backlog

**Questions 501–580 remain unreviewed in the first five passes**. A provisional scan after these revisions identified the following *overlapping* categories among these 80 questions; these are triage counts, not independently validated factual errors:

| Signal in remaining questions | Count |
| --- | ---: |
| English or Tamil explanation shorter than structural minimum | 1 |
| Correct answer wording not repeated literally in one or both explanations | 46 |
| Numerical and nonnumerical English option formats mixed | 6 |
| Keyed answer's Arabic numerals differ across English and Tamil | 1 |

The last signal needs especially careful editorial inspection: it can represent either a translation mismatch or inconsistent formatting of an otherwise equal value. Merely copying option text into an explanation does not establish factually correct answers or good Tamil.

## Planned follow-up

1. Finish **Quizzes 26–29 (questions 501–580)** against the chapter, including numerical and Tamil alignment issues.
2. Run a whole-bank audit and perform additional independent Tamil editorial spot checks.
3. Run the whole-bank structural audit after every completed review series and carry out an independent textbook/Tamil-native editorial sampling.
4. Check the live website after GitHub Pages publishes the merge; green GitHub tests alone do not confirm browser publication.

**Do not describe the entire Laws of Motion bank as editorially complete on the basis of the first twenty-five quizzes.**
