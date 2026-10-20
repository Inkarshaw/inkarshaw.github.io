# Class 10 Science — Laws of Motion bilingual MCQ audit

**Date:** 20 October 2026  
**Bank:** `data/textbook/class-10/science/unit-1.json`  
**Textbook:** [Tamil Nadu State Board Class 10 Science, Unit 1 (2019 English chapter PDF)](https://cdn1.byjus.com/wp-content/uploads/2019/04/Tamilnadu-Board-Class-10-Science-Textbook-Chapter-1.pdf)

## Inventory and first review batch

The chapter has **580 MCQs in 29 sets of 20**. Two consecutive quality batches now review **Quiz sets 1–10 (questions 1–200)** and preserve all 580 question IDs, the existing 29 quiz sets, and the answer concepts while clarifying equivalent numerical display options.

Review improvements:
- Make both English and Tamil explanations identify their actual keyed answer, then explain the physical principle or calculation.
- Extend inadequate numerical explanations and retain signed vectors, units and relevant formulas.
- Standardise answer-option formats for Earth's central gravity, the inverse-square altitude example and lunar fall-time calculation.
- Remove metatextual stems asking for the answer *in the textbook*: question 77 (gravitational constant), 122 (parallel forces), 130 (Newton's second law), and 138 (Earth's mass). These questions now test physics directly.
- Confirm the chapter concepts against the printed government textbook, especially inertia, forces, torque, impulse, gravitation and the value of G.

The first 200 questions now meet the targeted basic criteria: four distinguishable options in both languages, explicitly keyed bilingual explanation, adequate rationale length and consistent numerical answer format. The new focused regression and repository quality workflow must pass before merging.

## Second review batch: quizzes 6–10

Questions 101–200 received additional EN/Tamil explanation alignment and worked calculations. Eleven MCQs also received clearer, consistent answer-option presentation for gravitation, vectors, circular motion, impulse and torque (Q115, Q116, Q120, Q124, Q142, Q148, Q169, Q178, Q188, Q191, Q196). Q124 and Q196 specifically align the order of numerical values across the languages; these had represented formatting mismatches rather than different mathematical answers.

A dedicated `tests/test_class10_science_unit1_review6_10.py` freezes the 100 bilingual keyed answers and requires the unchanged 580-question bank plus a zero-error and zero-warning audit of that window. It does not waive editorial review for Quizzes 11–29.

## Outstanding editorial backlog

**Questions 201–580 remain unreviewed in the first two passes**. A provisional scan after both revisions identified the following *overlapping* categories among these 380 questions; these are triage counts, not independently validated factual errors:

| Signal in remaining questions | Count |
| --- | ---: |
| English or Tamil explanation shorter than structural minimum | 32 |
| Correct answer wording not repeated literally in one or both explanations | 224 |
| Numerical and nonnumerical English option formats mixed | 41 |
| Keyed answer's Arabic numerals differ across English and Tamil | 4 |

The last signal needs especially careful editorial inspection: it can represent either a translation mismatch or inconsistent formatting of an otherwise equal value. Merely copying option text into an explanation does not establish factually correct answers or good Tamil.

## Planned follow-up

1. Review **Quizzes 11–15 (questions 201–300)** against the chapter and correct actual distractor, formula, numerical and Tamil-alignment issues.
2. Continue with Quizzes 16–20, 21–25 and 26–29 until the entire 580-question bank is reviewed.
3. Run the whole-bank structural audit after every completed review series and carry out an independent textbook/Tamil-native editorial sampling.
4. Check the live website after GitHub Pages publishes the merge; green GitHub tests alone do not confirm browser publication.

**Do not describe the entire Laws of Motion bank as editorially complete on the basis of the first ten quizzes.**
