'use client';
import { useEffect, useState, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import {
  Search, Users, Eye, CheckCircle, Clock, XCircle, Circle,
  Trash2, Trash, ChevronRight, ChevronDown, FileText,
  CreditCard, Award, ExternalLink, AlertCircle, Download
} from 'lucide-react';
import { gerarRelatorioDocx } from '@/lib/docxGenerator';

interface Pagamento {
  id: string; osc_id: string; status: string; valor: number;
  arquivo_comprovante_path: string | null; arquivo_comprovante_nome: string | null;
  paid_at: string | null; created_at: string;
}
interface RelatorioResumo {
  id: string; osc_id: string; numero: string | null;
  status: string; submitted_at: string | null; created_at: string;
}
interface OscPerfil {
  id: string; osc_id: string; responsavel: string | null; razao_social: string | null;
  cnpj: string | null; municipio: string | null; estado: string | null;
  status_selo: string; created_at: string; deleted_at: string | null;
  relatorios: RelatorioResumo[]; pagamentos: Pagamento[];
}

const STATUS_OPTS = [
  { value: '',           label: 'Todas',      icon: Users       },
  { value: 'pendente',   label: 'Pendente',   icon: Circle      },
  { value: 'em_analise', label: 'Em Análise', icon: Clock       },
  { value: 'aprovado',   label: 'Aprovado',   icon: CheckCircle },
  { value: 'rejeitado',  label: 'Rejeitado',  icon: XCircle     },
];
const STATUS_LABEL: Record<string, string> = {
  pendente: 'Pendente', em_analise: 'Em Análise', aprovado: 'Aprovado', rejeitado: 'Rejeitado',
};
const REL_STATUS_LABEL: Record<string, string> = {
  em_preenchimento: 'Em Preenchimento', em_analise: 'Em Análise',
  aprovado: 'Aprovado', reprovado: 'Reprovado',
};
function relCls(s: string) {
  if (s === 'aprovado') return 'aprovado';
  if (s === 'reprovado') return 'rejeitado';
  if (s === 'em_analise') return 'em_analise';
  return 'pendente';
}
function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}
function fmtCurrency(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

/* ── Inline payment confirm ── */
function PaymentRow({ pag, oscId, onDone }: { pag: Pagamento; oscId: string; onDone: () => void }) {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const confirm = async () => {
    setBusy(true);
    const { error } = await supabase.rpc('confirmar_pagamento_admin', {
      p_pagamento_id: pag.id, p_osc_id: oscId,
    });
    setBusy(false);
    if (error) { setMsg('Erro ao confirmar.'); return; }
    setMsg('Pagamento confirmado!');
    setTimeout(() => { setMsg(''); onDone(); }, 1500);
  };
  const isPago = pag.status === 'pago';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderRadius: 10, background: isPago ? 'rgba(22,163,74,.07)' : 'rgba(245,158,11,.07)', border: `1px solid ${isPago ? 'rgba(22,163,74,.2)' : 'rgba(245,158,11,.2)'}` }}>
      <CreditCard size={14} style={{ color: isPago ? '#16a34a' : '#d97706', flexShrink: 0 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: isPago ? '#16a34a' : '#d97706' }}>
          {isPago ? '✓ Pago' : 'Aguardando confirmação'} — {fmtCurrency(pag.valor)}
        </div>
        {pag.arquivo_comprovante_nome && (
          <div style={{ fontSize: '0.68rem', color: 'var(--admin-text-tertiary)', marginTop: 1 }}>
            Comprovante: {pag.arquivo_comprovante_nome}
          </div>
        )}
        {msg && <div style={{ fontSize: '0.68rem', color: '#16a34a', marginTop: 1, fontWeight: 700 }}>{msg}</div>}
      </div>
      {!isPago && (
        <button onClick={confirm} disabled={busy}
          style={{ padding: '5px 12px', border: 'none', borderRadius: 7, background: '#16a34a', color: '#fff', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}>
          {busy ? '...' : '✓ Confirmar'}
        </button>
      )}
    </div>
  );
}

/* ── Inline seal status change ── */
function SealControl({ osc, onDone }: { osc: OscPerfil; onDone: () => void }) {
  const [status, setStatus] = useState(osc.status_selo);
  const [obs, setObs] = useState('');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const save = async () => {
    setSaving(true);
    const { error } = await supabase.from('osc_perfis').update({
      status_selo: status, observacao_selo: obs.trim() || null,
      updated_at: new Date().toISOString(),
    }).eq('id', osc.id);
    setSaving(false);
    if (error) { setMsg('Erro ao salvar.'); return; }
    setMsg('Salvo!');
    setTimeout(() => { setMsg(''); onDone(); }, 1200);
  };
  return (
    <div style={{ padding: '10px 12px', borderRadius: 10, background: 'var(--admin-primary-subtle)', border: '1px solid var(--admin-border)' }}>
      <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--admin-text-tertiary)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 5 }}>
        <Award size={12} /> Gestão do Selo OSC
      </div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        <select value={status} onChange={e => setStatus(e.target.value)}
          style={{ border: '1px solid var(--admin-border)', borderRadius: 7, padding: '5px 10px', fontSize: '0.78rem', background: 'var(--admin-surface)', color: 'var(--admin-text-primary)' }}>
          <option value="pendente">Pendente</option>
          <option value="em_analise">Em Análise</option>
          <option value="aprovado">Aprovado</option>
          <option value="rejeitado">Rejeitado</option>
        </select>
        {status === 'rejeitado' && (
          <input value={obs} onChange={e => setObs(e.target.value)} placeholder="Motivo da reprovação..."
            style={{ border: '1px solid var(--admin-border)', borderRadius: 7, padding: '5px 10px', fontSize: '0.78rem', flex: 1, minWidth: 160, background: 'var(--admin-surface)', color: 'var(--admin-text-primary)' }} />
        )}
        <button onClick={save} disabled={saving}
          style={{ padding: '5px 14px', border: 'none', borderRadius: 7, background: 'var(--admin-primary)', color: '#fff', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer' }}>
          {saving ? '...' : 'Salvar'}
        </button>
        {msg && <span style={{ fontSize: '0.72rem', color: '#16a34a', fontWeight: 700 }}>{msg}</span>}
      </div>
    </div>
  );
}

/* ── Inline DOCX Generator ── */
function DocxButton({ relId, oscId }: { relId: string, oscId: string }) {
  const [loading, setLoading] = useState(false);
  const handleGenerate = async () => {
    setLoading(true);
    try {
      const [relRes, itensRes, perfRes] = await Promise.all([
        supabase.from('relatorios_conformidade').select('*').eq('id', relId).single(),
        supabase.from('relatorio_itens').select('*').eq('relatorio_id', relId).order('secao').order('ordem'),
        supabase.from('osc_perfis').select('*').eq('id', oscId).single()
      ]);
      const relatorio = relRes.data;
      const itens = itensRes.data || [];
      const perfil = perfRes.data;
      if (!relatorio || !perfil) throw new Error('Dados não encontrados');
      
      const de = relatorio.dados_entidade ?? {};
      const enderecoGeral = [
        de.logradouro || perfil.logradouro,
        de.numero_endereco || perfil.numero_endereco,
        de.bairro || perfil.bairro,
        de.municipio || perfil.municipio,
        de.estado || perfil.estado,
      ].filter(Boolean).join(', ');

      const fmt = (iso: string | null) => iso ? new Date(iso + 'T12:00:00').toLocaleDateString('pt-BR') : '—';
      const STATUS_DOCX: Record<string,string> = { conforme: 'CONFORME', nao_aplicavel: 'N/A', nao_conforme: 'NÃO CONFORME', pendente: 'PENDENTE' };
      const rowsFromItens = (secao: number) => itens
        .filter((i: any) => i.secao === secao && !i.is_header)
        .map((i: any) => ({
          label: i.descricao, status: STATUS_DOCX[i.status] ?? 'PENDENTE',
          codigo: i.codigo_controle || '—', emissao: fmt(i.data_emissao),
          validade: fmt(i.data_validade), analise: i.analise_atual || '—',
        }));
      
      const numeroBase = relatorio.numero || `OBGP${new Date().getFullYear()}${perfil.id.substring(0, 4).toUpperCase()}`;
      const numeroRelatorio = numeroBase.startsWith('N.º') ? numeroBase : `N.º ${numeroBase}`;
      const docxData = {
        cnpj: de.cnpj || perfil.cnpj || 'Não Informado',
        natureza_juridica: de.natureza_juridica || perfil.natureza_juridica || 'Não Informado',
        razao_social: de.razao_social || perfil.razao_social || 'Não Informado',
        nome_fantasia: de.nome_fantasia || perfil.nome_fantasia || 'Não Informado',
        logradouro: enderecoGeral || 'Não Informado',
        data_abertura_cnpj: de.data_abertura_cnpj || perfil.data_abertura_cnpj || 'Não Informado',
        email_osc: de.email_osc || perfil.email_osc || 'Não Informado',
        telefone: de.telefone || perfil.telefone || 'Não Informado',
        responsavel: de.responsavel || perfil.responsavel || 'Não Informado',
        municipio_uf: [de.municipio || perfil.municipio, de.estado || perfil.estado].filter(Boolean).join('/') || 'Não Informado',
        numero_relatorio: numeroRelatorio,
        codigo_controle: relatorio.certificado_numero ?? `RC ${numeroRelatorio}`,
        data_hoje: new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' }),
        habilitacao_juridica: rowsFromItens(2),
        regularidade_fiscal: rowsFromItens(3),
        qualificacao_economica: rowsFromItens(4),
        qualificacao_tecnica: rowsFromItens(5),
        outros_registros: rowsFromItens(6),
        status_final: relatorio.status === 'aprovado' ? 'APROVADO' : 'EM ANÁLISE',
        observacao_admin: relatorio.observacao_admin || 'Nenhuma observação extra.',
      };
      const blob = await gerarRelatorioDocx(docxData);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `RELATORIO_CONFORMIDADE_${perfil.osc_id}.docx`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (e: any) {
      alert(`Erro ao gerar DOCX: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };
  return (
    <button onClick={handleGenerate} disabled={loading} title="Gerar DOCX para Análise"
      style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 7, fontSize: '0.72rem', fontWeight: 700, background: 'var(--admin-secondary)', color: 'var(--admin-primary)', border: '1px solid var(--admin-border)', cursor: loading ? 'wait' : 'pointer' }}>
      {loading ? '...' : <><Download size={11} /> DOCX</>}
    </button>
  );
}

/* ── Expanded OSC folder row ── */
function OscExpandedRow({ osc, onRefresh }: { osc: OscPerfil; onRefresh: () => void }) {
  return (
    <tr>
      <td colSpan={7} style={{ padding: 0, background: 'var(--admin-primary-subtle)' }}>
        <div style={{ padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Payments */}
          {osc.pagamentos.length > 0 ? (
            <div>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--admin-text-tertiary)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '.05em' }}>
                Pagamentos de Certificação
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {osc.pagamentos.map(pag => (
                  <PaymentRow key={pag.id} pag={pag} oscId={osc.osc_id} onDone={onRefresh} />
                ))}
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.75rem', color: 'var(--admin-text-tertiary)' }}>
              <AlertCircle size={13} /> Nenhum pagamento registrado ainda.
            </div>
          )}

          {/* Reports */}
          {osc.relatorios.length > 0 ? (
            <div>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--admin-text-tertiary)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '.05em' }}>
                Relatórios de Conformidade
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {osc.relatorios.map(r => (
                  <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderRadius: 9, background: 'var(--admin-surface)', border: '1px solid var(--admin-border)' }}>
                    <FileText size={13} style={{ color: 'var(--admin-primary)', flexShrink: 0 }} />
                    <span style={{ fontFamily: 'monospace', fontSize: '0.78rem', fontWeight: 700, color: 'var(--admin-primary)', flex: 1 }}>
                      {r.numero ?? r.id.slice(-10)}
                    </span>
                    <span className={`adm-badge ${relCls(r.status)}`} style={{ fontSize: '0.65rem' }}>
                      {REL_STATUS_LABEL[r.status] ?? r.status}
                    </span>
                    {r.submitted_at && (
                      <span style={{ fontSize: '0.68rem', color: 'var(--admin-text-tertiary)' }}>
                        {fmtDate(r.submitted_at)}
                      </span>
                    )}
                    <DocxButton relId={r.id} oscId={osc.id} />
                    <Link href={`/gestao/dashboard/oscs/${osc.id}?relatorio=${r.id}`}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 7, fontSize: '0.72rem', fontWeight: 700, background: 'var(--admin-primary)', color: '#fff', textDecoration: 'none' }}>
                      <ExternalLink size={11} /> Abrir
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-tertiary)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <FileText size={13} /> Nenhum relatório enviado.
            </div>
          )}

          {/* Seal control */}
          <SealControl osc={osc} onDone={onRefresh} />

          {/* Full profile link */}
          <div>
            <Link href={`/gestao/dashboard/oscs/${osc.id}`}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: '0.75rem', fontWeight: 600, color: 'var(--admin-primary)', textDecoration: 'none' }}>
              <Eye size={12} /> Ver perfil completo →
            </Link>
          </div>
        </div>
      </td>
    </tr>
  );
}

/* ── Main list ── */
function OscsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [all, setAll] = useState<OscPerfil[]>([]);
  const [trashCount, setTrashCount] = useState(0);
  const [filtered, setFiltered] = useState<OscPerfil[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') ?? '');
  const [query, setQuery] = useState('');
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [actionLoading, setActionLoading] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('osc_perfis')
      .select('id, osc_id, responsavel, razao_social, cnpj, municipio, estado, status_selo, created_at, deleted_at')
      .order('created_at', { ascending: false });

    const rows = (data ?? []) as OscPerfil[];
    const oscIds = rows.map(o => o.osc_id);

    const [relRes, pagRes] = await Promise.all([
      oscIds.length ? supabase.from('relatorios_conformidade')
        .select('id, osc_id, numero, status, submitted_at, created_at')
        .in('osc_id', oscIds).order('created_at', { ascending: false }) : Promise.resolve({ data: [] }),
      oscIds.length ? supabase.from('certificacao_pagamentos')
        .select('id, osc_id, status, valor, arquivo_comprovante_path, arquivo_comprovante_nome, paid_at, created_at')
        .in('osc_id', oscIds).order('created_at', { ascending: false }) : Promise.resolve({ data: [] }),
    ]);

    const relMap = new Map<string, RelatorioResumo[]>();
    for (const r of (relRes.data ?? []) as RelatorioResumo[]) {
      relMap.set(r.osc_id, [...(relMap.get(r.osc_id) ?? []), r]);
    }
    const pagMap = new Map<string, Pagamento[]>();
    for (const p of (pagRes.data ?? []) as Pagamento[]) {
      pagMap.set(p.osc_id, [...(pagMap.get(p.osc_id) ?? []), p]);
    }

    const enriched = rows.map(o => ({ ...o, relatorios: relMap.get(o.osc_id) ?? [], pagamentos: pagMap.get(o.osc_id) ?? [] }));
    setAll(enriched.filter(o => !o.deleted_at));
    setTrashCount(rows.filter(o => !!o.deleted_at).length);
    setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  useEffect(() => {
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
    setSelected(new Set());
  }, [all, statusFilter, query]);

  const counts = {
    '': all.length,
    pendente: all.filter(o => o.status_selo === 'pendente').length,
    em_analise: all.filter(o => o.status_selo === 'em_analise').length,
    aprovado: all.filter(o => o.status_selo === 'aprovado').length,
    rejeitado: all.filter(o => o.status_selo === 'rejeitado').length,
  };

  const toggleExpand = (id: string) => setExpanded(prev => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });
  const toggleSelect = (id: string) => setSelected(prev => {
    const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next;
  });
  const handleMoveToTrash = async (ids: string[]) => {
    setActionLoading(true);
    await supabase.from('osc_perfis').update({ deleted_at: new Date().toISOString() }).in('id', ids);
    await loadData(); setSelected(new Set()); setActionLoading(false);
  };

  return (
    <div>
      {/* Top bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
        <div className="adm-tabs">
          {STATUS_OPTS.map(opt => {
            const Icon = opt.icon;
            return (
              <button key={opt.value} className={`adm-tab ${statusFilter === opt.value ? 'active' : ''}`}
                onClick={() => setStatusFilter(opt.value)}>
                <Icon size={13} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 5 }} />
                {opt.label}
                <span style={{ marginLeft: 6, opacity: .65, fontWeight: 500 }}>({counts[opt.value as keyof typeof counts]})</span>
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
          {selected.size > 0 && (
            <button onClick={() => handleMoveToTrash([...selected])} disabled={actionLoading}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 12px', fontSize: '0.78rem', borderRadius: 8, border: 'none', background: '#dc2626', color: '#fff', cursor: 'pointer', fontWeight: 700 }}>
              <Trash2 size={13} /> Lixeira ({selected.size})
            </button>
          )}
          <button onClick={() => router.push('/gestao/dashboard/oscs/lixeira')}
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

      {/* Table */}
      <div className="glass-card">
        {loading ? (
          <div style={{ padding: '48px 0', display: 'flex', justifyContent: 'center' }}>
            <div style={{ width: 32, height: 32, border: '3px solid var(--admin-border)', borderTopColor: 'var(--admin-primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="admin-empty-state">
            <div className="admin-empty-state-icon"><Users size={28} /></div>
            <div className="admin-empty-state-text">
              {query || statusFilter ? 'Nenhuma OSC encontrada.' : 'Nenhuma OSC cadastrada ainda.'}
            </div>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th style={{ width: 36 }}>
                    <input type="checkbox"
                      checked={filtered.length > 0 && selected.size === filtered.length}
                      onChange={() => setSelected(selected.size === filtered.length ? new Set() : new Set(filtered.map(o => o.id)))}
                      style={{ cursor: 'pointer', accentColor: 'var(--admin-primary)' }} />
                  </th>
                  <th style={{ width: 32 }}></th>
                  <th>ID OSC</th>
                  <th>Responsável / Organização</th>
                  <th>CNPJ</th>
                  <th>Localidade</th>
                  <th>Status</th>
                  <th>Processos</th>
                  <th>Cadastro</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(osc => {
                  const isOpen = expanded.has(osc.id);
                  const hasPendingPayment = osc.pagamentos.some(p => p.status !== 'pago');
                  return [
                    <tr key={osc.id}
                      style={{ cursor: 'pointer', background: isOpen ? 'var(--admin-primary-subtle)' : undefined, opacity: actionLoading && selected.has(osc.id) ? 0.5 : 1 }}
                      onClick={() => toggleExpand(osc.id)}>
                      <td onClick={e => e.stopPropagation()}>
                        <input type="checkbox" checked={selected.has(osc.id)} onChange={() => toggleSelect(osc.id)}
                          style={{ cursor: 'pointer', accentColor: 'var(--admin-primary)' }} />
                      </td>
                      <td style={{ padding: '0 8px' }}>
                        {isOpen
                          ? <ChevronDown size={15} style={{ color: 'var(--admin-primary)' }} />
                          : <ChevronRight size={15} style={{ color: 'var(--admin-text-tertiary)' }} />}
                      </td>
                      <td>
                        <span style={{ fontFamily: 'monospace', fontSize: '0.8rem', background: 'var(--admin-primary-subtle)', color: 'var(--admin-primary)', padding: '3px 8px', borderRadius: 6, fontWeight: 700 }}>
                          {osc.osc_id}
                        </span>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--admin-text-primary)', fontSize: '0.875rem' }}>{osc.responsavel ?? '—'}</div>
                        {osc.razao_social && <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-tertiary)', marginTop: 2 }}>{osc.razao_social}</div>}
                      </td>
                      <td><span style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--admin-text-secondary)' }}>{osc.cnpj ?? '—'}</span></td>
                      <td style={{ color: 'var(--admin-text-secondary)', fontSize: '0.82rem' }}>
                        {[osc.municipio, osc.estado].filter(Boolean).join('/') || '—'}
                      </td>
                      <td><span className={`adm-badge ${osc.status_selo}`}>{STATUS_LABEL[osc.status_selo] ?? osc.status_selo}</span></td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--admin-text-secondary)' }}>
                            {osc.relatorios.length} proc.
                          </span>
                          {hasPendingPayment && (
                            <span title="Pagamento aguardando confirmação" style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: '0.65rem', fontWeight: 700, padding: '2px 7px', borderRadius: 10, background: 'rgba(245,158,11,.15)', color: '#d97706' }}>
                              <CreditCard size={10} /> Pend.
                            </span>
                          )}
                        </div>
                      </td>
                      <td style={{ color: 'var(--admin-text-secondary)', fontSize: '0.82rem' }}>{fmtDate(osc.created_at)}</td>
                      <td onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                          <Link href={`/gestao/dashboard/oscs/${osc.id}`}
                            className="admin-btn admin-btn-secondary"
                            style={{ padding: '6px 12px', fontSize: '0.75rem', borderRadius: 8, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                            <Eye size={12} /> Perfil
                          </Link>
                          <button onClick={() => handleMoveToTrash([osc.id])} disabled={actionLoading} title="Mover para lixeira"
                            style={{ padding: '6px 8px', border: 'none', borderRadius: 8, background: 'rgba(220,38,38,0.08)', color: '#dc2626', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>,
                    isOpen && <OscExpandedRow key={`${osc.id}-expanded`} osc={osc} onRefresh={loadData} />,
                  ];
                })}
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
