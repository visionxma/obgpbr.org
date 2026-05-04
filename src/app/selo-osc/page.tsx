import PublicLayout from '../components/PublicLayout';
import { ShieldCheck, Scale, TrendingUp, FileCheck, Users, Award, ArrowRight, BookOpen, FileText, Download, Mail, Phone, MapPin } from 'lucide-react';

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
      </section>

      {/* ═══ DIAGNÓSTICO MP/MA ═══ */}
      <section className="section-padding">
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

          {/* Document Body */}
          <article style={{
            background: '#fff',
            border: '1px solid var(--site-border)',
            borderRadius: 'var(--site-radius-xl)',
            boxShadow: 'var(--site-shadow-xs)',
            padding: 'clamp(24px, 5vw, 56px)',
            color: 'var(--site-text-primary)',
            lineHeight: 1.75,
            fontSize: '0.95rem',
          }}>
            {/* Cabeçalho institucional */}
            <header style={{ textAlign: 'center', paddingBottom: 24, marginBottom: 32, borderBottom: '2px solid var(--site-gold)' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.1em', color: 'var(--site-gold-dark)', textTransform: 'uppercase', marginBottom: 8 }}>
                Organização Brasil Gestão de Parcerias — OBGP
              </div>
              <h3 style={{ fontSize: 'clamp(1.2rem, 3vw, 1.6rem)', fontWeight: 900, color: 'var(--site-primary)', margin: 0, fontFamily: 'var(--font-heading)', letterSpacing: '-0.01em' }}>
                Regulamento do Selo OSC Gestão de Parcerias
              </h3>
            </header>

            {/* 1. Objetivo */}
            <section style={{ marginBottom: 32 }}>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--site-primary)', margin: '0 0 14px', fontFamily: 'var(--font-heading)' }}>
                1. Objetivo
              </h4>
              <p style={{ margin: '0 0 12px' }}>
                <strong>Art. 1º.</strong> O presente Regulamento tem por objetivo instituir e regulamentar o <strong>Selo OSC Gestão de Parcerias</strong>, funcionando como instrumento técnico de aferição de conformidade normativa e excelência em governança institucional.
              </p>
              <p style={{ margin: 0 }}>
                <strong>Parágrafo único.</strong> O Selo visa mitigar riscos jurídicos e operacionais, promovendo a cultura de <em>accountability</em> e transparência, em estrita observância ao <em>art. 63 da Lei nº 13.019/2014</em>, assegurando que as Organizações da Sociedade Civil (OSCs) possuam estrutura administrativa e técnica compatível com a execução de políticas públicas em regime de mútua cooperação.
              </p>
            </section>

            {/* 2. Aplicação e Categorias de Análise */}
            <section style={{ marginBottom: 32 }}>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--site-primary)', margin: '0 0 14px', fontFamily: 'var(--font-heading)' }}>
                2. Aplicação e Categorias de Análise
              </h4>
              <p style={{ margin: '0 0 12px' }}>
                <strong>Art. 2º.</strong> O escopo de aplicação deste Regulamento restringe-se às Organizações da Sociedade Civil, conforme definidas na legislação federal, que manifestem interesse voluntário em comprovar sua aptidão jurídica, técnica e operacional para a celebração de parcerias com a Administração Pública.
              </p>
              <p style={{ margin: '0 0 12px' }}>
                <strong>Art. 3º.</strong> A aferição para concessão do Selo dar-se-á por meio da análise exauriente das seguintes categorias:
              </p>
              <ol style={{ margin: 0, paddingLeft: 22, listStyle: 'none' }}>
                {[
                  { num: 'I.', titulo: 'Habilitação Jurídica', texto: 'Verificação da regularidade da constituição da OSC, incluindo estatuto social devidamente registrado, atas de eleição da diretoria e adequação do objeto social às atividades finalísticas propostas;' },
                  { num: 'II.', titulo: 'Regularidade Fiscal, Social e Trabalhista', texto: 'Comprovação da adimplência perante as fazendas públicas federal, estadual e municipal, bem como regularidade perante o FGTS e a Justiça do Trabalho;' },
                  { num: 'III.', titulo: 'Qualificação Econômico-Financeira', texto: 'Avaliação da saúde financeira através de balanços patrimoniais, demonstrações de resultados, cumprimento de obrigações contábeis (ITG 2002 R1) e efetividade do Conselho Fiscal;' },
                  { num: 'IV.', titulo: 'Qualificação Técnica', texto: 'Análise do portfólio institucional, atestados de capacidade técnica e comprovação de experiência prévia na execução de objetos similares ao de futuras parcerias;' },
                  { num: 'V.', titulo: 'Outros Registros', texto: 'Verificação de inscrições em conselhos de direitos (CMDCA, CMAS, etc.), alvarás de funcionamento e licenças sanitárias ou ambientais, conforme a natureza da atividade.' },
                ].map((it) => (
                  <li key={it.num} style={{ marginBottom: 8, paddingLeft: 0 }}>
                    <strong>{it.num} {it.titulo}:</strong> {it.texto}
                  </li>
                ))}
              </ol>
            </section>

            {/* 3. Referências Normativas */}
            <section style={{ marginBottom: 32 }}>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--site-primary)', margin: '0 0 14px', fontFamily: 'var(--font-heading)' }}>
                3. Referências Normativas
              </h4>
              <p style={{ margin: '0 0 12px' }}>
                <strong>Art. 4º.</strong> Este Regulamento fundamenta-se no ordenamento jurídico vigente, em especial:
              </p>
              <ul style={{ margin: 0, paddingLeft: 22, listStyle: 'none' }}>
                <li style={{ marginBottom: 6 }}><strong>I. Lei nº 13.019/2014</strong> (Marco Regulatório das Organizações da Sociedade Civil — MROSC);</li>
                <li style={{ marginBottom: 6 }}><strong>II. Decreto Federal nº 8.726/2016</strong> (Regulamentação do MROSC em âmbito federal);</li>
                <li style={{ marginBottom: 6 }}><strong>III. Decreto Federal nº 11.948/2024</strong> (Alterações e atualizações procedimentais nas parcerias);</li>
                <li><strong>IV. Normas Brasileiras de Contabilidade</strong> aplicáveis às entidades sem fins lucrativos.</li>
              </ul>
            </section>

            {/* 4. Definições e Siglas */}
            <section style={{ marginBottom: 32 }}>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--site-primary)', margin: '0 0 14px', fontFamily: 'var(--font-heading)' }}>
                4. Definições e Siglas
              </h4>
              <p style={{ margin: '0 0 12px' }}>
                <strong>Art. 5º.</strong> Para os fins deste Regulamento, adotam-se as seguintes definições:
              </p>
              <ul style={{ margin: 0, paddingLeft: 22, listStyle: 'none' }}>
                <li style={{ marginBottom: 8 }}><strong>I. OSC:</strong> Organização da Sociedade Civil, nos termos do art. 2º, inciso I, da Lei nº 13.019/2014;</li>
                <li style={{ marginBottom: 8 }}><strong>II. MROSC:</strong> Marco Regulatório das Organizações da Sociedade Civil;</li>
                <li style={{ marginBottom: 8 }}><strong>III. Certificação Independente:</strong> Processo de análise e validação realizado por entidade terceira desimpedida, visando atestar a conformidade da OSC;</li>
                <li style={{ marginBottom: 8 }}><strong>IV. Selo:</strong> Distintivo de qualidade e conformidade concedido após aprovação em processo avaliativo;</li>
                <li><strong>V. Relatório de Conformidade (RC):</strong> Documento técnico conclusivo que detalha os achados da auditoria e fundamenta a decisão de concessão ou denegação do Selo.</li>
              </ul>
            </section>

            {/* 5. Responsabilidades */}
            <section style={{ marginBottom: 32 }}>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--site-primary)', margin: '0 0 14px', fontFamily: 'var(--font-heading)' }}>
                5. Responsabilidades
              </h4>
              <p style={{ margin: '0 0 8px' }}>
                <strong>Art. 6º. Compete à Certificadora:</strong>
              </p>
              <ul style={{ margin: '0 0 16px', paddingLeft: 22, listStyle: 'none' }}>
                <li style={{ marginBottom: 6 }}><strong>a)</strong> Atuar com imparcialidade, integridade e rigor técnico na análise documental;</li>
                <li style={{ marginBottom: 6 }}><strong>b)</strong> Emitir o Relatório de Conformidade (RC) no prazo de 30 (trinta) dias após o recebimento da documentação completa;</li>
                <li><strong>c)</strong> Garantir o sigilo das informações sensíveis e dados protegidos pela LGPD.</li>
              </ul>
              <p style={{ margin: '0 0 8px' }}>
                <strong>Art. 7º. Compete à OSC Solicitante:</strong>
              </p>
              <ul style={{ margin: 0, paddingLeft: 22, listStyle: 'none' }}>
                <li style={{ marginBottom: 6 }}><strong>a)</strong> Fornecer informações verídicas e documentos autênticos, sob as penas da lei;</li>
                <li style={{ marginBottom: 6 }}><strong>b)</strong> Manter atualizados seus registros e certidões durante todo o período de vigência do Selo;</li>
                <li><strong>c)</strong> Facilitar o acesso da equipe técnica a sistemas e arquivos necessários à validação.</li>
              </ul>
            </section>

            {/* 6. Detalhamento das Atividades */}
            <section style={{ marginBottom: 32 }}>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--site-primary)', margin: '0 0 14px', fontFamily: 'var(--font-heading)' }}>
                6. Detalhamento das Atividades
              </h4>
              <p style={{ margin: '0 0 12px' }}>
                <strong>Art. 8º.</strong> O procedimento operacional para obtenção do Selo observará as seguintes fases:
              </p>
              <ol style={{ margin: 0, paddingLeft: 22, listStyle: 'none' }}>
                {[
                  { num: 'I.', titulo: 'Solicitação', texto: 'A OSC formaliza o pedido via sistema eletrônico, anexando o rol de documentos previstos no Art. 3º deste Regulamento;' },
                  { num: 'II.', titulo: 'Triagem', texto: 'Conferência preliminar da completude documental. Caso faltem documentos, a OSC será notificada para saneamento em até 05 (cinco) dias úteis;' },
                  { num: 'III.', titulo: 'Análise Técnica', texto: 'Avaliação de mérito jurídico, contábil e técnico. Nesta fase, podem ser solicitadas diligências ou entrevistas com os gestores da OSC;' },
                  { num: 'IV.', titulo: 'Emissão do RC', texto: 'Elaboração do Relatório de Conformidade, com parecer conclusivo pela concessão, concessão com ressalvas ou denegação;' },
                  { num: 'V.', titulo: 'Homologação e Outorga', texto: 'Publicação do resultado e entrega do Selo digital, com validade de 12 (doze) meses.' },
                ].map((it) => (
                  <li key={it.num} style={{ marginBottom: 8 }}>
                    <strong>{it.num} {it.titulo}:</strong> {it.texto}
                  </li>
                ))}
              </ol>
            </section>

            {/* 7. Gestão de Registros (RC) */}
            <section style={{ marginBottom: 32 }}>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--site-primary)', margin: '0 0 14px', fontFamily: 'var(--font-heading)' }}>
                7. Gestão de Registros (RC)
              </h4>
              <p style={{ margin: '0 0 12px' }}>
                <strong>Art. 9º.</strong> O Relatório de Conformidade (RC) é o registro mestre do processo de certificação.
              </p>
              <p style={{ margin: '0 0 10px' }}>
                <strong>§ 1º. Armazenamento:</strong> Os registros serão mantidos em repositório digital seguro, com criptografia de ponta a ponta e controle de acesso restrito aos técnicos responsáveis.
              </p>
              <p style={{ margin: '0 0 10px' }}>
                <strong>§ 2º. Proteção:</strong> A Certificadora implementará medidas de segurança para evitar a alteração, perda ou acesso não autorizado aos dados das OSCs, em conformidade com a Lei Geral de Proteção de Dados (LGPD).
              </p>
              <p style={{ margin: 0 }}>
                <strong>§ 3º. Retenção:</strong> O RC e os documentos comprobatórios serão arquivados pelo prazo mínimo de 10 (dez) anos após o término da validade do Selo, para fins de fiscalização pelos órgãos de controle (Tribunais de Contas e Ministério Público).
              </p>
            </section>

            {/* 8. Controle de Alterações */}
            <section style={{ marginBottom: 32 }}>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--site-primary)', margin: '0 0 14px', fontFamily: 'var(--font-heading)' }}>
                8. Controle de Alterações
              </h4>
              <p style={{ margin: '0 0 16px' }}>
                <strong>Art. 10.</strong> Este Regulamento poderá ser revisado anualmente ou sempre que houver alteração legislativa que impacte o regime jurídico das parcerias.
              </p>
              <div style={{ overflowX: 'auto', borderRadius: 'var(--site-radius-md)', border: '1px solid var(--site-border)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                  <thead>
                    <tr style={{ background: 'var(--site-surface-warm)' }}>
                      <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 800, color: 'var(--site-primary)', borderBottom: '1px solid var(--site-border)' }}>Versão</th>
                      <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 800, color: 'var(--site-primary)', borderBottom: '1px solid var(--site-border)' }}>Data</th>
                      <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 800, color: 'var(--site-primary)', borderBottom: '1px solid var(--site-border)' }}>Descrição da Alteração</th>
                      <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 800, color: 'var(--site-primary)', borderBottom: '1px solid var(--site-border)' }}>Responsável</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={{ padding: '12px 14px', verticalAlign: 'top' }}>1.0</td>
                      <td style={{ padding: '12px 14px', verticalAlign: 'top', whiteSpace: 'nowrap' }}>30/04/2026</td>
                      <td style={{ padding: '12px 14px', verticalAlign: 'top' }}>Emissão inicial e adequação ao Decreto nº 11.948/2024.</td>
                      <td style={{ padding: '12px 14px', verticalAlign: 'top' }}>Equipe Técnica Administrador RT e Contador RT.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* Rodapé / Assinatura */}
            <footer style={{
              marginTop: 40,
              paddingTop: 28,
              borderTop: '1px solid var(--site-border)',
              textAlign: 'center',
              color: 'var(--site-text-secondary)',
              fontSize: '0.82rem',
              lineHeight: 1.7,
            }}>
              <div style={{ fontWeight: 800, color: 'var(--site-primary)', fontSize: '0.92rem', marginBottom: 12 }}>
                Organização Brasil Gestão de Parcerias — OBGP
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '6px 18px' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <MapPin size={13} /> Avenida L, Nº 10 D, Quadra 32, Bairro Morada do Sol — Paço do Lumiar/MA, CEP 65130-000
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <Mail size={13} /> contato.org.obgp@gmail.com
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <Phone size={13} /> (98) 9 8710-0001
                </span>
              </div>
            </footer>
          </article>
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
