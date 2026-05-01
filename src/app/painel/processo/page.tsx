'use client';
import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
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
  Search,
  Copy,
  FileText,
  Plus,
  Eye,
  Edit2,
  ShoppingCart,
  ChevronDown
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { usePainel } from '../PainelContext';
import { maskCNPJ, maskTelefone, maskCEP } from '@/lib/brasil-masks';

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
    descricao?: string;
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
  { id: 'cartao_cnpj',           label: '2.1. Cartão CNPJ',                                  required: true },
  { id: 'qsa_cnpj',             label: '2.2. QSA Cartão CNPJ',                               required: true },
  { id: 'cadastro_contribuinte', label: '2.3. Cadastro Contribuinte Municipal/Estadual',       required: true },
  { id: 'alvara_funcionamento',  label: '2.4. Alvará de licença e funcionamento',              required: true },
  { id: 'estatuto_social',       label: '2.5. Estatuto Social',                               required: true },
  { id: 'ata_constituicao',      label: '2.6. Ata Constituição/Fundação',                     required: true },
  { id: 'ata_eleicao_posse',     label: '2.7. Ata Eleição e Posse atual',                     required: true },
  { id: 'relacao_membros',       label: '2.8. Relação de Membros atual',                      required: true },
  { id: 'comprovante_end_ent',   label: '2.9. Comprovante endereço entidade',                 required: true },
  { id: 'rg_cpf_representante',  label: '2.10. RG/CPF representante legal',                   required: true },
  { id: 'comprovante_end_rep',   label: '2.11. Comprovante endereço representante legal',     required: true },
];

const REGULARIDADE_FISCAL: DocItem[] = [
  { id: 'cnd_federal',      label: '3.1. CND Federal',       required: true },
  { id: 'cnd_estadual',     label: '3.2. CND Estadual',      required: true },
  { id: 'cnda_estadual',    label: '3.3. CNDA Estadual',     required: true },
  { id: 'cnd_municipal',    label: '3.4. CND Municipal',     required: true },
  { id: 'cr_fgts',          label: '3.5. CR FGTS',           required: true },
  { id: 'cnd_trabalhista',  label: '3.6. CND Trabalhista',   required: true },
  { id: 'cnd_caema',        label: '3.7. CND CAEMA',         required: true },
];

const QUALIFICACAO_FINANCEIRA: DocItem[] = [
  { id: 'cert_falencia',         label: '4.1. Certidão de Falência e Concordata',                                                    required: true },
  { id: 'reg_contador',          label: '4.2. Registro e regularidade Contador',                                                    required: true },
  { id: 'termo_abertura',        label: '4.3.1. Termo de abertura',                                                                 required: true },
  { id: 'balanco_patrimonial',   label: '4.3.2. Balanço Patrimonial',                                                               required: true },
  { id: 'dem_superavit',         label: '4.3.3. Demonstração do Superavit e Déficit',                                               required: true },
  { id: 'dem_mutacoes',          label: '4.3.4. Demonstração das Mutações do Patrimônio Líquido',                                   required: true },
  { id: 'dem_fluxo_caixa',       label: '4.3.5. Demonstração dos Fluxos de Caixa',                                                 required: true },
  { id: 'notas_explicativas',    label: '4.3.6. Notas Explicativas dos dois últimos exercícios sociais',                           required: true },
  { id: 'termo_encerramento',    label: '4.3.7. Termo de encerramento',                                                             required: true },
  { id: 'ata_prestacao_contas',  label: '4.3. Ata aprovando prestação de contas com parecer do conselho fiscal dos últimos dois exercícios sociais da entidade.', required: true },
];

const QUALIFICACAO_TECNICA: DocItem[] = [
  { id: 'instr_colaboracao', label: '5.1.1. Instrumento Jurídico (Termo de Colaboração)',  required: true },
  { id: 'instr_fomento',     label: '5.1.2. Instrumento Jurídico (Termo de Fomento)',      required: true },
  { id: 'instr_cooperacao',  label: '5.1.3. Instrumento Jurídico (Acordo de Cooperação)', required: true },
  { id: 'instr_outro',       label: '5.1.4. Instrumento Jurídico (Outro tipo de contrato).', required: true },
];

const OUTROS_REGISTROS: DocItem[] = [
  { id: 'aerfe',           label: '6.1. Atestado de Existência e Regular Funcionamento – AERFE MP/MA (se houver)' },
  { id: 'cneas',           label: '6.2. Cadastro Nacional de Entidades de Assistência Social – CNEAS (se houver)' },
  { id: 'cnes',            label: '6.3. Cadastro Nacional de Estabelecimento de Saúde – CNES (se houver)' },
  { id: 'cmas',            label: '6.4. Conselho Municipal da Assistência Social – CMAS (se houver)' },
  { id: 'cmdca',           label: '6.5. Conselho Municipal dos Direitos da Criança e Adolescente - CMDCA (se houver)' },
  { id: 'alvara_sanitaria',label: '6.6. Alvará de autorização sanitária (se houver)' },
  { id: 'sicaf',           label: '6.7. Sistema de Cadastramento Unificado de Fornecedores - SICAF (se houver)' },
  { id: 'util_pub_mun',   label: '6.8. Utilidade Pública Municipal (se houver)' },
  { id: 'util_pub_est',   label: '6.9. Utilidade Pública Estadual (se houver)' },
  { id: 'reg_conselho',   label: '6.10. Registro e Regularidade no Conselho Classe (se houver)' },
  { id: 'reg_prof_rt',    label: '6.11. Registro e Regularidade do Profissional RT no Conselho Classe (se houver)' },
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
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--site-text-secondary)', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Descrição / Nome do Documento</label>
                  <input type="text" placeholder="Ex: Termo de Colaboração do Ministério dos Direitos Humanos..." value={doc.descricao || ''} onChange={(e) => handleUpdate(item.id, 'descricao', e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: 8, border: '1px solid var(--site-border)', fontSize: '0.85rem', fontWeight: 600 }} />
                </div>
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
  const [cart, setCart] = useState<any[]>([]);
  const [showPaymentScreen, setShowPaymentScreen] = useState(false);
  const [comprovanteFile, setComprovanteFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [showScrollHint, setShowScrollHint] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Mostra a seta se o usuário estiver no topo e no passo 7 (ou onde houver muito conteúdo)
      if (window.scrollY < 100 && step === 7 && showPaymentScreen) {
        setShowScrollHint(true);
      } else {
        setShowScrollHint(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    // Trigger inicial
    handleScroll();
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, [step, showPaymentScreen]);

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
        const savedStep = localStorage.getItem('obgp_guest_step');
        if (savedStep) setStep(Number(savedStep));
      }
      
      if (savedDocs) {
        setData(JSON.parse(savedDocs));
      }
      
      const savedCart = localStorage.getItem('obgp_guest_cart');
      if (savedCart) {
        setCart(JSON.parse(savedCart));
      }
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    if (step >= 1 && !showCnpjStep) {
      localStorage.setItem('obgp_guest_step', step.toString());
    }
  }, [step, showCnpjStep]);

  const handleCnpjInputChange = (e: React.ChangeEvent<HTMLInputElement>, ref: React.RefObject<HTMLInputElement | null>, skipFormat = false) => {
    let val = e.target.value;
    if (!skipFormat) {
      const cursor = e.target.selectionStart || 0;
      const formatted = maskCNPJ(val);
      
      setEntidadeData({ ...entidadeData, cnpj: formatted });
      
      setTimeout(() => {
        if (ref.current) {
          const diff = formatted.length - val.length;
          ref.current.setSelectionRange(cursor + diff, cursor + diff);
        }
      }, 0);
    } else {
      setEntidadeData({ ...entidadeData, cnpj: maskCNPJ(val) });
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
        // Não mostramos mais o alert aqui para não interromper o fluxo, o erro aparece na tela
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
    } finally {
      setLoadingData(false);
    }
  };

  const handleManualEntry = () => {
    setLoadingData(false);
    setCnpjError('');
    setShowCnpjStep(false);
    // Inicializa com o CNPJ que já foi digitado se houver
    localStorage.setItem('obgp_guest_entidade', JSON.stringify(entidadeData));
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
    /* Desabilitado temporariamente conforme pedido do usuário
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
    */

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
        localStorage.removeItem('obgp_guest_step');
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

  /* ── Pagamento / Envio ── */
  const forceGating = false; // false = livre para testes; true = exige pagamento em produção
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [copiedField, setCopiedField] = useState('');

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(''), 2000);
  };

  const handleConsultarPagamentoEEnviar = async () => {
    // Salva o progresso atual
    await saveProgress();
    setShowPaymentScreen(true);
    document.getElementById('painel-top')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleRemoverDoCarrinho = (id: string) => {
    const newCart = cart.filter(item => item.id !== id);
    setCart(newCart);
    localStorage.setItem('obgp_guest_cart', JSON.stringify(newCart));
  };

  const handleAdicionarNovo = () => {
    // Limpa apenas o formulário atual (entidade e docs)
    localStorage.removeItem('obgp_guest_entidade');
    localStorage.removeItem('obgp_guest_docs');
    localStorage.removeItem('obgp_guest_step');
    setData({});
    setEntidadeData({ cnpj: '', natureza_juridica: '', razao_social: '', nome_fantasia: '', cep: '', logradouro: '', numero_endereco: '', bairro: '', municipio: '', estado: '', data_abertura_cnpj: '', email_osc: '', telefone: '', responsavel: '' });
    setStep(1);
    setShowCnpjStep(true);
    setCnpjSuccess(false);
    setCnpjError('');
  };

  const handleSubmitCheckout = async () => {
    if (!comprovanteFile) {
      showAlert('Atenção', 'É obrigatório anexar o comprovante de pagamento para prosseguir.');
      return;
    }
    
    setEnviando(true);
    setMensagemEnviando('Processando pagamento e enviando...');
    
    try {
      const formData = new FormData();
      // Criamos um "carrinho" virtual de 1 item para manter compatibilidade com o backend
      const virtualCart = [{
        id: Date.now().toString(),
        entidade: entidadeData,
        docs: data,
        createdAt: new Date().toISOString()
      }];
      formData.append('cart', JSON.stringify(virtualCart));
      formData.append('comprovante', comprovanteFile);

      const res = await fetch('/api/painel/checkout', {
        method: 'POST',
        body: formData
      });

      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.error || 'Erro na comunicação com o servidor');
      }

      setShowPaymentScreen(false);
      
      showConfirm('Sucesso!', 'Seus documentos e pagamento foram enviados para validação. Nossa equipe entrará em contato em breve.', () => {
         // Clear everything
         localStorage.removeItem('obgp_guest_entidade');
         localStorage.removeItem('obgp_guest_docs');
         localStorage.removeItem('obgp_guest_cart');
         localStorage.removeItem('obgp_guest_step');
         window.location.href = '/'; // Redirect to home or reset
      });
      
    } catch (err: any) {
      console.error('Erro no checkout:', err);
      showAlert('Erro', `Falha ao processar: ${err.message}`);
    } finally {
      setEnviando(false);
      setMensagemEnviando('');
    }
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
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ display: 'flex', gap: 12, flexDirection: 'row' }}>
                  <button 
                    className="panel-btn panel-btn-primary" 
                    style={{ flex: 1, padding: 16, fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                    onClick={() => handleConsultarCNPJ(entidadeData.cnpj)}
                    disabled={!entidadeData.cnpj || entidadeData.cnpj.replace(/\D/g, '').length !== 14 || loadingData}
                  >
                    {cnpjError ? (
                      <>
                        <RefreshCcw size={18} className={loadingData ? 'spin-anim' : ''} />
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
                  <div style={{ animation: 'fadeIn .3s ease' }}>
                    <div style={{ padding: 12, borderRadius: 8, background: 'rgba(220,38,38,0.05)', border: '1px solid rgba(220,38,38,0.1)', color: '#dc2626', fontSize: '0.85rem', fontWeight: 600, marginBottom: 16 }}>
                      {cnpjError}
                    </div>
                    
                    <button 
                      onClick={handleManualEntry}
                      style={{ background: 'none', border: '1px solid var(--site-border)', color: 'var(--site-text-secondary)', padding: '12px 20px', borderRadius: 10, fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', width: '100%', transition: 'all .2s' }}
                      onMouseOver={(e) => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.color = 'var(--site-primary)'; }}
                      onMouseOut={(e) => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'var(--site-text-secondary)'; }}
                    >
                      Preencher Dados Manualmente
                    </button>
                  </div>
                )}
              </div>
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
          {!showPaymentScreen && (
            <>
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
            </>
          )}

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
                <InputField id="field-telefone" label="Telefone" value={entidadeData.telefone} onChange={(v) => handleEntidadeUpdate('telefone', maskTelefone(v))} showError={showValidationErrors && !entidadeData.telefone} />
                <InputField id="field-responsavel" label="Representante Legal" value={entidadeData.responsavel} onChange={(v) => handleEntidadeUpdate('responsavel', v)} showError={showValidationErrors && !entidadeData.responsavel} />
                <InputField id="field-data_abertura_cnpj" label="Data de Abertura do CNPJ" type="date" value={entidadeData.data_abertura_cnpj} onChange={(v) => handleEntidadeUpdate('data_abertura_cnpj', v)} showError={showValidationErrors && !entidadeData.data_abertura_cnpj} />
                <div style={{ gridColumn: '1 / -1', borderTop: '1px solid var(--site-border)', paddingTop: 20, marginTop: 4 }}>
                  <h3 style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--site-text-secondary)', textTransform: 'uppercase', marginBottom: 16 }}>Endereço Completo</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 20 }}>
                    <InputField id="field-cep" label="CEP" value={entidadeData.cep} onChange={(v) => handleEntidadeUpdate('cep', maskCEP(v))} showError={showValidationErrors && !entidadeData.cep} />
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
                <h2 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0, color: '#fff' }}>CONCLUSÃO E PAGAMENTO</h2>
              </header>

              {showPaymentScreen ? (
                <div style={{ animation:'slideUp .3s ease', background: '#fff', minHeight: 400 }}>
                  <div style={{ background:'linear-gradient(135deg,#0D364F 0%,#1a5276 100%)', padding:'24px 32px', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', position: 'relative' }}>
                    <div style={{ textAlign:'center' }}>
                      <div style={{ fontSize:'0.75rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'.12em', color:'rgba(255,255,255,0.6)', marginBottom:4 }}>Valor Total a Pagar</div>
                      <div style={{ fontSize:'2.4rem', fontWeight:900, color:'#4ade80', lineHeight:1 }}>R$ 389,96</div>
                      <div style={{ fontSize:'0.85rem', color:'rgba(255,255,255,0.5)', marginTop:6 }}>Relatório de conformidade individual</div>
                    </div>
                  </div>

                  <div style={{ padding:'32px', display:'flex', flexDirection:'column', gap:24 }}>
                    <div style={{ display:'grid', gridTemplateColumns:'auto 1fr', gap:32, alignItems:'start', background:'#f8fafc', border:'1px solid #e2e8f0', borderRadius:20, padding:32 }}>
                      <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:12 }}>
                        <div style={{ padding: 12, background: '#fff', borderRadius: 16, border: '2px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                          <img src="/pix_qrcode.png" alt="QR Code PIX Bradesco" style={{ width:180, height:180, borderRadius:8, objectFit:'cover' }} />
                        </div>
                        <div style={{ fontSize:'0.65rem', fontWeight:800, textTransform:'uppercase', letterSpacing:'.1em', color:'#64748b' }}>Escaneie com seu banco</div>
                      </div>

                      <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
                        <div style={{ fontSize:'0.9rem', fontWeight:800, textTransform:'uppercase', letterSpacing:'.12em', color:'#0D364F' }}>Dados para Pagamento PIX</div>
                        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:16, padding:'16px 20px', background: 'rgba(13,54,79,0.03)', border:'1px solid #0D364F', borderRadius:16 }}>
                          <div>
                            <div style={{ fontSize:'0.65rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'.1em', color: '#0D364F' }}>Chave PIX (CNPJ)</div>
                            <div style={{ fontSize:'1rem', fontWeight: 800, color:'#1e293b', marginTop:3, fontFamily: 'monospace', letterSpacing: '.03em' }}>14.796.065/0001-08</div>
                          </div>
                          <button
                            onClick={() => copyToClipboard('14.796.065/0001-08', 'pix')}
                            style={{ background: copiedField === 'pix' ? '#16a34a' : '#0D364F', color: '#fff', border:'none', borderRadius:10, padding:'10px 18px', fontSize:'0.8rem', fontWeight:800, cursor: 'pointer', display:'flex', alignItems:'center', gap:8, transition:'all .2s' }}
                          >
                            {copiedField === 'pix' ? <><CheckCircle2 size={14}/> Copiado!</> : <><Copy size={14}/> Copiar</>}
                          </button>
                        </div>
                      </div>
                    </div>

                    <div style={{ background:'rgba(59,130,246,0.04)', border:'1px solid rgba(59,130,246,0.12)', borderRadius:16, padding:'20px 24px' }}>
                      <div style={{ fontSize:'0.9rem', color:'#1e40af', fontWeight:800, marginBottom:10, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Info size={18}/> Como realizar o pagamento:
                      </div>
                      <ol style={{ margin:0, paddingLeft:24, fontSize:'0.85rem', color:'#3b82f6', lineHeight:2, fontWeight: 500 }}>
                        <li>Abra o aplicativo do seu banco</li>
                        <li>Acesse a área PIX → <strong>Pagar</strong></li>
                        <li>Escaneie o QR Code ou cole a <strong>Chave PIX (CNPJ)</strong></li>
                        <li>Confirme o valor exato de <strong>R$ 389,96</strong></li>
                        <li>Após o pagamento, anexe o comprovante abaixo para validação</li>
                      </ol>
                    </div>

                    <div style={{ marginTop: 8 }}>
                      <div style={{ fontSize:'0.9rem', fontWeight:800, color:'#0D364F', marginBottom:12, display:'flex', alignItems:'center', gap:8 }}>
                        <FileUp size={20}/> Anexar Comprovante de Pagamento <span style={{ color:'#dc2626' }}>*</span>
                      </div>
                      <input
                        type="file"
                        accept="image/*,application/pdf"
                        onChange={(e) => setComprovanteFile(e.target.files?.[0] || null)}
                        style={{ display: 'none' }}
                        id="comprovante-upload"
                      />
                      <label
                        htmlFor="comprovante-upload"
                        style={{
                          display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:12,
                          border: comprovanteFile ? '2px solid #16a34a' : '2px dashed #cbd5e1',
                          borderRadius:20, padding:'32px 24px', cursor:'pointer',
                          background: comprovanteFile ? 'rgba(22,163,74,0.04)' : '#f8fafc',
                          transition:'all .2s'
                        }}
                      >
                        {comprovanteFile ? (
                          <>
                            <div style={{ background: '#16a34a', color: '#fff', borderRadius: '50%', width: 56, height: 56, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <CheckCircle2 size={32} />
                            </div>
                            <div style={{ fontSize:'1.1rem', fontWeight:800, color:'#16a34a' }}>Comprovante anexado!</div>
                            <div style={{ fontSize:'0.8rem', color:'#64748b', maxWidth:300, textAlign:'center', wordBreak:'break-all' }}>{comprovanteFile.name}</div>
                            <div style={{ fontSize:'0.75rem', color:'#94a3b8', textTransform: 'uppercase', fontWeight: 700, marginTop: 4 }}>Clique para substituir</div>
                          </>
                        ) : (
                          <>
                            <div style={{ background: '#e2e8f0', color: '#64748b', borderRadius: '50%', width: 56, height: 56, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <FileUp size={28} />
                            </div>
                            <div style={{ fontSize:'1rem', fontWeight:800, color:'#334155' }}>Selecionar Comprovante</div>
                            <div style={{ fontSize:'0.8rem', color:'#94a3b8' }}>PDF, PNG ou JPG do comprovante</div>
                          </>
                        )}
                      </label>
                    </div>

                    <div style={{ padding:'20px', background:'rgba(245,158,11,.06)', border:'1px solid rgba(245,158,11,.15)', borderRadius:16, display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                      <AlertCircle size={20} style={{ color: '#92400e', marginTop: 2, flexShrink: 0 }} />
                      <div style={{ fontSize:'0.82rem', color:'#92400e', lineHeight:1.8 }}>
                        <strong>Atenção:</strong> A análise dos documentos será iniciada somente após a confirmação do pagamento pelo administrador. Guarde seu comprovante.
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: 16 }}>
                      <button onClick={() => setShowPaymentScreen(false)} style={{ padding:'16px 24px', borderRadius:16, border:'1px solid var(--site-border)', background: '#fff', color: 'var(--site-text-secondary)', fontWeight: 700, cursor: 'pointer' }}>Voltar</button>
                      <button
                        onClick={handleSubmitCheckout}
                        disabled={enviando || !comprovanteFile}
                        style={{
                          flex: 1, padding:'20px', borderRadius:16, border:'none',
                          background: (enviando || !comprovanteFile) ? '#e2e8f0' : 'linear-gradient(135deg,#16a34a,#15803d)',
                          color: (enviando || !comprovanteFile) ? '#94a3b8' : '#fff', 
                          fontSize:'1.15rem', fontWeight:900, cursor: (enviando || !comprovanteFile) ? 'not-allowed' : 'pointer',
                          display:'flex', alignItems:'center', justifyContent:'center', gap:12,
                          boxShadow: (!enviando && comprovanteFile) ? '0 12px 36px rgba(22,163,74,0.3)' : 'none',
                          transition:'all .2s'
                        }}
                      >
                        {enviando
                          ? <><Loader2 size={24} className="spin-anim"/> Enviando...</>
                          : <><ShieldCheck size={24}/> Enviar para Validação Final</>
                        }
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
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
                          <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Clock size={18} className="spin-anim" /> Processando...</span>
                        ) : (
                          <><ShieldCheck size={18} /> Realizar Pagamento</>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </section>
          )}

          {/* NAVIGATION (BOTTOM) */}
          {!showPaymentScreen && (
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
          )}
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



      {/* INDICADOR DE SCROLL (Lateral Esquerda) */}
      {showScrollHint && (
        <div style={{
          position: 'fixed',
          left: '2vw',
          top: '50%',
          transform: 'translateY(-50%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 12,
          zIndex: 9999,
          pointerEvents: 'none',
          animation: 'fadeInOut 2s infinite'
        }}>
          <div style={{ 
            writingMode: 'vertical-rl', 
            textTransform: 'uppercase', 
            fontSize: '0.7rem', 
            fontWeight: 900, 
            color: 'var(--site-gold)', 
            letterSpacing: '0.2em',
            opacity: 0.8
          }}>
            Role para mais informações
          </div>
          <div style={{ animation: 'bounceVertical 2s infinite', color: 'var(--site-gold)' }}>
            <ChevronDown size={48} strokeWidth={3} />
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes bounceVertical {
          0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-10px); }
          60% { transform: translateY(-5px); }
        }
        @keyframes fadeInOut {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }
      `}} />

    </>
  );
}
