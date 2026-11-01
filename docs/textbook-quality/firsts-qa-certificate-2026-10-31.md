# Firsts Quiz — scoped quality certification / சான்றிதழ் நிலை

**Audit date:** 31 October 2026  
**Quiz:** [ClearExams Firsts Quiz](../../textbook-firsts.html)  
**Bank:** `data/special-quizzes/firsts.json`, revision 12  
**Scope:** Entire 148-question published *curated bank*, Classes 6–12  
**Sign-off classification:** **STRUCTURAL / TARGETED EDITORIAL + CHROMIUM FUNCTIONAL QA PASSED**, GitHub Actions [Audit TN Textbook Firsts run 41189707667](https://github.com/Inkarshaw/inkarshaw.github.io/actions/runs/41189707667) on 31 October 2026. **NOT ORIGINAL-TEXTBOOK CERTIFIED.** Live production HTTP deployment independently verified on 31 October 2026 via [GitHub Actions live check 41190241454](https://github.com/Inkarshaw/inkarshaw.github.io/actions/runs/41190241454).

## Certification boundaries (read before using the badge)

| Gate | Outcome | Evidence / limitation |
| --- | --- | --- |
| Bank JSON, IDs, classes, categories, four English options, four Tamil options, answer-index validity, required explanations | **PASS**: structural and editorial certification tests in GitHub Actions run 41189707667 | `tests/test_firsts_certification.py`; `tests/test_firsts_special_quiz.py` |
| Date/year distractors and known prompt/translation defects | Corrected, guarded in tests | F029, F033–F034, F042, F044, F050, F052, F079, F085, F094, F112, F114, F116 |
| Quiz player: 20-question default, skip, unanswered scoring, retry, Tamil toggle, restore, mobile layout | **PASS**: real Chromium mobile/bilingual smoke tests in GitHub Actions run 41189707667 | `tests/test_firsts_browser_smoke.py` |
| Direct English/Tamil original textbook verification for every MCQ | **NOT CERTIFIED** | Many records still derive from unit banks rather than edition/page-checked originals |
| Complete coverage of all Firsts in 2026–27 TN School Books, both media, all classes/subjects/terms | **NOT CERTIFIED** | Source archive/edition inventory and manual complete-book review unfinished |
| Live site deployment and HTTP availability | **PASS — live HTTP and release-fingerprint check** | External GitHub runner returned HTTP 200 for quiz page, JSON and homepage; 11 release assertions passed (run 41190241454). Not a direct live-browser interactive test. |

## Inventory reproduced from bank

- **148 unique question IDs**, F001–F148. Category distribution: History/institutions **96**, Women/pioneers **26**, Science/invention/space **26**.
- Class distribution: **6: 12; 7: 32; 8: 9; 9: 13; 10: 11; 11: 32; 12: 39**.
- English and Tamil questions, explanations, four options, and answer index are present in all 148 records. This is **field completeness**, not translation certification.
- Every record has an HTTPS source URL field. **Live link validity and whether it lands on the precise claimed page have NOT been certified.**
- **26** records have no dedicated `source_ta_link`. Another **14** reuse the English URL as `source_ta_link`. Accordingly **40** do not expose a *distinct* Tamil-specific destination.
- **32** records have a dedicated `source_printed_page`; **116** do not. Five Class 6 Term I original English-text locations (F033–F035, F043–F044) were newly mapped; this does **not** imply full-bilingual source-page certification. Separately, **26** records have no general `page` field.
- Older original-volume catalogue: **251 historical English/Tamil edition listings**; **zero volumes fully certified in both media**. This catalogue is NOT an authoritative 2026–27 unique-book count; see `original-class6-12-firsts-ledger.md`.

## Editorial exceptions and explicit pending checks

1. **F019 — Swadesamitran:** Class 10 and Class 12 teaching sources differ on founding/daily-publication dates. The question avoids those dates, but chronology has NOT been resolved.
2. **F014 — Muthulakshmi Reddy:** Supplemental non-textbook historical reference. Must remain labelled supplemental; it cannot count toward strictly book-derived certification.
3. **F029 — paper mill:** Correct answer is inherited from an existing school-book question; original-page and independent industrial-history cross-check is pending. Its distractors/translation were repaired, not its source certainty.
4. **F084/F085, F127/F128, F139/F140, F025/F026:** Closely related question pairs; acceptable as distinct facts but should not be placed in the same short test without item-bank mixing checks.
5. **F122/F125:** Overlap topically with the Fathers Quiz; suitable for cross-reference, but avoid duplicate content maintenance.
6. **F108/F109:** Broad science discoveries/experiments, not explicitly labelled a historical first. Reassign to an appropriate science collection if strict Firsts-only curation is required.
7. Many older explanations remain terse; a full human editorial wording review remains open.
8. Source editions cited for selected English passages may not match the current 2026–27 prescribed Tamil edition. Reconcile per record before certification.

## Reproducible acceptance gates

The PR workflow `.github/workflows/firsts-audit.yml` runs existing question-bank tests plus new structural/editorial tests and real Chromium mobile browser smoke checks. The smoke test exercises:

- Loading the bank with **Quiz 1, 20 questions** by default.
- Marking an answer correct and proceeding.
- Skipping to the end; result distinguishes correct, wrong, and **19 unanswered**.
- Retry wrong/unanswered, Tamil language switch, and reload restoration.
- Topic + class filtering; All-questions mode; mobile viewport overflow.

**Verified CI result:** [Audit TN Textbook Firsts run 41189707667](https://github.com/Inkarshaw/inkarshaw.github.io/actions/runs/41189707667) completed **successfully** on 31 October 2026, including structural/editorial and actual Chromium mobile-player tests. Other PR CI workflows (quiz/text quality, content trust/UX, main mobile smoke, original-volume inventory) also passed for this revision. Factual textbook certification remains open. Live HTTP deployment was subsequently confirmed by [independent GitHub-hosted request tests](https://github.com/Inkarshaw/inkarshaw.github.io/actions/runs/41190241454), including matching the v11 bank, 148 records, corrected items, homepage category counts and new UI controls.

## Recommendation

Do not display a general **“TN School Books Fully Certified”** badge. The accurate public description is: **“148 bilingual, curated Firsts MCQs; structural QA tested; original textbook source audit in progress.”** Publish further *source-verified* additions only with edition IDs, original English/Tamil page evidence, reviewed explanations, independent verification for contested firsts, and a completed per-book checklist.

## 31 October 2026: independent production HTTP verification

**Method:** GitHub-hosted Ubuntu runner performed real DNS lookup and three uncached public HTTPS GET requests against `clearexams.ink`, independent of this assistant's network and GitHub repository file fetching.

| Live request | HTTP status |
| --- | --- |
| `https://clearexams.ink/textbook-firsts.html` | **200** |
| `https://clearexams.ink/data/special-quizzes/firsts.json` | **200** |
| `https://clearexams.ink/` | **200** |

**Published release fingerprint:** 148 questions, bank version 11, 20-question set size; updated skip/unanswered/20-question-default UI; homepage women/history/science counts 26/96/26; corrected F042 and F052 choices. **11 of 11 checks passed.** GitHub Actions run: [Verify live Firsts Quiz deployment #41190241454](https://github.com/Inkarshaw/inkarshaw.github.io/actions/runs/41190241454).

This confirms the live site serves the updated HTML and JSON at that observation time. It does **not** establish that all external source links work, that every original textbook fact is certified, or that a live-site interactive browser session has been tested.

## Selective original-source evidence update — Class 6, Term I

Five published Firsts questions (**F033–F035, F043–F044**) have been matched to original **2025-revised English SCERT PDFs**, with matching facts in the **2025 Tamil textbook transcription** and original Tamil PDFs downloaded and hashed. The 2025 original Tamil PDF text layer is partly garbled, so individual Tamil pages have not all received visual sign-off. Evidence: [Science](class6-term1-original-pdf-2025-review.md) and [Social Science](class6-term1-social-original-pdf-2025-review.md).

**Scope unchanged:** these are selected factual checks in two subject components, not a complete firsts audit of every page or every original volume. Whole-book bilingual certified pairs remain **0**. The historical 251 archive listings are an old catalogue baseline, not a certified count of 2026–27 textbooks.

## Later update — 1 November 2026: Class 6 Term I source-backed expansion

This document is a **31 October 2026 release certificate** for the earlier 148-question version; its earlier frozen figures and 11/11 live-HTTP check apply to that earlier release, not automatically to subsequent revisions.

The proposed **1 November version 13** contains **151 questions** (Women 26, History 97, Science 28). Eight Class 6 Term I facts were checked in extracted source passages of the **two original PDFs, 216 pages each**, including 3 new questions F149–F151. See [Class 6 Term I book review](class6-term1-firsts-review-2026-11-01.md) and [original-PDF scan evidence](https://github.com/Inkarshaw/inkarshaw.github.io/actions/runs/41268000582). The new release's CI and actual site-deployment verification must be recorded independently after merging; the previous live check does not prove this release is deployed.

The full original English–Tamil series still has **zero completely certified textbook-edition pairs**. Text extraction on all PDF pages and selected fact verification alone are not sufficient for a whole-book certification stamp.

## Subsequent release — 1 November 2026, Firsts v16

This is a historical 31 October QA certificate. The latest 1 November source-reviewed bank now has **161** bilingual questions (Women **27**, History **104**, Science **30**). The Class 7 Term I update has nine selected original English/Tamil source-page checks (F051–F054 and F157–F161). The Class 7 [book-level evidence report](class7-term1-firsts-review-2026-11-01.md) records exact PDF hashes, page locations and limitations. An independent GitHub-hosted HTTP run [#41283259549](https://github.com/Inkarshaw/inkarshaw.github.io/actions/runs/41283259549) confirmed the **161/v16 release live** at clearexams.ink; **34/34** assertions passed, including full live JSON equality to main.

**Original-textbook qualification unchanged:** no complete English/Tamil volume pair has been exhaustively certified; the selected fact checks and all-page PDF text scans are not comprehensive visual or editorial source sign-off.
