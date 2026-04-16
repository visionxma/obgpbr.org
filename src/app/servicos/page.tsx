import PublicLayout from '../components/PublicLayout';
import {
  Coins, ClipboardCheck, FolderArchive, FileSpreadsheet,
  Landmark, Briefcase, Receipt, GraduationCap, ArrowRight, Sparkles,
} from 'lucide-react';

export const metadata = { title: 'Nossos Serviços | OBGP' };

export default function ServicosPage() {
  const servicos = [
    {
      icon: Coins,
      titulo: 'Captação de Recursos',
      texto: 'Identificação, prospecção e desenvolvimento de estratégias para obtenção de financiamentos junto a órgãos públicos, agências de fomento, organizações internacionais, fundações privadas e demais fontes de recursos.',
      color: 'icon-box-gold',
    },
    {
      icon: ClipboardCheck,
      titulo: 'Diagnóstico de Viabilidade',
      texto: 'Avaliação completa da viabilidade jurídica, fiscal, trabalhista, social, econômico-financeira e técnica dos projetos a serem propostos ou executados.',
      color: 'icon-box-blue',
    },
    {
      icon: FolderArchive,
      titulo: 'Gestão Documental',
      texto: 'Organização, controle e atualização da documentação institucional necessária para habilitação em processos seletivos e parcerias.',
      color: 'icon-box-green',
    },
    {
      icon: FileSpreadsheet,
      titulo: 'Elaboração Técnica de Projetos',
      texto: 'Elaboração de propostas técnicas completas e planos de trabalho, incluindo memória de cálculo, orçamento detalhado, plano de aplicação de recursos e cronograma.',
      color: 'icon-box-blue',
    },
    {
      icon: Landmark,
      titulo: 'Representação Institucional',
      texto: 'Representação junto a órgãos e instâncias da Administração Pública (Municipal, Estadual e Federal), conselhos, comissões e comitês deliberativos.',
      color: 'icon-box-gold',
    },
    {
      icon: Briefcase,
      titulo: 'Gestão de Contratos e Projetos',
      texto: 'Coordenação e acompanhamento da execução de contratos, convênios, termos de colaboração, termos de fomento e demais instrumentos congêneres.',
      color: 'icon-box-green',
    },
    {
      icon: Receipt,
      titulo: 'Prestação de Contas',
      texto: 'Organização e apresentação de relatórios técnicos e financeiros periódicos, observando os princípios da legalidade, transparência, economicidade e eficiência.',
      color: 'icon-box-blue',
    },
    {
      icon: GraduationCap,
      titulo: 'Qualificação Profissional',
      texto: 'Desenvolvimento e execução de programas de capacitação e treinamento profissional por meio de cursos, oficinas, workshops e atividades educativas direcionadas.',
      color: 'icon-box-gold',
    },
  ];

  return (
    <PublicLayout>
      {/* ════════ HERO ════════ */}
      <section className="glass-section-blue page-hero">
        <div className="container">
          <div className="hero-badge">
            <Sparkles size={14} />
            O QUE FAZEMOS
          </div>
          <h1>Nossos Serviços</h1>
          <p className="hero-subtitle">
            Soluções técnicas completas para qualificar a gestão de parcerias entre o poder público e a sociedade civil.
          </p>
        </div>
      </section>

      {/* ════════ GRID DE SERVIÇOS ════════ */}
      <section className="section-padding">
        <div className="container">
          <div className="grid-2">
            {servicos.map(({ icon: Icon, titulo, texto, color }, i) => (
              <div
                key={titulo}
                className={`glass-panel stagger-${i + 1}`}
                style={{ padding: 32, display: 'flex', gap: 20, alignItems: 'flex-start' }}
              >
                <div className={`icon-box ${color}`}>
                  <Icon size={24} />
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ marginBottom: 10, fontSize: '1.15rem' }}>{titulo}</h3>
                  <p style={{ color: 'var(--site-text-secondary)', lineHeight: 1.75, fontSize: '0.938rem' }}>
                    {texto}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════ CTA ════════ */}
      <section className="glass-section-blue" style={{ padding: '72px 0', textAlign: 'center' }}>
        <div className="container">
          <h2 style={{ color: 'white', marginBottom: 16 }}>Precisa de apoio para sua organização?</h2>
          <p style={{ color: 'rgba(255,255,255,0.7)', maxWidth: 540, margin: '0 auto 28px', lineHeight: 1.7 }}>
            Entre em contato para saber como podemos ajudar com a gestão de parcerias da sua OSC.
          </p>
          <a href="/contato" className="btn btn-white">
            Fale conosco <ArrowRight size={18} />
          </a>
        </div>
      </section>
    </PublicLayout>
  );
}
