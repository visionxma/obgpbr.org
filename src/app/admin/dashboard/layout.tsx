'use client';
import { supabase } from '@/lib/supabase';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  LayoutDashboard,
  Settings,
  LogOut,
  ChevronRight,
  Menu,
  X,
  User,
  Moon,
  Sun,
  ShieldCheck,
  BarChart3,
  Sparkles,
  BookOpen,
} from 'lucide-react';
import './admin.css';
import AdminSearch from './AdminSearch';

/**
 * Layout Administrativo Premium — OBGP
 * App Shell com Sidebar Glassmorphism, Header Sticky e Micro-interações
 */

const navItems = [
  { label: 'Visão Geral',        path: '/admin/dashboard',                   icon: LayoutDashboard, section: 'Principal' },
  { label: 'Analytics',          path: '/admin/dashboard/analytics',          icon: BarChart3,       section: 'Principal' },
  { label: 'Gestão de OSCs',     path: '/admin/dashboard/oscs',               icon: User,            section: 'Gestão' },
  { label: 'Nossas Experiências',path: '/admin/dashboard/experiencias',       icon: Sparkles,        section: 'Conteúdo' },
  { label: 'Blog',               path: '/admin/dashboard/blog',               icon: BookOpen,        section: 'Conteúdo' },
  { label: 'Transparência',      path: '/admin/dashboard/transparencia',      icon: ShieldCheck,     section: 'Conteúdo' },
  { label: 'Configurações',      path: '/admin/dashboard/settings',           icon: Settings,        section: 'Sistema' },
];

function getBreadcrumb(path: string) {
  const map: Record<string, string> = {
    '/admin/dashboard':                    'Visão Geral',
    '/admin/dashboard/analytics':          'Analytics e Métricas',
    '/admin/dashboard/oscs':               'Gestão de OSCs',
    '/admin/dashboard/experiencias':       'Nossas Experiências',
    '/admin/dashboard/blog':              'Blog',
    '/admin/dashboard/transparencia':      'Transparência',
    '/admin/dashboard/settings':           'Configurações',
  };
  if (path.startsWith('/admin/dashboard/oscs/')) return 'Detalhe da OSC';
  return map[path] || 'Dashboard';
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const currentPath = usePathname();
  const [session, setSession] = useState<any>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    const savedTheme = localStorage.getItem('admin-theme') as 'light' | 'dark' | null;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.setAttribute('data-theme', savedTheme);
    }
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }: any) => {
      if (!session) {
        router.replace('/admin');
      } else if (session.user?.app_metadata?.role !== 'admin') {
        supabase.auth.signOut().then(() => router.replace('/admin'));
      } else {
        setSession(session);
        setIsLoadingAuth(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: any, authSession: any) => {
      if (!authSession) {
        router.replace('/admin');
      } else if (authSession.user?.app_metadata?.role !== 'admin') {
        supabase.auth.signOut().then(() => router.replace('/admin'));
      } else {
        setSession(authSession);
        setIsLoadingAuth(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

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
    router.push('/admin');
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
    <div className="admin-shell">
      {/* ──── Sidebar ──── */}
      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
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

        <nav className="sidebar-nav">
          {Object.entries(sections).map(([section, items]) => (
            <div key={section} className="sidebar-nav-section">
              <div className="sidebar-nav-label">{section}</div>
              {items.map((item) => {
                const Icon = item.icon;
                const isActive = currentPath === item.path;
                return (
                  <Link
                    key={item.path}
                    href={item.path}
                    className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <Icon className="sidebar-nav-icon" size={20} strokeWidth={isActive ? 2.2 : 1.8} />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button onClick={handleLogout} className="sidebar-logout-btn">
            <LogOut size={16} />
            Sair do Sistema
          </button>
        </div>
      </aside>

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
              <span className="admin-header-breadcrumb-active">{getBreadcrumb(currentPath)}</span>
            </div>
          </div>

          <div className="admin-header-right">
            <AdminSearch />

            {/* Profile Dropdown (Replaced Notification Bell) */}
            <div style={{ position: 'relative' }}>
              <button 
                className={`admin-header-icon-btn ${userMenuOpen ? 'active' : ''}`} 
                onClick={() => setUserMenuOpen(!userMenuOpen)}
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
                      OBGP Admin Access
                    </div>
                  </div>

                  <button className="user-dropdown-item" onClick={toggleTheme}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
                      <span>Tema {theme === 'light' ? 'Escuro' : 'Claro'}</span>
                    </div>
                  </button>

                  <button className="user-dropdown-item" onClick={() => router.push('/admin')}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <User size={16} />
                      <span>Trocar de conta</span>
                    </div>
                  </button>

                  <button className="user-dropdown-item" onClick={() => router.push('/admin/dashboard/settings')}>
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
          {/* Page Title Row (dynamic per page via children) */}
          <div className="admin-page-title-row">
            <div>
              <h1 className="admin-page-title">{getBreadcrumb(currentPath)}</h1>
              <p className="admin-page-subtitle">
                {currentTime && (
                  <span style={{ textTransform: 'capitalize' }}>{currentTime}</span>
                )}
              </p>
            </div>
          </div>

          {children}
        </main>
      </div>
    </div>
  );
}
