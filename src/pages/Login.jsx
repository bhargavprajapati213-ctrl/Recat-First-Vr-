import { useEffect, useRef, useState } from 'react';
import { brand } from '../data';
import { getAuthConfig, login, register, useUser } from '../auth';
import { navigate } from '../router';
import Logo from '../components/Logo';
import Visual from '../components/Visual';

export default function Login() {
  const user = useUser();
  const [mode, setMode] = useState(window.location.hash === '#signup' ? 'signup' : 'login');
  const [signupOpen, setSignupOpen] = useState(true);
  const [form, setForm] = useState({ name: '', company: '', email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [fields, setFields] = useState({});
  const firstRef = useRef(null);

  useEffect(() => { document.title = `${mode === 'login' ? 'Log in' : 'Create account'} — ${brand.name}`; }, [mode]);
  useEffect(() => { getAuthConfig().then((c) => setSignupOpen(c.signup !== false)); }, []);
  // Already logged in? Go straight to the account page.
  useEffect(() => { if (user) navigate('/account', { replace: true }); }, [user]);

  const switchMode = (m) => {
    setMode(m);
    setError('');
    setFields({});
    window.history.replaceState({}, '', m === 'signup' ? '/login#signup' : '/login');
    setTimeout(() => firstRef.current?.focus());
  };

  const set = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    if (fields[key]) setFields((f) => ({ ...f, [key]: undefined }));
  };

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    setFields({});
    try {
      if (mode === 'login') await login(form.email, form.password);
      else await register(form);
      navigate('/account', { replace: true });
    } catch (err) {
      setFields(err.fields || {});
      setError(err instanceof TypeError ? "Couldn't reach the server. Please try again." : err.message);
      setBusy(false);
    }
  };

  const input = (key, label, props = {}) => (
    <label className="auth__field">
      <span>{label}</span>
      <input
        ref={props.first ? firstRef : undefined}
        type={props.type || 'text'}
        value={form[key]}
        onChange={set(key)}
        required={props.required}
        autoComplete={props.autoComplete}
        minLength={props.minLength}
        maxLength={props.maxLength || 200}
        aria-invalid={!!fields[key]}
        aria-describedby={fields[key] ? `auth-err-${key}` : props.hint ? `auth-hint-${key}` : undefined}
      />
      {fields[key] ? (
        <small className="auth__err" id={`auth-err-${key}`}>{fields[key]}</small>
      ) : props.hint ? (
        <small className="auth__hint" id={`auth-hint-${key}`}>{props.hint}</small>
      ) : null}
    </label>
  );

  const isLogin = mode === 'login';

  return (
    <main className="auth">
      <aside className="auth__side">
        <Visual variant="hero" className="auth__bg" />
        <div className="auth__shade" />
        <a href="/" className="auth__brand"><Logo small /><span>{brand.name}</span></a>
        <div className="auth__pitch">
          <h1>{brand.tagline}</h1>
          <p>Track completions, scores and headset fleets for every site — all in one dashboard.</p>
        </div>
      </aside>

      <section className="auth__panel">
        <a href="/" className="auth__back">← Back to website</a>

        <div className="auth__card">
          <h2>{isLogin ? 'Welcome back' : 'Create your account'}</h2>
          <p className="auth__sub">{isLogin ? `Log in to your ${brand.name} dashboard.` : 'Get started in less than a minute.'}</p>

          {signupOpen && (
            <div className="auth__tabs" role="tablist" aria-label="Log in or sign up">
              <button type="button" role="tab" aria-selected={isLogin} className={isLogin ? 'is-active' : ''} onClick={() => switchMode('login')}>Log in</button>
              <button type="button" role="tab" aria-selected={!isLogin} className={!isLogin ? 'is-active' : ''} onClick={() => switchMode('signup')}>Sign up</button>
            </div>
          )}

          <form onSubmit={submit} className="auth__form">
            {!isLogin && input('name', 'Full name', { required: true, autoComplete: 'name', maxLength: 100, first: true })}
            {!isLogin && input('company', 'Company (optional)', { autoComplete: 'organization', maxLength: 150 })}
            {input('email', 'Work email', { type: 'email', required: true, autoComplete: 'email', first: isLogin })}

            <label className="auth__field">
              <span>Password</span>
              <div className="auth__pw">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={form.password}
                  onChange={set('password')}
                  required
                  minLength={isLogin ? undefined : 8}
                  maxLength={200}
                  autoComplete={isLogin ? 'current-password' : 'new-password'}
                  aria-invalid={!!fields.password}
                  aria-describedby={fields.password ? 'auth-err-password' : !isLogin ? 'auth-hint-password' : undefined}
                />
                <button type="button" onClick={() => setShowPw((v) => !v)} aria-pressed={showPw}>
                  {showPw ? 'Hide' : 'Show'}
                </button>
              </div>
              {fields.password ? (
                <small className="auth__err" id="auth-err-password">{fields.password}</small>
              ) : !isLogin ? (
                <small className="auth__hint" id="auth-hint-password">At least 8 characters.</small>
              ) : null}
            </label>

            {error && <p className="auth__error" role="alert">{error}</p>}

            <button type="submit" className="btn btn--accent auth__submit" disabled={busy}>
              {busy ? 'Please wait…' : isLogin ? 'Log in' : 'Create account'}
            </button>
          </form>

          <p className="auth__foot">
            {isLogin ? (
              <>Forgot your password? <a href={`mailto:${brand.email}?subject=Password%20reset`}>Contact support</a></>
            ) : (
              <>By signing up you agree to our terms and privacy policy.</>
            )}
          </p>
          {!signupOpen && (
            <p className="auth__foot">Need an account? <a href="/#contact" data-topic="sales">Contact sales</a></p>
          )}
        </div>
      </section>
    </main>
  );
}
