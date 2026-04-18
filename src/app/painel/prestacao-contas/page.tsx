'use client';
import { useEffect, useState, useRef } from 'react';
import { Plus, BookOpen, ExternalLink, Trash2, X, AlertCircle, CheckCircle, Upload } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { usePainel } from '../PainelContext';

interface Prestacao {
  id: string;
  titulo: string;
  periodo: string | null;
  valor_total: number | null;
  arquivo_url: string | null;
  status: string;
  observacao: string | null;
  created_at: string;
}

const STATUS_LABELS: Record<string, string> = {
  pendente: 'Pendente', em_analise: 'Em Análise', aprovada: 'Aprovada', rejeitada: 'Rejeitada',
};

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}
function fmtCurrency(v: number | null) {
  if (!v) return '—';
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export default function PrestacaoContasPage() {
  const { user, perfil } = usePainel();
  const [prestacoes, setPrestacoes] = useState<Prestacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [titulo, setTitulo] = useState('');
  const [periodo, setPeriodo] = useState('');
  const [valor, setValor] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const fetchData = async () => {
    if (!perfil) return;
    const { data } = await supabase
      .from('osc_prestacao_contas')
      .select('*')
      .eq('osc_id', perfil.osc_id)
      .order('created_at', { ascending: false });
    setPrestacoes(data ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [perfil]);

  const resetForm = () => {
    setTitulo(''); setPeriodo(''); setValor(''); setFile(null); setError(''); setSuccess('');
  };

  const handleSubmit = async () => {
    if (!perfil || !user) return;
    if (!titulo.trim()) { setError('Informe o título da prestação.'); return; }
    setError(''); setSaving(true);

    try {
      let arquivoUrl: string | null = null;

      if (file) {
        const ext = file.name.split('.').pop() ?? 'bin';
        const path = `osc/${perfil.osc_id}/prestacao-contas/${Date.now()}.${ext}`;
        const { error: upErr } = await supabase.storage.from('documents').upload(path, file, { contentType: file.type });
        if (upErr) throw upErr;
        const { data: { publicUrl } } = supabase.storage.from('documents').getPublicUrl(path);
        arquivoUrl = publicUrl;
      }

      const valorNum = valor
        ? parseFloat(valor.replace(/[^\d,]/g, '').replace(',', '.'))
        : null;

      const { error: insErr } = await supabase.from('osc_prestacao_contas').insert({
        user_id: user.id,
        osc_id: perfil.osc_id,
        titulo: titulo.trim(),
        periodo: periodo.trim() || null,
        valor_total: valorNum && !isNaN(valorNum) ? valorNum : null,
        arquivo_url: arquivoUrl,
        status: 'pendente',
      });
      if (insErr) throw insErr;

      setSuccess('Prestação de contas registrada!');
      await fetchData();
      setTimeout(() => { setShowModal(false); resetForm(); }, 1400);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao enviar. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (p: Prestacao) => {
    if (!confirm(`Excluir "${p.titulo}"?`)) return;
    await supabase.from('osc_prestacao_contas').delete().eq('id', p.id);
    setPrestacoes(prev => prev.filter(x => x.id !== p.id));
  };

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28, gap: 12, flexWrap: 'wrap' }}>
        <div>
          <h1 className="panel-page-title">Prestação de Contas</h1>
          <p className="panel-page-subtitle">Registre e acompanhe demonstrativos financeiros e relatórios de execução.</p>
        </div>
        <button className="panel-btn panel-btn-primary" onClick={() => { resetForm(); setShowModal(true); }}>
          <Plus size={15} /> Nova Prestação
        </button>
      </div>

      <div className="panel-card">
        {loading ? (
          <div className="panel-loading"><div className="panel-spinner" /></div>
        ) : prestacoes.length === 0 ? (
          <div className="panel-empty">
            <div className="panel-empty-icon"><BookOpen size={44} /></div>
            <div className="panel-empty-title">Nenhuma prestação registrada</div>
            <div className="panel-empty-sub">Clique em "Nova Prestação" para registrar o primeiro demonstrativo.</div>
          </div>
        ) : (
          <div className="panel-table-wrap">
            <table className="panel-table">
              <thead>
                <tr>
                  <th>Título</th>
                  <th>Período</th>
                  <th>Valor Total</th>
                  <th>Status</th>
                  <th>Data</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {prestacoes.map(p => (
                  <tr key={p.id}>
                    <td>
                      <div style={{ fontWeight: 500 }}>{p.titulo}</div>
                      {p.observacao && <div style={{ fontSize: 'var(--text-xs)', color: 'var(--site-text-secondary)', marginTop: 2 }}>{p.observacao}</div>}
                    </td>
                    <td style={{ color: 'var(--site-text-secondary)' }}>{p.periodo ?? '—'}</td>
                    <td style={{ color: 'var(--site-text-secondary)' }}>{fmtCurrency(p.valor_total)}</td>
                    <td><span className={`panel-badge ${p.status}`}>{STATUS_LABELS[p.status] ?? p.status}</span></td>
                    <td style={{ color: 'var(--site-text-secondary)' }}>{fmtDate(p.created_at)}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                        {p.arquivo_url && (
                          <a href={p.arquivo_url} target="_blank" rel="noopener noreferrer" className="panel-btn panel-btn-ghost panel-btn-sm">
                            <ExternalLink size={13} />
                          </a>
                        )}
                        <button onClick={() => handleDelete(p)} className="panel-btn panel-btn-danger panel-btn-sm">
                          <Trash2 size={13} />
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

      {/* Modal */}
      {showModal && (
        <div className="panel-modal-overlay" onClick={e => { if (e.target === e.currentTarget) { setShowModal(false); resetForm(); } }}>
          <div className="panel-modal">
            <div className="panel-modal-header">
              <h3 className="panel-modal-title">Nova Prestação de Contas</h3>
              <button className="panel-close-btn" onClick={() => { setShowModal(false); resetForm(); }}><X size={18} /></button>
            </div>

            <div className="panel-modal-body">
              {error   && <div className="panel-alert panel-alert-error"><AlertCircle size={15} /> {error}</div>}
              {success && <div className="panel-alert panel-alert-success"><CheckCircle size={15} /> {success}</div>}

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div className="panel-field">
                  <label className="panel-label">Título <span style={{ color: '#dc2626' }}>*</span></label>
                  <input type="text" className="panel-input" placeholder="Ex: Relatório Financeiro 1º Semestre 2025" value={titulo} onChange={e => setTitulo(e.target.value)} autoFocus />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div className="panel-field">
                    <label className="panel-label">Período</label>
                    <input type="text" className="panel-input" placeholder="Ex: Jan–Jun/2025" value={periodo} onChange={e => setPeriodo(e.target.value)} />
                  </div>
                  <div className="panel-field">
                    <label className="panel-label">Valor Total (R$)</label>
                    <input type="text" className="panel-input" placeholder="0,00" value={valor} onChange={e => setValor(e.target.value)} />
                  </div>
                </div>

                <div className="panel-field">
                  <label className="panel-label">Arquivo <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0, color: 'var(--site-text-secondary)' }}>(opcional)</span></label>
                  <div
                    className={`panel-upload-area ${dragOver ? 'drag-over' : ''}`}
                    style={{ padding: '20px 16px' }}
                    onClick={() => fileRef.current?.click()}
                    onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={e => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) setFile(f); }}
                  >
                    <div className="panel-upload-icon"><Upload size={20} /></div>
                    {file
                      ? <div className="panel-upload-title" style={{ fontSize: 'var(--text-sm)' }}>{file.name}</div>
                      : <div className="panel-upload-sub">PDF, XLS, XLSX — Clique ou arraste</div>
                    }
                    <input ref={fileRef} type="file" style={{ display: 'none' }} accept=".pdf,.xls,.xlsx,.doc,.docx" onChange={e => { const f = e.target.files?.[0]; if (f) setFile(f); }} />
                  </div>
                </div>
              </div>
            </div>

            <div className="panel-modal-footer">
              <button className="panel-btn panel-btn-ghost" onClick={() => { setShowModal(false); resetForm(); }}>Cancelar</button>
              <button className="panel-btn panel-btn-primary" onClick={handleSubmit} disabled={saving}>
                {saving ? 'Enviando...' : 'Registrar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
