'use client';

/**
 * SimpleListManager — gerencia listas simples (Certificações, Áreas, Stats, Legislação)
 * Mostra os itens com edição inline, ordenação, criação e remoção.
 */

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import {
  Plus, Trash2, ChevronUp, ChevronDown, Save, Loader2, Eye, EyeOff,
} from 'lucide-react';
import type { Notice } from './AdminUI';

export interface FieldDef {
  key: string;
  label: string;
  type?: 'text' | 'textarea' | 'url' | 'boolean' | 'number';
  placeholder?: string;
  required?: boolean;
  hint?: string;
}

interface Props {
  table: string;
  title: string;
  description?: string;
  fields: FieldDef[];
  setNotice: (n: Notice) => void;
  /** se for true, mostra um toggle de publicado ao lado de cada item */
  publishable?: boolean;
}

interface Row {
  id: string;
  ordem: number;
  is_published: boolean;
  [key: string]: unknown;
}

export default function SimpleListManager({
  table, title, description, fields, setNotice, publishable = true,
}: Props) {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  useEffect(() => { fetchRows(); /* eslint-disable-next-line */ }, []);

  async function fetchRows() {
    setLoading(true);
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .order('ordem', { ascending: true });
    if (error) {
      setNotice({ type: 'error', message: 'Erro: ' + error.message });
    } else {
      setRows((data as Row[]) || []);
    }
    setLoading(false);
  }

  async function handleAdd() {
    setCreating(true);
    const empty: Record<string, unknown> = { ordem: rows.length + 1, is_published: true };
    for (const f of fields) {
      if (f.type === 'boolean') empty[f.key] = false;
      else if (f.type === 'number') empty[f.key] = 0;
      else empty[f.key] = '';
    }
    // Marca campos required com placeholder mínimo
    for (const f of fields) {
      if (f.required && !empty[f.key]) empty[f.key] = 'Novo item';
    }
    const { data, error } = await supabase.from(table).insert(empty).select().single();
    setCreating(false);
    if (error) {
      setNotice({ type: 'error', message: 'Erro ao criar: ' + error.message });
      return;
    }
    setRows(r => [...r, data as Row]);
    setNotice({ type: 'success', message: 'Item adicionado.' });
  }

  async function handleSave(row: Row) {
    setSavingId(row.id);
    const { id, ...rest } = row;
    const { error } = await supabase.from(table).update(rest).eq('id', id);
    setSavingId(null);
    if (error) {
      setNotice({ type: 'error', message: 'Erro ao salvar: ' + error.message });
      return;
    }
    setNotice({ type: 'success', message: 'Salvo!' });
  }

  async function handleDelete(id: string) {
    if (!confirm('Excluir este item?')) return;
    const { error } = await supabase.from(table).delete().eq('id', id);
    if (error) {
      setNotice({ type: 'error', message: 'Erro ao excluir: ' + error.message });
      return;
    }
    setRows(r => r.filter(x => x.id !== id));
    setNotice({ type: 'success', message: 'Removido.' });
  }

  async function handleMove(idx: number, dir: -1 | 1) {
    const target = idx + dir;
    if (target < 0 || target >= rows.length) return;
    const a = rows[idx];
    const b = rows[target];
    const swapped = [...rows];
    swapped[idx] = { ...b, ordem: a.ordem };
    swapped[target] = { ...a, ordem: b.ordem };
    setRows(swapped);
    await Promise.all([
      supabase.from(table).update({ ordem: a.ordem }).eq('id', b.id),
      supabase.from(table).update({ ordem: b.ordem }).eq('id', a.id),
    ]);
  }

  function setRowField(id: string, key: string, val: unknown) {
    setRows(r => r.map(x => x.id === id ? { ...x, [key]: val } : x));
  }

  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 14 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: 'var(--admin-text-primary)' }}>{title}</h2>
          {description && <p style={{ margin: '4px 0 0', fontSize: '0.78rem', color: 'var(--admin-text-tertiary)' }}>{description}</p>}
        </div>
        <button
          onClick={handleAdd}
          disabled={creating}
          className="admin-btn admin-btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 8, fontSize: '0.82rem' }}
        >
          {creating ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Plus size={14} />}
          Adicionar
        </button>
      </div>

      {loading ? (
        <div style={{ padding: 32, textAlign: 'center', color: 'var(--admin-text-tertiary)' }}>
          <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} />
        </div>
      ) : rows.length === 0 ? (
        <div style={{ padding: 24, textAlign: 'center', color: 'var(--admin-text-tertiary)', background: 'var(--admin-surface)', borderRadius: 'var(--admin-radius-md)', border: '1px dashed var(--admin-border)', fontSize: '0.82rem' }}>
          Nenhum item ainda. Clique em &quot;Adicionar&quot;.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {rows.map((row, idx) => (
            <div
              key={row.id}
              style={{
                background: 'var(--admin-card)',
                border: '1px solid var(--admin-border)',
                borderRadius: 'var(--admin-radius-md)',
                padding: 14,
                opacity: row.is_published ? 1 : 0.65,
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {fields.map(f => (
                  <div key={f.key} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <label style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--admin-text-tertiary)' }}>
                      {f.label}{f.required && ' *'}
                    </label>
                    {f.type === 'textarea' ? (
                      <textarea
                        value={String(row[f.key] ?? '')}
                        onChange={e => setRowField(row.id, f.key, e.target.value)}
                        placeholder={f.placeholder}
                        rows={2}
                        style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid var(--admin-border)', fontSize: '0.85rem', fontFamily: 'inherit', resize: 'vertical' }}
                      />
                    ) : f.type === 'boolean' ? (
                      <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: '0.82rem' }}>
                        <input
                          type="checkbox"
                          checked={Boolean(row[f.key])}
                          onChange={e => setRowField(row.id, f.key, e.target.checked)}
                        />
                        {f.placeholder || 'Ativar'}
                      </label>
                    ) : (
                      <input
                        type={f.type === 'url' ? 'url' : f.type === 'number' ? 'number' : 'text'}
                        value={String(row[f.key] ?? '')}
                        onChange={e => setRowField(row.id, f.key, f.type === 'number' ? Number(e.target.value) : e.target.value)}
                        placeholder={f.placeholder}
                        style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid var(--admin-border)', fontSize: '0.85rem' }}
                      />
                    )}
                    {f.hint && <span style={{ fontSize: '0.7rem', color: 'var(--admin-text-tertiary)' }}>{f.hint}</span>}
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--admin-border)' }}>
                <div style={{ display: 'flex', gap: 4 }}>
                  <button onClick={() => handleMove(idx, -1)} disabled={idx === 0} className="admin-btn admin-btn-icon" style={{ padding: 6 }} title="Subir">
                    <ChevronUp size={14} />
                  </button>
                  <button onClick={() => handleMove(idx, 1)} disabled={idx === rows.length - 1} className="admin-btn admin-btn-icon" style={{ padding: 6 }} title="Descer">
                    <ChevronDown size={14} />
                  </button>
                  {publishable && (
                    <button
                      onClick={() => { setRowField(row.id, 'is_published', !row.is_published); handleSave({ ...row, is_published: !row.is_published }); }}
                      className="admin-btn admin-btn-icon"
                      style={{ padding: 6, color: row.is_published ? 'var(--admin-success)' : 'var(--admin-text-tertiary)' }}
                      title={row.is_published ? 'Publicado — clique para ocultar' : 'Oculto — clique para publicar'}
                    >
                      {row.is_published ? <Eye size={14} /> : <EyeOff size={14} />}
                    </button>
                  )}
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button
                    onClick={() => handleSave(row)}
                    disabled={savingId === row.id}
                    className="admin-btn admin-btn-primary"
                    style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 7, fontSize: '0.78rem' }}
                  >
                    {savingId === row.id ? <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} /> : <Save size={13} />}
                    Salvar
                  </button>
                  <button
                    onClick={() => handleDelete(row.id)}
                    className="admin-btn admin-btn-icon"
                    style={{ padding: 6, color: 'var(--admin-danger)' }}
                    title="Excluir"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
