import PublicLayout from '../components/PublicLayout';
import { HeartHandshake, GraduationCap, Stethoscope } from 'lucide-react';

export const metadata = { title: 'Atuação | OBGP' };

export default function AtuacaoPage() {
  const areas = [
    {
      icon: HeartHandshake,
      titulo: 'Assistência Social',
      texto:
        'Executa e gerencia ações socioassistenciais alinhadas ao SUAS, com foco em proteção social, fortalecimento de vínculos e garantia de direitos, atendendo indivíduos e famílias em situação de vulnerabilidade e risco.',
    },
    {
      icon: GraduationCap,
      titulo: 'Educação',
      texto:
        'Desenvolve e executa projetos educacionais com cursos, oficinas, capacitação e formação continuada, em formato presencial ou remoto, para ampliar o acesso ao conhecimento e fortalecer competências para o trabalho.',
    },
    {
      icon: Stethoscope,
      titulo: 'Saúde',
      texto:
        'Executa e gerencia ações e serviços de saúde, em parceria com instituições públicas e privadas, com foco em promoção, prevenção e cuidado integral, articulando-se ao SUS quando aplicável.',
    },
  ];

  return (
    <PublicLayout>
      <section className="glass-section-blue" style={{ padding: '140px 0 80px', textAlign: 'center' }}>
        <div className="container">
          <h1 style={{ color: 'white', marginBottom: 20 }}>Atuação</h1>
          <p style={{ maxWidth: 720, margin: '0 auto', color: 'rgba(255,255,255,0.85)', fontSize: '1.15rem', lineHeight: 1.7 }}>
            Áreas em que a OBGP atua para fortalecer políticas públicas e comunidades.
          </p>
        </div>
      </section>

      <section className="section-padding">
        <div className="container" style={{ display: 'grid', gap: 28, gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
          {areas.map(({ icon: Icon, titulo, texto }) => (
            <div key={titulo} className="glass-panel" style={{ padding: 32, borderRadius: 'var(--site-radius-lg)' }}>
              <div style={{
                width: 56, height: 56, borderRadius: 'var(--site-radius-md)',
                background: 'var(--site-surface-blue)', color: 'var(--site-primary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18,
              }}>
                <Icon size={28} />
              </div>
              <h3 style={{ marginBottom: 12 }}>{titulo}</h3>
              <p style={{ color: 'var(--site-text-secondary)', lineHeight: 1.7 }}>{texto}</p>
            </div>
          ))}
        </div>
      </section>
    </PublicLayout>
  );
}
