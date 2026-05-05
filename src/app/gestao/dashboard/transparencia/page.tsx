'use client';

/**
 * Gestão de Transparência — OBGP
 *
 * IMPORTANTE: Execute o arquivo supabase-setup.sql no Supabase para criar
 * a tabela transparency_records e suas políticas de acesso.
 */

import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';
import {
  ShieldCheck, Trash2, Edit3, Loader2, FolderOpen, FileText,
  Calendar, Building2, DollarSign, User, Landmark, Hash, Tag,
  ClipboardList, FileCheck,
} from 'lucide-react';
import {
  AdminToast, AdminToolbar, AdminEmpty, AdminSkeletonGrid,
  SlidePanel, Section, Field, TextInput, TextArea, useNotice, ListRow,
} from '../_shared/AdminUI';
import SimpleListManager from '../_shared/SimpleListManager';
import ImportButton from '../_shared/ImportButton';

interface TransparencyRecord {
  id: string;
  proponente: string | null;
  parlamentar: string | null;
  modalidade: string | null;
  objeto: string | null;
  orgao_concedente: string | null;
  num_instrumento: string | null;
  num_emenda: string | null;
  ano_emenda: string | null;
  valor: string | null;
  valor_emenda: string | null;
  prestacao_contas: string | null;
  pdf_url: string | null;
  created_at: string;
}

const EMPTY_FORM = {
  proponente: '',
  parlamentar: '',
  modalidade: '',
  objeto: '',
  orgao_concedente: '',
  num_instrumento: '',
  num_emenda: '',
  ano_emenda: '',
  valor: '',
  valor_emenda: '',
  prestacao_contas: '',
  pdf_url: '',
};

type Tab = 'registros' | 'legislacao';

export default function TransparenciaAdmin() {
  const [tab, setTab] = useState<Tab>('registros');
  const [records, setRecords] = useState<TransparencyRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [dbError, setDbError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [showEditor, setShowEditor] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editing, setEditing] = useState<TransparencyRecord | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const { notice, setNotice } = useNotice();

  useEffect(() => { fetchRecords(); }, []);

  async function fetchRecords() {
    setLoading(true);
    setDbError(null);
    const { data, error } = await supabase
      .from('transparency_records')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) setDbError(error.message);
    else if (data) setRecords(data);
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

  function openEdit(r: TransparencyRecord) {
    setEditing(r);
    setForm({
      proponente: r.proponente || '',
      parlamentar: r.parlamentar || '',
      modalidade: r.modalidade || '',
      objeto: r.objeto || '',
      orgao_concedente: r.orgao_concedente || '',
      num_instrumento: r.num_instrumento || '',
      num_emenda: r.num_emenda || '',
      ano_emenda: r.ano_emenda || '',
      valor: r.valor || '',
      valor_emenda: r.valor_emenda || '',
      prestacao_contas: r.prestacao_contas || '',
      pdf_url: r.pdf_url || '',
    });
    setShowEditor(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const payload = {
      proponente: form.proponente.trim() || null,
      parlamentar: form.parlamentar.trim() || null,
      modalidade: form.modalidade.trim() || null,
      objeto: form.objeto.trim() || null,
      orgao_concedente: form.orgao_concedente.trim() || null,
      num_instrumento: form.num_instrumento.trim() || null,
      num_emenda: form.num_emenda.trim() || null,
      ano_emenda: form.ano_emenda.trim() || null,
      valor: form.valor.trim() || null,
      valor_emenda: form.valor_emenda.trim() || null,
      prestacao_contas: form.prestacao_contas.trim() || null,
      pdf_url: form.pdf_url.trim() || null,
    };

    if (editing) {
      const { error } = await supabase.from('transparency_records').update(payload).eq('id', editing.id);
      if (!error) {
        setRecords(prev => prev.map(r => r.id === editing.id ? { ...r, ...payload } : r));
        setNotice({ type: 'success', message: 'Registro atualizado!' });
        setShowEditor(false);
      } else {
        setNotice({ type: 'error', message: friendlyError(error.message) });
      }
    } else {
      const { data, error } = await supabase.from('transparency_records').insert([payload]).select();
      if (data?.[0]) {
        setRecords(prev => [data[0], ...prev]);
        setNotice({ type: 'success', message: 'Registro adicionado!' });
        setShowEditor(false);
      } else {
        setNotice({ type: 'error', message: friendlyError(error?.message || 'Erro ao criar.') });
      }
    }
    setSaving(false);
  }

  async function handleDelete(id: string) {
    if (!confirm('Remover este registro?')) return;
    setDeletingId(id);
    const { error } = await supabase.from('transparency_records').delete().eq('id', id);
    if (!error) {
      setRecords(prev => prev.filter(r => r.id !== id));
      setNotice({ type: 'success', message: 'Registro removido.' });
    } else {
      setNotice({ type: 'error', message: error.message });
    }
    setDeletingId(null);
  }

  const filtered = records.filter(r => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      (r.proponente || '').toLowerCase().includes(q) ||
      (r.parlamentar || '').toLowerCase().includes(q) ||
      (r.objeto || '').toLowerCase().includes(q) ||
      (r.num_emenda || '').toLowerCase().includes(q) ||
      (r.num_instrumento || '').toLowerCase().includes(q)
    );
  });

  return (
    <div>
      <AdminToast notice={notice} />

      {/* Abas */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 18, borderBottom: '1px solid var(--admin-border)', overflowX: 'auto' }}>
        {([
          { id: 'registros', label: 'Registros (Contratos e Parcerias)' },
          { id: 'legislacao', label: 'Legislação Vigente' },
        ] as const).map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              padding: '10px 16px',
              background: 'transparent',
              border: 'none',
              borderBottom: tab === t.id ? '2px solid var(--admin-primary)' : '2px solid transparent',
              color: tab === t.id ? 'var(--admin-primary)' : 'var(--admin-text-secondary)',
              fontSize: '0.85rem',
              fontWeight: tab === t.id ? 700 : 500,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              marginBottom: -1,
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'legislacao' && (
        <SimpleListManager
          table="transparency_legislation"
          title="Legislação Vigente"
          description="Leis e decretos exibidos na aba 'Legislação Vigente' da página pública de Transparência."
          setNotice={setNotice}
          fields={[
            { key: 'numero', label: 'Número da norma', placeholder: 'Ex.: Lei nº 13.019/2014', required: true },
            { key: 'apelido', label: 'Apelido', placeholder: 'Ex.: MROSC — Marco Regulatório das OSCs' },
            { key: 'descricao', label: 'Descrição', type: 'textarea', placeholder: 'O que a lei estabelece…' },
            { key: 'href', label: 'Link oficial', type: 'url', placeholder: 'https://www.planalto.gov.br/…' },
            { key: 'destaque', label: 'Destaque', type: 'boolean', placeholder: 'Marca a lei como destaque (borda dourada)' },
          ]}
        />
      )}

      {tab !== 'registros' ? null : <>
      <AdminToolbar
        search={search}
        onSearch={setSearch}
        placeholder="Buscar por proponente, parlamentar, objeto…"
        count={records.length}
        countLabel={(n) => `${n} ${n === 1 ? 'registro' : 'registros'}`}
        onNew={openCreate}
        newLabel="Novo Registro"
      />

      {dbError && (
        <div style={{
          padding: '16px 20px', marginBottom: 20,
          background: 'rgba(239,68,68,0.08)',
          border: '1px solid rgba(239,68,68,0.25)',
          borderRadius: 'var(--admin-radius-md)',
          color: 'var(--admin-danger)',
          fontSize: '0.85rem', lineHeight: 1.6,
        }}>
          <strong>Erro de banco de dados:</strong> {dbError}
          <br />
          <span style={{ fontSize: '0.78rem', opacity: 0.8 }}>
            Execute <code>supabase-setup.sql</code> no SQL Editor do Supabase.
          </span>
        </div>
      )}

      {loading ? (
        <AdminSkeletonGrid count={6} height={260} />
      ) : filtered.length === 0 ? (
        <AdminEmpty
          icon={records.length === 0 ? ShieldCheck : FolderOpen}
          title={records.length === 0 ? 'Nenhum registro adicionado' : 'Nenhum resultado'}
          hint={records.length === 0
            ? 'Adicione o primeiro registro para começar a popular o painel de transparência.'
            : 'Tente buscar com outros termos.'}
        />
      ) : (
        <div className="admin-animate-in-delay-1" style={{ display: 'grid', gap: 14, paddingBottom: 60 }}>
          {filtered.map(r => (
            <ListRow
              key={r.id}
              thumb={
                <div style={{ width: 84, height: 84, borderRadius: 'var(--admin-radius-md)', background: 'var(--admin-gold-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: 'var(--admin-gold-dark)' }}>
                  <ShieldCheck size={26} />
                </div>
              }
              title={r.objeto || 'Sem descrição do objeto'}
              badges={r.modalidade ? (
                <span style={{
                  padding: '3px 10px', borderRadius: 999,
                  fontSize: '0.68rem', fontWeight: 700,
                  background: 'var(--admin-primary-subtle)',
                  color: 'var(--admin-primary)',
                  textTransform: 'uppercase', letterSpacing: '0.04em',
                }}>{r.modalidade}</span>
              ) : null}
              summary={r.proponente || undefined}
              meta={<>
                {r.ano_emenda && <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Calendar size={12} /> {r.ano_emenda}</span>}
                {r.valor && <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><DollarSign size={12} /> Valor: {r.valor}</span>}
                {r.valor_emenda && <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><DollarSign size={12} /> Emenda: {r.valor_emenda}</span>}
                {r.pdf_url && <a href={r.pdf_url} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#dc2626', textDecoration: 'none' }}><FileText size={12} /> PDF</a>}
                {r.prestacao_contas && <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--admin-primary)' }} title={r.prestacao_contas}><FileCheck size={12} /> Contas</span>}
              </>}
              actions={<>
                <button className="admin-btn admin-btn-icon" onClick={() => openEdit(r)} title="Editar">
                  <Edit3 size={16} />
                </button>
                <button
                  className="admin-btn admin-btn-icon"
                  onClick={() => handleDelete(r.id)}
                  disabled={deletingId === r.id}
                  style={{ color: deletingId === r.id ? 'var(--admin-text-tertiary)' : 'var(--admin-danger)' }}
                  title="Excluir"
                >
                  {deletingId === r.id
                    ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                    : <Trash2 size={16} />}
                </button>
              </>}
            />
          ))}
        </div>
      )}
      </>}

      <SlidePanel
        open={showEditor}
        onClose={() => setShowEditor(false)}
        icon={ShieldCheck}
        title={editing ? 'Editar Registro' : 'Novo Registro'}
        subtitle="Todos os campos são opcionais — preencha apenas o que tiver"
        onSubmit={handleSave}
        saving={saving}
        saveLabel={editing ? 'Salvar Alterações' : 'Adicionar Registro'}
      >
        {/* Importação por arquivo */}
        <div style={{ marginBottom: 18, padding: '12px 14px', background: 'var(--admin-surface)', borderRadius: 'var(--admin-radius-md)', border: '1px solid var(--admin-border)' }}>
          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--admin-text-secondary)', marginBottom: 8 }}>
            Importar de arquivo (opcional)
          </div>
          <ImportButton
            tipo="transparencia"
            label="Importar PDF/DOCX"
            onParsed={(d) => {
              const fields: Array<keyof typeof EMPTY_FORM> = ['proponente', 'parlamentar', 'modalidade', 'objeto', 'orgao_concedente', 'num_instrumento', 'num_emenda', 'ano_emenda', 'valor'];
              for (const k of fields) {
                const v = d[k];
                if (typeof v === 'string' && v) setField(k, v);
              }
            }}
          />
        </div>
        <Section title="Identificação" hint="Quem propôs e o que foi acordado">
          <Field label="Proponente" full icon={Building2}>
            <TextInput
              value={form.proponente}
              onChange={(e) => setField('proponente', e.target.value)}
              placeholder="Nome da instituição ou OSC proponente"
              autoFocus
            />
          </Field>
          <Field label="Objeto" full icon={ClipboardList}
            hint="Descrição clara do que foi/será executado">
            <TextArea
              rows={3}
              value={form.objeto}
              onChange={(e) => setField('objeto', e.target.value)}
              placeholder="Descrição do objeto do convênio ou da emenda…"
            />
          </Field>
          <Field label="Modalidade" icon={Tag}>
            <TextInput
              value={form.modalidade}
              onChange={(e) => setField('modalidade', e.target.value)}
              placeholder="Ex.: Convênio, Termo de Fomento, Termo de Colaboração"
            />
          </Field>
          <Field label="Parlamentar" icon={User}>
            <TextInput
              value={form.parlamentar}
              onChange={(e) => setField('parlamentar', e.target.value)}
              placeholder="Autor da emenda, se houver"
            />
          </Field>
        </Section>

        <Section title="Origem e Numeração">
          <Field label="Órgão Concedente" full icon={Landmark}>
            <TextInput
              value={form.orgao_concedente}
              onChange={(e) => setField('orgao_concedente', e.target.value)}
              placeholder="Ex.: Ministério da Educação"
            />
          </Field>
          <Field label="Nº Instrumento" icon={Hash}>
            <TextInput
              value={form.num_instrumento}
              onChange={(e) => setField('num_instrumento', e.target.value)}
              placeholder="Ex.: 900123/2024"
            />
          </Field>
          <Field label="Nº Emenda" icon={Hash}>
            <TextInput
              value={form.num_emenda}
              onChange={(e) => setField('num_emenda', e.target.value)}
              placeholder="Ex.: 20240001"
            />
          </Field>
          <Field label="Ano da Emenda" icon={Calendar}>
            <TextInput
              value={form.ano_emenda}
              onChange={(e) => setField('ano_emenda', e.target.value)}
              placeholder="Ex.: 2024"
            />
          </Field>
        </Section>

        <Section title="Valores" hint="Pode usar formato livre, ex.: R$ 150.000,00">
          <Field label="Valor" icon={DollarSign}>
            <TextInput
              value={form.valor}
              onChange={(e) => setField('valor', e.target.value)}
              placeholder="Valor restante / total"
            />
          </Field>
          <Field label="Valor da Emenda" icon={DollarSign}>
            <TextInput
              value={form.valor_emenda}
              onChange={(e) => setField('valor_emenda', e.target.value)}
              placeholder="Valor original da emenda"
            />
          </Field>
        </Section>

        <Section title="Documentação" columns={1}>
          <Field label="Prestação de Contas" icon={FileCheck}
            hint="Cole a URL do documento ou descreva o status (ex.: Em análise, Aprovada). URLs viram links automaticamente.">
            <TextInput
              value={form.prestacao_contas}
              onChange={(e) => setField('prestacao_contas', e.target.value)}
              placeholder="https://… ou status textual"
            />
          </Field>
          <Field label="Link do PDF Oficial" icon={FileText}
            hint="URL pública do documento (Google Drive, Dropbox, site institucional…)">
            <TextInput
              value={form.pdf_url}
              onChange={(e) => setField('pdf_url', e.target.value)}
              placeholder="https://exemplo.com/documento.pdf"
            />
          </Field>
        </Section>
      </SlidePanel>
    </div>
  );
}



function friendlyError(msg: string): string {
  if (msg.includes('row-level security')) {
    return 'Sem permissão de escrita. Execute o supabase-setup.sql no Supabase.';
  }
  return msg;
}
