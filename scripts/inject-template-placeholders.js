/**
 * inject-template-placeholders.js
 *
 * Reads the original template DOCX, injects {placeholder} tags into every
 * empty data cell, and writes a new template ready for docxtemplater.
 *
 * Run: node scripts/inject-template-placeholders.js
 */

const fs   = require('fs');
const path = require('path');
const PizZip = require('pizzip');

const TEMPLATE_IN  = path.join(__dirname, '../public/docs/MODEL_RELATORIO_CONFORMIDADE_OSC_REV00_20.04.2026_.docx');
const TEMPLATE_OUT = path.join(__dirname, '../public/docs/TEMPLATE_RELATORIO_PREENCHIVEL.docx');

// ── run inline placeholder in an <w:r> element ─────────────────────────────
function makeRun(placeholder) {
  return (
    `<w:r><w:rPr>` +
    `<w:rFonts w:ascii="Arial Narrow" w:hAnsi="Arial Narrow"/>` +
    `<w:sz w:val="20"/><w:szCs w:val="20"/>` +
    `</w:rPr><w:t xml:space="preserve">${placeholder}</w:t></w:r>`
  );
}

// ── inject a placeholder into the NEXT empty paragraph after `afterText` ──
// An "empty paragraph" is one with </w:pPr></w:p> (no <w:r> inside)
function injectAfterLabel(xml, afterText, placeholder, occurrence = 1) {
  let searchFrom = 0;
  let found = 0;

  while (found < occurrence) {
    const labelIdx = xml.indexOf(afterText, searchFrom);
    if (labelIdx === -1) {
      console.warn(`  ⚠  Label not found: "${afterText}" (occurrence ${occurrence})`);
      return xml;
    }
    searchFrom = labelIdx + afterText.length;
    found++;
  }

  // After the label, find the closing of its paragraph/cell, then find next
  // empty paragraph: </w:pPr></w:p>  with no intervening <w:r> or <w:t>
  const afterLabel = xml.indexOf(afterText, searchFrom - afterText.length);
  const suffix = xml.slice(afterLabel + afterText.length);

  // Pattern: end of previous cell + next empty <w:p>...</w:pPr></w:p>
  const emptyParaRe = /(<\/w:tc>(?:<w:tc>[\s\S]*?)?<\/w:pPr>)(<\/w:p>)/;
  const m = emptyParaRe.exec(suffix);
  if (!m) {
    console.warn(`  ⚠  Empty cell not found after: "${afterText}"`);
    return xml;
  }

  const insertAt = afterLabel + afterText.length + m.index + m[1].length;
  return xml.slice(0, insertAt) + makeRun(placeholder) + xml.slice(insertAt);
}

// ── inject into the Nth subsequent empty <w:p> after a position ────────────
// Used for checklist rows that have 4 empty cells
function injectNthEmptyPara(xml, startPos, n, placeholder) {
  let remaining = xml.slice(startPos);
  let localOffset = 0;
  let count = 0;

  const emptyParaRe = /<\/w:pPr>(<\/w:p>)/g;
  let m;
  while ((m = emptyParaRe.exec(remaining)) !== null) {
    count++;
    if (count === n) {
      const insertAt = startPos + m.index + m[1].length - m[1].length;
      return xml.slice(0, insertAt) + makeRun(placeholder) + xml.slice(insertAt);
    }
  }
  console.warn(`  ⚠  Could not find empty para #${n} from offset ${startPos}`);
  return xml;
}

// ── Extract table rows from a section ──────────────────────────────────────
function getSectionRows(xml, sectionMarker, nextSectionMarker) {
  const startIdx = xml.indexOf(sectionMarker);
  const endIdx   = nextSectionMarker ? xml.indexOf(nextSectionMarker, startIdx + sectionMarker.length) : xml.length;

  if (startIdx === -1) {
    console.warn(`  ⚠  Section not found: "${sectionMarker}"`);
    return [];
  }

  const sectionXml = xml.slice(startIdx, endIdx);

  // Find all <w:tr> elements, split out their content
  const rows = [];
  const trRe = /<w:tr[ >]/g;
  let trMatch;
  while ((trMatch = trRe.exec(sectionXml)) !== null) {
    // find matching </w:tr>
    let depth = 1;
    let pos   = trMatch.index + trMatch[0].length;
    while (depth > 0 && pos < sectionXml.length) {
      if (sectionXml.startsWith('<w:tr', pos) && (sectionXml[pos + 5] === ' ' || sectionXml[pos + 5] === '>')) depth++;
      else if (sectionXml.startsWith('</w:tr>', pos)) depth--;
      if (depth > 0) pos++;
    }
    const rowXml = sectionXml.slice(trMatch.index, pos + '</w:tr>'.length);
    rows.push({ xml: rowXml, absStart: startIdx + trMatch.index });
  }

  return rows;
}

// ── Inject placeholders into data rows of a section ───────────────────────
// Returns modified xml
function injectSection(xml, sectionMarker, nextMarker, sectionId, itemIds, fields) {
  const rows = getSectionRows(xml, sectionMarker, nextMarker);
  if (!rows.length) return xml;

  console.log(`  Section "${sectionMarker}": ${rows.length} rows (including header)`);

  // rows[0] is the header row, skip it
  const dataRows = rows.slice(1);

  // work from back to front to preserve positions
  for (let i = dataRows.length - 1; i >= 0; i--) {
    const row = dataRows[i];
    if (i >= itemIds.length) {
      // extra empty row — skip
      continue;
    }
    const itemId = itemIds[i];

    // In the row, find the empty paragraphs (one per data cell)
    // Each data cell = </w:pPr></w:p>  (no runs inside)
    let rowXml = row.xml;
    const emptyCellPositions = [];
    const eRe = /<\/w:pPr>(<\/w:p>)/g;
    let em;
    while ((em = eRe.exec(rowXml)) !== null) {
      // Make sure there's no <w:r> between last </w:pPr> and this </w:p>
      const between = rowXml.slice(em.index + '</w:pPr>'.length, em.index + '</w:pPr>'.length + em[1].length);
      emptyCellPositions.push(em.index + '</w:pPr>'.length);
    }

    // Re-extract positions properly: find all </w:pPr></w:p> that represent empty paragraphs
    const empties = [];
    const re2 = /<\/w:pPr><\/w:p>/g;
    let m2;
    while ((m2 = re2.exec(rowXml)) !== null) {
      empties.push(m2.index + '</w:pPr>'.length);
    }

    if (empties.length < fields.length) {
      console.warn(`    Row ${i} (${itemId}): only ${empties.length} empty cells, need ${fields.length}`);
    }

    // Inject from back to front within the row
    const toInject = fields.slice(0, empties.length);
    for (let f = toInject.length - 1; f >= 0; f--) {
      const insertPos = empties[f];
      const ph = `{${sectionId}_${itemId.replace(/\./g, '_')}_${fields[f]}}`;
      rowXml = rowXml.slice(0, insertPos) + makeRun(ph) + rowXml.slice(insertPos);
    }

    // Replace the row in the full xml
    xml = xml.slice(0, row.absStart) + rowXml + xml.slice(row.absStart + row.xml.length);
  }

  return xml;
}

// ══════════════════════════════════════════════════════════════════════════════
// MAIN
// ══════════════════════════════════════════════════════════════════════════════

console.log('🔧  Loading template…');
const docxBuffer = fs.readFileSync(TEMPLATE_IN);
const zip        = new PizZip(docxBuffer);
let xml          = zip.file('word/document.xml').asText();

// ── 1. DADOS DA ENTIDADE ──────────────────────────────────────────────────
console.log('\n[1] Dados da Entidade');
const sec1 = [
  ['CNPJ:',              '{cnpj}'],
  ['NATUREZA JURÍDICA:', '{natureza_juridica}'],
  ['RAZÃO SOCIAL:',      '{razao_social}'],
  [':',                  '{nome_fantasia}'],   // "NOME FANTASIA:" is split → ends with ":"
  ['ENDEREÇO:',          '{endereco}'],
  ['DATA ABERTURA CNPJ:','{data_abertura}'],
  ['E-MAIL:',            '{email}'],
  ['TELEFONE:',          '{telefone}'],
];

// Process using label-based search
for (const [label, ph] of sec1) {
  xml = injectAfterLabel(xml, `<w:t>${label}</w:t>`, ph);
  console.log(`  ✓ ${label} → ${ph}`);
}

// ── Special: NOME FANTASIA is split into two runs → find the ":" run ─────
// Already handled above with the ":" trick; but let's verify by searching
// for "NOME FANTASIA" context and manually fix if needed.

// ── 2. HABILITAÇÃO JURÍDICA ───────────────────────────────────────────────
console.log('\n[2] Habilitação Jurídica');
const hjIds = ['2.1','2.2','2.3','2.4','2.5','2.6','2.7','2.8','2.9','2.10','2.11'];
xml = injectSection(xml, 'Habilitação Jurídica', 'Regularidade Fiscal, Social e Trabalhista',
  's2', hjIds, ['codigo','emissao','validade','analise']);

// ── 3. REGULARIDADE FISCAL ────────────────────────────────────────────────
console.log('\n[3] Regularidade Fiscal');
const rfIds = ['3.1','3.2','3.3','3.4','3.5','3.6','3.7'];
xml = injectSection(xml, 'Regularidade Fiscal, Social e Trabalhista', 'Qualificação Econômico-financeira',
  's3', rfIds, ['codigo','emissao','validade','analise']);

// ── 4. QUALIFICAÇÃO ECONÔMICO-FINANCEIRA ─────────────────────────────────
console.log('\n[4] Qualificação Econômico-financeira');
const qeIds = ['4.1','4.2','4.3.1','4.3.2','4.3.3','4.3.4','4.3.5','4.3.6','4.3.7','4.4'];
xml = injectSection(xml, 'Qualificação Econômico-financeira', 'Qualificação Técnica',
  's4', qeIds, ['codigo','emissao','validade','analise']);

// ── 5. QUALIFICAÇÃO TÉCNICA ───────────────────────────────────────────────
console.log('\n[5] Qualificação Técnica');
const qtIds = ['5.1','5.2','5.3','5.4','5.5'];
xml = injectSection(xml, 'Qualificação Técnica', 'Outros Registros',
  's5', qtIds, ['codigo','emissao','validade','analise']);

// ── 6. OUTROS REGISTROS ───────────────────────────────────────────────────
console.log('\n[6] Outros Registros');
const orIds = ['6.1','6.2','6.3','6.4','6.5','6.6','6.7','6.8','6.9'];
xml = injectSection(xml, 'Outros Registros', 'Conclusão',
  's6', orIds, ['codigo','emissao','validade','analise']);

// ── 7. CONCLUSÃO & CABEÇALHO ─────────────────────────────────────────────
console.log('\n[7] Conclusão / Título');

// Título: "N.º 1-DT.MM/ANOX/OBGP" — reconstruct from split runs
// The title is split across multiple <w:t> elements — replace the whole block
xml = xml.replace(
  /(<w:t>RELATÓRIO DE CONFORMIDADE N\.º 1-<\/w:t><\/w:r>)([\s\S]*?)(<w:t>\/OBGP<\/w:t>)/,
  `<w:t>RELATÓRIO DE CONFORMIDADE N.º </w:t></w:r>${makeRun('{numero_relatorio}')}<w:r><w:rPr><w:rFonts w:ascii="Arial Narrow" w:hAnsi="Arial Narrow"/><w:sz w:val="24"/><w:szCs w:val="24"/><w:b/><w:bCs/></w:rPr><w:t>`
);

// Conclusão section percentages
const conclusaoReplacements = [
  // "Habilitação Jurídica – XX% conforme" etc.
  [/>XX<\/w:t><\/w:r><\/w:p>[\s\S]*?conforme<\/w:t>/g, null], // too fragile; skip
];

// Conclusion: Código de verificação
const verificationCodeRe = /RC<\/w:t><\/w:r>[\s\S]{0,200}?DTMMANOX[\s\S]{0,50}?OBGP/;
// skip complex conclusion replacements for now

// Local / Data / MES / ANO
const localRe = /<w:t>LOCAL<\/w:t>/;
if (localRe.test(xml)) {
  xml = xml.replace('<w:t>LOCAL</w:t>', `<w:t>{municipio_uf}</w:t>`);
  console.log('  ✓ LOCAL → {municipio_uf}');
}

const meses = ['<w:t>MES</w:t>', '<w:t>MES </w:t>'];
for (const mTag of meses) {
  if (xml.includes(mTag)) {
    xml = xml.replace(mTag, `<w:t>{mes_extenso}</w:t>`);
    console.log('  ✓ MES → {mes_extenso}');
    break;
  }
}

// ANO
if (xml.includes('<w:t>ANO</w:t>')) {
  xml = xml.replace('<w:t>ANO</w:t>', `<w:t>{ano}</w:t>`);
  console.log('  ✓ ANO → {ano}');
}
if (xml.includes('<w:t>DT </w:t>')) {
  xml = xml.replace('<w:t>DT </w:t>', `<w:t>{dia} </w:t>`);
  console.log('  ✓ DT → {dia}');
}

// ── Write out ─────────────────────────────────────────────────────────────
zip.file('word/document.xml', xml);
const outBuffer = zip.generate({ type: 'nodebuffer', compression: 'DEFLATE' });
fs.writeFileSync(TEMPLATE_OUT, outBuffer);
console.log(`\n✅  Template salvo em: ${TEMPLATE_OUT}`);
console.log('   Tamanho:', Math.round(outBuffer.length / 1024), 'KB');
