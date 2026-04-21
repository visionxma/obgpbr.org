import { NextRequest, NextResponse } from 'next/server';

/* ── helpers de regex ── */

function matchFirst(text: string, ...patterns: RegExp[]): string {
  for (const re of patterns) {
    const m = text.match(re);
    if (m) return m[1]?.trim() ?? m[0]?.trim() ?? '';
  }
  return '';
}

function extractCnpj(text: string) {
  const m = text.match(/\d{2}[\.\s]?\d{3}[\.\s]?\d{3}[\/\s]?\d{4}[-\s]?\d{2}/);
  return m ? m[0].replace(/\s/g, '') : '';
}

function extractCep(text: string) {
  const m = text.match(/\b\d{5}-?\d{3}\b/);
  return m ? m[0] : '';
}

function extractEmail(text: string) {
  const m = text.match(/[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/);
  return m ? m[0] : '';
}

function extractPhone(text: string) {
  // (XX) 9XXXX-XXXX ou (XX) XXXX-XXXX
  const m = text.match(/\(?\d{2}\)?\s?9?\d{4}[-\s]?\d{4}/);
  return m ? m[0] : '';
}

function extractDate(text: string, label: string) {
  // busca "Data de Abertura: 01/01/2000" etc.
  const re = new RegExp(label + '[:\\s]+([0-9]{2}[/\\-][0-9]{2}[/\\-][0-9]{4})', 'i');
  const m = text.match(re);
  if (m) {
    // converte DD/MM/YYYY para YYYY-MM-DD
    const parts = m[1].split(/[/\-]/);
    if (parts.length === 3 && parts[2].length === 4) return `${parts[2]}-${parts[1]}-${parts[0]}`;
    return m[1];
  }
  // fallback: qualquer data no texto próxima da label
  const dateM = text.match(/\b(\d{2})[\/\-](\d{2})[\/\-](\d{4})\b/);
  if (dateM) return `${dateM[3]}-${dateM[2]}-${dateM[1]}`;
  return '';
}

function afterLabel(text: string, ...labels: string[]): string {
  for (const label of labels) {
    const re = new RegExp(label + '[:\\s]+([^\\n\\r]{2,80})', 'i');
    const m = text.match(re);
    if (m) return m[1].replace(/[;,]+$/, '').trim();
  }
  return '';
}

function extractEstado(text: string): string {
  const UFS = ['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'];
  for (const uf of UFS) {
    if (new RegExp(`\\b${uf}\\b`).test(text)) return uf;
  }
  return '';
}

function extractNaturezaJuridica(text: string): string {
  const tipos = ['Associação','Fundação','Cooperativa','Instituto','Organização','OSCIP','OS ','Entidade'];
  for (const t of tipos) {
    if (new RegExp(t, 'i').test(text)) return t.trim();
  }
  return afterLabel(text, 'Natureza Jurídica', 'Natureza');
}

function extractMunicipio(text: string, estado: string): string {
  // tenta pegar no padrão "Cidade/UF" ou "Cidade - UF"
  if (estado) {
    const re = new RegExp('([A-ZÀ-Ú][a-zà-ú]+(?:\\s[A-ZÀ-Ú][a-zà-ú]+)*)\\s*[\\/-]\\s*' + estado, 'i');
    const m = text.match(re);
    if (m) return m[1].trim();
  }
  return afterLabel(text, 'Município', 'Municipio', 'Cidade');
}

function parseDocumentText(raw: string) {
  // normaliza espaços múltiplos mas mantém quebras de linha para contexto
  const text = raw.replace(/[ \t]+/g, ' ');

  const cnpj = extractCnpj(text);
  const razao_social = afterLabel(text, 'Razão Social', 'Razao Social', 'Nome Empresarial', 'Nome da Entidade', 'Entidade');
  const nome_fantasia = afterLabel(text, 'Nome Fantasia', 'Nome Abreviado');
  const natureza_juridica = extractNaturezaJuridica(text);
  const data_abertura_cnpj = extractDate(text, 'Data de Abertura|Data Abertura|Abertura');
  const email_osc = extractEmail(text);
  const telefone = extractPhone(text);
  const responsavel = afterLabel(text, 'Representante Legal', 'Presidente', 'Responsável', 'Responsavel', 'Diretor');
  const cep = extractCep(text);
  const logradouro = afterLabel(text, 'Logradouro', 'Endereço', 'Endereco', 'Rua', 'Avenida', 'Av\\.');
  const numero_endereco = matchFirst(text,
    /n[uú]mero[:\s]+(\d+[A-Za-z]?)/i,
    /,\s*n[oº°]?\s*\.?\s*(\d+)/i,
  );
  const bairro = afterLabel(text, 'Bairro');
  const estado = extractEstado(text);
  const municipio = extractMunicipio(text, estado);

  return {
    cnpj, razao_social, nome_fantasia, natureza_juridica,
    data_abertura_cnpj, email_osc, telefone, responsavel,
    cep, logradouro, numero_endereco, bairro, municipio, estado,
  };
}

/* ── route handler ── */

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    if (!file) return NextResponse.json({ error: 'Nenhum arquivo enviado.' }, { status: 400 });

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const name = file.name.toLowerCase();
    const isPdf = name.endsWith('.pdf') || file.type === 'application/pdf';
    const isDocx = name.endsWith('.docx') ||
      file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

    if (!isPdf && !isDocx) {
      return NextResponse.json({ error: 'Formato não suportado. Envie um PDF ou DOCX.' }, { status: 400 });
    }

    let text = '';

    if (isDocx) {
      const mammoth = await import('mammoth');
      const result = await mammoth.extractRawText({ buffer });
      text = result.value;
    } else {
      const { PDFParse } = await import('pdf-parse');
      const parser = new PDFParse({ data: buffer });
      const result = await parser.getText();
      text = result.text;
    }

    if (!text || text.trim().length < 10) {
      return NextResponse.json({ error: 'Não foi possível extrair texto do documento. Verifique se o arquivo não está protegido.' }, { status: 422 });
    }

    const dados = parseDocumentText(text);
    return NextResponse.json({ dados });
  } catch (err: any) {
    console.error('[importar-documento]', err);
    return NextResponse.json({ error: err.message || 'Erro interno.' }, { status: 500 });
  }
}
