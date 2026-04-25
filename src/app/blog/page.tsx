'use client';

import { useEffect, useState } from 'react';
import PublicLayout from '../components/PublicLayout';
import { supabase } from '@/lib/supabase';
import {
  Calendar, Clock, Tag, Loader2, BookOpen, User, Search, ArrowRight
} from 'lucide-react';

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
  cta_text?: string;
  cta_link?: string;
}

const STATIC_POSTS: BlogPost[] = [
  {
    id: 'art-1',
    title: 'Programa Instituição Legal: Maranhão Avança na Regularização das OSCs',
    summary: 'Com a aprovação da MP 500/2025, o Governo do Maranhão e a SRS lançam o "Dia D" para tirar entidades da informalidade e habilitá-las a receber recursos.',
    content: '',
    image_url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&h=500&fit=crop',
    category: 'MROSC',
    author: 'Equipe OBGP',
    read_time: 4,
    published_at: '2026-02-21T12:00:00Z',
    is_published: true,
    created_at: '2026-02-21T12:00:00Z',
    cta_text: 'Ler Matéria Completa',
    cta_link: 'https://forms.gle/exemplo_dia_d', // Link do Forms
  },
  {
    id: 'art-2',
    title: 'Selo OSC: O Mecanismo de Certificação que Sua Entidade Precisa',
    summary: 'Entenda como o Selo atesta a regularidade e capacidade institucional das Organizações da Sociedade Civil para firmar parcerias entre a administração pública e as organizações da sociedade civil.',
    content: '',
    image_url: 'https://images.unsplash.com/photo-1573165231977-3f0e27806045?w=800&h=500&fit=crop',
    category: 'Certificação',
    author: 'Diretoria Executiva',
    read_time: 3,
    published_at: '2026-03-10T12:00:00Z',
    is_published: true,
    created_at: '2026-03-10T12:00:00Z',
    cta_text: 'Ver Critérios do Selo',
    cta_link: '/selo-osc',
  },
  {
    id: 'art-3',
    title: 'As 11 Principais Irregularidades Identificadas pelo MP-MA',
    summary: 'Um guia prático sobre os erros mais comuns em estatutos, governança e obrigações fiscais que impedem o acesso a recursos do estado.',
    content: '',
    image_url: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=800&h=500&fit=crop',
    category: 'Legislação',
    author: 'Consultoria Jurídica',
    read_time: 5,
    published_at: '2026-04-05T12:00:00Z',
    is_published: true,
    created_at: '2026-04-05T12:00:00Z',
  }
];

function formatDate(dateStr: string | null) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('pt-BR', {
    day: '2-digit', month: 'long', year: 'numeric',
  });
}

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('Todas');
  const [loading, setLoading] = useState(true);

  const categories = ['Todas', 'MROSC', 'Legislação', 'Certificação', 'Eventos'];

  useEffect(() => {
    // Simulando loading e injetando static posts em vez do supabase
    const timer = setTimeout(() => {
      setPosts(STATIC_POSTS);
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const filteredPosts = posts.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(search.toLowerCase()) || (p.summary && p.summary.toLowerCase().includes(search.toLowerCase()));
    const matchesCat = category === 'Todas' || p.category === category;
    return matchesSearch && matchesCat;
  });

  return (
    <PublicLayout>
      {/* ═══ HERO ═══ */}
      <section className="glass-section-blue page-hero">
        <div className="container">
          <div className="hero-badge"><BookOpen size={13} /> BLOG</div>
          <h1 style={{ maxWidth: 620, margin: '0 auto 20px' }}>
            Artigos e{' '}
            <span className="hero-accent-white">conteúdos</span>
          </h1>
          <p className="hero-subtitle">
            Informações, orientações e atualizações sobre gestão de parcerias, MROSC e políticas para OSCs.
          </p>
          <div className="hero-divider" />
        </div>
      </section>

      {/* ═══ BARRA DE FILTRO ═══ */}
      <section style={{ padding: '24px 0', borderBottom: '1px solid var(--site-border)', background: 'var(--site-surface-blue)' }}>
        <div className="container" style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                style={{
                  padding: '8px 16px', borderRadius: 'var(--site-radius-full)', border: 'none', cursor: 'pointer',
                  fontSize: '0.85rem', fontWeight: 600, whiteSpace: 'nowrap', transition: 'all .2s',
                  background: category === cat ? 'var(--site-primary)' : 'white',
                  color: category === cat ? 'white' : 'var(--site-text-secondary)',
                  boxShadow: category === cat ? '0 2px 8px rgba(30,58,138,.3)' : '0 1px 2px rgba(0,0,0,.05)'
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          <div style={{ position: 'relative', minWidth: 260, flex: 1, maxWidth: 360 }}>
            <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--site-text-tertiary)' }} />
            <input
              type="text"
              placeholder="Buscar artigos..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                width: '100%', padding: '10px 14px 10px 40px', borderRadius: 'var(--site-radius-full)',
                border: '1px solid var(--site-border)', outline: 'none', fontSize: '0.9rem',
                color: 'var(--site-text-primary)'
              }}
            />
          </div>
        </div>
      </section>

      {/* ═══ CONTEÚDO ═══ */}
      <section className="section-padding">
        <div className="container">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '100px 0' }}>
              <Loader2
                size={32}
                style={{ animation: 'spin 1s linear infinite', color: 'var(--site-primary)' }}
              />
            </div>
          ) : filteredPosts.length === 0 ? (
            <EmptyState />
          ) : (
            <PostGrid posts={filteredPosts} />
          )}
        </div>
      </section>
    </PublicLayout>
  );
}

function EmptyState() {
  return (
    <div style={{ textAlign: 'center', padding: '100px 0' }}>
      <div style={{
        width: 80, height: 80, borderRadius: '50%',
        background: 'var(--site-surface-blue)', display: 'flex',
        alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px',
      }}>
        <BookOpen size={32} style={{ color: 'var(--site-primary)', opacity: 0.5 }} />
      </div>
      <h3 style={{ marginBottom: 8, color: 'var(--site-text-secondary)' }}>Em breve, novos artigos</h3>
      <p style={{ color: 'var(--site-text-tertiary)', fontSize: '.95rem', maxWidth: 400, margin: '0 auto' }}>
        Publicaremos conteúdos sobre gestão de parcerias, MROSC, Lei nº 13.019/2014 e boas práticas para OSCs.
      </p>
    </div>
  );
}

function PostGrid({ posts }: { posts: BlogPost[] }) {
  const [featured, ...rest] = posts;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 48 }}>
      {/* Post em destaque */}
      {featured && <FeaturedPost post={featured} />}

      {/* Demais posts */}
      {rest.length > 0 && (
        <div className="grid-3">
          {rest.map((post, i) => (
            <PostCard key={post.id} post={post} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}

function FeaturedPost({ post }: { post: BlogPost }) {
  return (
    <article className="glass-panel" style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
      overflow: 'hidden',
    }}>
      {/* Imagem */}
      <div style={{ minHeight: 260, overflow: 'hidden', position: 'relative' }}>
        {post.image_url ? (
          <img
            src={post.image_url}
            alt={post.title}
            className="img-cover"
            style={{ height: '100%', minHeight: 260 }}
          />
        ) : (
          <div style={{
            height: '100%', minHeight: 260,
            background: 'linear-gradient(135deg, var(--site-surface-blue) 0%, var(--site-surface-gold) 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <BookOpen size={40} color="var(--site-gold-dark)" style={{ opacity: 0.3 }} />
          </div>
        )}
        <span style={{
          position: 'absolute', top: 16, left: 16,
          background: 'var(--site-primary)', color: 'white',
          fontSize: 'var(--text-xs)', fontWeight: 700,
          padding: '4px 12px', borderRadius: 'var(--site-radius-full)',
          letterSpacing: 'var(--tracking-wide)',
        }}>
          DESTAQUE
        </span>
      </div>

      {/* Texto */}
      <div style={{ padding: '36px 36px 36px' }}>
        {post.category && (
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            fontSize: 'var(--text-xs)', fontWeight: 700,
            color: 'var(--site-accent)', textTransform: 'uppercase',
            letterSpacing: 'var(--tracking-widest)', marginBottom: 14,
          }}>
            <Tag size={11} /> {post.category}
          </span>
        )}
        <h2 style={{ marginBottom: 14, lineHeight: 1.3, fontSize: 'clamp(1.3rem, 2.5vw, 1.7rem)' }}>
          {post.title}
        </h2>
        {post.summary && (
          <p style={{
            color: 'var(--site-text-secondary)',
            lineHeight: 'var(--leading-relaxed)',
            marginBottom: 24,
            fontSize: 'var(--text-base)',
          }}>
            {post.summary}
          </p>
        )}
        {post.cta_text && (
          <div style={{ marginBottom: 28 }}>
            <a href={post.cta_link || '#'} target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{ display: 'inline-flex', padding: '10px 20px', fontSize: '0.85rem' }}>
              {post.cta_text} <ArrowRight size={14} style={{ marginLeft: 6 }} />
            </a>
          </div>
        )}
        <PostMeta post={post} />
      </div>
    </article>
  );
}

function PostCard({ post, index }: { post: BlogPost; index: number }) {
  return (
    <article
      className={`glass-panel stagger-${Math.min(index + 1, 8)}`}
      style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
    >
      {/* Imagem */}
      <div style={{ height: 180, overflow: 'hidden' }}>
        {post.image_url ? (
          <img src={post.image_url} alt={post.title} className="img-cover" style={{ height: '100%' }} />
        ) : (
          <div style={{
            height: 180,
            background: 'linear-gradient(135deg, var(--site-surface-blue) 0%, var(--site-surface-gold) 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <BookOpen size={28} color="var(--site-gold-dark)" style={{ opacity: 0.3 }} />
          </div>
        )}
      </div>

      {/* Corpo */}
      <div style={{ padding: '24px 24px 28px', display: 'flex', flexDirection: 'column', flex: 1 }}>
        {post.category && (
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            fontSize: 'var(--text-xs)', fontWeight: 700,
            color: 'var(--site-accent)', textTransform: 'uppercase',
            letterSpacing: 'var(--tracking-widest)', marginBottom: 10,
          }}>
            <Tag size={10} /> {post.category}
          </span>
        )}
        <h3 className="h3-card" style={{ marginBottom: 10 }}>{post.title}</h3>
        {post.summary && (
          <p style={{
            color: 'var(--site-text-secondary)',
            lineHeight: 'var(--leading-relaxed)',
            fontSize: 'var(--text-sm)',
            marginBottom: 20,
            flex: 1,
          }}>
            {post.summary}
          </p>
        )}
        {post.cta_text && (
          <div style={{ marginBottom: 24 }}>
            <a href={post.cta_link || '#'} className="btn btn-outline-primary" style={{ padding: '8px 16px', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center' }}>
              {post.cta_text} <ArrowRight size={13} style={{ marginLeft: 6 }} />
            </a>
          </div>
        )}
        <PostMeta post={post} />
      </div>
    </article>
  );
}

function PostMeta({ post }: { post: BlogPost }) {
  return (
    <div style={{
      display: 'flex', gap: 16, flexWrap: 'wrap',
      fontSize: 'var(--text-xs)', color: 'var(--site-text-tertiary)',
      borderTop: '1px solid var(--site-border)', paddingTop: 14,
    }}>
      {post.author && (
        <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <User size={12} /> {post.author}
        </span>
      )}
      {post.published_at && (
        <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <Calendar size={12} /> {formatDate(post.published_at)}
        </span>
      )}
      {post.read_time && (
        <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <Clock size={12} /> {post.read_time} min de leitura
        </span>
      )}
    </div>
  );
}
