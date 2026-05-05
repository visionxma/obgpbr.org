'use client';

import { useState, useEffect } from 'react';
import PublicLayout from '../components/PublicLayout';
import { supabase } from '@/lib/supabase';
import {
  Search, Loader2, FolderOpen, ExternalLink, Building2, User,
  FileCheck, Calendar, DollarSign, Hash, Landmark,
  Filter, ChevronDown, ChevronUp, Shield, FileText, Download,
  Award, MapPin, ClipboardList, CheckCircle2, Users,
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

interface OscPublica {
  id: string;
  osc_id: string;
  razao_social: string | null;
  cnpj: string | null;
  municipio: string | null;
  estado: string | null;
  status_selo: string;
  updated_at: string;
  certificado_numero: string | null;
  certificado_emitido_at: string | null;
}

interface FormPublico {
  osc_id: string;
  titulo: string;
  tipo: string;
  updated_at: string;
}

interface PrestacaoPublica {
  osc_id: string;
  titulo: string;
  periodo: string | null;
  valor_total: number | null;
  status: string;
}

function isUrl(str: string) { try { return Boolean(new URL(str)); } catch { return false; } }

function formatCurrency(val: string | null | number): string {
  if (val === null || val === undefined || val === '') return '—';
  if (typeof val === 'number') return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  if (typeof val === 'string' && val.includes('R$')) return val;
  const num = parseFloat(String(val).replace(/[^\d.,]/g, '').replace(',', '.'));
  if (isNaN(num)) return String(val);
  return num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatCnpj(cnpj: string | null): string {
  if (!cnpj) return '—';
  const d = cnpj.replace(/\D/g, '');
  if (d.length !== 14) return cnpj;
  return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8, 12)}-${d.slice(12, 14)}`;
}

export default function Transparencia() {
  const [tab, setTab] = useState<'legislacao' | 'convenios' | 'oscs'>('legislacao');
  const [search, setSearch] = useState('');

  // Convênios
  const [records, setRecords] = useState<TransparencyRecord[]>([]);
  const [loadingRecords, setLoadingRecords] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filterModalidade, setFilterModalidade] = useState('');
  const [filterAno, setFilterAno] = useState('');

  // OSCs Certificadas
  const [oscs, setOscs] = useState<OscPublica[]>([]);
  const [forms, setForms] = useState<FormPublico[]>([]);
  const [prestacoes, setPrestacoes] = useState<PrestacaoPublica[]>([]);
  const [loadingOscs, setLoadingOscs] = useState(true);
  const [expandedOscId, setExpandedOscId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('transparency_records')
        .select('*')
        .order('created_at', { ascending: false });
      if (data) setRecords(data);
      setLoadingRecords(false);
    })();
  }, []);

  useEffect(() => {
    (async () => {
      const [{ data: perfis }, { data: formularios }, { data: pcs }] = await Promise.all([
        supabase
          .from('osc_perfis')
          .select('id, osc_id, razao_social, cnpj, municipio, estado, status_selo, updated_at, certificado_numero, certificado_emitido_at')
          .eq('status_selo', 'aprovado')
          .order('updated_at', { ascending: false }),
        supabase
          .from('osc_formularios')
          .select('osc_id, titulo, tipo, updated_at')
          .eq('status', 'concluido')
          .in('tipo', ['cadastramento', 'relatorio_atividades']),
        supabase
          .from('osc_prestacao_contas')
          .select('osc_id, titulo, periodo, valor_total, status')
          .eq('status', 'aprovada'),
      ]);
      if (perfis) setOscs(perfis);
      if (formularios) setForms(formularios);
      if (pcs) setPrestacoes(pcs);
      setLoadingOscs(false);
    })();
  }, []);

  const modalidades = [...new Set(records.map(r => r.modalidade).filter(Boolean))];
  const anos = [...new Set(records.map(r => r.ano_emenda).filter(Boolean))].sort((a, b) => (b || '').localeCompare(a || ''));

  const filteredRecords = records.filter(r => {
    if (filterModalidade && r.modalidade !== filterModalidade) return false;
    if (filterAno && r.ano_emenda !== filterAno) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return [r.proponente, r.parlamentar, r.objeto, r.orgao_concedente, r.modalidade, r.num_instrumento]
      .some(f => (f || '').toLowerCase().includes(q));
  });

  const filteredOscs = oscs.filter(o => {
    if (!search) return true;
    const q = search.toLowerCase();
    return [o.razao_social, o.cnpj, o.municipio, o.osc_id, o.certificado_numero, o.certificado_emitido_at].some(f => (f || '').toLowerCase().includes(q));
  });

  const sel: React.CSSProperties = {
    padding: '10px 14px', border: '1px solid var(--site-border)',
    borderRadius: 'var(--site-radius-full)', background: 'var(--site-surface)',
    fontSize: 'var(--text-sm)', color: 'var(--site-text-primary)', cursor: 'pointer', outline: 'none', minWidth: 150,
  };

  return (
    <PublicLayout>
      {/* ═══ HERO ═══ */}
      <section className="glass-section-blue page-hero" style={{ padding: '110px 0 40px' }}>
        <div className="container">
          <div className="hero-badge"><Shield size={13} /> PORTAL DE TRANSPARÊNCIA</div>
          <h1 style={{ maxWidth: 620, margin: '0 auto 14px' }}>
            Transparência{' '}
            <span className="hero-accent-white">pública</span>
          </h1>
          <p className="hero-subtitle">
            Divulgação de informações organizacionais para controle social, conforme Art. 11 da{' '}<a href="https://www.planalto.gov.br/ccivil_03/_ato2011-2014/2014/lei/l13019.htm" target="_blank" rel="noopener noreferrer" style={{ color: 'rgba(255,255,255,0.9)', fontWeight: 700, textDecoration: 'underline' }}>Lei Federal nº 13.019/2014</a>.
          </p>

          {/* Busca */}
          <div style={{ maxWidth: 540, margin: '22px auto 0', position: 'relative' }}>
            <Search size={17} style={{
              position: 'absolute', left: 20, top: '50%', transform: 'translateY(-50%)',
              color: 'rgba(255,255,255,0.45)', pointerEvents: 'none',
            }} />
            <input
              type="text"
              placeholder="Buscar por razão social, CNPJ, vigência ou data de certificação..."
              value={search}
              onChange={e => setSearch(e.target.value)}
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

          {/* Abas */}
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 20 }}>
            {([
              { key: 'legislacao', label: 'Legislação Vigente', Icon: Landmark },
              { key: 'convenios', label: 'Contratos e Parcerias', Icon: FileText },
              { key: 'oscs', label: 'OSCs Certificadas', Icon: Award },
            ] as const).map(({ key, label, Icon }) => (
              <button
                key={key}
                onClick={() => { setTab(key); setSearch(''); }}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 7,
                  padding: '10px 22px',
                  border: tab === key ? '1px solid rgba(255,255,255,0.5)' : '1px solid rgba(255,255,255,0.15)',
                  borderRadius: 'var(--site-radius-full)',
                  background: tab === key ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.06)',
                  color: tab === key ? '#fff' : 'rgba(255,255,255,0.65)',
                  fontSize: '.88rem', fontWeight: tab === key ? 700 : 500, cursor: 'pointer',
                  transition: 'all .2s',
                }}
              >
                <Icon size={14} /> {label}
              </button>
            ))}
          </div>

          <div className="hero-divider" style={{ margin: '18px auto 0' }} />
        </div>
      </section>

      {/* ── BARRA DE RESUMO INTELIGENTE ── */}
      <section style={{ background: 'linear-gradient(135deg, #0D364F 0%, #134060 100%)', padding: '22px 0' }}>
        <div className="container">
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'stretch' }}>

            {/* Contratos */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 18, padding: '0 48px', borderRight: '1px solid rgba(255,255,255,.12)' }}>
              <div style={{ width: 54, height: 54, borderRadius: 16, background: 'rgba(255,255,255,.08)', border: '1px solid rgba(255,255,255,.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,.8)', flexShrink: 0 }}>
                <FileText size={22} />
              </div>
              <div>
                <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#fff', lineHeight: 1, letterSpacing: '-0.02em' }}>{records.length}</div>
                <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,.5)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.12em', marginTop: 5 }}>Contratos e Parcerias</div>
              </div>
            </div>

            {/* OSCs Certificadas */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 18, padding: '0 48px', borderRight: '1px solid rgba(255,255,255,.12)' }}>
              <div style={{ width: 54, height: 54, borderRadius: 16, background: 'rgba(74,222,128,.1)', border: '1px solid rgba(74,222,128,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4ade80', flexShrink: 0 }}>
                <Award size={22} />
              </div>
              <div>
                <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#4ade80', lineHeight: 1, letterSpacing: '-0.02em' }}>{oscs.length}</div>
                <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,.5)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.12em', marginTop: 5 }}>OSCs Certificadas</div>
              </div>
            </div>

            {/* Conformidade */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 18, padding: '0 48px' }}>
              <div style={{ width: 54, height: 54, borderRadius: 16, background: 'rgba(197,171,118,.12)', border: '1px solid rgba(197,171,118,.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#C5AB76', flexShrink: 0 }}>
                <CheckCircle2 size={22} />
              </div>
              <div>
                <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#C5AB76', lineHeight: 1, letterSpacing: '-0.02em' }}>100%</div>
                <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,.5)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.12em', marginTop: 5 }}>Conformidade</div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ═══ CONTEÚDO ═══ */}
      <section className="section-padding">
        <div className="container">

          {/* ── Aba: Legislação Vigente ── */}
          {tab === 'legislacao' && (
            <div style={{ maxWidth: 780, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
              <p style={{ fontSize: '0.95rem', color: 'var(--site-text-secondary)', lineHeight: 1.75, marginBottom: 8 }}>
                As parcerias entre a administração pública e as organizações da sociedade civil são reguladas pela legislação federal abaixo. Clique em cada lei para acessar o texto oficial no portal do Governo Federal.
              </p>
              {[
                {
                  numero: 'Lei nº 13.019/2014',
                  apelido: 'MROSC — Marco Regulatório das Organizações da Sociedade Civil',
                  descricao: 'Estabelece regras específicas para as parcerias entre a administração pública e as organizações da sociedade civil (OSC). Fomenta a atuação conjunta de Estado e OSC por meio de parcerias alinhadas às políticas públicas. É aplicável à administração direta e indireta da União, Estados, Distrito Federal e Municípios.',
                  href: 'https://www.planalto.gov.br/ccivil_03/_ato2011-2014/2014/lei/l13019.htm',
                  destaque: true,
                },
                {
                  numero: 'Decreto nº 8.726/2016',
                  apelido: 'Regulamentação Federal',
                  descricao: 'Regulamenta a Lei nº 13.019/2014 no âmbito da administração pública federal, definindo os procedimentos para celebração, execução, monitoramento e prestação de contas das parcerias.',
                  href: 'https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2016/decreto/d8726.htm',
                  destaque: false,
                },
                {
                  numero: 'Decreto nº 11.948/2024',
                  apelido: 'Atualização Vigente',
                  descricao: 'Altera o Decreto nº 8.726, de 27 de abril de 2016, atualizando a regulamentação da Lei nº 13.019/2014 com as disposições mais recentes sobre parcerias federais com OSCs.',
                  href: 'https://www.planalto.gov.br/ccivil_03/_ato2023-2026/2024/decreto/d11948.htm',
                  destaque: false,
                },
              ].map(({ numero, apelido, descricao, href, destaque }) => (
                <a
                  key={numero}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="legal-card-link"
                  style={{
                    display: 'flex', flexDirection: 'column', gap: 10,
                    padding: '24px 28px',
                    borderRadius: 'var(--site-radius-xl)',
                    border: destaque ? '2px solid var(--site-gold)' : '1px solid var(--site-border)',
                    background: destaque ? 'var(--site-surface-gold)' : '#fff',
                    textDecoration: 'none',
                    boxShadow: 'var(--site-shadow-xs)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                    <div>
                      <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--site-primary)', marginBottom: 2 }}>{numero}</div>
                      <div style={{ fontSize: '0.75rem', fontWeight: 700, color: destaque ? 'var(--site-gold-dark)' : 'var(--site-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{apelido}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', fontWeight: 700, color: 'var(--site-primary)', whiteSpace: 'nowrap' }}>
                      <ExternalLink size={14} /> Acessar lei
                    </div>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--site-text-secondary)', lineHeight: 1.7 }}>{descricao}</p>
                </a>
              ))}
              <p style={{ fontSize: '0.75rem', color: 'var(--site-text-secondary)', textAlign: 'center', marginTop: 8 }}>
                Fonte:{' '}
                <a href="https://www.gov.br/secretariageral/pt-br/dialogos/parcerias/legislacao" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--site-primary)', textDecoration: 'underline' }}>
                  Secretaria-Geral da Presidência da República
                </a>
                {' · '}
                <a href="https://www.planalto.gov.br" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--site-primary)', textDecoration: 'underline' }}>
                  Planalto.gov.br
                </a>
              </p>
            </div>
          )}

          {/* ── Aba: Contratos e Parcerias ── */}
          {tab === 'convenios' && (
            loadingRecords ? (
              <div style={{ textAlign: 'center', padding: '100px 0' }}>
                <Loader2 size={32} style={{ animation: 'spin 1s linear infinite', color: 'var(--site-primary)' }} />
                <p style={{ marginTop: 16, color: 'var(--site-text-secondary)', fontSize: '.93rem' }}>Carregando registros...</p>
              </div>
            ) : records.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '100px 0' }}>
                <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--site-surface-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
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
                    {filteredRecords.length} registro{filteredRecords.length !== 1 ? 's' : ''}
                  </p>
                </div>

                {filteredRecords.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--site-text-tertiary)' }}>
                    <Search size={36} style={{ opacity: 0.25, marginBottom: 12 }} />
                    <p style={{ fontWeight: 500 }}>Nenhum registro encontrado.</p>
                  </div>
                ) : (
                  <div className="grid-2">
                    {filteredRecords.map((r, idx) => {
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
                            <h3 className="h4-label" style={{ marginBottom: 12, fontSize: '1.1rem', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: open ? 999 : 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', color: 'var(--site-primary)' }}>
                              {r.objeto || 'Sem descrição'}
                            </h3>
                            {r.proponente && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85rem', color: 'var(--site-text-secondary)', background: 'var(--site-surface-blue)', padding: '6px 12px', borderRadius: 8 }}>
                                <Building2 size={14} style={{ color: 'var(--site-primary)' }} />
                                <span style={{ fontWeight: 600 }}>{r.proponente}</span>
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
            )
          )}

          {/* ── Aba: OSCs Certificadas ── */}
          {tab === 'oscs' && (
            loadingOscs ? (
              <div style={{ textAlign: 'center', padding: '100px 0' }}>
                <Loader2 size={32} style={{ animation: 'spin 1s linear infinite', color: 'var(--site-primary)' }} />
                <p style={{ marginTop: 16, color: 'var(--site-text-secondary)', fontSize: '.93rem' }}>Carregando OSCs certificadas...</p>
              </div>
            ) : oscs.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '100px 0' }}>
                <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--site-surface-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                  <Users size={32} style={{ color: 'var(--site-primary)', opacity: 0.5 }} />
                </div>
                <h3 style={{ marginBottom: 8, color: 'var(--site-text-secondary)' }}>Nenhuma OSC certificada</h3>
                <p style={{ color: 'var(--site-text-tertiary)', fontSize: '.93rem' }}>As OSCs com Selo OSC aprovado aparecerão aqui para controle social.</p>
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 36 }}>
                  <p style={{ color: 'var(--site-text-tertiary)', fontSize: '.85rem', fontWeight: 500 }}>
                    {filteredOscs.length} OSC{filteredOscs.length !== 1 ? 's' : ''} certificada{filteredOscs.length !== 1 ? 's' : ''}
                  </p>
                </div>

                {filteredOscs.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--site-text-tertiary)' }}>
                    <Search size={36} style={{ opacity: 0.25, marginBottom: 12 }} />
                    <p style={{ fontWeight: 500 }}>Nenhuma OSC encontrada.</p>
                  </div>
                ) : (
                  <div className="grid-2">
                    {filteredOscs.map((osc, idx) => {
                      const open = expandedOscId === osc.id;
                      const oscForms = forms.filter(f => f.osc_id === osc.osc_id);
                      const oscPcs = prestacoes.filter(p => p.osc_id === osc.osc_id);
                      return (
                        <div key={osc.id} className={`glass-panel stagger-${Math.min(idx + 1, 8)}`}
                          style={{ overflow: 'hidden', transform: open ? 'translateY(-4px)' : 'none' }}>
                          {/* Header */}
                          <div style={{ padding: '22px 24px 16px', borderBottom: '1px solid var(--site-border)' }}>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '5px 12px', fontSize: 'var(--text-xs)', fontWeight: 700, background: 'rgba(22,163,74,.1)', color: '#16a34a', border: '1px solid rgba(22,163,74,.2)', borderRadius: 'var(--site-radius-full)' }}>
                                <Award size={11} /> Selo OSC
                              </span>
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '5px 12px', fontSize: 'var(--text-xs)', fontWeight: 600, background: 'var(--site-bg)', color: 'var(--site-text-secondary)', borderRadius: 'var(--site-radius-full)' }}>
                                <Calendar size={11} /> {new Date(osc.updated_at).toLocaleDateString('pt-BR')}
                              </span>
                            </div>
                            <h3 style={{ marginBottom: 12, fontSize: '1.15rem', color: 'var(--site-primary)', fontWeight: 800 }}>
                              {osc.razao_social || 'Organização sem nome'}
                            </h3>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.9rem', color: 'var(--site-text-secondary)' }}>
                              <MapPin size={15} style={{ color: 'var(--site-gold-dark)', flexShrink: 0 }} />
                              <span style={{ fontWeight: 500 }}>{[osc.municipio, osc.estado].filter(Boolean).join('/') || '—'}</span>
                            </div>
                          </div>

                          {/* Dados */}
                          <div style={{ padding: '16px 24px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 20px' }}>
                              <div>
                                <div className="overline" style={{ color: 'var(--site-text-tertiary)', marginBottom: 4 }}>CNPJ</div>
                                <div style={{ fontSize: 'var(--text-sm-plus)', fontWeight: 600, color: 'var(--site-text-primary)', fontFamily: 'monospace' }}>
                                  {formatCnpj(osc.cnpj)}
                                </div>
                              </div>
                              <div>
                                <div className="overline" style={{ color: 'var(--site-text-tertiary)', marginBottom: 4 }}>ID OSC</div>
                                <div style={{ fontSize: 'var(--text-sm-plus)', fontWeight: 600, color: 'var(--site-primary)', fontFamily: 'monospace' }}>
                                  {osc.osc_id}
                                </div>
                              </div>
                            </div>

                            {open && (
                              <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--site-border)', animation: 'slideDown .3s ease-out' }}>
                                {oscForms.length > 0 && (
                                  <div style={{ marginBottom: 16 }}>
                                    <div className="overline" style={{ color: 'var(--site-text-tertiary)', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 5 }}>
                                      <ClipboardList size={11} /> Formulários concluídos
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                      {oscForms.map(f => (
                                        <div key={f.tipo} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 'var(--text-sm)' }}>
                                          <CheckCircle2 size={13} style={{ color: '#16a34a', flexShrink: 0 }} />
                                          <span style={{ color: 'var(--site-text-primary)', fontWeight: 500 }}>{f.titulo}</span>
                                          <span style={{ color: 'var(--site-text-tertiary)', fontSize: 'var(--text-xs)', marginLeft: 'auto' }}>
                                            {new Date(f.updated_at).toLocaleDateString('pt-BR')}
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {oscPcs.length > 0 && (
                                  <div>
                                    <div className="overline" style={{ color: 'var(--site-text-tertiary)', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 5 }}>
                                      <FileCheck size={11} /> Prestações de contas
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                      {oscPcs.map((pc, i) => (
                                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, padding: '8px 12px', background: 'var(--site-bg)', borderRadius: 'var(--site-radius-sm)', fontSize: 'var(--text-sm)' }}>
                                          <span style={{ fontWeight: 500, color: 'var(--site-text-primary)' }}>{pc.titulo}</span>
                                          <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexShrink: 0 }}>
                                            {pc.periodo && <span style={{ color: 'var(--site-text-tertiary)' }}>{pc.periodo}</span>}
                                            {pc.valor_total !== null && (
                                              <span style={{ fontWeight: 600, color: 'var(--site-accent)' }}>
                                                {formatCurrency(pc.valor_total)}
                                              </span>
                                            )}
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {oscForms.length === 0 && oscPcs.length === 0 && (
                                  <p style={{ color: 'var(--site-text-tertiary)', fontSize: 'var(--text-sm)' }}>
                                    Nenhum documento público disponível.
                                  </p>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Footer */}
                          <div style={{ padding: '12px 24px 16px', borderTop: '1px solid var(--site-border)', display: 'flex', justifyContent: 'flex-end' }}>
                            <button onClick={() => setExpandedOscId(open ? null : osc.id)}
                              style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '8px 14px', border: '1px solid var(--site-border)', borderRadius: 'var(--site-radius-full)', background: 'transparent', fontSize: '.8rem', fontWeight: 600, color: 'var(--site-text-secondary)', cursor: 'pointer', transition: 'all .2s' }}>
                              {open ? 'Menos' : 'Ver detalhes'} {open ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )
          )}

        </div>
      </section>
    </PublicLayout>
  );
}
