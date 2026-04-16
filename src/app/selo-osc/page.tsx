import PublicLayout from '../components/PublicLayout';
import { ShieldCheck, Scale, TrendingUp, FileCheck, Users, Award, ArrowRight } from 'lucide-react';

export const metadata = { title: 'Selo OSC Gestão de Parcerias | OBGP' };

export default function SeloOscPage() {
  const beneficios = [
    {
      icon: FileCheck,
      titulo: 'Regularização proativa',
      texto: 'Adequação das OSCs nos eixos jurídico, fiscal, social, trabalhista, econômico-financeiro e técnico.',
      color: 'icon-box-blue',
    },
    {
      icon: Scale,
      titulo: 'Segurança jurídica',
      texto: 'Aumento da segurança jurídica nas parcerias firmadas com o poder público.',
      color: 'icon-box-green',
    },
    {
      icon: TrendingUp,
      titulo: 'Eficiência e transparência',
      texto: 'Melhoria da eficiência operacional e da transparência, facilitando a prestação de contas.',
      color: 'icon-box-gold',
    },
    {
      icon: ShieldCheck,
      titulo: 'Redução de riscos',
      texto: 'Diminuição do risco de inabilitação em chamamentos públicos, incluindo editais de capacitação e fortalecimento.',
      color: 'icon-box-blue',
    },
    {
      icon: Users,
      titulo: 'Fortalecimento institucional',
      texto: 'Ampliação da capacidade das OSCs em promover inclusão, desenvolvimento social e participação cidadã.',
      color: 'icon-box-green',
    },
  ];

  const pStyle: React.CSSProperties = {
    fontSize: '1.05rem',
    lineHeight: 1.85,
    color: 'var(--site-text-secondary)',
    marginBottom: 20,
  };

  return (
    <PublicLayout>
      {/* ════════ HERO ════════ */}
      <section className="glass-section-blue page-hero">
        <div className="container">
          <div className="hero-badge">
            <Award size={14} />
            CERTIFICAÇÃO
          </div>
          <h1 style={{ fontSize: 'clamp(2rem, 4.5vw, 3.25rem)' }}>
            Selo OSC<br />Gestão de Parcerias
          </h1>
          <p className="hero-subtitle">
            Mecanismo independente de certificação que atesta a regularidade, a conformidade e a capacidade institucional das OSCs para celebração de parcerias com a administração pública.
          </p>
        </div>
      </section>

      {/* ════════ CARACTERIZAÇÃO ════════ */}
      <section className="section-padding">
        <div className="container" style={{ maxWidth: 820, margin: '0 auto' }}>
          <p style={{
            fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.12em',
            textTransform: 'uppercase', color: 'var(--site-gold-dark)', marginBottom: 16,
          }}>
            Contexto
          </p>
          <h2 style={{ marginBottom: 28 }}>Caracterização do problema</h2>

          <p style={pStyle}>
            A celebração de parcerias entre Organizações da Sociedade Civil (OSCs) e a administração
            pública, regulada pela <strong style={{ color: 'var(--site-text-primary)' }}>Lei Federal nº 13.019/2014</strong> (Marco Regulatório das
            Organizações da Sociedade Civil – MROSC), enfrenta entraves estruturais decorrentes da
            ausência de regularidade documental e de conformidade institucional das OSCs.
          </p>

          <p style={pStyle}>
            Irregularidades identificadas pela 1ª Promotoria de Justiça Especializada em Fundações e
            Entidades de Interesse Social do Ministério Público do Maranhão — como estatuto social
            desatualizado, desconhecimento das normas estatutárias, ausência de atas de eleição e
            posse, falta de reuniões dos órgãos diretivos e inexistência de prestação de contas —
            evidenciam padrões de inobservância da governança mínima exigida.
          </p>

          <p style={pStyle}>
            Nos processos de chamamento público, a conformidade jurídica e documental é condição
            obrigatória para habilitação. Esses editais exigem certidões fiscais e trabalhistas,
            estatuto atualizado, atas da atual diretoria, comprovação de capacidade técnica e
            regularidade fiscal e financeira.
          </p>

          <p style={pStyle}>
            O conjunto de irregularidades documentais e operacionais compromete a elegibilidade das
            OSCs, limita o acesso a recursos públicos, enfraquece sua atuação social e agrava
            desigualdades no campo das políticas de fomento à sociedade civil.
          </p>
        </div>
      </section>

      {/* ════════ JUSTIFICATIVA ════════ */}
      <section className="glass-section-white section-padding">
        <div className="container" style={{ maxWidth: 820, margin: '0 auto' }}>
          <p style={{
            fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.12em',
            textTransform: 'uppercase', color: 'var(--site-accent)', marginBottom: 16,
          }}>
            Fundamentação
          </p>
          <h2 style={{ marginBottom: 28 }}>Justificativa</h2>

          <p style={pStyle}>
            O projeto <strong style={{ color: 'var(--site-text-primary)' }}>"Selo OSC Gestão de Parcerias"</strong> fundamenta-se na necessidade de
            criar um mecanismo independente de certificação que ateste a regularidade, a conformidade
            e a capacidade institucional das OSCs para celebração de parcerias com a administração
            pública.
          </p>

          <p style={pStyle}>
            Diante das irregularidades recorrentes e das exigências estabelecidas em editais de
            chamamento público, torna-se evidente a lacuna existente entre as boas práticas de
            governança institucional previstas na legislação e sua efetiva implementação pelas
            organizações.
          </p>

          <p style={pStyle}>
            Assim, o selo constitui um mecanismo inovador de qualificação e reconhecimento
            institucional, capaz de elevar o padrão de confiabilidade, conformidade e governança das
            Organizações da Sociedade Civil, fortalecendo sua atuação e sua parceria com o Estado.
          </p>
        </div>
      </section>

      {/* ════════ BENEFÍCIOS ════════ */}
      <section className="section-padding">
        <div className="container">
          <div className="section-header">
            <h2>O que a certificação permite</h2>
            <p>Benefícios concretos para as organizações certificadas pelo Selo OSC.</p>
            <div className="section-line" />
          </div>

          <div className="grid-3">
            {beneficios.map(({ icon: Icon, titulo, texto, color }, i) => (
              <div
                key={titulo}
                className={`glass-panel stagger-${i + 1}`}
                style={{ padding: 32, display: 'flex', flexDirection: 'column', gap: 18 }}
              >
                <div className={`icon-box ${color}`}>
                  <Icon size={24} />
                </div>
                <h3 style={{ fontSize: '1.1rem' }}>{titulo}</h3>
                <p style={{ color: 'var(--site-text-secondary)', lineHeight: 1.75, fontSize: '0.938rem' }}>
                  {texto}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════ CTA ════════ */}
      <section className="glass-section-blue" style={{ padding: '72px 0', textAlign: 'center' }}>
        <div className="container">
          <h2 style={{ color: 'white', marginBottom: 16 }}>Quer certificar sua organização?</h2>
          <p style={{ color: 'rgba(255,255,255,0.7)', maxWidth: 520, margin: '0 auto 28px', lineHeight: 1.7 }}>
            Saiba como sua OSC pode obter o Selo de Gestão de Parcerias e se qualificar para parcerias com o poder público.
          </p>
          <a href="/contato" className="btn btn-white">
            Saiba mais <ArrowRight size={18} />
          </a>
        </div>
      </section>
    </PublicLayout>
  );
}
