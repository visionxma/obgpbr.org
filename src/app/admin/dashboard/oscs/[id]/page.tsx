'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import {
  ArrowLeft, CheckCircle, XCircle, Clock, ExternalLink,
  FileText, BookOpen, ClipboardList, AlertCircle, Save,
  Building2, Phone, MapPin, Hash, ShieldCheck, ChevronDown, ChevronUp,
  Edit2, X, Mail, Home, User,
} from 'lucide-react';

/* ── Types ──────────────────────────────────────── */
interface OscPerfil {
  id: string; user_id: string; osc_id: string;
  razao_social: string | null; cnpj: string | null;
  natureza_juridica: string | null;
  responsavel: string | null; telefone: string | null;
  email_osc: string | null;
  logradouro: string | null; numero_endereco: string | null;
  bairro: string | null; municipio: string | null;
  estado: string | null; cep: string | null;
  data_abertura_cnpj: string | null;
  status_selo: 'pendente' | 'em_analise' | 'aprovado' | 'rejeitado';
  observacao_selo: string | null;
  created_at: string; updated_at: string;
}
interface Documento {
  id: string; nome: string; tipo: string;
  arquivo_url: string | null; tamanho_bytes: number | null;
  status: string; observacao: string | null; created_at: string;
}
interface Prestacao {
  id: string; titulo: string; periodo: string | null;
  valor_total: number | null; arquivo_url: string | null;
  status: string; created_at: string;
}
interface Formulario {
  id: string; titulo: string; tipo: string; status: string; updated_at: string;
}
interface ChecklistItem {
  id: string; label: string; checked: boolean; doc_url: string | null; doc_nome: string | null;
}
interface Relatorio {
  id: string; osc_id: string; numero: string | null;
  status: 'em_preenchimento' | 'em_analise' | 'aprovado' | 'reprovado';
  dados_entidade: Record<string, string>;
  habilitacao_juridica: ChecklistItem[];
  regularidade_fiscal: ChecklistItem[];
  qualificacao_economica: ChecklistItem[];
  qualificacao_tecnica: ChecklistItem[];
  observacao_admin: string | null;
  submitted_at: string | null;
  reviewed_at: string | null;
  created_at: string;
}

/* ── Helpers ────────────────────────────────────── */
const TIPO_LABELS: Record<string, string> = {
  estatuto: 'Estatuto Social', ata: 'Ata de Eleição', cnpj: 'Comprovante CNPJ',
  balancete: 'Balancete', certidao: 'Certidão Negativa', declaracao: 'Declaração',
  outro: 'Outro',
};
const DOC_STATUS_LABELS: Record<string, string> = {
  enviado: 'Enviado', aprovado: 'Aprovado', rejeitado: 'Rejeitado', pendente: 'Pendente',
};
const FORM_STATUS_LABELS: Record<string, string> = {
  nao_iniciado: 'Não iniciado', em_andamento: 'Em andamento', concluido: 'Concluído',
};
const PRST_STATUS_LABELS: Record<string, string> = {
  pendente: 'Pendente', em_analise: 'Em Análise', aprovada: 'Aprovada', rejeitada: 'Rejeitada',
};

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}
function fmtBytes(b: number | null) {
  if (!b) return '—';
  if (b < 1048576) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / 1048576).toFixed(1)} MB`;
}
function fmtCurrency(v: number | null) {
  if (!v) return '—';
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

type EditForm = {
  razao_social: string; cnpj: string; natureza_juridica: string;
  responsavel: string; telefone: string; email_osc: string;
  logradouro: string; numero_endereco: string; bairro: string;
  municipio: string; estado: string; cep: string; data_abertura_cnpj: string;
};

function perfilToForm(p: OscPerfil): EditForm {
  return {
    razao_social: p.razao_social ?? '',
    cnpj: p.cnpj ?? '',
    natureza_juridica: p.natureza_juridica ?? '',
    responsavel: p.responsavel ?? '',
    telefone: p.telefone ?? '',
    email_osc: p.email_osc ?? '',
    logradouro: p.logradouro ?? '',
    numero_endereco: p.numero_endereco ?? '',
    bairro: p.bairro ?? '',
    municipio: p.municipio ?? '',
    estado: p.estado ?? '',
    cep: p.cep ?? '',
    data_abertura_cnpj: p.data_abertura_cnpj ?? '',
  };
}

/* ── Component ──────────────────────────────────── */
export default function OscDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [perfil, setPerfil] = useState<OscPerfil | null>(null);
  const [docs, setDocs] = useState<Documento[]>([]);
  const [prestacoes, setPrestacoes] = useState<Prestacao[]>([]);
  const [formularios, setFormularios] = useState<Formulario[]>([]);
  const [relatorio, setRelatorio] = useState<Relatorio | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // Edit OSC data
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState<EditForm | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const [editMsg, setEditMsg] = useState('');

  // Relatório admin controls
  const [relStatus, setRelStatus] = useState('');
  const [relObs, setRelObs] = useState('');
  const [savingRel, setSavingRel] = useState(false);
  const [relMsg, setRelMsg] = useState('');
  const [openRelSection, setOpenRelSection] = useState<number>(0);

  // Status edit state
  const [newStatus, setNewStatus] = useState('');
  const [observacao, setObservacao] = useState('');
  const [savingStatus, setSavingStatus] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  // Per-doc review
  const [docObs, setDocObs] = useState<Record<string, string>>({});
  const [docSaving, setDocSaving] = useState<string | null>(null);

  // Per-prestacao review
  const [prstSaving, setPrstSaving] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const { data: p, error } = await supabase
        .from('osc_perfis').select('*').eq('id', id).single();

      if (error || !p) { setNotFound(true); setLoading(false); return; }

      const pf = p as OscPerfil;
      setPerfil(pf);
      setNewStatus(pf.status_selo);
      setObservacao(pf.observacao_selo ?? '');

      const [docsRes, prestRes, formRes, relRes] = await Promise.all([
        supabase.from('osc_documentos').select('*').eq('osc_id', pf.osc_id).order('created_at', { ascending: false }),
        supabase.from('osc_prestacao_contas').select('id, titulo, periodo, valor_total, arquivo_url, status, created_at').eq('osc_id', pf.osc_id).order('created_at', { ascending: false }),
        supabase.from('osc_formularios').select('id, titulo, tipo, status, updated_at').eq('osc_id', pf.osc_id),
        supabase.from('relatorios_conformidade').select('*').eq('osc_id', pf.osc_id).order('created_at', { ascending: false }).limit(1).maybeSingle(),
      ]);

      setDocs((docsRes.data ?? []) as Documento[]);
      setPrestacoes((prestRes.data ?? []) as Prestacao[]);
      setFormularios((formRes.data ?? []) as Formulario[]);
      if (relRes.data) {
        const r = relRes.data as Relatorio;
        setRelatorio(r);
        setRelStatus(r.status);
        setRelObs(r.observacao_admin ?? '');
      }
      setLoading(false);
    };
    load();
  }, [id]);

  /* ── Save OSC data ── */
  const handleSaveEdit = async () => {
    if (!perfil || !editForm) return;
    setSavingEdit(true); setEditMsg('');
    const { error } = await supabase.from('osc_perfis').update({
      razao_social: editForm.razao_social.trim() || null,
      cnpj: editForm.cnpj.trim() || null,
      natureza_juridica: editForm.natureza_juridica.trim() || null,
      responsavel: editForm.responsavel.trim() || null,
      telefone: editForm.telefone.trim() || null,
      email_osc: editForm.email_osc.trim() || null,
      logradouro: editForm.logradouro.trim() || null,
      numero_endereco: editForm.numero_endereco.trim() || null,
      bairro: editForm.bairro.trim() || null,
      municipio: editForm.municipio.trim() || null,
      estado: editForm.estado.trim() || null,
      cep: editForm.cep.trim() || null,
      data_abertura_cnpj: editForm.data_abertura_cnpj.trim() || null,
      updated_at: new Date().toISOString(),
    }).eq('id', perfil.id);
    setSavingEdit(false);
    if (error) { setEditMsg('error:Erro ao salvar. Tente novamente.'); return; }
    setPerfil(prev => prev ? { ...prev, ...Object.fromEntries(Object.entries(editForm).map(([k, v]) => [k, v.trim() || null])) } as OscPerfil : prev);
    setEditMsg('ok:Dados atualizados com sucesso!');
    setEditMode(false);
    setTimeout(() => setEditMsg(''), 3000);
  };

  /* ── Save Selo status ── */
  const handleSaveStatus = async () => {
    if (!perfil) return;
    if (newStatus === 'rejeitado' && !observacao.trim()) {
      setStatusMsg('error:Informe o motivo da reprovação.');
      return;
    }
    setSavingStatus(true); setStatusMsg('');
    const { error } = await supabase.from('osc_perfis').update({
      status_selo: newStatus,
      observacao_selo: observacao.trim() || null,
      updated_at: new Date().toISOString(),
    }).eq('id', perfil.id);
    if (error) { setStatusMsg('error:Erro ao salvar. Tente novamente.'); }
    else {
      setPerfil(prev => prev ? { ...prev, status_selo: newStatus as OscPerfil['status_selo'], observacao_selo: observacao.trim() || null } : prev);
      setStatusMsg('ok:Status atualizado com sucesso!');
      setTimeout(() => setStatusMsg(''), 3000);
    }
    setSavingStatus(false);
  };

  /* ── Save Relatório decision ── */
  const handleSaveRelatorio = async () => {
    if (!relatorio) return;
    if (relStatus === 'reprovado' && !relObs.trim()) {
      setRelMsg('error:Informe o motivo da reprovação.');
      return;
    }
    setSavingRel(true); setRelMsg('');
    const { error } = await supabase.from('relatorios_conformidade').update({
      status: relStatus,
      observacao_admin: relObs.trim() || null,
      reviewed_at: new Date().toISOString(),
    }).eq('id', relatorio.id);
    setSavingRel(false);
    if (error) { setRelMsg('error:Erro ao salvar decisão.'); return; }
    setRelatorio(prev => prev ? { ...prev, status: relStatus as Relatorio['status'], observacao_admin: relObs.trim() || null } : prev);
    setRelMsg('ok:Decisão registrada com sucesso!');
    setTimeout(() => setRelMsg(''), 3000);
  };

  /* ── Doc approve/reject ── */
  const handleDocAction = async (docId: string, status: 'aprovado' | 'rejeitado') => {
    setDocSaving(docId);
    const obs = docObs[docId]?.trim() || null;
    const { error } = await supabase.from('osc_documentos').update({ status, observacao: obs }).eq('id', docId);
    if (!error) setDocs(prev => prev.map(d => d.id === docId ? { ...d, status, observacao: obs } : d));
    setDocSaving(null);
  };

  /* ── Prestação approve/reject ── */
  const handlePrestacaoAction = async (pId: string, status: 'aprovada' | 'rejeitada' | 'em_analise') => {
    setPrstSaving(pId);
    const { error } = await supabase.from('osc_prestacao_contas').update({ status }).eq('id', pId);
    if (!error) setPrestacoes(prev => prev.map(p => p.id === pId ? { ...p, status } : p));
    setPrstSaving(null);
  };

  /* ── Render helpers ── */
  function msgParts(msg: string): ['ok' | 'error' | '', string] {
    if (msg.startsWith('ok:')) return ['ok', msg.slice(3)];
    if (msg.startsWith('error:')) return ['error', msg.slice(6)];
    return ['', ''];
  }

  function MsgBanner({ msg }: { msg: string }) {
    const [type, text] = msgParts(msg);
    if (!text) return null;
    return (
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px',
        borderRadius: 8, marginBottom: 16, fontSize: '0.82rem', fontWeight: 500,
        background: type === 'ok' ? 'var(--admin-success-bg)' : 'var(--admin-danger-bg)',
        color: type === 'ok' ? 'var(--admin-success)' : 'var(--admin-danger)',
        border: `1px solid ${type === 'ok' ? 'rgba(38,102,47,.2)' : 'rgba(220,38,38,.2)'}`,
      }}>
        {type === 'ok' ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
        {text}
      </div>
    );
  }

  /* ── Loading / not found ── */
  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
      <div style={{ width: 36, height: 36, border: '3px solid var(--admin-border)', borderTopColor: 'var(--admin-primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      <style>{`@keyframes spin{100%{transform:rotate(360deg)}}`}</style>
    </div>
  );

  if (notFound) return (
    <div className="admin-empty-state">
      <div className="admin-empty-state-icon"><AlertCircle size={32} /></div>
      <div className="admin-empty-state-text">OSC não encontrada.</div>
      <Link href="/admin/dashboard/oscs" className="admin-btn admin-btn-secondary" style={{ marginTop: 16, display: 'inline-flex', alignItems: 'center', gap: 6, borderRadius: 8 }}>
        <ArrowLeft size={14} /> Voltar
      </Link>
    </div>
  );

  if (!perfil) return null;

  const ef = editForm ?? perfilToForm(perfil);

  const fieldStyle: React.CSSProperties = {
    display: 'flex', flexDirection: 'column', gap: 4,
  };
  const labelStyle: React.CSSProperties = {
    fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase',
    letterSpacing: '.06em', color: 'var(--admin-text-tertiary)', marginBottom: 2,
  };

  return (
    <div>
      {/* Back */}
      <div style={{ marginBottom: 24 }}>
        <Link href="/admin/dashboard/oscs" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.82rem', fontWeight: 600, color: 'var(--admin-text-secondary)', textDecoration: 'none', transition: 'color .2s' }}
          onMouseEnter={e => (e.currentTarget.style.color = 'var(--admin-primary)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--admin-text-secondary)')}
        >
          <ArrowLeft size={14} /> Voltar para lista
        </Link>
      </div>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 28, flexWrap: 'wrap' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <span style={{ fontFamily: 'monospace', fontSize: '0.85rem', fontWeight: 800, background: 'var(--admin-primary-subtle)', color: 'var(--admin-primary)', padding: '4px 12px', borderRadius: 8 }}>
              {perfil.osc_id}
            </span>
            <span className={`adm-badge ${perfil.status_selo}`} style={{ fontSize: '0.72rem' }}>
              {perfil.status_selo === 'aprovado' && <CheckCircle size={11} />}
              {perfil.status_selo === 'em_analise' && <Clock size={11} />}
              {perfil.status_selo === 'rejeitado' && <XCircle size={11} />}
              {({ pendente: 'Pendente', em_analise: 'Em Análise', aprovado: 'Aprovado', rejeitado: 'Rejeitado' })[perfil.status_selo]}
            </span>
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'Outfit, sans-serif', color: 'var(--admin-text-primary)', letterSpacing: '-.02em' }}>
            {perfil.responsavel ?? perfil.razao_social ?? perfil.osc_id}
          </div>
          {perfil.razao_social && perfil.responsavel && (
            <div style={{ fontSize: '0.875rem', color: 'var(--admin-text-secondary)', marginTop: 3 }}>{perfil.razao_social}</div>
          )}
        </div>
      </div>

      {/* Two-column: profile info + status management */}
      <div className="content-grid cols-2" style={{ marginBottom: 28, alignItems: 'start' }}>

        {/* ── Profile info card ── */}
        <div className="glass-card">
          <div className="glass-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="glass-card-title">
              <span className="glass-card-title-icon"><Building2 size={15} /></span>
              Dados da OSC
            </span>
            {!editMode ? (
              <button
                onClick={() => { setEditForm(perfilToForm(perfil)); setEditMode(true); setEditMsg(''); }}
                className="admin-btn admin-btn-secondary"
                style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', fontSize: '0.75rem', borderRadius: 8 }}
              >
                <Edit2 size={13} /> Editar
              </button>
            ) : (
              <button
                onClick={() => { setEditMode(false); setEditMsg(''); }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--admin-text-secondary)', display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.75rem' }}
              >
                <X size={14} /> Cancelar
              </button>
            )}
          </div>
          <div className="glass-card-body">
            <MsgBanner msg={editMsg} />

            {!editMode ? (
              /* View mode */
              <>
                {[
                  { icon: Hash,      label: 'ID OSC',              value: perfil.osc_id },
                  { icon: User,      label: 'Responsável',         value: perfil.responsavel },
                  { icon: Building2, label: 'Razão Social',        value: perfil.razao_social },
                  { icon: FileText,  label: 'CNPJ',                value: perfil.cnpj },
                  { icon: Building2, label: 'Natureza Jurídica',   value: perfil.natureza_juridica },
                  { icon: Phone,     label: 'Telefone',            value: perfil.telefone },
                  { icon: Mail,      label: 'E-mail',              value: perfil.email_osc },
                  { icon: Home,      label: 'Endereço',            value: [perfil.logradouro, perfil.numero_endereco].filter(Boolean).join(', ') || null },
                  { icon: MapPin,    label: 'Bairro',              value: perfil.bairro },
                  { icon: MapPin,    label: 'Cidade / UF',         value: [perfil.municipio, perfil.estado].filter(Boolean).join(' / ') || null },
                  { icon: Hash,      label: 'CEP',                 value: perfil.cep },
                  { icon: FileText,  label: 'Abertura CNPJ',       value: perfil.data_abertura_cnpj },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} style={{ display: 'flex', gap: 12, padding: '9px 0', borderBottom: '1px solid var(--admin-border)' }}>
                    <div style={{ width: 30, height: 30, borderRadius: 7, background: 'var(--admin-primary-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--admin-primary)', flexShrink: 0 }}>
                      <Icon size={13} />
                    </div>
                    <div>
                      <div style={labelStyle}>{label}</div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 500, color: value ? 'var(--admin-text-primary)' : 'var(--admin-text-tertiary)' }}>
                        {value || 'Não informado'}
                      </div>
                    </div>
                  </div>
                ))}
                <div style={{ paddingTop: 10 }}>
                  <div style={labelStyle}>Cadastro</div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--admin-text-secondary)' }}>{fmtDate(perfil.created_at)}</div>
                </div>
              </>
            ) : (
              /* Edit mode */
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  {([
                    { key: 'razao_social',       label: 'Razão Social',       placeholder: 'Nome da organização' },
                    { key: 'cnpj',               label: 'CNPJ',               placeholder: '00.000.000/0001-00' },
                    { key: 'natureza_juridica',  label: 'Natureza Jurídica',  placeholder: 'Ex: Associação' },
                    { key: 'responsavel',        label: 'Responsável',        placeholder: 'Nome completo' },
                    { key: 'telefone',           label: 'Telefone',           placeholder: '(00) 00000-0000' },
                    { key: 'email_osc',          label: 'E-mail',             placeholder: 'contato@osc.org' },
                    { key: 'cep',                label: 'CEP',                placeholder: '00000-000' },
                    { key: 'data_abertura_cnpj', label: 'Data Abertura CNPJ', placeholder: 'DD/MM/AAAA' },
                  ] as { key: keyof EditForm; label: string; placeholder: string }[]).map(({ key, label, placeholder }) => (
                    <div key={key} style={fieldStyle}>
                      <label style={labelStyle}>{label}</label>
                      <input
                        type="text"
                        className="admin-input"
                        style={{ padding: '8px 10px', fontSize: '0.82rem' }}
                        placeholder={placeholder}
                        value={ef[key]}
                        onChange={e => setEditForm(prev => ({ ...(prev ?? ef), [key]: e.target.value }))}
                      />
                    </div>
                  ))}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12 }}>
                  <div style={fieldStyle}>
                    <label style={labelStyle}>Logradouro</label>
                    <input type="text" className="admin-input" style={{ padding: '8px 10px', fontSize: '0.82rem' }}
                      placeholder="Rua, Av., etc." value={ef.logradouro}
                      onChange={e => setEditForm(prev => ({ ...(prev ?? ef), logradouro: e.target.value }))} />
                  </div>
                  <div style={fieldStyle}>
                    <label style={labelStyle}>Número</label>
                    <input type="text" className="admin-input" style={{ padding: '8px 10px', fontSize: '0.82rem' }}
                      placeholder="Nº" value={ef.numero_endereco}
                      onChange={e => setEditForm(prev => ({ ...(prev ?? ef), numero_endereco: e.target.value }))} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                  <div style={fieldStyle}>
                    <label style={labelStyle}>Bairro</label>
                    <input type="text" className="admin-input" style={{ padding: '8px 10px', fontSize: '0.82rem' }}
                      placeholder="Bairro" value={ef.bairro}
                      onChange={e => setEditForm(prev => ({ ...(prev ?? ef), bairro: e.target.value }))} />
                  </div>
                  <div style={fieldStyle}>
                    <label style={labelStyle}>Município</label>
                    <input type="text" className="admin-input" style={{ padding: '8px 10px', fontSize: '0.82rem' }}
                      placeholder="Cidade" value={ef.municipio}
                      onChange={e => setEditForm(prev => ({ ...(prev ?? ef), municipio: e.target.value }))} />
                  </div>
                  <div style={fieldStyle}>
                    <label style={labelStyle}>UF</label>
                    <input type="text" className="admin-input" style={{ padding: '8px 10px', fontSize: '0.82rem' }}
                      placeholder="SP" maxLength={2} value={ef.estado}
                      onChange={e => setEditForm(prev => ({ ...(prev ?? ef), estado: e.target.value.toUpperCase() }))} />
                  </div>
                </div>

                <button
                  className="admin-btn admin-btn-primary"
                  style={{ display: 'flex', alignItems: 'center', gap: 7, borderRadius: 10, justifyContent: 'center', marginTop: 4 }}
                  onClick={handleSaveEdit}
                  disabled={savingEdit}
                >
                  {savingEdit ? 'Salvando...' : <><Save size={14} /> Salvar Dados</>}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ── Status management ── */}
        <div className="glass-card">
          <div className="glass-card-header">
            <span className="glass-card-title">
              <span className="glass-card-title-icon"><CheckCircle size={15} /></span>
              Gestão do Selo OSC
            </span>
          </div>
          <div className="glass-card-body">
            <MsgBanner msg={statusMsg} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label className="admin-form-label">Status do Processo</label>
                <select className="admin-input" value={newStatus} onChange={e => setNewStatus(e.target.value)}>
                  <option value="pendente">Pendente</option>
                  <option value="em_analise">Em Análise</option>
                  <option value="aprovado">Aprovado</option>
                  <option value="rejeitado">Rejeitado</option>
                </select>
              </div>
              <div>
                <label className="admin-form-label">
                  Observação {newStatus === 'rejeitado' && <span style={{ color: 'var(--admin-danger)' }}>*</span>}
                </label>
                <textarea
                  className="admin-input" rows={3}
                  placeholder={newStatus === 'rejeitado' ? 'Informe o motivo da reprovação...' : 'Observação para o usuário (opcional)...'}
                  value={observacao} onChange={e => setObservacao(e.target.value)}
                  style={{ resize: 'vertical' }}
                />
              </div>
              <div className="adm-action-row">
                <button className="adm-btn-approve" onClick={() => { setNewStatus('aprovado'); setObservacao(''); }}>
                  <CheckCircle size={14} /> Aprovar
                </button>
                <button className="adm-btn-review" onClick={() => setNewStatus('em_analise')}>
                  <Clock size={14} /> Em Análise
                </button>
                <button className="adm-btn-reject" onClick={() => setNewStatus('rejeitado')}>
                  <XCircle size={14} /> Reprovar
                </button>
              </div>
              <button
                className="admin-btn admin-btn-primary"
                style={{ display: 'flex', alignItems: 'center', gap: 7, borderRadius: 10, justifyContent: 'center' }}
                onClick={handleSaveStatus} disabled={savingStatus}
              >
                {savingStatus ? '...' : <><Save size={14} /> Salvar Decisão</>}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Documents section ── */}
      <div className="glass-card" style={{ marginBottom: 24 }}>
        <div className="glass-card-header">
          <span className="glass-card-title">
            <span className="glass-card-title-icon"><FileText size={15} /></span>
            Documentos Enviados
            <span style={{ marginLeft: 8, fontSize: '0.75rem', fontWeight: 600, color: 'var(--admin-text-tertiary)' }}>({docs.length})</span>
          </span>
        </div>
        <div>
          {docs.length === 0 ? (
            <div className="admin-empty-state" style={{ padding: '40px 0' }}>
              <div className="admin-empty-state-icon"><FileText size={24} /></div>
              <div className="admin-empty-state-text">Nenhum documento enviado</div>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Nome</th><th>Tipo</th><th>Tamanho</th><th>Status</th><th>Data</th><th>Observação</th><th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {docs.map(doc => (
                    <tr key={doc.id}>
                      <td><div className="cell-primary">{doc.nome}</div></td>
                      <td style={{ color: 'var(--admin-text-secondary)', fontSize: '0.8rem' }}>{TIPO_LABELS[doc.tipo] ?? doc.tipo}</td>
                      <td style={{ color: 'var(--admin-text-tertiary)', fontSize: '0.8rem' }}>{fmtBytes(doc.tamanho_bytes)}</td>
                      <td><span className={`adm-badge ${doc.status}`}>{DOC_STATUS_LABELS[doc.status] ?? doc.status}</span></td>
                      <td style={{ color: 'var(--admin-text-tertiary)', fontSize: '0.8rem' }}>{fmtDate(doc.created_at)}</td>
                      <td style={{ minWidth: 180 }}>
                        <input type="text" className="admin-input" style={{ padding: '6px 10px', fontSize: '0.78rem' }}
                          placeholder="Observação..."
                          value={docObs[doc.id] ?? (doc.observacao ?? '')}
                          onChange={e => setDocObs(prev => ({ ...prev, [doc.id]: e.target.value }))} />
                      </td>
                      <td>
                        <div className="cell-action">
                          {doc.arquivo_url && (
                            <a href={doc.arquivo_url} target="_blank" rel="noopener noreferrer"
                              className="admin-btn-icon admin-btn"
                              style={{ border: '1px solid var(--admin-border)', borderRadius: 8 }} title="Visualizar">
                              <ExternalLink size={14} />
                            </a>
                          )}
                          <button className="adm-btn-approve" style={{ padding: '5px 10px', fontSize: '0.75rem' }}
                            onClick={() => handleDocAction(doc.id, 'aprovado')}
                            disabled={docSaving === doc.id || doc.status === 'aprovado'}>
                            {docSaving === doc.id ? '...' : <CheckCircle size={12} />}
                          </button>
                          <button className="adm-btn-reject" style={{ padding: '5px 10px', fontSize: '0.75rem' }}
                            onClick={() => handleDocAction(doc.id, 'rejeitado')}
                            disabled={docSaving === doc.id || doc.status === 'rejeitado'}>
                            {docSaving === doc.id ? '...' : <XCircle size={12} />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ── Bottom grid: prestações + formulários ── */}
      <div className="content-grid cols-equal" style={{ alignItems: 'start' }}>

        {/* Prestações */}
        <div className="glass-card">
          <div className="glass-card-header">
            <span className="glass-card-title">
              <span className="glass-card-title-icon"><BookOpen size={15} /></span>
              Prestações de Contas
              <span style={{ marginLeft: 8, fontSize: '0.75rem', fontWeight: 600, color: 'var(--admin-text-tertiary)' }}>({prestacoes.length})</span>
            </span>
          </div>
          <div>
            {prestacoes.length === 0 ? (
              <div className="admin-empty-state" style={{ padding: '36px 0' }}>
                <div className="admin-empty-state-icon"><BookOpen size={20} /></div>
                <div className="admin-empty-state-text" style={{ fontSize: '0.82rem' }}>Nenhuma prestação registrada</div>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table className="admin-table">
                  <thead>
                    <tr><th>Título</th><th>Período</th><th>Valor</th><th>Status</th><th>Data</th><th>Ações</th></tr>
                  </thead>
                  <tbody>
                    {prestacoes.map(p => (
                      <tr key={p.id}>
                        <td><div className="cell-primary">{p.titulo}</div></td>
                        <td style={{ color: 'var(--admin-text-secondary)', fontSize: '0.8rem' }}>{p.periodo ?? '—'}</td>
                        <td style={{ color: 'var(--admin-text-secondary)', fontSize: '0.8rem' }}>{fmtCurrency(p.valor_total)}</td>
                        <td><span className={`adm-badge ${p.status === 'aprovada' ? 'aprovado' : p.status === 'rejeitada' ? 'rejeitado' : p.status === 'em_analise' ? 'enviado' : 'pendente'}`}>{PRST_STATUS_LABELS[p.status] ?? p.status}</span></td>
                        <td style={{ color: 'var(--admin-text-tertiary)', fontSize: '0.8rem' }}>{fmtDate(p.created_at)}</td>
                        <td>
                          <div className="cell-action">
                            {p.arquivo_url && (
                              <a href={p.arquivo_url} target="_blank" rel="noopener noreferrer"
                                className="admin-btn-icon admin-btn"
                                style={{ border: '1px solid var(--admin-border)', borderRadius: 8 }} title="Ver arquivo">
                                <ExternalLink size={13} />
                              </a>
                            )}
                            <button className="adm-btn-review" style={{ padding: '5px 10px', fontSize: '0.75rem' }}
                              onClick={() => handlePrestacaoAction(p.id, 'em_analise')}
                              disabled={prstSaving === p.id || p.status === 'em_analise'} title="Em Análise">
                              <Clock size={12} />
                            </button>
                            <button className="adm-btn-approve" style={{ padding: '5px 10px', fontSize: '0.75rem' }}
                              onClick={() => handlePrestacaoAction(p.id, 'aprovada')}
                              disabled={prstSaving === p.id || p.status === 'aprovada'} title="Aprovar">
                              {prstSaving === p.id ? '...' : <CheckCircle size={12} />}
                            </button>
                            <button className="adm-btn-reject" style={{ padding: '5px 10px', fontSize: '0.75rem' }}
                              onClick={() => handlePrestacaoAction(p.id, 'rejeitada')}
                              disabled={prstSaving === p.id || p.status === 'rejeitada'} title="Rejeitar">
                              {prstSaving === p.id ? '...' : <XCircle size={12} />}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Formulários */}
        <div className="glass-card">
          <div className="glass-card-header">
            <span className="glass-card-title">
              <span className="glass-card-title-icon"><ClipboardList size={15} /></span>
              Formulários
              <span style={{ marginLeft: 8, fontSize: '0.75rem', fontWeight: 600, color: 'var(--admin-text-tertiary)' }}>({formularios.length})</span>
            </span>
          </div>
          <div className="glass-card-body" style={{ padding: '8px 28px 24px' }}>
            {formularios.length === 0 ? (
              <div className="admin-empty-state" style={{ padding: '28px 0' }}>
                <div className="admin-empty-state-icon"><ClipboardList size={20} /></div>
                <div className="admin-empty-state-text" style={{ fontSize: '0.82rem' }}>Nenhum formulário iniciado</div>
              </div>
            ) : (
              <div className="activity-feed">
                {formularios.map(f => (
                  <div key={f.id} className="activity-item">
                    <div className={`activity-dot ${f.status === 'concluido' ? 'success' : f.status === 'em_andamento' ? 'primary' : 'warning'}`} />
                    <div className="activity-content">
                      <div className="activity-title">{f.titulo}</div>
                      <div className="activity-meta">Atualizado {fmtDate(f.updated_at)}</div>
                    </div>
                    <span className={`adm-badge ${f.status === 'concluido' ? 'aprovado' : f.status === 'em_andamento' ? 'enviado' : 'pendente'}`}>
                      {FORM_STATUS_LABELS[f.status] ?? f.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ══ Relatório de Conformidade ══ */}
      {relatorio && (() => {
        const REL_STATUS_LABELS: Record<string, string> = {
          em_preenchimento: 'Em Preenchimento', em_analise: 'Em Análise',
          aprovado: 'Aprovado', reprovado: 'Reprovado',
        };
        const DADOS_LABELS: Record<string, string> = {
          razao_social: 'Razão Social', cnpj: 'CNPJ', natureza_juridica: 'Natureza Jurídica',
          responsavel: 'Responsável', telefone: 'Telefone', email_osc: 'E-mail',
          logradouro: 'Logradouro', numero_endereco: 'Nº', bairro: 'Bairro',
          municipio: 'Município', estado: 'UF', cep: 'CEP', data_abertura_cnpj: 'Data Abertura CNPJ',
        };
        const secoes = [
          { num: 2, label: 'Habilitação Jurídica', items: relatorio.habilitacao_juridica ?? [] },
          { num: 3, label: 'Regularidade Fiscal, Social e Trabalhista', items: relatorio.regularidade_fiscal ?? [] },
          { num: 4, label: 'Qualificação Econômico-financeira', items: relatorio.qualificacao_economica ?? [] },
          { num: 5, label: 'Qualificação Técnica', items: relatorio.qualificacao_tecnica ?? [] },
        ];
        return (
          <div className="glass-card" style={{ marginTop: 24 }}>
            <div className="glass-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="glass-card-title">
                <span className="glass-card-title-icon"><ShieldCheck size={15} /></span>
                Relatório de Conformidade
                <span style={{ marginLeft: 10 }}>
                  <span className={`adm-badge ${relatorio.status === 'aprovado' ? 'aprovado' : relatorio.status === 'reprovado' ? 'rejeitado' : relatorio.status === 'em_analise' ? 'enviado' : 'pendente'}`} style={{ fontSize: '0.7rem' }}>
                    {REL_STATUS_LABELS[relatorio.status]}
                  </span>
                </span>
              </span>
              <span style={{ fontSize: '0.78rem', color: 'var(--admin-text-tertiary)', fontFamily: 'monospace' }}>
                {relatorio.numero ?? '—'}
              </span>
            </div>
            <div className="glass-card-body">
              <MsgBanner msg={relMsg} />
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end', marginBottom: 24 }}>
                <div style={{ flex: '0 0 180px' }}>
                  <label className="admin-form-label">Decisão</label>
                  <select className="admin-input" value={relStatus} onChange={e => setRelStatus(e.target.value)}>
                    <option value="em_preenchimento">Em Preenchimento</option>
                    <option value="em_analise">Em Análise</option>
                    <option value="aprovado">Aprovado</option>
                    <option value="reprovado">Reprovado</option>
                  </select>
                </div>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <label className="admin-form-label">
                    Observação {relStatus === 'reprovado' && <span style={{ color: 'var(--admin-danger)' }}>*</span>}
                  </label>
                  <input type="text" className="admin-input"
                    placeholder={relStatus === 'reprovado' ? 'Motivo da reprovação...' : 'Observação para a OSC (opcional)...'}
                    value={relObs} onChange={e => setRelObs(e.target.value)} />
                </div>
                <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                  <button className="adm-btn-approve" onClick={() => { setRelStatus('aprovado'); setRelObs(''); }}>
                    <CheckCircle size={13} /> Aprovar
                  </button>
                  <button className="adm-btn-reject" onClick={() => setRelStatus('reprovado')}>
                    <XCircle size={13} /> Reprovar
                  </button>
                  <button className="admin-btn admin-btn-primary"
                    style={{ display: 'flex', alignItems: 'center', gap: 6, borderRadius: 8, padding: '7px 16px', fontSize: '0.82rem' }}
                    onClick={handleSaveRelatorio} disabled={savingRel}>
                    {savingRel ? '...' : <><Save size={13} /> Salvar</>}
                  </button>
                </div>
              </div>

              {relatorio.dados_entidade && Object.keys(relatorio.dados_entidade).length > 0 && (
                <div style={{ marginBottom: 10, border: '1px solid var(--admin-border)', borderRadius: 10, overflow: 'hidden' }}>
                  <button onClick={() => setOpenRelSection(openRelSection === 1 ? 0 : 1)}
                    style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: 'var(--admin-surface)', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '0.82rem', color: 'var(--admin-text-primary)' }}>
                    <span>1 — Dados da Entidade</span>
                    {openRelSection === 1 ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>
                  {openRelSection === 1 && (
                    <div style={{ padding: '12px 16px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px 20px', borderTop: '1px solid var(--admin-border)' }}>
                      {Object.entries(relatorio.dados_entidade).filter(([, v]) => v).map(([k, v]) => (
                        <div key={k}>
                          <div style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.05em', color: 'var(--admin-text-tertiary)', marginBottom: 2 }}>
                            {DADOS_LABELS[k] ?? k}
                          </div>
                          <div style={{ fontSize: '0.82rem', color: 'var(--admin-text-primary)', fontWeight: 500 }}>{String(v)}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {secoes.map(({ num, label, items }) => (
                <div key={num} style={{ marginBottom: 10, border: '1px solid var(--admin-border)', borderRadius: 10, overflow: 'hidden' }}>
                  <button onClick={() => setOpenRelSection(openRelSection === num ? 0 : num)}
                    style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: 'var(--admin-surface)', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '0.82rem', color: 'var(--admin-text-primary)' }}>
                    <span>{num} — {label}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: '0.72rem', color: 'var(--admin-text-tertiary)' }}>
                        {items.filter((i: ChecklistItem) => i.checked).length}/{items.length} marcados
                      </span>
                      {openRelSection === num ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </span>
                  </button>
                  {openRelSection === num && (
                    <div style={{ borderTop: '1px solid var(--admin-border)' }}>
                      {items.map((item: ChecklistItem, i: number) => (
                        <div key={item.id} style={{
                          display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 16px',
                          borderBottom: i < items.length - 1 ? '1px solid var(--admin-border)' : 'none',
                          background: item.checked ? 'rgba(22,163,74,.04)' : 'transparent',
                        }}>
                          <span style={{ marginTop: 3, color: item.checked ? '#16a34a' : 'var(--admin-text-tertiary)', flexShrink: 0 }}>
                            {item.checked
                              ? <CheckCircle size={14} />
                              : <div style={{ width: 14, height: 14, border: '2px solid var(--admin-border)', borderRadius: 3 }} />}
                          </span>
                          <span style={{ flex: 1, fontSize: '0.82rem', color: 'var(--admin-text-primary)', lineHeight: 1.5 }}>{item.label}</span>
                          {item.doc_url && (
                            <a href={item.doc_url} target="_blank" rel="noopener noreferrer"
                              style={{ flexShrink: 0, display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '0.72rem', color: 'var(--admin-primary)', fontWeight: 600, textDecoration: 'none' }}>
                              <ExternalLink size={11} /> {item.doc_nome ?? 'Ver'}
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      })()}

      <style>{`@keyframes spin{100%{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
