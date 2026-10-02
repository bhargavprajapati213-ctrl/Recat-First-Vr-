import { useEffect } from 'react';
import Hero from './components/Hero';
import Solutions from './components/Solutions';
import Plans from './components/Plans';
import Cases from './components/Cases';
import Clients from './components/Clients';
import Footer, { CTA } from './components/Footer';
import Login from './pages/Login';
import Account from './pages/Account';
import Admin from './pages/Admin';
import { useLinkInterception, usePath } from './router';

const SITE_TITLE = document.title;

function Landing() {
  useEffect(() => {
    document.title = SITE_TITLE;
    // Arriving from another page with a #section in the URL → scroll to it
    if (window.location.hash) document.querySelector(window.location.hash)?.scrollIntoView();
  }, []);

  return (
    <div className="page">
      <Hero />
      <Solutions />
      <div className="container"><Cases /></div>
      <div className="container"><Clients /></div>
      <Plans />
      <div className="container"><CTA /></div>
      <div className="container"><Footer /></div>
    </div>
  );
}

export default function App() {
  const path = usePath().replace(/\/+$/, '') || '/';
  useLinkInterception();

  if (path === '/login') return <Login />;
  if (path === '/account') return <Account />;
  if (path === '/admin') return <Admin />;
  return <Landing />;
}
