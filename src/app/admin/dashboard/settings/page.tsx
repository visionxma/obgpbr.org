'use client';
import { supabase } from '@/lib/supabase';
import { createPortal } from 'react-dom';
import { useState, useEffect } from 'react';
import {
  Settings,
  User,
  Shield,
  CheckCircle2,
  AlertCircle,
  Moon,
  Sun,
  Bell,
  Globe,
} from 'lucide-react';

/**
 * Configurações do Sistema — Painel Premium
 * Focado em preferências do usuário e informações da conta.
 */

export default function SettingsAdmin() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }: any) => {
      setSession(session);
      setLoading(false);
    });

    const savedTheme = localStorage.getItem('admin-theme') as 'light' | 'dark';
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, []);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
  };

  const changeTheme = (newTheme: 'light' | 'dark') => {
    setTheme(newTheme);
    localStorage.setItem('admin-theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    showNotification('success', `Tema ${newTheme === 'dark' ? 'Escuro' : 'Claro'} aplicado com sucesso.`);
    
    // Disparar evento para que o layout também seja notificado da mudança
    window.dispatchEvent(new Event('theme-changed'));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* ── Notification Toast ──────────────── */}
      {notification && typeof document !== 'undefined' && createPortal(
        <div
          className="admin-animate-in"
          style={{
            position: 'fixed',
            top: 90,
            right: 40,
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '14px 20px',
            borderRadius: 'var(--admin-radius-md)',
            background:
              notification.type === 'success'
                ? 'var(--admin-success-bg)'
                : 'var(--admin-danger-bg)',
            color:
              notification.type === 'success'
                ? 'var(--admin-success)'
                : 'var(--admin-danger)',
            border: `1px solid ${
              notification.type === 'success'
                ? 'rgba(16, 185, 129, 0.2)'
                : 'rgba(239, 68, 68, 0.2)'
            }`,
            fontSize: '0.85rem',
            fontWeight: 600,
            boxShadow: 'var(--admin-shadow-lg)',
          }}
        >
          {notification.type === 'success' ? (
            <CheckCircle2 size={18} />
          ) : (
            <AlertCircle size={18} />
          )}
          {notification.message}
        </div>,
        document.body
      )}

      {/* ── Two Column Layout ──────────────── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '24px',
          alignItems: 'start',
        }}
      >
        {/* LEFT: Session / User Info */}
        <div className="glass-card admin-animate-in-delay-1">
          <div className="glass-card-header">
            <div className="glass-card-title">
              <div className="glass-card-title-icon">
                <User size={16} strokeWidth={2.2} />
              </div>
              Perfil do Usuário
            </div>
          </div>
          <div className="glass-card-body">
            {loading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="admin-skeleton"
                    style={{ height: 18, width: `${85 - i * 10}%` }}
                  />
                ))}
              </div>
            ) : session ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                {/* User email */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div
                    style={{
                      width: 54,
                      height: 54,
                      borderRadius: 'var(--admin-radius-md)',
                      background:
                        'linear-gradient(135deg, var(--admin-primary), var(--admin-primary-dark))',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontWeight: 800,
                      fontSize: '1.25rem',
                      flexShrink: 0,
                    }}
                  >
                    {session.user?.email?.charAt(0).toUpperCase() || 'A'}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--admin-text-primary)' }}>
                      {session.user?.email || 'Administrador'}
                    </div>
                    <div
                      style={{
                        fontSize: '0.8rem',
                        color: 'var(--admin-text-secondary)',
                        marginTop: 2,
                      }}
                    >
                      Acesso Administrativo
                    </div>
                  </div>
                </div>

                {/* Session details */}
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 12,
                    paddingTop: 14,
                    borderTop: '1px solid var(--admin-border)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span
                      style={{
                        fontSize: '0.8rem',
                        color: 'var(--admin-text-secondary)',
                        fontWeight: 500,
                      }}
                    >
                      Permissão
                    </span>
                    <span
                      style={{
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        color: 'var(--admin-success)',
                      }}
                    >
                      {session.user?.role || 'authenticated'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span
                      style={{
                        fontSize: '0.8rem',
                        color: 'var(--admin-text-secondary)',
                        fontWeight: 500,
                      }}
                    >
                      Último login
                    </span>
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--admin-text-primary)' }}>
                      {session.user?.last_sign_in_at
                        ? new Date(session.user.last_sign_in_at).toLocaleString('pt-BR')
                        : '—'}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="admin-empty-state" style={{ padding: '30px 0' }}>
                <div className="admin-empty-state-icon">
                  <Shield size={24} />
                </div>
                <div className="admin-empty-state-text">Nenhuma sessão ativa</div>
                <div className="admin-empty-state-hint">
                  Faça login para visualizar os dados da sessão.
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: Appearance Settings */}
        <div className="glass-card admin-animate-in-delay-2">
          <div className="glass-card-header">
            <div className="glass-card-title">
              <div className="glass-card-title-icon">
                <Settings size={16} strokeWidth={2.2} />
              </div>
              Preferências de Interface
            </div>
          </div>
          <div className="glass-card-body">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              
              {/* Theme Toggle */}
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--admin-text-primary)', marginBottom: 12 }}>
                  Tema Visual
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                  <button
                    onClick={() => changeTheme('light')}
                    style={{
                      flex: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 8,
                      padding: '16px',
                      borderRadius: 'var(--admin-radius-md)',
                      background: theme === 'light' ? 'var(--admin-primary-subtle)' : 'var(--admin-surface)',
                      border: `1px solid ${theme === 'light' ? 'var(--admin-primary)' : 'var(--admin-border)'}`,
                      cursor: 'pointer',
                      transition: 'all var(--admin-transition)',
                      color: theme === 'light' ? 'var(--admin-primary)' : 'var(--admin-text-secondary)',
                    }}
                  >
                    <Sun size={24} />
                    <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>Claro</span>
                  </button>
                  <button
                    onClick={() => changeTheme('dark')}
                    style={{
                      flex: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 8,
                      padding: '16px',
                      borderRadius: 'var(--admin-radius-md)',
                      background: theme === 'dark' ? 'var(--admin-primary-subtle)' : 'var(--admin-bg)',
                      border: `1px solid ${theme === 'dark' ? 'var(--admin-primary)' : 'var(--admin-border)'}`,
                      cursor: 'pointer',
                      transition: 'all var(--admin-transition)',
                      color: theme === 'dark' ? 'var(--admin-primary)' : 'var(--admin-text-secondary)',
                    }}
                  >
                    <Moon size={24} />
                    <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>Escuro</span>
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* ── Additional Preferences ────────────────────── */}
      <div className="glass-card admin-animate-in-delay-3">
        <div className="glass-card-header">
          <div className="glass-card-title">
            <div className="glass-card-title-icon">
              <Bell size={16} strokeWidth={2.2} />
            </div>
            Notificações e Idioma
          </div>
        </div>
        <div className="glass-card-body">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: 16,
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                padding: '16px',
                borderRadius: 'var(--admin-radius-md)',
                border: '1px solid var(--admin-border)',
                background: 'var(--admin-bg)',
              }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--admin-text-primary)' }}>Notificações por Email</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-secondary)', marginTop: 2 }}>
                  Receba resumos semanais de atividade no email.
                </div>
              </div>
              <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                <input type="checkbox" style={{ accentColor: 'var(--admin-primary)', width: 18, height: 18 }} defaultChecked />
              </label>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                padding: '16px',
                borderRadius: 'var(--admin-radius-md)',
                border: '1px solid var(--admin-border)',
                background: 'var(--admin-bg)',
              }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--admin-text-primary)' }}>Idioma do Painel</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-secondary)', marginTop: 2 }}>
                  Defina o idioma principal das opções da administração.
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--admin-text-primary)', fontWeight: 600, fontSize: '0.85rem' }}>
                <Globe size={16} color="var(--admin-text-secondary)" />
                Português (BR)
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── System Info Footer ─────────────── */}
      <div
        className="admin-animate-in-delay-4"
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: 24,
          padding: '12px 0',
          fontSize: '0.75rem',
          color: 'var(--admin-text-tertiary)',
          fontWeight: 500,
        }}
      >
        <span>OBGP Admin v1.2</span>
        <span>•</span>
        <span>App Shell Pattern</span>
        <span>•</span>
        <span>Supabase Auth</span>
      </div>
    </div>
  );
}
