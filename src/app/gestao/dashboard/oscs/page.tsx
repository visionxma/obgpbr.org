'use client';
import { useEffect, useState, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import {
  Search, Users, Eye,
  CheckCircle, Clock, XCircle, Circle,
  Trash2, RotateCcw, AlertTriangle, Trash, ArrowLeft,
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

function OscsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialStatus = searchParams.get('status') ?? '';
  const [all, setAll]         = useState<OscPerfil[]>([]);
  const [trashCount, setTrashCount] = useState(0);
  const [filtered, setFiltered] = useState<OscPerfil[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState(initialStatus);
  const [query, setQuery]     = useState('');

  useEffect(() => {
    setStatusFilter(searchParams.get('status') ?? '');
    setQuery('');
  }, [searchParams]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [actionLoading, setActionLoading] = useState(false);
  const [confirmEmptyOpen, setConfirmEmptyOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);

    const [perfisRes, relRes] = await Promise.all([
      supabase
        .from('osc_perfis')
        .select('id, osc_id, responsavel, razao_social, cnpj, municipio, estado, status_selo, created_at, deleted_at')
        .order('created_at', { ascending: false }),
      supabase
        .from('relatorios_conformidade')
        .select('osc_id, status, dados_entidade, submitted_at')
        .not('submitted_at', 'is', null),
    ]);

    const perfis = (perfisRes.data ?? []) as OscPerfil[];
    const relatorios = (relRes.data ?? []) as {
      osc_id: string; status: string; submitted_at: string;
      dados_entidade: Record<string, string> | null;
    }[];

    // Sincroniza automaticamente: qualquer OSC com relatório submetido mas
    // ainda marcada como 'pendente' em osc_perfis é corrigida no banco e na UI
    const syncPromises: Promise<any>[] = [];
    for (const rel of relatorios) {
      const perfil = perfis.find(p => p.osc_id === rel.osc_id);
      if (!perfil) continue;

      const relStatus = rel.status === 'em_analise' || rel.status === 'aprovado' || rel.status === 'rejeitado'
        ? rel.status : 'em_analise';

      const needsSync =
        perfil.status_selo === 'pendente' ||
        (!perfil.razao_social && rel.dados_entidade?.razao_social) ||
        (!perfil.cnpj && rel.dados_entidade?.cnpj);

      if (needsSync) {
        const update: Record<string, string> = { status_selo: relStatus };
        const d = rel.dados_entidade ?? {};
        if (d.razao_social) update.razao_social = d.razao_social;
        if (d.cnpj) update.cnpj = d.cnpj;
        if (d.municipio) update.municipio = d.municipio;
        if (d.estado) update.estado = d.estado;
        if (d.responsavel) update.responsavel = d.responsavel;

        syncPromises.push(
          Promise.resolve(supabase.from('osc_perfis').update(update).eq('osc_id', rel.osc_id))
        );
        // Aplica na UI imediatamente sem esperar o banco
        perfil.status_selo = relStatus;
        if (d.razao_social) perfil.razao_social = d.razao_social;
        if (d.cnpj) perfil.cnpj = d.cnpj;
        if (d.municipio) perfil.municipio = d.municipio;
        if (d.estado) perfil.estado = d.estado;
        if (d.responsavel) perfil.responsavel = d.responsavel;
      }
    }

    if (syncPromises.length > 0) Promise.all(syncPromises); // fire-and-forget

    setAll(perfis.filter(o => !o.deleted_at));
    setTrashCount(perfis.filter(o => !!o.deleted_at).length);
    setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const applyFilters = useCallback(() => {
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
  }, [all, statusFilter, query]);

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

  /* ── Restaurar (Removido daqui pois lixeira agora é outra página) ── */

  /* ── Excluir permanentemente (Simplificado) ── */
  const handlePermanentDelete = async (ids: string[]) => {
    setActionLoading(true); setErrorMsg(null);
    const records = all.filter(o => ids.includes(o.id));
    const oscIds = records.map(o => o.osc_id);
    try {
      if (oscIds.length) {
        await Promise.all([
          supabase.from('osc_documentos').delete().in('osc_id', oscIds),
          supabase.from('notificacoes').delete().in('osc_id', oscIds),
          supabase.from('certificacao_pagamentos').delete().in('osc_id', oscIds),
          supabase.from('relatorios_conformidade').delete().in('osc_id', oscIds),
          supabase.from('osc_prestacao_contas').delete().in('osc_id', oscIds),
          supabase.from('osc_formularios').delete().in('osc_id', oscIds)
        ]);
      }
      const { error } = await supabase.from('osc_perfis').delete().in('id', ids);
      if (error) throw error;
      await loadData();
      setSelected(new Set());
    } catch (err: any) {
      console.error('Erro ao excluir:', err);
      setErrorMsg(`Erro ao excluir: ${err?.message ?? 'Falha na exclusão.'}`);
    } finally { setActionLoading(false); }
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
      {/* ── Modal removido (lixeira agora é outra página) ── */}

      {/* ── Banner de erro ── */}
      {errorMsg && (
        <div style={{
          background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.25)',
          borderRadius: 10, padding: '12px 16px', marginBottom: 16,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
        }}>
          <span style={{ fontSize: '0.82rem', color: '#dc2626', fontWeight: 600 }}>{errorMsg}</span>
          <button onClick={() => setErrorMsg(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626', fontSize: '1rem', lineHeight: 1, padding: '0 4px' }}>✕</button>
        </div>
      )}

      {/* ── Top bar ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
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

        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <div className="admin-header-search" style={{ width: 240 }}>
            <Search size={14} className="admin-header-search-icon" />
            <input type="text" placeholder="Buscar OSC, responsável, CNPJ..."
              value={query} onChange={e => setQuery(e.target.value)} />
          </div>

          {someSelected && (
            <button
              onClick={() => handleMoveToTrash([...selected])}
              disabled={actionLoading}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 12px', fontSize: '0.78rem', borderRadius: 8, border: 'none', background: '#dc2626', color: '#fff', cursor: 'pointer', fontWeight: 700 }}>
              <Trash2 size={13} /> Mover para lixeira ({selected.size})
            </button>
          )}

          <button
            onClick={() => router.push('/gestao/dashboard/oscs/lixeira')}
            className="admin-btn admin-btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 12px', fontSize: '0.78rem', borderRadius: 8, position: 'relative' }}>
            <Trash size={13} /> Lixeira
            {trashCount > 0 && (
              <span style={{ position: 'absolute', top: -6, right: -6, background: '#dc2626', color: '#fff', borderRadius: '50%', width: 16, height: 16, fontSize: '0.6rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {trashCount > 99 ? '99+' : trashCount}
              </span>
            )}
          </button>
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
            <div className="admin-empty-state-icon"><Users size={28} /></div>
            <div className="admin-empty-state-text">
              {query || statusFilter ? 'Nenhuma OSC encontrada com esses filtros.' : 'Nenhuma OSC cadastrada ainda.'}
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
                  <th>Cadastro</th>
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
                      {fmtDate(osc.created_at)}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                        <Link
                          href={`/gestao/dashboard/oscs/${osc.id}`}
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

export default function OscsPage() {
  return (
    <Suspense fallback={<div />}>
      <OscsContent />
    </Suspense>
  );
}
