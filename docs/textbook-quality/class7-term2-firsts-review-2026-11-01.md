# Class 7 Term II — original English/Tamil Science & Social Science Firsts review

**Audit date:** 1 November 2026  
**Audit status:** **Selected fact verified (six MCQs); complete English/Tamil books NOT certified.**  
**Textbook editions examined:** Tamil Nadu SCERT Class 7 Term II subject PDFs with **first edition 2019 / 2023 revision / 2024 reprint**. Mirror hosts SCERT-authored material; **the official prescribed 2026–27 edition has not been independently established**.

## Original PDF file evidence

| Original book | English PDF pages | Tamil PDF pages | Text-extractable pages |
| --- | ---: | ---: | ---: |
| [Science — English](https://cleartnpsc.com/books/download/class-7-term-2-science-english.pdf) / [Science — Tamil](https://cleartnpsc.com/books/download/class-7-term-2-science-tamil.pdf) | 97 | 114 | 211/211 |
| [Social Science — English](https://cleartnpsc.com/books/download/class-7-term-2-social-science-english.pdf) / [Social Science — Tamil](https://cleartnpsc.com/books/download/class-7-term-2-social-science-tamil.pdf) | 89 | 104 | 193/193 |
| **Total** | **186** | **218** | **404/404** |

SHA-256 fingerprints of the actual downloaded PDF bytes:

- Science English: `5b4a892b609d5109dbfdb320189512f80f93a4c1863d981e8a570367f4795dbd`
- Science Tamil: `742531ad5497440add543a0cdbf6463107e2e27268713e6c988aab12b1f5658d`
- Social Science English: `cd103819cf5c40d0e68eb92e1ae207d709aea295b47891a86bad3f046cf6e58f`
- Social Science Tamil: `30d7b1bbabbfba9c2bbe45de6648e2ba64312bd67616c79e9851560dd740feea`

Independent GitHub runner evidence: [whole-source text scan run #41300186396](https://github.com/Inkarshaw/inkarshaw.github.io/actions/runs/41300186396) and [selected bilingual original-page review run #41300895614](https://github.com/Inkarshaw/inkarshaw.github.io/actions/runs/41300895614). Review-image artifacts are kept internal and not redistributed in the public quiz. Some Tamil extracted text is corrupted by PDF font encoding; selected page images and contextual comparisons were used where possible.

A lexical scan logged **33 English Science + 28 Tamil Science + 38 English Social Science + 16 Tamil Social Science = 115 candidate lines**. These are **not** 115 novel Firsts facts and include routine or repeated occurrences.

## Existing questions cross-checked and corrected

| ID | Source fact | PDF page EN | PDF page TA | Action |
| --- | --- | ---: | ---: | --- |
| **F050** | Calcutta Electric Supply Corporation Limited commissioned India's first thermal power plant **17 April 1899** | Science 17 | Science 19 | Replaced old Drive references with the directly downloaded original PDFs; clarified question and bilingual explanation; corroborated with [CESC's historical account](https://www.cesc.co.in/history) |
| **F055** | Ala-ud-din Hasan, called Hasan Gangu, founded the Bahmani kingdom as Bahman Shah in **1347** | Social Science 9 | Social Science 11 | Replaced old Drive references with original PDFs; corrected/expanded English and Tamil explanations |

## Four newly added questions from selected bilingual textbook facts

| New ID | Exact fact and qualification | PDF page EN | PDF page TA |
| --- | --- | ---: | ---: |
| **F162** | Alessandro Volta developed the **voltaic pile**, first practical electric battery, around **1800** — [Royal Institution corroboration](https://www.rigb.org/explore-science/explore/collection/alessandro-voltas-voltaic-pile) | Science 24 | Science 27 |
| **F163** | Brothers **Harihara and Bukka** established **Vijayanagara** in **1336** — [Vijayanagara district administration corroboration](https://vijayanagara.nic.in/en/about-district/) | Social Science 5 | Social Science 5 |
| **F164** | **Babur** founded the Mughal Empire in India after the First Battle of Panipat, **1526** | Social Science 17 | Social Science 20–21 (source link points to opening page 20) |
| **F165** | **Akbar** introduced the **Mansabdari** system of official/military ranks | Social Science 25 | Social Science 30 |

All six question records have individual **one-based physical PDF page indexes for both languages**. These may differ from **printed textbook page numbers**, particularly Tamil books. Class 7 Term II quiz categories are preserved: science F050 and F162; history F055 and F163–F165.

## Deliberately not imported from candidate matches

- Source-book statements on **Edison's “first electric bulb”** can confuse early incandescent prototypes, commercial viability and the historical inventor priority. Do not add a bare “invented the first bulb” question.
- **Johannes Gutenberg / printing press in 1453** as given in Social Science is an oversimplified dated claim; no new exact-year question added without a scholarly timeline comparison.
- **Fort St George as India's “first English fortress”** requires careful geographic and institutional definition, so no unqualified absolute-first question was added.
- **Religious tourism as oldest form of tourism** is a source generalisation, not a securely dated unique Firsts fact.
- **Vijayanagara / Bahmani / Mughal** founding questions are qualified to the named kingdom and period; none claims an unqualified first empire worldwide.

## Remaining work before full book certification

- [ ] Visually inspect all **404** PDF pages, figures, page labels, text and marginal notes; scan coverage alone does not count.
- [ ] Screen facts that **do not contain keyword “first”** and reconcile each chapter, exercise, table and photo caption.
- [ ] Compare exact English/Tamil printed-page numbering for every Firsts record and proofread Tamil transliterations and answer explanations.
- [ ] Confirm which revision is **officially prescribed for academic year 2026–27** in each language.
- [ ] Resolve any contested historical superlatives against the original passage plus independent reliable evidence.

**Release proposal:** move Firsts bank from **161 bilingual questions (v16)** to **165 (v17)**: Women 27 / History **107** / Science **31**. **No Class 7 Term II book is certified complete** and no Classes 6–12 overall full-coverage claim is authorized.

## Live deployment confirmation — 1 November 2026

After merging source-audit PR [#210](https://github.com/Inkarshaw/inkarshaw.github.io/pull/210), an independent GitHub-hosted public-HTTP deployment test successfully loaded `https://clearexams.ink/textbook-firsts.html`, `/data/special-quizzes/firsts.json` and the homepage (all HTTP **200**). The **actual public 165-question JSON version 17 exactly matched the merged repository file**. All **40/40** live release checks passed, including new F162–F165, corrected existing F050/F055 source links and original Tamil PDF page indexes.

Evidence: [Live Firsts version 17 verification run #41301899919](https://github.com/Inkarshaw/inkarshaw.github.io/actions/runs/41301899919).

**This validates deployment and selected original-page facts; it does not certify all four textbook editions or complete Classes 6–12 coverage.**
