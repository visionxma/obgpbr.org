'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ClipboardList, BarChart3, FileCheck, RefreshCw, ArrowRight, CheckCircle, Clock, Circle, Pencil } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { usePainel } from '../PainelContext';

interface Formulario {
  id: string;
  titulo: string;
  tipo: string;
  status: 'nao_iniciado' | 'em_andamento' | 'concluido';
  updated_at: string;
}

const FORM_DEFS = [
  {
    tipo: 'cadastramento',
    titulo: 'Formulário de Cadastramento da OSC',
    desc: 'Dados cadastrais completos da organização: CNPJ, endereço, responsáveis e áreas de atuação.',
    icon: ClipboardList,
    obrigatorio: true,
  },
  {
    tipo: 'diagnostico',
    titulo: 'Diagnóstico Organizacional',
    desc: 'Avaliação da maturidade institucional, governança, processos internos e capacidade de gestão.',
    icon: BarChart3,
    obrigatorio: true,
  },
  {
    tipo: 'relatorio_atividades',
    titulo: 'Relatório de Atividades',
    desc: 'Descrição das atividades realizadas, beneficiários atendidos e resultados alcançados no período.',
    icon: FileCheck,
    obrigatorio: false,
  },
  {
    tipo: 'renovacao',
    titulo: 'Renovação do Selo OSC',
    desc: 'Processo de renovação anual da certificação. Disponível apenas para OSCs com Selo ativo.',
    icon: RefreshCw,
    obrigatorio: false,
  },
] as const;

const STATUS_CONFIG = {
  nao_iniciado: { label: 'Não iniciado', Icon: Circle,       cls: 'nao_iniciado' },
  em_andamento: { label: 'Em andamento', Icon: Clock,        cls: 'em_andamento' },
  concluido:    { label: 'Concluído',    Icon: CheckCircle,  cls: 'concluido'    },
} as const;

const ICON_COLORS = {
  cadastramento:       { bg: 'rgba(13,54,79,.08)',   color: 'var(--site-primary)' },
  diagnostico:         { bg: 'rgba(38,102,47,.08)',  color: 'var(--site-accent)'  },
  relatorio_atividades:{ bg: 'rgba(37,99,235,.08)',  color: '#2563eb'             },
  renovacao:           { bg: 'rgba(217,119,6,.08)',  color: '#d97706'             },
} as const;

export default function FormulariosPage() {
  const { user, perfil } = usePainel();
  const router = useRouter();
  const [forms, setForms] = useState<Formulario[]>([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState<string | null>(null);

  const fetchForms = async () => {
    if (!perfil) return;
    const { data } = await supabase
      .from('osc_formularios')
      .select('id, titulo, tipo, status, updated_at')
      .eq('osc_id', perfil.osc_id);
    setForms(data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    if (!perfil) { setLoading(false); return; }
    fetchForms();
  }, [perfil]);

  const getRecord = (tipo: string) => forms.find(f => f.tipo === tipo);

  const handleStart = async (def: typeof FORM_DEFS[number]) => {
    if (!perfil || !user) return;
    setActing(def.tipo);

    const existing = getRecord(def.tipo);
    if (!existing) {
      await supabase.from('osc_formularios').insert({
        user_id: user.id, osc_id: perfil.osc_id,
        titulo: def.titulo, tipo: def.tipo, status: 'em_andamento', dados: {},
      });
      await fetchForms();
    }
    setActing(null);
    router.push(`/painel/formularios/${def.tipo}`);
  };

  if (loading) return <div className="panel-loading"><div className="panel-spinner" /></div>;

  const concluded = forms.filter(f => f.status === 'concluido').length;
  const total = FORM_DEFS.length;

  return (
    <>
      <div style={{ marginBottom: 28 }}>
        <h1 className="panel-page-title">Formulários</h1>
        <p className="panel-page-subtitle">
          Preencha os formulários do processo de certificação Selo OSC.{' '}
          <strong style={{ color: 'var(--site-primary)' }}>{concluded}/{total}</strong> concluídos.
        </p>
      </div>

      <div className="panel-form-cards">
        {FORM_DEFS.map(def => {
          const Icon = def.icon;
          const rec = getRecord(def.tipo);
          const status = rec?.status ?? 'nao_iniciado';
          const cfg = STATUS_CONFIG[status];
          const StatusIcon = cfg.Icon;
          const colors = ICON_COLORS[def.tipo];

          return (
            <div key={def.tipo} className="panel-form-card">
              {/* Header row */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                <div className="panel-form-card-icon" style={{ background: colors.bg, color: colors.color }}>
                  <Icon size={20} />
                </div>
                {def.obrigatorio && (
                  <span style={{
                    fontSize: 'var(--text-2xs)', fontWeight: 700,
                    textTransform: 'uppercase', letterSpacing: '.05em',
                    color: '#dc2626',
                    background: 'rgba(239,68,68,.07)',
                    border: '1px solid rgba(239,68,68,.15)',
                    padding: '2px 8px',
                    borderRadius: 'var(--site-radius-full)',
                    whiteSpace: 'nowrap',
                  }}>
                    Obrigatório
                  </span>
                )}
              </div>

              {/* Body */}
              <div>
                <div className="panel-form-card-title">{def.titulo}</div>
                <div className="panel-form-card-desc">{def.desc}</div>
              </div>

              {/* Footer */}
              <div className="panel-form-card-footer">
                {/* Status */}
                <span className={`panel-badge ${cfg.cls}`}>
                  <StatusIcon size={11} /> {cfg.label}
                </span>

                {/* Ação única contextual */}
                {!user ? (
                  <a
                    href={`https://wa.me/5598987100001?text=Olá%2C+gostaria+de+preencher+o+${encodeURIComponent(def.titulo)}`}
                    target="_blank" rel="noopener noreferrer"
                    className="panel-btn panel-btn-primary panel-btn-sm"
                    style={{ textDecoration: 'none' }}
                  >
                    <ArrowRight size={12} /> Solicitar
                  </a>
                ) : status === 'concluido' ? (
                  <button
                    className="panel-btn panel-btn-ghost panel-btn-sm"
                    onClick={() => router.push(`/painel/formularios/${def.tipo}`)}
                  >
                    <Pencil size={11} /> Ver / Editar
                  </button>
                ) : status === 'em_andamento' ? (
                  <button
                    className="panel-btn panel-btn-primary panel-btn-sm"
                    onClick={() => router.push(`/painel/formularios/${def.tipo}`)}
                  >
                    <Pencil size={12} /> Continuar
                  </button>
                ) : (
                  <button
                    className="panel-btn panel-btn-primary panel-btn-sm"
                    onClick={() => handleStart(def)}
                    disabled={acting === def.tipo}
                  >
                    {acting === def.tipo ? '...' : <>Iniciar <ArrowRight size={12} /></>}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Histórico */}
      {forms.length > 0 && (
        <div style={{ marginTop: 28 }}>
          <div className="panel-card">
            <div className="panel-card-header">
              <h2 className="panel-card-title">Histórico</h2>
            </div>
            <div className="panel-table-wrap">
              <table className="panel-table">
                <thead>
                  <tr>
                    <th>Formulário</th>
                    <th>Status</th>
                    <th>Última atualização</th>
                  </tr>
                </thead>
                <tbody>
                  {forms.map(f => {
                    const cfg = STATUS_CONFIG[f.status] ?? { label: f.status, cls: f.status };
                    return (
                      <tr key={f.id}>
                        <td style={{ fontWeight: 500 }}>{f.titulo}</td>
                        <td><span className={`panel-badge ${cfg.cls}`}>{cfg.label}</span></td>
                        <td style={{ color: 'var(--site-text-secondary)' }}>{new Date(f.updated_at).toLocaleDateString('pt-BR')}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
