'use client';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  LayoutDashboard, FileText, BookOpen,
  ClipboardList, Menu, X, ChevronRight, ShieldCheck, Award,
} from 'lucide-react';
import { PainelProvider, usePainel } from './PainelContext';
import './painel.css';

const NAV_ITEMS = [
  { label: 'Dashboard',                 path: '/painel',                          icon: LayoutDashboard },
  { label: 'Certificação',              path: '/painel/certificacao',             icon: Award },
  { label: 'Documentos',                path: '/painel/documentos',               icon: FileText },
  { label: 'Prestação de Contas',       path: '/painel/prestacao-contas',         icon: BookOpen },
  { label: 'Formulários',               path: '/painel/formularios',              icon: ClipboardList },
  { label: 'Relatório de Conformidade', path: '/painel/relatorio-conformidade',   icon: ShieldCheck },
];

const BREADCRUMB: Record<string, string> = {
  '/painel':                            'Visão Geral',
  '/painel/certificacao':               'Certificação',
  '/painel/documentos':                 'Documentos',
  '/painel/prestacao-contas':           'Prestação de Contas',
  '/painel/formularios':                'Formulários',
  '/painel/relatorio-conformidade':     'Relatório de Conformidade',
};

function PainelShell({ children }: { children: React.ReactNode }) {
  const { perfil, loading } = usePainel();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  if (loading) {
    return (
      <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', background: 'var(--site-bg, #f0f3f5)' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 36, height: 36, border: '3px solid rgba(13,54,79,.12)', borderTopColor: '#0D364F', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 12px' }} />
          <p style={{ color: 'var(--site-text-secondary)', fontSize: '0.85rem', fontWeight: 500 }}>Carregando painel...</p>
        </div>
        <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div className="panel-shell">
      {sidebarOpen && <div className="panel-overlay" onClick={() => setSidebarOpen(false)} />}

      {/* ── Sidebar ── */}
      <aside className={`panel-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="panel-brand">
          <Link href="/inicio" className="panel-brand-link">
            <Image src="/logo.png" alt="OBGP" width={34} height={34} style={{ objectFit: 'contain' }} />
            <span className="panel-brand-name">OBG<span style={{ color: 'var(--site-gold)' }}>P</span></span>
          </Link>
          <div className="panel-brand-subtitle">Painel da OSC</div>
        </div>

        {perfil && (
          <div className="panel-osc-id">
            <span className="panel-osc-id-label">Identificador OSC</span>
            <span className="panel-osc-id-value">{perfil.osc_id}</span>
          </div>
        )}

        <nav className="panel-nav">
          {NAV_ITEMS.map(item => {
            const Icon = item.icon;
            const active = pathname === item.path;
            return (
              <Link key={item.path} href={item.path} className={`panel-nav-item ${active ? 'active' : ''}`}>
                <Icon size={18} strokeWidth={active ? 2.2 : 1.8} />
                {item.label}
              </Link>
            );
          })}
        </nav>

      </aside>

      {/* ── Main ── */}
      <div className="panel-main">
        <header className="panel-header">
          <div className="panel-header-left">
            <button className="panel-icon-btn" onClick={() => setSidebarOpen(!sidebarOpen)} aria-label="Menu">
              {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
            <div className="panel-breadcrumb">
              <span>Painel</span>
              <ChevronRight size={13} />
              <span className="panel-breadcrumb-active">{BREADCRUMB[pathname] ?? 'Painel'}</span>
            </div>
          </div>

          <div className="panel-header-right" />
        </header>

        <main key={pathname} className="panel-page panel-page-in">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function PainelLayout({ children }: { children: React.ReactNode }) {
  return (
    <PainelProvider>
      <PainelShell>{children}</PainelShell>
    </PainelProvider>
  );
}
