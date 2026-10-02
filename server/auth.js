import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import express from 'express';
import { rateLimit } from './rateLimit.js';
import { createUser, findUserByEmail, findUserById, hashPassword, isAdmin, publicUser, recordLogin, verifyPassword } from './users.js';

const COOKIE = 'vx_session';
const SESSION_DAYS = 7;
const ALLOW_SIGNUP = process.env.ALLOW_SIGNUP !== 'false';
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

let SECRET = process.env.SESSION_SECRET;
if (!SECRET && process.env.NODE_ENV === 'production') {
  console.error('SESSION_SECRET must be set in production (a long random string). Refusing to start.');
  process.exit(1);
}
if (!SECRET) {
  SECRET = randomBytes(32).toString('hex');
  console.log('SESSION_SECRET not set — using a temporary one (everyone is logged out when the server restarts).');
}

// ---------- Signed session cookie: base64url(payload).signature ----------
const sign = (data) => createHmac('sha256', SECRET).update(data).digest('base64url');

function createToken(userId) {
  const payload = Buffer.from(JSON.stringify({ uid: userId, exp: Date.now() + SESSION_DAYS * 864e5 })).toString('base64url');
  return `${payload}.${sign(payload)}`;
}

function readToken(token) {
  const [payload, sig] = String(token || '').split('.');
  if (!payload || !sig) return null;
  const a = Buffer.from(sig);
  const b = Buffer.from(sign(payload));
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString());
    return data.exp > Date.now() ? data : null;
  } catch {
    return null;
  }
}

function getCookie(req, name) {
  const match = (req.get('cookie') || '').split(/;\s*/).find((c) => c.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.slice(name.length + 1)) : null;
}

function setSession(req, res, userId) {
  res.cookie(COOKIE, createToken(userId), {
    httpOnly: true, // not readable from JavaScript
    sameSite: 'lax', // not sent on cross-site POSTs (CSRF protection)
    secure: req.secure || process.env.NODE_ENV === 'production',
    maxAge: SESSION_DAYS * 864e5,
    path: '/',
  });
}

async function sessionUser(req) {
  const session = readToken(getCookie(req, COOKIE));
  return session ? findUserById(session.uid) : null;
}

// Middleware: attaches req.user (or 401s) based on the session cookie
export async function requireUser(req, res, next) {
  try {
    const user = await sessionUser(req);
    if (!user) return res.status(401).json({ ok: false, error: 'Please log in.' });
    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
}

// Middleware for the admin panel: a logged-in user listed in ADMIN_EMAILS,
// or (for scripts) the header "Authorization: Bearer <ADMIN_TOKEN>".
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || '';
export async function requireAdmin(req, res, next) {
  try {
    const bearer = String(req.get('authorization') || '').replace(/^Bearer\s+/i, '');
    if (ADMIN_TOKEN && bearer) {
      const a = Buffer.from(bearer);
      const b = Buffer.from(ADMIN_TOKEN);
      if (a.length === b.length && timingSafeEqual(a, b)) return next();
      return res.status(401).json({ ok: false, error: 'Invalid admin token.' });
    }
    const user = await sessionUser(req);
    if (!user) return res.status(401).json({ ok: false, error: 'Please log in.' });
    if (!isAdmin(user)) return res.status(403).json({ ok: false, error: 'This account does not have admin access.' });
    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
}

// Used to keep failed logins for unknown emails as slow as real ones (no email enumeration by timing)
const DUMMY_HASH = await hashPassword(randomBytes(16).toString('hex'));

const clean = (v, max) => (typeof v === 'string' ? v.replace(/\s+/g, ' ').trim().slice(0, max) : '');

export const authRouter = express.Router();
const authLimit = rateLimit({ max: 10, windowMs: 10 * 60 * 1000, message: 'Too many attempts. Please wait a few minutes and try again.' });

authRouter.post('/register', authLimit, async (req, res, next) => {
  try {
    if (!ALLOW_SIGNUP) return res.status(403).json({ ok: false, error: 'Sign-up is closed. Please contact sales for an account.' });
    const name = clean(req.body?.name, 100);
    const email = clean(req.body?.email, 200).toLowerCase();
    const company = clean(req.body?.company, 150);
    const password = typeof req.body?.password === 'string' ? req.body.password : '';

    const fields = {};
    if (name.length < 2) fields.name = 'Please enter your name.';
    if (!EMAIL_RE.test(email)) fields.email = 'Please enter a valid email address.';
    if (password.length < 8) fields.password = 'Use at least 8 characters.';
    else if (password.length > 200) fields.password = 'Password is too long.';
    if (Object.keys(fields).length) return res.status(400).json({ ok: false, error: 'Please check the highlighted fields.', fields });

    const user = await createUser({ name, email, company, password });
    if (!user) {
      return res.status(409).json({ ok: false, error: 'An account with this email already exists.', fields: { email: 'Already registered — try signing in.' } });
    }
    setSession(req, res, user.id);
    await recordLogin(user.id);
    res.status(201).json({ ok: true, user: publicUser({ ...user, lastLoginAt: new Date().toISOString() }) });
  } catch (err) {
    next(err);
  }
});

authRouter.post('/login', authLimit, async (req, res, next) => {
  try {
    const email = clean(req.body?.email, 200).toLowerCase();
    const password = typeof req.body?.password === 'string' ? req.body.password.slice(0, 200) : '';
    if (!email || !password) return res.status(400).json({ ok: false, error: 'Please enter your email and password.' });

    const user = await findUserByEmail(email);
    const valid = await verifyPassword(password, user ? user.passwordHash : DUMMY_HASH);
    if (!user || !valid) return res.status(401).json({ ok: false, error: 'Incorrect email or password.' });

    setSession(req, res, user.id);
    await recordLogin(user.id);
    res.json({ ok: true, user: publicUser(user) });
  } catch (err) {
    next(err);
  }
});

authRouter.post('/logout', (req, res) => {
  res.clearCookie(COOKIE, { path: '/' });
  res.json({ ok: true });
});

authRouter.get('/me', requireUser, (req, res) => {
  res.json({ ok: true, user: publicUser(req.user) });
});

authRouter.get('/config', (req, res) => {
  res.json({ ok: true, signup: ALLOW_SIGNUP });
});
