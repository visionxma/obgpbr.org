'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, CheckCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { usePainel } from '../../PainelContext';

type Dados = {
  periodo_inicio?: string; periodo_fim?: string;
  num_atividades?: string; municipios?: string;
  descricao_atividades?: string;
  total_beneficiarios?: string; perfil_beneficiarios?: string; faixa_etaria?: string;
  resultados?: string; metas?: string; dificuldades?: string; perspectivas?: string;
};

export default function FormRelatorioAtividades() {
  const { user, perfil } = usePainel();
  const router = useRouter();
  const [recordId, setRecordId] = useState<string | null>(null);
  const [dados, setDados] = useState<Dados>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!perfil) { setLoading(false); return; }
    (async () => {
      const { data } = await supabase
        .from('osc_formularios').select('id, dados')
        .eq('osc_id', perfil.osc_id).eq('tipo', 'relatorio_atividades').maybeSingle();
      if (data) { setRecordId(data.id); setDados((data.dados as Dados) ?? {}); }
      setLoading(false);
    })();
  }, [perfil]);

  const set = (field: keyof Dados, value: string) =>
    setDados(prev => ({ ...prev, [field]: value }));

  const handleSave = async (marcarConcluido = false) => {
    if (!perfil || !user) return;
    setSaving(true);
    const payload = {
      user_id: user.id, osc_id: perfil.osc_id,
      titulo: 'Relatório de Atividades', tipo: 'relatorio_atividades',
      dados, status: marcarConcluido ? 'concluido' : 'em_andamento',
      updated_at: new Date().toISOString(),
    };
    if (recordId) {
      await supabase.from('osc_formularios').update(payload).eq('id', recordId);
    } else {
      const { data } = await supabase.from('osc_formularios').insert(payload).select('id').single();
      if (data) setRecordId(data.id);
    }
    setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 2500);
    if (marcarConcluido) router.push('/painel/formularios');
  };

  if (loading) return <div className="panel-loading"><div className="panel-spinner" /></div>;
  if (!user) return <div className="panel-empty"><p>Faça login para preencher este formulário.</p></div>;

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <button onClick={() => router.push('/painel/formularios')} className="panel-btn panel-btn-ghost panel-btn-sm">
          <ArrowLeft size={14} /> Voltar
        </button>
        <div>
          <h1 className="panel-page-title" style={{ marginBottom: 2 }}>Relatório de Atividades</h1>
          <p className="panel-page-subtitle">Atividades realizadas, beneficiários e resultados do período</p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 780 }}>

        {/* Seção 1 — Período */}
        <div className="panel-card">
          <div className="panel-card-header"><h2 className="panel-card-title">1. Período de Referência</h2></div>
          <div className="panel-card-body" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="panel-field">
              <label className="panel-label">Data de Início *</label>
              <input className="panel-input" type="date" value={dados.periodo_inicio ?? ''} onChange={e => set('periodo_inicio', e.target.value)} />
            </div>
            <div className="panel-field">
              <label className="panel-label">Data de Término *</label>
              <input className="panel-input" type="date" value={dados.periodo_fim ?? ''} onChange={e => set('periodo_fim', e.target.value)} />
            </div>
            <div className="panel-field">
              <label className="panel-label">Nº de atividades realizadas</label>
              <input className="panel-input" type="number" min="0" value={dados.num_atividades ?? ''} onChange={e => set('num_atividades', e.target.value)} placeholder="0" />
            </div>
            <div className="panel-field">
              <label className="panel-label">Municípios de atuação</label>
              <input className="panel-input" value={dados.municipios ?? ''} onChange={e => set('municipios', e.target.value)} placeholder="Ex.: Paço do Lumiar, São Luís..." />
            </div>
            <div className="panel-field" style={{ gridColumn: '1 / -1' }}>
              <label className="panel-label">Descrição das atividades realizadas *</label>
              <textarea className="panel-input" rows={4} value={dados.descricao_atividades ?? ''} onChange={e => set('descricao_atividades', e.target.value)} placeholder="Descreva detalhadamente as atividades desenvolvidas no período..." style={{ resize: 'vertical' }} />
            </div>
          </div>
        </div>

        {/* Seção 2 — Beneficiários */}
        <div className="panel-card">
          <div className="panel-card-header"><h2 className="panel-card-title">2. Beneficiários Atendidos</h2></div>
          <div className="panel-card-body" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="panel-field">
              <label className="panel-label">Total de beneficiários *</label>
              <input className="panel-input" type="number" min="0" value={dados.total_beneficiarios ?? ''} onChange={e => set('total_beneficiarios', e.target.value)} placeholder="0" />
            </div>
            <div className="panel-field">
              <label className="panel-label">Faixa etária predominante</label>
              <select className="panel-select" value={dados.faixa_etaria ?? ''} onChange={e => set('faixa_etaria', e.target.value)}>
                <option value="">Selecione...</option>
                {['Crianças (0–12)','Adolescentes (13–17)','Jovens (18–29)','Adultos (30–59)','Idosos (60+)','Todas as faixas'].map(f =>
                  <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
            <div className="panel-field" style={{ gridColumn: '1 / -1' }}>
              <label className="panel-label">Perfil dos beneficiários</label>
              <textarea className="panel-input" rows={3} value={dados.perfil_beneficiarios ?? ''} onChange={e => set('perfil_beneficiarios', e.target.value)} placeholder="Descreva o perfil socioeconômico dos beneficiários..." style={{ resize: 'vertical' }} />
            </div>
          </div>
        </div>

        {/* Seção 3 — Resultados */}
        <div className="panel-card">
          <div className="panel-card-header"><h2 className="panel-card-title">3. Resultados e Avaliação</h2></div>
          <div className="panel-card-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="panel-field">
              <label className="panel-label">Resultados alcançados *</label>
              <textarea className="panel-input" rows={4} value={dados.resultados ?? ''} onChange={e => set('resultados', e.target.value)} placeholder="Descreva os principais resultados e impactos alcançados..." style={{ resize: 'vertical' }} />
            </div>
            <div className="panel-field">
              <label className="panel-label">Cumprimento de metas</label>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 4 }}>
                {['Totalmente atingidas','Parcialmente atingidas','Não atingidas'].map(opt => (
                  <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 'var(--text-sm)', fontWeight: 500, color: dados.metas === opt ? 'var(--site-primary)' : 'var(--site-text-secondary)' }}>
                    <input type="radio" checked={dados.metas === opt} onChange={() => set('metas', opt)} style={{ accentColor: 'var(--site-primary)' }} />
                    {opt}
                  </label>
                ))}
              </div>
            </div>
            <div className="panel-field">
              <label className="panel-label">Dificuldades encontradas</label>
              <textarea className="panel-input" rows={3} value={dados.dificuldades ?? ''} onChange={e => set('dificuldades', e.target.value)} placeholder="Descreva as principais dificuldades..." style={{ resize: 'vertical' }} />
            </div>
            <div className="panel-field">
              <label className="panel-label">Perspectivas para o próximo período</label>
              <textarea className="panel-input" rows={3} value={dados.perspectivas ?? ''} onChange={e => set('perspectivas', e.target.value)} placeholder="Planos e perspectivas futuras..." style={{ resize: 'vertical' }} />
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', paddingBottom: 32 }}>
          {saved && <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 'var(--text-sm)', color: 'var(--site-accent)', fontWeight: 600 }}><CheckCircle size={15} /> Salvo!</span>}
          <button className="panel-btn panel-btn-ghost" onClick={() => handleSave(false)} disabled={saving}>
            {saving ? <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> : <Save size={15} />} Salvar rascunho
          </button>
          <button className="panel-btn panel-btn-primary" onClick={() => handleSave(true)} disabled={saving}>
            <CheckCircle size={15} /> Concluir formulário
          </button>
        </div>
      </div>
      <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
    </>
  );
}
