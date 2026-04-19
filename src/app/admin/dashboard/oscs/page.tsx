'use client';
import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import {
  Search, Users, Eye,
  CheckCircle, Clock, XCircle, Circle,
  Trash2, RotateCcw, AlertTriangle, Trash,
} from 'lucide-react';

interface OscPerfil {
  id: string;
  osc_id: string;
  responsavel: string | null;
  razao_social: string | null;
  cnpj: string | null;
  municipio: string | null;
  estado: string | null;
  status_selo: string;
  created_at: string;
  deleted_at: string | null;
}

const STATUS_OPTS = [
  { value: '',           label: 'Todas',      icon: Users,       cls: '' },
  { value: 'pendente',   label: 'Pendente',   icon: Circle,      cls: 'pendente' },
  { value: 'em_analise', label: 'Em Análise', icon: Clock,       cls: 'em_analise' },
  { value: 'aprovado',   label: 'Aprovado',   icon: CheckCircle, cls: 'aprovado' },
  { value: 'rejeitado',  label: 'Rejeitado',  icon: XCircle,     cls: 'rejeitado' },
];

const STATUS_LABEL: Record<string, string> = {
  pendente: 'Pendente', em_analise: 'Em Análise', aprovado: 'Aprovado', rejeitado: 'Rejeitado',
};

function fmtDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
    + ' ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

export default function OscsPage() {
  const searchParams = useSearchParams();
  const initialStatus = searchParams.get('status') ?? '';

  const [all, setAll]         = useState<OscPerfil[]>([]);
  const [trash, setTrash]     = useState<OscPerfil[]>([]);
  const [filtered, setFiltered] = useState<OscPerfil[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState(initialStatus);
  const [query, setQuery]     = useState('');
  const [trashView, setTrashView] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [actionLoading, setActionLoading] = useState(false);
  const [confirmEmptyOpen, setConfirmEmptyOpen] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('osc_perfis')
      .select('id, osc_id, responsavel, razao_social, cnpj, municipio, estado, status_selo, created_at, deleted_at')
      .order('created_at', { ascending: false });

    const rows = (data ?? []) as OscPerfil[];
    setAll(rows.filter(o => !o.deleted_at));
    setTrash(rows.filter(o => !!o.deleted_at));
    setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const applyFilters = useCallback(() => {
    if (trashView) { setFiltered(trash); return; }
    let list = all;
    if (statusFilter) list = list.filter(o => o.status_selo === statusFilter);
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(o =>
        o.osc_id.toLowerCase().includes(q) ||
        (o.responsavel ?? '').toLowerCase().includes(q) ||
        (o.razao_social ?? '').toLowerCase().includes(q) ||
        (o.cnpj ?? '').includes(q)
      );
    }
    setFiltered(list);
  }, [all, trash, trashView, statusFilter, query]);

  useEffect(() => { applyFilters(); setSelected(new Set()); }, [applyFilters]);

  const counts = {
    '':           all.length,
    pendente:     all.filter(o => o.status_selo === 'pendente').length,
    em_analise:   all.filter(o => o.status_selo === 'em_analise').length,
    aprovado:     all.filter(o => o.status_selo === 'aprovado').length,
    rejeitado:    all.filter(o => o.status_selo === 'rejeitado').length,
  };

  /* ── Soft delete ── */
  const handleMoveToTrash = async (ids: string[]) => {
    setActionLoading(true);
    await supabase.from('osc_perfis').update({ deleted_at: new Date().toISOString() }).in('id', ids);
    await loadData();
    setSelected(new Set());
    setActionLoading(false);
  };

  /* ── Restaurar ── */
  const handleRestore = async (ids: string[]) => {
    setActionLoading(true);
    await supabase.from('osc_perfis').update({ deleted_at: null }).in('id', ids);
    await loadData();
    setSelected(new Set());
    setActionLoading(false);
  };

  /* ── Excluir permanentemente ── */
  const handlePermanentDelete = async (ids: string[]) => {
    setActionLoading(true);
    await supabase.from('osc_perfis').delete().in('id', ids);
    await loadData();
    setSelected(new Set());
    setActionLoading(false);
  };

  /* ── Esvaziar lixeira ── */
  const handleEmptyTrash = async () => {
    setConfirmEmptyOpen(false);
    setActionLoading(true);
    const ids = trash.map(o => o.id);
    if (ids.length) await supabase.from('osc_perfis').delete().in('id', ids);
    await loadData();
    setActionLoading(false);
  };

  /* ── Seleção ── */
  const toggleSelect = (id: string) => setSelected(prev => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });
  const toggleAll = () => {
    if (selected.size === filtered.length) setSelected(new Set());
    else setSelected(new Set(filtered.map(o => o.id)));
  };
  const allSelected = filtered.length > 0 && selected.size === filtered.length;
  const someSelected = selected.size > 0;

  return (
    <div>
      {/* ── Confirm empty trash modal ── */}
      {confirmEmptyOpen && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: '32px 28px', maxWidth: 380, width: '90%', boxShadow: '0 8px 40px rgba(0,0,0,0.18)', textAlign: 'center' }}>
            <AlertTriangle size={36} style={{ color: '#dc2626', marginBottom: 12 }} />
            <div style={{ fontWeight: 800, fontSize: '1rem', marginBottom: 8 }}>Esvaziar lixeira?</div>
            <div style={{ fontSize: '0.85rem', color: '#555', lineHeight: 1.6, marginBottom: 24 }}>
              Todos os <strong>{trash.length}</strong> registros serão excluídos <strong>permanentemente</strong>.
              Esta ação não pode ser desfeita.
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <button onClick={() => setConfirmEmptyOpen(false)}
                style={{ padding: '9px 20px', border: '1.5px solid #e5e7eb', borderRadius: 8, background: '#fff', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}>
                Cancelar
              </button>
              <button onClick={handleEmptyTrash}
                style={{ padding: '9px 20px', border: 'none', borderRadius: 8, background: '#dc2626', color: '#fff', cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem' }}>
                Esvaziar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Top bar ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
        {!trashView ? (
          <div className="adm-tabs">
            {STATUS_OPTS.map(opt => {
              const Icon = opt.icon;
              const count = counts[opt.value as keyof typeof counts];
              return (
                <button key={opt.value} className={`adm-tab ${statusFilter === opt.value ? 'active' : ''}`}
                  onClick={() => setStatusFilter(opt.value)}>
                  <Icon size={13} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 5 }} />
                  {opt.label}
                  <span style={{ marginLeft: 6, opacity: .65, fontWeight: 500 }}>({count})</span>
                </button>
              );
            })}
          </div>
        ) : (
          <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--admin-text-secondary)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Trash size={15} /> Lixeira
            <span style={{ fontWeight: 500, color: 'var(--admin-text-tertiary)' }}>({trash.length} {trash.length === 1 ? 'item' : 'itens'})</span>
          </div>
        )}

        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          {!trashView && (
            <div className="admin-header-search" style={{ width: 240 }}>
              <Search size={14} className="admin-header-search-icon" />
              <input type="text" placeholder="Buscar OSC, responsável, CNPJ..."
                value={query} onChange={e => setQuery(e.target.value)} />
            </div>
          )}

          {/* Bulk actions */}
          {someSelected && (
            trashView ? (
              <>
                <button
                  onClick={() => handleRestore([...selected])}
                  disabled={actionLoading}
                  className="admin-btn admin-btn-secondary"
                  style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 12px', fontSize: '0.78rem', borderRadius: 8 }}>
                  <RotateCcw size={13} /> Restaurar ({selected.size})
                </button>
                <button
                  onClick={() => handlePermanentDelete([...selected])}
                  disabled={actionLoading}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 12px', fontSize: '0.78rem', borderRadius: 8, border: 'none', background: '#dc2626', color: '#fff', cursor: 'pointer', fontWeight: 700 }}>
                  <Trash2 size={13} /> Excluir ({selected.size})
                </button>
              </>
            ) : (
              <button
                onClick={() => handleMoveToTrash([...selected])}
                disabled={actionLoading}
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 12px', fontSize: '0.78rem', borderRadius: 8, border: 'none', background: '#dc2626', color: '#fff', cursor: 'pointer', fontWeight: 700 }}>
                <Trash2 size={13} /> Mover para lixeira ({selected.size})
              </button>
            )
          )}

          {/* Lixeira toggle */}
          <button
            onClick={() => { setTrashView(v => !v); setStatusFilter(''); setQuery(''); }}
            className="admin-btn admin-btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 12px', fontSize: '0.78rem', borderRadius: 8, position: 'relative' }}>
            <Trash size={13} />
            {trashView ? 'Voltar' : 'Lixeira'}
            {!trashView && trash.length > 0 && (
              <span style={{ position: 'absolute', top: -6, right: -6, background: '#dc2626', color: '#fff', borderRadius: '50%', width: 16, height: 16, fontSize: '0.6rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {trash.length > 99 ? '99+' : trash.length}
              </span>
            )}
          </button>

          {/* Esvaziar lixeira */}
          {trashView && trash.length > 0 && (
            <button
              onClick={() => setConfirmEmptyOpen(true)}
              disabled={actionLoading}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 12px', fontSize: '0.78rem', borderRadius: 8, border: '1.5px solid #dc2626', background: 'rgba(220,38,38,0.06)', color: '#dc2626', cursor: 'pointer', fontWeight: 700 }}>
              <Trash2 size={13} /> Esvaziar lixeira
            </button>
          )}
        </div>
      </div>

      {/* ── Table ── */}
      <div className="glass-card">
        {loading ? (
          <div style={{ padding: '48px 0', display: 'flex', justifyContent: 'center' }}>
            <div style={{ width: 32, height: 32, border: '3px solid var(--admin-border)', borderTopColor: 'var(--admin-primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="admin-empty-state">
            <div className="admin-empty-state-icon">{trashView ? <Trash size={28} /> : <Users size={28} />}</div>
            <div className="admin-empty-state-text">
              {trashView ? 'Lixeira vazia.' : query || statusFilter ? 'Nenhuma OSC encontrada com esses filtros.' : 'Nenhuma OSC cadastrada ainda.'}
            </div>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th style={{ width: 36 }}>
                    <input type="checkbox" checked={allSelected} onChange={toggleAll}
                      style={{ cursor: 'pointer', accentColor: 'var(--admin-primary)' }} />
                  </th>
                  <th>ID OSC</th>
                  <th>Responsável / Organização</th>
                  <th>CNPJ</th>
                  <th>Localidade</th>
                  <th>Status</th>
                  <th>{trashView ? 'Excluído em' : 'Cadastro'}</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(osc => (
                  <tr key={osc.id} style={{ opacity: actionLoading && selected.has(osc.id) ? 0.5 : 1 }}>
                    <td>
                      <input type="checkbox" checked={selected.has(osc.id)} onChange={() => toggleSelect(osc.id)}
                        style={{ cursor: 'pointer', accentColor: 'var(--admin-primary)' }} />
                    </td>
                    <td>
                      <span style={{ fontFamily: 'monospace', fontSize: '0.8rem', background: 'var(--admin-primary-subtle)', color: 'var(--admin-primary)', padding: '3px 8px', borderRadius: 6, fontWeight: 700 }}>
                        {osc.osc_id}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--admin-text-primary)', fontSize: '0.875rem' }}>
                        {osc.responsavel ?? '—'}
                      </div>
                      {osc.razao_social && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-tertiary)', marginTop: 2 }}>{osc.razao_social}</div>
                      )}
                    </td>
                    <td>
                      <span style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--admin-text-secondary)' }}>
                        {osc.cnpj ?? '—'}
                      </span>
                    </td>
                    <td style={{ color: 'var(--admin-text-secondary)', fontSize: '0.82rem' }}>
                      {[osc.municipio, osc.estado].filter(Boolean).join('/') || '—'}
                    </td>
                    <td>
                      <span className={`adm-badge ${osc.status_selo}`}>
                        {STATUS_LABEL[osc.status_selo] ?? osc.status_selo}
                      </span>
                    </td>
                    <td style={{ color: 'var(--admin-text-secondary)', fontSize: '0.82rem' }}>
                      {trashView ? fmtDate(osc.deleted_at!) : fmtDate(osc.created_at)}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                        {trashView ? (
                          <>
                            <button
                              onClick={() => handleRestore([osc.id])}
                              disabled={actionLoading}
                              title="Restaurar"
                              className="admin-btn admin-btn-secondary"
                              style={{ padding: '5px 10px', fontSize: '0.75rem', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
                              <RotateCcw size={12} />
                            </button>
                            <button
                              onClick={() => handlePermanentDelete([osc.id])}
                              disabled={actionLoading}
                              title="Excluir permanentemente"
                              style={{ padding: '5px 10px', border: 'none', borderRadius: 8, background: 'rgba(220,38,38,0.09)', color: '#dc2626', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                              <Trash2 size={12} />
                            </button>
                          </>
                        ) : (
                          <>
                            <Link
                              href={`/admin/dashboard/oscs/${osc.id}`}
                              className="admin-btn admin-btn-secondary"
                              style={{ padding: '7px 14px', fontSize: '0.78rem', borderRadius: 8, display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                              <Eye size={13} /> Analisar
                            </Link>
                            <button
                              onClick={() => handleMoveToTrash([osc.id])}
                              disabled={actionLoading}
                              title="Mover para lixeira"
                              style={{ padding: '7px 9px', border: 'none', borderRadius: 8, background: 'rgba(220,38,38,0.08)', color: '#dc2626', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                              <Trash2 size={14} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
