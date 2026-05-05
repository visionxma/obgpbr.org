import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import mammoth from 'mammoth';

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get('file') as File | null;

  if (!file) {
    return NextResponse.json({ error: 'Arquivo não fornecido.' }, { status: 400 });
  }

  const ext = file.name.split('.').pop()?.toLowerCase();
  if (ext !== 'docx' && ext !== 'pdf') {
    return NextResponse.json({ error: 'Formato não suportado. Envie um arquivo .docx ou .pdf.' }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  let content = '';

  try {
    if (ext === 'docx') {
      const result = await mammoth.convertToHtml({ buffer });
      content = result.value;
    } else {
      const pdfParse = (await import('pdf-parse')).default;
      const result = await pdfParse(buffer);
      content = result.text;
    }
  } catch {
    return NextResponse.json({ error: 'Erro ao extrair conteúdo do arquivo.' }, { status: 422 });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: 'ANTHROPIC_API_KEY não configurada no servidor.' }, { status: 500 });
  }

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  let responseText = '';
  try {
    const msg = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 4096,
      messages: [{
        role: 'user',
        content: `Você é um parser especializado em documentos legais brasileiros. Analise o conteúdo abaixo e retorne SOMENTE um JSON válido com esta estrutura exata:

{
  "versao": "número da versão como string (ex: '1.0') ou null",
  "versao_data": "data no formato YYYY-MM-DD ou null",
  "versao_descricao": "descrição da alteração/emissão inicial ou null",
  "versao_responsavel": "nome(s) do(s) responsável(is) ou null",
  "secoes": [
    {
      "titulo": "título completo da seção incluindo número (ex: '1. Objetivo')",
      "conteudo": "conteúdo da seção em HTML semântico usando apenas: p, strong, em, ul, ol, li"
    }
  ],
  "footer_endereco": "endereço completo da organização ou null",
  "footer_email": "email de contato ou null",
  "footer_telefone": "telefone de contato ou null"
}

Regras importantes:
- Cada seção numerada do documento deve ser um item separado no array "secoes"
- Preserve toda a formatação relevante em HTML (negrito → <strong>, itálico → <em>, listas → <ul>/<ol>/<li>)
- Artigos e parágrafos devem estar dentro de <p> tags
- Não inclua a tabela de controle de alterações no conteúdo das seções
- Retorne APENAS o JSON, sem markdown, sem explicações

Conteúdo do documento:
${content.slice(0, 12000)}`,
      }],
    });

    responseText = msg.content[0].type === 'text' ? msg.content[0].text : '';
  } catch {
    return NextResponse.json({ error: 'Erro ao processar com IA. Verifique a API key.' }, { status: 500 });
  }

  const jsonMatch = responseText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    return NextResponse.json({ error: 'Não foi possível estruturar o conteúdo do documento.' }, { status: 422 });
  }

  try {
    const structured = JSON.parse(jsonMatch[0]);
    return NextResponse.json(structured);
  } catch {
    return NextResponse.json({ error: 'Resposta da IA em formato inválido.' }, { status: 422 });
  }
}
