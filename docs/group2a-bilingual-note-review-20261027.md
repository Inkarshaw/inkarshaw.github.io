# Group IIA bilingual notes — editorial review checklist (27 October 2026)

This is a source comparison record, **not a human approval certificate**. Expanded notes must remain labelled "Bilingual draft — editorial verification pending" until a reviewer confirms both language versions and records approval under `editorial_review`.

## Batch scope

| Note ID | Textbook topic | Existing outline | Draft expansion | Editorial decision |
|---|---|---:|---:|---|
| `electricity` | Class 6 Science, Term II, Unit 2 | 3 English points | 7 matched English/Tamil points + exam focus, example, quick check | Pending |
| `organs` | Class 6 Science, Term II, Unit 6 | 3 English points | 7 matched English/Tamil points + exam focus, example, quick check | Pending |
| `solar-system` | Class 6 Social Science, Term I, Geography Unit 1 | 3 English points | 7 matched English/Tamil points + exam focus, example, quick check | Pending |

## Available edition-level source comparison

- Science Term II (2024-edition English SCERT transcription): https://huggingface.co/datasets/Joemn/TamilNadu-State-board-books-2025-Tamil-and-english-versions/blob/main/6th-standard/English/Class_6_Science_English_Science_-_Term_2_-_2024_Edition.md. Compare Electricity Unit 2 (cell and battery, circuit, conductor/insulator, generation) and Human Organ Systems Unit 6 (eight systems, digestion, circulation and urinary pathway).
- Science and Social Science Term I (2025-edition English SCERT transcription): https://huggingface.co/datasets/Joemn/TamilNadu-State-board-books-2025-Tamil-and-english-versions/blob/main/6th-standard/English/Class_6_Science_and_Social_Science_English_Medium-Term_1-2025_Edition.md. Compare Geography Unit 1 (Sun/star, eight planets, Milky Way, rotation, revolution, light-year).
- These are independently hosted **text transcriptions**, not an official verification or a substitute for prescribed SCERT English/Tamil print editions. Textbook-quiz links in the notes already refer learners to the intended ClearExams chapter. Do not use unrelated links as proof of a textbook edition.

## Human bilingual review needed

- [ ] Verify all seven English facts against the prescribed English-medium textbook edition.
- [ ] Independently verify Tamil science and geography vocabulary against the Tamil-medium printed textbook, not simply word matching.
- [ ] Confirm `மின்கல அடுக்கு`, `மின்காப்பான்கள்`, `சிறுநீர்க்குழாய்கள்`, `சிறுநீர்ப் புறவழி`, `பால்வெளி`, and the natural phrasing of explanations.
- [ ] Check each worked example, quick question and answer for factual consistency.
- [ ] Check the exact quiz chapter destination, and avoid claiming one-to-one textbook page alignment without book pagination checks.
- [ ] Record reviewer, review date and status for each note **only after review**. Never bulk-approve via script.

Automated regression commands after editing:

```sh
node tests/test_group2a_text_notes.mjs
node tests/test_content_trust.mjs
```

The note quality gate must still return `bilingual-review-pending` for each of the three notes before human sign-off.
