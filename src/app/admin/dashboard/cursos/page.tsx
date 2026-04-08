'use client';
import { supabase } from '@/lib/supabase';
import { createPortal } from 'react-dom';
import { useEffect, useState, useRef } from 'react';
import {
  BookOpen,
  Plus,
  Trash2,
  Edit3,
  Calendar,
  Loader2,
  FolderOpen,
  AlertCircle,
  CheckCircle2,
  Search,
  Image as ImageIcon,
  X,
  Save,
  Upload,
} from 'lucide-react';

/**
 * Gestão do Catálogo de Cursos — Instituto Gênesis
 * CRUD completo com editor inline e upload de imagem.
 *
 * Tabela Supabase necessária:
 *   CREATE TABLE courses (
 *     id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 *     title text NOT NULL,
 *     description text,
 *     category text,
 *     duration text,
 *     level text,
 *     modality text,
 *     image_url text,
 *     is_published boolean DEFAULT true,
 *     created_at timestamptz DEFAULT now()
 *   );
 */

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

const COURSE_CATEGORIES = [
  'Agroecologia e Sementes Crioulas',
  'Gestão de Projetos Sociais',
  'Empreendedorismo Feminino',
  'Tecnologia e Inovação',
  'Saúde e Bem-estar Comunitário',
  'Educação e Cultura',
  'Economia Solidária',
];

const LEVELS = ['Básico', 'Intermediário', 'Avançado'];
const MODALITIES = ['Presencial', 'EAD', 'Híbrido'];
const BUCKET_NAME = 'images';

const categoryColors: Record<string, string> = {
  'Agroecologia e Sementes Crioulas': '#26662F',
  'Gestão de Projetos Sociais': '#23475E',
  'Empreendedorismo Feminino': '#C5AB76',
  'Tecnologia e Inovação': '#0D364F',
  'Saúde e Bem-estar Comunitário': '#AF9C6D',
  'Educação e Cultura': '#CDB887',
  'Economia Solidária': '#12242B',
};

export default function CursosAdmin() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [showEditor, setShowEditor] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formCategory, setFormCategory] = useState('');
  const [formDuration, setFormDuration] = useState('');
  const [formLevel, setFormLevel] = useState('');
  const [formModality, setFormModality] = useState('');
  const [formImageUrl, setFormImageUrl] = useState('');
  const [formPublished, setFormPublished] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { fetchCourses(); }, []);

  useEffect(() => {
    if (notification) {
      const t = setTimeout(() => setNotification(null), 4000);
      return () => clearTimeout(t);
    }
  }, [notification]);

  async function fetchCourses() {
    setLoading(true);
    const { data } = await supabase.from('courses').select('*').order('created_at', { ascending: false });
    if (data) setCourses(data);
    setLoading(false);
  }

  function openNew() {
    setEditingCourse(null);
    setFormTitle(''); setFormDescription(''); setFormCategory('');
    setFormDuration(''); setFormLevel(''); setFormModality('');
    setFormImageUrl(''); setFormPublished(true); setImageError(false);
    setShowEditor(true);
  }

  function openEdit(c: Course) {
    setEditingCourse(c);
    setFormTitle(c.title);
    setFormDescription(c.description || '');
    setFormCategory(c.category || '');
    setFormDuration(c.duration || '');
    setFormLevel(c.level || '');
    setFormModality(c.modality || '');
    setFormImageUrl(c.image_url || '');
    setFormPublished(c.is_published);
    setImageError(false);
    setShowEditor(true);
  }

  function closeEditor() { setShowEditor(false); setEditingCourse(null); setUploading(false); }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true); setImageError(false);
    const safeName = `${Date.now()}-${file.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9.-]+/g, '-')}`;
    const { data, error } = await supabase.storage.from(BUCKET_NAME).upload(safeName, file);
    if (data) {
      const { data: { publicUrl } } = supabase.storage.from(BUCKET_NAME).getPublicUrl(safeName);
      setFormImageUrl(publicUrl);
      setNotification({ type: 'success', message: 'Imagem carregada!' });
    } else {
      setNotification({ type: 'error', message: error?.message || 'Erro no upload.' });
    }
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!formTitle.trim()) return;
    setSaving(true);
    const payload = {
      title: formTitle.trim(),
      description: formDescription || null,
      category: formCategory || null,
      duration: formDuration || null,
      level: formLevel || null,
      modality: formModality || null,
      image_url: formImageUrl || null,
      is_published: formPublished,
    };

    if (editingCourse) {
      const { error } = await supabase.from('courses').update(payload).eq('id', editingCourse.id);
      if (!error) {
        setCourses(prev => prev.map(c => c.id === editingCourse.id ? { ...c, ...payload } : c));
        setNotification({ type: 'success', message: 'Curso atualizado!' });
        closeEditor();
      } else {
        setNotification({ type: 'error', message: error.message });
      }
    } else {
      const { data, error } = await supabase.from('courses').insert([payload]).select();
      if (data?.[0]) {
        setCourses(prev => [data[0], ...prev]);
        setNotification({ type: 'success', message: `Curso "${formTitle.trim()}" criado!` });
        closeEditor();
      } else {
        setNotification({ type: 'error', message: error?.message || 'Erro ao criar.' });
      }
    }
    setSaving(false);
  }

  async function handleDelete(id: string, title: string) {
    if (!confirm(`Remover curso "${title}"?`)) return;
    setDeletingId(id);
    const { error } = await supabase.from('courses').delete().eq('id', id);
    if (!error) {
      setCourses(prev => prev.filter(c => c.id !== id));
      setNotification({ type: 'success', message: 'Curso removido.' });
    } else {
      setNotification({ type: 'error', message: error.message });
    }
    setDeletingId(null);
  }

  function formatDate(d: string) {
    return new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  const filtered = courses.filter(c => {
    const matchSearch = c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.category || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchCat = !filterCategory || c.category === filterCategory;
    return matchSearch && matchCat;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* Toast */}
      {notification && typeof document !== 'undefined' && createPortal(
        <div className="admin-animate-in" style={{
          position: 'fixed', top: 90, right: 40, zIndex: 9999,
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '14px 20px', borderRadius: 'var(--admin-radius-md)',
          background: notification.type === 'success' ? 'var(--admin-success-bg)' : 'var(--admin-danger-bg)',
          color: notification.type === 'success' ? 'var(--admin-success)' : 'var(--admin-danger)',
          border: `1px solid ${notification.type === 'success' ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}`,
          fontSize: '0.85rem', fontWeight: 600, boxShadow: 'var(--admin-shadow-lg)',
        }}>
          {notification.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          {notification.message}
        </div>,
        document.body
      )}

      {/* Action Bar */}
      <div className="admin-animate-in" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: 10, flex: 1, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0 14px', height: 42, borderRadius: 'var(--admin-radius-md)', background: 'var(--admin-surface)', border: '1px solid var(--admin-border)', flex: 1, maxWidth: 320 }}>
            <Search size={16} style={{ color: 'var(--admin-text-tertiary)', flexShrink: 0 }} />
            <input type="text" placeholder="Buscar cursos..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
              style={{ border: 'none', background: 'none', outline: 'none', fontFamily: 'inherit', fontSize: '0.85rem', color: 'var(--admin-text-primary)', width: '100%' }} />
          </div>
          <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)}
            style={{ height: 42, padding: '0 14px', borderRadius: 'var(--admin-radius-md)', border: '1px solid var(--admin-border)', background: 'var(--admin-surface)', color: 'var(--admin-text-primary)', fontSize: '0.85rem', cursor: 'pointer' }}>
            <option value="">Todas as categorias</option>
            {COURSE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--admin-text-tertiary)', fontWeight: 500 }}>
            {courses.length} curso{courses.length !== 1 ? 's' : ''}
          </span>
          <button className="admin-btn admin-btn-primary" onClick={openNew}>
            <Plus size={16} /> Novo Curso
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="glass-card admin-animate-in-delay-1">
        <div className="glass-card-body" style={{ padding: '0 28px 28px' }}>
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18, padding: '28px 0' }}>
              {[1,2,3,4].map(i => <div key={i} className="admin-skeleton" style={{ height: 24, width: `${90-i*8}%` }} />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="admin-empty-state">
              <div className="admin-empty-state-icon"><FolderOpen size={24} /></div>
              <div className="admin-empty-state-text">{courses.length === 0 ? 'Nenhum curso cadastrado' : 'Nenhum resultado'}</div>
              <div className="admin-empty-state-hint">{courses.length === 0 ? 'Crie seu primeiro curso.' : 'Tente outra busca.'}</div>
            </div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Curso</th>
                  <th>Categoria</th>
                  <th>Detalhes</th>
                  <th>Status</th>
                  <th>Data</th>
                  <th style={{ textAlign: 'right' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(course => (
                  <tr key={course.id}>
                    <td className="cell-primary">
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{
                          width: 44, height: 44, borderRadius: 'var(--admin-radius-sm)', flexShrink: 0,
                          background: course.image_url ? `url(${course.image_url}) center/cover` : 'var(--admin-primary-subtle)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--admin-primary)',
                        }}>
                          {!course.image_url && <BookOpen size={18} />}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{course.title}</div>
                          {course.description && (
                            <div style={{ fontSize: '0.72rem', color: 'var(--admin-text-tertiary)', marginTop: 2, maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {course.description}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>
                      {course.category ? (
                        <span className="admin-tag" style={{ borderLeft: `3px solid ${categoryColors[course.category] || 'var(--admin-primary)'}` }}>
                          {course.category}
                        </span>
                      ) : <span style={{ color: 'var(--admin-text-tertiary)', fontSize: '0.8rem' }}>—</span>}
                    </td>
                    <td>
                      <div style={{ fontSize: '0.8rem', color: 'var(--admin-text-secondary)', display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {course.duration && <span>{course.duration}</span>}
                        {course.level && <span style={{ color: 'var(--admin-text-tertiary)' }}>{course.level} • {course.modality}</span>}
                      </div>
                    </td>
                    <td>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 10px',
                        borderRadius: 999, fontSize: '0.72rem', fontWeight: 700,
                        background: course.is_published ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                        color: course.is_published ? 'var(--admin-success)' : 'var(--admin-danger)',
                      }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor' }} />
                        {course.is_published ? 'Publicado' : 'Rascunho'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', color: 'var(--admin-text-secondary)' }}>
                        <Calendar size={14} />{formatDate(course.created_at)}
                      </div>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 4 }}>
                        <button className="admin-btn admin-btn-icon" title="Editar" onClick={() => openEdit(course)}><Edit3 size={16} /></button>
                        <button className="admin-btn admin-btn-icon" title="Remover"
                          style={{ color: deletingId === course.id ? 'var(--admin-text-tertiary)' : 'var(--admin-danger)' }}
                          onClick={() => handleDelete(course.id, course.title)} disabled={deletingId === course.id}>
                          {deletingId === course.id ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Trash2 size={16} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Editor Panel */}
      {showEditor && typeof document !== 'undefined' && createPortal(
        <>
          <div onClick={closeEditor} style={{ position: 'fixed', inset: 0, background: 'rgba(13,12,27,0.5)', backdropFilter: 'blur(6px)', zIndex: 9900, animation: 'adminFadeIn 0.2s ease forwards' }} />
          <div className="admin-animate-in" style={{
            position: 'fixed', top: 0, right: 0, width: '100%', maxWidth: 660,
            height: '100vh', background: 'var(--admin-surface)', borderLeft: '1px solid var(--admin-border)',
            boxShadow: '-12px 0 40px rgba(13,12,27,0.12)', zIndex: 9910,
            display: 'flex', flexDirection: 'column', overflow: 'hidden',
          }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 28px', borderBottom: '1px solid var(--admin-border)' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, fontFamily: 'Outfit, sans-serif', margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
                <Edit3 size={18} style={{ color: 'var(--admin-primary)' }} />
                {editingCourse ? 'Editar Curso' : 'Novo Curso'}
              </h3>
              <button className="admin-btn admin-btn-icon" onClick={closeEditor} style={{ border: '1px solid var(--admin-border)' }}><X size={18} /></button>
            </div>

            {/* Form */}
            <form onSubmit={handleSave} style={{ flex: 1, overflow: 'auto', padding: 28, display: 'flex', flexDirection: 'column', gap: 20 }}>

              <div>
                <label className="admin-form-label">Título do Curso *</label>
                <input type="text" className="admin-input" placeholder="Ex: Introdução à Agroecologia" value={formTitle} onChange={e => setFormTitle(e.target.value.slice(0, 120))} required autoFocus />
                <div style={{ textAlign: 'right', marginTop: 4 }}>
                  <span style={{ fontSize: '0.7rem', color: formTitle.length >= 110 ? 'var(--admin-danger)' : 'var(--admin-text-tertiary)' }}>{formTitle.length}/120</span>
                </div>
              </div>

              <div>
                <label className="admin-form-label">Categoria</label>
                <select className="admin-input" value={formCategory} onChange={e => setFormCategory(e.target.value)} style={{ cursor: 'pointer' }}>
                  <option value="">Selecionar categoria...</option>
                  {COURSE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label className="admin-form-label">Descrição</label>
                <textarea className="admin-input" placeholder="Descreva o conteúdo, objetivos e público-alvo do curso..." value={formDescription} onChange={e => setFormDescription(e.target.value.slice(0, 600))}
                  style={{ minHeight: 100, resize: 'vertical', lineHeight: 1.6 }} />
                <div style={{ textAlign: 'right', marginTop: 4 }}>
                  <span style={{ fontSize: '0.7rem', color: formDescription.length >= 570 ? 'var(--admin-danger)' : 'var(--admin-text-tertiary)' }}>{formDescription.length}/600</span>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                <div>
                  <label className="admin-form-label">Carga Horária</label>
                  <input type="text" className="admin-input" placeholder="Ex: 40 horas" value={formDuration} onChange={e => setFormDuration(e.target.value)} />
                </div>
                <div>
                  <label className="admin-form-label">Nível</label>
                  <select className="admin-input" value={formLevel} onChange={e => setFormLevel(e.target.value)} style={{ cursor: 'pointer' }}>
                    <option value="">Selecionar...</option>
                    {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
                <div>
                  <label className="admin-form-label">Modalidade</label>
                  <select className="admin-input" value={formModality} onChange={e => setFormModality(e.target.value)} style={{ cursor: 'pointer' }}>
                    <option value="">Selecionar...</option>
                    {MODALITIES.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
              </div>

              {/* Image */}
              <div>
                <label className="admin-form-label">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><ImageIcon size={14} /> Imagem de Capa</div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--admin-text-tertiary)', fontWeight: 400 }}>Upload ou URL externa</span>
                  </div>
                </label>
                <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
                  <button type="button" className="admin-btn admin-btn-secondary" onClick={() => fileInputRef.current?.click()} disabled={uploading} style={{ flex: 1, height: 42, fontSize: '0.8rem' }}>
                    {uploading ? <Loader2 size={16} className="admin-spin" /> : <Upload size={16} />}
                    Selecionar Arquivo
                  </button>
                  <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" style={{ display: 'none' }} />
                </div>
                <div style={{ position: 'relative' }}>
                  <input type="url" className="admin-input" placeholder="Ou cole uma URL externa..." value={formImageUrl}
                    onChange={e => { setFormImageUrl(e.target.value); setImageError(false); }} style={{ paddingRight: 40 }} />
                  {formImageUrl && (
                    <button type="button" onClick={() => { setFormImageUrl(''); setImageError(false); }}
                      style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--admin-text-tertiary)', cursor: 'pointer', padding: 4 }}>
                      <X size={14} />
                    </button>
                  )}
                </div>
                {formImageUrl && (
                  <div style={{ marginTop: 10, borderRadius: 'var(--admin-radius-md)', overflow: 'hidden', border: `1px solid ${imageError ? 'var(--admin-danger)' : 'var(--admin-border)'}`, background: 'var(--admin-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: imageError ? 'auto' : 100 }}>
                    {!imageError
                      ? <img src={formImageUrl} alt="Preview" onError={() => setImageError(true)} onLoad={() => setImageError(false)} style={{ maxWidth: '100%', maxHeight: 200, display: 'block', objectFit: 'contain' }} />
                      : <div style={{ padding: 20, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, color: 'var(--admin-danger)', fontSize: '0.8rem' }}>
                          <AlertCircle size={24} /><span>URL inválida</span>
                        </div>
                    }
                  </div>
                )}
              </div>

              {/* Published toggle */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderRadius: 'var(--admin-radius-md)', background: 'var(--admin-bg)', border: '1px solid var(--admin-border)' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>Publicar curso</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-tertiary)', marginTop: 2 }}>Aparecerá no site público quando ativo</div>
                </div>
                <button type="button" onClick={() => setFormPublished(!formPublished)}
                  style={{ width: 44, height: 24, borderRadius: 999, border: 'none', cursor: 'pointer', position: 'relative', transition: 'background 0.2s', background: formPublished ? 'var(--admin-success)' : 'var(--admin-border)' }}>
                  <span style={{ position: 'absolute', top: 2, left: formPublished ? 22 : 2, width: 20, height: 20, borderRadius: '50%', background: 'white', transition: 'left 0.2s' }} />
                </button>
              </div>

              {/* Footer */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, paddingTop: 8 }}>
                <button type="button" className="admin-btn admin-btn-secondary" onClick={closeEditor}>Cancelar</button>
                <button type="submit" className="admin-btn admin-btn-primary" disabled={saving || !formTitle.trim()}
                  style={{ opacity: saving || !formTitle.trim() ? 0.6 : 1, cursor: saving || !formTitle.trim() ? 'not-allowed' : 'pointer' }}>
                  {saving ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />Salvando...</> : <><Save size={16} />{editingCourse ? 'Salvar Alterações' : 'Publicar Curso'}</>}
                </button>
              </div>
            </form>
          </div>
        </>,
        document.body
      )}

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
