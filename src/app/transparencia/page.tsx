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

function isUrl(str: string) {
  try { return Boolean(new URL(str)); } catch { return false; }
}

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
    async function fetchRecords() {
      const { data } = await supabase
        .from('transparency_records')
        .select('*')
        .order('created_at', { ascending: false });
      if (data) setRecords(data);
      setLoading(false);
    }
    fetchRecords();
  }, []);

  const modalidades = [...new Set(records.map(r => r.modalidade).filter(Boolean))];
  const anos = [...new Set(records.map(r => r.ano_emenda).filter(Boolean))].sort((a, b) => (b || '').localeCompare(a || ''));

  const filtered = records.filter(r => {
    if (filterModalidade && r.modalidade !== filterModalidade) return false;
    if (filterAno && r.ano_emenda !== filterAno) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      (r.proponente || '').toLowerCase().includes(q) ||
      (r.parlamentar || '').toLowerCase().includes(q) ||
      (r.objeto || '').toLowerCase().includes(q) ||
      (r.orgao_concedente || '').toLowerCase().includes(q) ||
      (r.modalidade || '').toLowerCase().includes(q) ||
      (r.num_instrumento || '').toLowerCase().includes(q)
    );
  });

  const selectStyle: React.CSSProperties = {
    padding: '10px 14px',
    border: '1px solid var(--site-border)',
    borderRadius: 'var(--site-radius-md)',
    background: 'var(--site-surface)',
    fontSize: '0.85rem',
    color: 'var(--site-text-primary)',
    cursor: 'pointer',
    outline: 'none',
    minWidth: 150,
  };

  return (
    <PublicLayout>
      {/* ════════ HERO ════════ */}
      <section className="glass-section-blue page-hero">
        <div className="container">
          <div className="hero-badge">
            <Shield size={14} />
            PORTAL DE TRANSPARÊNCIA
          </div>
          <h1>Transparência Pública</h1>
          <p className="hero-subtitle">
            Informações sobre convênios, emendas parlamentares e prestações de contas da OBGP, em cumprimento aos princípios da gestão pública transparente.
          </p>

          {/* Busca */}
          <div style={{ maxWidth: 560, margin: '32px auto 0', position: 'relative' }}>
            <Search size={18} style={{
              position: 'absolute', left: 18, top: '50%', transform: 'translateY(-50%)',
              color: 'rgba(255,255,255,0.5)', pointerEvents: 'none',
            }} />
            <input
              type="text"
              placeholder="Buscar por proponente, parlamentar, objeto..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                width: '100%', padding: '16px 20px 16px 50px',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: 'var(--site-radius-full)',
                background: 'rgba(255,255,255,0.1)',
                backdropFilter: 'blur(12px)',
                fontSize: '0.95rem', color: '#fff',
                outline: 'none', boxSizing: 'border-box',
                transition: 'all 0.3s ease',
              }}
              onFocus={e => {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.4)';
                e.currentTarget.style.background = 'rgba(255,255,255,0.15)';
              }}
              onBlur={e => {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
                e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
              }}
            />
          </div>
        </div>
      </section>

      {/* ════════ CONTEÚDO ════════ */}
      <section className="section-padding">
        <div className="container">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '80px 0' }}>
              <Loader2 size={32} style={{ animation: 'spin 1s linear infinite', color: 'var(--site-primary)' }} />
              <p style={{ marginTop: 16, fontSize: '0.95rem', color: 'var(--site-text-secondary)' }}>Carregando registros...</p>
            </div>
          ) : records.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--site-text-tertiary)' }}>
              <FolderOpen size={40} style={{ opacity: 0.3, marginBottom: 16 }} />
              <p style={{ fontSize: '1.1rem', fontWeight: 500, color: 'var(--site-text-secondary)', marginBottom: 8 }}>
                Nenhum registro disponível
              </p>
              <p style={{ fontSize: '0.9rem' }}>Os documentos de transparência serão publicados em breve.</p>
            </div>
          ) : (
            <>
              {/* Filtros */}
              <div style={{
                display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center',
                marginBottom: 32, justifyContent: 'space-between',
              }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
                  <Filter size={16} style={{ color: 'var(--site-text-tertiary)' }} />
                  {modalidades.length > 0 && (
                    <select value={filterModalidade} onChange={e => setFilterModalidade(e.target.value)} style={selectStyle}>
                      <option value="">Todas as modalidades</option>
                      {modalidades.map(m => <option key={m} value={m!}>{m}</option>)}
                    </select>
                  )}
                  {anos.length > 0 && (
                    <select value={filterAno} onChange={e => setFilterAno(e.target.value)} style={selectStyle}>
                      <option value="">Todos os anos</option>
                      {anos.map(a => <option key={a} value={a!}>{a}</option>)}
                    </select>
                  )}
                  {(filterModalidade || filterAno) && (
                    <button
                      onClick={() => { setFilterModalidade(''); setFilterAno(''); }}
                      style={{
                        padding: '10px 16px', border: 'none', borderRadius: 'var(--site-radius-md)',
                        background: '#fee2e2', color: '#dc2626',
                        fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer',
                      }}
                    >
                      Limpar filtros
                    </button>
                  )}
                </div>
                <p style={{ color: 'var(--site-text-tertiary)', fontSize: '0.85rem', fontWeight: 500 }}>
                  {filtered.length} registro{filtered.length !== 1 ? 's' : ''}
                </p>
              </div>

              {filtered.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--site-text-tertiary)' }}>
                  <Search size={36} style={{ opacity: 0.3, marginBottom: 12 }} />
                  <p style={{ fontSize: '1rem', fontWeight: 500 }}>Nenhum registro encontrado.</p>
                </div>
              ) : (
                <div className="grid-2">
                  {filtered.map((r, idx) => {
                    const isExpanded = expandedId === r.id;
                    return (
                      <div
                        key={r.id}
                        className={`glass-panel stagger-${Math.min(idx + 1, 8)}`}
                        style={{
                          overflow: 'hidden',
                          transition: 'all 0.3s var(--ease-out)',
                          transform: isExpanded ? 'translateY(-2px)' : 'none',
                        }}
                      >
                        {/* Header */}
                        <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid var(--site-border)' }}>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
                            {r.modalidade && (
                              <span style={{
                                padding: '4px 10px', fontSize: '0.7rem', fontWeight: 700,
                                letterSpacing: '0.04em', textTransform: 'uppercase',
                                background: 'var(--site-surface-blue)', color: 'var(--site-primary)',
                                borderRadius: 'var(--site-radius-sm)',
                              }}>
                                {r.modalidade}
                              </span>
                            )}
                            {r.ano_emenda && (
                              <span style={{
                                display: 'inline-flex', alignItems: 'center', gap: 4,
                                padding: '4px 10px', fontSize: '0.7rem', fontWeight: 600,
                                background: 'var(--site-bg)', color: 'var(--site-text-secondary)',
                                borderRadius: 'var(--site-radius-sm)',
                              }}>
                                <Calendar size={11} /> {r.ano_emenda}
                              </span>
                            )}
                          </div>
                          <h3 style={{
                            fontSize: '1rem', fontWeight: 700, lineHeight: 1.4, marginBottom: 10,
                            display: '-webkit-box', WebkitLineClamp: isExpanded ? 999 : 2,
                            WebkitBoxOrient: 'vertical', overflow: 'hidden',
                          }}>
                            {r.objeto || 'Sem descrição do objeto'}
                          </h3>
                          {r.proponente && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85rem', color: 'var(--site-text-secondary)' }}>
                              <Building2 size={14} style={{ color: 'var(--site-primary)', flexShrink: 0 }} />
                              <span style={{ fontWeight: 500 }}>{r.proponente}</span>
                            </div>
                          )}
                        </div>

                        {/* Valores */}
                        <div style={{ padding: '16px 24px' }}>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 20px' }}>
                            <div>
                              <div style={{ fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--site-text-tertiary)', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                                <DollarSign size={11} /> Valor
                              </div>
                              <div style={{ fontSize: '1.05rem', fontWeight: 700, color: r.valor ? 'var(--site-accent)' : 'var(--site-text-tertiary)', fontFamily: 'var(--font-outfit)' }}>
                                {formatCurrency(r.valor)}
                              </div>
                            </div>
                            <div>
                              <div style={{ fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--site-text-tertiary)', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                                <DollarSign size={11} /> Valor Emenda
                              </div>
                              <div style={{ fontSize: '1.05rem', fontWeight: 700, color: r.valor_emenda ? 'var(--site-primary)' : 'var(--site-text-tertiary)', fontFamily: 'var(--font-outfit)' }}>
                                {formatCurrency(r.valor_emenda)}
                              </div>
                            </div>
                          </div>

                          {/* Expandido */}
                          {isExpanded && (
                            <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--site-border)', display: 'flex', flexDirection: 'column', gap: 12, animation: 'slideDown 0.3s ease-out' }}>
                              {[
                                { label: 'Parlamentar', value: r.parlamentar, icon: User },
                                { label: 'Órgão Concedente', value: r.orgao_concedente, icon: Landmark },
                                { label: 'Nº Instrumento', value: r.num_instrumento, icon: Hash },
                                { label: 'Nº Emenda', value: r.num_emenda, icon: Hash },
                              ].map(item => (
                                <div key={item.label} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                                  <item.icon size={14} style={{ color: 'var(--site-text-tertiary)', marginTop: 3, flexShrink: 0 }} />
                                  <div>
                                    <div style={{ fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', color: 'var(--site-text-tertiary)', marginBottom: 2 }}>
                                      {item.label}
                                    </div>
                                    <div style={{ fontSize: '0.9rem', fontWeight: 500, color: item.value ? 'var(--site-text-primary)' : 'var(--site-text-tertiary)' }}>
                                      {item.value || '—'}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Footer */}
                        <div style={{
                          padding: '12px 24px 16px', borderTop: '1px solid var(--site-border)',
                          display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 10,
                        }}>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                            {r.prestacao_contas ? (
                              isUrl(r.prestacao_contas) ? (
                                <a
                                  href={r.prestacao_contas}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="btn"
                                  style={{ padding: '8px 16px', fontSize: '0.82rem', background: 'var(--site-primary)', color: 'white', borderRadius: 'var(--site-radius-md)' }}
                                >
                                  <FileCheck size={14} /> Ver documento <ExternalLink size={12} />
                                </a>
                              ) : (
                                <span style={{ padding: '8px 14px', fontSize: '0.82rem', fontWeight: 500, color: 'var(--site-text-secondary)', background: 'var(--site-bg)', borderRadius: 'var(--site-radius-md)', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                                  <FileCheck size={14} /> {r.prestacao_contas}
                                </span>
                              )
                            ) : (
                              <span style={{ fontSize: '0.8rem', color: 'var(--site-text-tertiary)', fontStyle: 'italic' }}>
                                Prestação de contas pendente
                              </span>
                            )}
                            {r.pdf_url && (
                              <a
                                href={r.pdf_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn"
                                style={{ padding: '8px 16px', fontSize: '0.82rem', background: '#dc2626', color: 'white', borderRadius: 'var(--site-radius-md)' }}
                              >
                                <FileText size={14} /> PDF <Download size={12} />
                              </a>
                            )}
                          </div>

                          <button
                            onClick={() => setExpandedId(isExpanded ? null : r.id)}
                            style={{
                              display: 'flex', alignItems: 'center', gap: 5,
                              padding: '8px 14px', border: '1px solid var(--site-border)',
                              borderRadius: 'var(--site-radius-md)',
                              background: 'transparent', fontSize: '0.8rem', fontWeight: 600,
                              color: 'var(--site-text-secondary)', cursor: 'pointer',
                              transition: 'all 0.2s ease',
                            }}
                          >
                            {isExpanded ? 'Menos' : 'Detalhes'}
                            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
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
