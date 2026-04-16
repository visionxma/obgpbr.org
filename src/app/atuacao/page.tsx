import PublicLayout from '../components/PublicLayout';
import { HeartHandshake, GraduationCap, Stethoscope, ArrowRight } from 'lucide-react';

export const metadata = { title: 'Atuação | OBGP' };

export default function AtuacaoPage() {
  const areas = [
    {
      icon: HeartHandshake,
      titulo: 'Assistência Social',
      texto: 'Executa e gerencia ações socioassistenciais alinhadas ao SUAS, com foco em proteção social, fortalecimento de vínculos e garantia de direitos, atendendo indivíduos e famílias em situação de vulnerabilidade e risco.',
      color: 'icon-box-green',
      accent: 'var(--site-accent)',
      img: 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=800&h=500&fit=crop',
    },
    {
      icon: GraduationCap,
      titulo: 'Educação',
      texto: 'Desenvolve e executa projetos educacionais com cursos, oficinas, capacitação e formação continuada, em formato presencial ou remoto, para ampliar o acesso ao conhecimento e fortalecer competências para o trabalho.',
      color: 'icon-box-blue',
      accent: 'var(--site-primary)',
      img: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&h=500&fit=crop',
    },
    {
      icon: Stethoscope,
      titulo: 'Saúde',
      texto: 'Executa e gerencia ações e serviços de saúde, em parceria com instituições públicas e privadas, com foco em promoção, prevenção e cuidado integral, articulando-se ao SUS quando aplicável.',
      color: 'icon-box-gold',
      accent: 'var(--site-gold-dark)',
      img: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&h=500&fit=crop',
    },
  ];

  return (
    <PublicLayout>
      {/* ════════ HERO ════════ */}
      <section className="glass-section-blue page-hero">
        <div className="container">
          <div className="hero-badge">
            <HeartHandshake size={14} />
            NOSSAS ÁREAS
          </div>
          <h1>Áreas de Atuação</h1>
          <p className="hero-subtitle">
            Atuamos em três eixos estratégicos para fortalecer políticas públicas e promover impacto social direto nas comunidades.
          </p>
        </div>
      </section>

      {/* ════════ ÁREAS ════════ */}
      <section className="section-padding">
        <div className="container" style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
          {areas.map(({ icon: Icon, titulo, texto, color, accent, img }, i) => (
            <article
              key={titulo}
              className={`glass-panel stagger-${i + 1}`}
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr',
                overflow: 'hidden',
              }}
            >
              {/* Imagem */}
              <div style={{ height: 240, position: 'relative', overflow: 'hidden' }}>
                <img
                  src={img}
                  alt={titulo}
                  className="img-cover"
                  style={{ height: '100%' }}
                />
                <div style={{
                  position: 'absolute', inset: 0,
                  background: 'linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 60%)',
                }} />
                <div style={{
                  position: 'absolute', bottom: 20, left: 24,
                  display: 'flex', alignItems: 'center', gap: 12,
                }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: 'var(--site-radius-md)',
                    background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white',
                  }}>
                    <Icon size={24} />
                  </div>
                  <h3 style={{ color: 'white', fontSize: '1.35rem' }}>{titulo}</h3>
                </div>
              </div>

              {/* Conteúdo */}
              <div style={{ padding: '28px 28px 32px' }}>
                <p style={{ color: 'var(--site-text-secondary)', lineHeight: 1.8, fontSize: '1rem' }}>
                  {texto}
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ════════ CTA ════════ */}
      <section className="glass-section-blue" style={{ padding: '72px 0', textAlign: 'center' }}>
        <div className="container">
          <h2 style={{ color: 'white', marginBottom: 16 }}>Veja como podemos ajudar</h2>
          <p style={{ color: 'rgba(255,255,255,0.7)', maxWidth: 520, margin: '0 auto 28px', lineHeight: 1.7 }}>
            Conheça os serviços técnicos que oferecemos para qualificar parcerias.
          </p>
          <a href="/servicos" className="btn btn-white">
            Nossos serviços <ArrowRight size={18} />
          </a>
        </div>
      </section>
    </PublicLayout>
  );
}
