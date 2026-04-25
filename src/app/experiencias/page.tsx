'use client';

import { useEffect, useState } from 'react';
import PublicLayout from '../components/PublicLayout';
import { supabase } from '@/lib/supabase';
import { MapPin, Calendar, Loader2, Sparkles, Rocket, Award, Layers } from 'lucide-react';

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
  },
  {
    id: 'RCA N.º 113/2022 de 13/04/2022',
    instituicao: 'INSTITUTO NACIONAL DE TECNOLOGIA, EDUCAÇÃO, CULTURA E SAÚDE - INTECS',
    certidao: 'CERTIDÃO DE REGISTRO DE ATESTADO DE CAPACIDADE TÉCNICA N.º 0007/2026, VÁLIDA ATÉ 09/07/2026.',
  },
  {
    id: 'RCA N.º 202400012 de 26/02/2024',
    instituicao: 'INSTITUTO VIDA E SAÚDE BRASIL - IVSBRASIL',
    certidao: 'CERTIDÃO DE REGISTRO DE ATESTADO DE CAPACIDADE TÉCNICA N.º 0008/2026, VÁLIDA ATÉ 09/07/2026.',
  },
  {
    id: 'RCA N.º 0123/2026 de 22/04/2026',
    instituicao: 'INSTITUTO NACIONAL DE TECNOLOGIA, EDUCAÇÃO, CULTURA E SAÚDE - INTECS',
    certidao: 'CERTIDÃO DE REGISTRO DE ATESTADO DE CAPACIDADE TÉCNICA N.º 0022/2026, VÁLIDA ATÉ 22/10/2026.',
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
      const fetched = (data as Experience[]) || [];
      const hasSempre = fetched.some(i => i.title.includes('SEMPRE'));
      if (!hasSempre) {
        fetched.push({
          id: 'sempre-static',
          title: 'SEMPRE - Gestão de Projetos e Negócios Empresariais',
          description: 'Gestão de projetos e negócios empresariais, viabilizando oportunidades.',
          image_url: null,
          location: 'Nacional',
          date: '2026',
          is_published: true,
          created_at: new Date().toISOString(),
        });
      }
      setItems(fetched);
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
                    <span style={{
                      fontStyle: 'italic',
                      textDecoration: 'underline',
                      textUnderlineOffset: 3,
                      fontWeight: 600,
                      color: 'var(--site-primary)',
                    }}>
                      {cert.id}
                    </span>
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
            <div className="section-header">
              <span className="section-label">Portfólio</span>
              <h2>
                Projetos em{' '}
                <span className="font-cursive" style={{ color: 'var(--site-gold-dark)' }}>destaque</span>
              </h2>
              <div className="section-line" />
            </div>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '60px 0' }}>
                <Loader2 size={32} style={{ animation: 'spin 1s linear infinite', color: 'var(--site-primary)' }} />
                <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
              </div>
            ) : (
              <div className="grid-3">
                {items.map((it, i) => (
                  <article key={it.id} className={`glass-panel stagger-${Math.min(i + 1, 8)}`}
                    style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                    {it.image_url ? (
                      <div style={{ height: 200, overflow: 'hidden' }}>
                        <img src={it.image_url} alt={it.title} className="img-cover" style={{ height: '100%' }} />
                      </div>
                    ) : (
                      <div style={{
                        height: 200,
                        background: 'linear-gradient(135deg, var(--site-surface-blue) 0%, var(--site-surface-gold) 100%)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <Sparkles size={32} color="var(--site-gold-dark)" style={{ opacity: 0.3 }} />
                      </div>
                    )}
                    <div style={{ padding: '24px 24px 28px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                      <h3 className="h3-card" style={{ marginBottom: 10 }}>{it.title}</h3>
                      {it.description && (
                        <p style={{
                          color: 'var(--site-text-secondary)',
                          lineHeight: 'var(--leading-relaxed)',
                          fontSize: 'var(--text-sm)',
                          marginBottom: 16, flex: 1,
                        }}>
                          {it.description}
                        </p>
                      )}
                      {(it.location || it.date) && (
                        <div style={{
                          display: 'flex', gap: 16, flexWrap: 'wrap',
                          fontSize: 'var(--text-xs)', color: 'var(--site-text-tertiary)',
                          borderTop: '1px solid var(--site-border)', paddingTop: 14, marginTop: 'auto',
                        }}>
                          {it.location && (
                            <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                              <MapPin size={13} /> {it.location}
                            </span>
                          )}
                          {it.date && (
                            <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                              <Calendar size={13} /> {it.date}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>
      )}
    </PublicLayout>
  );
}
