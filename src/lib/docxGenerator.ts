import PizZip from 'pizzip';

/**
 * Gerador de Relatório de Conformidade DOCX — OBGP
 *
 * Estratégia: Carrega o template .docx original (sem placeholders),
 * manipula o XML interno (word/document.xml) diretamente para preencher
 * as células vazias das tabelas com os dados reais da OSC.
 *
 * Vantagens:
 * - Template permanece editável no Word, sem tags especiais
 * - Controle preciso sobre qual célula recebe qual dado
 * - Sem dependência de docxtemplater
 */

/* ── Tipos ── */
interface ChecklistRow {
  label: string;
  status: string;
  codigo: string;
  emissao: string;
  validade: string;
  analise: string;
}

interface RelatorioData {
  // Entity data
  cnpj: string;
  natureza_juridica: string;
  razao_social: string;
  nome_fantasia: string;
  endereco: string;
  data_abertura: string;
  email: string;
  telefone: string;
  responsavel: string;
  // Report metadata
  numero_relatorio: string;
  codigo_controle: string;
  data_hoje: string;
  municipio_uf: string;
  // Checklist sections (arrays of rows)
  habilitacao_juridica: ChecklistRow[];
  regularidade_fiscal: ChecklistRow[];
  qualificacao_economica: ChecklistRow[];
  qualificacao_tecnica: ChecklistRow[];
  outros_registros: ChecklistRow[];
  // Conclusion
  status_final: string;
  observacao_admin?: string;
}

/* ── Helpers XML ── */
function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Extrai todo o texto de um trecho de XML, removendo tags.
 */
function stripXmlTags(xml: string): string {
  return xml.replace(/<[^>]+>/g, '');
}

/**
 * Substitui texto que pode estar separado em múltiplos <w:r>/<w:t> no Word XML.
 * Word frequentemente divide texto em runs separados por causa de revisões/formatação.
 * Ex: "1-DT.MM" pode estar como <w:t>1-</w:t><w:t>DT</w:t><w:t>.</w:t><w:t>MM</w:t>
 */
function replaceSpanningText(xml: string, target: string, replacement: string): string {
  // 1. Find all <w:t> elements
  const wtRegex = /<w:t(?:\s[^>]*)?>([^<]*)<\/w:t>/g;
  const segments: Array<{ xmlStart: number; xmlEnd: number; text: string; fullMatch: string }> = [];
  let m: RegExpExecArray | null;
  while ((m = wtRegex.exec(xml)) !== null) {
    segments.push({ xmlStart: m.index, xmlEnd: m.index + m[0].length, text: m[1], fullMatch: m[0] });
  }

  // 2. Build concatenated text with position map
  let concat = '';
  const posMap: Array<{ segIdx: number; charStart: number; charEnd: number }> = [];
  for (let i = 0; i < segments.length; i++) {
    const start = concat.length;
    concat += segments[i].text;
    posMap.push({ segIdx: i, charStart: start, charEnd: concat.length });
  }

  // 3. Find target in concatenated text
  const targetIdx = concat.indexOf(target);
  if (targetIdx === -1) return xml; // not found
  const targetEnd = targetIdx + target.length;

  // 4. Find which segments are involved
  const involved: number[] = [];
  for (let i = 0; i < posMap.length; i++) {
    if (posMap[i].charEnd > targetIdx && posMap[i].charStart < targetEnd) {
      involved.push(i);
    }
  }
  if (involved.length === 0) return xml;

  // 5. Replace from end to start (preserves earlier indices)
  let result = xml;
  for (let ii = involved.length - 1; ii >= 0; ii--) {
    const segIdx = involved[ii];
    const seg = segments[segIdx];
    const p = posMap[segIdx];

    let newText: string;
    if (ii === 0 && involved.length === 1) {
      // Single segment: prefix + replacement + suffix
      const prefixLen = targetIdx - p.charStart;
      const suffixStart = targetEnd - p.charStart;
      newText = seg.text.substring(0, prefixLen) + replacement + seg.text.substring(suffixStart);
    } else if (ii === 0) {
      // First of multiple: keep prefix, add replacement
      const prefixLen = targetIdx - p.charStart;
      newText = seg.text.substring(0, prefixLen) + replacement;
    } else if (ii === involved.length - 1) {
      // Last of multiple: keep suffix only
      const suffixStart = targetEnd - p.charStart;
      newText = suffixStart < seg.text.length ? seg.text.substring(suffixStart) : '';
    } else {
      // Middle: clear entirely
      newText = '';
    }

    // Rebuild <w:t> element preserving attributes
    const tagClose = seg.fullMatch.indexOf('>');
    const openTag = seg.fullMatch.substring(0, tagClose + 1);
    const newElement = `${openTag}${escapeXml(newText)}</w:t>`;
    result = result.substring(0, seg.xmlStart) + newElement + result.substring(seg.xmlEnd);

    // Adjust xmlStart/xmlEnd of earlier segments (already processed backward, so this only
    // matters if we need them — but since we go backward, we don't)
  }

  return result;
}

/**
 * Cria um <w:r> com texto usando a fonte padrão do template (Arial Narrow 10pt).
 */
function makeTextRun(text: string, bold = false): string {
  const boldXml = bold ? '<w:b/><w:bCs/>' : '';
  return `<w:r><w:rPr><w:rFonts w:ascii="Arial Narrow" w:hAnsi="Arial Narrow"/>${boldXml}<w:sz w:val="20"/><w:szCs w:val="20"/></w:rPr><w:t xml:space="preserve">${escapeXml(text)}</w:t></w:r>`;
}

/**
 * Injeta texto dentro de uma célula <w:tc>...</w:tc> que está vazia o contém apenas "<w:p>".
 * Encontra o </w:p> final e injeta o <w:r> antes dele.
 */
function injectTextIntoCell(cellXml: string, text: string, bold = false): string {
  const lastPEnd = cellXml.lastIndexOf('</w:p>');
  if (lastPEnd === -1) return cellXml;
  return cellXml.substring(0, lastPEnd) + makeTextRun(text, bold) + cellXml.substring(lastPEnd);
}

/**
 * Retorna todas as posições [start, end] de <w:tc>...</w:tc> dentro de um trecho de XML.
 * Usa busca simples: Word XML não aninha <w:tc> dentro de <w:tc>.
 * Cuidado: <w:tcPr>, <w:tcW> etc. NÃO são células — precisamos match exato de <w:tc> ou <w:tc ...>.
 */
function findAllCells(trXml: string): Array<{ start: number; end: number }> {
  const cells: Array<{ start: number; end: number }> = [];
  // Regex matches <w:tc> or <w:tc followed by space (attributes), but NOT <w:tcPr, <w:tcW etc.
  const openRegex = /<w:tc(?:>| )/g;
  let match: RegExpExecArray | null;
  while ((match = openRegex.exec(trXml)) !== null) {
    const tcStart = match.index;
    const tcEnd = trXml.indexOf('</w:tc>', tcStart);
    if (tcEnd === -1) break;
    cells.push({ start: tcStart, end: tcEnd + 7 }); // 7 = '</w:tc>'.length
    openRegex.lastIndex = tcEnd + 7; // continue searching after this cell
  }
  return cells;
}

/**
 * Encontra todas as table rows <w:tr>...</w:tr> no documento XML.
 */
function findAllRows(xml: string): Array<{ start: number; end: number; content: string }> {
  const rows: Array<{ start: number; end: number; content: string }> = [];
  let pos = 0;
  while (true) {
    let trStart = xml.indexOf('<w:tr ', pos);
    if (trStart === -1) trStart = xml.indexOf('<w:tr>', pos);
    if (trStart === -1) break;
    const trEnd = xml.indexOf('</w:tr>', trStart);
    if (trEnd === -1) break;
    const endPos = trEnd + 7;
    rows.push({ start: trStart, end: endPos, content: xml.substring(trStart, endPos) });
    pos = endPos;
  }
  return rows;
}

/* ── Labels do template que mapeiam para as checklist rows ── */
/* Esses são os textos EXATOS que existem no XML do template original */

const TEMPLATE_HJ_LABELS = [
  'Cartão CNPJ',
  'QSA Cartão CNPJ',
  'Cadastro Contribuinte Municipal/Estadual',
  'Alvará de licença e funcionamento',
  'Estatuto Social',
  'Ata Constituição/Fundação',
  'Ata Eleição e Posse atual',
  'Relação de Membros atual',
  'Comprovante endereço entidade',
  'RG/CPF representante legal',
  'Comprovante endereço representante legal',
];

const TEMPLATE_RF_LABELS = [
  'CND Federal',
  'CND Estadual',
  'CNDA Estadual',
  'CND Municipal',
  'CR FGTS',
  'CND Trabalhista',
  'CND CAEMA',
];

const TEMPLATE_QE_LABELS = [
  'Certidão de Falência e Concordata',
  'Registro e regularidade Contador',
  'Termo de abertura',
  'Balanço Patrimonial',
  'Demonstração do Superavit e Déficit',
  'Demonstração das Mutações do Patrimonio Líquido',
  'Demonstração dos Fluxos de Caixa',
  'Notas Explicativas dos dois últimos exercícios sociais',
  'Termo de encerramento',
  'Ata aprovando prestação de contas com parecer do conselho fiscal dos últimos dois exercícios sociais da entidade.',
];

const TEMPLATE_OR_LABELS = [
  'Atestado de Existência e Regular Funcionamento',
  'Cadastro Nacional de Entidades de Assistência Social',
  'Cadastro Nacional de Estabelecimento de Saúde',
  'Conselho Municipal da Assistência Social',
  'Conselho Municipal dos Direitos da Criança e Adolescente',
  'Alvará de autorização sanitária',
  'Sistema de Cadastramento Unificado de Fornecedores',
  'Utilidade Pública Municipal',
  'Utilidade Pública Estadual',
  'Registro e Regularidade no Conselho Classe',
  'Registro e Regularidade do Profissional RT',
];

/* ── Entity Field Labels (existentes no template) ── */
const ENTITY_LABELS: Record<string, string> = {
  'CNPJ:': 'cnpj',
  'NATUREZA JURÍDICA:': 'natureza_juridica',
  'RAZÃO SOCIAL:': 'razao_social',
  'NOME FANTASIA:': 'nome_fantasia',
  'ENDEREÇO:': 'endereco',
  'DATA ABERTURA CNPJ:': 'data_abertura',
  'E-MAIL:': 'email',
  'TELEFONE:': 'telefone',
};

/* ═══════════════════════════════════════════════════════════════════
   FUNÇÃO PRINCIPAL
   ═══════════════════════════════════════════════════════════════════ */
export async function gerarRelatorioDocx(dados: Record<string, any>): Promise<Blob> {
  // 1. Load the original clean template
  const response = await fetch('/docs/MODEL_RELATORIO_CONFORMIDADE_RCN_ANOMESDIAOBGP_REV02_24.04.2026.docx');
  if (!response.ok) {
    throw new Error('Não foi possível carregar o template do relatório.');
  }
  const arrayBuffer = await response.arrayBuffer();
  const zip = new PizZip(arrayBuffer);

  // 2. Extract XML
  const docFile = zip.file('word/document.xml');
  if (!docFile) throw new Error('Template DOCX inválido: document.xml não encontrado.');
  let xml = docFile.asText();

  const d = dados as RelatorioData;

  // ── 3. Fill entity data table (rows with 2 cells: label + empty) ──
  const allRows = findAllRows(xml);

  // Process from END to START so indices stay valid after injections
  for (let ri = allRows.length - 1; ri >= 0; ri--) {
    const row = allRows[ri];
    const cells = findAllCells(row.content);
    if (cells.length !== 2) continue; // Entity table has exactly 2 columns

    const cell1Xml = row.content.substring(cells[0].start, cells[0].end);
    const cell1Text = stripXmlTags(cell1Xml).trim();

    const fieldKey = ENTITY_LABELS[cell1Text];
    if (!fieldKey) continue;

    const value = (d as any)[fieldKey] || 'Não informado';
    const cell2Xml = row.content.substring(cells[1].start, cells[1].end);
    const newCell2 = injectTextIntoCell(cell2Xml, value);

    // Rebuild the row
    const newRowContent = row.content.substring(0, cells[1].start) + newCell2 + row.content.substring(cells[1].end);
    xml = xml.substring(0, row.start) + newRowContent + xml.substring(row.end);
  }

  // ── 4. Fill checklist tables (rows with 5 cells: description + 4 empty) ──
  // Re-parse rows after entity data injection
  const allRowsPass2 = findAllRows(xml);

  // Build a map of template label -> checklist section + index
  type SectionMapping = { section: ChecklistRow[]; index: number };
  const labelMap = new Map<string, SectionMapping>();

  function mapLabels(labels: string[], section: ChecklistRow[]) {
    labels.forEach((label, idx) => {
      if (idx < section.length) {
        labelMap.set(label.toLowerCase(), { section, index: idx });
      }
    });
  }

  mapLabels(TEMPLATE_HJ_LABELS, d.habilitacao_juridica || []);
  mapLabels(TEMPLATE_RF_LABELS, d.regularidade_fiscal || []);
  mapLabels(TEMPLATE_QE_LABELS, d.qualificacao_economica || []);
  // Qualificação Técnica: rows 40-46 are EMPTY (no labels in template)
  // We'll handle them separately below
  mapLabels(TEMPLATE_OR_LABELS, d.outros_registros || []);

  // Process 5-column rows from END to START
  for (let ri = allRowsPass2.length - 1; ri >= 0; ri--) {
    const row = allRowsPass2[ri];
    const cells = findAllCells(row.content);
    if (cells.length !== 5) continue;

    const cell1Xml = row.content.substring(cells[0].start, cells[0].end);
    const cell1Text = stripXmlTags(cell1Xml).trim().toLowerCase();

    // Skip header rows (containing "Descrição documento")
    if (cell1Text.includes('descrição documento') || cell1Text.includes('descri')) continue;

    // Must have at least some text to match against, prevent empty string matching hijacking!
    if (cell1Text.length === 0) continue;

    // Try to match by label
    let matched: SectionMapping | undefined;
    for (const [key, val] of labelMap.entries()) {
      // Direct inclusion OR reverse inclusion but only if the text is substantial (avoid "a" matching)
      if (cell1Text.includes(key) || (cell1Text.length > 5 && key.includes(cell1Text))) {
        matched = val;
        labelMap.delete(key); // Remove to avoid duplicate matches
        break;
      }
    }

    if (!matched) continue;

    const checkRow = matched.section[matched.index];
    if (!checkRow) continue;

    // Fill cells 2-5 from RIGHT to LEFT (preserves indices)
    let newContent = row.content;
    const fillData = [
      checkRow.analise || '—',   // cell 5: Análise
      checkRow.validade || '—',  // cell 4: Validade
      checkRow.emissao || '—',   // cell 3: Emissão
      checkRow.codigo || '—',    // cell 2: Código
    ];

    // Process cells 4, 3, 2, 1 (indices 4, 3, 2, 1)
    for (let ci = 4; ci >= 1; ci--) {
      const cell = cells[ci];
      const cellXml = newContent.substring(cell.start, cell.end);
      const cellText = stripXmlTags(cellXml).trim();
      // Replace '-' placeholders or empty with actual data
      const dataIdx = 4 - ci; // maps cell 4->0, 3->1, 2->2, 1->3
      const newCellXml = injectTextIntoCell(cellXml, fillData[dataIdx]);
      newContent = newContent.substring(0, cell.start) + newCellXml + newContent.substring(cell.end);

      // Recalculate cell positions after this injection
      const diff = newCellXml.length - (cell.end - cell.start);
      for (let j = ci + 1; j < cells.length; j++) {
        cells[j].start += diff;
        cells[j].end += diff;
      }
    }

    xml = xml.substring(0, row.start) + newContent + xml.substring(row.end);
  }

  // ── 5. Fill Qualificação Técnica (rows are EMPTY in template — no labels in col 1) ──
  // These are rows 40-46 (all 5 cells empty). We need to find them and fill them.
  const allRowsPass3 = findAllRows(xml);
  const qt = d.qualificacao_tecnica || [];
  let qtInserted = 0;

  // Find the section header "Qualificação Técnica" in the XML
  const qtHeaderIdx = xml.indexOf('Qualificação Técnica');
  // Find the "Outros Registros" or "Descrição documento" that follows, to limit the range
  let qtEndBound = xml.indexOf('Outros Registros');
  if (qtEndBound === -1) qtEndBound = xml.length;

  if (qtHeaderIdx !== -1) {
    // Find all rows within this section's range
    const sectionRows = allRowsPass3.filter(r =>
      r.start > qtHeaderIdx && r.start < qtEndBound
    );

    // Filter only 5-cell rows that are NOT header rows
    const dataRows = sectionRows.filter(r => {
      const cells = findAllCells(r.content);
      if (cells.length !== 5) return false;
      const text = stripXmlTags(r.content).trim().toLowerCase();
      return !text.includes('descrição documento');
    });

    // Process from END to START  
    for (let i = dataRows.length - 1; i >= 0; i--) {
      const qIdx = i; // Qualificação técnica index
      if (qIdx >= qt.length) continue;

      const row = dataRows[i];
      const cells = findAllCells(row.content);
      if (cells.length !== 5) continue;

      let newContent = row.content;

      // Cell 1: Label (item description)
      {
        const cellXml = newContent.substring(cells[0].start, cells[0].end);
        const newCell = injectTextIntoCell(cellXml, qt[qIdx].label);
        newContent = newContent.substring(0, cells[0].start) + newCell + newContent.substring(cells[0].end);
        const diff = newCell.length - (cells[0].end - cells[0].start);
        for (let j = 1; j < cells.length; j++) { cells[j].start += diff; cells[j].end += diff; }
      }

      // Cells 2-5: código, emissão, validade, análise
      const fillData = [qt[qIdx].codigo || '—', qt[qIdx].emissao || '—', qt[qIdx].validade || '—', qt[qIdx].analise || '—'];
      for (let ci = 1; ci <= 4; ci++) {
        const cell = cells[ci];
        const cellXml = newContent.substring(cell.start, cell.end);
        const newCell = injectTextIntoCell(cellXml, fillData[ci - 1]);
        newContent = newContent.substring(0, cell.start) + newCell + newContent.substring(cell.end);
        const diff = newCell.length - (cell.end - cell.start);
        for (let j = ci + 1; j < cells.length; j++) { cells[j].start += diff; cells[j].end += diff; }
      }

      xml = xml.substring(0, row.start) + newContent + xml.substring(row.end);
      qtInserted++;
    }
  }

  // ── 6. Replace conclusion/header text ──
  // All text replacements use replaceSpanningText because Word splits text across runs
  xml = replaceSpanningText(xml, '1-DT.MM/ANOX/OBGP', d.numero_relatorio || '');
  xml = replaceSpanningText(xml, 'XX.XXX.XXX/XXXX-XX', d.cnpj || '');
  xml = replaceSpanningText(xml, 'RC1DTMMANOXOBGP', d.codigo_controle || '');
  xml = replaceSpanningText(xml, 'DT de MES de ANO', d.data_hoje || '');
  xml = replaceSpanningText(xml, 'LOCAL/UF', d.municipio_uf || '');

  // Conformity percentages in conclusion
  function calcConf(rows: ChecklistRow[]): number {
    if (!rows || rows.length === 0) return 0;
    const conformes = rows.filter(r => r.status === 'CONFORME' || r.status === 'N/A').length;
    return Math.round((conformes / rows.length) * 100);
  }

  const hjConf = calcConf(d.habilitacao_juridica);
  const rfConf = calcConf(d.regularidade_fiscal);
  const qeConf = calcConf(d.qualificacao_economica);
  const qtConf = calcConf(d.qualificacao_tecnica);
  const orConf = calcConf(d.outros_registros);

  // Replace XX% percentages — these may also be split across runs
  // The conclusion contains 5 sequential "XX%" that we replace one at a time
  const percentages = [hjConf, rfConf, qeConf, qtConf, orConf];
  for (const pct of percentages) {
    xml = replaceSpanningText(xml, 'XX%', `${pct}%`);
  }

  // ── 7. Save modified XML back and generate blob ──
  zip.file('word/document.xml', xml);

  const out = zip.generate({
    type: 'blob',
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    compression: 'DEFLATE',
  });

  return out;
}
