'use client';

import { useState, useEffect } from 'react';
import Link from "next/link";
import { usePathname } from 'next/navigation';
import { Menu, X } from "lucide-react";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const isActive = (path: string) => pathname === path;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <header className={scrolled ? 'site-header site-header--scrolled' : 'site-header'}>
        <div className="container" style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          height: '56px',
        }}>
          {/* LOGO */}
          <Link href="/quem-somos" style={{ display: 'flex', alignItems: 'center' }}>
            <img
              src="/logo.PNG"
              alt="OBGP"
              style={{ height: 40, width: 'auto', objectFit: 'contain' }}
            />
          </Link>

          {/* DESKTOP NAV */}
          <nav
            style={{
              display: 'none',
              gap: '28px',
              fontWeight: 500,
              fontSize: '0.95rem',
              color: 'rgba(255,255,255,0.85)',
            }}
            className="md-flex"
          >
            {[
              { label: 'Quem Somos', path: '/quem-somos' },
              { label: 'Atuação', path: '/atuacao' },
              { label: 'Nossos Serviços', path: '/servicos' },
              { label: 'Nossas Experiências', path: '/experiencias' },
              { label: 'Selo OSC', path: '/selo-osc' },
              { label: 'Transparência', path: '/transparencia' },
              { label: 'Fale Conosco', path: '/contato' },
            ].map((item) => (
              <Link
                key={item.label}
                href={item.path}
                style={{
                  color: isActive(item.path) ? 'white' : 'rgba(255,255,255,0.75)',
                  fontWeight: isActive(item.path) ? 700 : 500,
                  transition: 'color 0.2s',
                  position: 'relative'
                }}
              >
                {item.label}
                {isActive(item.path) && (
                  <div style={{
                    position: 'absolute', bottom: -16, left: 0, right: 0,
                    height: 3, background: 'white',
                    borderRadius: '4px 4px 0 0'
                  }} />
                )}
              </Link>
            ))}
          </nav>

          {/* ACTIONS E BOTÃO MOBILE */}
          <div style={{ display: 'flex', gap: 16 }}>
            <button
               className="mobile-only"
               onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
               style={{
                 background: 'transparent',
                 border: 'none',
                 color: 'white',
                 cursor: 'pointer',
                 display: 'flex',
                 alignItems: 'center',
                 padding: 8
               }}
            >
               {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>

        {/* MOBILE NAV DROPDOWN */}
        {isMobileMenuOpen && (
          <>
            <div 
              style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0,0,0,0.5)',
                backdropFilter: 'blur(4px)',
                zIndex: 80
              }}
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <div className="mobile-only" style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              background: 'var(--site-primary)',
              borderTop: '1px solid rgba(255, 255, 255, 0.1)',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
              borderRadius: scrolled ? '0 0 16px 16px' : '0 0 0 0',
              zIndex: 90,
              animation: 'mobileMenuFadeIn 0.3s ease-out forwards'
            }}>
              {[
                { label: 'Quem Somos', path: '/quem-somos' },
                { label: 'Atuação', path: '/atuacao' },
                { label: 'Nossos Serviços', path: '/servicos' },
                { label: 'Nossas Experiências', path: '/experiencias' },
                { label: 'Selo OSC', path: '/selo-osc' },
                { label: 'Transparência', path: '/transparencia' },
                { label: 'Fale Conosco', path: '/contato' },
              ].map((item) => (
                <Link
                  key={item.label}
                  href={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  style={{
                    color: isActive(item.path) ? 'white' : 'rgba(255,255,255,0.7)',
                    fontWeight: isActive(item.path) ? 700 : 500,
                    fontSize: '1.1rem',
                    padding: '16px 0',
                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                    textDecoration: 'none',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  {item.label}
                  {isActive(item.path) && <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'white' }} />}
                </Link>
              ))}
            </div>
          </>
        )}
        
        <style>{`
          @media (min-width: 900px) {
            .md-flex { display: flex !important; }
            .mobile-only { display: none !important; }
          }

          /* ── Header animation ── */
          .site-header {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            max-width: 100%;
            z-index: 100;
            background-color: var(--site-primary);
            background-image: url('/texture-dark.svg');
            background-repeat: repeat;
            background-size: 360px 360px;
            backdrop-filter: blur(24px);
            -webkit-backdrop-filter: blur(24px);
            border: 1px solid rgba(255,255,255,0.15);
            border-top: none;
            box-shadow: none;
            border-radius: 0 0 var(--site-radius-lg) var(--site-radius-lg);
            will-change: top, width, box-shadow, transform;
            transition:
              top      0.55s cubic-bezier(0.16, 1, 0.3, 1),
              width    0.55s cubic-bezier(0.16, 1, 0.3, 1),
              left     0.55s cubic-bezier(0.16, 1, 0.3, 1),
              transform 0.55s cubic-bezier(0.16, 1, 0.3, 1),
              box-shadow 0.4s ease,
              border-radius 0.55s cubic-bezier(0.16, 1, 0.3, 1);
          }

          .site-header--scrolled {
            top: 12px;
            left: 50%;
            width: calc(100% - 48px);
            max-width: 1200px;
            transform: translateX(-50%);
            border-radius: var(--site-radius-full);
            border: 1px solid rgba(255,255,255,0.18);
            box-shadow:
              0 2px 8px rgba(0,0,0,0.08),
              0 8px 32px rgba(0, 68, 204, 0.22),
              0 0 0 1px rgba(0,68,204,0.08);
          }
          @keyframes mobileMenuFadeIn {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}</style>
      </header>

      {/* Rende os componentes da página (fade in) */}
      <div style={{ minHeight: 'calc(100vh - 80px - 340px)' }}>
        {children}
      </div>

      <footer
        className="glass-section-white"
        style={{ borderTop: '1px solid var(--site-border)', padding: '72px 0 40px' }}
      >
        <div className="container" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 48,
          marginBottom: 64,
        }}>
          {/* Brand */}
          <div>
            <Link href="/" style={{ display: 'inline-block', marginBottom: 16 }}>
              <img src="/logo.PNG" alt="OBGP" style={{ height: 44, width: 'auto', objectFit: 'contain', filter: 'brightness(0) saturate(100%)' }} />
            </Link>
            <p style={{ color: 'var(--site-text-secondary)', fontSize: '0.92rem', lineHeight: 1.65, maxWidth: 280 }}>
              Formação, Inovação e Desenvolvimento Social para comunidades do Maranhão e Pará desde 2013.
            </p>
          </div>

          {/* Institucional */}
          <div>
            <h4 style={{ fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--site-text-tertiary)', marginBottom: 20 }}>
              Institucional
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { label: 'Início', href: '/' },
                { label: 'Transparência', href: '/transparencia' },
                { label: 'Blog e Notícias', href: '/blog' },
              ].map(({ label, href }) => (
                <li key={href}>
                  <Link href={href} style={{ color: 'var(--site-text-secondary)', fontSize: '0.93rem', textDecoration: 'none', transition: 'color 0.2s' }}
                    onMouseEnter={e => (e.currentTarget.style.color = 'var(--site-text-primary)')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'var(--site-text-secondary)')}>
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Educação */}
          <div>
            <h4 style={{ fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--site-text-tertiary)', marginBottom: 20 }}>
              Educação
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { label: 'Cursos de Capacitação', href: '/cursos' },
                { label: 'Consultoria', href: '/consultoria' },
              ].map(({ label, href }) => (
                <li key={label}>
                  <Link href={href} style={{ color: 'var(--site-text-secondary)', fontSize: '0.93rem', textDecoration: 'none', transition: 'color 0.2s' }}
                    onMouseEnter={e => (e.currentTarget.style.color = 'var(--site-text-primary)')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'var(--site-text-secondary)')}>
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="container" style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          flexWrap: 'wrap', gap: 16, paddingTop: 28,
          borderTop: '1px solid var(--site-border)',
          color: 'var(--site-text-tertiary)', fontSize: '0.82rem',
        }}>
          <p>&copy; {new Date().getFullYear()} OBGP. Educação que transforma.</p>
          <a
            href="https://visionxma.com"
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: 'flex', alignItems: 'center', gap: 5, textDecoration: 'none', color: 'var(--site-text-tertiary)' }}
          >
            Desenvolvido por{' '}
            <span style={{
              fontWeight: 800,
              letterSpacing: '0.05em',
              background: 'linear-gradient(90deg, #0D364F, #23475E)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              VisionX
            </span>
          </a>
        </div>
      </footer>
    </>
  );
}
