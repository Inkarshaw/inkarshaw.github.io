# Class 6 Term I, Science & Social Science — original English/Tamil Firsts audit

**Audit date:** 1 November 2026  
**Book:** Government of Tamil Nadu / SCERT, Standard Six, Term I, Volume 3, Science + Social Science  
**Status:** **PARTIAL SOURCE-FACT CERTIFICATION — EIGHT MCQs CROSS-CHECKED; COMPLETE BOOK NOT CERTIFIED.**  
**Live deployment:** **Confirmed** on 1 November 2026 by independent public-HTTP GitHub Actions ([run #41268805049](https://github.com/Inkarshaw/inkarshaw.github.io/actions/runs/41268805049)).  
**Auditor method:** Independently downloaded both original SCERT PDFs, extracted page text from every page, reviewed selected English and Tamil source passages and 2025 English/Tamil transcriptions. Visual inspection of *every page* and 2026–27 edition matching remain open.

## Two original files inspected

| Source PDF | Verified URL | File SHA-256 | Pages | Pages containing extractable text |
| --- | --- | --- | ---: | ---: |
| Original English | [Class 6 Term I Science + Social Science English](https://d21mc000xink7q.cloudfront.net/scert/textbook/syllabuspdf/6th_Science%20%26%20Social%20Science_EM_Term_1_Text.pdf) | `5da2ec1fd13ea4c0359965e2b60f399ad55780787380d12765159c9051809d20` | 216 | 216 |
| Original Tamil | [Class 6 Term I Science + Social Science Tamil](https://d21mc000xink7q.cloudfront.net/scert/textbook/syllabuspdf/6th_Science%20%26%20Social%20Science_TM_Term_1_Text.pdf) | `dcad7ebb1755871d4930cd04a323c6a63d6fae888e4a27c38d757b009609e603` | 216 | 216 |

The PDFs have 2022 production markers in extracted text. The separate English and Tamil 2025-labelled text transcriptions were downloaded as corroborating references (not substitutes for original PDFs). **Do not assume these archives are the 2026–27 prescribed editions without official comparison.**

**Evidence:** [Class 6 original-book audit run #41268000582](https://github.com/Inkarshaw/inkarshaw.github.io/actions/runs/41268000582), artifact `class6-term1-original-audit-evidence` (page text lengths, candidate snippets, URLs, hashes, selected source passages and page indexes). The scanner is reproducible at `scripts/audit_class6_term1_originals.py`.

## Eight Firsts questions checked in source passages

PDF page numbers below are one-based **PDF indexes**, not automatically identical to printed textbook page numbers. Every listed page has text in the original PDF; English and Tamil translations were also compared with 2025-labelled transcriptions. The initial five IDs were already present and were revised for quiz quality/source precision. The final three were added in this update.

| ID | Checked textbook fact | English PDF page | Tamil PDF page | Outcome |
| --- | --- | ---: | ---: | --- |
| F033 | Augusta Ada Lovelace recognised as first programmer | 102 | 102 | Match; weak distractor replaced with Grace Hopper |
| F034 | First-generation computers used vacuum tubes | 102 | 102 | Match |
| F035 | ENIAC, 1946, early general-purpose **electronic** computer | 103 | 103 | Match; answer wording qualified to avoid claiming first computer of every kind |
| F043 | Charles Masson first described Harappa ruins | 137 | 137 | Match; nonsensical distractors replaced with historical names |
| F044 | Viswanathan Anand, first Rajiv Gandhi Khel Ratna awardee 1991–92 | 211 | 213 (exercise) | English passage and Tamil exercise/transcription corroborate; distractors repaired; Tamil page layout needs manual inspection |
| **F149** | Viswanathan Anand became India's first chess Grandmaster in 1988 | 211 | 213 | Newly added; passage and original Tamil exercise corroborate |
| **F150** | William Herschel discovered Uranus in 1781, first planet found with a telescope | 169 | 170 | Newly added; bilingual PDF/text-transcription corroboration |
| **F151** | Chandrayaan-1 was India's first lunar mission, launched in 2008 | 171 | 171 | Newly added; bilingual PDF text corroboration |

All eight have specified English and Tamil source URLs, recorded PDF page indexes, and review status explicitly marked as **selected facts checked; complete book/visual review pending**.

## Full-book candidate inventory: NOT equivalent to editorial completeness

- The **216 pages of each original PDF** were programmatically traversed and text extracted. Text extraction coverage: 216/216 each, but this does not establish that diagrams, illustrations, layout-specific facts, captions or marginal notes were visually checked.
- Broad English keyword-scanned lines: **87**; Tamil keyword-scanned lines: **83**. These include routine uses such as “first” in directions and are not 170 unique Firsts facts.
- The 2025-labelled transcription had **89 English** and **129 Tamil** keyword-matched lines, including ordinary mentions, OCR/transcription noise and possible overlapping source editions.
- Historically contestable book claims (e.g. “first ruler to give up war”, first roads/hospitals, wheel as the first scientific invention, dogs as universally first domesticated animal, ancient ruler invention of the modern scale) were **not added as unqualified quiz facts**.
- Existing seven other Class 6 Firsts questions are primarily drawn from **Term II/III or other units**; this Term I audit does not certify them.

## Remaining requirements before whole-book sign-off

- [ ] Visually inspect **all 216 English and 216 Tamil PDF page images**, including tables, captions, labels, infographics and any text extraction artifacts.
- [ ] Review all potential Firsts/founders/inventions across each unit, including facts expressed **without** “first” or “முதல்”; reconcile candidate counts and explicitly tag excluded/ambiguous claims.
- [ ] Confirm inner title pages, edition-year mapping and whether these are the currently prescribed **2026–27** books.
- [ ] Manually inspect the Tamil original layout around F044, where the exercise supports the answer but some page text is extraction-ordered oddly.
- [ ] Reconcile printed-page labels against PDF indexes for all newly added MCQs.
- [ ] Perform bilingual editorial proofreading for all relevant questions and alternative answers, and finish a complete volume/term coverage sign-off.

**Result:** Book 1 has a verified original bilingual PDF pair and eight checked source-fact MCQs. This is **meaningful partial verification**, not a finished / certified English–Tamil book pair. Full-series count of completely certified original book pairs remains **0**.

## 1 November 2026: live deployment check

An independent GitHub Actions runner fetched the **public custom domain**, not repository files, and obtained HTTP **200** for `/textbook-firsts.html`, `/data/special-quizzes/firsts.json` and `/`. The complete live JSON content matched the merged GitHub repository bank, with **151 questions, version 13**, corrected women/history/science homepage counts **26/97/28**, new F149–F151 answers, and direct Tamil original PDF links for all eight verified Class 6 Term I facts.

The [independent live audit run 41268805049](https://github.com/Inkarshaw/inkarshaw.github.io/actions/runs/41268805049) returned **16/16 passing release assertions**. This confirms live deployment of the selected-fact updates, **not** entire textbook factual/visual certification.
