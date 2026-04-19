'use client';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, ChevronRight } from 'lucide-react';
import { PainelProvider, usePainel } from './PainelContext';
import PublicLayout from '../components/PublicLayout';
import './painel.css';

// Destino do botão voltar para cada rota
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

const PAGE_TITLE: Record<string, string> = {
  '/painel':                                  'Início',
  '/painel/processo':                         'Meu Processo',
  '/painel/certificacao':                     'Certificação',
  '/painel/documentos':                       'Documentos',
  '/painel/prestacao-contas':                 'Demonstrativos Financeiros',
  '/painel/formularios':                      'Formulários',
  '/painel/formularios/cadastramento':        'Cadastramento',
  '/painel/formularios/diagnostico':          'Diagnóstico Organizacional',
  '/painel/formularios/relatorio_atividades': 'Relatório de Atividades',
  '/painel/formularios/renovacao':            'Renovação do Selo',
  '/painel/relatorio-conformidade':           'Relatório de Conformidade',
};

function resolve<T>(map: Record<string, T>, pathname: string): T | null {
  if (map[pathname]) return map[pathname];
  const sorted = Object.entries(map).sort((a, b) => b[0].length - a[0].length);
  for (const [path, val] of sorted) {
    if (pathname.startsWith(path + '/')) return val;
  }
  return null;
}

function PainelShell({ children }: { children: React.ReactNode }) {
  const { perfil, loading } = usePainel();
  const pathname = usePathname();

  if (loading) {
    return (
      <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', background: 'var(--site-bg)' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="panel-spinner" style={{ margin: '0 auto 12px' }} />
          <p style={{ color: 'var(--site-text-secondary)', fontSize: '0.85rem', fontWeight: 500 }}>Carregando...</p>
        </div>
      </div>
    );
  }

  const backNav  = resolve(BACK_NAV, pathname);
  const title    = resolve(PAGE_TITLE, pathname) ?? 'Painel';
  const isRoot   = pathname === '/painel/processo';

  return (
    <div className="pv2-shell">

      {/* ── Cabeçalho ── */}
      <header className="pv2-header">
        <div className="pv2-header-left">

          {/* Logo — leva ao Processo */}
          <Link href="/painel/processo" className="pv2-logo">
            <Image src="/logo.png" alt="OBGP" width={28} height={28} style={{ objectFit: 'contain' }} />
            <span className="pv2-logo-text">OBG<span style={{ color: 'var(--site-gold)' }}>P</span></span>
          </Link>

          {!isRoot && <span className="pv2-divider" />}

          {/* Botão voltar */}
          {backNav && (
            <Link href={backNav.href} className="pv2-back-btn">
              <ArrowLeft size={13} />
              {backNav.label}
            </Link>
          )}

          {/* Título da página atual */}
          {!isRoot && (
            <>
              {backNav && <ChevronRight size={12} className="pv2-chevron" />}
              <span className="pv2-page-title">{title}</span>
            </>
          )}
        </div>

        {/* ID da OSC */}
        {perfil && (
          <div className="pv2-osc-id">
            <span className="pv2-osc-id-label">OSC</span>
            <span className="pv2-osc-id-value">{perfil.osc_id}</span>
          </div>
        )}
      </header>

      {/* ── Conteúdo ── */}
      <main key={pathname} className="pv2-content panel-page-in">
        {children}
      </main>
    </div>
  );
}

export default function PainelLayout({ children }: { children: React.ReactNode }) {
  return (
    <PublicLayout>
      <PainelProvider>
        <PainelShell>{children}</PainelShell>
      </PainelProvider>
    </PublicLayout>
  );
}
