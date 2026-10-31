# Original Tamil Nadu textbooks, Classes 6–12: firsts audit ledger

**Date:** 31 October 2026  
**Scope:** Original government-published books in *both English and Tamil editions*, as available in public catalogues. This is intentionally distinct from a scan of existing ClearExams quiz-bank JSON files.  
**Status:** IN PROGRESS — **full original-textbook certification is not complete**.

## Baseline original-book inventory

The Padanool class-by-class original-book archive (source list linked below) shows these English- and Tamil-medium volume listings at the time of this review. A book *listing* does not prove its PDF was successfully downloaded or inspected, and annual/term editions may differ.

| Standard | English listed | Tamil listed | Combined editions | Original edition audit |
| --- | ---: | ---: | ---: | --- |
| 6 | 10 | 12 | 22 | Partial legacy quiz extraction; no complete original PDF sign-off |
| 7 | 10 | 12 | 22 | Class 7 women's firsts compared with transcribed chapter; remaining books unverified |
| 8 | 6 | 7 | 13 | One 2022 original Social Science English volume partly checked; newer edition unverified |
| 9 | 6 | 7 | 13 | **2018/2019/2020 revised English Social Science text partially reviewed**; Tamil and recent edition pending |
| 10 | 6 | 7 | 13 | **One original revised-2022 English Social Science book partly reviewed; 7 new facts added** |
| 11 | 40 | 44 | 84 | History quiz bank reviewed; Economics/Political Science/Science originals not yet fully checked |
| 12 | 40 | 44 | 84 | History/Geography quiz banks reviewed; other original volumes not yet fully checked |
| **Total** | **118** | **133** | **251** | **0/251 fully certified in both editions** |

Catalogue: https://padanool.in/ ; e.g. https://padanool.in/class-11/english-medium/ and https://padanool.in/class-12/english-medium/ . The separate source list https://shishya.in/exams/TN_TNPSC_GROUP4/school-books links to large Department of School Education SCERT PDFs on d21mc000xink7q.cloudfront.net.

These catalogue totals are *not* the number of unique subject titles and exclude some additional regional-language media and edition variants. The live inventory crawler `scripts/inventory_tn_original_books.py` records the specific volume detail pages, or fetch errors, by standard and medium.

## Original source verification performed in this update

Government of Tamil Nadu, **Standard Ten — Social Science**, first edition 2019, revised 2020 and 2022 (SCERT / Tamil Nadu Textbook and Educational Services Corporation), English PDF:
https://www.srivenkateshwaraopenschool.com/wp-content/uploads/2023/11/10th_Social-Science-EM-www.tntextbooks.in_compressed.pdf

Printed page evidence from the *actual book*, rather than prewritten MCQs:

| Printed page | Unit | Original-book firsts evidence | Published quiz use |
| --- | --- | --- | --- |
| 106 | History 9: Freedom Struggle in Tamil Nadu | 1877 appointment of first Indian Judge of Madras High Court: T. Muthuswami; first Madras Mahajana Sabha president: P. Rangaiah | Both added |
| 111 | History 9 | First woman penalised for Salt Law violation: Rukmani Lakshmipathi; first Congress ministry in Madras Presidency after 1937 election: Rajaji | Both added |
| 116 | History 10: Social Transformation in Tamil Nadu | Parithimar Kalaignar advocated classical-language recognition of Tamil at an early stage | Added with *early advocate* qualification |
| 118 | History 10 | Madras legislature approved women's participation in electoral politics in 1921 | Added, explicitly scoped to textbook |
| 195 | Geography 5: Population, Transport, Communication and Trade | First Indian postage stamp described as issued at Karachi in 1852 | Added, scoped to book |

**12 bilingual MCQs added** across original Class 8 and Class 10 Social Science books (109 → **121**). Class 8 newly checked selections: Dutch first factory at Masulipatnam (printed p.6), English first Bay of Bengal factory at Masulipatnam (p.6), University of Madras as first British-period Tamil Nadu university and National Education Policy 1968 (both p.55), and Pandita Ramabai's Sharada Sadan (p.80). The English *original PDF text* was checked for their facts; accompanying Tamil translations have **not** all been verified against the relevant printed Tamil-language original. Their per-record `review_status` says so. One-off checking of a fact on a page does **not** mean the whole page or chapter was exhaustively audited.

### Additional accuracy concern from Class 8 original text

Class 8 History Unit 8 (2022 revised edition, printed p.79) labels Dr. Muthulakshmi Ammaiyar broadly as the first woman doctor in India. That **unqualified claim has not been imported**: women medical pioneers and qualifications differ, and competing candidate definitions require independent checking. The Class 8 additions instead use narrower facts whose subjects, places and years are supported in the chapter.

### Discrepancy requiring editorial resolution

`F019`, Swadesamitran chronology:
- Class 10 original SCERT Social Science 2022 revised book, History Unit 9 p. 106: newspaper began **1891**, became daily **1899**.
- Existing Class 12 History bank: began **1882**, became daily **1889**.

The existing quiz answer is a *type of publication*, not a year. Its explanation has been amended to flag this unresolved source conflict without endorsing either timeline. Original newer history editions and reliable primary reference works should be checked before publishing any date-based question. No claim of resolving this conflict has been made.

## 31 October 2026: Class 9 original Social Science English-text review

**Source:** Government of Tamil Nadu, SCERT, *Standard Nine: Social Science*, first edition 2018; revised 2019 and 2020. The actual SCERT publication is hosted as a third-party PDF mirror at:
https://cdn1.byjus.com/wp-content/uploads/2022/08/TN-Board-Class-9-Social-Science-Textbook-English.pdf

The English PDF's publication information and contents were checked. From the PDF's searchable original-book text, selected History facts were checked against these **printed pages**:

| Unit | Pages examined for selected facts | Firsts / milestone fact checked | New question IDs |
| --- | --- | --- | --- |
| History 1, Human Evolution | 2 | Herodotus as Father of History; early Ennigaldi-Nanna museum | F122–F123 |
| History 2, Ancient Civilisations | 23 | Qin Shi Huang as first emperor of unified China | F124 |
| History 8, Beginning of the Modern Age | 103 | Petrarch as Father of Humanism | F125 |
| History 9, Age of Revolutions | 117 | George Washington; First Continental Congress city and date | F126–F128 |
| History 10, Industrial Revolution | 133 | Stockton–Darlington 1825; Robert Fulton and the 1807 Clermont | F129–F130 |
| History 10, Industrial Revolution | 137 | Trevithick's Puffing Devil; John Kay's flying shuttle; Hargreaves's Spinning Jenny | F131–F133 |

**12 additional English/Tamil MCQs were added, increasing 121 → 133.** English question facts were checked against the original English book's searchable text and labelled page location. Tamil questions/options are editorial translations; the Tamil original book was **not** inspected in this batch. The 2026–27 prescribed-edition mapping is **not confirmed**.

**Explicit limitation:** Requests to capture actual PDF page screenshots failed because the online PDF exceeds the browser screenshot size limit. No visual layout, fact-box graphic or scanned marginal text was independently verified. This is *selected fact review*, not complete reading/certification of the six pages, five units, entire English volume or Tamil edition. The evidence records in `data/textbook/original-page-review-evidence-class9-2020.json` retain these limits for each source-mapped MCQ.

**Additional Tamil comparison (one fact only):** The 2018 Tamil-medium Class 9 Social Science **Term II**, History Unit 4.2(b), also identifies Petrarch as the Father of Humanism. This independently corroborates the answer to **F125**, which now links the 2018 Tamil original. Since the Tamil source is an earlier **term-based edition** and the English source is a revised-2020 **full-year edition**, it does not establish same-edition pagination or full Tamil translation/page certification. Original Tamil source: https://cdn1.byjus.com/wp-content/uploads/2020/06/TN-Board-class-9-Social-Science-Term-2-Book-tamil-medium.pdf

**Audit counts remain:** 251 catalogue-listed editions; **0/251 fully English-and-Tamil certified**. Do not add 1 to the completed-books numerator for this partial review.

## Reproducible full-original review tooling now available

1. `data/textbook/original-pdf-source-manifest.json` — seed list of known original-book URLs with edition and review statuses; **not** an exhaustive source manifest.
2. `scripts/inventory_tn_original_books.py` — inventories class 6–12 English/Tamil titles from the online archive, retaining missing/failing pages and never interpreting listings as fact checks.
3. `scripts/scan_original_tn_firsts.py` — downloads a selected original SCERT PDF, records its SHA-256 hash and page count, extracts page text, notes unreadable pages, and writes bounded *candidate* excerpts with PDF page index.
4. `.github/workflows/original-tn-books.yml` — CI job uploads inventory and original-PDF page-evidence JSON, with manual source selection for repeated batches.
5. `tests/test_original_tn_firsts.py` — guards source provenance, original fact qualifiers, bilingual answer integrity and unresolved conflict status.

A mechanical scan of a PDF, even one covering every page, **does not** establish that every graphic, caption, footnote, exercise or differing Tamil edition has been inspected. Scanned pages with missing extractable text are separately counted. Source-page checks and editorial validation are required before marking complete.

## Outstanding original-book completeness criteria

- [ ] Ensure the catalogue includes all relevant **2026–27 editions** (2022 revision and 2024 archives are not necessarily the same as current books) with unique stable volume, class, subject, term and medium IDs.
- [ ] Read all relevant English and Tamil original PDFs across the **251 listed editions**, including diagrams, fact boxes, and page images for unextractable text.
- [ ] Process the remainder of Classes 8–10 Social Science; the earlier quiz-bank audit had **no Social Science bank** for those classes.
- [ ] Process Class 11–12 Economics, Political Science and relevant Science/literature/vocational books not present in the earlier unit bank.
- [ ] Editorially review and de-duplicate all extracted firsts facts across editions, specifying person, office, time and locality to prevent ambiguous “first” claims.
- [ ] Confirm source PDF edition, printed page, accurate English and Tamil answer/options/explanations for *every* published new MCQ.
- [ ] Resolve Swadesamitran and any other conflicts against authoritative original sources before claiming certified facts.
- [ ] Re-run site navigation, bilingual tests, source integrity tests and actual mobile-player test, then publish a signed-off per-volume list.

**Current honest status:** initial catalogue list established; selected pages from older original Class 8, 9 and 10 English Social Science editions have been *partially* reviewed; remaining pages, Tamil counterparts and newer original volumes require review. The Firsts Quiz contains **133 curated bilingual questions**; this does **not** establish complete Class 6–12 original-textbook coverage.
