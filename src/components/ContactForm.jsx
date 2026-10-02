import { useEffect, useRef, useState } from 'react';
import { brand } from '../data';

const TOPICS = [
  { value: 'sales', label: 'Talk to sales' },
  { value: 'demo', label: 'Book a call / demo' },
  { value: 'brochure', label: 'Request a brochure' },
  { value: 'support', label: 'Support' },
  { value: 'other', label: 'Something else' },
];
const EMPTY = { name: '', email: '', company: '', phone: '', topic: 'sales', message: '', website: '' };

export default function ContactForm() {
  const [form, setForm] = useState(EMPTY);
  const [status, setStatus] = useState('idle'); // idle | sending | sent | error
  const [error, setError] = useState('');
  const [fields, setFields] = useState({});
  const nameRef = useRef(null);

  // Any link with data-topic="…" (e.g. "Request Brochure") pre-selects the topic
  useEffect(() => {
    const onClick = (e) => {
      const topic = e.target.closest?.('a[data-topic]')?.dataset.topic;
      if (topic && TOPICS.some((t) => t.value === topic)) {
        setForm((f) => ({ ...f, topic }));
        setStatus((s) => (s === 'sent' ? 'idle' : s));
      }
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  const set = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    if (fields[key]) setFields((f) => ({ ...f, [key]: undefined }));
  };

  const submit = async (e) => {
    e.preventDefault();
    setStatus('sending');
    setError('');
    setFields({});
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.ok) {
        setFields(json.fields || {});
        throw new Error(json.error || 'Something went wrong. Please try again.');
      }
      setStatus('sent');
      setForm(EMPTY);
    } catch (err) {
      setStatus('error');
      setError(
        err instanceof TypeError
          ? `Couldn't reach the server. Please email us at ${brand.email}.`
          : err.message
      );
    }
  };

  if (status === 'sent') {
    return (
      <div className="contact-form contact-form--done" role="status">
        <strong>Thanks — your message is on its way.</strong>
        <p>We usually reply within one business day.</p>
        <button type="button" className="btn btn--glass" onClick={() => { setStatus('idle'); setTimeout(() => nameRef.current?.focus()); }}>
          Send another message
        </button>
      </div>
    );
  }

  const field = (key, label, props = {}) => (
    <label className={`cf-field ${props.wide ? 'cf-field--wide' : ''}`}>
      <span>{label}{props.required && <em aria-hidden="true"> *</em>}</span>
      {props.textarea ? (
        <textarea
          value={form[key]} onChange={set(key)} required={props.required} rows={4} maxLength={3000}
          aria-invalid={!!fields[key]} aria-describedby={fields[key] ? `cf-err-${key}` : undefined}
        />
      ) : (
        <input
          ref={key === 'name' ? nameRef : undefined}
          type={props.type || 'text'} value={form[key]} onChange={set(key)} required={props.required}
          autoComplete={props.autoComplete} maxLength={props.maxLength || 200}
          aria-invalid={!!fields[key]} aria-describedby={fields[key] ? `cf-err-${key}` : undefined}
        />
      )}
      {fields[key] && <small className="cf-err" id={`cf-err-${key}`}>{fields[key]}</small>}
    </label>
  );

  return (
    <form className="contact-form" onSubmit={submit}>
      {field('name', 'Name', { required: true, autoComplete: 'name', maxLength: 100 })}
      {field('email', 'Work email', { required: true, type: 'email', autoComplete: 'email' })}
      {field('company', 'Company', { autoComplete: 'organization', maxLength: 150 })}
      {field('phone', 'Phone', { type: 'tel', autoComplete: 'tel', maxLength: 40 })}

      <label className="cf-field cf-field--wide">
        <span>How can we help?</span>
        <select value={form.topic} onChange={set('topic')}>
          {TOPICS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
      </label>

      {field('message', 'Message', { required: true, textarea: true, wide: true })}

      {/* Honeypot for bots — hidden from people and screen readers */}
      <input
        className="cf-hp" type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true"
        value={form.website} onChange={set('website')}
      />

      <div className="cf-actions">
        <button type="submit" className="btn btn--accent" disabled={status === 'sending'}>
          {status === 'sending' ? 'Sending…' : 'Send Message'}
        </button>
        {status === 'error' && <p className="cf-error" role="alert">{error}</p>}
      </div>
    </form>
  );
}
