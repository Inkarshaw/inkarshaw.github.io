# ClearExams Website Automation

Private-sheet bridge used by GitHub Actions.

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
