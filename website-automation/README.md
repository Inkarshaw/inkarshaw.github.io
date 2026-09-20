# ClearExams Website Automation

Private-sheet bridge used by GitHub Actions.

## Daily current affairs

The enabled ChatGPT tasks check news every two hours, create the cover at
21:05 IST, and assemble/upload/publish the daily PDF at 21:30 IST. See
[the current-affairs runbook](current-affairs-runbook.md) for the complete handoff.
The old 20:10 repository-assets builder is manual-only.

Each current-affairs queue entry uses `CA-YYYY-MM-DD`, action `PUBLISH_URL`,
the public Drive PDF link, target `current-affairs/YYYY-MM-DD.pdf`, and a
`sha256=<64-character checksum>` marker in Notes. The publisher checks the
download against that checksum before replacing a PDF, then checks both the
live PDF bytes and the dated website index before marking the row `PUBLISHED`.
This prevents a delayed request from publishing a changed `current-affairs-latest.pdf`
under an older edition date. Non-PDF website jobs keep their existing behavior.

Flow:

1. Add a row to **Website Queue**.
2. Set `Status = READY`.
3. Railway exposes only due READY jobs through signed, short-lived job tokens.
4. GitHub Actions claims the job, applies the repository change, commits and pushes to `main`.
5. GitHub Pages deploys automatically.
6. GitHub Actions reports success/failure back to the bridge, which updates the same Sheet row.

Supported actions:

- `PUBLISH_URL` — download a public HTTPS/Google Drive file to Target Path.
- `PUBLISH_FILE` — alias of PUBLISH_URL.
- `REPLACE_TEXT` — Source is `OLD|||NEW`, Target Path is one repository text file.
- `DELETE_PATH` — delete Target Path.
- `FIX_OLD_DOMAIN` — replace `clearexams.online` with `clearexams.ink` in repository text files.
- `REBUILD_CA_INDEX` — regenerate current-affairs/pdfs.json.
- `DEPLOY_ONLY` — make a harmless deployment-trigger change.

Website Queue columns:
A Job ID
B Page / Section
C Action
D Source
E Target Path
F Scheduled Date
G Status
H GitHub Run
I Published URL
J Retry Count
K Last Error
L Notes
M Scheduled Time
N Commit SHA
O Completed At
P Processing At
