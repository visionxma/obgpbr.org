'use client';

import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';
import {
  Sparkles, Trash2, Edit3, Loader2, FolderOpen,
  Calendar, MapPin, Image as ImageIcon, Tag, FileText, Rocket,
} from 'lucide-react';
import {
  AdminToast, AdminToolbar, AdminEmpty, AdminSkeletonGrid,
  SlidePanel, Section, Field, TextInput, TextArea,
  PublishToggle, ImageUploadField, ListRow, useNotice,
} from '../_shared/AdminUI';

interface Experience {
  id: string;
  title: string | null;
  description: string | null;
  image_url: string | null;
  location: string | null;
  date: string | null;
  is_published: boolean;
  created_at: string;
}

const EMPTY_FORM = {
  title: '',
  description: '',
  image_url: '',
  location: '',
  date: '',
  is_published: true,
};

export default function ExperienciasAdmin() {
  const [items, setItems] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showEditor, setShowEditor] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editing, setEditing] = useState<Experience | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const { notice, setNotice } = useNotice();

  useEffect(() => { fetchItems(); }, []);

  async function fetchItems() {
    setLoading(true);
    const { data, error } = await supabase
      .from('experiences')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) setNotice({ type: 'error', message: 'Erro ao carregar: ' + error.message });
    else setItems((data as Experience[]) || []);
    setLoading(false);
  }

  function setField<K extends keyof typeof EMPTY_FORM>(key: K, val: typeof EMPTY_FORM[K]) {
    setForm(f => ({ ...f, [key]: val }));
  }

  function openCreate() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setShowEditor(true);
  }

  function openEdit(it: Experience) {
    setEditing(it);
    setForm({
      title: it.title || '',
      description: it.description || '',
      image_url: it.image_url || '',
      location: it.location || '',
      date: it.date || '',
      is_published: it.is_published,
    });
    setShowEditor(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const payload = {
      title: form.title.trim() || 'Sem título',
      description: form.description.trim() || null,
      image_url: form.image_url.trim() || null,
      location: form.location.trim() || null,
      date: form.date.trim() || null,
      is_published: form.is_published,
    };
    const { error } = editing
      ? await supabase.from('experiences').update(payload).eq('id', editing.id)
      : await supabase.from('experiences').insert(payload);
    setSaving(false);
    if (error) {
      setNotice({ type: 'error', message: 'Erro ao salvar: ' + error.message });
      return;
    }
    setNotice({ type: 'success', message: editing ? 'Experiência atualizada!' : 'Experiência criada!' });
    setShowEditor(false);
    fetchItems();
  }

  async function handleDelete(id: string) {
    if (!confirm('Excluir esta experiência?')) return;
    setDeletingId(id);
    const { error } = await supabase.from('experiences').delete().eq('id', id);
    setDeletingId(null);
    if (error) {
      setNotice({ type: 'error', message: 'Erro ao excluir: ' + error.message });
      return;
    }
    setNotice({ type: 'success', message: 'Experiência removida.' });
    fetchItems();
  }

  const filtered = items.filter((i) => {
    const q = search.toLowerCase();
    return (
      (i.title || '').toLowerCase().includes(q) ||
      (i.description || '').toLowerCase().includes(q) ||
      (i.location || '').toLowerCase().includes(q)
    );
  });

  return (
    <div>
      <AdminToast notice={notice} />

      <AdminToolbar
        search={search}
        onSearch={setSearch}
        placeholder="Buscar por título, descrição ou local…"
        count={items.length}
        countLabel={(n) => `${n} ${n === 1 ? 'experiência' : 'experiências'}`}
        onNew={openCreate}
        newLabel="Nova Experiência"
      />

      {loading ? (
        <AdminSkeletonGrid count={4} height={120} />
      ) : filtered.length === 0 ? (
        <AdminEmpty
          icon={items.length === 0 ? Rocket : FolderOpen}
          title={items.length === 0 ? 'Nenhuma experiência adicionada' : 'Nenhum resultado'}
          hint={items.length === 0
            ? 'Adicione a primeira experiência para começar a popular o portfólio público.'
            : 'Tente buscar com outros termos.'}
        />
      ) : (
        <div className="admin-animate-in-delay-1" style={{ display: 'grid', gap: 14, paddingBottom: 60 }}>
          {filtered.map((it) => (
            <ListRow
              key={it.id}
              thumb={
                it.image_url
                  ? // eslint-disable-next-line @next/next/no-img-element
                    <img src={it.image_url} alt={it.title || ''} style={{ width: 84, height: 84, objectFit: 'cover', borderRadius: 'var(--admin-radius-md)', flexShrink: 0 }} />
                  : <div style={{ width: 84, height: 84, borderRadius: 'var(--admin-radius-md)', background: 'var(--admin-gold-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: 'var(--admin-gold-dark)' }}>
                      <Sparkles size={26} />
                    </div>
              }
              title={it.title || 'Sem título'}
              status={{ label: it.is_published ? 'Publicado' : 'Rascunho', tone: it.is_published ? 'success' : 'muted' }}
              summary={it.description || undefined}
              meta={<>
                {it.location && <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><MapPin size={12} /> {it.location}</span>}
                {it.date && <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Calendar size={12} /> {it.date}</span>}
              </>}
              actions={<>
                <button className="admin-btn admin-btn-icon" onClick={() => openEdit(it)} title="Editar">
                  <Edit3 size={16} />
                </button>
                <button
                  className="admin-btn admin-btn-icon"
                  onClick={() => handleDelete(it.id)}
                  disabled={deletingId === it.id}
                  style={{ color: deletingId === it.id ? 'var(--admin-text-tertiary)' : 'var(--admin-danger)' }}
                  title="Excluir"
                >
                  {deletingId === it.id
                    ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                    : <Trash2 size={16} />}
                </button>
              </>}
            />
          ))}
        </div>
      )}

      <SlidePanel
        open={showEditor}
        onClose={() => setShowEditor(false)}
        icon={Sparkles}
        title={editing ? 'Editar Experiência' : 'Nova Experiência'}
        subtitle="Todos os campos são opcionais"
        onSubmit={handleSave}
        saving={saving}
        saveLabel={editing ? 'Salvar Alterações' : 'Adicionar Experiência'}
      >
        {/* Identidade */}
        <Section title="Apresentação" hint="Como o projeto será exibido no portfólio">
          <Field label="Título do Projeto" full icon={Tag}>
            <TextInput
              autoFocus
              value={form.title}
              onChange={(e) => setField('title', e.target.value)}
              placeholder="Ex.: Centro de Convivência da Família — Paço do Lumiar/MA"
            />
          </Field>
          <Field label="Descrição" full icon={FileText}
            hint="Conte o objetivo, o público beneficiado e os resultados.">
            <TextArea
              rows={6}
              value={form.description}
              onChange={(e) => setField('description', e.target.value)}
              placeholder="Descreva o projeto: contexto, objetivos, ações realizadas e impacto…"
            />
          </Field>
        </Section>

        {/* Imagem */}
        <Section title="Imagem do Projeto" hint="JPG, PNG, WebP ou GIF até 5 MB" columns={1}>
          <Field label="Foto principal" icon={ImageIcon}>
            <ImageUploadField
              value={form.image_url}
              folder="experiences"
              onChange={(url) => setField('image_url', url)}
              onError={(m) => setNotice({ type: 'error', message: m })}
              onSuccess={(m) => setNotice({ type: 'success', message: m })}
            />
          </Field>
        </Section>

        {/* Detalhes */}
        <Section title="Detalhes">
          <Field label="Localização" icon={MapPin}>
            <TextInput
              value={form.location}
              onChange={(e) => setField('location', e.target.value)}
              placeholder="Ex.: São Luís/MA"
            />
          </Field>
          <Field label="Data ou Período" icon={Calendar}>
            <TextInput
              value={form.date}
              onChange={(e) => setField('date', e.target.value)}
              placeholder="Ex.: Março de 2025"
            />
          </Field>
        </Section>

        {/* Status */}
        <Section title="Status" columns={1}>
          <PublishToggle
            value={form.is_published}
            onChange={(v) => setField('is_published', v)}
            label="Publicar no portfólio"
            hint={form.is_published
              ? 'Visível para o público na página de Experiências.'
              : 'Salvo como rascunho — não aparece publicamente.'}
          />
        </Section>
      </SlidePanel>
    </div>
  );
}
