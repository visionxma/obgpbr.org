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
  ChevronDown,
  ArrowLeft,
  Paperclip,
  X as XIcon,
  Sparkles,
  Lock
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

const WIZARD_PHASES = [
  { id: 'identificacao', label: 'Identificação', description: 'Dados Iniciais', stepRange: [1, 1] },
  { id: 'documentacao', label: 'Conformidade', description: 'Análise de Documentos', stepRange: [2, 6] },
  { id: 'certificacao', label: 'Certificação', description: 'Validação Final', stepRange: [7, 7] },
];

const WIZARD_STEPS = [
  { id: 'entidade', label: 'Dados da Entidade', phaseId: 'identificacao' },
  { id: 'juridica', label: 'Habilitação Jurídica', phaseId: 'documentacao' },
  { id: 'fiscal',   label: 'Regularidade Fiscal', phaseId: 'documentacao' },
  { id: 'financeira', label: 'Qual. Econômica', phaseId: 'documentacao' },
  { id: 'tecnica',  label: 'Qual. Técnica', phaseId: 'documentacao' },
  { id: 'outros',   label: 'Outros Registros', phaseId: 'documentacao' },
  { id: 'conclusao', label: 'Finalização', phaseId: 'certificacao' },
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

function DocFileField({ itemId, file, onAttach, onRemove }: { itemId: string; file: File | null; onAttach: (file: File) => void; onRemove: () => void }) {
  const inputId = `doc-file-${itemId}`;
  return (
    <div style={{ gridColumn: '1 / -1' }}>
      <label style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--site-text-secondary)', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Anexar Arquivo do Documento</label>
      <input
        id={inputId}
        type="file"
        accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
        style={{ display: 'none' }}
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onAttach(f);
          e.target.value = '';
        }}
      />
      {file ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderRadius: 10, border: '1px solid rgba(22,163,74,0.25)', background: 'rgba(22,163,74,0.05)' }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(22,163,74,0.12)', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <FileText size={18} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--site-text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file.name}</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--site-text-secondary)', marginTop: 2 }}>{(file.size / 1024).toFixed(0)} KB · Pronto para envio</div>
          </div>
          <label htmlFor={inputId} style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid var(--site-border)', background: '#fff', color: 'var(--site-text-secondary)', fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', cursor: 'pointer' }}>
            Trocar
          </label>
          <button type="button" onClick={onRemove} aria-label="Remover anexo" style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid var(--site-border)', background: '#fff', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <XIcon size={14} />
          </button>
        </div>
      ) : (
        <label htmlFor={inputId} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', borderRadius: 10, border: '1px dashed var(--site-border)', background: '#fff', cursor: 'pointer', transition: 'all .15s' }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(197,171,118,0.12)', color: 'var(--site-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Paperclip size={18} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--site-text-primary)' }}>Clique para anexar o arquivo</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--site-text-secondary)', marginTop: 2 }}>PDF, PNG, JPG, DOC ou DOCX · até 10 MB</div>
          </div>
          <span style={{ padding: '6px 14px', borderRadius: 'var(--site-radius-full)', border: '1px solid var(--site-gold)', color: 'var(--site-gold)', fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Selecionar</span>
        </label>
      )}
    </div>
  );
}

function DocumentSection({ number, title, items, data, handleUpdate, showErrors, files, onAttachFile, onRemoveFile }: { number: string; title: string; items: DocItem[]; data: RelatorioData; handleUpdate: (id: string, field: string, val: string) => void; showErrors: boolean; files: Record<string, File>; onAttachFile: (id: string, file: File) => void; onRemoveFile: (id: string) => void }) {
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
                  <label style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--site-text-secondary)', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Observações da OSC (opcional)</label>
                  <textarea placeholder="Inclua aqui qualquer observação relevante sobre o documento. A análise técnica será realizada pela equipe OBGP." value={doc.obs || ''} onChange={(e) => handleUpdate(item.id, 'obs', e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: 8, border: '1px solid var(--site-border)', fontSize: '0.85rem', minHeight: 80, resize: 'vertical' }} />
                </div>
                <DocFileField
                  itemId={item.id}
                  file={files[item.id] || null}
                  onAttach={(f) => onAttachFile(item.id, f)}
                  onRemove={() => onRemoveFile(item.id)}
                />
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
  const [files, setFiles] = useState<{ [docId: string]: File }>({});
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [showScrollHint, setShowScrollHint] = useState(false);

  const handleAttachFile = (id: string, file: File) => {
    setFiles(prev => ({ ...prev, [id]: file }));
    handleUpdate(id, 'status', 'em_analise');
  };

  const handleRemoveFile = (id: string) => {
    setFiles(prev => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
    handleUpdate(id, 'status', 'pendente');
  };

  useEffect(() => {
    const handleScroll = () => {
      // FORÇA a exibição no passo 7 enquanto estiver na tela de pagamento
      if (step === 7 && showPaymentScreen) {
        setShowScrollHint(true);
      } else {
        setShowScrollHint(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [step, showPaymentScreen]);

  // ── Persistence Logic (Anti-Reset) ──────────────────────────
  
  // 1. Hydration: Load state from LocalStorage on mount
  useEffect(() => {
    const savedState = localStorage.getItem('obgp_processo_state');
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        if (parsed.step) setStep(parsed.step);
        if (parsed.data) setData(parsed.data);
        if (parsed.entidadeData) setEntidadeData(parsed.entidadeData);
        if (parsed.activePerfil) setActivePerfil(parsed.activePerfil);
        if (parsed.showCnpjStep !== undefined) setShowCnpjStep(parsed.showCnpjStep);
        if (parsed.cnpjSuccess !== undefined) setCnpjSuccess(parsed.cnpjSuccess);
        if (parsed.showPaymentScreen !== undefined) setShowPaymentScreen(parsed.showPaymentScreen);
        if (parsed.relatorioId) setRelatorioId(parsed.relatorioId);
        console.log('OBGP: Progresso restaurado com sucesso.');
      } catch (e) {
        console.error('Erro ao restaurar estado:', e);
      }
    }
    setLoadingData(false);
  }, []);

  // 2. Sync: Save state to LocalStorage on change
  useEffect(() => {
    if (loadingData) return; // Não salva enquanto está carregando inicial
    
    const stateToSave = {
      step,
      data,
      entidadeData,
      activePerfil,
      showCnpjStep,
      cnpjSuccess,
      showPaymentScreen,
      relatorioId
    };
    
    localStorage.setItem('obgp_processo_state', JSON.stringify(stateToSave));
  }, [step, data, entidadeData, activePerfil, showCnpjStep, cnpjSuccess, showPaymentScreen, relatorioId, loadingData]);

  const [enviando, setEnviando] = useState(false);
  const [mensagemEnviando, setMensagemEnviando] = useState('');
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);
  const [trackedProcesses, setTrackedProcesses] = useState<{id: string, data: string, status: string, entidade: string}[]>([]);
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
      
      const savedTracking = localStorage.getItem('obgp_guest_tracking');
      if (savedTracking) {
        setTrackedProcesses(JSON.parse(savedTracking));
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
  };

  const handleUpdate = (id: string, field: string, val: string) => {
    const newData: RelatorioData = { ...data, [id]: { ...data[id], [field]: val, status: 'em_analise' as DocStatus } };
    setData(newData);
  };

  const handleEntidadeUpdate = (field: string, val: string) => {
    const newData = { ...entidadeData, [field]: val };
    setEntidadeData(newData);
  };

  const saveProgress = async () => {
    setSaving(true);
    try {
      // O progresso já é salvo via useEffect em obgp_processo_state
      // Aqui apenas garantimos que o estado foi sincronizado (opcional)
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
    if (showPaymentScreen) {
      setShowPaymentScreen(false);
    } else {
      setStep(s => Math.max(s - 1, 1));
    }
    document.getElementById('painel-top')?.scrollIntoView({ behavior: 'smooth' });
  };
  
  const handleResetProcesso = () => {
    showConfirm('Reiniciar Processo', 'ATENÇÃO: Isso apagará todos os dados preenchidos e reiniciará o processo. Deseja continuar?', async () => {
      setResetting(true);
      try {
        localStorage.removeItem('obgp_processo_state');
        localStorage.removeItem('obgp_guest_entidade');
        localStorage.removeItem('obgp_guest_docs');
        localStorage.removeItem('obgp_guest_step');
        setData({});
        setEntidadeData({ cnpj: '', natureza_juridica: '', razao_social: '', nome_fantasia: '', cep: '', logradouro: '', numero_endereco: '', bairro: '', municipio: '', estado: '', data_abertura_cnpj: '', email_osc: '', telefone: '', responsavel: '' });
        setStep(1);
        setShowCnpjStep(true);
        setCnpjSuccess(false);
        setCnpjError('');
        setShowPaymentScreen(false);
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

      const trackingInfo = {
        id: Date.now().toString(),
        data: new Date().toISOString(),
        status: 'em_analise',
        entidade: entidadeData.razao_social || entidadeData.cnpj
      };
      
      const newTracking = [trackingInfo, ...trackedProcesses];
      setTrackedProcesses(newTracking);
      localStorage.setItem('obgp_guest_tracking', JSON.stringify(newTracking));

      // Clear the form data
      localStorage.removeItem('obgp_guest_entidade');
      localStorage.removeItem('obgp_guest_docs');
      localStorage.removeItem('obgp_guest_cart');
      localStorage.removeItem('obgp_guest_step');
      
      setCheckoutSuccess(true);
      
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
          {/* ── HEADER BAR — Premium Glassmorphic ── */}
          <div className="processo-header-bar" style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 28,
            padding: '14px 28px',
            background: 'rgba(255,255,255,0.92)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            borderRadius: 18,
            border: '1px solid rgba(13,54,79,0.06)',
            boxShadow: '0 4px 24px rgba(13,54,79,0.04), 0 1px 2px rgba(0,0,0,0.02)',
            gap: 16,
            position: 'sticky',
            top: 80,
            zIndex: 40,
            transition: 'box-shadow .3s ease'
          }}>
            {/* LEFT: Back + Title */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 20, flex: '1 1 auto', minWidth: 0 }}>
              {(step > 1 || showPaymentScreen) && (
                <button 
                  onClick={handleBack}
                  style={{ 
                    padding: '10px 20px', 
                    fontSize: '0.8rem', 
                    fontWeight: 700, 
                    borderRadius: 'var(--site-radius-full)', 
                    border: '1px solid var(--site-border)', 
                    background: '#fff',
                    color: 'var(--site-primary)', 
                    cursor: 'pointer', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 8, 
                    transition: 'all .25s ease',
                    whiteSpace: 'nowrap',
                    flexShrink: 0
                  }}
                  onMouseOver={(e) => { 
                    e.currentTarget.style.background = 'var(--site-primary)';
                    e.currentTarget.style.color = '#fff';
                    e.currentTarget.style.borderColor = 'var(--site-primary)';
                    e.currentTarget.style.transform = 'translateX(-3px)'; 
                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(13,54,79,0.15)';
                  }}
                  onMouseOut={(e) => { 
                    e.currentTarget.style.background = '#fff';
                    e.currentTarget.style.color = 'var(--site-primary)';
                    e.currentTarget.style.borderColor = 'var(--site-border)';
                    e.currentTarget.style.transform = 'translateX(0)'; 
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <ArrowLeft size={16} strokeWidth={2.5} />
                  Voltar
                </button>
              )}

              <div style={{ minWidth: 0 }}>
                <h1 style={{ 
                  fontSize: 'clamp(1.15rem, 3vw, 1.5rem)', 
                  fontWeight: 900, 
                  color: 'var(--site-primary)', 
                  letterSpacing: '-0.025em', 
                  margin: 0, 
                  lineHeight: 1.15,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  fontFamily: 'var(--font-heading)'
                }}>
                  Relatório de Conformidade
                </h1>
                <p style={{ 
                  color: 'var(--site-text-secondary)', 
                  fontSize: '0.78rem', 
                  fontWeight: 600, 
                  margin: '3px 0 0', 
                  opacity: 0.6,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  {activePerfil.razao_social}
                </p>
              </div>
            </div>

            {/* RIGHT: Reset + Progress */}
            <div className="processo-header-actions" style={{ display: 'flex', gap: 10, alignItems: 'center', flexShrink: 0 }}>
              <button 
                onClick={handleResetProcesso}
                disabled={resetting}
                style={{ 
                  padding: '8px 16px', 
                  fontSize: '0.72rem', 
                  fontWeight: 700, 
                  borderRadius: 'var(--site-radius-full)', 
                  border: '1px solid var(--site-border)', 
                  background: 'transparent', 
                  color: 'var(--site-text-secondary)', 
                  cursor: 'pointer', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 6, 
                  transition: 'all .2s',
                  whiteSpace: 'nowrap',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em'
                }}
                onMouseOver={(e) => { e.currentTarget.style.borderColor = '#dc2626'; e.currentTarget.style.color = '#dc2626'; e.currentTarget.style.background = 'rgba(220,38,38,0.04)'; }}
                onMouseOut={(e) => { e.currentTarget.style.borderColor = 'var(--site-border)'; e.currentTarget.style.color = 'var(--site-text-secondary)'; e.currentTarget.style.background = 'transparent'; }}
              >
                {resetting ? <Loader2 size={13} className="spin-anim" /> : <RefreshCcw size={13} />}
                Reiniciar
              </button>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 10, 
                padding: '8px 18px', 
                background: 'linear-gradient(135deg, rgba(13,54,79,0.03), rgba(197,171,118,0.08))', 
                borderRadius: 'var(--site-radius-full)', 
                border: '1px solid rgba(197,171,118,0.18)' 
              }}>
                <span style={{ fontSize: '0.62rem', fontWeight: 900, color: 'var(--site-primary)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Progresso</span>
                <div style={{ width: 'clamp(50px, 8vw, 80px)', height: 5, background: 'rgba(0,0,0,0.06)', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ width: `${progress}%`, height: '100%', background: 'linear-gradient(90deg, var(--site-gold), #d4a855)', transition: 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1)', borderRadius: 3 }} />
                </div>
                <span style={{ fontSize: '0.8rem', fontWeight: 900, color: 'var(--site-gold)', minWidth: 30, textAlign: 'right' }}>{progress}%</span>
              </div>
            </div>
          </div>

          {!showPaymentScreen && (
            <>
              <div className="wizard-card" style={{ padding: '24px 32px', position: 'relative', overflow: 'hidden' }}>
                {/* Background pattern for depth */}
                <div style={{ position: 'absolute', top: 0, right: 0, width: '30%', height: '100%', background: 'linear-gradient(90deg, transparent, rgba(197, 171, 118, 0.05))', pointerEvents: 'none' }} />
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
                  <div>
                    <h2 style={{ fontSize: '0.75rem', fontWeight: 900, margin: 0, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>Painel de Conformidade</h2>
                    <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#fff', marginTop: 4, display: 'flex', alignItems: 'center', gap: 12 }}>
                      {WIZARD_PHASES.find(p => step >= p.stepRange[0] && step <= p.stepRange[1])?.label}
                      <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'rgba(255,255,255,0.4)', background: 'rgba(255,255,255,0.1)', padding: '4px 10px', borderRadius: 6 }}>
                        {step} de {WIZARD_STEPS.length}
                      </span>
                    </div>
                  </div>
                  
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--site-gold)' }}>
                      {step === 1 && "Vamos começar!"}
                      {step > 1 && step < 4 && "Ótimo progresso!"}
                      {step >= 4 && step < 7 && "Quase lá, falta pouco!"}
                      {step === 7 && "Tudo pronto para certificar!"}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>
                      {WIZARD_STEPS[step - 1].label}
                    </div>
                  </div>
                </div>

                <div style={{ position: 'relative', padding: '0 10px' }}>
                  {/* PHASES ROW */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20, position: 'relative', zIndex: 2 }}>
                    {WIZARD_PHASES.map((phase, idx) => {
                      const isCurrentPhase = step >= phase.stepRange[0] && step <= phase.stepRange[1];
                      const isPastPhase = step > phase.stepRange[1];
                      return (
                        <div key={phase.id} style={{ flex: 1, textAlign: 'center', position: 'relative' }}>
                          <div style={{ 
                            fontSize: '0.65rem', 
                            fontWeight: 900, 
                            color: isCurrentPhase ? 'var(--site-gold)' : (isPastPhase ? '#fff' : 'rgba(255,255,255,0.2)'),
                            textTransform: 'uppercase',
                            letterSpacing: '0.1em',
                            transition: 'all 0.3s'
                          }}>
                            {phase.label}
                          </div>
                          <div style={{ 
                            height: 4, 
                            background: isCurrentPhase ? 'var(--site-gold)' : (isPastPhase ? 'var(--site-gold)' : 'rgba(255,255,255,0.1)'),
                            marginTop: 8,
                            borderRadius: 2,
                            marginRight: idx < WIZARD_PHASES.length - 1 ? 8 : 0,
                            boxShadow: isCurrentPhase ? '0 0 15px rgba(197, 171, 118, 0.4)' : 'none',
                            transition: 'all 0.5s ease'
                          }} />
                        </div>
                      );
                    })}
                  </div>

                  {/* MICRO STEPS ROW */}
                  <div className="wizard-steps-row" style={{ marginTop: 12, opacity: 0.8 }}>
                    {WIZARD_STEPS.map((s, i) => {
                      const done = step > i + 1;
                      const active = step === i + 1;
                      return (
                        <div key={i} className={`wizard-step-item ${active ? 'active' : ''} ${done ? 'done' : ''}`} style={{ opacity: active || done ? 1 : 0.3 }}>
                          <div 
                            className="wizard-step-circle"
                            style={{ 
                              width: 22, height: 22, borderRadius: '50%', 
                              background: done ? 'var(--site-gold)' : (active ? 'var(--site-primary)' : 'transparent'), 
                              border: done ? 'none' : (active ? '2px solid var(--site-gold)' : '1px solid rgba(255,255,255,0.2)'), 
                              display: 'flex', alignItems: 'center', justifyContent: 'center', 
                              color: done ? '#fff' : (active ? 'var(--site-gold)' : 'rgba(255,255,255,0.2)'), 
                              zIndex: 2,
                              transition: 'all 0.3s'
                            }}
                          >
                            {done ? <Check size={10} strokeWidth={4} /> : <span style={{ fontSize: 9, fontWeight: 800 }}>{i + 1}</span>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

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
            <DocumentSection number="2" title="HABILITAÇÃO JURÍDICA" items={HABILITACAO_JURIDICA} data={data} handleUpdate={handleUpdate} showErrors={showValidationErrors} files={files} onAttachFile={handleAttachFile} onRemoveFile={handleRemoveFile} />
          )}

          {step === 3 && (
            <DocumentSection number="3" title="REGULARIDADE FISCAL, SOCIAL E TRABALHISTA" items={REGULARIDADE_FISCAL} data={data} handleUpdate={handleUpdate} showErrors={showValidationErrors} files={files} onAttachFile={handleAttachFile} onRemoveFile={handleRemoveFile} />
          )}

          {step === 4 && (
            <DocumentSection number="4" title="QUALIFICAÇÃO ECONÔMICO-FINANCEIRA" items={QUALIFICACAO_FINANCEIRA} data={data} handleUpdate={handleUpdate} showErrors={showValidationErrors} files={files} onAttachFile={handleAttachFile} onRemoveFile={handleRemoveFile} />
          )}

          {step === 5 && (
            <DocumentSection number="5" title="QUALIFICAÇÃO TÉCNICA" items={QUALIFICACAO_TECNICA} data={data} handleUpdate={handleUpdate} showErrors={showValidationErrors} files={files} onAttachFile={handleAttachFile} onRemoveFile={handleRemoveFile} />
          )}

          {step === 6 && (
            <DocumentSection number="6" title="OUTROS REGISTROS" items={OUTROS_REGISTROS} data={data} handleUpdate={handleUpdate} showErrors={false} files={files} onAttachFile={handleAttachFile} onRemoveFile={handleRemoveFile} />
          )}

          {step === 7 && (
            <section style={{ marginBottom: 32, border: '1px solid var(--site-border)', borderRadius: 'var(--site-radius-xl)', overflow: 'hidden', background: '#fff' }}>
              <header style={{ background: 'var(--site-primary)', color: '#fff', padding: '16px 24px', display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--site-gold)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: 800 }}>7</div>
                <h2 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0, color: '#fff' }}>CONCLUSÃO E PAGAMENTO</h2>
              </header>

              {showPaymentScreen ? (
                <div style={{ animation:'panelPageIn .3s ease', background: '#fff' }}>
                  {/* ── Value Banner ── */}
                  <div style={{ 
                    background: 'linear-gradient(135deg, #0D364F 0%, #164e6e 50%, #0D364F 100%)', 
                    padding: '28px 32px', 
                    color: '#fff', 
                    textAlign: 'center',
                    position: 'relative',
                    overflow: 'hidden'
                  }}>
                    <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 30% 50%, rgba(197,171,118,0.08), transparent 60%)', pointerEvents: 'none' }} />
                    <div style={{ position: 'relative', zIndex: 1 }}>
                      <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.15em', color: 'rgba(255,255,255,0.5)', marginBottom: 6 }}>Valor Total do Relatório</div>
                      <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#4ade80', lineHeight: 1, letterSpacing: '-0.02em' }}>R$ 389,96</div>
                      <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)', marginTop: 6, fontWeight: 500 }}>Relatório de Conformidade — Certificação Individual</div>
                    </div>
                  </div>

                  {/* ── Payment Body ── */}
                  <div style={{ padding: 'clamp(20px, 4vw, 32px)', display: 'flex', flexDirection: 'column', gap: 20 }}>
                    
                    {/* PIX Section */}
                    <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 16, overflow: 'hidden' }}>
                      <div style={{ padding: '14px 20px', borderBottom: '1px solid #e2e8f0', background: 'rgba(13,54,79,0.02)' }}>
                        <div style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.1em', color: '#0D364F', display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--site-gold)' }} />
                          Dados para Pagamento PIX
                        </div>
                      </div>
                      <div style={{ padding: '24px 20px', display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
                        {/* QR Code */}
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                          <div style={{ padding: 10, background: '#fff', borderRadius: 14, border: '2px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                            <img src="/pix_qrcode.png" alt="QR Code PIX" style={{ width: 160, height: 160, borderRadius: 6, objectFit: 'cover', display: 'block' }} />
                          </div>
                          <span style={{ fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', color: '#94a3b8' }}>Escaneie com seu app bancário</span>
                        </div>
                        {/* PIX Key */}
                        <div style={{ flex: '1 1 220px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                          <div style={{ 
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, 
                            padding: '14px 18px', 
                            background: '#fff', 
                            border: '1.5px solid var(--site-primary)', 
                            borderRadius: 12 
                          }}>
                            <div>
                              <div style={{ fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--site-text-secondary)' }}>Chave PIX (CNPJ)</div>
                              <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--site-primary)', marginTop: 2, fontFamily: 'monospace', letterSpacing: '.04em' }}>14.796.065/0001-08</div>
                            </div>
                            <button
                              onClick={() => copyToClipboard('14796065000108', 'pix')}
                              style={{ 
                                background: copiedField === 'pix' ? '#16a34a' : 'var(--site-primary)', 
                                color: '#fff', border: 'none', borderRadius: 10, padding: '10px 16px', 
                                fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer', 
                                display: 'flex', alignItems: 'center', gap: 6, transition: 'all .2s',
                                whiteSpace: 'nowrap', flexShrink: 0
                              }}
                            >
                              {copiedField === 'pix' ? <><CheckCircle2 size={14}/> Copiado!</> : <><Copy size={14}/> Copiar</>}
                            </button>
                          </div>
                          <div style={{ 
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, 
                            padding: '14px 18px', 
                            background: '#fff', 
                            border: '1px solid #e2e8f0', 
                            borderRadius: 12 
                          }}>
                            <div>
                              <div style={{ fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--site-text-secondary)' }}>Beneficiário</div>
                              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--site-text-primary)', marginTop: 2 }}>OBGP Brasil</div>
                            </div>
                          </div>
                          <div style={{ 
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, 
                            padding: '14px 18px', 
                            background: '#fff', 
                            border: '1px solid #e2e8f0', 
                            borderRadius: 12 
                          }}>
                            <div>
                              <div style={{ fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--site-text-secondary)' }}>Valor</div>
                              <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#16a34a', marginTop: 2 }}>R$ 389,96</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Instructions */}
                    <div style={{ background: 'rgba(59,130,246,0.03)', border: '1px solid rgba(59,130,246,0.1)', borderRadius: 14, padding: '18px 22px' }}>
                      <div style={{ fontSize: '0.8rem', color: '#1e40af', fontWeight: 800, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Info size={16}/> Como realizar o pagamento:
                      </div>
                      <ol style={{ margin: 0, paddingLeft: 22, fontSize: '0.82rem', color: '#475569', lineHeight: 2, fontWeight: 500 }}>
                        <li>Abra o app do seu banco e acesse <strong>PIX → Pagar</strong></li>
                        <li>Escaneie o QR Code acima ou cole a <strong>Chave PIX (CNPJ)</strong></li>
                        <li>Confirme o valor de <strong>R$ 389,96</strong></li>
                        <li>Após pagar, anexe o comprovante abaixo</li>
                      </ol>
                    </div>

                    {/* Upload Comprovante */}
                    <div>
                      <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#0D364F', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <FileUp size={18}/> Comprovante de Pagamento <span style={{ color: '#dc2626', fontSize: '0.9rem' }}>*</span>
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
                          display: 'flex', alignItems: 'center', gap: 16,
                          border: comprovanteFile ? '2px solid #16a34a' : '2px dashed #cbd5e1',
                          borderRadius: 14, padding: '20px 24px', cursor: 'pointer',
                          background: comprovanteFile ? 'rgba(22,163,74,0.03)' : '#fafbfc',
                          transition: 'all .2s'
                        }}
                      >
                        <div style={{ 
                          width: 48, height: 48, borderRadius: 12, flexShrink: 0,
                          background: comprovanteFile ? 'rgba(22,163,74,0.1)' : '#e2e8f0', 
                          color: comprovanteFile ? '#16a34a' : '#64748b', 
                          display: 'flex', alignItems: 'center', justifyContent: 'center' 
                        }}>
                          {comprovanteFile ? <CheckCircle2 size={24} /> : <FileUp size={22} />}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          {comprovanteFile ? (
                            <>
                              <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#16a34a' }}>Comprovante anexado</div>
                              <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{comprovanteFile.name}</div>
                            </>
                          ) : (
                            <>
                              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#334155' }}>Selecionar comprovante</div>
                              <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: 2 }}>PDF, PNG ou JPG · até 10 MB</div>
                            </>
                          )}
                        </div>
                        <span style={{ 
                          padding: '8px 16px', borderRadius: 'var(--site-radius-full)', 
                          border: comprovanteFile ? '1px solid #16a34a' : '1px solid var(--site-border)', 
                          color: comprovanteFile ? '#16a34a' : 'var(--site-text-secondary)', 
                          fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.04em',
                          flexShrink: 0
                        }}>
                          {comprovanteFile ? 'Trocar' : 'Selecionar'}
                        </span>
                      </label>
                    </div>

                    {/* Warning */}
                    <div style={{ padding: '16px 20px', background: 'rgba(245,158,11,.05)', border: '1px solid rgba(245,158,11,.12)', borderRadius: 12, display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                      <AlertCircle size={18} style={{ color: '#b45309', marginTop: 1, flexShrink: 0 }} />
                      <div style={{ fontSize: '0.78rem', color: '#92400e', lineHeight: 1.7 }}>
                        <strong>Atenção:</strong> A análise dos documentos será iniciada somente após a confirmação do pagamento pelo administrador. Guarde seu comprovante.
                      </div>
                    </div>

                    {/* Actions / Success State */}
                    {checkoutSuccess ? (
                      <div style={{ padding: '30px 20px', textAlign: 'center', background: '#fff', borderRadius: 16, border: '1px solid #16a34a', marginTop: 12, animation: 'fadeIn .4s ease' }}>
                        <div style={{ width: 64, height: 64, background: 'rgba(22,163,74,0.1)', color: '#16a34a', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                          <CheckCircle2 size={32} />
                        </div>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#16a34a', marginBottom: 8 }}>Documentos Enviados!</h2>
                        <p style={{ color: 'var(--site-text-secondary)', fontSize: '0.95rem', marginBottom: 24 }}>
                          O pagamento e os documentos estão <strong>em análise</strong>. Você pode acompanhar o status pela aba "Processos".
                        </p>
                        <button onClick={() => { setCheckoutSuccess(false); setShowPaymentScreen(false); handleAdicionarNovo(); router.push('/painel/processos'); }} className="panel-btn panel-btn-primary" style={{ padding: '14px 32px', display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: '1rem', borderRadius: 'var(--site-radius-full)' }}>
                          <Eye size={18} /> Acompanhar Processo
                        </button>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
                        <button 
                          onClick={() => setShowPaymentScreen(false)} 
                          style={{ 
                            padding: '14px 24px', borderRadius: 'var(--site-radius-full)', 
                            border: '1px solid var(--site-border)', background: '#fff', 
                            color: 'var(--site-text-secondary)', fontWeight: 700, cursor: 'pointer',
                            fontSize: '0.85rem', transition: 'all .2s', display: 'flex', alignItems: 'center', gap: 8
                          }}
                        >
                          <ArrowLeft size={16} /> Voltar
                        </button>
                        <button
                          onClick={handleSubmitCheckout}
                          disabled={enviando || !comprovanteFile}
                          style={{
                            flex: 1, padding: '16px 24px', borderRadius: 'var(--site-radius-full)', border: 'none',
                            background: (enviando || !comprovanteFile) ? '#e2e8f0' : 'linear-gradient(135deg, #16a34a, #15803d)',
                            color: (enviando || !comprovanteFile) ? '#94a3b8' : '#fff', 
                            fontSize: '1rem', fontWeight: 900, cursor: (enviando || !comprovanteFile) ? 'not-allowed' : 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                            boxShadow: (!enviando && comprovanteFile) ? '0 8px 28px rgba(22,163,74,0.25)' : 'none',
                            transition: 'all .25s ease', letterSpacing: '-0.01em'
                          }}
                        >
                          {enviando
                            ? <><Loader2 size={20} className="spin-anim"/> Enviando...</>
                            : <><ShieldCheck size={20}/> Enviar para Validação Final</>
                          }
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div style={{ padding: 'clamp(20px, 4vw, 32px)' }}>
                  {/* Document Preview Card */}
                  <div style={{ 
                    background: '#fff', 
                    border: '1px solid rgba(197,171,118,0.25)', 
                    borderRadius: 16, 
                    boxShadow: '0 4px 20px rgba(0,0,0,0.03)', 
                    overflow: 'hidden',
                    position: 'relative' 
                  }}>
                    {/* Document Header */}
                    <div style={{ 
                      padding: '20px 28px', 
                      borderBottom: '1px solid rgba(197,171,118,0.15)', 
                      background: 'linear-gradient(135deg, rgba(197,171,118,0.06), rgba(197,171,118,0.02))',
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(197,171,118,0.12)', color: 'var(--site-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <FileText size={18} />
                        </div>
                        <div>
                          <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--site-primary)' }}>Prévia do Relatório de Conformidade</div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--site-text-secondary)', marginTop: 1 }}>Documento final será gerado após validação do pagamento</div>
                        </div>
                      </div>
                      <div style={{ padding: '5px 14px', borderRadius: 'var(--site-radius-full)', background: 'rgba(245,158,11,0.1)', color: '#b45309', fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.06em', whiteSpace: 'nowrap' }}>
                        Aguardando Pagamento
                      </div>
                    </div>

                    {/* Document Body */}
                    <div style={{ padding: '28px 28px 24px', position: 'relative' }}>
                      <div style={{ position: 'absolute', top: 20, right: 24, opacity: 0.06, pointerEvents: 'none' }}>
                        <ShieldCheck size={100} />
                      </div>
                      <p style={{ 
                        textAlign: 'justify', marginBottom: 24, 
                        fontSize: '0.92rem', lineHeight: 1.8, color: '#374151',
                        fontFamily: '"Georgia", "Times New Roman", serif'
                      }}>
                        Após análise documental, constata-se que a entidade, incluindo identificação completa (nome e CNPJ), apresenta a seguinte conformidade aos requisitos para gestão de parcerias:
                      </p>
                      
                      {/* Category Status List */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
                        {[
                          'Habilitação Jurídica',
                          'Regularidade Fiscal, Social e Trabalhista',
                          'Qualificação Econômico-Financeira',
                          'Qualificação Técnica',
                          'Outros Registros'
                        ].map((cat, i) => (
                          <div key={i} style={{ 
                            display: 'flex', alignItems: 'center', gap: 12, 
                            padding: '10px 16px', borderRadius: 10,
                            background: 'rgba(197,171,118,0.04)',
                            border: '1px solid rgba(197,171,118,0.1)'
                          }}>
                            <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'rgba(197,171,118,0.15)', color: 'var(--site-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                              <Clock size={11} />
                            </div>
                            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--site-text-primary)', flex: 1 }}>{cat}</span>
                            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--site-gold)', textTransform: 'uppercase', letterSpacing: '.04em' }}>Pendente de análise</span>
                          </div>
                        ))}
                      </div>

                      <p style={{ 
                        textAlign: 'justify', marginBottom: 0, 
                        fontSize: '0.92rem', lineHeight: 1.8, color: '#374151',
                        fontFamily: '"Georgia", "Times New Roman", serif'
                      }}>
                        Portanto, recomenda-se certificação independente através do <strong>"SELO OSC GESTÃO DE PARCERIAS"</strong>.
                      </p>
                    </div>

                    {/* Document Footer */}
                    <div style={{ padding: '14px 28px', borderTop: '1px solid rgba(0,0,0,0.04)', background: '#fafbfc' }}>
                      <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: 0, lineHeight: 1.6 }}>
                        A autenticidade do documento pode ser conferida através do website: <strong>https://obgpbr.org/selo-osc</strong>, mediante código de verificação e controle.
                      </p>
                    </div>
                  </div>

                  {/* CTA Section */}
                  <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
                    <div style={{ 
                      display: 'flex', alignItems: 'center', gap: 8, 
                      padding: '10px 20px', borderRadius: 'var(--site-radius-full)',
                      background: 'rgba(22,163,74,0.05)', border: '1px solid rgba(22,163,74,0.12)'
                    }}>
                      <ShieldCheck size={15} style={{ color: '#16a34a' }} />
                      <span style={{ fontSize: '0.78rem', color: '#15803d', fontWeight: 600 }}>
                        Sua assinatura digital (.pfx) será aplicada automaticamente ao validar o pagamento.
                      </span>
                    </div>
                    
                    <button 
                      onClick={handleConsultarPagamentoEEnviar} 
                      disabled={enviando} 
                      className="btn btn-gold" 
                      style={{ 
                        padding: '16px 40px', 
                        borderRadius: 'var(--site-radius-full)', 
                        fontWeight: 800, 
                        fontSize: '1rem',
                        display: 'flex', alignItems: 'center', gap: 10,
                        letterSpacing: '-0.01em',
                        boxShadow: '0 6px 24px rgba(197,171,118,0.25)'
                      }}
                    >
                      {enviando ? (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Clock size={18} className="spin-anim" /> Processando...</span>
                      ) : (
                        <><ShieldCheck size={18} /> Realizar Pagamento</>
                      )}
                    </button>
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



      {/* INDICADOR DE SCROLL (Lateral Esquerda) - ELEGANTE E REFINADO */}
      {showScrollHint && (
        <div 
          onClick={() => window.scrollTo({ top: window.scrollY + 600, behavior: 'smooth' })}
          style={{
            position: 'fixed',
            left: 24,
            top: '35%', // Subindo a posição conforme solicitado
            transform: 'translateY(-50%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 20,
            zIndex: 99999,
            cursor: 'pointer',
            padding: '24px 12px',
            background: 'rgba(13, 54, 79, 0.05)',
            borderRadius: 'var(--site-radius-full)',
            border: '1px solid rgba(197, 171, 118, 0.4)',
            backdropFilter: 'blur(8px)',
            animation: 'fadeInLeft .8s ease-out, glow 3s infinite ease-in-out'
          }}
        >
          <div style={{ 
            writingMode: 'vertical-rl', 
            textTransform: 'uppercase', 
            fontSize: '0.75rem', 
            fontWeight: 800, 
            color: 'var(--site-primary)',
            letterSpacing: '0.3em',
            opacity: 0.8,
            fontFamily: 'var(--font-heading)'
          }}>
            Desça para concluir o processo
          </div>
          <div style={{ animation: 'bounceVertical 2s infinite', color: 'var(--site-gold)' }}>
            <ChevronDown size={40} strokeWidth={2} />
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes bounceVertical {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(15px); }
        }
        @keyframes pulseGold {
          0% { box-shadow: 0 0 0 0 rgba(13, 54, 79, 0.4); }
          70% { box-shadow: 0 0 0 15px rgba(13, 54, 79, 0); }
          100% { box-shadow: 0 0 0 0 rgba(13, 54, 79, 0); }
        }
        @keyframes fadeInLeft {
          from { opacity: 0; transform: translateY(-50%) translateX(-40px); }
          to { opacity: 1; transform: translateY(-50%) translateX(0); }
        }
        @keyframes bounceVertical {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(20px); }
        }
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 15px rgba(197, 171, 118, 0.2), inset 0 0 5px rgba(197, 171, 118, 0.1); border-color: rgba(197, 171, 118, 0.3); }
          50% { box-shadow: 0 0 35px rgba(197, 171, 118, 0.6), inset 0 0 15px rgba(197, 171, 118, 0.2); border-color: rgba(197, 171, 118, 0.8); }
        }
      `}} />
    </>
  );
}
