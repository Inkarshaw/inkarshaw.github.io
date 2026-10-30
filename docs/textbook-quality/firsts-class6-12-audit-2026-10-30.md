# TN School Book Firsts: Classes 6–12 repository audit

Audit date: 30 October 2026  
Site section: `textbook-firsts.html`  
Published question bank: `data/special-quizzes/firsts.json`  
Audit script: `scripts/audit_textbook_firsts.py`  
Editorial expansion selection: `data/special-quizzes/firsts-curation-manifest.json`

## Executive finding

**The repository's available canonical TN textbook-unit question banks have been scanned across all seven standards (6–12). That is not the same as an exhaustive review of every original printed Tamil Nadu school textbook.** Several curriculum subjects are absent from the online question-bank tree, while numerous original chapter editions have not been independently checked line by line. Thus neither this scan nor the newly expanded quiz should be described as 100% of all textbook firsts.

The reproducible CI audit completed with no JSON parsing errors:

| Measure | Count |
| --- | ---: |
| Canonical unit-bank files read | 189 |
| Existing questions scanned | 48,040 |
| Broad matches containing first/earliest/invented/discovered/founded, etc. | 1,936 |
| High-priority *unverified* candidate matches | 398 |
| Invalid source-bank answers/options among matched questions | 0 |
| Source-bank read errors | 0 |
| Curated bilingual MCQs in new Firsts quiz | **105** |

**Interpretation:** 1,936 is an automated keyword match count, not the number of unique historical firsts; it contains duplicate facts, activity/sequencing prompts, contextual references, and mechanical reformulations. The 398 high-priority cases also require manual editorial and original-source confirmation.

## Coverage of available online *question banks*

| Class | Canonical unit banks scanned | Existing MCQs scanned | Broad firsts matches | High-priority candidates | Present subjects | Firsts MCQs now selected |
| --- | ---: | ---: | ---: | ---: | --- | ---: |
| 6 | 45 | 8,837 | 224 | 64 | Science, Social Science | 12 |
| 7 | 46 | 3,788 | 101 | 30 | Science, Social Science | 32 |
| 8 | 25 | 1,800 | 29 | 6 | Science only | 4 |
| 9 | 8 | 2,000 | 49 | 7 | Science only | 1 |
| 10 | 23 | 1,460 | 25 | 7 | Science only | **0** |
| 11 | 19 | 23,172 | 1,204 | 238 | History only | 27 |
| 12 | 23 | 6,983 | 304 | 46 | History, Geography | 29 |
| **Total** | **189** | **48,040** | **1,936** | **398** | — | **105** |

*Class 7's count includes women-firsts drawn directly from the Women Empowerment lesson, not all present as existing unit MCQs. Other classes include selected, quality-edited facts and reworded MCQs, not a blind import of keyword hits.*

### New quiz category coverage

| Category | Curated MCQs |
| --- | ---: |
| First women and pioneers | 23 |
| History, states, institutions and founding milestones | 65 |
| Science, inventions, discoveries and space | 17 |

Each question includes four English options, four Tamil options, an answer key, both-language explanations and a book/reference link, with class metadata. Some older questions have chapter-level references only. Source links and transcribed source text do not alone certify a precise printed page or edition.

## Original source material checked in this phase

- Class 7 Social Science, Term III, Civics: **Women Empowerment**, particularly the *First in the World Woman* and *First in India Woman* tables (printed pages within the chapter beginning at p.183). Text was cross-checked against a public 2024 English textbook transcription: `https://huggingface.co/datasets/Joemn/TamilNadu-State-board-books-2025-Tamil-and-english-versions/blob/main/7th-standard/English/Class_7_Social_Science_English_Social_Science_-_Term_3_-_2024_Edition.md`. Direct bilingual book links are stored in `data/textbook/source-registry.json`.
- Other additions were verified against the **existing English/Tamil question-bank content and answer keys**, not universally rechecked in original page images. They are marked with source review status, and the original source ID/path is retained.
- Book catalogues for further original-edition review: the Tamil Nadu Textbook Corporation (`https://textbookcorp.in/textbook/`) and the TN textbook catalogue (`https://www.tntextbooks.in/p/school-books.html`). Use edition-specific official files wherever accessible.

### Prevent common 'first' errors

Do not conflate the first woman president of the Indian National Congress (**Annie Besant, 1917**) with its first **Indian** woman president (**Sarojini Naidu, 1925**). Distinguish the world's first woman to summit Everest (**Junko Tabei, 1975**) from the first **Indian** woman (**Bachendri Pal, 1984**). Distinguish the world's first woman Prime Minister (**Sirimavo Bandaranaike, 1960**) from India's first (**Indira Gandhi, 1966**). Distinguish first *full-time* Indian woman ministers from an earlier woman who held the portfolio temporarily or as additional charge. Avoid a bare “first woman Olympic gold medalist” claim: categories and event chronology vary.

## Remaining work before a credible 'complete textbook firsts' claim

1. Build a canonical Class 6–12 curriculum index for both English and Tamil original books: class, term/volume, subject, unit, edition and PDF file.
2. Add the missing Social Science banks for **Classes 8, 9 and 10**. Their absence is significant for the history/civics firsts topic.
3. Inspect the unrepresented **Class 11 and 12** subject textbooks (e.g. Economics, Political Science and scientific disciplines) and relevant general-science/history material that is not yet in ClearExams unit banks.
4. Examine all original textbook chapter pages, including fact boxes, timelines, sidebars, tables, captions, evaluation questions and diagrams. Record original page and source-language editions.
5. De-duplicate equivalent records across classes and resolve broad/disputed “firsts” by specifying jurisdiction, period, office and sense of the achievement.
6. Editorially assess the **398 high-priority keyword hits** and the other matches; do not automatically publish all of them.
7. Add a source-certified status to individual questions only after independently comparing both editions. Re-run bilingual option, accuracy, URL and mobile-browser checks before merging each expansion.

### Validation boundary

A completed **repository-bank** scan is now reproducible in GitHub Actions, and the quiz has been expanded from 40 to 105 questions. A completed **all-original-textbooks** audit remains **open**, because the source materials and subjects listed above are not fully represented or verified. This is a documented limitation, not proof that missing original textbooks contain no firsts.
