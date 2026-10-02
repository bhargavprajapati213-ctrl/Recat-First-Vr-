import { brand } from '../data';

// Brand marks. `small` = round orange spark badge for the nav.
export default function Logo({ small = false }) {
  if (small) {
    return (
      <span className="logo-badge" aria-hidden="true">
        <svg viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="11" fill="#ff5a1f" />
          <path d="M13.2 4.5 L7.5 13 H11.4 L10.6 19.5 L16.5 10.8 H12.5 Z" fill="#fff" strokeLinejoin="round" />
        </svg>
      </span>
    );
  }
  return <div className="logo-mark" role="img" aria-label={brand.name}>{brand.short}</div>;
}
