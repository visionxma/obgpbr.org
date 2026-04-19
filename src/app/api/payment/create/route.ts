import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

const MP_ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN ?? '';
const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://obgpbr.org';
const VALOR_CERTIFICACAO = 350.00;

export async function POST(request: NextRequest) {
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

  if (perfil.certificacao_liberada) {
    return NextResponse.json({ error: 'Certificação já liberada.' }, { status: 409 });
  }

  // ── Verificar pagamento pendente já existente ─────────────────────
  const { data: existing } = await supabase
    .from('certificacao_pagamentos')
    .select('payment_url, status, preference_id')
    .eq('osc_id', perfil.osc_id)
    .in('status', ['aguardando_pagamento', 'pendente'])
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (existing?.payment_url) {
    return NextResponse.json({ payment_url: existing.payment_url, preference_id: existing.preference_id });
  }

  // ── Criar preferência no Mercado Pago ────────────────────────────
  if (!MP_ACCESS_TOKEN) {
    return NextResponse.json({ error: 'Token do Mercado Pago não configurado. Adicione MP_ACCESS_TOKEN no .env.local' }, { status: 500 });
  }

  const preference = {
    items: [{
      id: `SELO-OSC-${perfil.osc_id}`,
      title: 'Certificação Selo OSC Gestão de Parcerias — OBGP',
      description: `Certificação para ${perfil.razao_social ?? perfil.osc_id}`,
      quantity: 1,
      unit_price: VALOR_CERTIFICACAO,
      currency_id: 'BRL',
    }],
    payer: {
      email: perfil.email_osc ?? user.email ?? '',
    },
    external_reference: perfil.osc_id,
    back_urls: {
      success: `${BASE_URL}/painel/certificacao?status=sucesso`,
      failure: `${BASE_URL}/painel/certificacao?status=falha`,
      pending: `${BASE_URL}/painel/certificacao?status=pendente`,
    },
    auto_return: 'approved',
    notification_url: `${BASE_URL}/api/payment/webhook`,
    statement_descriptor: 'OBGP CERTIFICACAO',
    expires: true,
    expiration_date_to: new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString(), // 72h
  };

  const mpRes = await fetch('https://api.mercadopago.com/checkout/preferences', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${MP_ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
      'X-Idempotency-Key': `${perfil.osc_id}-${Date.now()}`,
    },
    body: JSON.stringify(preference),
  });

  if (!mpRes.ok) {
    const err = await mpRes.text();
    console.error('[MP] Erro ao criar preferência:', err);
    return NextResponse.json({ error: 'Erro ao criar sessão de pagamento.' }, { status: 502 });
  }

  const mpData = await mpRes.json();
  const paymentUrl = mpData.init_point as string;
  const preferenceId = mpData.id as string;

  // ── Salvar pagamento no banco ─────────────────────────────────────
  await supabase.from('certificacao_pagamentos').insert({
    user_id: user.id,
    osc_id: perfil.osc_id,
    valor: VALOR_CERTIFICACAO,
    status: 'aguardando_pagamento',
    preference_id: preferenceId,
    payment_url: paymentUrl,
    expires_at: new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString(),
  });

  // Marcar solicitação no perfil
  await supabase.from('osc_perfis').update({
    certificacao_solicitada_at: new Date().toISOString(),
  }).eq('user_id', user.id);

  return NextResponse.json({ payment_url: paymentUrl, preference_id: preferenceId });
}
