'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ClipboardList, FileText, BookOpen, ShieldCheck,
  CheckCircle, Circle, Clock, AlertCircle, ChevronRight,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { usePainel } from '../PainelContext';

const FORM_DEFS = [
  { tipo: 'cadastramento',       label: 'Cadastramento',  obrigatorio: true  },
  { tipo: 'diagnostico',         label: 'Diagnóstico',    obrigatorio: true  },
  { tipo: 'relatorio_atividades',label: 'Atividades',     obrigatorio: false },
  { tipo: 'renovacao',           label: 'Renovação',      obrigatorio: false },
];

const DOC_DEFS = [
  { tipo: 'estatuto',   label: 'Estatuto'       },
  { tipo: 'ata',        label: 'Ata de Eleição' },
  { tipo: 'cnpj',       label: 'CNPJ'           },
  { tipo: 'balancete',  label: 'Balancete'      },
  { tipo: 'certidao',   label: 'Certidão'       },
];

const REL_STATUS: Record<string, { label: string; color: string }> = {
  em_preenchimento: { label: 'Em preenchimento', color: '#d97706' },
  em_analise:       { label: 'Em análise',        color: '#2563eb' },
  aprovado:         { label: 'Aprovado',           color: '#16a34a' },
  reprovado:        { label: 'Revisão necessária', color: '#dc2626' },
};

interface FormRow  { tipo: string; status: string }
interface DocRow   { tipo: string }
interface RelRow   { status: string }

export default function ProcessoPage() {
  const { perfil } = usePainel();
  const [forms, setForms]       = useState<FormRow[]>([]);
  const [docTipos, setDocTipos] = useState<string[]>([]);
  const [prestacoes, setPrestacoes] = useState(0);
  const [relatorio, setRelatorio]   = useState<RelRow | null>(null);
  const [loading, setLoading]       = useState(true);

  useEffect(() => {
    if (!perfil) { setLoading(false); return; }
    (async () => {
      const [formsRes, docsRes, prestRes, relRes] = await Promise.all([
        supabase.from('osc_formularios').select('tipo, status').eq('osc_id', perfil.osc_id),
        supabase.from('osc_documentos').select('tipo').eq('osc_id', perfil.osc_id),
        supabase.from('osc_prestacao_contas').select('id', { count: 'exact' }).eq('osc_id', perfil.osc_id),
        supabase.from('relatorios_conformidade').select('status').eq('osc_id', perfil.osc_id).maybeSingle(),
      ]);
      setForms((formsRes.data ?? []) as FormRow[]);
      setDocTipos(((docsRes.data ?? []) as DocRow[]).map(d => d.tipo));
      setPrestacoes(prestRes.count ?? 0);
      setRelatorio(relRes.data as RelRow | null);
      setLoading(false);
    })();
  }, [perfil]);

  if (loading) return <div className="panel-loading"><div className="panel-spinner" /></div>;

  const formsMap    = Object.fromEntries(forms.map(f => [f.tipo, f.status]));
  const obgDone     = ['cadastramento', 'diagnostico'].every(t => formsMap[t] === 'concluido');
  const docsDone    = DOC_DEFS.filter(d => docTipos.includes(d.tipo)).length;
  const relStatus   = relatorio ? REL_STATUS[relatorio.status] : null;

  return (
    <>
      <div style={{ marginBottom: 16 }}>
        <h1 className="panel-page-title">Meu Processo</h1>
        <p className="panel-page-subtitle">Complete as etapas abaixo para obter o Selo OSC Gestão de Parcerias</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 760 }}>

        {/* ── Etapa 1: Formulários ── */}
        <StepCard
          num="1" icon={ClipboardList} title="Formulários"
          done={obgDone} href="/painel/formularios"
          badge={`${forms.filter(f => f.status === 'concluido').length}/${FORM_DEFS.length} concluídos`}
        >
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginBottom: 6 }}>
            {FORM_DEFS.map(({ tipo, label, obrigatorio }) => (
              <Pill key={tipo}
                label={label + (obrigatorio ? ' *' : '')}
                done={formsMap[tipo] === 'concluido'}
                partial={formsMap[tipo] === 'em_andamento'}
              />
            ))}
          </div>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--site-text-secondary)', margin: 0 }}>* obrigatório para certificação</p>
        </StepCard>

        {/* ── Etapa 2: Documentos Institucionais ── */}
        <StepCard
          num="2" icon={FileText} title="Documentos Institucionais"
          done={docsDone >= DOC_DEFS.length} href="/painel/documentos"
          badge={`${docsDone}/${DOC_DEFS.length} enviados`}
        >
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
            {DOC_DEFS.map(({ tipo, label }) => (
              <Pill key={tipo} label={label} done={docTipos.includes(tipo)} />
            ))}
          </div>
        </StepCard>

        {/* ── Etapa 3: Demonstrativos Financeiros ── */}
        <StepCard
          num="3" icon={BookOpen} title="Demonstrativos Financeiros"
          done={prestacoes > 0} href="/painel/prestacao-contas"
          badge={prestacoes > 0 ? `${prestacoes} registro${prestacoes > 1 ? 's' : ''}` : 'Nenhum registro'}
        >
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--site-text-secondary)', margin: 0 }}>
            Faça upload de balancetes, demonstrativos e relatórios contábeis do período.
          </p>
        </StepCard>

        {/* ── Etapa 4: Relatório de Conformidade ── */}
        <StepCard
          num="4" icon={ShieldCheck} title="Relatório de Conformidade"
          done={relatorio?.status === 'aprovado'}
          active={!!relatorio && relatorio.status !== 'aprovado'}
          href="/painel/relatorio-conformidade"
          badge={relStatus?.label ?? 'Não iniciado'}
          highlight
        >
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--site-text-secondary)', margin: 0 }}>
            Preencha o checklist das 4 seções, anexe os documentos comprobatórios e envie para análise.
          </p>
        </StepCard>

      </div>
    </>
  );
}

/* ── Componentes internos ─────────────────────────────────────────── */

function Pill({ label, done, partial }: { label: string; done: boolean; partial?: boolean }) {
  const color  = done ? '#16a34a' : partial ? '#d97706' : 'var(--site-text-secondary)';
  const bg     = done ? 'rgba(22,163,74,.1)' : partial ? 'rgba(217,119,6,.1)' : 'rgba(13,54,79,.06)';
  const border = done ? 'rgba(22,163,74,.2)' : partial ? 'rgba(217,119,6,.2)' : 'transparent';
  const Icon   = done ? CheckCircle : partial ? Clock : Circle;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 10px', borderRadius: 'var(--site-radius-full)', fontSize: 'var(--text-xs)', fontWeight: 600, background: bg, color, border: `1px solid ${border}` }}>
      <Icon size={11} /> {label}
    </span>
  );
}

function StepCard({ num, icon: Icon, title, done, active, href, badge, highlight, children }: {
  num: string; icon: React.ElementType; title: string;
  done?: boolean; active?: boolean; href: string;
  badge?: string; highlight?: boolean;
  children: React.ReactNode;
}) {
  const borderColor = done ? 'rgba(22,163,74,.25)' : active ? 'rgba(37,99,235,.22)' : 'var(--site-border)';
  const numBg       = done ? '#16a34a' : active ? 'var(--site-primary)' : 'rgba(13,54,79,.08)';
  const numColor    = done || active ? '#fff' : 'var(--site-text-secondary)';
  const badgeColor  = done ? '#16a34a' : 'var(--site-text-secondary)';
  const badgeBg     = done ? 'rgba(22,163,74,.1)' : 'rgba(13,54,79,.06)';

  return (
    <div style={{
      background: '#fff',
      border: `1px solid ${borderColor}`,
      borderRadius: 'var(--site-radius-lg)',
      padding: '14px 20px',
      boxShadow: highlight ? '0 2px 12px rgba(13,54,79,.08)' : 'var(--site-shadow-sm)',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
        <div style={{ width: 30, height: 30, borderRadius: '50%', background: numBg, color: numColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.78rem', fontWeight: 800, flexShrink: 0 }}>
          {done ? <CheckCircle size={15} /> : num}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, flexWrap: 'wrap' }}>
          <Icon size={15} style={{ color: 'var(--site-primary)', flexShrink: 0 }} />
          <span style={{ fontWeight: 700, fontSize: 'var(--text-sm)', color: 'var(--site-text-primary)' }}>{title}</span>
          {badge && (
            <span style={{ fontSize: '0.68rem', fontWeight: 600, padding: '2px 8px', borderRadius: 'var(--site-radius-full)', background: badgeBg, color: badgeColor }}>
              {badge}
            </span>
          )}
        </div>
        <Link href={href} className="panel-btn panel-btn-ghost panel-btn-sm" style={{ flexShrink: 0 }}>
          Acessar <ChevronRight size={13} />
        </Link>
      </div>
      {/* Conteúdo */}
      {children}
    </div>
  );
}
