# Isha Program Message Generator

A tool for Isha Volunteers to generate formatted program invitation messages from Isha short links.

## Features

- **Short Link Resolution:** Automatically resolves `isha.co` short links to fetch program details.
- **Automated Fetching:** Retrieves program name, date, location, city, language, and contact details from Isha Foundation APIs.
- **Template-Based Generation:** Generates formatted messages for:
  - Inner Engineering 4 Days
  - Inner Engineering 7 Days
  - Guru Pooja
- **Dual Interface:**
  - **Web UI:** A simple browser-based interface for easy generation and copying.
  - **CLI Tool:** A command-line utility for quick, terminal-based access.

## Prerequisites

- [Node.js](https://nodejs.org/) (v16 or higher recommended)

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

1. Start the server:
   ```bash
   npm start
   ```
2. Open your browser and navigate to `http://localhost:3847`.
3. Select the program type, paste the Isha short link, and click **Generate**.

### CLI Scraper

For quick generation (specifically for Inner Engineering 4 Days):
```bash
npm run scrape <isha-short-link>
```
Example:
```bash
npm run scrape https://isha.co/IE-Hadapsar
```
The message will be printed to the console and copied to your clipboard.

## Project Structure

- `server.js`: Express.js backend.
- `scraper.js`: CLI utility.
- `lib/program-service.js`: Core logic for fetching and formatting data.
- `public/index.html`: Single-page frontend.

## License

This project is licensed under the [ISC License](LICENSE).
