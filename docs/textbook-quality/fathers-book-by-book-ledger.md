# “Fathers of…” quiz — book-by-book source ledger

**Date:** 31 October 2026  
**Output:** One combined bilingual quiz: `textbook-fathers.html` using `data/special-quizzes/fathers.json`.  
**Scope:** 84 unique MCQs drawn from 43 separately indexed Tamil Nadu school-book sources; source-specific duplicates are merged and cited under the same question.

## Repository-wide structural census and full textbook audit gap report (31 October 2026)

> **Audit verdict: NOT certified complete.** This section is a complete integrity census of the **existing** Fathers bank, **not** a claim that every original Tamil Nadu textbook, school subject, term, edition or chapter has been read. Previous sections document selected manually reviewed source pages. The terms *indexed*, *chapter mapping*, *text checked*, *original page checked* and *book completely audited* must remain distinct.

### A. Bank-wide reconciled numbers

| Metric | Audited value | Meaning |
| --- | ---: | --- |
| Distinct bilingual MCQs | **84** | One `FA` question ID per distinct curated MCQ; all contain English/Tamil stems, four unique options in each language and two explanations |
| Indexed source books | **43** | A book is *represented*, not exhaustively reviewed |
| Indexed chapter mappings | **82** | Metadata chapter listings, not the total chapter count of the original curricula |
| Source-reference entries | **111** | Individual question-to-book/page citations; the same question may cite several books |
| Distinct source URLs | **53** | Unique links in the 111 source entries; accessibility and provenance must be independently verified |
| Original Tamil-medium textbook pages **certified** | **0** | Tamil question text exists, but source-book Tamil wording has not been certified |
| Entire original textbooks **certified page-by-page complete** | **0** | Selected page checks do not certify complete-book inspection |
| Book count mismatches after correction | **0** | `11-bio-botany-full` was incorrectly 9; actual 8 distinct mapped questions, corrected to 8 |
| Source citations without verified printed page | **1** | FA002, Class 8 Science / Introduction to the Information Age; displayed as *printed page unverified*, not assigned a guessed page |
| Live `clearexams.ink` deployment | **Not independently verified** | GitHub branch/CI checks are distinct from testing the public Pages deployment |

A separate website defect was fixed: progress was saved under `clearexamsFathersProgressV2` but attempted to restore from `clearexamsFathersProgressV1`. The page now reads V2 first with V1 fallback to preserve older saved sessions.

### B. Grade-by-grade state of this existing bank

| Class | Indexed books | Mapped chapters | Primary-question count | Fully book-scanned and Tamil-certified? |
| ---: | ---: | ---: | ---: | --- |
| 6 | 2 | 2 | 2 | No |
| 7 | 2 | 2 | 1 | No |
| 8 | 2 | 5 | 3 | No |
| 9 | 2 | 4 | 3 | No |
| 10 | 2 | 5 | 5 | No |
| 11 | 17 | 30 | 31 | No |
| 12 | 16 | 34 | 39 | No |

*Primary-question count* counts each question under its main book/class only. Cross-book reference counts are larger, and rows across classes should not be summed as source coverage. Likewise, a Class 11 or 12 source might be a volume, vocational text, or one unit, not a complete curricular subject inventory.

### C. Class 6–10 Science and Social Science term-slot checklist

This is only a **minimum core Science/Social Science** matrix, not the full curriculum. Classes 6–7 use three terms for these subjects (two subjects × three terms × two classes = 12 subject-term slots); Classes 8–10 are enumerated here as annual Science/Social Science subjects (six slots). **10 of 18 slots have at least one indexed quiz source, and 8 have none**. Every indexed slot still needs an all-units/all-pages original text review. The `8-science-term-1` identifier is inconsistent with the annual Class 8 listing and must be reconciled against the actual edition before changing its label.

| Class | Subject | Term / volume | Book ID | Status |
| --- | --- | --- | --- | --- |
| 6 | Science | Term I | `6-science-term-1` | indexed only |
| 6 | Science | Term II | `6-science-term-2` | not indexed |
| 6 | Science | Term III | `6-science-term-3` | not indexed |
| 6 | Social Science | Term I | `6-social-science-term-1` | not indexed |
| 6 | Social Science | Term II | `6-social-science-term-2` | indexed only |
| 6 | Social Science | Term III | `6-social-science-term-3` | not indexed |
| 7 | Science | Term I | `7-science-term-1` | not indexed |
| 7 | Science | Term II | `7-science-term-2` | indexed only |
| 7 | Science | Term III | `7-science-term-3` | not indexed |
| 7 | Social Science | Term I | `7-social-science-term-1` | indexed only |
| 7 | Social Science | Term II | `7-social-science-term-2` | not indexed |
| 7 | Social Science | Term III | `7-social-science-term-3` | not indexed |
| 8 | Science | Annual (edition verification needed) | `8-science-term-1` | indexed, term mismatch needs inspection |
| 8 | Social Science | Annual | `8-social-science-full` | indexed only |
| 9 | Science | Annual | `9-science-full` | indexed only |
| 9 | Social Science | Annual | `9-social-science-full` | indexed only |
| 10 | Science | Annual | `10-science-full` | indexed only |
| 10 | Social Science | Annual | `10-social-science-full` | indexed only |

**Eight known absent core slots:** Class 6 Science Terms II and III; Class 6 Social Science Terms I and III; Class 7 Science Terms I and III; Class 7 Social Science Terms II and III. This matrix does not encompass the Class 6–10 Tamil, English and Mathematics books, all of which must also be added to any **full all-subject** audit.

### D. All 43 indexed book records audited for internal count consistency

The following table is a **complete census of the current quiz index**, not a list of all textbooks published by Tamil Nadu. There are **zero books certified completely reviewed**. The rightmost two columns are deliberately "No" throughout; this means no **full-book certification**, not that every individual English passage lacks evidence.

| Grade | Indexed source book | Chapters mapped | Distinct linked MCQs | Complete English page scan? | Tamil original checked? |
| ---: | --- | ---: | ---: | --- | --- |
| 6 | `6-science-term-1` | 1 | 1 | No | No |
| 6 | `6-social-science-term-2` | 1 | 1 | No | No |
| 7 | `7-science-term-2` | 1 | 1 | No | No |
| 8 | `8-science-term-1` | 1 | 1 | No | No |
| 9 | `9-science-full` | 1 | 1 | No | No |
| 9 | `9-social-science-full` | 3 | 3 | No | No |
| 10 | `10-science-full` | 2 | 3 | No | No |
| 11 | `11-bio-botany-full` | 4 | 8 | No | No |
| 11 | `11-bio-zoology-full` | 1 | 3 | No | No |
| 11 | `11-business-maths-statistics-full` | 3 | 3 | No | No |
| 11 | `11-economics-full` | 1 | 1 | No | No |
| 11 | `11-history-full` | 2 | 3 | No | No |
| 11 | `11-political-science-vol-1` | 3 | 3 | No | No |
| 12 | `12-bio-botany-full` | 4 | 6 | No | No |
| 12 | `12-commerce-full` | 2 | 3 | No | No |
| 12 | `12-economics-full` | 2 | 5 | No | No |
| 12 | `12-history-full` | 4 | 7 | No | No |
| 11 | `11-micro-biology-full` | 2 | 6 | No | No |
| 12 | `12-micro-biology-full` | 4 | 4 | No | No |
| 11 | `11-computer-science-full` | 1 | 1 | No | No |
| 11 | `11-statistics-full` | 1 | 1 | No | No |
| 12 | `12-general-nursing-full` | 3 | 3 | No | No |
| 12 | `12-political-science-vol-1` | 1 | 3 | No | No |
| 12 | `12-physics-vol-2` | 1 | 1 | No | No |
| 11 | `11-biochemistry-full` | 1 | 1 | No | No |
| 12 | `12-vocational-nursing-full` | 2 | 3 | No | No |
| 12 | `12-basic-mechanical-engineering-full` | 3 | 4 | No | No |
| 12 | `12-computer-applications-full` | 2 | 2 | No | No |
| 12 | `12-textiles-dress-designing-full` | 1 | 1 | No | No |
| 11 | `11-vocational-nursing-full` | 1 | 2 | No | No |
| 11 | `11-textiles-dress-designing-full` | 2 | 2 | No | No |
| 12 | `12-food-service-management-full` | 1 | 1 | No | No |
| 12 | `12-biochemistry-full` | 2 | 2 | No | No |
| 11 | `11-home-science-full` | 1 | 1 | No | No |
| 12 | `12-home-science-full` | 1 | 1 | No | No |
| 11 | `11-computer-applications-full` | 2 | 2 | No | No |
| 11 | `11-computer-technology-full` | 2 | 2 | No | No |
| 12 | `12-computer-science-full` | 1 | 1 | No | No |
| 11 | `11-political-science-vol-2` | 2 | 2 | No | No |
| 11 | `11-accountancy-full` | 1 | 1 | No | No |
| 10 | `10-social-science-full` | 3 | 3 | No | No |
| 7 | `7-social-science-term-1` | 1 | 1 | No | No |
| 8 | `8-social-science-full` | 4 | 4 | No | No |

### E. High-risk editorial findings requiring original-page comparison

1. **FA050 / FA067 Psychology**: Class 12 General Nursing names Freud, while Class 11 Vocational Nursing names Wilhelm Wundt. Questions are explicitly scoped to different books. Resolve the contradiction with original English/Tamil page images and record what each printed edition says.
2. **FA077 Ecology**: Class 12 Bio-Botany names Alexander von "Humbolt" (conventional spelling Humboldt); other authorities sometimes name Ernst Haeckel. Keep the question tied to the exact source chapter and verify original wording.
3. **FA063 / FA055 robotics**: George Devol is called Father of Robotics in Mechanical Engineering, while Joseph Engelberger is called father of the modern robotics industry in Physics. Titles are not identical.
4. **FA014 Father of the Nation**: Bose's address to Gandhi is a historical usage, not a legal/constitutional designation.
5. **FA057 scientific management**: Class 12 Commerce outlines Taylor's work, while the exact "Father of Scientific Management" phrase is independently grounded in an official TNPSC departmental exam and Class 12 Basic Mechanical Engineering's exercise.
6. **FA070 personnel management**: Class 12 Food Service Management says **a** father of personnel management (Robert Owen), not a sole inventor.
7. **FA086 Nile**: "Father of African Rivers" is a figure of speech for a river, not a person's achievement. Consider a separate "honorific places" filter if this themed collection grows.
8. **FA002 missing page**: Legacy Class 8 Science reference `C08S-T1-U09-Q0002` has no verified printed page; do not supply one from guesswork. Check current Class 8 science annual/term scheme against the actual printed book.
9. **Source links**: Many older citations use Google Drive, Scribd, SlideShare, third-party PDF mirrors or internal question-bank paths. A valid HTTPS link or a successful source-text search **does not** certify official provenance, page images, link longevity, or 2026–27 currency.
10. **Tamil quality**: All 84 questions have authored Tamil text, but exact Tamil-medium source wording, spelling, technical terminology, distractors and answer correctness still need human/primary-book checks.

### F. Completion acceptance criteria, in order

- **Build the authoritative original-book manifest**: Grade, subject, term or volume, medium, academic year, chapter/unit count, official publisher PDF URL, page boundaries and SHA/hash if available, including elective/vocational texts for Classes 11–12. Verify against the [Government of Tamil Nadu Textbook and Educational Services Corporation](https://www.textbookcorp.in/) and Education Department listings. On **31 Oct 2026**, the Corporation advertises 2026–27 Term II distribution for lower classes, but this notice is **not** proof of a complete downloadable current-edition PDF catalog.
- **Acquire and check both media**: For every manifest entry read all English and Tamil pages, identify *Father / founder / pioneer* passages plus Tamil equivalents, review infoboxes/exercises and list source exact wording, correct answer, title scope, page, edition, and reviewer/date.
- **Resolve all source conflicts/typos** against the primary page, not the reproduced transcript; if genuinely disputed, phrase stems with context, record alternatives, and avoid a misleading universal single-answer claim.
- **Reconcile completeness mathematically**: Each expected book and chapter marked `unopened / partly reviewed / completely reviewed / not yet available`, record 0-fact chapters explicitly, and enforce source-to-question coverage without counting cross-references as extra questions.
- **Finish editorial and browser checks**: English/Tamil linguistic review, answer-key validity, accessibility, mobile navigation, result/retry, resume persistence, and live GitHub Pages deployment checked after publishing. Keep automated tests as safeguards, not substitutes for primary-source reading.

**Certification condition:** Claim "full Classes 6–12 Fathers audit complete" only once the official edition-specific manuscript inventory is reconciled and **every in-scope original book/chapter in both media** has a recorded checked outcome. Until then this remains a **partial textbook source review, with the repository bank structurally audited**.

## Checked in existing school-book question banks and selected original textbook pages

| Class | Source book / term | Distinct mapped questions | Question IDs | Review status |
| --- | --- | ---: | --- | --- |
| 6 | Science · Term I | 1 | FA002 | Curated from existing quiz bank; full original English/Tamil scan pending |
| 6 | Social Science · Term II | 1 | FA003 | Curated from existing quiz bank; full original English/Tamil scan pending |
| 7 | Social Science · Term I · Economics Unit 1 | 1 cross-reference | FA019 | 2019 SCERT English combined-volume text printed p.206 directly identifies Adam Smith as Father of Economics; Tamil original pending |
| 7 | Science · Term II | 1 | FA004 | Curated from existing quiz bank; full original English/Tamil scan pending |
| 8 | Science · Term I | 1 | FA002 | Curated from existing quiz bank; full original English/Tamil scan pending |
| 8 | Social Science · Full Year, History 1/7, Geography 7, Economics 2 | 4 source mappings (3 new, Ripon cited again) | FA084, FA085, FA086, FA076 | English SCERT 2024 revised edition reproduction, printed pages 2, 70, 143, 240 explicitly checked; original page image/Tamil medium and current prescription pending |
| 9 | Science · Full Year | 1 | FA006 | Curated from existing quiz bank; full original English/Tamil scan pending |
| 9 | Social Science · Full Year, History 1/8 and Civics 5 | 3 mapped | FA001, FA005, FA076 | 2023 SCERT English reproduction, Civics Unit 5 p.272 explicitly calls Lord Ripon Father of Local Government; History questions previously curated; Tamil original pending |
| 10 | Social Science · Full Year, History 4/10 and Civics 1 | 3 mapped (2 new, one Ambedkar cross-reference) | FA082–FA083, FA003 | Revised-2025 SCERT English text pp.41,117,239 inspected; 2025 original page images/Tamil originals pending |
| 10 | Science · Full Year, Units 18 & 20 | 3 | FA016, FA017, FA018 | English original PDF text and visible page screenshots checked (pp. 261, 287); Tamil and current-edition comparison pending |
| 11 | History · Full Year | 3 | FA007, FA008, FA009 | Curated from existing quiz bank; full original English/Tamil scan pending |
| 11 | Economics · Full Year, Unit 1 | 1 | FA019 | 2020 English original PDF text checked (p.22), PDF too large for screenshot; Tamil original pending |
| 11 | Accountancy · Unit 14, Computerised Accounting | 1 cross-reference | FA064 | SCERT English 2024 text p.327 explicitly calls Pacioli Father of Accounting and Bookkeeping in Europe; a second source, no duplicate MCQ; Tamil original pending |
| 11 | Business Mathematics & Statistics · Chapters 2, 3, 8 | 3 | FA022, FA023, FA024 | English original PDF text checked (pp.25,51,178); page screenshots failed due PDF size; Tamil original pending |
| 11 | Bio-Botany · Chapters 1, 2, 5, 9 | 8 mapped (7 distinct, plus source repeats) | FA031–FA034, FA036–FA038; FA004 | English Ch.5 pp.86,95,103 screenshots verified; existing chapters partly checked; Tamil original pending |
| 11 | Biochemistry · Unit 1 | 1 | FA056 | English SCERT text reproduction p.1 checked; original page image, Tamil and edition comparison pending |
| 11 | Bio-Zoology · Chapter 1 | 3 mapped (2 new + FA004 cited again) | FA035–FA036, FA004 | SCERT English Chapter 1 pp.4–5 screenshot verified; Tamil original pending |
| 11 | Computer Science · Chapter 1 | 1 cross-reference | FA002 | English SCERT text reproduction p.1 identifies Babbage; original printed page screenshot and Tamil original pending |
| 11 | Computer Applications · Chapters 1, 7 | 2 mappings (FA072 new, FA002 cross-source) | FA072, FA002 | Original SCERT English PDF 2020 edition pp.1,102 searchable text verified; PDF screenshot too large; original Tamil pending |
| 11 | Computer Technology · Chapters 1, 9 | 2 cross-source mappings (FA072 spreadsheet, FA002 Babbage) | FA072, FA002 | Original SCERT English PDF 2019 edition pp.1,135 searchable text verified; screenshot disabled; original Tamil pending |
| 11 | Textiles and Dress Designing · Chapters 14, 15 | 2 | FA068–FA069 | SCERT English reproduced text pp.153,167; Taylor and Worth explicitly labelled; page images and Tamil original pending |
| 11 | Home Science · Chapter 5 | 1 cross-reference | FA059 | SCERT English text reproduction p.88 independently calls Lavoisier Father of Nutrition; no duplicate MCQ; Tamil original pending |
| 11 | Vocational Nursing · Unit 3, Psychology and Sociology | 2 mapped (1 new FA067; Comte cross-reference FA051) | FA067, FA051 | Original English SCERT textbook text reproduction pp.53 and 78; Psychology title contradicts Class 12 General Nursing's Freud attribution; scope questions by book, original page images/Tamil pending |
| 11 | Microbiology · Chapters 1, 10 | 6 | FA040–FA045 | English SCERT text reproduction pp.3, 6, 150–151 checked; original page images, Tamil and current-edition review pending |
| 11 | Statistics · Chapter 1 | 1 cross-reference | FA030 | English SCERT text reproduction p.1 identifies Mahalanobis; original page screenshot and Tamil original pending |
| 11 | Political Science · Volume I, Units 1, 2 & 7 | 3 | FA020, FA021, FA074 | 2020 English source Unit 2 p.22 identifies Jean Bodin; older Unit 7 pp.109,119 already checked; original Tamil/page-image comparison pending |
| 11 | Political Science · Volume II, Units 8 & 12 | 2 | FA075, FA076 | 2020 English textbook reproduction p.136 John Locke and p.241 Lord Ripon ('Rippon' in source); original Tamil/page-image comparison pending |
| 12 | History · Full Year, Volumes I and II | 7 | FA005, FA010, FA011, FA013, FA014, FA080, FA081 | Existing curated references; new original SCERT English Volume II reproduction Unit10 p.19 and Unit11 pp.57,61 checked; original Tamil/page images and 2026–27 edition pending |
| 12 | General Nursing · Chapters 3, 4, 10 | 3 | FA050–FA052 | English SCERT reproduction pp.98, 102, 220 checked; includes qualified textbook-specific titles and printed spelling corrections; Tamil original pending |
| 12 | Vocational Nursing (Theory & Practical) · Chapters 1, 4 | 3 | FA058–FA060 | SCERT original English PDF directly inspected as searchable text: printed pp.16,104; PDF screenshot too large; Tamil original/current edition pending |
| 12 | Physics · Volume II, Unit 11 | 1 | FA055 | English SCERT reproduction p.263 checked; original page image and Tamil original pending |
| 12 | Basic Mechanical Engineering · Chapters 1, 9, 10 | 4 mapped (3 new, Taylor cross-reference) | FA061–FA063, FA057 | 2023-revised/2024-reprint SCERT English reproduced text pp.3,130–131,145; Tamil original/page images pending |
| 12 | Computer Applications · Chapters 10, 18 | 2 | FA065–FA066 | 2023-revised SCERT English reproduced text pp.139,247,252–253; Tamil original/page images pending |
| 12 | Computer Science · Chapter 11 | 1 new | FA073 | Revised 2023 SCERT English text reproduction p.191 explicitly names E. F. Codd; p.196 exercise repeats title; original page image and Tamil pending |
| 12 | Textiles and Dress Designing · Chapter 13 | 1 | FA064 | English SCERT text p.202 calls Luca Pacioli Father of Accounting and Bookkeeping; Tamil original/page images pending |
| 12 | Political Science · Volume I, Unit 8 | 3 mappings (2 new, FA018 cross-source) | FA053–FA054, FA018 | English SCERT reproduction pp.180,183,185 checked; original page images and Tamil original pending |
| 12 | Commerce · Chapters 1, 16 | 3 | FA025, FA026, FA057 | Original English textbook p.8 and pp.130,136 previously checked; 2024 English reprint text reconfirmed Fayol and Nader; new Taylor scientific-management attribution pp.4–7 is linked to explicit official TNPSC May 2024 departmental question 19; original page images and Tamil still pending |
| 12 | Food Service Management · Chapter 7 | 1 | FA070 | English SCERT textbook reproduction p.145 explicitly calls Robert Owen **a** father of personnel management; exercise p.159; Tamil original pending |
| 12 | Biochemistry · Units 8, 10 | 2 mapped (one new, Jenner cross-reference) | FA071, FA042 | English SCERT textbook reproduction p.187 names Lavoisier Father of Modern Chemistry; Immunology exercise p.261 repeats Jenner; Tamil pending |
| 12 | Home Science · Unit 7 | 1 cross-reference | FA025 | English SCERT text reproduction p.183 calls Henri Fayol father of management principles; no duplicate MCQ; Tamil original pending |
| 12 | Microbiology · Chapters 7, 9, 10, 11 | 4 | FA046–FA049 | English SCERT text reproduction pp.114, 188, 206, 241 checked; original page images, Tamil and current-edition review pending |
| 12 | Bio-Botany · Chapters 2, 5, 6, 9 | 6 mapped (4 new, 2 cross-citations) | FA039, FA077–FA079; FA016, FA018 | Original older English pp.36,121,222 screenshots previously checked; new revised-2023/reprinted-2024 English Ch6 p.109 text checked (Ecology, Modern Ecology, Indian Ecology), but screenshot and Tamil pending |
| 12 | Economics · Chapters 1, 12 | 5 mapped (4 new + FA024 sourced again) | FA027–FA030; FA024 | Revised 2022 SCERT English source pp.1,5,6,257–258; original page screenshots verified; Tamil original pending |

Book/question counts are based on existing curated question-bank or source-text entries. **They are not proof that every page of an original printed textbook has been reviewed.**

The same question may refer to multiple source books: Charles Babbage (Class 6 and Class 8 Science), and Petrarch (Class 9 Social Science and Class 12 History). Such facts are asked once in the combined quiz to avoid repeated MCQs.

## New selected original-book evidence (31 October 2026)

### Class 10 Science — original English pages and screenshots reviewed
- **Unit 18, Heredity, printed p.261:** "Gregor Johann Mendel — Father of Genetics" is an explicit section heading. [Class 10 Science Unit 18 original PDF](https://cdn1.byjus.com/wp-content/uploads/2019/04/Tamilnadu-Board-Class-10-Science-Textbook-Chapter-18.pdf), actual page 1 of the split PDF. New question FA016.
- **Unit 20, Breeding and Biotechnology, printed p.287:** The original page names **Norman E. Borlaug** as the worldwide "Father of the Green Revolution" and **M. S. Swaminathan** as the "Father of Indian Green Revolution." [Class 10 Science Unit 20 original PDF](https://cdn1.byjus.com/wp-content/uploads/2019/04/Tamilnadu-Board-Class-10-Science-Textbook-Chapter-20.pdf), actual page 2 of the split PDF. New questions FA017 and FA018. Titles are intentionally kept distinct.
- **Class 10 repository audit:** all 23 existing Science unit quiz-bank files were examined for explicit honorary-title phrases, and the two separately located original English source chapters were inspected for additional source facts. This is not a 23-volume exhaustive scan.

### Class 11 Economics — original English PDF text checked
- **Unit 1, Introduction to Micro-Economics, printed p.22:** Model question 9 asks "Who is the Father of Economics?", includes **Adam Smith**, and the printed answer grid marks choice **(b)**. [Class 11 Economics source PDF](https://winmeen.com/wp-content/uploads/2020/09/11th-Std-Economics-English-Medium.pdf). New question FA019.
- **Limitation:** the roughly 54 MB PDF exceeds online screenshot-fetch size limits. Searchable text and adjacent answer table were examined; visual original layout and Tamil version have not been independently verified. The visible English PDF identifies revised 2020 edition.

### Class 11 Political Science — original English PDF text checked
- **Volume I, Unit 7, printed p.109:** Aristotle is expressly called the "father of Political Science" in the discussion of his *Politics*. New FA020.
- **Volume I, Unit 7, printed p.119:** John Locke is expressly called the "father of philosophical liberalism." New FA021.
- Original English book: https://www.winmeen.com/wp-content/uploads/2020/09/11th-Std-Political-Science-English-Medium.pdf (2020 revision). The larger full-book PDF also exceeded screenshot size limits; English searchable text is verified, actual page render and Tamil-original wording remain pending.

**Review status policy:** The Class 10 screenshot checks establish the English source page's stated title only. They do not certify whole chapters, complete subject books, translation fidelity, or the 2026–27 prescribed editions. Original Tamil references should be added only after a source edition is inspected; until then Tamil explanations are explicitly editorial translations.

## Additional book-by-book original-English source review (31 October 2026)

### Class 11 — Business Mathematics and Statistics
[Original SCERT English 2018 / revised 2019–2020 PDF](https://winmeen.com/wp-content/uploads/2020/09/11th-Std-Business-Mathematics-Statistics-English-Medium.pdf), 30 MB; verified passages in the source's searchable PDF text:
- **Chapter 2, Algebra, printed p.25** — the introduction expressly describes **Al-Khwarizmi** as traditionally the "Father of algebra". Added FA022.
- **Chapter 3, Analytical Geometry, printed p.51** — **René Descartes** is expressly called the father of analytical geometry, with his 1637 work *La Géométrie* mentioned. Added FA023.
- **Chapter 8, Descriptive Statistics and Probability, printed p.178** — Sir **Ronald A. Fisher** is described as **"a father of statistics"**; not the only father. FA024 preserves this cautious distinction and mentions his contributions to experimental design.
- The source PDF image-screenshot requests failed because its file size exceeded the web renderer's limit; **text verified, page image not verified**, and no original Tamil edition inspected.

### Class 12 — Commerce
[Original SCERT Commerce English revised 2020–2021 PDF](https://www.winmeen.com/wp-content/uploads/2020/09/12th_Std_Commerce_EM_optimised.pdf):
- **Chapter 1, Principles of Management, printed p.8, §1.06:** **Henry (Henri) Fayol** is expressly called the **Father of Modern Management**, followed by his fourteen principles. Added FA025; do not confuse with F. W. Taylor's scientific management.
- **Chapter 16, Consumerism, printed p.130, §16.05:** **Ralph Nader** is expressly described as the **Father of the Consumer Movement**. The book repeats the quiz prompt on **printed p.136** with Ralph Nader as the correct option; added FA026.
- Tried screenshot retrieval from the 2020–2021 Winmeen copy (disabled) and a separate school copy (file too large), so the English original **text** and its page labels were checked but the source page **images were not**. Original Tamil and current-prescribed edition comparisons are pending.

**Verification standards:** Only title-to-person pairs explicitly present in original-source **English searchable PDF text** were added. **F. W. Taylor as Father of Scientific Management** is a common general-knowledge answer and is discussed as a pioneer in Commerce Chapter 1, but was **not added** here because the reviewed original passage did not explicitly attach that exact honorific. No complete page-by-page audit has been claimed. All Tamil question wording and explanations in this batch are editorial translations, not yet original Tamil textbook quotations.

## New Class 11 Bio-Botany and Class 12 Economics review (31 October 2026)

### Class 11 Bio-Botany — Chapter 2, Plant Kingdom
- [Original SCERT Chapter 2 English PDF](https://tuv.oer4pacific.org/id/eprint/212/3/Higher-Secondary-Biology-Chapter2-Diversity-of-Living-World.pdf), 2020 layout, printed pages 31–51. Relevant passages were inspected in the source PDF text:
  - Printed **p.33**: **M. O. Parthasarathy Iyengar (M. O. P. Iyengar)** is identified as Father of Indian Phycology (FA031). Spell out surname Iyengar; don't incorrectly use the shorter first name alone.
  - Printed **p.37**: **Shiv Ram Kashyap** is identified as Father of Indian Bryology (FA032).
  - Printed **p.43**: **Prof. Birbal Sahni** is identified as Father of Indian Palaeobotany (FA033).
- Screenshot retrieval for this PDF was attempted but the source host disabled that endpoint. Record as **original English PDF text reviewed; page images not independently verified**.

### Class 11 Bio-Botany — Chapter 9, Tissue and Tissue System
- [Original SCERT Chapter 9 English PDF](https://slb.oer4pacific.org/id/eprint/219/1/Higher-Secondary-Biology-Chapter9-Tissue-Tissue-System.pdf), printed **p.168**. **Nehemiah Grew (1641–1712)** is explicitly called Father of Plant Anatomy (FA034).
- The PDF's **first page screenshot was successfully inspected**, showing the boxed title and identity.

### Class 12 Economics — Chapter 1 and Chapter 12
- [Original SCERT English full-book PDF, revised 2022](https://www.srivenkateshwaraopenschool.com/wp-content/uploads/2023/11/12th_Economics_EM-www.tntextbooks.in_-1.pdf). Selected relevant pages were **visually inspected** as PDF screenshots, as well as in the text:
  - Printed **p.1**: **John Maynard Keynes**, Father of Modern Macro Economics (FA027).
  - Printed **p.5**: **Adam Smith**, Father of Capitalism (FA028). This is a **distinct title** from his already present Father of Economics MCQ FA019, so both are retained.
  - Printed **p.6**: **Karl Marx**, Father of Socialism (FA029); this is a textbook-specific conventional designation, not a claim that all socialist thought started with him.
  - Printed **p.258**: **P. C. Mahalanobis**, Father of Statistics in India (FA030). The question explicitly says *in India* to distinguish the title from Ronald A. Fisher.
  - Printed **pp.257–258**: **Ronald A. Fisher** is also labelled Father of Statistics. Rather than create another Fisher MCQ, the second book source has been added to **existing FA024** as a separate `source_references` entry.
- The printed-page numbering is distinct from the PDF 0-based pages: printed pages 1, 5, 6, 258 appear in screenshots of PDF pages 6, 10, 11, 263 respectively.
- No original Tamil PDF pages, prescribed 2026–27 edition, or complete-book scan have been certified. Tamil questions are editorial translations.

## New textbook review: Class 11 Bio-Zoology and Bio-Botany Chapter 1 (31 October 2026)

**Primary chapter PDFs checked by reading original page images and original searchable text:**

1. [Class 11 Bio-Zoology Chapter 1, *The Living World*](https://cdn1.byjus.com/wp-content/uploads/2019/04/Tamilnadu-Board-Class-11-Zoology-Chapter-1.pdf), SCERT original English chapter (first 2018 edition era). Original **printed p.4** explicitly distinguishes **Aristotle, father of classical taxonomy** from **Carolus Linnaeus, father of modern taxonomy** (new FA035 and existing FA004 source citation). Screenshot: zero-based PDF page 3.
2. Same Bio-Zoology PDF, **printed p.5**: **Theophrastus, Father of Botany**, in the narrative following Aristotle's classification. Screenshot: zero-based PDF page 4.
3. [Class 11 Bio-Botany Chapter 1, *Living World*](https://nru.oer4pacific.org/id/eprint/211/3/Higher-Secondary-Biology-Chapter1-Living-World.pdf), SCERT original English 2020 chapter. **Printed p.8** says **Theophrastus, Father of Botany** (new FA036). Screenshot: zero-based PDF page 7. This is the **same fact** as in Bio-Zoology, so FA036 records **both textbook citations** instead of a duplicate MCQ.
4. Same Bio-Botany PDF, **printed p.21**: **E. J. Butler (1874–1943), Father of Indian Mycology** (new FA037). Screenshot: zero-based PDF page 20. The same paragraph calls **P. A. Micheli "founder of mycology"**; that separate designation was **not inserted** as a "Father" question to keep exact textbook/title scope.

**Review limitations:** Printed source-book page numbers are not PDF viewer indices. The English pages cited above have been visually checked; the corresponding original Tamil-medium page expressions, latest prescribed 2026–27 editions, and remaining pages of each complete book are still pending. Tamil questions/explanations are editorial translations. One combined quiz still contains all classes and source books.

## Additional original textbook audit: DNA barcoding and tissue culture (31 October 2026)

### Class 11 Bio-Botany, Chapter 5 — Taxonomy and Systematic Botany

[2020 SCERT English chapter PDF](https://tuv.oer4pacific.org/id/eprint/215/3/Higher-Secondary-Biology-Chapter5-Taxonomy-and-Systematic-Botany.pdf). Three separate original page images were inspected:

- **Printed p.86 (PDF page index 0):** **Theophrastus** is expressly called *Father of Botany*. This is already FA036, so a **new source chapter citation** was attached to the existing question instead of adding a duplicate.
- **Printed p.95 (PDF page index 9):** **Carolus Linnaeus** is described as *Father of Taxonomy*. Existing FA004 asks about his *modern taxonomy* title and already links another original school chapter; this chapter has been added as a contextual reference, not as a repeat question.
- **Printed p.103 (PDF page index 17):** **Paul Hebert** (spelled *Hebert* in this SCERT English page) is explicitly named *Father of barcoding* for his 2003 DNA-barcoding proposal. New **FA038** uses the more precise label *Father of DNA Barcoding*. This SCERT spelling follows the inspected page.

### Class 12 Bio-Botany, Chapters 2, 5, 9

Three original English chapter PDFs, from the SCERT 2019 edition, were visually inspected:

- [Chapter 2, Classical Genetics, p.36 (PDF page index 1)](https://cdn1.byjus.com/wp-content/uploads/2019/04/Tamilnadu-Board-Class-12-Botany-Chapter-2.pdf): **Gregor Johann Mendel**, *Father of Genetics*. Added a new citation to existing **FA016**, no extra question.
- [Chapter 5, Plant Tissue Culture, p.121 (PDF page index 0)](https://cdn1.byjus.com/wp-content/uploads/2019/04/Tamilnadu-Board-Class-12-Botany-Chapter-5.pdf): **Gottlieb Haberlandt**, *Father of Tissue Culture*. New **FA039**, describing his 1902 experiments and totipotency.
- [Chapter 9, Plant Breeding, p.222 (PDF page index 10)](https://cdn1.byjus.com/wp-content/uploads/2019/04/Tamilnadu-Board-Class-12-Botany-Chapter-9.pdf): **M. S. Swaminathan**, *Father of Green Revolution in India*. Added another textbook reference to existing **FA018**.

**Deduplication policy:** A single question may now have multiple **chapters from the same textbook**, and the same title may also have citations to separate classes. Duplicate checking uses the *source ID* (book/chapter/page/fact), not just book ID, while the exam player continues to present one combined quiz. The `books` table lists **distinct mapped question IDs**, not merely the number of source references. Titles and their exact scope must be checked in the corresponding page image.

**Review limitations:** The original English SCERT book excerpts above were checked, but neither the original Tamil medium wording nor the presently prescribed 2026–27 edition across all chapters has been audited. Source snippets do not constitute full Class 6–12 textbook completion.

## New source review: Classes 11 and 12 Microbiology (31 October 2026)

This batch adds ten distinct **English/Tamil bilingual MCQs**, FA040–FA049. Every fact below is sourced to a **searchable reproduction of the English Tamil Nadu SCERT textbook text**. The quoted printed-page numbers were checked in that reproduction; **the full original printed page images have not yet been independently examined**. Tamil originals and the 2026–27 edition remain pending.

### Class 11 Microbiology

Source: [Class 11 Microbiology English SCERT text reproduction](https://ru.scribd.com/document/683613057/11th-Micro-Biology-English-Medium-Text).

| Chapter | Printed page | Explicit designation | Person | MCQ |
| --- | ---: | --- | --- | --- |
| 1 · Introduction to Microbiology | 3 | Father of Microbiology | Antonie van Leeuwenhoek | FA040 |
| 1 · Introduction to Microbiology | 3 | Father of Modern Microbiology | Louis Pasteur | FA041 |
| 1 · Introduction to Microbiology | 6 | Father of Immunology | Edward Jenner | FA042 |
| 1 · Introduction to Microbiology | 6 | Father of Medical Microbiology | Robert Koch | FA043 |
| 10 · Soil Microbiology | 150–151 | Father of Soil Microbiology | Sergei Winogradsky | FA044 |
| 10 · Soil Microbiology | 151 | Father of Microbial Ecology | Martinus Beijerinck | FA045 |

### Class 12 Microbiology

Source: [Class 12 Microbiology English SCERT text reproduction](https://www.scribd.com/document/527198339/Std12-Microbiology-EM-Www-tntextbooks-in).

| Chapter | Printed page | Explicit designation | Person | MCQ |
| --- | ---: | --- | --- | --- |
| 7 · Medical Bacteriology | 114 | Father of Bacteriology | Robert Koch | FA046 |
| 9 · Medical Mycology | 188 | Father of Medical Mycology | Raymond Jacques Sabouraud | FA047 |
| 10 · Medical Virology | 206 | Father of Virology | Martinus Beijerinck | FA048 |
| 11 · Immunology | 241 | Father of Immunization | Edward Jenner | FA049 |

These are distinct honorifics even when attributed to the same person; do not collapse *Father of Immunology* with *Father of Immunization*, *Father of Medical Microbiology* with *Father of Bacteriology*, or *Father of Microbial Ecology* with *Father of Virology*.

### Additional Class 11 cross-book confirmations

- **Computer Science, Chapter 1, printed p.1:** [English 2024 SCERT text reproduction](https://www.slideshare.net/slideshow/class_11_computer_science_english_medium-2024_edition-www-tntextbooks-in-pdf/283291774) explicitly calls **Charles Babbage** Father of Computer. Existing FA002 gained this source reference, not a duplicate MCQ.
- **Statistics, Chapter 1, printed p.1:** [English SCERT text reproduction](https://www.scribd.com/document/627737963/11th-Statistics-EM-Www-tntextbooks-in) describes **P. C. Mahalanobis** as Father of Indian Statistics. Existing FA030 gained this source reference, not a duplicate MCQ.

**Source-quality boundary:** These are English SCERT text reproductions, not a verified complete scan of the printed original. Page images, Tamil-medium official wording, source-host stability, and textbook edition comparison remain pending.

## New book review: Nursing, Political Science, Physics and Biochemistry (31 October 2026)

**Seven new bilingual MCQs (FA050–FA056)** and one additional textbook cross-reference to existing **FA018** are indexed. All are grounded in **English SCERT textbook-text reproductions** with printed page references. These have **not** been independently verified against the original printed page images or official Tamil editions; do not label them “original-page visually verified”.

| Class and book | Unit / chapter | Printed page | Exact or narrowly described honorary title | Person | MCQ |
| --- | --- | ---: | --- | --- | --- |
| 12 General Nursing | 3 · Applied Psychology | 98 | Father of Psychology (source-specific label, not universally agreed) | Sigmund Freud | FA050 |
| 12 General Nursing | 4 · Applied Sociology | 102 | Father of Sociology | Auguste Comte | FA051 |
| 12 General Nursing | 10 · Mental Health Nursing | 220 | Father of Psychiatry (historical textbook usage) | Asclepiades of Bithynia | FA052 |
| 12 Political Science Volume I | 8 · Planning and Development Politics | 180 | Father of the White Revolution in India | Verghese Kurien | FA053 |
| 12 Political Science Volume I | 8 · Planning and Development Politics | 183 | Father of New Economic Policy of India | Dr. Manmohan Singh | FA054 |
| 12 Physics Volume II | 11 · Recent Developments in Physics | 263 | Father of the modern robotics industry | Joseph Engelberger | FA055 |
| 11 Biochemistry | 1 · Basic Concepts of Biochemistry and Cell Biology | 1 | Father of Modern Biochemistry | Carl Alexander Neuberg | FA056 |

### Source links and editorial distinctions

- [Class 12 General Nursing English SCERT text reproduction](https://www.scribd.com/document/981648483/12th-General-Nursing-EM-Www-tntextbooks-in-1), chapters 3, 4, and 10. The text calls Freud “Father of Psychology”, although the designation is debated: Freud founded psychoanalysis; Wundt is widely called the father of experimental psychology. **Limit FA050 to its cited course context.** It spells Comte's surname “Comete” (correct: Auguste Comte) and Asclepiades “Asciepiades” (correct: Asclepiades), so the questions use corrected names while recording the source's spellings. **FA052 is source-specific, not a claim of global consensus.**
- [Class 12 Political Science English SCERT 2024 text reproduction](https://www.scribd.com/document/893037962/Class-12-Political-Science-English-Medium-2024-Edition-www-tntextbooks-in), Unit 8, p.180 identifies Verghese Kurien; p.183 calls Dr. Manmohan Singh Father of India's New Economic Policy. The printed MCQ on p.185 asks about the Indian Green Revolution title; FA018 gains this source without creating a duplicate.
- [Class 12 Physics Volume II English SCERT text reproduction](https://www.scribd.com/document/685856455/12th-Physics-Vol-2-EM-Www-tntextbooks-in), Unit 11, p.263. The source distinguishes **George Devol**, inventor of Unimate, from **Joseph Engelberger**, described as father of the modern robotics industry. Do not shorten the question to “Father of Robotics”.
- [Class 11 Biochemistry English SCERT text reproduction](https://www.scribd.com/document/1034155153/XI-biochemistry-Final-21-05-18-15-15), Unit 1, p.1 names **Carl Alexander Neuberg** Father of Modern Biochemistry.

**Outstanding checks for this batch:** Independently view each original printed English page, compare original Tamil wording and prescribed 2026–27 editions, and repair any source links that fail access. These seven additions do **not** establish full Class 6–12 coverage.

## Book-by-book continuation: Class 12 Commerce and Class 11 Geography (31 October 2026)

### Class 12 Commerce — English 2024 reprint

Rechecked the [English 2024 SCERT Commerce textbook text reproduction](https://www.scribd.com/document/1074624974/Class-12-Commerce-English-2024-Edition-www-tntextbooks-in), including Chapter 1 (*Principles of Management*) and Chapter 16 (*Consumerism*).

| Item | Printed page | Verified content | Action |
| --- | ---: | --- | --- |
| Chapter 1, section 1.05 | 4–7 | Frederick Winslow Taylor developed and promoted scientific management principles | New FA057, with a carefully qualified title |
| Chapter 1, section 1.06 | 8 | Henri (Henry) Fayol explicitly identified as Father of Modern Management | Existing FA025: append 2024 reprint source |
| Chapter 16 | 130, 136 | Ralph Nader described as Father of the Consumer Movement; exercise repeats title | Existing FA026: append 2024 reprint source |

**Critical title-source distinction:** The SCERT Chapter 1 text attributes scientific management to **F. W. Taylor**, but its searchable reproduction does **not** explicitly call him the *Father of Scientific Management*. The exact honorific is independently printed in the [official TNPSC May 2024 Co-operative Management departmental test, paper 068, question 19](https://tnpsc.gov.in/static_pdf/anskeys/Deptl/May2024/068.pdf) (alongside question 17 for Father of Management). **FA057 therefore distinguishes (1) textbook chapter attribution and (2) exam wording.** The official PDF's searchable text was inspected; its web screenshot request timed out. Do not label its page image as checked.

Class 12 Commerce has at least **33 chapters** in the listed 2024 edition. The reviewed passages were checked for explicit/title-related facts, but this is **not** certification of every page or of a complete Tamil-medium audit.

### Class 11 Geography — Unit 1, Fundamentals of Geography

Read the [2024-reprint SCERT English Geography text reproduction](https://www.scribd.com/document/1050161946/11th-Geography-EM-Text), Unit 1, printed pp.1–2. Page 2 says the term *Geography* was coined by **Eratosthenes**; it calls **Herodotus** the first Greek geographer. It does **not** explicitly designate Eratosthenes the *Father of Geography*. Therefore **no new 'Father of Geography' question** was added merely by extrapolating from the passage. Further chapter and original Tamil page review remains required.

### Source-confidence and remaining limitations

- SCERT 2024 English textbook reproductions: page text checked, but original English page-image and source-host completeness not independently checked.
- TNPSC 2024 official PDF: exact phrase and competing options inspected in searchable text; screenshot endpoint timed out.
- The original Tamil-medium wording, prescribed 2026–27 updates and complete page-by-page Class 6–12 coverage are **still pending**.
- Do not confuse **Father of Scientific Management — F. W. Taylor** with **Father of Modern Management — Henri Fayol**.

## Class 12 Vocational Nursing — original SCERT PDF text review (31 October 2026)

This is **Vocational Education Nursing (Theory & Practical)**, a distinct publication from the **Class 12 General Nursing** book already indexed. [Read the original government SCERT Nursing Vocational English textbook PDF, first edition 2019 / revised 2020](https://samacheerkalvistudents.in/Books/Books%20samacheerkalvi/12th%20std%20school%20books/New%20Books/Vocational%20Subject%20English/12th_Nursing_Vocational_EM.pdf).

The PDF was opened as the actual SCERT book with its title/edition page, and its searchable text was inspected for each explicit "Father of" designation. The PDF screenshot service rejected this approximately 43 MB file, so none of these three page images is claimed to have been visually checked. Original Tamil-medium and 2026–27 prescribed editions also remain pending.

| Chapter | Printed page | Exact English textbook designation | Person | Quiz ID |
| --- | ---: | --- | --- | --- |
| 1 · Home Nursing, AYUSH / Yoga section | 16 | Father of Yoga | Maharishi Patanjali | FA058 |
| 4 · Nutrition, introductory section | 104 | Father of Nutrition | Antoine Lavoisier | FA059 |
| 4 · Nutrition, introductory section | 104 | Father of Medicine | Hippocrates | FA060 |

**Page detail:** The text calls Patanjali the Father of Yoga at printed p.16, in the context of classical yoga philosophy. Printed p.104 separately attributes Nutrition to Lavoisier and Medicine to Hippocrates; the two labels belong to different people and should not be confused. These are traditional honorific descriptions and do not assert exclusive invention of either field.

**Audit discipline:** The full PDF is available as a searchable text source, but the selected lines are not evidence that all chapters were exhaustively reviewed; this batch records two chapters and their relevant pages only.

## New source audit: mechanical engineering, computing, textiles and vocational nursing (31 October 2026)

**Seven new bilingual MCQs (FA061–FA067)** were added from four more indexed TN SCERT books. Searchable **English textbook reproductions** and printed page references were directly inspected. Original page-image comparison, prescribed 2026–27 edition matching and Tamil-medium review remain pending.

| Class/book | Chapter | Printed page | Textbook-specific title | Person / Quiz |
| --- | --- | ---: | --- | --- |
| 12 Basic Mechanical Engineering | 1 · Lathe | 3 | Father of Machine Tools | Henry Maudslay · FA061 |
| 12 Basic Mechanical Engineering | 9 · Automation and Robotics | 130 | Father of Automation | Nikola Tesla · FA062 |
| 12 Basic Mechanical Engineering | 9 · Automation and Robotics | 131 | Father of Robotics | George Devol · FA063 |
| 12 Textiles & Dress Designing | 13 · Entrepreneurship Development | 202 | Father of Accounting and Bookkeeping | Luca Pacioli · FA064 |
| 12 Computer Applications | 10 · Introduction to Computer Networks | 139 | Father of the Internet | Vint Cerf · FA065 |
| 12 Computer Applications | 18 · Electronic Data Interchange | 247,252–253 | Father of EDI | Ed Guilbert · FA066 |
| 11 Vocational Nursing | 3 · Introduction to Psychology and Sociology | 53 | Father of Psychology (textbook attribution) | Wilhelm Wundt · FA067 |

### Source publications and cross-references

- [Class 12 Basic Mechanical Engineering — SCERT English reproduced text, 2023 revision, 2024 reprint](https://www.scribd.com/document/821082406/12th-Basic-Mechanical-Engineering-English-Medium-Text-Www-tntextbooks-in): Lathe p.3 explicitly calls **Henry Maudslay** Father of Machine Tools; Automation and Robotics pp.130–131 explicitly name **Nikola Tesla** Father of Automation and **George Devol** Father of Robotics. Chapter 10 p.145 independently includes an official textbook MCQ identifying **F. W. Taylor** as Father of Scientific Management, cross-linked to existing FA057 rather than creating another question.
- [Class 12 Computer Applications — SCERT English revised 2023](https://www.scribd.com/document/833406584/12th-Computer-Application-EM-TJ-V23): Chapter 10 p.139 calls **Vint Cerf** Father of the Internet and names **Robert Kahn** as collaborator. The Internet is a collective invention; avoid sole-inventor language. Chapter 18 p.247 and points-to-remember p.252 identify **Ed Guilbert** Father of EDI; p.253 repeats this in an exercise.
- [Class 12 Textiles and Dress Designing — SCERT English 2019](https://www.scribd.com/document/809268057/document): Chapter 13 p.202 describes **Luca Pacioli** as Father of Accounting and Bookkeeping for his treatise on double-entry bookkeeping. Do not imply he invented all accounting.
- [Class 11 Vocational Nursing — SCERT English 2018/2019](https://www.scribd.com/document/928256789/TN-Board-Class-11-Nursing-Vocational-Textbook): Unit 3 p.53 identifies **Wilhelm Wundt** as Father of Psychology and founder of modern psychology; p.78 explicitly names **Auguste Comte** Father of Sociology, added as a cross-reference to existing FA051.

### Important contradiction in two TN school books

- **Class 11 Vocational Nursing, Unit 3, p.53:** *Wilhelm Wundt* is called Father of Psychology, with a reference to his 1879 laboratory.
- **Class 12 General Nursing, Chapter 3, p.98:** *Sigmund Freud* is called Father of Psychology.

Both statements appear in the printed English source text reproductions. They do **not** establish that two different people each exclusively held an official title. **FA050** now asks specifically about the Class 12 General Nursing book (Freud), while **FA067** specifically asks about Class 11 Vocational Nursing (Wundt). Explanations cross-reference the conflict; they must never be simplified to an unqualified single-answer "Father of Psychology" MCQ. These are book-specific facts, not an endorsed consensus.

### Further editorial distinctions

- Class 12 Basic Mechanical Engineering calls George Devol **Father of Robotics**; Class 12 Physics FA055 uses **Father of the modern robotics industry** for Joseph Engelberger. Maintain the exact title wording.
- The automation label for Nikola Tesla is source-specific and should not be universalized.
- Original Tamil and current textbook source confirmation is pending. Reviewing a handful of passages in a book does **not** certify that every page of that book has been audited.

## Review of Class 11/12 textiles, home science, food-service management and biochemistry (31 October 2026)

This batch adds **four new bilingual titles (FA068–FA071)** and links three existing answers to additional textbooks, covering five newly indexed SCERT subject books. The selected facts and printed page numbers were checked in online **English textbook text reproductions**, not independently against photographed original page images. Tamil-medium originals and 2026–27 editions remain to be checked.

| Class / source | Chapter | Printed page | Exact source designation | Person | Action |
| --- | --- | ---: | --- | --- | --- |
| 11 Textiles & Dress Designing | 14 Industrial Engineering | 153 | Father of Industrial Engineering | Frederick W. Taylor | FA068 new |
| 11 Textiles & Dress Designing | 15 Fashion Concepts | 167 | Father of Haute Couture | Charles Frederick Worth | FA069 new |
| 12 Food Service Management | 7 Human Resource Management | 145, 159 | **A** father of personnel management | Robert Owen | FA070 new |
| 12 Biochemistry | 8 Biological Oxidation | 187 | Father of Modern Chemistry | Antoine Lavoisier | FA071 new |
| 11 Home Science | 5 Nutrition | 88 | Father of Nutrition | Antoine Lavoisier | Add reference to FA059 |
| 12 Home Science | 7 Entrepreneurship | 183, 197 (MCQ) | Father of Principles of Management | Henri Fayol | Add reference to FA025 |
| 12 Biochemistry | 10 Immunology | 261 (MCQ) | Father of Immunology | Edward Jenner | Add reference to FA042 |

### Checked textbook sources

- [Class 11 Textiles and Dress Designing — SCERT English 2022 revision](https://www.scribd.com/document/791560626/11th-Textile-and-Dress-Designing-EM-www-tntextbooks-in): Chapter 14 p.153 explicitly gives Frederick W. Taylor's industrial engineering designation; Chapter 15 p.167 describes Charles Frederick Worth as regarded by many historians as father of haute couture.
- [Class 12 Food Service Management — SCERT English 2020 revision](https://www.scribd.com/document/796118050/12th-Std-Food-Service-Management-EM-Optimised): Chapter 7 p.145 explicitly describes Robert Owen as **“a father of personnel management”**, rather than making him the sole father. The exercise on p.159 names him among choices. Preserve the non-exclusive wording.
- [Class 12 Biochemistry — SCERT English revised 2020/2022](https://www.scribd.com/document/797954520/12th-Bio-Chemistry-EM-Text): Unit 8 p.187 explicitly calls Antoine Lavoisier father of modern chemistry. Unit 10 p.261 includes a multiple-choice question identifying Edward Jenner as father of immunology. The latter is a **cross-book citation for FA042**, not a new question.
- [Class 11 Home Science — SCERT English revised 2022](https://www.scribd.com/document/785978519/11th-Home-Science-EM-Text): Chapter 5 p.88 explicitly calls Antoine Lavoisier father of nutrition and mentions his calorimeter, supporting the existing FA059 rather than creating a duplicate.
- [Class 12 Home Science — SCERT English revised 2022](https://www.scribd.com/document/774262534/Home-Science-Class-12-Home-Science-Em-From-2019): Unit 7 p.183 explicitly calls Henri Fayol father of principles of management, with an exercise on p.197. Existing **FA025** already covers Fayol's father-of-modern-management title; this is linked as an additional source for the same management pioneer without needlessly repeating the answer.

### Quality choices

1. **FA068 versus FA057:** Taylor is credited with *Industrial Engineering* in the textiles course; existing FA057 covers *Scientific Management*. Distinct titles, same pioneer.
2. **FA071 versus FA059:** Lavoisier is called *Father of Modern Chemistry* by Biochemistry and *Father of Nutrition* by Home Science and Vocational Nursing. Distinct fields, same scientist.
3. **FA070:** The textbook uses **“a father”**, and the question does not assert a universally unique founder.
4. **Evidence status:** Checked pages are curated extracts; do not mark all chapters of any book as complete, and do not claim original Tamil page-image verification.

## Computer Applications, Computer Technology and Computer Science source review (31 October 2026)

The latest check adds **two new English/Tamil MCQs** and indexes **three distinct source books**. The pair is deliberately not inflated into extra questions just because the same fact occurs in more than one class book.

| Source | Printed page | Textbook title | Correct answer | Quiz action |
| --- | ---: | --- | --- | --- |
| Class 11 Computer Applications, Chapter 7 · Working with OpenOffice Calc | 102 | Father of the Spreadsheet | Daniel Singer “Dan” Bricklin | **New FA072** |
| Class 11 Computer Technology, Chapter 9 · Introduction to Spreadsheet | 135 | Father of the Spreadsheet | Daniel Singer “Dan” Bricklin | Add second source to FA072 |
| Class 12 Computer Science, Chapter 11 · Database Concepts | 191; exercise 196 | Father of the Relational Database | Edgar Frank Codd | **New FA073** |
| Class 11 Computer Applications, Chapter 1 · Introduction to Computers | 1 | Father of the Computer | Charles Babbage | Cross-reference existing FA002 |
| Class 11 Computer Technology, Chapter 1 · Introduction to Computers | 1 | Father of the Computer | Charles Babbage | Cross-reference existing FA002 |

### Primary and text-reproduction sources

- [Class 11 Computer Applications, original SCERT English revised 2020 PDF](https://cdn1.byjus.com/wp-content/uploads/2022/08/TN-Board-Class-11-Computer-Applications-Textbook.pdf). Printed p.102 contains a labelled **“The Father of Spreadsheet”** sidebar for **Dan Bricklin** and credits **Bob Frankston** as joint VisiCalc creator. Its Chapter 1 p.1 calls **Charles Babbage** Father of the Computer. PDF text was examined directly. PDF screenshot request failed because the file was too large (~14.7 MB), so **page-image review is not certified**.
- [Class 11 Computer Technology, original SCERT English 2019 PDF](https://www.winmeen.com/wp-content/uploads/2020/09/11th-Std-Computer-Technology-English-Medium.pdf). Chapter 9 p.135 independently has a **Dan Bricklin — Father of Spreadsheet** sidebar. Chapter 1 p.1 also names **Charles Babbage**. Searchable PDF text was verified; PDF screenshot service returned an access failure, so no original printed-page visual verification is claimed.
- [Class 12 Computer Science, SCERT English revised 2023 reproduction](https://www.scribd.com/document/736861822/12th-Computer-Science-EM-FTB-V23-1). Chapter 11 p.191 labels **Edgar Frank Codd** as **Father of Relational DataBase**, and its p.196 multiple-choice question repeats this. This was reviewed via the reproduced textbook text, not an original PDF screenshot.

### Editorial checks

- Bricklin was **co-creator**, with Frankston, of VisiCalc. The customary title is not a claim of sole invention.
- Relational databases were pioneered by **E. F. Codd**; the entity-relationship model associated with **Peter Chen** is distinct.
- The Computer Technology and Computer Applications chapters use the same two honorees; no duplicate FA002 or FA072 question is created.
- These are **five audited source passages**, not an exhaustive audit of the three books. Tamil originals and the 2026–27 prescribed edition are still outstanding.

## Class 11 Political Science — sovereignty, classical liberalism and local government (31 October 2026)

The latest reviewed source is the [Class 11 Political Science English SCERT textbook (Volumes I and II), published text reproduction](https://www.scribd.com/document/595416584/11th-Political-Science-EM-Www-tntextbooks-in). The text has printed SCERT page labels. Three **distinct title–person questions** were added as FA074–FA076. **No complete textbook page-by-page certification is claimed.**

| Volume · Unit | Printed page | Wording in English source | Answer | New MCQ |
| --- | ---: | --- | --- | --- |
| I · Unit 2, State | 22 (chapter exercise p.28) | Father of the Modern Theory of Sovereignty | Jean Bodin | FA074 |
| II · Unit 8, Political Ideologies – Part I | 136 | Father of Classical Liberalism | John Locke | FA075 |
| II · Unit 12, Local Governments | 241 (evaluation MCQ 11) | Father of Local Self-Government in India | Lord Ripon | FA076 |

**Page evidence and qualifications:**

- **Bodin:** Unit 2, printed p.22 directly identifies Jean Bodin as the father of the modern theory of sovereignty; p.28 repeats this as an examination-style MCQ. The answer is specific to the development of modern sovereignty theory, not an all-purpose 'father of the state' title.
- **Locke:** Unit 8, printed p.136 explicitly titles John Locke the **Father of Classical Liberalism**; Unit 7, p.119 already identifies him as **Father of Philosophical Liberalism** (FA021). The titles are related but worded differently in the textbook. FA075 keeps the unit-specific wording.
- **Ripon:** Unit 12, printed p.241 exercise question 11 asks for the Father of Local Self-Government in India and gives Lord 'Rippon' among its options. The common historical spelling is **Lord Ripon**, used for the quiz, with the textbook spelling noted in the explanation. The context is his **1882 local self-government resolution**, distinct from India's post-independence constitutional amendments.
- The title **Father of Postmodernism** also appears as an exercise question in Class 11 Political Science Unit 9, p.184; **no new quiz entry was made** because the four choices include multiple postmodernism-associated thinkers and the provided extracted passage does not itself establish an unambiguous answer.

**Originality and verification:** The English reproduced text and printed-page labels were inspected. Original PDF page screenshots, original Tamil-medium wording and currently prescribed 2026–27 editions remain unchecked. Record these as pending rather than certifying full Class 11 Political Science coverage.

## Class 12 Bio-Botany — three ecology 'Father of' titles (31 October 2026)

**Book:** [Higher Secondary Second Year Biology – Botany, revised 2023 / reprinted 2024, English SCERT textbook reproduction](https://www.scribd.com/document/775474627/12th-Bio-Botany-EM-Text). This is a new chapter review under the already indexed **Class 12 Bio-Botany** source, not a new book.

**Selected page inspected:** **Chapter 6, *Principles of Ecology*, printed p.109** (Unit IX: Plant Ecology). The lesson directly lists all three differently qualified titles in the same box, while separately crediting Ernst Haeckel with an influential definition of ecology.

| Question | Printed title in the SCERT English source | Answer used in quiz | Detail |
| --- | --- | --- | --- |
| FA077 | Father of Ecology | Alexander von **Humboldt** | Source spells surname **“Humbolt”**; broader title also given to **Ernst Haeckel** by some other references, so question is explicitly confined to Class 12 Bio-Botany |
| FA078 | Father of modern Ecology | **Eugene P. Odum** | Ecosystem ecology pioneer; distinguish from broad 'Father of Ecology' |
| FA079 | Father of Indian Ecology | **R. Misra** | Preserve first initial as in textbook; distinguish from global/modern ecology titles |

**Review status and caution:** The printed p.109 SCERT English text was read in the complete online 2024-reprinted textbook reproduction. Original PDF page-image inspection, Tamil-medium page comparison and the currently prescribed 2026–27 edition have **not** been independently checked. The claims are explicitly customary textbook titles and must not be presented as official exclusive awards. The rest of Chapter 6 and all 6–12 books remain subject to ongoing page-by-page audit.

## New verification: Class 12 History Volume II and Class 11 Accountancy (31 October 2026)

This continuation adds **two new English–Tamil MCQs (FA080–FA081)** from Class 12 History Volume II, and a **cross-book source reference for FA064** from Class 11 Accountancy.

### Explicitly supported new titles

| Source | Printed page | Textbook's designation | Correct person | Quiz action |
| --- | ---: | --- | --- | --- |
| 12 History Volume II, Unit 10 · Modern World: The Age of Reason | 19 | Father of Italian Renaissance Literature | **Petrarch** | FA080 new |
| 12 History Volume II, Unit 11 · The Age of Revolutions | 57; exercise p.61 | Father of the American Industrial Revolution | **Samuel Slater** | FA081 new |
| 11 Accountancy, Unit 14 · Computerised Accounting | 327 | Father of Accounting and Bookkeeping *in Europe* | **Luca Pacioli** | Cross-reference FA064 |

### Verified material

- [Tamil Nadu SCERT Class 12 History, Volume II, 2019 English textbook reproduction](https://www.scribd.com/document/474982581/12th-History-EM-V2-Combined-26-09-2019-pdf): Unit 10 p.19 explicitly identifies **Petrarch** as Father of Italian Renaissance Literature. Existing **FA005** covers Petrarch as Father of Humanism; titles differ and both are source-grounded. The same volume's Unit 11 p.57 says US President **Andrew Jackson** hailed **Samuel Slater** as Father of the American Industrial Revolution for his role in developing early water-powered textile mills in Rhode Island. The exercise on p.61 asks why Slater has that title.
- [Tamil Nadu SCERT Class 11 Accountancy, revised 2022, reprinted 2024, English textbook reproduction](https://www.scribd.com/document/952013555/Class-11-Accountancy-English-Medium-2024-Edition-www-tntextbooks-in): Unit 14, p.327 MS Word practical passage explicitly calls **Fra Luca Bartolomeo de Pacioli** the Father of Accounting and Bookkeeping **in Europe**, and the p.327–328 formatting exercise repeats the wording. Earlier FA064 already covers Luca Pacioli using the Class 12 Textiles & Dress Designing source, so this is an additional cited source, not a duplicate question.

### Quality controls and limits

- Keep the title **Italian Renaissance Literature** precise rather than replacing the Humanism question or pretending every title is universally exclusive.
- The *American* qualifier is essential for Samuel Slater: do not conflate the American and British Industrial Revolutions.
- Class 11 Accountancy is newly indexed only for the cited **Unit 14, printed p.327**, not the complete 14-unit book; the source was selected for an exact explicit Father reference.
- The sources are searchable English SCERT textbook reproductions, not independently checked original printed page images. Original Tamil-medium wording, revised/current 2026–27 editions and complete Classes 6–12 chapter-by-chapter coverage remain unverified.

## Lower-class audit: Classes 7, 9, 10 Social Science (31 October 2026)

This batch deliberately prioritises the underrepresented lower school books. It adds **two new factual bilingual MCQs** (FA082–FA083) and **three cross-book references** (FA003, FA019, FA076), while indexing **two new source books**. Each page below was read in the identified SCERT English textbook reproduction, rather than reconstructed from coaching notes.

| Class / unit | Printed page | Source wording | Answer | Action |
| --- | ---: | --- | --- | --- |
| 10 Social Science, History Unit 4 · The World After World War II | **41** | Father of Modern China | **Sun Yat-sen** | New FA082 |
| 10 Social Science, History Unit 10 · Social Transformation in Tamil Nadu | **117** (exercise 123) | Father of Tamil Linguistic Purism | **Maraimalai Adigal** | New FA083 |
| 10 Social Science, Civics Unit 1 · Indian Constitution | **239** | Father of the Constitution of India | **B. R. Ambedkar** | Add reference FA003 |
| 9 Social Science, Civics Unit 5 · Local Self Government | **272** | Father of Local Government | **Lord Ripon** | Add reference FA076 |
| 7 Social Science, Term I, Economics Unit 1 · Production | **206** | Father of Economics | **Adam Smith** | Add reference FA019 |

### English textbook sources verified

- [Class 10 Social Science, revised **2025** English SCERT textbook reproduction](https://www.scribd.com/document/1054719724/Class-10-Social-Science-English-2025-Edition-www-tntextbooks-in): History Unit 4 p.41 directly calls **Dr. Sun Yat-sen** Father of Modern China. History Unit 10 p.117 directly calls **Maraimalai Adigal** father of Tamil linguistic purism and founder of **Tani Tamil Iyakkam**, and its p.123 fill-in-the-blank repeats the title. Civics Unit 1 p.239 names **Dr. B. R. Ambedkar** Father of the Constitution of India.
- [Class 9 Social Science, revised-2023 English SCERT reproduction](https://www.scribd.com/document/762726313/9th-social-Science): Civics Unit 5, p.272 describes **Lord Ripon** as Father of Local Government for the 1882 resolution. Existing FA076 already tests this person/title and is cross-referenced, not duplicated.
- [Class 7 Term I combined Science/Social Science, SCERT 2019 English reproduction](https://www.scribd.com/document/461052380/7-T1-SciSoc-EM-pdf): Social Science Economics Unit 1 p.206 explicitly identifies **Adam Smith** as Father of Economics. Existing FA019 is linked rather than duplicated.

### Editorial safeguards

- FA083 distinguishes **Maraimalai Adigal**, associated with Tamil linguistic purism and the Pure Tamil Movement, from **Parithimar Kalaignar**, who advocated classical-language recognition for Tamil.
- FA082 keeps the exact historical designation *Father of Modern China*; it is a traditional description, not an official award.
- The cited 2025 English edition is newer than several earlier sources. It still does **not** establish whether the prescribed 2026–27 book has changed.
- Original Tamil-medium page texts and the original printed page images have **not** been independently verified. The index lists only the reviewed passages, not a full textbook audit.

## Class 8 Social Science 2024 review: archives, PSU, Nile and Ripon (31 October 2026)

**Source:** [Tamil Nadu SCERT Standard Eight Social Science, revised edition 2024, English textbook text reproduction](https://www.scribd.com/document/1067654623/Class-8-Social-Science-English-Medium-2024-Edition-www-tntextbooks-in). The reproduction identifies the Government of Tamil Nadu, Tamil Nadu SCERT, first edition 2019 and revised editions 2020, 2022, 2023, 2024. Page labels used here are the **printed textbook pages**, not browser lines or a PDF viewer page count.

| Chapter | Printed page | Exact designation in textbook | Person / object | Quiz action |
| --- | ---: | --- | --- | --- |
| History Unit 1 · Advent of the Europeans | **2** | Father of National Archives of India | George William Forrest | New **FA084** |
| History Unit 7 · Urban Changes During the British Period | **70** | Father of Local Self-Government in India | Lord Ripon | Add cross-reference to **FA076** |
| Geography Unit 7 · Exploring Continents: Africa, Australia and Antarctica | **143** | Father of African Rivers | River Nile | New **FA086**, expressly a **metaphorical river title**, not a human |
| Economics Unit 2 · Public and Private Sectors | **240** | Father of Public Sector Undertakings in India | Dr. V. Krishnamurthy | New **FA085** |

### Evidence and interpretation

- On **History p.2**, the schoolbook describes **George William Forrest** as deserving the Father of National Archives of India title, within a paragraph about the National Archives (New Delhi) and Tamil Nadu Archives. This is an attributed description, **not** an official statutory rank. In the surrounding text, **H. H. Dodwell** is discussed separately in the Tamil Nadu Archives context, so do not treat those names as interchangeable.
- On **History p.70**, the schoolbook describes Ripon's 1882 resolution as a milestone and calls him Father of Local Self-Government in India. Existing **FA076** already covers the same title from Classes 11 and 9, so Class 8 becomes a **third citation rather than a repeated question**.
- On **Geography p.143**, the River Nile is expressly called Father of African Rivers. This figurative name for a **river** belongs in a Father-title themed quiz, but must never be treated as a pioneer, inventor or individual. The chapter distinguishes Nile from Congo, Niger and Zambezi.
- On **Economics p.240**, the schoolbook names **Dr V. Krishnamurthy** Father of Public Sector Undertakings in India, separately discusses **Nehru's industrial policy** and **P. C. Mahalanobis's planning model**. Distinguish this PSU title from the role of prime ministers and economic planners.

**Status:** The searchable **English 2024 SCERT text reproduction** was examined for the passages on printed pp.2,70,143,240. This is a meaningful selected-page check, **not** independent inspection of original printed PDF page images, 2026–27 prescribed editions, or the Tamil originals, and **not** a claim that all Class 8 units or all Class 6–12 books were completely audited. Three new bilingual questions, four source mappings and one indexed book were added.

## Audit process and quality rules

1. Review each book and term separately: Science and Social Science (Classes 6–10) followed by History, Geography, Economics, Political Science and other relevant books (Classes 11–12).
2. Identify explicit “Father of…”, “pioneer”, and customary honorific references, then record the exact scope of the title.
3. Check original English and Tamil pages, record edition, printed page number (or separate PDF page index), and explain discrepancies between editions.
4. Merge identical facts across multiple books, retain all source references, and avoid repeat stems in the combined quiz.
5. Exclude unsupported or disputed unqualified labels. The “Father of the Nation” question is specifically about Bose's historical address to Gandhi, not an officially conferred constitutional designation.
6. Recheck four distinct answer options, English/Tamil translation, unambiguous correct index and source link before publication.

## Outstanding work

- Class 6–9: review **all remaining subject/term volumes** beyond the selected units above.
- Class 10: selected original English page evidence from Science Units 18 and 20 is now included; the remaining Science original pages and Social Science/other books are not exhaustively checked.
- Class 11–12: audit all remaining relevant books and chapters, including Science, Economics, Geography and Political Science, beyond selected 11th Business Mathematics, Bio-Botany, Bio-Zoology, Economics and Political Science passages, and 12th Bio-Botany, Commerce, Economics and History pages already cited.
- Verify direct original-book PDF source links and corresponding Tamil-medium printed pages where a chapter bank currently supplies the English title or page.
- Complete the original English/Tamil book-by-book coverage and duplicate checks before claiming exhaustive TNPSC/TNUSRB source coverage.

## Relationship to earlier work

This audit reuses and does not replace the [Class 6–12 original textbook audit ledger](original-class6-12-firsts-ledger.md). The `firsts.json` collection is a separate **Firsts** quiz; the `fathers.json` data remains one combined **Fathers of** quiz.
