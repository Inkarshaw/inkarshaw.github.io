# Class 7 Term III — original English/Tamil Firsts source audit

**Date:** 1 November 2026  
**Scope:** Original SCERT-authored Class 7 Term III Science and Social Science, English and Tamil editions, retrieved from third-party source mirror.  
**Outcome:** **Five selected bilingual facts verified and added to curated quiz; four full originals text-scanned; neither book wholly certified.**

## Original PDFs actually retrieved

| SCERT original book | 1-based PDF pages | Pages containing text | SHA-256 fingerprint |
| --- | ---: | ---: | --- |
| [Science — English](https://cleartnpsc.com/books/download/class-7-term-3-science-english.pdf) | 106 | 106 | `c55009453a74fbf3f5735aa254fbdfe744ff8c97908626feb05c406f62b9ae82` |
| [Science — Tamil](https://cleartnpsc.com/books/download/class-7-term-3-science-tamil.pdf) | 129 | 129 | `75626d9f289bda9d938d7126d263a3970fef67e0f010d916aaaa6f2afe2c578f` |
| [Social Science — English](https://cleartnpsc.com/books/download/class-7-term-3-social-science-english.pdf) | 120 | 120 | `0abda14330ff3af68f1d0dc89f0317d55151739b320ec8f02af491558c225d5f` |
| [Social Science — Tamil](https://cleartnpsc.com/books/download/class-7-term-3-social-science-tamil.pdf) | 145 | 145 | `a9c9c7d140eac3889b07bd02aa70dd896f2f7210c876103e35a75422008f75f7` |
| **Total** | **500** | **500** | |

- [All-page text extraction and keyword candidate artifact](https://github.com/Inkarshaw/inkarshaw.github.io/actions/runs/41302645630)
- [Targeted original English/Tamil page-image and excerpt audit](https://github.com/Inkarshaw/inkarshaw.github.io/actions/runs/41303212680)
- Reproducible scripts: `scripts/audit_class7_term3_originals.py` and `scripts/review_class7_term3_source_pages.py`

**Interpretation:** 500/500 **text layers extracted** does NOT mean 500/500 pages have been visually reviewed; diagrams, caption images, footnotes, non-Unicode Tamil segments and every possible Firsts claim are not fully checked. English candidate keyword matches 58 Science / 73 Social Science; Tamil 39 Science / 61 Social Science. This is **231 candidate lines**, including ordinary procedural uses of first and duplicates, not 231 verified questions.

## Selected source facts — approved bilingual Firsts

Pages below are **one-based PDF indexes**, distinct from separately printed page numbers. Exact direct original-source URLs and page indexes are saved on each quiz record.

| Quiz ID | Narrowly qualified claim | English PDF page | Tamil PDF page | Independent corroboration |
| --- | --- | ---: | ---: | --- |
| **F166** | Rohini RS-1 successfully placed in orbit by Indian-built SLV-3, **18 July 1980** | Science **40** | Science **48** | [ISRO SLV-3](https://www.isro.gov.in/SLV.html), [ISRO RS-1](https://www.isro.gov.in/RohiniSatellite_RS_1.html) |
| **F167** | India's first interplanetary mission, **Mangalyaan/Mars Orbiter Mission**, Mars insertion 24 Sep 2014 | Science **41** | Science **48** | [ISRO MOM FAQ](https://www.isro.gov.in/FAQ_MarsOrbiterMission.html) |
| **F168** | First Jain Council traditionally convened at **Pataliputra**, as framed in Class 7 history | Social Science **24** | Social Science **41** (exercise) | Traditional council attribution, no universal cross-sect consensus asserted |
| **F169** | Pallava **Mahendravarman I** and pioneering **Mandagapattu** rock-cut shrine | Social Science **14** | Social Science **18** | [University of Malaya Tamil temple architecture research](https://jice.um.edu.my/index.php/tamilperaivu/article/view/12941) |
| **F170** | **Alexander Fleming** discovered penicillin in **1928**, later developed into practical medical treatment | Science **72** | Science **89–90** | Original antibiotic narrative; no claim Fleming was first person ever to use medicinal mould |

Source image spot-checks include English Science p40–41 and p72, Tamil Science p48 and p89–90, English Social Science p14 and p24, Tamil Social Science p18 and p41.

## Important exclusions and quality safeguards

- The **first artificial satellite Sputnik 1 (F039)**, **India's first satellite Aryabhata (F036)**, **first Sikh Guru Nanak (F056)** and many **women pioneers (F001–F016, F059–F065)** already exist in the bank: do **not** add duplicates from this term's textbook.
- The absolute claim **“first rock-cut temple in India”** is *not* assigned to Mandagapattu. Earlier caves and competing architectural chronology require qualification. F169 asks for the Pallava ruler associated with this early architectural example.
- The **“oldest structural temple in South India”** assertion in the textbook can conflict with other temple chronologies; no unqualified quiz item added.
- The English plastics section describes **Parkesine** using the name **“Edmund Alexander Parkes”**, while the Science Museum identifies its inventor as **Alexander Parkes**. Rather than copy an inconsistent personal name as authoritative, no new Firsts MCQ was added in this audit batch. A reconciled source note is still needed.
- Do not overgeneralise early telescope-inventor claims, penicillin as the world's unqualified first antimicrobial substance, or contested religious-council dates.
- Candidate extraction for passages without the term "first" in both English/Tamil, page-by-page figure review and translation proofreading are still outstanding.

## Certification and next book

**Quiz bank release proposal:** **170 bilingual Firsts**, version 18; Women **27**, History **109**, Science **34**. Tests and live public release confirmation are separate from source-fact assessment.

**Whole book signoff:** **NO**, both Class 7 Term III books require full visual reading and reconciliation to the officially prescribed 2026–27 edition. Historical catalogue counts do not imply complete coverage.

**Next unit in source order:** Class 8 original Social Science / Science (all prescribed volume editions), once this release passes CI and public verification.

## Verified public deployment — 1 November 2026

GitHub Actions fetched the **actual public** `clearexams.ink` homepage, Firsts player and JSON (HTTP **200**), checked the complete live 170-question JSON against merged `main` byte-for-byte after parsing, and passed **47/47 release assertions**. This confirms **Firsts Quiz v18 (170 bilingual MCQs, Women 27 / History 109 / Science 34)** including F166–F170 and original Tamil PDF source links and page indexes.

[Independent live deployment verification #41304215805](https://github.com/Inkarshaw/inkarshaw.github.io/actions/runs/41304215805).

**This does not certify all textbook facts, all 500 PDF page images, or the current 2026–27 prescribed-edition identity.**
