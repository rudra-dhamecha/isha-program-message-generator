const REDIRECT_STATUSES = new Set([301, 302, 303, 307, 308]);

const FETCH_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36',
  Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
};

const API_HEADERS = {
  'sec-ch-ua-platform': '"Linux"',
  Referer: 'https://isha.sadhguru.org/',
  'User-Agent': FETCH_HEADERS['User-Agent'],
  Accept: 'application/json, text/plain, */*',
  'sec-ch-ua':
    '"Chromium";v="148", "Brave";v="148", "Not/A)Brand";v="99"',
  'sec-ch-ua-mobile': '?0',
};

const SCHEDULE_API =
  'https://api.ishafoundation.org/scheduleApi/api.php';

/** @typedef {'ie4' | 'ie7' | 'guru_pooja'} ProgramKind */

export const PROGRAM_TYPES = [
  {
    id: 'ie4',
    label: 'Inner Engineering 4 Days',
    preview: `✨ *Inner Engineering Program ({language}) in {city} from {dateIe4}*

🪷 Designed by Sadhguru, Inner Engineering is a transformative program featuring simple yogic practices, guided sessions, meditative processes and the powerful 21-minute Shambhavi Mahamudra kriya

The program can establish a foundation of health, exuberance and a chemistry of blissfulness within, leading to a joyful, fulfilling life. 😃

🍃What is Inner Engineering?
Know more: https://youtu.be/L9-WwLCy8XY

For more information and registration, click here:
{shortLink}

📞For queries, contact: {phone1} / {phone2}

In Love, Light and Laughter 🌸
Isha Volunteers`,
  },
  {
    id: 'ie7',
    label: 'Inner Engineering 7 Days',
    preview: `🪔🪷🪔🪷🪔🪷🪔🪷

*📯 7-day Inner Engineering program ({language}) in {city}*

🌸 Inner Engineering is a 7-day course that provides tools and solutions to help manage stress, overcome anxiety and live joyful life.

🌸 Watch Sadhguru's video, where he talks about Inner Engineering: https://youtu.be/S2uINxm_wbc?feature=shared

*Upcoming Program: {dateIe7}*

🌸 Click here to register:
{shortLink}

Pranam
Isha Volunteers`,
  },
  {
    id: 'guru_pooja',
    label: 'Guru Pooja',
    preview: `🪔 🌸 🪔 🌸 🪔 🌸

*Guru Pooja is a device to invite a dimension that dispels your darkness. - Sadhguru*

In this video, Sadhguru explains how Guru Pooja is a kind of device to make yourself into a possibility where you invite a dimension to dispel darkness.
https://youtu.be/obQjvnG00SA

🔹 *Details of the Gurupooja program in {city}*

🗓️ *{dateGp}*
🕰️ *{timing}*
🏫 {venue}
📞 {phone1} / {phone2}
*Click here to register*
🔗 {shortLink}

🔹Completion of Inner Engineering program (including Shambhavi Mahamudra Kriya) is a prerequisite.
🔹 Attendance is mandatory for all days.
🔹If you wish to *Volunteer* for this program, please fill the following form: https://forms.gle/TKM6oK7JCoimMebCA

Pranam 🙏`,
  },
];

export function assertShortLinkOnly(raw) {
  let u;
  try {
    u = new URL(raw.trim());
  } catch {
    throw new Error(
      'Invalid URL. Pass a full short link, e.g. https://isha.co/IE-Hadapsar'
    );
  }

  const host = u.hostname.toLowerCase();
  const isIshaShort =
    host === 'isha.co' || host.endsWith('.isha.co');

  if (!isIshaShort) {
    throw new Error(
      'Only Isha short links are accepted (hostname must be isha.co).'
    );
  }

  if (u.pathname.includes('program-details')) {
    throw new Error(
      'Pass the short link only, not a program-details page URL.'
    );
  }
}

export async function getProgramIdFromShortLinkRedirect(shortLink) {
  const res = await fetch(shortLink.trim(), {
    redirect: 'manual',
    headers: FETCH_HEADERS,
  });

  if (!REDIRECT_STATUSES.has(res.status)) {
    throw new Error(
      `Expected HTTP redirect from short link, got ${res.status}.`
    );
  }

  const location = res.headers.get('Location');
  if (!location) {
    throw new Error('Redirect response has no Location header.');
  }

  const target = new URL(location, shortLink);
  const id = target.searchParams.get('id');
  if (!id) {
    throw new Error(`No program id in redirect Location: ${target.href}`);
  }

  res.body?.cancel?.();

  return id;
}

export async function fetchProgramDetails(programId) {
  const qs = new URLSearchParams({
    option: 'com_program',
    v: '2',
    format: 'json',
    task: 'details',
    program_id: programId,
  });

  const res = await fetch(`${SCHEDULE_API}?${qs}`, { headers: API_HEADERS });

  if (!res.ok) {
    throw new Error(`Program API HTTP ${res.status}`);
  }

  const data = await res.json();
  if (!Array.isArray(data) || !data[0]) {
    throw new Error('Program API returned no program for this id.');
  }

  return data[0];
}

export async function fetchProgramFromShortLink(shortLink) {
  assertShortLinkOnly(shortLink);
  const programId = await getProgramIdFromShortLinkRedirect(shortLink);
  const program = await fetchProgramDetails(programId);
  return normalizeProgram(program);
}

function formatAddress(address) {
  if (!address || typeof address !== 'string') return null;
  return address.replace(/\n+/g, ' ').replace(/\s+/g, ' ').trim();
}

export function parseContactPhones(raw) {
  if (!raw || typeof raw !== 'string') return null;
  const parts = raw
    .split(/\s*\/\s*/)
    .map((s) => s.trim())
    .filter(Boolean);
  return parts.length ? parts : null;
}

function capitalizeWord(s) {
  if (!s || typeof s !== 'string') return null;
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}

/** IE 4 body text: "28 to 31 May" (year stripped, first dash → "to") */
export function formatDateIe4(rawDate) {
  if (!rawDate) return '____';
  return rawDate
    .replace('-', 'to')
    .replace(/\d{4}/, '')
    .trim();
}

/** IE 7 banner line: "22-28 April" */
export function formatDateIe7(rawDate) {
  if (!rawDate) return '____';
  return rawDate.replace(/\s*\d{4}\s*$/, '').replace(/\s+/g, ' ').trim();
}

/** Guru Pooja date line: "15 - 17 May" */
export function formatDateGp(rawDate) {
  if (!rawDate) return '____';
  return rawDate.replace(/\s*\d{4}\s*$/, '').replace(/\s+/g, ' ').trim();
}

function extractTiming(program) {
  const o = program.override_session_timings;
  if (typeof o === 'string' && o.trim()) return o.trim();

  const text = (program.details || '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const m = text.match(
    /\d{1,2}(?::\d{2})?\s*(?:am|pm)\b[^.]{0,60}?(?:to|-|–)\s*\d{1,2}(?::\d{2})?\s*(?:am|pm)/i
  );
  if (m) return m[0].replace(/\s+/g, ' ').trim();

  return '____';
}

export function normalizeProgram(program) {
  const phones = parseContactPhones(program.contacts?.[0]?.contact_phone);
  return {
    phones,
    dateRaw: program.date ?? null,
    location: formatAddress(program.address),
    city: program.city ?? null,
    language: capitalizeWord(program.language),
    title: program.title ?? null,
    timing: extractTiming(program),
    venue: formatAddress(program.address),
  };
}

/** @param {ProgramKind} kind */
function buildPlaceholders(normalized, shortLink) {
  const p1 = normalized.phones?.[0] ?? '____';
  const p2 = normalized.phones?.[1] ?? '____';
  const city = normalized.city ?? '____';
  const lang = normalized.language ?? '____';

  return {
    language: lang,
    city,
    dateIe4: formatDateIe4(normalized.dateRaw),
    dateIe7: formatDateIe7(normalized.dateRaw),
    dateGp: formatDateGp(normalized.dateRaw),
    timing: normalized.timing ?? '____',
    venue: normalized.venue ?? '____',
    phone1: p1,
    phone2: p2,
    shortLink: shortLink.trim(),
  };
}

function fillTemplate(template, placeholders) {
  return template.replace(/\{(\w+)\}/g, (_, key) =>
    placeholders[key] != null ? String(placeholders[key]) : `{${key}}`
  );
}

/** @param {ProgramKind} kind */
export function renderMessage(kind, normalized, shortLink) {
  const meta = PROGRAM_TYPES.find((t) => t.id === kind);
  if (!meta) throw new Error(`Unknown program type: ${kind}`);

  const ph = buildPlaceholders(normalized, shortLink);
  return fillTemplate(meta.preview, ph);
}

export function getTemplatePreview(kind) {
  const meta = PROGRAM_TYPES.find((t) => t.id === kind);
  return meta?.preview ?? '';
}
