import express from 'express';
import { requireAdmin } from './auth.js';
import { deleteSubmission, listSubmissions, updateSubmission } from './storage.js';
import { deleteUser, listUsers, publicUser } from './users.js';

// Everything under /api/admin needs an admin (see requireAdmin in auth.js)
export const adminRouter = express.Router();
adminRouter.use(requireAdmin);
adminRouter.use((req, res, next) => { res.set('Cache-Control', 'no-store'); next(); });

const STATUSES = ['new', 'done'];
const wrap = (fn) => (req, res, next) => fn(req, res).catch(next);

adminRouter.get('/stats', wrap(async (req, res) => {
  const [subs, users] = await Promise.all([listSubmissions(), listUsers()]);
  const weekAgo = Date.now() - 7 * 864e5;
  const byTopic = {};
  for (const s of subs) byTopic[s.topic] = (byTopic[s.topic] || 0) + 1;
  res.json({
    ok: true,
    stats: {
      messages: subs.length,
      newMessages: subs.filter((s) => s.status === 'new').length,
      messagesThisWeek: subs.filter((s) => Date.parse(s.createdAt) > weekAgo).length,
      users: users.length,
      usersThisWeek: users.filter((u) => Date.parse(u.createdAt) > weekAgo).length,
      byTopic,
    },
  });
}));

adminRouter.get('/submissions', wrap(async (req, res) => {
  res.json({ ok: true, submissions: await listSubmissions() });
}));

adminRouter.patch('/submissions/:id', wrap(async (req, res) => {
  const status = req.body?.status;
  if (!STATUSES.includes(status)) return res.status(400).json({ ok: false, error: 'Status must be "new" or "done".' });
  const item = await updateSubmission(req.params.id, { status });
  if (!item) return res.status(404).json({ ok: false, error: 'Message not found.' });
  res.json({ ok: true, submission: item });
}));

adminRouter.delete('/submissions/:id', wrap(async (req, res) => {
  if (!(await deleteSubmission(req.params.id))) return res.status(404).json({ ok: false, error: 'Message not found.' });
  res.json({ ok: true });
}));

// CSV download of all messages (opens in Excel / Google Sheets)
adminRouter.get('/submissions.csv', wrap(async (req, res) => {
  const cols = ['createdAt', 'status', 'topic', 'name', 'email', 'company', 'phone', 'message'];
  const cell = (v) => {
    let s = String(v ?? '');
    if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`; // stop spreadsheet formula injection
    return `"${s.replace(/"/g, '""')}"`;
  };
  const rows = (await listSubmissions()).map((s) => cols.map((c) => cell(s[c])).join(','));
  const date = new Date().toISOString().slice(0, 10);
  res.set({
    'Content-Type': 'text/csv; charset=utf-8',
    'Content-Disposition': `attachment; filename="messages-${date}.csv"`,
  });
  res.send('﻿' + [cols.join(','), ...rows].join('\r\n')); // BOM so Excel reads UTF-8
}));

adminRouter.get('/users', wrap(async (req, res) => {
  res.json({ ok: true, users: (await listUsers()).map(publicUser) });
}));

adminRouter.delete('/users/:id', wrap(async (req, res) => {
  if (req.user && req.user.id === req.params.id) {
    return res.status(400).json({ ok: false, error: "You can't delete your own account while logged in." });
  }
  if (!(await deleteUser(req.params.id))) return res.status(404).json({ ok: false, error: 'User not found.' });
  res.json({ ok: true });
}));
