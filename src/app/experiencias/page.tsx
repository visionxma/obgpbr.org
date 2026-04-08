'use client';

import { useEffect, useState } from 'react';
import PublicLayout from '../components/PublicLayout';
import { supabase } from '@/lib/supabase';
import { MapPin, Calendar, Loader2, Sparkles } from 'lucide-react';

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
      <section className="glass-section-blue" style={{ padding: '140px 0 80px', textAlign: 'center' }}>
        <div className="container">
          <h1 style={{ color: 'white', marginBottom: 20 }}>Nossas Experiências</h1>
          <p style={{ maxWidth: 720, margin: '0 auto', color: 'rgba(255,255,255,0.85)', fontSize: '1.15rem', lineHeight: 1.7 }}>
            Projetos, parcerias e ações que marcam a trajetória da OBGP.
          </p>
        </div>
      </section>

      <section className="section-padding">
        <div className="container">
          {loading ? (
            <div style={{ textAlign: 'center', padding: 80 }}>
              <Loader2 size={32} style={{ animation: 'spin 1s linear infinite', color: 'var(--site-primary)' }} />
              <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
            </div>
          ) : items.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 80, color: 'var(--site-text-tertiary)' }}>
              <Sparkles size={40} style={{ opacity: 0.4, marginBottom: 16 }} />
              <p style={{ fontSize: '1.05rem' }}>Em breve novas experiências serão publicadas.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: 32, gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))' }}>
              {items.map((it) => (
                <article
                  key={it.id}
                  className="glass-panel"
                  style={{ borderRadius: 'var(--site-radius-lg)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
                >
                  {it.image_url ? (
                    <div style={{ height: 220, overflow: 'hidden' }}>
                      <img src={it.image_url} alt={it.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                    </div>
                  ) : (
                    <div style={{ height: 220, background: 'var(--site-surface-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Sparkles size={42} color="var(--site-primary)" style={{ opacity: 0.5 }} />
                    </div>
                  )}
                  <div style={{ padding: 28, display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <h3 style={{ marginBottom: 10, fontSize: '1.25rem' }}>{it.title}</h3>
                    {it.description && (
                      <p style={{ color: 'var(--site-text-secondary)', lineHeight: 1.7, marginBottom: 16, flex: 1 }}>{it.description}</p>
                    )}
                    {(it.location || it.date) && (
                      <div style={{ display: 'flex', gap: 18, fontSize: '0.82rem', color: 'var(--site-text-tertiary)', flexWrap: 'wrap', borderTop: '1px solid var(--site-border)', paddingTop: 14 }}>
                        {it.location && <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><MapPin size={14} />{it.location}</span>}
                        {it.date && <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Calendar size={14} />{it.date}</span>}
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
