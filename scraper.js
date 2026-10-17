import clipboard from 'clipboardy';
import {
  PROGRAM_TYPES,
  extractShortLink,
  fetchProgramFromShortLink,
  detectProgramType,
  renderMessage,
} from './lib/program-service.js';

(async () => {
  const allArgs = process.argv.slice(2).join(' ').trim();
  if (!allArgs) {
    console.error(
      'Usage: node scraper.js <isha-short-link-or-whatsapp-message> [program-type]'
    );
    process.exit(1);
  }

  // Check if a specific program type was passed as one of the arguments
  const knownTypeIds = new Set(PROGRAM_TYPES.map((t) => t.id));
  let explicitType = null;
  for (const arg of process.argv.slice(2)) {
    const cleanArg = arg.toLowerCase().trim();
    if (knownTypeIds.has(cleanArg)) {
      explicitType = cleanArg;
      break;
    }
  }

  const shortLink = extractShortLink(allArgs) || allArgs.trim();

  const normalized = await fetchProgramFromShortLink(shortLink);

  const selectedType =
    explicitType || detectProgramType(normalized, shortLink, allArgs);

  const result = {
    programType: selectedType,
    title: normalized.title,
    city: normalized.city,
    center: normalized.center,
    language: normalized.language,
    date: normalized.dateRaw,
    venue: normalized.venue,
    phones: normalized.phones,
    timing: normalized.timing,
  };

  console.log('Extracted Details:');
  console.log(result);

  const message = renderMessage(selectedType, normalized, shortLink);

  try {
    await clipboard.write(message);
    console.log('\n===== FINAL MESSAGE =====\n');
    console.log(message);
    console.log('\n✅ Message copied to clipboard!');
  } catch (_clipErr) {
    console.log('\n===== FINAL MESSAGE =====\n');
    console.log(message);
    console.log(
      '\n(Note: Could not access system clipboard, but message was generated successfully above.)'
    );
  }
})().catch((err) => {
  console.error(err.message || String(err));
  process.exit(1);
});
