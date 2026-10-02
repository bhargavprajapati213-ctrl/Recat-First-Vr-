import { useCallback, useEffect, useMemo, useState } from 'react';
import { brand } from '../data';
import { logout, useUser } from '../auth';
import { navigate } from '../router';
import Logo from '../components/Logo';

const TOPIC_LABELS = { sales: 'Sales', demo: 'Call / demo', brochure: 'Brochure', support: 'Support', other: 'Other' };

async function api(path, { method = 'GET', body } = {}) {
  const res = await fetch(`/api/admin/${path}`, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
    credentials: 'same-origin',
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || !json.ok) {
    const err = new Error(json.error || 'Something went wrong.');
    err.status = res.status;
    throw err;
  }
  return json;
}

const fmt = (iso) =>
  iso ? new Date(iso).toLocaleString(undefined, { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

// Two-step delete button: first click asks, second click confirms (no browser pop-ups).
function DeleteButton({ onConfirm, label = 'Delete' }) {
  const [armed, setArmed] = useState(false);
  useEffect(() => {
    if (!armed) return;
    const t = setTimeout(() => setArmed(false), 4000);
    return () => clearTimeout(t);
  }, [armed]);
  return armed ? (
    <button type="button" className="adm-btn adm-btn--danger" onClick={onConfirm}>Confirm {label.toLowerCase()}</button>
  ) : (
    <button type="button" className="adm-btn" onClick={() => setArmed(true)}>{label}</button>
  );
}

export default function Admin() {
  const user = useUser();
  const [tab, setTab] = useState('messages');
  const [stats, setStats] = useState(null);
  const [subs, setSubs] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [q, setQ] = useState('');
  const [topic, setTopic] = useState('all');
  const [status, setStatus] = useState('all');
  const [open, setOpen] = useState(null);

  useEffect(() => { document.title = `Admin — ${brand.name}`; }, []);
  useEffect(() => { if (user === null) navigate('/login', { replace: true }); }, [user]);

  const load = useCallback(async () => {
    setError('');
    try {
      const [s, m, u] = await Promise.all([api('stats'), api('submissions'), api('users')]);
      setStats(s.stats);
      setSubs(m.submissions);
      setUsers(u.users);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { if (user?.isAdmin) load(); else if (user) setLoading(false); }, [user, load]);

  const flash = (msg) => { setNotice(msg); setTimeout(() => setNotice(''), 2500); };
  const refreshStats = () => api('stats').then((s) => setStats(s.stats)).catch(() => {});

  const setMsgStatus = async (id, next) => {
    try {
      await api(`submissions/${id}`, { method: 'PATCH', body: { status: next } });
      const prev = subs.find((s) => s.id === id)?.status;
      setSubs((list) => list.map((s) => (s.id === id ? { ...s, status: next } : s)));
      // Update the "New messages" counter straight away, then confirm with the server
      if (prev && prev !== next) setStats((st) => st && { ...st, newMessages: st.newMessages + (next === 'new' ? 1 : -1) });
      refreshStats();
    } catch (err) { setError(err.message); }
  };

  const removeMsg = async (id) => {
    try {
      await api(`submissions/${id}`, { method: 'DELETE' });
      setSubs((list) => list.filter((s) => s.id !== id));
      if (open === id) setOpen(null);
      refreshStats();
      flash('Message deleted.');
    } catch (err) { setError(err.message); }
  };

  const removeUser = async (id) => {
    try {
      await api(`users/${id}`, { method: 'DELETE' });
      setUsers((list) => list.filter((u) => u.id !== id));
      refreshStats();
      flash('User removed.');
    } catch (err) { setError(err.message); }
  };

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return subs.filter((s) =>
      (topic === 'all' || s.topic === topic) &&
      (status === 'all' || s.status === status) &&
      (!needle || [s.name, s.email, s.company, s.phone, s.message].some((v) => String(v || '').toLowerCase().includes(needle)))
    );
  }, [subs, q, topic, status]);

  const filteredUsers = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return users.filter((u) => !needle || [u.name, u.email, u.company].some((v) => String(v || '').toLowerCase().includes(needle)));
  }, [users, q]);

  if (user === undefined || (loading && user?.isAdmin)) {
    return <main className="adm adm--center" aria-busy="true"><p>Loading…</p></main>;
  }
  if (!user) return null;
  if (!user.isAdmin) {
    return (
      <main className="adm adm--center">
        <div className="adm-denied">
          <h1>No admin access</h1>
          <p>You're signed in as <strong>{user.email}</strong>, which isn't an admin account.</p>
          <p className="adm-muted">Add this email to <code>ADMIN_EMAILS</code> in <code>.env</code> and restart the server.</p>
          <a href="/account" className="btn btn--accent">Back to my account</a>
        </div>
      </main>
    );
  }

  return (
    <main className="adm">
      <header className="adm-bar">
        <a href="/" className="auth__brand auth__brand--dark"><Logo small /><span>{brand.name}</span><em className="adm-tag">Admin</em></a>
        <div className="adm-bar__right">
          <span className="adm-muted adm-hide-sm">{user.email}</span>
          <a href="/account" className="btn btn--light">My account</a>
          <button type="button" className="btn btn--accent" onClick={async () => { await logout(); navigate('/', { replace: true }); }}>Log out</button>
        </div>
      </header>

      {error && <p className="adm-alert" role="alert">{error} <button type="button" onClick={load}>Retry</button></p>}
      {notice && <p className="adm-toast" role="status">{notice}</p>}

      {stats && (
        <section className="adm-stats" aria-label="Summary">
          <div><strong>{stats.newMessages}</strong><span>New messages</span></div>
          <div><strong>{stats.messages}</strong><span>Total messages</span><small>{stats.messagesThisWeek} this week</small></div>
          <div><strong>{stats.users}</strong><span>Users</span><small>{stats.usersThisWeek} new this week</small></div>
          <div className="adm-stats__topics">
            <span>By topic</span>
            <ul>
              {Object.keys(TOPIC_LABELS).map((t) => (
                <li key={t}><b>{stats.byTopic[t] || 0}</b> {TOPIC_LABELS[t]}</li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <div className="adm-toolbar">
        <div className="auth__tabs adm-tabs" role="tablist" aria-label="Admin sections">
          <button type="button" role="tab" aria-selected={tab === 'messages'} className={tab === 'messages' ? 'is-active' : ''} onClick={() => setTab('messages')}>
            Messages ({subs.length})
          </button>
          <button type="button" role="tab" aria-selected={tab === 'users'} className={tab === 'users' ? 'is-active' : ''} onClick={() => setTab('users')}>
            Users ({users.length})
          </button>
        </div>
        <input className="adm-search" type="search" placeholder="Search name, email, company…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search" />
        {tab === 'messages' && (
          <>
            <select value={topic} onChange={(e) => setTopic(e.target.value)} aria-label="Filter by topic">
              <option value="all">All topics</option>
              {Object.entries(TOPIC_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
            <select value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Filter by status">
              <option value="all">All statuses</option>
              <option value="new">New</option>
              <option value="done">Done</option>
            </select>
            <a className="adm-btn" href="/api/admin/submissions.csv" download>Export CSV</a>
          </>
        )}
        <button type="button" className="adm-btn" onClick={load}>Refresh</button>
      </div>

      {tab === 'messages' ? (
        filtered.length === 0 ? (
          <p className="adm-empty">{subs.length ? 'No messages match these filters.' : 'No messages yet. They appear here when someone uses the contact form.'}</p>
        ) : (
          <ul className="adm-list">
            {filtered.map((s) => (
              <li key={s.id} className={`adm-msg ${s.status === 'new' ? 'is-new' : ''}`}>
                <button type="button" className="adm-msg__head" aria-expanded={open === s.id} onClick={() => setOpen(open === s.id ? null : s.id)}>
                  <span className={`adm-pill adm-pill--${s.status}`}>{s.status === 'new' ? 'New' : 'Done'}</span>
                  <span className="adm-msg__who"><strong>{s.name}</strong>{s.company && <> · {s.company}</>}</span>
                  <span className="adm-pill adm-pill--topic">{TOPIC_LABELS[s.topic] || s.topic}</span>
                  <span className="adm-msg__preview">{s.message}</span>
                  <time className="adm-muted">{fmt(s.createdAt)}</time>
                </button>
                {open === s.id && (
                  <div className="adm-msg__body">
                    <dl>
                      <dt>Email</dt><dd><a href={`mailto:${s.email}`}>{s.email}</a></dd>
                      {s.phone && (<><dt>Phone</dt><dd><a href={`tel:${s.phone}`}>{s.phone}</a></dd></>)}
                      {s.company && (<><dt>Company</dt><dd>{s.company}</dd></>)}
                      <dt>Received</dt><dd>{fmt(s.createdAt)}</dd>
                    </dl>
                    <p className="adm-msg__text">{s.message}</p>
                    <div className="adm-actions">
                      <a className="adm-btn adm-btn--primary" href={`mailto:${s.email}?subject=${encodeURIComponent(`Re: your ${brand.name} enquiry`)}`}>Reply by email</a>
                      {s.status === 'new'
                        ? <button type="button" className="adm-btn" onClick={() => setMsgStatus(s.id, 'done')}>Mark as done</button>
                        : <button type="button" className="adm-btn" onClick={() => setMsgStatus(s.id, 'new')}>Mark as new</button>}
                      <DeleteButton onConfirm={() => removeMsg(s.id)} />
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )
      ) : filteredUsers.length === 0 ? (
        <p className="adm-empty">{users.length ? 'No users match your search.' : 'No users yet.'}</p>
      ) : (
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr><th>Name</th><th>Email</th><th>Company</th><th>Signed up</th><th>Last login</th><th><span className="adm-sr">Actions</span></th></tr>
            </thead>
            <tbody>
              {filteredUsers.map((u) => (
                <tr key={u.id}>
                  <td>{u.name} {u.isAdmin && <span className="adm-pill adm-pill--topic">Admin</span>}</td>
                  <td><a href={`mailto:${u.email}`}>{u.email}</a></td>
                  <td>{u.company || '—'}</td>
                  <td>{fmt(u.createdAt)}</td>
                  <td>{fmt(u.lastLoginAt)}</td>
                  <td>{u.id === user.id ? <span className="adm-muted">You</span> : <DeleteButton label="Remove" onConfirm={() => removeUser(u.id)} />}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
