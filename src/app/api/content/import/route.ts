import { NextRequest, NextResponse } from 'next/server';
import mammoth from 'mammoth';

export const maxDuration = 60;

/* ─── helpers ─────────────────────────────────────── */
function stripTags(html: string) {
  return html.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').trim();
}
function normalize(s: string) {
  return s.replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim();
}

/* ─── parsers por tipo ────────────────────────────── */
function parseBlog(raw: string) {
  const lines = raw.split('\n').map(l => l.trim()).filter(Boolean);
  const title = lines[0]?.slice(0, 200) ?? '';
  // Categoria: linha curta com palavra-chave conhecida
  const catMatch = raw.match(/\b(MROSC|Selo OSC|Gestão|Legislação|Educação|Saúde|Assistência Social)\b/i);
  const category = catMatch ? catMatch[0] : null;
  // Autor: linha com "por", "Autor:", "Author:"
  const authMatch =
    raw.match(/(?:autor|por|author)\s*[:\-]?\s*([A-ZÁÉÍÓÚÂÊÔÃÕ][\wÁ-ÿ\s]{4,80})/i);
  const author = authMatch ? authMatch[1].trim() : null;
  // Resumo: primeiro parágrafo após o título (ou primeiras 240 chars)
  const summary = lines.slice(1, 5).join(' ').slice(0, 240);
  // Conteúdo: texto restante em parágrafos
  const content = lines.slice(1).join('\n\n');
  // Tempo de leitura: 200 palavras por minuto
  const words = content.split(/\s+/).length;
  const read_time = Math.max(1, Math.round(words / 200));
  return { title, summary, content, category, author, read_time };
}

function parseExperience(raw: string) {
  const lines = raw.split('\n').map(l => l.trim()).filter(Boolean);
  const title = lines[0]?.slice(0, 200) ?? '';
  const description = lines.slice(1).join('\n\n');
  // Local: padrão Cidade/UF ou "Município de X"
  const locMatch =
    raw.match(/\b([A-ZÁÉÍÓÚÂÊÔÃÕ][\wÁ-ÿ\s]+?)\/([A-Z]{2})\b/) ||
    raw.match(/Munic[íi]pio\s+de\s+([A-ZÁÉÍÓÚÂÊÔÃÕ][\wÁ-ÿ\s]{2,40})/i);
  const location = locMatch ? (locMatch[2] ? `${locMatch[1]}/${locMatch[2]}` : locMatch[1]).trim() : null;
  // Data: dd/mm/aaaa, Mês de aaaa
  const dateMatch =
    raw.match(/\b(0?[1-9]|[12]\d|3[01])[\/\-](0?[1-9]|1[0-2])[\/\-](\d{4})\b/) ||
    raw.match(/\b(janeiro|fevereiro|mar[çc]o|abril|maio|junho|julho|agosto|setembro|outubro|novembro|dezembro)\s+de\s+\d{4}/i);
  const date = dateMatch ? dateMatch[0] : null;
  return { title, description, location, date };
}

function parseTransparencyRecord(raw: string) {
  // Proponente: "Proponente:", "OSC:", razão social próximo ao topo
  const propMatch =
    raw.match(/(?:proponente|osc|entidade)\s*[:\-]?\s*([A-ZÁÉÍÓÚÂÊÔÃÕ][^\n]{5,120})/i);
  const proponente = propMatch ? propMatch[1].trim() : null;
  // Parlamentar: "Parlamentar:" ou "Autor da Emenda:"
  const parlMatch =
    raw.match(/(?:parlamentar|autor\s+da\s+emenda)\s*[:\-]?\s*([A-ZÁÉÍÓÚÂÊÔÃÕ][^\n]{3,80})/i);
  const parlamentar = parlMatch ? parlMatch[1].trim() : null;
  // Modalidade: termo de fomento, termo de colaboração, convênio
  const modMatch =
    raw.match(/(termo\s+de\s+(?:fomento|colabora[çc][ãa]o|cooperação)|conv[êe]nio|acordo\s+de\s+coopera[çc][ãa]o)/i);
  const modalidade = modMatch ? modMatch[0] : null;
  // Objeto: "Objeto:" + linha
  const objMatch = raw.match(/(?:objeto)\s*[:\-]?\s*([^\n]{20,400})/i);
  const objeto = objMatch ? objMatch[1].trim() : null;
  // Órgão concedente
  const orgMatch =
    raw.match(/(?:concedente|[óo]rg[ãa]o\s+(?:p[úu]blico|concedente)|minist[ée]rio|secretaria)\s*[:\-]?\s*([^\n]{10,150})/i);
  const orgao_concedente = orgMatch ? orgMatch[1].trim() : null;
  // Nº instrumento
  const instrMatch =
    raw.match(/(?:n[º°ª.]+\s*instrumento|n[úu]mero\s+do\s+instrumento|instrumento\s+n[º°ª.])\s*[:\-]?\s*([\d./\-]+)/i) ||
    raw.match(/\b(\d{4,7}\/\d{4})\b/);
  const num_instrumento = instrMatch ? instrMatch[1].trim() : null;
  // Nº emenda
  const emendMatch =
    raw.match(/(?:n[º°ª.]+\s*emenda|emenda\s+n[º°ª.])\s*[:\-]?\s*([\d./\-]+)/i);
  const num_emenda = emendMatch ? emendMatch[1].trim() : null;
  // Ano da emenda
  const anoMatch = raw.match(/\b(20\d{2})\b/);
  const ano_emenda = anoMatch ? anoMatch[0] : null;
  // Valor: R$ X.XXX,XX
  const valMatch = raw.match(/R\$\s*[\d.]+(?:,\d{2})?/);
  const valor = valMatch ? valMatch[0] : null;
  return {
    proponente, parlamentar, modalidade, objeto, orgao_concedente,
    num_instrumento, num_emenda, ano_emenda, valor,
  };
}

function parseCertification(raw: string) {
  // Número RACT/RCA: padrão "RACT N.º XXX/AAAA de DD/MM/AAAA" ou "RCA"
  const numMatch =
    raw.match(/((?:RACT|RCA)\s+N[º°ª.]\s*[\d/]+\s+de\s+\d{2}\/\d{2}\/\d{4})/i) ||
    raw.match(/((?:RACT|RCA)\s+N[º°ª.]\s*[\d/.\-]+)/i);
  const numero = numMatch ? numMatch[0].trim() : '';
  // Instituição: "INSTITUTO X" em maiúsculas
  const instMatch =
    raw.match(/INSTITUTO\s+[A-ZÁÉÍÓÚÂÊÔÃÕ][^\n]{5,120}/) ||
    raw.match(/(?:institui[çc][ãa]o|fundac[ãa]o|associa[çc][ãa]o)\s+([^\n]{10,120})/i);
  const instituicao = instMatch ? instMatch[0].trim() : '';
  // Certidão: "CERTIDÃO DE REGISTRO ... N.º XXXX/AAAA, VÁLIDA ATÉ DD/MM/AAAA"
  const certMatch =
    raw.match(/CERTID[ÃA]O\s+DE\s+REGISTRO[^\n]+(?:V[ÁA]LIDA\s+AT[ÉE]\s+\d{2}\/\d{2}\/\d{4})?[.]?/i);
  const certidao = certMatch ? certMatch[0].trim() : '';
  return { numero, instituicao, certidao };
}

function parseLegislation(raw: string) {
  // Número da lei: "Lei nº XX.XXX/AAAA" ou "Decreto nº XX.XXX/AAAA"
  const numMatch =
    raw.match(/(?:Lei|Decreto|Resolu[çc][ãa]o|Portaria|Instru[çc][ãa]o\s+Normativa)\s+(?:Federal\s+)?n?[º°ª.]?\s*[\d.]+\/\d{4}/i);
  const numero = numMatch ? numMatch[0].trim() : '';
  // Apelido: linha curta após o número
  const aposMatch = raw.split('\n').find(l => l.length > 5 && l.length < 90 && !numero.includes(l));
  const apelido = aposMatch?.trim() ?? null;
  // Descrição: primeiro parágrafo longo
  const lines = raw.split('\n').map(l => l.trim());
  const desc = lines.find(l => l.length > 80 && l.length < 400);
  const descricao = desc ?? null;
  // URL: link planalto.gov.br
  const urlMatch = raw.match(/https?:\/\/[^\s]+/);
  const href = urlMatch ? urlMatch[0] : null;
  return { numero, apelido, descricao, href };
}

/* ─── rota ────────────────────────────────────────── */
export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get('file') as File | null;
  const tipo = (formData.get('tipo') as string | null) ?? 'blog';

  if (!file) return NextResponse.json({ error: 'Arquivo não fornecido.' }, { status: 400 });

  const ext = file.name.split('.').pop()?.toLowerCase();
  if (ext !== 'docx' && ext !== 'pdf') {
    return NextResponse.json({ error: 'Use .docx ou .pdf.' }, { status: 400 });
  }

  if (file.size > 10 * 1024 * 1024) {
    return NextResponse.json({ error: 'Arquivo maior que 10 MB.' }, { status: 413 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  let rawText = '';

  try {
    if (ext === 'docx') {
      const result = await mammoth.extractRawText({ buffer });
      rawText = result.value;
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const pdfParseModule = (await import('pdf-parse')) as any;
      const pdfParse = pdfParseModule.default ?? pdfParseModule;
      const result = await pdfParse(buffer);
      rawText = result.text;
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'erro desconhecido';
    return NextResponse.json({ error: 'Erro ao processar arquivo: ' + message }, { status: 422 });
  }

  rawText = normalize(rawText);

  let dados: Record<string, unknown> = {};
  switch (tipo) {
    case 'blog':           dados = parseBlog(rawText); break;
    case 'experiencia':    dados = parseExperience(rawText); break;
    case 'transparencia':  dados = parseTransparencyRecord(rawText); break;
    case 'certificacao':   dados = parseCertification(rawText); break;
    case 'legislacao':     dados = parseLegislation(rawText); break;
    default:
      return NextResponse.json({ error: 'Tipo desconhecido: ' + tipo }, { status: 400 });
  }

  return NextResponse.json({ dados, rawText: rawText.slice(0, 5000) });
}
