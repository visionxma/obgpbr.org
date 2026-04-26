import { NextResponse } from 'next/server';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { consultarCNPJ } from '@/lib/cnpj-orchestrator';
import { getMetrics } from '@/lib/cnpj-monitor';

// Lazy-init — evita falha no build quando env vars não estão disponíveis
let _supabaseAdmin: SupabaseClient | null = null;

function getSupabaseAdmin() {
  if (!_supabaseAdmin) {
    _supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  }
  return _supabaseAdmin;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const cnpj = searchParams.get('cnpj');

  if (!cnpj) {
    return NextResponse.json(
      { error: 'CNPJ não fornecido' },
      { status: 400 }
    );
  }

  const cleanCnpj = cnpj.replace(/\D/g, '');

  if (cleanCnpj.length !== 14) {
    return NextResponse.json(
      { error: 'CNPJ inválido. Informe 14 dígitos.' },
      { status: 400 }
    );
  }

  try {
    const data = await consultarCNPJ(cleanCnpj, getSupabaseAdmin());
    return NextResponse.json(data);
  } catch {
    // Zero erros técnicos expostos — mensagem controlada sempre
    return NextResponse.json(
      { error: 'Não foi possível consultar agora. Tente novamente em instantes.' },
      { status: 503 }
    );
  }
}

/**
 * Endpoint de métricas (opcional — para monitoramento admin)
 * Acessível via POST /api/painel/consultar-cnpj
 */
export async function POST() {
  return NextResponse.json({
    metrics: getMetrics(),
    timestamp: new Date().toISOString(),
  });
}
