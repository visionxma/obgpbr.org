'use client';
import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import {
  Search, Users, ChevronRight, Eye,
  CheckCircle, Clock, AlertCircle, XCircle, Circle,
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
}

const STATUS_OPTS = [
  { value: '',           label: 'Todas',       icon: Users,        cls: '' },
  { value: 'pendente',   label: 'Pendente',    icon: Circle,       cls: 'pendente' },
  { value: 'em_analise', label: 'Em Análise',  icon: Clock,        cls: 'em_analise' },
  { value: 'aprovado',   label: 'Aprovado',    icon: CheckCircle,  cls: 'aprovado' },
  { value: 'rejeitado',  label: 'Rejeitado',   icon: XCircle,      cls: 'rejeitado' },
];

const STATUS_LABEL: Record<string, string> = {
  pendente: 'Pendente', em_analise: 'Em Análise', aprovado: 'Aprovado', rejeitado: 'Rejeitado',
};

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export default function OscsPage() {
  const searchParams = useSearchParams();
  const initialStatus = searchParams.get('status') ?? '';

  const [all, setAll] = useState<OscPerfil[]>([]);
  const [filtered, setFiltered] = useState<OscPerfil[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState(initialStatus);
  const [query, setQuery] = useState('');

  useEffect(() => {
    supabase
      .from('osc_perfis')
      .select('id, osc_id, responsavel, razao_social, cnpj, municipio, estado, status_selo, created_at')
      .order('created_at', { ascending: false })
      .then(({ data }: { data: any }) => {
        setAll((data ?? []) as OscPerfil[]);
        setLoading(false);
      });
  }, []);

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

  useEffect(() => { applyFilters(); }, [applyFilters]);

  const counts = {
    '':           all.length,
    pendente:     all.filter(o => o.status_selo === 'pendente').length,
    em_analise:   all.filter(o => o.status_selo === 'em_analise').length,
    aprovado:     all.filter(o => o.status_selo === 'aprovado').length,
    rejeitado:    all.filter(o => o.status_selo === 'rejeitado').length,
  };

  return (
    <div>
      {/* Filter tabs + search */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
        <div className="adm-tabs">
          {STATUS_OPTS.map(opt => {
            const Icon = opt.icon;
            const count = counts[opt.value as keyof typeof counts];
            return (
              <button
                key={opt.value}
                className={`adm-tab ${statusFilter === opt.value ? 'active' : ''}`}
                onClick={() => setStatusFilter(opt.value)}
              >
                <Icon size={13} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 5 }} />
                {opt.label}
                <span style={{ marginLeft: 6, opacity: .65, fontWeight: 500 }}>({count})</span>
              </button>
            );
          })}
        </div>

        <div className="admin-header-search" style={{ width: 240 }}>
          <Search size={14} className="admin-header-search-icon" />
          <input
            type="text"
            placeholder="Buscar OSC, responsável, CNPJ..."
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <div className="glass-card">
        {loading ? (
          <div style={{ padding: '48px 0', display: 'flex', justifyContent: 'center' }}>
            <div style={{ width: 32, height: 32, border: '3px solid var(--admin-border)', borderTopColor: 'var(--admin-primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="admin-empty-state">
            <div className="admin-empty-state-icon"><Users size={28} /></div>
            <div className="admin-empty-state-text">{query || statusFilter ? 'Nenhuma OSC encontrada com esses filtros.' : 'Nenhuma OSC cadastrada ainda.'}</div>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="admin-table">
              <thead>
                <tr>
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
                  <tr key={osc.id}>
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
                    <td style={{ color: 'var(--admin-text-secondary)', fontSize: '0.82rem' }}>{fmtDate(osc.created_at)}</td>
                    <td>
                      <Link
                        href={`/admin/dashboard/oscs/${osc.id}`}
                        className="admin-btn admin-btn-secondary"
                        style={{ padding: '7px 14px', fontSize: '0.78rem', borderRadius: 8, display: 'inline-flex', alignItems: 'center', gap: 5 }}
                      >
                        <Eye size={13} /> Analisar
                      </Link>
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
