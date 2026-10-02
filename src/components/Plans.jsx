import { useEffect, useRef, useState } from 'react';
import { analytics, plans } from '../data';
import Visual from './Visual';

function Card({ id, title, children, className = '', text }) {
  return (
    <article className={`plan ${className}`} id={id ? `plan-${id}` : undefined}>
      <div className="plan__head">{title}</div>
      <div className="plan__body">{children}</div>
      {text && <p className="plan__text">{text}</p>}
    </article>
  );
}

function Chart() {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  const max = Math.max(...analytics);
  const peak = analytics.indexOf(max);
  const avg = analytics.reduce((a, b) => a + b, 0) / analytics.length;
  // Label a handful of evenly spaced bars (never the peak, which has its own badge)
  const step = Math.max(1, Math.round(analytics.length / 4));
  const labelled = (i) => i !== peak && i % step === Math.floor(step / 2);

  // Play the grow animation when the chart scrolls into view
  useEffect(() => {
    const el = ref.current;
    if (!el || !('IntersectionObserver' in window)) { setInView(true); return; }
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setInView(true); io.disconnect(); }
    }, { threshold: 0.3 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      className={`chart ${inView ? 'is-visible' : ''}`}
      ref={ref}
      role="img"
      aria-label={`Training analytics: ${analytics.length} data points, peak ${max}%, average ${Math.round(avg)}%`}
    >
      <div className="chart__bars">
        <div className="chart__line" style={{ bottom: `${avg}%` }} />
        {analytics.map((v, i) => (
          <span key={i} className={i === peak ? 'is-peak' : ''} style={{ height: `${v}%`, animationDelay: `${i * 30}ms` }}>
            {i === peak && <em>{max}%</em>}
            {labelled(i) && <b className="chart__lbl">{v}%</b>}
          </span>
        ))}
      </div>
      <a href="#contact" data-topic="demo" className="round-btn chart__next" aria-label="Ask about analytics">›</a>
    </div>
  );
}

export default function Plans() {
  const byId = Object.fromEntries(plans.items.map((p) => [p.id, p]));
  const { library: lib, analytics: ana, headsets: head, support: sup, custom: cus } = byId;
  return (
    <section className="plans container" id="plans">
      <p className="eyebrow">Services</p>
      <h2 className="h-xl">Subscription Plans</h2>
      <p className="plans__intro">{plans.intro}</p>

      <div className="bento">
        {lib && (
          <Card id={lib.id} title={lib.title} className="bento__tall" text={lib.text}>
            <div className="dots-bg" />
            <div className="mini-dial"><i className="dot dot--accent" /><i /><i /></div>
            <Visual src={lib.image} alt={lib.title} variant="warm" className="plan__visual" />
          </Card>
        )}

        {ana && <Card id={ana.id} title={ana.title} text={ana.text}><Chart /></Card>}

        {head && (
          <Card id={head.id} title={head.title} text={head.text}>
            <div className="orbits"><i /><i /><i /></div>
            <Visual src={head.image} alt={head.title} variant="cool" className="plan__visual plan__visual--sm" />
            <a href="#contact" data-topic="sales" className="round-btn" aria-label="Ask about headset plans">›</a>
          </Card>
        )}

        {sup && (
          <Card id={sup.id} title={sup.title} text={sup.text} className="plan--short">
            <ul className="checks">
              <li>Kick-off workshop</li><li>Trainer certification</li><li>24/7 device support</li>
            </ul>
          </Card>
        )}

        {cus && (
          <Card id={cus.id} title={cus.title} text={cus.text} className="plan--short">
            <ul className="checks">
              <li>Digital twin of your site</li><li>Your SOPs, scripted</li><li>Multi-language VO</li>
            </ul>
          </Card>
        )}
      </div>
    </section>
  );
}
