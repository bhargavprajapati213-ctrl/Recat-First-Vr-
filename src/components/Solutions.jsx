import { useEffect, useRef, useState } from 'react';
import { solutions } from '../data';
import Visual from './Visual';

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

export default function Solutions() {
  const [i, setI] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [visible, setVisible] = useState(false);
  const ref = useRef(null);
  const tabRefs = useRef([]);
  const item = solutions[i];
  const total = solutions.length;
  const paused = hovered || focused || !visible || prefersReducedMotion();

  // Only auto-advance while the section is on screen
  useEffect(() => {
    const el = ref.current;
    if (!el || !('IntersectionObserver' in window)) { setVisible(true); return; }
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.3 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Auto-advance every 6s; pauses on hover, keyboard focus, off-screen and reduced motion
  useEffect(() => {
    if (paused) return;
    const t = setTimeout(() => setI((v) => (v + 1) % total), 6000);
    return () => clearTimeout(t);
  }, [i, total, paused]);

  const onTabKey = (e) => {
    const d = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
    let next;
    if (d) next = (i + d + total) % total;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = total - 1;
    else return;
    e.preventDefault();
    setI(next);
    tabRefs.current[next]?.focus();
  };

  return (
    <section
      className="solutions container"
      id="solutions"
      ref={ref}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setFocused(false); }}
    >
      <p className="eyebrow">Solutions</p>
      <div className="solutions__main">
        <h2 className="h-md">I Want To:</h2>

        <div className="tabs" role="tablist" aria-label="Solutions">
          {solutions.map((s, idx) => (
            <button
              key={s.tab}
              ref={(el) => { tabRefs.current[idx] = el; }}
              type="button"
              role="tab"
              id={`sol-tab-${idx}`}
              aria-selected={idx === i}
              aria-controls="sol-panel"
              tabIndex={idx === i ? 0 : -1}
              className={`tab ${idx === i ? 'is-active' : ''}`}
              onClick={() => setI(idx)}
              onKeyDown={onTabKey}
            >
              {s.tab}
            </button>
          ))}
        </div>

        <div className="solutions__row">
          <span className="solutions__num" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
          <div
            className="solutions__card fade"
            key={i}
            role="tabpanel"
            id="sol-panel"
            aria-labelledby={`sol-tab-${i}`}
          >
            <Visual src={item.image} alt={item.title} variant={i % 2 ? 'cool' : 'warm'} className="solutions__img" />
            <div className="solutions__text">
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </div>
          </div>
        </div>

        <div className="progress">
          <div className="progress__bar">
            <span style={{ width: `${((i + 1) / total) * 100}%` }} />
          </div>
          <small>{String(i + 1).padStart(2, '0')}/{String(total).padStart(2, '0')}</small>
        </div>
      </div>
    </section>
  );
}
