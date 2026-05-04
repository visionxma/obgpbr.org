'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
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

function getInitials(name: string | null) {
  if (!name) return 'OB';
  return name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
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
        <div style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
          <Loader2 size={48} strokeWidth={2} style={{ animation: 'spin 1s linear infinite', color: 'var(--site-primary)', marginBottom: 20 }} />
          <p style={{ color: 'var(--site-text-secondary)', fontWeight: 500 }}>Carregando artigo...</p>
        </div>
      </PublicLayout>
    );
  }

  if (!post) {
    return (
      <PublicLayout>
        <div style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
          <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
            <BookOpen size={32} color="#ef4444" />
          </div>
          <h2 style={{ marginBottom: 16, color: 'var(--site-text-primary)' }}>Artigo não encontrado</h2>
          <p style={{ color: 'var(--site-text-tertiary)', marginBottom: 32 }}>Este conteúdo pode ter sido movido ou não está mais disponível.</p>
          <Link href="/blog" className="btn btn-primary" style={{ padding: '12px 28px', borderRadius: 999 }}>Voltar para o Blog</Link>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      {/* ── PROGRESS BAR ── */}
      <div style={{
        position: 'fixed', top: 0, left: 0, width: `${scrollProgress}%`,
        height: 4, background: 'linear-gradient(to right, var(--site-primary), var(--site-gold))', zIndex: 9999,
        transition: 'width 0.1s ease-out'
      }} />

      <article style={{ background: '#fcfcfd', minHeight: '100vh', paddingBottom: 100 }}>
        
        {/* ── HERO HEADER ── */}
        <header style={{ 
          padding: '120px 24px 60px', 
          background: 'linear-gradient(180deg, rgba(30,58,138,0.03) 0%, rgba(255,255,255,1) 100%)',
          position: 'relative'
        }}>
          <div style={{ maxWidth: 840, margin: '0 auto' }}>
            
            {/* Back Button */}
            <Link href="/blog" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              color: 'var(--site-text-tertiary)', fontSize: '0.85rem', fontWeight: 600,
              textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 40,
              padding: '8px 16px', borderRadius: 999, background: '#fff', border: '1px solid var(--site-border)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.02)', transition: 'all 0.2s ease', textDecoration: 'none'
            }} className="btn-back">
              <ArrowLeft size={16} /> Voltar ao Blog
            </Link>

            {/* Category */}
            {post.category && (
              <div style={{ display: 'flex', marginBottom: 20 }}>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  padding: '6px 14px', borderRadius: 999,
                  background: 'rgba(30,58,138,0.08)', color: 'var(--site-primary)',
                  fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em'
                }}>
                  <Tag size={12} /> {post.category}
                </span>
              </div>
            )}

            {/* Title */}
            <h1 style={{ 
              fontSize: 'clamp(2rem, 5vw, 3.5rem)', 
              fontWeight: 800, lineHeight: 1.15, color: 'var(--site-text-primary)',
              letterSpacing: '-0.02em', marginBottom: 32
            }}>
              {post.title}
            </h1>

            {/* Metadata Bar */}
            <div style={{ 
              display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap',
              padding: '24px 0', borderTop: '1px solid var(--site-border)', borderBottom: '1px solid var(--site-border)'
            }}>
              {/* Author */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ 
                  width: 44, height: 44, borderRadius: '50%', 
                  background: 'linear-gradient(135deg, var(--site-primary) 0%, #1e40af 100%)', 
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontWeight: 700, fontSize: '0.9rem', boxShadow: '0 4px 12px rgba(30,58,138,0.2)'
                }}>
                  {getInitials(post.author)}
                </div>
                <div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--site-text-primary)' }}>{post.author || 'Equipe OBGP'}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--site-text-tertiary)' }}>Autor</div>
                </div>
              </div>

              <div style={{ width: 1, height: 40, background: 'var(--site-border)', display: 'none' }} className="meta-divider" />

              {/* Date & Time */}
              <div style={{ display: 'flex', gap: 24, color: 'var(--site-text-secondary)', fontSize: '0.9rem', fontWeight: 500 }}>
                {post.published_at && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Calendar size={18} color="var(--site-gold)" />
                    {formatDate(post.published_at)}
                  </div>
                )}
                {post.read_time && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Clock size={18} color="var(--site-primary)" />
                    {post.read_time} min de leitura
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* ── POST COVER IMAGE ── */}
        {post.image_url && (
          <div className="container" style={{ maxWidth: 1040, padding: '0 24px', marginBottom: 60 }}>
            <div style={{ 
              width: '100%', height: 'clamp(300px, 50vh, 550px)', 
              borderRadius: 32, overflow: 'hidden',
              boxShadow: '0 24px 60px rgba(0,0,0,0.08)',
              position: 'relative',
              background: '#fff'
            }}>
              <img 
                src={post.image_url} 
                alt={post.title} 
                style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', display: 'block' }} 
              />
            </div>
          </div>
        )}

        {/* ── ARTICLE CONTENT ── */}
        <div className="container" style={{ maxWidth: 760, padding: '0 24px' }}>
          
          {post.summary && (
            <p style={{ 
              fontSize: '1.25rem', lineHeight: 1.7, color: 'var(--site-text-primary)',
              fontWeight: 500, marginBottom: 48, fontStyle: 'italic',
              background: 'rgba(197,171,118,0.06)', padding: '32px', borderRadius: 20,
              borderLeft: '4px solid var(--site-gold)'
            }}>
              {post.summary}
            </p>
          )}

          <div 
            className="editorial-content"
            dangerouslySetInnerHTML={{ __html: post.content || '' }} 
          />

          {/* ── ARTICLE FOOTER & SHARE ── */}
          <footer style={{ 
            marginTop: 80, padding: '40px 0', 
            borderTop: '1px solid var(--site-border)',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            flexWrap: 'wrap', gap: 32
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
              <span style={{ fontWeight: 800, color: 'var(--site-text-primary)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Compartilhe
              </span>
              <div style={{ display: 'flex', gap: 12 }}>
                <button className="social-btn"><Linkedin size={18} /></button>
                <button className="social-btn"><Twitter size={18} /></button>
                <button className="social-btn"><Facebook size={18} /></button>
                <button className="social-btn" title="Copiar link" onClick={() => navigator.clipboard.writeText(window.location.href)}><LinkIcon size={18} /></button>
              </div>
            </div>

            <Link href="/blog" style={{
              display: 'inline-flex', alignItems: 'center', gap: 10,
              color: 'var(--site-primary)', fontWeight: 700, fontSize: '0.95rem',
              padding: '12px 24px', borderRadius: 999, background: 'rgba(30,58,138,0.05)',
              transition: 'all 0.2s', textDecoration: 'none'
            }} className="btn-return">
              <ArrowLeft size={18} /> Voltar para Artigos
            </Link>
          </footer>
        </div>
      </article>

      <style jsx global>{`
        /* Utilitários Locais do Blog */
        .btn-back:hover {
          background: #f8fafc !important;
          border-color: #cbd5e1 !important;
          color: var(--site-text-primary) !important;
        }

        .social-btn {
          width: 44px; height: 44px;
          border-radius: 50%;
          background: #fff;
          border: 1px solid var(--site-border);
          display: flex; align-items: center; justify-content: center;
          color: var(--site-text-secondary);
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          box-shadow: 0 2px 8px rgba(0,0,0,0.02);
        }
        .social-btn:hover {
          background: var(--site-surface-blue);
          border-color: var(--site-primary);
          color: var(--site-primary);
          transform: translateY(-4px) scale(1.05);
          box-shadow: 0 8px 16px rgba(30,58,138,0.15);
        }

        .btn-return:hover {
          background: var(--site-primary) !important;
          color: #fff !important;
        }

        @media (min-width: 640px) {
          .meta-divider { display: block !important; }
        }

        /* ── EDITORIAL CONTENT STYLING ── */
        .editorial-content {
          font-size: 1.125rem;
          line-height: 1.9;
          color: #334155;
          font-family: var(--font-inter), sans-serif;
        }
        
        .editorial-content > * {
          margin-bottom: 32px;
        }

        .editorial-content h2 {
          font-size: 2.1rem;
          font-weight: 800;
          margin: 64px 0 24px;
          color: var(--site-text-primary);
          letter-spacing: -0.02em;
          line-height: 1.3;
        }

        .editorial-content h3 {
          font-size: 1.6rem;
          font-weight: 700;
          margin: 48px 0 20px;
          color: var(--site-text-primary);
        }
        
        .editorial-content h4 {
          font-size: 1.25rem;
          font-weight: 700;
          margin: 32px 0 16px;
          color: var(--site-text-primary);
        }

        .editorial-content p {
          margin-bottom: 28px;
        }
        
        /* Links */
        .editorial-content a {
          color: var(--site-primary);
          text-decoration: underline;
          text-decoration-color: rgba(30,58,138,0.3);
          text-underline-offset: 4px;
          transition: text-decoration-color 0.2s;
        }
        .editorial-content a:hover {
          text-decoration-color: var(--site-primary);
        }

        /* Blockquotes / Citações */
        .editorial-content blockquote {
          margin: 48px 0;
          padding: 36px 40px;
          background: #fff;
          border-left: 4px solid var(--site-gold);
          border-radius: 0 24px 24px 0;
          position: relative;
          font-size: 1.3rem;
          color: var(--site-text-primary);
          font-weight: 500;
          font-style: italic;
          box-shadow: 0 10px 30px rgba(0,0,0,0.03);
          line-height: 1.6;
        }

        /* Listas */
        .editorial-content ul, .editorial-content ol {
          margin: 0 0 32px 0;
          padding-left: 24px;
        }
        .editorial-content li {
          margin-bottom: 12px;
          padding-left: 8px;
        }
        .editorial-content li::marker {
          color: var(--site-primary);
          font-weight: 700;
        }

        /* Imagens */
        .editorial-content img {
          max-width: 100%;
          height: auto;
          border-radius: 24px;
          margin: 48px auto;
          display: block;
          box-shadow: 0 20px 40px rgba(0,0,0,0.08);
        }

        /* Responsivo */
        @media (max-width: 768px) {
          .editorial-content {
            font-size: 1.05rem;
            line-height: 1.7;
          }
          .editorial-content h2 { font-size: 1.8rem; margin: 48px 0 20px; }
          .editorial-content blockquote { font-size: 1.15rem; padding: 24px; }
        }
      `}</style>
    </PublicLayout>
  );
}
