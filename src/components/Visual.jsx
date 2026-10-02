import { useEffect, useId, useState } from 'react';

/**
 * Shows a photo when `src` is set; otherwise (or if it fails to load)
 * renders a styled placeholder with a VR headset illustration.
 */
export default function Visual({ src, alt = '', variant = 'warm', className = '' }) {
  const [failed, setFailed] = useState(false);
  // Unique per instance so several placeholders never share a gradient id
  const gradId = `hs-${useId().replace(/:/g, '')}`;

  // A new src gets a fresh chance to load
  useEffect(() => setFailed(false), [src]);

  if (src && !failed) {
    return (
      <div className={`visual ${className}`}>
        <img src={src} alt={alt} loading="lazy" onError={() => setFailed(true)} />
      </div>
    );
  }

  return (
    <div className={`visual visual--ph visual--${variant} ${className}`} role="img" aria-label={alt}>
      <svg className="visual__headset" viewBox="0 0 200 120" aria-hidden="true">
        <defs>
          <linearGradient id={gradId} x1="0" x2="1" y1="0" y2="1">
            <stop offset="0" stopColor="#ffffff" stopOpacity="0.95" />
            <stop offset="1" stopColor="#dfe3e8" stopOpacity="0.9" />
          </linearGradient>
        </defs>
        <path d="M12 58 Q4 60 6 72" stroke="rgba(255,255,255,.55)" strokeWidth="6" fill="none" strokeLinecap="round" />
        <path d="M188 58 Q196 60 194 72" stroke="rgba(255,255,255,.55)" strokeWidth="6" fill="none" strokeLinecap="round" />
        <rect x="18" y="26" width="164" height="72" rx="30" fill={`url(#${gradId})`} />
        <rect x="30" y="38" width="140" height="48" rx="22" fill="rgba(20,22,26,.88)" />
        <ellipse cx="72" cy="62" rx="20" ry="10" fill="rgba(255,90,31,.35)" />
        <ellipse cx="128" cy="62" rx="20" ry="10" fill="rgba(255,90,31,.35)" />
        <path d="M92 86 Q100 76 108 86" fill="#e4e7eb" />
      </svg>
    </div>
  );
}
