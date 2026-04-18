'use client';
import { useEffect, useState, useRef } from 'react';
import { Upload, FileText, Trash2, ExternalLink, X, AlertCircle, CheckCircle, Plus } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { usePainel } from '../PainelContext';

interface Documento {
  id: string;
  nome: string;
  tipo: string;
  arquivo_url: string | null;
  tamanho_bytes: number | null;
  status: string;
  observacao: string | null;
  created_at: string;
}

const TIPOS = [
  { value: 'estatuto',   label: 'Estatuto Social' },
  { value: 'ata',        label: 'Ata de Eleição da Diretoria' },
  { value: 'cnpj',       label: 'Comprovante CNPJ' },
  { value: 'balancete',  label: 'Balancete / Demonstrativo Financeiro' },
  { value: 'certidao',   label: 'Certidão Negativa de Débitos' },
  { value: 'declaracao', label: 'Declaração de Regularidade' },
  { value: 'outro',      label: 'Outro' },
];

const STATUS_LABELS: Record<string, string> = {
  enviado: 'Enviado', aprovado: 'Aprovado', rejeitado: 'Rejeitado', pendente: 'Pendente',
};

function fmtBytes(b: number | null): string {
  if (!b) return '—';
  if (b < 1024) return `${b} B`;
  if (b < 1048576) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / 1048576).toFixed(1)} MB`;
}
function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export default function DocumentosPage() {
  const { user, perfil } = usePainel();
  const [docs, setDocs] = useState<Documento[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [nome, setNome] = useState('');
  const [tipo, setTipo] = useState('estatuto');
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const fetchDocs = async () => {
    if (!perfil) return;
    const { data } = await supabase
      .from('osc_documentos')
      .select('*')
      .eq('osc_id', perfil.osc_id)
      .order('created_at', { ascending: false });
    setDocs(data ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchDocs(); }, [perfil]);

  const resetModal = () => {
    setNome(''); setTipo('estatuto'); setFile(null); setError(''); setSuccess('');
  };

  const handleFileSelect = (f: File) => {
    setFile(f);
    if (!nome) setNome(f.name.replace(/\.[^/.]+$/, ''));
  };

  const handleUpload = async () => {
    if (!perfil || !user) return;
    if (!file) { setError('Selecione um arquivo.'); return; }
    setError(''); setUploading(true);

    try {
      const ext = file.name.split('.').pop() ?? 'bin';
      const path = `osc/${perfil.osc_id}/${tipo}/${Date.now()}.${ext}`;

      const { error: upErr } = await supabase.storage
        .from('documents')
        .upload(path, file, { contentType: file.type });
      if (upErr) throw upErr;

      const { data: { publicUrl } } = supabase.storage.from('documents').getPublicUrl(path);

      const { error: insErr } = await supabase.from('osc_documentos').insert({
        user_id: user.id,
        osc_id: perfil.osc_id,
        nome: nome.trim() || file.name,
        tipo,
        arquivo_url: publicUrl,
        tamanho_bytes: file.size,
        status: 'enviado',
      });
      if (insErr) throw insErr;

      setSuccess('Documento enviado com sucesso!');
      await fetchDocs();
      setTimeout(() => { setShowModal(false); resetModal(); }, 1400);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao enviar documento.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (doc: Documento) => {
    if (!confirm(`Excluir "${doc.nome}"?`)) return;
    await supabase.from('osc_documentos').delete().eq('id', doc.id);
    setDocs(prev => prev.filter(d => d.id !== doc.id));
  };

  const tipoLabel = (v: string) => TIPOS.find(t => t.value === v)?.label ?? v;

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28, gap: 12, flexWrap: 'wrap' }}>
        <div>
          <h1 className="panel-page-title">Documentos</h1>
          <p className="panel-page-subtitle">Envie e gerencie os documentos necessários para a certificação Selo OSC.</p>
        </div>
        <button className="panel-btn panel-btn-primary" onClick={() => { resetModal(); setShowModal(true); }}>
          <Plus size={15} /> Enviar Documento
        </button>
      </div>

      <div className="panel-card">
        {loading ? (
          <div className="panel-loading"><div className="panel-spinner" /></div>
        ) : docs.length === 0 ? (
          <div className="panel-empty">
            <div className="panel-empty-icon"><FileText size={44} /></div>
            <div className="panel-empty-title">Nenhum documento enviado</div>
            <div className="panel-empty-sub">Clique em "Enviar Documento" para começar o processo.</div>
          </div>
        ) : (
          <div className="panel-table-wrap">
            <table className="panel-table">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Tipo</th>
                  <th>Tamanho</th>
                  <th>Status</th>
                  <th>Data</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {docs.map(doc => (
                  <tr key={doc.id}>
                    <td>
                      <div style={{ fontWeight: 500 }}>{doc.nome}</div>
                      {doc.observacao && (
                        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--site-text-secondary)', marginTop: 2 }}>{doc.observacao}</div>
                      )}
                    </td>
                    <td style={{ color: 'var(--site-text-secondary)' }}>{tipoLabel(doc.tipo)}</td>
                    <td style={{ color: 'var(--site-text-secondary)' }}>{fmtBytes(doc.tamanho_bytes)}</td>
                    <td><span className={`panel-badge ${doc.status}`}>{STATUS_LABELS[doc.status] ?? doc.status}</span></td>
                    <td style={{ color: 'var(--site-text-secondary)' }}>{fmtDate(doc.created_at)}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                        {doc.arquivo_url && (
                          <a href={doc.arquivo_url} target="_blank" rel="noopener noreferrer" className="panel-btn panel-btn-ghost panel-btn-sm" title="Abrir arquivo">
                            <ExternalLink size={13} />
                          </a>
                        )}
                        <button onClick={() => handleDelete(doc)} className="panel-btn panel-btn-danger panel-btn-sm" title="Excluir">
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
        <div className="panel-modal-overlay" onClick={e => { if (e.target === e.currentTarget) { setShowModal(false); resetModal(); } }}>
          <div className="panel-modal">
            <div className="panel-modal-header">
              <h3 className="panel-modal-title">Enviar Documento</h3>
              <button className="panel-close-btn" onClick={() => { setShowModal(false); resetModal(); }}><X size={18} /></button>
            </div>

            <div className="panel-modal-body">
              {error   && <div className="panel-alert panel-alert-error"><AlertCircle size={15} /> {error}</div>}
              {success && <div className="panel-alert panel-alert-success"><CheckCircle size={15} /> {success}</div>}

              {/* Drop zone */}
              <div
                className={`panel-upload-area ${dragOver ? 'drag-over' : ''}`}
                style={{ marginBottom: 18 }}
                onClick={() => fileRef.current?.click()}
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={e => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) handleFileSelect(f); }}
              >
                <div className="panel-upload-icon"><Upload size={26} /></div>
                {file ? (
                  <>
                    <div className="panel-upload-title">{file.name}</div>
                    <div className="panel-upload-sub">{fmtBytes(file.size)} — Clique para trocar</div>
                  </>
                ) : (
                  <>
                    <div className="panel-upload-title">Arraste ou clique para selecionar</div>
                    <div className="panel-upload-sub">PDF, DOC, DOCX, JPG, PNG — Máx. 10 MB</div>
                  </>
                )}
                <input
                  ref={fileRef} type="file" style={{ display: 'none' }}
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  onChange={e => { const f = e.target.files?.[0]; if (f) handleFileSelect(f); }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div className="panel-field">
                  <label className="panel-label">Tipo de Documento</label>
                  <select className="panel-select" value={tipo} onChange={e => setTipo(e.target.value)}>
                    {TIPOS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
                <div className="panel-field">
                  <label className="panel-label">Nome de identificação <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0, color: 'var(--site-text-secondary)' }}>(opcional)</span></label>
                  <input type="text" className="panel-input" placeholder="Ex: Estatuto 2024" value={nome} onChange={e => setNome(e.target.value)} />
                </div>
              </div>
            </div>

            <div className="panel-modal-footer">
              <button className="panel-btn panel-btn-ghost" onClick={() => { setShowModal(false); resetModal(); }}>Cancelar</button>
              <button className="panel-btn panel-btn-primary" onClick={handleUpload} disabled={uploading || !file}>
                {uploading ? 'Enviando...' : <><Upload size={14} /> Enviar</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
