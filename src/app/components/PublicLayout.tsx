'use client';

import { useState, useEffect } from 'react';
import Link from "next/link";
import Image from "next/image";
import { usePathname } from 'next/navigation';
import { Menu, X, Mail, Phone, MapPin } from "lucide-react";

const NAV_ITEMS = [
  { label: 'Início', path: '/inicio' },
  { label: 'Serviços', path: '/servicos' },
  { label: 'Experiências', path: '/experiencias' },
  { label: 'Blog', path: '/blog' },
  { label: 'Selo OSC', path: '/selo-osc' },
  { label: 'Transparência', path: '/transparencia' },
  { label: 'Painel OSC', path: '/painel' },
];

export default function PublicLayout({ children, navRightSlot }: { children: React.ReactNode; navRightSlot?: React.ReactNode }) {
  const pathname = usePathname();
  const isPainel = pathname?.startsWith('/painel');
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('');

  const isActive = (path: string) => {
    // If the link is strictly for Painel OSC, it should light up for ANY route within /painel
    if (path === '/painel' && pathname?.startsWith('/painel')) return true;
    
    const [pagePath, hash] = path.split('#');
    if (pathname !== pagePath) return false;
    if (hash) return activeSection === hash;
    return true;
  };

  useEffect(() => {
    const onScroll = () => setScrolled(prev => {
      const next = window.scrollY > 50;
      return prev === next ? prev : next;
    });
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setActiveSection('');
    const mid = () => window.innerHeight * 0.5;
    const update = () => {
      const sections = document.querySelectorAll<HTMLElement>('section[id]');
      let current = '';
      sections.forEach(s => {
        const { top, bottom } = s.getBoundingClientRect();
        if (top < mid() && bottom > mid()) current = s.id;
      });
      setActiveSection(prev => prev === current ? prev : current);
    };
    window.addEventListener('scroll', update, { passive: true });
    update();
    return () => window.removeEventListener('scroll', update);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  // Stacked Cards effect — JS unificado para todos os navegadores (desktop + mobile).
  // Calcula overlap de cada card com o próximo e atualiza CSS variables a cada frame.
  // Garante consistência visual independente de suporte a animation-timeline.
  useEffect(() => {
    const groups = Array.from(document.querySelectorAll<HTMLElement>('.mobile-sticky-stack'));
    if (groups.length === 0) return;

    let rafId: number | null = null;

    const update = () => {
      rafId = null;
      groups.forEach((group) => {
        const items = (Array.from(group.children) as HTMLElement[])
          .filter((el) => el.classList.contains('sticky-item'));

        items.forEach((el, idx) => {
          const next = items[idx + 1];
          if (!next) {
            el.style.setProperty('--stack-scale', '1');
            el.style.setProperty('--stack-opacity', '1');
            el.style.setProperty('--stack-brightness', '1');
            return;
          }
          const elRect = el.getBoundingClientRect();
          const nextRect = next.getBoundingClientRect();
          // Fração do card coberta pelo próximo
          const overlap = Math.max(0, elRect.bottom - nextRect.top);
          const progress = Math.max(0, Math.min(1, overlap / Math.max(1, elRect.height)));
          // Easing suave (easeOutCubic) para transição mais fluida
          const eased = 1 - Math.pow(1 - progress, 3);
          // Profundidade adicional para cards mais ao fundo
          const depthFactor = Math.min(idx * 0.015, 0.06);
          const scale = (1 - eased * 0.10 - depthFactor * eased).toFixed(3);
          const opacity = (1 - eased * 0.45).toFixed(3);
          const brightness = (1 - eased * 0.10).toFixed(3);
          el.style.setProperty('--stack-scale', scale);
          el.style.setProperty('--stack-opacity', opacity);
          el.style.setProperty('--stack-brightness', brightness);
        });
      });
    };

    const onScroll = () => {
      if (rafId !== null) return;
      rafId = requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, [pathname]);

  return (
    <>
      {/* ═══ HEADER ═══ */}
      <header className={`hdr ${isPainel ? 'hdr--painel' : ''} ${scrolled ? (isPainel ? 'hdr--glass' : 'hdr--float') : ''}`}>
        <div className="hdr-inner">
          <Link href="/inicio" className="hdr-logo">
            <span className="hdr-logo-img-wrap">
              <Image src="/logo.png" alt="OBGP" width={48} height={48} style={{ objectFit: 'contain' }} priority className="logo-glow" />
            </span>
            <span className="hdr-logo-mark">OBG<span className="hdr-logo-p">P</span></span>
          </Link>

          <nav className="hdr-nav">
            {NAV_ITEMS.map(item => (
              <Link key={item.path} href={item.path}
                className={`hdr-link ${isActive(item.path) ? 'active' : ''}`}>
                {item.label}
              </Link>
            ))}
          </nav>


          {navRightSlot && (
            <div className="hdr-nav-right-slot">{navRightSlot}</div>
          )}

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
              <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Image src="/logo.png" alt="OBGP" width={40} height={40} style={{ objectFit: 'contain' }} className="logo-glow" />
                <span className="hdr-logo-mark" style={{ fontSize: '1.3rem' }}>OBG<span className="hdr-logo-p">P</span></span>
              </span>
              <button className="hdr-toggle" onClick={() => setMenuOpen(false)} aria-label="Fechar">
                <X size={22} />
              </button>
            </div>
            {NAV_ITEMS.map((item, i) => (
              <Link key={item.path} href={item.path}
                onClick={() => setMenuOpen(false)}
                className={`mob-link ${isActive(item.path) ? 'active' : ''}`}
                style={{ animationDelay: `${i * 0.05}s` }}>
                <span>{item.label}</span>
                <span className="mob-link-dot" />
              </Link>
            ))}
            <div style={{ marginTop: 'auto', padding: '24px 0 0', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
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
      {!isPainel && <footer className="ftr">
        <div className="container">
          {/* Top area */}
          <div className="ftr-top">
            <div className="ftr-brand">
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
                <Image src="/logo.png" alt="OBGP" width={72} height={72} style={{ objectFit: 'contain', filter: 'drop-shadow(0 2px 12px rgba(197,171,118,0.40))' }} />
                <span className="ftr-logo" style={{ marginBottom: 0 }}>OBG<span style={{ color: 'var(--site-gold)' }}>P</span></span>
              </div>
              <p className="ftr-tagline">Gestão de Parcerias<br />com Resultados</p>
            </div>
            <div className="ftr-cols">
              <div className="ftr-col">
                <h4 className="ftr-col-title">Institucional</h4>
                {[
                  { l: 'Início', h: '/inicio' },
                  { l: 'Serviços', h: '/servicos' },
                  { l: 'Experiências', h: '/experiencias' },
                  { l: 'Blog', h: '/blog' },
                  { l: 'Selo OSC', h: '/selo-osc' },
                  { l: 'Transparência', h: '/transparencia' },
                ].map(({ l, h }) => (
                  <Link key={h} href={h} className="ftr-link">{l}</Link>
                ))}
              </div>
              <div className="ftr-col">
                <h4 className="ftr-col-title">Fale Conosco</h4>
                <Link href="/contato" className="ftr-link">
                  <Mail size={13} /> Fale Conosco
                </Link>
                <a href="mailto:contato.org.obgp@gmail.com" className="ftr-link">
                  <Mail size={13} /> contato.org.obgp@gmail.com
                </a>
                <a
                  href="https://wa.me/5598987100001"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ftr-link"
                >
                  <Phone size={13} /> (98) 9 8710-0001
                </a>
                <a
                  href="https://www.google.com/maps/search/?api=1&query=Avenida+L%2C+10D%2C+Quadra+32%2C+Morada+do+Sol%2C+Pa%C3%A7o+do+Lumiar%2C+MA%2C+65130-000"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ftr-link"
                >
                  <MapPin size={13} /> Paço do Lumiar/MA
                </a>
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
      </footer>}

      {/* ═══ STYLES ═══ */}
      <style>{`
        /* HEADER — left/transform nunca mudam, apenas top/width/border-radius/shadow */
        .hdr{position:fixed;top:0;left:50%;transform:translateX(-50%);width:100%;z-index:1000;background:rgba(8,33,48,.52);backdrop-filter:blur(28px) saturate(180%);-webkit-backdrop-filter:blur(28px) saturate(180%);border-bottom:1px solid rgba(255,255,255,.08);box-shadow:0 1px 0 rgba(255,255,255,.05) inset,0 4px 24px rgba(0,0,0,.18);border-radius:0;transition:top .65s cubic-bezier(.22,1,.36,1),width .65s cubic-bezier(.22,1,.36,1),border-radius .65s cubic-bezier(.22,1,.36,1),border .55s ease,box-shadow .65s cubic-bezier(.22,1,.36,1),background .55s ease}
        .hdr--float{top:14px;width:calc(100% - 40px);max-width:1180px;border-radius:60px;background:rgba(8,33,48,.62);border:1px solid rgba(255,255,255,.14);box-shadow:0 2px 0 rgba(255,255,255,.08) inset,0 12px 40px rgba(0,0,0,.28),0 1px 0 rgba(0,0,0,.20)}
        .hdr--painel{background:rgba(8,33,48,.97);border-bottom:1px solid rgba(255,255,255,.08)}
        .hdr--glass{background:rgba(8,33,48,.95);backdrop-filter:blur(32px) saturate(200%);-webkit-backdrop-filter:blur(32px) saturate(200%);border-bottom:1px solid rgba(255,255,255,.14);box-shadow:0 4px 32px rgba(0,0,0,.28)}
        .hdr-inner{max-width:1180px;margin:0 auto;padding:0 32px;height:76px;display:flex;align-items:center;justify-content:space-between;gap:16px;transition:height .65s cubic-bezier(.22,1,.36,1),padding .65s cubic-bezier(.22,1,.36,1)}
        .hdr--float .hdr-inner{height:62px;padding:0 24px}
        .hdr-logo{text-decoration:none;display:flex;align-items:center;gap:10px;padding:6px 14px 6px 6px;border-radius:var(--site-radius-full);background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.07);transition:background .3s,border-color .3s,box-shadow .3s}
        .hdr-logo:hover{background:rgba(255,255,255,.09);border-color:rgba(197,171,118,.30);box-shadow:0 0 0 4px rgba(197,171,118,.06)}
        .hdr-logo-img-wrap{display:flex;align-items:center;justify-content:center;width:48px;height:48px;border-radius:50%;background:rgba(255,255,255,0.07);border:1px solid rgba(197,171,118,0.20)}
        .hdr-logo-mark{font-family:var(--font-heading);font-size:1.4rem;font-weight:800;color:#fff;letter-spacing:.06em}
        .hdr-logo-p{color:var(--site-gold)}
        .hdr-nav{display:none;align-items:center;gap:1px;flex:1;justify-content:center}
        .hdr-link{position:relative;padding:7px 16px;font-size:var(--text-sm);font-weight:500;color:rgba(255,255,255,.55);border-radius:var(--site-radius-full);transition:color .25s ease,background .25s ease;text-decoration:none;white-space:nowrap;letter-spacing:.01em}
        .hdr-link::after{content:'';position:absolute;bottom:4px;left:50%;transform:translateX(-50%) scaleX(0);transform-origin:center;width:calc(100% - 24px);height:2px;border-radius:2px;background:var(--site-gold);transition:transform .35s cubic-bezier(.34,1.36,.64,1),opacity .25s ease;opacity:0}
        .hdr-link:hover{color:rgba(255,255,255,.88);background:rgba(255,255,255,.06)}
        .hdr-link:hover::after{transform:translateX(-50%) scaleX(.5);opacity:.4}
        .hdr-link.active{color:#fff;font-weight:600;background:rgba(255,255,255,.07)}
        .hdr-link.active::after{transform:translateX(-50%) scaleX(1);opacity:1}
        .hdr-actions{display:none;align-items:center;gap:10px}
        .hdr-cta{padding:8px 20px;font-size:var(--text-sm);font-weight:600;color:var(--site-primary);background:var(--site-gold);border:none;border-radius:var(--site-radius-full);cursor:pointer;text-decoration:none;white-space:nowrap;letter-spacing:-.01em;transition:background .25s,transform .25s,box-shadow .25s}
        .hdr-cta:hover{background:var(--site-gold-soft);transform:translateY(-1px);box-shadow:0 6px 20px rgba(197,171,118,.30)}
        .hdr-toggle{display:flex;align-items:center;justify-content:center;width:42px;height:42px;border:none;background:rgba(255,255,255,.07);color:#fff;border-radius:var(--site-radius-md);cursor:pointer;transition:background .2s}
        .hdr-toggle:hover{background:rgba(255,255,255,.14)}
        .hdr-btn-ghost{display:inline-flex;align-items:center;gap:6px;padding:8px 18px;font-size:var(--text-sm);font-weight:600;color:rgba(255,255,255,.75);background:transparent;border:1px solid rgba(255,255,255,.22);border-radius:var(--site-radius-full);cursor:pointer;text-decoration:none;white-space:nowrap;letter-spacing:-.01em;transition:color .25s,border-color .25s,background .25s}
        .hdr-btn-ghost:hover{color:#fff;border-color:rgba(255,255,255,.5);background:rgba(255,255,255,.07)}
        .hdr-cta{display:inline-flex;align-items:center;gap:6px}
        @media(min-width:1024px){.hdr-nav{display:flex}.hdr-actions{display:flex}.hdr-toggle{display:none}}
        .hdr-nav-right-slot{display:none;align-items:center}
        @media(min-width:1024px){.hdr-nav-right-slot{display:flex}}

        /* MOBILE */
        .mob-overlay{position:fixed;inset:0;background:rgba(0,0,0,.60);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);z-index:998;animation:fadeIn .25s ease-out}
        .mob-menu{position:fixed;top:0;right:0;width:min(360px,86vw);height:100dvh;background:rgba(10,42,61,.98);backdrop-filter:blur(24px);-webkit-backdrop-filter:blur(24px);border-left:1px solid rgba(255,255,255,.07);z-index:999;padding:24px;display:flex;flex-direction:column;gap:2px;overflow-y:auto;animation:slideInRight .35s var(--ease-out)}
        .mob-menu-top{display:flex;justify-content:space-between;align-items:center;padding-bottom:24px;margin-bottom:8px;border-bottom:1px solid rgba(255,255,255,.07)}
        .mob-link{display:flex;align-items:center;justify-content:space-between;padding:14px 16px;color:rgba(255,255,255,.60);font-size:var(--text-base);font-weight:500;border-radius:var(--site-radius-md);text-decoration:none;transition:color .2s,background .2s;animation:fadeInUp .45s var(--ease-out) both}
        .mob-link:hover{color:#fff;background:rgba(255,255,255,.07)}
        .mob-link.active{color:#fff;background:rgba(255,255,255,.08);font-weight:600}
        .mob-link.active .mob-link-dot{opacity:1;transform:scale(1)}
        .mob-link-dot{width:5px;height:5px;border-radius:50%;background:var(--site-gold);opacity:0;transform:scale(0);transition:opacity .2s,transform .3s cubic-bezier(.34,1.56,.64,1);flex-shrink:0}
        .mob-auth-btns{display:flex;flex-direction:column;gap:8px;margin-top:8px}
        .mob-btn-ghost{display:flex;align-items:center;justify-content:center;gap:8px;padding:13px;font-size:var(--text-sm);font-weight:600;color:rgba(255,255,255,.75);background:transparent;border:1px solid rgba(255,255,255,.22);border-radius:var(--site-radius-full);text-decoration:none;letter-spacing:-.01em;transition:color .2s,border-color .2s,background .2s}
        .mob-btn-ghost:hover{color:#fff;border-color:rgba(255,255,255,.5);background:rgba(255,255,255,.07)}
        .mob-cta{display:flex;align-items:center;justify-content:center;gap:8px;padding:14px;font-size:var(--text-sm);font-weight:600;color:var(--site-primary);background:var(--site-gold);border-radius:var(--site-radius-full);text-decoration:none;letter-spacing:-.01em;transition:background .2s,transform .2s}
        .mob-cta:hover{background:var(--site-gold-soft);transform:translateY(-1px)}
        .mob-contact-link{display:flex;align-items:center;gap:10px;padding:10px 0;font-size:var(--text-sm);color:rgba(255,255,255,.38);text-decoration:none;transition:color .2s}
        .mob-contact-link:hover{color:rgba(255,255,255,.7)}

        /* FOOTER */
        .ftr{background:var(--site-primary);color:rgba(255,255,255,.6);padding:56px 0 0;background-image:url('/texture-dark.svg');background-repeat:repeat;background-size:300px}
        .ftr-top{display:grid;grid-template-columns:1fr;gap:40px;padding-bottom:40px}
        @media(min-width:768px){.ftr-top{grid-template-columns:1.2fr 2fr}}
        .ftr-brand{max-width:300px}
        .ftr-logo{font-family:var(--font-heading);font-size:2rem;font-weight:800;color:#fff;letter-spacing:.06em;display:block;margin-bottom:12px}
        .ftr-tagline{font-size:1.15rem;color:var(--site-gold);opacity:.7;line-height:1.4}
        .ftr-cols{display:grid;grid-template-columns:1fr 1fr;gap:40px}
        @media(max-width:360px){.ftr-cols{grid-template-columns:1fr}}
        .ftr-col{display:flex;flex-direction:column;gap:12px}
        .ftr-col-title{font-family:var(--font-heading);font-size:var(--text-xs);font-weight:700;text-transform:uppercase;letter-spacing:var(--tracking-widest);color:rgba(255,255,255,.3);margin-bottom:6px}
        .ftr-link{font-size:var(--text-sm);color:rgba(255,255,255,.5);text-decoration:none;transition:color .2s;display:inline-flex;align-items:center;gap:8px;line-height:1.5}
        .ftr-link:hover{color:#fff}
        .ftr-bottom{display:flex;flex-direction:column;gap:10px;align-items:center;text-align:center;padding:24px 0;border-top:1px solid rgba(255,255,255,.07);font-size:var(--text-xs);color:rgba(255,255,255,.25)}
        @media(min-width:640px){.ftr-bottom{flex-direction:row;justify-content:space-between}}
        .ftr-credit{color:rgba(255,255,255,.25);text-decoration:none;transition:color .2s}
        .ftr-credit:hover{color:rgba(255,255,255,.6)}
        .ftr-credit strong{color:rgba(255,255,255,.45);font-weight:700}
      `}</style>
    </>
  );
}
