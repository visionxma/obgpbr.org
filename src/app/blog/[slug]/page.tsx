'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import PublicLayout from '../../components/PublicLayout';
import { supabase } from '@/lib/supabase';
import {
  ArrowLeft,
  Calendar,
  Tag,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import Link from 'next/link';

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

export default function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<Post[]>([]);
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function fetchPost() {
      const [postRes, catsRes] = await Promise.all([
        supabase.from('posts').select('*').eq('slug', slug).single(),
        supabase.from('categories').select('id, name'),
      ]);

      if (!postRes.data) { setNotFound(true); setLoading(false); return; }

      const postData: Post = postRes.data;
      setPost(postData);
      if (catsRes.data) setAllCategories(catsRes.data);

      // Related posts (same category, excluding current)
      const relatedQuery = supabase.from('posts').select('*').neq('id', postData.id).limit(3);
      if (postData.category_id) relatedQuery.eq('category_id', postData.category_id);
      const { data: related } = await relatedQuery;
      if (related) setRelatedPosts(related);

      setLoading(false);
    }
    fetchPost();
  }, [slug]);

  function getCategoryColor(catId: string | null) {
    if (!catId) return categoryColors[0];
    const idx = allCategories.findIndex(c => c.id === catId);
    return categoryColors[idx % categoryColors.length] || categoryColors[0];
  }

  function getCategoryName(catId: string | null) {
    if (!catId) return 'Geral';
    return allCategories.find(c => c.id === catId)?.name || 'Geral';
  }

  function formatDate(d: string) {
    return new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
  }

  function excerpt(content: string | null, max = 120) {
    if (!content) return '';
    const stripped = content.replace(/<[^>]+>/g, '').replace(/\n+/g, ' ').trim();
    return stripped.length > max ? stripped.slice(0, max) + '…' : stripped;
  }

  if (loading) {
    return (
      <PublicLayout>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', gap: 12, color: 'var(--site-text-secondary)' }}>
          <Loader2 size={24} style={{ animation: 'spin 1s linear infinite' }} />
          <span>Carregando artigo...</span>
          <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        </div>
      </PublicLayout>
    );
  }

  if (notFound) {
    return (
      <PublicLayout>
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', gap: 16, color: 'var(--site-text-tertiary)', textAlign: 'center' }}>
          <AlertCircle size={48} style={{ opacity: 0.4 }} />
          <h2 style={{ fontSize: '1.6rem' }}>Artigo não encontrado</h2>
          <p style={{ color: 'var(--site-text-secondary)' }}>Este artigo pode ter sido removido ou o link está incorreto.</p>
          <Link href="/blog" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 24px', background: 'var(--site-primary)', color: 'white', textDecoration: 'none', fontWeight: 600 }}>
            <ArrowLeft size={16} /> Voltar ao Blog
          </Link>
        </div>
      </PublicLayout>
    );
  }

  const color = getCategoryColor(post!.category_id);

  return (
    <PublicLayout>
      <main className="animate-fade-up" style={{ background: 'var(--site-bg)' }}>

        {/* HERO */}
        <section style={{ position: 'relative', overflow: 'hidden', minHeight: 460, display: 'flex', alignItems: 'flex-end' }}>
          {post!.feature_image_url ? (
            <>
              <div style={{ position: 'absolute', inset: 0, backgroundImage: `url(${post!.feature_image_url})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.88) 50%, rgba(0,0,0,0.25) 100%)' }} />
            </>
          ) : (
            <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(135deg, ${color}18 0%, var(--site-bg) 100%)` }} />
          )}

          <div className="container" style={{ position: 'relative', zIndex: 1, paddingTop: 120, paddingBottom: 56, maxWidth: 900 }}>
            <Link href="/blog" className="blog-back-link" style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: 8, 
              color: post!.feature_image_url ? 'white' : 'var(--site-text-secondary)', 
              fontSize: '0.85rem', 
              fontWeight: 600,
              textDecoration: 'none', 
              marginBottom: 32,
              padding: '8px 16px',
              background: post!.feature_image_url ? 'rgba(255,255,255,0.15)' : 'var(--site-surface)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.1)',
            }}>
              <ArrowLeft size={14} strokeWidth={2.5} /> Voltar ao Blog
            </Link>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18, flexWrap: 'wrap' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 14px', background: `${color}25`, color, fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.07em' }}>
                <Tag size={12} /> {getCategoryName(post!.category_id).toUpperCase()}
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.88rem', color: post!.feature_image_url ? 'rgba(255,255,255,0.7)' : 'var(--site-text-tertiary)' }}>
                <Calendar size={14} /> {formatDate(post!.created_at)}
              </span>
            </div>

            <h1 style={{
              fontSize: 'clamp(1.8rem, 4vw, 3rem)',
              lineHeight: 1.2,
              color: post!.feature_image_url ? 'white' : 'var(--site-text-primary)',
            }}>
              {post!.title}
            </h1>
          </div>
        </section>

        {/* ARTICLE BODY */}
        <section className="glass-section-white" style={{ padding: '64px 0' }}>
          <div style={{ maxWidth: 760, margin: '0 auto', padding: '0 24px' }}>
            {post!.content ? (
              <div
                style={{ fontSize: '1.1rem', lineHeight: 1.85, color: 'var(--site-text-secondary)' }}
                dangerouslySetInnerHTML={{ __html: post!.content.replace(/\n/g, '<br/>') }}
              />
            ) : (
              <p style={{ color: 'var(--site-text-tertiary)', fontStyle: 'italic', textAlign: 'center', padding: '40px 0' }}>
                Conteúdo em breve.
              </p>
            )}

            {/* Social Sharing */}
            <div style={{ marginTop: 64, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em', color: 'var(--site-text-tertiary)', textTransform: 'uppercase' }}>
                Compartilhar este artigo
              </span>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {[
                  { name: 'WhatsApp', icon: 'M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-4.821 4.754a8.117 8.117 0 01-4.077-1.102l-.293-.174-3.037.797.812-2.961-.191-.304A8.13 8.13 0 013 9.413c0-4.505 3.665-8.17 8.173-8.17 2.181 0 4.232.85 5.774 2.392s2.391 3.593 2.391 5.778c0 4.506-3.665 8.169-8.173 8.169m8.174-17.726C18.257.854 14.835 0 11.173 0 5.011 0 0 5.012 0 11.173c0 1.966.513 3.886 1.49 5.61L0 22l5.373-1.409a11.121 11.121 0 005.8 1.625c6.162 0 11.173-5.013 11.173-11.173 0-2.991-1.164-5.803-3.279-7.918z', color: '#26662F', url: `https://wa.me/?text=${encodeURIComponent(`${post?.title} - ${typeof window !== 'undefined' ? window.location.href : ''}`)}` },
                  { name: 'LinkedIn', icon: 'M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z', color: '#0D364F', url: `https://www.linkedin.com/sharing/share-offsite/?url=${typeof window !== 'undefined' ? encodeURIComponent(window.location.href) : ''}` },
                  { name: 'Twitter', icon: 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.451-6.231zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z', color: '#23475E', url: `https://twitter.com/intent/tweet?url=${typeof window !== 'undefined' ? encodeURIComponent(window.location.href) : ''}&text=${encodeURIComponent(post?.title || '')}` },
                ].map((social) => (
                  <a
                    key={social.name}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="social-share-btn"
                    title={`Compartilhar no ${social.name}`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 44,
                      height: 44,
                      background: 'var(--site-surface)',
                      border: '1px solid var(--site-border)',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      textDecoration: 'none'
                    }}
                  >
                    <svg viewBox="0 0 24 24" width="20" height="20" style={{ fill: social.color, transition: 'fill 0.2s ease' }}>
                      <path d={social.icon} />
                    </svg>
                  </a>
                ))}
              </div>
            </div>

            {/* Tags / Category footer */}
            <div style={{ marginTop: 48, paddingTop: 32, borderTop: '1px solid var(--site-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 16px', background: `${color}15`, color, fontSize: '0.82rem', fontWeight: 700 }}>
                <Tag size={13} /> {getCategoryName(post!.category_id)}
              </span>
              <Link href="/blog" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--site-text-secondary)', fontSize: '0.9rem', textDecoration: 'none' }}>
                <ArrowLeft size={14} /> Ver todas as publicações
              </Link>
            </div>
          </div>
        </section>

        {/* RELATED POSTS */}
        {relatedPosts.length > 0 && (
          <section className="glass-section-white" style={{ borderTop: 'none', padding: '0 0 80px' }}>
            <div className="container">
              <h3 style={{ fontSize: '1.5rem', marginBottom: 24 }}>Leia também</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(280px, 100%), 1fr))', gap: 20 }}>
                {relatedPosts.map(related => {
                  const rColor = getCategoryColor(related.category_id);
                  return (
                    <Link
                      key={related.id}
                      href={`/blog/${related.slug}`}
                      style={{ textDecoration: 'none' }}
                    >
                      <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', height: '100%', transition: 'transform 0.2s' }}
                        onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-3px)')}
                        onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}>
                        <div style={{ height: 160, background: 'var(--site-surface)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: '1px solid var(--site-border)' }}>
                          {related.feature_image_url
                            ? <img src={related.feature_image_url} alt={related.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            : <span style={{ fontSize: '2rem', opacity: 0.15 }}>✦</span>
                          }
                        </div>
                        <div style={{ padding: 18 }}>
                          <span style={{ fontSize: '0.7rem', fontWeight: 700, color: rColor, letterSpacing: '0.05em' }}>
                            {getCategoryName(related.category_id).toUpperCase()}
                          </span>
                          <h4 style={{ fontSize: '1rem', marginTop: 6, lineHeight: 1.35, color: 'var(--site-text-primary)' }}>{related.title}</h4>
                          {related.content && (
                            <p style={{ fontSize: '0.85rem', color: 'var(--site-text-tertiary)', marginTop: 8, lineHeight: 1.5 }}>
                              {excerpt(related.content)}
                            </p>
                          )}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </section>
        )}
      </main>
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        
        .social-share-btn:hover {
          transform: translateY(-3px);
          box-shadow: var(--site-shadow-md);
        }
        .social-share-btn:hover svg {
          fill: white !important;
        }
        
        /* Cores específicas no hover */
        .social-share-btn[title*="WhatsApp"]:hover { background: #26662F !important; border-color: #26662F !important; }
        .social-share-btn[title*="LinkedIn"]:hover { background: #0D364F !important; border-color: #0D364F !important; }
        .social-share-btn[title*="Twitter"]:hover { background: #23475E !important; border-color: #23475E !important; }
      `}</style>
    </PublicLayout>
  );
}
