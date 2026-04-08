import PublicLayout from '../components/PublicLayout';

export const metadata = { title: 'Quem Somos | OBGP' };

export default function QuemSomosPage() {
  return (
    <PublicLayout>
      <section className="glass-section-blue" style={{ padding: '140px 0 80px', textAlign: 'center' }}>
        <div className="container">
          <h1 style={{ color: 'white', marginBottom: 20 }}>Quem Somos</h1>
          <p style={{ maxWidth: 760, margin: '0 auto', color: 'rgba(255,255,255,0.85)', fontSize: '1.15rem', lineHeight: 1.7 }}>
            Organização Brasil Gestão de Parcerias — OBGP
          </p>
        </div>
      </section>

      <section className="section-padding">
        <div className="container" style={{ maxWidth: 860 }}>
          <p style={{ fontSize: '1.1rem', lineHeight: 1.8, color: 'var(--site-text-secondary)', marginBottom: 24 }}>
            A <strong style={{ color: 'var(--site-text-primary)' }}>Organização Brasil Gestão de Parcerias – OBGP</strong> é
            uma Organização da Sociedade Civil – OSC, pessoa jurídica de direito privado, associação privada
            e sem fins lucrativos.
          </p>
          <p style={{ fontSize: '1.1rem', lineHeight: 1.8, color: 'var(--site-text-secondary)' }}>
            A OBGP executa atividades, programas, projetos ou ações voltadas ou vinculadas a serviços de
            <strong style={{ color: 'var(--site-text-primary)' }}> educação, saúde e assistência social</strong>.
          </p>
        </div>
      </section>
    </PublicLayout>
  );
}
