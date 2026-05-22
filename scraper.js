import clipboard from 'clipboardy';
import {
  fetchProgramFromShortLink,
  renderMessage,
} from './lib/program-service.js';

(async () => {
  const shortLink = process.argv[2]?.trim();
  if (!shortLink) {
    console.error('Usage: node scraper.js <isha-short-link>');
    process.exit(1);
  }

  const normalized = await fetchProgramFromShortLink(shortLink);

  const result = {
    phones: normalized.phones,
    date: normalized.dateRaw,
    location: normalized.location,
    city: normalized.city,
    language: normalized.language,
  };

  console.log(result);

  const message = renderMessage('ie4', normalized, shortLink);

  await clipboard.write(message);

  console.log('\n===== FINAL MESSAGE =====\n');
  console.log(message);

  console.log('\n✅ Message copied to clipboard!');
})().catch((err) => {
  console.error(err.message || String(err));
  process.exit(1);
});
