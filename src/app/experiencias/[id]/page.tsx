'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import PublicLayout from '../../components/PublicLayout';
import { supabase } from '@/lib/supabase';
import {
  Calendar, MapPin, Loader2, User, ArrowLeft, Share2, Link as LinkIcon, Sparkles, ChevronRight, Rocket
} from 'lucide-react';
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

export default function ExperienceDetailsPage() {
  const params = useParams();
  const id = params?.id as string;
  const [item, setItem] = useState<Experience | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    (async () => {
      const { data, error } = await supabase
        .from('experiences')
        .select('*')
        .eq('id', id)
        .eq('is_published', true)
        .single();
      
      if (!error && data) setItem(data);
      setLoading(false);
    })();
  }, [id]);

  if (loading) {
    return (
      <PublicLayout>
        <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Loader2 size={40} style={{ animation: 'spin 1s linear infinite', color: 'var(--site-primary)' }} />
        </div>
      </PublicLayout>
    );
  }

  if (!item) {
    return (
      <PublicLayout>
        <div style={{ minHeight: '80vh', textAlign: 'center', padding: '100px 20px' }}>
          <h2 style={{ marginBottom: 16 }}>Projeto não encontrado</h2>
          <Link href="/experiencias" className="btn btn-primary">Voltar para Experiências</Link>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <article style={{ background: '#fff' }}>
        {/* ── HEADER PREMIUM ── */}
        <header className="glass-section-blue" style={{ padding: '160px 0 100px', textAlign: 'center' }}>
          <div className="container" style={{ maxWidth: 1000 }}>
            <div style={{ marginBottom: 40, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 10 }}>
              <Link href="/experiencias" className="blog-nav-link">Experiências</Link>
              <ChevronRight size={14} color="rgba(255,255,255,0.3)" />
              <span style={{ color: 'var(--site-gold)', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                Caso de Sucesso
              </span>
            </div>

            <h1 style={{ 
              maxWidth: 850, margin: '0 auto 36px', 
              fontSize: 'clamp(2.2rem, 6vw, 3.5rem)', 
              fontWeight: 800, lineHeight: 1.1, color: '#fff'
            }}>
              {item.title}
            </h1>

            <div style={{ 
              display: 'flex', justifyContent: 'center', gap: 32, flexWrap: 'wrap',
              color: 'rgba(255,255,255,0.7)', fontSize: '0.95rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <MapPin size={18} color="var(--site-gold)" />
                {item.location || 'Nacional'}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Calendar size={18} color="var(--site-gold)" />
                {item.date || '2026'}
              </div>
            </div>
          </div>
        </header>

        {/* ── CORPO ── */}
        <section style={{ position: 'relative', marginTop: -60, paddingBottom: 120 }}>
          <div className="container" style={{ maxWidth: 900 }}>
            {item.image_url && (
              <div style={{ 
                borderRadius: 24, overflow: 'hidden', 
                boxShadow: '0 30px 60px rgba(0,0,0,0.12)',
                marginBottom: 64, background: '#fff',
                border: '8px solid #fff'
              }}>
                <img src={item.image_url} alt={item.title} style={{ width: '100%', height: 'auto', display: 'block' }} />
              </div>
            )}

            <div style={{ fontSize: '1.2rem', lineHeight: 1.8, color: '#334155' }}>
              <div style={{ 
                background: 'var(--site-surface-blue)', padding: '40px', borderRadius: '24px',
                border: '1px solid var(--site-border)', marginBottom: 48
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                  <div className="icon-box icon-box-blue"><Rocket size={20} /></div>
                  <h3 style={{ margin: 0, fontSize: '1.25rem' }}>Sobre o Projeto</h3>
                </div>
                <p style={{ margin: 0 }}>{item.description}</p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24, marginTop: 40 }}>
                <div className="glass-panel" style={{ padding: '32px' }}>
                  <div style={{ color: 'var(--site-gold-dark)', fontWeight: 800, fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: 12 }}>Localização</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 600 }}>{item.location || 'Consultar Unidade'}</div>
                </div>
                <div className="glass-panel" style={{ padding: '32px' }}>
                  <div style={{ color: 'var(--site-gold-dark)', fontWeight: 800, fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: 12 }}>Ano de Execução</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 600 }}>{item.date || '2026'}</div>
                </div>
              </div>
            </div>

            <footer style={{ 
              marginTop: 80, padding: '40px 0', 
              borderTop: '1px solid #f1f5f9',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
              <Link href="/experiencias" className="btn-back-magazine">
                <ArrowLeft size={16} /> Voltar ao Portfólio
              </Link>
              <div style={{ display: 'flex', gap: 12 }}>
                <button className="share-pill"><Share2 size={16} /> Compartilhar</button>
              </div>
            </footer>
          </div>
        </section>
      </article>

      <style jsx global>{`
        .blog-nav-link {
          color: rgba(255,255,255,0.5);
          font-weight: 700;
          text-transform: uppercase;
          font-size: 0.8rem;
          letter-spacing: 0.1em;
          transition: all 0.2s;
        }
        .blog-nav-link:hover { color: #fff; }

        .btn-back-magazine {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          color: var(--site-text-secondary);
          font-weight: 700;
          font-size: 0.9rem;
          transition: all 0.2s;
        }
        .btn-back-magazine:hover {
          color: var(--site-primary);
          transform: translateX(-4px);
        }

        .share-pill {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 20px;
          border-radius: var(--site-radius-full);
          border: 1px solid #e2e8f0;
          background: #fff;
          color: #64748b;
          font-weight: 700;
          font-size: 0.8rem;
          text-transform: uppercase;
          cursor: pointer;
          transition: all 0.2s;
        }
        .share-pill:hover {
          border-color: var(--site-primary);
          color: var(--site-primary);
          transform: translateY(-2px);
        }
      `}</style>
    </PublicLayout>
  );
}
