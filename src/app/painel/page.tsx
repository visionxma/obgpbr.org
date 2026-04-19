'use client';
import { useEffect, useState } from 'react';
import { CheckCircle, Circle, Clock, AlertCircle, Award, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { usePainel } from './PainelContext';

interface Stats {
  docs: number;
  prestacoes: number;
  formsConcluidos: number;
}

const SELO_MAP = {
  pendente:   { label: 'Aguardando Documentação', desc: 'Envie os documentos e preencha os formulários para iniciar o processo.', progress: 10 },
  em_analise: { label: 'Em Análise',               desc: 'Sua documentação está sendo avaliada pela equipe OBGP.',              progress: 60 },
  aprovado:   { label: 'Selo OSC Aprovado',         desc: 'Parabéns! Sua organização foi certificada com o Selo de Qualidade OSC.', progress: 100 },
  rejeitado:  { label: 'Revisão Necessária',        desc: 'Sua documentação requer ajustes. Verifique as observações.',          progress: 30 },
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
    (async () => {
      const [docsRes, prestRes, formRes] = await Promise.all([
        supabase.from('osc_documentos').select('tipo', { count: 'exact' }).eq('osc_id', perfil.osc_id),
        supabase.from('osc_prestacao_contas').select('id', { count: 'exact' }).eq('osc_id', perfil.osc_id),
        supabase.from('osc_formularios').select('status').eq('osc_id', perfil.osc_id),
      ]);
      setStats({
        docs: docsRes.count ?? 0,
        prestacoes: prestRes.count ?? 0,
        formsConcluidos: formRes.data?.filter((f: { status: string }) => f.status === 'concluido').length ?? 0,
      });
      setUploadedTipos((docsRes.data ?? []).map((d: { tipo: string }) => d.tipo));
    })();
  }, [perfil]);

  // Sem perfil (primeiro acesso)
  if (!perfil) return (
    <>
      <div style={{ marginBottom: 28 }}>
        <h1 className="panel-page-title">Painel de Certificação OSC</h1>
        <p className="panel-page-subtitle">Gestão de Parcerias — OBGP</p>
      </div>
      <Link href="/painel/processo" style={{
        display: 'flex', alignItems: 'center', gap: 16,
        background: '#fff', border: '1px solid var(--site-border)',
        borderRadius: 'var(--site-radius-lg)', padding: '20px 24px',
        textDecoration: 'none', boxShadow: 'var(--site-shadow-sm)',
      }}>
        <div style={{ width: 42, height: 42, borderRadius: 'var(--site-radius-md)', background: 'var(--site-surface-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--site-primary)', flexShrink: 0 }}>
          <Award size={20} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 'var(--text-sm)', color: 'var(--site-text-primary)', marginBottom: 2 }}>Iniciar Processo de Certificação</div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--site-text-secondary)' }}>Preencha formulários, envie documentos e obtenha o Selo OSC Gestão de Parcerias</div>
        </div>
        <ChevronRight size={18} style={{ color: 'var(--site-text-secondary)', flexShrink: 0 }} />
      </Link>
    </>
  );

  const seloInfo = SELO_MAP[perfil.status_selo as keyof typeof SELO_MAP] ?? SELO_MAP.pendente;
  const firstName = (perfil.responsavel || user?.user_metadata?.nome || 'Usuário').split(' ')[0];

  const SeloIcon = {
    pendente:   Circle,
    em_analise: Clock,
    aprovado:   CheckCircle,
    rejeitado:  AlertCircle,
  }[perfil.status_selo] ?? Circle;

  return (
    <>
      {/* Saudação */}
      <div style={{ marginBottom: 24 }}>
        <h1 className="panel-page-title">Olá, {firstName}!</h1>
        <p className="panel-page-subtitle">Acompanhe o status da certificação da sua organização.</p>
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

      {/* Bloco de Certificação contextual */}
      <CertBlock status={perfil.status_selo} />

      {/* Stats */}
      {stats ? (
        <div className="panel-stats">
          <div className="panel-stat">
            <div className="panel-stat-label">Documentos</div>
            <div className="panel-stat-value">{stats.docs}</div>
            <div className="panel-stat-sub">enviados</div>
          </div>
          <div className="panel-stat">
            <div className="panel-stat-label">Demonstrativos</div>
            <div className="panel-stat-value">{stats.prestacoes}</div>
            <div className="panel-stat-sub">registrados</div>
          </div>
          <div className="panel-stat">
            <div className="panel-stat-label">Formulários</div>
            <div className="panel-stat-value">{stats.formsConcluidos}</div>
            <div className="panel-stat-sub">concluídos</div>
          </div>
        </div>
      ) : (
        <div className="panel-stats">
          {[0, 1, 2].map(i => <div key={i} className="panel-stat" style={{ minHeight: 88, background: 'rgba(255,255,255,.6)' }} />)}
        </div>
      )}

      {/* Checklist de documentos obrigatórios */}
      <div className="panel-card">
        <div className="panel-card-header">
          <h2 className="panel-card-title">Documentos Obrigatórios</h2>
          <Link href="/painel/documentos" className="panel-btn panel-btn-ghost panel-btn-sm">
            Gerenciar
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
                  <span className={`panel-badge ${done ? 'aprovado' : 'pendente'}`}>
                    {done ? 'Enviado' : 'Pendente'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* CTA — Meu Processo */}
      <Link href="/painel/processo" style={{
        display: 'flex', alignItems: 'center', gap: 14, marginTop: 8,
        background: '#fff', border: '1px solid var(--site-border)',
        borderRadius: 'var(--site-radius-lg)', padding: '18px 22px',
        textDecoration: 'none', boxShadow: 'var(--site-shadow-sm)',
        transition: 'box-shadow .2s, transform .2s',
      }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = 'var(--site-shadow-md)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = 'var(--site-shadow-sm)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; }}
      >
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 'var(--text-sm)', color: 'var(--site-text-primary)', marginBottom: 2 }}>Gerenciar Meu Processo</div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--site-text-secondary)' }}>Formulários · Documentos · Demonstrativos · Relatório de Conformidade</div>
        </div>
        <ChevronRight size={18} style={{ color: 'var(--site-text-secondary)', flexShrink: 0 }} />
      </Link>
    </>
  );
}

/* ── Bloco contextual de certificação ──────────────────────────────── */
function CertBlock({ status }: { status: string }) {
  if (status === 'aprovado') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px', background: 'rgba(22,163,74,.06)', border: '1px solid rgba(22,163,74,.2)', borderRadius: 'var(--site-radius-lg)' }}>
        <CheckCircle size={18} style={{ color: '#16a34a', flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 'var(--text-sm)', color: '#16a34a' }}>Selo OSC Certificado</div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--site-text-secondary)' }}>Sua organização está certificada pelo programa Selo OSC Gestão de Parcerias</div>
        </div>
        <Link href="/painel/certificacao" className="panel-btn panel-btn-ghost panel-btn-sm" style={{ flexShrink: 0 }}>
          Ver certificado <ChevronRight size={13} />
        </Link>
      </div>
    );
  }
  if (status === 'em_analise') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px', background: 'rgba(37,99,235,.05)', border: '1px solid rgba(37,99,235,.18)', borderRadius: 'var(--site-radius-lg)' }}>
        <Clock size={18} style={{ color: '#2563eb', flexShrink: 0 }} />
        <div>
          <div style={{ fontWeight: 700, fontSize: 'var(--text-sm)', color: '#2563eb' }}>Documentação em Análise</div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--site-text-secondary)' }}>Prazo de até 5 dias úteis para retorno da equipe OBGP</div>
        </div>
      </div>
    );
  }
  if (status === 'rejeitado') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px', background: 'rgba(220,38,38,.05)', border: '1px solid rgba(220,38,38,.2)', borderRadius: 'var(--site-radius-lg)' }}>
        <AlertCircle size={18} style={{ color: '#dc2626', flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 'var(--text-sm)', color: '#dc2626' }}>Revisão Necessária</div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--site-text-secondary)' }}>Corrija os pontos indicados e reenvie seus documentos</div>
        </div>
        <Link href="/painel/certificacao" className="panel-btn panel-btn-ghost panel-btn-sm" style={{ flexShrink: 0 }}>
          Corrigir <ChevronRight size={13} />
        </Link>
      </div>
    );
  }
  // pendente
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px', background: 'rgba(197,171,118,.08)', border: '1px solid rgba(197,171,118,.3)', borderRadius: 'var(--site-radius-lg)' }}>
      <Award size={18} style={{ color: 'var(--site-gold)', flexShrink: 0 }} />
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 700, fontSize: 'var(--text-sm)', color: 'var(--site-text-primary)' }}>Obtenha o Selo OSC — R$ 350</div>
        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--site-text-secondary)' }}>Pagamento único via PIX · Válido 12 meses</div>
      </div>
      <Link href="/painel/certificacao" className="panel-btn panel-btn-primary panel-btn-sm" style={{ flexShrink: 0 }}>
        Iniciar <ChevronRight size={13} />
      </Link>
    </div>
  );
}
