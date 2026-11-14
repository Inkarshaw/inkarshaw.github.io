# TNPSC Group I 2026 · original specimen to typed-question mapping

> Editorial review procedure. This is **not** a TNPSC answer-key release, and no reviewer note may be treated as automatic scoring approval.

## Current facts and caveats (checked 14 November 2026)

- TNPSC Group I Services 2026 preliminary exam: **27 September 2026**; Notification **05/2026**, General Studies and Aptitude Subject Code **497**.
- Tentative key hosted **6 October 2026**. TNPSC explicitly states that correct choices are ticked in the official specimen PDF and **specimen question numbers, not candidate booklet codes or third-party coaching numbers, govern challenges**.
- As of 14 November 2026, the official answer-key index had not posted a **final** Group I 2026 key. Do not relabel a tentative tick as final.
- ClearExams has 200 user-supplied typed study positions but **zero approved answer mappings**: 198 text-readable entries, including five source-labelled secondary text repairs; Q98 and Q200 include labelled editorial dice illustrations that are **not certified TNPSC originals**.

Official sources:
- [Official specimen with tick marks (29 MB)](https://tnpsc.gov.in/Tentative/Document/05_2026_CCSEI-GS.pdf)
- [Official Subject 497 tentative-key note](https://tnpsc.gov.in/english/Tentativesubjects.aspx?key=04ac5d92-6953-47c2-aab9-d963014ae443)
- [Official recruitment dashboard](https://tnpsc.gov.in/web/examdashboard/index.aspx?notid=33aa5415-6205-4ae9-842e-212d62d088f1)

## Manual source verification (local-only workflow)

1. Download the PDF **from TNPSC's original link** to the editor's device. Verify the domain and that the expected Subject Code 497 paper is being inspected. A file name or PDF signature cannot prove document authenticity.
2. Open [the ClearExams editorial mapping workbench](../tnpsc-g1-2026-key-review.html); it is intentionally `noindex` and **does not score** students.
3. Use **Select the downloaded specimen PDF**. The browser checks the `%PDF-` magic bytes and an 80 MB size limit, creates an in-memory object URL and does **not** transmit the file. On mobile, if the embedded PDF viewer is unsupported, open the saved file in the device PDF app and compare manually, or use the separate-tab link when supported.
4. Choose one **transcription position**. Do not assume its number matches the official specimen number. Inspect the question text and all A–E alternative strings. Recheck matching-table entries, math notation, names, dates, Tamil variants and figures. For Q98/Q200 inspect the **original TNPSC dice illustrations**, not merely the editorial study redraws.
5. Enter the **official printed question number**, the **actual PDF page**, the tick-marked official alternative, the **corresponding ClearExams alternative**, and the ticked alternative's printed **text**. The official tick letter and transcription letter may differ when the option sequence differs.
6. Mark the stem/options/tick review checkboxes **only after personal visual inspection**. The original figure checkbox is required on Q98/Q200.
7. Save the browser-local draft. The workbench prevents a locally checked status when an official specimen number collides with one already used by another transcription slot; unfinished records remain drafts. This is **not source approval**.
8. Export JSON for **separate editorial scrutiny**. The downloaded JSON contains metadata/reviewer judgments, **not the PDF bytes**, and does not change the deployed quiz. Review evidence is browser-local, except for this explicit export.
9. **After any ClearExams text or option correction**, open the affected saved review again and compare the current stem, all options and the official printed specimen. The workbench binds each review to the exact currently displayed text, A–E alternatives and source status. Mismatched or legacy reviews keep their old notes but **lose prior verification checks**; they no longer count as locally checked until the editor verifies and rechecks the current question. Imported older JSON snapshots are deliberately downgraded to drafts. An exact source match is only an editor workflow safeguard, **not proof of TNPSC authenticity**.

## Publication gate — do not bypass

A separate editorial commit can make an answer scorable **only after**:

- The question stem, every printed option and figure are reconciled with the original TNPSC specimen at the exact **specimen question number and booklet version**.
- The `officialTick`, original option text, and actual matching typed alternative agree, with any options reordered explicitly documented.
- The tentative/final nature of the TNPSC key and any `ALL` or multiple-accepted answers are handled per board marking policy.
- Reconciliation is inspected independently by another reviewer, with evidence of source page and any disagreement.
- The source manifest, audit ledger, quiz messaging and tests are updated in the **same commit**.
- Browser and CLI tests pass, and the public quiz does not assign a mark to unresolved questions.

**No key is auto-extracted by the workbench**, even after opening a genuine official PDF. The printed specimen tick marks are graphical and could be misread by OCR. Recorded corrections must be verified against the actual page images.

An additional transcription trap: one coaching answer guide lists the Minamata/Itai-Itai disease matching question at its Q1 while the ClearExams supplied text places it at Q4. Never copy keys by numbering across these documents.

As of this update, the eight-bank PYQ audit remains **1,420 playable / 1,157 provisionally scorable / 263 ungraded**, including **200 Group I 2026** answers awaiting official specimen matching.

## 14 November 2026 — independent illustrated-paper corroboration for Q98 and Q200

The two ClearExams editorial study drawings were visually compared with both the [ArivArk 2026 Q98](https://arivark.com/assets/img/pyq/g1-2026-q98-dice.png) and [Q200](https://arivark.com/assets/img/pyq/g1-2026-q200-dice-nets.png) images and the separately published [Athiyaman bilingual 2026 Group I retypeset PDF](https://athiyamanteam.com/wp-content/uploads/2026/09/tnpsc-group-1-prelims-question-paper-2026-ccsei-p26.pdf). Specifically, Q98's four die orientations and the A=2, B=4, C=5, D=6 labels are shown on printed page **44** (PDF page index 43), while Q200's three die orientations and all four cube-net options A–D appear on printed pages **89–90** (PDF page indices 88–89). These are **two separately published third-party study illustrations**, not two TNPSC-hosted specimen scans.

The source images/option arrangements correspond to the **editorial study drawings already hosted by ClearExams**. This cross-check improves confidence in what the study drawing is attempting to represent, but **does not certify** an original exam image, figure-exact transcription, correct answer, or position correspondence to the TNPSC official Subject 497 key. The coaching PDF has academy branding and is a retypeset publication: never describe it as the original TNPSC-issued booklet. The official tick-marked TNPSC specimen URL could not be visually inspected through the available source access route, so `sourceStatus='needs_source_review'` and `answer=null` remain unchanged for both.

Both questions now also display **independent editorial Tamil study translations and labelled Tamil option descriptions**, with explicit non-verbatim provenance. The student quiz links to the exact comparison PDF pages; the local editorial review workbench displays the redrawn figure and both third-party source links beside the official-specimen comparison fields. **Only a human inspection of the genuine TNPSC specimen** permits marking the original-figure checkbox for these two positions. Counts remain 200 playable, zero 2026 Group I question scores, and 1,420 playable / 1,157 provisional / 263 ungraded across the eight original-numbered banks.
