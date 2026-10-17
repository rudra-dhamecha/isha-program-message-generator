# Isha Program Message Generator

A tool for Isha Volunteers to generate formatted program invitation and reply messages from Isha short links and incoming WhatsApp messages.

## Live Deployment

- **Production URL:** [https://isha-message-generator.vercel.app/](https://isha-message-generator.vercel.app/)
- **Deployment:** Automatically deployed to Vercel directly from the `main` branch.

## Background & Context

Isha volunteers often receive WhatsApp messages (e.g. from the Isha Content Team or regional coordinators) containing program short links and need to quickly reply with the appropriate formatted invitation message. This tool automates resolving program information, fixing venue addresses, and formatting messages ready to send on WhatsApp.

## Features

- **WhatsApp Message & Short Link Resolution:** Accepts direct `isha.co` short links or raw WhatsApp message text containing short links.
- **Automated Data Fetching:** Retrieves program name, dates, location, city, center, language, session timings, and contact numbers from Isha Foundation APIs.
- **Smart Address Normalization:** Automatically fixes venue addresses:
  - Appends end punctuation (`,`) after the venue/place name if missing.
  - Strips pin codes/zip codes from the end (e.g. `- 380058`).
  - Cleans up trailing commas, dashes, and whitespace.
- **Template-Based Generation & Auto-Detection:** Automatically infers the program type or allows manual selection:
  - Guru Pooja (includes center name, full month dates, session timings, clean venue address)
  - Inner Engineering 4 Days
  - One week to go 4-day Inner Engineering
  - 4 Day Inner Engineering 2nd Post program
  - Inner Engineering 7 Days
  - Inner Engineering 7 Days First Message (with session timings)
- **Dual Interface:**
  - **Web UI:** Interactive browser interface with preview, auto-detection on paste, and one-click copy.
  - **CLI Tool:** Fast command-line scraper that auto-copies the formatted message to your clipboard.

## Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/isha-program-message-generator.git
   cd isha-program-message-generator
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

## Usage

### Web Interface

1. Start the server locally:
   ```bash
   npm start
   ```
2. Open your browser and navigate to `http://localhost:3847` (or visit the [live deployment](https://isha-message-generator.vercel.app/)).
3. Paste the Isha short link or the full WhatsApp message, choose or let it auto-detect the program type, and click **Generate message**.

### CLI Scraper

Run `npm run scrape` with either a direct Isha short link or the full WhatsApp message:

```bash
npm run scrape "<isha-short-link-or-whatsapp-message>" [program-type]
```

Examples:

```bash
# Direct link with auto-detected program type (Guru Pooja)
npm run scrape https://isha.co/GuruPooja-Satellite

# Direct WhatsApp message (auto-detects link and program type)
npm run scrape "[14/10, 3:13 pm] Archana Content Team Isha: https://Isha.co/GuruPooja-Satellite"

# Explicit program type specification
npm run scrape https://isha.co/IE-Hadapsar ie4
```

The formatted message is printed to the console and automatically copied to your clipboard.

## Running Tests

Run the unit test suite:
```bash
npm test
```

## Project Structure

- `server.js`: Express.js backend and API endpoints.
- `scraper.js`: CLI utility with auto-detection and clipboard integration.
- `lib/program-service.js`: Core logic for link resolution, API fetching, address cleaning, and message templates.
- `public/index.html`: Responsive single-page frontend.
- `test/program-service.test.js`: Unit tests for link extraction, address formatting, and message rendering.
- `.agents/skills/generate-isha-message/SKILL.md`: Workspace agent skill for handling WhatsApp messages and generating replies.
- `AGENTS.md`: Workspace context and instructions for AI agents.

## License

This project is licensed under the [ISC License](LICENSE).
