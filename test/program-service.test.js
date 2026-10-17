import test from 'node:test';
import assert from 'node:assert/strict';
import {
  formatAddress,
  extractShortLink,
  normalizeShortLinkUrl,
  detectProgramType,
  renderMessage,
  normalizeProgram,
} from '../lib/program-service.js';

test('formatAddress - adds end punctuation after first place name and strips pin code', () => {
  const raw = 'Shivalik Greens\n10, Shivalik Greens, Ambli, Bopal Ambli Road,\nAhmedabad- 380058';
  const formatted = formatAddress(raw);
  assert.equal(
    formatted,
    'Shivalik Greens, 10, Shivalik Greens, Ambli, Bopal Ambli Road, Ahmedabad'
  );
});

test('formatAddress - handles missing intermediate punctuation and Indian pin code', () => {
  const raw = 'Motivational Hall\nGate no 1, Opposite Gulshan Ground Near Panama Chowk\nJammu- 180012';
  const formatted = formatAddress(raw);
  assert.equal(
    formatted,
    'Motivational Hall, Gate no 1, Opposite Gulshan Ground Near Panama Chowk, Jammu'
  );
});

test('formatAddress - preserves lines that already have commas and strips pin', () => {
  const raw = 'Papa Pagli Kala Kendra Stree Sanstha,\n101 1st Floor, Matunga C.R.,\nMumbai- 400019';
  const formatted = formatAddress(raw);
  assert.equal(
    formatted,
    'Papa Pagli Kala Kendra Stree Sanstha, 101 1st Floor, Matunga C.R., Mumbai'
  );
});

test('formatAddress - handles US zip code', () => {
  const raw = 'Isha Los Angeles, 7045 Farralone Avenue\nCanoga Park, CA 91303';
  const formatted = formatAddress(raw);
  assert.equal(
    formatted,
    'Isha Los Angeles, 7045 Farralone Avenue, Canoga Park, CA'
  );
});

test('formatAddress - handles PIN code prefix with colon or hyphen', () => {
  const raw = 'Sadhguru Sannidhi\nPalayapalayam\nErode, Tamil Nadu. PIN: 638009';
  const formatted = formatAddress(raw);
  assert.equal(
    formatted,
    'Sadhguru Sannidhi, Palayapalayam, Erode, Tamil Nadu'
  );
});

test('extractShortLink - extracts isha.co short links from raw URLs and WhatsApp text', () => {
  const rawMsg = '[14/10, 3:13 pm] Archana Content Team Isha: https://Isha.co/GuruPooja-Satellite';
  assert.equal(
    extractShortLink(rawMsg),
    'https://Isha.co/GuruPooja-Satellite'
  );

  const directUrl = 'https://isha.co/IE-Hadapsar';
  assert.equal(extractShortLink(directUrl), 'https://isha.co/IE-Hadapsar');

  const withoutProtocol = 'isha.co/GuruPooja-Mulund';
  assert.equal(
    extractShortLink(withoutProtocol),
    'https://isha.co/GuruPooja-Mulund'
  );
});

test('normalizeShortLinkUrl - cleans and normalizes links', () => {
  const rawMsg = '[14/10, 3:13 pm] Archana: https://Isha.co/GuruPooja-Satellite/';
  assert.equal(
    normalizeShortLinkUrl(rawMsg),
    'https://Isha.co/GuruPooja-Satellite'
  );
});

test('detectProgramType - detects types correctly', () => {
  assert.equal(
    detectProgramType({ title: 'Guru Pooja' }, 'https://Isha.co/GuruPooja-Satellite'),
    'guru_pooja'
  );
  assert.equal(
    detectProgramType({ title: '7-Day Inner Engineering' }, 'https://isha.co/IE7-Mumbai'),
    'ie7'
  );
  assert.equal(
    detectProgramType({ title: 'Inner Engineering' }, 'https://isha.co/IE7First-Pune'),
    'ie7_first'
  );
  assert.equal(
    detectProgramType({ title: 'Inner Engineering' }, 'https://isha.co/IE-One-Week-Pune'),
    'ie4_one_week'
  );
  assert.equal(
    detectProgramType({ title: 'Inner Engineering' }, 'https://isha.co/IE-Hadapsar'),
    'ie4'
  );
});

test('renderMessage - renders Guru Pooja message with clean address and center', () => {
  const rawProgram = {
    title: 'Guru Pooja',
    date: '23 - 25 Oct 2026',
    address: 'Shivalik Greens\n10, Shivalik Greens, Ambli, Bopal Ambli Road,\nAhmedabad- 380058',
    city: 'Ahmedabad',
    language: 'english',
    details: '<b>Session Timings:</b> 8:00 AM to 7:00 pm',
    contacts: [{ contact_phone: '7567125147/8799633605' }],
  };

  const shortLink = 'https://Isha.co/GuruPooja-Satellite';
  const normalized = normalizeProgram(rawProgram, shortLink);
  const message = renderMessage('guru_pooja', normalized, shortLink);

  assert.match(message, /Details of the Gurupooja program in Satellite/);
  assert.match(message, /23 - 25 October/);
  assert.match(message, /8:00 am to 7:00 pm/);
  assert.match(
    message,
    /🏫 Shivalik Greens, 10, Shivalik Greens, Ambli, Bopal Ambli Road, Ahmedabad/
  );
  assert.match(message, /📞 7567125147 \/ 8799633605/);
  assert.match(message, /🔗 https:\/\/Isha\.co\/GuruPooja-Satellite/);
});

test('renderMessage - renders Guru Pooja 1 week to go message with short month and clean address', () => {
  const rawProgram = {
    title: 'Guru Pooja',
    date: '23 - 25 Oct 2026',
    address: 'Alamu Hall\n8th Road, Near Diamond Garden, Opp. Ahobila Mutt Mandir, Chembur,\nMumbai- 400071',
    city: 'Mumbai',
    language: 'english',
    details: '<b>Session Timings:</b> 8:00 AM to 7:00 pm',
    contacts: [{ contact_phone: '9152281112/8451865445' }],
  };

  const shortLink = 'https://Isha.co/GuruPooja-Chembur';
  const normalized = normalizeProgram(rawProgram, shortLink);
  const message = renderMessage('guru_pooja_one_week', normalized, shortLink);

  assert.match(message, /One week to go for the Guru Pooja Training Program in Chembur: - Few seats available/);
  assert.match(message, /23 - 25 Oct/);
  assert.match(message, /8 am to 7 pm/);
  assert.match(
    message,
    /🏫 Alamu Hall, 8th Road, Near Diamond Garden, Opp. Ahobila Mutt Mandir, Chembur, Mumbai/
  );
  assert.match(message, /📞 9152281112 \/ 8451865445/);
  assert.match(message, /🔗https:\/\/Isha\.co\/GuruPooja-Chembur/);
});

