'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import {
  FileText,
  BookOpen,
  ShieldCheck,
  ArrowRight,
  Plus,
  Zap,
  BarChart3,
  Clock,
  Newspaper,
  Loader2,
} from 'lucide-react';

interface Post {
  id: string;
  title: string;
  created_at: string;
}

export default function DashboardOverview() {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);

  const [postCount, setPostCount] = useState(0);
  const [courseCount, setCourseCount] = useState(0);
  const [docCount, setDocCount] = useState(0);

  const [recentPosts, setRecentPosts] = useState<Post[]>([]);

  useEffect(() => {
    setMounted(true);
    async function fetchData() {
      const [postsRes, coursesRes, docsRes, recentRes] = await Promise.all([
        supabase.from('posts').select('*', { count: 'exact', head: true }),
        supabase.from('courses').select('*', { count: 'exact', head: true }),
        supabase.from('transparency_records').select('*', { count: 'exact', head: true }),
        supabase.from('posts').select('id, title, created_at').order('created_at', { ascending: false }).limit(5),
      ]);

      setPostCount(postsRes.count ?? 0);
      setCourseCount(coursesRes.count ?? 0);
      setDocCount(docsRes.count ?? 0);
      if (recentRes.data) setRecentPosts(recentRes.data);

      setLoading(false);
    }
    fetchData();
  }, []);



  function formatDate(d: string) {
    return new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  const stats = [
    { label: 'Total de Posts', value: postCount, icon: FileText, colorClass: 'primary', href: '/admin/dashboard/posts' },
    { label: 'Cursos', value: courseCount, icon: BookOpen, colorClass: 'warning', href: '/admin/dashboard/cursos' },
    { label: 'Documentos', value: docCount, icon: ShieldCheck, colorClass: 'info', href: '/admin/dashboard/transparencia' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>

      {/* KPI Cards */}
      <section className="stats-grid">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Link
              key={stat.label}
              href={stat.href}
              className={`stat-card admin-animate-in-delay-${index + 1}`}
              style={{ textDecoration: 'none', cursor: 'pointer' }}
            >
              <div className="stat-card-header">
                <div className={`stat-card-icon ${stat.colorClass}`}>
                  <Icon size={22} strokeWidth={2} />
                </div>
              </div>
              <div className="stat-card-label">{stat.label}</div>
              <div className="stat-card-value">
                {loading
                  ? <Loader2 size={20} style={{ animation: 'spin 1s linear infinite', opacity: 0.4 }} />
                  : stat.value
                }
              </div>
              <div className="stat-card-progress">
                <div className={`stat-card-progress-bar ${stat.colorClass}`} style={{ width: mounted && !loading ? '100%' : '0%' }} />
              </div>
            </Link>
          );
        })}
      </section>

      {/* Main Row */}
      <div className="content-grid cols-2">

        {/* Publicações Recentes */}
        <div className="glass-card admin-animate-in-delay-2">
          <div className="glass-card-header">
            <div className="glass-card-title">
              <div className="glass-card-title-icon"><Clock size={16} strokeWidth={2.2} /></div>
              Publicações Recentes
            </div>
            <Link href="/admin/dashboard/posts" className="glass-card-action">
              Ver todas <ArrowRight size={14} />
            </Link>
          </div>
          <div className="glass-card-body">
            {loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '32px 0' }}>
                <Loader2 size={20} style={{ animation: 'spin 1s linear infinite', opacity: 0.4 }} />
              </div>
            ) : recentPosts.length === 0 ? (
              <div className="admin-empty-state">
                <div className="admin-empty-state-icon"><Newspaper size={20} /></div>
                <div className="admin-empty-state-text">Nenhuma postagem ainda</div>
                <div className="admin-empty-state-hint">Crie sua primeira postagem no Blog.</div>
              </div>
            ) : (
              <div className="recent-posts-list">
                {recentPosts.map(post => (
                  <div key={post.id} className="recent-post-item">
                    <div className="recent-post-thumb"><FileText size={20} /></div>
                    <div className="recent-post-info">
                      <div className="recent-post-title">{post.title}</div>
                      <div className="recent-post-meta">{formatDate(post.created_at)}</div>
                    </div>
                    <span className="recent-post-status published">Publicado</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Ações Rápidas */}
        <div className="quick-actions-panel admin-animate-in-delay-3">
          <div className="quick-actions-title">
            <Zap size={18} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 6 }} />
            Ações Rápidas
          </div>
          <p className="quick-actions-desc">
            Publique e gerencie conteúdo direto para o portal do OBGP.
          </p>
          <div className="quick-actions-list">
            <Link href="/admin/dashboard/posts" className="quick-action-btn primary">
              <Plus size={18} /> Nova Postagem
            </Link>
            <Link href="/admin/dashboard/cursos" className="quick-action-btn ghost">
              <BookOpen size={18} /> Gerenciar Cursos
            </Link>
            <Link href="/admin/dashboard/transparencia" className="quick-action-btn ghost">
              <ShieldCheck size={18} /> Documentos Públicos
            </Link>
            <Link href="/admin/dashboard/analytics" className="quick-action-btn ghost">
              <BarChart3 size={18} /> Analytics
            </Link>
          </div>
        </div>
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
