import { useEffect, useState } from 'react';

// Shared "who is logged in" state: undefined = still checking, null = logged out, object = user.
let current;
let pending = null;
const listeners = new Set();
const setUser = (u) => { current = u; listeners.forEach((fn) => fn(u)); };

async function request(path, body) {
  const res = await fetch(`/api/auth/${path}`, {
    method: body ? 'POST' : 'GET',
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
    credentials: 'same-origin',
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || !json.ok) {
    const err = new Error(json.error || 'Something went wrong. Please try again.');
    err.status = res.status;
    err.fields = json.fields || {};
    throw err;
  }
  return json;
}

export function loadUser() {
  if (!pending) {
    pending = request('me')
      .then((j) => setUser(j.user))
      .catch(() => setUser(null))
      .finally(() => { pending = null; });
  }
  return pending;
}

export async function login(email, password) {
  const { user } = await request('login', { email, password });
  setUser(user);
  return user;
}

export async function register(data) {
  const { user } = await request('register', data);
  setUser(user);
  return user;
}

export async function logout() {
  await request('logout', {}).catch(() => {});
  setUser(null);
}

export const getAuthConfig = () => request('config').catch(() => ({ signup: true }));

export function useUser() {
  const [user, set] = useState(current);
  useEffect(() => {
    listeners.add(set);
    set(current); // catch up on any change between render and subscribe
    if (current === undefined) loadUser();
    return () => listeners.delete(set);
  }, []);
  return user;
}
