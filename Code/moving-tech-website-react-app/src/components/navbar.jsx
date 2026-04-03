import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../styles/components.css';

export default function Navbar() {
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`}>
      <div className="navbar__inner">
        <Link to="/" className="navbar__logo">
          <span className="navbar__logo-icon">MT</span>
          <div>
            <div className="navbar__logo-name">movingtech.ai</div>
            <div className="navbar__logo-tagline">AI tools for the moving industry</div>
          </div>
        </Link>

        <div className="navbar__links">
          <Link
            to="/"
            className={`navbar__link ${location.pathname === '/' ? 'navbar__link--active' : ''}`}
          >
            Home
          </Link>
          <Link
            to="/directory"
            className={`navbar__link ${location.pathname === '/directory' ? 'navbar__link--active' : ''}`}
          >
            Directory
          </Link>
        </div>

        <Link to="/directory" className="navbar__cta">
          Browse Software
        </Link>
      </div>
    </nav>
  );
}