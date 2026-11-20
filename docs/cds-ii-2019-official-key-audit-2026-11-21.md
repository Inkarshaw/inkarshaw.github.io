# UPSC CDS II 2019 General Knowledge — official answer-key source audit

Date: 21 November 2026

## Primary-source verification

- Verified direct commission-hosted PDF: https://www.upsc.gov.in/sites/default/files/AnsKey-CDS2-19-GK.pdf
- PDF is four pages, series A / B / C / D. Inspected its Series B page (PDF page 2).
- Official Series B header: CDS-II-2019, GK, maximum marks 100, **one item dropped**, **119 items taken for scoring**.
- The Series B answer for **Q53 is X** (dropped).
- Transcribed all 120 Series B cells into `data/quizzes/cds-gk/official-key-candidates/cds-ii-2019-series-b.json`.
- Independent comparison against the full official original Series B printed question paper and a second transcription pass on the official key remain open.
- Original user-supplied study PDF and its 120 English typed questions are source-provisional; do not label the text officially verified yet.

## Series B anchors from source item semantics

| Q | Typed question concept | Option | Official Series B key |
|---|---|---|---|
| 1 | NCC motto | A | A |
| 2 | Department outside Ministry of Home Affairs | D | D |
| 3 | UNCCD convention and nodal ministry | A | A |
| 4 | Annual Financial Statement under Article 112 | C | C |
| 5 | SAARC founding venue, Dhaka | D | D |
| 46 | Electricity: 100 W × 10 h/day × 30 days = 30 units | C | C |
| 83 | Inter-cropping in definite row patterns | C | C |
| 98 | Octave above 500 Hz = 1000 Hz | C | C |
| 120 | Fern, Marsilea and horsetail = pteridophytes | A | A |

These anchors support Series B as the likely series; they do **not** substitute for comparing all 120 question positions against the authoritative booklet.

## Controlled rollout

- The authentic key text is stored as an isolated source-review artifact.
- Source question JSON remains `correctAnswer: null`, `scoreEligible: false` and `grading: disabled`.
- The 2019 Series B key JSON contains `enabledForScoring: false` and `scoreEligibleCount: 0`.
- When source-series mapping and full answer transcription have been checked independently, Q53 must be excluded from scoring (not marked as incorrect).

## CDS I 2020

The earlier referenced UPSC source `https://www.upsc.gov.in/sites/default/files/AnsKey-CDSI-20-GK-060221.pdf` returned HTTP 404 on attempted retrieval. A third-party source listing alone is not enough to certify the official 2020 answer key. No score key has been added to the 2020 paper.

## Remaining checks

1. Re-fetch and compare the official CDS II 2019 Series B original question paper (numbering, text, options and scientific notation).
2. Independent double-entry comparison of all 120 stored Series B answer characters with the UPSC PDF.
3. Obtain a verifiably commission-published CDS I 2020 GK key.
4. Review legal/source presentation, user-visible dropped-question treatment and score formula before unlocking scoring.

## Independent 120-cell answer-key cross-check (21 November 2026)

- Re-read the 15 rows × 8 item/answer column groups on the publicly mirrored **Series B** key page (Prepp mirror of 2019 commission-style document).
- Entered the complete table a second time, in its printed row order, independently of the existing stored 120-answer JSON.
- Reconstructed the 120 item-order keys by each vertical 15-row column group and compared them with `official-key-candidates/cds-ii-2019-series-b.json`.
- Result: **120/120 identical entries, 0 mismatches**, including the **Q53 X/drop** marker.
- New `tests/test_cds_gk_source.mjs` regression assertion preserves this comparison and rejects accidental edits/column shifts.
- Mirror inspected: https://cdn-images.prepp.in/public/image/CDS_2_2019_GENERAL_KNOWLEDGE_SEPTEMBER_08_2019_PAPER_2_ANSWER_KEY_bb70f0a28c3e710135bc1b0c29a2935d.pdf
- The direct UPSC URL was not retrievable during this fresh session; this pass confirms consistency with a scanned public mirror, **not** independent reauthentication of the primary PDF.
- **Still unresolved:** all-question matching of the original Series B booklet to the source-provisional typed questions. The 2019 quiz remains ungraded.

## 2020 official-key retrieval status

- UPSC question-paper archive lists CDS I 2020 General Knowledge, confirming an official question paper exists; this is **not** its final answer key.
- Search returned an externally mirrored CDS I 2020 key at Testbook, but no newly retrievable commission-hosted final GK key could be authenticated in this pass.
- Do not import third-party answers into scoring fields on the basis of availability alone.
