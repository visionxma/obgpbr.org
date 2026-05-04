'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import PublicLayout from '../../components/PublicLayout';
import { supabase } from '@/lib/supabase';
import { Loader2, ArrowLeft, Link as LinkIcon, AlertCircle } from 'lucide-react';
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

function formatG1Date(dateStr: string | null) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${day}/${month}/${year} ${hours}h${minutes}`;
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
      
      if (!error && data) setPost(data);
      setLoading(false);
    })();
  }, [id]);

  if (loading) {
    return (
      <PublicLayout>
        <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff' }}>
          <Loader2 size={40} style={{ animation: 'spin 1s linear infinite', color: '#c00' }} />
        </div>
      </PublicLayout>
    );
  }

  if (!post) {
    return (
      <PublicLayout>
        <div style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#fff' }}>
          <AlertCircle size={48} color="#999" style={{ marginBottom: 20 }} />
          <h2 style={{ marginBottom: 16, color: '#333', fontFamily: 'Arial, sans-serif' }}>Página não encontrada</h2>
          <Link href="/blog" style={{ color: '#0669ce', textDecoration: 'none', fontWeight: 'bold' }}>Voltar para a página inicial</Link>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <article style={{ background: '#fff', minHeight: '100vh', paddingBottom: 100, fontFamily: 'Arial, Helvetica, sans-serif' }}>
        
        {/* Container Central estilo Portal de Notícias */}
        <div style={{ maxWidth: 840, margin: '0 auto', padding: '40px 20px 0' }}>
          
          {/* Breadcrumb / Back Link */}
          <button onClick={() => router.back()} style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            color: '#0669ce', fontSize: '0.875rem', fontWeight: 700,
            textDecoration: 'none', marginBottom: 24, textTransform: 'uppercase',
            background: 'none', border: 'none', cursor: 'pointer', padding: 0
          }} className="g1-back-link">
            <ArrowLeft size={16} /> Voltar
          </button>

          {/* Categoria */}
          {post.category && (
            <div style={{ marginBottom: 12 }}>
              <span style={{
                color: '#c00', fontSize: '1rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em'
              }}>
                {post.category}
              </span>
            </div>
          )}

          {/* Título Principal (Manchete) */}
          <h1 style={{ 
            fontSize: 'clamp(2.2rem, 5vw, 3.2rem)', 
            fontWeight: 800, lineHeight: 1.1, color: '#111',
            letterSpacing: '-0.03em', marginBottom: 20
          }}>
            {post.title}
          </h1>

          {/* Resumo / Linha Fina */}
          {post.summary && (
            <h2 style={{ 
              fontSize: '1.25rem', lineHeight: 1.5, color: '#555',
              fontWeight: 400, marginBottom: 24
            }}>
              {post.summary}
            </h2>
          )}

          {/* Assinatura e Data */}
          <div style={{ 
            borderTop: '1px solid #ddd', padding: '16px 0', marginBottom: 24,
            display: 'flex', flexDirection: 'column', gap: 12
          }}>
            <div>
              <span style={{ fontWeight: 700, color: '#111', fontSize: '0.9rem' }}>
                Por {post.author || 'Redação'}
              </span>
              <span style={{ color: '#555', fontSize: '0.9rem' }}> — OBGP</span>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
              <span style={{ color: '#777', fontSize: '0.85rem' }}>
                {formatG1Date(post.published_at || post.created_at)}
              </span>
              
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                {/* Ícones de Compartilhamento (Estilo Portal) */}
                <button className="g1-social-btn" title="Facebook">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c5.05-.5 9-4.76 9-9.95z"></path></svg>
                </button>
                <button className="g1-social-btn" title="Twitter/X">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.05c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"></path></svg>
                </button>
                <button className="g1-social-btn" title="WhatsApp">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M17.47 14.38c-.35-.18-2.07-1.02-2.39-1.14-.32-.12-.55-.18-.79.18-.24.36-.9 1.14-1.11 1.38-.21.24-.42.27-.77.09-.36-.18-1.48-.55-2.82-1.75-1.04-.93-1.75-2.08-1.95-2.44-.21-.36-.02-.55.16-.73.17-.16.35-.41.53-.62.18-.21.24-.36.35-.6.12-.24.06-.45-.03-.63-.09-.18-.79-1.91-1.08-2.61-.28-.69-.57-.6-.79-.61h-.68c-.24 0-.62.09-.95.45-.32.36-1.24 1.21-1.24 2.96s1.27 3.44 1.45 3.68c.18.24 2.51 3.83 6.08 5.37.85.37 1.51.59 2.03.75.85.27 1.62.23 2.23.14.69-.1 2.07-.85 2.36-1.67.3-.82.3-1.52.21-1.67-.09-.15-.33-.24-.68-.42zM12 21.94c-1.65 0-3.26-.44-4.67-1.28l-.34-.2-3.47.91.93-3.38-.22-.35A9.9 9.9 0 0 1 2.06 12C2.06 6.5 6.53 2.03 12 2.03 17.5 2.03 22 6.5 22 12s-4.5 9.94-10 9.94z"></path></svg>
                </button>
                <button className="g1-social-btn" title="Copiar link" onClick={() => navigator.clipboard.writeText(window.location.href)}>
                  <LinkIcon size={18} />
                </button>
              </div>
            </div>
            <div style={{ borderBottom: '1px solid #ddd' }} />
          </div>

          {/* Imagem de Destaque - Formato de Notícia */}
          {post.image_url && (
            <div style={{ marginBottom: 40 }}>
              <img 
                src={post.image_url} 
                alt={post.title} 
                style={{ 
                  width: '100%', 
                  height: 'auto', 
                  maxHeight: 600, // Limita altura para evitar QRCodes gigantes
                  objectFit: 'contain', // Contain para ver a imagem inteira sem cortes (ideal para gráficos/qrcodes de notícias)
                  background: '#f8f9fa',
                  display: 'block',
                  border: '1px solid #eee'
                }} 
              />
              <div style={{ 
                color: '#777', fontSize: '0.85rem', marginTop: 8, fontStyle: 'italic', 
                borderBottom: '1px solid #eee', paddingBottom: 16
              }}>
                Foto: Reprodução/OBGP
              </div>
            </div>
          )}

          {/* Corpo da Notícia (Conteúdo) */}
          <div 
            className="g1-content"
            dangerouslySetInnerHTML={{ __html: post.content || '' }} 
          />

          {/* Rodapé / Voltar */}
          <div style={{ marginTop: 40, borderTop: '1px solid #ddd', paddingTop: 24, paddingBottom: 40, display: 'flex', justifyContent: 'center' }}>
            <button onClick={() => router.back()} style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              color: '#c00', fontSize: '1rem', fontWeight: 700,
              textDecoration: 'none', padding: '12px 24px', border: '1px solid #c00',
              borderRadius: 4, transition: 'all 0.2s', background: 'transparent', cursor: 'pointer'
            }} className="g1-return-btn">
              <ArrowLeft size={18} /> Voltar para Notícias
            </button>
          </div>
        </div>
      </article>

      <style jsx global>{`
        .g1-back-link:hover {
          text-decoration: underline !important;
        }

        .g1-return-btn:hover {
          background: #c00;
          color: #fff !important;
        }

        .g1-social-btn {
          width: 36px; height: 36px;
          border-radius: 50%;
          background: #eee;
          border: none;
          display: flex; align-items: center; justify-content: center;
          color: #555;
          cursor: pointer;
          transition: background 0.2s;
        }
        .g1-social-btn:hover {
          background: #ddd;
          color: #111;
        }

        /* ── G1 CONTENT STYLING ── */
        .g1-content {
          font-size: 1.1875rem; /* 19px */
          line-height: 1.6;
          color: #333;
          font-family: Arial, Helvetica, sans-serif;
        }
        
        .g1-content > * {
          margin-bottom: 24px;
        }

        .g1-content p {
          margin-bottom: 28px;
        }

        .g1-content h2 {
          font-size: 1.75rem;
          font-weight: 800;
          margin: 48px 0 20px;
          color: #111;
          letter-spacing: -0.02em;
        }

        .g1-content h3 {
          font-size: 1.35rem;
          font-weight: 700;
          margin: 32px 0 16px;
          color: #111;
        }
        
        .g1-content a {
          color: #0669ce;
          text-decoration: none;
          font-weight: 700;
        }
        .g1-content a:hover {
          text-decoration: underline;
        }

        .g1-content blockquote {
          margin: 40px 0;
          padding: 0 0 0 24px;
          border-left: 6px solid #c00;
          font-size: 1.5rem;
          color: #111;
          font-weight: 700;
          font-style: italic;
          line-height: 1.4;
        }

        .g1-content ul, .g1-content ol {
          margin: 0 0 32px 0;
          padding-left: 24px;
        }
        .g1-content li {
          margin-bottom: 12px;
        }

        .g1-content img {
          max-width: 100%;
          height: auto;
          margin: 32px 0;
          display: block;
          border: 1px solid #eee;
        }

        /* Ajustes Mobile */
        @media (max-width: 768px) {
          .g1-content {
            font-size: 1.05rem; /* 17px */
            line-height: 1.5;
          }
          .g1-content blockquote {
            font-size: 1.25rem;
            padding-left: 16px;
            border-left-width: 4px;
          }
        }
      `}</style>
    </PublicLayout>
  );
}
