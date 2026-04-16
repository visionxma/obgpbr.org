import PublicLayout from '../components/PublicLayout';
import { Users, Target, Heart, ArrowRight, Building2, ShieldCheck, Handshake, BookOpen, Stethoscope, HeartHandshake } from 'lucide-react';

export const metadata = { title: 'Quem Somos | OBGP' };

export default function QuemSomosPage() {
  return (
    <PublicLayout>
      {/* ═══════ HERO ═══════ */}
      <section className="glass-section-blue page-hero" style={{ padding: '170px 0 110px' }}>
        <div className="container">
          <div className="hero-badge">
            <Building2 size={13} />
            ORGANIZAÇÃO DA SOCIEDADE CIVIL
          </div>
          <h1 style={{ maxWidth: 720, margin: '0 auto 24px' }}>
            Gestão de Parcerias com{' '}
            <span className="hero-accent-white">transparência</span>{' '}
            e{' '}
            <span className="hero-accent-white">impacto social</span>
          </h1>
          <p className="hero-subtitle">
            A OBGP é uma OSC sem fins lucrativos que executa atividades, programas e projetos voltados à educação, saúde e assistência social.
          </p>
          <div className="hero-divider" />
        </div>
      </section>

      {/* ═══════ SOBRE — Layout split ═══════ */}
      <section className="section-padding">
        <div className="container">
          <div className="row-alternate">
            {/* Texto */}
            <div>
              <span className="section-header" style={{ textAlign: 'left', marginBottom: 0 }}>
                <span className="section-label">Sobre a OBGP</span>
              </span>
              <h2 style={{ marginBottom: 24, lineHeight: 1.25 }}>
                Compromisso com o{' '}
                <span className="font-cursive" style={{ color: 'var(--site-gold-dark)' }}>
                  desenvolvimento
                </span>{' '}
                das comunidades
              </h2>
              <p style={{ fontSize: '1.05rem', lineHeight: 1.85, color: 'var(--site-text-secondary)', marginBottom: 20 }}>
                A <strong style={{ color: 'var(--site-text-primary)' }}>Organização Brasil Gestão de Parcerias – OBGP</strong> é uma Organização da Sociedade Civil, pessoa jurídica de direito privado, associação privada e sem fins lucrativos.
              </p>
              <p style={{ fontSize: '1.05rem', lineHeight: 1.85, color: 'var(--site-text-secondary)', marginBottom: 32 }}>
                Executa atividades, programas, projetos ou ações voltadas a serviços de <strong style={{ color: 'var(--site-text-primary)' }}>educação, saúde e assistência social</strong>, buscando fortalecer políticas públicas e promover impacto real.
              </p>
              <a href="/servicos" className="btn btn-primary">
                Conheça nossos serviços <ArrowRight size={17} />
              </a>
            </div>

            {/* Visual — Stat Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {[
                { icon: HeartHandshake, label: 'Assistência Social', color: '#26662F', bg: 'var(--site-surface-green)' },
                { icon: BookOpen, label: 'Educação', color: 'var(--site-primary)', bg: 'var(--site-surface-blue)' },
                { icon: Stethoscope, label: 'Saúde', color: 'var(--site-gold-dark)', bg: 'var(--site-surface-gold)' },
                { icon: ShieldCheck, label: 'Transparência', color: 'var(--site-primary)', bg: 'var(--site-surface-blue)' },
              ].map(({ icon: Icon, label, color, bg }, i) => (
                <div key={label} className={`stagger-${i + 1}`}
                  style={{
                    padding: '28px 20px', borderRadius: 'var(--site-radius-lg)',
                    background: bg, display: 'flex', flexDirection: 'column',
                    gap: 14, transition: 'transform .3s ease',
                  }}>
                  <Icon size={28} style={{ color }} />
                  <span style={{ fontWeight: 600, fontSize: '.95rem', color: 'var(--site-text-primary)' }}>{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════ IMPACTO — Números ═══════ */}
      <section className="glass-section-blue" style={{ padding: '80px 0' }}>
        <div className="container">
          <div className="grid-4" style={{ textAlign: 'center' }}>
            {[
              { num: '3', label: 'Áreas de atuação' },
              { num: '8', label: 'Serviços especializados' },
              { num: '100%', label: 'Transparência pública' },
              { num: 'OSC', label: 'Selo de conformidade' },
            ].map((s, i) => (
              <div key={i} className={`stagger-${i + 1}`} style={{ padding: '20px 8px' }}>
                <div style={{
                  fontFamily: 'var(--font-heading)', fontSize: 'clamp(2.5rem,5vw,3.5rem)',
                  fontWeight: 900, color: 'white', lineHeight: 1, letterSpacing: '-0.03em',
                }}>
                  {s.num}
                </div>
                <div style={{ fontSize: '.88rem', color: 'rgba(255,255,255,0.55)', marginTop: 8, fontWeight: 500 }}>
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ PILARES ═══════ */}
      <section className="section-padding">
        <div className="container">
          <div className="section-header">
            <span className="section-label">Nossos Pilares</span>
            <h2>
              Guiados por{' '}
              <span className="font-cursive" style={{ color: 'var(--site-gold-dark)' }}>valores</span>{' '}
              que transformam
            </h2>
            <p>Os princípios que orientam cada decisão e parceria da OBGP.</p>
            <div className="section-line" />
          </div>

          <div className="grid-3">
            {[
              {
                icon: Target, title: 'Missão', color: 'icon-box-blue',
                text: 'Executar programas e projetos voltados à educação, saúde e assistência social, fortalecendo políticas públicas e promovendo desenvolvimento comunitário.',
              },
              {
                icon: Heart, title: 'Valores', color: 'icon-box-green',
                text: 'Transparência, compromisso social, eficiência na gestão de recursos públicos e respeito aos princípios da legalidade e participação cidadã.',
              },
              {
                icon: Users, title: 'Visão', color: 'icon-box-gold',
                text: 'Ser referência em gestão de parcerias entre organizações da sociedade civil e o poder público, promovendo inclusão e impacto social mensurável.',
              },
            ].map(({ icon: Icon, title, text, color }, i) => (
              <div key={title} className={`glass-panel stagger-${i + 1}`}
                style={{ padding: '36px 32px', display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div className={`icon-box ${color}`}>
                  <Icon size={24} />
                </div>
                <div>
                  <h3 style={{ marginBottom: 10 }}>{title}</h3>
                  <p style={{ color: 'var(--site-text-secondary)', fontSize: '.95rem', lineHeight: 1.75 }}>{text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ CTA FINAL ═══════ */}
      <section className="glass-section-blue" style={{ padding: '88px 0', textAlign: 'center' }}>
        <div className="container">
          <h2 style={{ color: 'white', marginBottom: 16, maxWidth: 560, margin: '0 auto 16px' }}>
            Pronto para{' '}
            <span className="hero-accent-white">fortalecer</span>{' '}
            sua organização?
          </h2>
          <p style={{ color: 'rgba(255,255,255,.65)', maxWidth: 500, margin: '0 auto 36px', lineHeight: 1.7, fontSize: '1.05rem' }}>
            Conheça os serviços que oferecemos para qualificar a gestão de parcerias da sua OSC.
          </p>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="/servicos" className="btn btn-white">
              Ver serviços <ArrowRight size={17} />
            </a>
            <a href="/contato" className="btn btn-outline-light">
              Fale conosco
            </a>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
