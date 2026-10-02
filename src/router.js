import { useEffect, useState } from 'react';

// Minimal client-side router: '/', '/login', '/account'. No library needed.
export function navigate(to, { replace = false } = {}) {
  if (to === window.location.pathname + window.location.hash) return;
  window.history[replace ? 'replaceState' : 'pushState']({}, '', to);
  window.dispatchEvent(new PopStateEvent('popstate'));
}

export function usePath() {
  const [path, setPath] = useState(window.location.pathname);
  useEffect(() => {
    const onPop = () => setPath(window.location.pathname);
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);
  return path;
}

// Let plain <a href="/login"> links switch pages without a full reload.
export function useLinkInterception() {
  useEffect(() => {
    const onClick = (e) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = e.target.closest?.('a[href]');
      if (!a || a.target || a.hasAttribute('download')) return;
      const url = new URL(a.href, window.location.href);
      if (url.origin !== window.location.origin || url.pathname.startsWith('/api')) return;
      // Same-page #anchors keep their normal browser behaviour
      if (url.pathname === window.location.pathname && url.hash) return;
      e.preventDefault();
      navigate(url.pathname + url.hash);
      if (url.hash) requestAnimationFrame(() => document.querySelector(url.hash)?.scrollIntoView());
      else window.scrollTo(0, 0);
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);
}
