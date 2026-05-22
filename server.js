import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  PROGRAM_TYPES,
  fetchProgramFromShortLink,
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
  const programType = req.body?.programType;
  const url = req.body?.url?.trim();

  if (!url) {
    res.status(400).json({ error: 'Program URL is required.' });
    return;
  }

  const allowed = new Set(PROGRAM_TYPES.map((t) => t.id));
  if (!programType || !allowed.has(programType)) {
    res.status(400).json({ error: 'Invalid or missing program type.' });
    return;
  }

  try {
    const normalized = await fetchProgramFromShortLink(url);
    const message = renderMessage(programType, normalized, url);
    res.json({
      message,
      extracted: {
        city: normalized.city,
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
