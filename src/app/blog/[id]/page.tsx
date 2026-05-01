'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import PublicLayout from '../../components/PublicLayout';
import { supabase } from '@/lib/supabase';
import {
  Calendar, Clock, Tag, Loader2, User, ArrowLeft, Share2, Facebook, Twitter, Linkedin, Link as LinkIcon, BookOpen
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
  const router = useRouter();
  const id = params?.id as string;
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    (async () => {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('id', id)
        .eq('is_published', true)
        .single();
      
      if (error || !data) {
        console.error('Post not found:', error);
        // Em um cenário real, poderíamos redirecionar para 404
      } else {
        setPost(data);
      }
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
          <p style={{ color: 'var(--site-text-secondary)', marginBottom: 32 }}>
            O conteúdo que você está procurando não existe ou foi removido.
          </p>
          <Link href="/blog" className="btn btn-primary">
            Voltar para o Blog
          </Link>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      {/* ── HEADER / HERO ── */}
      <article>
        <header className="glass-section-blue" style={{ padding: '140px 0 80px', position: 'relative' }}>
          <div className="container">
            <Link href="/blog" style={{ 
              display: 'inline-flex', alignItems: 'center', gap: 8, 
              color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem', fontWeight: 600,
              marginBottom: 32, transition: 'color .2s'
            }} className="hdr-link-hover">
              <ArrowLeft size={16} /> Voltar para o Blog
            </Link>

            {post.category && (
              <div style={{ marginBottom: 16 }}>
                <span className="badge-gold">
                  <Tag size={12} /> {post.category}
                </span>
              </div>
            )}

            <h1 style={{ 
              maxWidth: 900, fontSize: 'clamp(2rem, 5vw, 3.5rem)', 
              lineHeight: 1.15, marginBottom: 32, color: '#fff' 
            }}>
              {post.title}
            </h1>

            <div style={{ 
              display: 'flex', gap: 24, flexWrap: 'wrap', 
              color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem',
              borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 24
            }}>
              {post.author && (
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <User size={16} color="#fff" />
                  </div>
                  <span style={{ color: '#fff', fontWeight: 600 }}>{post.author}</span>
                </span>
              )}
              {post.published_at && (
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Calendar size={16} /> {formatDate(post.published_at)}
                </span>
              )}
              {post.read_time && (
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Clock size={16} /> {post.read_time} min de leitura
                </span>
              )}
            </div>
          </div>
        </header>

        {/* ── CONTENT ── */}
        <section style={{ background: '#fff', padding: '0 0 100px' }}>
          <div className="container" style={{ maxWidth: 900 }}>
            {/* Featured Image */}
            {post.image_url && (
              <div style={{ 
                marginTop: -60, borderRadius: 'var(--site-radius-xl)', 
                overflow: 'hidden', boxShadow: 'var(--site-shadow-xl)',
                position: 'relative', z-index: 10, marginBottom: 60
              }}>
                <img src={post.image_url} alt={post.title} className="img-cover" style={{ width: '100%', maxHeight: 540 }} />
              </div>
            )}

            {/* Post Content */}
            <div 
              className="blog-content"
              style={{
                fontSize: '1.15rem',
                lineHeight: 1.8,
                color: 'var(--site-text-primary)',
                fontFamily: 'var(--font-body)',
              }}
            >
              {/* Se o conteúdo for HTML (comum em blogs), renderizamos com dangerouslySetInnerHTML */}
              <div 
                dangerouslySetInnerHTML={{ __html: post.content || '' }} 
                className="blog-rich-text"
              />
              
              {/* Estilos locais para o conteúdo rico do blog */}
              <style jsx global>{`
                .blog-rich-text h2 {
                  font-size: 1.8rem;
                  margin: 48px 0 24px;
                  color: var(--site-primary);
                }
                .blog-rich-text h3 {
                  font-size: 1.4rem;
                  margin: 32px 0 16px;
                  color: var(--site-primary-light);
                }
                .blog-rich-text p {
                  margin-bottom: 24px;
                }
                .blog-rich-text ul, .blog-rich-text ol {
                  margin-bottom: 24px;
                  padding-left: 24px;
                }
                .blog-rich-text li {
                  margin-bottom: 12px;
                }
                .blog-rich-text blockquote {
                  border-left: 4px solid var(--site-gold);
                  padding: 16px 24px;
                  background: var(--site-surface-warm);
                  font-style: italic;
                  margin: 32px 0;
                  border-radius: 0 8px 8px 0;
                }
                .blog-rich-text img {
                  max-width: 100%;
                  height: auto;
                  border-radius: 12px;
                  margin: 32px 0;
                }
                .hdr-link-hover:hover {
                  color: #fff !important;
                  opacity: 1 !important;
                }
              `}</style>
            </div>

            {/* Footer / Sharing */}
            <footer style={{ 
              marginTop: 80, paddingTop: 40, 
              borderTop: '1px solid var(--site-border)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              flexWrap: 'wrap', gap: 24
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--site-text-secondary)' }}>Compartilhar:</span>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button className="icon-btn" title="Facebook"><Facebook size={18} /></button>
                  <button className="icon-btn" title="Twitter"><Twitter size={18} /></button>
                  <button className="icon-btn" title="Linkedin"><Linkedin size={18} /></button>
                  <button className="icon-btn" title="Copiar Link"><LinkIcon size={18} /></button>
                </div>
              </div>

              <Link href="/blog" className="btn btn-outline-primary" style={{ padding: '10px 24px', fontSize: '0.9rem' }}>
                Voltar para o blog
              </Link>
            </footer>

            <style jsx>{`
              .icon-btn {
                width: 38px;
                height: 38px;
                border-radius: 50%;
                border: 1px solid var(--site-border);
                background: #fff;
                color: var(--site-text-secondary);
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                transition: all .2s;
              }
              .icon-btn:hover {
                background: var(--site-primary);
                color: #fff;
                border-color: var(--site-primary);
                transform: translateY(-2px);
              }
            `}</style>
          </div>
        </section>
      </article>
    </PublicLayout>
  );
}
