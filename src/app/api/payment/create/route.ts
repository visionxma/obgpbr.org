import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

const MP_ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN ?? '';
const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://obgpbr.org';
const VALOR_CERTIFICACAO = 350.00;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { 
      type = 'certificacao', 
      customAmount, 
      customTitle, 
      customDescription 
    } = body;

    // ── Autenticação ──────────────────────────────────────────────────
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });
    }

    // ── Perfil OSC ────────────────────────────────────────────────────
    const { data: perfil } = await supabase
      .from('osc_perfis')
      .select('osc_id, razao_social, email_osc, certificacao_liberada')
      .eq('user_id', user.id)
      .single();

    if (!perfil) {
      return NextResponse.json({ error: 'Perfil OSC não encontrado.' }, { status: 404 });
    }

    // Se for certificação e já estiver liberada
    if (type === 'certificacao' && perfil.certificacao_liberada) {
      return NextResponse.json({ error: 'Certificação já liberada.' }, { status: 409 });
    }

    // ── Configurações da Transação ────────────────────────────────────
    const amount = customAmount ?? VALOR_CERTIFICACAO;
    const title = customTitle ?? 'Certificação Selo OSC Gestão de Parcerias — OBGP';
    const description = customDescription ?? `Certificação para ${perfil.razao_social ?? perfil.osc_id}`;
    const externalRef = `${type}:${perfil.osc_id}:${Date.now()}`;

    // ── Criar preferência no Mercado Pago ────────────────────────────
    if (!MP_ACCESS_TOKEN) {
      return NextResponse.json({ error: 'Token do Mercado Pago não configurado.' }, { status: 500 });
    }

    const preference = {
      items: [{
        id: externalRef,
        title: title,
        description: description,
        quantity: 1,
        unit_price: Number(amount),
        currency_id: 'BRL',
      }],
      payer: {
        email: perfil.email_osc ?? user.email ?? '',
      },
      external_reference: externalRef,
      back_urls: {
        success: `${BASE_URL}/painel/certificacao?status=sucesso&type=${type}`,
        failure: `${BASE_URL}/painel/certificacao?status=falha&type=${type}`,
        pending: `${BASE_URL}/painel/certificacao?status=pendente&type=${type}`,
      },
      auto_return: 'approved',
      notification_url: `${BASE_URL}/api/payment/webhook`,
      statement_descriptor: 'OBGP PRO',
      expires: true,
      expiration_date_to: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
    };

    const mpRes = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${MP_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...preference,
        payment_methods: {
          excluded_payment_types: [
            { id: 'ticket' },
            { id: 'atm' }
          ],
          installments: 6,
        }
      }),
    });

    if (!mpRes.ok) {
      const err = await mpRes.text();
      console.error('[MP] Erro:', err);
      return NextResponse.json({ error: 'Erro ao criar sessão de pagamento.' }, { status: 502 });
    }

    const mpData = await mpRes.json();
    const paymentUrl = mpData.init_point as string;
    const preferenceId = mpData.id as string;

    // ── Salvar no banco ─────────────────────────────────────────────
    // Usamos a mesma tabela ou uma nova se necessário. Para o MVP, certificacao_pagamentos serve.
    await supabase.from('certificacao_pagamentos').insert({
      user_id: user.id,
      osc_id: perfil.osc_id,
      valor: amount,
      status: 'pendente',
      preference_id: preferenceId,
      payment_url: paymentUrl,
      metodo_pagamento: 'mercado_pago',
      // Guardamos o tipo no external_reference que é lido pelo webhook
    });

    return NextResponse.json({ payment_url: paymentUrl, preference_id: preferenceId });

  } catch (err) {
    console.error('[Payment API] Erro fatal:', err);
    return NextResponse.json({ error: 'Erro interno no servidor.' }, { status: 500 });
  }
}
