import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  PROGRAM_TYPES,
  extractShortLink,
  fetchProgramFromShortLink,
  detectProgramType,
  renderMessage,
} from './lib/program-service.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = Number(process.env.PORT) || 3847;

app.use(express.json({ limit: '16kb' }));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/program-types', (_req, res) => {
  res.json({
    types: PROGRAM_TYPES.map(({ id, label, preview }) => ({
      id,
      label,
      preview,
    })),
  });
});

app.post('/api/generate', async (req, res) => {
  let programType = req.body?.programType;
  const rawUrl = req.body?.url?.trim();

  if (!rawUrl) {
    res.status(400).json({ error: 'Program URL is required.' });
    return;
  }

  const url = extractShortLink(rawUrl) || rawUrl;
  const allowed = new Set(PROGRAM_TYPES.map((t) => t.id));

  try {
    const normalized = await fetchProgramFromShortLink(url);
    if (!programType || programType === 'auto') {
      programType = detectProgramType(normalized, url);
    } else if (!allowed.has(programType)) {
      res.status(400).json({ error: 'Invalid or missing program type.' });
      return;
    }

    const message = renderMessage(programType, normalized, url);
    res.json({
      message,
      programType,
      extracted: {
        city: normalized.city,
        center: normalized.center,
        language: normalized.language,
        date: normalized.dateRaw,
        location: normalized.location,
        phones: normalized.phones,
        timing: normalized.timing,
        title: normalized.title,
      },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    res.status(422).json({ error: msg });
  }
});

app.listen(PORT, () => {
  console.log(`Program Message Generator → http://localhost:${PORT}`);
});
