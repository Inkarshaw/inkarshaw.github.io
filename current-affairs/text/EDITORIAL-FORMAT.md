# Editorial source schema — NOT an edition to publish

This is an illustrative template only. Do not queue or deploy it as news.
Fill every field with independently verified, original writing and replace all
example.org URLs with relevant primary sources. Name the completed source
current-affairs/text/data/YYYY-MM-DD.json, with a matching "date" field.

```json
{
  "date": "2026-10-14",
  "status": "partial",
  "description": "Replace this placeholder with a sourced, verified summary of the edition before publication.",
  "stories": [
    {
      "category": "National",
      "title": "Replace with a verified headline for the first significant event",
      "summary": "Write an original factual summary of the event, explaining what happened, when, where and why the development matters for examinations. Distinguish announcements from implemented policy decisions.",
      "key_facts": [
        "Replace this with a specific fact verified against the primary release."
      ],
      "exam_link": "Explain the relevant static GK topic or institutional background.",
      "source_title": "Replace with official source name and publication date",
      "source_url": "https://example.org/verified-release-1"
    },
    {
      "category": "Science and Technology",
      "title": "Replace with a verified headline for the second significant event",
      "summary": "Write an independent, fact-checked summary of this second story. Confirm all statistics and names using the original announcement, and link to that announcement without copying entire paragraphs.",
      "key_facts": [
        "Add another specific and independently checked examination-relevant fact."
      ],
      "exam_link": "Explain one linked static GK fact or syllabus topic for revision.",
      "source_title": "Replace with second original source and date",
      "source_url": "https://example.org/verified-release-2"
    }
  ],
  "mcqs": [
    {
      "question": "Replace with an unambiguous question testing the first verified story?",
      "options": [
        "Distinct factual option A",
        "Distinct factual option B",
        "Distinct factual option C",
        "Distinct factual option D"
      ],
      "answer_index": 0,
      "explanation": "Explain precisely why option A is correct, citing the material already summarized."
    },
    {
      "question": "Replace with a second, non-repeating question about another key verified fact?",
      "options": [
        "Distinct factual option A",
        "Distinct factual option B",
        "Distinct factual option C",
        "Distinct factual option D"
      ],
      "answer_index": 1,
      "explanation": "Explain precisely why option B follows from a verified source and not conjecture."
    }
  ]
}
```
