const express = require("express");
const crypto = require("crypto");
const { google } = require("googleapis");
const { DateTime } = require("luxon");

const app = express();
app.use(express.json());

const PORT = Number(process.env.PORT || 3000);
const SHEET_ID = process.env.CONTROL_SHEET_ID || "1apIHpkbfBHAmU3RgyZOzTVJLnLAkxfcV_iJkBMLRtx8";
const SHEET_NAME = process.env.WEBSITE_SHEET_NAME || "Website Queue";
const TZ = process.env.TIMEZONE || "Asia/Kolkata";
const JOB_SECRET = process.env.JOB_SIGNING_SECRET || "";
const TOKEN_TTL_MS = 20 * 60 * 1000;
const MAX_RETRIES = Math.max(1, Number(process.env.MAX_RETRIES || 3));

if (!JOB_SECRET) throw new Error("JOB_SIGNING_SECRET is required");

function parseServiceAccount() {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!raw) throw new Error("GOOGLE_SERVICE_ACCOUNT_JSON is not configured");
  const obj = JSON.parse(raw);
  if (obj.private_key) obj.private_key = obj.private_key.replace(/\\n/g, "\n");
  return obj;
}

const auth = new google.auth.GoogleAuth({
  credentials: parseServiceAccount(),
  scopes: ["https://www.googleapis.com/auth/spreadsheets"]
});
const sheets = google.sheets({ version: "v4", auth });

function tab() {
  return `'${SHEET_NAME.replace(/'/g, "''")}'`;
}

function sign(payload) {
  const raw = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = crypto.createHmac("sha256", JOB_SECRET).update(raw).digest("hex");
  return `${raw}.${sig}`;
}

function verify(token) {
  const [raw, sig] = String(token || "").split(".");
  if (!raw || !sig) throw new Error("Invalid token");
  const expected = crypto.createHmac("sha256", JOB_SECRET).update(raw).digest("hex");
  if (sig.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) {
    throw new Error("Invalid token signature");
  }
  const payload = JSON.parse(Buffer.from(raw, "base64url").toString("utf8"));
  if (!payload.exp || Date.now() > payload.exp) throw new Error("Job token expired");
  return payload;
}

function parseDate(text) {
  const t = String(text || "").trim();
  if (!t) return null;
  const formats = ["yyyy-MM-dd", "M/d/yyyy", "MM/dd/yyyy", "d/M/yyyy", "dd/MM/yyyy"];
  for (const f of formats) {
    const d = DateTime.fromFormat(t, f, { zone: TZ });
    if (d.isValid) return d;
  }
  const iso = DateTime.fromISO(t, { zone: TZ });
  return iso.isValid ? iso : null;
}

function parseTime(text) {
  const t = String(text || "").trim();
  if (!t) return { hour: 0, minute: 0, second: 0 };
  for (const f of ["HH:mm", "HH:mm:ss", "h:mm a", "h:mm:ss a"]) {
    const d = DateTime.fromFormat(t, f, { zone: TZ });
    if (d.isValid) return { hour: d.hour, minute: d.minute, second: d.second };
  }
  return null;
}

function isDue(dateText, timeText) {
  if (!dateText && !timeText) return true;
  const d = parseDate(dateText);
  const t = parseTime(timeText);
  if (!d || !t) return false;
  return d.set(t) <= DateTime.now().setZone(TZ);
}

async function rows() {
  const r = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: `${tab()}!A2:P500`
  });
  return (r.data.values || []).map((v, i) => ({
    rowNumber: i + 2,
    jobId: v[0] || "",
    page: v[1] || "",
    action: String(v[2] || "").trim().toUpperCase(),
    source: v[3] || "",
    targetPath: v[4] || "",
    scheduledDate: v[5] || "",
    status: String(v[6] || "").trim().toUpperCase(),
    githubRun: v[7] || "",
    publishedUrl: v[8] || "",
    retryCount: Number(v[9] || 0),
    lastError: v[10] || "",
    notes: v[11] || "",
    scheduledTime: v[12] || "",
    commitSha: v[13] || "",
    completedAt: v[14] || "",
    processingAt: v[15] || ""
  }));
}

async function updateRow(rowNumber, values) {
  const data = Object.entries(values).map(([col, value]) => ({
    range: `${tab()}!${col}${rowNumber}`,
    values: [[value]]
  }));
  await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId: SHEET_ID,
    requestBody: { valueInputOption: "USER_ENTERED", data }
  });
}

function tokenFor(r) {
  return sign({
    jobId: r.jobId,
    rowNumber: r.rowNumber,
    nonce: crypto.randomBytes(8).toString("hex"),
    exp: Date.now() + TOKEN_TTL_MS
  });
}

async function resolveToken(req) {
  const token = req.body?.token || req.query?.token || "";
  const payload = verify(token);
  const list = await rows();
  const r = list.find(x => x.rowNumber === Number(payload.rowNumber) && x.jobId === payload.jobId);
  if (!r) throw new Error("Job row no longer exists");
  return { payload, row: r };
}

app.get("/health", async (_req, res) => {
  try {
    await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `${tab()}!A1:P2`
    });
    res.json({ ok: true, sheet: true, timezone: TZ, maxRetries: MAX_RETRIES });
  } catch (e) {
    res.status(503).json({ ok: false, sheet: false, error: e.message });
  }
});

app.get("/jobs", async (_req, res) => {
  try {
    const list = await rows();
    const jobs = list
      .filter(r => r.jobId && r.status === "READY" && r.retryCount < MAX_RETRIES && isDue(r.scheduledDate, r.scheduledTime))
      .map(r => ({
        jobId: r.jobId,
        page: r.page,
        action: r.action,
        source: r.source,
        targetPath: r.targetPath,
        scheduledDate: r.scheduledDate,
        scheduledTime: r.scheduledTime,
        retryCount: r.retryCount,
        notes: r.notes,
        token: tokenFor(r)
      }));
    res.json({ jobs, generatedAt: DateTime.now().setZone(TZ).toISO() });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post("/claim", async (req, res) => {
  try {
    const { row } = await resolveToken(req);
    if (row.status !== "READY") return res.status(409).json({ error: `Job is ${row.status}, not READY` });
    await updateRow(row.rowNumber, {
      G: "PROCESSING",
      H: req.body?.githubRun || "",
      K: "",
      P: DateTime.now().setZone(TZ).toFormat("yyyy-MM-dd HH:mm:ss")
    });
    res.json({ ok: true });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

app.post("/complete", async (req, res) => {
  try {
    const { row } = await resolveToken(req);
    if (!["PROCESSING", "READY"].includes(row.status)) {
      return res.status(409).json({ error: `Job is ${row.status}; cannot complete` });
    }
    await updateRow(row.rowNumber, {
      G: "PUBLISHED",
      H: req.body?.githubRun || row.githubRun || "",
      I: req.body?.publishedUrl || "",
      K: "",
      N: req.body?.commitSha || "",
      O: DateTime.now().setZone(TZ).toFormat("yyyy-MM-dd HH:mm:ss"),
      P: ""
    });
    res.json({ ok: true });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

app.post("/fail", async (req, res) => {
  try {
    const { row } = await resolveToken(req);
    const retry = row.retryCount + 1;
    await updateRow(row.rowNumber, {
      G: retry >= MAX_RETRIES ? "FAILED" : "READY",
      H: req.body?.githubRun || row.githubRun || "",
      J: retry,
      K: String(req.body?.error || "Unknown website automation error").slice(0, 1000),
      P: ""
    });
    res.json({ ok: true, retryCount: retry, status: retry >= MAX_RETRIES ? "FAILED" : "READY" });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

app.post("/recover", async (_req, res) => {
  try {
    const list = await rows();
    const now = DateTime.now().setZone(TZ);
    let recovered = 0;
    for (const r of list) {
      if (r.status !== "PROCESSING" || !r.processingAt) continue;
      const p = DateTime.fromFormat(r.processingAt, "yyyy-MM-dd HH:mm:ss", { zone: TZ });
      if (p.isValid && now.diff(p, "minutes").minutes > 30) {
        await updateRow(r.rowNumber, { G: "READY", P: "", K: "Recovered stale PROCESSING job after 30 minutes." });
        recovered++;
      }
    }
    res.json({ ok: true, recovered });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.listen(PORT, () => {
  console.log(`ClearExams Website Queue Bridge listening on ${PORT}`);
});
