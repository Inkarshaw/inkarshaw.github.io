# TNUSRB SI — 2019 recruitment, January 2020 Series C: Q101–120 reconciliation

Date: 22 November 2026. The user supplied original-numbered English questions Q101–120 and matching Tamil text for Q101–116 and Q118–120. Q117 was **English-only** in the supplied excerpt. This is a bilingual source comparison within the **existing** 140-position `data/quizzes/tnusrb-si-2020-series-c.json` bank; no second 2019 paper is being created.

## Reconciliation summary

- Q101–113 and Q118–120: the Tamil study stems are updated to reflect the supplied wording (minor typography cleanup only), preserving the A–D option identities and previously mapped provisional Series C keys.
- Q114–116: the already source-numbered, secondary-Series-C-scan visually transcribed English/Tamil stem/option records are retained, and the user transcription is recorded as corroborative rather than overriding their prior source status.
- Q117: existing Tamil **editorial** study translation remains in place. The user supplied the English `3/5 + 1/6` question and alternatives but *not* original Tamil; do not claim a user-supplied Tamil source for Q117.
- Q103: user text supplies the square-counting prompt and choices **but no original circle-grid figure**. Existing editorial illustration remains explicitly non-original, original Series C figure missing, and the question remains **ungraded** regardless of provisional key C.
- Q111: user text supplies a calendar question and choices. **ALL** is the recorded Series C final-key token; keep it **ungraded** and disclose that fact in Tamil even though a mathematical solution may identify an individual choice.

## Quality gates

- Exactly 140 original-numbered records retained (2019 recruitment, **exam held 2020**).
- No option order, answer-key token, accepted answer, or scoring state changed.
- Across 140 records: 130 provisionally scored, 7 disputed ungraded, 3 ALL-key ungraded. Q101–120: 18 provisionally scored, Q103 source-disputed, Q111 ALL-key.
- Every supplied entry records received-date provenance and `originalSeriesCBookletVisuallyVerified: false`. User OCR does not establish visual authenticity of the TNUSRB Series C printed source.
- Regression tests assert Tamil Q102/Q107/Q108/Q109/Q120 values, ungraded Q103, ALL-key Q111, and preserved secondary-source statuses Q114–116.

The original Series C question booklet's visual figures still need primary-source comparison before publishing an exact-verbatim authentication claim.
