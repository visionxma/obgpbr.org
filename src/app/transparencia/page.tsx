'use client';

import { useState, useEffect } from 'react';
import PublicLayout from '../components/PublicLayout';
import { supabase } from '@/lib/supabase';
import {
  Search, Loader2, FolderOpen, ExternalLink, Building2, User,
  FileCheck, Calendar, DollarSign, Hash, Landmark, ScrollText,
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
  // already formatted
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

  // Unique values for filters
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
      (r.num_instrumento || '').toLowerCase().includes(q) ||
      (r.num_emenda || '').toLowerCase().includes(q) ||
      (r.ano_emenda || '').toLowerCase().includes(q)
    );
  });

  const totalRecords = records.length;
  const uniqueOrgaos = new Set(records.map(r => r.orgao_concedente).filter(Boolean)).size;
  const uniqueParlamentares = new Set(records.map(r => r.parlamentar).filter(Boolean)).size;

  return (
    <PublicLayout>
      <main className="animate-fade-up" style={{ background: 'var(--site-bg)' }}>

        {/* HERO */}
        <section style={{
          background: 'var(--site-primary)',
          backgroundImage: 'linear-gradient(135deg, #0D364F 0%, #23475E 50%, #12242B 100%)',
          position: 'relative',
          overflow: 'hidden',
          padding: '100px 0 80px',
          textAlign: 'center',
        }}>
          {/* Decorative elements */}
          <div style={{
            position: 'absolute', top: -60, right: -60,
            width: 300, height: 300, borderRadius: '50%',
            background: 'rgba(255,255,255,0.04)', pointerEvents: 'none'
          }} />
          <div style={{
            position: 'absolute', bottom: -80, left: -40,
            width: 400, height: 400, borderRadius: '50%',
            background: 'rgba(255,255,255,0.03)', pointerEvents: 'none'
          }} />
          <div style={{
            position: 'absolute', inset: 0,
            pointerEvents: 'none'
          }} />

          <div className="container" style={{ position: 'relative', zIndex: 1 }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              color: 'rgba(255,255,255,0.9)', padding: '8px 20px',
              fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.1em',
              marginBottom: 24, border: '1px solid rgba(255,255,255,0.2)',
              background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)',
            }}>
              <Shield size={14} />
              PORTAL DE TRANSPARÊNCIA
            </div>
            <h1 style={{ fontSize: 'clamp(2.2rem, 5vw, 3.5rem)', color: '#fff', marginBottom: 16, letterSpacing: '-0.02em' }}>
              Transparência Pública
            </h1>
            <p style={{
              fontSize: '1.05rem', color: 'rgba(255,255,255,0.75)',
              maxWidth: 620, margin: '0 auto 40px', lineHeight: 1.7
            }}>
              Informações sobre convênios, emendas parlamentares e prestações de contas do Instituto Gênesis, em cumprimento aos princípios da gestão pública transparente.
            </p>

            {/* Search */}
            <div style={{ maxWidth: 560, margin: '0 auto', position: 'relative' }}>
              <Search size={18} style={{
                position: 'absolute', left: 18, top: '50%', transform: 'translateY(-50%)',
                color: 'rgba(255,255,255,0.5)', pointerEvents: 'none'
              }} />
              <input
                type="text"
                placeholder="Buscar por proponente, parlamentar, objeto..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{
                  width: '100%', padding: '16px 20px 16px 50px',
                  border: '1px solid rgba(255,255,255,0.2)',
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



        {/* FILTERS + CARDS */}
        <section style={{ padding: '48px 0 100px' }}>
          <div className="container">

            {loading ? (
              <div style={{
                display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
                padding: '100px 0', gap: 16, color: 'var(--site-text-secondary)'
              }}>
                <Loader2 size={32} style={{ animation: 'spin 1s linear infinite', color: 'var(--site-primary)' }} />
                <span style={{ fontSize: '0.95rem' }}>Carregando registros...</span>
              </div>
            ) : records.length === 0 ? (
              <div style={{
                textAlign: 'center', padding: '100px 0',
                color: 'var(--site-text-tertiary)',
              }}>
                <div style={{
                  width: 80, height: 80, margin: '0 auto 20px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: 'var(--site-surface)', border: '1px solid var(--site-border)',
                }}>
                  <FolderOpen size={36} style={{ opacity: 0.4 }} />
                </div>
                <p style={{ fontSize: '1.15rem', fontWeight: 500, marginBottom: 8, color: 'var(--site-text-secondary)' }}>
                  Nenhum registro disponível
                </p>
                <p style={{ fontSize: '0.9rem' }}>
                  Os documentos de transparência serão publicados em breve.
                </p>
              </div>
            ) : (
              <>
                {/* Filters Row */}
                <div style={{
                  display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center',
                  marginBottom: 32, justifyContent: 'space-between',
                }}>
                  <div style={{
                    display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center',
                  }}>
                    <Filter size={16} style={{ color: 'var(--site-text-tertiary)' }} />
                    {modalidades.length > 0 && (
                      <select
                        value={filterModalidade}
                        onChange={e => setFilterModalidade(e.target.value)}
                        style={{
                          padding: '10px 14px', border: '1px solid var(--site-border)',
                          background: 'var(--site-surface)', fontSize: '0.85rem',
                          color: 'var(--site-text-primary)', cursor: 'pointer', outline: 'none',
                          minWidth: 160,
                        }}
                      >
                        <option value="">Todas as modalidades</option>
                        {modalidades.map(m => <option key={m} value={m!}>{m}</option>)}
                      </select>
                    )}
                    {anos.length > 0 && (
                      <select
                        value={filterAno}
                        onChange={e => setFilterAno(e.target.value)}
                        style={{
                          padding: '10px 14px', border: '1px solid var(--site-border)',
                          background: 'var(--site-surface)', fontSize: '0.85rem',
                          color: 'var(--site-text-primary)', cursor: 'pointer', outline: 'none',
                          minWidth: 130,
                        }}
                      >
                        <option value="">Todos os anos</option>
                        {anos.map(a => <option key={a} value={a!}>{a}</option>)}
                      </select>
                    )}
                    {(filterModalidade || filterAno) && (
                      <button
                        onClick={() => { setFilterModalidade(''); setFilterAno(''); }}
                        style={{
                          padding: '10px 16px', border: 'none',
                          background: '#fee2e2', color: '#dc2626',
                          fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer',
                        }}
                      >
                        Limpar filtros
                      </button>
                    )}
                  </div>
                  <p style={{ color: 'var(--site-text-tertiary)', fontSize: '0.85rem', fontWeight: 500 }}>
                    {filtered.length} registro{filtered.length !== 1 ? 's' : ''} encontrado{filtered.length !== 1 ? 's' : ''}
                  </p>
                </div>

                {filtered.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--site-text-tertiary)' }}>
                    <Search size={36} style={{ opacity: 0.3, marginBottom: 12 }} />
                    <p style={{ fontSize: '1rem', fontWeight: 500 }}>Nenhum registro encontrado para essa busca.</p>
                  </div>
                ) : (
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(min(420px, 100%), 1fr))',
                    gap: '24px',
                  }}>
                    {filtered.map((r, idx) => {
                      const isExpanded = expandedId === r.id;
                      return (
                        <div
                          key={r.id}
                          style={{
                            background: 'var(--site-surface)',
                            border: '1px solid var(--site-border)',
                            boxShadow: isExpanded ? '0 8px 30px rgba(0,0,0,0.08)' : 'var(--site-shadow-sm)',
                            transition: 'all 0.3s cubic-bezier(0.22, 1, 0.36, 1)',
                            overflow: 'hidden',
                            animationDelay: `${idx * 0.05}s`,
                            transform: isExpanded ? 'translateY(-2px)' : 'none',
                          }}
                          onMouseEnter={e => {
                            if (!isExpanded) e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.06)';
                          }}
                          onMouseLeave={e => {
                            if (!isExpanded) e.currentTarget.style.boxShadow = 'var(--site-shadow-sm)';
                          }}
                        >
                          {/* Card Header */}
                          <div style={{
                            padding: '20px 24px 16px',
                            borderBottom: '1px solid var(--site-border)',
                          }}>
                            {/* Top row - badges */}
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 14, alignItems: 'center' }}>
                              {r.modalidade && (
                                <span style={{
                                  display: 'inline-flex', alignItems: 'center', gap: 5,
                                  padding: '4px 10px', fontSize: '0.72rem', fontWeight: 700,
                                  letterSpacing: '0.04em', textTransform: 'uppercase',
                                  background: '#0D364F10', color: '#0D364F',
                                  border: '1px solid #0D364F20',
                                }}>
                                  {r.modalidade}
                                </span>
                              )}
                              {r.ano_emenda && (
                                <span style={{
                                  display: 'inline-flex', alignItems: 'center', gap: 4,
                                  padding: '4px 10px', fontSize: '0.72rem', fontWeight: 600,
                                  background: '#F2F4F4', color: 'var(--site-text-secondary)',
                                  border: '1px solid var(--site-border)',
                                }}>
                                  <Calendar size={11} />
                                  {r.ano_emenda}
                                </span>
                              )}
                            </div>

                            {/* Object / Title */}
                            <h3 style={{
                              fontSize: '1rem', fontWeight: 700, lineHeight: 1.4,
                              color: 'var(--site-text-primary)', marginBottom: 10,
                              display: '-webkit-box', WebkitLineClamp: isExpanded ? 999 : 2,
                              WebkitBoxOrient: 'vertical', overflow: 'hidden',
                            }}>
                              {r.objeto || 'Sem descrição do objeto'}
                            </h3>

                            {/* Proponente */}
                            {r.proponente && (
                              <div style={{
                                display: 'flex', alignItems: 'center', gap: 8,
                                fontSize: '0.85rem', color: 'var(--site-text-secondary)',
                              }}>
                                <Building2 size={14} style={{ color: 'var(--site-primary)', flexShrink: 0 }} />
                                <span style={{ fontWeight: 500 }}>{r.proponente}</span>
                              </div>
                            )}
                          </div>

                          {/* Card Body - Key info */}
                          <div style={{ padding: '16px 24px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 20px' }}>
                              {/* Valor */}
                              <div>
                                <div style={{
                                  fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.06em',
                                  textTransform: 'uppercase', color: 'var(--site-text-tertiary)',
                                  marginBottom: 4, display: 'flex', alignItems: 'center', gap: 4,
                                }}>
                                  <DollarSign size={11} />
                                  Valor
                                </div>
                                <div style={{
                                  fontSize: '1.05rem', fontWeight: 700,
                                  color: r.valor ? '#26662F' : 'var(--site-text-tertiary)',
                                  fontFamily: 'var(--font-outfit)',
                                }}>
                                  {formatCurrency(r.valor)}
                                </div>
                              </div>

                              {/* Valor Emenda */}
                              <div>
                                <div style={{
                                  fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.06em',
                                  textTransform: 'uppercase', color: 'var(--site-text-tertiary)',
                                  marginBottom: 4, display: 'flex', alignItems: 'center', gap: 4,
                                }}>
                                  <DollarSign size={11} />
                                  Valor Emenda
                                </div>
                                <div style={{
                                  fontSize: '1.05rem', fontWeight: 700,
                                  color: r.valor_emenda ? '#23475E' : 'var(--site-text-tertiary)',
                                  fontFamily: 'var(--font-outfit)',
                                }}>
                                  {formatCurrency(r.valor_emenda)}
                                </div>
                              </div>
                            </div>

                            {/* Expandable section */}
                            {isExpanded && (
                              <div style={{
                                marginTop: 16, paddingTop: 16,
                                borderTop: '1px solid var(--site-border)',
                                display: 'flex', flexDirection: 'column', gap: 12,
                                animation: 'slideDown 0.3s ease-out',
                              }}>
                                {[
                                  { label: 'Parlamentar', value: r.parlamentar, icon: User },
                                  { label: 'Órgão Concedente', value: r.orgao_concedente, icon: Landmark },
                                  { label: 'Nº Instrumento', value: r.num_instrumento, icon: Hash },
                                  { label: 'Nº Emenda', value: r.num_emenda, icon: Hash },
                                ].map(item => (
                                  <div key={item.label} style={{
                                    display: 'flex', alignItems: 'flex-start', gap: 10,
                                  }}>
                                    <item.icon size={14} style={{
                                      color: 'var(--site-text-tertiary)', marginTop: 3, flexShrink: 0,
                                    }} />
                                    <div>
                                      <div style={{
                                        fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.04em',
                                        textTransform: 'uppercase', color: 'var(--site-text-tertiary)',
                                        marginBottom: 2,
                                      }}>
                                        {item.label}
                                      </div>
                                      <div style={{
                                        fontSize: '0.9rem', fontWeight: 500,
                                        color: item.value ? 'var(--site-text-primary)' : 'var(--site-text-tertiary)',
                                      }}>
                                        {item.value || '—'}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Card Footer */}
                          <div style={{
                            padding: '12px 24px 16px',
                            borderTop: '1px solid var(--site-border)',
                            display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center',
                            gap: 10, background: 'rgba(0,0,0,0.01)',
                          }}>
                            {/* Action buttons row */}
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
                              {/* Prestação de Contas */}
                              {r.prestacao_contas ? (
                                isUrl(r.prestacao_contas) ? (
                                  <a
                                    href={r.prestacao_contas}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{
                                      display: 'inline-flex', alignItems: 'center', gap: 6,
                                      padding: '8px 16px', fontSize: '0.82rem', fontWeight: 600,
                                      color: '#fff', background: 'var(--site-primary)',
                                      textDecoration: 'none', transition: 'all 0.2s ease',
                                    }}
                                    onMouseEnter={e => {
                                      e.currentTarget.style.background = 'var(--site-primary-hover)';
                                      e.currentTarget.style.transform = 'translateY(-1px)';
                                    }}
                                    onMouseLeave={e => {
                                      e.currentTarget.style.background = 'var(--site-primary)';
                                      e.currentTarget.style.transform = 'translateY(0)';
                                    }}
                                  >
                                    <FileCheck size={14} />
                                    Ver documento
                                    <ExternalLink size={12} />
                                  </a>
                                ) : (
                                  <span style={{
                                    display: 'inline-flex', alignItems: 'center', gap: 6,
                                    padding: '8px 14px', fontSize: '0.82rem', fontWeight: 500,
                                    color: 'var(--site-text-secondary)', background: '#F2F4F4',
                                    border: '1px solid var(--site-border)',
                                  }}>
                                    <FileCheck size={14} />
                                    {r.prestacao_contas}
                                  </span>
                                )
                              ) : (
                                <span style={{
                                  fontSize: '0.8rem', color: 'var(--site-text-tertiary)',
                                  fontStyle: 'italic',
                                }}>
                                  Prestação de contas pendente
                                </span>
                              )}

                              {/* PDF Button */}
                              {r.pdf_url && (
                                <a
                                  href={r.pdf_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  style={{
                                    display: 'inline-flex', alignItems: 'center', gap: 6,
                                    padding: '8px 16px', fontSize: '0.82rem', fontWeight: 600,
                                    color: '#fff', background: '#dc2626',
                                    textDecoration: 'none', transition: 'all 0.2s ease',
                                  }}
                                  onMouseEnter={e => {
                                    e.currentTarget.style.background = '#b91c1c';
                                    e.currentTarget.style.transform = 'translateY(-1px)';
                                  }}
                                  onMouseLeave={e => {
                                    e.currentTarget.style.background = '#dc2626';
                                    e.currentTarget.style.transform = 'translateY(0)';
                                  }}
                                >
                                  <FileText size={14} />
                                  Baixar PDF
                                  <Download size={12} />
                                </a>
                              )}
                            </div>

                            {/* Expand/Collapse */}
                            <button
                              onClick={() => setExpandedId(isExpanded ? null : r.id)}
                              style={{
                                display: 'flex', alignItems: 'center', gap: 5,
                                padding: '8px 14px', border: '1px solid var(--site-border)',
                                background: 'transparent', fontSize: '0.8rem', fontWeight: 600,
                                color: 'var(--site-text-secondary)', cursor: 'pointer',
                                transition: 'all 0.2s ease',
                              }}
                              onMouseEnter={e => {
                                e.currentTarget.style.background = 'var(--site-surface)';
                                e.currentTarget.style.color = 'var(--site-primary)';
                                e.currentTarget.style.borderColor = 'var(--site-primary)';
                              }}
                              onMouseLeave={e => {
                                e.currentTarget.style.background = 'transparent';
                                e.currentTarget.style.color = 'var(--site-text-secondary)';
                                e.currentTarget.style.borderColor = 'var(--site-border)';
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
      </main>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        input::placeholder {
          color: rgba(255,255,255,0.45) !important;
        }

        @media (max-width: 500px) {
          .container {
            padding: 0 4% !important;
          }
        }

        @media (max-width: 420px) {
          div[style*="gridTemplateColumns: repeat(auto-fill, minmax(380px"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </PublicLayout>
  );
}
