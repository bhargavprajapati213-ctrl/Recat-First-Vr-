# Spark XR — React landing page + contact API

A React + Vite landing page for a VR safety & soft-skills training platform: hero, solutions slider, case-study carousel, client logos and awards, subscription-plan bento cards, a dark CTA with a contact form, and a footer. A small Express server receives the contact form.

## Run it

Requires Node.js 22.9 or newer.

```bash
npm install
cp .env.example .env   # optional: email + admin settings
npm run dev            # site on http://localhost:5173, API on http://localhost:3001
```

`npm run dev` starts both the website and the API (`npm run dev:web` / `npm run dev:api` start one each). In development Vite forwards `/api/*` to the API server.

### Production

```bash
npm run build   # builds the site into /dist
npm start       # one server on http://localhost:3001 serving the site and the API
```

Deploy to any Node host (Render, Railway, a VPS…). Set the variables from `.env.example` in the host's settings, and `TRUST_PROXY=1` when it runs behind a proxy.

## Contact form backend

- `POST /api/contact` — JSON `{ name, email, company?, phone?, topic, message }`. Validated, rate-limited (5 per IP per 10 min) and protected by a hidden honeypot field against bots.
- Every submission is saved to `server/data/submissions.jsonl` (one JSON object per line).
- **Email notifications:** set `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `MAIL_FROM` and `MAIL_TO` in `.env`. Replies go straight to the visitor (Reply-To). If email fails, the submission is still saved.
- **Read submissions:** set `ADMIN_TOKEN` in `.env`, then
  `curl -H "Authorization: Bearer <ADMIN_TOKEN>" http://localhost:3001/api/submissions`
- `GET /api/health` — reports whether email is configured.

## Login

- Pages: `/login` (log in / sign up tabs) and `/account` (signed-in area). The header's **Login** button turns into **My Account** once signed in.
- API: `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me`.
- Passwords are hashed with scrypt; accounts are stored in `server/data/users.json`. Sessions are signed, httpOnly cookies valid for 7 days.
- Set `SESSION_SECRET` in `.env` so people stay logged in when the server restarts. Set `ALLOW_SIGNUP=false` to disable self sign-up.
- Login and sign-up are rate-limited (10 attempts per IP per 10 min).

Buttons that link to `#contact` with `data-topic="brochure"` (or `sales`, `demo`, `support`, `other`) pre-select that topic in the form.

## Customise

- **Text, clients, plans, locations, links:** everything is in `src/data.js` (external URLs such as login, brochure, privacy and terms are in `links`).
- **Photos:** put images in `public/images/` and set the `image` fields in `src/data.js` (e.g. `image: '/images/hero.jpg'`). While a field is empty, a styled headset placeholder is shown.
- **Colours and fonts:** edit the CSS variables at the top of `src/styles.css` (`--accent` is the orange).
- **Video:** set `hero.video.src` in `src/data.js` to a YouTube/Vimeo link or a file in `public/videos/` (e.g. `/videos/intro.mp4`). The "Watch Video" button only appears once a video is set; case studies work the same way with their `video` field.
- **Client logos speed:** `--marquee-speed` in `src/styles.css` (lower = faster).

## Structure

```
server/
  index.js             Express app: API routes, rate limit, serves /dist in production
  validate.js          contact form validation
  storage.js           saves / lists submissions (server/data/submissions.jsonl)
  mailer.js            optional email notifications (nodemailer)
  auth.js              login / sign-up / logout routes, session cookies
  users.js             user store + password hashing
  rateLimit.js         shared in-memory rate limiter
src/
  App.jsx              routes: landing page, /login, /account
  router.js            tiny client-side router
  auth.js              login state + API helpers (useUser)
  pages/
    Login.jsx          log in / sign up page
    Account.jsx        signed-in account page
  data.js              all content
  styles.css           all styles + responsive rules
  components/
    Header.jsx         glass navbar, dropdowns, mobile menu
    Hero.jsx           hero + video button
    VideoModal.jsx     accessible video dialog
    Solutions.jsx      "I Want To" tabs, auto-advancing
    Cases.jsx          case-study carousel
    Clients.jsx        auto-scrolling client logos + awards
    Plans.jsx          subscription bento + animated analytics chart
    Footer.jsx         dark CTA (with contact form) + footer
    ContactForm.jsx    contact form that posts to /api/contact
    Visual.jsx         image with placeholder fallback
    Logo.jsx           brand marks
```
