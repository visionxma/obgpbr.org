'use client';

import { useEffect, useState } from 'react';
import PublicLayout from '../components/PublicLayout';
import { supabase } from '@/lib/supabase';
import { MapPin, Calendar, Loader2, Sparkles, Rocket } from 'lucide-react';

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

export default function ExperienciasPage() {
  const [items, setItems] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('experiences')
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: false });
      setItems((data as Experience[]) || []);
      setLoading(false);
    })();
  }, []);

  return (
    <PublicLayout>
      {/* ════════ HERO ════════ */}
      <section className="glass-section-blue page-hero">
        <div className="container">
          <div className="hero-badge">
            <Rocket size={14} />
            PORTFÓLIO
          </div>
          <h1>Nossas Experiências</h1>
          <p className="hero-subtitle">
            Projetos, parcerias e ações que marcam a trajetória da OBGP no fortalecimento de políticas públicas.
          </p>
        </div>
      </section>

      {/* ════════ CONTEÚDO ════════ */}
      <section className="section-padding">
        <div className="container">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '80px 0' }}>
              <Loader2 size={32} style={{ animation: 'spin 1s linear infinite', color: 'var(--site-primary)' }} />
            </div>
          ) : items.length === 0 ? (
            <div style={{
              textAlign: 'center', padding: '80px 0',
              color: 'var(--site-text-tertiary)',
            }}>
              <Sparkles size={40} style={{ opacity: 0.3, marginBottom: 16 }} />
              <p style={{ fontSize: '1.1rem', fontWeight: 500, marginBottom: 8, color: 'var(--site-text-secondary)' }}>
                Em breve novas experiências
              </p>
              <p style={{ fontSize: '0.9rem' }}>
                Nossos projetos e ações serão publicados aqui.
              </p>
            </div>
          ) : (
            <div className="grid-3">
              {items.map((it, i) => (
                <article
                  key={it.id}
                  className={`glass-panel stagger-${Math.min(i + 1, 8)}`}
                  style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
                >
                  {/* Imagem */}
                  {it.image_url ? (
                    <div style={{ height: 200, overflow: 'hidden' }}>
                      <img
                        src={it.image_url}
                        alt={it.title}
                        className="img-cover"
                        style={{ height: '100%', transition: 'transform 0.5s ease' }}
                      />
                    </div>
                  ) : (
                    <div style={{
                      height: 200, background: 'var(--site-surface-blue)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Sparkles size={36} color="var(--site-primary)" style={{ opacity: 0.3 }} />
                    </div>
                  )}

                  {/* Conteúdo */}
                  <div style={{ padding: 24, display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <h3 style={{ marginBottom: 10, fontSize: '1.15rem' }}>{it.title}</h3>
                    {it.description && (
                      <p style={{
                        color: 'var(--site-text-secondary)', lineHeight: 1.7,
                        fontSize: '0.938rem', marginBottom: 16, flex: 1,
                      }}>
                        {it.description}
                      </p>
                    )}
                    {(it.location || it.date) && (
                      <div style={{
                        display: 'flex', gap: 16, flexWrap: 'wrap',
                        fontSize: '0.82rem', color: 'var(--site-text-tertiary)',
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
    </PublicLayout>
  );
}
