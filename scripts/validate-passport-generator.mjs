import fs from 'node:fs';

const root = process.cwd();
const htmlPath = root + '/policepassportgenerator/index.html';
const jsPath = root + '/policepassportgenerator/passport-generator.js';
const launcherPath = root + '/policedocuments/police_passport.html';

const html = fs.readFileSync(htmlPath, 'utf8');
const js = fs.readFileSync(jsPath, 'utf8');
const launcher = fs.readFileSync(launcherPath, 'utf8');

const errors = [];

function allMatches(text, regex, pick = m => m[1]) {
  return [...text.matchAll(regex)].map(pick);
}

const ids = allMatches(html, /\bid="([^"]+)"/g);
const idCounts = new Map();
for (const id of ids) idCounts.set(id, (idCounts.get(id) || 0) + 1);
for (const [id, count] of idCounts) {
  if (count > 1) errors.push(`Duplicate id in index.html: ${id} (${count} times)`);
}

const labelTargets = allMatches(html, /<label[^>]*\bfor="([^"]+)"[^>]*>/g);
for (const target of new Set(labelTargets)) {
  if (!idCounts.has(target)) errors.push(`Label points to missing field: ${target}`);
}

const requiredTargets = allMatches(
  html,
  /<label[^>]*(?:class="[^"]*\brequired\b[^"]*"[^>]*for="([^"]+)"|for="([^"]+)"[^>]*class="[^"]*\brequired\b[^"]*")[^>]*>/g,
  m => m[1] || m[2]
);
for (const target of new Set(requiredTargets)) {
  if (!idCounts.has(`${target}-error`)) {
    errors.push(`Required field has no inline error element: ${target}`);
  }
}

if (!html.includes('href="./passport-generator.css"')) {
  errors.push('Main generator is missing passport-generator.css link');
}
if (!html.includes('src="./passport-generator.js"')) {
  errors.push('Main generator is missing passport-generator.js link');
}
if (/<style>[\s\S]*<\/style>/.test(html)) {
  errors.push('Main generator contains an inline <style> block');
}

const inlineScripts = [...html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>/g)];
if (inlineScripts.length) {
  errors.push(`Main generator contains ${inlineScripts.length} inline script block(s)`);
}

const configMatch = js.match(/const passportConfig = \{([\s\S]*?)\n\s*\};/);
if (!configMatch) {
  errors.push('passportConfig was not found in passport-generator.js');
} else {
  const configKeys = new Set(
    allMatches(configMatch[1], /^\s*'([^']+)'\s*:\s*\{/gm)
  );

  const launcherTypes = allMatches(
    launcher,
    /href="\/policepassportgenerator\/\?type=([^"]+)"/g,
    m => decodeURIComponent(m[1])
  );

  for (const type of launcherTypes) {
    if (!configKeys.has(type)) {
      errors.push(`Launcher route uses unknown passport type: ${type}`);
    }
  }

  if (launcherTypes.length !== 10) {
    errors.push(`Expected 10 unified launcher routes, found ${launcherTypes.length}`);
  }
}

const legacyLauncherLinks = allMatches(launcher, /href="([^"]+)"/g)
  .filter(href => /(?:escort_passport|sick_passport|pt_warrant|ml_passport|property_to_lab|fir_filing|visera_report|formal_arrest|transfer-passport|lab-report)\.html/.test(href));

if (legacyLauncherLinks.length) {
  errors.push('Launcher still contains legacy passport page links: ' + legacyLauncherLinks.join(', '));
}

if (html.includes('RC.No.Estt/EZ/2389/82/2023 EZO.No.485/2023')) {
  errors.push('Stale 2023 transfer order number is still hardcoded in the form');
}
if (html.includes('value="13/06/2023"')) {
  errors.push('Stale 2023 transfer order date is still hardcoded in the form');
}

if (!html.includes('<option value="Relieving Passport" disabled>')) {
  errors.push('Relieving Passport must remain disabled until approved wording is added');
}

if (errors.length) {
  console.error('Police Passport Generator validation failed:');
  for (const error of errors) console.error(' - ' + error);
  process.exit(1);
}

console.log('Police Passport Generator validation passed.');
console.log(`Checked ${ids.length} IDs, ${requiredTargets.length} required labels, and unified launcher routes.`);
