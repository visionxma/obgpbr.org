import PublicLayout from '../components/PublicLayout';
import { HeartHandshake, GraduationCap, Stethoscope, ArrowRight, CheckCircle2 } from 'lucide-react';

export const metadata = { title: 'Atuação | OBGP' };

export default function AtuacaoPage() {
  const areas = [
    {
      icon: HeartHandshake,
      titulo: 'Assistência Social',
      subtitulo: 'Proteção e fortalecimento de vínculos',
      texto: 'Executa e gerencia ações socioassistenciais alinhadas ao SUAS, com foco em proteção social, fortalecimento de vínculos e garantia de direitos, atendendo indivíduos e famílias em situação de vulnerabilidade e risco.',
      img: 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=800&h=500&fit=crop',
      bullets: ['Alinhamento ao SUAS', 'Proteção social básica e especial', 'Fortalecimento de vínculos comunitários'],
      color: 'var(--site-accent)',
      bgColor: 'var(--site-surface-green)',
    },
    {
      icon: GraduationCap,
      titulo: 'Educação',
      subtitulo: 'Capacitação e formação continuada',
      texto: 'Desenvolve e executa projetos educacionais com cursos, oficinas, capacitação e formação continuada, em formato presencial ou remoto, para ampliar o acesso ao conhecimento e fortalecer competências.',
      img: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&h=500&fit=crop',
      bullets: ['Cursos e oficinas presenciais e EAD', 'Capacitação profissional', 'Formação continuada para educadores'],
      color: 'var(--site-primary)',
      bgColor: 'var(--site-surface-blue)',
    },
    {
      icon: Stethoscope,
      titulo: 'Saúde',
      subtitulo: 'Promoção e cuidado integral',
      texto: 'Executa e gerencia ações e serviços de saúde, em parceria com instituições públicas e privadas, com foco em promoção, prevenção e cuidado integral, articulando-se ao SUS quando aplicável.',
      img: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&h=500&fit=crop',
      bullets: ['Articulação com o SUS', 'Ações de promoção e prevenção', 'Parcerias público-privadas em saúde'],
      color: 'var(--site-gold-dark)',
      bgColor: 'var(--site-surface-gold)',
    },
  ];

  return (
    <PublicLayout>
      {/* ═══ HERO ═══ */}
      <section className="glass-section-blue page-hero">
        <div className="container">
          <div className="hero-badge"><HeartHandshake size={13} /> NOSSAS ÁREAS</div>
          <h1 style={{ maxWidth: 600, margin: '0 auto 20px' }}>
            Onde a OBGP{' '}
            <span className="hero-accent-white">atua</span>
          </h1>
          <p className="hero-subtitle">
            Três eixos estratégicos para fortalecer políticas públicas e promover impacto social direto nas comunidades.
          </p>
          <div className="hero-divider" />
        </div>
      </section>

      {/* ═══ ÁREAS — Alternating Layout ═══ */}
      <section className="section-padding">
        <div className="container" style={{ display: 'flex', flexDirection: 'column', gap: 96 }}>
          {areas.map(({ icon: Icon, titulo, subtitulo, texto, img, bullets, color, bgColor }, i) => (
            <div key={titulo} className={`row-alternate ${i % 2 !== 0 ? 'reverse' : ''}`}>
              {/* Imagem */}
              <div style={{ borderRadius: 'var(--site-radius-xl)', overflow: 'hidden', position: 'relative', minHeight: 320 }}>
                <img src={img} alt={titulo} className="img-cover" style={{ height: '100%', position: 'absolute', inset: 0 }} />
                <div style={{
                  position: 'absolute', inset: 0,
                  background: 'linear-gradient(135deg, rgba(0,0,0,0.3) 0%, transparent 60%)',
                }} />
                {/* Badge overlay */}
                <div style={{
                  position: 'absolute', top: 24, left: 24,
                  padding: '10px 18px', borderRadius: 'var(--site-radius-full)',
                  background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(12px)',
                  color: 'white', fontSize: '.78rem', fontWeight: 700, letterSpacing: '.08em',
                  textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 8,
                }}>
                  <Icon size={15} /> {titulo}
                </div>
              </div>

              {/* Conteúdo */}
              <div>
                <div style={{
                  width: 48, height: 48, borderRadius: 'var(--site-radius-md)',
                  background: bgColor, color, display: 'flex', alignItems: 'center',
                  justifyContent: 'center', marginBottom: 20,
                }}>
                  <Icon size={22} />
                </div>
                <p style={{ fontSize: '.75rem', fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color, marginBottom: 8 }}>
                  {subtitulo}
                </p>
                <h2 style={{ fontSize: 'clamp(1.6rem,3vw,2.2rem)', marginBottom: 16, lineHeight: 1.2 }}>
                  {titulo}
                </h2>
                <p style={{ color: 'var(--site-text-secondary)', lineHeight: 1.8, fontSize: '1rem', marginBottom: 24 }}>
                  {texto}
                </p>
                {/* Bullets */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {bullets.map(b => (
                    <div key={b} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <CheckCircle2 size={16} style={{ color, flexShrink: 0 }} />
                      <span style={{ fontSize: '.93rem', color: 'var(--site-text-secondary)' }}>{b}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section className="glass-section-blue" style={{ padding: '80px 0', textAlign: 'center' }}>
        <div className="container">
          <h2 style={{ color: 'white', marginBottom: 16 }}>
            Conheça nossos{' '}<span className="hero-accent-white">serviços</span>
          </h2>
          <p style={{ color: 'rgba(255,255,255,.65)', maxWidth: 480, margin: '0 auto 32px', lineHeight: 1.7 }}>
            Soluções técnicas para qualificar parcerias entre o poder público e a sociedade civil.
          </p>
          <a href="/servicos" className="btn btn-white">Nossos serviços <ArrowRight size={17} /></a>
        </div>
      </section>
    </PublicLayout>
  );
}
