'use client';

import { useEffect, useState } from 'react';
import PublicLayout from '../components/PublicLayout';
import { supabase } from '@/lib/supabase';
import { MapPin, Calendar, Loader2, Sparkles, Rocket, Award, Layers, ChevronRight, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface Experience {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  location: string | null;
  date: string | null;
  is_published: boolean;
  created_at: string;
}

const CERTIFICACOES = [
  {
    id: 'RACT N.º 044/2022 de 23/04/2020',
    instituicao: 'INSTITUTO CIDADANIA E NATUREZA',
    certidao: 'CERTIDÃO DE REGISTRO DE ATESTADO DE CAPACIDADE TÉCNICA N.º 0005/2026, VÁLIDA ATÉ 09/07/2026.',
    url: null as string | null, // TODO: inserir URL do documento
  },
  {
    id: 'RCA N.º 113/2022 de 13/04/2022',
    instituicao: 'INSTITUTO NACIONAL DE TECNOLOGIA, EDUCAÇÃO, CULTURA E SAÚDE - INTECS',
    certidao: 'CERTIDÃO DE REGISTRO DE ATESTADO DE CAPACIDADE TÉCNICA N.º 0007/2026, VÁLIDA ATÉ 09/07/2026.',
    url: null as string | null,
  },
  {
    id: 'RCA N.º 202400012 de 26/02/2024',
    instituicao: 'INSTITUTO VIDA E SAÚDE BRASIL - IVSBRASIL',
    certidao: 'CERTIDÃO DE REGISTRO DE ATESTADO DE CAPACIDADE TÉCNICA N.º 0008/2026, VÁLIDA ATÉ 09/07/2026.',
    url: null as string | null,
  },
  {
    id: 'RCA N.º 0123/2026 de 22/04/2026',
    instituicao: 'INSTITUTO NACIONAL DE TECNOLOGIA, EDUCAÇÃO, CULTURA E SAÚDE - INTECS',
    certidao: 'CERTIDÃO DE REGISTRO DE ATESTADO DE CAPACIDADE TÉCNICA N.º 0022/2026, VÁLIDA ATÉ 22/10/2026.',
    url: null as string | null,
  },
];

const STATS = [
  { value: '+1.000', label: 'postos de trabalho gerados', color: 'icon-box-blue' },
  { value: '+50',    label: 'projetos elaborados',        color: 'icon-box-green' },
  { value: '+R$200M', label: 'em negócios viabilizados',  color: 'icon-box-gold' },
];

const AREAS_TEMATICAS = [
  'Agricultura Familiar',
  'Agricultura e Pesca',
  'Assistência Social',
  'Cultura',
  'Criança e Adolescente',
  'Direitos Humanos e Participação Popular',
  'Economia Solidária',
  'Esporte',
  'Segurança Alimentar',
  'Saúde',
  'Trabalho e Emprego',
];

export default function ExperienciasPage() {
  const [items, setItems] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('experiences').select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: false });
      setItems((data as Experience[]) || []);
      setLoading(false);
    })();
  }, []);

  return (
    <PublicLayout>
      {/* ═══ HERO ═══ */}
      <section className="glass-section-blue page-hero">
        <div className="container">
          <div className="hero-badge"><Rocket size={13} /> PORTFÓLIO</div>
          <h1 style={{ maxWidth: 620, margin: '0 auto 20px' }}>
            Nossas{' '}
            <span className="hero-accent-white">experiências</span>
          </h1>
          <p className="hero-subtitle">
            Projetos, parcerias e ações que marcam a trajetória da OBGP no fortalecimento de políticas públicas.
          </p>
          <div className="hero-divider" />
        </div>
      </section>

      {/* ═══ QUALIFICAÇÃO TÉCNICA ═══ */}
      <section className="section-padding">
        <div className="container" style={{ maxWidth: 860 }}>

          {/* Introdução */}
          <p style={{
            fontSize: 'var(--text-lg)',
            lineHeight: 'var(--leading-relaxed)',
            color: 'var(--site-text-secondary)',
            marginBottom: 32,
          }}>
            A Organização Brasil Gestão de Parcerias – OBGP possui qualificação técnica na execução de atividades,
            programas, projetos ou ações voltadas ou vinculadas a serviços de educação, saúde e assistência social
            através do seu{' '}
            <strong style={{
              color: 'var(--site-text-primary)',
              fontStyle: 'italic',
              textDecoration: 'underline',
              textUnderlineOffset: 3,
            }}>
              administrador responsável técnico da organização da sociedade civil para gestão de parcerias
            </strong>
            , comprovada por meio dos documentos registrados em Conselho de Classe Profissional competente:
          </p>

          {/* Certificações */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 40 }}>
            {CERTIFICACOES.map((cert, i) => (
              <div
                key={cert.id}
                className={`glass-panel stagger-${i + 1}`}
                style={{
                  padding: '24px 28px',
                  display: 'flex',
                  gap: 20,
                  alignItems: 'flex-start',
                  borderLeft: '4px solid var(--site-gold)',
                }}
              >
                <div className="icon-box icon-box-gold" style={{ flexShrink: 0, marginTop: 2 }}>
                  <Award size={18} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{
                    fontSize: 'var(--text-base)',
                    color: 'var(--site-text-primary)',
                    lineHeight: 1.7,
                    marginBottom: 4,
                  }}>
                    {cert.url ? (
                      <a
                        href={cert.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          fontStyle: 'italic',
                          textDecoration: 'underline',
                          textUnderlineOffset: 3,
                          fontWeight: 600,
                          color: 'var(--site-primary)',
                          cursor: 'pointer',
                        }}
                      >
                        {cert.id}
                      </a>
                    ) : (
                      <span style={{
                        fontStyle: 'italic',
                        textDecoration: 'underline',
                        textUnderlineOffset: 3,
                        fontWeight: 600,
                        color: 'var(--site-primary)',
                      }}>
                        {cert.id}
                      </span>
                    )}
                    {', atestado fornecido pelo '}
                    <strong style={{ color: 'var(--site-text-primary)', textTransform: 'uppercase' }}>
                      {cert.instituicao}
                    </strong>
                    {', com '}
                    <strong style={{ color: 'var(--site-text-primary)', textTransform: 'uppercase' }}>
                      {cert.certidao}
                    </strong>
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Estatísticas */}
          <div className="glass-panel" style={{
            padding: 'clamp(24px, 3vw, 40px)',
            marginBottom: 40,
            background: 'var(--site-surface-blue)',
          }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
              gap: 24,
              marginBottom: 28,
            }}>
              {STATS.map(({ value, label, color }) => (
                <div key={label} style={{ textAlign: 'center' }}>
                  <div style={{
                    fontFamily: 'var(--font-heading)',
                    fontSize: 'clamp(1.8rem, 3.5vw, 2.4rem)',
                    fontWeight: 800,
                    color: 'var(--site-primary)',
                    lineHeight: 1.1,
                    marginBottom: 6,
                  }}>
                    {value}
                  </div>
                  <div style={{
                    fontSize: 'var(--text-sm)',
                    color: 'var(--site-text-secondary)',
                    lineHeight: 1.4,
                  }}>
                    {label}
                  </div>
                </div>
              ))}
            </div>
            <p style={{
              fontSize: 'var(--text-base)',
              lineHeight: 'var(--leading-relaxed)',
              color: 'var(--site-text-secondary)',
              borderTop: '1px solid var(--site-border)',
              paddingTop: 20,
              marginBottom: 0,
            }}>
              Nos últimos 5 anos de trabalho, foram gerados mais de{' '}
              <strong style={{ color: 'var(--site-text-primary)' }}>1000 postos de trabalho</strong>,
              elaborados mais de{' '}
              <strong style={{ color: 'var(--site-text-primary)' }}>50 projetos</strong>{' '}
              que viabilizaram mais de{' '}
              <strong style={{ color: 'var(--site-text-primary)' }}>200 milhões em negócios</strong>{' '}
              com êxito no Estado do Maranhão e município de São Paulo/SP.
            </p>
          </div>

          {/* Áreas Temáticas */}
          <div className="glass-panel" style={{ padding: 'clamp(24px, 3vw, 36px)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <div className="icon-box icon-box-green"><Layers size={18} /></div>
              <h3 style={{ fontSize: '1.05rem', margin: 0 }}>Áreas Temáticas de Atuação</h3>
            </div>
            <p style={{
              fontSize: 'var(--text-base)',
              lineHeight: 'var(--leading-relaxed)',
              color: 'var(--site-text-secondary)',
              marginBottom: 20,
            }}>
              Nossas experiências incluem projetos de áreas temáticas diversas como:
            </p>
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 10,
            }}>
              {AREAS_TEMATICAS.map((area) => (
                <span key={area} style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '6px 14px',
                  borderRadius: 'var(--site-radius-full)',
                  background: 'var(--site-surface-blue)',
                  border: '1px solid var(--site-border)',
                  fontSize: 'var(--text-sm)',
                  color: 'var(--site-text-secondary)',
                  fontWeight: 500,
                  whiteSpace: 'nowrap',
                }}>
                  {area}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ PROJETOS PUBLICADOS (dinâmico) ═══ */}
      {(loading || items.length > 0) && (
        <section className="glass-section-white section-padding">
          <div className="container">
            {loading ? (
              <div style={{ textAlign: 'center', padding: '100px 0' }}>
                <Loader2 size={40} style={{ animation: 'spin 1s linear infinite', color: 'var(--site-primary)' }} />
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 64 }}>
                {/* Destaque */}
                {items[0] && (
                  <article className="glass-panel" style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                    overflow: 'hidden',
                    borderRadius: 24,
                    border: '1px solid var(--site-border)',
                  }}>
                    <div style={{ minHeight: 320, overflow: 'hidden', position: 'relative' }}>
                      {items[0].image_url ? (
                        <img src={items[0].image_url} alt={items[0].title || 'Imagem do projeto em destaque'} className="img-cover" style={{ height: '100%' }} />
                      ) : (
                        <div style={{ height: '100%', background: 'linear-gradient(135deg, var(--site-primary) 0%, var(--site-gold) 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Rocket size={48} color="#fff" style={{ opacity: 0.3 }} />
                        </div>
                      )}
                      <div style={{ position: 'absolute', top: 20, left: 20, background: 'var(--site-gold)', color: 'var(--site-primary)', padding: '6px 16px', borderRadius: 'var(--site-radius-full)', fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.05em' }}>
                        PROJETO EM DESTAQUE
                      </div>
                    </div>
                    <div style={{ padding: '48px' }}>
                      <div style={{ color: 'var(--site-gold-dark)', fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: 12, letterSpacing: '0.1em' }}>
                        {items[0].location || 'Nacional'} • {items[0].date || '2026'}
                      </div>
                      <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', marginBottom: 20, lineHeight: 1.2 }}>{items[0].title || 'Projeto sem título'}</h2>
                      <p style={{ color: 'var(--site-text-secondary)', fontSize: '1.1rem', lineHeight: 1.6, marginBottom: 32 }}>{items[0].description}</p>
                      <Link href={`/experiencias/${items[0].id}`} className="btn btn-primary" style={{ display: 'inline-flex', padding: '12px 24px' }}>
                        Ver detalhes do caso <ArrowRight size={16} style={{ marginLeft: 8 }} />
                      </Link>
                    </div>
                  </article>
                )}

                {/* Grid de outros projetos */}
                {items.length > 1 && (
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}>
                      <h3 style={{ fontSize: '1.25rem', margin: 0, fontWeight: 700 }}>Outros Projetos</h3>
                      <div style={{ flex: 1, height: 1, background: 'var(--site-border)' }} />
                    </div>
                    <div className="grid-3">
                      {items.slice(1).map((it, i) => (
                        <Link key={it.id} href={`/experiencias/${it.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                          <article className={`glass-panel stagger-${Math.min(i + 1, 8)}`}
                            style={{ 
                              overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '100%',
                              transition: 'all 0.3s ease', cursor: 'pointer'
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-8px)'; e.currentTarget.style.borderColor = 'var(--site-gold)'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.borderColor = 'var(--site-border)'; }}
                          >
                            <div style={{ height: 200, overflow: 'hidden', position: 'relative' }}>
                              {it.image_url ? (
                                <img src={it.image_url} alt={it.title || 'Imagem do projeto'} className="img-cover" style={{ height: '100%', transition: 'transform 0.5s ease' }} />
                              ) : (
                                <div style={{ height: '100%', background: 'var(--site-surface-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                  <Sparkles size={32} color="var(--site-gold)" style={{ opacity: 0.5 }} />
                                </div>
                              )}
                            </div>
                            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                              <div style={{ fontSize: '0.7rem', color: 'var(--site-gold-dark)', fontWeight: 700, marginBottom: 8, textTransform: 'uppercase' }}>
                                {it.location}
                              </div>
                              <h3 style={{ fontSize: '1.1rem', marginBottom: 12, lineHeight: 1.4 }}>{it.title || 'Projeto sem título'}</h3>
                              <p style={{ color: 'var(--site-text-secondary)', fontSize: '0.9rem', marginBottom: 20, flex: 1, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                {it.description}
                              </p>
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', paddingTop: 16, borderTop: '1px solid var(--site-border)' }}>
                                <span style={{ fontSize: '0.75rem', color: 'var(--site-text-tertiary)', fontWeight: 600 }}>{it.date}</span>
                                <span style={{ color: 'var(--site-primary)', display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.8rem', fontWeight: 700 }}>
                                  Detalhes <ChevronRight size={14} />
                                </span>
                              </div>
                            </div>
                          </article>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      )}
    </PublicLayout>
  );
}
