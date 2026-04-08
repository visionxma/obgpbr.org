'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import PublicLayout from '../../components/PublicLayout';
import { supabase } from '@/lib/supabase';
import {
  ArrowLeft,
  BookOpen,
  Clock,
  BarChart2,
  Monitor,
  Calendar,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import Link from 'next/link';

interface Course {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  duration: string | null;
  level: string | null;
  modality: string | null;
  image_url: string | null;
  is_published: boolean;
  created_at: string;
}

const categoryColors: Record<string, string> = {
  'Agroecologia e Sementes Crioulas': '#26662F',
  'Gestão de Projetos Sociais': '#23475E',
  'Empreendedorismo Feminino': '#C5AB76',
  'Tecnologia e Inovação': '#0D364F',
  'Saúde e Bem-estar Comunitário': '#AF9C6D',
  'Educação e Cultura': '#CDB887',
  'Economia Solidária': '#12242B',
};

export default function CursoPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function fetchCourse() {
      const { data } = await supabase
        .from('courses')
        .select('*')
        .eq('id', id)
        .eq('is_published', true)
        .single();
      if (data) setCourse(data);
      else setNotFound(true);
      setLoading(false);
    }
    fetchCourse();
  }, [id]);

  const color = course?.category ? (categoryColors[course.category] || 'var(--site-primary)') : 'var(--site-primary)';

  if (loading) {
    return (
      <PublicLayout>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', gap: 12, color: 'var(--site-text-secondary)' }}>
          <Loader2 size={24} style={{ animation: 'spin 1s linear infinite' }} />
          <span>Carregando curso...</span>
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
          <h2 style={{ fontSize: '1.6rem' }}>Curso não encontrado</h2>
          <p style={{ color: 'var(--site-text-secondary)' }}>Este curso pode ter sido removido ou ainda não foi publicado.</p>
          <Link href="/cursos" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 24px', background: 'var(--site-primary)', color: 'white', textDecoration: 'none', fontWeight: 600 }}>
            <ArrowLeft size={16} /> Ver todos os cursos
          </Link>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <main className="animate-fade-up" style={{ background: 'var(--site-bg)' }}>

        {/* HERO */}
        <section style={{ position: 'relative', overflow: 'hidden', minHeight: 'auto', display: 'flex', alignItems: 'flex-end', paddingTop: 80 }}>
          {/* Background image or gradient */}
          {course!.image_url ? (
            <>
              <div style={{ position: 'absolute', inset: 0, backgroundImage: `url(${course!.image_url})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.9) 20%, rgba(0,0,0,0.4) 100%)' }} />
            </>
          ) : (
            <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(135deg, ${color}22 0%, var(--site-bg) 100%)` }} />
          )}

          <div className="container" style={{ position: 'relative', zIndex: 1, padding: '40px 0 60px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 12, marginBottom: 24 }}>
              <Link href="/cursos" className="course-back-link" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: course!.image_url ? 'rgba(255,255,255,0.8)' : 'var(--site-text-secondary)', fontSize: '0.9rem', textDecoration: 'none', transition: 'opacity 0.2s' }}>
                <ArrowLeft size={16} /> Voltar para Cursos
              </Link>

              {course!.category && (
                <div style={{ display: 'inline-flex', alignItems: 'center', padding: '5px 14px', background: `${color}25`, color, fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.07em', borderRadius: 'var(--site-radius-full)', textTransform: 'uppercase' }}>
                  {course!.category}
                </div>
              )}
            </div>

            <h1 style={{
              fontSize: 'clamp(1.75rem, 5vw, 3.25rem)',
              lineHeight: 1.1,
              marginBottom: 20,
              color: course!.image_url ? 'white' : 'var(--site-text-primary)',
              maxWidth: 850,
              fontWeight: 800,
            }}>
              {course!.title}
            </h1>

            {/* Meta badges */}
            {(course!.duration || course!.level || course!.modality) && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                {course!.duration && (
                  <span className="course-badge">
                    <Clock size={14} /> {course!.duration}
                  </span>
                )}
                {course!.level && (
                  <span className="course-badge">
                    <BarChart2 size={14} /> {course!.level}
                  </span>
                )}
                {course!.modality && (
                  <span className="course-badge">
                    <Monitor size={14} /> {course!.modality}
                  </span>
                )}
              </div>
            )}
          </div>
        </section>

        {/* CONTENT */}
        <section className="glass-section-white" style={{ padding: '60px 0 100px' }}>
          <div className="container course-grid">

            {/* Main content */}
            <div className="course-main-content">
              <h2 style={{ fontSize: '1.5rem', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 10, fontWeight: 700 }}>
                <BookOpen size={22} color={color} /> Sobre o Curso
              </h2>

              {course!.description ? (
                <div style={{ fontSize: '1.05rem', lineHeight: 1.8, color: 'var(--site-text-secondary)', whiteSpace: 'pre-wrap' }}>
                  {course!.description}
                </div>
              ) : (
                <p style={{ color: 'var(--site-text-tertiary)', fontStyle: 'italic' }}>
                  Descrição detalhada em breve.
                </p>
              )}
            </div>

            {/* Sidebar card */}
            <aside className="course-sidebar">
              <div className="glass-panel" style={{ padding: 28 }}>
                <h3 style={{ fontSize: '1.15rem', marginBottom: 24, fontWeight: 800 }}>Informações do Curso</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  {course!.category && (
                    <div className="sidebar-info-row">
                      <span className="sidebar-info-label">Área</span>
                      <span className="sidebar-info-value">{course!.category}</span>
                    </div>
                  )}
                  {course!.duration && (
                    <div className="sidebar-info-row">
                      <span className="sidebar-info-label">Carga Horária</span>
                      <span className="sidebar-info-value"><Clock size={16} color={color} /> {course!.duration}</span>
                    </div>
                  )}
                  {course!.level && (
                    <div className="sidebar-info-row">
                      <span className="sidebar-info-label">Nível</span>
                      <span className="sidebar-info-value"><BarChart2 size={16} color={color} /> {course!.level}</span>
                    </div>
                  )}
                  {course!.modality && (
                    <div className="sidebar-info-row">
                      <span className="sidebar-info-label">Modalidade</span>
                      <span className="sidebar-info-value"><Monitor size={16} color={color} /> {course!.modality}</span>
                    </div>
                  )}
                  <div className="sidebar-info-row">
                    <span className="sidebar-info-label">Publicado em</span>
                    <span className="sidebar-info-value">
                      <Calendar size={16} color={color} />
                      {new Date(course!.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                    </span>
                  </div>
                </div>

                <div style={{ marginTop: 32, paddingTop: 24, borderTop: '1px solid var(--site-border)' }}>
                  <button
                    className="btn btn-primary"
                    style={{ width: '100%', justifyContent: 'center', padding: '16px 24px' }}
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  >
                    Quero me Inscrever
                  </button>
                </div>
              </div>
            </aside>
          </div>
        </section>

        {/* BACK LINK */}
        <div className="container" style={{ paddingTop: 40, paddingBottom: 100 }}>
          <Link 
            href="/cursos" 
            className="back-to-catalog"
            style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: 10, 
              color: 'var(--site-text-secondary)', 
              textDecoration: 'none', 
              fontSize: '0.9rem', 
              fontWeight: 600,
              padding: '12px 20px',
              background: 'rgba(0,0,0,0.03)',
              borderRadius: 'var(--site-radius-full)',
              transition: 'all 0.2s ease',
              border: '1px solid transparent'
            }}
          >
            <ArrowLeft size={16} /> Ver todos os cursos
          </Link>
          <style>{`
            .back-to-catalog:hover {
              background: white !important;
              color: var(--site-primary) !important;
              border-color: var(--site-border) !important;
              transform: translateX(-4px);
              box-shadow: var(--site-shadow-sm);
            }
          `}</style>
        </div>
      </main>
      <style>{`
        .course-grid {
          display: grid;
          grid-template-columns: 1fr 340px;
          gap: 60px;
          align-items: start;
        }

        .course-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          background: ${course!.image_url ? 'rgba(255,255,255,0.12)' : 'var(--site-surface)'};
          border: 1px solid ${course!.image_url ? 'rgba(255,255,255,0.18)' : 'var(--site-border)'};
          color: ${course!.image_url ? 'white' : 'var(--site-text-secondary)'};
          font-size: 0.85rem;
          font-weight: 600;
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
        }

        .sidebar-info-row {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .sidebar-info-label {
          fontSize: 0.72rem;
          font-weight: 700;
          color: var(--site-text-tertiary);
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .sidebar-info-value {
          fontSize: 1rem;
          color: var(--site-text-primary);
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .course-sidebar {
          position: sticky;
          top: 100px;
        }

        @media (max-width: 1024px) {
          .course-grid {
            grid-template-columns: 1fr;
            gap: 48px;
          }
          .course-sidebar {
            position: static;
          }
        }

        @media (max-width: 640px) {
          .glass-panel {
            padding: 24px !important;
          }
        }
      `}</style>
    </PublicLayout>
  );
}
