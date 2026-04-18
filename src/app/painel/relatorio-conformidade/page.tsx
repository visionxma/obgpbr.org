'use client';
import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { usePainel } from '../PainelContext';
import {
  ShieldCheck, Save, Send, ChevronDown, ChevronUp,
  Paperclip, CheckCircle, XCircle, Clock, AlertCircle,
  Loader2, ExternalLink, Trash2,
} from 'lucide-react';

/* ── Types ───────────────────────────────────────────────────── */
interface ChecklistItem {
  id: string;
  label: string;
  checked: boolean;
  doc_url: string | null;
  doc_nome: string | null;
}

interface DadosEntidade {
  razao_social: string;
  cnpj: string;
  natureza_juridica: string;
  responsavel: string;
  telefone: string;
  email_osc: string;
  logradouro: string;
  numero_endereco: string;
  bairro: string;
  municipio: string;
  estado: string;
  cep: string;
  data_abertura_cnpj: string;
}

interface Relatorio {
  id: string;
  osc_id: string;
  numero: string | null;
  status: 'em_preenchimento' | 'em_analise' | 'aprovado' | 'reprovado';
  dados_entidade: DadosEntidade;
  habilitacao_juridica: ChecklistItem[];
  regularidade_fiscal: ChecklistItem[];
  qualificacao_economica: ChecklistItem[];
  qualificacao_tecnica: ChecklistItem[];
  observacao_admin: string | null;
  submitted_at: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
}

/* ── Item Templates ──────────────────────────────────────────── */
const HABILITACAO_TPL: Omit<ChecklistItem, 'checked' | 'doc_url' | 'doc_nome'>[] = [
  { id: 'estatuto_social',      label: 'Cópia do estatuto social devidamente registrado em cartório' },
  { id: 'ata_eleicao',          label: 'Cópia da ata de eleição e posse da atual diretoria registrada' },
  { id: 'comprovante_cnpj',     label: 'Comprovante de inscrição e situação cadastral do CNPJ' },
  { id: 'comprovante_endereco', label: 'Comprovante de endereço da sede da organização' },
  { id: 'inscricao_estadual',   label: 'Inscrição estadual ou declaração de isenção, se aplicável' },
];
const REGULARIDADE_TPL: Omit<ChecklistItem, 'checked' | 'doc_url' | 'doc_nome'>[] = [
  { id: 'cert_rfb_pgfn',       label: 'Certidão negativa de débitos relativos a tributos federais e à Dívida Ativa da União (RFB/PGFN)' },
  { id: 'cert_estadual',       label: 'Certidão negativa de débitos estaduais' },
  { id: 'cert_municipal',      label: 'Certidão negativa de débitos municipais' },
  { id: 'cert_fgts',           label: 'Certificado de Regularidade do FGTS (CRF) — Caixa Econômica Federal' },
  { id: 'cert_trabalhista',    label: 'Certidão Negativa de Débitos Trabalhistas (CNDT) — TST' },
  { id: 'cert_inss',           label: 'Certidão Negativa de Débitos previdenciários — INSS' },
];
const ECONOMICA_TPL: Omit<ChecklistItem, 'checked' | 'doc_url' | 'doc_nome'>[] = [
  { id: 'balanco_patrimonial',     label: 'Balanço patrimonial do último exercício social, assinado por contador habilitado' },
  { id: 'demonstracao_resultado',  label: 'Demonstração de Resultado do Exercício (DRE)' },
  { id: 'declaracao_capacidade',   label: 'Declaração de capacidade econômico-financeira subscrita pelo representante legal' },
  { id: 'declaracao_transparencia',label: 'Declaração de compromisso com a transparência e publicação de informações' },
];
const TECNICA_TPL: Omit<ChecklistItem, 'checked' | 'doc_url' | 'doc_nome'>[] = [
  { id: 'atestado_capacidade',  label: 'Atestado de capacidade técnica emitido por pessoa jurídica de direito público ou privado' },
  { id: 'certidao_ract',        label: 'Certidão de Registro de Atestado de Capacidade Técnica em Conselho de Classe Profissional competente' },
  { id: 'curriculo_equipe',     label: 'Currículo e comprovação de qualificação da equipe técnica responsável' },
  { id: 'plano_trabalho',       label: 'Plano de trabalho ou projeto correlato já executado (caso existente)' },
  { id: 'relatorio_atividades', label: 'Relatório de atividades desenvolvidas nos últimos 3 anos (se aplicável)' },
];

function initChecklist(
  template: Omit<ChecklistItem, 'checked' | 'doc_url' | 'doc_nome'>[],
  saved: ChecklistItem[],
): ChecklistItem[] {
  return template.map(t => {
    const existing = saved.find(s => s.id === t.id);
    return existing ?? { ...t, checked: false, doc_url: null, doc_nome: null };
  });
}

/* ── Helpers ────────────────────────────────────────────────── */
function emptyDados(perfil: any): DadosEntidade {
  return {
    razao_social:      perfil?.razao_social      ?? '',
    cnpj:              perfil?.cnpj              ?? '',
    natureza_juridica: perfil?.natureza_juridica ?? '',
    responsavel:       perfil?.responsavel       ?? '',
    telefone:          perfil?.telefone          ?? '',
    email_osc:         perfil?.email_osc         ?? '',
    logradouro:        perfil?.logradouro        ?? '',
    numero_endereco:   perfil?.numero_endereco   ?? '',
    bairro:            perfil?.bairro            ?? '',
    municipio:         perfil?.municipio         ?? '',
    estado:            perfil?.estado            ?? '',
    cep:               perfil?.cep               ?? '',
    data_abertura_cnpj: perfil?.data_abertura_cnpj ?? '',
  };
}

function generateNumero(): string {
  const d = new Date();
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  const rand = parseInt(crypto.randomUUID().replace(/-/g, '').substring(0, 3), 16) % 900 + 100;
  return `N.º ${rand}-${dd}.${mm}.${yyyy}/OBGP`;
}

const STATUS_CONFIG = {
  em_preenchimento: { label: 'Em Preenchimento', color: '#64748b', bg: '#f1f5f9', icon: null },
  em_analise:       { label: 'Em Análise',        color: '#d97706', bg: '#fef3c7', icon: Clock },
  aprovado:         { label: 'Aprovado',           color: '#16a34a', bg: '#dcfce7', icon: CheckCircle },
  reprovado:        { label: 'Reprovado',          color: '#dc2626', bg: '#fee2e2', icon: XCircle },
} as const;

/* ── Sub-components ─────────────────────────────────────────── */
function SectionHeader({
  num, title, open, onToggle, total, done,
}: {
  num: string; title: string; open: boolean; onToggle: () => void;
  total?: number; done?: number;
}) {
  return (
    <button
      onClick={onToggle}
      style={{
        width: '100%', display: 'flex', alignItems: 'center', gap: 14,
        background: 'none', border: 'none', cursor: 'pointer', padding: '18px 24px',
        textAlign: 'left',
      }}
    >
      <span style={{
        width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
        background: 'var(--site-primary)', color: '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '0.75rem', fontWeight: 800, fontFamily: 'var(--font-heading)',
      }}>{num}</span>
      <span style={{ flex: 1, fontWeight: 700, fontSize: '0.95rem', color: 'var(--site-text-primary)' }}>{title}</span>
      {total !== undefined && (
        <span style={{ fontSize: '0.78rem', color: 'var(--site-text-tertiary)', fontWeight: 600 }}>
          {done}/{total}
        </span>
      )}
      {open ? <ChevronUp size={16} color="var(--site-text-tertiary)" /> : <ChevronDown size={16} color="var(--site-text-tertiary)" />}
    </button>
  );
}

function ChecklistSection({
  items, onChange, onUpload, uploading, editable,
}: {
  items: ChecklistItem[];
  onChange: (updated: ChecklistItem[]) => void;
  onUpload: (itemId: string, file: File) => Promise<void>;
  uploading: string | null;
  editable: boolean;
}) {
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const toggle = (id: string) => {
    if (!editable) return;
    onChange(items.map(it => it.id === id ? { ...it, checked: !it.checked } : it));
  };

  const removeDoc = (id: string) => {
    if (!editable) return;
    onChange(items.map(it => it.id === id ? { ...it, doc_url: null, doc_nome: null } : it));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      {items.map((item, i) => (
        <div
          key={item.id}
          style={{
            display: 'flex', gap: 14, alignItems: 'flex-start',
            padding: '14px 24px',
            borderBottom: i < items.length - 1 ? '1px solid var(--site-border)' : 'none',
            background: item.checked ? 'rgba(22,163,74,.03)' : 'transparent',
            transition: 'background .2s',
          }}
        >
          <input
            type="checkbox"
            checked={item.checked}
            onChange={() => toggle(item.id)}
            disabled={!editable}
            style={{ marginTop: 3, width: 16, height: 16, cursor: editable ? 'pointer' : 'default', accentColor: 'var(--site-primary)', flexShrink: 0 }}
          />
          <div style={{ flex: 1, minWidth: 0 }}>
            <span style={{
              fontSize: '0.875rem', lineHeight: 1.5,
              color: item.checked ? 'var(--site-text-primary)' : 'var(--site-text-secondary)',
              textDecoration: item.checked ? 'none' : 'none',
            }}>
              {item.label}
            </span>
            {item.doc_url ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
                <a href={item.doc_url} target="_blank" rel="noopener noreferrer"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '0.75rem', color: 'var(--site-primary)', fontWeight: 600, textDecoration: 'none' }}>
                  <ExternalLink size={12} /> {item.doc_nome ?? 'Documento anexado'}
                </a>
                {editable && (
                  <button onClick={() => removeDoc(item.id)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--site-danger, #dc2626)', padding: 0, display: 'flex' }}>
                    <Trash2 size={13} />
                  </button>
                )}
              </div>
            ) : null}
          </div>
          {editable && (
            <>
              <input
                type="file"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                ref={el => { fileRefs.current[item.id] = el; }}
                style={{ display: 'none' }}
                onChange={async e => {
                  const file = e.target.files?.[0];
                  if (file) await onUpload(item.id, file);
                  if (fileRefs.current[item.id]) fileRefs.current[item.id]!.value = '';
                }}
              />
              <button
                onClick={() => fileRefs.current[item.id]?.click()}
                disabled={uploading === item.id}
                title="Anexar documento"
                style={{
                  flexShrink: 0, background: 'none', border: '1px solid var(--site-border)',
                  borderRadius: 6, padding: '4px 8px', cursor: 'pointer',
                  color: 'var(--site-text-tertiary)', display: 'flex', alignItems: 'center', gap: 4,
                  fontSize: '0.72rem', fontWeight: 600, transition: 'all .15s',
                }}
              >
                {uploading === item.id
                  ? <Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }} />
                  : <Paperclip size={12} />}
                {item.doc_url ? 'Trocar' : 'Anexar'}
              </button>
            </>
          )}
        </div>
      ))}
    </div>
  );
}

const ALLOWED_MIME_REL = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/jpeg',
  'image/png',
]);
const MAX_FILE_REL = 10 * 1024 * 1024;

const MIME_TO_EXT: Record<string, string> = {
  'application/pdf': 'pdf',
  'application/msword': 'doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'application/vnd.ms-excel': 'xls',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
};

function safeExt(file: File): string {
  return MIME_TO_EXT[file.type] ?? 'bin';
}

/* ── Main Component ─────────────────────────────────────────── */
export default function RelatorioConformidadePage() {
  const { perfil } = usePainel();

  const [relatorio, setRelatorio] = useState<Relatorio | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState<{ type: 'ok' | 'error'; text: string } | null>(null);
  const [uploading, setUploading] = useState<string | null>(null);

  const [openSection, setOpenSection] = useState<number>(1);

  // Form state
  const [dados, setDados] = useState<DadosEntidade>(emptyDados(null));
  const [sec2, setSec2] = useState<ChecklistItem[]>([]);
  const [sec3, setSec3] = useState<ChecklistItem[]>([]);
  const [sec4, setSec4] = useState<ChecklistItem[]>([]);
  const [sec5, setSec5] = useState<ChecklistItem[]>([]);

  /* ── Load ── */
  useEffect(() => {
    if (!perfil) return;
    (async () => {
      const { data } = await supabase
        .from('relatorios_conformidade')
        .select('*')
        .eq('osc_id', perfil.osc_id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (data) {
        const r = data as Relatorio;
        setRelatorio(r);
        setDados(r.dados_entidade && Object.keys(r.dados_entidade).length > 0
          ? r.dados_entidade
          : emptyDados(perfil));
        setSec2(initChecklist(HABILITACAO_TPL, r.habilitacao_juridica ?? []));
        setSec3(initChecklist(REGULARIDADE_TPL, r.regularidade_fiscal ?? []));
        setSec4(initChecklist(ECONOMICA_TPL, r.qualificacao_economica ?? []));
        setSec5(initChecklist(TECNICA_TPL, r.qualificacao_tecnica ?? []));
      } else {
        // Auto-create
        const numero = generateNumero();
        const { data: created, error } = await supabase
          .from('relatorios_conformidade')
          .insert({
            osc_id: perfil.osc_id,
            numero,
            status: 'em_preenchimento',
            dados_entidade: emptyDados(perfil),
            habilitacao_juridica: initChecklist(HABILITACAO_TPL, []),
            regularidade_fiscal: initChecklist(REGULARIDADE_TPL, []),
            qualificacao_economica: initChecklist(ECONOMICA_TPL, []),
            qualificacao_tecnica: initChecklist(TECNICA_TPL, []),
          })
          .select('*')
          .single();

        if (created) {
          setRelatorio(created as Relatorio);
          setDados(emptyDados(perfil));
          setSec2(initChecklist(HABILITACAO_TPL, []));
          setSec3(initChecklist(REGULARIDADE_TPL, []));
          setSec4(initChecklist(ECONOMICA_TPL, []));
          setSec5(initChecklist(TECNICA_TPL, []));
        } else {
          setLoadError(true);
        }
      }
      setLoading(false);
    })();
  }, [perfil]);

  const editable = relatorio?.status === 'em_preenchimento' || relatorio?.status === 'reprovado';

  /* ── Helpers ── */
  const showMsg = (type: 'ok' | 'error', text: string) => {
    setMsg({ type, text });
    setTimeout(() => setMsg(null), 4000);
  };

  /* ── Save ── */
  const handleSave = async (silent = false) => {
    if (!relatorio || !perfil) return;
    setSaving(true);
    const updates = {
      dados_entidade: dados,
      habilitacao_juridica: sec2,
      regularidade_fiscal: sec3,
      qualificacao_economica: sec4,
      qualificacao_tecnica: sec5,
    };
    const [relErr, perfErr] = await Promise.all([
      supabase.from('relatorios_conformidade').update(updates).eq('id', relatorio.id).then((r: { error: unknown }) => r.error),
      supabase.from('osc_perfis').update({
        razao_social:      dados.razao_social      || null,
        cnpj:              dados.cnpj              || null,
        natureza_juridica: dados.natureza_juridica || null,
        responsavel:       dados.responsavel       || null,
        telefone:          dados.telefone          || null,
        email_osc:         dados.email_osc         || null,
        logradouro:        dados.logradouro        || null,
        numero_endereco:   dados.numero_endereco   || null,
        bairro:            dados.bairro            || null,
        municipio:         dados.municipio         || null,
        estado:            dados.estado            || null,
        cep:               dados.cep               || null,
        data_abertura_cnpj: dados.data_abertura_cnpj || null,
      }).eq('osc_id', perfil.osc_id).then((r: { error: unknown }) => r.error),
    ]);
    setSaving(false);
    if (relErr || perfErr) { if (!silent) showMsg('error', 'Erro ao salvar. Tente novamente.'); return false; }
    if (!silent) showMsg('ok', 'Progresso salvo com sucesso!');
    return true;
  };

  /* ── Submit ── */
  const handleSubmit = async () => {
    if (!relatorio || !editable) return;
    setSubmitting(true);
    const saved = await handleSave(true);
    if (!saved) { setSubmitting(false); showMsg('error', 'Erro ao salvar antes de enviar.'); return; }
    const { error } = await supabase
      .from('relatorios_conformidade')
      .update({ status: 'em_analise', submitted_at: new Date().toISOString() })
      .eq('id', relatorio.id);
    setSubmitting(false);
    if (error) { showMsg('error', 'Erro ao enviar para análise.'); return; }
    setRelatorio(prev => prev ? { ...prev, status: 'em_analise', submitted_at: new Date().toISOString() } : prev);
    showMsg('ok', 'Relatório enviado para análise com sucesso!');
  };

  /* ── File Upload ── */
  const handleUpload = async (itemId: string, file: File) => {
    if (!perfil || !relatorio) return;
    if (file.size > MAX_FILE_REL) { showMsg('error', 'Arquivo muito grande. Tamanho máximo: 10 MB.'); return; }
    if (!ALLOWED_MIME_REL.has(file.type)) { showMsg('error', 'Tipo não permitido. Use PDF, DOC, DOCX, JPG ou PNG.'); return; }
    setUploading(itemId);
    const ext = safeExt(file);
    const path = `osc/${perfil.osc_id}/relatorio/${itemId}/${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage.from('documents').upload(path, file, { upsert: true, contentType: file.type });
    if (upErr) { showMsg('error', 'Erro ao fazer upload do arquivo.'); setUploading(null); return; }
    const { data: { publicUrl } } = supabase.storage.from('documents').getPublicUrl(path);

    const updateList = (list: ChecklistItem[]) =>
      list.map(it => it.id === itemId ? { ...it, doc_url: publicUrl, doc_nome: file.name } : it);

    const inSec = (list: ChecklistItem[]) => list.some(it => it.id === itemId);
    if (inSec(sec2)) setSec2(prev => updateList(prev));
    else if (inSec(sec3)) setSec3(prev => updateList(prev));
    else if (inSec(sec4)) setSec4(prev => updateList(prev));
    else if (inSec(sec5)) setSec5(prev => updateList(prev));
    setUploading(null);
  };

  /* ── Render ── */
  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
      <Loader2 size={28} style={{ animation: 'spin 1s linear infinite', color: 'var(--site-primary)' }} />
      <style>{`@keyframes spin{100%{transform:rotate(360deg)}}`}</style>
    </div>
  );

  if (loadError || !relatorio) return (
    <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--site-text-secondary)' }}>
      <AlertCircle size={32} style={{ margin: '0 auto 12px', color: '#dc2626' }} />
      <p style={{ fontWeight: 600, marginBottom: 8 }}>Não foi possível carregar o relatório.</p>
      <p style={{ fontSize: '0.85rem' }}>Verifique sua conexão e recarregue a página.</p>
    </div>
  );

  const cfg = STATUS_CONFIG[relatorio.status];
  const StatusIcon = cfg.icon;

  const countChecked = (list: ChecklistItem[]) => list.filter(i => i.checked).length;

  return (
    <div style={{ maxWidth: 820, margin: '0 auto', paddingBottom: 40 }}>
      <style>{`@keyframes spin{100%{transform:rotate(360deg)}}`}</style>

      {/* ── Status Banner ── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap',
        gap: 12, padding: '16px 20px', borderRadius: 12, marginBottom: 24,
        background: cfg.bg, border: `1px solid ${cfg.color}33`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {StatusIcon && <StatusIcon size={18} color={cfg.color} />}
          {!StatusIcon && <ShieldCheck size={18} color={cfg.color} />}
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.9rem', color: cfg.color }}>
              {cfg.label}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--site-text-tertiary)', marginTop: 1 }}>
              {relatorio.numero ?? '—'}
            </div>
          </div>
        </div>
        {relatorio.status === 'reprovado' && relatorio.observacao_admin && (
          <div style={{
            fontSize: '0.82rem', color: '#dc2626', background: '#fff', border: '1px solid #fca5a5',
            borderRadius: 8, padding: '8px 12px', maxWidth: 360, lineHeight: 1.5,
          }}>
            <strong>Motivo:</strong> {relatorio.observacao_admin}
          </div>
        )}
        {relatorio.status === 'aprovado' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.82rem', color: '#16a34a', fontWeight: 600 }}>
            <CheckCircle size={14} /> Certificação concedida
          </div>
        )}
        {relatorio.status === 'em_analise' && (
          <div style={{ fontSize: '0.82rem', color: '#d97706' }}>
            Aguardando análise da OBGP. Qualquer atualização será comunicada por e-mail.
          </div>
        )}
      </div>

      {/* ── Feedback Msg ── */}
      {msg && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', borderRadius: 10,
          marginBottom: 20, fontSize: '0.85rem', fontWeight: 500,
          background: msg.type === 'ok' ? '#dcfce7' : '#fee2e2',
          color: msg.type === 'ok' ? '#16a34a' : '#dc2626',
          border: `1px solid ${msg.type === 'ok' ? '#86efac' : '#fca5a5'}`,
        }}>
          {msg.type === 'ok' ? <CheckCircle size={15} /> : <AlertCircle size={15} />}
          {msg.text}
        </div>
      )}

      {/* ══ SECTION 1 — Dados da Entidade ══ */}
      <div style={{ border: '1px solid var(--site-border)', borderRadius: 12, marginBottom: 12, overflow: 'hidden' }}>
        <SectionHeader num="1" title="Dados da Entidade" open={openSection === 1} onToggle={() => setOpenSection(openSection === 1 ? 0 : 1)} />
        {openSection === 1 && (
          <div style={{ padding: '4px 24px 24px', borderTop: '1px solid var(--site-border)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16, marginTop: 16 }}>
              {([
                { key: 'razao_social',       label: 'Razão Social',              full: true },
                { key: 'cnpj',               label: 'CNPJ' },
                { key: 'data_abertura_cnpj', label: 'Data de Abertura do CNPJ', type: 'date' },
                { key: 'natureza_juridica',  label: 'Natureza Jurídica' },
                { key: 'responsavel',        label: 'Responsável Legal' },
                { key: 'email_osc',          label: 'E-mail',                   type: 'email' },
                { key: 'telefone',           label: 'Telefone' },
                { key: 'logradouro',         label: 'Logradouro',               full: true },
                { key: 'numero_endereco',    label: 'Número' },
                { key: 'bairro',             label: 'Bairro' },
                { key: 'municipio',          label: 'Município' },
                { key: 'estado',             label: 'Estado (UF)' },
                { key: 'cep',                label: 'CEP' },
              ] as { key: keyof DadosEntidade; label: string; type?: string; full?: boolean }[]).map(({ key, label, type, full }) => (
                <div key={key} style={full ? { gridColumn: '1 / -1' } : {}}>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.05em', color: 'var(--site-text-tertiary)', marginBottom: 6 }}>
                    {label}
                  </label>
                  <input
                    type={type ?? 'text'}
                    value={dados[key]}
                    onChange={e => editable && setDados(prev => ({ ...prev, [key]: e.target.value }))}
                    readOnly={!editable}
                    style={{
                      width: '100%', padding: '9px 12px', borderRadius: 8,
                      border: '1px solid var(--site-border)',
                      background: editable ? '#fff' : 'var(--site-surface-blue)',
                      fontSize: '0.875rem', color: 'var(--site-text-primary)',
                      outline: 'none', boxSizing: 'border-box',
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ══ SECTION 2 — Habilitação Jurídica ══ */}
      <div style={{ border: '1px solid var(--site-border)', borderRadius: 12, marginBottom: 12, overflow: 'hidden' }}>
        <SectionHeader
          num="2" title="Habilitação Jurídica"
          open={openSection === 2} onToggle={() => setOpenSection(openSection === 2 ? 0 : 2)}
          total={sec2.length} done={countChecked(sec2)}
        />
        {openSection === 2 && (
          <div style={{ borderTop: '1px solid var(--site-border)' }}>
            <ChecklistSection items={sec2} onChange={setSec2} onUpload={handleUpload} uploading={uploading} editable={editable} />
          </div>
        )}
      </div>

      {/* ══ SECTION 3 — Regularidade Fiscal, Social e Trabalhista ══ */}
      <div style={{ border: '1px solid var(--site-border)', borderRadius: 12, marginBottom: 12, overflow: 'hidden' }}>
        <SectionHeader
          num="3" title="Regularidade Fiscal, Social e Trabalhista"
          open={openSection === 3} onToggle={() => setOpenSection(openSection === 3 ? 0 : 3)}
          total={sec3.length} done={countChecked(sec3)}
        />
        {openSection === 3 && (
          <div style={{ borderTop: '1px solid var(--site-border)' }}>
            <ChecklistSection items={sec3} onChange={setSec3} onUpload={handleUpload} uploading={uploading} editable={editable} />
          </div>
        )}
      </div>

      {/* ══ SECTION 4 — Qualificação Econômico-financeira ══ */}
      <div style={{ border: '1px solid var(--site-border)', borderRadius: 12, marginBottom: 12, overflow: 'hidden' }}>
        <SectionHeader
          num="4" title="Qualificação Econômico-financeira"
          open={openSection === 4} onToggle={() => setOpenSection(openSection === 4 ? 0 : 4)}
          total={sec4.length} done={countChecked(sec4)}
        />
        {openSection === 4 && (
          <div style={{ borderTop: '1px solid var(--site-border)' }}>
            <ChecklistSection items={sec4} onChange={setSec4} onUpload={handleUpload} uploading={uploading} editable={editable} />
          </div>
        )}
      </div>

      {/* ══ SECTION 5 — Qualificação Técnica ══ */}
      <div style={{ border: '1px solid var(--site-border)', borderRadius: 12, marginBottom: 24, overflow: 'hidden' }}>
        <SectionHeader
          num="5" title="Qualificação Técnica"
          open={openSection === 5} onToggle={() => setOpenSection(openSection === 5 ? 0 : 5)}
          total={sec5.length} done={countChecked(sec5)}
        />
        {openSection === 5 && (
          <div style={{ borderTop: '1px solid var(--site-border)' }}>
            <ChecklistSection items={sec5} onChange={setSec5} onUpload={handleUpload} uploading={uploading} editable={editable} />
          </div>
        )}
      </div>

      {/* ── Action Bar ── */}
      {editable && (
        <div style={{
          display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'flex-end',
          padding: '20px 0', borderTop: '1px solid var(--site-border)',
        }}>
          <button
            onClick={() => handleSave()}
            disabled={saving || submitting}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 7,
              padding: '10px 20px', borderRadius: 10, fontWeight: 600, fontSize: '0.875rem',
              background: '#fff', border: '1px solid var(--site-border)',
              color: 'var(--site-text-primary)', cursor: 'pointer', transition: 'all .15s',
            }}
          >
            {saving ? <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> : <Save size={15} />}
            Salvar Progresso
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving || submitting}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 7,
              padding: '10px 24px', borderRadius: 10, fontWeight: 700, fontSize: '0.875rem',
              background: 'var(--site-primary)', color: '#fff',
              border: 'none', cursor: 'pointer', transition: 'opacity .15s',
              opacity: saving || submitting ? .6 : 1,
            }}
          >
            {submitting ? <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> : <Send size={15} />}
            {relatorio.status === 'reprovado' ? 'Corrigir e Reenviar' : 'Enviar para Análise'}
          </button>
        </div>
      )}
    </div>
  );
}
