'use client';
import { supabase } from '@/lib/supabase';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  LayoutDashboard,
  Settings,
  LogOut,
  ChevronRight,
  ChevronLeft,
  Menu,
  X,
  User,
  Moon,
  Sun,
  ShieldCheck,
  BarChart3,
  Sparkles,
  BookOpen,
  Trash2,
  Bell,
  CheckCheck,
  ScrollText,
} from 'lucide-react';
import './admin.css';
import AdminSearch from './AdminSearch';

/**
 * Layout Administrativo Premium — OBGP
 * App Shell com Sidebar Glassmorphism, Header Sticky e Micro-interações
 */

const navItems = [
  { label: 'Visão Geral',        path: '/gestao/dashboard',                    icon: LayoutDashboard, section: 'Principal' },
  { label: 'Analytics',          path: '/gestao/dashboard/analytics',           icon: BarChart3,       section: 'Principal' },
  { label: 'Gestão de OSCs',     path: '/gestao/dashboard/oscs',                icon: User,            section: 'Gestão' },
  { label: 'Lixeira',            path: '/gestao/dashboard/oscs/lixeira',        icon: Trash2,          section: 'Gestão' },
  { label: 'Nossas Experiências',path: '/gestao/dashboard/experiencias',        icon: Sparkles,        section: 'Conteúdo' },
  { label: 'Blog',               path: '/gestao/dashboard/blog',                icon: BookOpen,        section: 'Conteúdo' },
  { label: 'Transparência',      path: '/gestao/dashboard/transparencia',       icon: ShieldCheck,     section: 'Conteúdo' },
  { label: 'Regulamento Selo',   path: '/gestao/dashboard/regulamento',         icon: ScrollText,      section: 'Conteúdo' },
  { label: 'Configurações',      path: '/gestao/dashboard/settings',            icon: Settings,        section: 'Sistema' },
];

function getBreadcrumb(path: string) {
  const map: Record<string, string> = {
    '/gestao/dashboard':                'Visão Geral',
    '/gestao/dashboard/analytics':      'Analytics e Métricas',
    '/gestao/dashboard/oscs':           'Gestão de OSCs',
    '/gestao/dashboard/oscs/lixeira':   'Lixeira de OSCs',
    '/gestao/dashboard/experiencias':   'Nossas Experiências',
    '/gestao/dashboard/blog':           'Blog',
    '/gestao/dashboard/transparencia':  'Transparência',
    '/gestao/dashboard/regulamento':    'Regulamento Selo OSC',
    '/gestao/dashboard/settings':       'Configurações',
  };
  if (path.startsWith('/gestao/dashboard/oscs/')) {
    if (path === '/gestao/dashboard/oscs/lixeira') return 'Lixeira de OSCs';
    return 'Detalhe da OSC';
  }
  return map[path] || 'Dashboard';
}

/* Sub-componente isolado para usar useSearchParams sem quebrar o build */
function SidebarNav({ sections, onNavigate }: {
  sections: Record<string, typeof navItems>;
  onNavigate: () => void;
}) {
  const currentPath = usePathname();
  const router = useRouter();

  return (
    <nav className="sidebar-nav">
      {Object.entries(sections).map(([section, items]) => (
        <div key={section} className="sidebar-nav-section">
          <div className="sidebar-nav-label">{section}</div>
          {items.map((item) => {
            const Icon = item.icon;
            let isActive = false;
            if (item.path === '/gestao/dashboard') {
              isActive = currentPath === item.path;
            } else if (item.path === '/gestao/dashboard/oscs') {
              isActive = currentPath.startsWith('/gestao/dashboard/oscs') && !currentPath.startsWith('/gestao/dashboard/oscs/lixeira');
            } else if (item.path === '/gestao/dashboard/oscs/lixeira') {
              isActive = currentPath === item.path;
            } else {
              isActive = currentPath === item.path || currentPath.startsWith(item.path + '/');
            }
            
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
                onClick={(e) => {
                  onNavigate();
                }}
              >
                <Icon className="sidebar-nav-icon" size={20} strokeWidth={isActive ? 2.2 : 1.8} />
                {item.label}
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );
}

function BreadcrumbTitle() {
  const currentPath = usePathname();
  return <>{getBreadcrumb(currentPath)}</>;
}

interface Notificacao {
  id: string; tipo: string; titulo: string; mensagem: string | null;
  lida: boolean; created_at: string; osc_id: string | null;
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const currentPath = usePathname();
  const [session, setSession] = useState<any>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [currentTime, setCurrentTime] = useState('');
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifs, setNotifs] = useState<Notificacao[]>([]);
  const [notifUnread, setNotifUnread] = useState(0);

  useEffect(() => {
    const savedTheme = localStorage.getItem('admin-theme') as 'light' | 'dark' | null;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.setAttribute('data-theme', savedTheme);
    }
    const savedCollapsed = localStorage.getItem('admin-sidebar-collapsed');
    if (savedCollapsed === '1') setSidebarCollapsed(true);
  }, []);

  const toggleSidebarCollapse = () => {
    setSidebarCollapsed(prev => {
      const next = !prev;
      localStorage.setItem('admin-sidebar-collapsed', next ? '1' : '0');
      return next;
    });
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }: any) => {
      const role = session?.user?.app_metadata?.role;
      const isAdmin = role === 'admin' || role === 'superadmin';

      if (!session) {
        router.replace('/gestao');
      } else if (!isAdmin) {
        supabase.auth.signOut().then(() => router.replace('/gestao'));
      } else {
        setSession(session);
        setIsLoadingAuth(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: any, authSession: any) => {
      const role = authSession?.user?.app_metadata?.role;
      const isAdmin = role === 'admin' || role === 'superadmin';

      if (!authSession) {
        router.replace('/gestao');
      } else if (!isAdmin) {
        supabase.auth.signOut().then(() => router.replace('/gestao'));
      } else {
        setSession(authSession);
        setIsLoadingAuth(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  const loadNotifs = async () => {
    const { data } = await supabase
      .from('notificacoes')
      .select('id, tipo, titulo, mensagem, lida, created_at, osc_id')
      .in('destinatario', ['admin', 'ambos'])
      .order('created_at', { ascending: false })
      .limit(20);
    const list = (data ?? []) as Notificacao[];
    setNotifs(list);
    setNotifUnread(list.filter(n => !n.lida).length);
  };

  useEffect(() => {
    if (!isLoadingAuth) loadNotifs();
  }, [isLoadingAuth]);

  const markAllRead = async () => {
    const ids = notifs.filter(n => !n.lida).map(n => n.id);
    if (!ids.length) return;
    await supabase.from('notificacoes').update({ lida: true }).in('id', ids);
    setNotifs(prev => prev.map(n => ({ ...n, lida: true })));
    setNotifUnread(0);
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('admin-theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleDateString('pt-BR', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  const sections = navItems.reduce((acc, item) => {
    if (!acc[item.section]) acc[item.section] = [];
    acc[item.section].push(item);
    return acc;
  }, {} as Record<string, typeof navItems>);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/gestao');
  };

  if (isLoadingAuth) {
    return (
      <div style={{ display: 'flex', height: '100vh', width: '100vw', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--site-bg)' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 40, height: 40, border: '3px solid var(--site-border)', borderTopColor: 'var(--site-primary)', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
          <p style={{ color: 'var(--site-text-secondary)', fontWeight: 500, fontSize: '0.9rem', letterSpacing: '0.05em' }}>VERIFICANDO ACESSO SEGURO...</p>
        </div>
        <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div className={`admin-shell ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      {/* ──── Sidebar ──── */}
      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''} ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-brand">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <img src="/logo.png" alt="OBGP" style={{ width: 40, height: 40, objectFit: 'contain', flexShrink: 0 }} />
            <span style={{
              fontFamily: 'Outfit, sans-serif', fontSize: '1.3rem', fontWeight: 800,
              color: '#fff', letterSpacing: '0.06em',
            }}>
              OBG<span style={{ color: '#C5AB76' }}>P</span>
            </span>
          </div>
          <div className="sidebar-brand-subtitle">Gestão Institucional</div>
        </div>

        <Suspense fallback={<nav className="sidebar-nav" />}>
          <SidebarNav sections={sections} onNavigate={() => setSidebarOpen(false)} />
        </Suspense>

        <div className="sidebar-footer">
          <button onClick={handleLogout} className="sidebar-logout-btn">
            <LogOut size={16} />
            Sair do Sistema
          </button>
        </div>
      </aside>

      {/* ──── Notch para ocultar/mostrar a sidebar (somente desktop) ──── */}
      <button
        type="button"
        className="sidebar-collapse-notch"
        onClick={toggleSidebarCollapse}
        aria-label={sidebarCollapsed ? 'Mostrar sidebar' : 'Ocultar sidebar'}
        title={sidebarCollapsed ? 'Mostrar sidebar' : 'Ocultar sidebar'}
      >
        {sidebarCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      {/* ──── Main Content ──── */}
      <div className="admin-main">
        {/* Header */}
        <header className="admin-header">
          <div className="admin-header-left">
            <button
              className="admin-header-icon-btn mobile-menu-btn"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label="Menu"
            >
              {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
            </button>

            <div className="admin-header-breadcrumb">
              <span>Dashboard</span>
              <ChevronRight size={14} className="admin-header-breadcrumb-separator" />
              <span className="admin-header-breadcrumb-active">
                <Suspense fallback="..."><BreadcrumbTitle /></Suspense>
              </span>
            </div>
          </div>

          <div className="admin-header-right">
            <AdminSearch />

            {/* Notifications Bell */}
            <div style={{ position: 'relative' }}>
              <button
                className={`admin-header-icon-btn ${notifOpen ? 'active' : ''}`}
                onClick={() => { setNotifOpen(o => !o); setUserMenuOpen(false); }}
                aria-label="Notificações"
                style={{ position: 'relative' }}
              >
                <Bell size={18} />
                {notifUnread > 0 && (
                  <span style={{
                    position: 'absolute', top: 4, right: 4,
                    width: 16, height: 16, borderRadius: '50%',
                    background: 'var(--admin-gold)', color: '#0D1F2D',
                    fontSize: '0.6rem', fontWeight: 800,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    lineHeight: 1, border: '1.5px solid var(--admin-surface)',
                  }}>
                    {notifUnread > 9 ? '9+' : notifUnread}
                  </span>
                )}
              </button>
              {notifOpen && (
                <div style={{
                  position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                  width: 340, background: 'var(--admin-surface)', border: '1px solid var(--admin-border)',
                  borderRadius: 14, boxShadow: '0 8px 32px rgba(0,0,0,0.14)', zIndex: 200, overflow: 'hidden',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderBottom: '1px solid var(--admin-border)' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--admin-text-primary)' }}>
                      Notificações {notifUnread > 0 && <span style={{ color: '#dc2626' }}>({notifUnread})</span>}
                    </span>
                    {notifUnread > 0 && (
                      <button onClick={markAllRead} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.72rem', color: 'var(--admin-primary)', fontWeight: 600 }}>
                        <CheckCheck size={13} /> Marcar todas
                      </button>
                    )}
                  </div>
                  <div style={{ maxHeight: 360, overflowY: 'auto' }}>
                    {notifs.length === 0 ? (
                      <div style={{ padding: '28px 16px', textAlign: 'center', fontSize: '0.82rem', color: 'var(--admin-text-tertiary)' }}>
                        Nenhuma notificação
                      </div>
                    ) : notifs.map(n => (
                      <div key={n.id} style={{
                        padding: '12px 16px', borderBottom: '1px solid var(--admin-border)',
                        background: n.lida ? 'transparent' : 'rgba(13,54,79,.04)',
                        cursor: n.osc_id ? 'pointer' : 'default',
                      }}
                        onClick={() => { if (n.osc_id) { router.push(`/gestao/dashboard/oscs/${n.osc_id}`); setNotifOpen(false); } }}
                      >
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                          <div style={{ width: 8, height: 8, borderRadius: '50%', background: n.lida ? 'transparent' : '#dc2626', marginTop: 5, flexShrink: 0, border: n.lida ? '1.5px solid var(--admin-border)' : 'none' }} />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: '0.82rem', fontWeight: n.lida ? 500 : 700, color: 'var(--admin-text-primary)', lineHeight: 1.4 }}>{n.titulo}</div>
                            {n.mensagem && <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-secondary)', marginTop: 2, lineHeight: 1.4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{n.mensagem}</div>}
                            <div style={{ fontSize: '0.68rem', color: 'var(--admin-text-tertiary)', marginTop: 4 }}>
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

            {/* Profile Dropdown */}
            <div style={{ position: 'relative' }}>
              <button
                className={`admin-header-icon-btn ${userMenuOpen ? 'active' : ''}`}
                onClick={() => { setUserMenuOpen(o => !o); setNotifOpen(false); }}
                aria-label="Perfil do Usuário"
              >
                <User size={18} />
                <span className="notification-dot"></span>
              </button>

              {userMenuOpen && (
                <div className="user-dropdown">
                  <div className="user-dropdown-header">
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--admin-text-primary)' }}>
                      {session?.user?.email || 'Administrador'}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--admin-text-tertiary)', marginTop: 2 }}>
                      Acesso Administrativo OBGP
                    </div>
                  </div>

                  <button className="user-dropdown-item" onClick={toggleTheme}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
                      <span>Tema {theme === 'light' ? 'Escuro' : 'Claro'}</span>
                    </div>
                  </button>

                  <button className="user-dropdown-item" onClick={() => router.push('/gestao')}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <User size={16} />
                      <span>Trocar de conta</span>
                    </div>
                  </button>

                  <button className="user-dropdown-item" onClick={() => router.push('/gestao/dashboard/settings')}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <Settings size={16} />
                      <span>Configurações</span>
                    </div>
                  </button>

                  <div style={{ borderTop: '1px solid var(--admin-border)', margin: '4px 0', paddingTop: 4 }}>
                    <button className="user-dropdown-item" onClick={handleLogout} style={{ color: 'var(--admin-danger)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <LogOut size={16} />
                        <span>Sair</span>
                      </div>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main key={currentPath} className="admin-page-content admin-page-transition">
          {/* Page Title Row — hidden on OSC detail pages (they render their own rich header) */}
          {!currentPath.match(/^\/gestao\/dashboard\/oscs\/(?!lixeira)[^/]+/) && (
            <div className="admin-page-title-row">
              <div>
                <h1 className="admin-page-title">
                  <Suspense fallback="..."><BreadcrumbTitle /></Suspense>
                </h1>
                <p className="admin-page-subtitle">
                  {currentTime && (
                    <span style={{ textTransform: 'capitalize' }}>{currentTime}</span>
                  )}
                </p>
              </div>
            </div>
          )}

          {children}
        </main>
      </div>
    </div>
  );
}
