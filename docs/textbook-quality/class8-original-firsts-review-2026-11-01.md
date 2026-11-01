# Class 8 original Science and Social Science — bilingual Firsts source audit

**Audit date:** 1 November 2026  
**Scope:** Original Government of Tamil Nadu/SCERT **Class 8 full-year** English and Tamil Science and Social Science PDFs, obtained from a public textbook mirror and checked by full-file SHA-256. This audit uses the **current full-year titles**, not the older term-wise Class 8 files used by some legacy questions.

**Status: 10 selected Firsts facts/source references reviewed, four additional bilingual MCQs approved. NO entire Class 8 English/Tamil book certified.** Original 2026–27 prescribed book edition matching remains outstanding.

## Four originals downloaded and fully text-extracted

| Subject and medium | One-based PDF pages | Pages with text | SHA-256 |
| --- | ---: | ---: | --- |
| [Science English](https://cleartnpsc.com/books/download/class-8-science-english.pdf) | 288 | 288 | `9ac14748a3ccf28145ea0e898e50fdc47d9af4f0becd47652aaa98ccd8668ed8` |
| [Science Tamil](https://cleartnpsc.com/books/download/class-8-science-tamil.pdf) | 304 | 304 | `53e57b6eef2ab7a902e41ce347b3420684e289ae794ea0858f4fcea1ff25aef1` |
| [Social Science English](https://cleartnpsc.com/books/download/class-8-social-science-english.pdf) | 256 | 256 | `d8dfac7c6ae3ba5bc212f013dd02a4f11435351f9e32c57af5696ff0b3ecd036` |
| [Social Science Tamil](https://cleartnpsc.com/books/download/class-8-social-science-tamil.pdf) | 304 | 304 | `32d64cfeb5ed72108ca15e7d04c1f113aa9a5ce5ae82607c22beaa3746092424` |
| **Total** | **1,152** | **1,152** | |

Reproducible [full-text scan #41304614167](https://github.com/Inkarshaw/inkarshaw.github.io/actions/runs/41304614167) and [selected English/Tamil original page excerpt and image artifact #41304874414](https://github.com/Inkarshaw/inkarshaw.github.io/actions/runs/41304874414). Audit scripts: `scripts/audit_class8_originals.py` and `scripts/review_class8_source_pages.py`. **Text-extractable page count is NOT equivalent to complete human reading of all images, figures, sidebars, Tamil typography, or all possible “firsts”.**

## Six existing questions re-linked to original full-year bilingual PDFs

The exact **physical PDF page indexes (1-based)** are saved in the question bank; these differ from printed page numbers.

| MCQ | Original English PDF page | Original Tamil PDF page | Original fact |
| --- | ---: | ---: | --- |
| F036 | Science **90** | Science **92** | India's first satellite **Aryabhata**, 1975; older term-wise source link superseded |
| F037 | Science **94** | Science **97** | **Apollo 8**, first crewed flight to orbit the Moon and return |
| F038 | Science **94** | Science **97** | **Neil Armstrong**, first person to walk on Moon |
| F057 | Science **131** | Science **136** | **James Chadwick**, discovery of neutron in 1932 |
| F117 | Social Science **11** | Social Science **12** | Dutch Company's **Masulipatnam** factory, 1605, as attributed by SCERT |
| F118 | Social Science **12** | Social Science **13** | English Company's **Masulipatnam** Bay of Bengal coast factory, 1611 |

**F119–F121** are older original English-only/term-linked facts whose present full-year bilingual page equivalence has **not** yet been signed off in this batch; do not label them fully certified.

## Four newly approved bilingual firsts

| MCQ | English PDF page | Tamil PDF page | Carefully scoped fact and independent source |
| --- | ---: | ---: | --- |
| **F171** | Science **258** | Science **269** | India's first **Krishi Vigyan Kendra** at **Puducherry, 1974**. [ICAR primary authority](https://www.icar.gov.in/en/krishi-vigyan-kendras-kvks) confirms this. |
| **F172** | Social Science **25** | Social Science **28** | **Satyendranath Tagore**, first Indian to succeed in competitive **ICS** recruitment. [UPSC official historical note](https://cms.upsc.gov.in/about-us/) corroborates; stem deliberately omits the conflicting textbook/UPSC year variants. |
| **F173** | Science **54** | Science **56** | **William Gilbert**, his **versorium** early electroscope around **1600**. [Smithsonian book record](https://library.si.edu/digital-library/book/guilielmigilber00gilb) and [University of Hamburg history](https://www.ew.uni-hamburg.de/einrichtungen/ew5/didaktik-physik/projekte-abgeschlossen/bis-2015/2008-2010-hipst/casestudies/01-e-gilbert) corroborate. |
| **F174** | Social Science **11** | Social Science **11** | **Francisco de Almeida**, first Portuguese **viceroy** in India, 1505–1509. [Portuguese Expansion Historical Register](https://eve.fcsh.unl.pt/index.php/en/lists/india-governors-and-vice-roys-1505-1821) independently confirms the title. |

The source scan verified the original printed bibliographic SCERT authorship; **2026–27 formally prescribed edition parity is not verified**, and selected Tamil PDF images were inspected only where practical. Most claims above have original English/Tamil **text-layer** comparison; some Tamil glyphs are corrupted when extracted. Do not overstate this as an exhaustive visual audit.

## Deliberately deferred / excluded

- The Class 8 historical passage's *“first queen to fight the British”* (Velu Nachiyar) and absolute *“first Palayakkarar to defeat the British”* (Puli Thevar) require careful chronological/historiographical qualification before adding exclusive firsts.
- Some scientific material includes inconsistent/ambiguous "first oil well" and "first electronic detector" language; the William Gilbert question specifically asks for the **versorium**, not an unqualified worldwide electrical invention claim.
- **F119–F121** require pinpoint verification of the present latest-original Tamil page text before their metadata can be upgraded.
- The older term-wise Class 8 question bank has links that must be considered **historical source editions**, not assumed interchangeable with these full-year originals.

## Result

**Proposed Firsts quiz release:** **174** curated bilingual questions (version **19**), Women **27**, History **111**, Science **36**. The new MCQs include four choices, English/Tamil explanations, direct original English/Tamil SCERT PDF source URLs, PDF page indexes and explicit incomplete-book statuses.

**No Class 8 full-year textbook has received whole-volume certification.** The total number of fully English/Tamil paired textbooks signed off Classes 6–12 remains zero under the audit's strict definition. 

## Verified public deployment — 1 November 2026

A GitHub-hosted independent live-HTTP runner fetched the public `clearexams.ink` Firsts player, JSON and homepage, all returning HTTP **200**. After the normal Pages publication delay, retrying the verification passed **53/53 checks**, including **the entire public 174-question bilingual JSON matching merged GitHub main**, version 19, category totals Women 27 / History 111 / Science 36, all four F171–F174 answers, and ten current Class 8 original Tamil PDF URLs and one-based page references.

[Public Firsts 174/v19 verification #41306156653](https://github.com/Inkarshaw/inkarshaw.github.io/actions/runs/41306156653). The first attempt saw v18 during publication; the *second attempt passed*. Site deployment does **not** establish all-book fact or image certification.
