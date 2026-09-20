const express = require("express");
const crypto = require("crypto");
const sharp = require("sharp");
const { google } = require("googleapis");
const { DateTime } = require("luxon");

const app = express();
app.use(express.json());

const PORT = Number(process.env.PORT || 3000);
const SHEET_ID = process.env.CONTROL_SHEET_ID || "1apIHpkbfBHAmU3RgyZOzTVJLnLAkxfcV_iJkBMLRtx8";
const SHEET_NAME = process.env.CONTROL_SHEET_NAME || "Instagram Queue";
const TZ = process.env.TIMEZONE || "Asia/Kolkata";
const POLL_MS = Math.max(30, Number(process.env.POLL_INTERVAL_SECONDS || 60)) * 1000;
const API_VERSION = process.env.META_API_VERSION || "v25.0";
const ACCESS_TOKEN = process.env.INSTAGRAM_ACCESS_TOKEN || "";
const CONFIGURED_IG_ID = process.env.INSTAGRAM_USER_ID || "";
const ADMIN_SECRET = process.env.ADMIN_SECRET || "";
const MEDIA_SECRET = process.env.MEDIA_SIGNING_SECRET || ADMIN_SECRET || "replace-me";
const GRAPH = `https://graph.facebook.com/${API_VERSION}`;

let running = false;
let cachedIgId = null;

function parseServiceAccount() {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!raw) throw new Error("GOOGLE_SERVICE_ACCOUNT_JSON is not configured");
  try {
    const obj = JSON.parse(raw);
    if (obj.private_key) obj.private_key = obj.private_key.replace(/\\n/g, "\n");
    return obj;
  } catch (e) {
    throw new Error("GOOGLE_SERVICE_ACCOUNT_JSON is invalid JSON");
  }
}

const auth = new google.auth.GoogleAuth({
  credentials: parseServiceAccount(),
  scopes: ["https://www.googleapis.com/auth/spreadsheets"]
});
const sheets = google.sheets({ version: "v4", auth });

function publicBase() {
  if (process.env.PUBLIC_BASE_URL) return process.env.PUBLIC_BASE_URL.replace(/\/$/, "");
  if (process.env.RAILWAY_PUBLIC_DOMAIN) return `https://${process.env.RAILWAY_PUBLIC_DOMAIN}`;
  throw new Error("No public domain is configured for media proxy");
}

function driveId(url) {
  const s = String(url || "");
  let m = s.match(/\/d\/([a-zA-Z0-9_-]{15,})/);
  if (m) return m[1];
  m = s.match(/[?&]id=([a-zA-Z0-9_-]{15,})/);
  if (m) return m[1];
  return null;
}

function sourceUrl(raw) {
  const id = driveId(raw);
  if (id) return `https://drive.google.com/uc?export=download&id=${encodeURIComponent(id)}`;
  if (/^https:\/\//i.test(String(raw || ""))) return String(raw).trim();
  throw new Error("Media Link must be a public HTTPS URL or Google Drive file link");
}

function signMedia(url, kind) {
  const exp = Date.now() + 30 * 60 * 1000;
  const payload = Buffer.from(JSON.stringify({ url: sourceUrl(url), kind, exp })).toString("base64url");
  const sig = crypto.createHmac("sha256", MEDIA_SECRET).update(payload).digest("hex");
  return `${publicBase()}/media/${payload}?sig=${sig}`;
}

function splitMedia(value) {
  return String(value || "")
    .split(/\r?\n|\|/)
    .map(x => x.trim())
    .filter(Boolean);
}

function caption(row) {
  return [row.caption, row.hashtags].filter(Boolean).join("\n\n").trim();
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
  const formats = ["HH:mm", "HH:mm:ss", "h:mm a", "h:mm:ss a"];
  for (const f of formats) {
    const d = DateTime.fromFormat(t, f, { zone: TZ });
    if (d.isValid) return { hour: d.hour, minute: d.minute, second: d.second };
  }
  return null;
}

function isDue(dateText, timeText) {
  if (!dateText && !timeText) return true;
  const d = parseDate(dateText);
  if (!d) return false;
  const tm = parseTime(timeText);
  if (!tm) return false;
  const due = d.set(tm);
  return due <= DateTime.now().setZone(TZ);
}

async function graph(path, method = "GET", params = {}) {
  if (!ACCESS_TOKEN) throw new Error("INSTAGRAM_ACCESS_TOKEN is not configured");
  const url = new URL(`${GRAPH}/${path.replace(/^\//, "")}`);
  const body = new URLSearchParams();
  for (const [k, v] of Object.entries({ ...params, access_token: ACCESS_TOKEN })) {
    if (v !== undefined && v !== null && v !== "") body.set(k, String(v));
  }

  let res;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      if (method === "GET") {
        for (const [k, v] of body.entries()) url.searchParams.set(k, v);
        res = await fetch(url, { headers: { "User-Agent": "ClearExams-Instagram-Publisher/1.0" } });
      } else {
        res = await fetch(url, {
          method,
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "User-Agent": "ClearExams-Instagram-Publisher/1.0"
          },
          body
        });
      }
      const json = await res.json().catch(() => ({}));
      if (res.ok) return json;
      const msg = json?.error?.message || `Meta API HTTP ${res.status}`;
      if (res.status < 500 || attempt === 3) throw new Error(msg);
    } catch (e) {
      if (attempt === 3) throw e;
    }
    await new Promise(r => setTimeout(r, 1500 * attempt));
  }
}

async function resolveIgId() {
  if (CONFIGURED_IG_ID) return CONFIGURED_IG_ID;
  if (cachedIgId) return cachedIgId;
  try {
    const me = await graph("me", "GET", { fields: "instagram_business_account" });
    if (me.instagram_business_account?.id) return (cachedIgId = me.instagram_business_account.id);
  } catch {}
  const accounts = await graph("me/accounts", "GET", { fields: "id,name,instagram_business_account" });
  const found = (accounts.data || []).find(x => x.instagram_business_account?.id);
  if (!found) throw new Error("Could not discover an Instagram professional account from this token");
  return (cachedIgId = found.instagram_business_account.id);
}

async function waitContainer(id, maxMs = 5 * 60 * 1000) {
  const started = Date.now();
  while (Date.now() - started < maxMs) {
    const s = await graph(id, "GET", { fields: "status_code,status" });
    if (s.status_code === "FINISHED" || s.status_code === "PUBLISHED") return;
    if (s.status_code === "ERROR" || s.status_code === "EXPIRED") {
      throw new Error(s.status || `Instagram container ${s.status_code}`);
    }
    await new Promise(r => setTimeout(r, 5000));
  }
  throw new Error("Instagram media container did not finish processing in time");
}

async function publishContainer(igId, creationId) {
  const p = await graph(`${igId}/media_publish`, "POST", { creation_id: creationId });
  if (!p.id) throw new Error("Instagram publish returned no media ID");
  return p.id;
}

async function publishPhoto(igId, row) {
  const links = splitMedia(row.mediaLink);
  if (links.length !== 1) throw new Error("PHOTO requires exactly one Media Link");
  const c = await graph(`${igId}/media`, "POST", {
    image_url: signMedia(links[0], "image"),
    caption: caption(row)
  });
  if (!c.id) throw new Error("Instagram did not create an image container");
  return publishContainer(igId, c.id);
}

async function publishReel(igId, row) {
  const links = splitMedia(row.mediaLink);
  if (links.length !== 1) throw new Error("REEL requires exactly one Media Link");
  const c = await graph(`${igId}/media`, "POST", {
    media_type: "REELS",
    video_url: signMedia(links[0], "video"),
    caption: caption(row),
    share_to_feed: "true"
  });
  if (!c.id) throw new Error("Instagram did not create a Reel container");
  await waitContainer(c.id);
  return publishContainer(igId, c.id);
}

function looksVideo(url) {
  return /\.(mp4|mov|m4v)(?:[?#]|$)/i.test(url);
}

async function publishCarousel(igId, row) {
  const links = splitMedia(row.mediaLink);
  if (links.length < 2 || links.length > 10) throw new Error("CAROUSEL requires 2 to 10 Media Links, one per line");
  const children = [];
  for (const link of links) {
    const video = looksVideo(link);
    const params = {
      is_carousel_item: "true",
      ...(video
        ? { media_type: "VIDEO", video_url: signMedia(link, "video") }
        : { image_url: signMedia(link, "image") })
    };
    const c = await graph(`${igId}/media`, "POST", params);
    if (!c.id) throw new Error("Instagram did not create a carousel item");
    if (video) await waitContainer(c.id);
    children.push(c.id);
  }
  const parent = await graph(`${igId}/media`, "POST", {
    media_type: "CAROUSEL",
    children: children.join(","),
    caption: caption(row)
  });
  if (!parent.id) throw new Error("Instagram did not create a carousel container");
  await waitContainer(parent.id);
  return publishContainer(igId, parent.id);
}

async function permalink(mediaId) {
  try {
    const x = await graph(mediaId, "GET", { fields: "permalink" });
    return x.permalink || "";
  } catch {
    return "";
  }
}

async function getRows() {
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: `'${SHEET_NAME.replace(/'/g, "''")}'!A2:O500`
  });
  return (res.data.values || []).map((v, i) => ({
    rowNumber: i + 2,
    jobId: v[0] || "",
    publishDate: v[1] || "",
    publishTime: v[2] || "",
    format: String(v[3] || "").toUpperCase(),
    topic: v[4] || "",
    mediaLink: v[5] || "",
    caption: v[6] || "",
    hashtags: v[7] || "",
    status: String(v[8] || "").toUpperCase(),
    postId: v[9] || "",
    retryCount: Number(v[10] || 0),
    notes: v[11] || "",
    publishedUrl: v[12] || "",
    publishedAt: v[13] || "",
    lastError: v[14] || ""
  }));
}

async function updateCells(row, values) {
  const data = Object.entries(values).map(([col, value]) => ({
    range: `'${SHEET_NAME.replace(/'/g, "''")}'!${col}${row}`,
    values: [[value]]
  }));
  await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId: SHEET_ID,
    requestBody: { valueInputOption: "USER_ENTERED", data }
  });
}

async function processRow(row) {
  if (!row.jobId || !row.mediaLink || !row.caption) throw new Error("Job ID, Media Link and Caption are required");
  if (!["PHOTO", "REEL", "CAROUSEL"].includes(row.format)) throw new Error("Format must be PHOTO, REEL or CAROUSEL");

  await updateCells(row.rowNumber, { I: "PROCESSING", O: "" });
  const igId = await resolveIgId();
  let mediaId;
  if (row.format === "PHOTO") mediaId = await publishPhoto(igId, row);
  if (row.format === "REEL") mediaId = await publishReel(igId, row);
  if (row.format === "CAROUSEL") mediaId = await publishCarousel(igId, row);
  const url = await permalink(mediaId);
  await updateCells(row.rowNumber, {
    I: "PUBLISHED",
    J: mediaId,
    M: url,
    N: DateTime.now().setZone(TZ).toFormat("yyyy-MM-dd HH:mm:ss"),
    O: ""
  });
  console.log(`Published ${row.jobId} as ${row.format}: ${mediaId}`);
}

async function poll() {
  if (running) return;
  running = true;
  try {
    if (!ACCESS_TOKEN) {
      console.log("Instagram publisher waiting for INSTAGRAM_ACCESS_TOKEN");
      return;
    }
    const rows = await getRows();
    const ready = rows.filter(r => r.status === "READY" && isDue(r.publishDate, r.publishTime));
    for (const row of ready) {
      try {
        await processRow(row);
      } catch (e) {
        const msg = String(e?.message || e).slice(0, 1000);
        console.error(`Failed ${row.jobId || row.rowNumber}:`, msg);
        await updateCells(row.rowNumber, {
          I: "FAILED",
          K: row.retryCount + 1,
          O: msg
        }).catch(err => console.error("Could not write failure to sheet:", err.message));
      }
    }
  } catch (e) {
    console.error("Poll failure:", e);
  } finally {
    running = false;
  }
}

function requireAdmin(req, res, next) {
  if (!ADMIN_SECRET) return res.status(503).json({ error: "ADMIN_SECRET is not configured" });
  const got = req.get("x-admin-secret") || req.query.secret || "";
  if (got !== ADMIN_SECRET) return res.status(401).json({ error: "Unauthorized" });
  next();
}

app.get("/health", async (_req, res) => {
  let sheetOk = false;
  let igId = null;
  let igError = null;
  try {
    await sheets.spreadsheets.values.get({ spreadsheetId: SHEET_ID, range: `'${SHEET_NAME}'!A1:O2` });
    sheetOk = true;
  } catch {}
  if (ACCESS_TOKEN) {
    try { igId = await resolveIgId(); } catch (e) { igError = e.message; }
  }
  res.json({
    ok: sheetOk && Boolean(ACCESS_TOKEN) && Boolean(igId),
    sheet: sheetOk,
    instagramTokenConfigured: Boolean(ACCESS_TOKEN),
    instagramUserIdResolved: Boolean(igId),
    instagramError: igError,
    pollSeconds: POLL_MS / 1000,
    timezone: TZ
  });
});

app.post("/run", requireAdmin, async (_req, res) => {
  poll().catch(console.error);
  res.json({ accepted: true });
});

app.get("/media/:payload", async (req, res) => {
  try {
    const payload = req.params.payload;
    const expected = crypto.createHmac("sha256", MEDIA_SECRET).update(payload).digest("hex");
    const got = String(req.query.sig || "");
    if (!got || got.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(got), Buffer.from(expected))) {
      return res.status(403).send("Invalid media signature");
    }
    const decoded = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    if (!decoded.exp || Date.now() > decoded.exp) return res.status(410).send("Media URL expired");
    const upstream = await fetch(decoded.url, { redirect: "follow" });
    if (!upstream.ok) return res.status(502).send(`Upstream media HTTP ${upstream.status}`);
    const type = upstream.headers.get("content-type") || "";

    if (decoded.kind === "image") {
      const buf = Buffer.from(await upstream.arrayBuffer());
      if (type.includes("text/html")) return res.status(502).send("Google Drive returned an HTML page; make the media file Anyone with the link → Viewer");
      const out = await sharp(buf).jpeg({ quality: 94, mozjpeg: true }).toBuffer();
      res.set("Content-Type", "image/jpeg");
      res.set("Cache-Control", "public, max-age=1200");
      return res.send(out);
    }

    if (type) res.set("Content-Type", type);
    res.set("Cache-Control", "public, max-age=1200");
    if (!upstream.body) return res.status(502).send("Empty media response");
    const { Readable } = require("stream");
    Readable.fromWeb(upstream.body).pipe(res);
  } catch (e) {
    console.error("Media proxy error:", e);
    res.status(500).send("Media proxy error");
  }
});

app.listen(PORT, () => {
  console.log(`ClearExams Instagram Publisher listening on ${PORT}`);
  setTimeout(() => poll().catch(console.error), 3000);
  setInterval(() => poll().catch(console.error), POLL_MS);
});
