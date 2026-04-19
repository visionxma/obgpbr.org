'use client';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Search, CheckCircle, XCircle, AlertCircle, ExternalLink, ShieldCheck } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface ResultadoCertificado {
  razao_social: string | null;
  cnpj: string | null;
  municipio: string | null;
  estado: string | null;
  osc_id: string;
  certificado_numero: string | null;
  certificado_emitido_at: string | null;
  status_selo: string;
}

function fmtDate(iso: string | null) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}
function fmtCnpj(cnpj: string | null) {
  if (!cnpj) return '—';
  const d = cnpj.replace(/\D/g, '');
  if (d.length !== 14) return cnpj;
  return `${d.slice(0,2)}.${d.slice(2,5)}.${d.slice(5,8)}/${d.slice(8,12)}-${d.slice(12)}`;
}

export default function VerificarPage() {
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('codigo') ?? searchParams.get('cnpj') ?? '');
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState<ResultadoCertificado | null | undefined>(undefined);

  const buscar = async (q = query) => {
    const term = q.trim().replace(/\D/g, q.trim().startsWith('RC') ? undefined! : '');
    const raw  = q.trim();
    if (!raw) return;
    setLoading(true);
    setResultado(undefined);

    // Tenta por número do certificado, CNPJ ou razão social
    const cnpjClean = raw.replace(/\D/g, '');
    const isCnpj = cnpjClean.length === 14;
    const isCodigo = raw.toUpperCase().startsWith('RC');

    let query_supabase = supabase
      .from('osc_perfis')
      .select('razao_social, cnpj, municipio, estado, osc_id, certificado_numero, certificado_emitido_at, status_selo')
      .eq('status_selo', 'aprovado');

    if (isCodigo) {
      query_supabase = query_supabase.ilike('certificado_numero', `%${raw.toUpperCase()}%`);
    } else if (isCnpj) {
      query_supabase = query_supabase.or(`cnpj.eq.${cnpjClean},cnpj.ilike.%${cnpjClean}%`);
    } else {
      query_supabase = query_supabase.ilike('razao_social', `%${raw}%`);
    }

    const { data } = await query_supabase.limit(1).maybeSingle();
    setResultado(data ?? null);
    setLoading(false);
  };

  // Auto-busca se vier código/cnpj na URL
  useEffect(() => {
    const c = searchParams.get('codigo') ?? searchParams.get('cnpj');
    if (c) { setQuery(c); buscar(c); }
  }, []);

  const certified = resultado?.status_selo === 'aprovado' && resultado?.certificado_numero;

  return (
    <main style={{ minHeight: '100vh', background: 'var(--site-bg, #f0f3f5)' }}>
      {/* Header mínimo */}
      <header style={{ background: 'var(--site-primary)', padding: '14px 24px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <Link href="/inicio" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <Image src="/logo.png" alt="OBGP" width={36} height={36} style={{ objectFit: 'contain' }} />
          <span style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: 800, color: '#fff', letterSpacing: '.06em' }}>
            OBG<span style={{ color: 'var(--site-gold, #C5AB76)' }}>P</span>
          </span>
        </Link>
        <span style={{ color: 'rgba(255,255,255,0.4)', margin: '0 4px' }}>·</span>
        <span style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.85rem', fontWeight: 500 }}>Consulta Pública de Certificação</span>
      </header>

      <div style={{ maxWidth: 720, margin: '0 auto', padding: '48px 24px' }}>

        {/* Título */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 64, height: 64, borderRadius: '50%', background: 'rgba(13,54,79,0.08)', marginBottom: 16 }}>
            <ShieldCheck size={32} style={{ color: 'var(--site-primary)' }} />
          </div>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.8rem', fontWeight: 800, color: 'var(--site-primary)', margin: '0 0 8px' }}>
            Verificar Certificação
          </h1>
          <p style={{ color: 'var(--site-text-secondary)', fontSize: '0.95rem', lineHeight: 1.6 }}>
            Consulte a situação do <strong>Selo OSC Gestão de Parcerias</strong> de qualquer organização.<br />
            <span style={{ fontSize: '0.82rem' }}>Busque por CNPJ, Razão Social ou Código do Certificado.</span>
          </p>
          <div style={{ marginTop: 10, fontSize: '0.75rem', color: 'var(--site-text-tertiary)' }}>
            Art. 11 da Lei nº 13.019/2014 — Portal de Transparência OBGP
          </div>
        </div>

        {/* Formulário de busca */}
        <div style={{ background: '#fff', borderRadius: 16, padding: '28px 28px', boxShadow: '0 2px 16px rgba(0,0,0,0.07)', border: '1px solid var(--site-border)', marginBottom: 28 }}>
          <div style={{ display: 'flex', gap: 10 }}>
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && buscar()}
              placeholder="CNPJ, Razão Social ou Código do Certificado (ex: RC18042026OBGP)"
              style={{ flex: 1, padding: '13px 16px', border: '1.5px solid var(--site-border)', borderRadius: 10, fontSize: '0.95rem', outline: 'none', color: 'var(--site-text-primary)', background: '#fafafa' }}
              onFocus={e => (e.currentTarget.style.borderColor = 'var(--site-primary)')}
              onBlur={e => (e.currentTarget.style.borderColor = 'var(--site-border)')}
              autoFocus
            />
            <button
              onClick={() => buscar()}
              disabled={loading || !query.trim()}
              style={{ padding: '13px 22px', background: 'var(--site-primary)', color: '#fff', border: 'none', borderRadius: 10, cursor: loading ? 'wait' : 'pointer', display: 'flex', alignItems: 'center', gap: 7, fontWeight: 700, fontSize: '0.9rem', opacity: (!query.trim() || loading) ? 0.6 : 1 }}
            >
              {loading
                ? <div style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                : <Search size={16} />}
              Buscar
            </button>
          </div>
        </div>

        {/* Resultado */}
        {resultado === null && (
          <div style={{ background: '#fff', borderRadius: 16, padding: '36px 28px', textAlign: 'center', border: '1px solid var(--site-border)', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
            <XCircle size={40} style={{ color: '#dc2626', margin: '0 auto 12px' }} />
            <h3 style={{ fontWeight: 700, color: 'var(--site-text-primary)', marginBottom: 8 }}>Certificação não encontrada</h3>
            <p style={{ color: 'var(--site-text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>
              Nenhuma OSC aprovada encontrada para este termo.<br />
              Verifique se o CNPJ, razão social ou código estão corretos.
            </p>
          </div>
        )}

        {resultado && (
          <div style={{ background: '#fff', borderRadius: 16, border: certified ? '2px solid #16a34a' : '2px solid #dc2626', boxShadow: '0 4px 24px rgba(0,0,0,0.09)', overflow: 'hidden' }}>

            {/* Status banner */}
            <div style={{ padding: '18px 28px', background: certified ? 'rgba(22,163,74,0.07)' : 'rgba(220,38,38,0.06)', display: 'flex', alignItems: 'center', gap: 12, borderBottom: `1px solid ${certified ? 'rgba(22,163,74,0.15)' : 'rgba(220,38,38,0.15)'}` }}>
              {certified
                ? <CheckCircle size={28} style={{ color: '#16a34a', flexShrink: 0 }} />
                : <AlertCircle size={28} style={{ color: '#dc2626', flexShrink: 0 }} />}
              <div>
                <div style={{ fontWeight: 800, fontSize: '1rem', color: certified ? '#15803d' : '#dc2626' }}>
                  {certified ? 'Certificação Ativa — Selo OSC Gestão de Parcerias' : 'Certificação Não Válida'}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--site-text-secondary)', marginTop: 2 }}>
                  {certified ? 'Esta organização está certificada pela OBGP.' : 'Esta organização não possui certificação vigente.'}
                </div>
              </div>
            </div>

            {/* Dados */}
            <div style={{ padding: '24px 28px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '18px 28px' }}>
                {[
                  { label: 'Razão Social',         value: resultado.razao_social ?? '—' },
                  { label: 'CNPJ',                  value: fmtCnpj(resultado.cnpj) },
                  { label: 'Localidade',             value: [resultado.municipio, resultado.estado].filter(Boolean).join(' / ') || '—' },
                  { label: 'Código de Verificação', value: resultado.certificado_numero ?? '—', mono: true },
                  { label: 'Data de Certificação',  value: fmtDate(resultado.certificado_emitido_at) },
                  { label: 'OSC ID',                value: resultado.osc_id, mono: true },
                ].map(({ label, value, mono }) => (
                  <div key={label}>
                    <div style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--site-text-tertiary)', marginBottom: 4 }}>{label}</div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--site-text-primary)', fontFamily: mono ? 'monospace' : undefined, wordBreak: 'break-all' }}>{value}</div>
                  </div>
                ))}
              </div>

              {certified && (
                <div style={{ marginTop: 20, padding: '12px 16px', background: 'rgba(13,54,79,0.04)', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 10 }}>
                  <ShieldCheck size={16} style={{ color: 'var(--site-primary)', flexShrink: 0 }} />
                  <span style={{ fontSize: '0.8rem', color: 'var(--site-text-secondary)', lineHeight: 1.5 }}>
                    Certificação emitida e verificada pela <strong>OBGP — Organização Brasil Gestão de Parcerias</strong>, em cumprimento ao Art. 11 da Lei nº 13.019/2014.
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        <div style={{ marginTop: 40, textAlign: 'center' }}>
          <Link href="/inicio" style={{ color: 'var(--site-primary)', fontSize: '0.85rem', fontWeight: 600, textDecoration: 'none' }}>
            ← Voltar ao site
          </Link>
        </div>
      </div>

      <style>{`@keyframes spin{100%{transform:rotate(360deg)}}`}</style>
    </main>
  );
}
