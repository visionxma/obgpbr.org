import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const cnpj = searchParams.get('cnpj');

  if (!cnpj) {
    return NextResponse.json({ error: 'CNPJ não fornecido' }, { status: 400 });
  }

  const cleanCnpj = cnpj.replace(/\D/g, '');

  try {
    const res = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cleanCnpj}`, {
      next: { revalidate: 3600 } // Cache de 1 hora para evitar excesso de requisições
    });

    if (res.status === 404) {
      return NextResponse.json({ error: 'CNPJ não encontrado na base da Receita Federal.' }, { status: 404 });
    }

    if (!res.ok) {
      // Tentar a V2 caso a V1 falhe ou esteja instável
      const resV2 = await fetch(`https://brasilapi.com.br/api/cnpj/v2/${cleanCnpj}`);
      if (!resV2.ok) throw new Error('Serviço da Receita Federal indisponível.');
      const dataV2 = await resV2.json();
      return NextResponse.json(dataV2);
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Erro na consulta de CNPJ:', error);
    return NextResponse.json({ error: 'Erro interno ao consultar CNPJ' }, { status: 500 });
  }
}
