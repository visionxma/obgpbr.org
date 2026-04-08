import PublicLayout from '../components/PublicLayout';
import {
  Coins, ClipboardCheck, FolderArchive, FileSpreadsheet,
  Landmark, Briefcase, Receipt, GraduationCap,
} from 'lucide-react';

export const metadata = { title: 'Nossos Serviços | OBGP' };

export default function ServicosPage() {
  const servicos = [
    {
      icon: Coins,
      titulo: 'Captação de Recursos',
      texto:
        'Identificação, prospecção e desenvolvimento de estratégias para obtenção de financiamentos junto a órgãos públicos, agências de fomento, organizações internacionais, fundações privadas e demais fontes de recursos.',
    },
    {
      icon: ClipboardCheck,
      titulo: 'Diagnóstico de Viabilidade',
      texto:
        'Avaliação completa da viabilidade jurídica, fiscal, trabalhista, social, econômico-financeira e técnica dos projetos a serem propostos ou executados pela organização.',
    },
    {
      icon: FolderArchive,
      titulo: 'Gestão Documental',
      texto:
        'Organização, controle e atualização da documentação institucional necessária para habilitação em processos seletivos e parcerias, incluindo todas as regularidades exigidas.',
    },
    {
      icon: FileSpreadsheet,
      titulo: 'Elaboração Técnica de Projetos',
      texto:
        'Elaboração de propostas técnicas completas e planos de trabalho, incluindo: memória de cálculo da folha de pagamento e encargos; orçamento detalhado e plano de aplicação de recursos; cronograma físico-financeiro e de desembolso.',
    },
    {
      icon: Landmark,
      titulo: 'Representação Institucional',
      texto:
        'Representação da organização junto a órgãos e instâncias da Administração Pública (Municipal, Estadual e Federal), conselhos, comissões e comitês deliberativos.',
    },
    {
      icon: Briefcase,
      titulo: 'Gestão de Contratos e Projetos',
      texto:
        'Coordenação e acompanhamento da execução de contratos, convênios, termos de colaboração, termos de fomento e demais instrumentos congêneres.',
    },
    {
      icon: Receipt,
      titulo: 'Prestação de Contas',
      texto:
        'Organização e apresentação de relatórios técnicos e financeiros periódicos, prestação de contas de projetos e parcerias específicas, observando os princípios da legalidade, transparência, economicidade e eficiência, ressalvados os serviços exclusivos da contabilidade.',
    },
    {
      icon: GraduationCap,
      titulo: 'Qualificação Profissional para o Trabalho',
      texto:
        'Desenvolvimento e execução de programas de capacitação e treinamento profissional, visando aprimorar competências técnicas e comportamentais dos colaboradores das organizações, por meio de cursos, oficinas, workshops e atividades educativas direcionadas às necessidades específicas de cada projeto ou área de atuação.',
    },
  ];

  return (
    <PublicLayout>
      <section className="glass-section-blue" style={{ padding: '140px 0 80px', textAlign: 'center' }}>
        <div className="container">
          <h1 style={{ color: 'white', marginBottom: 20 }}>Nossos Serviços</h1>
          <p style={{ maxWidth: 720, margin: '0 auto', color: 'rgba(255,255,255,0.85)', fontSize: '1.15rem', lineHeight: 1.7 }}>
            Soluções técnicas para qualificar a gestão de parcerias entre o poder público e a sociedade civil.
          </p>
        </div>
      </section>

      <section className="section-padding">
        <div className="container" style={{ display: 'grid', gap: 28, gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
          {servicos.map(({ icon: Icon, titulo, texto }) => (
            <div key={titulo} className="glass-panel" style={{ padding: 32, borderRadius: 'var(--site-radius-lg)' }}>
              <div style={{
                width: 56, height: 56, borderRadius: 'var(--site-radius-md)',
                background: 'var(--site-surface-blue)', color: 'var(--site-primary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18,
              }}>
                <Icon size={28} />
              </div>
              <h3 style={{ marginBottom: 12, fontSize: '1.25rem' }}>{titulo}</h3>
              <p style={{ color: 'var(--site-text-secondary)', lineHeight: 1.7 }}>{texto}</p>
            </div>
          ))}
        </div>
      </section>
    </PublicLayout>
  );
}
