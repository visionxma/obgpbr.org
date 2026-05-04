'use client';

import { useEffect, useState } from 'react';
import PublicLayout from '../components/PublicLayout';
import { supabase } from '@/lib/supabase';
import {
  Calendar, Clock, Tag, Loader2, BookOpen, User, Search,
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

function getInitials(name: string | null) {
  if (!name) return 'OB';
  return name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
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
      {/* ═══ HERO ═══ */}
      <section className="glass-section-blue page-hero">
        <div className="container">
          <div className="hero-badge"><BookOpen size={13} /> BLOG & ARTIGOS</div>
          <h1 style={{ maxWidth: 680, margin: '0 auto 20px' }}>
            Conhecimento que{' '}
            <span className="hero-accent-white">transforma</span>
          </h1>
          <p className="hero-subtitle" style={{ maxWidth: 560 }}>
            Artigos, orientações e análises sobre gestão de parcerias, MROSC, Lei nº 13.019/2014 e boas práticas para OSCs.
          </p>

          {/* Search premium */}
          <div style={{
            maxWidth: 560, margin: '36px auto 0', position: 'relative',
            transition: 'transform .3s ease',
            transform: searchFocused ? 'scale(1.02)' : 'scale(1)',
          }}>
            <Search size={18} style={{
              position: 'absolute', left: 22, top: '50%', transform: 'translateY(-50%)',
              color: searchFocused ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.35)',
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
                width: '100%', padding: '17px 24px 17px 54px',
                border: searchFocused ? '1px solid rgba(255,255,255,0.4)' : '1px solid rgba(255,255,255,0.12)',
                borderRadius: 16,
                background: searchFocused ? 'rgba(255,255,255,0.14)' : 'rgba(255,255,255,0.07)',
                backdropFilter: 'blur(16px)',
                fontSize: '.95rem', color: '#fff', outline: 'none',
                transition: 'all .3s ease',
                boxShadow: searchFocused ? '0 8px 32px rgba(0,0,0,0.2)' : 'none',
              }}
            />
          </div>

          <div className="hero-divider" />
        </div>
      </section>

      {/* ═══ FILTER BAR ═══ */}
      <section style={{
        padding: '18px 0',
        borderBottom: '1px solid var(--site-border)',
        background: '#fff',
        position: 'sticky', top: 0, zIndex: 20,
        backdropFilter: 'blur(12px)',
      }}>
        <div className="container" style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 2 }}>
            {categories.map(cat => {
              const active = category === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  style={{
                    padding: '7px 18px', borderRadius: 999,
                    border: active ? 'none' : '1px solid var(--site-border)',
                    cursor: 'pointer',
                    fontSize: '0.82rem', fontWeight: active ? 700 : 500,
                    whiteSpace: 'nowrap', transition: 'all .25s ease',
                    background: active
                      ? 'linear-gradient(135deg, var(--site-primary) 0%, #2563eb 100%)'
                      : 'transparent',
                    color: active ? 'white' : 'var(--site-text-secondary)',
                    boxShadow: active ? '0 2px 12px rgba(30,58,138,.25)' : 'none',
                    transform: active ? 'scale(1.04)' : 'scale(1)',
                  }}
                >
                  {cat}
                </button>
              );
            })}
          </div>
          <span style={{ fontSize: '.78rem', color: 'var(--site-text-tertiary)', fontWeight: 500 }}>
            {filteredPosts.length} artigo{filteredPosts.length !== 1 ? 's' : ''}
          </span>
        </div>
      </section>

      {/* ═══ CONTENT ═══ */}
      <section className="section-padding" style={{ background: 'var(--site-bg)' }}>
        <div className="container">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '120px 0' }}>
              <div style={{
                width: 56, height: 56, borderRadius: 16,
                background: 'var(--site-surface-blue)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 20px',
                animation: 'pulse 2s ease-in-out infinite',
              }}>
                <Loader2 size={24} style={{ animation: 'spin 1s linear infinite', color: 'var(--site-primary)' }} />
              </div>
              <p style={{ color: 'var(--site-text-tertiary)', fontSize: '.9rem' }}>Carregando artigos...</p>
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
    <div style={{ textAlign: 'center', padding: '100px 0' }}>
      <div style={{
        width: 100, height: 100, borderRadius: 28,
        background: 'linear-gradient(135deg, var(--site-surface-blue) 0%, var(--site-surface-gold) 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        margin: '0 auto 28px',
        boxShadow: '0 8px 32px rgba(30,58,138,0.08)',
      }}>
        {hasSearch
          ? <Search size={36} style={{ color: 'var(--site-primary)', opacity: 0.4 }} />
          : <Sparkles size={36} style={{ color: 'var(--site-gold-dark)', opacity: 0.5 }} />
        }
      </div>
      <h3 style={{ marginBottom: 10, color: 'var(--site-text-primary)', fontSize: '1.2rem' }}>
        {hasSearch ? 'Nenhum artigo encontrado' : 'Em breve, novos conteúdos'}
      </h3>
      <p style={{ color: 'var(--site-text-tertiary)', fontSize: '.92rem', maxWidth: 420, margin: '0 auto', lineHeight: 1.7 }}>
        {hasSearch
          ? 'Tente ajustar sua busca ou remover os filtros para encontrar o que procura.'
          : 'Publicaremos artigos sobre gestão de parcerias, MROSC, Lei nº 13.019/2014 e boas práticas para OSCs.'
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 56 }}>
      {featured && <FeaturedPost post={featured} />}
      {rest.length > 0 && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <TrendingUp size={16} style={{ color: 'var(--site-primary)' }} />
              <h3 style={{ fontSize: '1.1rem', margin: 0, fontWeight: 700, color: 'var(--site-text-primary)' }}>
                Mais artigos
              </h3>
            </div>
            <div style={{ flex: 1, height: 1, background: 'var(--site-border)' }} />
          </div>
          <div className="grid-3">
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
   FEATURED POST — editorial hero
   ═══════════════════════════════════════ */
function FeaturedPost({ post }: { post: BlogPost }) {
  const cs = catStyle(post.category);
  return (
    <Link href={`/blog/${post.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
      <article
        className="blog-featured-card"
        style={{
          display: 'grid',
          gridTemplateColumns: '1.15fr 1fr',
          minHeight: 420,
          borderRadius: 24,
          overflow: 'hidden',
          background: '#fff',
          border: '1px solid var(--site-border)',
          boxShadow: '0 4px 24px rgba(0,0,0,0.04)',
          transition: 'all .4s cubic-bezier(.23,1,.32,1)',
          cursor: 'pointer',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.transform = 'translateY(-6px)';
          e.currentTarget.style.boxShadow = '0 20px 60px rgba(30,58,138,0.12)';
          e.currentTarget.style.borderColor = 'var(--site-gold)';
          const img = e.currentTarget.querySelector('.blog-feat-img') as HTMLElement;
          if (img) img.style.transform = 'scale(1.06)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = 'none';
          e.currentTarget.style.boxShadow = '0 4px 24px rgba(0,0,0,0.04)';
          e.currentTarget.style.borderColor = 'var(--site-border)';
          const img = e.currentTarget.querySelector('.blog-feat-img') as HTMLElement;
          if (img) img.style.transform = 'scale(1)';
        }}
      >
        {/* Image side */}
        <div style={{ position: 'relative', overflow: 'hidden' }}>
          {post.image_url ? (
            <img
              src={post.image_url}
              alt={post.title || 'Artigo em destaque'}
              className="img-cover blog-feat-img"
              style={{ height: '100%', minHeight: 420, transition: 'transform .6s cubic-bezier(.23,1,.32,1)' }}
            />
          ) : (
            <div className="blog-feat-img" style={{
              height: '100%', minHeight: 420,
              background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 40%, #c5ab76 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'transform .6s cubic-bezier(.23,1,.32,1)',
            }}>
              <BookOpen size={56} color="rgba(255,255,255,0.15)" />
            </div>
          )}
          {/* Gradient overlay */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(to right, transparent 60%, rgba(0,0,0,0.03) 100%)',
          }} />
          {/* Badge */}
          <div style={{
            position: 'absolute', top: 20, left: 20,
            display: 'flex', alignItems: 'center', gap: 6,
            background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(8px)',
            padding: '6px 14px', borderRadius: 999,
            boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
          }}>
            <Sparkles size={12} style={{ color: 'var(--site-gold-dark)' }} />
            <span style={{ fontSize: '.7rem', fontWeight: 800, color: 'var(--site-primary)', letterSpacing: '.06em', textTransform: 'uppercase' }}>
              Destaque
            </span>
          </div>
        </div>

        {/* Text side */}
        <div style={{ padding: '44px 44px 40px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          {post.category && (
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 5, width: 'fit-content',
              fontSize: '.7rem', fontWeight: 700, textTransform: 'uppercase',
              letterSpacing: '.08em', marginBottom: 18,
              padding: '5px 14px', borderRadius: 999,
              background: cs.bg, color: cs.fg,
            }}>
              <Tag size={10} /> {post.category}
            </span>
          )}
          <h2 style={{
            fontSize: 'clamp(1.4rem, 2.5vw, 1.85rem)', lineHeight: 1.25,
            marginBottom: 16, fontWeight: 800,
            color: 'var(--site-text-primary)',
          }}>
            {post.title || 'Artigo em destaque'}
          </h2>
          {post.summary && (
            <p style={{
              color: 'var(--site-text-secondary)', lineHeight: 1.75,
              marginBottom: 28, fontSize: '.95rem',
              display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden',
            }}>
              {post.summary}
            </p>
          )}
          {/* Author + meta */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 'auto' }}>
            <div style={{
              width: 40, height: 40, borderRadius: 12,
              background: 'linear-gradient(135deg, var(--site-primary) 0%, #2563eb 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontSize: '.75rem', fontWeight: 800, letterSpacing: '.04em',
              flexShrink: 0,
            }}>
              {getInitials(post.author)}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '.85rem', fontWeight: 600, color: 'var(--site-text-primary)' }}>
                {post.author || 'OBGP'}
              </div>
              <div style={{ display: 'flex', gap: 12, fontSize: '.75rem', color: 'var(--site-text-tertiary)', marginTop: 2 }}>
                {post.published_at && <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Calendar size={11} /> {formatDate(post.published_at)}</span>}
                {post.read_time && <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={11} /> {post.read_time} min</span>}
              </div>
            </div>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 5,
              padding: '8px 16px', borderRadius: 999,
              background: 'var(--site-surface-blue)',
              color: 'var(--site-primary)', fontSize: '.8rem', fontWeight: 700,
              flexShrink: 0,
            }}>
              Ler artigo <ArrowRight size={13} />
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}

/* ═══════════════════════════════════════
   POST CARD — grid item
   ═══════════════════════════════════════ */
function PostCard({ post, index }: { post: BlogPost; index: number }) {
  const cs = catStyle(post.category);
  return (
    <Link href={`/blog/${post.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
      <article
        className={`stagger-${Math.min(index + 1, 8)}`}
        style={{
          overflow: 'hidden', display: 'flex', flexDirection: 'column',
          height: '100%', borderRadius: 20,
          background: '#fff', border: '1px solid var(--site-border)',
          boxShadow: '0 2px 12px rgba(0,0,0,0.03)',
          transition: 'all .35s cubic-bezier(.23,1,.32,1)',
          cursor: 'pointer',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.transform = 'translateY(-8px)';
          e.currentTarget.style.boxShadow = '0 16px 48px rgba(30,58,138,0.1)';
          e.currentTarget.style.borderColor = 'var(--site-gold)';
          const img = e.currentTarget.querySelector('.blog-card-img') as HTMLElement;
          if (img) img.style.transform = 'scale(1.08)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = 'none';
          e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.03)';
          e.currentTarget.style.borderColor = 'var(--site-border)';
          const img = e.currentTarget.querySelector('.blog-card-img') as HTMLElement;
          if (img) img.style.transform = 'scale(1)';
        }}
      >
        {/* Image */}
        <div style={{ height: 200, overflow: 'hidden', position: 'relative' }}>
          {post.image_url ? (
            <img src={post.image_url} alt={post.title || 'Artigo'} className="img-cover blog-card-img"
              style={{ height: '100%', transition: 'transform .5s cubic-bezier(.23,1,.32,1)' }} />
          ) : (
            <div className="blog-card-img" style={{
              height: '100%',
              background: 'linear-gradient(135deg, var(--site-surface-blue) 0%, var(--site-surface-gold) 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'transform .5s cubic-bezier(.23,1,.32,1)',
            }}>
              <BookOpen size={30} color="var(--site-gold-dark)" style={{ opacity: 0.25 }} />
            </div>
          )}
          {/* Reading time pill */}
          {post.read_time && (
            <div style={{
              position: 'absolute', top: 14, right: 14,
              display: 'flex', alignItems: 'center', gap: 4,
              background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(8px)',
              padding: '4px 10px', borderRadius: 999,
              color: '#fff', fontSize: '.68rem', fontWeight: 600,
            }}>
              <Clock size={10} /> {post.read_time} min
            </div>
          )}
          {/* Category chip on image */}
          {post.category && (
            <div style={{
              position: 'absolute', bottom: 14, left: 14,
              display: 'flex', alignItems: 'center', gap: 4,
              background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(8px)',
              padding: '4px 12px', borderRadius: 999,
              fontSize: '.68rem', fontWeight: 700,
              color: cs.fg, textTransform: 'uppercase', letterSpacing: '.05em',
            }}>
              <Tag size={9} /> {post.category}
            </div>
          )}
        </div>

        {/* Body */}
        <div style={{ padding: '22px 24px 26px', display: 'flex', flexDirection: 'column', flex: 1 }}>
          <h3 style={{
            fontSize: '1.05rem', fontWeight: 700, lineHeight: 1.35,
            marginBottom: 10, color: 'var(--site-text-primary)',
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
          }}>
            {post.title || 'Artigo sem título'}
          </h3>
          {post.summary && (
            <p style={{
              color: 'var(--site-text-secondary)', lineHeight: 1.65,
              fontSize: '.85rem', marginBottom: 18, flex: 1,
              display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden',
            }}>
              {post.summary}
            </p>
          )}

          {/* Footer */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            paddingTop: 16, borderTop: '1px solid var(--site-border)', marginTop: 'auto',
          }}>
            <div style={{
              width: 30, height: 30, borderRadius: 8,
              background: 'linear-gradient(135deg, var(--site-primary) 0%, #2563eb 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontSize: '.6rem', fontWeight: 800,
              flexShrink: 0,
            }}>
              {getInitials(post.author)}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '.78rem', fontWeight: 600, color: 'var(--site-text-primary)' }}>
                {post.author || 'OBGP'}
              </div>
              {post.published_at && (
                <div style={{ fontSize: '.7rem', color: 'var(--site-text-tertiary)' }}>
                  {formatDateShort(post.published_at)}
                </div>
              )}
            </div>
            <ArrowRight size={14} style={{ color: 'var(--site-primary)', flexShrink: 0 }} />
          </div>
        </div>
      </article>
    </Link>
  );
}
