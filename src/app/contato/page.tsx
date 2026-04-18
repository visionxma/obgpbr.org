import PublicLayout from '../components/PublicLayout';
import {
  Mail, Phone, MapPin, Clock, MessageSquare, Globe, ArrowRight,
} from 'lucide-react';

export const metadata = { title: 'Fale Conosco | OBGP' };

const CANAIS = [
  {
    icon: Globe,
    titulo: 'Website',
    info: 'www.obgpbr.org',
    sub: 'Portal institucional e transparência',
    href: 'https://www.obgpbr.org',
    color: 'icon-box-blue',
  },
  {
    icon: Mail,
    titulo: 'E-mail',
    info: 'contato.org.obgp@gmail.com',
    sub: 'Respondemos em até 48h úteis',
    href: 'mailto:contato.org.obgp@gmail.com',
    color: 'icon-box-green',
  },
  {
    icon: Phone,
    titulo: 'WhatsApp',
    info: '(98) 9 8710-0001',
    sub: 'Segunda a sexta, 8h–17h (Brasília)',
    href: 'https://wa.me/5598987100001',
    color: 'icon-box-gold',
  },
];

export default function ContatoPage() {
  return (
    <PublicLayout>
      {/* ═══ HERO ═══ */}
      <section className="glass-section-blue page-hero">
        <div className="container">
          <div className="hero-badge"><MessageSquare size={13} /> FALE CONOSCO</div>
          <h1 style={{ maxWidth: 640, margin: '0 auto 20px' }}>
            Entre em{' '}
            <span className="hero-accent-white">contato</span>
          </h1>
          <p className="hero-subtitle">
            Estamos disponíveis para tirar dúvidas, apresentar nossos serviços e apoiar a sua organização.
          </p>
          <div className="hero-divider" />
        </div>
      </section>

      {/* ═══ CANAIS DE CONTATO ═══ */}
      <section className="section-padding">
        <div className="container">
          <div className="section-header">
            <span className="section-label">Canais</span>
            <h2>Como nos <span className="font-cursive" style={{ color: 'var(--site-gold-dark)' }}>encontrar</span></h2>
            <p>Escolha o canal mais conveniente para você.</p>
            <div className="section-line" />
          </div>

          <div className="grid-3">
            {CANAIS.map(({ icon: Icon, titulo, info, sub, href, color }, i) => (
              <div
                key={titulo}
                className={`glass-panel stagger-${i + 1}`}
                style={{ padding: '36px 30px', display: 'flex', flexDirection: 'column', gap: 20, alignItems: 'flex-start' }}
              >
                <div className={`icon-box ${color}`}>
                  <Icon size={22} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.05rem', marginBottom: 6 }}>{titulo}</h3>
                  <p style={{
                    fontWeight: 600,
                    fontSize: 'var(--text-base)',
                    color: 'var(--site-text-primary)',
                    marginBottom: 6,
                    wordBreak: 'break-all',
                  }}>
                    {info}
                  </p>
                  <p style={{ fontSize: 'var(--text-sm)', color: 'var(--site-text-tertiary)', lineHeight: 1.5 }}>
                    {sub}
                  </p>
                </div>
                {href && (
                  <a
                    href={href}
                    target={href.startsWith('http') ? '_blank' : undefined}
                    rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
                    className="btn btn-outline"
                    style={{ marginTop: 'auto', fontSize: 'var(--text-sm)', display: 'inline-flex', alignItems: 'center', gap: 8 }}
                  >
                    Acessar <ArrowRight size={14} />
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ ENDEREÇO ═══ */}
      <section className="glass-section-white section-padding">
        <div className="container" style={{ maxWidth: 860 }}>
          <div className="row-alternate" style={{ alignItems: 'center' }}>
            {/* Info */}
            <div>
              <span className="section-label" style={{ display: 'block', marginBottom: 12 }}>Localização</span>
              <h2 style={{ marginBottom: 24 }}>
                Nossa <span className="font-cursive" style={{ color: 'var(--site-gold-dark)' }}>sede</span>
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <InfoRow icon={MapPin} label="Endereço">
                  Avenida L, Nº 10 D, Quadra 32<br />
                  Bairro Morada do Sol<br />
                  Paço do Lumiar/MA — CEP 65130-000
                </InfoRow>
                <InfoRow icon={Clock} label="Horário de atendimento">
                  Segunda a sexta-feira<br />
                  08h às 17h (horário de Brasília)
                </InfoRow>
                <InfoRow icon={Mail} label="E-mail institucional">
                  <a href="mailto:contato.org.obgp@gmail.com" style={{ color: 'var(--site-primary)', fontWeight: 500 }}>
                    contato.org.obgp@gmail.com
                  </a>
                </InfoRow>
              </div>
            </div>

            {/* Visual */}
            <div className="glass-panel" style={{ padding: '40px 36px', background: 'var(--site-surface-blue)' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div className="icon-box icon-box-blue"><MapPin size={20} /></div>
                  <div>
                    <p style={{ fontSize: 'var(--text-xs)', color: 'var(--site-text-tertiary)', marginBottom: 2, textTransform: 'uppercase', letterSpacing: 'var(--tracking-wide)', fontWeight: 700 }}>
                      Município
                    </p>
                    <p style={{ fontWeight: 600, color: 'var(--site-text-primary)' }}>Paço do Lumiar — MA</p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div className="icon-box icon-box-green"><Clock size={20} /></div>
                  <div>
                    <p style={{ fontSize: 'var(--text-xs)', color: 'var(--site-text-tertiary)', marginBottom: 2, textTransform: 'uppercase', letterSpacing: 'var(--tracking-wide)', fontWeight: 700 }}>
                      Atendimento
                    </p>
                    <p style={{ fontWeight: 600, color: 'var(--site-text-primary)' }}>Seg–Sex · 08h às 17h</p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div className="icon-box icon-box-gold"><Phone size={20} /></div>
                  <div>
                    <p style={{ fontSize: 'var(--text-xs)', color: 'var(--site-text-tertiary)', marginBottom: 2, textTransform: 'uppercase', letterSpacing: 'var(--tracking-wide)', fontWeight: 700 }}>
                      WhatsApp
                    </p>
                    <a href="https://wa.me/5598987100001" style={{ fontWeight: 600, color: 'var(--site-primary)' }}>
                      (98) 9 8710-0001
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section className="glass-section-blue" style={{ padding: '80px 0', textAlign: 'center' }}>
        <div className="container">
          <h2 style={{ color: 'white', marginBottom: 16 }}>
            Pronto para <span className="hero-accent-white">começar</span>?
          </h2>
          <p style={{ color: 'rgba(255,255,255,.65)', maxWidth: 480, margin: '0 auto 32px', lineHeight: 1.7 }}>
            Conheça nossos serviços e saiba como a OBGP pode apoiar a gestão de parcerias da sua organização.
          </p>
          <a href="/servicos" className="btn btn-white">
            Ver nossos serviços <ArrowRight size={17} />
          </a>
        </div>
      </section>
    </PublicLayout>
  );
}

function InfoRow({
  icon: Icon, label, children,
}: {
  icon: React.ComponentType<{ size?: number }>;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
      <div style={{
        width: 40, height: 40, borderRadius: 'var(--site-radius-md)',
        background: 'var(--site-surface-blue)', display: 'flex',
        alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2,
      }}>
        <Icon size={18} />
      </div>
      <div>
        <p style={{
          fontSize: 'var(--text-xs)', fontWeight: 700, textTransform: 'uppercase',
          letterSpacing: 'var(--tracking-wide)', color: 'var(--site-text-tertiary)',
          marginBottom: 4,
        }}>
          {label}
        </p>
        <p style={{ fontSize: 'var(--text-base)', color: 'var(--site-text-secondary)', lineHeight: 1.6 }}>
          {children}
        </p>
      </div>
    </div>
  );
}
