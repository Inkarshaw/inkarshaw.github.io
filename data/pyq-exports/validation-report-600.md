# ClearExams Full-Paper PYQ Audit — 17 November 2026

## Coverage
| Paper | Original positions | Adapted typed text | Source-linked, untyped | Indicatively scorable | Ungraded |
|---|---:|---:|---:|---:|---:|
| TNPSC Group IV 2022 | 200 | 200 | 0 | 192 | 8 |
| TNPSC Group I 2011 | 200 | 200 | 0 | 190 | 10 |
| TNPSC Group I 2015 | 200 | 32 | 168 | 194 | 6 |
| **TOTAL** | **600** | **432** | **168** | **576** | **24** |

## Key audit
- **2022 Group IV Version A:** previous ClearExams final-key mapping had five incorrect answers (Q176 B→A, Q177 C→A, Q178 A→B, Q179 A→B, Q180 B→A). These are corrected on the review branch. Q105/Q117/Q134/Q197 = ALL and Q109 = A/B/C/D remain special ungraded. Three diagram-dependent questions Q172, Q173, Q179 ungraded.
- **2011 Group I Series D:** 200 source-page-inspected English study adaptations now present in the export; these are **not verbatim transcriptions**. Q129 stored typed key says B while the final-key manifest accepts A/B. Q185 typed key says D while manifest accepts A/B. Both are ungraded pending direct official final-key page comparison. Existing 8 ALL special entries ungraded. **2011 scoring eligibility now 190/200**, not 192.
- **2015 Group I GS0811 ω:** official source is TNPSC 08-11-2015 final key https://www.tnpsc.gov.in/Document/Answerkeyfinalresult/GR_I_92K15_FIN_ANSKEY.pdf. All 200 final-key entries were transcribed from the official table. Multi-answer Q20 A/C and Q170 A/B preserved. Q59, Q92 and Q189 = ALL, ungraded. Typed Q21/Q22/Q26 retain existing source-level historical disagreements and are ungraded. **2015 scoring eligibility 194/200, of which 165 require viewing the original PDF to know the question/choices.**
- **No newly invented question text or diagrams:** 2015 Q33–Q200 typed questions remain missing; metadata, official-key letter, and source-paper links are preserved. The optional coaching-hosted full PDF is a third-party retypesetting, not an authenticated verbatim original.

## Structural validation
- 3 papers × 200 consecutively numbered entries = **600/600**
- 600/600 official-key fields present
- 2022: all 200 A–E choices present; 2011: all 200 A–D choices present; 2015: 32 A–D typed positions present, 168 source-linked empty texts/options
- Every untyped position stays null instead of containing a fabricated prompt or answer choice
- Every question carries a scoring status; ALL and unresolved source disputes explicitly ungraded
- All 600 positions appear in `unresolved-questions-600.csv`
- 2022 and 2011 texts are adapted study questions, not independently certified verbatim reproductions. Tamil 2011 and most 2015 text remain untyped.
- Official source PDFs may fail to embed on some websites. Use direct PDF links. A source-linked slot without visible original content is **not** a complete standalone typed quiz question.

## Source links
- 2022 original: https://www.tnpsc.gov.in/Tentative/Document/CCS4T_2022_OPT.pdf
- 2022 final key: https://www.tnpsc.gov.in/Document/Answerkeyfinalresult/07_22_GR_IV_FINAL_KEY.pdf
- 2011 original: https://tnpsc.gov.in/static_pdf/dptpreviousyearquestion/IDPC.pdf
- 2011 final key: https://www.tnpsc.gov.in/static_pdf/anskeys/05_06_2011_g1_gk.pdf
- 2015 original: https://www.tnpsc.gov.in/Tentative/Document/08_11_2015_gk.pdf
- 2015 final key: https://www.tnpsc.gov.in/Document/Answerkeyfinalresult/GR_I_92K15_FIN_ANSKEY.pdf
- 2015 secondary retypeset reference: https://radiannews.pbworks.com/f/103174930/2015-GROUP-1-ACTUAL-PAPER-WITH-KEYS.pdf

## Import guidance
Use `complete-600.json` for multi-year catalogue import with strict UI flags. `tnpsc-g1-2015-complete-source-linked.json` is the new 2015 standalone resource. A playable HTML with all three banks can be used offline for answer selection but source-linked questions require the original PDF.

**Publication gate**: Do not describe these records as fully digitized verbatim original papers; do not give special ALL, disputed key, or missing-figure positions unconditional grades.

## 17 Nov 2026: 2015 secondary-text source crosswalk and risks

A public study index splits 2015 GS0811 into six General Studies pages (positions 1–155) and two Aptitude pages (positions 156–200). Links are now attached to all 200 2015 positions. The English General Studies part-3 URL was inferred from its site's link pattern but not independently confirmed. The final Aptitude study page is indexed in Tamil; English page access was not verified.

**Critical booklet-code mismatch risk:** On the indexed General Studies part-6 page, the secondary publication gives Q126=C, Q128=D, Q129=B, while TNPSC's authenticated GS0811 ω official final key gives Q126=A, Q128=C, Q129=A. This is a three-question observed answer-letter discrepancy; it is not proof that the text itself is wrong. Original ω option order or secondary mistakes must be reviewed before reusing secondary choices. Do **not** auto-import third-party A–D option sequences and mark them using ω final keys without a booklet crosswalk. These fields are kept explicitly unverified. No new 2015 question text or options have been invented or silently copied.

Original answer key: https://www.tnpsc.gov.in/Document/Answerkeyfinalresult/GR_I_92K15_FIN_ANSKEY.pdf . Secondary part-6: https://gktamil.com/tnpsc-group-1/2015/english/general-studies/part-6 .
