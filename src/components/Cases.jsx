import { useCallback, useState } from 'react';
import { cases, links } from '../data';
import Visual from './Visual';
import VideoModal from './VideoModal';

export default function Cases() {
  const [i, setI] = useState(0);
  const [video, setVideo] = useState(false);
  const closeVideo = useCallback(() => setVideo(false), []);
  const total = cases.length;
  const c = cases[i];
  const num = String(i + 1).padStart(2, '0');
  const go = (d) => setI((v) => (v + d + total) % total);

  return (
    <section className="cases" id="cases" aria-roledescription="carousel" aria-label="Case studies">
      <div className="cases__top">
        <div className="pill-label" aria-live="polite">{c.client}</div>
        <div className="cases__count">
          <div className="progress__bar progress__bar--sm">
            <span style={{ width: `${((i + 1) / total) * 100}%` }} />
          </div>
          <small>{num}/{String(total).padStart(2, '0')}</small>
        </div>
        <div className="arrows">
          <button type="button" onClick={() => go(-1)} aria-label="Previous case">←</button>
          <button type="button" onClick={() => go(1)} aria-label="Next case">→</button>
        </div>
      </div>

      <div className="cases__body fade" key={i}>
        <div className="cases__orbit">
          {c.video ? (
            <button type="button" className="play-btn" aria-label={`Play ${c.client} case video`} aria-haspopup="dialog" onClick={() => setVideo(true)}>
              <span className="play-ic" aria-hidden="true">▶</span>
            </button>
          ) : (
            <span className="orbit-dot" aria-hidden="true" />
          )}
        </div>
        <div className="cases__text">
          <span className="badge-open" aria-hidden="true">Open Case</span>
          <h3>{c.title}</h3>
          <p>{c.text}</p>
        </div>
        <div className="cases__media">
          <span className="cases__idx" aria-hidden="true">{num}</span>
          <Visual src={c.image} alt={c.client} variant="cool" />
        </div>
      </div>

      <div className="cases__foot">
        <div className="cases__tags">
          {c.tags.map((t, idx) => (
            <span key={t}>{idx > 0 && <i className="dot" />}{t}</span>
          ))}
        </div>
        {links.allCases && (
          <a href={links.allCases} className="btn btn--accent btn--wide">All Cases <span aria-hidden="true">↪</span></a>
        )}
      </div>

      {video && c.video && <VideoModal title={`${c.client} case video`} src={c.video} onClose={closeVideo} />}
    </section>
  );
}
