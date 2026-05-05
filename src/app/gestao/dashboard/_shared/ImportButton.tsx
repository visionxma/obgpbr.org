'use client';

import { useRef, useState } from 'react';
import { Upload, Loader2, FileWarning } from 'lucide-react';

interface Props {
  /** Tipo de conteúdo: blog, experiencia, transparencia, certificacao, legislacao */
  tipo: 'blog' | 'experiencia' | 'transparencia' | 'certificacao' | 'legislacao';
  /** Callback quando os dados são extraídos com sucesso */
  onParsed: (dados: Record<string, unknown>) => void;
  /** Texto exibido no botão */
  label?: string;
}

export default function ImportButton({ tipo, onParsed, label = 'Importar de PDF/DOCX' }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';

    if (file.size > 10 * 1024 * 1024) {
      setError('Arquivo maior que 10 MB.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('tipo', tipo);
      const res = await fetch('/api/content/import', { method: 'POST', body: fd });
      const text = await res.text();
      let json: { dados?: Record<string, unknown>; error?: string };
      try { json = JSON.parse(text); }
      catch { throw new Error(res.status === 413 ? 'Arquivo muito grande (limite 10 MB).' : 'Resposta inválida do servidor.'); }
      if (!res.ok) throw new Error(json.error || 'Erro ao processar.');
      if (!json.dados) throw new Error('Nenhum dado extraído.');
      onParsed(json.dados);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro ao importar.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={loading}
        className="admin-btn"
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          padding: '8px 16px', borderRadius: 8,
          background: 'var(--admin-surface)', border: '1px solid var(--admin-border)',
          color: 'var(--admin-text-primary)', fontSize: '0.82rem', fontWeight: 700,
          cursor: loading ? 'wait' : 'pointer',
        }}
        title="Extrair informações de um arquivo PDF ou DOCX"
      >
        {loading ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Upload size={14} />}
        {loading ? 'Processando…' : label}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.docx"
        style={{ display: 'none' }}
        onChange={handleFile}
      />
      {error && (
        <div style={{
          marginTop: 8, padding: '8px 12px', borderRadius: 8,
          background: 'var(--admin-danger-bg)', color: 'var(--admin-danger)',
          fontSize: '0.78rem', fontWeight: 600,
          display: 'flex', alignItems: 'center', gap: 6,
        }}>
          <FileWarning size={14} /> {error}
        </div>
      )}
    </>
  );
}
