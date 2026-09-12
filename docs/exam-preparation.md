# Exam preparation pages

`exam-posts.html?exam=tnpsc` lists recruitment cards. Each card links to
`exam-preparation.html?exam=<id>` and its own syllabus and resource sections.
`exam-notifications.html?category=tnpsc` filters the dated notices and official
recruitment websites.

## Updating content

- `data/exam-catalog.json` is the shared source for all six categories and 43
  cards. Keep each `id` unique. `syllabus` is an existing ID in `syllabus.html`;
  use `null` when only the official recruitment source is available. Do not
  point an unrelated exam to another exam's syllabus.
- `data/group4-posts.json` contains the qualification table, post codes and
  source PDF pages. Its reference is notification 07/2025, not the 2026 cycle.
  Update the whole table against an issued notice before changing its year.
- `data/group4-english.json` and `data/group4-tamil.json` contain the complete
  text of the supplied bilingual TNPSC syllabus, code 496, dated 12 December
  2024. Tamil text was transcribed from the rendered document because its PDF
  text extraction has incorrect character mappings. Preserve all examples
  and the full literature lists when editing.
- The shared Group IV reader renders 22 units: six General Studies, two
  Aptitude/Reasoning, seven Tamil and seven General English. Language selection
  switches the General Studies/Aptitude reading language. The General English
  alternative remains explicitly restricted to candidates permitted by the
  recruitment notification. It is not a free choice of examination subject.
- `data/exam-notifications.json` is manually maintained. Update `checkedOn`
  after checking official notices. Use `kind: "planned"` for a tentative annual
  planner, `"archive"` for historical references, or `"notice"` for an issued
  recruitment notice. Never derive application dates from a planner date.
  Application deadlines must include their time and `+05:30` offset. Unknown
  dates are `null`. Check addenda before labelling an issued window open.
  Categories and examinations with no dated entry show a shared "2026 updates
  coming soon" card. This describes updates to ClearExams, not the official
  notice's release status. Do not invent dates for these placeholders.

The quiz remains connected to its existing public feed and repository fallback.
`daily-quiz.html?topic=Indian%20Polity` selects an available topic, with a safe
fallback if it is not found. Preparation pages label shared practice and do
not present it as a complete exam mock. Missing past-paper collections are
identified explicitly, with official sources linked.

## Verification when changing pages

Check all six categories for posts, qualifications and resource links. Check
Group IV's 19 qualification rows, all 22 syllabus units, both reading
languages, search, expand/collapse, PDF download and direct section links.
Check notification filters and closed/tentative labels. Verify every local
syllabus ID and resource path before publishing. The site has no build step;
GitHub Pages serves these static HTML, CSS, JavaScript and JSON files.
