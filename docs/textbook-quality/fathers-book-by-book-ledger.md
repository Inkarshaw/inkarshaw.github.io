# “Fathers of…” quiz — book-by-book source ledger

**Date:** 31 October 2026  
**Output:** One combined bilingual quiz: `textbook-fathers.html` using `data/special-quizzes/fathers.json`.  
**Scope:** 19 unique MCQs drawn from 11 separately indexed Tamil Nadu school-book sources; source-specific duplicates are merged and cited under the same question.

## Checked in existing school-book question banks and selected original textbook pages

| Class | Source book / term | Distinct mapped questions | Question IDs | Review status |
| --- | --- | ---: | --- | --- |
| 6 | Science · Term I | 1 | FA002 | Curated from existing quiz bank; full original English/Tamil scan pending |
| 6 | Social Science · Term II | 1 | FA003 | Curated from existing quiz bank; full original English/Tamil scan pending |
| 7 | Science · Term II | 1 | FA004 | Curated from existing quiz bank; full original English/Tamil scan pending |
| 8 | Science · Term I | 1 | FA002 | Curated from existing quiz bank; full original English/Tamil scan pending |
| 9 | Science · Full Year | 1 | FA006 | Curated from existing quiz bank; full original English/Tamil scan pending |
| 9 | Social Science · Full Year | 2 | FA001, FA005 | Curated from existing quiz bank; full original English/Tamil scan pending |
| 10 | Science · Full Year, Units 18 & 20 | 3 | FA016, FA017, FA018 | English original PDF text and visible page screenshots checked (pp. 261, 287); Tamil and current-edition comparison pending |
| 11 | History · Full Year | 3 | FA007, FA008, FA009 | Curated from existing quiz bank; full original English/Tamil scan pending |
| 11 | Economics · Full Year, Unit 1 | 1 | FA019 | 2020 English original PDF text checked (p.22), PDF too large for screenshot; Tamil original pending |
| 11 | Political Science · Volume I, Units 1 & 7 | 2 | FA020, FA021 | 2020 English original PDF text checked (pp.109,119), PDF too large for screenshot; Tamil original pending |
| 12 | History · Full Year | 5 | FA005, FA010, FA011, FA013, FA014 | Curated from existing quiz bank; full original English/Tamil scan pending |

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
- Class 11–12: audit all remaining relevant books and chapters, including Science, Economics, Geography and Political Science, beyond the selected 11th Economics and Political Science pages and History units already cited.
- Verify direct original-book PDF source links and corresponding Tamil-medium printed pages where a chapter bank currently supplies the English title or page.
- Complete the original English/Tamil book-by-book coverage and duplicate checks before claiming exhaustive TNPSC/TNUSRB source coverage.

## Relationship to earlier work

This audit reuses and does not replace the [Class 6–12 original textbook audit ledger](original-class6-12-firsts-ledger.md). The `firsts.json` collection is a separate **Firsts** quiz; the `fathers.json` data remains one combined **Fathers of** quiz.
