export const TOPICS = ['sales', 'demo', 'brochure', 'support', 'other'];

const LIMITS = { name: 100, email: 200, company: 150, phone: 40, message: 3000 };
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const clean = (v, max) => (typeof v === 'string' ? v.replace(/\s+/g, ' ').trim().slice(0, max) : '');

// Returns { data } with cleaned fields, or { errors } keyed by field name.
export function validateContact(body = {}) {
  const data = {
    name: clean(body.name, LIMITS.name),
    email: clean(body.email, LIMITS.email).toLowerCase(),
    company: clean(body.company, LIMITS.company),
    phone: clean(body.phone, LIMITS.phone),
    topic: TOPICS.includes(body.topic) ? body.topic : 'other',
    // keep line breaks in the message, only trim it
    message: typeof body.message === 'string' ? body.message.trim().slice(0, LIMITS.message) : '',
  };

  const errors = {};
  if (data.name.length < 2) errors.name = 'Please enter your name.';
  if (!EMAIL_RE.test(data.email)) errors.email = 'Please enter a valid email address.';
  if (data.phone && !/^[+\d][\d\s().-]{5,}$/.test(data.phone)) errors.phone = 'Please enter a valid phone number.';
  if (data.message.length < 10) errors.message = 'Please write a message of at least 10 characters.';

  return Object.keys(errors).length ? { errors } : { data };
}
