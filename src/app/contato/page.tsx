import PublicLayout from '../components/PublicLayout';
import { Mail, Phone, MapPin } from 'lucide-react';

export const metadata = { title: 'Fale Conosco | OBGP' };

export default function ContatoPage() {
  return (
    <PublicLayout>
      <section className="glass-section-blue" style={{ padding: '140px 0 80px', textAlign: 'center' }}>
        <div className="container">
          <h1 style={{ color: 'white', marginBottom: 20 }}>Fale Conosco</h1>
          <p style={{ maxWidth: 720, margin: '0 auto', color: 'rgba(255,255,255,0.85)', fontSize: '1.15rem', lineHeight: 1.7 }}>
            Tem dúvidas, propostas de parceria ou quer saber mais sobre o nosso trabalho? Entre em contato.
          </p>
        </div>
      </section>

      <section className="section-padding">
        <div className="container" style={{ display: 'grid', gap: 28, gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
          <a
            href="mailto:contato.org.obgp@gmail.com"
            className="glass-panel"
            style={{ padding: 32, borderRadius: 'var(--site-radius-lg)', display: 'flex', gap: 16, alignItems: 'flex-start', textDecoration: 'none', color: 'inherit' }}
          >
            <Mail size={28} color="var(--site-primary)" />
            <div>
              <h3 style={{ marginBottom: 8, fontSize: '1.1rem' }}>E-mail</h3>
              <p style={{ color: 'var(--site-text-secondary)', wordBreak: 'break-word' }}>contato.org.obgp@gmail.com</p>
            </div>
          </a>

          <a
            href="tel:+5598987100001"
            className="glass-panel"
            style={{ padding: 32, borderRadius: 'var(--site-radius-lg)', display: 'flex', gap: 16, alignItems: 'flex-start', textDecoration: 'none', color: 'inherit' }}
          >
            <Phone size={28} color="var(--site-primary)" />
            <div>
              <h3 style={{ marginBottom: 8, fontSize: '1.1rem' }}>Telefone</h3>
              <p style={{ color: 'var(--site-text-secondary)' }}>(98) 9 8710-0001</p>
            </div>
          </a>

          <div className="glass-panel" style={{ padding: 32, borderRadius: 'var(--site-radius-lg)', display: 'flex', gap: 16, alignItems: 'flex-start' }}>
            <MapPin size={28} color="var(--site-primary)" />
            <div>
              <h3 style={{ marginBottom: 8, fontSize: '1.1rem' }}>Endereço</h3>
              <p style={{ color: 'var(--site-text-secondary)', lineHeight: 1.6 }}>
                Avenida L, nº 10 D, Quadra 32<br />
                Bairro Morada do Sol<br />
                Paço do Lumiar/MA — CEP 65130-000
              </p>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
