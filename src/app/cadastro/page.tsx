'use client';
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Eye, EyeOff, ArrowLeft, ArrowRight, UserPlus, AlertCircle, CheckCircle, User, Mail, Lock, Building2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

type Step = 1 | 2;

interface FormData {
  nome: string;
  organizacao: string;
  email: string;
  senha: string;
  confirmarSenha: string;
}

export default function CadastroPage() {
  const [step, setStep] = useState<Step>(1);
  const [form, setForm] = useState<FormData>({ nome: '', organizacao: '', email: '', senha: '', confirmarSenha: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const update = (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }));
    setError('');
  };

  const validateStep1 = () => {
    if (!form.nome.trim()) { setError('Informe seu nome completo.'); return false; }
    if (form.nome.trim().split(' ').length < 2) { setError('Informe nome e sobrenome.'); return false; }
    return true;
  };

  const validateStep2 = () => {
    if (!form.email.trim()) { setError('Informe seu email.'); return false; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) { setError('Email inválido.'); return false; }
    if (form.senha.length < 8) { setError('A senha deve ter no mínimo 8 caracteres.'); return false; }
    if (form.senha !== form.confirmarSenha) { setError('As senhas não coincidem.'); return false; }
    return true;
  };

  const handleNext = () => {
    setError('');
    if (!validateStep1()) return;
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!validateStep2()) return;

    setLoading(true);
    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: form.email.trim().toLowerCase(),
        password: form.senha,
        options: {
          data: {
            nome: form.nome.trim(),
            organizacao: form.organizacao.trim(),
            role: 'user',
          },
        },
      });

      if (signUpError) {
        if (signUpError.message.includes('already registered') || signUpError.message.includes('already been registered')) {
          setError('Este email já está cadastrado. Tente fazer login.');
        } else {
          setError('Erro ao criar conta. Tente novamente.');
        }
        setLoading(false);
        return;
      }

      if (data.user) {
        setSuccess(true);
      }
    } catch {
      setError('Erro de conexão. Tente novamente.');
      setLoading(false);
    }
  };

  if (success) {
    return (
      <main className="auth-page">
        <div className="auth-bg" />
        <div className="auth-card" style={{ textAlign: 'center' }}>
          <div className="auth-card-bar" />
          <div className="auth-success-icon">
            <CheckCircle size={48} />
          </div>
          <h2 className="auth-title" style={{ marginTop: 16 }}>Conta criada!</h2>
          <p className="auth-subtitle" style={{ marginTop: 8, marginBottom: 32 }}>
            Verifique seu email para confirmar o cadastro e ativar sua conta.
          </p>
          <Link href="/login" className="auth-submit" style={{ textDecoration: 'none', display: 'inline-flex' }}>
            Ir para o login
          </Link>
          <style>{sharedStyles}</style>
        </div>
      </main>
    );
  }

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
          <h1 className="auth-title">Criar conta</h1>
          <p className="auth-subtitle">Cadastre-se gratuitamente na plataforma</p>
        </div>

        {/* Steps indicator */}
        <div className="auth-steps">
          <div className={`auth-step ${step >= 1 ? 'auth-step--active' : ''}`}>
            <span className="auth-step-num">1</span>
            <span className="auth-step-label">Dados pessoais</span>
          </div>
          <div className="auth-step-line" />
          <div className={`auth-step ${step >= 2 ? 'auth-step--active' : ''}`}>
            <span className="auth-step-num">2</span>
            <span className="auth-step-label">Acesso</span>
          </div>
        </div>

        {error && (
          <div className="auth-alert auth-alert--error">
            <AlertCircle size={16} /> {error}
          </div>
        )}

        {/* Step 1 */}
        {step === 1 && (
          <div className="auth-form">
            <div className="auth-field">
              <label htmlFor="nome" className="auth-label">
                <User size={13} /> Nome completo
              </label>
              <input
                id="nome"
                type="text"
                className="auth-input"
                placeholder="João da Silva"
                value={form.nome}
                onChange={update('nome')}
                autoComplete="name"
                autoFocus
              />
            </div>

            <div className="auth-field">
              <label htmlFor="organizacao" className="auth-label">
                <Building2 size={13} /> Organização <span className="auth-optional">(opcional)</span>
              </label>
              <input
                id="organizacao"
                type="text"
                className="auth-input"
                placeholder="Nome da sua OSC ou organização"
                value={form.organizacao}
                onChange={update('organizacao')}
                autoComplete="organization"
              />
            </div>

            <button type="button" className="auth-submit" onClick={handleNext}>
              Próximo <ArrowRight size={16} />
            </button>
          </div>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="auth-field">
              <label htmlFor="email" className="auth-label">
                <Mail size={13} /> Email
              </label>
              <input
                id="email"
                type="email"
                className="auth-input"
                placeholder="seu@email.com"
                value={form.email}
                onChange={update('email')}
                required
                autoComplete="email"
                autoFocus
              />
            </div>

            <div className="auth-field">
              <label htmlFor="senha" className="auth-label">
                <Lock size={13} /> Senha
              </label>
              <div className="auth-input-wrap">
                <input
                  id="senha"
                  type={showPassword ? 'text' : 'password'}
                  className="auth-input"
                  placeholder="Mínimo 8 caracteres"
                  value={form.senha}
                  onChange={update('senha')}
                  required
                  autoComplete="new-password"
                />
                <button type="button" className="auth-eye" onClick={() => setShowPassword(!showPassword)} aria-label="Mostrar senha">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="auth-field">
              <label htmlFor="confirmar" className="auth-label">
                <Lock size={13} /> Confirmar senha
              </label>
              <div className="auth-input-wrap">
                <input
                  id="confirmar"
                  type={showConfirm ? 'text' : 'password'}
                  className="auth-input"
                  placeholder="Repita a senha"
                  value={form.confirmarSenha}
                  onChange={update('confirmarSenha')}
                  required
                  autoComplete="new-password"
                />
                <button type="button" className="auth-eye" onClick={() => setShowConfirm(!showConfirm)} aria-label="Mostrar confirmação">
                  {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="auth-step2-actions">
              <button type="button" className="auth-back-btn" onClick={() => { setStep(1); setError(''); }}>
                <ArrowLeft size={15} /> Voltar
              </button>
              <button type="submit" className="auth-submit auth-submit--flex" disabled={loading}>
                {loading ? 'Criando conta...' : <><UserPlus size={16} /> Criar conta</>}
              </button>
            </div>
          </form>
        )}

        <p className="auth-footer-text">
          Já tem uma conta?{' '}
          <Link href="/login" className="auth-link">Entrar</Link>
        </p>
      </div>

      <style>{sharedStyles}</style>
    </main>
  );
}

const sharedStyles = `
  .auth-page{min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px;background:#0D364F;background-image:linear-gradient(135deg,#0D364F 0%,#164766 50%,#0a2a3d 100%)}
  .auth-bg{position:fixed;inset:0;pointer-events:none;background-image:url('/texture-dark.svg');background-repeat:repeat;background-size:300px;opacity:.25;z-index:0}
  .auth-card{position:relative;z-index:1;width:100%;max-width:440px;background:rgba(250,251,252,.97);border-radius:var(--site-radius-lg);padding:48px 40px;box-shadow:0 24px 80px rgba(0,0,0,.35),0 0 0 1px rgba(255,255,255,.08)}
  @media(max-width:480px){.auth-card{padding:40px 24px}}
  .auth-card-bar{position:absolute;top:0;left:0;right:0;height:4px;background:var(--site-primary);border-radius:var(--site-radius-lg) var(--site-radius-lg) 0 0}
  .auth-back{display:inline-flex;align-items:center;gap:6px;font-size:var(--text-xs);font-weight:600;color:rgba(13,54,79,.5);text-decoration:none;text-transform:uppercase;letter-spacing:.06em;transition:color .2s;margin-bottom:28px}
  .auth-back:hover{color:var(--site-primary)}
  .auth-header{text-align:center;margin-bottom:28px}
  .auth-title{font-family:var(--font-heading);font-size:1.55rem;font-weight:800;color:var(--site-primary);margin:14px 0 6px;letter-spacing:-.02em}
  .auth-subtitle{font-size:var(--text-sm);color:var(--site-text-secondary)}
  .auth-steps{display:flex;align-items:center;gap:0;margin-bottom:28px}
  .auth-step{display:flex;align-items:center;gap:8px;flex:1}
  .auth-step-num{display:flex;align-items:center;justify-content:center;width:28px;height:28px;border-radius:50%;border:2px solid var(--site-border);font-size:var(--text-xs);font-weight:700;color:var(--site-text-secondary);background:#fff;transition:all .3s;flex-shrink:0}
  .auth-step--active .auth-step-num{background:var(--site-primary);border-color:var(--site-primary);color:#fff}
  .auth-step-label{font-size:var(--text-xs);font-weight:600;color:var(--site-text-secondary);text-transform:uppercase;letter-spacing:.04em}
  .auth-step--active .auth-step-label{color:var(--site-primary)}
  .auth-step-line{flex:1;height:2px;background:var(--site-border);margin:0 12px}
  .auth-alert{display:flex;align-items:center;gap:10px;padding:12px 14px;border-radius:var(--site-radius-md);font-size:var(--text-sm);font-weight:500;margin-bottom:20px;animation:fadeInUp .3s ease}
  .auth-alert--error{background:rgba(239,68,68,.08);border:1px solid rgba(239,68,68,.2);color:#dc2626}
  .auth-form{display:flex;flex-direction:column;gap:18px}
  .auth-field{display:flex;flex-direction:column;gap:6px}
  .auth-label{display:inline-flex;align-items:center;gap:5px;font-size:var(--text-xs);font-weight:700;color:var(--site-primary);text-transform:uppercase;letter-spacing:.05em}
  .auth-optional{font-weight:400;text-transform:none;letter-spacing:0;color:var(--site-text-secondary)}
  .auth-input-wrap{position:relative;display:flex;align-items:center}
  .auth-input{width:100%;padding:13px 16px;border:1.5px solid var(--site-border);border-radius:var(--site-radius-md);background:#fff;color:var(--site-text-primary);font-size:var(--text-base);outline:none;transition:border-color .2s,box-shadow .2s}
  .auth-input:focus{border-color:var(--site-primary);box-shadow:0 0 0 3px rgba(13,54,79,.08)}
  .auth-input-wrap .auth-input{padding-right:46px}
  .auth-eye{position:absolute;right:12px;background:none;border:none;cursor:pointer;display:flex;padding:4px;color:var(--site-text-secondary);transition:color .2s}
  .auth-eye:hover{color:var(--site-primary)}
  .auth-submit{display:flex;align-items:center;justify-content:center;gap:8px;width:100%;padding:15px;background:var(--site-primary);color:#fff;font-size:var(--text-sm);font-weight:700;border:none;border-radius:var(--site-radius-full);cursor:pointer;letter-spacing:-.01em;transition:background .25s,transform .2s,box-shadow .25s;margin-top:4px}
  .auth-submit:hover:not(:disabled){background:var(--site-primary-hover);transform:translateY(-1px);box-shadow:0 8px 24px rgba(13,54,79,.25)}
  .auth-submit:disabled{opacity:.7;cursor:not-allowed}
  .auth-submit--flex{flex:1;margin-top:0;width:auto}
  .auth-step2-actions{display:flex;gap:10px;align-items:center;margin-top:4px}
  .auth-back-btn{display:inline-flex;align-items:center;gap:6px;padding:15px 20px;background:transparent;color:var(--site-primary);font-size:var(--text-sm);font-weight:600;border:1.5px solid var(--site-border);border-radius:var(--site-radius-full);cursor:pointer;white-space:nowrap;transition:border-color .2s,background .2s}
  .auth-back-btn:hover{border-color:var(--site-primary);background:rgba(13,54,79,.04)}
  .auth-footer-text{text-align:center;margin-top:24px;font-size:var(--text-sm);color:var(--site-text-secondary)}
  .auth-link{color:var(--site-primary);font-weight:600;text-decoration:none;transition:color .2s}
  .auth-link:hover{color:var(--site-accent)}
  .auth-success-icon{display:flex;justify-content:center;color:var(--site-accent)}
  @keyframes fadeInUp{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:translateY(0)}}
`;
