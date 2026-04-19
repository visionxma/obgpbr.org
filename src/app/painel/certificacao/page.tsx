'use client';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  ShieldCheck, CreditCard, CheckCircle, Clock, XCircle,
  ExternalLink, AlertCircle, ArrowRight, FileText, Award,
  RefreshCw, Lock,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { usePainel } from '../PainelContext';

interface Pagamento {
  id: string;
  status: string;
  valor: number;
  payment_url: string | null;
  metodo_pagamento: string | null;
  paid_at: string | null;
  created_at: string;
}

interface PerfilExt {
  certificacao_liberada: boolean;
  certificacao_solicitada_at: string | null;
  certificacao_paga_at: string | null;
  certificado_numero: string | null;
  certificado_emitido_at: string | null;
  status_selo: string;
}

const VALOR = 350;

function fmtDate(iso: string | null) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}
function fmtCurrency(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export default function CertificacaoPage() {
  const { user, perfil } = usePainel();
  const searchParams = useSearchParams();
  const statusParam = searchParams.get('status');

  const [perfilExt, setPerfilExt] = useState<PerfilExt | null>(null);
  const [pagamento, setPagamento] = useState<Pagamento | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  const fetchData = async () => {
    if (!user || !perfil) return;
    setLoading(true);

    const [perfilRes, pagRes] = await Promise.all([
      supabase
        .from('osc_perfis')
        .select('certificacao_liberada, certificacao_solicitada_at, certificacao_paga_at, certificado_numero, certificado_emitido_at, status_selo')
        .eq('user_id', user.id)
        .single(),
      supabase
        .from('certificacao_pagamentos')
        .select('id, status, valor, payment_url, metodo_pagamento, paid_at, created_at')
        .eq('osc_id', perfil.osc_id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]);

    if (perfilRes.data) setPerfilExt(perfilRes.data as PerfilExt);
    if (pagRes.data) setPagamento(pagRes.data as Pagamento);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [user, perfil]);

  // Se voltou do Mercado Pago com status=sucesso, recarrega dados
  useEffect(() => {
    if (statusParam === 'sucesso') {
      setTimeout(() => fetchData(), 2000);
    }
  }, [statusParam]);

  const handleSolicitarPagamento = async () => {
    if (!user) return;
    setCreating(true);
    setError('');
    try {
      const res = await fetch('/api/payment/create', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? 'Erro ao criar pagamento.'); setCreating(false); return; }
      window.location.href = data.payment_url;
    } catch {
      setError('Erro de conexão. Tente novamente.');
      setCreating(false);
    }
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
      <div className="panel-spinner" />
    </div>
  );

  const liberada = perfilExt?.certificacao_liberada;
  const seloAprovado = perfilExt?.status_selo === 'aprovado';
  const pagoPendente = pagamento?.status === 'aguardando_pagamento';
  const pagoPago = pagamento?.status === 'pago' || liberada;

  /* ── ESTADO: CERTIFICADO EMITIDO (Aprovado + Liberado) ── */
  if (liberada && seloAprovado) {
    return (
      <>
        <div style={{ marginBottom: 28 }}>
          <h1 className="panel-page-title">Certificação Selo OSC</h1>
          <p className="panel-page-subtitle">Gestão de Parcerias — OBGP</p>
        </div>
        <div className="panel-card" style={{ padding: '48px 40px', textAlign: 'center', maxWidth: 560, margin: '0 auto' }}>
          <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(38,102,47,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', border: '2px solid rgba(38,102,47,0.2)' }}>
            <Award size={40} style={{ color: '#26662F' }} />
          </div>
          <div style={{ fontSize: '0.72rem', fontWeight: 800, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--site-gold)', marginBottom: 8 }}>Certificação Ativa</div>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.6rem', fontWeight: 800, color: 'var(--site-primary)', margin: '0 0 8px' }}>Selo OSC Aprovado</h2>
          <p style={{ color: 'var(--site-text-secondary)', marginBottom: 28 }}>
            Sua organização está certificada pelo programa <strong>Selo OSC Gestão de Parcerias</strong>.
          </p>
          <div style={{ background: 'rgba(13,54,79,0.05)', borderRadius: 12, padding: '20px 24px', marginBottom: 28, textAlign: 'left' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px 24px' }}>
              {[
                { label: 'Número do Certificado', value: perfilExt?.certificado_numero ?? '—' },
                { label: 'Data de Emissão', value: fmtDate(perfilExt?.certificado_emitido_at ?? perfilExt?.certificacao_paga_at) },
                { label: 'OSC ID', value: perfil?.osc_id ?? '—' },
                { label: 'Status', value: 'Válido' },
              ].map(({ label, value }) => (
                <div key={label}>
                  <div style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--site-text-secondary)', marginBottom: 3 }}>{label}</div>
                  <div style={{ fontWeight: 600, color: 'var(--site-text-primary)', fontSize: '0.9rem', fontFamily: label === 'Número do Certificado' ? 'monospace' : undefined }}>{value}</div>
                </div>
              ))}
            </div>
          </div>
          <a href={`/verificar?codigo=${perfilExt?.certificado_numero}`} target="_blank" rel="noopener noreferrer"
            className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, textDecoration: 'none', borderRadius: 'var(--site-radius-full)', padding: '13px 28px', fontSize: '0.9rem' }}>
            <ExternalLink size={16} /> Ver Certificado Público
          </a>
        </div>
      </>
    );
  }

  /* ── ESTADO: PAGO, AGUARDANDO ANÁLISE ── */
  if (pagoPago && !seloAprovado) {
    return (
      <>
        <div style={{ marginBottom: 28 }}>
          <h1 className="panel-page-title">Certificação Selo OSC</h1>
          <p className="panel-page-subtitle">Gestão de Parcerias — OBGP</p>
        </div>
        <div className="panel-card" style={{ padding: '48px 40px', textAlign: 'center', maxWidth: 560, margin: '0 auto' }}>
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(245,158,11,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', border: '2px solid rgba(245,158,11,0.25)' }}>
            <Clock size={36} style={{ color: '#d97706' }} />
          </div>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', fontWeight: 800, color: 'var(--site-primary)', margin: '0 0 8px' }}>Pagamento Confirmado</h2>
          <p style={{ color: 'var(--site-text-secondary)', marginBottom: 28, lineHeight: 1.7 }}>
            Recebemos seu pagamento de <strong>{fmtCurrency(VALOR)}</strong>. Sua documentação está liberada para preenchimento e será analisada pela equipe OBGP.
          </p>
          <div style={{ background: 'rgba(13,54,79,0.05)', borderRadius: 12, padding: '16px 20px', marginBottom: 28, textAlign: 'left' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--site-text-secondary)', marginBottom: 10 }}>Próximos passos</div>
            {[
              { num: '1', text: 'Preencha o Relatório de Conformidade no menu lateral' },
              { num: '2', text: 'Faça upload de todos os documentos obrigatórios' },
              { num: '3', text: 'Envie para análise da equipe OBGP' },
              { num: '4', text: 'Aguarde o resultado — prazo de até 5 dias úteis' },
            ].map(({ num, text }) => (
              <div key={num} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 8 }}>
                <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'var(--site-primary)', color: '#fff', fontSize: '0.7rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>{num}</div>
                <span style={{ fontSize: '0.875rem', color: 'var(--site-text-primary)', lineHeight: 1.5 }}>{text}</span>
              </div>
            ))}
          </div>
          <a href="/painel/relatorio-conformidade"
            className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, textDecoration: 'none', borderRadius: 'var(--site-radius-full)', padding: '13px 28px', fontSize: '0.9rem' }}>
            <FileText size={16} /> Ir para Relatório de Conformidade
          </a>
        </div>
      </>
    );
  }

  /* ── ESTADO: AGUARDANDO PAGAMENTO (URL ainda válida) ── */
  if (pagoPendente && pagamento?.payment_url) {
    return (
      <>
        <div style={{ marginBottom: 28 }}>
          <h1 className="panel-page-title">Certificação Selo OSC</h1>
          <p className="panel-page-subtitle">Gestão de Parcerias — OBGP</p>
        </div>
        <div className="panel-card" style={{ padding: '40px', maxWidth: 540, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(13,54,79,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <CreditCard size={30} style={{ color: 'var(--site-primary)' }} />
          </div>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', fontWeight: 800, color: 'var(--site-primary)', margin: '0 0 10px' }}>Pagamento Pendente</h2>
          <p style={{ color: 'var(--site-text-secondary)', marginBottom: 24, lineHeight: 1.7 }}>
            Você iniciou o processo de pagamento. Conclua-o para liberar o acesso ao Relatório de Conformidade.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <a href={pagamento.payment_url} target="_blank" rel="noopener noreferrer"
              className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, textDecoration: 'none', borderRadius: 'var(--site-radius-full)', padding: '14px 28px' }}>
              <CreditCard size={16} /> Concluir Pagamento — {fmtCurrency(VALOR)}
            </a>
            <button onClick={() => fetchData()}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--site-text-secondary)', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: 5, justifyContent: 'center' }}>
              <RefreshCw size={13} /> Verificar status
            </button>
          </div>
          <p style={{ marginTop: 20, fontSize: '0.78rem', color: 'var(--site-text-tertiary)' }}>
            Solicitado em {fmtDate(pagamento.created_at)}
          </p>
        </div>
      </>
    );
  }

  /* ── ESTADO: INICIAL — solicitar certificação ── */
  return (
    <>
      <div style={{ marginBottom: 28 }}>
        <h1 className="panel-page-title">Certificação Selo OSC</h1>
        <p className="panel-page-subtitle">Gestão de Parcerias — OBGP</p>
      </div>

      {statusParam === 'falha' && (
        <div className="panel-alert panel-alert-error" style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
          <XCircle size={15} /> Pagamento não concluído. Tente novamente quando quiser.
        </div>
      )}

      {error && (
        <div className="panel-alert panel-alert-error" style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
          <AlertCircle size={15} /> {error}
        </div>
      )}

      {/* Hero da certificação */}
      <div style={{ background: 'linear-gradient(135deg, var(--site-primary) 0%, #1a4a63 100%)', borderRadius: 16, padding: '40px 36px', color: '#fff', marginBottom: 24, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -20, right: -20, width: 180, height: 180, borderRadius: '50%', background: 'rgba(197,171,118,0.08)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -40, right: 60, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 800, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--site-gold, #C5AB76)', marginBottom: 10 }}>Programa de Certificação</div>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.8rem', fontWeight: 800, margin: '0 0 10px', lineHeight: 1.2 }}>Selo OSC Gestão de Parcerias</h2>
          <p style={{ color: 'rgba(255,255,255,0.75)', lineHeight: 1.7, maxWidth: 520, marginBottom: 0, fontSize: '0.95rem' }}>
            Certificação independente que atesta a regularidade jurídica, fiscal, econômica e técnica da sua organização — fundamentada na Lei nº 13.019/2014 (MROSC).
          </p>
        </div>
      </div>

      {/* Grid: O que está incluído + Preço */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 20, alignItems: 'start' }}>

        {/* O que está incluído */}
        <div className="panel-card" style={{ padding: '28px 32px' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.1em', color: 'var(--site-primary)', marginBottom: 16 }}>O que está incluído</div>
          {[
            { icon: FileText,    title: 'Relatório de Conformidade completo', desc: '5 seções com checklist documentado — Habilitação Jurídica, Regularidade Fiscal, Qualificação Econômica e Técnica.' },
            { icon: ShieldCheck, title: 'Análise técnica pela equipe OBGP', desc: 'Revisão detalhada de todos os documentos enviados com parecer fundamentado.' },
            { icon: Award,       title: 'Certificado digital com número único', desc: 'Documento oficial com código de verificação rastreável publicamente.' },
            { icon: CheckCircle, title: 'Portal de verificação pública', desc: 'Sua certificação fica disponível para consulta por CNPJ ou código — cumprindo o Art. 11 da Lei 13.019/2014.' },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} style={{ display: 'flex', gap: 14, marginBottom: 18, paddingBottom: 18, borderBottom: '1px solid var(--site-border)' }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(13,54,79,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--site-primary)', flexShrink: 0 }}>
                <Icon size={18} />
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--site-text-primary)', marginBottom: 3 }}>{title}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--site-text-secondary)', lineHeight: 1.6 }}>{desc}</div>
              </div>
            </div>
          ))}

          <div style={{ marginTop: 4, padding: '12px 16px', background: 'rgba(13,54,79,0.04)', borderRadius: 10, border: '1px solid var(--site-border)' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--site-text-secondary)', marginBottom: 8 }}>Documentos avaliados (5 eixos)</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {['Cartão CNPJ', 'Alvará', 'Estatuto Social', 'Ata Eleição', 'CND Federal', 'CND Estadual', 'CR FGTS', 'CND Trabalhista', 'Certidão Falência', 'Balanço Social', 'Qualificação Técnica'].map(t => (
                <span key={t} style={{ fontSize: '0.72rem', padding: '3px 8px', background: 'var(--site-primary)', color: '#fff', borderRadius: 4, fontWeight: 600 }}>{t}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Card de preço + CTA */}
        <div className="panel-card" style={{ padding: '32px 28px', position: 'sticky', top: 20 }}>
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.1em', color: 'var(--site-text-secondary)', marginBottom: 8 }}>Valor da Certificação</div>
            <div style={{ fontSize: '2.8rem', fontWeight: 800, fontFamily: 'var(--font-heading)', color: 'var(--site-primary)', lineHeight: 1 }}>
              R$ 350
              <span style={{ fontSize: '1rem', fontWeight: 500, color: 'var(--site-text-secondary)'  }}>,00</span>
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--site-text-secondary)', marginTop: 6 }}>Pagamento único · Válido 12 meses</div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
            {['PIX (aprovação imediata)', 'Cartão de crédito (até 3x)', 'Boleto bancário (1–2 dias úteis)'].map(m => (
              <div key={m} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.82rem', color: 'var(--site-text-secondary)' }}>
                <CheckCircle size={14} style={{ color: '#26662F', flexShrink: 0 }} /> {m}
              </div>
            ))}
          </div>

          <button
            onClick={handleSolicitarPagamento}
            disabled={creating}
            className="btn btn-primary"
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 'var(--site-radius-full)', padding: '15px', fontSize: '0.95rem', cursor: creating ? 'wait' : 'pointer', opacity: creating ? 0.7 : 1 }}
          >
            {creating ? (
              <><div style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 1s linear infinite' }} /> Aguarde...</>
            ) : (
              <><Lock size={15} /> Solicitar Certificação</>
            )}
          </button>

          <p style={{ textAlign: 'center', marginTop: 14, fontSize: '0.72rem', color: 'var(--site-text-tertiary)', lineHeight: 1.5 }}>
            Você será redirecionado ao Mercado Pago. Após o pagamento confirmado, o acesso ao relatório é liberado automaticamente.
          </p>

          <div style={{ marginTop: 16, padding: '10px 14px', background: 'rgba(245,158,11,0.07)', borderRadius: 8, border: '1px solid rgba(245,158,11,0.2)' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 600, color: '#92400e' }}>
              ⚡ Pagamentos realizados nos dias 20/04 ou 22/04 serão processados com prioridade.
            </div>
          </div>
        </div>
      </div>

      <style>{`@keyframes spin{100%{transform:rotate(360deg)}}`}</style>
    </>
  );
}
