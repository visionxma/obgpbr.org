import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  const MP_ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN ?? '';
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://placeholder.supabase.co';
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? 'placeholder-key';
  const supabaseAdmin = createClient(supabaseUrl, supabaseKey);

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('[Webhook] SUPABASE_SERVICE_ROLE_KEY não configurada');
    return NextResponse.json({ error: 'Configuração ausente' }, { status: 500 });
  }

  try {
    const body = await request.json();
    const { type, data, action } = body;

    // MP envia vários tipos de notificação; só processar pagamentos aprovados
    if (type !== 'payment' && action !== 'payment.updated') {
      return NextResponse.json({ ok: true });
    }

    const paymentId = data?.id ?? body?.id;
    if (!paymentId) return NextResponse.json({ ok: true });

    // Consultar detalhes do pagamento no MP
    const mpRes = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: { 'Authorization': `Bearer ${MP_ACCESS_TOKEN}` },
    });

    if (!mpRes.ok) {
      console.error('[Webhook] Erro ao consultar pagamento MP:', paymentId);
      return NextResponse.json({ error: 'Erro ao consultar MP' }, { status: 502 });
    }

    const payment = await mpRes.json();
    const { status, external_reference, payment_method_id } = payment;
    const oscId = external_reference as string;

    console.log(`[Webhook] Payment ${paymentId} | OSC ${oscId} | Status: ${status}`);

    if (status === 'approved') {
      // Confirmar pagamento e liberar certificação via função SQL
      const { error } = await supabaseAdmin.rpc('confirmar_pagamento', {
        p_payment_id: String(paymentId),
        p_osc_id: oscId,
        p_metodo: payment_method_id ?? null,
      });

      if (error) {
        console.error('[Webhook] Erro ao confirmar pagamento:', error);
        return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
      }

      console.log(`[Webhook] ✅ Certificação liberada para OSC: ${oscId}`);
    } else if (status === 'cancelled' || status === 'rejected') {
      await supabaseAdmin
        .from('certificacao_pagamentos')
        .update({ status: 'cancelado' })
        .eq('osc_id', oscId)
        .in('status', ['aguardando_pagamento', 'pendente']);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[Webhook] Erro inesperado:', err);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

// MP também envia GET para verificar o endpoint
export async function GET() {
  return NextResponse.json({ ok: true });
}
