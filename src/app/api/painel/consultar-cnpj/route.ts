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
      headers: { 'Accept': 'application/json' },
      cache: 'no-store'
    });

    if (res.status === 404) {
      return NextResponse.json({ error: 'CNPJ não encontrado na base da Receita Federal.' }, { status: 404 });
    }

    if (!res.ok) {
      // Fallback para ReceitaWS caso a BrasilAPI falhe (comum por rate limit)
      const resWs = await fetch(`https://receitaws.com.br/v1/cnpj/${cleanCnpj}`, {
        cache: 'no-store'
      });
      
      if (!resWs.ok) {
         throw new Error(`Serviços indisponíveis. BR_API: ${res.status}, RWS: ${resWs.status}`);
      }
      
      const dataWs = await resWs.json();
      
      if (dataWs.status === 'ERROR') {
         return NextResponse.json({ error: dataWs.message || 'CNPJ Rejeitado pela ReceitaWS' }, { status: 400 });
      }
      
      // Adaptar resposta da ReceitaWS para o padrão esperado da BrasilAPI
      return NextResponse.json({
         razao_social: dataWs.nome,
         nome_fantasia: dataWs.fantasia,
         natureza_juridica: dataWs.natureza_juridica,
         data_inicio_atividade: dataWs.abertura ? dataWs.abertura.split('/').reverse().join('-') : null,
         cep: dataWs.cep ? dataWs.cep.replace(/\D/g, '') : null,
         logradouro: dataWs.logradouro,
         numero: dataWs.numero,
         bairro: dataWs.bairro,
         municipio: dataWs.municipio,
         uf: dataWs.uf,
         ddd_telefone_1: dataWs.telefone ? dataWs.telefone.replace(/\D/g, '') : null,
         email: dataWs.email,
         qsa: dataWs.qsa ? dataWs.qsa.map((s: any) => ({ nome_socio: s.nome, qualificacao_socio: s.qual })) : []
      });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Erro detalhado na consulta de CNPJ:', error.message || error);
    return NextResponse.json({ error: error.message || 'Erro interno ao consultar CNPJ' }, { status: 500 });
  }
}
