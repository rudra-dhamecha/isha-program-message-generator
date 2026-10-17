# Project Context & Agent Guidelines

## Deployment
- **Live URL**: [https://isha-message-generator.vercel.app/](https://isha-message-generator.vercel.app/)
- **Deployment Branch**: Automatically deployed to Vercel from the `main` branch.

## Purpose & Context
This tool was created for Isha Volunteers who regularly receive WhatsApp messages containing Isha Foundation program short links (e.g. from the Isha Content Team or regional coordinators) and need to reply with properly formatted program announcement/invitation messages.

## Address Normalization Guidelines
Whenever fetching and formatting program addresses from the Isha API:
1. **Punctuation After First Place Name**: The first line from the API represents the venue/place name (e.g. `Shivalik Greens`). Ensure it ends with punctuation (add `,` if missing) so it does not merge awkwardly into the street/area name.
2. **Intermediate Lines**: Ensure intermediate lines have ending punctuation (add `,` if missing).
3. **Strip Pin Code**: The postal code at the end (e.g. `- 380058`, `, 380058`, `Pin: 380058`) must be removed from the venue string.
4. **Clean Trailing Punctuation**: Strip any trailing commas, hyphens, or periods at the end of the address.

## CLI & Scraper
Run:
```bash
npm run scrape "<whatsapp-message-or-isha-short-link>" [optional-program-type]
```
The scraper automatically extracts `isha.co` links from raw WhatsApp message text and infers the program type (`guru_pooja`, `guru_pooja_one_week`, `ie7`, `ie7_first`, `ie4_one_week`, `ie4_2nd_post`, or default `ie4`).

## Testing
Run the test suite with:
```bash
npm test
```
