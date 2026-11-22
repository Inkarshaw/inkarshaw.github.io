# ClearExams first release — Group IV diagnostic measurement

## Release surface
- Home hero CTA: `/group4-diagnostic.html`, prominent and free.
- Start button on the diagnostic entry page: launches `/pyq-original-paper.html?paper=tnpsc-group-iv-2024-general-tamil-general-studies&diagnostic=group4`.
- **Actual format**: TNPSC's 2024 official scanned 200-question paper + ClearExams numbered digital response sheet, 180-minute timer, local saved responses, matching official Version A key. This is **not** a fully proofread typed-text paper and the scan includes handwritten ticks.
- Indicative scoring excludes the official `ALL` positions; the result offers General Tamil (Q1–100) and combined GS/Aptitude (Q101–200) breakdowns.
- No sign-in or paid tier is required.

## Google Analytics 4 setup
Measurement ID already present on the site: `G-SS34PK7RL0`. In GA4 Reports or Explore, filter to event names below; select **Total users** (or Active users if consistent) to count candidate-like browser identifiers, rather than treating every event as a unique human.

| Event | When it fires | Interpretation |
| --- | --- | --- |
| `g4_diagnostic_home_cta_click` | The primary homepage link is clicked | Top-of-funnel interest; may be missed by ad blockers or rapid navigation |
| `g4_diagnostic_start` | The candidate chooses Begin on landing and the quiz loads (or directly enters a first answer) | Unique starters; can also view event count for total attempts |
| `g4_diagnostic_complete` | A non-empty response sheet is submitted or auto-submitted on expiry | Unique submitters, including timeout submissions with at least one answer |
| `g4_diagnostic_return_7d` | A first-time starter revisits a tracked ClearExams page in a different browser session, 30 minutes to 7 days after starting | Unique seven-day returners, once per first-start local cohort |

**Source of truth:** GA4 events (not a local admin counter). They accumulate only after the deployment goes live and real visitors use the site. No traffic counts are available from this change itself.

## Weekly reporting
For each launch week, allow an additional seven days for the retention window to mature before final reporting. Report:

1. **Starter candidates**: distinct users with `g4_diagnostic_start`.
2. **Submitted candidates**: distinct starters with `g4_diagnostic_complete`. For strict cohort accounting, create a GA4 segment of diagnostic starters and measure their completion events.
3. **Submission rate**: cohort submitters / starter candidates.
4. **Returned within seven days**: distinct starters with `g4_diagnostic_return_7d`.
5. **Seven-day return rate**: returners / starter candidates.
6. Optional: mobile/desktop start and submission rate, source / medium, and the gap between click and start.

Do not sum `start` events as people: the same browser can attempt a second exam after completing a prior one. Compare **users** as the primary metric and **event count** as secondary volume.

## Interpretation and privacy
- `g4_diagnostic_complete` does not require all 200 answers. Track answered count and `auto_submit` to distinguish intentional finishes from timed submission. Consider a second, stricter “substantial completion” segment with >=150 answers if useful.
- The return flag lives in localStorage and sessionStorage. Return detection covers the homepage, the diagnostic entry/quiz, and pages using the shared ClearExams PWA helper **where GA4 is present**; it is not a universal cross-device measure. A return in the same browser session does not count.
- GA4 blockers, consent choices, browser storage clearing, device changes, and offline visits cause undercounts.
- The analytics events send counts and broad result aggregates, **never candidate names, individual question text, or response letters**.
- Actual retention or demand cannot be asserted until a cohort has had seven full days to return. This is validation before committing to a site-wide paid subscription.

## Launch smoke check
1. Open the homepage and confirm the 200-question diagnostic is the primary hero CTA on desktop and mobile.
2. Click CTA: no `g4_diagnostic_start` yet. Click Begin; the 2024 Group IV paper opens with 200 question positions and the 180-minute timer.
3. In GA4 DebugView/Realtime, verify a single `g4_diagnostic_start` after Begin (requires analytics connectivity).
4. Answer at least one question; submit; verify a single `g4_diagnostic_complete`, an indicative key score, and two section-level feedback cards. Use Continue/edit then resubmit; there should be no duplicate completion event.
5. Reopen in a new browser session after 30+ minutes but before day 7; visit a tracked ClearExams page and verify exactly one `g4_diagnostic_return_7d`.
6. Verify the source PDF can be opened on mobile; the linked TNPSC scan can be blocked from embedding in some mobile browsers.

**Do not describe the 2024 paper as clean, verified verbatim text.** Publish a verified text-only diagnostic in a later release after independent source proofreading and rights review.
