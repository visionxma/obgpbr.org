'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import PublicLayout from '../../components/PublicLayout';
import { supabase } from '@/lib/supabase';
import {
  Calendar, Clock, Tag, Loader2, User, ArrowLeft, Share2, Link as LinkIcon, BookOpen, ChevronRight
} from 'lucide-react';
import Link from 'next/link';

interface BlogPost {
  id: string;
  title: string;
  summary: string | null;
  content: string | null;
  image_url: string | null;
  category: string | null;
  author: string | null;
  read_time: number | null;
  published_at: string | null;
  is_published: boolean;
  created_at: string;
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('pt-BR', {
    day: '2-digit', month: 'long', year: 'numeric',
  });
}

export default function BlogPostPage() {
  const params = useParams();
  const id = params?.id as string;
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const updateScroll = () => {
      const current = window.scrollY;
      const total = document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress((current / total) * 100);
    };
    window.addEventListener('scroll', updateScroll);
    return () => window.removeEventListener('scroll', updateScroll);
  }, []);

  useEffect(() => {
    if (!id) return;

    (async () => {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('id', id)
        .eq('is_published', true)
        .single();
      
      if (!error && data) setPost(data);
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

  if (!post) {
    return (
      <PublicLayout>
        <div style={{ minHeight: '80vh', textAlign: 'center', padding: '100px 20px' }}>
          <h2 style={{ marginBottom: 16 }}>Post não encontrado</h2>
          <Link href="/blog" className="btn btn-primary">Voltar para o Blog</Link>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      {/* Barra de Progresso */}
      <div style={{
        position: 'fixed', top: 76, left: 0, width: `${scrollProgress}%`,
        height: 3, background: 'var(--site-gold)', zIndex: 1000,
        transition: 'width 0.1s ease-out'
      }} />

      <article style={{ background: '#fff' }}>
        {/* ── HEADER PREMIUM ── */}
        <header className="glass-section-blue" style={{ 
          padding: '160px 0 120px', 
          textAlign: 'center',
          backgroundAttachment: 'fixed'
        }}>
          <div className="container" style={{ maxWidth: 1000 }}>
            {/* Breadcrumb / Back Link */}
            <div style={{ marginBottom: 40, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 10 }}>
              <Link href="/blog" className="blog-nav-link">Blog</Link>
              <ChevronRight size={14} color="rgba(255,255,255,0.3)" />
              <span style={{ color: 'var(--site-gold)', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                {post.category || 'Artigo'}
              </span>
            </div>

            <h1 style={{ 
              maxWidth: 850, margin: '0 auto 36px', 
              fontSize: 'clamp(2.2rem, 6vw, 4rem)', 
              fontWeight: 800, lineHeight: 1.1, color: '#fff',
              letterSpacing: '-0.02em'
            }}>
              {post.title}
            </h1>

            <div style={{ 
              display: 'flex', justifyContent: 'center', gap: 32, flexWrap: 'wrap',
              color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem',
              fontWeight: 500
            }}>
              {post.author && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--site-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <User size={18} color="var(--site-primary)" />
                  </div>
                  <span style={{ color: '#fff', fontWeight: 600 }}>{post.author}</span>
                </div>
              )}
              {post.published_at && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Calendar size={18} color="var(--site-gold)" />
                  {formatDate(post.published_at)}
                </div>
              )}
              {post.read_time && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Clock size={18} color="var(--site-gold)" />
                  {post.read_time} min de leitura
                </div>
              )}
            </div>
          </div>
        </header>

        {/* ── CORPO DO ARTIGO ── */}
        <section style={{ position: 'relative', marginTop: -60, paddingBottom: 120 }}>
          <div className="container" style={{ maxWidth: 900 }}>
            
            {/* Imagem de Destaque com efeito Glassmorphism nas bordas */}
            {post.image_url && (
              <div style={{ 
                borderRadius: 24, overflow: 'hidden', 
                boxShadow: '0 30px 60px rgba(0,0,0,0.12)',
                marginBottom: 64, background: '#fff',
                border: '8px solid #fff'
              }}>
                <img src={post.image_url} alt={post.title} style={{ width: '100%', height: 'auto', display: 'block' }} />
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 60 }}>
              
              {/* Conteúdo Principal */}
              <main>
                {post.summary && (
                  <p style={{ 
                    fontSize: '1.4rem', lineHeight: 1.6, color: 'var(--site-text-secondary)',
                    fontWeight: 500, marginBottom: 48, borderLeft: '4px solid var(--site-gold)',
                    paddingLeft: 24, fontStyle: 'italic'
                  }}>
                    {post.summary}
                  </p>
                )}

                <div 
                  className="blog-rich-text"
                  dangerouslySetInnerHTML={{ __html: post.content || '' }} 
                />

                {/* Footer do Artigo */}
                <footer style={{ 
                  marginTop: 80, padding: '40px 0', 
                  borderTop: '1px solid #f1f5f9',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  flexWrap: 'wrap', gap: 32
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <span style={{ fontWeight: 700, color: 'var(--site-text-primary)', fontSize: '0.9rem' }}>COMPARTILHE:</span>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="share-pill"><Share2 size={16} /> Enviar</button>
                      <button className="share-pill"><LinkIcon size={16} /> Link</button>
                    </div>
                  </div>

                  <Link href="/blog" className="btn-back-magazine">
                    <ArrowLeft size={16} /> Todos os Artigos
                  </Link>
                </footer>
              </main>
            </div>
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
        
        .blog-rich-text {
          font-size: 1.15rem;
          line-height: 1.85;
          color: #334155;
        }
        .blog-rich-text h2 {
          font-size: 2.2rem;
          font-weight: 800;
          margin: 64px 0 24px;
          color: var(--site-primary);
          letter-spacing: -0.02em;
        }
        .blog-rich-text h3 {
          font-size: 1.6rem;
          font-weight: 700;
          margin: 40px 0 16px;
          color: var(--site-primary);
        }
        .blog-rich-text p { margin-bottom: 28px; }
        .blog-rich-text blockquote {
          margin: 48px 0;
          padding: 32px 40px;
          background: #f8fafc;
          border-radius: 20px;
          position: relative;
          font-size: 1.3rem;
          color: var(--site-primary);
          font-weight: 500;
        }
        .blog-rich-text blockquote::before {
          content: '"';
          position: absolute;
          top: -20px; left: 30px;
          font-size: 5rem;
          color: var(--site-gold);
          opacity: 0.4;
          font-family: serif;
        }
        .blog-rich-text img {
          border-radius: 16px;
          margin: 40px 0;
          box-shadow: var(--site-shadow-lg);
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
          background: var(--site-surface-blue);
          transform: translateY(-2px);
        }

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
      `}</style>
    </PublicLayout>
  );
}
