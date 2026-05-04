'use client';
import { useEffect, useState, useCallback, Suspense } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import {
  Search, Users, Eye, CheckCircle, Clock, XCircle, Circle,
  Trash2, Trash, ChevronRight, ChevronDown, FileText,
  CreditCard, Award, ExternalLink, AlertCircle, Download, X
} from 'lucide-react';
import { gerarRelatorioDocx } from '@/lib/docxGenerator';
import { toast } from '@/components/ui/Toast';
import { Skeleton } from '@/components/ui/Skeleton';

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
function PaymentRow({ pag, oscId, onDone }: { pag: Pagamento; oscId: string; onDone: (pagId: string) => void }) {
  const [busy, setBusy] = useState(false);
  const confirm = async () => {
    setBusy(true);
    const { error } = await supabase.rpc('confirmar_pagamento_admin', {
      p_pagamento_id: pag.id, p_osc_id: oscId,
    });
    setBusy(false);
    if (error) { toast('Erro ao confirmar pagamento.', 'error'); return; }
    toast('Pagamento confirmado!', 'success');
    onDone(pag.id);
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

/* ── Docx Logic ── */
async function generateDocxForRelatorio(relId: string, oscId: string, onStart: () => void, onEnd: () => void) {
  onStart();
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
      de.logradouro || perfil.logradouro, de.numero_endereco || perfil.numero_endereco,
      de.bairro || perfil.bairro, de.municipio || perfil.municipio, de.estado || perfil.estado,
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
    link.download = `RELATORIO_${relatorio.numero || relatorio.id.substring(0,8)}_${perfil.osc_id}.docx`;
    link.click();
    window.URL.revokeObjectURL(url);
  } catch (e: any) {
    toast(`Erro ao gerar DOCX: ${e.message}`, 'error');
  } finally {
    onEnd();
  }
}

/* ── Evaluation Modal ── */
function ReviewModal({ osc, onClose, onApprove, onReject }: { 
  osc: OscPerfil; 
  onClose: () => void; 
  onApprove: (oscId: string, relId: string) => Promise<void>; 
  onReject: (oscId: string, relId: string, obs: string) => Promise<void>; 
}) {
  const [loadingApprove, setLoadingApprove] = useState(false);
  const [loadingReject, setLoadingReject] = useState(false);
  const [loadingDocx, setLoadingDocx] = useState(false);
  const [obs, setObs] = useState('');
  const [showReject, setShowReject] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const [selectedRelId, setSelectedRelId] = useState(osc.relatorios[0]?.id);
  const rel = osc.relatorios.find(r => r.id === selectedRelId);
  const handleDownload = () => {
    if (!rel) return toast('Nenhum relatório para avaliar.', 'error');
    generateDocxForRelatorio(rel.id, osc.id, () => setLoadingDocx(true), () => setLoadingDocx(false));
  };

  const doApprove = async () => {
    if (!rel) return;
    setLoadingApprove(true);
    await onApprove(osc.id, rel.id);
    setLoadingApprove(false);
    onClose();
  };

  const doReject = async () => {
    if (!rel) return;
    if (!obs.trim()) return toast('Por favor, informe o motivo da rejeição.', 'error');
    setLoadingReject(true);
    await onReject(osc.id, rel.id, obs);
    setLoadingReject(false);
    onClose();
  };

  if (!mounted) return null;

  return createPortal(
    <div style={{ position: 'fixed', inset: 0, zIndex: 999999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, background: 'rgba(15,23,42,0.4)', backdropFilter: 'blur(4px)' }}>
      <div style={{ background: '#fff', borderRadius: 24, width: '100%', maxWidth: 700, overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
        
        {/* Header */}
        <div style={{ padding: '24px 32px', background: 'var(--site-primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--site-gold)', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 4 }}>
              Sala de Avaliação
            </div>
            <h2 style={{ fontSize: '1.5rem', margin: 0 }}>{osc.razao_social || 'OSC Não Identificada'}</h2>
            <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', marginTop: 4 }}>ID: {osc.osc_id} — CNPJ: {osc.cnpj || 'Não informado'}</div>
          </div>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '32px', flex: 1, overflowY: 'auto' }}>
          {!rel ? (
            <div style={{ textAlign: 'center', padding: 40, color: 'var(--site-text-tertiary)' }}>
              <FileText size={40} style={{ opacity: 0.3, margin: '0 auto 16px' }} />
              <p>Nenhum relatório submetido para avaliação.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              
              {osc.relatorios.length > 1 && (
                <div style={{ background: 'var(--site-surface-blue)', padding: 16, borderRadius: 12, border: '1px solid var(--site-border)' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--site-primary)', marginBottom: 8 }}>Múltiplos Processos Encontrados ({osc.relatorios.length})</div>
                  <select 
                    value={selectedRelId} 
                    onChange={e => {
                      setSelectedRelId(e.target.value);
                      setShowReject(false); // reset reject form on change
                    }}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--site-border)', background: '#fff', fontSize: '0.9rem', fontFamily: 'inherit', color: 'var(--site-text-primary)', outline: 'none' }}
                  >
                    {osc.relatorios.map((r, idx) => (
                      <option key={r.id} value={r.id}>
                        Processo {r.numero || r.id.substring(0,8)} • Data: {new Date(r.created_at).toLocaleDateString('pt-BR')} às {new Date(r.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} • Status: {r.status.toUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Box Baixar Documento */}
              <div style={{ background: 'var(--site-surface-warm)', border: '1px solid var(--site-border)', padding: 24, borderRadius: 16, textAlign: 'center' }}>
                <h3 style={{ fontSize: '1.1rem', marginBottom: 8, color: 'var(--site-text-primary)' }}>1. Análise do Dossiê</h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--site-text-secondary)', marginBottom: 20 }}>
                  Faça o download do documento gerado com as respostas e comprovantes da OSC para verificar a conformidade.
                </p>
                <button onClick={handleDownload} disabled={loadingDocx}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 12, background: 'var(--site-primary)', color: '#fff', border: 'none', padding: '14px 28px', borderRadius: 999, fontSize: '1rem', fontWeight: 800, cursor: 'pointer', boxShadow: '0 4px 14px var(--site-primary-glow)' }}>
                  {loadingDocx ? 'Gerando...' : <><Download size={18} /> Baixar Dossiê Completo (DOCX)</>}
                </button>
              </div>

              {/* Box Decisão */}
              <div style={{ borderTop: '1px solid var(--site-border)', paddingTop: 32 }}>
                <h3 style={{ fontSize: '1.1rem', marginBottom: 16, color: 'var(--site-text-primary)', textAlign: 'center' }}>2. Qual o parecer desta avaliação?</h3>
                
                {!showReject ? (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <button onClick={doApprove} disabled={loadingApprove}
                      style={{ padding: 20, background: '#f0fdf4', border: '1px solid #4ade80', color: '#166534', borderRadius: 16, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, cursor: 'pointer', transition: 'all 0.2s' }}>
                      <CheckCircle size={32} />
                      <span style={{ fontWeight: 800 }}>Aprovar Processo<br/>e Emitir Selo</span>
                    </button>
                    <button onClick={() => setShowReject(true)}
                      style={{ padding: 20, background: '#fef2f2', border: '1px solid #f87171', color: '#991b1b', borderRadius: 16, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, cursor: 'pointer', transition: 'all 0.2s' }}>
                      <XCircle size={32} />
                      <span style={{ fontWeight: 800 }}>Rejeitar e Solicitar<br/>Correções</span>
                    </button>
                  </div>
                ) : (
                  <div style={{ background: '#fef2f2', border: '1px solid #f87171', borderRadius: 16, padding: 20 }}>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#991b1b', marginBottom: 12 }}>Motivo da Rejeição (será enviado para a OSC):</div>
                    <textarea 
                      value={obs} onChange={e => setObs(e.target.value)}
                      placeholder="Descreva o que está faltando ou o que precisa ser corrigido..."
                      style={{ width: '100%', padding: 12, borderRadius: 8, border: '1px solid #fca5a5', minHeight: 100, fontSize: '0.9rem', marginBottom: 16, fontFamily: 'inherit' }}
                    />
                    <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                      <button onClick={() => setShowReject(false)} style={{ padding: '10px 16px', background: 'transparent', border: 'none', color: '#991b1b', fontWeight: 600, cursor: 'pointer' }}>
                        Cancelar
                      </button>
                      <button onClick={doReject} disabled={loadingReject} style={{ padding: '10px 24px', background: '#dc2626', border: 'none', borderRadius: 8, color: '#fff', fontWeight: 700, cursor: 'pointer' }}>
                        {loadingReject ? 'Salvando...' : 'Confirmar Rejeição'}
                      </button>
                    </div>
                  </div>
                )}
              </div>

            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
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
  const [reviewOscId, setReviewOscId] = useState<string | null>(null);
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

  const toggleSelect = (id: string) => setSelected(prev => {
    const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next;
  });
  const handleMoveToTrash = async (ids: string[]) => {
    setActionLoading(true);
    await supabase.from('osc_perfis').update({ deleted_at: new Date().toISOString() }).in('id', ids);
    toast('Movido para a lixeira.', 'info');
    await loadData(); setSelected(new Set()); setActionLoading(false);
  };

  const handlePaymentConfirm = (oscId: string, pagId: string) => {
    setAll(prev => prev.map(osc => {
      if (osc.id !== oscId) return osc;
      return {
        ...osc,
        pagamentos: osc.pagamentos.map(p => p.id === pagId ? { ...p, status: 'pago', paid_at: new Date().toISOString() } : p)
      };
    }));
  };

  const handleApprove = async (oscId: string, relId: string) => {
    await supabase.from('relatorios_conformidade').update({ status: 'aprovado', updated_at: new Date().toISOString() }).eq('id', relId);
    await supabase.from('osc_perfis').update({ status_selo: 'aprovado', observacao_selo: null, updated_at: new Date().toISOString() }).eq('id', oscId);
    
    setAll(prev => prev.map(o => {
      if (o.id !== oscId) return o;
      return {
        ...o,
        status_selo: 'aprovado',
        relatorios: o.relatorios.map(r => r.id === relId ? { ...r, status: 'aprovado' } : r)
      };
    }));
    toast('Processo aprovado e selo emitido com sucesso!', 'success');
  };

  const handleReject = async (oscId: string, relId: string, obs: string) => {
    await supabase.from('relatorios_conformidade').update({ status: 'reprovado', observacao_admin: obs, updated_at: new Date().toISOString() }).eq('id', relId);
    await supabase.from('osc_perfis').update({ status_selo: 'rejeitado', observacao_selo: obs, updated_at: new Date().toISOString() }).eq('id', oscId);
    
    setAll(prev => prev.map(o => {
      if (o.id !== oscId) return o;
      return {
        ...o,
        status_selo: 'rejeitado',
        relatorios: o.relatorios.map(r => r.id === relId ? { ...r, status: 'reprovado' } : r)
      };
    }));
    toast('Processo rejeitado. OSC notificada.', 'info');
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: 24 }}>
            <Skeleton height="40px" borderRadius="10px" />
            <Skeleton height="50px" borderRadius="10px" />
            <Skeleton height="50px" borderRadius="10px" />
            <Skeleton height="50px" borderRadius="10px" />
            <Skeleton height="50px" borderRadius="10px" />
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
                  const hasPendingPayment = osc.pagamentos.some(p => p.status !== 'pago');
                  return (
                    <tr key={osc.id}
                      style={{ cursor: 'default', opacity: actionLoading && selected.has(osc.id) ? 0.5 : 1 }}>
                      <td onClick={e => e.stopPropagation()}>
                        <input type="checkbox" checked={selected.has(osc.id)} onChange={() => toggleSelect(osc.id)}
                          style={{ cursor: 'pointer', accentColor: 'var(--admin-primary)' }} />
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
                      <td onClick={e => e.stopPropagation()} style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: 6, alignItems: 'center', justifyContent: 'flex-end' }}>
                          <button onClick={() => setReviewOscId(osc.id)} title="Avaliar processo"
                            style={{ height: '36px', padding: '0 12px', border: 'none', borderRadius: '8px', background: 'var(--admin-primary)', color: '#fff', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap' }}>
                            <CheckCircle size={14} /> Avaliar
                          </button>
                          <Link href={`/gestao/dashboard/oscs/${osc.id}`} title="Ver perfil completo"
                            style={{ height: '36px', padding: '0 12px', borderRadius: '8px', background: 'var(--admin-surface)', border: '1px solid var(--admin-border)', color: 'var(--admin-text-primary)', fontSize: '0.82rem', fontWeight: 700, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap' }}>
                            <Eye size={14} /> Perfil
                          </Link>
                          <button onClick={() => handleMoveToTrash([osc.id])} disabled={actionLoading} title="Mover para lixeira" aria-label="Mover para lixeira"
                            style={{ width: '36px', height: '36px', flexShrink: 0, border: 'none', borderRadius: '8px', background: 'rgba(220,38,38,0.08)', color: '#dc2626', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {reviewOscId && (
        <ReviewModal 
          osc={all.find(o => o.id === reviewOscId)!} 
          onClose={() => setReviewOscId(null)} 
          onApprove={handleApprove} 
          onReject={handleReject} 
        />
      )}

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
