import PublicLayout from '../components/PublicLayout';
import { ShieldCheck, Scale, TrendingUp, FileCheck, Users, Award, ArrowRight, BookOpen, FileText, Download, Mail, Phone, MapPin, ChevronDown } from 'lucide-react';
import RegulamentoExpandable from './RegulamentoExpandable';

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
      <section className="glass-section-blue page-hero" style={{ overflow: 'hidden', position: 'relative' }}>
        <div className="container" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) auto', gap: 32, alignItems: 'center' }}>
          <div style={{ minWidth: 0, textAlign: 'center' }} className="selo-hero-text">
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
          <div className="selo-hero-mascote" aria-hidden="true">
            <img
              src="/img/mascote-selo.webp"
              alt=""
              width={320}
              height={320}
              className="mascote mascote-float"
              style={{ width: 'clamp(220px, 26vw, 340px)', height: 'auto' }}
            />
          </div>
        </div>

        {/* Scroll Down Indicator */}
        <div style={{
          position: 'absolute',
          bottom: 30,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 10,
        }}>
          <a href="#diagnostico" style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 6,
            opacity: 0.8,
            animation: 'float 2.5s ease-in-out infinite',
          }}>
            <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.15em', color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>
              Deslize
            </span>
            <ChevronDown size={28} style={{ color: 'var(--site-gold)' }} />
          </a>
        </div>
      </section>

      {/* ═══ DIAGNÓSTICO MP/MA ═══ */}
      <section className="section-padding" id="diagnostico">
        <div className="container">
          <div style={{ maxWidth: 760, marginBottom: 48 }}>
            <span className="section-label" style={{ display: 'block', marginBottom: 12 }}>Diagnóstico</span>
            <h2 style={{ marginBottom: 24, lineHeight: 1.25 }}>
              O que o{' '}<span className="font-cursive" style={{ color: 'var(--site-gold-dark)' }}>MP/MA</span>{' '}
              identificou
            </h2>
            <p style={pStyle}>
              O Ministério Público do Maranhão, no exercício de suas atribuições de controle externo, identificou um conjunto de irregularidades recorrentes nas entidades sem fins lucrativos — padrões que comprometem diretamente a elegibilidade das OSCs para celebrar parcerias com a administração pública, nos termos da <strong style={{ color: 'var(--site-text-primary)' }}>Lei Federal nº 13.019/2014</strong> (MROSC).
            </p>
            <p style={{ ...pStyle, marginBottom: 0 }}>
              Essas irregularidades limitam o acesso das organizações a recursos públicos e agravam desigualdades nas políticas de fomento à sociedade civil — cenário que o <strong style={{ color: 'var(--site-text-primary)' }}>Selo OSC Gestão de Parcerias</strong> foi concebido para enfrentar de forma estruturada e preventiva.
            </p>
          </div>

          {/* Fonte */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '12px 18px',
            borderRadius: 'var(--site-radius-md)',
            background: 'var(--site-surface-gold)',
            border: '1px solid var(--site-gold)',
            marginBottom: 32,
            maxWidth: 760,
          }}>
            <BookOpen size={16} style={{ color: 'var(--site-gold-dark)', flexShrink: 0 }} />
            <span style={{ fontSize: 'var(--text-sm)', color: 'var(--site-text-primary)', lineHeight: 1.5 }}>
              <strong>Fonte:</strong> Apresentação institucional do Ministério Público do Estado do Maranhão — irregularidades observadas nas OSCs do estado.
            </span>
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

      {/* ═══ REGULAMENTO ═══ */}
      <section className="glass-section-white section-padding" id="regulamento">
        <div className="container" style={{ maxWidth: 920, margin: '0 auto' }}>
          <div className="section-header">
            <span className="section-label">Documento Oficial</span>
            <h2>Regulamento do{' '}<span className="font-cursive" style={{ color: 'var(--site-gold-dark)' }}>Selo OSC</span></h2>
            <p>Leia o regulamento completo da certificação Selo OSC Gestão de Parcerias.</p>
            <div className="section-line" />
          </div>

          {/* Toolbar */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 12,
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 20px',
            background: 'var(--site-surface-warm)',
            border: '1px solid var(--site-border)',
            borderRadius: 'var(--site-radius-md)',
            marginBottom: 24,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
              <div style={{
                width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                background: 'rgba(197,171,118,0.12)', color: 'var(--site-gold-dark)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <FileText size={20} />
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--site-text-primary)', lineHeight: 1.3 }}>
                  Regulamento Selo OSC Gestão de Parcerias
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--site-text-secondary)', marginTop: 2 }}>
                  Revisão 00 · 25/04/2026 · 2 páginas
                </div>
              </div>
            </div>
            <a
              href="/docs/REGULAMENTO_SELO_OSC_GP_OBGP_REV00_25.04.2026.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-gold"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 20px', fontSize: '0.85rem', fontWeight: 700, borderRadius: 'var(--site-radius-full)' }}
            >
              <Download size={16} /> Baixar PDF
            </a>
          </div>

          {/* Document Body via Client Component */}
          <RegulamentoExpandable />
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section className="glass-section-blue" style={{ padding: '80px 0', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div className="container" style={{ position: 'relative' }}>
          <img
            src="/img/mascote-selo.webp"
            alt=""
            aria-hidden="true"
            width={180}
            height={180}
            className="mascote mascote-float"
            style={{ width: 'clamp(120px, 16vw, 180px)', height: 'auto', margin: '0 auto 18px' }}
          />
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
