'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, CheckCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { usePainel } from '../../PainelContext';

type Resp = 'sim' | 'nao' | '';
type Dados = {
  dados_atualizados?: Resp; mudanca_diretoria?: Resp; mudanca_estatuto?: Resp;
  novas_atividades?: string; parcerias?: string; recursos_captados?: string;
  declarante_nome?: string; declarante_cargo?: string; data_declaracao?: string; aceite?: boolean;
};

function RadioGroup({ label, value, onChange }: { label: string; value: Resp; onChange: (v: Resp) => void }) {
  return (
    <div className="panel-field">
      <label className="panel-label">{label}</label>
      <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
        {(['sim', 'nao'] as Resp[]).map(opt => (
          <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 'var(--text-sm)', fontWeight: 500, color: value === opt ? 'var(--site-primary)' : 'var(--site-text-secondary)' }}>
            <input type="radio" checked={value === opt} onChange={() => onChange(opt)} style={{ accentColor: 'var(--site-primary)', width: 15, height: 15 }} />
            {opt === 'sim' ? 'Sim' : 'Não'}
          </label>
        ))}
      </div>
    </div>
  );
}

export default function FormRenovacao() {
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
        .eq('osc_id', perfil.osc_id).eq('tipo', 'renovacao').maybeSingle();
      if (data) { setRecordId(data.id); setDados((data.dados as Dados) ?? {}); }
      setLoading(false);
    })();
  }, [perfil]);

  const set = (field: keyof Dados, value: string | boolean) =>
    setDados(prev => ({ ...prev, [field]: value }));

  const handleSave = async (marcarConcluido = false) => {
    if (!perfil || !user) return;
    setSaving(true);
    const payload = {
      user_id: user.id, osc_id: perfil.osc_id,
      titulo: 'Renovação do Selo OSC', tipo: 'renovacao',
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
          <h1 className="panel-page-title" style={{ marginBottom: 2 }}>Renovação do Selo OSC</h1>
          <p className="panel-page-subtitle">Processo de renovação anual da certificação</p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 780 }}>

        {/* Seção 1 — Confirmação de dados */}
        <div className="panel-card">
          <div className="panel-card-header"><h2 className="panel-card-title">1. Confirmação de Dados Cadastrais</h2></div>
          <div className="panel-card-body" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <RadioGroup label="Os dados cadastrais estão atualizados?" value={dados.dados_atualizados ?? ''} onChange={v => set('dados_atualizados', v)} />
            <RadioGroup label="Houve mudança na diretoria?" value={dados.mudanca_diretoria ?? ''} onChange={v => set('mudanca_diretoria', v)} />
            <RadioGroup label="Houve alteração no estatuto?" value={dados.mudanca_estatuto ?? ''} onChange={v => set('mudanca_estatuto', v)} />
          </div>
        </div>

        {/* Seção 2 — Atividades no período */}
        <div className="panel-card">
          <div className="panel-card-header"><h2 className="panel-card-title">2. Atividades no Período de Vigência</h2></div>
          <div className="panel-card-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="panel-field">
              <label className="panel-label">Novas atividades desenvolvidas</label>
              <textarea className="panel-input" rows={3} value={dados.novas_atividades ?? ''} onChange={e => set('novas_atividades', e.target.value)} placeholder="Descreva as novas atividades desde a última certificação..." style={{ resize: 'vertical' }} />
            </div>
            <div className="panel-field">
              <label className="panel-label">Parcerias e convênios firmados</label>
              <textarea className="panel-input" rows={3} value={dados.parcerias ?? ''} onChange={e => set('parcerias', e.target.value)} placeholder="Liste as parcerias institucionais, convênios e contratos firmados..." style={{ resize: 'vertical' }} />
            </div>
            <div className="panel-field">
              <label className="panel-label">Recursos captados no período</label>
              <input className="panel-input" value={dados.recursos_captados ?? ''} onChange={e => set('recursos_captados', e.target.value)} placeholder="Ex.: R$ 150.000 — Fundo Municipal de Assistência Social" />
            </div>
          </div>
        </div>

        {/* Seção 3 — Declaração */}
        <div className="panel-card">
          <div className="panel-card-header"><h2 className="panel-card-title">3. Declaração de Regularidade</h2></div>
          <div className="panel-card-body" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="panel-field" style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer' }}>
                <input type="checkbox" checked={dados.aceite ?? false} onChange={e => set('aceite', e.target.checked)}
                  style={{ accentColor: 'var(--site-primary)', width: 16, height: 16, marginTop: 2, flexShrink: 0 }} />
                <span style={{ fontSize: 'var(--text-sm)', color: 'var(--site-text-primary)', lineHeight: 1.5 }}>
                  Declaro, sob as penas da lei, que todas as informações prestadas são verdadeiras e que a organização mantém regularidade fiscal, trabalhista e previdenciária, cumprindo os requisitos para renovação do Selo de Qualidade OSC — OBGP.
                </span>
              </label>
            </div>
            <div className="panel-field">
              <label className="panel-label">Nome do responsável pela declaração *</label>
              <input className="panel-input" value={dados.declarante_nome ?? ''} onChange={e => set('declarante_nome', e.target.value)} placeholder="Nome completo" />
            </div>
            <div className="panel-field">
              <label className="panel-label">Cargo</label>
              <input className="panel-input" value={dados.declarante_cargo ?? ''} onChange={e => set('declarante_cargo', e.target.value)} placeholder="Presidente, Diretor..." />
            </div>
            <div className="panel-field">
              <label className="panel-label">Data da declaração *</label>
              <input className="panel-input" type="date" value={dados.data_declaracao ?? ''} onChange={e => set('data_declaracao', e.target.value)} />
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', paddingBottom: 32 }}>
          {saved && <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 'var(--text-sm)', color: 'var(--site-accent)', fontWeight: 600 }}><CheckCircle size={15} /> Salvo!</span>}
          <button className="panel-btn panel-btn-ghost" onClick={() => handleSave(false)} disabled={saving}>
            {saving ? <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> : <Save size={15} />} Salvar rascunho
          </button>
          <button className="panel-btn panel-btn-primary" onClick={() => handleSave(true)} disabled={saving} style={{ opacity: !dados.aceite ? 0.6 : 1 }}>
            <CheckCircle size={15} /> Concluir formulário
          </button>
        </div>
      </div>
      <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
    </>
  );
}
