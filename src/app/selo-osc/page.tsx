import PublicLayout from '../components/PublicLayout';
import { ShieldCheck, Scale, TrendingUp, FileCheck, Users } from 'lucide-react';

export const metadata = { title: 'Selo OSC Gestão de Parcerias | OBGP' };

export default function SeloOscPage() {
  const beneficios = [
    {
      icon: FileCheck,
      titulo: 'Regularização proativa',
      texto:
        'Adequação das OSCs nos eixos jurídico, fiscal, social, trabalhista, econômico-financeiro e técnico.',
    },
    {
      icon: Scale,
      titulo: 'Segurança jurídica',
      texto: 'Aumento da segurança jurídica nas parcerias firmadas com o poder público.',
    },
    {
      icon: TrendingUp,
      titulo: 'Eficiência e transparência',
      texto:
        'Melhoria da eficiência operacional e da transparência, facilitando a prestação de contas.',
    },
    {
      icon: ShieldCheck,
      titulo: 'Redução de riscos',
      texto:
        'Diminuição do risco de inabilitação em chamamentos públicos, incluindo editais de capacitação e fortalecimento institucional.',
    },
    {
      icon: Users,
      titulo: 'Fortalecimento institucional',
      texto:
        'Ampliação da capacidade das OSCs em promover inclusão, desenvolvimento social e participação cidadã, conforme diretrizes do MROSC.',
    },
  ];

  const paragraphStyle: React.CSSProperties = {
    fontSize: '1.05rem',
    lineHeight: 1.85,
    color: 'var(--site-text-secondary)',
    marginBottom: 20,
    textAlign: 'justify',
  };

  return (
    <PublicLayout>
      <section className="glass-section-blue" style={{ padding: '140px 0 80px', textAlign: 'center' }}>
        <div className="container">
          <h1 style={{ color: 'white', marginBottom: 20 }}>
            Projeto “Selo OSC Gestão de Parcerias”
          </h1>
          <p style={{ maxWidth: 780, margin: '0 auto', color: 'rgba(255,255,255,0.85)', fontSize: '1.15rem', lineHeight: 1.7 }}>
            Mecanismo independente de certificação que atesta a regularidade, a conformidade e a
            capacidade institucional das OSCs para celebração de parcerias com a administração pública.
          </p>
        </div>
      </section>

      {/* Caracterização do problema */}
      <section className="section-padding">
        <div className="container" style={{ maxWidth: 920 }}>
          <h2 style={{ marginBottom: 24 }}>Caracterização do problema</h2>

          <p style={paragraphStyle}>
            A celebração de parcerias entre Organizações da Sociedade Civil (OSCs) e a administração
            pública, regulada pela <strong>Lei Federal nº 13.019/2014</strong> (Marco Regulatório das
            Organizações da Sociedade Civil – MROSC), enfrenta entraves estruturais decorrentes da
            ausência de regularidade documental e de conformidade institucional das OSCs. Tais
            deficiências comprometem a habilitação necessária para a celebração de termos de
            colaboração, termos de fomento ou acordos de cooperação, restringindo o acesso a recursos
            públicos e fragilizando a execução de ações de interesse social.
          </p>

          <p style={paragraphStyle}>
            Irregularidades identificadas pela 1ª Promotoria de Justiça Especializada em Fundações e
            Entidades de Interesse Social do Ministério Público do Maranhão — como estatuto social
            desatualizado, desconhecimento das normas estatutárias, ausência de atas de eleição e
            posse, falta de reuniões dos órgãos diretivos e inexistência de prestação de contas —
            evidenciam padrões de inobservância da governança mínima exigida pelo ordenamento
            jurídico. Tais falhas colidem diretamente com o art. 2º da Lei nº 13.019/2014, que exige
            funcionamento regular e estatuto registrado para caracterização de uma OSC.
          </p>

          <p style={paragraphStyle}>
            Nos processos de chamamento público, como os Editais nº 01/2025/SG da Secretaria-Geral da
            Presidência da República e nº 01/2024 da Secretaria de Estado de Direitos Humanos e
            Participação Popular do Maranhão, a conformidade jurídica e documental é condição
            obrigatória para habilitação. Esses editais exigem certidões fiscais e trabalhistas,
            estatuto atualizado, atas da atual diretoria, comprovação de capacidade técnica e
            regularidade fiscal e financeira.
          </p>

          <p style={paragraphStyle}>
            Além disso, irregularidades fiscais — como a ausência de prestação de contas, falta de
            controle administrativo e inexistência de cobrança de taxas associativas — violam o dever
            de <em>accountability</em> previsto no art. 63 da Lei nº 13.019/2014 e nos dispositivos dos
            editais de chamamento, que demandam comprovação de capacidade econômico-financeira para o
            recebimento de recursos públicos.
          </p>

          <p style={paragraphStyle}>
            No âmbito social e de governança, a falta de reuniões dos corpos diretivo e fiscal, a
            inobservância das finalidades estatutárias e a ausência de convocação de assembleias
            comprometem a transparência e a legitimidade da entidade perante seus associados e perante
            o poder público. Essas falhas vão de encontro aos princípios de participação e governança
            do art. 3º do MROSC.
          </p>

          <p style={paragraphStyle}>
            Soma-se a isso a carência de regramento interno sobre processos eleitorais, a inexistência
            de mecanismos de controle gerencial e a ausência de diretrizes claras para funções e
            responsabilidades, fatores que impactam indiretamente a regularidade trabalhista e
            previdenciária. A qualificação econômico-financeira também é prejudicada pela falta de
            planejamento e pela insuficiência de mecanismos de prestação de contas recorrentes,
            exigências previstas no Decreto nº 8.726/2016 e reiteradas nos editais consultados.
          </p>

          <p style={paragraphStyle}>
            Por fim, a qualificação técnica das OSCs mostra-se deficitária, dado o desconhecimento das
            normas do MROSC e a dificuldade para elaboração de planos de trabalho, execução de metas e
            documentação de ações — problemas reconhecidos explicitamente nos editais de capacitação
            em gestão de parcerias, que apontam a necessidade de treinamento em governança,
            planejamento e interpretação normativa. Esse conjunto de irregularidades documentais e
            operacionais compromete a elegibilidade das OSCs, limita o acesso a recursos públicos,
            enfraquece sua atuação social e agrava desigualdades no campo das políticas de fomento à
            sociedade civil.
          </p>
        </div>
      </section>

      {/* Justificativa */}
      <section className="glass-section-white section-padding">
        <div className="container" style={{ maxWidth: 920 }}>
          <h2 style={{ marginBottom: 24 }}>Justificativa</h2>

          <p style={paragraphStyle}>
            O projeto <strong>“Selo OSC Gestão de Parcerias”</strong> fundamenta-se na necessidade de
            criar um mecanismo independente de certificação que ateste a regularidade, a conformidade
            e a capacidade institucional das OSCs para celebração de parcerias com a administração
            pública. A análise dos documentos demonstra que as OSCs enfrentam dificuldades
            significativas para atender aos requisitos legais exigidos pelo MROSC, pelos editais de
            chamamento público e pelos órgãos de controle.
          </p>

          <p style={paragraphStyle}>
            Diante das irregularidades recorrentes constatadas pelo Ministério Público do Maranhão e
            das exigências estabelecidas em editais de chamamento público, torna-se evidente a lacuna
            existente entre as boas práticas de governança institucional previstas na legislação e sua
            efetiva implementação pelas organizações. O selo proposto surge como instrumento capaz de
            reduzir essa assimetria, ao promover avaliação técnica e documental estruturada, orientada
            pelos requisitos previstos nos arts. 22 a 32 da Lei nº 13.019/2014 e pelos parâmetros do
            Decreto nº 8.726/2016.
          </p>

          <p style={paragraphStyle}>
            Assim, o selo constitui um mecanismo inovador de qualificação e reconhecimento
            institucional, capaz de elevar o padrão de confiabilidade, conformidade e governança das
            Organizações da Sociedade Civil, fortalecendo sua atuação e sua parceria com o Estado.
          </p>
        </div>
      </section>

      {/* Benefícios da certificação */}
      <section className="section-padding">
        <div className="container">
          <h2 style={{ marginBottom: 32, textAlign: 'center' }}>O que a certificação permite</h2>
          <div style={{ display: 'grid', gap: 28, gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
            {beneficios.map(({ icon: Icon, titulo, texto }) => (
              <div key={titulo} className="glass-panel" style={{ padding: 32, borderRadius: 'var(--site-radius-lg)' }}>
                <div style={{
                  width: 56, height: 56, borderRadius: 'var(--site-radius-md)',
                  background: 'var(--site-surface-blue)', color: 'var(--site-primary)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18,
                }}>
                  <Icon size={28} />
                </div>
                <h3 style={{ marginBottom: 12, fontSize: '1.2rem' }}>{titulo}</h3>
                <p style={{ color: 'var(--site-text-secondary)', lineHeight: 1.7 }}>{texto}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
