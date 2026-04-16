import PublicLayout from '../components/PublicLayout';
import {
  Coins, ClipboardCheck, FolderArchive, FileSpreadsheet,
  Landmark, Briefcase, Receipt, GraduationCap, ArrowRight, Sparkles,
} from 'lucide-react';

export const metadata = { title: 'Nossos Serviços | OBGP' };

export default function ServicosPage() {
  const servicos = [
    { icon: Coins, titulo: 'Captação de Recursos', texto: 'Identificação, prospecção e desenvolvimento de estratégias para obtenção de financiamentos junto a órgãos públicos, agências de fomento, organizações internacionais e fundações privadas.', color: 'icon-box-gold' },
    { icon: ClipboardCheck, titulo: 'Diagnóstico de Viabilidade', texto: 'Avaliação completa da viabilidade jurídica, fiscal, trabalhista, social, econômico-financeira e técnica dos projetos a serem propostos ou executados.', color: 'icon-box-blue' },
    { icon: FolderArchive, titulo: 'Gestão Documental', texto: 'Organização, controle e atualização da documentação institucional necessária para habilitação em processos seletivos e parcerias públicas.', color: 'icon-box-green' },
    { icon: FileSpreadsheet, titulo: 'Elaboração Técnica de Projetos', texto: 'Propostas técnicas completas com memória de cálculo, orçamento detalhado, plano de aplicação de recursos e cronograma físico-financeiro.', color: 'icon-box-gold' },
    { icon: Landmark, titulo: 'Representação Institucional', texto: 'Representação junto a órgãos e instâncias da Administração Pública Municipal, Estadual e Federal, conselhos e comitês deliberativos.', color: 'icon-box-blue' },
    { icon: Briefcase, titulo: 'Gestão de Contratos e Projetos', texto: 'Coordenação e acompanhamento da execução de convênios, termos de colaboração, termos de fomento e demais instrumentos congêneres.', color: 'icon-box-green' },
    { icon: Receipt, titulo: 'Prestação de Contas', texto: 'Relatórios técnicos e financeiros periódicos, observando os princípios da legalidade, transparência, economicidade e eficiência.', color: 'icon-box-blue' },
    { icon: GraduationCap, titulo: 'Qualificação Profissional', texto: 'Programas de capacitação e treinamento por meio de cursos, oficinas, workshops e atividades educativas direcionadas.', color: 'icon-box-gold' },
  ];

  return (
    <PublicLayout>
      {/* ═══ HERO ═══ */}
      <section className="glass-section-blue page-hero">
        <div className="container">
          <div className="hero-badge"><Sparkles size={13} /> O QUE FAZEMOS</div>
          <h1 style={{ maxWidth: 600, margin: '0 auto 20px' }}>
            Serviços{' '}
            <span className="hero-accent-white">especializados</span>{' '}
            para OSCs
          </h1>
          <p className="hero-subtitle">
            Soluções técnicas completas para qualificar a gestão de parcerias entre o poder público e a sociedade civil.
          </p>
          <div className="hero-divider" />
        </div>
      </section>

      {/* ═══ SERVIÇOS GRID ═══ */}
      <section className="section-padding">
        <div className="container">
          <div className="grid-2">
            {servicos.map(({ icon: Icon, titulo, texto, color }, i) => (
              <div
                key={titulo}
                className={`glass-panel stagger-${Math.min(i + 1, 8)}`}
                style={{
                  padding: '36px 32px',
                  display: 'flex',
                  gap: 22,
                  alignItems: 'flex-start',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {/* Número de fundo */}
                <span style={{
                  position: 'absolute', top: 16, right: 22,
                  fontFamily: 'var(--font-heading)', fontSize: '4rem', fontWeight: 900,
                  color: 'var(--site-border)', lineHeight: 1, pointerEvents: 'none', userSelect: 'none',
                }}>
                  {String(i + 1).padStart(2, '0')}
                </span>

                <div className={`icon-box ${color}`} style={{ marginTop: 2 }}>
                  <Icon size={22} />
                </div>
                <div style={{ flex: 1, position: 'relative', zIndex: 1 }}>
                  <h3 style={{ marginBottom: 10, fontSize: '1.1rem' }}>{titulo}</h3>
                  <p style={{ color: 'var(--site-text-secondary)', lineHeight: 1.75, fontSize: '.938rem' }}>{texto}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section className="glass-section-blue" style={{ padding: '80px 0', textAlign: 'center' }}>
        <div className="container">
          <h2 style={{ color: 'white', marginBottom: 16 }}>
            Precisa de{' '}<span className="hero-accent-white">apoio</span>{' '}para sua organização?
          </h2>
          <p style={{ color: 'rgba(255,255,255,.65)', maxWidth: 480, margin: '0 auto 32px', lineHeight: 1.7 }}>
            Entre em contato para saber como podemos ajudar com a gestão de parcerias da sua OSC.
          </p>
          <a href="/contato" className="btn btn-white">Fale conosco <ArrowRight size={17} /></a>
        </div>
      </section>
    </PublicLayout>
  );
}
