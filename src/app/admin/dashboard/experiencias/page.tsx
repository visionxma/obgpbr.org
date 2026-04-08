'use client';
import { supabase } from '@/lib/supabase';
import { useEffect, useState, useRef } from 'react';
import {
  Sparkles, Plus, Trash2, Edit3, Loader2, FolderOpen,
  AlertCircle, CheckCircle2, Search, X, Save, Upload, Calendar, MapPin,
} from 'lucide-react';

interface Experience {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  location: string | null;
  date: string | null;
  is_published: boolean;
  created_at: string;
}

const BUCKET_NAME = 'images';

export default function ExperienciasAdmin() {
  const [items, setItems] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showEditor, setShowEditor] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const [editing, setEditing] = useState<Experience | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formImageUrl, setFormImageUrl] = useState('');
  const [formLocation, setFormLocation] = useState('');
  const [formDate, setFormDate] = useState('');
  const [formPublished, setFormPublished] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3500);
  };

  const fetchItems = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('experiences')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) showNotification('error', 'Erro ao carregar: ' + error.message);
    else setItems((data as Experience[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchItems(); }, []);

  const resetForm = () => {
    setEditing(null);
    setFormTitle('');
    setFormDescription('');
    setFormImageUrl('');
    setFormLocation('');
    setFormDate('');
    setFormPublished(true);
  };

  const openCreate = () => { resetForm(); setShowEditor(true); };
  const openEdit = (it: Experience) => {
    setEditing(it);
    setFormTitle(it.title || '');
    setFormDescription(it.description || '');
    setFormImageUrl(it.image_url || '');
    setFormLocation(it.location || '');
    setFormDate(it.date || '');
    setFormPublished(it.is_published);
    setShowEditor(true);
  };

  const handleUpload = async (file: File) => {
    setUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const path = `experiences/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await supabase.storage.from(BUCKET_NAME).upload(path, file);
      if (error) throw error;
      const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(path);
      setFormImageUrl(data.publicUrl);
      showNotification('success', 'Imagem enviada!');
    } catch (e: any) {
      showNotification('error', 'Falha no upload: ' + e.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!formTitle.trim()) {
      showNotification('error', 'O título é obrigatório.');
      return;
    }
    setSaving(true);
    const payload = {
      title: formTitle.trim(),
      description: formDescription.trim() || null,
      image_url: formImageUrl.trim() || null,
      location: formLocation.trim() || null,
      date: formDate.trim() || null,
      is_published: formPublished,
    };
    const { error } = editing
      ? await supabase.from('experiences').update(payload).eq('id', editing.id)
      : await supabase.from('experiences').insert(payload);
    setSaving(false);
    if (error) {
      showNotification('error', 'Erro ao salvar: ' + error.message);
      return;
    }
    showNotification('success', editing ? 'Atualizado com sucesso!' : 'Criado com sucesso!');
    setShowEditor(false);
    resetForm();
    fetchItems();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Excluir esta experiência?')) return;
    setDeletingId(id);
    const { error } = await supabase.from('experiences').delete().eq('id', id);
    setDeletingId(null);
    if (error) {
      showNotification('error', 'Erro ao excluir: ' + error.message);
      return;
    }
    showNotification('success', 'Excluído.');
    fetchItems();
  };

  const filtered = items.filter((i) =>
    i.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (i.description || '').toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div>
      {notification && (
        <div style={{
          padding: '14px 20px', borderRadius: 'var(--admin-radius-md)',
          background: notification.type === 'success' ? 'rgba(38,102,47,0.1)' : 'rgba(220,38,38,0.1)',
          border: `1px solid ${notification.type === 'success' ? 'var(--admin-success)' : 'var(--admin-danger)'}`,
          color: notification.type === 'success' ? 'var(--admin-success)' : 'var(--admin-danger)',
          marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.9rem',
        }}>
          {notification.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          {notification.message}
        </div>
      )}

      {/* Toolbar */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0 14px', height: 42, borderRadius: 'var(--admin-radius-md)', background: 'var(--admin-surface)', border: '1px solid var(--admin-border)', flex: 1, maxWidth: 360 }}>
          <Search size={16} color="var(--admin-text-tertiary)" />
          <input
            placeholder="Buscar experiências..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ border: 'none', outline: 'none', background: 'transparent', flex: 1, fontSize: '0.85rem', color: 'var(--admin-text-primary)' }}
          />
        </div>
        <button
          onClick={openCreate}
          style={{
            display: 'flex', alignItems: 'center', gap: 8, padding: '0 18px', height: 42,
            borderRadius: 'var(--admin-radius-md)', background: 'var(--admin-primary)', color: 'white',
            border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem',
          }}
        >
          <Plus size={16} /> Nova Experiência
        </button>
      </div>

      {/* List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 60 }}>
          <Loader2 size={28} className="spin" style={{ animation: 'spin 1s linear infinite' }} />
          <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--admin-text-tertiary)' }}>
          <FolderOpen size={36} style={{ opacity: 0.5, marginBottom: 12 }} />
          <p>Nenhuma experiência cadastrada ainda.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 16 }}>
          {filtered.map((it) => (
            <div key={it.id} style={{
              display: 'flex', gap: 18, padding: 18, alignItems: 'center',
              background: 'var(--admin-surface)', border: '1px solid var(--admin-border)',
              borderRadius: 'var(--admin-radius-md)',
            }}>
              {it.image_url ? (
                <img src={it.image_url} alt={it.title} style={{ width: 76, height: 76, objectFit: 'cover', borderRadius: 'var(--admin-radius-sm)', flexShrink: 0 }} />
              ) : (
                <div style={{ width: 76, height: 76, borderRadius: 'var(--admin-radius-sm)', background: 'var(--admin-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Sparkles size={22} color="var(--admin-text-tertiary)" />
                </div>
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--admin-text-primary)' }}>{it.title}</h3>
                  <span style={{
                    padding: '3px 10px', borderRadius: 999, fontSize: '0.68rem', fontWeight: 700,
                    background: it.is_published ? 'rgba(38,102,47,0.12)' : 'rgba(163,163,153,0.18)',
                    color: it.is_published ? 'var(--admin-success)' : 'var(--admin-text-tertiary)',
                  }}>{it.is_published ? 'Publicado' : 'Rascunho'}</span>
                </div>
                {it.description && (
                  <p style={{ fontSize: '0.82rem', color: 'var(--admin-text-secondary)', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{it.description}</p>
                )}
                <div style={{ display: 'flex', gap: 14, marginTop: 6, fontSize: '0.72rem', color: 'var(--admin-text-tertiary)' }}>
                  {it.location && <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><MapPin size={12} />{it.location}</span>}
                  {it.date && <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Calendar size={12} />{it.date}</span>}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => openEdit(it)} style={iconBtn}><Edit3 size={15} /></button>
                <button onClick={() => handleDelete(it.id)} disabled={deletingId === it.id} style={{ ...iconBtn, color: 'var(--admin-danger)' }}>
                  {deletingId === it.id ? <Loader2 size={15} className="spin" style={{ animation: 'spin 1s linear infinite' }} /> : <Trash2 size={15} />}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Editor modal */}
      {showEditor && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20,
        }} onClick={() => setShowEditor(false)}>
          <div onClick={(e) => e.stopPropagation()} style={{
            background: 'var(--admin-surface)', borderRadius: 'var(--admin-radius-lg)',
            padding: 28, width: '100%', maxWidth: 620, maxHeight: '90vh', overflowY: 'auto',
            border: '1px solid var(--admin-border)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--admin-text-primary)' }}>
                {editing ? 'Editar' : 'Nova'} Experiência
              </h2>
              <button onClick={() => setShowEditor(false)} style={{ ...iconBtn, padding: 6 }}><X size={18} /></button>
            </div>

            <div style={{ display: 'grid', gap: 16 }}>
              <Field label="Título *">
                <input value={formTitle} onChange={(e) => setFormTitle(e.target.value)} style={inputStyle} />
              </Field>
              <Field label="Descrição">
                <textarea value={formDescription} onChange={(e) => setFormDescription(e.target.value)} rows={4} style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }} />
              </Field>
              <div style={{ display: 'grid', gap: 16, gridTemplateColumns: '1fr 1fr' }}>
                <Field label="Local"><input value={formLocation} onChange={(e) => setFormLocation(e.target.value)} style={inputStyle} placeholder="Ex.: Paço do Lumiar/MA" /></Field>
                <Field label="Data"><input value={formDate} onChange={(e) => setFormDate(e.target.value)} style={inputStyle} placeholder="Ex.: Março de 2025" /></Field>
              </div>

              <Field label="Imagem">
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <input value={formImageUrl} onChange={(e) => setFormImageUrl(e.target.value)} placeholder="URL ou faça upload" style={{ ...inputStyle, flex: 1 }} />
                  <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading} style={{
                    height: 42, padding: '0 16px', borderRadius: 'var(--admin-radius-md)',
                    background: 'var(--admin-bg)', border: '1px solid var(--admin-border)',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.82rem',
                    color: 'var(--admin-text-primary)',
                  }}>
                    {uploading ? <Loader2 size={14} className="spin" style={{ animation: 'spin 1s linear infinite' }} /> : <Upload size={14} />}
                    Upload
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUpload(f); }}
                  />
                </div>
                {formImageUrl && (
                  <div style={{ marginTop: 10, borderRadius: 'var(--admin-radius-md)', overflow: 'hidden', border: '1px solid var(--admin-border)' }}>
                    <img src={formImageUrl} alt="preview" style={{ width: '100%', maxHeight: 200, objectFit: 'cover', display: 'block' }} />
                  </div>
                )}
              </Field>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderRadius: 'var(--admin-radius-md)', background: 'var(--admin-bg)', border: '1px solid var(--admin-border)' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--admin-text-primary)', fontWeight: 600 }}>Publicado</span>
                <button
                  onClick={() => setFormPublished(!formPublished)}
                  style={{ width: 44, height: 24, borderRadius: 999, border: 'none', cursor: 'pointer', position: 'relative', transition: 'background 0.2s', background: formPublished ? 'var(--admin-success)' : 'var(--admin-border)' }}
                >
                  <span style={{ position: 'absolute', top: 2, left: formPublished ? 22 : 2, width: 20, height: 20, borderRadius: '50%', background: 'white', transition: 'left 0.2s' }} />
                </button>
              </div>

              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
                <button onClick={() => setShowEditor(false)} style={{ ...inputStyle, padding: '0 18px', height: 42, width: 'auto', cursor: 'pointer', background: 'var(--admin-bg)' }}>Cancelar</button>
                <button onClick={handleSave} disabled={saving} style={{
                  padding: '0 22px', height: 42, borderRadius: 'var(--admin-radius-md)',
                  background: 'var(--admin-primary)', color: 'white', border: 'none',
                  cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8,
                }}>
                  {saving ? <Loader2 size={14} className="spin" style={{ animation: 'spin 1s linear infinite' }} /> : <Save size={14} />}
                  Salvar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%', height: 42, padding: '0 14px',
  borderRadius: 'var(--admin-radius-md)',
  border: '1px solid var(--admin-border)',
  background: 'var(--admin-bg)',
  color: 'var(--admin-text-primary)',
  fontSize: '0.88rem', outline: 'none',
};

const iconBtn: React.CSSProperties = {
  width: 34, height: 34, borderRadius: 'var(--admin-radius-sm)',
  background: 'var(--admin-bg)', border: '1px solid var(--admin-border)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  cursor: 'pointer', color: 'var(--admin-text-secondary)',
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--admin-text-secondary)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</label>
      {children}
    </div>
  );
}
