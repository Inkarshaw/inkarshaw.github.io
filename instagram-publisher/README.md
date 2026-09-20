# ClearExams Instagram Publisher

Railway service that polls the **Instagram Queue** tab in the ClearExams Automation Control Centre and publishes rows whose `Status` is `READY`.

Supported formats:
- `PHOTO`
- `REEL`
- `CAROUSEL` (2–10 media links, one per line)

Required Railway variables:
- `GOOGLE_SERVICE_ACCOUNT_JSON`
- `CONTROL_SHEET_ID`
- `INSTAGRAM_ACCESS_TOKEN`

Optional:
- `INSTAGRAM_USER_ID` (auto-discovered when possible)
- `META_API_VERSION` (defaults to `v25.0`)
- `CONTROL_SHEET_NAME` (defaults to `Instagram Queue`)
- `POLL_INTERVAL_SECONDS` (defaults to 60)
- `TIMEZONE` (defaults to Asia/Kolkata)
- `ADMIN_SECRET`

Media can be a public HTTPS URL or a public Google Drive file link. Images are proxied and converted to JPEG before Meta fetches them.

Queue columns:
A Job ID
B Publish Date
C Publish Time
D Format
E Topic
F Media Link
G Caption
H Hashtags
I Status
J Instagram Post ID
K Retry Count
L Notes
M Published URL
N Published At
O Last Error
