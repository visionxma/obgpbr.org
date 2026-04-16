'use client';

import { useState, useEffect } from 'react';
import Link from "next/link";
import { usePathname } from 'next/navigation';
import { Menu, X, ArrowUpRight } from "lucide-react";

const NAV_ITEMS = [
  { label: 'Quem Somos', path: '/quem-somos' },
  { label: 'Atuação', path: '/atuacao' },
  { label: 'Serviços', path: '/servicos' },
  { label: 'Experiências', path: '/experiencias' },
  { label: 'Selo OSC', path: '/selo-osc' },
  { label: 'Transparência', path: '/transparencia' },
  { label: 'Contato', path: '/contato' },
];

const FOOTER_LINKS = [
  { label: 'Quem Somos', href: '/quem-somos' },
  { label: 'Atuação', href: '/atuacao' },
  { label: 'Serviços', href: '/servicos' },
  { label: 'Transparência', href: '/transparencia' },
  { label: 'Selo OSC', href: '/selo-osc' },
  { label: 'Contato', href: '/contato' },
];

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const isActive = (path: string) => pathname === path;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  return (
    <>
      {/* ════════ HEADER ════════ */}
      <header className={`site-header ${scrolled ? 'site-header--scrolled' : ''}`}>
        <div className="header-inner">
          {/* Logo */}
          <Link href="/quem-somos" className="header-logo">
            <span className="header-logo-text">OBGP</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="header-nav">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className={`header-nav-link ${isActive(item.path) ? 'active' : ''}`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Mobile Toggle */}
          <button
            className="header-mobile-toggle"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menu"
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      {/* ════════ MOBILE MENU ════════ */}
      {menuOpen && (
        <>
          <div className="mobile-overlay" onClick={() => setMenuOpen(false)} />
          <nav className="mobile-menu">
            {NAV_ITEMS.map((item, i) => (
              <Link
                key={item.path}
                href={item.path}
                onClick={() => setMenuOpen(false)}
                className={`mobile-menu-link ${isActive(item.path) ? 'active' : ''}`}
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                <span>{item.label}</span>
                <ArrowUpRight size={16} style={{ opacity: 0.4 }} />
              </Link>
            ))}
          </nav>
        </>
      )}

      {/* ════════ MAIN ════════ */}
      <main style={{ minHeight: 'calc(100vh - 80px)' }}>
        {children}
      </main>

      {/* ════════ FOOTER ════════ */}
      <footer className="site-footer">
        <div className="container">
          <div className="footer-grid">
            {/* Brand */}
            <div className="footer-brand">
              <span className="footer-logo-text">OBGP</span>
              <p className="footer-desc">
                Organização da Sociedade Civil sem fins lucrativos que atua em educação, saúde e assistência social.
              </p>
            </div>

            {/* Links */}
            <div className="footer-col">
              <h4 className="footer-col-title">Institucional</h4>
              <ul className="footer-links">
                {FOOTER_LINKS.map(({ label, href }) => (
                  <li key={href}>
                    <Link href={href} className="footer-link">{label}</Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contato */}
            <div className="footer-col">
              <h4 className="footer-col-title">Contato</h4>
              <ul className="footer-links">
                <li>
                  <a href="mailto:contato.org.obgp@gmail.com" className="footer-link">
                    contato.org.obgp@gmail.com
                  </a>
                </li>
                <li>
                  <a href="tel:+5598987100001" className="footer-link">
                    (98) 9 8710-0001
                  </a>
                </li>
                <li>
                  <span className="footer-link" style={{ cursor: 'default' }}>
                    Paço do Lumiar/MA
                  </span>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="footer-bottom">
            <p>&copy; {new Date().getFullYear()} OBGP. Todos os direitos reservados.</p>
            <a
              href="https://visionxma.com"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-credit"
            >
              Desenvolvido por{' '}
              <strong>VisionX</strong>
            </a>
          </div>
        </div>
      </footer>

      {/* ════════ STYLES ════════ */}
      <style>{`
        /* ── Header ────────────────────────── */
        .site-header {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          z-index: 1000;
          background: var(--site-primary);
          transition: all 0.5s cubic-bezier(0.22, 1, 0.36, 1);
        }

        .site-header--scrolled {
          top: 12px;
          left: 50%;
          width: calc(100% - 32px);
          max-width: 1200px;
          transform: translateX(-50%);
          border-radius: var(--site-radius-full);
          background: rgba(13, 54, 79, 0.95);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
          border: 1px solid rgba(255,255,255,0.1);
        }

        .header-inner {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 24px;
          height: 64px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .header-logo {
          display: flex;
          align-items: center;
          text-decoration: none;
        }

        .header-logo-text {
          font-family: var(--font-outfit);
          font-size: 1.5rem;
          font-weight: 800;
          color: white;
          letter-spacing: 0.05em;
        }

        .header-nav {
          display: none;
          align-items: center;
          gap: 4px;
        }

        .header-nav-link {
          padding: 8px 14px;
          font-size: 0.875rem;
          font-weight: 500;
          color: rgba(255,255,255,0.7);
          border-radius: var(--site-radius-full);
          transition: all 0.2s ease;
          text-decoration: none;
          white-space: nowrap;
        }

        .header-nav-link:hover {
          color: white;
          background: rgba(255,255,255,0.1);
        }

        .header-nav-link.active {
          color: white;
          background: rgba(255,255,255,0.15);
          font-weight: 600;
        }

        .header-mobile-toggle {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 44px;
          height: 44px;
          border: none;
          background: rgba(255,255,255,0.1);
          color: white;
          border-radius: var(--site-radius-md);
          cursor: pointer;
          transition: background 0.2s ease;
        }

        .header-mobile-toggle:hover {
          background: rgba(255,255,255,0.2);
        }

        @media (min-width: 1024px) {
          .header-nav { display: flex; }
          .header-mobile-toggle { display: none; }
        }

        /* ── Mobile Menu ───────────────────── */
        .mobile-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.6);
          backdrop-filter: blur(4px);
          z-index: 998;
          animation: fadeIn 0.2s ease-out;
        }

        .mobile-menu {
          position: fixed;
          top: 0;
          right: 0;
          width: min(360px, 85vw);
          height: 100vh;
          background: var(--site-primary);
          z-index: 999;
          padding: 88px 24px 32px;
          display: flex;
          flex-direction: column;
          gap: 4px;
          overflow-y: auto;
          animation: slideInRight 0.3s cubic-bezier(0.22, 1, 0.36, 1);
        }

        .mobile-menu-link {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 16px;
          color: rgba(255,255,255,0.7);
          font-size: 1.05rem;
          font-weight: 500;
          border-radius: var(--site-radius-md);
          text-decoration: none;
          transition: all 0.2s ease;
          animation: fadeInUp 0.4s cubic-bezier(0.22, 1, 0.36, 1) both;
        }

        .mobile-menu-link:hover,
        .mobile-menu-link.active {
          color: white;
          background: rgba(255,255,255,0.1);
        }

        .mobile-menu-link.active {
          font-weight: 700;
        }

        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* ── Footer ────────────────────────── */
        .site-footer {
          background: var(--site-primary);
          color: rgba(255,255,255,0.7);
          padding: 80px 0 0;
          background-image: url('/texture-dark.svg');
          background-repeat: repeat;
          background-size: 300px;
        }

        .footer-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 48px;
          padding-bottom: 48px;
        }

        @media (min-width: 640px) {
          .footer-grid {
            grid-template-columns: 1.5fr 1fr 1fr;
          }
        }

        .footer-brand {
          max-width: 320px;
        }

        .footer-logo-text {
          font-family: var(--font-outfit);
          font-size: 1.75rem;
          font-weight: 800;
          color: white;
          letter-spacing: 0.05em;
          display: block;
          margin-bottom: 16px;
        }

        .footer-desc {
          font-size: 0.9rem;
          line-height: 1.7;
          color: rgba(255,255,255,0.55);
        }

        .footer-col-title {
          font-family: var(--font-outfit);
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          color: rgba(255,255,255,0.4);
          margin-bottom: 20px;
        }

        .footer-links {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .footer-link {
          font-size: 0.9rem;
          color: rgba(255,255,255,0.6);
          text-decoration: none;
          transition: color 0.2s ease;
        }

        .footer-link:hover {
          color: white;
        }

        .footer-bottom {
          display: flex;
          flex-direction: column;
          gap: 12px;
          align-items: center;
          text-align: center;
          padding: 28px 0;
          border-top: 1px solid rgba(255,255,255,0.1);
          font-size: 0.8rem;
          color: rgba(255,255,255,0.35);
        }

        @media (min-width: 640px) {
          .footer-bottom {
            flex-direction: row;
            justify-content: space-between;
          }
        }

        .footer-credit {
          color: rgba(255,255,255,0.35);
          text-decoration: none;
          transition: color 0.2s ease;
        }

        .footer-credit:hover {
          color: rgba(255,255,255,0.7);
        }

        .footer-credit strong {
          font-weight: 700;
          color: rgba(255,255,255,0.6);
        }
      `}</style>
    </>
  );
}
