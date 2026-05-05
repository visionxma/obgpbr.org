'use client';

import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';
import {
  BookOpen, Plus, Trash2, Edit3, Loader2, FolderOpen,
  Tag, Clock, User, Calendar, Image as ImageIcon, FileText, Hash,
} from 'lucide-react';
import {
  AdminToast, AdminToolbar, AdminEmpty, AdminSkeletonGrid,
  SlidePanel, Section, Field, TextInput, TextArea, SelectInput,
  PublishToggle, ImageUploadField, ListRow, useNotice,
} from '../_shared/AdminUI';
import ImportButton from '../_shared/ImportButton';

interface BlogPost {
  id: string;
  title: string | null;
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

const CATEGORIES = [
  'Gestão de Parcerias',
  'MROSC',
  'Assistência Social',
  'Educação',
  'Saúde',
  'Transparência',
  'Captação de Recursos',
  'Prestação de Contas',
  'Selo OSC',
  'Notícias',
];

const EMPTY_FORM = {
  title: '',
  summary: '',
  content: '',
  image_url: '',
  category: '',
  author: '',
  read_time: '',
  published_at: '',
  is_published: false,
};

export default function BlogAdmin() {
  const [items, setItems] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showEditor, setShowEditor] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editing, setEditing] = useState<BlogPost | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const { notice, setNotice } = useNotice();

  useEffect(() => { fetchItems(); }, []);

  async function fetchItems() {
    setLoading(true);
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) setNotice({ type: 'error', message: 'Erro ao carregar: ' + error.message });
    else setItems((data as BlogPost[]) || []);
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

  function openEdit(it: BlogPost) {
    setEditing(it);
    setForm({
      title: it.title || '',
      summary: it.summary || '',
      content: it.content || '',
      image_url: it.image_url || '',
      category: it.category || '',
      author: it.author || '',
      read_time: it.read_time ? String(it.read_time) : '',
      published_at: it.published_at ? it.published_at.slice(0, 10) : '',
      is_published: it.is_published,
    });
    setShowEditor(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const payload = {
      title: form.title.trim() || 'Sem título',
      summary: form.summary.trim() || null,
      content: form.content.trim() || null,
      image_url: form.image_url.trim() || null,
      category: form.category.trim() || null,
      author: form.author.trim() || null,
      read_time: form.read_time ? parseInt(form.read_time, 10) : null,
      published_at: form.published_at ? new Date(form.published_at).toISOString() : null,
      is_published: form.is_published,
    };
    const { error } = editing
      ? await supabase.from('blog_posts').update(payload).eq('id', editing.id)
      : await supabase.from('blog_posts').insert(payload);
    setSaving(false);
    if (error) {
      setNotice({ type: 'error', message: 'Erro ao salvar: ' + error.message });
      return;
    }
    setNotice({ type: 'success', message: editing ? 'Post atualizado!' : 'Post criado!' });
    setShowEditor(false);
    fetchItems();
  }

  async function handleDelete(id: string) {
    if (!confirm('Excluir este post do blog?')) return;
    setDeletingId(id);
    const { error } = await supabase.from('blog_posts').delete().eq('id', id);
    setDeletingId(null);
    if (error) {
      setNotice({ type: 'error', message: 'Erro ao excluir: ' + error.message });
      return;
    }
    setNotice({ type: 'success', message: 'Post excluído.' });
    fetchItems();
  }

  const filtered = items.filter((i) => {
    const q = search.toLowerCase();
    return (
      (i.title || '').toLowerCase().includes(q) ||
      (i.summary || '').toLowerCase().includes(q) ||
      (i.category || '').toLowerCase().includes(q) ||
      (i.author || '').toLowerCase().includes(q)
    );
  });

  return (
    <div>
      <AdminToast notice={notice} />

      <AdminToolbar
        search={search}
        onSearch={setSearch}
        placeholder="Buscar por título, resumo, categoria ou autor…"
        count={items.length}
        countLabel={(n) => `${n} ${n === 1 ? 'post' : 'posts'}`}
        onNew={openCreate}
        newLabel="Novo Post"
      />

      {loading ? (
        <AdminSkeletonGrid count={4} height={120} />
      ) : filtered.length === 0 ? (
        <AdminEmpty
          icon={items.length === 0 ? BookOpen : FolderOpen}
          title={items.length === 0 ? 'Nenhum post adicionado' : 'Nenhum resultado'}
          hint={items.length === 0
            ? 'Adicione o primeiro post para começar a popular a página de blog.'
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
                      <BookOpen size={26} />
                    </div>
              }
              title={it.title || 'Sem título'}
              status={{ label: it.is_published ? 'Publicado' : 'Rascunho', tone: it.is_published ? 'success' : 'muted' }}
              badges={it.category ? (
                <span style={{
                  padding: '3px 10px', borderRadius: 999,
                  fontSize: '0.68rem', fontWeight: 700,
                  background: 'var(--admin-primary-subtle)',
                  color: 'var(--admin-primary)',
                  textTransform: 'uppercase', letterSpacing: '0.04em',
                }}>{it.category}</span>
              ) : null}
              summary={it.summary || undefined}
              meta={<>
                {it.author && <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><User size={12} /> {it.author}</span>}
                {it.read_time && <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={12} /> {it.read_time} min</span>}
                {it.published_at && <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Calendar size={12} /> {new Date(it.published_at).toLocaleDateString('pt-BR')}</span>}
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
        icon={BookOpen}
        title={editing ? 'Editar Post' : 'Novo Post'}
        subtitle="Todos os campos são opcionais"
        onSubmit={handleSave}
        saving={saving}
        saveLabel={editing ? 'Salvar Alterações' : 'Adicionar Post'}
      >
        {/* Importação por arquivo */}
        <div style={{ marginBottom: 18, padding: '12px 14px', background: 'var(--admin-surface)', borderRadius: 'var(--admin-radius-md)', border: '1px solid var(--admin-border)' }}>
          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--admin-text-secondary)', marginBottom: 8 }}>
            Importar de arquivo (opcional)
          </div>
          <ImportButton
            tipo="blog"
            label="Importar PDF/DOCX"
            onParsed={(d) => {
              if (typeof d.title === 'string' && d.title) setField('title', d.title);
              if (typeof d.summary === 'string' && d.summary) setField('summary', d.summary);
              if (typeof d.content === 'string' && d.content) setField('content', d.content);
              if (typeof d.category === 'string' && d.category) setField('category', d.category);
              if (typeof d.author === 'string' && d.author) setField('author', d.author);
              if (typeof d.read_time === 'number' && d.read_time) setField('read_time', String(d.read_time));
            }}
          />
        </div>
        {/* Identidade do post */}
        <Section title="Conteúdo" hint="Sobre o que é o artigo">
          <Field label="Título" full icon={Tag}>
            <TextInput
              autoFocus
              value={form.title}
              onChange={(e) => setField('title', e.target.value)}
              placeholder="Ex.: Como o MROSC fortalece a sociedade civil"
            />
          </Field>
          <Field label="Resumo" full icon={FileText}>
            <TextArea
              rows={3}
              value={form.summary}
              onChange={(e) => setField('summary', e.target.value)}
              placeholder="Frase de chamada exibida nos cards e no topo do artigo"
            />
          </Field>
          <Field label="Texto Completo" full hint="Aceita HTML simples (h2, h3, p, blockquote, img). Renderizado na página do artigo.">
            <TextArea
              rows={10}
              value={form.content}
              onChange={(e) => setField('content', e.target.value)}
              placeholder="Escreva o artigo completo aqui…"
            />
          </Field>
        </Section>

        {/* Imagem */}
        <Section title="Imagem de Capa" hint="JPG, PNG, WebP ou GIF até 5 MB" columns={1}>
          <Field label="Capa" icon={ImageIcon}>
            <ImageUploadField
              value={form.image_url}
              folder="blog"
              onChange={(url) => setField('image_url', url)}
              onError={(m) => setNotice({ type: 'error', message: m })}
              onSuccess={(m) => setNotice({ type: 'success', message: m })}
            />
          </Field>
        </Section>

        {/* Metadata */}
        <Section title="Detalhes">
          <Field label="Categoria" icon={Tag}>
            <SelectInput value={form.category} onChange={(e) => setField('category', e.target.value)}>
              <option value="">— Selecionar —</option>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </SelectInput>
          </Field>
          <Field label="Autor" icon={User}>
            <TextInput
              value={form.author}
              onChange={(e) => setField('author', e.target.value)}
              placeholder="Nome de quem escreveu"
            />
          </Field>
          <Field label="Tempo de Leitura (min)" icon={Clock}>
            <TextInput
              type="number"
              min={1}
              value={form.read_time}
              onChange={(e) => setField('read_time', e.target.value)}
              placeholder="Ex.: 5"
            />
          </Field>
          <Field label="Data de Publicação" icon={Calendar}>
            <TextInput
              type="date"
              value={form.published_at}
              onChange={(e) => setField('published_at', e.target.value)}
            />
          </Field>
        </Section>

        {/* Status */}
        <Section title="Status" columns={1}>
          <PublishToggle
            value={form.is_published}
            onChange={(v) => setField('is_published', v)}
            label="Publicar artigo"
            hint={form.is_published
              ? 'Visível para o público no site.'
              : 'Salvo como rascunho — não aparece para o público.'}
          />
        </Section>
      </SlidePanel>
    </div>
  );
}
