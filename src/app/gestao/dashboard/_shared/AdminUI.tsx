'use client';

/**
 * AdminUI — Primitivas compartilhadas para os módulos de conteúdo do painel.
 * Padroniza o visual de Blog, Experiências e Transparência mantendo
 * a essência específica que cada seção entrega.
 */

import { createPortal } from 'react-dom';
import { useEffect, useRef, useState } from 'react';
import {
  AlertCircle, CheckCircle2, Loader2, Plus, Search, X, Save, Upload,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

/* ─────────────────────────────────────────────
   TOAST
   ───────────────────────────────────────────── */
export type Notice = { type: 'success' | 'error'; message: string } | null;

export function useNotice() {
  const [notice, setNotice] = useState<Notice>(null);
  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(null), 3800);
    return () => clearTimeout(t);
  }, [notice]);
  return { notice, setNotice };
}

export function AdminToast({ notice }: { notice: Notice }) {
  if (!notice || typeof document === 'undefined') return null;
  const isOk = notice.type === 'success';
  return createPortal(
    <div
      className="admin-animate-in"
      style={{
        position: 'fixed', top: 90, right: 32, zIndex: 9999,
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '14px 20px', borderRadius: 'var(--admin-radius-md)',
        background: isOk ? 'var(--admin-success-bg)' : 'var(--admin-danger-bg)',
        color: isOk ? 'var(--admin-success)' : 'var(--admin-danger)',
        border: `1px solid ${isOk ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}`,
        fontSize: '0.85rem', fontWeight: 600,
        boxShadow: 'var(--admin-shadow-lg)',
        backdropFilter: 'blur(8px)',
      }}
    >
      {isOk ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
      {notice.message}
    </div>,
    document.body
  );
}

/* ─────────────────────────────────────────────
   TOOLBAR
   ───────────────────────────────────────────── */
export function AdminToolbar({
  search, onSearch, placeholder, count, countLabel, onNew, newLabel,
}: {
  search: string;
  onSearch: (v: string) => void;
  placeholder: string;
  count: number;
  countLabel: (n: number) => string;
  onNew: () => void;
  newLabel: string;
}) {
  return (
    <div
      className="admin-animate-in"
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: 16, flexWrap: 'wrap', marginBottom: 24,
      }}
    >
      <div
        style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '0 14px', height: 42,
          borderRadius: 'var(--admin-radius-md)',
          background: 'var(--admin-surface)',
          border: '1px solid var(--admin-border)',
          flex: 1, maxWidth: 380, minWidth: 240,
        }}
      >
        <Search size={16} style={{ color: 'var(--admin-text-tertiary)', flexShrink: 0 }} />
        <input
          type="text"
          placeholder={placeholder}
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          style={{
            border: 'none', background: 'none', outline: 'none',
            fontFamily: 'inherit', fontSize: '0.85rem',
            color: 'var(--admin-text-primary)', width: '100%',
          }}
        />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontSize: '0.78rem', color: 'var(--admin-text-tertiary)', fontWeight: 500 }}>
          {countLabel(count)}
        </span>
        <button className="admin-btn admin-btn-primary" onClick={onNew}>
          <Plus size={16} /> {newLabel}
        </button>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   EMPTY STATE
   ───────────────────────────────────────────── */
export function AdminEmpty({
  icon: Icon, title, hint,
}: {
  icon: React.ElementType;
  title: string;
  hint: string;
}) {
  return (
    <div className="glass-card admin-animate-in-delay-1">
      <div className="admin-empty-state">
        <div className="admin-empty-state-icon"><Icon size={32} /></div>
        <div className="admin-empty-state-text" style={{ fontSize: '1.1rem', marginTop: 12 }}>{title}</div>
        <div className="admin-empty-state-hint" style={{ maxWidth: 360, margin: '8px auto 0' }}>{hint}</div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   SKELETON GRID
   ───────────────────────────────────────────── */
export function AdminSkeletonGrid({ count = 6, height = 220 }: { count?: number; height?: number }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 20 }}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="glass-card" style={{ height }}>
          <div className="admin-skeleton" style={{ height: '100%', width: '100%' }} />
        </div>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────
   SLIDE-IN EDITOR PANEL
   ───────────────────────────────────────────── */
export function SlidePanel({
  open, onClose, icon: Icon, title, subtitle, onSubmit, saving, saveLabel, children, maxWidth = 680,
}: {
  open: boolean;
  onClose: () => void;
  icon: React.ElementType;
  title: string;
  subtitle?: string;
  onSubmit: (e: React.FormEvent) => void | Promise<void>;
  saving?: boolean;
  saveLabel: string;
  children: React.ReactNode;
  maxWidth?: number;
}) {
  useEffect(() => {
    if (!open) return;
    const onEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onEsc);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onEsc);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open || typeof document === 'undefined') return null;

  return createPortal(
    <>
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 9900,
          background: 'rgba(13,12,27,0.45)',
          backdropFilter: 'blur(8px)',
          animation: 'adminFadeIn .25s ease',
        }}
      />
      <div
        className="admin-slide-panel"
        style={{
          position: 'fixed', top: 0, right: 0, bottom: 0,
          width: '100%', maxWidth,
          background: 'var(--admin-surface)',
          borderLeft: '1px solid var(--admin-border)',
          boxShadow: '-12px 0 60px rgba(13,12,27,0.18)',
          zIndex: 9910,
          display: 'flex', flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '20px 28px', borderBottom: '1px solid var(--admin-border)',
          background: 'linear-gradient(180deg, var(--admin-surface), var(--admin-bg))',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{
              width: 42, height: 42, borderRadius: 'var(--admin-radius-md)',
              background: 'var(--admin-gold-light)',
              border: '1px solid var(--admin-gold-border)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--admin-gold-dark)',
            }}>
              <Icon size={20} />
            </div>
            <div>
              <h3 style={{
                fontSize: '1.1rem', fontWeight: 700, fontFamily: 'Outfit, sans-serif',
                margin: 0, color: 'var(--admin-text-primary)',
              }}>
                {title}
              </h3>
              {subtitle && (
                <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: 'var(--admin-text-tertiary)' }}>
                  {subtitle}
                </p>
              )}
            </div>
          </div>
          <button
            type="button"
            className="admin-btn admin-btn-icon"
            onClick={onClose}
            style={{ border: '1px solid var(--admin-border)' }}
            aria-label="Fechar"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form body */}
        <form
          onSubmit={onSubmit}
          style={{
            flex: 1, overflow: 'auto',
            display: 'flex', flexDirection: 'column',
          }}
        >
          <div style={{ padding: '28px 32px', flex: 1 }}>
            {children}
          </div>

          {/* Sticky footer */}
          <div style={{
            position: 'sticky', bottom: 0,
            background: 'var(--admin-surface)',
            borderTop: '1px solid var(--admin-border)',
            padding: '16px 28px',
            display: 'flex', justifyContent: 'flex-end', gap: 10,
            backdropFilter: 'blur(12px)',
          }}>
            <button type="button" className="admin-btn admin-btn-secondary" onClick={onClose}>
              Cancelar
            </button>
            <button
              type="submit"
              className="admin-btn admin-btn-primary"
              disabled={saving}
              style={{ opacity: saving ? 0.7 : 1, cursor: saving ? 'not-allowed' : 'pointer' }}
            >
              {saving
                ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Salvando…</>
                : <><Save size={16} /> {saveLabel}</>}
            </button>
          </div>
        </form>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes adminFadeIn { from { opacity: 0 } to { opacity: 1 } }
        .admin-slide-panel { animation: adminSlideRight .35s cubic-bezier(0.4, 0, 0.2, 1); }
        @keyframes adminSlideRight {
          from { transform: translateX(40px); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
      `}</style>
    </>,
    document.body
  );
}

/* ─────────────────────────────────────────────
   FORM PRIMITIVES
   ───────────────────────────────────────────── */
export function Section({
  title, hint, columns = 2, children,
}: {
  title: string;
  hint?: string;
  columns?: 1 | 2;
  children: React.ReactNode;
}) {
  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ marginBottom: 14, display: 'flex', alignItems: 'baseline', gap: 12 }}>
        <h4 style={{
          fontSize: '0.72rem', fontWeight: 800,
          color: 'var(--admin-text-primary)',
          textTransform: 'uppercase', letterSpacing: '0.10em',
          margin: 0,
        }}>
          {title}
        </h4>
        <div style={{ flex: 1, height: 1, background: 'var(--admin-border)' }} />
        {hint && (
          <span style={{ fontSize: '0.7rem', color: 'var(--admin-text-tertiary)' }}>{hint}</span>
        )}
      </div>
      <div style={{
        display: 'grid',
        gridTemplateColumns: columns === 2 ? 'repeat(2, 1fr)' : '1fr',
        gap: 16,
      }}>
        {children}
      </div>
    </div>
  );
}

export function Field({
  label, hint, full, children, icon: Icon,
}: {
  label: string;
  hint?: string;
  full?: boolean;
  children: React.ReactNode;
  icon?: React.ElementType;
}) {
  return (
    <div style={{ gridColumn: full ? '1 / -1' : 'auto' }}>
      <label
        className="admin-form-label"
        style={{ display: 'flex', alignItems: 'center', gap: 6 }}
      >
        {Icon && <Icon size={11} />}
        {label}
      </label>
      {children}
      {hint && (
        <p style={{ margin: '6px 2px 0', fontSize: '0.72rem', color: 'var(--admin-text-tertiary)' }}>
          {hint}
        </p>
      )}
    </div>
  );
}

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`admin-input ${props.className || ''}`} />;
}

export function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`admin-input ${props.className || ''}`}
      style={{ minHeight: 90, resize: 'vertical', lineHeight: 1.6, padding: '12px 16px', ...(props.style || {}) }}
    />
  );
}

export function SelectInput(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={`admin-input ${props.className || ''}`} style={{ cursor: 'pointer', ...(props.style || {}) }} />;
}

/* ─────────────────────────────────────────────
   PUBLISH TOGGLE
   ───────────────────────────────────────────── */
export function PublishToggle({
  value, onChange, label = 'Publicar', hint,
}: {
  value: boolean;
  onChange: (v: boolean) => void;
  label?: string;
  hint?: string;
}) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '14px 16px', borderRadius: 'var(--admin-radius-md)',
      background: 'var(--admin-bg)', border: '1px solid var(--admin-border)',
    }}>
      <div>
        <div style={{ fontSize: '0.85rem', color: 'var(--admin-text-primary)', fontWeight: 600 }}>
          {label}
        </div>
        {hint && (
          <div style={{ fontSize: '0.72rem', color: 'var(--admin-text-tertiary)', marginTop: 2 }}>
            {hint}
          </div>
        )}
      </div>
      <button
        type="button"
        onClick={() => onChange(!value)}
        aria-pressed={value}
        style={{
          width: 46, height: 26, borderRadius: 999, border: 'none', cursor: 'pointer',
          position: 'relative', transition: 'background 0.2s',
          background: value ? 'var(--admin-success)' : 'var(--admin-border)',
        }}
      >
        <span style={{
          position: 'absolute', top: 2, left: value ? 22 : 2,
          width: 22, height: 22, borderRadius: '50%', background: '#fff',
          transition: 'left .2s', boxShadow: '0 1px 3px rgba(0,0,0,.18)',
        }} />
      </button>
    </div>
  );
}

/* ─────────────────────────────────────────────
   IMAGE UPLOAD FIELD
   ───────────────────────────────────────────── */
const ALLOWED_IMG = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);
const MAX_BYTES = 5 * 1024 * 1024;
const EXT_BY_MIME: Record<string, string> = {
  'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/gif': 'gif',
};

export function ImageUploadField({
  value, onChange, folder, onError, onSuccess,
}: {
  value: string;
  onChange: (url: string) => void;
  folder: string;
  onError: (msg: string) => void;
  onSuccess?: (msg: string) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function upload(file: File) {
    if (file.size > MAX_BYTES) {
      onError('Imagem muito grande. Máximo 5 MB.');
      return;
    }
    if (!ALLOWED_IMG.has(file.type)) {
      onError('Formato inválido. Use JPG, PNG, WebP ou GIF.');
      return;
    }
    setUploading(true);
    try {
      const ext = EXT_BY_MIME[file.type] ?? 'bin';
      const path = `${folder}/${Date.now()}-${crypto.randomUUID().replace(/-/g, '')}.${ext}`;
      const { error } = await supabase.storage.from('images').upload(path, file, { contentType: file.type });
      if (error) throw error;
      const { data } = supabase.storage.from('images').getPublicUrl(path);
      onChange(data.publicUrl);
      onSuccess?.('Imagem enviada!');
    } catch {
      onError('Falha no upload. Tente novamente.');
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
        <TextInput
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Cole uma URL ou faça upload"
          style={{ flex: 1 }}
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="admin-btn admin-btn-secondary"
          style={{ height: 44, padding: '0 18px', whiteSpace: 'nowrap' }}
        >
          {uploading ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Upload size={14} />}
          {uploading ? 'Enviando…' : 'Upload'}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={(e) => { const f = e.target.files?.[0]; if (f) upload(f); }}
        />
      </div>
      {value && (
        <div style={{
          marginTop: 12,
          borderRadius: 'var(--admin-radius-md)',
          overflow: 'hidden',
          border: '1px solid var(--admin-border)',
          position: 'relative',
        }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value}
            alt="Pré-visualização"
            style={{ width: '100%', maxHeight: 220, objectFit: 'cover', display: 'block' }}
            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
          />
          <button
            type="button"
            onClick={() => onChange('')}
            style={{
              position: 'absolute', top: 10, right: 10,
              width: 32, height: 32, borderRadius: 999, border: 'none',
              background: 'rgba(13,12,27,0.7)', color: '#fff',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              backdropFilter: 'blur(8px)',
            }}
            aria-label="Remover imagem"
          >
            <X size={14} />
          </button>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
   LIST ITEM ROW (cartão de listagem padrão)
   ───────────────────────────────────────────── */
export function ListRow({
  thumb, status, badges, title, summary, meta, actions,
}: {
  thumb?: React.ReactNode;
  status?: { label: string; tone: 'success' | 'muted' | 'gold' };
  badges?: React.ReactNode;
  title: string;
  summary?: string;
  meta?: React.ReactNode;
  actions: React.ReactNode;
}) {
  const statusStyle = (() => {
    if (!status) return null;
    const map = {
      success: { bg: 'var(--admin-success-bg)', fg: 'var(--admin-success)' },
      muted:   { bg: 'rgba(163,163,153,0.15)', fg: 'var(--admin-text-tertiary)' },
      gold:    { bg: 'var(--admin-gold-light)', fg: 'var(--admin-gold-dark)' },
    } as const;
    return map[status.tone];
  })();

  return (
    <div className="glass-card" style={{
      display: 'flex', gap: 18, padding: 18, alignItems: 'center',
    }}>
      {thumb}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6, flexWrap: 'wrap' }}>
          <h3 style={{
            fontSize: '1rem', fontWeight: 700,
            color: 'var(--admin-text-primary)',
            margin: 0, lineHeight: 1.3,
          }}>
            {title}
          </h3>
          {status && statusStyle && (
            <span style={{
              padding: '3px 10px', borderRadius: 999,
              fontSize: '0.68rem', fontWeight: 700,
              background: statusStyle.bg, color: statusStyle.fg,
              textTransform: 'uppercase', letterSpacing: '0.04em',
            }}>{status.label}</span>
          )}
          {badges}
        </div>
        {summary && (
          <p style={{
            fontSize: '0.85rem', color: 'var(--admin-text-secondary)',
            lineHeight: 1.5, margin: 0,
            overflow: 'hidden', display: '-webkit-box',
            WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
          }}>{summary}</p>
        )}
        {meta && (
          <div style={{
            display: 'flex', flexWrap: 'wrap', gap: 14, marginTop: 8,
            fontSize: '0.72rem', color: 'var(--admin-text-tertiary)',
          }}>{meta}</div>
        )}
      </div>
      <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
        {actions}
      </div>
    </div>
  );
}
