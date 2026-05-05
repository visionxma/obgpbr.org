import { NextRequest, NextResponse } from 'next/server';
import mammoth from 'mammoth';

/* ─── tipos ─────────────────────────────────────────────────────────────── */
interface Secao { titulo: string; conteudo: string; }
interface Parsed {
  versao: string | null;
  versao_data: string | null;
  versao_descricao: string | null;
  versao_responsavel: string | null;
  secoes: Secao[];
  footer_endereco: string | null;
  footer_email: string | null;
  footer_telefone: string | null;
}

/* ─── helpers de texto ───────────────────────────────────────────────────── */
function stripTags(html: string) {
  return html.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').trim();
}

function normalizeSpaces(s: string) {
  return s.replace(/\s+/g, ' ').trim();
}

/* ─── detecta cabeçalho de seção ─────────────────────────────────────────── */
// ex: "1. Objetivo", "2. Aplicação e Categorias", "CAPÍTULO I — ..."
const SECTION_RE = /^(\d+)\.\s+\S.{0,80}$|^(CAPÍTULO|SEÇÃO|TÍTULO)\s+[IVXLCDM\d]+/i;

function isSectionHeader(text: string): boolean {
  const t = normalizeSpaces(text);
  return SECTION_RE.test(t) && t.length < 100;
}

/* ─── extrai metadados de uma string de texto plano ─────────────────────── */
function extractMeta(raw: string): Pick<Parsed, 'versao' | 'versao_data' | 'versao_descricao' | 'versao_responsavel' | 'footer_endereco' | 'footer_email' | 'footer_telefone'> {
  // versão: "Versão 1.0", "Versão: 2.1", "Rev. 1.0", número isolado tipo "1.0"
  const versaoM =
    raw.match(/(?:vers[ãa]o|revis[ãa]o|rev\.?)\s*[:\-]?\s*([\d]+\.[\d]+)/i) ||
    raw.match(/\b([\d]+\.[\d]+)\b/);
  const versao = versaoM ? versaoM[1] : null;

  // data: DD/MM/AAAA, DD-MM-AAAA, AAAA-MM-DD
  const dateM =
    raw.match(/(\d{2})[\/\-](\d{2})[\/\-](\d{4})/) ||
    raw.match(/(\d{4})[\/\-](\d{2})[\/\-](\d{2})/);
  let versao_data: string | null = null;
  if (dateM) {
    // normaliza para YYYY-MM-DD
    if (dateM[0].match(/^\d{4}/)) {
      versao_data = `${dateM[1]}-${dateM[2]}-${dateM[3]}`;
    } else {
      versao_data = `${dateM[3]}-${dateM[2]}-${dateM[1]}`;
    }
  }

  // email
  const emailM = raw.match(/[\w.+\-]+@[\w\-]+\.[\w.\-]+/);
  const footer_email = emailM ? emailM[0] : null;

  // telefone: (XX) X XXXX-XXXX ou variações
  const telM = raw.match(/\(?\d{2}\)?\s*\d?\s*\d{4}[\s.\-]?\d{4}/);
  const footer_telefone = telM ? telM[0].trim() : null;

  // endereço: linhas com palavras-chave típicas de endereço postal brasileiro
  const addrM = raw.match(/(?:Rua|Avenida|Av\.|Travessa|Praça|Quadra|Alameda|Rodovia)[^\n]{10,120}/i);
  const footer_endereco = addrM ? normalizeSpaces(addrM[0]) : null;

  // descrição da alteração: linha após "Emissão" ou "Descrição"
  const descM =
    raw.match(/(?:Emiss[aã]o\s+inicial[^\n.]{0,120})/i) ||
    raw.match(/(?:descri[çc][aã]o\s+da\s+altera[çc][aã]o\s*[:\-]?\s*)([^\n]{5,120})/i);
  const versao_descricao = descM ? normalizeSpaces(descM[0]) : null;

  // responsável: linhas com "Responsável:", "Elaborado por:", "Equipe Técnica"
  const respM =
    raw.match(/(?:respons[aá]vel\s*[:\-]?\s*)([^\n]{5,120})/i) ||
    raw.match(/(?:elaborado\s+por\s*[:\-]?\s*)([^\n]{5,120})/i) ||
    raw.match(/(Equipe\s+T[eé]cnica[^\n]{0,80})/i);
  const versao_responsavel = respM ? normalizeSpaces(respM[1] || respM[0]) : null;

  return { versao, versao_data, versao_descricao, versao_responsavel, footer_endereco, footer_email, footer_telefone };
}

/* ─── extrai metadados de tabela HTML (Controle de Alterações) ───────────── */
function extractMetaFromTable(html: string): Partial<Parsed> {
  const result: Partial<Parsed> = {};
  // encontra células de tabelas
  const rows = [...html.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)];
  for (const row of rows) {
    const cells = [...row[1].matchAll(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi)]
      .map(m => stripTags(m[1]).trim());
    if (cells.length >= 4) {
      // tenta interpretar linha como: Versão | Data | Descrição | Responsável
      const [v, d, desc, resp] = cells;
      if (/^\d/.test(v)) {
        result.versao = v || null;
        // parse data
        const dm = d?.match(/(\d{2})[\/\-](\d{2})[\/\-](\d{4})/);
        if (dm) result.versao_data = `${dm[3]}-${dm[2]}-${dm[1]}`;
        result.versao_descricao = desc || null;
        result.versao_responsavel = resp || null;
        break;
      }
    }
  }
  return result;
}

/* ─── parseia HTML (mammoth) em seções ──────────────────────────────────── */
function parseSectionsFromHtml(html: string): Secao[] {
  const sections: Secao[] = [];
  let current: Secao | null = null;
  let accHtml = '';

  // divide em blocos semânticos: headings, parágrafos, listas, tabelas
  const blockRe = /<(h[1-6]|p|ul|ol|table)[^>]*>[\s\S]*?<\/\1>/gi;
  const blocks = html.match(blockRe) ?? [];

  for (const block of blocks) {
    const text = normalizeSpaces(stripTags(block));

    // pula blocos vazios
    if (!text) continue;

    // detecta se é cabeçalho de seção
    const tag = block.match(/^<(\w+)/)?.[1] ?? '';
    const isHeading = /^h[1-6]$/.test(tag);
    const isNumberedPara =
      tag === 'p' && isSectionHeader(text) &&
      // parágrafo que é só o título (sem muito conteúdo depois da numeração)
      stripTags(block).length < 120;

    if (isHeading || isNumberedPara) {
      if (current) { current.conteudo = accHtml.trim(); sections.push(current); }
      current = { titulo: text, conteudo: '' };
      accHtml = '';
    } else if (current) {
      // não adiciona a tabela de controle de alterações ao conteúdo
      if (tag === 'table') continue;
      accHtml += block;
    }
  }

  if (current) { current.conteudo = accHtml.trim(); sections.push(current); }
  return sections.filter(s => s.titulo && (s.conteudo || s.titulo.length > 4));
}

/* ─── parseia texto plano (pdf-parse) em seções ─────────────────────────── */
function bufferToHtml(lines: string[]): string {
  let html = '';
  let para = '';
  for (const line of lines) {
    if (!line) {
      if (para) { html += `<p>${para}</p>`; para = ''; }
    } else if (/^[•\-\*]\s/.test(line)) {
      if (para) { html += `<p>${para}</p>`; para = ''; }
      html += `<ul><li>${line.replace(/^[•\-\*]\s/, '')}</li></ul>`;
    } else if (/^[IVX]+\.\s|^\w\)\s|^[a-z]\)\s/.test(line)) {
      if (para) { html += `<p>${para}</p>`; para = ''; }
      html += `<ul><li>${line}</li></ul>`;
    } else {
      para += (para ? ' ' : '') + line;
    }
  }
  if (para) html += `<p>${para}</p>`;
  // merge consecutive <ul> blocks
  return html.replace(/<\/ul>\s*<ul>/g, '');
}

function parseSectionsFromText(text: string): Secao[] {
  const lines = text.split('\n').map(l => l.trim());
  const sections: Secao[] = [];
  let current: Secao | null = null;
  let buffer: string[] = [];

  // filtra linhas que parecem números de página ou cabeçalhos repetidos
  const pageLikeRe = /^\d+$|^Página\s+\d+/i;

  for (const raw of lines) {
    const line = normalizeSpaces(raw);
    if (pageLikeRe.test(line)) continue;

    if (isSectionHeader(line)) {
      if (current) {
        current.conteudo = bufferToHtml(buffer);
        sections.push(current);
      }
      current = { titulo: line, conteudo: '' };
      buffer = [];
    } else if (current) {
      buffer.push(line);
    }
  }
  if (current) { current.conteudo = bufferToHtml(buffer); sections.push(current); }
  return sections.filter(s => s.titulo && s.conteudo.trim().length > 10);
}

/* ─── rota ───────────────────────────────────────────────────────────────── */
export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get('file') as File | null;

  if (!file) return NextResponse.json({ error: 'Arquivo não fornecido.' }, { status: 400 });

  const ext = file.name.split('.').pop()?.toLowerCase();
  if (ext !== 'docx' && ext !== 'pdf') {
    return NextResponse.json({ error: 'Use .docx ou .pdf.' }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  let secoes: Secao[] = [];
  let rawText = '';
  let htmlContent = '';

  try {
    if (ext === 'docx') {
      const result = await mammoth.convertToHtml({ buffer });
      htmlContent = result.value;
      rawText = stripTags(htmlContent);
      secoes = parseSectionsFromHtml(htmlContent);
    } else {
      const pdfParse = (await import('pdf-parse')).default;
      const result = await pdfParse(buffer);
      rawText = result.text;
      secoes = parseSectionsFromText(rawText);
    }
  } catch (err: any) {
    return NextResponse.json({ error: 'Erro ao processar arquivo: ' + (err?.message ?? '') }, { status: 422 });
  }

  // metadados via regex no texto bruto
  const meta = extractMeta(rawText);

  // refinamento com tabela HTML (se DOCX)
  if (htmlContent) {
    const tableMeta = extractMetaFromTable(htmlContent);
    Object.assign(meta, Object.fromEntries(
      Object.entries(tableMeta).filter(([, v]) => v != null)
    ));
  }

  const parsed: Parsed = { ...meta, secoes };
  return NextResponse.json(parsed);
}
