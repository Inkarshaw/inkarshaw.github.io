# Class 9 — original SCERT full-year English/Tamil Firsts audit

**Audit date:** 1 November 2026  
**Scope:** Four complete original government-authored Class 9 full-year PDFs, Science and Social Science in both English and Tamil, retrieved from the ClearTNPSC source mirror. Original 2026–27 prescribed edition parity remains unconfirmed.  
**Outcome:** 4 selected bilingual Firsts facts newly approved; one prior Science fact F058 re-linked and bilingual source-checked; twelve older Class 9 History facts F122–F133 re-linked to the scanned revised English original with exact page indexes (their full-year Tamil page equivalence remains open). **No whole-volume certification.**

## Full original PDF source inventory

| Book | 1-based PDF page count | Text-extractable page count | SHA-256 |
| --- | ---: | ---: | --- |
| [Science English](https://cleartnpsc.com/books/download/class-9-science-english.pdf) | 328 | 328 | `9af55b78f366097fc37a4d3bf656f96be0462369b002e7d6042c83f33a1f6a59` |
| [Science Tamil](https://cleartnpsc.com/books/download/class-9-science-tamil.pdf) | 336 | 336 | `dc719594b26dabad3187090fd32d2ee3fd18805f244e38d713e298cd40202937` |
| [Social Science English](https://cleartnpsc.com/books/download/class-9-social-science-english.pdf) | 328 | 328 | `e3517e9532d5c26a8a5491ad89e2d32c39e515f6a8e7d7b09e04793a50092ad5` |
| [Social Science Tamil](https://cleartnpsc.com/books/download/class-9-social-science-tamil.pdf) | 344 | 344 | `15c7e1f60424a2cc3a77de8c5af9a94c4f812a0b560575c6d399fbd37c1946c2` |
| **Total** | **1,336** | **1,336** | |

Full download, SHA-256 and all text page evidence: [Class 9 original four-book scan #41315673666](https://github.com/Inkarshaw/inkarshaw.github.io/actions/runs/41315673666). Selected original page images and keyword passages: [source-page review #41315872079](https://github.com/Inkarshaw/inkarshaw.github.io/actions/runs/41315872079) and [focused images #41316311039](https://github.com/Inkarshaw/inkarshaw.github.io/actions/runs/41316311039). Original pages are saved as **internal Actions artifacts**, not republished in the public quiz or repository.

**1,336/1,336 with extractable embedded text is not 1,336/1,336 individually verified pages.** Tamil text can be partly corrupted when extracted, and many source graphics, captions, exercises, tables and footnotes remain visually unaudited. Original Tamil title pages contain 2025 revision markers; the 2026–27 officially prescribed edition is not independently established.

## New verified bilingual Firsts (release candidate F175–F178)

English and Tamil page numbers below are **physical PDF indexes**, starting from 1, and not the printed textbook page.

| MCQ | Claim and historical caveat | English PDF page | Tamil PDF page | Independent corroboration |
| --- | --- | ---: | ---: | --- |
| **F175** | **Robert Bruce Foote**, discovery of Palaeolithic hand axe at **Pallavaram in 1863** | Social **15** | Social **14** | [Government Museum Chennai, first palaeoliths](https://govtmuseumchennai.org/uploads/topics/16527888885312.pdf); original image inspected |
| **F176** | **Minamoto no Yoritomo**, military headquarters at Kamakura and leadership in the formation of the **Kamakura shogunate**; 1180–1192 gradual formation, rather than a single undisputed founding date | Social **88** | Social **91** | [Kamakura municipal history](https://www.city.kamakura.kanagawa.jp/sekaiisan/documents/jh_booklet_e02.pdf) |
| **F177** | **Ole Rømer** used Jupiter moon **Io** eclipse timings to establish finite speed of light in **1676**; both Class 9 originals mistakenly print **1665** | Science **77** | Science **77** | [American Museum of Natural History](https://www.amnh.org/learn-teach/curriculum-collections/cosmic-horizons-book/ole-roemer-speed-of-light), [Paris Observatory](https://observatoiredeparis.psl.eu/340-years-ago-romer-showed.html) |
| **F178** | **Joseph E. Murray** and the medical team achieved first successful identical-twin kidney transplantation in **1954** | Science **245** | Science **250** | [US HRSA transplant history](https://www.hrsa.gov/optn/patients/organ-transplants/history), [Nobel Foundation](https://www.nobelprize.org/laureate/442) |

Four question records include original URLs, Tamil and English choices, explanations, exact page indexes, qualifiers, and separate independently corroborating links. The source conflicts are not silently propagated into the answers.

## Existing questions and source-link corrections

**F058 Torricelli**: The old outside-science source was replaced with original Class 9 Science English PDF **page 33** and Tamil PDF **page 34**, with the original 1643 mercury-barometer context checked visually. [Smithsonian](https://americanhistory.si.edu/collections/object/nmah_1818463) corroborates the historical attribution.

**F122–F133**: The twelve published Class 9 History Firsts originally linked a revised-2020 original English Social Science PDF, selected printed pages and an older source-evidence file. They now link to the separate SCERT **revised full-year original English** with their new one-based PDF indexes: F122 **10**, F123 **11**, F124 **32**, F125 **111**, F126 **126**, F127 **125**, F128 **125**, F129 **141**, F130 **141**, F131 **145**, F132 **139**, F133 **139**. The original 2020 source links and evidence IDs have been **retained in historical provenance fields** rather than deleted. F125's older 2018 Tamil Term II source is preserved.

**Do not claim all twelve have been verified against the newer full-year Tamil original.** Their Tamil page mapping and translation audit remain unfinished; these items continue to report English-only selected original-source review status. Their historical original English proof is documented in `data/textbook/original-page-review-evidence-class9-2020.json`.

## Critical textbook conflicts and excluded leads

1. **Sputnik launch:** Both Class 9 Science versions (English PDF **111**, Tamil PDF **112**) print **1956**, which is incorrect. The world’s first artificial satellite, **Sputnik 1**, launched on **4 October 1957**, independently established by [NASA](https://www.nasa.gov/history/dawn-of-the-space-age/) and the [US State Department](https://history.state.gov/milestones/1953-1960/sputnik). The existing correct F039 quiz answer **1957** was preserved and its source-conflict note added. No false 1956 question published.
2. **Ole Rømer date:** Class 9 originals (both Science PDF **77**) print **1665** rather than 1676. The new F177 explains that the credible historical chronology places his finite-speed breakthrough in **1676**. Its stem does not ask readers to memorize an incorrect textbook year.
3. Earlier accounts of the first operational Japanese shogunate are dated **1180**, **1185** or **1192** depending on how the transition is defined. F176 asks only who founded the Kamakura military government, and its explanation qualifies the chronology.
4. Other candidates such as first anti-diabetic medicine, first satellite and first artificial materials are not duplicated or imported as poorly defined universal historical firsts. The novelty and independent historical source of each new question is explicitly distinguished.

## Certification and continued work

This review proposes **178 curated bilingual Firsts**, version **20**: **Women 27; History 113; Science 38**. It uses structurally distinct four-choice Tamil/English answers and 20-question quiz sets.

**No Class 9 full-year original English/Tamil pair is certified completely.** The remaining work includes matching all twelve older original Class 9 History Firsts to exact newer Tamil source pages, checking every remaining textbook page image and non-searchable content, confirming the prescribed 2026–27 original revision, and reviewing all further distinct firsts candidates. Releasing the quiz on ClearExams will be verified separately by fetching the public site.
