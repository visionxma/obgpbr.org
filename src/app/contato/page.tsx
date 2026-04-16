import PublicLayout from '../components/PublicLayout';
import { Mail, Phone, MapPin, Clock, Send } from 'lucide-react';

export const metadata = { title: 'Fale Conosco | OBGP' };

export default function ContatoPage() {
  const channels = [
    {
      icon: Mail,
      title: 'E-mail',
      info: 'contato.org.obgp@gmail.com',
      sub: 'Respondemos em até 48h úteis',
      href: 'mailto:contato.org.obgp@gmail.com',
      color: 'icon-box-blue',
    },
    {
      icon: Phone,
      title: 'Telefone / WhatsApp',
      info: '(98) 9 8710-0001',
      sub: 'Segunda a sexta, 8h às 17h',
      href: 'https://wa.me/5598987100001',
      color: 'icon-box-green',
    },
    {
      icon: MapPin,
      title: 'Endereço',
      info: 'Av. L, nº 10 D, Qd. 32, Morada do Sol',
      sub: 'Paço do Lumiar/MA — CEP 65130-000',
      href: null,
      color: 'icon-box-gold',
    },
  ];

  return (
    <PublicLayout>
      {/* ════════ HERO ════════ */}
      <section className="glass-section-blue page-hero">
        <div className="container">
          <div className="hero-badge">
            <Send size={14} />
            FALE CONOSCO
          </div>
          <h1>Entre em Contato</h1>
          <p className="hero-subtitle">
            Tem dúvidas, propostas de parceria ou quer saber mais sobre nosso trabalho? Estamos prontos para atender.
          </p>
        </div>
      </section>

      {/* ════════ CARDS DE CONTATO ════════ */}
      <section className="section-padding">
        <div className="container">
          <div className="grid-3">
            {channels.map(({ icon: Icon, title, info, sub, href, color }, i) => {
              const Tag = href ? 'a' : 'div';
              const linkProps = href ? { href, target: href.startsWith('http') ? '_blank' : undefined, rel: href.startsWith('http') ? 'noopener noreferrer' : undefined } : {};

              return (
                <Tag
                  key={title}
                  {...linkProps}
                  className={`glass-panel stagger-${i + 1}`}
                  style={{
                    padding: 36,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 20,
                    textDecoration: 'none',
                    color: 'inherit',
                    cursor: href ? 'pointer' : 'default',
                  }}
                >
                  <div className={`icon-box ${color}`}>
                    <Icon size={24} />
                  </div>
                  <div>
                    <h3 style={{ marginBottom: 8, fontSize: '1.15rem' }}>{title}</h3>
                    <p style={{ color: 'var(--site-text-primary)', fontWeight: 500, fontSize: '0.95rem', wordBreak: 'break-word' }}>
                      {info}
                    </p>
                    <p style={{ color: 'var(--site-text-tertiary)', fontSize: '0.85rem', marginTop: 6 }}>
                      {sub}
                    </p>
                  </div>
                </Tag>
              );
            })}
          </div>
        </div>
      </section>

      {/* ════════ MAPA EMBED ════════ */}
      <section style={{ padding: '0 0 96px' }}>
        <div className="container">
          <div style={{
            borderRadius: 'var(--site-radius-lg)',
            overflow: 'hidden',
            border: '1px solid var(--site-border)',
            boxShadow: 'var(--site-shadow-md)',
            height: 400,
          }}>
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15935.5!2d-44.1!3d-2.5!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x7f68fba0f58c39f%3A0x3f7c8c9e3b4e6a1a!2sPa%C3%A7o%20do%20Lumiar%2C%20MA!5e0!3m2!1spt-BR!2sbr"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Localização OBGP"
            />
          </div>
        </div>
      </section>

      {/* ════════ HORÁRIO ════════ */}
      <section className="glass-section-white" style={{ padding: '64px 0' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 16, color: 'var(--site-primary)' }}>
            <Clock size={20} />
            <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>Horário de Atendimento</span>
          </div>
          <p style={{ color: 'var(--site-text-secondary)', fontSize: '1.05rem' }}>
            Segunda a sexta-feira, das 8h às 17h (horário de Brasília)
          </p>
        </div>
      </section>
    </PublicLayout>
  );
}
