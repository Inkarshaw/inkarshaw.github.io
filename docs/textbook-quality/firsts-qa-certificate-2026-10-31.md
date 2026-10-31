# Firsts Quiz — scoped quality certification / சான்றிதழ் நிலை

**Audit date:** 31 October 2026  
**Quiz:** [ClearExams Firsts Quiz](../../textbook-firsts.html)  
**Bank:** `data/special-quizzes/firsts.json`, revision 11  
**Scope:** Entire 148-question published *curated bank*, Classes 6–12  
**Sign-off classification:** **STRUCTURAL / TARGETED EDITORIAL + CHROMIUM FUNCTIONAL QA PASSED**, GitHub Actions [Audit TN Textbook Firsts run 41189707667](https://github.com/Inkarshaw/inkarshaw.github.io/actions/runs/41189707667) on 31 October 2026. **NOT ORIGINAL-TEXTBOOK CERTIFIED.** Live production availability remains unverified.

## Certification boundaries (read before using the badge)

| Gate | Outcome | Evidence / limitation |
| --- | --- | --- |
| Bank JSON, IDs, classes, categories, four English options, four Tamil options, answer-index validity, required explanations | **PASS**: structural and editorial certification tests in GitHub Actions run 41189707667 | `tests/test_firsts_certification.py`; `tests/test_firsts_special_quiz.py` |
| Date/year distractors and known prompt/translation defects | Corrected, guarded in tests | F029, F033–F034, F042, F044, F050, F052, F079, F085, F094, F112, F114, F116 |
| Quiz player: 20-question default, skip, unanswered scoring, retry, Tamil toggle, restore, mobile layout | **PASS**: real Chromium mobile/bilingual smoke tests in GitHub Actions run 41189707667 | `tests/test_firsts_browser_smoke.py` |
| Direct English/Tamil original textbook verification for every MCQ | **NOT CERTIFIED** | Many records still derive from unit banks rather than edition/page-checked originals |
| Complete coverage of all Firsts in 2026–27 TN School Books, both media, all classes/subjects/terms | **NOT CERTIFIED** | Source archive/edition inventory and manual complete-book review unfinished |
| Live site deployment and HTTP availability | **NOT CERTIFIED by this change** | Verify production after merge; do not infer from branch contents |

## Inventory reproduced from bank

- **148 unique question IDs**, F001–F148. Category distribution: History/institutions **96**, Women/pioneers **26**, Science/invention/space **26**.
- Class distribution: **6: 12; 7: 32; 8: 9; 9: 13; 10: 11; 11: 32; 12: 39**.
- English and Tamil questions, explanations, four options, and answer index are present in all 148 records. This is **field completeness**, not translation certification.
- Every record has an HTTPS source URL field. **Live link validity and whether it lands on the precise claimed page have NOT been certified.**
- **26** records have no dedicated `source_ta_link`. Another **14** reuse the English URL as `source_ta_link`. Accordingly **40** do not expose a *distinct* Tamil-specific destination.
- **27** records have a dedicated `source_printed_page`; **121** do not. Separately, **26** records have no general `page` field.
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

**Verified CI result:** [Audit TN Textbook Firsts run 41189707667](https://github.com/Inkarshaw/inkarshaw.github.io/actions/runs/41189707667) completed **successfully** on 31 October 2026, including structural/editorial and actual Chromium mobile-player tests. Other PR CI workflows (quiz/text quality, content trust/UX, main mobile smoke, original-volume inventory) also passed for this revision. Factual textbook certification and live-domain availability remain open.

## Recommendation

Do not display a general **“TN School Books Fully Certified”** badge. The accurate public description is: **“148 bilingual, curated Firsts MCQs; structural QA tested; original textbook source audit in progress.”** Publish further *source-verified* additions only with edition IDs, original English/Tamil page evidence, reviewed explanations, independent verification for contested firsts, and a completed per-book checklist.
