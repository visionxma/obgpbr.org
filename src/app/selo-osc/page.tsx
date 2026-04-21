import PublicLayout from '../components/PublicLayout';
import { ShieldCheck, Scale, TrendingUp, FileCheck, Users, Award, ArrowRight, AlertTriangle, BookOpen } from 'lucide-react';

export const metadata = { title: 'Selo OSC Gestão de Parcerias | OBGP' };

export default function SeloOscPage() {
  const beneficios = [
    { icon: FileCheck, titulo: 'Regularização proativa', texto: 'Adequação nos eixos jurídico, fiscal, social, trabalhista, econômico-financeiro e técnico.', color: 'icon-box-blue' },
    { icon: Scale, titulo: 'Segurança jurídica', texto: 'Aumento da segurança jurídica nas parcerias firmadas com o poder público.', color: 'icon-box-green' },
    { icon: TrendingUp, titulo: 'Eficiência operacional', texto: 'Melhoria da transparência e eficiência, facilitando a prestação de contas.', color: 'icon-box-gold' },
    { icon: ShieldCheck, titulo: 'Redução de riscos', texto: 'Menor risco de inabilitação em chamamentos públicos e editais de capacitação.', color: 'icon-box-blue' },
    { icon: Users, titulo: 'Fortalecimento institucional', texto: 'Ampliação da capacidade em promover inclusão, desenvolvimento social e participação cidadã.', color: 'icon-box-green' },
  ];

  const pStyle: React.CSSProperties = {
    fontSize: 'var(--text-lg)', lineHeight: 'var(--leading-relaxed)',
    color: 'var(--site-text-secondary)', marginBottom: 20,
  };

  return (
    <PublicLayout>
      {/* ═══ HERO ═══ */}
      <section className="glass-section-blue page-hero">
        <div className="container">
          <div className="hero-badge"><Award size={13} /> CERTIFICAÇÃO</div>
          <h1 className="h1-display" style={{ maxWidth: 640, margin: '0 auto 20px' }}>
            Selo OSC{' '}
            <span className="hero-accent-white">Gestão de Parcerias</span>
          </h1>
          <p className="hero-subtitle">
            Mecanismo independente de certificação que atesta a regularidade, conformidade e capacidade institucional das OSCs.
          </p>
          <div className="hero-divider" />
        </div>
      </section>

      {/* ═══ PROBLEMA ═══ */}
      <section className="section-padding">
        <div className="container">
          <div style={{ maxWidth: 760, marginBottom: 48 }}>
            <span className="section-label" style={{ display: 'block', marginBottom: 12 }}>Contexto</span>
            <h2 style={{ marginBottom: 24, lineHeight: 1.25 }}>
              O{' '}<span className="font-cursive" style={{ color: 'var(--site-gold-dark)' }}>problema</span>{' '}
              que enfrentamos
            </h2>
            <p style={pStyle}>
              A celebração de parcerias entre OSCs e a administração pública, regulada pela <strong style={{ color: 'var(--site-text-primary)' }}>Lei Federal nº 13.019/2014</strong> (MROSC), enfrenta entraves estruturais decorrentes da ausência de regularidade documental e conformidade institucional.
            </p>
            <p style={pStyle}>
              Irregularidades identificadas pelo Ministério Público do Maranhão — como estatuto desatualizado, ausência de atas e inexistência de prestação de contas — evidenciam padrões de inobservância da governança mínima exigida.
            </p>
            <p style={{ ...pStyle, marginBottom: 0 }}>
              O conjunto dessas irregularidades compromete a elegibilidade das OSCs, limita o acesso a recursos públicos e agrava desigualdades nas políticas de fomento à sociedade civil.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: 12,
          }}>
            {[
              'Desconhecimento das Normas Estatutárias',
              'Estatuto Social desatualizado',
              'Inobservância das finalidades estatutárias e dos deveres funcionais dos membros eleitos',
              'Ausência de controle administrativo e gerencial na Associação',
              'Ausência de cobrança de taxa associativa',
              'Ausência de reuniões do corpo diretivo e fiscal da Entidade',
              'Ausência de convocação de Assembleia Geral com os associados',
              'Ausência de prestação de contas',
              'Ausência de regramento específico voltado à condução do processo eleitoral',
              'Anistia de taxa associativa a cada eleição',
              'Ausência de registros dos principais atos constitutivos (atas de eleição, posse e atualização estatutária)',
              'Concentração de poder e falta de segregação de funções',
              'Contratação de parentes ou pessoas ligadas (Nepotismo)',
              'Pagamento de salários a dirigentes com recursos públicos sem previsão legal ou estatutária',
              'Ausência de transparência ativa (falta de publicação de dados em site oficial)',
              'Desvio de finalidade (uso de recursos para fins diversos do pactuado)',
              'Inexecução total ou parcial do objeto da parceria',
              'Fracionamento de despesa para burlar processos de cotação ou licitação',
              'Pagamento com documentação inidônea (notas fiscais frias ou recibos genéricos)',
              'Mistura de patrimônio (confusão patrimonial entre bens da entidade e dos dirigentes)',
              'Pagamento de despesas fora do período de vigência da parceria',
              'Ausência de movimentação financeira em conta bancária específica e exclusiva',
              'Contratação de "funcionários fantasmas"',
              'Desvio de recursos provenientes de emendas parlamentares',
              'Inexistência de sede física ou estrutura compatível com as atividades declaradas',
              'Falta de mecanismos de monitoramento e avaliação de resultados e impacto social',
            ].map((item, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'flex-start', gap: 14,
                padding: '16px 18px',
                borderRadius: 'var(--site-radius-lg)',
                background: '#fff',
                border: '1px solid var(--site-border)',
                boxShadow: 'var(--site-shadow-xs)',
              }}>
                <div style={{
                  minWidth: 28, height: 28, borderRadius: '50%',
                  background: 'var(--site-primary)',
                  color: 'var(--site-gold)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.7rem', fontWeight: 800, flexShrink: 0, marginTop: 1,
                }}>
                  {i + 1}
                </div>
                <span style={{ fontSize: 'var(--text-sm)', lineHeight: 1.5, color: 'var(--site-text-primary)', fontWeight: 500 }}>
                  {item}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ JUSTIFICATIVA ═══ */}
      <section className="glass-section-white section-padding">
        <div className="container" style={{ maxWidth: 780, margin: '0 auto' }}>
          <div className="section-header">
            <span className="section-label">Fundamentação</span>
            <h2>A{' '}<span className="font-cursive" style={{ color: 'var(--site-gold-dark)' }}>solução</span>{' '}proposta</h2>
            <div className="section-line" />
          </div>
          <p style={pStyle}>
            O <strong style={{ color: 'var(--site-text-primary)' }}>"Selo OSC Gestão de Parcerias"</strong> fundamenta-se na necessidade de criar um mecanismo independente de certificação que ateste a regularidade, conformidade e capacidade institucional para celebração de parcerias com a administração pública.
          </p>
          <p style={pStyle}>
            O selo promove avaliação técnica e documental estruturada, orientada pelos requisitos da Lei nº 13.019/2014 e do Decreto nº 8.726/2016, reduzindo a assimetria entre a legislação e sua implementação efetiva.
          </p>
          <p style={{ ...pStyle, fontWeight: 500, color: 'var(--site-text-primary)', background: 'var(--site-surface-gold)', padding: '20px 24px', borderRadius: 'var(--site-radius-md)', borderLeft: '4px solid var(--site-gold)' }}>
            O selo constitui um mecanismo inovador de qualificação e reconhecimento institucional, capaz de elevar o padrão de confiabilidade e governança das OSCs.
          </p>
        </div>
      </section>

      {/* ═══ BENEFÍCIOS ═══ */}
      <section className="section-padding">
        <div className="container">
          <div className="section-header">
            <span className="section-label">Benefícios</span>
            <h2>O que a{' '}<span className="font-cursive" style={{ color: 'var(--site-gold-dark)' }}>certificação</span>{' '}permite</h2>
            <p>Resultados concretos para organizações certificadas pelo Selo OSC.</p>
            <div className="section-line" />
          </div>

          <div className="grid-3">
            {beneficios.map(({ icon: Icon, titulo, texto, color }, i) => (
              <div key={titulo} className={`glass-panel stagger-${i + 1}`}
                style={{ padding: '36px 30px', display: 'flex', flexDirection: 'column', gap: 18 }}>
                <div className={`icon-box ${color}`}><Icon size={22} /></div>
                <h3 style={{ fontSize: '1.05rem' }}>{titulo}</h3>
                <p style={{ color: 'var(--site-text-secondary)', lineHeight: 1.75, fontSize: '.93rem' }}>{texto}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section className="glass-section-blue" style={{ padding: '80px 0', textAlign: 'center' }}>
        <div className="container">
          <h2 style={{ color: 'white', marginBottom: 16 }}>
            Quer{' '}<span className="hero-accent-white">certificar</span>{' '}sua organização?
          </h2>
          <p style={{ color: 'rgba(255,255,255,.65)', maxWidth: 500, margin: '0 auto 32px', lineHeight: 1.7 }}>
            Saiba como sua OSC pode obter o Selo e se qualificar para parcerias com o poder público.
          </p>
          <a href="/inicio#contato" className="btn btn-white">Saiba mais <ArrowRight size={17} /></a>
        </div>
      </section>
    </PublicLayout>
  );
}
