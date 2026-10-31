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

**Reproducible source-PDF scan result (GitHub Actions, 31 October 2026):** The source downloader and PyMuPDF text scanner successfully processed the **entire original 328-page English PDF**, with **322 text-extractable pages** and **6 pages requiring visual or OCR review**. It produced **302 broad "firsts"/discovery/invention candidate matches**, with zero source download errors. This means **all 328 page objects were machine-inspected for extractable text**; it does *not* mean 328 pages or 302 matches were manually fact-reviewed. The candidate-match count includes process steps and duplicates. See [successful source scan CI run](https://github.com/Inkarshaw/inkarshaw.github.io/actions/runs/41164365171) and the JSON evidence ledger.

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

**Current honest status:** initial catalogue list established; selected pages from older original Class 8, 9 and 10 English Social Science editions have been *partially* reviewed; remaining pages, Tamil counterparts and newer original volumes require review. The Firsts Quiz contains **148 curated bilingual questions**; this does **not** establish complete Class 6–12 original-textbook coverage.


## 31 October continuation: measurable certification gaps

The audit now runs `scripts/report_original_tn_coverage.py` in CI and uploads `original-books-coverage.json`. It compares the 251 *archive listings* with the 14 current seed PDF records, by class and language. These are different units of measurement: a seed record can contain two URLs, and archive listings can include distinct terms, editions and media. Therefore **251 − 14 is not a valid count of missing PDFs**.

The report explicitly records that the original-source seed registry is **not exhaustive**, that listed titles are **not certified**, and that there are **zero demonstrated fully signed-off book pairs**. Downloading and extracting text never changes certification automatically. A future per-volume sign-off must include complete chapter/page coverage, printed edition identity, text/visual review and both language versions.

**Next source-work priority:** establish a one-to-one stable edition manifest from all 14 class/medium catalogue pages; download each accessible official PDF; log URL, content hash, page count and unreadable pages; review all pages and both editions; reconcile conflicting firsts; only then certify the title and publish further questions. The present change adds an audit safeguard, not new original-page claims.


## 31 October: selected original Class 11 Political Science review

The **2018 first edition, revised 2019/2020/2022** English SCERT *Higher Secondary First Year Political Science* original PDF was identified using its inner title/printing page: https://www.srivenkateshwaraopenschool.com/wp-content/uploads/2023/11/11th_Political_Science_EM-www.tntextbooks.in_.pdf .

**Five bilingual MCQs (F134–F138) were added** (133 → **138**), with uniquely keyed original page evidence in `data/textbook/original-page-review-evidence-class11-political-science-2022.json`:

| Unit | Printed page (textual attribution) | Fact selected | Quiz |
| --- | ---: | --- | --- |
| 8: Political Ideologies – Part I | 139 | Margaret Thatcher: first woman UK Prime Minister | F134 |
| 13: Social Justice | 251 | Kaka Kalelkar chaired the First Backward Classes Commission (1953) | F135 |
| 14: Political Developments in Tamil Nadu | approximately 267 | A. Subbarayalu Reddiar headed first Justice Party ministry after 1920 dyarchy election | F136 |
| 14: Political Developments in Tamil Nadu | approximately 269 | First provincial Self-Respect Conference held at Chengalpattu in 1929 | F137 |
| 15: Tamil Nadu Political Thought | 288 | Subramania Bharati's *India* weekly pioneered political cartoons in Tamil Nadu | F138 |

These are **selected source-text confirmations, not a full book review**. Both page locations in Unit 14 should be cross-checked visually before final edition certification; the PDF screenshot provider could not render this large mirror. An independently matching Tamil original has **not** been checked. Current prescribed 2026 editions are not established by the 2022 imprint. An independent history work corroborates the 1929 Chengalpattu conference (Tamil Nadu History Congress: https://www.tnhc.org.in/docs/proceedings/Chidambaram-2012.pdf), and other sources are linked per evidence record.

The original source seed manifest now has **15 entries**, compared with **251 historical English/Tamil archive listings**. This is **not** evidence that only 15 textbooks exist or that 236 identifiable PDFs are missing; the manifest is an incomplete, mixed-granularity seed registry.

**Status remains: zero volumes fully signed off for 2026–27 English and Tamil editions.** Original-book audit must continue across all other chapters, images, source revisions, and missing course subjects.


## 31 October: original Class 12 Political Science English edition

The SCERT *Higher Secondary Second Year Political Science* (first edition 2019; revised 2020, **2022**) was inspected using its original English PDF text:
https://www.srivenkateshwaraopenschool.com/wp-content/uploads/2023/11/12th_Political-Science_EM-www.tntextbooks.in_.pdf .

**Five independently cross-checked bilingual Firsts questions (F139–F143), 138 → 143**, were added from the following selected printed pages:

| Unit | Printed page | Question claim | Independent cross-check |
| --- | ---: | --- | --- |
| 6: Administrative Machinery in India | 118 | Sir Ross Barker first chaired the Public Service Commission set up in 1926 | PIB, [UPSC centenary background](https://www.pib.gov.in/PressReleasePage.aspx?PRID=2316840&lang=2&reg=48) |
| 6: Administrative Machinery in India | 118 | First Public Service Commission set up on 1 October 1926 | PIB, [UPSC centenary year](https://www.pib.gov.in/PressReleasePage.aspx?PRID=2155432&lang=2&reg=3) |
| 1: Constitution of India | 11 | M. R. Masani was first opposition-side Public Accounts Committee Chairman in 1967 | [Contemporary parliamentary record, April 1967](https://eparlib.sansad.in/bitstream/123456789/764119/1/jpi_April_1967.pdf) (textbook supplies the precedent and year, Parliament supplies the person's name) |
| 1: Constitution of India | 11 | First post-Constitution elected Madras Legislative Assembly met on 3 May 1952 | [Madras Assembly historical review](https://citeseerx.ist.psu.edu/document?doi=b34a68778befbdf7f71fee55eb3bca43faa3579d&repid=rep1&type=pdf) |
| 7: Challenges of Nation Building | 139 | S. K. Dhar chaired the 1948 Linguistic Provinces Commission | [1955 States Reorganisation Commission report](https://www.mha.gov.in/sites/default/files/State%20Reorganisation%20Commisison%20Report%20of%201955_270614.pdf) |

**Discrepancy excluded from the published quiz:** the printed p.139 discussion blurs the distinction between *Andhra State* (established 1953) and *Andhra Pradesh* (formed 1956). An unqualified "first linguistic state" claim has **not** been imported; verify against government records and any updated edition before publishing.

The evidence file `data/textbook/original-page-review-evidence-class12-political-science-2022.json` has selected page-by-page support, independent source links and explicit open limitations. The screenshot renderer returned an error for this large PDF. **This is not full-page visual review or confirmation of the matching Tamil original**. Current prescribed 2026 book editions may differ. The manifest now contains **16 source records**; the historical 251 listings remain a separate incomplete baseline. The audit does **not** certify any full volume or every original subject.


## 31 October: live catalogue reconciliation (historical 251 vs current 215)

The 31 October GitHub Actions inventory retrieved **all 14 class/medium catalogue pages** from the external Padanool archive, with **0 fetch errors**. The inventory script counted **215 distinct *book detail links***; the previous 251 is an earlier *listing snapshot* from a less restrictive inventory and is not comparable without resolving the link taxonomy.

| Class | Historical English / Tamil listings | Current detail-link count English / Tamil | Total current |
| --- | --- | --- | ---: |
| 6 | 10 / 12 | 4 / 5 | 9 |
| 7 | 10 / 12 | 4 / 5 | 9 |
| 8 | 6 / 7 | 5 / 6 | 11 |
| 9 | 6 / 7 | 5 / 6 | 11 |
| 10 | 6 / 7 | 5 / 6 | 11 |
| 11 | 40 / 44 | 39 / 43 | 82 |
| 12 | 40 / 44 | 39 / 43 | 82 |
| **Total** | **118 / 133 = 251** | **101 / 114 = 215** | **215** |

**Interpretation:** 215 is not the final number of original government textbooks, physical volumes, separate terms, current editions or units. The crawler filters archive sub-page links and may omit titles represented through another page structure; 251 may have included repeated formats. Neither figure establishes coverage of all 2026–27 prescribed SCERT books. The script `scripts/report_original_tn_coverage.py` now ingests `tn-original-book-inventory.json` as a **separate live count**, reports differences by class and medium, and refuses to treat 16 seed source records as a percentage of 215 or 251. A source title-to-edition canonical inventory is still required.

GitHub CI inventory run before this reconciliation: https://github.com/Inkarshaw/inkarshaw.github.io/actions/runs/41169349147 (14 archive pages, 215 detail listings). The new version includes safeguards and unit tests to ensure a future different live count is not silently treated as the historical baseline.


### Class 12 full-PDF machine scan failure and remediation

GitHub Actions attempt https://github.com/Inkarshaw/inkarshaw.github.io/actions/runs/41169349147 to download and mechanically scan the **2022-revised Class 12 Political Science English PDF** failed with `<urlopen error timed out>`. **No 2022 Class 12 page count, full-PDF text-hits count, unreadable-page count, or SHA-256 hash was obtained.** Earlier CI had `continue-on-error: true`, so its top-level extraction job appeared green despite the error. This has been changed to fail on real extraction errors, with the automated PR smoke extraction temporarily restored to the previously accessible Class 9 original source; the Class 12 URL must be repaired or an equivalent edition mirror found before rerunning it.

The five Class 12 facts above were reviewed from *selected PDF passages exposed by the source reader* and independently corroborated. That is a strictly narrower achievement than a full original-textbook scan or full printed-page certification.


## 31 October: selected original Class 12 Economics and a second all-subject catalogue

### Class 12 Economics original English book

The 2019 **Government of Tamil Nadu, SCERT, Higher Secondary Second Year Economics** first edition was inspected through its original textbook PDF text and printed page labels:
https://www.nesto.in/wp-content/uploads/2024/08/12th-economics.pdf . Selected passages were compared with a transcription of the **2023 revised / 2024 reprinted** book at https://studylib.net/doc/27783099/class-12-tn-economics . This comparison **does not** prove all editions are identical. The screenshot tool rejected the large original file, so no page-image sign-off was made. The 2026 edition and matching original Tamil pages remain unverified.

**Five new bilingual MCQs (F144–F148) bring the source-curated Firsts bank from 143 to 148:**

| Printed page (2019 English) | Chapter | Scope-qualified Firsts fact | Institutional cross-check |
| --- | --- | --- | --- |
| 1 | 1: Introduction to Macro Economics | Ragnar Frisch was Norwegian co-winner of the first Economic Sciences Prize (with Jan Tinbergen, 1969) | [NobelPrize.org](https://www.nobelprize.org/prizes/lists/all-nobel-prizes/all/?gallery_style=page) |
| 95 | 6: Banking | Sveriges Riksbank, founded 1668, is the world's oldest central bank | [Riksbank history](https://www.riksbank.se/en-gb/about-the-riksbank/history/historical-timeline/1600-1699/sveriges-riksbank-is-founded/) |
| 102 | 6: Banking | Sir Osborne Smith was first RBI Governor when RBI began work in 1935 | [RBI chronology](https://systemhealth.rbi.org.in/Scripts/chro_1935.aspx.html) |
| 102 | 6: Banking | Sher Shah Suri's silver Rupiya was a precursor of the modern Indian rupee | [RBI coin museum](https://systemhealth.rbi.org.in/Scripts/mc_mughal.aspx.html) |
| 162 | 8: International Economic Organisations | Singapore hosted the first WTO Ministerial Conference in 1996 | [WTO 1996 records](https://www.wto.org/english/thewto_e/minist_e/min96_e/min96_e.htm) |

File: `data/textbook/original-page-review-evidence-class12-economics-2019.json`. The excluded-claims ledger explicitly rejects two overgeneralised or incorrect historical source statements: that Simon Kuznets *first conceived national income* (ideas/estimates predate him), and that the Bank of England was the "first bank of issues" in **1864** (unsupported chronology). It also corrects the book's Sweden predecessor date **1656** versus actual central-bank foundation **1668**. We have not certified all book pages, graphics, exercises or Tamil versions.

### Reconciling an additional original-book catalogue

The second public 2024–25 textbook locator, https://tnkalvi.online/textbooks/class/12 , exposes a **different indexing system** from Padanool. Headers checked on its seven class pages (accessed 31 October 2026) list:

| Class | Catalogue selections | Catalogue's reported unique PDFs |
| --- | ---: | ---: |
| 6 | 30 | 24 |
| 7 | 30 | 24 |
| 8 | 12 | 10 |
| 9 | 10 | 8 |
| 10 | 12 | 10 |
| 11 | 81 | 78 |
| 12 | 82 | 78 |
| **Total** | **257** | **232** |

Here **257** is the sum of English/Tamil subject-and-term *selections*, and **232** is the sum of per-class counts of distinct PDF links as reported by that separate site. Neither is automatically the number of unique currently prescribed government publications or 2026–27 editions. **The older Padanool counts of 215 detail links and 251 historical listings measure different entities.** There is no valid subtraction or completion percentage across these three counts. Some Tamil/English *language* books have the same PDF in both medium selectors, and some 11–12 vocational subjects have separate textbook volumes. The source index must be reconciled to exact edition, subject, volume and language ID before whole-book certification.

A new scanner `scripts/inventory_tnkalvi_original_books.py` will output exact per-subject/term/medium detail links with explicit `catalogue_detail_link_only` status, and `.github/workflows/original-tn-books.yml` uploads its JSON evidence after validation. The catalogue is independent and **not an official government certification of edition currency**. Source PDF downloading, complete visual and Tamil page review, and editorial proof of every candidate are still outstanding.

**Current original-book sign-off: zero fully certified complete English/Tamil volume pairs.**
