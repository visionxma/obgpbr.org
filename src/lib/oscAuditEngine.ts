export type Eixo = 'Jurídico' | 'Fiscal' | 'Social' | 'Trabalhista' | 'Técnico';

export interface CriterioConformidade {
  id: string;
  eixo: Eixo;
  nome: string;
  descricaoOriginal: string;
  critico: boolean;
  peso: number;
  planoAcao: string;
}

export interface AuditResult {
  oscId: string;
  scoreGeral: number;
  certificavel: boolean;
  falhasCriticas: CriterioConformidade[];
  falhasComuns: CriterioConformidade[];
  eixos: Record<Eixo, { score: number; total: number; percentual: number; }>
  markdownReport: string;
}

/**
 * Mapeamento das 11 irregularidades do MP-MA e 15 irregularidades técnicas (ENCCLA/Fiscais/Trabalhistas)
 * convertidas para "Critérios de Conformidade".
 */
export const CRITERIOS_AUDITORIA: CriterioConformidade[] = [
  // ================= EIXO JURÍDICO (Foco MP-MA) =================
  {
    id: 'JUR-01',
    eixo: 'Jurídico',
    nome: 'Conformidade Estatutária com a Lei 13.019/14 (MROSC)',
    descricaoOriginal: 'Estatuto não adaptado para recebimento de verbas públicas',
    critico: true, // Showstopper
    peso: 10,
    planoAcao: '```markdown\n**COMO CORRIGIR:**\n1. Convocar Assembleia Geral Extraordinária.\n2. Inserir nos objetivos os requisitos do Art. 33 da Lei 13.019/14.\n3. Prever obrigatoriamente a prestação de contas no estatuto.\n4. Registrar alteração em cartório.\n```',
  },
  {
    id: 'JUR-02',
    eixo: 'Jurídico',
    nome: 'Regularidade de Representação Legal Vigente',
    descricaoOriginal: 'Ata de eleição vencida ou sem quórum diretivo',
    critico: true, // Showstopper
    peso: 10,
    planoAcao: '```markdown\n**COMO CORRIGIR:**\n1. Realizar nova eleição conforme os prazos do estatuto (Assembleia Padrão).\n2. Emitir lista de presença assinada.\n3. Registrar nova ata com diretoria empossada no cartório competente e averbar no CNPJ via REDESIM.\n```',
  },
  {
    id: 'JUR-03',
    eixo: 'Jurídico',
    nome: 'Conformidade Estatutária com o Novo Código Civil',
    descricaoOriginal: 'Associação classificada equivocadamente genericamente como ONG',
    critico: false,
    peso: 3,
    planoAcao: '```markdown\n**COMO CORRIGIR:**\nRevisar o Estatuto adequando-o ao art. 54 do Código Civil, que define a estrutura de associações de fins não econômicos.\n```',
  },
  {
    id: 'JUR-04',
    eixo: 'Jurídico',
    nome: 'Adequação de Finalidades Institucionais',
    descricaoOriginal: 'Desvio de finalidade ou ausência de objetivos claros',
    critico: false,
    peso: 4,
    planoAcao: '```markdown\n**COMO CORRIGIR:**\nAlinhar as práticas contábeis e de projetos àquilo que está estritamente descrito no Cap. I do Estatuto Social. Suspender atividades desvinculadas.\n```',
  },
  {
    id: 'JUR-05',
    eixo: 'Jurídico',
    nome: 'Governança Corporativa e Fiscalização Ativa',
    descricaoOriginal: 'Conselho Fiscal não instalado ou inativo',
    critico: false,
    peso: 5,
    planoAcao: '```markdown\n**COMO CORRIGIR:**\n1. Nomear e dar posse aos membros do Conselho Fiscal eleitos em Assembleia.\n2. Emitir pareceres fiscais obrigatórios sobre as contas anuais da OSC.\n```',
  },
  {
    id: 'JUR-06',
    eixo: 'Jurídico',
    nome: 'Mitigação de Conflitos de Interesses',
    descricaoOriginal: 'Nepotismo e contratações familiares na diretoria',
    critico: true,
    peso: 8,
    planoAcao: '```markdown\n**COMO CORRIGIR:**\nRemover dos cargos comissionados, ou prestá-los como voluntariado, membros que tenham parentesco até o 3º grau com o poder público ou com dirigentes principais.\n```',
  },
  {
    id: 'JUR-07',
    eixo: 'Jurídico',
    nome: 'Regularidade Estrutural e Comprovação Física',
    descricaoOriginal: 'Endereço fictício ou inexistente (Atestado MP-MA irregular)',
    critico: true,
    peso: 8,
    planoAcao: '```markdown\n**COMO CORRIGIR:**\n1. Emitir AERFE (Atestado de Regular Funcionamento).\n2. Garantir infraestrutura física mínima instalada condizente com a visita do MP-MA ou prefeitura.\n```',
  },

  // ================= EIXO FISCAL (ENCCLA / RFB) =================
  {
    id: 'FIS-01',
    eixo: 'Fiscal',
    nome: 'Certificação de CND Federal, PGFN e INSS',
    descricaoOriginal: 'CND Federal e INSS com pendências',
    critico: true, // Showstopper
    peso: 10,
    planoAcao: '```markdown\n**COMO CORRIGIR:**\n1. Acessar o portal e-CAC da Receita Federal.\n2. Consultar o "Situação Fiscal" e parcelar eventuais débitos pendentes (Previdenciário ou não). Emitir certidão positiva com efeitos de negativa (CPEN).\n```',
  },
  {
    id: 'FIS-02',
    eixo: 'Fiscal',
    nome: 'Certificação de CND Estadual (SEFAZ)',
    descricaoOriginal: 'CND Estadual consta como omissa ou irregular',
    critico: false,
    peso: 4,
    planoAcao: '```markdown\n**COMO CORRIGIR:**\nEmitir CNDA e CND no portal da Receita Estadual e entregar declarações mensais esquecidas, mesmo as "Zeradas".\n```',
  },
  {
    id: 'FIS-03',
    eixo: 'Fiscal',
    nome: 'Certificação de CND Municipal',
    descricaoOriginal: 'Falta de cadastro ou taxas do município não pagas',
    critico: false,
    peso: 4,
    planoAcao: '```markdown\n**COMO CORRIGIR:**\nAbrir processo administrativo presencial na prefeitura atualizando alvarás (TFF/TLF) ou pedindo isenção por imunidade tributária.\n```',
  },
  {
    id: 'FIS-04',
    eixo: 'Fiscal',
    nome: 'Conformidade de Retenções na Fonte',
    descricaoOriginal: 'OSC não realiza a retenção devida em pagamentos de RPAs',
    critico: false,
    peso: 3,
    planoAcao: '```markdown\n**COMO CORRIGIR:**\n1. Contratar com notas fiscais sempre que possível.\n2. Se usar RPA (Autônomo), garantir a retenção de INSS e IRRF e recolher na competência.\n```',
  },
  {
    id: 'FIS-05',
    eixo: 'Fiscal',
    nome: 'Declarações Acessórias Base (RFB)',
    descricaoOriginal: 'Falta de entrega de ECF, DCTF, SEFIP ou e-Social',
    critico: false,
    peso: 5,
    planoAcao: '```markdown\n**COMO CORRIGIR:**\nEquipe de contabilidade deve auditar declarações em atraso dos últimos 5 anos e enviar por meio de certificado digital e-CNPJ.\n```',
  },

  // ================= EIXO TRABALHISTA =================
  {
    id: 'TRB-01',
    eixo: 'Trabalhista',
    nome: 'Certidão Negativa de Débitos Trabalhistas (CNDT)',
    descricaoOriginal: 'Ações judiciais com débitos em trânsito julgado',
    critico: true,
    peso: 7,
    planoAcao: '```markdown\n**COMO CORRIGIR:**\nQuitar o débito averbado e solicitar a baixa no banco nacional de devedores trabalhistas (BNDT).\n```',
  },
  {
    id: 'TRB-02',
    eixo: 'Trabalhista',
    nome: 'Regularidade Junto à CEF (CRF / FGTS)',
    descricaoOriginal: 'Atraso em recolhimento de FGTS de funcionários ou bloqueio bancário',
    critico: true,
    peso: 7,
    planoAcao: '```markdown\n**COMO CORRIGIR:**\nAcessar ou emitir uma confissão de dívida parcelada junto à Caixa Econômica e emitir a Certidão de Regularidade (CRF).\n```',
  },

  // ================= EIXO SOCIAL E OPERACIONAL =================
  {
    id: 'SOC-01',
    eixo: 'Social',
    nome: 'Transparência de Resultados Ativa',
    descricaoOriginal: 'Falta publicação de resultados sociais no site oficial ou plataformas',
    critico: false,
    peso: 3,
    planoAcao: '```markdown\n**COMO CORRIGIR:**\nInstaurar a política de publicação (mínimo a cada trimestre) de impactos alcançados nos canais oficiais (Lei de Acesso à Informação aplicável às OSCs).\n```',
  },
  {
    id: 'SOC-02',
    eixo: 'Social',
    nome: 'Integração a Redes e Conselhos',
    descricaoOriginal: 'Falta de registro nos conselhos (CMDCA, CMAS)',
    critico: false,
    peso: 4,
    planoAcao: '```markdown\n**COMO CORRIGIR:**\nIngressar com requerimento de registro nos Conselhos de Políticas Públicas inerentes à área da entidade.\n```',
  },

  // ================= EIXO TÉCNICO (Contábil / Conformidade ENCCLA) =================
  {
    id: 'TEC-01',
    eixo: 'Técnico',
    nome: 'Regularidade Plena de Prestação de Contas',
    descricaoOriginal: 'Prestação de contas reprovada em parcerias anteriores',
    critico: true, // Showstopper
    peso: 15,
    planoAcao: '```markdown\n**COMO CORRIGIR:**\n1. Identificar diligências ou TCEs abertos.\n2. Submeter devoluções de saldo financeiro ao erário ou justificativas técnicas robustas no tribunal de contas/órgão fomentador.\n```',
  },
  {
    id: 'TEC-02',
    eixo: 'Técnico',
    nome: 'Conformidade da Escrituração Contábil e Normas',
    descricaoOriginal: 'Desrespeito à norma técnica contábil ITG 2002',
    critico: false,
    peso: 6,
    planoAcao: '```markdown\n**COMO CORRIGIR:**\nAprovar balanços com parecer, apresentar Demonstração de Superávit e Déficit, relatórios detalhados com as devidas Notas Explicativas contábeis da OSC.\n```',
  },
  {
    id: 'TEC-03',
    eixo: 'Técnico',
    nome: 'Segregação e Integridade Patrimonial',
    descricaoOriginal: 'Mistura de verbas em contas bancárias; cartão corporativo em uso particular',
    critico: true,
    peso: 8,
    planoAcao: '```markdown\n**COMO CORRIGIR:**\n1. Encerrar imediatamente o uso de ativos/CNPJ da OSC em transações com finalidade estritamente particular (ENCCLA: indícios de lavagem de dinheiro e fraude mista).\n2. Adotar contas bancárias segregadas por parceria CEBAS/MROSC.\n```',
  },
  {
    id: 'TEC-04',
    eixo: 'Técnico',
    nome: 'Contabilização de Trabalho Voluntário',
    descricaoOriginal: 'Falta de mensuração no balanço do esforço de trabalho voluntário (Gratuidade)',
    critico: false,
    peso: 2,
    planoAcao: '```markdown\n**COMO CORRIGIR:**\nO Termo de Voluntariado deve ser monetizado pelo valor de mercado da hora do profissional e inserido nos Balanços Sociais conforme diretiva do CFC.\n```',
  }
];

/**
 * Motor de Auditoria do Selo OSC.
 * @param passedItems IDs (ex: 'JUR-01', 'FIS-01') que a OSC tem CONFORME.
 */
export function runOscAudit(passedItems: string[]): AuditResult {
  let scoreObtido = 0;
  let scoreTotal = 0;
  const falhasCriticas: CriterioConformidade[] = [];
  const falhasComuns: CriterioConformidade[] = [];
  
  const eixoStats: Record<Eixo, { score: number; total: number; percentual: number }> = {
    Jurídico: { score: 0, total: 0, percentual: 0 },
    Fiscal: { score: 0, total: 0, percentual: 0 },
    Social: { score: 0, total: 0, percentual: 0 },
    Trabalhista: { score: 0, total: 0, percentual: 0 },
    Técnico: { score: 0, total: 0, percentual: 0 },
  };

  for (const crit of CRITERIOS_AUDITORIA) {
    scoreTotal += crit.peso;
    eixoStats[crit.eixo].total += crit.peso;

    if (passedItems.includes(crit.id)) {
      scoreObtido += crit.peso;
      eixoStats[crit.eixo].score += crit.peso;
    } else {
      if (crit.critico) falhasCriticas.push(crit);
      else falhasComuns.push(crit);
    }
  }

  // Calculate percentages
  const eixos = ['Jurídico', 'Fiscal', 'Social', 'Trabalhista', 'Técnico'] as Eixo[];
  eixos.forEach(e => {
    const st = eixoStats[e];
    st.percentual = st.total > 0 ? Math.round((st.score / st.total) * 100) : 0;
  });

  const scoreGeral = Math.round((scoreObtido / scoreTotal) * 100);
  const certificavel = falhasCriticas.length === 0 && scoreGeral >= 70; // Hard rule: No critical failures + 70% min score

  // Generate Markdown
  let md = `# RELATÓRIO DE DIAGNÓSTICO AUDITORIA: SELO OSC\n`;
  md += `> Índice Geral de Conformidade Corporativa\n\n`;
  
  md += `## 🏁 VISÃO GERAL\n`;
  md += `- **SCORE GLOBAL:** ${scoreGeral} / 100\n`;
  md += `- **CAPACIDADE DE CERTIFICAÇÃO:** ${certificavel ? '✅ APTA AO SELO OSC' : '❌ NÃO CERTIFICÁVEL (REQUER MELHORIAS)'}\n`;
  if (falhasCriticas.length > 0) {
    md += `- **ALERTA VERMELHO:** Existem ${falhasCriticas.length} itens CRÍTICOS (Showstoppers) pendentes.\n`;
  }
  md += `\n---\n\n## 📊 DESEMPENHO POR EIXO\n`;
  eixos.forEach(e => {
    const st = eixoStats[e];
    const icon = st.percentual >= 80 ? '🟢' : st.percentual >= 50 ? '🟡' : '🔴';
    md += `- **${e}:** ${icon} ${st.percentual}% (${st.score}/${st.total} pts)\n`;
  });

  md += `\n---\n\n## 🛠️ PLANO DE AÇÃO PARA CORREÇÕES OBRIGATÓRIAS\n`;

  if (falhasCriticas.length === 0 && falhasComuns.length === 0) {
    md += `\n**Nenhuma falha encontrada! A OSC encontra-se em excelência de governança e regularidade.**\n`;
  } else {
    if (falhasCriticas.length > 0) {
      md += `### 🚨 BLOQUEIOS CRÍTICOS (SHOWSTOPPERS)\nEsses itens devem ser resolvidos com urgência máxima para habilitar repasses de verba pública e proteção jurídica dos dirigentes.\n\n`;
      falhasCriticas.forEach(f => {
        md += `#### ${f.id} — ${f.nome}\n`;
        md += `*Descrição Original:* ${f.descricaoOriginal}\n\n`;
        md += `${f.planoAcao}\n\n`;
      });
    }

    if (falhasComuns.length > 0) {
      md += `### ⚠️ RECOMENDAÇÕES DE BOAS PRÁTICAS E CONTINUIDADE\n\n`;
      falhasComuns.forEach(f => {
        md += `#### ${f.id} — ${f.nome}\n`;
        md += `*Descrição:* ${f.descricaoOriginal}\n\n`;
        md += `${f.planoAcao}\n\n`;
      });
    }
  }

  md += `\n<br>\n\n*Relatório automatizado pelo Motor de Inteligência Institucional do Selo OSC Gestão de Parcerias.*`;

  return {
    oscId: 'n/a',
    scoreGeral,
    certificavel,
    falhasCriticas,
    falhasComuns,
    eixos: eixoStats,
    markdownReport: md
  };
}
