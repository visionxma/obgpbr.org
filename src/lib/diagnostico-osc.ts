export type RiscoNivel = 'critico' | 'alto' | 'medio';
export type Eixo = 'juridico' | 'governanca' | 'financeiro' | 'fiscal' | 'operacional';
export type StatusItem = 'conforme' | 'irregular' | 'nao_se_aplica' | '';

export interface Irregularidade {
  id: number;
  eixo: Eixo;
  titulo: string;
  descricao: string;
  fundamento: string;
  risco: RiscoNivel;
  bloqueia_selo: boolean;
  acao_corretiva: string;
}

export const EIXOS: Record<Eixo, { label: string; descricao: string; cor: string; bg: string }> = {
  juridico:    { label: 'Jurídico/Estatutário',              descricao: 'Adequação normativa e regularidade dos atos constitutivos da entidade',           cor: '#dc2626', bg: '#fef2f2' },
  governanca:  { label: 'Governança e Eleições',             descricao: 'Estrutura de controle interno, reuniões e processos eleitorais',                  cor: '#7c3aed', bg: '#f5f3ff' },
  financeiro:  { label: 'Financeiro e Prestação de Contas',  descricao: 'Gestão de recursos públicos, documentação fiscal e accountability',               cor: '#d97706', bg: '#fffbeb' },
  fiscal:      { label: 'Fiscal e Tributário',               descricao: 'Regularidade perante Receita Federal, FGTS e órgãos previdenciários',             cor: '#0d9488', bg: '#f0fdfa' },
  operacional: { label: 'Operacional e RH',                  descricao: 'Estrutura física, pessoal, seguros e mecanismos de monitoramento e avaliação',    cor: '#2563eb', bg: '#eff6ff' },
};

export const EIXO_ORDER: Eixo[] = ['juridico', 'governanca', 'financeiro', 'fiscal', 'operacional'];

export const IRREGULARIDADES: Irregularidade[] = [
  /* ── 1. JURÍDICO/ESTATUTÁRIO ── */
  {
    id: 1, eixo: 'juridico', risco: 'medio', bloqueia_selo: false,
    titulo: 'Desconhecimento das Normas Estatutárias',
    descricao: 'Membros diretivos sem conhecimento adequado do Estatuto Social vigente e das normas que regem a entidade, comprometendo a legalidade das deliberações e a validade dos atos praticados.',
    fundamento: 'Art. 33, II da Lei 13.019/2014; Código Civil, art. 54',
    acao_corretiva: 'Promover capacitação obrigatória para toda a diretoria sobre o Estatuto Social, com registro em ata e lista de presença. Elaborar manual de governança interna de linguagem acessível.',
  },
  {
    id: 2, eixo: 'juridico', risco: 'alto', bloqueia_selo: false,
    titulo: 'Estatuto Social Desatualizado',
    descricao: 'Estatuto Social em desconformidade com a legislação vigente (Lei 13.019/2014 e Decreto 8.726/2016), sem as cláusulas obrigatórias de transparência ativa, prestação de contas e controle social.',
    fundamento: 'Art. 33, I da Lei 13.019/2014; Art. 67 do Decreto 8.726/2016',
    acao_corretiva: 'Convocar Assembleia Geral Extraordinária para reforma estatutária, incluindo todas as cláusulas obrigatórias do MROSC. Registrar a alteração no cartório competente e atualizar os dados no CNPJ.',
  },
  {
    id: 3, eixo: 'juridico', risco: 'alto', bloqueia_selo: false,
    titulo: 'Inobservância das Finalidades Estatutárias',
    descricao: 'Execução de atividades incompatíveis com as finalidades previstas no Estatuto Social ou descumprimento dos deveres funcionais pelos membros eleitos para órgãos de deliberação e fiscalização.',
    fundamento: 'Art. 39, II da Lei 13.019/2014; Código Civil, art. 59',
    acao_corretiva: 'Realizar auditoria interna para mapear as atividades executadas versus as finalidades estatutárias. Adequar o objeto social via reforma estatutária ou cessar atividades incompatíveis.',
  },
  {
    id: 11, eixo: 'juridico', risco: 'alto', bloqueia_selo: false,
    titulo: 'Ausência de Registros dos Atos Constitutivos',
    descricao: 'Falta de registro ou arquivamento adequado das atas de eleição e posse da diretoria, atas de reforma estatutária e demais documentos exigidos para habilitação em parcerias com a Administração Pública.',
    fundamento: 'Art. 34, I da Lei 13.019/2014; Art. 3º do Decreto 8.726/2016',
    acao_corretiva: 'Reconstituir o acervo documental com cartório e Receita Federal. Manter livro-ata numerado e rubricado. Implementar política de gestão documental com digitalização segura e indexada.',
  },
  {
    id: 15, eixo: 'juridico', risco: 'medio', bloqueia_selo: false,
    titulo: 'Ausência de Transparência Ativa',
    descricao: 'Descumprimento do dever de publicidade das informações institucionais, financeiras e dos termos de parceria em sítio eletrônico próprio ou portal de transparência, conforme exigência expressa da legislação.',
    fundamento: 'Art. 11 da Lei 13.019/2014; Art. 67, §2º do Decreto 8.726/2016',
    acao_corretiva: 'Criar ou adequar sítio eletrônico da entidade com publicação de: estatuto, atas, relatórios de atividades, demonstrativos financeiros e todos os termos de parceria vigentes.',
  },
  {
    id: 27, eixo: 'juridico', risco: 'critico', bloqueia_selo: true,
    titulo: 'Descaracterização da Imunidade/Isenção Tributária',
    descricao: 'Realização de atividades econômicas não segregadas gerando superávit não reinvestido integralmente na finalidade social, sujeitando a entidade à tributação pelo IRPJ e CSLL e ao risco de cassação da imunidade constitucional.',
    fundamento: 'Art. 14 do CTN; IN RFB 1.700/2017; Art. 12 da Lei 9.532/1997',
    acao_corretiva: 'Reestruturar a contabilidade para segregar receitas operacionais. Revisar aplicação integral do superávit na finalidade social. Solicitar revisão do enquadramento junto à Receita Federal com assessoria tributária especializada.',
  },

  /* ── 2. GOVERNANÇA E ELEIÇÕES ── */
  {
    id: 4, eixo: 'governanca', risco: 'alto', bloqueia_selo: false,
    titulo: 'Ausência de Controle Administrativo e Gerencial',
    descricao: 'Inexistência de sistemas, procedimentos ou manuais internos de controle administrativo, financeiro e operacional, gerando vulnerabilidade à corrupção e ineficiência na execução das parcerias.',
    fundamento: 'Art. 33, V da Lei 13.019/2014; ABNT NBR ISO 9001',
    acao_corretiva: 'Implementar Manual de Normas e Procedimentos Internos com fluxos de autorização, controles de estoque, gestão de caixa e alçadas de aprovação por valor. Implantar controles de acesso a sistemas.',
  },
  {
    id: 5, eixo: 'governanca', risco: 'medio', bloqueia_selo: false,
    titulo: 'Ausência de Cobrança de Taxa Associativa',
    descricao: 'Falta de cobrança e controle sistemático das mensalidades ou contribuições dos associados, comprometendo a sustentabilidade financeira e evidenciando fragilidade crítica na gestão associativa.',
    fundamento: 'Estatuto Social da entidade; Código Civil, art. 55',
    acao_corretiva: 'Regulamentar a taxa associativa em Assembleia Geral, definindo valores, periodicidade e mecanismos de cobrança. Implementar sistema de controle de inadimplência com notificação formal.',
  },
  {
    id: 6, eixo: 'governanca', risco: 'alto', bloqueia_selo: false,
    titulo: 'Ausência de Reuniões do Corpo Diretivo e Fiscal',
    descricao: 'Inobservância da periodicidade mínima de reuniões da Diretoria Executiva e do Conselho Fiscal prevista no Estatuto Social, comprometendo o controle interno e a tomada de decisão colegiada.',
    fundamento: 'Estatuto Social; Código Civil, art. 59, I; Art. 4º, IV do Decreto 8.726/2016',
    acao_corretiva: 'Retomar calendário oficial de reuniões com pauta definida, lavrar atas circunstanciadas e publicá-las. Implementar quórum mínimo, lista de presença e controle de deliberações.',
  },
  {
    id: 7, eixo: 'governanca', risco: 'alto', bloqueia_selo: false,
    titulo: 'Ausência de Convocação de Assembleia Geral',
    descricao: 'Supressão do direito de participação dos associados por omissão na convocação regular de Assembleia Geral Ordinária, impedindo deliberação sobre contas, eleições e alterações estatutárias.',
    fundamento: 'Código Civil, art. 59; Estatuto Social da entidade',
    acao_corretiva: 'Convocar AGO e AGE com antecedência mínima estatutária, por edital e comunicação direta a todos os associados. Lavrar atas e arquivá-las. Adotar calendário anual de assembleias publicado no site.',
  },
  {
    id: 9, eixo: 'governanca', risco: 'medio', bloqueia_selo: false,
    titulo: 'Ausência de Regramento para o Processo Eleitoral',
    descricao: 'Inexistência de regulamento eleitoral específico com prazos, critérios de elegibilidade, vedações e recursos, gerando insegurança jurídica nos processos de renovação de mandatos e risco de impugnação judicial.',
    fundamento: 'Estatuto Social; Código Civil, art. 59, §1º',
    acao_corretiva: 'Elaborar e aprovar em Assembleia um Regimento Eleitoral específico. Constituir Comissão Eleitoral independente. Publicar edital de convocação com antecedência mínima de 30 dias.',
  },
  {
    id: 10, eixo: 'governanca', risco: 'medio', bloqueia_selo: false,
    titulo: 'Anistia de Taxa Associativa em Períodos Eleitorais',
    descricao: 'Concessão irregular de anistia ou remissão de débitos associativos como instrumento de captação de votos, configurando prática de compra de apoio eleitoral e violação grave da isonomia entre associados.',
    fundamento: 'Estatuto Social; Código Civil, arts. 55 e 59; Princípio da Isonomia',
    acao_corretiva: 'Proibir expressamente no Regimento Eleitoral a anistia de débitos durante campanhas e períodos eleitorais. Adotar critérios objetivos, isonômicos e aprovados em Assembleia para qualquer benefício associativo.',
  },
  {
    id: 12, eixo: 'governanca', risco: 'alto', bloqueia_selo: false,
    titulo: 'Concentração de Poder e Ausência de Segregação de Funções',
    descricao: 'Acúmulo indevido de competências decisórias e executivas por um único dirigente ou núcleo restrito, eliminando controles internos e criando ambiente propício a irregularidades, desvios e fraudes.',
    fundamento: 'Art. 33, V, "c" da Lei 13.019/2014; Boas Práticas de Governança (IBGC)',
    acao_corretiva: 'Reformar o estatuto e os processos internos para garantir separação efetiva entre funções executivas, deliberativas e fiscalizatórias. Implementar política de dupla assinatura para todos os compromissos financeiros acima do limite mínimo.',
  },

  /* ── 3. FINANCEIRO E PRESTAÇÃO DE CONTAS ── */
  {
    id: 8, eixo: 'financeiro', risco: 'critico', bloqueia_selo: true,
    titulo: 'Ausência de Prestação de Contas',
    descricao: 'Omissão no dever legal de prestar contas dos recursos públicos recebidos, configurando violação grave ao princípio da accountability e ao dever de transparência, com risco de devolução integral dos valores e sanção de inidoneidade.',
    fundamento: 'Arts. 49 e ss. da Lei 13.019/2014; Art. 70 da CF/88; Art. 25 do Decreto 8.726/2016',
    acao_corretiva: 'Regularizar imediatamente a prestação de contas pendente junto ao órgão concedente, com assessoria jurídica especializada. Implementar rotina de prestação de contas periódica com escrituração contábil completa.',
  },
  {
    id: 16, eixo: 'financeiro', risco: 'critico', bloqueia_selo: true,
    titulo: 'Desvio de Finalidade dos Recursos Públicos',
    descricao: 'Aplicação de recursos públicos em despesas não previstas no Plano de Trabalho aprovado ou em finalidades diversas do objeto da parceria, configurando ilícito administrativo, civil e penal.',
    fundamento: 'Art. 39, II e art. 45 da Lei 13.019/2014; Lei 8.429/92 (LIA), art. 10',
    acao_corretiva: 'Suspender imediatamente os gastos irregulares e restituir os valores desviados com correção monetária. Formalizar aditivo ao Plano de Trabalho para remanejamento legal de rubricas, se ainda possível.',
  },
  {
    id: 17, eixo: 'financeiro', risco: 'critico', bloqueia_selo: true,
    titulo: 'Inexecução Total ou Parcial do Objeto da Parceria',
    descricao: 'Descumprimento das metas físicas e financeiras estabelecidas no Plano de Trabalho, sujeitando a entidade à rescisão unilateral, devolução integral dos recursos e sanção de inidoneidade com prazo de até 8 anos.',
    fundamento: 'Art. 42, VIII e art. 62 da Lei 13.019/2014; Art. 58, §2º do Decreto 8.726/2016',
    acao_corretiva: 'Elaborar plano de recuperação com cronograma de execução das metas pendentes e comunicar formalmente o concedente sobre o atraso, suas causas e medidas corretivas. Solicitar prorrogação de prazo se ainda cabível.',
  },
  {
    id: 18, eixo: 'financeiro', risco: 'alto', bloqueia_selo: false,
    titulo: 'Fracionamento Irregular de Despesas',
    descricao: 'Divisão artificial de despesas para evitar o processo de cotação ou licitação obrigatório, configurando burla aos controles de aquisição e possível fraude licitatória com responsabilidade administrativa e penal.',
    fundamento: 'Art. 45, §1º da Lei 13.019/2014; Lei 14.133/2021, art. 75, §7º',
    acao_corretiva: 'Implementar política de compras com planejamento anual, centralização de demandas e aplicação obrigatória dos limites legais de cotação. Auditar todos os contratos existentes para identificar fracionamentos.',
  },
  {
    id: 19, eixo: 'financeiro', risco: 'critico', bloqueia_selo: true,
    titulo: 'Pagamento com Documentação Fiscal Inidônea',
    descricao: 'Utilização de notas fiscais adulteradas, recibos genéricos sem identificação do serviço ou fornecedores fictícios para comprovação de despesas, configurando crimes de falsidade documental e estelionato.',
    fundamento: 'Art. 45, II da Lei 13.019/2014; CP, arts. 297 e 299; Lei 8.429/92, art. 10',
    acao_corretiva: 'Suspender todos os pagamentos com documentação suspeita e contratar auditoria documental independente. Implementar validação obrigatória de notas fiscais junto às SREFs estaduais antes de qualquer pagamento.',
  },
  {
    id: 20, eixo: 'financeiro', risco: 'alto', bloqueia_selo: false,
    titulo: 'Confusão Patrimonial entre Entidade e Dirigentes',
    descricao: 'Mistura entre bens, contas bancárias e patrimônio da entidade com os de seus dirigentes, comprometendo a contabilidade e a prestação de contas, além de ensejar responsabilização pessoal dos gestores.',
    fundamento: 'Art. 45, III da Lei 13.019/2014; Código Civil, art. 50 (desconsideração da personalidade jurídica)',
    acao_corretiva: 'Segregar imediatamente todos os ativos e passivos. Elaborar inventário patrimonial com laudo de avaliação. Implementar política de uso de bens com termo de cessão e controle formal de devoluções.',
  },
  {
    id: 21, eixo: 'financeiro', risco: 'alto', bloqueia_selo: false,
    titulo: 'Pagamento de Despesas Fora da Vigência da Parceria',
    descricao: 'Realização de despesas antes da assinatura ou após o término da vigência do instrumento de parceria, tornando-as automaticamente irregulares e passíveis de glosa total e devolução ao erário.',
    fundamento: 'Art. 45, I da Lei 13.019/2014; Art. 49, §3º do Decreto 8.726/2016',
    acao_corretiva: 'Auditar toda a movimentação financeira para identificar despesas fora da vigência. Devolver os valores ao concedente com correção monetária. Implantar controle de calendário de vigência nas rotinas financeiras.',
  },
  {
    id: 22, eixo: 'financeiro', risco: 'critico', bloqueia_selo: true,
    titulo: 'Ausência de Conta Bancária Exclusiva para a Parceria',
    descricao: 'Movimentação de recursos da parceria em conta bancária compartilhada com outras finalidades, impedindo o rastreamento das transações e tornando a prestação de contas integralmente irregular por vício formal insanável.',
    fundamento: 'Art. 51 da Lei 13.019/2014; Art. 39, VII do Decreto 8.726/2016',
    acao_corretiva: 'Abrir imediatamente conta bancária exclusiva e específica para cada parceria, na mesma instituição do concedente quando exigido. Nenhum recurso público pode ser gerido em conta compartilhada com outras finalidades.',
  },
  {
    id: 23, eixo: 'financeiro', risco: 'critico', bloqueia_selo: true,
    titulo: 'Contratação de Funcionários Fantasmas',
    descricao: 'Inclusão na folha de pagamento de trabalhadores fictícios ou de pessoas que não prestam serviço efetivo, com desvio sistemático dos recursos correspondentes para benefício particular dos dirigentes.',
    fundamento: 'CP, arts. 171 e 299; Lei 8.429/92, art. 10; Lei 13.019/2014, art. 45',
    acao_corretiva: 'Realizar auditoria de folha de pagamento com verificação in loco de todos os vínculos empregatícios. Em caso de confirmação, comunicar imediatamente ao Ministério Público e ao TCE/TCU.',
  },
  {
    id: 24, eixo: 'financeiro', risco: 'critico', bloqueia_selo: true,
    titulo: 'Desvio de Recursos de Emendas Parlamentares',
    descricao: 'Desvio ou malversação de recursos oriundos de emendas parlamentares impositivas, sujeitos a controle reforçado pelo TCU/TCE, cuja irregularidade enseja bloqueio orçamentário e responsabilização penal dos dirigentes.',
    fundamento: 'Lei 13.019/2014, art. 45; CF/88, art. 166, §§9º a 11; LC 101/2000 (LRF)',
    acao_corretiva: 'Apuração imediata com instauração de sindicância interna. Comunicação obrigatória ao TCE/TCU, ao Ministério Público e ao parlamentar autor da emenda. Devolução integral dos valores com atualização monetária.',
  },
  {
    id: 31, eixo: 'financeiro', risco: 'alto', bloqueia_selo: false,
    titulo: 'Ausência de Plano de Trabalho Detalhado',
    descricao: 'Execução de despesas sem vinculação a metas mensuráveis em Plano de Trabalho previamente aprovado, impossibilitando o monitoramento dos resultados e a aprovação formal das contas pelo órgão concedente.',
    fundamento: 'Art. 22 e art. 25 da Lei 13.019/2014; Art. 15 do Decreto 8.726/2016',
    acao_corretiva: 'Elaborar Plano de Trabalho detalhado com metas SMART, cronograma de desembolso, indicadores de resultado e responsáveis por cada ação. Submeter ao concedente para aprovação formal antes de qualquer gasto.',
  },
  {
    id: 33, eixo: 'financeiro', risco: 'alto', bloqueia_selo: false,
    titulo: 'Pagamento de Multas e Juros com Recursos da Parceria',
    descricao: 'Uso de recursos públicos da parceria para cobrir encargos moratórios decorrentes de atraso nos pagamentos da entidade, expressamente vedado pela legislação e que gera irregularidade automática na prestação de contas.',
    fundamento: 'Art. 45, §1º da Lei 13.019/2014; Art. 49, II do Decreto 8.726/2016',
    acao_corretiva: 'Identificar e segregar todos os pagamentos de multas e juros realizados com recursos públicos e devolver os valores ao concedente com correção. Implementar calendário de obrigações financeiras para evitar atrasos futuros.',
  },

  /* ── 4. FISCAL E TRIBUTÁRIO ── */
  {
    id: 28, eixo: 'fiscal', risco: 'critico', bloqueia_selo: true,
    titulo: 'Pendência de Certidões Negativas de Débitos (CNDs)',
    descricao: 'Ausência de certidões negativas válidas junto à Receita Federal, PGFN, FGTS e Justiça do Trabalho, o que impede legalmente o recebimento de qualquer recurso público e pode gerar o bloqueio do CNPJ da entidade.',
    fundamento: 'Art. 34 da Lei 13.019/2014; Art. 4º da Lei 8.036/90; Art. 29 da Lei 8.666/93',
    acao_corretiva: 'Levantar todos os débitos pendentes e elaborar plano de regularização. Negociar parcelamento nos programas REFIS/PERT disponíveis. Implementar sistema de alertas automáticos para monitorar validade de todas as certidões.',
  },
  {
    id: 29, eixo: 'fiscal', risco: 'alto', bloqueia_selo: false,
    titulo: 'Omissão na Entrega de Obrigações Acessórias (ECF/DCTF)',
    descricao: 'Falta de entrega da Escrituração Contábil Fiscal (ECF), DCTF ou demais obrigações acessórias, gerando multas automáticas, suspensão do CNPJ e risco de enquadramento como pessoa jurídica inativa.',
    fundamento: 'IN RFB 1.422/2013; IN RFB 2.004/2021; Lei 9.779/1999, art. 16',
    acao_corretiva: 'Contratar contador habilitado para regularizar todas as declarações em atraso junto à RFB. Aderir ao regime de parcelamento de multas disponível. Implementar calendário fiscal com alertas para todos os vencimentos.',
  },
  {
    id: 32, eixo: 'fiscal', risco: 'medio', bloqueia_selo: false,
    titulo: 'Inexistência de Certificação CNEAS ou CEBAS',
    descricao: 'Ausência de registro nos sistemas CNEAS (Assistência Social) ou CEBAS (Saúde/Educação/Assistência Social), impedindo o usufruto de imunidades previdenciárias patronais e o acesso a chamamentos públicos específicos.',
    fundamento: 'Lei 12.101/2009; Decreto 8.242/2014; Resolução CNAS nº 21/2016',
    acao_corretiva: 'Verificar a elegibilidade da entidade ao CEBAS ou CNEAS conforme a área de atuação. Organizar documentação exigida (demonstrativos, relatórios, atas) e protocolar o pedido junto ao ministério competente.',
  },

  /* ── 5. OPERACIONAL E RH ── */
  {
    id: 13, eixo: 'operacional', risco: 'alto', bloqueia_selo: false,
    titulo: 'Nepotismo na Contratação de Pessoal',
    descricao: 'Contratação de cônjuges, parentes ou pessoas com vínculo afetivo com dirigentes para cargos remunerados com recursos da parceria, sem processo seletivo idôneo, configurando nepotismo vedado pela Súmula Vinculante nº 13.',
    fundamento: 'Súmula Vinculante nº 13 do STF; Art. 39, VI da Lei 13.019/2014; Resolução CNJ nº 7/2005',
    acao_corretiva: 'Implementar processo seletivo público, objetivo e documentado para todas as contratações. Rever contratos existentes que configurem nepotismo. Publicar editais de seleção com critérios claros e isonômicos.',
  },
  {
    id: 14, eixo: 'operacional', risco: 'critico', bloqueia_selo: true,
    titulo: 'Remuneração de Dirigentes com Recursos Públicos sem Previsão Legal',
    descricao: 'Pagamento de remuneração, pró-labore ou qualquer vantagem pessoal a dirigentes com recursos de parcerias públicas, sem autorização expressa no Plano de Trabalho e fundamentação legal, configurando desvio de finalidade.',
    fundamento: 'Art. 46 da Lei 13.019/2014; Art. 84, §2º do Decreto 8.726/2016; IN RFB 1.700/2017',
    acao_corretiva: 'Cessar imediatamente os pagamentos irregulares e devolver os valores ao concedente. Para parcerias futuras, incluir a remuneração de dirigentes no Plano de Trabalho somente se legalmente permitida, com fundamentação jurídica documentada.',
  },
  {
    id: 25, eixo: 'operacional', risco: 'alto', bloqueia_selo: false,
    titulo: 'Inexistência de Sede Física Compatível',
    descricao: 'Ausência de instalações físicas adequadas e compatíveis com as atividades declaradas no objeto social ou na parceria, evidenciando capacidade operacional fictícia, insuficiente ou incompatível com o porte da entidade.',
    fundamento: 'Art. 33, II da Lei 13.019/2014; Portaria de habilitação do órgão concedente',
    acao_corretiva: 'Providenciar sede física compatível com comprovante de posse formal (contrato de locação registrado, cessão ou propriedade). Solicitar vistoria técnica do concedente e adequar as instalações às normas sanitárias e de segurança vigentes.',
  },
  {
    id: 26, eixo: 'operacional', risco: 'medio', bloqueia_selo: false,
    titulo: 'Ausência de Mecanismos de Monitoramento e Avaliação de Impacto',
    descricao: 'Inexistência de indicadores de resultado, metas mensuráveis e metodologia de avaliação de impacto social, tornando impossível comprovar a efetividade das ações financiadas com recursos públicos.',
    fundamento: 'Art. 58 da Lei 13.019/2014; Art. 55 do Decreto 8.726/2016',
    acao_corretiva: 'Implementar sistema de M&A com indicadores SMART, linha de base, metas intermediárias e relatórios periódicos de progresso. Adotar a Teoria da Mudança como referencial metodológico de planejamento.',
  },
  {
    id: 30, eixo: 'operacional', risco: 'medio', bloqueia_selo: false,
    titulo: 'Ausência de Seguros Obrigatórios para Voluntários e Funcionários',
    descricao: 'Falta de contratação de seguro de vida e/ou acidentes pessoais para voluntários e trabalhadores, expondo a entidade a responsabilidade civil ilimitada e violando obrigações legais específicas do MROSC.',
    fundamento: 'Art. 9º da Lei 9.608/1998 (Lei do Voluntariado); CLT, art. 7º, XXVIII; Art. 42, XIII da Lei 13.019/2014',
    acao_corretiva: 'Contratar apólice de seguro coletivo cobrindo todos os voluntários em atividade. Verificar necessidade de seguro de responsabilidade civil. Registrar a apólice no processo administrativo da parceria.',
  },
];

export type RespostasMap = Record<number, StatusItem>;

export interface ResultadoEixo {
  eixo: Eixo;
  total: number;
  conformes: number;
  irregulares: number;
  nao_aplicaveis: number;
  nao_respondidos: number;
  percentual: number;
}

export interface RelatorioResult {
  por_eixo: ResultadoEixo[];
  bloqueios_criticos: Irregularidade[];
  itens_alto_risco: Irregularidade[];
  itens_medio_risco: Irregularidade[];
  conformidade_geral: number;
  pode_obter_selo: boolean;
}

export function calcularRelatorio(respostas: RespostasMap): RelatorioResult {
  const por_eixo: ResultadoEixo[] = EIXO_ORDER.map(eixo => {
    const itens = IRREGULARIDADES.filter(i => i.eixo === eixo);
    const conformes = itens.filter(i => respostas[i.id] === 'conforme').length;
    const nao_aplicaveis = itens.filter(i => respostas[i.id] === 'nao_se_aplica').length;
    const irregulares = itens.filter(i => respostas[i.id] === 'irregular').length;
    const nao_respondidos = itens.filter(i => !respostas[i.id]).length;
    const avaliados = conformes + nao_aplicaveis + irregulares;
    const percentual = avaliados === 0 ? 0 : Math.round(((conformes + nao_aplicaveis) / avaliados) * 100);
    return { eixo, total: itens.length, conformes, irregulares, nao_aplicaveis, nao_respondidos, percentual };
  });

  const irregulares_ids = Object.entries(respostas)
    .filter(([, v]) => v === 'irregular')
    .map(([k]) => Number(k));

  const irregulares_list = IRREGULARIDADES.filter(i => irregulares_ids.includes(i.id));

  const bloqueios_criticos = irregulares_list.filter(i => i.bloqueia_selo);
  const itens_alto_risco = irregulares_list.filter(i => !i.bloqueia_selo && i.risco === 'alto');
  const itens_medio_risco = irregulares_list.filter(i => i.risco === 'medio');

  const total_respondidos = Object.values(respostas).filter(v => v !== '').length;
  const total_ok = Object.values(respostas).filter(v => v === 'conforme' || v === 'nao_se_aplica').length;
  const conformidade_geral = total_respondidos === 0 ? 0 : Math.round((total_ok / total_respondidos) * 100);

  return {
    por_eixo,
    bloqueios_criticos,
    itens_alto_risco,
    itens_medio_risco,
    conformidade_geral,
    pode_obter_selo: bloqueios_criticos.length === 0,
  };
}
