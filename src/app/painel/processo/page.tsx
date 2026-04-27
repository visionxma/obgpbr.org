'use client';
import React, { useState, useEffect, useRef } from 'react';
import { 
  FileUp, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  RefreshCcw, 
  ChevronLeft, 
  ChevronRight,
  ShieldCheck,
  Check,
  Clock,
  Download,
  Trash2,
  ExternalLink,
  Info,
  Calendar,
  Search
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { usePainel } from '../PainelContext';

// ── Types & Constants ──────────────────────────────────────────

type DocStatus = 'pendente' | 'em_analise' | 'conforme' | 'irregular';

interface DocItem {
  id: string;
  label: string;
  description?: string;
  required?: boolean;
}

interface RelatorioData {
  [key: string]: {
    codigo?: string;
    emissao?: string;
    validade?: string;
    obs?: string;
    status: DocStatus;
    file_url?: string;
  };
}

const WIZARD_STEPS = [
  { id: 'entidade', label: 'Dados da Entidade' },
  { id: 'juridica', label: 'Habilitação Jurídica' },
  { id: 'fiscal',   label: 'Regularidade Fiscal' },
  { id: 'financeira', label: 'Qual. Econômica' },
  { id: 'tecnica',  label: 'Qual. Técnica' },
  { id: 'outros',   label: 'Outros Registros' },
  { id: 'conclusao', label: 'Finalização' },
];

const HABILITACAO_JURIDICA: DocItem[] = [
  { id: 'estatuto', label: 'Estatuto Social Atualizado', required: true },
  { id: 'ata_eleicao', label: 'Ata de Eleição da Diretoria', required: true },
];

const REGULARIDADE_FISCAL: DocItem[] = [
  { id: 'fgts', label: 'Certificado de Regularidade do FGTS', required: true },
  { id: 'trabalhista', label: 'Certidão Negativa de Débitos Trabalhistas (CNDT)', required: true },
  { id: 'municipal', label: 'Certidão Negativa Municipal', required: true },
];

const QUALIFICACAO_FINANCEIRA: DocItem[] = [
  { id: 'balanco', label: 'Balanço Patrimonial do Último Exercício', required: true },
  { id: 'demonstrativo', label: 'Demonstrativo de Resultados', required: true },
];

const QUALIFICACAO_TECNICA: DocItem[] = [
  { id: 'termo_contrato', label: 'Termo de Contrato / Parceria Anterior', required: true },
  { id: 'atestado_capacidade', label: 'Atestado de Capacidade Técnica', required: true },
];

const OUTROS_REGISTROS: DocItem[] = [
  { id: 'conselho_municipal', label: 'Registro em Conselho Municipal (se houver)' },
];

// ── Components ───────────────────────────────────────────────

function InputField({ id, label, value, onChange, type = 'text', showError }: { id: string; label: string; value: string; onChange: (v: string) => void; type?: string; showError?: boolean }) {
  return (
    <div id={id} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--site-text-secondary)', textTransform: 'uppercase' }}>{label}</label>
      <input
        type={type}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        style={{ padding: '10px 14px', borderRadius: 'var(--site-radius-md)', border: showError ? '1px solid #ef4444' : '1px solid var(--site-border)', background: '#fff', color: 'var(--site-text-primary)', fontSize: '0.9rem', outline: 'none', width: '100%', boxSizing: 'border-box' }}
      />
      {showError && <span style={{ color: '#ef4444', fontSize: '0.7rem', fontWeight: 700, marginTop: -2 }}>⚠️ Preencha este campo obrigatório.</span>}
    </div>
  );
}

function DocumentSection({ number, title, items, data, handleUpdate, showErrors }: { number: string; title: string; items: DocItem[]; data: RelatorioData; handleUpdate: (id: string, field: string, val: string) => void; showErrors: boolean }) {
  return (
    <section style={{ marginBottom: 32, border: '1px solid var(--site-border)', borderRadius: 'var(--site-radius-xl)', overflow: 'hidden', background: '#fff' }}>
      <header style={{ background: 'var(--site-primary)', color: '#fff', padding: '16px 24px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--site-gold)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: 800 }}>{number}</div>
        <h2 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0, color: '#fff' }}>{title}</h2>
      </header>
      <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 24 }}>
        {items.map((item) => {
          const doc = data[item.id] || { status: 'pendente' };
          const isError = showErrors && item.required && doc.status === 'pendente';
          return (
            <div key={item.id} id={`doc-item-${item.id}`} style={{ padding: 20, borderRadius: 'var(--site-radius-lg)', border: isError ? '1px solid #fca5a5' : '1px solid var(--site-border)', background: isError ? '#fffafb' : 'var(--site-bg)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: 0, color: 'var(--site-primary)' }}>{item.label}</h3>
                  <div style={{ fontSize: '0.8rem', color: 'var(--site-text-secondary)', marginTop: 4 }}>{item.required ? 'Documento Obrigatório' : 'Documento Opcional'}</div>
                </div>
                <div style={{ padding: '6px 12px', borderRadius: 'var(--site-radius-full)', background: doc.status === 'pendente' ? 'rgba(0,0,0,0.05)' : (doc.status === 'conforme' ? 'rgba(22,163,74,0.1)' : 'rgba(197,171,118,0.1)'), color: doc.status === 'pendente' ? '#666' : (doc.status === 'conforme' ? '#16a34a' : 'var(--site-gold)'), fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase' }}>
                  {doc.status}
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
                <div>
                  <label style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--site-text-secondary)', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Código de Controle</label>
                  <input type="text" placeholder="Ex: DOC-2026-001" value={doc.codigo || ''} onChange={(e) => handleUpdate(item.id, 'codigo', e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: 8, border: '1px solid var(--site-border)', fontSize: '0.85rem' }} />
                </div>
                <div>
                  <label style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--site-text-secondary)', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Data de Emissão</label>
                  <input type="date" value={doc.emissao || ''} onChange={(e) => handleUpdate(item.id, 'emissao', e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: 8, border: '1px solid var(--site-border)', fontSize: '0.85rem' }} />
                </div>
                <div>
                  <label style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--site-text-secondary)', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Data de Validade (se houver)</label>
                  <input type="date" value={doc.validade || ''} onChange={(e) => handleUpdate(item.id, 'validade', e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: 8, border: '1px solid var(--site-border)', fontSize: '0.85rem' }} />
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--site-text-secondary)', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Análise da Situação Atual</label>
                  <textarea placeholder="Descreva observações sobre o documento..." value={doc.obs || ''} onChange={(e) => handleUpdate(item.id, 'obs', e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: 8, border: '1px solid var(--site-border)', fontSize: '0.85rem', minHeight: 80, resize: 'vertical' }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

// ── Main Component ──────────────────────────────────────────

export default function ProcessoPage() {
  const { user } = usePainel();
  const [loadingData, setLoadingData] = useState(true);
  const [step, setStep] = useState(1);
  const [relatorioId, setRelatorioId] = useState<string | null>(null);
  const [data, setData] = useState<RelatorioData>({});
  const [entidadeData, setEntidadeData] = useState<any>({
    cnpj: '',
    natureza_juridica: '',
    razao_social: '',
    nome_fantasia: '',
    cep: '',
    logradouro: '',
    numero_endereco: '',
    bairro: '',
    municipio: '',
    estado: '',
    data_abertura_cnpj: '',
    email_osc: '',
    telefone: '',
    responsavel: ''
  });

  const [activePerfil, setActivePerfil] = useState<any>({ razao_social: 'Instituição Convidada', osc_id: 'OBGP-GUEST' });
  const [showCnpjStep, setShowCnpjStep] = useState(true);
  const [cnpjError, setCnpjError] = useState('');
  const [cnpjSuccess, setCnpjSuccess] = useState(false);
  const [showValidationErrors, setShowValidationErrors] = useState(false);
  const [saving, setSaving] = useState(false);
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

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoadingData(true);
    try {
      const savedEntidade = localStorage.getItem('obgp_guest_entidade');
      const savedDocs = localStorage.getItem('obgp_guest_docs');
      
      if (savedEntidade) {
        const ent = JSON.parse(savedEntidade);
        setEntidadeData(ent);
        setActivePerfil({ razao_social: ent.razao_social || 'Instituição Convidada', osc_id: `OBGP-${ent.cnpj?.slice(-8) || 'GUEST'}` });
        setShowCnpjStep(false);
      }
      
      if (savedDocs) {
        setData(JSON.parse(savedDocs));
      }
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
    } finally {
      setLoadingData(false);
    }
  };

  const handleCnpjInputChange = (e: React.ChangeEvent<HTMLInputElement>, ref: React.RefObject<HTMLInputElement | null>, skipFormat = false) => {
    let val = e.target.value;
    if (!skipFormat) {
      const cursor = e.target.selectionStart || 0;
      const digits = val.replace(/\D/g, '').slice(0, 14);
      let formatted = digits;
      if (digits.length > 12) formatted = digits.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2}).*/, '$1.$2.$3/$4-$5');
      else if (digits.length > 8) formatted = digits.replace(/^(\d{2})(\d{3})(\d{3})(\d{4}).*/, '$1.$2.$3/$4');
      else if (digits.length > 5) formatted = digits.replace(/^(\d{2})(\d{3})(\d{3}).*/, '$1.$2.$3');
      else if (digits.length > 2) formatted = digits.replace(/^(\d{2})(\d{3}).*/, '$1.$2');
      
      setEntidadeData({ ...entidadeData, cnpj: formatted });
      
      setTimeout(() => {
        if (ref.current) {
          const diff = formatted.length - val.length;
          ref.current.setSelectionRange(cursor + diff, cursor + diff);
        }
      }, 0);
    } else {
      setEntidadeData({ ...entidadeData, cnpj: val });
    }
  };

  const handleConsultarCNPJ = async (cnpj: string) => {
    const raw = cnpj.replace(/\D/g, '');
    if (raw.length !== 14) {
      setCnpjError('CNPJ incompleto');
      return;
    }
    setLoadingData(true);
    setCnpjError('');
    try {
      const res = await fetch(`/api/painel/consultar-cnpj?cnpj=${raw}`);
      const dataJson = await res.json();
      if (dataJson.error) {
        setCnpjError(dataJson.error);
        showAlert('CNPJ não encontrado', dataJson.error);
      } else {
        const newData = {
          ...entidadeData,
          cnpj: dataJson.cnpj,
          razao_social: dataJson.razao_social,
          nome_fantasia: dataJson.nome_fantasia || dataJson.razao_social,
          natureza_juridica: dataJson.natureza_juridica,
          data_abertura_cnpj: dataJson.data_abertura,
          logradouro: dataJson.logradouro,
          numero_endereco: dataJson.numero,
          bairro: dataJson.bairro,
          municipio: dataJson.municipio,
          estado: dataJson.uf,
          cep: dataJson.cep,
          email_osc: dataJson.email,
          telefone: dataJson.telefone,
        };
        setEntidadeData(newData);
        localStorage.setItem('obgp_guest_entidade', JSON.stringify(newData));
        setActivePerfil({ razao_social: newData.razao_social, osc_id: `OBGP-${raw.slice(-8)}` });
        setCnpjSuccess(true);
        setTimeout(() => {
          setShowCnpjStep(false);
          setLoadingData(false);
        }, 1500);
      }
    } catch (err) {
      setCnpjError('Falha na consulta. Tente preencher manualmente.');
      showAlert('Erro de Conexão', 'Não foi possível consultar o CNPJ automaticamente no momento.');
    } finally {
      if (!cnpjSuccess) setLoadingData(false);
    }
  };

  const handleUpdate = (id: string, field: string, val: string) => {
    const newData: RelatorioData = { ...data, [id]: { ...data[id], [field]: val, status: 'em_analise' as DocStatus } };
    setData(newData);
    localStorage.setItem('obgp_guest_docs', JSON.stringify(newData));
  };

  const handleEntidadeUpdate = (field: string, val: string) => {
    const newData = { ...entidadeData, [field]: val };
    setEntidadeData(newData);
    localStorage.setItem('obgp_guest_entidade', JSON.stringify(newData));
  };

  const saveProgress = async () => {
    setSaving(true);
    try {
      localStorage.setItem('obgp_guest_entidade', JSON.stringify(entidadeData));
      localStorage.setItem('obgp_guest_docs', JSON.stringify(data));
    } finally {
      setSaving(false);
    }
  };

  const handleNext = async () => {
    if (step === 1) {
      const required = ['cnpj', 'razao_social', 'email_osc', 'responsavel'];
      const missing = required.find(k => !entidadeData[k]);
      if (missing) {
        setShowValidationErrors(true);
        document.getElementById(`field-${missing}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }
    }
    
    if (step >= 2 && step <= 5) {
      const itemsList = step === 2 ? HABILITACAO_JURIDICA : step === 3 ? REGULARIDADE_FISCAL : step === 4 ? QUALIFICACAO_FINANCEIRA : QUALIFICACAO_TECNICA;
      const firstPending = itemsList.find(item => item.required && (!data[item.id] || data[item.id].status === 'pendente'));
      if (firstPending) {
        setShowValidationErrors(true);
        document.getElementById(`doc-item-${firstPending.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
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
  
  const handleResetProcesso = () => {
    showConfirm('Reiniciar Processo', 'ATENÇÃO: Isso apagará todos os dados preenchidos e reiniciará o processo. Deseja continuar?', async () => {
      setResetting(true);
      try {
        localStorage.removeItem('obgp_guest_entidade');
        localStorage.removeItem('obgp_guest_docs');
        setData({});
        setEntidadeData({ cnpj: '', natureza_juridica: '', razao_social: '', nome_fantasia: '', cep: '', logradouro: '', numero_endereco: '', bairro: '', municipio: '', estado: '', data_abertura_cnpj: '', email_osc: '', telefone: '', responsavel: '' });
        setStep(1);
        setShowCnpjStep(true);
        setCnpjSuccess(false);
        setCnpjError('');
      } finally {
        setResetting(false);
      }
    });
  };

  const handleConsultarPagamentoEEnviar = async () => {
    setEnviando(true);
    setMensagemEnviando('Verificando status de pagamento...');
    await new Promise(r => setTimeout(r, 2000));
    setEnviando(false);
    showAlert('Acesso Restrito', 'Esta funcionalidade requer uma conta ativa e pagamento confirmado. Os dados foram salvos localmente.');
  };

  const progress = Math.round(((step - 1) / 6) * 100);

  if (loadingData && !showCnpjStep) {
    return <div style={{ padding: 40, textAlign: 'center' }}><Loader2 className="spin-anim" /></div>;
  }

  return (
    <>
      {showCnpjStep ? (
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
                    ) : loadingData ? (
                      <Loader2 size={18} className="spin-anim" />
                    ) : (
                      <>
                        <ShieldCheck size={18} />
                        Iniciar Processo
                      </>
                    )}
                  </button>
                </div>
                {cnpjError && (
                  <div style={{ marginTop: 16, padding: 12, borderRadius: 8, background: 'rgba(220,38,38,0.05)', border: '1px solid rgba(220,38,38,0.1)', color: '#dc2626', fontSize: '0.85rem', fontWeight: 600 }}>
                    {cnpjError}
                  </div>
                )}
              </>
            ) : (
              <div style={{ padding: 16, borderRadius: 12, background: 'rgba(22,163,74,0.05)', border: '1px solid rgba(22,163,74,0.1)', textAlign: 'center' }}>
                <div style={{ color: '#16a34a', fontWeight: 800, fontSize: '1.1rem', marginBottom: 4 }}>CNPJ Validado!</div>
                <div style={{ color: 'var(--site-text-secondary)', fontSize: '0.85rem' }}>Aguarde um instante enquanto preparamos seu painel...</div>
                <Loader2 size={24} className="spin-anim" style={{ color: '#16a34a', marginTop: 12 }} />
              </div>
            )}
          </div>
        </div>
      ) : (
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
                    <div key={i} className={`wizard-step-item ${active ? 'active' : ''} ${done ? 'done' : ''}`}>
                      <div 
                        className="wizard-step-circle"
                        style={{ 
                          width: 30, height: 30, borderRadius: '50%', 
                          background: done ? 'var(--site-gold)' : (active ? 'var(--site-primary)' : 'rgba(255,255,255,0.05)'), 
                          border: done ? 'none' : (active ? '2px solid var(--site-gold)' : '2px solid rgba(255,255,255,0.2)'), 
                          display: 'flex', alignItems: 'center', justifyContent: 'center', 
                          color: done ? '#fff' : (active ? 'var(--site-gold)' : 'rgba(255,255,255,0.4)'), 
                          zIndex: 2 
                        }}
                      >
                        {done ? <Check size={14} /> : <span style={{ fontSize: 11, fontWeight: 700 }}>{i + 1}</span>}
                      </div>
                      <span className="wizard-step-label">{s.label}</span>
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
              <button onClick={handleNext} disabled={saving} className="btn btn-gold" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 24px', fontSize: '0.9rem', fontWeight: 700, opacity: saving ? 0.7 : 1 }}>
                {saving ? (
                  <><Loader2 size={16} className="spin-anim" /> Salvando...</>
                ) : (
                  <>Salvar e Avançar <ChevronRight size={16} /></>
                )}
              </button>
            )}
          </div>

          {/* DOCUMENT SECTIONS */}
          {step === 1 && (
            <section style={{ marginBottom: 32, border: '1px solid var(--site-border)', borderRadius: 'var(--site-radius-xl)', overflow: 'hidden', background: '#fff' }}>
              <header style={{ background: 'var(--site-primary)', color: '#fff', padding: '16px 24px', display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--site-gold)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: 800 }}>1</div>
                <h2 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0, color: '#fff' }}>DADOS DA ENTIDADE</h2>
              </header>

              <div style={{ padding: '24px 24px 0' }}>
                <div 
                  className="import-dropzone"
                  onClick={() => !importando && fileInputRef.current?.click()}
                  style={{
                    border: '2px dashed var(--site-border)',
                    borderRadius: 'var(--site-radius-lg)',
                    padding: '20px clamp(16px, 4vw, 28px)',
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

              <div className="form-grid">
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
                    <ShieldCheck size={14} style={{ display: 'inline', position: 'relative', top: 2, marginRight: 4, color: '#16a34a' }} />
                    Sua assinatura digital (.pfx) será aplicada automaticamente ao validar o pagamento.
                  </span>
                  
                  <div style={{ display: 'flex', gap: 12, width: '100%', maxWidth: 300 }}>
                    <button onClick={handleConsultarPagamentoEEnviar} disabled={enviando} className="btn btn-gold" style={{ flex: 1, padding: '16px', borderRadius: 'var(--site-radius-full)', fontWeight: 800 }}>
                      {enviando ? (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Clock size={18} className="spin-anim" /> {mensagemEnviando || 'Processando...'}</span>
                      ) : (
                        <><CheckCircle2 size={18} /> Validar e Enviar Relatório</>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* NAVIGATION (BOTTOM) */}
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
        </div>
      )}

      {/* GLOBAL MODAL (Always available) */}
      {modal.show && (
        <div className="panel-modal-overlay" onClick={() => setModal({ ...modal, show: false })}>
          <div className="panel-modal" style={{ maxWidth: 450 }} onClick={(e) => e.stopPropagation()}>
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
    </>
  );
}
