import { NextRequest, NextResponse } from 'next/server';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

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

const PERFIL_FIELDS = [
  'razao_social', 'cnpj', 'natureza_juridica', 'responsavel',
  'telefone', 'email_osc', 'logradouro', 'numero_endereco',
  'bairro', 'municipio', 'estado', 'cep', 'data_abertura_cnpj',
] as const;

function buildPerfilUpdate(dados: Record<string, unknown> | null | undefined) {
  const out: Record<string, unknown> = { status_selo: 'em_analise' };
  if (!dados) return out;
  for (const k of PERFIL_FIELDS) {
    const v = dados[k];
    if (v !== undefined && v !== null && v !== '') out[k] = v;
  }
  return out;
}

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

    const supabase = getSupabaseAdmin();
    const submitted_at = new Date().toISOString();

    // 1. Salva/atualiza relatorios_conformidade
    const repPayload = {
      osc_id,
      numero,
      status: 'em_analise',
      dados_entidade,
      habilitacao_juridica,
      submitted_at,
      arquivo_docx_path: arquivo_docx_path ?? null,
    };

    let finalRelatorioId: string | null = relatorioId ?? null;
    let relatorioNumero: string | null = numero ?? null;

    if (relatorioId) {
      const { data: updated, error } = await supabase
        .from('relatorios_conformidade')
        .update(repPayload)
        .eq('id', relatorioId)
        .select('id, numero')
        .maybeSingle();
      if (error) throw error;
      if (updated) {
        finalRelatorioId = updated.id;
        relatorioNumero = updated.numero ?? relatorioNumero;
      }
    } else {
      const { data: inserted, error } = await supabase
        .from('relatorios_conformidade')
        .insert(repPayload)
        .select('id, numero')
        .single();
      if (error) throw error;
      finalRelatorioId = inserted.id;
      relatorioNumero = inserted.numero ?? relatorioNumero;
    }

    // 2. Atualiza ou cria osc_perfis pelo osc_id (idempotente)
    const perfilUpdate = buildPerfilUpdate(dados_entidade);
    const { data: perfilRow } = await supabase
      .from('osc_perfis')
      .select('id')
      .eq('osc_id', osc_id)
      .maybeSingle();

    if (perfilRow) {
      const { error: perfilErr } = await supabase
        .from('osc_perfis')
        .update(perfilUpdate)
        .eq('osc_id', osc_id);
      if (perfilErr) throw perfilErr;
    }
    // Se não existe perfil (caso guest), o relatório ainda fica registrado e
    // a notificação abaixo garante que o admin saiba do envio.

    // 3. Notificação para admin (idempotente: ignora duplicatas pelo metadata)
    const razao = (dados_entidade && (dados_entidade as any).razao_social) || osc_id;
    const cnpj = (dados_entidade && (dados_entidade as any).cnpj) || '';
    const titulo = 'Novo relatório enviado';
    const mensagem = `OSC ${razao}${cnpj ? ` (${cnpj})` : ''} enviou o Relatório de Conformidade${relatorioNumero ? ' nº ' + relatorioNumero : ''}.`;

    await supabase.from('notificacoes').insert({
      osc_id,
      destinatario: 'admin',
      tipo: 'relatorio_enviado',
      titulo,
      mensagem,
      metadata: {
        relatorio_id: finalRelatorioId,
        numero: relatorioNumero,
        submitted_at,
      },
    });

    return NextResponse.json({
      ok: true,
      relatorio_id: finalRelatorioId,
      numero: relatorioNumero,
    });
  } catch (err: any) {
    console.error('[submeter-processo]', err);
    return NextResponse.json({ error: err.message || 'Erro interno.' }, { status: 500 });
  }
}
