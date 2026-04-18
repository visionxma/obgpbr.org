'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import {
  ArrowLeft, CheckCircle, XCircle, Clock, ExternalLink,
  FileText, BookOpen, ClipboardList, AlertCircle, Save,
  User, Building2, Phone, MapPin, Hash,
} from 'lucide-react';

/* ── Types ──────────────────────────────────────── */
interface OscPerfil {
  id: string; user_id: string; osc_id: string;
  razao_social: string | null; cnpj: string | null;
  responsavel: string | null; telefone: string | null;
  municipio: string | null; estado: string | null;
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
  valor_total: number | null; status: string; created_at: string;
}
interface Formulario {
  id: string; titulo: string; tipo: string; status: string; updated_at: string;
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

/* ── Component ──────────────────────────────────── */
export default function OscDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [perfil, setPerfil] = useState<OscPerfil | null>(null);
  const [docs, setDocs] = useState<Documento[]>([]);
  const [prestacoes, setPrestacoes] = useState<Prestacao[]>([]);
  const [formularios, setFormularios] = useState<Formulario[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // Status edit state
  const [newStatus, setNewStatus] = useState('');
  const [observacao, setObservacao] = useState('');
  const [savingStatus, setSavingStatus] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  // Per-doc review
  const [docObs, setDocObs] = useState<Record<string, string>>({});
  const [docSaving, setDocSaving] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const { data: p, error } = await supabase
        .from('osc_perfis').select('*').eq('id', id).single();

      if (error || !p) { setNotFound(true); setLoading(false); return; }

      const pf = p as OscPerfil;
      setPerfil(pf);
      setNewStatus(pf.status_selo);
      setObservacao(pf.observacao_selo ?? '');

      const [docsRes, prestRes, formRes] = await Promise.all([
        supabase.from('osc_documentos').select('*').eq('osc_id', pf.osc_id).order('created_at', { ascending: false }),
        supabase.from('osc_prestacao_contas').select('id, titulo, periodo, valor_total, status, created_at').eq('osc_id', pf.osc_id).order('created_at', { ascending: false }),
        supabase.from('osc_formularios').select('id, titulo, tipo, status, updated_at').eq('osc_id', pf.osc_id),
      ]);

      setDocs((docsRes.data ?? []) as Documento[]);
      setPrestacoes((prestRes.data ?? []) as Prestacao[]);
      setFormularios((formRes.data ?? []) as Formulario[]);
      setLoading(false);
    };
    load();
  }, [id]);

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

  const handleDocAction = async (docId: string, status: 'aprovado' | 'rejeitado') => {
    setDocSaving(docId);
    const obs = docObs[docId]?.trim() || null;
    const { error } = await supabase.from('osc_documentos').update({ status, observacao: obs }).eq('id', docId);
    if (!error) setDocs(prev => prev.map(d => d.id === docId ? { ...d, status, observacao: obs } : d));
    setDocSaving(null);
  };

  /* ── Render ── */
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

  const [statusMsgType, statusMsgText] = statusMsg.startsWith('error:')
    ? ['error', statusMsg.slice(6)]
    : statusMsg.startsWith('ok:')
    ? ['ok', statusMsg.slice(3)]
    : ['', ''];

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

        {/* Profile info */}
        <div className="glass-card">
          <div className="glass-card-header">
            <span className="glass-card-title">
              <span className="glass-card-title-icon"><User size={15} /></span>
              Dados da OSC
            </span>
          </div>
          <div className="glass-card-body">
            {[
              { icon: Hash,      label: 'ID OSC',       value: perfil.osc_id },
              { icon: User,      label: 'Responsável',  value: perfil.responsavel },
              { icon: Building2, label: 'Organização',  value: perfil.razao_social },
              { icon: FileText,  label: 'CNPJ',         value: perfil.cnpj },
              { icon: Phone,     label: 'Telefone',     value: perfil.telefone },
              { icon: MapPin,    label: 'Localidade',   value: [perfil.municipio, perfil.estado].filter(Boolean).join(' / ') || null },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} style={{ display: 'flex', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--admin-border)' }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--admin-primary-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--admin-primary)', flexShrink: 0 }}>
                  <Icon size={14} />
                </div>
                <div>
                  <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--admin-text-tertiary)', marginBottom: 2 }}>{label}</div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 500, color: value ? 'var(--admin-text-primary)' : 'var(--admin-text-tertiary)' }}>
                    {value ?? 'Não informado'}
                  </div>
                </div>
              </div>
            ))}
            <div style={{ paddingTop: 10 }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--admin-text-tertiary)', marginBottom: 4 }}>Cadastro</div>
              <div style={{ fontSize: '0.82rem', color: 'var(--admin-text-secondary)' }}>{fmtDate(perfil.created_at)}</div>
            </div>
          </div>
        </div>

        {/* Status management */}
        <div className="glass-card">
          <div className="glass-card-header">
            <span className="glass-card-title">
              <span className="glass-card-title-icon"><CheckCircle size={15} /></span>
              Gestão do Selo OSC
            </span>
          </div>
          <div className="glass-card-body">
            {statusMsgText && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px',
                borderRadius: 8, marginBottom: 16, fontSize: '0.82rem', fontWeight: 500,
                background: statusMsgType === 'ok' ? 'var(--admin-success-bg)' : 'var(--admin-danger-bg)',
                color: statusMsgType === 'ok' ? 'var(--admin-success)' : 'var(--admin-danger)',
                border: `1px solid ${statusMsgType === 'ok' ? 'rgba(38,102,47,.2)' : 'rgba(220,38,38,.2)'}`,
              }}>
                {statusMsgType === 'ok' ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
                {statusMsgText}
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label className="admin-form-label">Status do Processo</label>
                <select
                  className="admin-input"
                  value={newStatus}
                  onChange={e => setNewStatus(e.target.value)}
                >
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
                  className="admin-input"
                  rows={3}
                  placeholder={newStatus === 'rejeitado' ? 'Informe o motivo da reprovação...' : 'Observação para o usuário (opcional)...'}
                  value={observacao}
                  onChange={e => setObservacao(e.target.value)}
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
                onClick={handleSaveStatus}
                disabled={savingStatus}
              >
                {savingStatus ? '...' : <><Save size={14} /> Salvar Decisão</>}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Documents section */}
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
                    <th>Nome</th>
                    <th>Tipo</th>
                    <th>Tamanho</th>
                    <th>Status</th>
                    <th>Data</th>
                    <th>Observação</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {docs.map(doc => (
                    <tr key={doc.id}>
                      <td>
                        <div className="cell-primary">{doc.nome}</div>
                      </td>
                      <td style={{ color: 'var(--admin-text-secondary)', fontSize: '0.8rem' }}>{TIPO_LABELS[doc.tipo] ?? doc.tipo}</td>
                      <td style={{ color: 'var(--admin-text-tertiary)', fontSize: '0.8rem' }}>{fmtBytes(doc.tamanho_bytes)}</td>
                      <td><span className={`adm-badge ${doc.status}`}>{DOC_STATUS_LABELS[doc.status] ?? doc.status}</span></td>
                      <td style={{ color: 'var(--admin-text-tertiary)', fontSize: '0.8rem' }}>{fmtDate(doc.created_at)}</td>
                      <td style={{ minWidth: 180 }}>
                        <input
                          type="text"
                          className="admin-input"
                          style={{ padding: '6px 10px', fontSize: '0.78rem' }}
                          placeholder="Observação..."
                          value={docObs[doc.id] ?? (doc.observacao ?? '')}
                          onChange={e => setDocObs(prev => ({ ...prev, [doc.id]: e.target.value }))}
                        />
                      </td>
                      <td>
                        <div className="cell-action">
                          {doc.arquivo_url && (
                            <a href={doc.arquivo_url} target="_blank" rel="noopener noreferrer"
                              className="admin-btn-icon admin-btn"
                              style={{ border: '1px solid var(--admin-border)', borderRadius: 8 }}
                              title="Visualizar"
                            >
                              <ExternalLink size={14} />
                            </a>
                          )}
                          <button
                            className="adm-btn-approve"
                            style={{ padding: '5px 10px', fontSize: '0.75rem' }}
                            onClick={() => handleDocAction(doc.id, 'aprovado')}
                            disabled={docSaving === doc.id || doc.status === 'aprovado'}
                          >
                            {docSaving === doc.id ? '...' : <CheckCircle size={12} />}
                          </button>
                          <button
                            className="adm-btn-reject"
                            style={{ padding: '5px 10px', fontSize: '0.75rem' }}
                            onClick={() => handleDocAction(doc.id, 'rejeitado')}
                            disabled={docSaving === doc.id || doc.status === 'rejeitado'}
                          >
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

      {/* Bottom grid: prestações + formulários */}
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
          <div className="glass-card-body" style={{ padding: '8px 28px 24px' }}>
            {prestacoes.length === 0 ? (
              <div className="admin-empty-state" style={{ padding: '28px 0' }}>
                <div className="admin-empty-state-icon"><BookOpen size={20} /></div>
                <div className="admin-empty-state-text" style={{ fontSize: '0.82rem' }}>Nenhuma prestação registrada</div>
              </div>
            ) : (
              <div className="activity-feed">
                {prestacoes.map(p => (
                  <div key={p.id} className="activity-item">
                    <div className={`activity-dot ${p.status === 'aprovada' ? 'success' : p.status === 'pendente' ? 'warning' : 'primary'}`} />
                    <div className="activity-content">
                      <div className="activity-title">{p.titulo}</div>
                      <div className="activity-meta">
                        {p.periodo && `${p.periodo} · `}
                        {fmtCurrency(p.valor_total)} · {fmtDate(p.created_at)}
                      </div>
                    </div>
                    <span className={`adm-badge ${p.status}`}>{p.status === 'aprovada' ? 'Aprovada' : p.status === 'pendente' ? 'Pendente' : p.status === 'em_analise' ? 'Em Análise' : 'Rejeitada'}</span>
                  </div>
                ))}
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

      <style>{`@keyframes spin{100%{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
