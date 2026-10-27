# Group IIA — economics, geography and Tamilagam bilingual review (27 October 2026)

**Status:** expanded draft pending independent editorial sign-off. This does not assert that the published English/Tamil editions or exact page numbers have been independently certified.

| Note ID | Prescribed topic | Prior coverage | Expanded coverage | Review |
|---|---|---:|---|---|
| `production` | Class 7 Social Science Term I · Economics · Production | 3 English facts | 7 aligned facts, Tamil translations, exam focus, worked example, quick check | Pending |
| `landforms` | Class 7 Social Science Term I · Geography · Landforms | 3 English facts | As above | Pending |
| `earth-interior` | Class 7 Social Science Term I · Geography · Interior of the Earth | 3 English facts | As above | Pending |
| `ancient-tamil-towns` | Class 6 Social Science Term I · History · Ancient Cities of Tamilagam | 3 English facts | As above | Pending |

## Text comparison references

- Class 7 Social Science, 2025 English edition transcription (Production; Interior of the Earth; Landforms): https://huggingface.co/datasets/Joemn/TamilNadu-State-board-books-2025-Tamil-and-english-versions/blob/main/7th-standard/English/Class_7_Social_Science_English_Social_Science_-_Term_1_-_2025_Edition.md
- Class 6 Social Science, 2025 English edition transcription (Ancient Cities of Tamilagam): https://huggingface.co/datasets/Joemn/TamilNadu-State-board-books-2025-Tamil-and-english-versions/blob/main/6th-standard/English/Class_6_Science_and_Social_Science_English_Medium-Term_1-2025_Edition.md
- Class 7 Tamil-medium Term I textbook mirror (PDF; compare the Tamil glossary and original Tamil chapter): https://winmeen.com/wp-content/uploads/2023/04/7th_Science__Social_T1_TM.pdf

These are third-party **copies/transcriptions of school textbooks**, not official State Council approval of this summary. The book mirrors may differ by edition; cite printed page numbers only after comparing the exact prescribed PDF.

## High-priority editorial checks

- [ ] Compare each of the 28 English points with the original English textbook chapters.
- [ ] Review each of the 28 Tamil points against the Tamil-medium textbook; verify terminology for `வடிவப் பயன்பாடு`, `காலப் பயன்பாடு`, `அகச்செயல்பாடு`, `கழிமுகம்`, `புவிக்கருவம்` and `மோஹோரோவிசிக் எல்லை`.
- [ ] Check the geography relationships: source of river erosion, ox-bow formation, floodplain versus delta, seismic focus versus epicentre, and Moho versus other boundaries.
- [ ] Check source context for Poompuhar/Puhar/Kaveripoompattinam, Naalangadi/Allangadi, Kanchi and the Pallava temple; distinguish textbook accounts from independently established archaeological claims.
- [ ] Confirm that each existing `textbook-play.html` link actually opens the intended class/term/unit, without conflating subject numbering.
- [ ] Approve `editorial_review` individually only after review, with actual reviewer and date; do not bulk-certify drafts.

## Structural quality commands

```sh
node tests/test_group2a_text_notes.mjs
node tests/test_content_trust.mjs
```

The notes should return `bilingual-review-pending` until a genuine bilingual fact check is recorded.
