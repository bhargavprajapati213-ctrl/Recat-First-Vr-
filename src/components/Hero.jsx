import { useCallback, useState } from 'react';
import { brand, hero, links } from '../data';
import Header from './Header';
import Visual from './Visual';
import VideoModal from './VideoModal';

export default function Hero() {
  const [video, setVideo] = useState(false);
  const closeVideo = useCallback(() => setVideo(false), []);

  return (
    <section className="hero" id="top">
      <Visual src={hero.image} alt="Person wearing a VR headset" variant="hero" className="hero__bg" />
      <div className="hero__shade" />
      <Header />

      <div className="hero__content">
        <h1 className="hero__title">
          {/* Two lines on wide screens; flows naturally on phones */}
          <span className="hero__line">{hero.title[0]}</span> <span className="hero__line">{hero.title[1]}</span>
        </h1>
        <p className="hero__sub">{brand.blurb}</p>
      </div>

      <div className="hero__bottom">
        <div className="hero__btns">
          <a href="#contact" data-topic="sales" className="btn btn--accent">Contact Sales</a>
          {links.brochure ? (
            <a href={links.brochure} className="btn btn--glass" download>Download Brochure</a>
          ) : (
            <a href="#contact" data-topic="brochure" className="btn btn--glass">Request Brochure</a>
          )}
        </div>
        {/* Only shown once a video is set in data.js (hero.video.src) */}
        {hero.video.src && (
          <button className="hero__video" onClick={() => setVideo(true)} aria-haspopup="dialog">
            <span className="hero__video-thumb"><span className="play-ic" aria-hidden="true">▶</span></span>
            <span>
              <strong>{hero.video.label}</strong>
              <small>{hero.video.sub}</small>
            </span>
          </button>
        )}
      </div>

      {video && hero.video.src && <VideoModal title={hero.video.label} src={hero.video.src} poster={hero.video.poster} onClose={closeVideo} />}
    </section>
  );
}
