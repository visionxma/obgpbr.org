'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import PublicLayout from '../components/PublicLayout';
import { supabase } from '@/lib/supabase';
import { BookOpen, ArrowRight, Loader2, FolderOpen } from 'lucide-react';

interface Course {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  duration: string | null;
  level: string | null;
  modality: string | null;
  image_url: string | null;
  is_published: boolean;
  created_at: string;
}

const categoryColors: Record<string, string> = {
  'Agroecologia e Sementes Crioulas': '#26662F',
  'Gestão de Projetos Sociais': '#23475E',
  'Empreendedorismo Feminino': '#C5AB76',
  'Tecnologia e Inovação': '#0D364F',
  'Saúde e Bem-estar Comunitário': '#AF9C6D',
  'Educação e Cultura': '#CDB887',
  'Economia Solidária': '#12242B',
};

export default function Cursos() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState('');
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    async function fetchCourses() {
      const { data } = await supabase
        .from('courses')
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: false });
      if (data) {
        setCourses(data);
        const cats = Array.from(new Set(data.map((c: Course) => c.category).filter(Boolean))) as string[];
        setCategories(cats);
      }
      setLoading(false);
    }
    fetchCourses();
  }, []);

  const filtered = filterCategory ? courses.filter(c => c.category === filterCategory) : courses;

  return (
    <PublicLayout>
      <main className="animate-fade-up" style={{ background: 'var(--site-bg)' }}>
        {/* HERO */}
        <section className="glass-section-white" style={{ position: 'relative', overflow: 'hidden', padding: '100px 0 80px', textAlign: 'center' }}>
          <div className="container" style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 16px', background: 'var(--site-surface)', border: '1px solid var(--site-border)', borderRadius: 'var(--site-radius-full)', fontSize: '0.85rem', fontWeight: 600, color: 'var(--site-primary)', marginBottom: 20, boxShadow: 'var(--site-shadow-sm)' }}>
              <BookOpen size={14} /> Cursos de Capacitação
            </div>
            <h1 style={{ maxWidth: 900, margin: '0 auto 16px' }}>
              Catálogo de <span style={{ color: 'var(--site-primary)' }}>Cursos Abertos</span>
            </h1>
            <p style={{ maxWidth: 680, margin: '0 auto', fontSize: '1.25rem', color: 'var(--site-text-secondary)' }}>
              Educação voltada para a prática, focada nas necessidades das comunidades e no desenvolvimento local sustentável.
            </p>
          </div>
        </section>

        {/* CURSOS GRID */}
        <section className="glass-section-white" style={{ borderTop: 'none', padding: '80px 0' }}>
          <div className="container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
              <h2 style={{ fontSize: '2rem' }}>
                {filterCategory ? filterCategory : 'Explorar Cursos'}
                {!loading && <span style={{ fontSize: '1rem', fontWeight: 400, color: 'var(--site-text-tertiary)', marginLeft: 12 }}>({filtered.length})</span>}
              </h2>
              {categories.length > 0 && (
                <select
                  value={filterCategory}
                  onChange={e => setFilterCategory(e.target.value)}
                  style={{ padding: '12px 20px', borderRadius: 'var(--site-radius-md)', border: '1px solid var(--site-border)', background: 'var(--site-bg)', fontFamily: 'var(--font-inter)', fontSize: '0.95rem', fontWeight: 500, color: 'var(--site-text-primary)', outline: 'none', cursor: 'pointer', boxShadow: 'var(--site-shadow-sm)' }}>
                  <option value="">Todas as categorias</option>
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              )}
            </div>

            {loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '80px 0', gap: 12, color: 'var(--site-text-secondary)' }}>
                <Loader2 size={24} style={{ animation: 'spin 1s linear infinite' }} />
                <span>Carregando cursos...</span>
              </div>
            ) : filtered.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--site-text-tertiary)' }}>
                <FolderOpen size={48} style={{ marginBottom: 16, opacity: 0.4 }} />
                <p style={{ fontSize: '1.1rem', marginBottom: 8 }}>
                  {courses.length === 0 ? 'Nenhum curso disponível no momento.' : 'Nenhum curso nessa categoria.'}
                </p>
                {filterCategory && (
                  <button onClick={() => setFilterCategory('')} style={{ marginTop: 12, padding: '10px 20px', background: 'var(--site-primary)', color: 'white', border: 'none', cursor: 'pointer', borderRadius: 'var(--site-radius-full)', fontWeight: 600 }}>
                    Ver todos
                  </button>
                )}
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(320px, 100%), 1fr))', gap: 20 }}>
                {filtered.map(curso => {
                  const color = categoryColors[curso.category || ''] || 'var(--site-primary)';
                  return (
                    <Link key={curso.id} href={`/cursos/${curso.id}`} style={{ textDecoration: 'none' }}>
                    <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', height: '100%', transition: 'transform 0.2s' }} onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-3px)')} onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}>
                      {/* Image / Icon */}
                      <div style={{ height: 180, background: 'var(--site-bg)', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                        {curso.image_url
                          ? <img src={curso.image_url} alt={curso.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          : <div style={{ width: 64, height: 64, borderRadius: 'var(--site-radius-md)', background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color }}>
                              <BookOpen size={32} strokeWidth={1.5} />
                            </div>
                        }
                        {curso.category && (
                          <div style={{ position: 'absolute', top: 12, left: 12, padding: '4px 10px', background: `${color}20`, color, fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.05em', borderRadius: 'var(--site-radius-full)' }}>
                            {curso.category}
                          </div>
                        )}
                      </div>

                      <div style={{ padding: 24, display: 'flex', flexDirection: 'column', flex: 1 }}>
                        <h3 style={{ fontSize: '1.3rem', marginBottom: 10, lineHeight: 1.3, wordBreak: 'break-word', overflowWrap: 'break-word' }}>{curso.title}</h3>
                        {curso.description && (
                          <p style={{ color: 'var(--site-text-secondary)', marginBottom: 16, lineHeight: 1.55, flex: 1, fontSize: '0.95rem', wordBreak: 'break-word', overflowWrap: 'break-word' }}>
                            {curso.description.length > 180 ? curso.description.slice(0, 180) + '…' : curso.description}
                          </p>
                        )}

                        {/* Meta */}
                        {(curso.duration || curso.level || curso.modality) && (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
                            {curso.duration && (
                              <span style={{ padding: '4px 10px', background: 'var(--site-surface)', border: '1px solid var(--site-border)', fontSize: '0.78rem', color: 'var(--site-text-secondary)' }}>
                                {curso.duration}
                              </span>
                            )}
                            {curso.level && (
                              <span style={{ padding: '4px 10px', background: 'var(--site-surface)', border: '1px solid var(--site-border)', fontSize: '0.78rem', color: 'var(--site-text-secondary)' }}>
                                {curso.level}
                              </span>
                            )}
                            {curso.modality && (
                              <span style={{ padding: '4px 10px', background: 'var(--site-surface)', border: '1px solid var(--site-border)', fontSize: '0.78rem', color: 'var(--site-text-secondary)' }}>
                                {curso.modality}
                              </span>
                            )}
                          </div>
                        )}

                        <div className="btn btn-glass" style={{ width: '100%', justifyContent: 'space-between' }}>
                          Ver Conteúdo do Curso <ArrowRight size={16} />
                        </div>
                      </div>
                    </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </main>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </PublicLayout>
  );
}
