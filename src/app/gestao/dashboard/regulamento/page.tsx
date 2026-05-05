'use client';

import { supabase } from '@/lib/supabase';
import { createPortal } from 'react-dom';
import { useEffect, useRef, useState } from 'react';
import {
  FileText, Plus, Trash2, ChevronUp, ChevronDown,
  Save, Loader2, GripVertical, Hash, Calendar, User, MapPin, Mail, Phone,
  Upload, CheckCircle2, AlertCircle, X, Eye, Eraser, FileWarning,
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

type ImportState =
  | { status: 'idle' }
  | { status: 'loading'; fileName: string }
  | { status: 'preview'; fileName: string; data: RegulamentoForm }
  | { status: 'error'; message: string };

export default function RegulamentoAdmin() {
  const [form, setForm] = useState<RegulamentoForm>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [importState, setImportState] = useState<ImportState>({ status: 'idle' });
  const [replaceModal, setReplaceModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { notice, setNotice } = useNotice();

  function formHasData() {
    return (
      form.versao !== '' || form.versao_data !== '' ||
      form.versao_descricao !== '' || form.versao_responsavel !== '' ||
      form.secoes.length > 0 ||
      form.footer_endereco !== '' || form.footer_email !== '' || form.footer_telefone !== ''
    );
  }

  function handleSelectFile() {
    if (formHasData() || importState.status === 'preview') {
      setReplaceModal(true);
    } else {
      fileInputRef.current?.click();
    }
  }

  function confirmReplace() {
    setReplaceModal(false);
    fileInputRef.current?.click();
  }

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

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';

    setImportState({ status: 'loading', fileName: file.name });

    const fd = new FormData();
    fd.append('file', file);

    try {
      const res = await fetch('/api/regulamento/import', { method: 'POST', body: fd });
      const json = await res.json();
      if (!res.ok) {
        setImportState({ status: 'error', message: json.error || 'Erro desconhecido.' });
        return;
      }
      const preview: RegulamentoForm = {
        versao: json.versao || '',
        versao_data: json.versao_data || '',
        versao_descricao: json.versao_descricao || '',
        versao_responsavel: json.versao_responsavel || '',
        secoes: Array.isArray(json.secoes) ? json.secoes : [],
        footer_endereco: json.footer_endereco || '',
        footer_email: json.footer_email || '',
        footer_telefone: json.footer_telefone || '',
      };
      setImportState({ status: 'preview', fileName: file.name, data: preview });
    } catch {
      setImportState({ status: 'error', message: 'Falha na conexão com o servidor.' });
    }
  }

  function applyImport() {
    if (importState.status !== 'preview') return;
    setForm(importState.data);
    setImportState({ status: 'idle' });
    setNotice({ type: 'success', message: 'Conteúdo importado! Revise e clique em "Salvar Regulamento".' });
  }

  function handleClear() {
    if (!confirm('Tem certeza que deseja apagar todas as informações do formulário? Esta ação não pode ser desfeita.')) return;
    setForm(EMPTY);
    setNotice({ type: 'success', message: 'Formulário limpo. Clique em "Salvar Regulamento" para confirmar no banco de dados.' });
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

  const clearBtnStyle: React.CSSProperties = {
    display: 'inline-flex', alignItems: 'center', gap: 8,
    padding: '10px 18px', borderRadius: 'var(--admin-radius-md)',
    background: 'transparent', color: 'var(--admin-danger)',
    border: '1px solid rgba(239,68,68,0.35)', cursor: 'pointer',
    fontWeight: 600, fontSize: '0.88rem', fontFamily: 'inherit',
    transition: 'background 0.2s',
  };

  return (
    <div>
      <AdminToast notice={notice} />

      {/* ── Modal de confirmação de substituição ── */}
      {replaceModal && typeof document !== 'undefined' && createPortal(
        <div
          onClick={() => setReplaceModal(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: 'rgba(10, 20, 40, 0.55)',
            backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 24,
            animation: 'fadeInOverlay 0.2s ease',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: 'var(--admin-surface)',
              border: '1px solid var(--admin-border)',
              borderRadius: 'var(--admin-radius-xl)',
              boxShadow: '0 24px 60px rgba(0,0,0,0.18), 0 8px 24px rgba(0,0,0,0.1)',
              padding: '36px 32px 28px',
              maxWidth: 440, width: '100%',
              animation: 'slideUpModal 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
              textAlign: 'center',
            }}
          >
            {/* Ícone */}
            <div style={{
              width: 56, height: 56, borderRadius: '50%',
              background: 'rgba(234, 179, 8, 0.12)',
              border: '1px solid rgba(234, 179, 8, 0.25)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 20px',
            }}>
              <FileWarning size={26} style={{ color: '#ca8a04' }} />
            </div>

            {/* Título */}
            <div style={{
              fontWeight: 800, fontSize: '1.05rem',
              color: 'var(--admin-text-primary)',
              marginBottom: 10, fontFamily: 'inherit',
            }}>
              Substituir conteúdo atual?
            </div>

            {/* Descrição */}
            <div style={{
              fontSize: '0.85rem', color: 'var(--admin-text-secondary)',
              lineHeight: 1.65, marginBottom: 28,
            }}>
              O formulário já contém informações preenchidas. Ao importar um novo arquivo,
              <strong style={{ color: 'var(--admin-text-primary)' }}> todo o conteúdo atual será substituído</strong> pelo
              conteúdo extraído do novo documento.
              <br /><br />
              <span style={{ fontSize: '0.78rem', color: 'var(--admin-text-tertiary)' }}>
                As alterações só serão aplicadas ao banco de dados após clicar em "Salvar Regulamento".
              </span>
            </div>

            {/* Ações */}
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <button
                type="button"
                onClick={() => setReplaceModal(false)}
                style={{
                  flex: 1, padding: '10px 16px',
                  borderRadius: 'var(--admin-radius-md)',
                  border: '1px solid var(--admin-border)',
                  background: 'var(--admin-bg)',
                  color: 'var(--admin-text-secondary)',
                  fontWeight: 600, fontSize: '0.85rem', fontFamily: 'inherit',
                  cursor: 'pointer',
                }}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmReplace}
                style={{
                  flex: 1, padding: '10px 16px',
                  borderRadius: 'var(--admin-radius-md)',
                  border: 'none',
                  background: 'linear-gradient(135deg, var(--admin-primary), var(--admin-primary-dark))',
                  color: '#fff',
                  fontWeight: 700, fontSize: '0.85rem', fontFamily: 'inherit',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(var(--admin-primary-rgb, 15,52,96), 0.3)',
                }}
              >
                Sim, substituir
              </button>
            </div>
          </div>
          <style>{`
            @keyframes fadeInOverlay { from { opacity: 0 } to { opacity: 1 } }
            @keyframes slideUpModal { from { opacity: 0; transform: translateY(16px) scale(0.97) } to { opacity: 1; transform: translateY(0) scale(1) } }
          `}</style>
        </div>,
        document.body
      )}

      {/* ── Painel de Importação ── */}
      <div style={{
        marginBottom: 28,
        border: '1px solid var(--admin-border)',
        borderRadius: 'var(--admin-radius-lg)',
        background: 'var(--admin-surface)',
        overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 20px',
          borderBottom: importState.status !== 'idle' ? '1px solid var(--admin-border)' : 'none',
          background: 'var(--admin-surface-elevated)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Upload size={16} style={{ color: 'var(--admin-primary)' }} />
            <span style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--admin-text-primary)' }}>
              Importar Documento
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--admin-text-tertiary)' }}>
              PDF ou DOCX — o conteúdo será extraído e preenchido automaticamente pela IA
            </span>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {importState.status !== 'idle' && importState.status !== 'loading' && (
              <button
                type="button"
                onClick={() => setImportState({ status: 'idle' })}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'var(--admin-text-tertiary)', display: 'flex', padding: 4,
                }}
                title="Fechar"
              >
                <X size={16} />
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx"
              style={{ display: 'none' }}
              onChange={handleImport}
            />
            <button
              type="button"
              onClick={handleSelectFile}
              disabled={importState.status === 'loading'}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '7px 14px', borderRadius: 'var(--admin-radius-md)',
                border: '1px solid var(--admin-primary)',
                background: 'transparent', color: 'var(--admin-primary)',
                cursor: importState.status === 'loading' ? 'not-allowed' : 'pointer',
                fontWeight: 600, fontSize: '0.82rem', fontFamily: 'inherit',
                opacity: importState.status === 'loading' ? 0.6 : 1,
              }}
            >
              {importState.status === 'loading'
                ? <><Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} /> Analisando…</>
                : <><Upload size={13} /> Selecionar arquivo</>
              }
            </button>
          </div>
        </div>

        {/* Loading */}
        {importState.status === 'loading' && (
          <div style={{
            padding: '20px 24px',
            display: 'flex', alignItems: 'center', gap: 12,
            color: 'var(--admin-text-secondary)', fontSize: '0.85rem',
          }}>
            <Loader2 size={18} style={{ animation: 'spin 1s linear infinite', color: 'var(--admin-primary)', flexShrink: 0 }} />
            <div>
              <div style={{ fontWeight: 600, color: 'var(--admin-text-primary)' }}>Extraindo e estruturando conteúdo com IA…</div>
              <div style={{ fontSize: '0.78rem', marginTop: 2 }}>{importState.fileName}</div>
            </div>
          </div>
        )}

        {/* Error */}
        {importState.status === 'error' && (
          <div style={{
            padding: '16px 20px',
            display: 'flex', alignItems: 'center', gap: 10,
            color: 'var(--admin-danger)', fontSize: '0.85rem',
          }}>
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            {importState.message}
          </div>
        )}

        {/* Preview */}
        {importState.status === 'preview' && (
          <div style={{ padding: '16px 20px' }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              marginBottom: 14, color: 'var(--admin-success)', fontSize: '0.85rem', fontWeight: 600,
            }}>
              <CheckCircle2 size={16} />
              {importState.data.secoes.length} seções extraídas de "{importState.fileName}"
            </div>

            {/* Preview das seções */}
            <div style={{
              maxHeight: 220, overflowY: 'auto',
              border: '1px solid var(--admin-border)',
              borderRadius: 'var(--admin-radius-md)',
              marginBottom: 14,
            }}>
              {importState.data.secoes.map((s, i) => (
                <div key={i} style={{
                  padding: '8px 14px',
                  borderBottom: i < importState.data.secoes.length - 1 ? '1px solid var(--admin-border)' : 'none',
                  display: 'flex', alignItems: 'center', gap: 8,
                }}>
                  <Eye size={13} style={{ color: 'var(--admin-text-tertiary)', flexShrink: 0 }} />
                  <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--admin-text-primary)' }}>
                    {s.titulo}
                  </span>
                  {s.conteudo && (
                    <span style={{
                      fontSize: '0.75rem', color: 'var(--admin-text-tertiary)',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      — {s.conteudo.replace(/<[^>]+>/g, '').slice(0, 80)}…
                    </span>
                  )}
                </div>
              ))}
            </div>

            {/* Metadados encontrados */}
            <div style={{
              display: 'flex', flexWrap: 'wrap', gap: '4px 16px',
              fontSize: '0.78rem', color: 'var(--admin-text-secondary)',
              marginBottom: 14,
            }}>
              {importState.data.versao && <span>Versão: <strong>{importState.data.versao}</strong></span>}
              {importState.data.versao_data && <span>Data: <strong>{new Date(importState.data.versao_data + 'T12:00:00').toLocaleDateString('pt-BR')}</strong></span>}
              {importState.data.footer_email && <span>Email: <strong>{importState.data.footer_email}</strong></span>}
              {importState.data.footer_telefone && <span>Tel: <strong>{importState.data.footer_telefone}</strong></span>}
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <button
                type="button"
                onClick={applyImport}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  padding: '8px 18px', borderRadius: 'var(--admin-radius-md)',
                  background: 'var(--admin-primary)', color: '#fff',
                  border: 'none', cursor: 'pointer',
                  fontWeight: 700, fontSize: '0.85rem', fontFamily: 'inherit',
                }}
              >
                <CheckCircle2 size={14} /> Aplicar ao Formulário
              </button>
              <button
                type="button"
                onClick={() => setImportState({ status: 'idle' })}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  padding: '8px 16px', borderRadius: 'var(--admin-radius-md)',
                  background: 'transparent', color: 'var(--admin-text-secondary)',
                  border: '1px solid var(--admin-border)', cursor: 'pointer',
                  fontWeight: 600, fontSize: '0.85rem', fontFamily: 'inherit',
                }}
              >
                Cancelar
              </button>
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSave}>
        {/* Top save */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 10, marginBottom: 28 }}>
          <button type="button" onClick={handleClear} style={clearBtnStyle}>
            <Eraser size={15} /> Limpar Tudo
          </button>
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
        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 10, marginTop: 8, paddingBottom: 60 }}>
          <button type="button" onClick={handleClear} style={clearBtnStyle}>
            <Eraser size={15} /> Limpar Tudo
          </button>
          <button type="submit" disabled={saving} style={saveBtnStyle}>
            {saving ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Save size={16} />}
            {saving ? 'Salvando…' : 'Salvar Regulamento'}
          </button>
        </div>
      </form>
    </div>
  );
}
