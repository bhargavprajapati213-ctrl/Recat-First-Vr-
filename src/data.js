// All site content lives here — edit this file to re-skin the site.
// Photos: drop files in /public/images and set the `image` fields (e.g. '/images/hero.jpg').
// When an image is empty or fails to load, a styled placeholder visual is shown instead.

export const brand = {
  name: 'Spark XR',
  short: 'SX',
  email: 'hello@sparkxr.com',
  tagline: 'VR Safety & Soft Skills Training',
  blurb:
    'Trusted by enterprise-level organisations, safety managers, and learning & development professionals worldwide.',
};

// Links to pages outside this site. Leave a field empty ('') and:
// login uses the built-in /login page, brochure falls back to the contact section, the others are hidden.
export const links = {
  login: '',
  brochure: '', // e.g. '/brochure.pdf' (put the file in /public)
  allCases: '',
  privacy: '',
  terms: '',
};

export const nav = [
  { label: 'VR Library', href: '#plan-library' },
  { label: 'Analytics', href: '#plan-analytics' },
  { label: 'Custom VR', href: '#plan-custom' },
  { label: 'Pricing', href: '#plans' },
  {
    label: 'Support',
    href: '#plan-support',
    dropdown: [
      { label: 'Help Centre', href: '#contact', topic: 'support' },
      { label: 'Onboarding', href: '#plan-support' },
      { label: 'Hardware', href: '#plan-headsets' },
    ],
  },
  {
    label: 'Learn More',
    href: '#cases',
    dropdown: [
      { label: 'Case Studies', href: '#cases' },
      { label: 'Clients & Awards', href: '#clients' },
      { label: 'Solutions', href: '#solutions' },
    ],
  },
];

export const hero = {
  title: ['VR Safety & Soft', 'Skills Training'],
  image: '',
  // Video for the "Watch Video" button. `src` can be a YouTube or Vimeo link
  // (e.g. 'https://www.youtube.com/watch?v=XXXX') or a file in /public (e.g. '/videos/intro.mp4').
  video: { label: 'Watch Video', sub: 'How it works', src: '', poster: '' },
};

export const solutions = [
  {
    tab: 'Improve engagement',
    title: 'Improve engagement',
    text:
      'Immersive scenarios put learners inside the moment that matters. Hands-on practice in VR keeps attention high and turns passive compliance training into something people actually want to finish.',
    image: '',
  },
  {
    tab: 'Enhance learning outcomes',
    title: 'Enhance learning outcomes',
    text:
      'Learners retain more when they learn by doing. Branching scenarios, instant feedback and repeatable practice help skills stick long after the headset comes off.',
    image: '',
  },
  {
    tab: 'Reduce incident rates',
    title: 'Reduce incident rates',
    text:
      'Rehearse high-risk tasks — working at height, confined spaces, lockout/tagout — with zero real-world risk, so teams recognise hazards before they meet them on site.',
    image: '',
  },
  {
    tab: 'Innovate training frameworks',
    title: 'Innovate training frameworks',
    text:
      'Plug VR modules into your existing LMS, track progress in one dashboard and roll out new programmes across sites and countries in days, not months.',
    image: '',
  },
];

export const cases = [
  {
    client: 'Northwind Energy',
    title: 'Transforming safety training at Northwind Energy with immersive VR',
    text:
      'Northwind Energy, a regional operator of power generation equipment, rolled out VR safety modules across four sites. Technicians now practise isolation procedures and emergency response before stepping onto the plant floor.',
    tags: ['Enhanced Engagement', 'Improved Safety Awareness', 'Operational Efficiency'],
    image: '',
    video: '', // YouTube / Vimeo link or '/videos/file.mp4'
  },
  {
    client: 'Harbourline Logistics',
    title: 'Forklift and warehouse safety at scale for Harbourline Logistics',
    text:
      'Harbourline trained 1,200 warehouse staff in pedestrian-vehicle interaction scenarios, cutting onboarding time and giving supervisors clear, comparable competency data.',
    tags: ['Faster Onboarding', 'Consistent Assessment', 'Fewer Near-misses'],
    image: '',
    video: '', // YouTube / Vimeo link or '/videos/file.mp4'
  },
  {
    client: 'Altura Construction',
    title: 'Working-at-height readiness for Altura Construction crews',
    text:
      'Altura used custom-built VR sites modelled on their own projects so crews could walk the job, spot hazards and rehearse rescue plans before mobilisation.',
    tags: ['Custom Scenarios', 'Hazard Recognition', 'Site Readiness'],
    image: '',
    video: '', // YouTube / Vimeo link or '/videos/file.mp4'
  },
];

// Invented client names rendered as simple wordmarks — replace with your real, permitted logos.
export const clients = [
  { name: 'Northwind', style: 'serif' },
  { name: 'HARBOURLINE', style: 'wide' },
  { name: 'altura', style: 'lower' },
  { name: 'Kestrel', style: 'italic' },
  { name: 'MERIDIAN', style: 'block' },
  { name: 'Solvane', style: 'light' },
  { name: 'QUARRY&CO', style: 'wide' },
  { name: 'Brightwell', style: 'serif' },
  { name: 'OX4', style: 'block' },
  { name: 'Pelican', style: 'italic' },
  { name: 'TERRAFORGE', style: 'wide' },
  { name: 'lumen', style: 'lower' },
  { name: 'Cobalt', style: 'light' },
  { name: 'VANTA', style: 'block' },
];

export const awards = [
  'Best Immersive Learning',
  'Innovation in Safety',
  'EdTech Excellence',
  'Workplace Learning',
  'XR Impact Award',
  'Top Training Provider',
];

export const plans = {
  intro:
    'Unlock the future of professional development with Spark XR — your all-access pass to immersive VR training and mentorship experiences.',
  items: [
    {
      id: 'library',
      title: 'VR Training Library',
      text: '120+ ready-to-deploy modules across safety, compliance and soft skills.',
      image: '',
    },
    {
      id: 'analytics',
      title: 'Training Analytics',
      text: 'Completion, scores and behaviour data for every learner and site.',
    },
    {
      id: 'headsets',
      title: 'VR Headset Plans',
      text: 'Pre-configured headsets shipped, managed and swapped when needed.',
      image: '',
    },
    {
      id: 'support',
      title: 'Tech Support & Onboarding',
      text: 'Kick-off workshops, trainer certification and a named success manager.',
    },
    {
      id: 'custom',
      title: 'Custom Built VR',
      text: 'Your sites, your equipment, your procedures — recreated in VR.',
    },
  ],
};

export const analytics = [
  22, 30, 26, 38, 34, 46, 40, 52, 48, 60, 72, 66, 80, 58, 70, 62, 54, 44, 50, 38, 42, 34, 46, 30, 36, 40,
];

export const cta = {
  title: 'Spark XR Delivers',
  text:
    'Spark XR delivers a fully integrated solution for corporate learning through virtual reality. Our platform combines an extensive library of VR courses in safety and soft skills with a powerful LMS and built-in analytics — all packaged with wireless VR headsets, ready to use out of the box.',
};

export const footer = {
  links: [
    { label: 'Soft Skills', href: '#solutions' },
    { label: 'Analytics', href: '#plan-analytics' },
    { label: 'Custom VR', href: '#plan-custom' },
    { label: 'Pricing', href: '#plans' },
  ],
  // Set `url` to your profile pages; a social with an empty url is hidden.
  socials: [
    { id: 'in', label: 'LinkedIn', url: 'https://www.linkedin.com/' },
    { id: 'x', label: 'X (Twitter)', url: 'https://x.com/' },
    { id: 'yt', label: 'YouTube', url: 'https://www.youtube.com/' },
  ],
  locations: [
    'India (HQ)', 'USA', 'United Arab Emirates', 'United Kingdom', 'Australia', 'Singapore',
    'Malaysia', 'South Africa', 'New Zealand', 'Saudi Arabia', 'Qatar', 'Oman', 'Kuwait', 'Egypt',
  ],
};
