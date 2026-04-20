'use client';
import { useEffect, useState, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import {
  Trash, RotateCcw, AlertTriangle, Trash2, ArrowLeft, Users
} from 'lucide-react';
import Link from 'next/link';

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

const STATUS_LABEL: Record<string, string> = {
  pendente: 'Pendente', em_analise: 'Em Análise', aprovado: 'Aprovado', rejeitado: 'Rejeitado',
};

function fmtDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
    + ' ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

function LixeiraContent() {
  const router = useRouter();
  const [trash, setTrash] = useState<OscPerfil[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [actionLoading, setActionLoading] = useState(false);
  const [confirmEmptyOpen, setConfirmEmptyOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('osc_perfis')
      .select('id, osc_id, responsavel, razao_social, cnpj, municipio, estado, status_selo, created_at, deleted_at')
      .not('deleted_at', 'is', null)
      .order('deleted_at', { ascending: false });

    setTrash((data ?? []) as OscPerfil[]);
    setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

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
    setErrorMsg(null);
    const records = trash.filter(o => ids.includes(o.id));
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
      console.error('Erro ao excluir OSC:', err);
      setErrorMsg(`Erro ao excluir: ${err?.message ?? 'A exclusão permanente falhou.'}`);
    } finally {
      setActionLoading(false);
    }
  };

  /* ── Esvaziar lixeira ── */
  const handleEmptyTrash = async () => {
    setConfirmEmptyOpen(false);
    setActionLoading(true);
    setErrorMsg(null);
    const ids = trash.map(o => o.id);
    const oscIds = trash.map(o => o.osc_id);

    try {
      if (ids.length) {
        await Promise.all([
          supabase.from('osc_documentos').delete().in('osc_id', oscIds),
          supabase.from('notificacoes').delete().in('osc_id', oscIds),
          supabase.from('certificacao_pagamentos').delete().in('osc_id', oscIds),
          supabase.from('relatorios_conformidade').delete().in('osc_id', oscIds),
          supabase.from('osc_prestacao_contas').delete().in('osc_id', oscIds),
          supabase.from('osc_formularios').delete().in('osc_id', oscIds)
        ]);
        const { error } = await supabase.from('osc_perfis').delete().in('id', ids);
        if (error) throw error;
      }
      await loadData();
    } catch (err: any) {
      console.error('Erro ao esvaziar lixeira:', err);
      setErrorMsg(`Erro ao esvaziar: ${err?.message ?? 'Falha ao esvaziar.'}`);
    } finally {
      setActionLoading(false);
    }
  };

  /* ── Seleção ── */
  const toggleSelect = (id: string) => setSelected(prev => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });
  const toggleAll = () => {
    if (selected.size === trash.length) setSelected(new Set());
    else setSelected(new Set(trash.map(o => o.id)));
  };
  const allSelected = trash.length > 0 && selected.size === trash.length;
  const someSelected = selected.size > 0;

  return (
    <div>
      {/* Confirm Empty Modal */}
      {confirmEmptyOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: '32px 28px', maxWidth: 380, width: '90%', boxShadow: '0 8px 40px rgba(0,0,0,0.18)', textAlign: 'center' }}>
            <AlertTriangle size={36} style={{ color: '#dc2626', marginBottom: 12 }} />
            <div style={{ fontWeight: 800, fontSize: '1rem', marginBottom: 8 }}>Esvaziar lixeira?</div>
            <div style={{ fontSize: '0.85rem', color: '#555', lineHeight: 1.6, marginBottom: 24 }}>
              Todos os <strong>{trash.length}</strong> registros serão excluídos <strong>permanentemente</strong>.
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <button onClick={() => setConfirmEmptyOpen(false)} style={{ padding: '9px 20px', border: '1.5px solid #e5e7eb', borderRadius: 8, background: '#fff', cursor: 'pointer', fontWeight: 600 }}>Cancelar</button>
              <button onClick={handleEmptyTrash} style={{ padding: '9px 20px', border: 'none', borderRadius: 8, background: '#dc2626', color: '#fff', cursor: 'pointer', fontWeight: 700 }}>Esvaziar</button>
            </div>
          </div>
        </div>
      )}

      {errorMsg && (
        <div style={{ background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.25)', borderRadius: 10, padding: '12px 16px', marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '0.82rem', color: '#dc2626', fontWeight: 600 }}>{errorMsg}</span>
          <button onClick={() => setErrorMsg(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626' }}>✕</button>
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
        <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--admin-text-secondary)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Trash size={15} /> Lixeira
          <span style={{ fontWeight: 500, color: 'var(--admin-text-tertiary)' }}>({trash.length} {trash.length === 1 ? 'item' : 'itens'})</span>
        </div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {someSelected && (
            <>
              <button onClick={() => handleRestore([...selected])} disabled={actionLoading} className="admin-btn admin-btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 12px', fontSize: '0.78rem' }}>
                <RotateCcw size={13} /> Restaurar ({selected.size})
              </button>
              <button onClick={() => handlePermanentDelete([...selected])} disabled={actionLoading} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 12px', fontSize: '0.78rem', border: 'none', background: '#dc2626', color: '#fff', cursor: 'pointer', borderRadius: 8, fontWeight: 700 }}>
                <Trash2 size={13} /> Excluir ({selected.size})
              </button>
            </>
          )}

          <button onClick={() => router.push('/gestao/dashboard/oscs')} className="admin-btn admin-btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', fontSize: '0.78rem', fontWeight: 600 }}>
            <ArrowLeft size={13} /> Voltar para OSCs
          </button>

          {trash.length > 0 && (
            <button onClick={() => setConfirmEmptyOpen(true)} disabled={actionLoading} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 12px', fontSize: '0.78rem', borderRadius: 8, border: '1.5px solid #dc2626', background: 'rgba(220,38,38,0.06)', color: '#dc2626', cursor: 'pointer', fontWeight: 700 }}>
              <Trash2 size={13} /> Esvaziar lixeira
            </button>
          )}
        </div>
      </div>

      <div className="glass-card">
        {loading ? (
          <div style={{ padding: '48px 0', display: 'flex', justifyContent: 'center' }}>
            <div style={{ width: 32, height: 32, border: '3px solid var(--admin-border)', borderTopColor: 'var(--admin-primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
          </div>
        ) : trash.length === 0 ? (
          <div className="admin-empty-state">
            <div className="admin-empty-state-icon"><Trash size={28} /></div>
            <div className="admin-empty-state-text">Lixeira vazia.</div>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th style={{ width: 36 }}><input type="checkbox" checked={allSelected} onChange={toggleAll} /></th>
                  <th>ID OSC</th>
                  <th>Responsável / Organização</th>
                  <th>CNPJ</th>
                  <th>Status</th>
                  <th>Excluído em</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {trash.map(osc => (
                  <tr key={osc.id} style={{ opacity: actionLoading && selected.has(osc.id) ? 0.5 : 1 }}>
                    <td><input type="checkbox" checked={selected.has(osc.id)} onChange={() => toggleSelect(osc.id)} /></td>
                    <td><span style={{ fontFamily: 'monospace', fontSize: '0.8rem', background: 'var(--admin-primary-subtle)', color: 'var(--admin-primary)', padding: '3px 8px', borderRadius: 6, fontWeight: 700 }}>{osc.osc_id}</span></td>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--admin-text-primary)', fontSize: '0.875rem' }}>{osc.responsavel ?? '—'}</div>
                      {osc.razao_social && <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-tertiary)' }}>{osc.razao_social}</div>}
                    </td>
                    <td><span style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{osc.cnpj ?? '—'}</span></td>
                    <td><span className={`adm-badge ${osc.status_selo}`}>{STATUS_LABEL[osc.status_selo] ?? osc.status_selo}</span></td>
                    <td style={{ color: 'var(--admin-text-secondary)', fontSize: '0.82rem' }}>{fmtDate(osc.deleted_at!)}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button onClick={() => handleRestore([osc.id])} className="admin-btn admin-btn-secondary" style={{ padding: '5px 10px' }} title="Restaurar"><RotateCcw size={12} /></button>
                        <button onClick={() => handlePermanentDelete([osc.id])} style={{ padding: '5px 10px', border: 'none', background: 'rgba(220,38,38,0.09)', color: '#dc2626', borderRadius: 8, cursor: 'pointer' }} title="Excluir permanentemente"><Trash2 size={12} /></button>
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
  );
}

export default function LixeiraPage() {
  return (
    <Suspense fallback={<div />}>
      <LixeiraContent />
    </Suspense>
  );
}
