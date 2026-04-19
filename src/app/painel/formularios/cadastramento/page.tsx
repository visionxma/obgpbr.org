'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, CheckCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { usePainel } from '../../PainelContext';

const AREAS = [
  'Assistência Social','Educação','Saúde','Cultura e Arte','Meio Ambiente',
  'Direitos Humanos','Habitação','Geração de Renda','Esporte e Lazer',
  'Segurança Alimentar','Infância e Juventude','Idosos','Mulheres','Pessoas com Deficiência',
];

const ESTADOS = [
  'AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG',
  'PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO',
];

const NATUREZAS = [
  'Associação','Fundação','Organização Religiosa','Cooperativa','Outro',
];

type Dados = {
  nome?: string; cnpj?: string; data_fundacao?: string; natureza?: string;
  cep?: string; logradouro?: string; numero?: string; bairro?: string; cidade?: string; estado?: string;
  responsavel_nome?: string; responsavel_cpf?: string; responsavel_cargo?: string;
  responsavel_telefone?: string; responsavel_email?: string;
  areas?: string[]; missao?: string; atividades?: string;
};

export default function FormCadastramento() {
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
        .select('id, dados, status')
        .eq('osc_id', perfil.osc_id)
        .eq('tipo', 'cadastramento')
        .maybeSingle();
      if (data) {
        setRecordId(data.id);
        setDados((data.dados as Dados) ?? {});
      }
      setLoading(false);
    })();
  }, [perfil]);

  const set = (field: keyof Dados, value: string) =>
    setDados(prev => ({ ...prev, [field]: value }));

  const toggleArea = (area: string) =>
    setDados(prev => {
      const areas = prev.areas ?? [];
      return { ...prev, areas: areas.includes(area) ? areas.filter(a => a !== area) : [...areas, area] };
    });

  const handleSave = async (marcarConcluido = false) => {
    if (!perfil || !user) return;
    setSaving(true);
    const payload = {
      user_id: user.id,
      osc_id: perfil.osc_id,
      titulo: 'Formulário de Cadastramento da OSC',
      tipo: 'cadastramento',
      dados,
      status: marcarConcluido ? 'concluido' : 'em_andamento',
      updated_at: new Date().toISOString(),
    };
    if (recordId) {
      await supabase.from('osc_formularios').update(payload).eq('id', recordId);
    } else {
      const { data } = await supabase.from('osc_formularios').insert(payload).select('id').single();
      if (data) setRecordId(data.id);
    }
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
    if (marcarConcluido) router.push('/painel/formularios');
  };

  if (loading) return <div className="panel-loading"><div className="panel-spinner" /></div>;

  if (!user) return (
    <div className="panel-empty">
      <p>Faça login para preencher este formulário.</p>
    </div>
  );

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <button onClick={() => router.push('/painel/formularios')} className="panel-btn panel-btn-ghost panel-btn-sm">
          <ArrowLeft size={14} /> Voltar
        </button>
        <div>
          <h1 className="panel-page-title" style={{ marginBottom: 2 }}>Formulário de Cadastramento da OSC</h1>
          <p className="panel-page-subtitle">Preencha todos os dados cadastrais da organização</p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 780 }}>

        {/* Seção 1 — Identificação */}
        <div className="panel-card">
          <div className="panel-card-header"><h2 className="panel-card-title">1. Identificação</h2></div>
          <div className="panel-card-body" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="panel-field" style={{ gridColumn: '1 / -1' }}>
              <label className="panel-label">Nome da Organização *</label>
              <input className="panel-input" value={dados.nome ?? ''} onChange={e => set('nome', e.target.value)} placeholder="Nome completo da OSC" />
            </div>
            <div className="panel-field">
              <label className="panel-label">CNPJ *</label>
              <input className="panel-input" value={dados.cnpj ?? ''} onChange={e => set('cnpj', e.target.value)} placeholder="00.000.000/0001-00" />
            </div>
            <div className="panel-field">
              <label className="panel-label">Data de Fundação</label>
              <input className="panel-input" type="date" value={dados.data_fundacao ?? ''} onChange={e => set('data_fundacao', e.target.value)} />
            </div>
            <div className="panel-field" style={{ gridColumn: '1 / -1' }}>
              <label className="panel-label">Natureza Jurídica</label>
              <select className="panel-select" value={dados.natureza ?? ''} onChange={e => set('natureza', e.target.value)}>
                <option value="">Selecione...</option>
                {NATUREZAS.map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Seção 2 — Endereço */}
        <div className="panel-card">
          <div className="panel-card-header"><h2 className="panel-card-title">2. Endereço</h2></div>
          <div className="panel-card-body" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="panel-field">
              <label className="panel-label">CEP</label>
              <input className="panel-input" value={dados.cep ?? ''} onChange={e => set('cep', e.target.value)} placeholder="00000-000" />
            </div>
            <div className="panel-field">
              <label className="panel-label">Número</label>
              <input className="panel-input" value={dados.numero ?? ''} onChange={e => set('numero', e.target.value)} placeholder="Nº" />
            </div>
            <div className="panel-field" style={{ gridColumn: '1 / -1' }}>
              <label className="panel-label">Logradouro *</label>
              <input className="panel-input" value={dados.logradouro ?? ''} onChange={e => set('logradouro', e.target.value)} placeholder="Rua, Avenida..." />
            </div>
            <div className="panel-field">
              <label className="panel-label">Bairro</label>
              <input className="panel-input" value={dados.bairro ?? ''} onChange={e => set('bairro', e.target.value)} placeholder="Bairro" />
            </div>
            <div className="panel-field">
              <label className="panel-label">Cidade *</label>
              <input className="panel-input" value={dados.cidade ?? ''} onChange={e => set('cidade', e.target.value)} placeholder="Cidade" />
            </div>
            <div className="panel-field">
              <label className="panel-label">Estado</label>
              <select className="panel-select" value={dados.estado ?? ''} onChange={e => set('estado', e.target.value)}>
                <option value="">UF</option>
                {ESTADOS.map(uf => <option key={uf} value={uf}>{uf}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Seção 3 — Responsável */}
        <div className="panel-card">
          <div className="panel-card-header"><h2 className="panel-card-title">3. Responsável Legal</h2></div>
          <div className="panel-card-body" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="panel-field" style={{ gridColumn: '1 / -1' }}>
              <label className="panel-label">Nome Completo *</label>
              <input className="panel-input" value={dados.responsavel_nome ?? ''} onChange={e => set('responsavel_nome', e.target.value)} placeholder="Nome do responsável" />
            </div>
            <div className="panel-field">
              <label className="panel-label">CPF</label>
              <input className="panel-input" value={dados.responsavel_cpf ?? ''} onChange={e => set('responsavel_cpf', e.target.value)} placeholder="000.000.000-00" />
            </div>
            <div className="panel-field">
              <label className="panel-label">Cargo</label>
              <input className="panel-input" value={dados.responsavel_cargo ?? ''} onChange={e => set('responsavel_cargo', e.target.value)} placeholder="Presidente, Diretor..." />
            </div>
            <div className="panel-field">
              <label className="panel-label">Telefone *</label>
              <input className="panel-input" value={dados.responsavel_telefone ?? ''} onChange={e => set('responsavel_telefone', e.target.value)} placeholder="(00) 00000-0000" />
            </div>
            <div className="panel-field">
              <label className="panel-label">E-mail *</label>
              <input className="panel-input" type="email" value={dados.responsavel_email ?? ''} onChange={e => set('responsavel_email', e.target.value)} placeholder="email@osc.org" />
            </div>
          </div>
        </div>

        {/* Seção 4 — Áreas e Missão */}
        <div className="panel-card">
          <div className="panel-card-header"><h2 className="panel-card-title">4. Áreas de Atuação e Missão</h2></div>
          <div className="panel-card-body" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div className="panel-field">
              <label className="panel-label">Áreas de Atuação *</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 6 }}>
                {AREAS.map(area => {
                  const checked = (dados.areas ?? []).includes(area);
                  return (
                    <button key={area} type="button" onClick={() => toggleArea(area)}
                      style={{
                        padding: '5px 13px', borderRadius: 'var(--site-radius-full)',
                        fontSize: 'var(--text-xs)', fontWeight: 600, cursor: 'pointer',
                        border: checked ? '1px solid var(--site-primary)' : '1px solid var(--site-border)',
                        background: checked ? 'var(--site-primary)' : 'transparent',
                        color: checked ? '#fff' : 'var(--site-text-secondary)',
                        transition: 'all .2s',
                      }}>
                      {area}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="panel-field">
              <label className="panel-label">Missão da Organização</label>
              <textarea className="panel-input" rows={3} value={dados.missao ?? ''} onChange={e => set('missao', e.target.value)} placeholder="Descreva a missão da OSC..." style={{ resize: 'vertical' }} />
            </div>
            <div className="panel-field">
              <label className="panel-label">Principais Atividades</label>
              <textarea className="panel-input" rows={3} value={dados.atividades ?? ''} onChange={e => set('atividades', e.target.value)} placeholder="Descreva as principais atividades desenvolvidas..." style={{ resize: 'vertical' }} />
            </div>
          </div>
        </div>

        {/* Ações */}
        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', paddingBottom: 32 }}>
          {saved && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 'var(--text-sm)', color: 'var(--site-accent)', fontWeight: 600 }}>
              <CheckCircle size={15} /> Salvo!
            </span>
          )}
          <button className="panel-btn panel-btn-ghost" onClick={() => handleSave(false)} disabled={saving}>
            {saving ? <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> : <Save size={15} />}
            Salvar rascunho
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
