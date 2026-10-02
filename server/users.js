import { randomBytes, randomUUID, scrypt, timingSafeEqual } from 'node:crypto';
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { promisify } from 'node:util';

const scryptAsync = promisify(scrypt);
const DATA_DIR = process.env.DATA_DIR || path.resolve(import.meta.dirname, 'data');
const FILE = path.join(DATA_DIR, 'users.json');

// ---------- Password hashing (scrypt, built into Node) ----------
export async function hashPassword(password) {
  const salt = randomBytes(16);
  const hash = await scryptAsync(password, salt, 64);
  return `scrypt$${salt.toString('base64')}$${hash.toString('base64')}`;
}

export async function verifyPassword(password, stored) {
  const [, saltB64, hashB64] = String(stored).split('$');
  if (!saltB64 || !hashB64) return false;
  const expected = Buffer.from(hashB64, 'base64');
  const actual = await scryptAsync(password, Buffer.from(saltB64, 'base64'), expected.length);
  return timingSafeEqual(actual, expected);
}

// ---------- Tiny JSON-file user store ----------
// Writes are serialised through a promise chain so two sign-ups can't overwrite each other.
let queue = Promise.resolve();

async function readAll() {
  try {
    return JSON.parse(await readFile(FILE, 'utf8'));
  } catch (err) {
    if (err.code === 'ENOENT') return [];
    throw err;
  }
}

async function writeAll(users) {
  await mkdir(DATA_DIR, { recursive: true });
  const tmp = `${FILE}.tmp`;
  await writeFile(tmp, JSON.stringify(users, null, 2), 'utf8');
  await rename(tmp, FILE); // atomic replace
}

export const findUserByEmail = async (email) => (await readAll()).find((u) => u.email === email) || null;
export const findUserById = async (id) => (await readAll()).find((u) => u.id === id) || null;

export function createUser({ name, email, company, password }) {
  const run = async () => {
    const users = await readAll();
    if (users.some((u) => u.email === email)) return null;
    const user = {
      id: randomUUID(),
      name,
      email,
      company,
      passwordHash: await hashPassword(password),
      createdAt: new Date().toISOString(),
    };
    users.push(user);
    await writeAll(users);
    return user;
  };
  return serial(run);
}

function serial(fn) {
  const result = queue.then(fn, fn);
  queue = result.catch(() => {});
  return result;
}

export const listUsers = async () => (await readAll()).slice().reverse(); // newest first

export function recordLogin(id) {
  return serial(async () => {
    const users = await readAll();
    const user = users.find((u) => u.id === id);
    if (!user) return;
    user.lastLoginAt = new Date().toISOString();
    await writeAll(users);
  });
}

export function deleteUser(id) {
  return serial(async () => {
    const users = await readAll();
    const next = users.filter((u) => u.id !== id);
    if (next.length === users.length) return false;
    await writeAll(next);
    return true;
  });
}

// Admins are the accounts whose email is listed in ADMIN_EMAILS (comma-separated) in .env
const ADMIN_EMAILS = new Set(
  String(process.env.ADMIN_EMAILS || '').split(',').map((e) => e.trim().toLowerCase()).filter(Boolean)
);
export const isAdmin = (u) => Boolean(u && ADMIN_EMAILS.has(u.email));

// Never send the password hash to the browser
export const publicUser = (u) => ({
  id: u.id,
  name: u.name,
  email: u.email,
  company: u.company,
  createdAt: u.createdAt,
  lastLoginAt: u.lastLoginAt || null,
  isAdmin: isAdmin(u),
});
