import { appendFile, mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';

// Submissions are stored one JSON object per line (JSONL) — easy to read, grep or import elsewhere.
const DATA_DIR = process.env.DATA_DIR || path.resolve(import.meta.dirname, 'data');
const FILE = path.join(DATA_DIR, 'submissions.jsonl');

// All writes go through one queue so an edit can't overwrite a message that arrives at the same moment.
let queue = Promise.resolve();
function serial(fn) {
  const result = queue.then(fn, fn);
  queue = result.catch(() => {});
  return result;
}

async function readAll() {
  try {
    const text = await readFile(FILE, 'utf8');
    return text
      .split('\n')
      .filter(Boolean)
      .map((line) => { try { return JSON.parse(line); } catch { return null; } })
      .filter(Boolean);
  } catch (err) {
    if (err.code === 'ENOENT') return [];
    throw err;
  }
}

async function writeAll(items) {
  await mkdir(DATA_DIR, { recursive: true });
  const tmp = `${FILE}.tmp`;
  await writeFile(tmp, items.map((i) => JSON.stringify(i)).join('\n') + (items.length ? '\n' : ''), 'utf8');
  await rename(tmp, FILE); // atomic replace
}

export function saveSubmission(entry) {
  return serial(async () => {
    await mkdir(DATA_DIR, { recursive: true });
    await appendFile(FILE, JSON.stringify({ status: 'new', ...entry }) + '\n', 'utf8');
  });
}

// Newest first. Older entries without a status count as "new".
export async function listSubmissions() {
  return (await readAll()).map((s) => ({ status: 'new', ...s })).reverse();
}

export function updateSubmission(id, patch) {
  return serial(async () => {
    const items = await readAll();
    const item = items.find((s) => s.id === id);
    if (!item) return null;
    Object.assign(item, patch, { updatedAt: new Date().toISOString() });
    await writeAll(items);
    return item;
  });
}

export function deleteSubmission(id) {
  return serial(async () => {
    const items = await readAll();
    const next = items.filter((s) => s.id !== id);
    if (next.length === items.length) return false;
    await writeAll(next);
    return true;
  });
}
