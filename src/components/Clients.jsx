import { awards, clients } from '../data';

function Laurel({ label }) {
  return (
    <div className="award" title={label}>
      <svg viewBox="0 0 40 40" aria-hidden="true">
        <path d="M12 30 C6 24 6 14 12 8" stroke="currentColor" strokeWidth="1.4" fill="none" />
        <path d="M28 30 C34 24 34 14 28 8" stroke="currentColor" strokeWidth="1.4" fill="none" />
        {[10, 15, 20, 25].map((y) => (
          <g key={y}>
            <ellipse cx="9.5" cy={y} rx="2.4" ry="1.2" transform={`rotate(-35 9.5 ${y})`} fill="currentColor" />
            <ellipse cx="30.5" cy={y} rx="2.4" ry="1.2" transform={`rotate(35 30.5 ${y})`} fill="currentColor" />
          </g>
        ))}
        <circle cx="20" cy="19" r="5" stroke="currentColor" strokeWidth="1.4" fill="none" />
      </svg>
      <span>{label}</span>
    </div>
  );
}

// One auto-scrolling row. The list is rendered twice so the loop is seamless;
// the copy is hidden from screen readers.
function Marquee({ items, reverse = false }) {
  const tiles = (copy) =>
    items.map((c) => (
      <li key={`${copy}-${c.name}`} className={`logo-tile wm--${c.style}`} aria-hidden={copy ? 'true' : undefined}>
        {c.name}
      </li>
    ));
  return (
    <div className={`marquee ${reverse ? 'marquee--reverse' : ''}`}>
      <ul className="marquee__track">
        {tiles(0)}
        {tiles(1)}
      </ul>
    </div>
  );
}

export default function Clients() {
  const half = Math.ceil(clients.length / 2);
  return (
    <section className="clients" id="clients">
      <div className="clients__row">
        <p className="eyebrow">Our Clients</p>
        <div className="clients__main">
          <h2 className="h-sm">Trusted by Industry Leaders</h2>
          <div className="logo-marquee">
            <Marquee items={clients.slice(0, half)} />
            <Marquee items={clients.slice(half)} reverse />
          </div>
        </div>
      </div>
      <div className="clients__row clients__row--awards">
        <p className="eyebrow">Award Winning</p>
        <div className="awards">
          {awards.map((a) => <Laurel key={a} label={a} />)}
        </div>
      </div>
    </section>
  );
}
