'use client';
import { useEffect, useState } from 'react';
import { CheckCircle, Circle, Clock, AlertCircle, FileText, BookOpen, ClipboardList, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { usePainel } from './PainelContext';

interface Stats {
  docs: number;
  prestacoes: number;
  formsFeitos: number;
  formsConcluidos: number;
}

const SELO_MAP = {
  pendente:   { label: 'Aguardando Documentação', desc: 'Envie os documentos necessários para iniciar o processo de certificação.', progress: 10 },
  em_analise: { label: 'Em Análise',               desc: 'Sua documentação está sendo avaliada pela equipe OBGP. Em breve você terá uma resposta.', progress: 60 },
  aprovado:   { label: 'Selo OSC Aprovado',         desc: 'Parabéns! Sua organização foi certificada com o Selo de Qualidade OSC.', progress: 100 },
  rejeitado:  { label: 'Revisão Necessária',        desc: 'Sua documentação requer ajustes. Verifique a observação e reenvie os documentos.', progress: 30 },
};

const REQUIRED_DOCS = [
  { tipo: 'estatuto',   label: 'Estatuto Social' },
  { tipo: 'ata',        label: 'Ata de Eleição da Diretoria' },
  { tipo: 'cnpj',       label: 'Comprovante CNPJ' },
  { tipo: 'balancete',  label: 'Balancete / Demonstrativo Financeiro' },
  { tipo: 'certidao',   label: 'Certidão Negativa de Débitos' },
];

export default function DashboardPage() {
  const { user, perfil } = usePainel();
  const [stats, setStats] = useState<Stats | null>(null);
  const [uploadedTipos, setUploadedTipos] = useState<string[]>([]);

  useEffect(() => {
    if (!perfil) return;

    const load = async () => {
      const [docsRes, prestRes, formRes] = await Promise.all([
        supabase.from('osc_documentos').select('tipo', { count: 'exact' }).eq('osc_id', perfil.osc_id),
        supabase.from('osc_prestacao_contas').select('id', { count: 'exact' }).eq('osc_id', perfil.osc_id),
        supabase.from('osc_formularios').select('status').eq('osc_id', perfil.osc_id),
      ]);

      setStats({
        docs: docsRes.count ?? 0,
        prestacoes: prestRes.count ?? 0,
        formsFeitos: formRes.data?.length ?? 0,
        formsConcluidos: formRes.data?.filter((f: { status: string }) => f.status === 'concluido').length ?? 0,
      });
      setUploadedTipos((docsRes.data ?? []).map((d: { tipo: string }) => d.tipo));
    };

    load();
  }, [perfil]);

  if (!perfil) return (
    <>
      <div style={{ marginBottom: 28 }}>
        <h1 className="panel-page-title">Painel de Certificação OSC</h1>
        <p className="panel-page-subtitle">Gestão de Parcerias — OBGP</p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
        {[
          { href: '/painel/formularios',           icon: ClipboardList, label: 'Formulários',               desc: 'Preencha os formulários obrigatórios' },
          { href: '/painel/documentos',             icon: FileText,      label: 'Enviar Documentos',          desc: 'Faça upload de arquivos' },
          { href: '/painel/prestacao-contas',       icon: BookOpen,      label: 'Prestação de Contas',        desc: 'Registre demonstrativos financeiros' },
          { href: '/painel/certificacao',           icon: ShieldCheck,   label: 'Certificação',               desc: 'Inicie o processo de certificação' },
        ].map(item => {
          const Icon = item.icon;
          return (
            <a key={item.href} href={item.href} style={{ background: '#fff', border: '1px solid var(--site-border)', borderRadius: 'var(--site-radius-lg)', padding: '18px 20px', display: 'flex', gap: 14, alignItems: 'center', textDecoration: 'none', boxShadow: 'var(--site-shadow-sm)' }}>
              <div style={{ width: 38, height: 38, borderRadius: 'var(--site-radius-md)', background: 'var(--site-surface-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--site-primary)', flexShrink: 0 }}>
                <Icon size={18} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 'var(--text-sm)', color: 'var(--site-text-primary)', marginBottom: 2 }}>{item.label}</div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--site-text-secondary)' }}>{item.desc}</div>
              </div>
            </a>
          );
        })}
      </div>
    </>
  );

  const seloInfo = SELO_MAP[perfil.status_selo as keyof typeof SELO_MAP];
  const firstName = (perfil.responsavel || user?.user_metadata?.nome || 'Usuário').split(' ')[0];

  const SeloIcon = {
    pendente: Circle,
    em_analise: Clock,
    aprovado: CheckCircle,
    rejeitado: AlertCircle,
  }[perfil.status_selo] ?? Circle;

  return (
    <>
      {/* Greeting */}
      <div style={{ marginBottom: 28 }}>
        <h1 className="panel-page-title">Olá, {firstName}!</h1>
        <p className="panel-page-subtitle">
          Acompanhe o status da certificação e a documentação da sua organização.
        </p>
      </div>

      {/* Selo Card */}
      <div className="panel-selo-card">
        <div className="panel-selo-top">
          <div>
            <div className="panel-selo-label">Selo OSC — OBGP</div>
            <div className="panel-selo-title">{seloInfo.label}</div>
          </div>
          <span className={`panel-selo-status ${perfil.status_selo}`}>
            <SeloIcon size={12} />
            {seloInfo.label}
          </span>
        </div>

        <p className="panel-selo-desc">{seloInfo.desc}</p>

        {perfil.observacao_selo && (
          <div className="panel-selo-obs">
            <strong style={{ color: 'var(--site-gold)' }}>Observação:</strong>{' '}
            {perfil.observacao_selo}
          </div>
        )}

        <div className="panel-selo-progress-row">
          <span className="panel-selo-progress-label">Progresso</span>
          <span className="panel-selo-progress-pct">{seloInfo.progress}%</span>
        </div>
        <div className="panel-selo-bar">
          <div className="panel-selo-bar-fill" style={{ width: `${seloInfo.progress}%` }} />
        </div>
      </div>

      {/* Stats */}
      {stats ? (
        <div className="panel-stats">
          <div className="panel-stat">
            <div className="panel-stat-label">Documentos</div>
            <div className="panel-stat-value">{stats.docs}</div>
            <div className="panel-stat-sub">enviados</div>
          </div>
          <div className="panel-stat">
            <div className="panel-stat-label">Prestações</div>
            <div className="panel-stat-value">{stats.prestacoes}</div>
            <div className="panel-stat-sub">registradas</div>
          </div>
          <div className="panel-stat">
            <div className="panel-stat-label">Formulários</div>
            <div className="panel-stat-value">{stats.formsConcluidos}</div>
            <div className="panel-stat-sub">concluídos</div>
          </div>
        </div>
      ) : (
        <div className="panel-stats">
          {[0, 1, 2].map(i => (
            <div key={i} className="panel-stat" style={{ minHeight: 88, background: 'rgba(255,255,255,.6)' }} />
          ))}
        </div>
      )}

      {/* Required checklist */}
      <div className="panel-card">
        <div className="panel-card-header">
          <h2 className="panel-card-title">Documentos Necessários para o Selo</h2>
          <Link href="/painel/documentos" className="panel-btn panel-btn-ghost panel-btn-sm">
            <FileText size={13} /> Gerenciar
          </Link>
        </div>
        <div className="panel-card-body">
          <div className="panel-checklist">
            {REQUIRED_DOCS.map(doc => {
              const done = uploadedTipos.includes(doc.tipo);
              return (
                <div key={doc.tipo} className="panel-checklist-item">
                  <div className={`panel-check-icon ${done ? 'done' : 'pending'}`}>
                    {done ? <CheckCircle size={12} /> : <Circle size={12} />}
                  </div>
                  <span className={`panel-check-label ${done ? 'done' : ''}`}>{doc.label}</span>
                  {done
                    ? <span className="panel-badge aprovado">Enviado</span>
                    : <span className="panel-badge pendente">Pendente</span>
                  }
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Quick links */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, marginTop: 24 }}>
        {[
          { href: '/painel/documentos', icon: FileText, label: 'Enviar Documentos', desc: 'Faça upload de arquivos' },
          { href: '/painel/prestacao-contas', icon: BookOpen, label: 'Prestação de Contas', desc: 'Registre demonstrativos' },
          { href: '/painel/formularios', icon: ClipboardList, label: 'Formulários', desc: 'Preencha os formulários obrigatórios' },
          { href: '/painel/relatorio-conformidade', icon: ShieldCheck, label: 'Relatório de Conformidade', desc: 'Preencha e envie para certificação' },
        ].map(item => {
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href} style={{ background: '#fff', border: '1px solid var(--site-border)', borderRadius: 'var(--site-radius-lg)', padding: '18px 20px', display: 'flex', gap: 14, alignItems: 'center', textDecoration: 'none', boxShadow: 'var(--site-shadow-sm)', transition: 'box-shadow .2s, transform .2s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = 'var(--site-shadow-md)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = 'var(--site-shadow-sm)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; }}
            >
              <div style={{ width: 38, height: 38, borderRadius: 'var(--site-radius-md)', background: 'var(--site-surface-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--site-primary)', flexShrink: 0 }}>
                <Icon size={18} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 'var(--text-sm)', color: 'var(--site-text-primary)', marginBottom: 2 }}>{item.label}</div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--site-text-secondary)' }}>{item.desc}</div>
              </div>
            </Link>
          );
        })}
      </div>
    </>
  );
}
