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

/** @typedef {'ie4' | 'ie7' | 'ie7_first' | 'guru_pooja'} ProgramKind */

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
    id: 'ie7_first',
    label: 'Inner Engineering 7 Days First Message',
    preview: `🌻🌼🌻🌼🌻🌼🌻🌼🌻🌼🌻
*7-day Inner Engineering program in {city} ({language})*

✨ We are excited to inform you that the 7-day in-person Inner Engineering program in {language} is happening in *{city}*.

*🗓  {dateIe7First}*

*⏰ Session timings*

 🌿 Wednesday to Saturday; Monday and Tuesday.
*🕘  6:00 to 9:00 am*
          Or
        *6:30 to 9:30 pm*

 🌿 {sundayDate}
*🕘 7:00 am to 5:00 pm*

*🏡 Venue* {venue}

*Click here to register*
{shortLink}

*📞 For queries, please contact*
{phone1} / {phone2}

Pranam 🙏
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
🔹If you wish to *Volunteer* for this program, please fill the following form: [link to volunteer form]

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

const MONTH_INDEX = {
  january: 0,
  jan: 0,
  february: 1,
  feb: 1,
  march: 2,
  mar: 2,
  april: 3,
  apr: 3,
  may: 4,
  june: 5,
  jun: 5,
  july: 6,
  jul: 6,
  august: 7,
  aug: 7,
  september: 8,
  sep: 8,
  sept: 8,
  october: 9,
  oct: 9,
  november: 10,
  nov: 10,
  december: 11,
  dec: 11,
};

const MONTH_SHORT = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

const MONTH_FULL = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

function monthIndex(name) {
  if (!name) return null;
  return MONTH_INDEX[name.toLowerCase()] ?? null;
}

/** @returns {{ start: Date, end: Date } | null} */
export function parseProgramDateRange(rawDate) {
  if (!rawDate || typeof rawDate !== 'string') return null;

  const normalized = rawDate.replace(/\s+/g, ' ').trim();

  let m = normalized.match(
    /^(\d{1,2})\s+(\w+)\s*[-–]\s*(\d{1,2})\s+(\w+)\s+(\d{4})$/i
  );
  if (m) {
    const startMonth = monthIndex(m[2]);
    const endMonth = monthIndex(m[4]);
    const year = Number(m[5]);
    if (startMonth == null || endMonth == null) return null;
    const start = new Date(year, startMonth, Number(m[1]));
    const end = new Date(year, endMonth, Number(m[3]));
    if (start > end) return null;
    return { start, end };
  }

  m = normalized.match(/^(\d{1,2})\s*[-–]\s*(\d{1,2})\s+(\w+)\s+(\d{4})$/i);
  if (m) {
    const month = monthIndex(m[3]);
    const year = Number(m[4]);
    if (month == null) return null;
    const start = new Date(year, month, Number(m[1]));
    const end = new Date(year, month, Number(m[2]));
    if (start > end) return null;
    return { start, end };
  }

  return null;
}

/** IE 7 first message banner: "16-22 Oct 2024" */
export function formatDateIe7First(rawDate) {
  const range = parseProgramDateRange(rawDate);
  if (!range) return '____';

  const { start, end } = range;
  const year = start.getFullYear();
  const startDay = start.getDate();
  const endDay = end.getDate();
  const startMonth = start.getMonth();
  const endMonth = end.getMonth();

  if (startMonth === endMonth) {
    return `${startDay}-${endDay} ${MONTH_SHORT[startMonth]} ${year}`;
  }

  return `${startDay} ${MONTH_SHORT[startMonth]} - ${endDay} ${MONTH_SHORT[endMonth]} ${year}`;
}

/** IE 7 first message Sunday line: "Sunday, 20 October" */
export function formatSundayDate(rawDate) {
  const range = parseProgramDateRange(rawDate);
  if (!range) return 'Sunday, ____';

  const cursor = new Date(range.start);
  while (cursor <= range.end) {
    if (cursor.getDay() === 0) {
      const day = cursor.getDate();
      const month = MONTH_FULL[cursor.getMonth()];
      return `Sunday, ${day} ${month}`;
    }
    cursor.setDate(cursor.getDate() + 1);
  }

  return 'Sunday, ____';
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
    dateIe7First: formatDateIe7First(normalized.dateRaw),
    sundayDate: formatSundayDate(normalized.dateRaw),
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
