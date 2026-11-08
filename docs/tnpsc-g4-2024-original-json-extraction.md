# TNPSC Group IV 2024 — original 200-question JSON extraction

## Source
- Exam: TNPSC Group IV, 9 June 2024, booklet CCSE4GT/2024 (General Tamil + General Studies).
- Official source: https://www.tnpsc.gov.in/Tentative/Document/01_2024_GR_IV_GENERAL_TAMIL.pdf
- Official final key: https://tnpsc.gov.in/Document/Answerkeyfinalresult/01_2024_Final%20_Answer_Key_GT_GE.pdf
- Students do **not** need to upload any question paper. The extraction script fetches the linked official scan.
- The source has a 96-page scanned PDF with handwritten annotation/ticks on some options. OCR is not an exact-text authority.

## Structured data
- `data/quizzes/tnpsc-g4-2024-original-questions.json` — 200 records in original Q1–Q200 order, all mapped to verified page positions and 200 final-key tokens. Some question text and A–D options are unverified OCR candidates.
- `data/quizzes/tnpsc-g4-2024-ocr-page-draft.json` — one unverified Tamil/English OCR text record for each question-bearing PDF page (3–91).
- `data/quizzes/tnpsc-g4-2024-original-page-index.json` — previously inspected Q-number-to-PDF-page mapping.
- `data/quizzes/original-final-keys.json` — existing Version A official final-key tokens (including slash-separated accepted answers and four special ALL entries).

## Reading JSON safely
An example question object includes `number`, `section`, `sourcePdfPage`, `language`, `question`, `options` (A, B, C, D, E), `correctAnswers`, `finalKeyToken`, `answerKeyStatus`, `textStatus`, and `rawOcrCandidate`. Bilingual questions may also include `rawOcrEnglish` and `rawOcrTamil`. The page OCR draft can be consulted for uncertain text.

**Do not present `question` / `options` as the verified original paper when `textStatus` contains `unverified`, `pending_review`, or `not_extracted`.** The original-booklet PDF companion is the student-facing exact-paper mode until every text and option is source-checked. The adapted PYQ bank remains separate.

The official final-key token is *not* proof that OCR has reproduced the question correctly. Entries marked `ALL` have no single answer choice and require the established scoring policy.

## Reproducing the editorial extract
The script `scripts/extract_tnpsc_2024_original.py` downloads TNPSC's official source, renders pages 3–91, performs one Tamil+English Tesseract OCR pass over a multipage TIFF, and joins OCR candidates to known question numbers. Source-dependent ambiguity is intentionally preserved in `textStatus`. The editor should compare each stem, choice, diagram and source page before marking an item verified.

The workflow `.github/workflows/tnpsc-2024-ocr-extract.yml` is a one-off feature-branch extractor, not a public question publisher. Re-running extraction may require reconciling manual corrections.

## Current checkpoint
- 200/200 indexed original-number positions and official final keys.
- 179/200 OCR/manual question-text candidates, but 0/200 final-verified digital question cards.
- 27/200 complete A–D OCR/manual option sets.
- 186/200 source-page OCR segments mapped unambiguously; 89 scanned source pages retained for editorial reference.
- The 200-position PDF-linked quiz can already be attempted without uploading the paper. A complete **text-based** 200-question quiz is not ready for publication until original wording/options and reproduction rights have been checked.
