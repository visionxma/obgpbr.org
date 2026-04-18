'use client';

import { useEffect, useState } from 'react';
import PublicLayout from '../components/PublicLayout';
import { supabase } from '@/lib/supabase';
import {
  Calendar, Clock, Tag, Loader2, BookOpen, ArrowRight, User,
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
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('pt-BR', {
    day: '2-digit', month: 'long', year: 'numeric',
  });
}

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await supabase
          .from('blog_posts')
          .select('*')
          .eq('is_published', true)
          .order('published_at', { ascending: false });
        setPosts((data as BlogPost[]) || []);
      } catch {
        setPosts([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

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
          ) : posts.length === 0 ? (
            <EmptyState />
          ) : (
            <PostGrid posts={posts} />
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
        <PostMeta post={post} />
        <div style={{ marginTop: 28 }}>
          <span className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 'var(--text-sm)' }}>
            Leia o artigo <ArrowRight size={15} />
          </span>
        </div>
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
            marginBottom: 16,
            flex: 1,
          }}>
            {post.summary}
          </p>
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
