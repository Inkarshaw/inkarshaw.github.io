const crypto = require('crypto');
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const { google } = require('googleapis');

const app = express();
const PORT = process.env.PORT || 3000;
const SHEET_ID = process.env.GOOGLE_SHEET_ID;
const SHEET_NAME = process.env.GOOGLE_SHEET_NAME || 'Cases';
const DELETED_SHEET_NAME = process.env.GOOGLE_DELETED_SHEET_NAME || 'Deleted Cases';
const APP_PASSWORD = process.env.MYCASES_PASSWORD;
const SESSION_SECRET = process.env.SESSION_SECRET;
const COOKIE_NAME = 'clearexams_mycases_session';
const SESSION_MAX_AGE_MS = 12 * 60 * 60 * 1000;
const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const LOGIN_MAX_ATTEMPTS = 10;
const loginAttempts = new Map();

const ALLOWED_ORIGINS = new Set([
  'https://clearexams.ink',
  'https://www.clearexams.ink'
]);

app.disable('x-powered-by');
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));
app.use(cors({
  origin(origin, callback) {
    if (!origin || ALLOWED_ORIGINS.has(origin)) return callback(null, true);
    return callback(new Error('Origin not allowed'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type']
}));
app.use(express.json({ limit: '256kb' }));
app.use(cookieParser());
app.use('/api', (req, res, next) => {
  res.set('Cache-Control', 'no-store');
  res.set('Pragma', 'no-cache');
  next();
});

function loginRateLimit(req, res, next) {
  const key = req.ip || req.socket?.remoteAddress || 'unknown';
  const now = Date.now();
  let state = loginAttempts.get(key);
  if (!state || now >= state.resetAt) state = { count: 0, resetAt: now + LOGIN_WINDOW_MS };
  state.count += 1;
  loginAttempts.set(key, state);
  if (state.count > LOGIN_MAX_ATTEMPTS) {
    res.set('Retry-After', String(Math.ceil((state.resetAt - now) / 1000)));
    return res.status(429).json({ error: 'Too many login attempts. Try again later.' });
  }
  next();
}

function timingSafeEqualText(a, b) {
  const aa = Buffer.from(String(a || ''));
  const bb = Buffer.from(String(b || ''));
  return aa.length === bb.length && crypto.timingSafeEqual(aa, bb);
}

function signSession(payload) {
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const sig = crypto.createHmac('sha256', SESSION_SECRET).update(body).digest('base64url');
  return body + '.' + sig;
}

function verifySession(token) {
  if (!token || !SESSION_SECRET) return false;
  const parts = String(token).split('.');
  if (parts.length !== 2) return false;
  const [body, sig] = parts;
  const expected = crypto.createHmac('sha256', SESSION_SECRET).update(body).digest('base64url');
  if (!timingSafeEqualText(sig, expected)) return false;

  try {
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
    return payload.exp && Date.now() < payload.exp;
  } catch {
    return false;
  }
}

function requireAuth(req, res, next) {
  if (verifySession(req.cookies[COOKIE_NAME])) return next();
  return res.status(401).json({ error: 'Authentication required' });
}

function parseServiceAccount() {
  if (!process.env.GOOGLE_SERVICE_ACCOUNT_JSON) {
    throw new Error('GOOGLE_SERVICE_ACCOUNT_JSON is not configured');
  }
  let creds;
  try {
    creds = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
  } catch {
    throw new Error('GOOGLE_SERVICE_ACCOUNT_JSON is invalid JSON');
  }
  if (creds.private_key) creds.private_key = creds.private_key.replace(/\\n/g, '\n');
  return creds;
}

async function sheetsClient() {
  if (!SHEET_ID) throw new Error('GOOGLE_SHEET_ID is not configured');
  const auth = new google.auth.GoogleAuth({
    credentials: parseServiceAccount(),
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
  return google.sheets({ version: 'v4', auth });
}

const HEADERS = [
  'Case ID','Police Station / Unit','Case Type','Crime / CSR / UDR No.','Year',
  'Sections / Offences','Complainant','Accused / Suspect','Investigating Officer',
  'Priority','Court','Court Case No.','Stage','Next Hearing / Action Date',
  'Next Action','Notes','Created At','Updated At','Accused JSON','Investigation JSON','Tasks JSON','Court Hearings JSON','Timeline JSON','Attachments JSON'
];

const DELETED_HEADERS = [...HEADERS, 'Deleted At'];

const FIELDS = [
  'id','policeStation','caseType','crimeNo','crimeYear',
  'sections','complainant','accused','ioName','priority','court',
  'courtCaseNo','stage','nextHearing','nextAction','notes','createdAt','updatedAt','accusedPersons','investigationChecklist','tasks','hearings','timeline','attachments'
];

const JSON_FIELDS = new Set(['accusedPersons','investigationChecklist','tasks','hearings','timeline','attachments']);
function caseToRow(item) {
  return FIELDS.map(key => {
    if (item[key] == null) return '';
    return JSON_FIELDS.has(key) ? JSON.stringify(item[key]) : String(item[key]);
  });
}

function rowToCase(row) {
  const item = {};
  FIELDS.forEach((key, i) => { const v=row[i]||''; if(JSON_FIELDS.has(key)){try{item[key]=v?JSON.parse(v):[]}catch{item[key]=[]}}else item[key]=v; });
  return item;
}

function columnName(n) {
  let out = '';
  while (n > 0) {
    n -= 1;
    out = String.fromCharCode(65 + (n % 26)) + out;
    n = Math.floor(n / 26);
  }
  return out;
}

function a1SheetName(name) {
  return "'" + String(name).replace(/'/g, "''") + "'";
}

async function ensureSheet(sheets, sheetName, headers) {
  const metadata = await sheets.spreadsheets.get({ spreadsheetId: SHEET_ID });
  let sheet = metadata.data.sheets.find(s => s.properties.title === sheetName);
  if (!sheet) {
    const created = await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SHEET_ID,
      requestBody: { requests: [{ addSheet: { properties: { title: sheetName } } }] }
    });
    sheet = { properties: created.data.replies[0].addSheet.properties };
  }
  await sheets.spreadsheets.values.update({
    spreadsheetId: SHEET_ID,
    range: `${a1SheetName(sheetName)}!A1:${columnName(headers.length)}1`,
    valueInputOption: 'RAW',
    requestBody: { values: [headers] }
  });
  return sheet.properties.sheetId;
}

async function readDeletedCases() {
  const sheets = await sheetsClient();
  await ensureSheet(sheets, DELETED_SHEET_NAME, DELETED_HEADERS);
  const result = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: `${a1SheetName(DELETED_SHEET_NAME)}!A2:Y`
  });
  return (result.data.values || [])
    .filter(row => row.some(v => String(v || '').trim()))
    .map(row => ({ ...rowToCase(row.slice(0, FIELDS.length)), deletedAt: row[FIELDS.length] || '' }));
}

async function findDeletedCaseRow(id) {
  const cases = await readDeletedCases();
  const index = cases.findIndex(item => item.id === id);
  return { cases, index, rowNumber: index >= 0 ? index + 2 : null };
}

async function deleteSheetRow(sheetName, rowNumber) {
  const sheets = await sheetsClient();
  const metadata = await sheets.spreadsheets.get({ spreadsheetId: SHEET_ID });
  const sheet = metadata.data.sheets.find(s => s.properties.title === sheetName);
  if (!sheet) throw new Error(sheetName + ' sheet not found');
  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: SHEET_ID,
    requestBody: {
      requests: [{
        deleteDimension: {
          range: {
            sheetId: sheet.properties.sheetId,
            dimension: 'ROWS',
            startIndex: rowNumber - 1,
            endIndex: rowNumber
          }
        }
      }]
    }
  });
}

function cleanCase(input, existing = null) {
  const now = new Date().toISOString();
  const safe = {};
  FIELDS.forEach(key => {
    if (key === 'createdAt' || key === 'updatedAt') return;
    safe[key] = JSON_FIELDS.has(key) ? (Array.isArray(input?.[key]) ? input[key] : []) : (input && input[key] != null ? String(input[key]).trim() : '');
  });
  safe.id = safe.id || existing?.id || ('case_' + crypto.randomUUID());
  safe.createdAt = existing?.createdAt || input?.createdAt || now;
  safe.updatedAt = now;
  return safe;
}

async function readAllCases() {
  const sheets = await sheetsClient();
  const result = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: `${SHEET_NAME}!A2:X`
  });
  return (result.data.values || []).filter(row => row.some(v => String(v || '').trim())).map(rowToCase);
}

async function findCaseRow(id) {
  const cases = await readAllCases();
  const index = cases.findIndex(item => item.id === id);
  return { cases, index, rowNumber: index >= 0 ? index + 2 : null };
}

app.get('/health', (req, res) => {
  res.json({
    ok: true,
    service: 'clearexams-mycases-api',
    sheetConfigured: Boolean(SHEET_ID),
    googleCredentialConfigured: Boolean(process.env.GOOGLE_SERVICE_ACCOUNT_JSON)
  });
});

app.post('/api/login', loginRateLimit, (req, res) => {
  if (!APP_PASSWORD || !SESSION_SECRET) {
    return res.status(503).json({ error: 'Authentication is not configured' });
  }
  if (!timingSafeEqualText(req.body?.password, APP_PASSWORD)) {
    return res.status(401).json({ error: 'Invalid password' });
  }

  const key = req.ip || req.socket?.remoteAddress || 'unknown';
  loginAttempts.delete(key);
  const token = signSession({ exp: Date.now() + SESSION_MAX_AGE_MS });
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    maxAge: SESSION_MAX_AGE_MS,
    path: '/'
  });
  res.json({ ok: true });
});

app.post('/api/logout', (req, res) => {
  res.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    path: '/'
  });
  res.json({ ok: true });
});

app.get('/api/session', (req, res) => {
  res.json({ authenticated: verifySession(req.cookies[COOKIE_NAME]) });
});

app.get('/api/cases', requireAuth, async (req, res, next) => {
  try {
    res.json({ cases: await readAllCases() });
  } catch (error) {
    next(error);
  }
});

app.post('/api/cases', requireAuth, async (req, res, next) => {
  try {
    const item = cleanCase(req.body || {});
    const sheets = await sheetsClient();
    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: `${SHEET_NAME}!A:X`,
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      requestBody: { values: [caseToRow(item)] }
    });
    res.status(201).json({ case: item });
  } catch (error) {
    next(error);
  }
});

app.put('/api/cases/:id', requireAuth, async (req, res, next) => {
  try {
    const { cases, index, rowNumber } = await findCaseRow(req.params.id);
    if (index < 0) return res.status(404).json({ error: 'Case not found' });

    const item = cleanCase({ ...req.body, id: req.params.id }, cases[index]);
    const sheets = await sheetsClient();
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: `${SHEET_NAME}!A${rowNumber}:X${rowNumber}`,
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: [caseToRow(item)] }
    });
    res.json({ case: item });
  } catch (error) {
    next(error);
  }
});

app.delete('/api/cases/:id', requireAuth, async (req, res, next) => {
  try {
    const { cases, index, rowNumber } = await findCaseRow(req.params.id);
    if (index < 0) return res.status(404).json({ error: 'Case not found' });

    const item = cases[index];
    const deletedAt = new Date().toISOString();
    const sheets = await sheetsClient();
    await ensureSheet(sheets, DELETED_SHEET_NAME, DELETED_HEADERS);
    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: `${a1SheetName(DELETED_SHEET_NAME)}!A:Y`,
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      requestBody: { values: [[...caseToRow(item), deletedAt]] }
    });
    await deleteSheetRow(SHEET_NAME, rowNumber);

    res.json({ ok: true, deletedAt });
  } catch (error) {
    next(error);
  }
});

app.get('/api/deleted-cases', requireAuth, async (req, res, next) => {
  try {
    res.json({ cases: await readDeletedCases() });
  } catch (error) {
    next(error);
  }
});

app.post('/api/deleted-cases/:id/restore', requireAuth, async (req, res, next) => {
  try {
    const { cases, index, rowNumber } = await findDeletedCaseRow(req.params.id);
    if (index < 0) return res.status(404).json({ error: 'Deleted case not found' });

    const restored = cleanCase(cases[index], cases[index]);
    const sheets = await sheetsClient();
    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: `${a1SheetName(SHEET_NAME)}!A:X`,
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      requestBody: { values: [caseToRow(restored)] }
    });
    await deleteSheetRow(DELETED_SHEET_NAME, rowNumber);

    res.json({ ok: true, case: restored });
  } catch (error) {
    next(error);
  }
});

app.delete('/api/deleted-cases/:id', requireAuth, async (req, res, next) => {
  try {
    const { index, rowNumber } = await findDeletedCaseRow(req.params.id);
    if (index < 0) return res.status(404).json({ error: 'Deleted case not found' });
    await deleteSheetRow(DELETED_SHEET_NAME, rowNumber);
    res.json({ ok: true });
  } catch (error) {
    next(error);
  }
});

app.use((error, req, res, next) => {
  console.error(error);
  const message = process.env.NODE_ENV === 'production'
    ? 'Server error'
    : error.message;
  res.status(500).json({ error: message });
});

app.listen(PORT, () => {
  console.log(`My Cases API listening on port ${PORT}`);
});
