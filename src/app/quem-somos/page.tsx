import PublicLayout from '../components/PublicLayout';
import { Users, Target, Heart, ArrowRight, Building2, Scale, BookOpen } from 'lucide-react';

export const metadata = { title: 'Quem Somos | OBGP' };

export default function QuemSomosPage() {
  return (
    <PublicLayout>
      {/* ════════ HERO ════════ */}
      <section className="glass-section-blue page-hero">
        <div className="container">
          <div className="hero-badge">
            <Building2 size={14} />
            ORGANIZAÇÃO DA SOCIEDADE CIVIL
          </div>
          <h1>Organização Brasil<br />Gestão de Parcerias</h1>
          <p className="hero-subtitle">
            Uma OSC sem fins lucrativos, pessoa jurídica de direito privado, que executa atividades, programas e projetos voltados à educação, saúde e assistência social.
          </p>
        </div>
      </section>

      {/* ════════ SOBRE ════════ */}
      <section className="section-padding">
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 64, alignItems: 'center' }}>
            <div style={{ maxWidth: 800, margin: '0 auto' }}>
              <p style={{
                fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.12em',
                textTransform: 'uppercase', color: 'var(--site-gold-dark)', marginBottom: 16,
              }}>
                Sobre a OBGP
              </p>
              <h2 style={{ marginBottom: 24, lineHeight: 1.2 }}>
                Compromisso com o desenvolvimento social e a gestão transparente de parcerias
              </h2>
              <p style={{ fontSize: '1.1rem', lineHeight: 1.85, color: 'var(--site-text-secondary)', marginBottom: 20 }}>
                A <strong style={{ color: 'var(--site-text-primary)' }}>Organização Brasil Gestão de Parcerias – OBGP</strong> é uma Organização da Sociedade Civil – OSC, pessoa jurídica de direito privado, associação privada e sem fins lucrativos.
              </p>
              <p style={{ fontSize: '1.1rem', lineHeight: 1.85, color: 'var(--site-text-secondary)' }}>
                A OBGP executa atividades, programas, projetos ou ações voltadas ou vinculadas a serviços de <strong style={{ color: 'var(--site-text-primary)' }}>educação, saúde e assistência social</strong>, buscando fortalecer políticas públicas e promover impacto real nas comunidades atendidas.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ════════ NÚMEROS / IMPACTO ════════ */}
      <section className="glass-section-white" style={{ padding: '80px 0' }}>
        <div className="container">
          <div className="grid-3" style={{ textAlign: 'center' }}>
            {[
              { number: '3', label: 'Áreas de atuação', sublabel: 'Educação, Saúde e Assistência Social' },
              { number: '8', label: 'Serviços oferecidos', sublabel: 'Gestão completa de parcerias' },
              { number: '100%', label: 'Transparência', sublabel: 'Prestação de contas pública' },
            ].map((stat, i) => (
              <div key={i} className={`stagger-${i + 1}`} style={{ padding: '32px 16px' }}>
                <div className="stat-number">{stat.number}</div>
                <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--site-text-primary)', marginTop: 8 }}>{stat.label}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--site-text-tertiary)', marginTop: 4 }}>{stat.sublabel}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════ VALORES / PILARES ════════ */}
      <section className="section-padding">
        <div className="container">
          <div className="section-header">
            <h2>Nossos Pilares</h2>
            <p>Os valores que guiam cada ação e parceria da OBGP.</p>
            <div className="section-line" />
          </div>

          <div className="grid-3">
            {[
              {
                icon: Target,
                title: 'Missão',
                text: 'Executar programas e projetos voltados à educação, saúde e assistência social, fortalecendo políticas públicas e promovendo o desenvolvimento das comunidades.',
                color: 'icon-box-blue',
              },
              {
                icon: Heart,
                title: 'Valores',
                text: 'Transparência, compromisso social, eficiência na gestão de recursos públicos e respeito aos princípios da legalidade, economicidade e participação cidadã.',
                color: 'icon-box-green',
              },
              {
                icon: Users,
                title: 'Visão',
                text: 'Ser referência em gestão de parcerias entre organizações da sociedade civil e o poder público, promovendo inclusão e impacto social mensurável.',
                color: 'icon-box-gold',
              },
            ].map(({ icon: Icon, title, text, color }, i) => (
              <div
                key={title}
                className={`glass-panel stagger-${i + 1}`}
                style={{ padding: 36, display: 'flex', flexDirection: 'column', gap: 20 }}
              >
                <div className={`icon-box ${color}`}>
                  <Icon size={26} />
                </div>
                <h3>{title}</h3>
                <p style={{ color: 'var(--site-text-secondary)', fontSize: '0.95rem', lineHeight: 1.75, flex: 1 }}>
                  {text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════ CTA ════════ */}
      <section className="glass-section-blue" style={{ padding: '80px 0', textAlign: 'center' }}>
        <div className="container">
          <h2 style={{ color: 'white', marginBottom: 16 }}>Conheça nossos serviços</h2>
          <p style={{ color: 'rgba(255,255,255,0.7)', maxWidth: 560, margin: '0 auto 32px', fontSize: '1.05rem', lineHeight: 1.7 }}>
            Soluções técnicas completas para gestão de parcerias entre a sociedade civil e o poder público.
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="/servicos" className="btn btn-white">
              Ver serviços <ArrowRight size={18} />
            </a>
            <a href="/contato" className="btn" style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.25)' }}>
              Fale conosco
            </a>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
