'use client';
import { useState, useEffect } from 'react';
import { 
  Target, 
  Calendar, 
  Clock, 
  Video, 
  FileText, 
  Award, 
  Users, 
  Building2, 
  CheckCircle2, 
  ShieldCheck,
  ChevronRight,
  ArrowRight,
  Loader2
} from 'lucide-react';
import PublicLayout from '../components/PublicLayout';

const TIERS = [
  {
    id: 'entidade-ind',
    category: 'Para Entidades (OSC)',
    title: 'Individual',
    price: 300,
    desc: 'Participação para 1 representante da organização.',
    features: ['Nota Fiscal inclusa', 'Acesso às gravações', 'Materiais por 90 dias', 'Certificado'],
    cta: 'Inscrever-se (R$ 300)'
  },
  {
    id: 'entidade-col',
    category: 'Para Entidades (OSC)',
    title: 'Coletivo (Até 4)',
    price: 600,
    desc: 'Participação para até 4 representantes da mesma organização.',
    features: ['Nota Fiscal inclusa', '6x sem juros no cartão', 'Acesso às gravações', 'Certificados individuais'],
    popular: true,
    cta: 'Inscrever Coletivo (R$ 600)'
  },
  {
    id: 'prefeitura-ind',
    category: 'Para Prefeituras',
    title: 'Individual',
    price: 600,
    desc: 'Participação para 1 representante do Poder Público.',
    features: ['Aceitamos Nota de Empenho', 'Acesso às gravações', 'Consultoria técnica básica', 'Certificado'],
    cta: 'Inscrever-se (R$ 600)'
  },
  {
    id: 'prefeitura-col',
    category: 'Para Prefeituras',
    title: 'Coletivo (Até 4)',
    price: 1200,
    desc: 'Participação para até 4 representantes da prefeitura.',
    features: ['Aceitamos Nota de Empenho', '6x sem juros no cartão', 'Acesso às gravações', 'Certificados individuais'],
    cta: 'Inscrever Coletivo (R$ 1.200)'
  }
];

export default function OficinaMroscPage() {
  const [loading, setLoading] = useState<string | null>(null);

  const handlePayment = async (tier: typeof TIERS[number]) => {
    setLoading(tier.id);
    try {
      const res = await fetch('/api/payment/create', {
        method: 'POST',
        body: JSON.stringify({
          type: 'oficina',
          customAmount: tier.price,
          customTitle: `Oficina MROSC: ${tier.title} (${tier.category})`,
          customDescription: tier.desc
        })
      });
      const data = await res.json();
      if (data.payment_url) {
        window.location.href = data.payment_url;
      } else {
        alert('Erro ao processar inscrição: ' + (data.error || 'Tente novamente.'));
      }
    } catch (err) {
      alert('Erro de conexão.');
    } finally {
      setLoading(null);
    }
  };

  return (
    <PublicLayout>
      <div style={{ background: '#fff', color: 'var(--site-primary)' }}>
        
        {/* HERO SECTION */}
        <section style={{ 
          background: 'linear-gradient(135deg, #0d364f 0%, #082130 100%)', 
          color: '#fff', 
          padding: 'clamp(80px, 12vw, 140px) 0 clamp(60px, 10vw, 100px)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{ position: 'absolute', top: 0, right: 0, width: '40%', height: '100%', background: 'radial-gradient(circle at center, rgba(197,171,118,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />
          
          <div className="container" style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ maxWidth: 800 }}>
              <div style={{ 
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: 8, 
                padding: '6px 16px', 
                background: 'rgba(197,171,118,0.1)', 
                border: '1px solid rgba(197,171,118,0.3)', 
                borderRadius: 40, 
                color: 'var(--site-gold)',
                fontSize: '0.85rem',
                fontWeight: 700,
                marginBottom: 24,
                textTransform: 'uppercase',
                letterSpacing: '.1em'
              }}>
                <Target size={14} /> Oficina ao Vivo
              </div>
              <h1 style={{ 
                fontSize: 'clamp(2.2rem, 6vw, 4.2rem)', 
                fontWeight: 900, 
                lineHeight: 1.1, 
                marginBottom: 24,
                letterSpacing: '-0.03em'
              }}>
                Domine o Marco das OSC <br />
                <span style={{ color: 'var(--site-gold)' }}>Lei 13.019/2014</span>
              </h1>
              <p style={{ 
                fontSize: 'clamp(1.1rem, 2vw, 1.4rem)', 
                color: 'rgba(255,255,255,0.7)', 
                lineHeight: 1.6,
                marginBottom: 40,
                maxWidth: 600
              }}>
                Aprenda na prática todas as etapas das parcerias entre o Poder Público e o Terceiro Setor com especialistas em gestão.
              </p>
              
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20 }}>
                <a href="#inscricao" className="btn btn-gold" style={{ padding: '16px 32px', fontSize: '1.1rem' }}>
                  Garantir minha vaga <ChevronRight size={18} />
                </a>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: 'rgba(255,255,255,0.8)', fontSize: '0.95rem' }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 12px #22c55e' }} />
                  Inscrições Abertas
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* DETAILS GRID */}
        <section style={{ padding: '80px 0', background: 'var(--site-bg)' }}>
          <div className="container">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 32 }}>
              {[
                { icon: Calendar, title: 'Dia 27 de Abril', desc: 'Sessão ao vivo pelo Zoom/Meet com interação total.' },
                { icon: Clock, title: 'Intensivo + Gravado', desc: 'Mais 3 horas de vídeo aulas bônus de introdução.' },
                { icon: Video, title: 'Acesso por 90 Dias', desc: 'Reveja as gravações e acesse os materiais quando quiser.' },
                { icon: FileText, title: 'Materiais Exclusivos', desc: 'Slides, modelos de documentos e certificados inclusos.' }
              ].map(({ icon: Icon, title, desc }) => (
                <div key={title} style={{ padding: 32, background: '#fff', borderRadius: 24, border: '1px solid var(--site-border)', transition: 'transform .3s ease' }}>
                  <div style={{ width: 52, height: 52, background: 'rgba(13,54,79,0.06)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--site-primary)', marginBottom: 20 }}>
                    <Icon size={24} />
                  </div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: 12 }}>{title}</h3>
                  <p style={{ color: 'var(--site-text-secondary)', lineHeight: 1.6, fontSize: '0.95rem' }}>{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CONTENT TOPICS */}
        <section style={{ padding: '100px 0' }}>
          <div className="container">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 60, alignItems: 'center' }}>
              <div>
                <h2 style={{ fontSize: '2.4rem', fontWeight: 900, marginBottom: 24, letterSpacing: '-0.02em' }}>O que você vai dominar</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  {[
                    'Elaboração estratégica do plano de trabalho',
                    'Procedimentos para recebimento de recursos',
                    'Execução de projetos em conformidade com o MROSC',
                    'Prestação de contas sem traumas e com segurança',
                    'Novas regras e jurisprudência atualizada',
                    'Gestão de parcerias para Prefeituras e OSCs'
                  ].map(topic => (
                    <div key={topic} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                      <div style={{ width: 22, height: 22, background: 'rgba(34,197,94,0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#16a34a', flexShrink: 0, marginTop: 2 }}>
                        <CheckCircle2 size={14} />
                      </div>
                      <span style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--site-text-primary)' }}>{topic}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ position: 'relative' }}>
                <div style={{ 
                  background: 'linear-gradient(135deg, #f8f1e3 0%, #ffffff 100%)', 
                  padding: 40, 
                  borderRadius: 32, 
                  border: '1px solid var(--site-gold-light)',
                  boxShadow: '0 30px 60px rgba(0,0,0,0.05)'
                }}>
                   <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
                      <Building2 size={32} style={{ color: 'var(--site-gold)' }} />
                      <Users size={32} style={{ color: 'var(--site-primary)' }} />
                   </div>
                   <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: 16 }}>Formação Completa</h3>
                   <p style={{ lineHeight: 1.8, color: 'var(--site-text-secondary)', marginBottom: 24 }}>
                     Nossa oficina foi desenhada para sanar as dúvidas reais de quem está na ponta. Unimos a teoria da Lei 13.019 com a prática da gestão diária.
                   </p>
                   <div style={{ padding: '16px 20px', background: 'var(--site-primary)', borderRadius: 16, color: '#fff' }}>
                     <div style={{ fontSize: '0.8rem', opacity: 0.7, textTransform: 'uppercase', marginBottom: 4 }}>Facilitadora</div>
                     <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>Especialista OBGP</div>
                   </div>
                </div>
                <div style={{ position: 'absolute', bottom: -20, right: -20, background: 'var(--site-gold)', color: '#fff', padding: '20px 32px', borderRadius: 20, boxShadow: '0 15px 30px rgba(197,171,118,0.3)', fontWeight: 800 }}>
                  100% On-line
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* PRICING TIERS */}
        <section id="inscricao" style={{ padding: '100px 0', background: 'var(--site-bg)' }}>
          <div className="container">
            <div style={{ textAlign: 'center', maxWidth: 700, margin: '0 auto 60px' }}>
              <h2 style={{ fontSize: '2.8rem', fontWeight: 900, marginBottom: 20 }}>Escolha seu plano</h2>
              <p style={{ fontSize: '1.1rem', color: 'var(--site-text-secondary)' }}>Valores diferenciados para OSCs e Gestão Pública com todas as facilidades de pagamento.</p>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
              {TIERS.map((tier) => (
                <div key={tier.id} style={{ 
                  background: '#fff', 
                  borderRadius: 28, 
                  padding: 32, 
                  border: tier.popular ? '2px solid var(--site-gold)' : '1px solid var(--site-border)',
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  boxShadow: tier.popular ? '0 20px 50px rgba(197,171,118,0.15)' : 'none'
                }}>
                  {tier.popular && (
                    <div style={{ 
                      position: 'absolute', 
                      top: -14, 
                      left: '50%', 
                      transform: 'translateX(-50%)', 
                      background: 'var(--site-gold)', 
                      color: '#fff', 
                      padding: '4px 16px', 
                      borderRadius: 20, 
                      fontSize: '0.75rem', 
                      fontWeight: 800,
                      textTransform: 'uppercase'
                    }}>
                      Mais Procurado
                    </div>
                  )}
                  
                  <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--site-text-secondary)', textTransform: 'uppercase', marginBottom: 8 }}>{tier.category}</div>
                  <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: 20 }}>{tier.title}</h3>
                  
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 20 }}>
                    <span style={{ fontSize: '1.2rem', fontWeight: 600 }}>R$</span>
                    <span style={{ fontSize: '2.8rem', fontWeight: 900, letterSpacing: '-0.02em' }}>{tier.price}</span>
                    <span style={{ fontSize: '1rem', color: 'var(--site-text-secondary)' }}>,00</span>
                  </div>
                  
                  <p style={{ fontSize: '0.9rem', color: 'var(--site-text-secondary)', lineHeight: 1.5, marginBottom: 28, flexGrow: 1 }}>{tier.desc}</p>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 32 }}>
                    {tier.features.map(f => (
                      <div key={f} style={{ display: 'flex', gap: 10, fontSize: '0.85rem', color: 'var(--site-text-primary)', fontWeight: 500 }}>
                        <CheckCircle2 size={16} style={{ color: 'var(--site-gold)', flexShrink: 0 }} />
                        {f}
                      </div>
                    ))}
                  </div>
                  
                  <button 
                    onClick={() => handlePayment(tier)}
                    disabled={!!loading}
                    className={`btn ${tier.popular ? 'btn-gold' : 'btn-primary'}`} 
                    style={{ width: '100%', padding: '14px', borderRadius: 16, height: 56 }}
                  >
                    {loading === tier.id ? <Loader2 className="spin-anim" /> : tier.cta}
                  </button>
                </div>
              ))}
            </div>
            
            <div style={{ marginTop: 60, textAlign: 'center', padding: '24px', background: 'rgba(13,54,79,0.03)', borderRadius: 24, border: '1px solid var(--site-border)' }}>
               <div style={{ display: 'flex', justifyContent: 'center', gap: 32, flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.9rem', fontWeight: 600 }}>
                    <ShieldCheck size={20} style={{ color: '#16a34a' }} /> Pagamento 100% Seguro
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.9rem', fontWeight: 600 }}>
                    <CheckCircle2 size={20} style={{ color: '#16a34a' }} /> Certificado ICP-Brasil
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.9rem', fontWeight: 600 }}>
                    <Users size={20} style={{ color: 'var(--site-primary)' }} /> +200 Participantes
                  </div>
               </div>
            </div>
          </div>
        </section>

        {/* CTA FINAL */}
        <section style={{ padding: '100px 0', textAlign: 'center' }}>
          <div className="container">
            <h2 style={{ fontSize: '2.4rem', fontWeight: 900, marginBottom: 24 }}>Dúvidas sobre o conteúdo?</h2>
            <p style={{ fontSize: '1.1rem', color: 'var(--site-text-secondary)', marginBottom: 40 }}>Fale diretamente com nossa equipe técnica via WhatsApp.</p>
            <a href="https://wa.me/5598987100001" target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{ padding: '16px 40px', background: '#25D366', border: 'none', borderRadius: 50 }}>
              Falar no WhatsApp <ArrowRight size={18} />
            </a>
          </div>
        </section>

      </div>
    </PublicLayout>
  );
}
