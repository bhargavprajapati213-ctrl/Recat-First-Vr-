import { useEffect, useRef, useState } from 'react';
import { brand, links, nav } from '../data';
import Logo from './Logo';
import { useUser } from '../auth';

export default function Header() {
  const [open, setOpen] = useState(false);
  const [drop, setDrop] = useState(null);
  const ref = useRef(null);

  const close = () => { setOpen(false); setDrop(null); };
  const user = useUser();
  // Logged in → "My Account"; otherwise the login page (or an external login URL from data.js)
  const account = user ? { href: '/account', label: 'My Account' } : { href: links.login || '/login', label: 'Login' };
  // While the login check is still running, keep the button invisible so it doesn't flash "Login"
  const checking = user === undefined;

  // Close menus on Escape or on a click/tap outside the header
  useEffect(() => {
    if (!open && !drop) return;
    const onKey = (e) => { if (e.key === 'Escape') close(); };
    const onDown = (e) => { if (!ref.current?.contains(e.target)) close(); };
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onDown);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onDown);
    };
  }, [open, drop]);

  return (
    <header className="nav" ref={ref}>
      <a href="#top" className="nav__brand">
        <Logo small />
        <span>{brand.name}</span>
      </a>

      <nav id="main-nav" className={`nav__links ${open ? 'is-open' : ''}`} aria-label="Main">
        {nav.map((item) => {
          const isOpen = drop === item.label;
          const dropId = `drop-${item.label.toLowerCase().replace(/\W+/g, '-')}`;
          return (
            <div
              key={item.label}
              className={`nav__item ${item.dropdown ? 'has-drop' : ''}`}
              onPointerEnter={(e) => item.dropdown && e.pointerType !== 'touch' && setDrop(item.label)}
              onPointerLeave={(e) => item.dropdown && e.pointerType !== 'touch' && setDrop(null)}
              onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget) && isOpen) setDrop(null); }}
            >
              <a href={item.href} onClick={close}>{item.label}</a>
              {item.dropdown && (
                <button
                  type="button"
                  className="nav__caret"
                  aria-label={`${item.label} menu`}
                  aria-expanded={isOpen}
                  aria-controls={dropId}
                  onClick={() => setDrop(isOpen ? null : item.label)}
                >
                  ▾
                </button>
              )}
              {item.dropdown && isOpen && (
                <div className="nav__drop" id={dropId}>
                  {item.dropdown.map((d) => (
                    <a key={d.label} href={d.href} data-topic={d.topic} onClick={close}>{d.label}</a>
                  ))}
                </div>
              )}
            </div>
          );
        })}
        <div className="nav__mobile-cta">
          <a href="#contact" data-topic="sales" className="btn btn--accent" onClick={close}>Contact Sales</a>
          <a href={account.href} className={`btn btn--light ${checking ? 'is-checking' : ''}`} onClick={close}>{account.label}</a>
        </div>
      </nav>

      <div className="nav__actions">
        <a href="#contact" data-topic="sales" className="btn btn--accent">Contact Sales</a>
        <a href={account.href} className={`btn btn--light ${checking ? 'is-checking' : ''}`}>{account.label}</a>
      </div>

      <button
        type="button"
        className={`nav__burger ${open ? 'is-open' : ''}`}
        onClick={() => setOpen((v) => !v)}
        aria-label="Toggle menu"
        aria-expanded={open}
        aria-controls="main-nav"
      >
        <span /><span />
      </button>
    </header>
  );
}
