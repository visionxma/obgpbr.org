'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Save, CheckCircle, Loader2, MapPin } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { usePainel } from '../../PainelContext';
import {
  maskCPF, maskCNPJ, maskTelefone, maskCEP,
  validateCPF, validateCNPJ, validateEmail, validateTelefone, validateCEP,
  digits,
} from '@/lib/brasil-masks';

const AREAS = [
  'Assistência Social', 'Educação', 'Saúde', 'Cultura e Arte', 'Meio Ambiente',
  'Direitos Humanos', 'Habitação', 'Geração de Renda', 'Esporte e Lazer',
  'Segurança Alimentar', 'Infância e Juventude', 'Idosos', 'Mulheres', 'Pessoas com Deficiência',
];

const ESTADOS = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG',
  'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
];

const NATUREZAS = [
  'Associação', 'Fundação', 'Organização Religiosa', 'Cooperativa', 'Outro',
];

type Dados = {
  nome?: string; cnpj?: string; data_fundacao?: string; natureza?: string;
  cep?: string; logradouro?: string; numero?: string; bairro?: string; cidade?: string; estado?: string;
  responsavel_nome?: string; responsavel_cpf?: string; responsavel_cargo?: string;
  responsavel_telefone?: string; responsavel_email?: string;
  areas?: string[]; missao?: string; atividades?: string;
};

type Erros = Partial<Record<keyof Dados, string>>;

// Normaliza dados carregados do banco aplicando as máscaras
function normalizeDados(d: Dados): Dados {
  return {
    ...d,
    cnpj: d.cnpj ? maskCNPJ(d.cnpj) : d.cnpj,
    cep: d.cep ? maskCEP(d.cep) : d.cep,
    responsavel_cpf: d.responsavel_cpf ? maskCPF(d.responsavel_cpf) : d.responsavel_cpf,
    responsavel_telefone: d.responsavel_telefone ? maskTelefone(d.responsavel_telefone) : d.responsavel_telefone,
  };
}

export default function FormCadastramento() {
  const { user, perfil } = usePainel();
  const router = useRouter();
  const [recordId, setRecordId] = useState<string | null>(null);
  const [dados, setDados] = useState<Dados>({});
  const [erros, setErros] = useState<Erros>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [cepLoading, setCepLoading] = useState(false);
  const [cnpjLoading, setCnpjLoading] = useState(false);

  const activePerfil = perfil || { id: 'guest', osc_id: `OSC-GUEST-${Math.floor(Math.random() * 10000)}` };
  const activeUser = user || { id: 'guest-user' };

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('osc_formularios')
        .select('id, dados, status')
        .eq('osc_id', activePerfil.osc_id)
        .eq('tipo', 'cadastramento')
        .maybeSingle();
      if (data) {
        setRecordId(data.id);
        setDados(normalizeDados((data.dados as Dados) ?? {}));
      }
      setLoading(false);
    })();
  }, [activePerfil.osc_id]);

  const set = (field: keyof Dados, value: string) =>
    setDados(prev => ({ ...prev, [field]: value }));

  const setErro = (field: keyof Dados, msg: string) =>
    setErros(prev => ({ ...prev, [field]: msg }));

  const clearErro = (field: keyof Dados) =>
    setErros(prev => { const n = { ...prev }; delete n[field]; return n; });

  // Handler genérico para campos com máscara
  const handleMasked = (field: keyof Dados, maskFn: (v: string) => string) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      set(field, maskFn(e.target.value));
      clearErro(field);
    };

  // Handler de blur para validação
  const handleBlur = (
    field: keyof Dados,
    validateFn: (v: string) => boolean,
    msg: string,
    required = false,
  ) => () => {
    const val = (dados[field] as string) ?? '';
    if (required && !val.trim()) { setErro(field, 'Campo obrigatório'); return; }
    if (val && !validateFn(val)) setErro(field, msg);
  };

  // CEP com busca automática via ViaCEP
  const handleCEPChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const masked = maskCEP(e.target.value);
    set('cep', masked);
    clearErro('cep');
    if (digits(masked).length === 8) fetchCEP(digits(masked));
  };

  // CNPJ com busca automática via BrasilAPI
  const handleCNPJChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const masked = maskCNPJ(e.target.value);
    set('cnpj', masked);
    clearErro('cnpj');
    if (digits(masked).length === 14 && validateCNPJ(masked)) fetchCNPJ(digits(masked));
  };

  const fetchCNPJ = async (cnpjStr: string, retryCount = 0): Promise<void> => {
    setCnpjLoading(true);
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 6000);

      const res = await fetch(`/api/painel/consultar-cnpj?cnpj=${cnpjStr}`, {
        signal: controller.signal,
      });
      clearTimeout(timeout);

      const json = await res.json();
      if (!json.error && !json.message) {
        
        // Mapeamento inteligente da Natureza Jurídica
        let naturezaMapeada = '';
        if (json.natureza_juridica) {
          const natLower = json.natureza_juridica.toLowerCase();
          if (natLower.includes('associação')) naturezaMapeada = 'Associação';
          else if (natLower.includes('fundação')) naturezaMapeada = 'Fundação';
          else if (natLower.includes('religiosa')) naturezaMapeada = 'Organização Religiosa';
          else if (natLower.includes('cooperativa')) naturezaMapeada = 'Cooperativa';
          else naturezaMapeada = 'Outro';
        }

        // Tentar extrair o responsável do QSA (Quadro de Sócios e Administradores)
        const primeiroSocio = json.qsa && json.qsa.length > 0 ? json.qsa[0] : null;

        setDados(prev => ({
          ...prev,
          nome: json.razao_social || prev.nome,
          natureza: naturezaMapeada || prev.natureza,
          data_fundacao: json.data_inicio_atividade || prev.data_fundacao,
          cep: json.cep ? maskCEP(json.cep.toString()) : prev.cep,
          logradouro: json.logradouro || prev.logradouro,
          numero: json.numero || prev.numero,
          bairro: json.bairro || prev.bairro,
          cidade: json.municipio || prev.cidade,
          estado: json.uf || prev.estado,
          responsavel_telefone: json.ddd_telefone_1 ? maskTelefone(json.ddd_telefone_1) : prev.responsavel_telefone,
          responsavel_email: json.email ? json.email.toLowerCase() : prev.responsavel_email,
          responsavel_nome: primeiroSocio?.nome_socio || prev.responsavel_nome,
          responsavel_cargo: primeiroSocio?.qualificacao_socio || prev.responsavel_cargo,
        }));
      } else {
        setErro('cnpj', json.error || 'CNPJ não encontrado na base da Receita Federal.');
      }
    } catch {
      // Retry automático (1 tentativa) antes de exibir erro amigável
      if (retryCount < 1) {
        setCnpjLoading(false);
        return fetchCNPJ(cnpjStr, retryCount + 1);
      }
      setErro('cnpj', 'Não foi possível consultar agora. Tente novamente em instantes.');
    }
    setCnpjLoading(false);
  };

  const fetchCEP = async (cep: string) => {
    setCepLoading(true);
    try {
      const res = await fetch(`/api/cep/${cep}`);
      const json = await res.json();
      if (!json.erro) {
        setDados(prev => ({
          ...prev,
          logradouro: json.logradouro || prev.logradouro,
          bairro: json.bairro || prev.bairro,
          cidade: json.localidade || prev.cidade,
          estado: json.uf || prev.estado,
        }));
      } else {
        setErro('cep', 'CEP não encontrado');
      }
    } catch {
      setErro('cep', 'Erro ao buscar CEP');
    }
    setCepLoading(false);
  };

  const toggleArea = (area: string) =>
    setDados(prev => {
      const areas = prev.areas ?? [];
      return { ...prev, areas: areas.includes(area) ? areas.filter(a => a !== area) : [...areas, area] };
    });

  const validarTudo = (): boolean => {
    const novos: Erros = {};
    if (!dados.nome?.trim()) novos.nome = 'Campo obrigatório';
    if (dados.cnpj && !validateCNPJ(dados.cnpj)) novos.cnpj = 'CNPJ inválido';
    if (dados.cep && !validateCEP(dados.cep)) novos.cep = 'CEP inválido';
    if (!dados.logradouro?.trim()) novos.logradouro = 'Campo obrigatório';
    if (!dados.cidade?.trim()) novos.cidade = 'Campo obrigatório';
    if (!dados.responsavel_nome?.trim()) novos.responsavel_nome = 'Campo obrigatório';
    if (dados.responsavel_cpf && !validateCPF(dados.responsavel_cpf)) novos.responsavel_cpf = 'CPF inválido';
    if (!dados.responsavel_telefone?.trim()) novos.responsavel_telefone = 'Campo obrigatório';
    else if (!validateTelefone(dados.responsavel_telefone)) novos.responsavel_telefone = 'Telefone inválido';
    if (!dados.responsavel_email?.trim()) novos.responsavel_email = 'Campo obrigatório';
    else if (!validateEmail(dados.responsavel_email)) novos.responsavel_email = 'E-mail inválido';
    setErros(novos);
    return Object.keys(novos).length === 0;
  };

  const handleSave = async (marcarConcluido = false) => {
    if (marcarConcluido && !validarTudo()) return;
    setSaving(true);
    const payload = {
      user_id: activeUser.id,
      osc_id: activePerfil.osc_id,
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

  const temErros = Object.keys(erros).length > 0;

  return (
    <>
      <div style={{ marginBottom: 24 }}>
        <h1 className="panel-page-title" style={{ marginBottom: 2 }}>Formulário de Cadastramento da OSC</h1>
        <p className="panel-page-subtitle">Preencha todos os dados cadastrais da organização</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 780 }}>

        {/* Seção 1 — Identificação */}
        <div className="panel-card">
          <div className="panel-card-header"><h2 className="panel-card-title">1. Identificação</h2></div>
          <div className="panel-card-body" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

            <div className="panel-field" style={{ gridColumn: '1 / -1' }}>
              <label className="panel-label">Nome da Organização *</label>
              <input
                className={`panel-input${erros.nome ? ' input-error' : ''}`}
                value={dados.nome ?? ''}
                onChange={e => { set('nome', e.target.value); clearErro('nome'); }}
                onBlur={() => { if (!dados.nome?.trim()) setErro('nome', 'Campo obrigatório'); }}
                placeholder="Nome completo da OSC"
              />
              {erros.nome && <span className="field-error">{erros.nome}</span>}
            </div>

            <div className="panel-field">
              <label className="panel-label">CNPJ *</label>
              <div style={{ position: 'relative' }}>
                <input
                  className={`panel-input${erros.cnpj ? ' input-error' : ''}`}
                  value={dados.cnpj ?? ''}
                  onChange={handleCNPJChange}
                  onBlur={handleBlur('cnpj', validateCNPJ, 'CNPJ inválido')}
                  placeholder="00.000.000/0001-00"
                  inputMode="numeric"
                  style={{ paddingRight: cnpjLoading ? 36 : undefined }}
                />
                {cnpjLoading && (
                  <Loader2
                    size={15}
                    style={{
                      position: 'absolute', right: 10, top: '50%',
                      transform: 'translateY(-50%)',
                      animation: 'spin 1s linear infinite',
                      color: 'var(--site-text-secondary)',
                    }}
                  />
                )}
              </div>
              {erros.cnpj
                ? <span className="field-error">{erros.cnpj}</span>
                : <span className="field-hint"><CheckCircle size={11} /> Autopreenchimento ativo</span>
              }
            </div>

            <div className="panel-field">
              <label className="panel-label">Data de Fundação</label>
              <input
                className="panel-input"
                type="date"
                value={dados.data_fundacao ?? ''}
                onChange={e => set('data_fundacao', e.target.value)}
              />
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
              <div style={{ position: 'relative' }}>
                <input
                  className={`panel-input${erros.cep ? ' input-error' : ''}`}
                  value={dados.cep ?? ''}
                  onChange={handleCEPChange}
                  onBlur={handleBlur('cep', validateCEP, 'CEP inválido')}
                  placeholder="00000-000"
                  inputMode="numeric"
                  style={{ paddingRight: cepLoading ? 36 : undefined }}
                />
                {cepLoading && (
                  <Loader2
                    size={15}
                    style={{
                      position: 'absolute', right: 10, top: '50%',
                      transform: 'translateY(-50%)',
                      animation: 'spin 1s linear infinite',
                      color: 'var(--site-text-secondary)',
                    }}
                  />
                )}
              </div>
              {erros.cep
                ? <span className="field-error">{erros.cep}</span>
                : <span className="field-hint"><MapPin size={11} /> Endereço preenchido automaticamente</span>
              }
            </div>

            <div className="panel-field">
              <label className="panel-label">Número</label>
              <input
                className="panel-input"
                value={dados.numero ?? ''}
                onChange={e => set('numero', e.target.value)}
                placeholder="Nº"
              />
            </div>

            <div className="panel-field" style={{ gridColumn: '1 / -1' }}>
              <label className="panel-label">Logradouro *</label>
              <input
                className={`panel-input${erros.logradouro ? ' input-error' : ''}`}
                value={dados.logradouro ?? ''}
                onChange={e => { set('logradouro', e.target.value); clearErro('logradouro'); }}
                onBlur={() => { if (!dados.logradouro?.trim()) setErro('logradouro', 'Campo obrigatório'); }}
                placeholder="Rua, Avenida..."
              />
              {erros.logradouro && <span className="field-error">{erros.logradouro}</span>}
            </div>

            <div className="panel-field">
              <label className="panel-label">Bairro</label>
              <input
                className="panel-input"
                value={dados.bairro ?? ''}
                onChange={e => set('bairro', e.target.value)}
                placeholder="Bairro"
              />
            </div>

            <div className="panel-field">
              <label className="panel-label">Cidade *</label>
              <input
                className={`panel-input${erros.cidade ? ' input-error' : ''}`}
                value={dados.cidade ?? ''}
                onChange={e => { set('cidade', e.target.value); clearErro('cidade'); }}
                onBlur={() => { if (!dados.cidade?.trim()) setErro('cidade', 'Campo obrigatório'); }}
                placeholder="Cidade"
              />
              {erros.cidade && <span className="field-error">{erros.cidade}</span>}
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
              <input
                className={`panel-input${erros.responsavel_nome ? ' input-error' : ''}`}
                value={dados.responsavel_nome ?? ''}
                onChange={e => { set('responsavel_nome', e.target.value); clearErro('responsavel_nome'); }}
                onBlur={() => { if (!dados.responsavel_nome?.trim()) setErro('responsavel_nome', 'Campo obrigatório'); }}
                placeholder="Nome do responsável"
              />
              {erros.responsavel_nome && <span className="field-error">{erros.responsavel_nome}</span>}
            </div>

            <div className="panel-field">
              <label className="panel-label">CPF</label>
              <input
                className={`panel-input${erros.responsavel_cpf ? ' input-error' : ''}`}
                value={dados.responsavel_cpf ?? ''}
                onChange={handleMasked('responsavel_cpf', maskCPF)}
                onBlur={handleBlur('responsavel_cpf', validateCPF, 'CPF inválido')}
                placeholder="000.000.000-00"
                inputMode="numeric"
              />
              {erros.responsavel_cpf && <span className="field-error">{erros.responsavel_cpf}</span>}
            </div>

            <div className="panel-field">
              <label className="panel-label">Cargo</label>
              <input
                className="panel-input"
                value={dados.responsavel_cargo ?? ''}
                onChange={e => set('responsavel_cargo', e.target.value)}
                placeholder="Presidente, Diretor..."
              />
            </div>

            <div className="panel-field">
              <label className="panel-label">Telefone *</label>
              <input
                className={`panel-input${erros.responsavel_telefone ? ' input-error' : ''}`}
                value={dados.responsavel_telefone ?? ''}
                onChange={handleMasked('responsavel_telefone', maskTelefone)}
                onBlur={handleBlur('responsavel_telefone', validateTelefone, 'Telefone inválido', true)}
                placeholder="(00) 00000-0000"
                inputMode="numeric"
              />
              {erros.responsavel_telefone && <span className="field-error">{erros.responsavel_telefone}</span>}
            </div>

            <div className="panel-field">
              <label className="panel-label">E-mail *</label>
              <input
                className={`panel-input${erros.responsavel_email ? ' input-error' : ''}`}
                value={dados.responsavel_email ?? ''}
                onChange={e => { set('responsavel_email', e.target.value); clearErro('responsavel_email'); }}
                onBlur={handleBlur('responsavel_email', validateEmail, 'E-mail inválido', true)}
                placeholder="email@osc.org"
                inputMode="email"
                type="email"
              />
              {erros.responsavel_email && <span className="field-error">{erros.responsavel_email}</span>}
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

        {/* Aviso de erros */}
        {temErros && (
          <div style={{
            padding: '10px 16px', borderRadius: 'var(--site-radius)',
            background: 'var(--site-error-bg, #fff5f5)',
            border: '1px solid var(--site-error, #e53e3e)',
            color: 'var(--site-error, #e53e3e)',
            fontSize: 'var(--text-sm)', fontWeight: 500,
          }}>
            Corrija os campos em destaque antes de concluir o formulário.
          </div>
        )}

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

      <style>{`
        @keyframes spin { 100% { transform: rotate(360deg); } }
        .field-error {
          display: block;
          margin-top: 4px;
          font-size: var(--text-xs, 11px);
          color: var(--site-error, #e53e3e);
          font-weight: 500;
        }
        .field-hint {
          display: flex;
          align-items: center;
          gap: 4px;
          margin-top: 4px;
          font-size: var(--text-xs, 11px);
          color: var(--site-text-secondary);
        }
        .input-error {
          border-color: var(--site-error, #e53e3e) !important;
          box-shadow: 0 0 0 2px rgba(229, 62, 62, 0.15);
        }
        .input-error:focus {
          outline-color: var(--site-error, #e53e3e);
        }
      `}</style>
    </>
  );
}
