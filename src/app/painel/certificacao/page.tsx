'use client';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  ShieldCheck, CheckCircle, Clock,
  ExternalLink, FileText, Award,
  Phone, Mail, ClipboardList, Copy, Check,
} from 'lucide-react';
import QRCode from 'react-qr-code';
import { supabase } from '@/lib/supabase';
import { usePainel } from '../PainelContext';

interface PerfilExt {
  certificacao_liberada: boolean;
  certificacao_paga_at: string | null;
  certificado_numero: string | null;
  certificado_emitido_at: string | null;
  status_selo: string;
}

const VALOR = 350;
const PIX_KEY = 'contato.org.obgp@gmail.com';
const PIX_NAME = 'OBGP';
const PIX_CITY = 'Paco do Lumiar';
const WA_URL = 'https://wa.me/5598987100001?text=Ol%C3%A1%2C+realizei+o+pagamento+PIX+da+certifica%C3%A7%C3%A3o+Selo+OSC+e+gostaria+de+confirmar.';

/* ── Gerador de payload PIX estático (EMV QRCPS) ── */
function crc16(str: string): string {
  let crc = 0xffff;
  for (let i = 0; i < str.length; i++) {
    crc ^= str.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      crc = crc & 0x8000 ? ((crc << 1) ^ 0x1021) : crc << 1;
    }
  }
  return (crc & 0xffff).toString(16).toUpperCase().padStart(4, '0');
}
function f(id: string, v: string) {
  return `${id}${String(v.length).padStart(2, '0')}${v}`;
}
function buildPix(key: string, name: string, city: string, value: number): string {
  const merchant = f('00', 'BR.GOV.BCB.PIX') + f('01', key);
  const additional = f('05', '***');
  let p =
    f('00', '01') +
    f('26', merchant) +
    f('52', '0000') +
    f('53', '986') +
    f('54', value.toFixed(2)) +
    f('58', 'BR') +
    f('59', name.slice(0, 25)) +
    f('60', city.slice(0, 15)) +
    f('62', additional);
  p += f('63', crc16(p + '6304'));
  return p;
}

const PIX_PAYLOAD = buildPix(PIX_KEY, PIX_NAME, PIX_CITY, VALOR);

function fmtDate(iso: string | null) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function ContactHelp() {
  return (
    <div style={{ marginTop: 16, padding: '14px 16px', background: 'rgba(13,54,79,.04)', borderRadius: 10, border: '1px solid var(--site-border)' }}>
      <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--site-text-secondary)', marginBottom: 10 }}>Precisa de ajuda? Fale conosco</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
        <a href={WA_URL} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.8rem', color: '#15803d', fontWeight: 600, textDecoration: 'none' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="#15803d"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
          WhatsApp: (98) 9 8710-0001
        </a>
        <a href="mailto:contato.org.obgp@gmail.com" style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.8rem', color: 'var(--site-primary)', textDecoration: 'none' }}>
          <Mail size={13} /> contato.org.obgp@gmail.com
        </a>
        <a href="tel:+5598987100001" style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.8rem', color: 'var(--site-primary)', textDecoration: 'none' }}>
          <Phone size={13} /> (98) 9 8710-0001
        </a>
      </div>
    </div>
  );
}

function CertificacaoContent() {
  const { user, perfil } = usePainel();
  const searchParams = useSearchParams();
  const statusParam = searchParams.get('status');

  const [perfilExt, setPerfilExt] = useState<PerfilExt | null>(null);
  const [loading, setLoading] = useState(true);
  const [formsCompleted, setFormsCompleted] = useState(false);
  const [copied, setCopied] = useState(false);

  const fetchData = async () => {
    if (!user || !perfil) return;
    setLoading(true);
    const [perfilRes, formsRes] = await Promise.all([
      supabase
        .from('osc_perfis')
        .select('certificacao_liberada, certificacao_paga_at, certificado_numero, certificado_emitido_at, status_selo')
        .eq('user_id', user.id)
        .single(),
      supabase
        .from('osc_formularios')
        .select('tipo, status')
        .eq('osc_id', perfil.osc_id),
    ]);

    if (perfilRes.data) setPerfilExt(perfilRes.data as PerfilExt);

    const formsData = (formsRes.data ?? []) as { tipo: string; status: string }[];
    const required = ['cadastramento', 'diagnostico'];
    setFormsCompleted(required.every(t => formsData.some(f => f.tipo === t && f.status === 'concluido')));

    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [user, perfil]);

  useEffect(() => {
    if (statusParam === 'sucesso') setTimeout(() => fetchData(), 2000);
  }, [statusParam]);

  const handleCopy = () => {
    navigator.clipboard.writeText(PIX_KEY);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
      <div className="panel-spinner" />
    </div>
  );

  const seloAprovado = perfilExt?.status_selo === 'aprovado';
  const pagoPago = !!perfilExt?.certificacao_paga_at || perfilExt?.certificacao_liberada === true;

  /* ── ESTADO: CERTIFICADO EMITIDO ── */
  if (pagoPago && seloAprovado) {
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
            Recebemos a confirmação do seu pagamento. Sua documentação está liberada para preenchimento e será analisada pela equipe OBGP.
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
          <ContactHelp />
        </div>
      </>
    );
  }

  /* ── ESTADO: FORMULÁRIOS OBRIGATÓRIOS PENDENTES ── */
  if (!formsCompleted) {
    return (
      <>
        <div style={{ marginBottom: 28 }}>
          <h1 className="panel-page-title">Certificação Selo OSC</h1>
          <p className="panel-page-subtitle">Gestão de Parcerias — OBGP</p>
        </div>
        <div className="panel-card" style={{ padding: '48px 40px', textAlign: 'center', maxWidth: 540, margin: '0 auto' }}>
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(13,54,79,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <ClipboardList size={36} style={{ color: 'var(--site-primary)' }} />
          </div>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', fontWeight: 800, color: 'var(--site-primary)', margin: '0 0 10px' }}>
            Conclua os formulários primeiro
          </h2>
          <p style={{ color: 'var(--site-text-secondary)', marginBottom: 28, lineHeight: 1.7 }}>
            Para iniciar o processo de certificação, preencha e conclua os formulários obrigatórios: <strong>Cadastramento da OSC</strong> e <strong>Diagnóstico Organizacional</strong>.
          </p>
          <a href="/painel/formularios" className="btn btn-primary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, textDecoration: 'none', borderRadius: 'var(--site-radius-full)', padding: '13px 28px', fontSize: '0.9rem' }}>
            <ClipboardList size={16} /> Ir para Formulários
          </a>
          <ContactHelp />
        </div>
      </>
    );
  }

  /* ── ESTADO: PAGAMENTO PIX ── */
  return (
    <>
      <div style={{ marginBottom: 28 }}>
        <h1 className="panel-page-title">Certificação Selo OSC</h1>
        <p className="panel-page-subtitle">Gestão de Parcerias — OBGP</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20, alignItems: 'start' }}>

        {/* O que está incluído */}
        <div className="panel-card" style={{ padding: '28px 32px' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.1em', color: 'var(--site-primary)', marginBottom: 16 }}>O que está incluído</div>
          {[
            { icon: FileText,    title: 'Relatório de Conformidade completo', desc: '5 seções com checklist documentado — Habilitação Jurídica, Regularidade Fiscal, Qualificação Econômica e Técnica.' },
            { icon: ShieldCheck, title: 'Análise técnica pela equipe OBGP', desc: 'Revisão detalhada de todos os documentos com parecer fundamentado.' },
            { icon: Award,       title: 'Certificado digital com número único', desc: 'Documento oficial com código de verificação rastreável publicamente.' },
            { icon: CheckCircle, title: 'Portal de verificação pública', desc: 'Certificação disponível para consulta por CNPJ ou código — Art. 11 da Lei 13.019/2014.' },
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
        </div>

        {/* Card PIX */}
        <div className="panel-card" style={{ padding: '32px 28px', position: 'sticky', top: 20 }}>
          {/* Valor */}
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.1em', color: 'var(--site-text-secondary)', marginBottom: 8 }}>Valor da Certificação</div>
            <div style={{ fontSize: '2.8rem', fontWeight: 800, fontFamily: 'var(--font-heading)', color: 'var(--site-primary)', lineHeight: 1 }}>
              R$ 350<span style={{ fontSize: '1rem', fontWeight: 500, color: 'var(--site-text-secondary)' }}>,00</span>
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--site-text-secondary)', marginTop: 6 }}>Pagamento único · Válido 12 meses</div>
          </div>

          {/* QR Code PIX */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, padding: '20px 0', borderTop: '1px solid var(--site-border)', borderBottom: '1px solid var(--site-border)', marginBottom: 16 }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.1em', color: 'var(--site-primary)' }}>PIX — Escaneie o QR Code</div>
            <div style={{ padding: 12, background: '#fff', borderRadius: 12, border: '2px solid rgba(13,54,79,.12)', boxShadow: '0 2px 12px rgba(0,0,0,.08)' }}>
              <QRCode value={PIX_PAYLOAD} size={180} />
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--site-text-secondary)', textAlign: 'center', lineHeight: 1.5 }}>
              Abra seu aplicativo bancário, escolha <strong>PIX → QR Code</strong> e escaneie.
            </div>
          </div>

          {/* Chave PIX copiável */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--site-text-secondary)', marginBottom: 6 }}>Ou copie a chave PIX</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: 'rgba(13,54,79,.04)', borderRadius: 8, border: '1px solid var(--site-border)' }}>
              <span style={{ flex: 1, fontSize: '0.85rem', fontWeight: 600, color: 'var(--site-text-primary)', wordBreak: 'break-all' }}>{PIX_KEY}</span>
              <button
                onClick={handleCopy}
                title="Copiar chave"
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: copied ? '#15803d' : 'var(--site-primary)', display: 'flex', padding: 4, transition: 'color .2s', flexShrink: 0 }}
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
              </button>
            </div>
            {copied && <p style={{ fontSize: '0.72rem', color: '#15803d', marginTop: 4, fontWeight: 600 }}>✓ Chave copiada!</p>}
          </div>

          {/* Instrução pós-pagamento */}
          <div style={{ padding: '12px 14px', background: 'rgba(21,128,61,.07)', borderRadius: 8, border: '1px solid rgba(21,128,61,.2)', marginBottom: 4 }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#15803d', lineHeight: 1.5 }}>
              Após realizar o pagamento, envie o comprovante pelo WhatsApp para que nossa equipe libere seu acesso rapidamente.
            </div>
          </div>

          <ContactHelp />
        </div>
      </div>

      <style>{`@keyframes spin{100%{transform:rotate(360deg)}}`}</style>
    </>
  );
}

export default function CertificacaoPage() {
  return (
    <Suspense fallback={<div />}>
      <CertificacaoContent />
    </Suspense>
  );
}
