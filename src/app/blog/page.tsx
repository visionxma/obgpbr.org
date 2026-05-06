'use client';

import { useEffect, useRef, useState } from 'react';
import PublicLayout from '../components/PublicLayout';
import { supabase } from '@/lib/supabase';
import {
  Calendar, Clock, Tag, Loader2, BookOpen, Search,
  ArrowRight, Sparkles, TrendingUp,
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

function formatDateShort(dateStr: string | null) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('pt-BR', {
    day: '2-digit', month: 'short',
  });
}

const CAT_COLORS: Record<string, { bg: string; fg: string }> = {
  'MROSC': { bg: 'rgba(30,58,138,0.1)', fg: '#1e3a8a' },
  'Selo OSC': { bg: 'rgba(197,171,118,0.15)', fg: '#8B6914' },
  'Gestão': { bg: 'rgba(22,163,74,0.1)', fg: '#16a34a' },
  'Legislação': { bg: 'rgba(147,51,234,0.1)', fg: '#9333ea' },
};

function catStyle(cat: string | null) {
  if (!cat) return { bg: 'var(--site-surface-blue)', fg: 'var(--site-primary)' };
  return CAT_COLORS[cat] || { bg: 'var(--site-surface-blue)', fg: 'var(--site-primary)' };
}

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('Todas');
  const [loading, setLoading] = useState(true);
  const [searchFocused, setSearchFocused] = useState(false);
  const filterBarRef = useRef<HTMLElement>(null);
  const filterAnchorRef = useRef<HTMLDivElement>(null);
  const pendingScrollRef = useRef(false);

  // Ao trocar categoria, sempre rola até o topo da barra de filtros
  // independente de onde o usuário esteja na página.
  // O scroll real acontece no useEffect abaixo, APÓS o re-render — garantindo
  // que o offsetTop e o scrollHeight reflitam o novo layout filtrado.
  const handleCategoryChange = (newCat: string) => {
    if (newCat === category) return;
    pendingScrollRef.current = true;
    setCategory(newCat);
  };

  useEffect(() => {
    if (!pendingScrollRef.current) return;
    pendingScrollRef.current = false;
    // Dois rAFs aninhados garantem que o reflow pós-filtro tenha sido aplicado
    // antes de calcular a posição (layout só fica estável após o segundo frame).
    let raf2 = 0;
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => {
        // Âncora não-sticky: scrollIntoView funciona de forma previsível.
        // Se anchor existe, usa ele; senão, calcula posição via offsetTop traversal.
        const anchor = filterAnchorRef.current;
        if (anchor) {
          anchor.scrollIntoView({ behavior: 'smooth', block: 'start' });
          return;
        }
        // Fallback: cálculo manual com offsetTop traversal (ignora sticky)
        let el: HTMLElement | null = filterBarRef.current;
        let absTop = 0;
        while (el) {
          absTop += el.offsetTop;
          el = el.offsetParent as HTMLElement | null;
        }
        window.scrollTo({ top: Math.max(0, absTop - 100), behavior: 'smooth' });
      });
    });
    return () => {
      cancelAnimationFrame(raf1);
      if (raf2) cancelAnimationFrame(raf2);
    };
  }, [category]);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('is_published', true)
        .order('published_at', { ascending: false });

      if (data) setPosts(data);
      setLoading(false);
    })();
  }, []);

  const categories = ['Todas', ...Array.from(new Set(posts.map(p => p.category).filter((c): c is string => Boolean(c)))).sort()];

  const filteredPosts = posts.filter(p => {
    const t = (p.title || '').toLowerCase();
    const s = (p.summary || '').toLowerCase();
    const q = search.toLowerCase();
    const matchesSearch = t.includes(q) || s.includes(q);
    const matchesCat = category === 'Todas' || p.category === category;
    return matchesSearch && matchesCat;
  });

  return (
    <PublicLayout>
      {/* ═══ HERO PREMIUM ═══ */}
      <section className="glass-section-blue page-hero" style={{ position: 'relative', overflow: 'hidden' }}>
        {/* Abstract background elements */}
        <div style={{
          position: 'absolute', top: -100, right: -100, width: 400, height: 400,
          background: 'radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%)',
          borderRadius: '50%', pointerEvents: 'none'
        }} />
        <div style={{
          position: 'absolute', bottom: -50, left: -50, width: 300, height: 300,
          background: 'radial-gradient(circle, rgba(197,171,118,0.08) 0%, transparent 70%)',
          borderRadius: '50%', pointerEvents: 'none'
        }} />

        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div className="hero-badge" style={{ 
            background: 'rgba(255,255,255,0.15)', 
            border: '1px solid rgba(255,255,255,0.3)',
            backdropFilter: 'blur(10px)',
            color: '#fff'
          }}>
            <BookOpen size={13} /> BLOG & ARTIGOS
          </div>
          <h1 style={{ maxWidth: 720, margin: '0 auto 24px', letterSpacing: '-0.02em', fontSize: 'clamp(2.5rem, 5vw, 4rem)', lineHeight: 1.1 }}>
            Conhecimento que{' '}
            <span className="hero-accent-white" style={{ position: 'relative', display: 'inline-block' }}>
              transforma
              <svg style={{ position: 'absolute', bottom: -8, left: 0, width: '100%', height: 12 }} viewBox="0 0 100 12" preserveAspectRatio="none">
                <path d="M0,10 Q50,0 100,10" fill="none" stroke="rgba(197,171,118,0.6)" strokeWidth="3" strokeLinecap="round"/>
              </svg>
            </span>
          </h1>
          <p className="hero-subtitle" style={{ maxWidth: 600, fontSize: '1.1rem', opacity: 0.9 }}>
            Explore nossos artigos, orientações e análises aprofundadas sobre gestão de parcerias, MROSC, Lei nº 13.019/2014 e inovações para OSCs.
          </p>

          {/* Search Input Premium */}
          <div style={{
            maxWidth: 600, margin: '40px auto 0', position: 'relative',
            transition: 'transform .4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            transform: searchFocused ? 'scale(1.03)' : 'scale(1)',
          }}>
            <Search size={20} style={{
              position: 'absolute', left: 24, top: '50%', transform: 'translateY(-50%)',
              color: searchFocused ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.5)',
              transition: 'color .3s',
            }} />
            <input
              type="text"
              placeholder="Pesquisar artigos, temas, autores..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              style={{
                width: '100%', padding: '20px 24px 20px 60px',
                border: searchFocused ? '1px solid rgba(255,255,255,0.5)' : '1px solid rgba(255,255,255,0.2)',
                borderRadius: 20,
                background: searchFocused ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.08)',
                backdropFilter: 'blur(20px)',
                fontSize: '1.05rem', color: '#fff', outline: 'none',
                transition: 'all .3s ease',
                boxShadow: searchFocused ? '0 12px 40px rgba(0,0,0,0.15)' : '0 4px 20px rgba(0,0,0,0.05)',
              }}
            />
            {search && (
              <button 
                onClick={() => setSearch('')}
                style={{
                  position: 'absolute', right: 20, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)', cursor: 'pointer',
                  fontSize: '0.85rem', fontWeight: 600, padding: 8
                }}
              >
                Limpar
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Âncora invisível — alvo de scroll robusto (não é sticky, sem ambiguidade) */}
      <div ref={filterAnchorRef} aria-hidden="true" style={{ height: 0, scrollMarginTop: 100 }} />

      {/* ═══ STICKY FILTER BAR ═══ */}
      <section ref={filterBarRef} className="blog-filter-bar">
        <div className="container blog-filter-row">
          <div className="blog-filter-cats">
            {categories.map(cat => {
              const active = category === cat;
              return (
                <button
                  key={cat}
                  onClick={() => handleCategoryChange(cat)}
                  className={`blog-filter-btn${active ? ' active' : ''}`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
          <div className="blog-filter-count">
            {filteredPosts.length} {filteredPosts.length === 1 ? 'artigo' : 'artigos'}
          </div>
        </div>
        <style>{`
          .blog-filter-bar {
            padding: 14px 0;
            border-bottom: 1px solid var(--site-border);
            background: rgba(255, 255, 255, 0.85);
            position: sticky;
            top: 88px;
            scroll-margin-top: 100px;
            z-index: 40;
            backdrop-filter: blur(16px);
            -webkit-backdrop-filter: blur(16px);
            box-shadow: 0 4px 20px rgba(0,0,0,0.02);
          }
          .blog-filter-row {
            display: flex; align-items: center;
            gap: 12px; justify-content: space-between;
          }
          .blog-filter-cats {
            display: flex; gap: 8px;
            overflow-x: auto;
            -webkit-overflow-scrolling: touch;
            scrollbar-width: none;
            min-width: 0;
          }
          .blog-filter-cats::-webkit-scrollbar { display: none; }
          .blog-filter-btn {
            padding: 7px 16px;
            border-radius: 999px;
            border: 1px solid var(--site-border);
            cursor: pointer;
            font-size: .82rem;
            font-weight: 500;
            white-space: nowrap;
            transition: all .3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            background: #fff;
            color: var(--site-text-secondary);
            box-shadow: 0 2px 5px rgba(0,0,0,0.02);
            flex-shrink: 0;
            font-family: inherit;
          }
          .blog-filter-btn.active {
            border-color: transparent;
            background: linear-gradient(135deg, var(--site-primary) 0%, #1e40af 100%);
            color: #fff;
            font-weight: 700;
            box-shadow: 0 4px 16px rgba(30,58,138,.25);
            transform: scale(1.05);
          }
          .blog-filter-count {
            flex-shrink: 0;
            font-size: .82rem;
            color: var(--site-text-tertiary);
            font-weight: 600;
            background: var(--site-surface-blue);
            padding: 5px 11px;
            border-radius: 10px;
            white-space: nowrap;
          }
          @media (max-width: 640px) {
            .blog-filter-bar { padding: 8px 0; }
            .blog-filter-row { gap: 8px; }
            .blog-filter-btn {
              padding: 5px 12px;
              font-size: .72rem;
            }
            .blog-filter-btn.active { transform: scale(1.03); }
            .blog-filter-count {
              font-size: .68rem;
              padding: 4px 8px;
              border-radius: 8px;
            }
          }
        `}</style>
      </section>

      {/* ═══ CONTENT ═══ */}
      <section className="section-padding" style={{ background: '#f8fafc', minHeight: '60vh' }}>
        <div className="container">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '120px 0' }}>
              <div style={{
                width: 64, height: 64, borderRadius: 20,
                background: '#fff', boxShadow: '0 10px 30px rgba(30,58,138,0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 24px',
                animation: 'pulse 2s ease-in-out infinite',
              }}>
                <Loader2 size={28} style={{ animation: 'spin 1s linear infinite', color: 'var(--site-primary)' }} />
              </div>
              <p style={{ color: 'var(--site-text-tertiary)', fontSize: '1rem', fontWeight: 500 }}>Preparando os melhores conteúdos...</p>
            </div>
          ) : filteredPosts.length === 0 ? (
            <EmptyState hasSearch={!!search || category !== 'Todas'} />
          ) : (
            <PostGrid posts={filteredPosts} />
          )}
        </div>
      </section>
    </PublicLayout>
  );
}

/* ═══════════════════════════════════════
   EMPTY STATE
   ═══════════════════════════════════════ */
function EmptyState({ hasSearch }: { hasSearch: boolean }) {
  return (
    <div style={{ textAlign: 'center', padding: '100px 0', maxWidth: 480, margin: '0 auto' }}>
      <div style={{
        width: 120, height: 120, borderRadius: 32,
        background: 'linear-gradient(135deg, #fff 0%, var(--site-surface-blue) 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        margin: '0 auto 32px',
        boxShadow: '0 20px 40px rgba(30,58,138,0.08), inset 0 0 0 1px rgba(255,255,255,0.5)',
      }}>
        {hasSearch
          ? <Search size={48} style={{ color: 'var(--site-primary)', opacity: 0.5 }} />
          : <Sparkles size={48} style={{ color: 'var(--site-gold-dark)', opacity: 0.6 }} />
        }
      </div>
      <h3 style={{ marginBottom: 12, color: 'var(--site-text-primary)', fontSize: '1.4rem', fontWeight: 800 }}>
        {hasSearch ? 'Ops! Nada encontrado' : 'Novidades em breve'}
      </h3>
      <p style={{ color: 'var(--site-text-secondary)', fontSize: '1rem', lineHeight: 1.7 }}>
        {hasSearch
          ? 'Não encontramos artigos que correspondam à sua busca. Tente palavras diferentes ou limpe os filtros.'
          : 'Nossa equipe está preparando conteúdos aprofundados sobre gestão de parcerias, MROSC e boas práticas.'
        }
      </p>
    </div>
  );
}

/* ═══════════════════════════════════════
   POST GRID
   ═══════════════════════════════════════ */
function PostGrid({ posts }: { posts: BlogPost[] }) {
  const [featured, ...rest] = posts;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 64 }}>
      {featured && <FeaturedPost post={featured} />}
      
      {rest.length > 0 && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 40 }}>
            <h3 style={{ 
              fontSize: '1.4rem', margin: 0, fontWeight: 800, color: 'var(--site-text-primary)',
              display: 'flex', alignItems: 'center', gap: 10
            }}>
              <TrendingUp size={22} style={{ color: 'var(--site-primary)' }} />
              Últimas Publicações
            </h3>
            <div style={{ flex: 1, height: 2, background: 'linear-gradient(to right, var(--site-border), transparent)' }} />
          </div>
          <div className="grid-3" style={{ gap: 32 }}>
            {rest.map((post, i) => (
              <PostCard key={post.id} post={post} index={i} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════
   FEATURED POST — editorial hero card
   ═══════════════════════════════════════ */
function FeaturedPost({ post }: { post: BlogPost }) {
  const cs = catStyle(post.category);
  return (
    <Link href={`/blog/${post.id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
      <article
        className={`blog-featured-card group ${!post.image_url ? 'no-image' : ''}`}
        style={{
          display: 'grid',
          minHeight: 400,
          borderRadius: 32,
          overflow: 'hidden',
          background: '#fff',
          border: '1px solid rgba(0,0,0,0.05)',
          boxShadow: '0 10px 40px rgba(0,0,0,0.04)',
          transition: 'all .5s cubic-bezier(.23,1,.32,1)',
          position: 'relative',
        }}
      >
        {/* Image side — só renderiza se houver imagem */}
        {post.image_url && (
          <div style={{ position: 'relative', overflow: 'hidden', minHeight: 300 }}>
            <img
              src={post.image_url}
              alt={post.title || 'Artigo em destaque'}
              style={{
                width: '100%', height: '100%', objectFit: 'cover',
                transition: 'transform .7s cubic-bezier(.23,1,.32,1)',
                transform: 'scale(1.02)'
              }}
              className="featured-image"
            />
            {/* overlay sutil */}
            <div style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(180deg, rgba(0,0,0,0.2) 0%, transparent 30%, transparent 70%, rgba(0,0,0,0.4) 100%)',
              pointerEvents: 'none'
            }} />
            {/* Badge Destaque (sobre a imagem) */}
            <div style={{
              position: 'absolute', top: 24, left: 24,
              display: 'flex', alignItems: 'center', gap: 6,
              background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)',
              padding: '8px 16px', borderRadius: 999,
              boxShadow: '0 4px 15px rgba(0,0,0,0.15)',
            }}>
              <Sparkles size={14} style={{ color: 'var(--site-gold-dark)' }} />
              <span style={{ fontSize: '.75rem', fontWeight: 800, color: 'var(--site-primary)', letterSpacing: '.08em', textTransform: 'uppercase' }}>
                Destaque Especial
              </span>
            </div>
            {/* Read time pill */}
            {post.read_time && (
              <div style={{
                position: 'absolute', bottom: 24, right: 24,
                display: 'flex', alignItems: 'center', gap: 6,
                background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)',
                padding: '6px 14px', borderRadius: 999,
                color: '#fff', fontSize: '.75rem', fontWeight: 600,
                boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
              }}>
                <Clock size={12} /> {post.read_time} min de leitura
              </div>
            )}
          </div>
        )}

        {/* Text side */}
        <div style={{ padding: '48px 56px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          {/* Badge inline quando não há imagem */}
          {!post.image_url && (
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6, width: 'fit-content',
              background: 'var(--site-surface-warm)',
              padding: '6px 14px', borderRadius: 999,
              border: '1px solid var(--site-border)',
              marginBottom: 18,
            }}>
              <Sparkles size={13} style={{ color: 'var(--site-gold-dark)' }} />
              <span style={{ fontSize: '.7rem', fontWeight: 800, color: 'var(--site-primary)', letterSpacing: '.08em', textTransform: 'uppercase' }}>
                Destaque Especial
              </span>
              {post.read_time && (
                <>
                  <span style={{ width: 1, height: 14, background: 'var(--site-border)', margin: '0 4px' }} />
                  <Clock size={12} style={{ color: 'var(--site-text-tertiary)' }} />
                  <span style={{ fontSize: '.7rem', color: 'var(--site-text-secondary)', fontWeight: 600 }}>
                    {post.read_time} min
                  </span>
                </>
              )}
            </div>
          )}
          {post.category && (
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 6, width: 'fit-content',
              fontSize: '.75rem', fontWeight: 800, textTransform: 'uppercase',
              letterSpacing: '.1em', marginBottom: 20,
              padding: '6px 16px', borderRadius: 999,
              background: cs.bg, color: cs.fg,
            }}>
              <Tag size={12} /> {post.category}
            </span>
          )}
          <h2 style={{
            fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', lineHeight: 1.2,
            marginBottom: 20, fontWeight: 800,
            color: 'var(--site-text-primary)',
            letterSpacing: '-0.01em'
          }}>
            {post.title || 'Artigo em destaque'}
          </h2>
          {post.summary && (
            <p style={{
              color: 'var(--site-text-secondary)', lineHeight: 1.7,
              marginBottom: 32, fontSize: '1.05rem',
              display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden',
            }}>
              {post.summary}
            </p>
          )}
          
          {/* Author & Action */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20, marginTop: 'auto', flexWrap: 'wrap' }}>
            <div>
              {post.author && (
                <div style={{ fontSize: '.95rem', fontWeight: 700, color: 'var(--site-text-primary)', marginBottom: 2 }}>
                  {post.author}
                </div>
              )}
              {post.published_at && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '.8rem', color: 'var(--site-text-tertiary)', fontWeight: 500 }}>
                  <Calendar size={12} /> {formatDate(post.published_at)}
                </div>
              )}
            </div>
            <div className="btn-read-more" style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '12px 24px', borderRadius: 16,
              background: 'var(--site-surface-blue)',
              color: 'var(--site-primary)', fontSize: '.9rem', fontWeight: 700,
              transition: 'all .3s ease'
            }}>
              Ler artigo completo <ArrowRight size={16} />
            </div>
          </div>
        </div>
      </article>

      {/* Internal CSS for hover effects that React inline styles can't easily do without state */}
      <style dangerouslySetInnerHTML={{__html: `
        .blog-featured-card {
          grid-template-columns: 1fr;
        }
        @media (min-width: 992px) {
          .blog-featured-card {
            grid-template-columns: 36% 64%;
          }
          .blog-featured-card.no-image {
            grid-template-columns: 1fr;
          }
        }
        .blog-featured-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 60px rgba(30,58,138,0.15) !important;
          border-color: rgba(197,171,118,0.4) !important;
        }
        .blog-featured-card:hover .featured-image {
          transform: scale(1.06) !important;
        }
        .blog-featured-card:hover .btn-read-more {
          background: var(--site-primary) !important;
          color: white !important;
        }
      `}} />
    </Link>
  );
}

/* ═══════════════════════════════════════
   POST CARD — grid item (Genesis reference layout)
   ═══════════════════════════════════════ */
function PostCard({ post, index }: { post: BlogPost; index: number }) {
  // Pills exibidas abaixo do resumo — apenas as que tiverem dado.
  const pills: string[] = [];
  if (post.read_time) pills.push(`${post.read_time} min`);
  if (post.published_at) pills.push(formatDateShort(post.published_at));
  if (post.author) pills.push(post.author);

  return (
    <article
      className={`stagger-${Math.min(index + 1, 8)} blog-ref-card`}
      style={{
        display: 'flex', flexDirection: 'column',
        height: '100%', borderRadius: 18,
        background: '#fff',
        border: '1px solid rgba(15,23,42,0.08)',
        boxShadow: '0 1px 3px rgba(15,23,42,0.04)',
        transition: 'all .35s cubic-bezier(.23,1,.32,1)',
        overflow: 'hidden',
      }}
    >
      {/* Imagem com tag vermelha sobreposta */}
      <Link href={`/blog/${post.id}`} style={{ display: 'block', position: 'relative', height: 240, overflow: 'hidden' }}>
        {post.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.image_url}
            alt={post.title || 'Artigo'}
            className="blog-ref-image"
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform .6s cubic-bezier(.23,1,.32,1)' }}
          />
        ) : (
          <div className="blog-ref-image" style={{
            width: '100%', height: '100%',
            background: 'linear-gradient(135deg, var(--site-surface-blue) 0%, var(--site-surface-gold) 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'transform .6s cubic-bezier(.23,1,.32,1)',
          }}>
            <BookOpen size={40} color="var(--site-gold-dark)" style={{ opacity: 0.25 }} />
          </div>
        )}

        {post.category && (
          <span style={{
            position: 'absolute', top: 16, left: 16,
            padding: '6px 14px',
            background: '#dc2626',
            color: '#fff',
            fontSize: '.72rem', fontWeight: 700,
            letterSpacing: '.02em',
            borderRadius: 6,
            boxShadow: '0 4px 14px rgba(220,38,38,0.35)',
            maxWidth: 'calc(100% - 32px)',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {post.category}
          </span>
        )}
      </Link>

      {/* Corpo */}
      <div style={{ padding: '26px 26px 22px', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <Link href={`/blog/${post.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
          <h3 style={{
            fontSize: '1.05rem', fontWeight: 800, lineHeight: 1.25,
            marginBottom: 16, color: 'var(--site-text-primary)',
            textTransform: 'uppercase', letterSpacing: '-0.01em',
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
            minHeight: '2.6em',
          }}>
            {post.title || 'Artigo sem título'}
          </h3>
        </Link>

        {post.summary && (
          <p style={{
            color: 'var(--site-text-secondary)', lineHeight: 1.65,
            fontSize: '.9rem', marginBottom: 22,
            display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden',
          }}>
            {post.summary}
          </p>
        )}

        {pills.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 22, marginTop: post.summary ? 0 : 'auto' }}>
            {pills.map((p, i) => (
              <span key={i} style={{
                padding: '5px 12px',
                fontSize: '.74rem', fontWeight: 600,
                color: 'var(--site-text-secondary)',
                background: '#fff',
                border: '1px solid rgba(15,23,42,0.12)',
                borderRadius: 6,
                whiteSpace: 'nowrap',
              }}>
                {p}
              </span>
            ))}
          </div>
        )}

        {/* Botão inferior com borda */}
        <Link
          href={`/blog/${post.id}`}
          className="blog-ref-cta"
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '14px 18px', marginTop: 'auto',
            border: '1px solid rgba(15,23,42,0.16)',
            borderRadius: 10,
            color: 'var(--site-text-primary)',
            fontSize: '.92rem', fontWeight: 700,
            textDecoration: 'none',
            transition: 'all .25s ease',
            background: '#fff',
          }}
        >
          Ler Artigo
          <ArrowRight size={16} />
        </Link>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .blog-ref-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 14px 36px rgba(15,23,42,0.08);
          border-color: rgba(15,23,42,0.16);
        }
        .blog-ref-card:hover .blog-ref-image {
          transform: scale(1.04);
        }
        .blog-ref-cta:hover {
          background: var(--site-primary) !important;
          border-color: var(--site-primary) !important;
          color: #fff !important;
        }
      `}} />
    </article>
  );
}
