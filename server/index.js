import { randomUUID } from 'node:crypto';
import { existsSync } from 'node:fs';
import path from 'node:path';
import express from 'express';
import { validateContact } from './validate.js';
import { mailEnabled, sendNotification } from './mailer.js';
import { rateLimit } from './rateLimit.js';
import { authRouter, requireAdmin } from './auth.js';
import { adminRouter } from './admin.js';
import { listSubmissions, saveSubmission } from './storage.js';

const PORT = Number(process.env.PORT) || 3001;
const DIST = path.resolve(import.meta.dirname, '..', 'dist');

const app = express();
app.disable('x-powered-by');
// Set TRUST_PROXY=1 when running behind a reverse proxy (Nginx, Render, Railway…) so rate limiting sees real IPs
if (process.env.TRUST_PROXY) app.set('trust proxy', Number(process.env.TRUST_PROXY) || process.env.TRUST_PROXY);

app.use((req, res, next) => {
  res.set({
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
  });
  next();
});
app.use('/api', express.json({ limit: '20kb' }));

// Contact form: 5 submissions per IP per 10 minutes
const contactLimit = rateLimit({ max: 5, windowMs: 10 * 60 * 1000, message: 'Too many messages. Please try again in a few minutes.' });

// ---------- Routes ----------
app.get('/api/health', (req, res) => {
  res.json({ ok: true, mail: mailEnabled });
});

app.post('/api/contact', contactLimit, async (req, res, next) => {
  try {
    // Honeypot: real users never see or fill the "website" field; bots usually do.
    if (req.body?.website) return res.status(201).json({ ok: true });

    const { data, errors } = validateContact(req.body);
    if (errors) return res.status(400).json({ ok: false, error: 'Please check the highlighted fields.', fields: errors });

    const entry = {
      id: randomUUID(),
      createdAt: new Date().toISOString(),
      ...data,
      ip: req.ip,
      userAgent: String(req.get('user-agent') || '').slice(0, 300),
    };
    await saveSubmission(entry);

    // Email failure shouldn't lose the lead — it's already saved, so just log it.
    sendNotification(entry).catch((err) => console.error('[mail] failed to send:', err.message));

    res.status(201).json({ ok: true, id: entry.id });
  } catch (err) {
    next(err);
  }
});

// Kept for scripts: same as /api/admin/submissions
app.get('/api/submissions', requireAdmin, async (req, res, next) => {
  try {
    res.json({ ok: true, submissions: await listSubmissions() });
  } catch (err) {
    next(err);
  }
});

app.use('/api/auth', authRouter);
app.use('/api/admin', adminRouter);

app.use('/api', (req, res) => res.status(404).json({ ok: false, error: 'Not found' }));

// ---------- Serve the built React site in production (after `npm run build`) ----------
if (existsSync(DIST)) {
  app.use(express.static(DIST, { index: false, maxAge: '1h' }));
  app.get(/.*/, (req, res) => res.sendFile(path.join(DIST, 'index.html')));
}

// Bad JSON and unexpected errors
app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed' || err.type === 'entity.too.large') {
    return res.status(400).json({ ok: false, error: 'Invalid request.' });
  }
  console.error('[server]', err);
  res.status(500).json({ ok: false, error: 'Something went wrong. Please try again.' });
});

app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`);
  console.log(`Email notifications: ${mailEnabled ? 'on' : 'off (set SMTP_HOST and MAIL_TO in .env to enable)'}`);
  const admins = String(process.env.ADMIN_EMAILS || '').split(',').filter((e) => e.trim());
  console.log(admins.length
    ? `Admin panel: /admin (admins: ${admins.join(', ')})`
    : 'Admin panel: set ADMIN_EMAILS in .env to choose who can open /admin.');
});
