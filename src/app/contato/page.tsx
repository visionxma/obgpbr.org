import PublicLayout from '../components/PublicLayout';
import { Mail, Phone, MapPin, Clock, Send, ArrowUpRight } from 'lucide-react';

export const metadata = { title: 'Fale Conosco | OBGP' };

export default function ContatoPage() {
  const channels = [
    {
      icon: Mail, title: 'E-mail', info: 'contato.org.obgp@gmail.com',
      sub: 'Respondemos em até 48h úteis',
      href: 'mailto:contato.org.obgp@gmail.com', color: 'icon-box-blue',
    },
    {
      icon: Phone, title: 'WhatsApp', info: '(98) 9 8710-0001',
      sub: 'Segunda a sexta, 8h–17h',
      href: 'https://wa.me/5598987100001', color: 'icon-box-green',
    },
    {
      icon: MapPin, title: 'Sede', info: 'Av. L, nº 10 D, Qd. 32',
      sub: 'Morada do Sol — Paço do Lumiar/MA',
      href: null, color: 'icon-box-gold',
    },
  ];

  return (
    <PublicLayout>
      {/* ═══ HERO ═══ */}
      <section className="glass-section-blue page-hero">
        <div className="container">
          <div className="hero-badge"><Send size={13} /> CONTATO</div>
          <h1 style={{ maxWidth: 580, margin: '0 auto 20px' }}>
            Vamos{' '}
            <span className="hero-accent-white">conversar?</span>
          </h1>
          <p className="hero-subtitle">
            Propostas de parceria, dúvidas ou qualquer assunto — estamos prontos para ouvir e atender.
          </p>
          <div className="hero-divider" />
        </div>
      </section>

      {/* ═══ CARDS ═══ */}
      <section className="section-padding">
        <div className="container">
          <div className="grid-3">
            {channels.map(({ icon: Icon, title, info, sub, href, color }, i) => {
              const Tag = href ? 'a' : 'div';
              const extra = href ? {
                href,
                target: href.startsWith('http') ? '_blank' as const : undefined,
                rel: href.startsWith('http') ? 'noopener noreferrer' : undefined,
              } : {};
              return (
                <Tag key={title} {...extra}
                  className={`glass-panel stagger-${i + 1}`}
                  style={{
                    padding: '40px 32px', display: 'flex', flexDirection: 'column', gap: 24,
                    textDecoration: 'none', color: 'inherit', cursor: href ? 'pointer' : 'default',
                    position: 'relative', overflow: 'hidden',
                  }}>
                  {href && (
                    <ArrowUpRight size={18} style={{
                      position: 'absolute', top: 20, right: 20,
                      color: 'var(--site-text-tertiary)', opacity: 0.4,
                    }} />
                  )}
                  <div className={`icon-box ${color}`}>
                    <Icon size={22} />
                  </div>
                  <div>
                    <h3 style={{ marginBottom: 8, fontSize: '1.15rem' }}>{title}</h3>
                    <p style={{ color: 'var(--site-text-primary)', fontWeight: 600, fontSize: '.95rem', wordBreak: 'break-word', marginBottom: 6 }}>
                      {info}
                    </p>
                    <p style={{ color: 'var(--site-text-tertiary)', fontSize: '.85rem' }}>{sub}</p>
                  </div>
                </Tag>
              );
            })}
          </div>

          {/* Horário */}
          <div className="stagger-4" style={{
            marginTop: 48, padding: '32px 36px', borderRadius: 'var(--site-radius-lg)',
            background: 'var(--site-surface-warm)', border: '1px solid var(--site-border)',
            display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap',
          }}>
            <div className="icon-box icon-box-gold">
              <Clock size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '1rem', marginBottom: 4 }}>Horário de Atendimento</h3>
              <p style={{ color: 'var(--site-text-secondary)', fontSize: '.95rem' }}>
                Segunda a sexta-feira, das <strong>8h às 17h</strong> (horário de Brasília)
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ MAPA ═══ */}
      <section style={{ paddingBottom: 96 }}>
        <div className="container">
          <div className="section-header">
            <span className="section-label">Localização</span>
            <h2>Onde{' '}<span className="font-cursive" style={{ color: 'var(--site-gold-dark)' }}>estamos</span></h2>
            <div className="section-line" />
          </div>
          <div style={{
            borderRadius: 'var(--site-radius-xl)', overflow: 'hidden',
            border: '1px solid var(--site-border)', boxShadow: 'var(--site-shadow-lg)', height: 420,
          }}>
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15935.5!2d-44.1!3d-2.5!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x7f68fba0f58c39f%3A0x3f7c8c9e3b4e6a1a!2sPa%C3%A7o%20do%20Lumiar%2C%20MA!5e0!3m2!1spt-BR!2sbr"
              width="100%" height="100%" style={{ border: 0 }}
              allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade"
              title="Localização OBGP"
            />
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
