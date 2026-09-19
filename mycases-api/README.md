# ClearExams My Cases API

Private Railway backend for syncing `clearexams.ink/mycases` with the private Google Sheet **ClearExams My Cases**.

## Required Railway variables

- `GOOGLE_SHEET_ID`
- `GOOGLE_SHEET_NAME` = `Cases`
- `GOOGLE_SERVICE_ACCOUNT_JSON`
- `MYCASES_PASSWORD`
- `SESSION_SECRET`
- `NODE_ENV` = `production`

The Google Sheet must be shared with the service account email as **Editor**.

No credentials belong in GitHub Pages or committed source code.
