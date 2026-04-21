import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Service role bypassa RLS — único lugar seguro para atualizar status_selo
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      osc_id,
      relatorioId,
      numero,
      dados_entidade,
      habilitacao_juridica,
      arquivo_docx_path,
    } = body;

    if (!osc_id) {
      return NextResponse.json({ error: 'osc_id obrigatório.' }, { status: 400 });
    }

    const submitted_at = new Date().toISOString();

    const repPayload = {
      osc_id,
      numero,
      status: 'em_analise',
      dados_entidade,
      habilitacao_juridica,
      submitted_at,
      arquivo_docx_path: arquivo_docx_path ?? null,
    };

    // 1. Salva/atualiza relatorios_conformidade
    if (relatorioId) {
      const { error } = await supabaseAdmin
        .from('relatorios_conformidade')
        .update(repPayload)
        .eq('id', relatorioId);
      if (error) throw error;
    } else {
      const { error } = await supabaseAdmin
        .from('relatorios_conformidade')
        .insert(repPayload);
      if (error) throw error;
    }

    // 2. Atualiza osc_perfis (service role bypassa RLS)
    const perfilUpdate: Record<string, string> = { status_selo: 'em_analise' };
    const d = dados_entidade ?? {};
    if (d.razao_social) perfilUpdate.razao_social = d.razao_social;
    if (d.cnpj)         perfilUpdate.cnpj         = d.cnpj;
    if (d.municipio)    perfilUpdate.municipio     = d.municipio;
    if (d.estado)       perfilUpdate.estado        = d.estado;
    if (d.responsavel)  perfilUpdate.responsavel   = d.responsavel;

    const { error: perfilErr } = await supabaseAdmin
      .from('osc_perfis')
      .update(perfilUpdate)
      .eq('osc_id', osc_id);

    if (perfilErr) throw perfilErr;

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error('[submeter-processo]', err);
    return NextResponse.json({ error: err.message || 'Erro interno.' }, { status: 500 });
  }
}
