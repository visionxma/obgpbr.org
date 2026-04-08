'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import PublicLayout from '../components/PublicLayout';
import { supabase } from '@/lib/supabase';
import { Loader2, FolderOpen, Calendar } from 'lucide-react';

interface Post {
  id: string;
  title: string;
  slug: string;
  content: string | null;
  feature_image_url: string | null;
  category_id: string | null;
  created_at: string;
}

interface Category {
  id: string;
  name: string;
}

const categoryColors = [
  '#0D364F', '#26662F', '#C5AB76', '#23475E', '#AF9C6D', '#CDB887', '#12242B',
];

export default function Blog() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const [postsRes, catsRes] = await Promise.all([
        supabase.from('posts').select('*').order('created_at', { ascending: false }),
        supabase.from('categories').select('id, name').order('name'),
      ]);
      if (postsRes.data) setPosts(postsRes.data);
      if (catsRes.data) setCategories(catsRes.data);
      setLoading(false);
    }
    fetchData();
  }, []);

  function getCategoryName(catId: string | null): string {
    if (!catId) return 'Sem categoria';
    return categories.find(c => c.id === catId)?.name || 'Geral';
  }

  function getCategoryColor(catId: string | null): string {
    if (!catId) return categoryColors[0];
    const idx = categories.findIndex(c => c.id === catId);
    return categoryColors[idx % categoryColors.length] || categoryColors[0];
  }

  function formatDate(d: string) {
    return new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  function excerpt(content: string | null, max = 140) {
    if (!content) return '';
    const stripped = content.replace(/<[^>]+>/g, '').replace(/\n+/g, ' ').trim();
    return stripped.length > max ? stripped.slice(0, max) + '…' : stripped;
  }

  const [featured, ...rest] = posts;

  return (
    <PublicLayout>
      <main className="animate-fade-up" style={{ background: 'var(--site-bg)' }}>

        {/* HEADER */}
        <section className="glass-section-white" style={{ padding: '100px 0 40px', textAlign: 'center' }}>
          <div className="container">
            <h1 style={{ fontSize: '3rem', marginBottom: 12 }}>Notícias e Relatos</h1>
            <p style={{ fontSize: '1.1rem', color: 'var(--site-text-secondary)' }}>
              Acompanhe os projetos, histórias e o impacto das ações do Instituto Gênesis.
            </p>
          </div>
        </section>

        {/* CONTENT */}
        <section className="glass-section-white" style={{ borderTop: 'none', padding: '60px 0 100px' }}>
          <div className="container">
            {loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '80px 0', gap: 12, color: 'var(--site-text-secondary)' }}>
                <Loader2 size={24} style={{ animation: 'spin 1s linear infinite' }} />
                <span>Carregando postagens...</span>
              </div>
            ) : posts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--site-text-tertiary)' }}>
                <FolderOpen size={48} style={{ marginBottom: 16, opacity: 0.4 }} />
                <p style={{ fontSize: '1.1rem' }}>Nenhuma postagem publicada ainda.</p>
              </div>
            ) : (
              <>
                {/* FEATURED POST */}
                {featured && (
                  <div className="glass-panel" style={{ padding: 32, marginBottom: 48, display: 'flex', gap: 32, alignItems: 'center', flexWrap: 'wrap' }}>
                    <div style={{ flex: '1 1 380px', height: 300, borderRadius: 'var(--site-radius-md)', overflow: 'hidden', border: '1px solid var(--site-border)', background: 'var(--site-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {featured.feature_image_url
                        ? <img src={featured.feature_image_url} alt={featured.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : <FolderOpen size={48} style={{ opacity: 0.2 }} />
                      }
                    </div>
                    <div style={{ flex: '1 1 380px', minWidth: 0, overflow: 'hidden' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
                        <span style={{ padding: '6px 12px', background: `${getCategoryColor(featured.category_id)}15`, color: getCategoryColor(featured.category_id), fontSize: '0.75rem', fontWeight: 700, borderRadius: 'var(--site-radius-full)', letterSpacing: '0.05em' }}>
                          {getCategoryName(featured.category_id).toUpperCase()}
                        </span>
                        <span style={{ color: 'var(--site-text-tertiary)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: 5 }}>
                          <Calendar size={14} />{formatDate(featured.created_at)}
                        </span>
                      </div>
                      <h2 style={{ fontSize: '1.9rem', lineHeight: 1.25, marginBottom: 14, wordBreak: 'break-word', overflowWrap: 'break-word' }}>{featured.title}</h2>
                      {featured.content && (
                        <p style={{ fontSize: '1.05rem', color: 'var(--site-text-secondary)', lineHeight: 1.6, marginBottom: 24, wordBreak: 'break-word', overflowWrap: 'break-word' }}>
                          {excerpt(featured.content, 200)}
                        </p>
                      )}
                      <Link href={`/blog/${featured.slug}`} className="btn btn-primary" style={{ textDecoration: 'none' }}>
                        Ler Artigo Completo
                      </Link>
                    </div>
                  </div>
                )}

                {/* POSTS GRID */}
                {rest.length > 0 && (
                  <>
                    <h3 style={{ fontSize: '1.6rem', marginBottom: 20 }}>Publicações Recentes</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(300px, 100%), 1fr))', gap: 20 }}>
                      {rest.map(post => {
                        const color = getCategoryColor(post.category_id);
                        return (
                          <Link
                            key={post.id}
                            href={`/blog/${post.slug}`}
                            style={{ textDecoration: 'none' }}
                          >
                            <div
                              className="glass-panel"
                              style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: 20, height: '100%', transition: 'transform 0.2s' }}
                              onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-3px)')}
                              onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}
                            >
                              <div style={{ height: 180, borderRadius: 'var(--site-radius-sm)', marginBottom: 16, overflow: 'hidden', border: '1px solid var(--site-border)', background: 'var(--site-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {post.feature_image_url
                                  ? <img src={post.feature_image_url} alt={post.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                  : <FolderOpen size={32} style={{ opacity: 0.2 }} />
                                }
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                                <span style={{ color, fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.05em' }}>
                                  {getCategoryName(post.category_id).toUpperCase()}
                                </span>
                                <span style={{ color: 'var(--site-text-tertiary)', fontSize: '0.78rem' }}>
                                  • {formatDate(post.created_at)}
                                </span>
                              </div>
                              <h4 style={{ fontSize: '1.2rem', marginBottom: 10, lineHeight: 1.3, color: 'var(--site-text-primary)', wordBreak: 'break-word', overflowWrap: 'break-word' }}>{post.title}</h4>
                              {post.content && (
                                <p style={{ color: 'var(--site-text-secondary)', fontSize: '0.9rem', lineHeight: 1.55, wordBreak: 'break-word', overflowWrap: 'break-word' }}>
                                  {excerpt(post.content)}
                                </p>
                              )}
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </section>
      </main>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </PublicLayout>
  );
}
