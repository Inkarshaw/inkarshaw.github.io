# Original examination papers — full transcription publication checklist

**Status as of 2026-10-28:** no complete, reproduction-authorised, official-final-key-verified digital original-paper records have been published to `data/quizzes/verified-full-original-papers.json`.

## Three distinct student modes

- `pyq-original-paper.html`: original **official PDF** and a locally saved numbered answer sheet; no copied question text or automatic grading. First grounded example: TNPSC Group IV 2024 General Tamil and General Studies, 200 questions.
- `pyq-full-quiz.html`: all available **adapted** source-attributed PYQs (currently 150); not full original paper transcriptions.
- `pyq-original-digital.html`: **exact full original** digital paper; published only when a record in `verified-full-original-papers.json` passes the independent structural gate and editorial sign-off.

## Acceptance criteria for a digital original paper

1. Obtain the exact source paper PDF and **matching final answer key** from an official authority. Identify the exam year, booklet/version, source edition, language and applicable question numbering.
2. Establish the legal basis to reproduce the *entire* original paper on ClearExams. Record rights holder, evidence of written permission or an independently reviewed public-domain determination, and reviewer. An openly downloadable PDF is not automatically a reproduction licence.
3. Transcribe **all questions and all original options** in their original printed order. Preserve Tamil/English media, maths, tables, scientific notation and any illustrations essential to interpretation; do not translate, paraphrase, omit, fix, or silently renumber source questions.
4. Review each item against the original paper independently. For answer-key mapping, reconcile original question number, booklet version, final official key position, any withdrawn questions, corrections and alternative keys. Never assume the option position is the same across booklet versions.
5. Record named and dated human editorial approval, with paperVersion and finalKeyVersion matching the specific paper.
6. Run `node tests/test_pyq_original_full_gate.mjs`; add a regression test checking the exact expected question count, original ordered IDs, bilingual choice counts and final-key version. Pass all CI checks before enabling the user-facing digital paper.
7. Re-check source URLs, rights evidence and any key revision before later updates.

## Required JSON structure

`data/quizzes/verified-full-original-papers.json` must keep `schemaVersion: 1` and a `papers` array. Each approved paper must include the following (the example below is a **schema sketch only**, not source content or permission):

- `id`: stable slug
- `exam`, `year`, `paperVersion`, `language`: `ta`, `en` or `ta-en`
- `questionCount`, `durationMinutes`, `marksPerQuestion`, optional `negativeMarks`
- `officialPaperUrl`, `finalKeyUrl`: matching authority-hosted PDFs
- `reproductionPermission`: `{status:"approved", rightsHolder, evidence, reviewedBy}`
- `editorialReview`: `{status:"complete", reviewedBy, reviewedOn:"YYYY-MM-DD", paperVersion, finalKeyVersion}`
- `questions`: **exactly** `questionCount` objects in order, each with `number` (1-based), `text` keyed by original language, `options` keyed by language with `A/B/C/D`, `correct`, `keyQuestionNumber` and explicit `textVerified:true`, `optionsVerified:true`, `finalKeyVerified:true`

The structural gate does **not** establish factual correctness, copyright licence validity or genuine final-key reconciliation on its own; those are human review prerequisites. Do not fabricate metadata or bulk-mark records verified without inspecting the originals.

## Next source intake

Start with the **official TNPSC Group IV 2024 General Tamil + General Studies paper and final key** already linked in `data/quizzes/original-paper-practice.json`. That record is a 200-position PDF companion, **not** an approved complete digital transcription. To publish the verbatim online paper, supply the original files and independently establish reproduction rights; run question-by-question and answer-key QA before adding a complete record.
