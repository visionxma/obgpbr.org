'use client';
import { supabase } from '@/lib/supabase';
import { createPortal } from 'react-dom';
import { useEffect, useState, useRef } from 'react';
import {
  FileText,
  Plus,
  Trash2,
  Edit3,
  Eye,
  Calendar,
  Loader2,
  FolderOpen,
  AlertCircle,
  CheckCircle2,
  Search,
  ArrowRight,
  Image as ImageIcon,
  X,
  Save,
  Upload,
} from 'lucide-react';

/**
 * Gestão de Postagens — Editor de Conteúdo Premium
 * CRUD completo com editor inline e upload de imagem.
 * Instituto Gênesis
 */

interface Post {
  id: string;
  title: string;
  slug: string;
  content: string;
  feature_image_url: string | null;
  category_id: string | null;
  created_at: string;
}

interface Category {
  id: string;
  name: string;
}

const BUCKET_NAME = 'images';

export default function PostsAdmin() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showEditor, setShowEditor] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  // Editor state
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formCategoryId, setFormCategoryId] = useState('');
  const [formImageUrl, setFormImageUrl] = useState('');
  const [imageError, setImageError] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  async function fetchData() {
    setLoading(true);
    const [postsRes, catsRes] = await Promise.all([
      supabase.from('posts').select('*').order('created_at', { ascending: false }),
      supabase.from('categories').select('id, name').order('name'),
    ]);
    if (postsRes.data) setPosts(postsRes.data);
    if (catsRes.data) setCategories(catsRes.data);
    setLoading(false);
  }

  function generateSlug(title: string): string {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }

  function openNewPost() {
    setEditingPost(null);
    setFormTitle('');
    setFormContent('');
    setFormCategoryId('');
    setFormImageUrl('');
    setImageError(false);
    setShowEditor(true);
  }

  function openEditPost(post: Post) {
    setEditingPost(post);
    setFormTitle(post.title);
    setFormContent(post.content || '');
    setFormCategoryId(post.category_id || '');
    setFormImageUrl(post.feature_image_url || '');
    setImageError(false);
    setShowEditor(true);
  }

  function closeEditor() {
    setShowEditor(false);
    setEditingPost(null);
    setUploading(false);
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setImageError(false);

    const safeName = `${Date.now()}-${file.name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9.-]+/g, '-')}`;

    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(safeName, file);

    if (data) {
      const { data: { publicUrl } } = supabase.storage.from(BUCKET_NAME).getPublicUrl(safeName);
      setFormImageUrl(publicUrl);
      setNotification({ type: 'success', message: 'Imagem carregada com sucesso!' });
    } else {
      setNotification({
        type: 'error',
        message: error?.message || 'Erro no upload da imagem.',
      });
    }

    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  async function handleSavePost(e: React.FormEvent) {
    e.preventDefault();
    if (!formTitle.trim()) return;

    setSaving(true);
    const slug = generateSlug(formTitle);
    const postData = {
      title: formTitle.trim(),
      slug,
      content: formContent,
      category_id: formCategoryId || null,
      feature_image_url: formImageUrl || null,
    };

    if (editingPost) {
      // Update
      const { error } = await supabase.from('posts').update(postData).eq('id', editingPost.id);
      if (!error) {
        setPosts((prev) =>
          prev.map((p) => (p.id === editingPost.id ? { ...p, ...postData } : p))
        );
        setNotification({ type: 'success', message: 'Postagem atualizada com sucesso!' });
        closeEditor();
      } else {
        setNotification({ type: 'error', message: 'Erro ao atualizar: ' + error.message });
      }
    } else {
      // Create
      const { data, error } = await supabase.from('posts').insert([postData]).select();
      if (data && data.length > 0) {
        setPosts((prev) => [data[0], ...prev]);
        setNotification({ type: 'success', message: `Postagem "${formTitle.trim()}" criada!` });
        closeEditor();
      } else {
        setNotification({
          type: 'error',
          message: error?.message || 'Erro ao criar postagem.',
        });
      }
    }
    setSaving(false);
  }

  async function handleDeletePost(id: string, title: string) {
    if (!confirm(`Remover postagem "${title}"?`)) return;

    setDeletingId(id);
    const { error } = await supabase.from('posts').delete().eq('id', id);
    if (!error) {
      setPosts((prev) => prev.filter((p) => p.id !== id));
      setNotification({ type: 'success', message: `Postagem removida.` });
    } else {
      setNotification({ type: 'error', message: 'Erro: ' + error.message });
    }
    setDeletingId(null);
  }

  function getCategoryName(catId: string | null): string {
    if (!catId) return 'Sem categoria';
    const cat = categories.find((c) => c.id === catId);
    return cat ? cat.name : 'Desconhecida';
  }

  function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }

  const filteredPosts = posts.filter(
    (post) =>
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getCategoryName(post.category_id).toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* ── Notification Toast ──────────────── */}
      {notification && typeof document !== 'undefined' && createPortal(
        <div
          className="admin-animate-in"
          style={{
            position: 'fixed',
            top: 90,
            right: 40,
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '14px 20px',
            borderRadius: 'var(--admin-radius-md)',
            background:
              notification.type === 'success' ? 'var(--admin-success-bg)' : 'var(--admin-danger-bg)',
            color:
              notification.type === 'success' ? 'var(--admin-success)' : 'var(--admin-danger)',
            border: `1px solid ${
              notification.type === 'success' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'
            }`,
            fontSize: '0.85rem',
            fontWeight: 600,
            boxShadow: 'var(--admin-shadow-lg)',
          }}
        >
          {notification.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          {notification.message}
        </div>,
        document.body
      )}

      {/* ── Action Bar ──────────────────────── */}
      <div
        className="admin-animate-in"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '0 14px',
            height: 42,
            borderRadius: 'var(--admin-radius-md)',
            background: 'var(--admin-surface)',
            border: '1px solid var(--admin-border)',
            flex: 1,
            maxWidth: 380,
          }}
        >
          <Search size={16} style={{ color: 'var(--admin-text-tertiary)', flexShrink: 0 }} />
          <input
            type="text"
            placeholder="Buscar postagens..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              border: 'none',
              background: 'none',
              outline: 'none',
              fontFamily: 'inherit',
              fontSize: '0.85rem',
              color: 'var(--admin-text-primary)',
              width: '100%',
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <span
            style={{
              display: 'flex',
              alignItems: 'center',
              fontSize: '0.78rem',
              color: 'var(--admin-text-tertiary)',
              fontWeight: 500,
            }}
          >
            {posts.length} postagen{posts.length !== 1 ? 's' : ''}
          </span>
          <button className="admin-btn admin-btn-primary" onClick={openNewPost}>
            <Plus size={16} />
            Nova Postagem
          </button>
        </div>
      </div>

      {/* ── Posts Table ──────────────────────── */}
      <div className="glass-card admin-animate-in-delay-1">
        <div className="glass-card-body" style={{ padding: '0 28px 28px' }}>
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18, padding: '28px 0' }}>
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="admin-skeleton"
                  style={{ height: 24, width: `${90 - i * 8}%` }}
                />
              ))}
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="admin-empty-state">
              <div className="admin-empty-state-icon">
                <FolderOpen size={24} />
              </div>
              <div className="admin-empty-state-text">
                {posts.length === 0
                  ? 'Nenhuma postagem criada'
                  : 'Nenhuma postagem encontrada'}
              </div>
              <div className="admin-empty-state-hint">
                {posts.length === 0
                  ? 'Comece criando sua primeira postagem.'
                  : 'Tente outra busca.'}
              </div>
            </div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Título</th>
                  <th>Categoria</th>
                  <th>Data</th>
                  <th style={{ textAlign: 'right' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredPosts.map((post) => (
                  <tr key={post.id}>
                    <td className="cell-primary">
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div
                          style={{
                            width: 40,
                            height: 40,
                            borderRadius: 'var(--admin-radius-sm)',
                            background: post.feature_image_url
                              ? `url(${post.feature_image_url}) center/cover`
                              : 'var(--admin-primary-subtle)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'var(--admin-primary)',
                            flexShrink: 0,
                          }}
                        >
                          {!post.feature_image_url && <FileText size={16} />}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{post.title}</div>
                          <div
                            style={{
                              fontSize: '0.72rem',
                              color: 'var(--admin-text-tertiary)',
                              fontFamily: 'monospace',
                            }}
                          >
                            /{post.slug}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="admin-tag">{getCategoryName(post.category_id)}</span>
                    </td>
                    <td>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                          fontSize: '0.8rem',
                          color: 'var(--admin-text-secondary)',
                        }}
                      >
                        <Calendar size={14} />
                        {formatDate(post.created_at)}
                      </div>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 4 }}>
                        <button
                          className="admin-btn admin-btn-icon"
                          title="Editar"
                          onClick={() => openEditPost(post)}
                        >
                          <Edit3 size={16} />
                        </button>
                        <button
                          className="admin-btn admin-btn-icon"
                          title="Remover"
                          style={{
                            color: deletingId === post.id ? 'var(--admin-text-tertiary)' : 'var(--admin-danger)',
                          }}
                          onClick={() => handleDeletePost(post.id, post.title)}
                          disabled={deletingId === post.id}
                        >
                          {deletingId === post.id ? (
                            <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                          ) : (
                            <Trash2 size={16} />
                          )}
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

      {/* ── Editor Modal / Slide Panel ────── */}
      {showEditor && typeof document !== 'undefined' && createPortal(
        <>
          {/* Backdrop */}
          <div
            onClick={closeEditor}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(13, 12, 27, 0.5)',
              backdropFilter: 'blur(6px)',
              zIndex: 9900,
              animation: 'adminFadeIn 0.2s ease forwards',
            }}
          />

          {/* Panel */}
          <div
            className="admin-animate-in"
            style={{
              position: 'fixed',
              top: 0,
              right: 0,
              width: '100%',
              maxWidth: 640,
              height: '100vh',
              background: 'var(--admin-surface)',
              borderLeft: '1px solid var(--admin-border)',
              boxShadow: '-12px 0 40px rgba(13, 12, 27, 0.12)',
              zIndex: 9910,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            {/* Panel Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '20px 28px',
                borderBottom: '1px solid var(--admin-border)',
              }}
            >
              <h3
                style={{
                  fontSize: '1.1rem',
                  fontWeight: 700,
                  fontFamily: 'Outfit, sans-serif',
                  margin: 0,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                }}
              >
                <Edit3 size={18} style={{ color: 'var(--admin-primary)' }} />
                {editingPost ? 'Editar Postagem' : 'Nova Postagem'}
              </h3>
              <button
                className="admin-btn admin-btn-icon"
                onClick={closeEditor}
                style={{ border: '1px solid var(--admin-border)' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Panel Body */}
            <form
              onSubmit={handleSavePost}
              style={{
                flex: 1,
                overflow: 'auto',
                padding: '28px',
                display: 'flex',
                flexDirection: 'column',
                gap: 22,
              }}
            >
              <div>
                <label className="admin-form-label" htmlFor="postTitle">
                  Título
                </label>
                <input
                  id="postTitle"
                  type="text"
                  className="admin-input"
                  placeholder="Título da postagem"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value.slice(0, 120))}
                  required
                  autoFocus
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                  <span />
                  <span style={{ fontSize: '0.7rem', color: formTitle.length >= 110 ? 'var(--admin-danger)' : 'var(--admin-text-tertiary)' }}>
                    {formTitle.length}/120
                  </span>
                </div>
                {formTitle.trim() && (
                  <div
                    style={{
                      fontSize: '0.72rem',
                      color: 'var(--admin-text-tertiary)',
                      marginTop: 6,
                    }}
                  >
                    Slug:{' '}
                    <span
                      style={{
                        fontFamily: 'monospace',
                        background: 'var(--admin-primary-subtle)',
                        padding: '2px 6px',
                        borderRadius: 4,
                        color: 'var(--admin-primary)',
                        fontWeight: 600,
                      }}
                    >
                      {generateSlug(formTitle)}
                    </span>
                  </div>
                )}
              </div>

              <div>
                <label className="admin-form-label" htmlFor="postCategory">
                  Categoria
                </label>
                <select
                  id="postCategory"
                  className="admin-input"
                  value={formCategoryId}
                  onChange={(e) => setFormCategoryId(e.target.value)}
                  style={{ cursor: 'pointer' }}
                >
                  <option value="">Selecionar categoria...</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="admin-form-label" htmlFor="postImage">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <ImageIcon size={14} />
                      Imagem de Capa
                    </div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--admin-text-tertiary)', fontWeight: 400 }}>
                      Upload ou URL externa
                    </span>
                  </div>
                </label>
                
                <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
                  <button
                    type="button"
                    className="admin-btn admin-btn-secondary"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    style={{ flex: 1, height: 42, fontSize: '0.8rem' }}
                  >
                    {uploading ? (
                      <Loader2 size={16} className="admin-spin" />
                    ) : (
                      <Upload size={16} />
                    )}
                    Selecionar Arquivo
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept="image/*"
                    style={{ display: 'none' }}
                  />
                </div>

                <div style={{ position: 'relative' }}>
                  <input
                    id="postImage"
                    type="url"
                    className="admin-input"
                    placeholder="Ou cole uma URL externa aqui..."
                    value={formImageUrl}
                    onChange={(e) => {
                      setFormImageUrl(e.target.value);
                      setImageError(false);
                    }}
                    style={{ paddingRight: 40 }}
                  />
                  {formImageUrl && (
                    <button
                      type="button"
                      onClick={() => {
                        setFormImageUrl('');
                        setImageError(false);
                      }}
                      style={{
                        position: 'absolute',
                        right: 12,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        color: 'var(--admin-text-tertiary)',
                        cursor: 'pointer',
                        padding: 4
                      }}
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
                
                {/* Image Preview & Validation */}
                {formImageUrl && (
                  <div style={{ marginTop: 12 }}>
                    <div style={{
                      borderRadius: 'var(--admin-radius-md)',
                      overflow: 'hidden',
                      border: `1px solid ${imageError ? 'var(--admin-danger)' : 'var(--admin-border)'}`,
                      background: 'var(--admin-bg)',
                      position: 'relative',
                      minHeight: imageError ? 'auto' : 120,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.2s ease'
                    }}>
                      {!imageError ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={formImageUrl}
                          alt="Preview"
                          onError={() => setImageError(true)}
                          onLoad={() => setImageError(false)}
                          style={{
                            maxWidth: '100%',
                            maxHeight: 240,
                            display: 'block',
                            objectFit: 'contain'
                          }}
                        />
                      ) : (
                        <div style={{
                          padding: '20px',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: 8,
                          color: 'var(--admin-danger)',
                          fontSize: '0.8rem'
                        }}>
                          <AlertCircle size={24} />
                          <span style={{ fontWeight: 600 }}>URL de imagem inválida ou inacessível</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div style={{ flex: 1 }}>
                <label className="admin-form-label" htmlFor="postContent">
                  Conteúdo
                </label>
                <textarea
                  id="postContent"
                  className="admin-input"
                  placeholder="Escreva o conteúdo da postagem (Markdown ou HTML)..."
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value.slice(0, 10000))}
                  style={{
                    minHeight: 220,
                    resize: 'vertical',
                    lineHeight: 1.7,
                    fontFamily: "'Inter', sans-serif",
                  }}
                />
                <div style={{ textAlign: 'right', marginTop: 4 }}>
                  <span style={{ fontSize: '0.7rem', color: formContent.length >= 9500 ? 'var(--admin-danger)' : 'var(--admin-text-tertiary)' }}>
                    {formContent.length}/10.000
                  </span>
                </div>
              </div>

              {/* Panel Footer */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, paddingTop: 8 }}>
                <button type="button" className="admin-btn admin-btn-secondary" onClick={closeEditor}>
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="admin-btn admin-btn-primary"
                  disabled={saving || !formTitle.trim()}
                  style={{
                    opacity: saving || !formTitle.trim() ? 0.6 : 1,
                    cursor: saving || !formTitle.trim() ? 'not-allowed' : 'pointer',
                  }}
                >
                  {saving ? (
                    <>
                      <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      {editingPost ? 'Salvar Alterações' : 'Publicar Postagem'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </>,
        document.body
      )}

      {/* Spin animation */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
