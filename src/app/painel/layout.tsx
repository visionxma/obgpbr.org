'use client';
import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { PainelProvider, usePainel } from './PainelContext';
import PublicLayout from '../components/PublicLayout';
import './painel.css';

const BACK_NAV: Record<string, { href: string; label: string }> = {
  '/painel/certificacao':                     { href: '/painel/processo',    label: 'Processo' },
  '/painel/documentos':                       { href: '/painel/processo',    label: 'Processo' },
  '/painel/prestacao-contas':                 { href: '/painel/processo',    label: 'Processo' },
  '/painel/formularios':                      { href: '/painel/processo',    label: 'Processo' },
  '/painel/relatorio-conformidade':           { href: '/painel/processo',    label: 'Processo' },
  '/painel/formularios/cadastramento':        { href: '/painel/formularios', label: 'Formulários' },
  '/painel/formularios/diagnostico':          { href: '/painel/formularios', label: 'Formulários' },
  '/painel/formularios/relatorio_atividades': { href: '/painel/formularios', label: 'Formulários' },
  '/painel/formularios/renovacao':            { href: '/painel/formularios', label: 'Formulários' },
};

function resolve<T>(map: Record<string, T>, pathname: string): T | null {
  if (map[pathname]) return map[pathname];
  const sorted = Object.entries(map).sort((a, b) => b[0].length - a[0].length);
  for (const [path, val] of sorted) {
    if (pathname.startsWith(path + '/')) return val;
  }
  return null;
}

function OscIdBadge() {
  const { perfil, userEmail } = usePainel();
  if (!perfil) return null;
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'flex-end',
      padding: '4px 12px',
      background: 'rgba(197,171,118,.1)',
      border: '1px solid rgba(197,171,118,.2)',
      borderRadius: 8,
    }}>
      <span style={{ fontSize: '0.55rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.1em', color: 'rgba(197,171,118,.55)' }}>OSC</span>
      <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--site-gold)', letterSpacing: '.03em', fontFamily: 'var(--font-heading)' }}>{perfil.osc_id}</span>
      {userEmail && (
        <span style={{ fontSize: '0.55rem', color: 'rgba(255,255,255,0.4)', marginTop: 2, fontWeight: 500 }}>{userEmail}</span>
      )}
    </div>
  );
}

function PainelShell({ children }: { children: React.ReactNode }) {
  const { user, loading } = usePainel();
  const pathname = usePathname();
  const router = useRouter();

  // Removido o bloqueio de login (useEffect push / loading check) para restaurar acesso público ao painel.

  const backNav = resolve(BACK_NAV, pathname);

  return (
    <div className="pv2-shell">
      <main key={pathname} className="pv2-content panel-page-in">
        {/* Botão voltar — discreto, acima do conteúdo */}
        {backNav && (
          <div style={{ marginBottom: 20 }}>
            <Link href={backNav.href} className="pv2-back-btn">
              <ArrowLeft size={13} /> {backNav.label}
            </Link>
          </div>
        )}
        {children}
      </main>
    </div>
  );
}

export default function PainelLayout({ children }: { children: React.ReactNode }) {
  return (
    <PainelProvider>
      <PainelInner>{children}</PainelInner>
    </PainelProvider>
  );
}

// Componente intermediário para acessar o contexto antes de renderizar PublicLayout
function PainelInner({ children }: { children: React.ReactNode }) {
  return (
    <PublicLayout navRightSlot={<OscIdBadge />}>
      <PainelShell>{children}</PainelShell>
    </PublicLayout>
  );
}
