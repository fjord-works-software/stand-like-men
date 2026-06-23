import { writeFileSync, mkdirSync, existsSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = join(__dirname, '../src/content/episodes');

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// The Podbean feed delivers XML-escaped text (e.g. "&amp;", "&#39;").
// Decode named and numeric HTML entities so content files store clean text.
function decodeEntities(str) {
  const named = {
    amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ',
    ldquo: '“', rdquo: '”', lsquo: '‘', rsquo: '’',
    hellip: '…', mdash: '—', ndash: '–',
  };
  return str
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(parseInt(dec, 10)))
    .replace(/&([a-zA-Z]+);/g, (m, name) => (name in named ? named[name] : m));
}

function extractTag(xml, tag) {
  const t = escapeRegex(tag);
  const re = new RegExp(`<${t}[^>]*>([\\s\\S]*?)<\\/${t}>`, 'i');
  const m = xml.match(re);
  if (!m) return '';
  const raw = m[1].trim().replace(/^<!\[CDATA\[/, '').replace(/\]\]>$/, '').trim();
  return decodeEntities(raw);
}

function extractAttr(xml, tag, attr) {
  const re = new RegExp(`<${escapeRegex(tag)}[^>]*${escapeRegex(attr)}="([^"]*)"`, 'i');
  const m = xml.match(re);
  return m ? m[1] : '';
}

function parseDuration(raw) {
  if (!raw) return '0:00';
  // Already MM:SS or HH:MM:SS
  if (raw.includes(':')) {
    const parts = raw.split(':').map(Number);
    if (parts.length === 3) {
      const [h, m, s] = parts;
      const totalMins = h * 60 + m;
      return `${totalMins}:${String(s).padStart(2, '0')}`;
    }
    return raw; // already MM:SS
  }
  // Seconds as integer
  const secs = parseInt(raw, 10);
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

function toSlug(title) {
  return title
    .toLowerCase()
    .replace(/['']/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function formatDate(rfc822) {
  const d = new Date(rfc822);
  return d.toISOString().split('T')[0];
}

function stripPodbeanPrefix(title) {
  return title.replace(/^(?:S\d+\s*)?[Ee][Pp]?\s*\d+\s*(?:S\d+\s*)?[-–]?\s*/, '').trim();
}

function escapeFrontmatter(str) {
  return str.replace(/"/g, '\\"');
}

const res = await fetch('https://feed.podbean.com/loganek/feed.xml');
const xml = await res.text();

const items = xml.split('<item>').slice(1).map(s => s.split('</item>')[0]);

console.log(`Found ${items.length} episodes`);

mkdirSync(OUTPUT_DIR, { recursive: true });

for (const item of items) {
  const title = stripPodbeanPrefix(extractTag(item, 'title'));
  const pubDate = extractTag(item, 'pubDate');
  const audioUrl = extractAttr(item, 'enclosure', 'url');
  const duration = parseDuration(extractTag(item, 'itunes:duration'));
  const epNum = parseInt(extractTag(item, 'itunes:episode'), 10);
  const description = extractTag(item, 'itunes:summary') || extractTag(item, 'description');

  if (!epNum) {
    console.warn(`Skipping "${title}" — no episode number found`);
    continue;
  }

  const epNumPadded = String(epNum).padStart(3, '0');
  const slug = toSlug(title);
  const filename = `ep${epNumPadded}-${slug}.md`;
  const date = formatDate(pubDate);

  const frontmatter = `---
title: "${escapeFrontmatter(title)}"
episodeNumber: ${epNum}
publishDate: ${date}
duration: "${duration}"
audioUrl: "${audioUrl}"
description: "${escapeFrontmatter(description.replace(/\n/g, ' ').slice(0, 300))}"
---
${description}
`;

  const outPath = join(OUTPUT_DIR, filename);
  const existing = readdirSync(OUTPUT_DIR).find(f => f.startsWith(`ep${epNumPadded}-`));
  if (existing) {
    console.log(`  skipped ep${epNumPadded} (already exists as ${existing})`);
    continue;
  }
  writeFileSync(outPath, frontmatter);
  console.log(`  wrote ${filename}`);
}

console.log('Done.');
