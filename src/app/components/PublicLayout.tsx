'use client';

import { useState, useEffect } from 'react';
import Link from "next/link";
import { usePathname } from 'next/navigation';
import { Menu, X, ArrowUpRight, Mail, Phone, MapPin } from "lucide-react";

const NAV_ITEMS = [
  { label: 'Início', path: '/inicio' },
  { label: 'Serviços', path: '/servicos' },
  { label: 'Experiências', path: '/experiencias' },
  { label: 'Selo OSC', path: '/selo-osc' },
  { label: 'Transparência', path: '/transparencia' },
  { label: 'Contato', path: '/inicio#contato' },
];

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const isActive = (path: string) => {
    const clean = path.split('#')[0];
    return pathname === clean;
  };

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  return (
    <>
      {/* ═══ HEADER ═══ */}
      <header className={`hdr ${scrolled ? 'hdr--float' : ''}`}>
        <div className="hdr-inner">
          <Link href="/inicio" className="hdr-logo">
            <span className="hdr-logo-mark">OBGP</span>
          </Link>

          <nav className="hdr-nav">
            {NAV_ITEMS.map(item => (
              <Link key={item.path} href={item.path}
                className={`hdr-link ${isActive(item.path) ? 'active' : ''}`}>
                {item.label}
              </Link>
            ))}
          </nav>

          <button className="hdr-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </header>

      {/* ═══ MOBILE MENU ═══ */}
      {menuOpen && (
        <>
          <div className="mob-overlay" onClick={() => setMenuOpen(false)} />
          <nav className="mob-menu">
            <div className="mob-menu-top">
              <span className="hdr-logo-mark" style={{ fontSize: '1.3rem' }}>OBGP</span>
              <button className="hdr-toggle" onClick={() => setMenuOpen(false)} aria-label="Fechar">
                <X size={22} />
              </button>
            </div>
            {NAV_ITEMS.map((item, i) => (
              <Link key={item.path} href={item.path}
                onClick={() => setMenuOpen(false)}
                className={`mob-link ${isActive(item.path) ? 'active' : ''}`}
                style={{ animationDelay: `${i * 0.04}s` }}>
                <span>{item.label}</span>
                <ArrowUpRight size={15} style={{ opacity: 0.35 }} />
              </Link>
            ))}
            <div style={{ marginTop: 'auto', padding: '24px 0 0', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
              <a href="mailto:contato.org.obgp@gmail.com" className="mob-contact-link">
                <Mail size={14} /> contato.org.obgp@gmail.com
              </a>
              <a href="tel:+5598987100001" className="mob-contact-link">
                <Phone size={14} /> (98) 9 8710-0001
              </a>
            </div>
          </nav>
        </>
      )}

      {/* ═══ MAIN ═══ */}
      <main style={{ minHeight: '100vh' }}>{children}</main>

      {/* ═══ FOOTER ═══ */}
      <footer className="ftr">
        <div className="container">
          {/* Top area */}
          <div className="ftr-top">
            <div className="ftr-brand">
              <span className="ftr-logo">OBGP</span>
              <p className="ftr-tagline font-cursive">Gestão de parcerias<br />com transparência</p>
            </div>
            <div className="ftr-cols">
              <div className="ftr-col">
                <h4 className="ftr-col-title">Institucional</h4>
                {[
                  { l: 'Início', h: '/inicio' },
                  { l: 'Serviços', h: '/servicos' },
                  { l: 'Selo OSC', h: '/selo-osc' },
                  { l: 'Transparência', h: '/transparencia' },
                ].map(({ l, h }) => (
                  <Link key={h} href={h} className="ftr-link">{l}</Link>
                ))}
              </div>
              <div className="ftr-col">
                <h4 className="ftr-col-title">Contato</h4>
                <a href="mailto:contato.org.obgp@gmail.com" className="ftr-link">
                  <Mail size={13} /> contato.org.obgp@gmail.com
                </a>
                <a href="tel:+5598987100001" className="ftr-link">
                  <Phone size={13} /> (98) 9 8710-0001
                </a>
                <span className="ftr-link" style={{ cursor: 'default' }}>
                  <MapPin size={13} /> Paço do Lumiar/MA
                </span>
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="ftr-bottom">
            <p>&copy; {new Date().getFullYear()} OBGP &mdash; Todos os direitos reservados</p>
            <a href="https://visionxma.com" target="_blank" rel="noopener noreferrer" className="ftr-credit">
              por <strong>VisionX</strong>
            </a>
          </div>
        </div>
      </footer>

      {/* ═══ STYLES ═══ */}
      <style>{`
        /* HEADER */
        .hdr{position:fixed;top:0;left:0;width:100%;z-index:1000;background:var(--site-primary);transition:all .55s cubic-bezier(.22,1,.36,1)}
        .hdr--float{top:12px;left:50%;width:calc(100% - 40px);max-width:1200px;transform:translateX(-50%);border-radius:var(--site-radius-full);background:rgba(13,54,79,.97);backdrop-filter:blur(24px);-webkit-backdrop-filter:blur(24px);box-shadow:0 8px 40px rgba(0,0,0,.18);border:1px solid rgba(255,255,255,.08)}
        .hdr-inner{max-width:1200px;margin:0 auto;padding:0 24px;height:64px;display:flex;align-items:center;justify-content:space-between}
        .hdr-logo{text-decoration:none;display:flex;align-items:center}
        .hdr-logo-mark{font-family:var(--font-heading);font-size:1.5rem;font-weight:800;color:#fff;letter-spacing:.06em}
        .hdr-nav{display:none;align-items:center;gap:2px}
        .hdr-link{padding:7px 14px;font-size:.84rem;font-weight:500;color:rgba(255,255,255,.65);border-radius:var(--site-radius-full);transition:all .2s;text-decoration:none;white-space:nowrap}
        .hdr-link:hover{color:#fff;background:rgba(255,255,255,.08)}
        .hdr-link.active{color:#fff;background:rgba(255,255,255,.12);font-weight:600}
        .hdr-toggle{display:flex;align-items:center;justify-content:center;width:42px;height:42px;border:none;background:rgba(255,255,255,.08);color:#fff;border-radius:var(--site-radius-md);cursor:pointer;transition:background .2s}
        .hdr-toggle:hover{background:rgba(255,255,255,.15)}
        @media(min-width:1024px){.hdr-nav{display:flex}.hdr-toggle{display:none}}

        /* MOBILE */
        .mob-overlay{position:fixed;inset:0;background:rgba(0,0,0,.55);backdrop-filter:blur(4px);z-index:998;animation:fadeIn .2s ease-out}
        .mob-menu{position:fixed;top:0;right:0;width:min(380px,88vw);height:100dvh;background:var(--site-primary);z-index:999;padding:24px;display:flex;flex-direction:column;gap:2px;overflow-y:auto;animation:slideInRight .3s var(--ease-out)}
        .mob-menu-top{display:flex;justify-content:space-between;align-items:center;padding-bottom:24px;margin-bottom:8px;border-bottom:1px solid rgba(255,255,255,.08)}
        .mob-link{display:flex;align-items:center;justify-content:space-between;padding:15px 14px;color:rgba(255,255,255,.65);font-size:1rem;font-weight:500;border-radius:var(--site-radius-md);text-decoration:none;transition:all .2s;animation:fadeInUp .4s var(--ease-out) both}
        .mob-link:hover,.mob-link.active{color:#fff;background:rgba(255,255,255,.07)}
        .mob-link.active{font-weight:700}
        .mob-contact-link{display:flex;align-items:center;gap:10px;padding:10px 0;font-size:.85rem;color:rgba(255,255,255,.4);text-decoration:none;transition:color .2s}
        .mob-contact-link:hover{color:rgba(255,255,255,.7)}

        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        @keyframes fadeInUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        @keyframes slideInRight{from{transform:translateX(100%)}to{transform:translateX(0)}}

        /* FOOTER */
        .ftr{background:var(--site-primary);color:rgba(255,255,255,.6);padding:88px 0 0;background-image:url('/texture-dark.svg');background-repeat:repeat;background-size:300px}
        .ftr-top{display:grid;grid-template-columns:1fr;gap:56px;padding-bottom:56px}
        @media(min-width:768px){.ftr-top{grid-template-columns:1.2fr 2fr}}
        .ftr-brand{max-width:300px}
        .ftr-logo{font-family:var(--font-heading);font-size:2rem;font-weight:800;color:#fff;letter-spacing:.06em;display:block;margin-bottom:12px}
        .ftr-tagline{font-size:1.15rem;color:var(--site-gold);opacity:.7;line-height:1.4}
        .ftr-cols{display:grid;grid-template-columns:1fr 1fr;gap:40px}
        @media(max-width:480px){.ftr-cols{grid-template-columns:1fr}}
        .ftr-col{display:flex;flex-direction:column;gap:12px}
        .ftr-col-title{font-family:var(--font-heading);font-size:.7rem;font-weight:700;text-transform:uppercase;letter-spacing:.14em;color:rgba(255,255,255,.3);margin-bottom:4px}
        .ftr-link{font-size:.88rem;color:rgba(255,255,255,.5);text-decoration:none;transition:color .2s;display:inline-flex;align-items:center;gap:8px}
        .ftr-link:hover{color:#fff}
        .ftr-bottom{display:flex;flex-direction:column;gap:10px;align-items:center;text-align:center;padding:24px 0;border-top:1px solid rgba(255,255,255,.07);font-size:.78rem;color:rgba(255,255,255,.25)}
        @media(min-width:640px){.ftr-bottom{flex-direction:row;justify-content:space-between}}
        .ftr-credit{color:rgba(255,255,255,.25);text-decoration:none;transition:color .2s}
        .ftr-credit:hover{color:rgba(255,255,255,.6)}
        .ftr-credit strong{color:rgba(255,255,255,.45);font-weight:700}
      `}</style>
    </>
  );
}
