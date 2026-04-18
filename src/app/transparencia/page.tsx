'use client';

import { useState, useEffect } from 'react';
import PublicLayout from '../components/PublicLayout';
import { supabase } from '@/lib/supabase';
import {
  Search, Loader2, FolderOpen, ExternalLink, Building2, User,
  FileCheck, Calendar, DollarSign, Hash, Landmark,
  Filter, ChevronDown, ChevronUp, Shield, FileText, Download
} from 'lucide-react';

interface TransparencyRecord {
  id: string;
  proponente: string | null;
  parlamentar: string | null;
  modalidade: string | null;
  objeto: string | null;
  orgao_concedente: string | null;
  num_instrumento: string | null;
  num_emenda: string | null;
  ano_emenda: string | null;
  valor: string | null;
  valor_emenda: string | null;
  prestacao_contas: string | null;
  pdf_url: string | null;
  created_at: string;
}

function isUrl(str: string) { try { return Boolean(new URL(str)); } catch { return false; } }

function formatCurrency(val: string | null): string {
  if (!val) return '—';
  if (val.includes('R$')) return val;
  const num = parseFloat(val.replace(/[^\d.,]/g, '').replace(',', '.'));
  if (isNaN(num)) return val;
  return num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export default function Transparencia() {
  const [records, setRecords] = useState<TransparencyRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filterModalidade, setFilterModalidade] = useState('');
  const [filterAno, setFilterAno] = useState('');

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('transparency_records').select('*').order('created_at', { ascending: false });
      if (data) setRecords(data);
      setLoading(false);
    })();
  }, []);

  const modalidades = [...new Set(records.map(r => r.modalidade).filter(Boolean))];
  const anos = [...new Set(records.map(r => r.ano_emenda).filter(Boolean))].sort((a, b) => (b || '').localeCompare(a || ''));

  const filtered = records.filter(r => {
    if (filterModalidade && r.modalidade !== filterModalidade) return false;
    if (filterAno && r.ano_emenda !== filterAno) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return [r.proponente, r.parlamentar, r.objeto, r.orgao_concedente, r.modalidade, r.num_instrumento]
      .some(f => (f || '').toLowerCase().includes(q));
  });

  const sel: React.CSSProperties = {
    padding: '10px 14px', border: '1px solid var(--site-border)',
    borderRadius: 'var(--site-radius-full)', background: 'var(--site-surface)',
    fontSize: 'var(--text-sm)', color: 'var(--site-text-primary)', cursor: 'pointer', outline: 'none', minWidth: 150,
  };

  return (
    <PublicLayout>
      {/* ═══ HERO ═══ */}
      <section className="glass-section-blue page-hero">
        <div className="container">
          <div className="hero-badge"><Shield size={13} /> PORTAL DE TRANSPARÊNCIA</div>
          <h1 style={{ maxWidth: 620, margin: '0 auto 20px' }}>
            Transparência{' '}
            <span className="hero-accent-white">pública</span>
          </h1>
          <p className="hero-subtitle">
            Convênios, emendas parlamentares e prestações de contas em cumprimento aos princípios da gestão pública transparente.
          </p>

          {/* Busca */}
          <div style={{ maxWidth: 540, margin: '32px auto 0', position: 'relative' }}>
            <Search size={17} style={{
              position: 'absolute', left: 20, top: '50%', transform: 'translateY(-50%)',
              color: 'rgba(255,255,255,0.45)', pointerEvents: 'none',
            }} />
            <input
              type="text" placeholder="Buscar por proponente, parlamentar, objeto..."
              value={search} onChange={e => setSearch(e.target.value)}
              style={{
                width: '100%', padding: '15px 22px 15px 50px',
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: 'var(--site-radius-full)',
                background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(12px)',
                fontSize: '.93rem', color: '#fff', outline: 'none', transition: 'all .3s ease',
              }}
              onFocus={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.35)'; e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; }}
              onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
            />
          </div>
          <div className="hero-divider" />
        </div>
      </section>

      {/* ═══ CONTEÚDO ═══ */}
      <section className="section-padding">
        <div className="container">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '100px 0' }}>
              <Loader2 size={32} style={{ animation: 'spin 1s linear infinite', color: 'var(--site-primary)' }} />
              <p style={{ marginTop: 16, color: 'var(--site-text-secondary)', fontSize: '.93rem' }}>Carregando registros...</p>
            </div>
          ) : records.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '100px 0' }}>
              <div style={{
                width: 80, height: 80, borderRadius: '50%', background: 'var(--site-surface-blue)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px',
              }}>
                <FolderOpen size={32} style={{ color: 'var(--site-primary)', opacity: 0.5 }} />
              </div>
              <h3 style={{ marginBottom: 8, color: 'var(--site-text-secondary)' }}>Nenhum registro disponível</h3>
              <p style={{ color: 'var(--site-text-tertiary)', fontSize: '.93rem' }}>Os documentos serão publicados em breve.</p>
            </div>
          ) : (
            <>
              {/* Filtros */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center', marginBottom: 36, justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
                  <Filter size={15} style={{ color: 'var(--site-text-tertiary)' }} />
                  {modalidades.length > 0 && (
                    <select value={filterModalidade} onChange={e => setFilterModalidade(e.target.value)} style={sel}>
                      <option value="">Todas as modalidades</option>
                      {modalidades.map(m => <option key={m} value={m!}>{m}</option>)}
                    </select>
                  )}
                  {anos.length > 0 && (
                    <select value={filterAno} onChange={e => setFilterAno(e.target.value)} style={sel}>
                      <option value="">Todos os anos</option>
                      {anos.map(a => <option key={a} value={a!}>{a}</option>)}
                    </select>
                  )}
                  {(filterModalidade || filterAno) && (
                    <button onClick={() => { setFilterModalidade(''); setFilterAno(''); }}
                      style={{ padding: '10px 18px', border: 'none', borderRadius: 'var(--site-radius-full)', background: '#fef2f2', color: '#dc2626', fontSize: '.82rem', fontWeight: 600, cursor: 'pointer' }}>
                      Limpar
                    </button>
                  )}
                </div>
                <p style={{ color: 'var(--site-text-tertiary)', fontSize: '.85rem', fontWeight: 500 }}>
                  {filtered.length} registro{filtered.length !== 1 ? 's' : ''}
                </p>
              </div>

              {filtered.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--site-text-tertiary)' }}>
                  <Search size={36} style={{ opacity: 0.25, marginBottom: 12 }} />
                  <p style={{ fontWeight: 500 }}>Nenhum registro encontrado.</p>
                </div>
              ) : (
                <div className="grid-2">
                  {filtered.map((r, idx) => {
                    const open = expandedId === r.id;
                    return (
                      <div key={r.id} className={`glass-panel stagger-${Math.min(idx + 1, 8)}`}
                        style={{ overflow: 'hidden', transform: open ? 'translateY(-4px)' : 'none' }}>
                        {/* Header */}
                        <div style={{ padding: '22px 24px 16px', borderBottom: '1px solid var(--site-border)' }}>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
                            {r.modalidade && (
                              <span className="overline" style={{ padding: '5px 12px', background: 'var(--site-surface-blue)', color: 'var(--site-primary)', borderRadius: 'var(--site-radius-full)' }}>
                                {r.modalidade}
                              </span>
                            )}
                            {r.ano_emenda && (
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '5px 12px', fontSize: 'var(--text-xs)', fontWeight: 600, background: 'var(--site-bg)', color: 'var(--site-text-secondary)', borderRadius: 'var(--site-radius-full)' }}>
                                <Calendar size={11} /> {r.ano_emenda}
                              </span>
                            )}
                          </div>
                          <h3 className="h4-label" style={{ marginBottom: 10, display: '-webkit-box', WebkitLineClamp: open ? 999 : 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                            {r.objeto || 'Sem descrição'}
                          </h3>
                          {r.proponente && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 'var(--text-sm)', color: 'var(--site-text-secondary)' }}>
                              <Building2 size={14} style={{ color: 'var(--site-primary)' }} />
                              <span style={{ fontWeight: 500 }}>{r.proponente}</span>
                            </div>
                          )}
                        </div>
                        {/* Valores */}
                        <div style={{ padding: '16px 24px' }}>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 20px' }}>
                            <div>
                              <div className="overline" style={{ color: 'var(--site-text-tertiary)', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                                <DollarSign size={10} /> Valor
                              </div>
                              <div className="h4-label" style={{ color: r.valor ? 'var(--site-accent)' : 'var(--site-text-tertiary)', fontFamily: 'var(--font-heading)' }}>
                                {formatCurrency(r.valor)}
                              </div>
                            </div>
                            <div>
                              <div className="overline" style={{ color: 'var(--site-text-tertiary)', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                                <DollarSign size={10} /> Emenda
                              </div>
                              <div className="h4-label" style={{ color: r.valor_emenda ? 'var(--site-primary)' : 'var(--site-text-tertiary)', fontFamily: 'var(--font-heading)' }}>
                                {formatCurrency(r.valor_emenda)}
                              </div>
                            </div>
                          </div>
                          {open && (
                            <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--site-border)', display: 'flex', flexDirection: 'column', gap: 12, animation: 'slideDown .3s ease-out' }}>
                              {[
                                { l: 'Parlamentar', v: r.parlamentar, ic: User },
                                { l: 'Órgão Concedente', v: r.orgao_concedente, ic: Landmark },
                                { l: 'Nº Instrumento', v: r.num_instrumento, ic: Hash },
                                { l: 'Nº Emenda', v: r.num_emenda, ic: Hash },
                              ].map(({ l, v, ic: Ic }) => (
                                <div key={l} style={{ display: 'flex', gap: 10 }}>
                                  <Ic size={14} style={{ color: 'var(--site-text-tertiary)', marginTop: 3 }} />
                                  <div>
                                    <div className="overline" style={{ color: 'var(--site-text-tertiary)', marginBottom: 2 }}>{l}</div>
                                    <div style={{ fontSize: 'var(--text-sm-plus)', fontWeight: 500, color: v ? 'var(--site-text-primary)' : 'var(--site-text-tertiary)' }}>{v || '—'}</div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                        {/* Footer */}
                        <div style={{ padding: '12px 24px 16px', borderTop: '1px solid var(--site-border)', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                            {r.prestacao_contas ? (
                              isUrl(r.prestacao_contas) ? (
                                <a href={r.prestacao_contas} target="_blank" rel="noopener noreferrer"
                                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', fontSize: '.82rem', fontWeight: 600, background: 'var(--site-primary)', color: '#fff', borderRadius: 'var(--site-radius-full)', textDecoration: 'none' }}>
                                  <FileCheck size={13} /> Documento <ExternalLink size={11} />
                                </a>
                              ) : (
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 14px', fontSize: '.82rem', fontWeight: 500, color: 'var(--site-text-secondary)', background: 'var(--site-bg)', borderRadius: 'var(--site-radius-full)' }}>
                                  <FileCheck size={13} /> {r.prestacao_contas}
                                </span>
                              )
                            ) : (
                              <span style={{ fontSize: '.8rem', color: 'var(--site-text-tertiary)', fontStyle: 'italic' }}>Pendente</span>
                            )}
                            {r.pdf_url && (
                              <a href={r.pdf_url} target="_blank" rel="noopener noreferrer"
                                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', fontSize: '.82rem', fontWeight: 600, background: '#dc2626', color: '#fff', borderRadius: 'var(--site-radius-full)', textDecoration: 'none' }}>
                                <FileText size={13} /> PDF <Download size={11} />
                              </a>
                            )}
                          </div>
                          <button onClick={() => setExpandedId(open ? null : r.id)}
                            style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '8px 14px', border: '1px solid var(--site-border)', borderRadius: 'var(--site-radius-full)', background: 'transparent', fontSize: '.8rem', fontWeight: 600, color: 'var(--site-text-secondary)', cursor: 'pointer', transition: 'all .2s' }}>
                            {open ? 'Menos' : 'Detalhes'} {open ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </PublicLayout>
  );
}
