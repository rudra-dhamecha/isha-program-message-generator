---
name: generate-isha-message
description: >-
  Generates formatted WhatsApp invitation and reply messages for Isha Foundation programs (Guru Pooja, Inner Engineering 4-day/7-day, etc.) from incoming WhatsApp messages or isha.co short links, automatically resolving program details, fixing address formatting, and populating templates.
---

# Isha Program Message Generator Skill

This skill guides the agent in handling incoming WhatsApp messages containing Isha Foundation program short links (`https://isha.co/...`) and generating the appropriate formatted invitation and reply messages for volunteers to share.

## Project Context & Deployment

- **Live URL**: [https://isha-message-generator.vercel.app/](https://isha-message-generator.vercel.app/)
- **Deployment**: Continuously deployed to Vercel directly from the `main` branch.
- **Purpose**: Isha volunteers frequently receive WhatsApp messages containing program short links (e.g. from the Isha Content Team or coordinators) and need to promptly reply with standard, beautifully formatted WhatsApp announcement/invitation messages.

## Supported Program Types

1. `guru_pooja` (**Guru Pooja**):
   - Used for Guru Pooja programs.
   - Auto-extracts the center name (e.g., Satellite, Mulund, Chinchwad).
   - Formats dates with full month names (e.g., `23 - 25 October`).
   - Extracts session timings (e.g., `8:00 am to 7:00 pm`).
   - Formats venue address cleanly.
2. `guru_pooja_one_week` (**One week to go Guru Pooja**):
   - 1-week reminder message for Guru Pooja with divine invitation article link, center name, short month format (e.g., `23 - 25 Oct`), timing, and cleaned venue address.
3. `ie4` (**Inner Engineering 4 Days**):
   - Standard 4-day Inner Engineering program invitation.
4. `ie4_one_week` (**One week to go 4-day Inner Engineering**):
   - Reminder message sent 1 week before the program starts.
5. `ie4_2nd_post` (**4 Day Inner Engineering 2nd Post program**):
   - Follow-up promotional message with transformation stories link.
6. `ie7` (**Inner Engineering 7 Days**):
   - 7-day program announcement.
7. `ie7_first` (**Inner Engineering 7 Days First Message**):
   - Comprehensive announcement with weekday and Sunday session timings.

## Address Formatting Rules

When fetching program details from the Isha Foundation API, addresses often require normalization:
1. **End Punctuation After Place Name**: The first line from the API is the place/venue name (e.g., `Shivalik Greens`). Ensure it ends with punctuation (append a comma `,` if missing) so it does not blend awkwardly into subsequent address lines.
2. **Intermediate Line Separation**: Any intermediate lines that lack ending punctuation (`[,;.:]`) should also have a comma appended.
3. **Pin Code Removal**: The postal code at the end of the address (e.g., `- 380058`, `, 380058`, ` 380058`, `PIN: 380058`) must be stripped away.
4. **Clean Trailing Characters**: Strip any leftover trailing commas, hyphens, or periods at the end of the cleaned address.

## Workflow: How to Process an Incoming WhatsApp Message

When given an incoming WhatsApp message (e.g., `[14/10, 3:13 pm] Archana Content Team Isha: https://Isha.co/GuruPooja-Satellite`):

### 1. Extract the Short Link
Use `extractShortLink` or regex `https?:\/\/(?:[a-zA-Z0-9-]+\.)?isha\.co\/[^\s)\]>]+` to extract the `isha.co` link from the user's message.

### 2. Identify or Auto-Detect the Program Type
If the user specifies a template, use it. Otherwise, auto-detect:
- Contains `GuruPooja`, `/gp-`, or title `Guru Pooja` &rarr; `guru_pooja`
- Contains `IE7First` &rarr; `ie7_first`
- Contains `IE7` or title `7-day` &rarr; `ie7`
- Contains `one-week` &rarr; `ie4_one_week`
- Contains `2nd-post` &rarr; `ie4_2nd_post`
- Default &rarr; `ie4`

### 3. Generate the Message
Run the CLI utility in the project root:
```bash
node scraper.js "<whatsapp-message-or-link>" [optional-program-type]
```
Or use the service programmatically:
```javascript
import { fetchProgramFromShortLink, detectProgramType, renderMessage } from './lib/program-service.js';

const normalized = await fetchProgramFromShortLink(shortLink);
const programType = explicitType || detectProgramType(normalized, shortLink);
const message = renderMessage(programType, normalized, shortLink);
```

### 4. Provide the Response
Return the generated message to the user in a clean, copy-pasteable format along with a summary of the extracted details (program type, dates, venue, timing, contacts).
