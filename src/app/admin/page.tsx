'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';

/**
 * Área Administrativa Protegida - OBGP
 * Implementação Real de Autenticação via Supabase
 */

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    if (!email || !password) {
      setErrorMessage("Por favor, preencha todos os campos corretamente.");
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setErrorMessage("Credenciais inválidas. Verifique seu email e senha.");
        setLoading(false);
      } else if (data.user) {
        const isAdmin = data.user.app_metadata?.role === 'admin';
        if (!isAdmin) {
          await supabase.auth.signOut();
          setErrorMessage("Acesso não autorizado. Esta área é restrita a administradores.");
          setLoading(false);
          return;
        }
        setSuccessMessage("Autenticação aprovada! Preparando ambiente...");
        setTimeout(() => {
          window.location.href = '/admin/dashboard';
        }, 1200);
      }
    } catch (err: any) {
      setErrorMessage("Erro de conexão com o servidor. Tente novamente.");
      setLoading(false);
    }
  };

  return (
    <main style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      backgroundColor: '#0D364F',
      backgroundImage: 'linear-gradient(135deg, #0D364F 0%, #23475E 50%, #12242B 100%)',
      position: 'relative'
    }}>
      {/* Decorative Grid Overlay */}
      <div style={{
        position: 'absolute', inset: 0,
        pointerEvents: 'none', zIndex: 0
      }} />
      <div style={{
        width: '100%', 
        maxWidth: '440px', 
        backgroundColor: 'var(--site-surface)', 
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        padding: '60px 40px',
        borderRadius: 'var(--site-radius-lg)',
        border: '1px solid var(--site-border)',
        boxShadow: 'var(--site-shadow-glass)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Accent Bar */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: 'var(--site-primary)' }} />

        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ 
            fontSize: '0.75rem', 
            fontWeight: 800, 
            letterSpacing: '0.2em', 
            color: 'var(--site-primary)', 
            textTransform: 'uppercase', 
            marginBottom: 16 
          }}>
            Acesso Restrito
          </div>
          <img
            src="/logo.PNG"
            alt="OBGP"
            style={{ height: 50, width: 'auto', objectFit: 'contain', filter: 'brightness(0) saturate(100%)', marginBottom: 8 }}
          />
          <p style={{ color: 'var(--site-text-secondary)', fontSize: '0.95rem' }}>
            Gerencie o conteúdo institucional com precisão.
          </p>
        </div>

        {errorMessage && (
          <div style={{ marginBottom: 24, padding: '14px 16px', backgroundColor: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#ef4444', fontSize: '0.85rem', fontWeight: 500, borderRadius: 'var(--site-radius-md)', display: 'flex', alignItems: 'center', gap: 12, animation: 'fadeIn 0.3s ease' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
            {errorMessage}
          </div>
        )}

        {successMessage && (
          <div style={{ marginBottom: 24, padding: '14px 16px', backgroundColor: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.2)', color: '#26662F', fontSize: '0.85rem', fontWeight: 500, borderRadius: 'var(--site-radius-md)', display: 'flex', alignItems: 'center', gap: 12, animation: 'fadeIn 0.3s ease' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
            {successMessage}
          </div>
        )}

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label htmlFor="email" style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--site-text-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Identificador (Email)
            </label>
            <input 
              type="email" 
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@obgpbr.org"
              required
              style={{ 
                padding: '14px 16px',
                borderRadius: 'var(--site-radius-md)',
                border: '1px solid var(--site-border)', 
                backgroundColor: 'white', 
                color: 'var(--site-text-primary)', 
                fontSize: '1rem',
                outline: 'none',
                transition: 'border-color 0.2s ease'
              }}
              onFocus={e => e.currentTarget.style.borderColor = 'var(--site-primary)'}
              onBlur={e => e.currentTarget.style.borderColor = 'var(--site-border)'}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label htmlFor="password" style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--site-text-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Senha Segura
            </label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <input 
                type={showPassword ? "text" : "password"} 
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                style={{ 
                  width: '100%', 
                  padding: '14px 16px', 
                  paddingRight: '46px',
                  borderRadius: 'var(--site-radius-md)',
                  border: '1px solid var(--site-border)', 
                  backgroundColor: 'white', 
                  color: 'var(--site-text-primary)', 
                  fontSize: '1rem',
                  outline: 'none' 
                }}
                onFocus={e => e.currentTarget.style.borderColor = 'var(--site-primary)'}
                onBlur={e => e.currentTarget.style.borderColor = 'var(--site-border)'}
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: '12px', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', padding: '4px', opacity: 0.5 }}
              >
                {showPassword ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                    <line x1="1" y1="1" x2="23" y2="23"></line>
                  </svg>
                )}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading || !!successMessage}
            className="btn btn-primary"
            style={{ 
              width: '100%', 
              marginTop: '10px', 
              fontSize: '1rem', 
              padding: '16px',
              borderRadius: 'var(--site-radius-full)',
              cursor: (loading || !!successMessage) ? 'not-allowed' : 'pointer',
              backgroundColor: successMessage ? '#26662F' : undefined,
              borderColor: successMessage ? '#26662F' : undefined,
              color: successMessage ? '#ffffff' : undefined,
              transition: 'all 0.3s ease'
            }}
          >
            {successMessage ? 'Acesso Liberado ✨' : loading ? 'Autenticando...' : 'Entrar no Sistema'}
          </button>
        </form>

        <style>{`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-4px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}</style>

        <p style={{ textAlign: 'center', marginTop: '32px', color: 'var(--site-text-tertiary)', fontSize: '0.8rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Plataforma OBGP — v1.5
        </p>
      </div>
    </main>
  );
}
