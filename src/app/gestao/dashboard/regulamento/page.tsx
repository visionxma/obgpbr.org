'use client';

import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';
import {
  FileText, Plus, Trash2, ChevronUp, ChevronDown,
  Save, Loader2, GripVertical, Hash, Calendar, User, MapPin, Mail, Phone,
} from 'lucide-react';
import {
  AdminToast, Section, Field, TextInput, useNotice,
} from '../_shared/AdminUI';

interface Secao {
  titulo: string;
  conteudo: string;
}

interface RegulamentoForm {
  versao: string;
  versao_data: string;
  versao_descricao: string;
  versao_responsavel: string;
  secoes: Secao[];
  footer_endereco: string;
  footer_email: string;
  footer_telefone: string;
}

const EMPTY: RegulamentoForm = {
  versao: '',
  versao_data: '',
  versao_descricao: '',
  versao_responsavel: '',
  secoes: [],
  footer_endereco: '',
  footer_email: '',
  footer_telefone: '',
};

export default function RegulamentoAdmin() {
  const [form, setForm] = useState<RegulamentoForm>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { notice, setNotice } = useNotice();

  useEffect(() => { fetchData(); }, []);

  async function fetchData() {
    setLoading(true);
    const { data, error } = await supabase
      .from('regulamento_conteudo')
      .select('*')
      .eq('id', 1)
      .single();
    if (error && error.code !== 'PGRST116') {
      setNotice({ type: 'error', message: 'Erro ao carregar: ' + error.message });
    }
    if (data) {
      setForm({
        versao: data.versao || '',
        versao_data: data.versao_data || '',
        versao_descricao: data.versao_descricao || '',
        versao_responsavel: data.versao_responsavel || '',
        secoes: (data.secoes as Secao[]) || [],
        footer_endereco: data.footer_endereco || '',
        footer_email: data.footer_email || '',
        footer_telefone: data.footer_telefone || '',
      });
    }
    setLoading(false);
  }

  function setField<K extends keyof RegulamentoForm>(key: K, val: RegulamentoForm[K]) {
    setForm(f => ({ ...f, [key]: val }));
  }

  function setSecao(idx: number, key: keyof Secao, val: string) {
    setForm(f => {
      const secoes = [...f.secoes];
      secoes[idx] = { ...secoes[idx], [key]: val };
      return { ...f, secoes };
    });
  }

  function addSecao() {
    setForm(f => ({
      ...f,
      secoes: [...f.secoes, { titulo: `${f.secoes.length + 1}. Nova Seção`, conteudo: '' }],
    }));
  }

  function removeSecao(idx: number) {
    if (!confirm('Remover esta seção?')) return;
    setForm(f => ({ ...f, secoes: f.secoes.filter((_, i) => i !== idx) }));
  }

  function moveSecao(idx: number, dir: -1 | 1) {
    setForm(f => {
      const secoes = [...f.secoes];
      const target = idx + dir;
      if (target < 0 || target >= secoes.length) return f;
      [secoes[idx], secoes[target]] = [secoes[target], secoes[idx]];
      return { ...f, secoes };
    });
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const payload = {
      id: 1,
      versao: form.versao.trim() || '1.0',
      versao_data: form.versao_data || null,
      versao_descricao: form.versao_descricao.trim() || null,
      versao_responsavel: form.versao_responsavel.trim() || null,
      secoes: form.secoes,
      footer_endereco: form.footer_endereco.trim() || null,
      footer_email: form.footer_email.trim() || null,
      footer_telefone: form.footer_telefone.trim() || null,
      updated_at: new Date().toISOString(),
    };
    const { error } = await supabase
      .from('regulamento_conteudo')
      .upsert(payload);
    setSaving(false);
    if (error) {
      setNotice({ type: 'error', message: 'Erro ao salvar: ' + error.message });
    } else {
      setNotice({ type: 'success', message: 'Regulamento atualizado com sucesso!' });
    }
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 240, gap: 12 }}>
        <Loader2 size={24} style={{ animation: 'spin 1s linear infinite', color: 'var(--admin-primary)' }} />
        <span style={{ color: 'var(--admin-text-secondary)', fontSize: '0.88rem' }}>Carregando regulamento…</span>
        <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const saveBtnStyle: React.CSSProperties = {
    display: 'inline-flex', alignItems: 'center', gap: 8, minWidth: 176,
    padding: '10px 20px', borderRadius: 'var(--admin-radius-md)',
    background: 'var(--admin-primary)', color: '#fff',
    border: 'none', cursor: saving ? 'not-allowed' : 'pointer',
    fontWeight: 700, fontSize: '0.88rem', fontFamily: 'inherit',
    opacity: saving ? 0.7 : 1, transition: 'opacity 0.2s',
  };

  return (
    <div>
      <AdminToast notice={notice} />

      <form onSubmit={handleSave}>
        {/* Top save */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 28 }}>
          <button type="submit" disabled={saving} style={saveBtnStyle}>
            {saving ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Save size={16} />}
            {saving ? 'Salvando…' : 'Salvar Regulamento'}
          </button>
        </div>

        {/* Versão */}
        <Section title="Controle de Versão" hint="Exibido na tabela de histórico ao final do documento">
          <Field label="Versão" icon={Hash}>
            <TextInput
              value={form.versao}
              onChange={e => setField('versao', e.target.value)}
              placeholder="Ex.: 1.0"
            />
          </Field>
          <Field label="Data" icon={Calendar}>
            <TextInput
              type="date"
              value={form.versao_data}
              onChange={e => setField('versao_data', e.target.value)}
            />
          </Field>
          <Field label="Descrição da Alteração" full icon={FileText}>
            <TextInput
              value={form.versao_descricao}
              onChange={e => setField('versao_descricao', e.target.value)}
              placeholder="Ex.: Emissão inicial e adequação ao Decreto nº 11.948/2024."
            />
          </Field>
          <Field label="Responsável" full icon={User}>
            <TextInput
              value={form.versao_responsavel}
              onChange={e => setField('versao_responsavel', e.target.value)}
              placeholder="Ex.: Equipe Técnica Administrador RT e Contador RT."
            />
          </Field>
        </Section>

        {/* Seções */}
        <div style={{ marginBottom: 32 }}>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            marginBottom: 16,
          }}>
            <div>
              <div style={{ fontWeight: 700, color: 'var(--admin-text-primary)', fontSize: '0.88rem' }}>
                Seções do Regulamento
              </div>
              <div style={{ color: 'var(--admin-text-secondary)', fontSize: '0.75rem', marginTop: 2 }}>
                {form.secoes.length} {form.secoes.length === 1 ? 'seção' : 'seções'} — cada campo aceita HTML simples
                {' '}(<code style={{ fontSize: '0.72rem' }}>p, strong, em, ul, li, ol</code>)
              </div>
            </div>
            <button
              type="button"
              onClick={addSecao}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '8px 16px', borderRadius: 'var(--admin-radius-md)',
                border: '1px solid var(--admin-border)',
                background: 'var(--admin-surface)', color: 'var(--admin-text-primary)',
                cursor: 'pointer', fontWeight: 600, fontSize: '0.82rem', fontFamily: 'inherit',
              }}
            >
              <Plus size={14} /> Nova Seção
            </button>
          </div>

          {form.secoes.length === 0 ? (
            <div style={{
              textAlign: 'center', padding: '40px 20px',
              border: '2px dashed var(--admin-border)',
              borderRadius: 'var(--admin-radius-lg)',
              color: 'var(--admin-text-tertiary)',
            }}>
              <FileText size={28} style={{ marginBottom: 8, opacity: 0.4 }} />
              <p style={{ margin: 0, fontSize: '0.85rem' }}>
                Nenhuma seção. Clique em "Nova Seção" para adicionar.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {form.secoes.map((sec, idx) => (
                <div
                  key={idx}
                  style={{
                    border: '1px solid var(--admin-border)',
                    borderRadius: 'var(--admin-radius-lg)',
                    background: 'var(--admin-surface)',
                    overflow: 'hidden',
                  }}
                >
                  {/* Section header row */}
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '10px 14px',
                    borderBottom: '1px solid var(--admin-border)',
                    background: 'var(--admin-surface-elevated)',
                  }}>
                    <GripVertical size={15} style={{ color: 'var(--admin-text-tertiary)', flexShrink: 0 }} />
                    <input
                      type="text"
                      value={sec.titulo}
                      onChange={e => setSecao(idx, 'titulo', e.target.value)}
                      placeholder="Título da seção"
                      style={{
                        flex: 1, border: 'none', background: 'transparent', outline: 'none',
                        fontFamily: 'inherit', fontSize: '0.88rem', fontWeight: 700,
                        color: 'var(--admin-text-primary)',
                      }}
                    />
                    <div style={{ display: 'flex', gap: 2, flexShrink: 0 }}>
                      <button
                        type="button"
                        onClick={() => moveSecao(idx, -1)}
                        disabled={idx === 0}
                        title="Subir"
                        style={{
                          padding: '4px 6px', border: '1px solid var(--admin-border)',
                          borderRadius: 'var(--admin-radius-sm)', background: 'transparent',
                          cursor: idx === 0 ? 'not-allowed' : 'pointer',
                          color: 'var(--admin-text-secondary)', display: 'flex', alignItems: 'center',
                          opacity: idx === 0 ? 0.4 : 1,
                        }}
                      >
                        <ChevronUp size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveSecao(idx, 1)}
                        disabled={idx === form.secoes.length - 1}
                        title="Descer"
                        style={{
                          padding: '4px 6px', border: '1px solid var(--admin-border)',
                          borderRadius: 'var(--admin-radius-sm)', background: 'transparent',
                          cursor: idx === form.secoes.length - 1 ? 'not-allowed' : 'pointer',
                          color: 'var(--admin-text-secondary)', display: 'flex', alignItems: 'center',
                          opacity: idx === form.secoes.length - 1 ? 0.4 : 1,
                        }}
                      >
                        <ChevronDown size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeSecao(idx)}
                        title="Remover seção"
                        style={{
                          padding: '4px 6px', border: '1px solid rgba(239,68,68,0.2)',
                          borderRadius: 'var(--admin-radius-sm)', background: 'transparent',
                          cursor: 'pointer', color: 'var(--admin-danger)', display: 'flex', alignItems: 'center',
                        }}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  {/* Content textarea */}
                  <div style={{ padding: 14 }}>
                    <textarea
                      value={sec.conteudo}
                      onChange={e => setSecao(idx, 'conteudo', e.target.value)}
                      rows={8}
                      placeholder={'Conteúdo HTML… Ex.: <p><strong>Art. 1º.</strong> Texto do artigo.</p>'}
                      style={{
                        width: '100%', boxSizing: 'border-box',
                        border: '1px solid var(--admin-border)',
                        borderRadius: 'var(--admin-radius-md)',
                        padding: '10px 12px',
                        fontFamily: '"Courier New", Courier, monospace',
                        fontSize: '0.8rem', lineHeight: 1.6,
                        color: 'var(--admin-text-primary)',
                        background: 'var(--admin-bg)',
                        resize: 'vertical', outline: 'none',
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Rodapé */}
        <Section title="Rodapé do Documento" hint="Informações exibidas ao final do regulamento">
          <Field label="Endereço" full icon={MapPin}>
            <TextInput
              value={form.footer_endereco}
              onChange={e => setField('footer_endereco', e.target.value)}
              placeholder="Rua, Número, Bairro — Cidade/UF, CEP"
            />
          </Field>
          <Field label="E-mail" icon={Mail}>
            <TextInput
              type="email"
              value={form.footer_email}
              onChange={e => setField('footer_email', e.target.value)}
              placeholder="contato@obgp.org.br"
            />
          </Field>
          <Field label="Telefone" icon={Phone}>
            <TextInput
              value={form.footer_telefone}
              onChange={e => setField('footer_telefone', e.target.value)}
              placeholder="(00) 0 0000-0000"
            />
          </Field>
        </Section>

        {/* Bottom save */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8, paddingBottom: 60 }}>
          <button type="submit" disabled={saving} style={saveBtnStyle}>
            {saving ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Save size={16} />}
            {saving ? 'Salvando…' : 'Salvar Regulamento'}
          </button>
        </div>
      </form>
    </div>
  );
}
