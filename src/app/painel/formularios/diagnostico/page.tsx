'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, CheckCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { usePainel } from '../../PainelContext';

type Resp = 'sim' | 'nao' | '';
type Dados = {
  estatuto?: Resp; assembleias?: Resp; conselho_admin?: Resp; conselho_fiscal?: Resp;
  nivel_gestao?: string;
  contabilidade?: Resp; prestacao_contas?: Resp; conta_bancaria?: Resp; financiamentos?: Resp;
  num_funcionarios?: string; num_voluntarios?: string; politica_rh?: Resp;
  desafios?: string; pontos_fortes?: string; melhorias?: string;
};

function RadioGroup({ label, value, onChange }: { label: string; value: Resp; onChange: (v: Resp) => void }) {
  return (
    <div className="panel-field">
      <label className="panel-label">{label}</label>
      <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
        {(['sim', 'nao'] as Resp[]).map(opt => (
          <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 'var(--text-sm)', fontWeight: 500, color: value === opt ? 'var(--site-primary)' : 'var(--site-text-secondary)' }}>
            <input type="radio" checked={value === opt} onChange={() => onChange(opt)}
              style={{ accentColor: 'var(--site-primary)', width: 15, height: 15 }} />
            {opt === 'sim' ? 'Sim' : 'Não'}
          </label>
        ))}
      </div>
    </div>
  );
}

export default function FormDiagnostico() {
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
        .from('osc_formularios')
        .select('id, dados')
        .eq('osc_id', perfil.osc_id)
        .eq('tipo', 'diagnostico')
        .maybeSingle();
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
      titulo: 'Diagnóstico Organizacional', tipo: 'diagnostico',
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
          <h1 className="panel-page-title" style={{ marginBottom: 2 }}>Diagnóstico Organizacional</h1>
          <p className="panel-page-subtitle">Avaliação da maturidade institucional e capacidade de gestão</p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 780 }}>

        {/* Seção 1 — Estrutura */}
        <div className="panel-card">
          <div className="panel-card-header"><h2 className="panel-card-title">1. Estrutura Organizacional</h2></div>
          <div className="panel-card-body" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <RadioGroup label="Possui estatuto social registrado?" value={dados.estatuto ?? ''} onChange={v => set('estatuto', v)} />
            <RadioGroup label="Realiza assembleias regularmente?" value={dados.assembleias ?? ''} onChange={v => set('assembleias', v)} />
            <RadioGroup label="Tem conselho de administração?" value={dados.conselho_admin ?? ''} onChange={v => set('conselho_admin', v)} />
            <RadioGroup label="Tem conselho fiscal atuante?" value={dados.conselho_fiscal ?? ''} onChange={v => set('conselho_fiscal', v)} />
            <div className="panel-field" style={{ gridColumn: '1 / -1' }}>
              <label className="panel-label">Nível de maturidade da gestão (1 = inicial, 5 = excelência)</label>
              <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
                {['1','2','3','4','5'].map(n => (
                  <button key={n} type="button" onClick={() => set('nivel_gestao', n)}
                    style={{
                      width: 44, height: 44, borderRadius: '50%', border: '2px solid',
                      borderColor: dados.nivel_gestao === n ? 'var(--site-primary)' : 'var(--site-border)',
                      background: dados.nivel_gestao === n ? 'var(--site-primary)' : 'transparent',
                      color: dados.nivel_gestao === n ? '#fff' : 'var(--site-text-secondary)',
                      fontWeight: 700, fontSize: 'var(--text-base)', cursor: 'pointer', transition: 'all .2s',
                    }}>{n}</button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Seção 2 — Gestão Financeira */}
        <div className="panel-card">
          <div className="panel-card-header"><h2 className="panel-card-title">2. Gestão Financeira</h2></div>
          <div className="panel-card-body" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <RadioGroup label="Possui contabilidade organizada?" value={dados.contabilidade ?? ''} onChange={v => set('contabilidade', v)} />
            <RadioGroup label="Realiza prestação de contas?" value={dados.prestacao_contas ?? ''} onChange={v => set('prestacao_contas', v)} />
            <RadioGroup label="Tem conta bancária em nome da OSC?" value={dados.conta_bancaria ?? ''} onChange={v => set('conta_bancaria', v)} />
            <RadioGroup label="Obteve financiamentos/convênios?" value={dados.financiamentos ?? ''} onChange={v => set('financiamentos', v)} />
          </div>
        </div>

        {/* Seção 3 — Recursos Humanos */}
        <div className="panel-card">
          <div className="panel-card-header"><h2 className="panel-card-title">3. Recursos Humanos</h2></div>
          <div className="panel-card-body" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <div className="panel-field">
              <label className="panel-label">Nº de funcionários remunerados</label>
              <input className="panel-input" type="number" min="0" value={dados.num_funcionarios ?? ''} onChange={e => set('num_funcionarios', e.target.value)} placeholder="0" />
            </div>
            <div className="panel-field">
              <label className="panel-label">Nº de voluntários ativos</label>
              <input className="panel-input" type="number" min="0" value={dados.num_voluntarios ?? ''} onChange={e => set('num_voluntarios', e.target.value)} placeholder="0" />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <RadioGroup label="Possui política de recursos humanos?" value={dados.politica_rh ?? ''} onChange={v => set('politica_rh', v)} />
            </div>
          </div>
        </div>

        {/* Seção 4 — Avaliação */}
        <div className="panel-card">
          <div className="panel-card-header"><h2 className="panel-card-title">4. Avaliação Institucional</h2></div>
          <div className="panel-card-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="panel-field">
              <label className="panel-label">Principais desafios da organização</label>
              <textarea className="panel-input" rows={3} value={dados.desafios ?? ''} onChange={e => set('desafios', e.target.value)} placeholder="Descreva os principais desafios enfrentados..." style={{ resize: 'vertical' }} />
            </div>
            <div className="panel-field">
              <label className="panel-label">Pontos fortes da organização</label>
              <textarea className="panel-input" rows={3} value={dados.pontos_fortes ?? ''} onChange={e => set('pontos_fortes', e.target.value)} placeholder="Liste os pontos fortes..." style={{ resize: 'vertical' }} />
            </div>
            <div className="panel-field">
              <label className="panel-label">Oportunidades de melhoria</label>
              <textarea className="panel-input" rows={3} value={dados.melhorias ?? ''} onChange={e => set('melhorias', e.target.value)} placeholder="Identifique áreas para melhoria..." style={{ resize: 'vertical' }} />
            </div>
          </div>
        </div>

        {/* Ações */}
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
