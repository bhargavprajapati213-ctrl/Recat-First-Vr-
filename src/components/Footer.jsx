import { brand, cta, footer, links } from '../data';
import Logo from './Logo';
import ContactForm from './ContactForm';

const icons = {
  in: <path d="M6 9h3v9H6zM7.5 5a1.6 1.6 0 110 3.2 1.6 1.6 0 010-3.2zM11 9h2.9v1.3c.4-.8 1.4-1.5 2.9-1.5 3 0 3.5 1.9 3.5 4.4V18h-3v-4.2c0-1 0-2.3-1.4-2.3s-1.7 1.1-1.7 2.2V18H11z" />,
  x: <path d="M5 5h3.6l3.6 5 4.2-5H18l-5 6 5.6 8H15l-3.9-5.4L6.5 19H5l5.3-6.4z" />,
  yt: <path d="M20 8.5c-.2-1.3-1-2-2.3-2.2C15.8 6 12 6 12 6s-3.8 0-5.7.3C5 6.5 4.2 7.2 4 8.5 3.8 9.8 3.8 12 3.8 12s0 2.2.2 3.5c.2 1.3 1 2 2.3 2.2 1.9.3 5.7.3 5.7.3s3.8 0 5.7-.3c1.3-.2 2.1-.9 2.3-2.2.2-1.3.2-3.5.2-3.5s0-2.2-.2-3.5zM10.3 14.6V9.4l4.5 2.6z" />,
};

export function CTA() {
  return (
    <section className="cta" id="contact">
      <svg className="cta__lines" viewBox="0 0 800 400" preserveAspectRatio="none" aria-hidden="true">
        <path d="M0 380 L260 120 L520 300 L800 40" />
        <path d="M60 0 L300 260 L640 380" />
        <path d="M420 0 L520 300 L760 400" />
        <path d="M0 200 L260 120 L800 180" />
      </svg>
      <h2>{cta.title}</h2>
      <p>{cta.text}</p>
      <ContactForm />
    </section>
  );
}

export default function Footer() {
  const socials = footer.socials.filter((s) => s.url);
  return (
    <footer className="footer" id="footer">
      <div className="footer__left">
        <Logo />
        <h3>{brand.tagline.replace(' Skills', ' Skills')}</h3>
        <p>{brand.blurb}</p>
        <div className="footer__btns">
          <a href="#contact" data-topic="sales" className="btn btn--accent">Contact Sales</a>
          <a href="#contact" data-topic="demo" className="btn btn--outline">Book a Call</a>
        </div>
      </div>

      <div className="footer__right">
        <nav className="footer__links">
          {footer.links.map((l) => <a key={l.label} href={l.href}>{l.label}</a>)}
        </nav>
        <a className="footer__email" href={`mailto:${brand.email}`}>{brand.email}</a>

        {socials.length > 0 && (
          <>
            <p className="eyebrow">Social Links</p>
            <div className="socials">
              {socials.map((s) => (
                <a key={s.id} href={s.url} target="_blank" rel="noopener noreferrer" aria-label={s.label}>
                  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">{icons[s.id]}</svg>
                </a>
              ))}
            </div>
          </>
        )}

        <p className="eyebrow">Locations</p>
        <div className="chips">
          {footer.locations.map((l) => <span key={l}>{l}</span>)}
        </div>
      </div>

      <div className="footer__legal">
        <span>© {new Date().getFullYear()} {brand.name}</span>
        {links.privacy && <a href={links.privacy}>Privacy Policy</a>}
        {links.terms && <a href={links.terms}>Terms Of Use</a>}
      </div>
    </footer>
  );
}
