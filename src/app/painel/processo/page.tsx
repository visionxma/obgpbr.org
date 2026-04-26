'use client';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  ShieldCheck, UploadCloud, CheckCircle2, Clock, Check, AlertCircle, Briefcase, ChevronLeft, ChevronRight, Loader2, FileUp, Sparkles, RefreshCcw
} from 'lucide-react';
import { usePainel } from '../PainelContext';
import { supabase } from '@/lib/supabase';
import { gerarRelatorioDocx } from '@/lib/docxGenerator';

const HABILITACAO_JURIDICA = [
  { id: '2.1', title: 'Cartão CNPJ' },
  { id: '2.2', title: 'QSA Cartão CNPJ' },
  { id: '2.3', title: 'Cadastro Contribuinte Municipal/Estadual' },
  { id: '2.4', title: 'Alvará de Licença e Funcionamento' },
  { id: '2.5', title: 'Estatuto Social' },
  { id: '2.6', title: 'Ata Constituição/Fundação' },
  { id: '2.7', title: 'Ata Eleição e Posse atual' },
  { id: '2.8', title: 'Relação de Membros atual' },
  { id: '2.9', title: 'Comprovante de Endereço da Entidade' },
  { id: '2.10', title: 'RG/CPF do Representante Legal' },
  { id: '2.11', title: 'Comprovante de Endereço do Representante Legal' },
];

const REGULARIDADE_FISCAL = [
  { id: '3.1', title: 'CND Federal' },
  { id: '3.2', title: 'CND Estadual' },
  { id: '3.3', title: 'CNDA Estadual' },
  { id: '3.4', title: 'CND Municipal' },
  { id: '3.5', title: 'CR FGTS' },
  { id: '3.6', title: 'CND Trabalhista' },
  { id: '3.7', title: 'CND CAEMA' },
];

const QUALIFICACAO_FINANCEIRA = [
  { id: '4.1', title: 'Certidão de Falência e Concordata' },
  { id: '4.2', title: 'Registro e Regularidade do Contador' },
  { id: '4.3.1', title: 'Termo de abertura' },
  { id: '4.3.2', title: 'Balanço Patrimonial' },
  { id: '4.3.3', title: 'Demonstração do Superávit e Déficit' },
  { id: '4.3.4', title: 'Demonstração das Mutações do Patrimônio Líquido' },
  { id: '4.3.5', title: 'Demonstração dos Fluxos de Caixa' },
  { id: '4.3.6', title: 'Notas Explicativas dos dois últimos exercícios sociais' },
  { id: '4.3.7', title: 'Termo de encerramento' },
  { id: '4.4', title: 'Ata aprovando prestação de contas com parecer do Conselho Fiscal dos últimos dois exercícios sociais da entidade' },
];

const QUALIFICACAO_TECNICA = [
  { id: '5.1', title: 'Termo de Contrato' },
  { id: '5.2', title: 'Convênio' },
  { id: '5.3', title: 'Termo de Colaboração' },
  { id: '5.4', title: 'Termo de Fomento' },
  { id: '5.5', title: 'Acordo de Cooperação Técnica' },
];

const OUTROS_REGISTROS = [
  { id: '6.1', title: 'Atestado de Existência e Regular Funcionamento – AERFE MP/MA (se houver)' },
  { id: '6.2', title: 'Cadastro Nacional de Entidades de Assistência Social - CNEAS (se houver)' },
  { id: '6.3', title: 'Cadastro Nacional de Estabelecimento de Saúde – CNES (se houver)' },
  { id: '6.4', title: 'Conselho Municipal da Assistência Social – CMAS (se houver)' },
  { id: '6.5', title: 'Conselho Municipal dos Direitos da Criança e Adolescente - CMDCA (se houver)' },
  { id: '6.6', title: 'Alvará de autorização sanitária (se houver)' },
  { id: '6.7', title: 'Sistema de Cadastramento Unificado de Fornecedores - SICAF (se houver)' },
  { id: '6.8', title: 'Registro e Regularidade no Conselho Classe (se houver)' },
  { id: '6.9', title: 'Registro e Regularidade do Profissional RT no Conselho Classe (se houver)' },
];

const WIZARD_STEPS = [
  { label: 'Dados da Entidade' },
  { label: 'Habilitação Jurídica' },
  { label: 'Regularidade Fiscal' },
  { label: 'Qual. Econômica' },
  { label: 'Qual. Técnica' },
  { label: 'Outros Registros' },
  { label: 'Finalização' },
];

export default function ProcessoPage() {
  const { perfil, loading: contextLoading } = usePainel();
  const [step, setStep] = useState(1);
  const [showCnpjStep, setShowCnpjStep] = useState(true);
  const [data, setData] = useState<Record<string, any>>({});
  const [entidadeData, setEntidadeData] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [relatorioId, setRelatorioId] = useState<string | null>(null);
  const [cnpjError, setCnpjError] = useState<string | null>(null);
  const [showValidationErrors, setShowValidationErrors] = useState(false);
  const [cnpjSuccess, setCnpjSuccess] = useState(false);

  const [guestId, setGuestId] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      let id = localStorage.getItem('obgp_guest_id');
      if (!id) {
        id = 'OBGP-' + Math.random().toString(36).substring(2, 9).toUpperCase();
        localStorage.setItem('obgp_guest_id', id);
      }
      setGuestId(id);
    }
  }, []);

  const activePerfil = perfil || {
    id: 'guest',
    osc_id: guestId || 'LOADING...',
    cnpj: '', natureza_juridica: '', razao_social: 'Instituição Convidada', nome_fantasia: '', cep: '', logradouro: '',
    numero_endereco: '', bairro: '', municipio: '', estado: '', data_abertura_cnpj: '', email_osc: '', telefone: '', responsavel: ''
  };

  // Helper para persistência local (fallback para convidados)
  const saveLocal = useCallback((entidade?: any, docs?: any) => {
    if (activePerfil.id === 'guest' && typeof window !== 'undefined') {
      if (entidade) localStorage.setItem('obgp_guest_entidade', JSON.stringify(entidade));
      if (docs) localStorage.setItem('obgp_guest_docs', JSON.stringify(docs));
    }
  }, [activePerfil.id]);

  const loadLocal = useCallback(() => {
    if (typeof window !== 'undefined') {
      const e = localStorage.getItem('obgp_guest_entidade');
      const d = localStorage.getItem('obgp_guest_docs');
      return { 
        entidade: e ? JSON.parse(e) : null, 
        docs: d ? JSON.parse(d) : null 
      };
    }
    return { entidade: null, docs: null };
  }, []);
  const [resetting, setResetting] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [mensagemEnviando, setMensagemEnviando] = useState('');
  const [importando, setImportando] = useState(false);
  const [importError, setImportError] = useState('');
  const [importSuccess, setImportSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cnpjInputRef = useRef<HTMLInputElement>(null);
  const cnpjInputFormRef = useRef<HTMLInputElement>(null);

  const [modal, setModal] = useState<{
    show: boolean;
    title: string;
    message: string;
    type: 'confirm' | 'alert';
    onConfirm?: () => void;
  }>({ show: false, title: '', message: '', type: 'alert' });

  const showAlert = (title: string, message: string) => {
    setModal({ show: true, title, message, type: 'alert' });
  };

  const showConfirm = (title: string, message: string, onConfirm: () => void) => {
    setModal({ show: true, title, message, type: 'confirm', onConfirm });
  };

  const handleImportarDocumento = async (file: File) => {
    setImportando(true);
    setImportError('');
    setImportSuccess(false);
    try {
      const form = new FormData();
      form.append('file', file);
      const res = await fetch('/api/painel/importar-documento', { method: 'POST', body: form });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Erro ao processar documento.');
      const d = json.dados as Record<string, string>;
      setEntidadeData(prev => {
        const updated = { ...prev };
        const fields: (keyof typeof updated)[] = [
          'cnpj', 'razao_social', 'nome_fantasia', 'natureza_juridica', 'data_abertura_cnpj',
          'email_osc', 'telefone', 'responsavel', 'cep', 'logradouro', 'numero_endereco', 'bairro', 'municipio', 'estado'
        ];
        for (const f of fields) {
          if (d[f] && d[f].trim()) updated[f] = d[f].trim();
        }
        return updated;
      });
      setImportSuccess(true);
    } catch (e: any) {
      setImportError(e.message);
    }
    setImportando(false);
  };

  useEffect(() => {
    if (contextLoading || !guestId) return;

    const defaultEntidade = {
      cnpj: activePerfil.cnpj || '',
      natureza_juridica: activePerfil.natureza_juridica || '',
      razao_social: activePerfil.razao_social || '',
      nome_fantasia: (activePerfil as any).nome_fantasia || '',
      cep: activePerfil.cep || '',
      logradouro: activePerfil.logradouro || '',
      numero_endereco: activePerfil.numero_endereco || '',
      bairro: activePerfil.bairro || '',
      municipio: activePerfil.municipio || '',
      estado: activePerfil.estado || '',
      data_abertura_cnpj: activePerfil.data_abertura_cnpj || '',
      email_osc: activePerfil.email_osc || '',
      telefone: activePerfil.telefone || '',
      responsavel: activePerfil.responsavel || '',
    };

    const load = async () => {
      try {
        const { data: existing, error } = await supabase
          .from('relatorios_conformidade')
          .select('id, dados_entidade, habilitacao_juridica')
          .eq('osc_id', activePerfil.osc_id)
          .maybeSingle();

        if (error) throw error;

        if (existing) {
          setRelatorioId(existing.id);
          const loadedEntidade = existing.dados_entidade && Object.keys(existing.dados_entidade).length > 0
            ? existing.dados_entidade
            : defaultEntidade;
          setEntidadeData(loadedEntidade);
          setData(existing.habilitacao_juridica || {});

          if (loadedEntidade.cnpj && loadedEntidade.cnpj.replace(/\D/g, '').length === 14) {
            setShowCnpjStep(false);
          }
        } else {
          // Fallback para localStorage se for convidado e não encontrou no banco
          const local = loadLocal();
          if (local.entidade && local.entidade.cnpj) {
            setEntidadeData(local.entidade);
            if (local.docs) setData(local.docs);
            setShowCnpjStep(false);
          } else {
            setEntidadeData(defaultEntidade);
            if (defaultEntidade.cnpj && defaultEntidade.cnpj.replace(/\D/g, '').length === 14) {
              setShowCnpjStep(false);
            } else {
              setShowCnpjStep(true);
            }
          }
        }
      } catch (err) {
        console.error('Erro ao carregar dados do processo:', err);
      } finally {
        setLoadingData(false);
      }
    };

    load();
  }, [perfil, contextLoading, guestId, activePerfil.osc_id]);

  const handleUpdate = (id: string, field: string, value: string) => {
    setData(prev => {
      const updated = { ...prev, [id]: { ...(prev[id] || {}), [field]: value } };
      saveLocal(undefined, updated);
      return updated;
    });
  };

  const handleEntidadeUpdate = (field: string, value: string) => {
    setEntidadeData(prev => {
      const updated = { ...prev, [field]: value };
      saveLocal(updated);
      return updated;
    });
  };

  const saveProgress = useCallback(async () => {
    setSaving(true);
    try {
      saveLocal(entidadeData, data);
      const payload = {
        osc_id: activePerfil.osc_id,
        dados_entidade: entidadeData,
        habilitacao_juridica: data,
        status: 'em_preenchimento',
      };

      if (relatorioId) {
        await supabase.from('relatorios_conformidade').update(payload).eq('id', relatorioId);
      } else {
        const { data: inserted } = await supabase
          .from('relatorios_conformidade')
          .insert({ ...payload, numero: `OBGP${new Date().getFullYear()}${activePerfil.osc_id.substring(0, 4).toUpperCase()}` })
          .select('id')
          .single();
        if (inserted) setRelatorioId(inserted.id);
      }
    } catch (e) {
      console.error('Erro ao salvar:', e);
    }
    setSaving(false);
  }, [activePerfil.osc_id, entidadeData, data, relatorioId]);

  const handleNext = async () => {
    if (step === 1) {
      const reqEntityFields = ['cnpj', 'natureza_juridica', 'razao_social', 'nome_fantasia', 'email_osc', 'telefone', 'responsavel', 'data_abertura_cnpj', 'cep', 'logradouro', 'numero_endereco', 'bairro', 'municipio', 'estado'];
      const firstEmptyField = reqEntityFields.find(f => !entidadeData[f] || entidadeData[f].trim() === '');
      if (firstEmptyField) {
        setShowValidationErrors(true);
        const element = document.getElementById(`field-${firstEmptyField}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          // Pequeno ajuste para considerar a navbar fixa se necessário
        } else {
          document.getElementById('painel-top')?.scrollIntoView({ behavior: 'smooth' });
        }
        return;
      }
    }
    
    if (step >= 2 && step <= 5) {
      const itemsList = step === 2 ? HABILITACAO_JURIDICA : step === 3 ? REGULARIDADE_FISCAL : step === 4 ? QUALIFICACAO_FINANCEIRA : QUALIFICACAO_TECNICA;
      const firstPending = itemsList.find(item => !data[item.id] || !data[item.id].status || data[item.id].status === 'pendente');
      if (firstPending) {
        setShowValidationErrors(true);
        const element = document.getElementById(`doc-item-${firstPending.id}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else {
          document.getElementById('painel-top')?.scrollIntoView({ behavior: 'smooth' });
        }
        return;
      }
    }

    setShowValidationErrors(false);
    await saveProgress();
    setStep(s => Math.min(s + 1, 7));
    document.getElementById('painel-top')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleBack = () => {
    setStep(s => Math.max(s - 1, 1));
    document.getElementById('painel-top')?.scrollIntoView({ behavior: 'smooth' });
  };
  
  const handleResetProcesso = async () => {
    showConfirm('Reiniciar Processo', 'ATENÇÃO: Isso apagará todos os dados preenchidos e reiniciará o processo. Deseja continuar?', async () => {
      setResetting(true);
      try {
        if (relatorioId) {
          await supabase.from('relatorios_conformidade').delete().eq('id', relatorioId);
        }
        localStorage.removeItem('obgp_guest_entidade');
        localStorage.removeItem('obgp_guest_docs');
        setRelatorioId(null);
        setData({});
        setEntidadeData({ cnpj: '', natureza_juridica: '', razao_social: '', nome_fantasia: '', cep: '', logradouro: '', numero_endereco: '', bairro: '', municipio: '', estado: '', data_abertura_cnpj: '', email_osc: '', telefone: '', responsavel: '' });
        setStep(1);
        setShowCnpjStep(true);
      } catch (e) {
        console.error(e);
      }
      setResetting(false);
    });
  };

  const formatCNPJ = (val: string) => {
    const v = val.replace(/\D/g, '').substring(0, 14);
    if (v.length <= 2) return v;
    if (v.length <= 5) return `${v.substring(0, 2)}.${v.substring(2)}`;
    if (v.length <= 8) return `${v.substring(0, 2)}.${v.substring(2, 5)}.${v.substring(5)}`;
    if (v.length <= 12) return `${v.substring(0, 2)}.${v.substring(2, 5)}.${v.substring(5, 8)}/${v.substring(8)}`;
    return `${v.substring(0, 2)}.${v.substring(2, 5)}.${v.substring(5, 8)}/${v.substring(8, 12)}-${v.substring(12, 14)}`;
  };

  const handleCnpjInputChange = (e: React.ChangeEvent<HTMLInputElement>, ref: React.RefObject<HTMLInputElement | null>, isForm: boolean = false) => {
    const input = e.target;
    const originalValue = input.value;
    const selectionStart = input.selectionStart || 0;
    
    // Contar quantos dígitos existem antes do cursor antes da formatação
    const digitsBeforeCursor = originalValue.substring(0, selectionStart).replace(/\D/g, '').length;
    
    const formatted = formatCNPJ(originalValue);
    
    if (isForm) {
      handleEntidadeUpdate('cnpj', formatted);
    } else {
      setEntidadeData({ ...entidadeData, cnpj: formatted });
    }
    
    setCnpjError(null);
    setCnpjSuccess(false);

    // Restaurar a posição do cursor após o re-render
    setTimeout(() => {
      if (ref.current) {
        let newPos = 0;
        let digitsSeen = 0;
        for (let i = 0; i < formatted.length && digitsSeen < digitsBeforeCursor; i++) {
          if (/\d/.test(formatted[i])) {
            digitsSeen++;
          }
          newPos = i + 1;
        }
        ref.current.setSelectionRange(newPos, newPos);
      }
    }, 0);
  };

  const handleConsultarCNPJ = async (cnpjInput: string): Promise<void> => {
    setCnpjError(null);
    const cleanCnpj = cnpjInput.replace(/\D/g, '');
    if (cleanCnpj.length !== 14) { 
      showAlert('CNPJ Inválido', 'O CNPJ informado não possui a quantidade de dígitos necessária (14). Verifique e tente novamente.'); 
      return; 
    }
    setLoadingData(true);
    try {
      const res = await fetch(`/api/painel/consultar-cnpj?cnpj=${cleanCnpj}`);
      if (!res.ok) throw new Error('Não foi possível consultar agora. Tente novamente em instantes.');
      const d = await res.json();
      
      const newData = {
        ...entidadeData,
        cnpj: cnpjInput,
        razao_social: d.razao_social || '',
        nome_fantasia: d.nome_fantasia || '',
        natureza_juridica: d.natureza_juridica || '',
        data_abertura_cnpj: d.data_inicio_atividade || '',
        email_osc: d.email || '',
        telefone: d.ddd_telefone_1 || '',
        responsavel: d.qsa?.[0]?.nome_socio || '',
        cep: d.cep || '',
        logradouro: d.logradouro || '',
        numero_endereco: d.numero || '',
        bairro: d.bairro || '',
        municipio: d.municipio || '',
        estado: d.uf || '',
      };

      setEntidadeData(newData);
      saveLocal(newData);
      setCnpjSuccess(true);

      // Auto-save imediato para garantir persistência ao trocar de aba
      const payload = {
        osc_id: activePerfil.osc_id,
        dados_entidade: newData,
        status: 'em_preenchimento',
        numero: `OBGP${new Date().getFullYear()}${activePerfil.osc_id.substring(0, 4).toUpperCase()}`
      };
      if (relatorioId) {
        await supabase.from('relatorios_conformidade').update(payload).eq('id', relatorioId);
      } else {
        const { data: inserted } = await supabase.from('relatorios_conformidade').insert(payload).select('id').single();
        if (inserted) setRelatorioId(inserted.id);
      }

    } catch (e: any) {
      setCnpjError(e.message);
    } finally {
      setLoadingData(false);
    }
  };

  const handleConsultarPagamentoEEnviar = async () => {
    setEnviando(true);
    try {
      const docxData = {
        cnpj: entidadeData.cnpj,
        razao_social: entidadeData.razao_social,
        numero_relatorio: `OBGP${new Date().getFullYear()}${activePerfil.osc_id.substring(0, 4).toUpperCase()}`,
        status_final: 'EM ANÁLISE'
      };
      const blob = await gerarRelatorioDocx(docxData as any);
      const pathArquivo = `relatorios/${activePerfil.osc_id}/RELATORIO_${Date.now()}.docx`;
      await supabase.storage.from('osc-docs').upload(pathArquivo, blob);
      await fetch('/api/painel/submeter-processo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ osc_id: activePerfil.osc_id, relatorioId, arquivo_docx_path: pathArquivo }),
      });
      showAlert('Sucesso', 'Seu processo de conformidade foi enviado com sucesso para análise!');
    } catch (e: any) {
      showAlert('Erro ao Enviar', `Não foi possível submeter seu processo: ${e.message}`);
    } finally {
      setEnviando(false);
    }
  };

  const progress = Math.round(((step - 1) / 6) * 100);

  if (loadingData && !showCnpjStep) {
    return <div style={{ padding: 40, textAlign: 'center' }}><Loader2 className="spin-anim" /></div>;
  }

  if (showCnpjStep) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px 0', minHeight: 'calc(100vh - 120px)', animation: 'panelPageIn .3s ease' }}>
        <div className="panel-card" style={{ maxWidth: 600, width: '92%', padding: 'clamp(20px, 5vw, 40px)', textAlign: 'center', boxShadow: '0 20px 50px rgba(0,0,0,0.1)', background: '#fff', borderRadius: 'var(--site-radius-xl)' }}>
          <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'center' }}>
            <div style={{ width: 64, height: 64, background: 'rgba(197,171,118,0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--site-gold)' }}>
              <ShieldCheck size={32} />
            </div>
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--site-primary)', marginBottom: 8, fontFamily: 'var(--font-heading)' }}>Consulta de CNPJ</h2>
          <p style={{ color: 'var(--site-text-secondary)', fontSize: '0.95rem', marginBottom: 32 }}>Insira o CNPJ da sua OSC para iniciar o processo com preenchimento automático oficial.</p>
          
          <div style={{ textAlign: 'left', marginBottom: 24 }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--site-primary)', display: 'block', marginBottom: 8 }}>CNPJ da Instituição</label>
            <input 
              ref={cnpjInputRef}
              type="text" 
              placeholder="00.000.000/0000-00"
              className="panel-input"
              style={{ fontSize: '1.2rem', padding: '16px 20px', textAlign: 'center', letterSpacing: '0.05em', fontWeight: 700 }}
              value={entidadeData.cnpj || ''}
              onChange={(e) => handleCnpjInputChange(e, cnpjInputRef)}
            />
          </div>

          {!cnpjSuccess ? (
            <>
              <div style={{ display: 'flex', gap: 12, flexDirection: 'row' }}>
                <button 
                  className="panel-btn panel-btn-primary" 
                  style={{ flex: 1, padding: 16, fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                  onClick={() => handleConsultarCNPJ(entidadeData.cnpj)}
                  disabled={!entidadeData.cnpj || entidadeData.cnpj.replace(/\D/g, '').length !== 14 || loadingData}
                >
                  {cnpjError ? (
                    <>
                      <RefreshCcw size={18} />
                      Tentar Novamente
                    </>
                  ) : (
                    'Consultar CNPJ'
                  )}
                </button>
                {cnpjError && (
                  <button 
                    onClick={() => setShowCnpjStep(false)}
                    className="panel-btn"
                    style={{ flex: 1, padding: 16, fontSize: '0.95rem', background: '#fff', color: '#B91C1C', border: '1px solid #FCA5A5', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontWeight: 600 }}
                  >
                    Preencher Manualmente
                    <ChevronRight size={18} />
                  </button>
                )}
              </div>
              {cnpjError && (
                <div style={{ marginTop: 16, padding: 12, backgroundColor: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: 8, color: '#B91C1C', fontSize: '0.85rem', textAlign: 'left', animation: 'panelPageIn 0.3s ease', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <AlertCircle size={18} style={{ flexShrink: 0 }} />
                  <span style={{ fontWeight: 600 }}>{cnpjError}</span>
                </div>
              )}
            </>
          ) : (
            <div style={{ marginTop: 16, padding: 20, backgroundColor: '#F0FDF4', border: '1px solid #86EFAC', borderRadius: 8, color: '#166534', textAlign: 'center', animation: 'panelPageIn 0.3s ease' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 16 }}>
                <CheckCircle2 size={24} />
                <span style={{ fontWeight: 800, fontSize: '1.1rem' }}>Consulta realizada com sucesso!</span>
              </div>
              <p style={{ marginBottom: 20, fontSize: '0.9rem' }}>Os dados foram recuperados e preenchidos automaticamente.</p>
              <button 
                onClick={() => setShowCnpjStep(false)}
                className="panel-btn panel-btn-primary"
                style={{ width: '100%', padding: '16px', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
              >
                Clique aqui para avançar
                <ChevronRight size={20} />
              </button>
            </div>
          )}

          <p style={{ marginTop: 24, fontSize: '0.8rem', color: 'rgba(0,0,0,0.4)' }}>
            Os dados serão recuperados diretamente da base de dados da Receita Federal do Brasil.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div id="painel-top" style={{ maxWidth: 900, margin: '0 auto', paddingBottom: 60 }}>
      <div className="processo-header-wrap">
        <div>
          <h1 style={{ fontSize: 'clamp(1.4rem, 4vw, 1.8rem)', fontWeight: 900, color: 'var(--site-primary)', letterSpacing: '-0.02em', marginBottom: 4 }}>
            Relatório de Conformidade
          </h1>
          <p style={{ color: 'var(--site-text-secondary)', fontSize: '0.9rem' }}>
            {activePerfil.razao_social} ({activePerfil.osc_id})
          </p>
        </div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <button 
            onClick={handleResetProcesso}
            disabled={resetting}
            style={{ padding: '8px 16px', fontSize: '0.8rem', fontWeight: 700, borderRadius: 'var(--site-radius-full)', border: '1px solid var(--site-border)', background: '#fff', color: 'var(--site-text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
          >
            {resetting ? <Loader2 size={14} className="spin-anim" /> : <RefreshCcw size={14} />}
            Reiniciar
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 16px', background: 'var(--site-surface-blue)', borderRadius: 'var(--site-radius-full)', border: '1px solid var(--site-border)' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--site-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Progresso</div>
            <div style={{ width: 'clamp(60px, 15vw, 120px)', height: 6, background: 'rgba(0,0,0,0.05)', borderRadius: 3, overflow: 'hidden' }}>
              <div style={{ width: `${progress}%`, height: '100%', background: 'var(--site-gold)', transition: 'width 0.4s ease' }} />
            </div>
            <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--site-gold)' }}>{progress}%</div>
          </div>
        </div>
      </div>

      <div className="wizard-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h2 style={{ fontSize: '1rem', fontWeight: 800, margin: 0, color: '#fff' }}>PAINEL DE ACOMPANHAMENTO</h2>
            <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', marginTop: 4 }}>
              Etapa {step} de {WIZARD_STEPS.length} — {WIZARD_STEPS[step - 1].label}
            </div>
          </div>
        </div>

        <div style={{ position: 'relative' }}>
          <div style={{ position: 'absolute', top: 14, left: 0, right: 0, height: 2, background: 'rgba(255,255,255,0.15)', zIndex: 0 }} />
          <div style={{ position: 'absolute', top: 14, left: 0, width: `${progress}%`, height: 2, background: 'var(--site-gold)', zIndex: 1, transition: 'width 0.5s ease' }} />
          <div className="wizard-steps-row">
            {WIZARD_STEPS.map((s, i) => {
              const done = step > i + 1;
              const active = step === i + 1;
              return (
                <div key={i} className={`wizard-step-item ${active ? 'active' : ''}`}>
                  <div style={{ width: 30, height: 30, borderRadius: '50%', background: done ? 'var(--site-gold)' : (active ? 'var(--site-primary)' : 'rgba(255,255,255,0.05)'), border: done ? 'none' : (active ? '2px solid var(--site-gold)' : '2px solid rgba(255,255,255,0.2)'), display: 'flex', alignItems: 'center', justifyContent: 'center', color: done ? '#fff' : (active ? 'var(--site-gold)' : 'rgba(255,255,255,0.4)'), zIndex: 2 }}>
                    {done ? <Check size={14} /> : <span style={{ fontSize: 11, fontWeight: 700 }}>{i + 1}</span>}
                  </div>
                  <span className="wizard-step-label" style={{ color: active ? '#fff' : (done ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.4)'), fontWeight: active ? 700 : 500 }}>{s.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* TOP NAVIGATION (DUPLICATE) */}
      <div className="processo-nav-btns" style={{ display: 'flex', justifyContent: step === 1 ? 'flex-end' : 'space-between', alignItems: 'center', marginBottom: 24, paddingBottom: 24, borderBottom: '1px solid var(--site-border)' }}>
        {step > 1 && (
          <button onClick={handleBack} className="btn" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', fontSize: '0.85rem', background: 'var(--site-surface-warm)', color: 'var(--site-text-primary)', border: '1px solid var(--site-border)', borderRadius: 'var(--site-radius-md)', cursor: 'pointer', fontWeight: 700 }}>
            <ChevronLeft size={16} /> Voltar
          </button>
        )}
        {step < 7 && (
          <button onClick={handleNext} disabled={saving} className="btn btn-gold" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 24px', fontSize: '0.9rem', fontWeight: 700, opacity: saving ? 0.7 : 1 }}>
            {saving ? (
              <><Loader2 size={16} className="spin-anim" /> Salvando...</>
            ) : (
              <>Salvar e Avançar <ChevronRight size={16} /></>
            )}
          </button>
        )}
      </div>

      {/* STEP CONTENT */}
      {step === 1 && (
        <section style={{ marginBottom: 32, border: '1px solid var(--site-border)', borderRadius: 'var(--site-radius-xl)', overflow: 'hidden', background: '#fff' }}>
          <header style={{ background: 'var(--site-primary)', padding: '16px 24px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <Briefcase size={20} color="#fff" />
            <h2 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0, color: '#fff' }}>1. DADOS DA ENTIDADE</h2>
          </header>

          {/* IMPORT ZONE */}
          <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--site-border)', background: 'var(--site-surface-warm)' }}>
            <p style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--site-text-secondary)', textTransform: 'uppercase', marginBottom: 12 }}>
              <Sparkles size={13} style={{ display: 'inline', marginRight: 6, position: 'relative', top: 1 }} />
              Preenchimento automático via documento
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              style={{ display: 'none' }}
              onChange={e => { const f = e.target.files?.[0]; if (f) handleImportarDocumento(f); e.target.value = ''; }}
            />
            <div
              onClick={() => !importando && fileInputRef.current?.click()}
              onDragOver={e => e.preventDefault()}
              onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleImportarDocumento(f); }}
              style={{
                border: `2px dashed ${importError ? '#dc2626' : importSuccess ? '#16a34a' : 'var(--site-gold)'}`,
                borderRadius: 'var(--site-radius-lg)',
                padding: '20px 28px',
                display: 'flex', alignItems: 'center', gap: 16,
                cursor: importando ? 'not-allowed' : 'pointer',
                background: importSuccess ? 'rgba(22,163,74,0.04)' : 'rgba(197,171,118,0.06)',
                transition: 'all 0.2s',
              }}
            >
              {importando ? (
                <Loader2 size={28} className="spin-anim" style={{ flexShrink: 0, color: 'var(--site-gold)' }} />
              ) : importSuccess ? (
                <CheckCircle2 size={28} style={{ flexShrink: 0, color: '#16a34a' }} />
              ) : (
                <FileUp size={28} style={{ flexShrink: 0, color: 'var(--site-gold)' }} />
              )}
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', color: importError ? '#dc2626' : importSuccess ? '#16a34a' : 'var(--site-text-primary)' }}>
                  {importando
                    ? 'Analisando documento com IA...'
                    : importError
                      ? importError
                      : importSuccess
                        ? 'Dados preenchidos automaticamente! Revise abaixo.'
                        : 'Clique ou arraste um PDF / DOCX com os dados da entidade'}
                </div>
                {!importando && !importSuccess && !importError && (
                  <div style={{ fontSize: '0.78rem', color: 'var(--site-text-secondary)', marginTop: 3 }}>
                    O documento será lido e os campos serão preenchidos automaticamente.
                  </div>
                )}
              </div>
            </div>
          </div>

          <div style={{ padding: 24, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20 }}>
            <div id="field-cnpj" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--site-text-secondary)', textTransform: 'uppercase' }}>CNPJ</label>
              <input
                ref={cnpjInputFormRef}
                type="text"
                value={entidadeData.cnpj || ''}
                onChange={(e) => handleCnpjInputChange(e, cnpjInputFormRef, true)}
                style={{ padding: '10px 14px', borderRadius: 'var(--site-radius-md)', border: (showValidationErrors && !entidadeData.cnpj) ? '1px solid #ef4444' : '1px solid var(--site-border)', background: '#fff', color: 'var(--site-text-primary)', fontSize: '0.9rem', outline: 'none', width: '100%', boxSizing: 'border-box' }}
              />
              {showValidationErrors && !entidadeData.cnpj && <span style={{ color: '#ef4444', fontSize: '0.7rem', fontWeight: 700, marginTop: -2 }}>⚠️ Preencha este campo obrigatório.</span>}
            </div>
            <InputField id="field-natureza_juridica" label="Natureza Jurídica" value={entidadeData.natureza_juridica} onChange={(v) => handleEntidadeUpdate('natureza_juridica', v)} showError={showValidationErrors && !entidadeData.natureza_juridica} />
            <InputField id="field-razao_social" label="Razão Social" value={entidadeData.razao_social} onChange={(v) => handleEntidadeUpdate('razao_social', v)} showError={showValidationErrors && !entidadeData.razao_social} />
            <InputField id="field-nome_fantasia" label="Nome Fantasia" value={entidadeData.nome_fantasia} onChange={(v) => handleEntidadeUpdate('nome_fantasia', v)} showError={showValidationErrors && !entidadeData.nome_fantasia} />
            <InputField id="field-email_osc" label="E-mail" value={entidadeData.email_osc} onChange={(v) => handleEntidadeUpdate('email_osc', v)} type="email" showError={showValidationErrors && !entidadeData.email_osc} />
            <InputField id="field-telefone" label="Telefone" value={entidadeData.telefone} onChange={(v) => handleEntidadeUpdate('telefone', v)} showError={showValidationErrors && !entidadeData.telefone} />
            <InputField id="field-responsavel" label="Representante Legal" value={entidadeData.responsavel} onChange={(v) => handleEntidadeUpdate('responsavel', v)} showError={showValidationErrors && !entidadeData.responsavel} />
            <InputField id="field-data_abertura_cnpj" label="Data de Abertura do CNPJ" type="date" value={entidadeData.data_abertura_cnpj} onChange={(v) => handleEntidadeUpdate('data_abertura_cnpj', v)} showError={showValidationErrors && !entidadeData.data_abertura_cnpj} />
            <div style={{ gridColumn: '1 / -1', borderTop: '1px solid var(--site-border)', paddingTop: 20, marginTop: 4 }}>
              <h3 style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--site-text-secondary)', textTransform: 'uppercase', marginBottom: 16 }}>Endereço Completo</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 20 }}>
                <InputField id="field-cep" label="CEP" value={entidadeData.cep} onChange={(v) => handleEntidadeUpdate('cep', v)} showError={showValidationErrors && !entidadeData.cep} />
                <InputField id="field-logradouro" label="Logradouro" value={entidadeData.logradouro} onChange={(v) => handleEntidadeUpdate('logradouro', v)} showError={showValidationErrors && !entidadeData.logradouro} />
                <InputField id="field-numero_endereco" label="Número" value={entidadeData.numero_endereco} onChange={(v) => handleEntidadeUpdate('numero_endereco', v)} showError={showValidationErrors && !entidadeData.numero_endereco} />
                <InputField id="field-bairro" label="Bairro" value={entidadeData.bairro} onChange={(v) => handleEntidadeUpdate('bairro', v)} showError={showValidationErrors && !entidadeData.bairro} />
                <InputField id="field-municipio" label="Município" value={entidadeData.municipio} onChange={(v) => handleEntidadeUpdate('municipio', v)} showError={showValidationErrors && !entidadeData.municipio} />
                <InputField id="field-estado" label="Estado (UF)" value={entidadeData.estado} onChange={(v) => handleEntidadeUpdate('estado', v)} showError={showValidationErrors && !entidadeData.estado} />
              </div>
            </div>
          </div>
        </section>
      )}

      {step === 2 && (
        <DocumentSection number="2" title="HABILITAÇÃO JURÍDICA" items={HABILITACAO_JURIDICA} data={data} handleUpdate={handleUpdate} showErrors={showValidationErrors} />
      )}

      {step === 3 && (
        <DocumentSection number="3" title="REGULARIDADE FISCAL, SOCIAL E TRABALHISTA" items={REGULARIDADE_FISCAL} data={data} handleUpdate={handleUpdate} showErrors={showValidationErrors} />
      )}

      {step === 4 && (
        <DocumentSection number="4" title="QUALIFICAÇÃO ECONÔMICO-FINANCEIRA" items={QUALIFICACAO_FINANCEIRA} data={data} handleUpdate={handleUpdate} showErrors={showValidationErrors} />
      )}

      {step === 5 && (
        <DocumentSection number="5" title="QUALIFICAÇÃO TÉCNICA" items={QUALIFICACAO_TECNICA} data={data} handleUpdate={handleUpdate} showErrors={showValidationErrors} />
      )}

      {step === 6 && (
        <DocumentSection number="6" title="OUTROS REGISTROS" items={OUTROS_REGISTROS} data={data} handleUpdate={handleUpdate} showErrors={false} />
      )}

      {step === 7 && (
        <section style={{ marginBottom: 32, border: '1px solid var(--site-border)', borderRadius: 'var(--site-radius-xl)', overflow: 'hidden', background: '#fff' }}>
          <header style={{ background: 'var(--site-primary)', color: '#fff', padding: '16px 24px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--site-gold)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: 800 }}>7</div>
            <h2 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0, color: '#fff' }}>CONCLUSÃO (FORMATO OFICIAL)</h2>
          </header>
          <div style={{ padding: '32px 40px', background: 'rgba(197,171,118,0.03)' }}>
            <div style={{ background: '#fff', border: '1px solid rgba(197,171,118,0.3)', padding: 32, borderRadius: 'var(--site-radius-lg)', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', fontFamily: '"Times New Roman", Times, serif', fontSize: '1.1rem', lineHeight: 1.8, color: '#222', position: 'relative' }}>
              <div style={{ position: 'absolute', top: 20, right: 20, opacity: 0.1, pointerEvents: 'none' }}>
                <ShieldCheck size={120} />
              </div>
              <p style={{ textAlign: 'justify', marginBottom: 20 }}>
                Após análise documental, constata-se que a entidade, incluindo identificação completa (nome e CNPJ), apresenta a seguinte conformidade aos requisitos para gestão de parcerias:
              </p>
              <ul style={{ listStyleType: 'none', paddingLeft: 0, marginBottom: 20 }}>
                <li style={{ marginBottom: 8 }}><strong>Habilitação Jurídica</strong> – 100% conforme</li>
                <li style={{ marginBottom: 8 }}><strong>Regularidade Fiscal, Social e Trabalhista</strong> – 100% conforme</li>
                <li style={{ marginBottom: 8 }}><strong>Qualificação Econômico-Financeira</strong> – 100% conforme</li>
                <li style={{ marginBottom: 8 }}><strong>Qualificação Técnica</strong> – 100% conforme</li>
                <li style={{ marginBottom: 8 }}><strong>Outros Registros</strong> – 100% conforme</li>
              </ul>
              <p style={{ textAlign: 'justify', marginBottom: 20 }}>
                Portanto, recomenda-se certificação independente através do <strong>"SELO OSC GESTÃO DE PARCERIAS"</strong>.
              </p>
              <p style={{ textAlign: 'justify', fontSize: '0.9rem', color: '#666', borderTop: '1px solid #eee', paddingTop: 16, marginTop: 32 }}>
                A autenticidade do documento pode ser conferida através do website: https://obgpbr.org/selo-osc, mediante código de verificação e controle.
              </p>
            </div>
            <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--site-text-secondary)', fontWeight: 700, textAlign: 'center' }}>
                <AlertCircle size={14} style={{ display: 'inline', position: 'relative', top: 2, marginRight: 4 }} />
                O envio para a administração requer assinatura e pagamento ativo.
              </span>
              <button onClick={handleConsultarPagamentoEEnviar} disabled={enviando} className="btn btn-gold" style={{ padding: '14px 28px', fontSize: '1rem', width: '100%', maxWidth: 420 }}>
                {enviando ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Clock size={18} className="spin-anim" /> {mensagemEnviando || 'Processando...'}</span>
                ) : (
                  <><CheckCircle2 size={18} /> Validar e Enviar Processo</>
                )}
              </button>
            </div>
          </div>
        </section>
      )}

      {/* NAVIGATION */}
      <div className="processo-nav-btns" style={{ display: 'flex', justifyContent: step === 1 ? 'flex-end' : 'space-between', alignItems: 'center', marginTop: 8 }}>
        {step > 1 && (
          <button onClick={handleBack} className="btn" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 24px', fontSize: '0.9rem', background: 'var(--site-surface-warm)', color: 'var(--site-text-primary)', border: '1px solid var(--site-border)', borderRadius: 'var(--site-radius-md)', cursor: 'pointer', fontWeight: 700 }}>
            <ChevronLeft size={18} /> Voltar
          </button>
        )}
        {step < 7 && (
          <button onClick={handleNext} disabled={saving} className="btn btn-gold" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 28px', fontSize: '0.95rem', fontWeight: 700, opacity: saving ? 0.7 : 1 }}>
            {saving ? (
              <><Loader2 size={18} className="spin-anim" /> Salvando...</>
            ) : (
              <>Salvar e Avançar <ChevronRight size={18} /></>
            )}
          </button>
        )}
      </div>

      {/* CUSTOM MODAL */}
      {modal.show && (
        <div className="panel-modal-overlay">
          <div className="panel-modal" style={{ maxWidth: 450 }}>
            <div className="panel-modal-header">
              <h2 className="panel-modal-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {modal.type === 'confirm' ? <AlertCircle className="text-gold" size={24} /> : <CheckCircle2 className="text-gold" size={24} />}
                {modal.title}
              </h2>
            </div>
            <div className="panel-modal-body">
              <p style={{ margin: 0, color: 'var(--site-text-secondary)', lineHeight: 1.6, fontSize: '0.95rem' }}>
                {modal.message}
              </p>
            </div>
            <div className="panel-modal-footer">
              {modal.type === 'confirm' && (
                <button 
                  className="panel-btn panel-btn-ghost" 
                  onClick={() => setModal({ ...modal, show: false })}
                >
                  Cancelar
                </button>
              )}
              <button 
                className="panel-btn panel-btn-primary"
                onClick={() => {
                  setModal({ ...modal, show: false });
                  if (modal.type === 'confirm' && modal.onConfirm) modal.onConfirm();
                }}
              >
                {modal.type === 'confirm' ? 'Confirmar' : 'Entendi'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── COMPONENTES INTERNOS ── */

function InputField({ label, value, onChange, readonly = false, type = 'text', showError = false, id }: { label: string, value?: string, onChange?: (val: string) => void, readonly?: boolean, type?: string, showError?: boolean, id?: string }) {
  return (
    <div id={id} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--site-text-secondary)', textTransform: 'uppercase' }}>{label}</label>
      <input
        type={type}
        value={value || ''}
        onChange={e => onChange?.(e.target.value)}
        readOnly={readonly}
        style={{ padding: '10px 14px', borderRadius: 'var(--site-radius-md)', border: showError ? '1px solid #ef4444' : '1px solid var(--site-border)', background: readonly ? 'var(--site-surface-warm)' : '#fff', color: readonly ? 'var(--site-text-secondary)' : 'var(--site-text-primary)', fontSize: '0.9rem', outline: 'none', pointerEvents: readonly ? 'none' : 'auto', width: '100%', boxSizing: 'border-box' }}
      />
      {showError && <span style={{ color: '#ef4444', fontSize: '0.7rem', fontWeight: 700, marginTop: -2 }}>⚠️ Preencha este campo obrigatório.</span>}
    </div>
  );
}

function DocumentSection({ number, title, items, data, handleUpdate, showErrors = false }: {
  number: string, title: string, items: { id: string, title: string }[],
  data: Record<string, any>, handleUpdate: (id: string, field: string, val: string) => void,
  showErrors?: boolean
}) {
  return (
    <section style={{ marginBottom: 32, border: '1px solid var(--site-border)', borderRadius: 'var(--site-radius-xl)', overflow: 'hidden', background: '#fff' }}>
      <header style={{ background: 'var(--site-primary)', padding: '16px 24px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--site-gold)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: 800 }}>
          {number}
        </div>
        <h2 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0, color: '#fff' }}>{title}</h2>
      </header>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {items.map((item, index) => {
          const itemData = data[item.id] || {};
          const status = itemData.status || 'pendente';
          const isLast = index === items.length - 1;

          return (
            <div id={`doc-item-${item.id}`} key={item.id} style={{ padding: '24px', borderBottom: isLast ? 'none' : '1px solid var(--site-border)', position: 'relative' }}>
              <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                <div style={{ background: 'rgba(0,0,0,0.04)', padding: '4px 8px', borderRadius: 6, fontSize: '0.75rem', fontWeight: 700, color: 'var(--site-text-secondary)', minWidth: 46, textAlign: 'center', marginTop: 2 }}>
                  {item.id}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
                    <h3 style={{ fontSize: '0.95rem', fontWeight: 800, margin: 0, color: 'var(--site-text-primary)', maxWidth: '70%' }}>
                      {item.title}
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                      <select
                        value={status}
                        onChange={(e) => handleUpdate(item.id, 'status', e.target.value)}
                        style={{ appearance: 'none', padding: '6px 28px 6px 12px', borderRadius: 'var(--site-radius-full)', fontSize: '0.75rem', fontWeight: 700, border: (showErrors && status === 'pendente') ? '1px solid #ef4444' : 'none', cursor: 'pointer', outline: 'none', backgroundColor: status === 'conforme' ? 'rgba(22,163,74,0.1)' : (status === 'pendente' ? 'rgba(0,0,0,0.05)' : 'rgba(217,119,6,0.1)'), color: status === 'conforme' ? '#16a34a' : (status === 'pendente' ? 'var(--site-text-secondary)' : '#d97706') }}
                      >
                        <option value="pendente">Pendente</option>
                        <option value="em_analise">Em Análise</option>
                        <option value="conforme">Conforme (Válido/Vigente)</option>
                        <option value="irregular">Irregular / Vencido</option>
                        <option value="nao_se_aplica">Não se Aplica</option>
                      </select>
                      {showErrors && status === 'pendente' && <span style={{ color: '#ef4444', fontSize: '0.7rem', fontWeight: 700 }}>⚠️ Status obrigatório.</span>}
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <label style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--site-text-secondary)' }}>Código de Controle</label>
                      <input type="text" placeholder="Ex: DOC-2026-001" value={itemData.codigo || ''} onChange={(e) => handleUpdate(item.id, 'codigo', e.target.value)} style={inputStyle} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <label style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--site-text-secondary)' }}>Data de Emissão</label>
                      <input type="date" value={itemData.data_emissao || ''} onChange={(e) => handleUpdate(item.id, 'data_emissao', e.target.value)} style={inputStyle} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <label style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--site-text-secondary)' }}>Data de Validade <span style={{ fontWeight: 500 }}>(se houver)</span></label>
                      <input type="date" value={itemData.data_validade || ''} onChange={(e) => handleUpdate(item.id, 'data_validade', e.target.value)} style={inputStyle} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, gridColumn: '1 / -1' }}>
                      <label style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--site-text-secondary)' }}>Análise da Situação Atual</label>
                      <textarea
                        placeholder="Descreva observações sobre o documento..."
                        value={itemData.analise || ''}
                        onChange={(e) => handleUpdate(item.id, 'analise', e.target.value)}
                        rows={2}
                        style={{ ...inputStyle, resize: 'vertical' }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

const inputStyle = {
  padding: '8px 12px',
  borderRadius: 'var(--site-radius-md)',
  border: '1px solid var(--site-border)',
  fontSize: '0.85rem',
  color: 'var(--site-text-primary)',
  outline: 'none',
  fontFamily: 'var(--font-sans)',
  width: '100%',
  boxSizing: 'border-box' as const,
};
