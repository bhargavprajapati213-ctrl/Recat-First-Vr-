import { useEffect, useState } from 'react';
import { brand } from '../data';
import { logout, useUser } from '../auth';
import { navigate } from '../router';
import Logo from '../components/Logo';

export default function Account() {
  const user = useUser();
  const [leaving, setLeaving] = useState(false);

  useEffect(() => { document.title = `My account — ${brand.name}`; }, []);
  // Not logged in → send to the login page
  useEffect(() => { if (user === null && !leaving) navigate('/login', { replace: true }); }, [user, leaving]);

  if (!user) {
    return <main className="account account--loading" aria-busy="true"><p>Loading…</p></main>;
  }

  const onLogout = async () => {
    setLeaving(true);
    await logout();
    navigate('/', { replace: true });
    window.scrollTo(0, 0);
  };

  const first = user.name.split(' ')[0];
  const since = new Date(user.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <main className="account">
      <header className="account__bar">
        <a href="/" className="auth__brand auth__brand--dark"><Logo small /><span>{brand.name}</span></a>
        <div className="account__actions">
          {user.isAdmin && <a href="/admin" className="btn btn--light">Admin panel</a>}
          <a href="/" className="btn btn--light">Website</a>
          <button type="button" className="btn btn--accent" onClick={onLogout} disabled={leaving}>
            {leaving ? 'Logging out…' : 'Log out'}
          </button>
        </div>
      </header>

      <section className="account__hero">
        <p className="eyebrow">My account</p>
        <h1 className="h-md">Welcome, {first}</h1>
        <p className="account__lead">You're signed in. Your training dashboard will appear here.</p>
      </section>

      <section className="account__grid">
        <article className="account__card">
          <h2>Profile</h2>
          <dl>
            <dt>Name</dt><dd>{user.name}</dd>
            <dt>Email</dt><dd>{user.email}</dd>
            {user.company && (<><dt>Company</dt><dd>{user.company}</dd></>)}
            <dt>Member since</dt><dd>{since}</dd>
          </dl>
        </article>
        <article className="account__card">
          <h2>Get started</h2>
          <ul className="checks">
            <li>Browse the VR library</li><li>Invite your team</li><li>Pair a headset</li>
          </ul>
          <a href="/#contact" data-topic="support" className="btn btn--outline account__cta">Talk to support</a>
        </article>
      </section>
    </main>
  );
}
