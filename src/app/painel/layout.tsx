'use client';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  LayoutDashboard, FileText, BookOpen,
  ClipboardList, LogOut, LogIn, Lock, Menu, X, ChevronRight, ShieldCheck, Award,
  Bell, CheckCheck,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
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

interface Notificacao {
  id: string; titulo: string; mensagem: string | null; lida: boolean; created_at: string;
}

function LoginPromptMain() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 20px', textAlign: 'center', gap: 16 }}>
      <Lock size={48} style={{ color: 'rgba(13,54,79,.15)' }} />
      <h2 style={{ fontFamily: 'var(--font-heading)', color: 'var(--site-primary)', fontSize: '1.4rem', fontWeight: 800, margin: 0 }}>
        Acesso ao Painel
      </h2>
      <p style={{ color: 'var(--site-text-secondary)', fontSize: 'var(--text-sm)', maxWidth: 340, margin: 0 }}>
        Entre com sua conta para acessar o painel de certificação da sua organização.
      </p>
      <Link
        href="/login"
        style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '13px 28px', background: 'var(--site-primary)', color: '#fff', borderRadius: 'var(--site-radius-full)', fontWeight: 700, fontSize: 'var(--text-sm)', textDecoration: 'none', marginTop: 4 }}
      >
        <LogIn size={16} /> Entrar na conta
      </Link>
    </div>
  );
}

function PainelShell({ children }: { children: React.ReactNode }) {
  const { user, perfil, loading } = usePainel();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifs, setNotifs] = useState<Notificacao[]>([]);
  const [notifUnread, setNotifUnread] = useState(0);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from('notificacoes')
        .select('id, titulo, mensagem, lida, created_at')
        .eq('user_id', user.id)
        .in('destinatario', ['osc', 'ambos'])
        .order('created_at', { ascending: false })
        .limit(20);
      const list = (data ?? []) as Notificacao[];
      setNotifs(list);
      setNotifUnread(list.filter(n => !n.lida).length);
    })();
  }, [user]);

  const markAllRead = async () => {
    if (!user) return;
    const ids = notifs.filter(n => !n.lida).map(n => n.id);
    if (!ids.length) return;
    await supabase.from('notificacoes').update({ lida: true }).in('id', ids);
    setNotifs(prev => prev.map(n => ({ ...n, lida: true })));
    setNotifUnread(0);
  };

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

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const displayName = user
    ? (perfil?.responsavel || user.user_metadata?.nome || user.email?.split('@')[0] || 'Usuário')
    : '';
  const initial = displayName[0]?.toUpperCase() ?? 'U';

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

        <div className="panel-sidebar-footer">
          {user ? (
            <>
              <div className="panel-user-info">
                <div className="panel-user-avatar">{initial}</div>
                <div>
                  <div className="panel-user-name">{displayName}</div>
                  <div className="panel-user-email">{user.email}</div>
                </div>
              </div>
              <button onClick={handleLogout} className="panel-logout-btn">
                <LogOut size={14} /> Sair
              </button>
            </>
          ) : (
            <Link href="/login" className="panel-logout-btn" style={{ textDecoration: 'none', justifyContent: 'center' }}>
              <LogIn size={14} /> Entrar na conta
            </Link>
          )}
        </div>
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

          <div className="panel-header-right">
            {user && (
              <div style={{ position: 'relative' }}>
                <button
                  className="panel-icon-btn"
                  onClick={() => setNotifOpen(o => !o)}
                  aria-label="Notificações"
                  style={{ position: 'relative' }}
                >
                  <Bell size={18} />
                  {notifUnread > 0 && (
                    <span style={{
                      position: 'absolute', top: 4, right: 4,
                      width: 15, height: 15, borderRadius: '50%',
                      background: '#dc2626', color: '#fff',
                      fontSize: '0.58rem', fontWeight: 800,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      border: '1.5px solid var(--site-bg, #f0f3f5)',
                    }}>
                      {notifUnread > 9 ? '9+' : notifUnread}
                    </span>
                  )}
                </button>
                {notifOpen && (
                  <div style={{
                    position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                    width: 320, background: '#fff', border: '1px solid #e2e8f0',
                    borderRadius: 14, boxShadow: '0 8px 32px rgba(0,0,0,0.12)', zIndex: 200, overflow: 'hidden',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', borderBottom: '1px solid #e2e8f0' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--site-text-primary)' }}>
                        Notificações {notifUnread > 0 && <span style={{ color: '#dc2626' }}>({notifUnread})</span>}
                      </span>
                      {notifUnread > 0 && (
                        <button onClick={markAllRead} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.7rem', color: 'var(--site-primary)', fontWeight: 600 }}>
                          <CheckCheck size={12} /> Marcar todas
                        </button>
                      )}
                    </div>
                    <div style={{ maxHeight: 320, overflowY: 'auto' }}>
                      {notifs.length === 0 ? (
                        <div style={{ padding: '24px 14px', textAlign: 'center', fontSize: '0.8rem', color: 'var(--site-text-tertiary)' }}>Nenhuma notificação</div>
                      ) : notifs.map(n => (
                        <div key={n.id} style={{
                          padding: '10px 14px', borderBottom: '1px solid #f1f5f9',
                          background: n.lida ? 'transparent' : 'rgba(13,54,79,.04)',
                        }}>
                          <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                            <div style={{ width: 7, height: 7, borderRadius: '50%', background: n.lida ? 'transparent' : '#dc2626', marginTop: 5, flexShrink: 0, border: n.lida ? '1.5px solid #cbd5e1' : 'none' }} />
                            <div>
                              <div style={{ fontSize: '0.8rem', fontWeight: n.lida ? 500 : 700, color: 'var(--site-text-primary)', lineHeight: 1.4 }}>{n.titulo}</div>
                              {n.mensagem && <div style={{ fontSize: '0.72rem', color: 'var(--site-text-secondary)', marginTop: 2, lineHeight: 1.4 }}>{n.mensagem}</div>}
                              <div style={{ fontSize: '0.65rem', color: 'var(--site-text-tertiary)', marginTop: 3 }}>
                                {new Date(n.created_at).toLocaleString('pt-BR')}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {user && (
              <div className="panel-header-user">
                <span className="panel-header-user-name">{displayName}</span>
                <div className="panel-header-avatar">{initial}</div>
              </div>
            )}
          </div>
        </header>

        <main key={pathname} className="panel-page panel-page-in">
          {user ? children : <LoginPromptMain />}
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
