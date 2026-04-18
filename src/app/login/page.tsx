'use client';
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, LogIn, ArrowLeft, AlertCircle, CheckCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (!email || !password) {
      setError('Preencha todos os campos.');
      setLoading(false);
      return;
    }

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });

      if (authError) {
        setError('Email ou senha incorretos. Verifique suas credenciais.');
        setLoading(false);
        return;
      }

      if (data.user) {
        setSuccess('Login realizado! Redirecionando...');
        setTimeout(() => router.push('/painel'), 800);
      }
    } catch {
      setError('Erro de conexão. Tente novamente.');
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <div className="auth-bg" />
      <div className="auth-card">
        <div className="auth-card-bar" />

        <Link href="/inicio" className="auth-back">
          <ArrowLeft size={14} /> Voltar ao início
        </Link>

        <div className="auth-header">
          <Image src="/logo.png" alt="OBGP" width={52} height={52} style={{ objectFit: 'contain' }} />
          <h1 className="auth-title">Entrar na plataforma</h1>
          <p className="auth-subtitle">Acesse sua conta para continuar</p>
        </div>

        {error && (
          <div className="auth-alert auth-alert--error">
            <AlertCircle size={16} /> {error}
          </div>
        )}
        {success && (
          <div className="auth-alert auth-alert--success">
            <CheckCircle size={16} /> {success}
          </div>
        )}

        <form onSubmit={handleLogin} className="auth-form">
          <div className="auth-field">
            <label htmlFor="email" className="auth-label">Email</label>
            <input
              id="email"
              type="email"
              className="auth-input"
              placeholder="seu@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div className="auth-field">
            <label htmlFor="password" className="auth-label">Senha</label>
            <div className="auth-input-wrap">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                className="auth-input"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
              <button type="button" className="auth-eye" onClick={() => setShowPassword(!showPassword)} aria-label="Mostrar senha">
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="auth-submit"
            disabled={loading || !!success}
          >
            {loading ? 'Entrando...' : success ? 'Acesso liberado!' : (
              <><LogIn size={16} /> Entrar</>
            )}
          </button>
        </form>

        <p className="auth-footer-text">
          Não tem uma conta?{' '}
          <Link href="/cadastro" className="auth-link">Criar conta gratuita</Link>
        </p>
      </div>

      <style>{`
        .auth-page{min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px;background:#0D364F;background-image:linear-gradient(135deg,#0D364F 0%,#164766 50%,#0a2a3d 100%)}
        .auth-bg{position:fixed;inset:0;pointer-events:none;background-image:url('/texture-dark.svg');background-repeat:repeat;background-size:300px;opacity:.25;z-index:0}
        .auth-card{position:relative;z-index:1;width:100%;max-width:420px;background:rgba(250,251,252,.97);border-radius:var(--site-radius-lg);padding:48px 40px;box-shadow:0 24px 80px rgba(0,0,0,.35),0 0 0 1px rgba(255,255,255,.08)}
        @media(max-width:480px){.auth-card{padding:40px 24px}}
        .auth-card-bar{position:absolute;top:0;left:0;right:0;height:4px;background:var(--site-primary);border-radius:var(--site-radius-lg) var(--site-radius-lg) 0 0}
        .auth-back{display:inline-flex;align-items:center;gap:6px;font-size:var(--text-xs);font-weight:600;color:rgba(13,54,79,.5);text-decoration:none;text-transform:uppercase;letter-spacing:.06em;transition:color .2s;margin-bottom:28px}
        .auth-back:hover{color:var(--site-primary)}
        .auth-header{text-align:center;margin-bottom:32px}
        .auth-title{font-family:var(--font-heading);font-size:1.55rem;font-weight:800;color:var(--site-primary);margin:14px 0 6px;letter-spacing:-.02em}
        .auth-subtitle{font-size:var(--text-sm);color:var(--site-text-secondary)}
        .auth-alert{display:flex;align-items:center;gap:10px;padding:12px 14px;border-radius:var(--site-radius-md);font-size:var(--text-sm);font-weight:500;margin-bottom:20px;animation:fadeInUp .3s ease}
        .auth-alert--error{background:rgba(239,68,68,.08);border:1px solid rgba(239,68,68,.2);color:#dc2626}
        .auth-alert--success{background:rgba(38,102,47,.08);border:1px solid rgba(38,102,47,.2);color:var(--site-accent)}
        .auth-form{display:flex;flex-direction:column;gap:20px}
        .auth-field{display:flex;flex-direction:column;gap:6px}
        .auth-label{font-size:var(--text-xs);font-weight:700;color:var(--site-primary);text-transform:uppercase;letter-spacing:.05em}
        .auth-input-wrap{position:relative;display:flex;align-items:center}
        .auth-input{width:100%;padding:13px 16px;border:1.5px solid var(--site-border);border-radius:var(--site-radius-md);background:#fff;color:var(--site-text-primary);font-size:var(--text-base);outline:none;transition:border-color .2s,box-shadow .2s}
        .auth-input:focus{border-color:var(--site-primary);box-shadow:0 0 0 3px rgba(13,54,79,.08)}
        .auth-input-wrap .auth-input{padding-right:46px}
        .auth-eye{position:absolute;right:12px;background:none;border:none;cursor:pointer;display:flex;padding:4px;color:var(--site-text-secondary);transition:color .2s}
        .auth-eye:hover{color:var(--site-primary)}
        .auth-submit{display:flex;align-items:center;justify-content:center;gap:8px;width:100%;padding:15px;background:var(--site-primary);color:#fff;font-size:var(--text-sm);font-weight:700;border:none;border-radius:var(--site-radius-full);cursor:pointer;letter-spacing:-.01em;transition:background .25s,transform .2s,box-shadow .25s;margin-top:4px}
        .auth-submit:hover:not(:disabled){background:var(--site-primary-hover);transform:translateY(-1px);box-shadow:0 8px 24px rgba(13,54,79,.25)}
        .auth-submit:disabled{opacity:.7;cursor:not-allowed}
        .auth-footer-text{text-align:center;margin-top:24px;font-size:var(--text-sm);color:var(--site-text-secondary)}
        .auth-link{color:var(--site-primary);font-weight:600;text-decoration:none;transition:color .2s}
        .auth-link:hover{color:var(--site-accent)}
        @keyframes fadeInUp{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:translateY(0)}}
      `}</style>
    </main>
  );
}
