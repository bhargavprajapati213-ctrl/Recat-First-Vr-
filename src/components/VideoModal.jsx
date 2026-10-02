import { useEffect, useRef } from 'react';

// Turns a YouTube / Vimeo page link into an embeddable player URL; anything else is treated as a video file.
function toEmbed(src) {
  let url;
  try { url = new URL(src, window.location.href); } catch { return null; }
  const host = url.hostname.replace(/^www\.|^m\./, '');
  let id;
  if (host === 'youtu.be') id = url.pathname.slice(1);
  else if (host.endsWith('youtube.com') || host === 'youtube-nocookie.com') {
    id = url.searchParams.get('v') || url.pathname.match(/\/(?:embed|shorts|live)\/([^/?]+)/)?.[1];
  }
  if (id) return `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&modestbranding=1&playsinline=1`;
  if (host === 'vimeo.com' || host === 'player.vimeo.com') {
    const vid = url.pathname.match(/(\d+)/)?.[1];
    if (vid) return `https://player.vimeo.com/video/${vid}?autoplay=1`;
  }
  return null;
}

// Accessible video dialog: Escape / backdrop closes it, focus is trapped
// inside while open and returned to the trigger on close, page scroll is locked.
export default function VideoModal({ title, src = '', poster = '', onClose }) {
  const boxRef = useRef(null);
  const embed = src ? toEmbed(src) : null;

  useEffect(() => {
    const prevFocus = document.activeElement;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    boxRef.current?.querySelector('button')?.focus();

    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'Tab') {
        const els = boxRef.current?.querySelectorAll('button, [href], iframe, video, [tabindex]:not([tabindex="-1"])');
        if (!els?.length) return;
        const first = els[0];
        const last = els[els.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
      prevFocus?.focus?.();
    };
  }, [onClose]);

  return (
    <div className="modal" onClick={onClose}>
      <div
        className="modal__box"
        ref={boxRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="modal__close" onClick={onClose} aria-label="Close video">×</button>
        {!src ? (
          <div className="modal__video">
            <span className="play-ic play-ic--lg" aria-hidden="true">▶</span>
            <p>Video coming soon.</p>
          </div>
        ) : embed ? (
          <iframe
            className="modal__player"
            src={embed}
            title={title}
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
          />
        ) : (
          <video className="modal__player" src={src} poster={poster || undefined} controls autoPlay playsInline>
            Your browser can't play this video.
          </video>
        )}
      </div>
    </div>
  );
}
