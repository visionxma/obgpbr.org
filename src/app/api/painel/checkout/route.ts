import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

type CheckoutEntity = Record<string, unknown> & {
  cnpj?: string;
  razao_social?: string;
};

type CheckoutItem = {
  entidade?: CheckoutEntity;
  docs?: Record<string, unknown>;
};

type DocSection = 'habilitacao_juridica' | 'regularidade_fiscal' | 'qualificacao_economica' | 'qualificacao_tecnica' | 'outros_registros';
type MappedDocs = Record<DocSection, Record<string, unknown>>;

const PERFIL_FIELDS = [
  'razao_social', 'cnpj', 'natureza_juridica', 'responsavel',
  'telefone', 'email_osc', 'logradouro', 'numero_endereco',
  'bairro', 'municipio', 'estado', 'cep', 'data_abertura_cnpj',
] as const;

function buildPerfilUpsert(oscId: string, dados: Record<string, unknown> | null | undefined, userId?: string) {
  const out: Record<string, unknown> = {
    osc_id: oscId,
    status_selo: 'em_analise',
  };

  if (userId) out.user_id = userId;
  if (!dados) return out;

  for (const key of PERFIL_FIELDS) {
    const value = dados[key];
    if (value !== undefined && value !== null && value !== '') out[key] = value;
  }

  return out;
}

function getFallbackOscId(entidade: Record<string, unknown> | null | undefined) {
  const cnpj = typeof entidade?.cnpj === 'string' ? entidade.cnpj : '';
  return cnpj ? `OBGP-${cnpj.replace(/\D/g, '').slice(-8)}` : `GUEST-${Date.now()}`;
}

const ID_TO_SECTION_MAP: Record<string, { section: DocSection, id: string }> = {
  'cartao_cnpj': { section: 'habilitacao_juridica', id: '2.1' },
  'qsa_cnpj': { section: 'habilitacao_juridica', id: '2.2' },
  'cadastro_contribuinte': { section: 'habilitacao_juridica', id: '2.3' },
  'alvara_funcionamento': { section: 'habilitacao_juridica', id: '2.4' },
  'estatuto_social': { section: 'habilitacao_juridica', id: '2.5' },
  'ata_constituicao': { section: 'habilitacao_juridica', id: '2.6' },
  'ata_eleicao_posse': { section: 'habilitacao_juridica', id: '2.7' },
  'relacao_membros': { section: 'habilitacao_juridica', id: '2.8' },
  'comprovante_end_ent': { section: 'habilitacao_juridica', id: '2.9' },
  'rg_cpf_representante': { section: 'habilitacao_juridica', id: '2.10' },
  'comprovante_end_rep': { section: 'habilitacao_juridica', id: '2.11' },

  'cnd_federal': { section: 'regularidade_fiscal', id: '3.1' },
  'cnd_estadual': { section: 'regularidade_fiscal', id: '3.2' },
  'cnda_estadual': { section: 'regularidade_fiscal', id: '3.3' },
  'cnd_municipal': { section: 'regularidade_fiscal', id: '3.4' },
  'cr_fgts': { section: 'regularidade_fiscal', id: '3.5' },
  'cnd_trabalhista': { section: 'regularidade_fiscal', id: '3.6' },
  'cnd_caema': { section: 'regularidade_fiscal', id: '3.7' },

  'cert_falencia': { section: 'qualificacao_economica', id: '4.1' },
  'reg_contador': { section: 'qualificacao_economica', id: '4.2' },
  'termo_abertura': { section: 'qualificacao_economica', id: '4.3.1' },
  'balanco_patrimonial': { section: 'qualificacao_economica', id: '4.3.2' },
  'dem_superavit': { section: 'qualificacao_economica', id: '4.3.3' },
  'dem_mutacoes': { section: 'qualificacao_economica', id: '4.3.4' },
  'dem_fluxo_caixa': { section: 'qualificacao_economica', id: '4.3.5' },
  'notas_explicativas': { section: 'qualificacao_economica', id: '4.3.6' },
  'termo_encerramento': { section: 'qualificacao_economica', id: '4.3.7' },
  'ata_prestacao_contas': { section: 'qualificacao_economica', id: '4.4' },

  'instr_colaboracao': { section: 'qualificacao_tecnica', id: '5.1.1' },
  'instr_fomento': { section: 'qualificacao_tecnica', id: '5.1.2' },
  'instr_cooperacao': { section: 'qualificacao_tecnica', id: '5.1.3' },
  'instr_outro': { section: 'qualificacao_tecnica', id: '5.1.4' },

  'aerfe': { section: 'outros_registros', id: '6.1' },
  'cneas': { section: 'outros_registros', id: '6.2' },
  'cnes': { section: 'outros_registros', id: '6.3' },
  'cmas': { section: 'outros_registros', id: '6.4' },
  'cmdca': { section: 'outros_registros', id: '6.5' },
  'alvara_sanitaria': { section: 'outros_registros', id: '6.6' },
  'sicaf': { section: 'outros_registros', id: '6.7' },
  'util_pub_mun': { section: 'outros_registros', id: '6.8' },
  'util_pub_est': { section: 'outros_registros', id: '6.9' },
  'reg_conselho': { section: 'outros_registros', id: '6.10' },
  'reg_prof_rt': { section: 'outros_registros', id: '6.11' },
};

export async function POST(req: NextRequest) {
  try {
    const supabaseAdmin = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder_key'
    );

    const cookieStore = await cookies();
    const supabaseAuth = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder_key',
      { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
    );
    const { data: { user } } = await supabaseAuth.auth.getUser();
    const { data: perfilLogado } = user
      ? await supabaseAdmin
          .from('osc_perfis')
          .select('osc_id')
          .eq('user_id', user.id)
          .maybeSingle()
      : { data: null };

    const formData = await req.formData();
    const cartStr = formData.get('cart') as string;
    const file = formData.get('comprovante') as File | null;

    if (!cartStr || !file) {
      return NextResponse.json({ error: 'Carrinho ou comprovante faltando' }, { status: 400 });
    }

    const cart = JSON.parse(cartStr) as CheckoutItem[];
    if (!Array.isArray(cart) || cart.length === 0) {
      return NextResponse.json({ error: 'Carrinho vazio' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    let comprovantePath = '';
    const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.\-_]/g, '')}`;
    const storagePath = `comprovantes/${fileName}`;
    
    const { error: uploadError } = await supabaseAdmin
      .storage
      .from('osc-docs')
      .upload(storagePath, buffer, {
        contentType: file.type,
        upsert: false
      });

    if (uploadError) {
      console.error('Falha no upload do comprovante:', uploadError);
      return NextResponse.json({ 
        error: 'Falha ao salvar comprovante no storage.',
        details: uploadError 
      }, { status: 500 });
    }

    comprovantePath = storagePath;

    const mainOscId = perfilLogado?.osc_id ?? getFallbackOscId(cart[0]?.entidade);
    const valorTotal = 389.96;

    // ── Inserir Registro de Pagamento ──
    const { error: pagError } = await supabaseAdmin
      .from('certificacao_pagamentos')
      .insert({
        osc_id: mainOscId,
        valor: valorTotal,
        status: 'aguardando_pagamento',
        metodo_pagamento: 'pix',
        arquivo_comprovante_path: comprovantePath,
        arquivo_comprovante_nome: file.name,
        arquivo_comprovante_at: new Date().toISOString()
      });

    if (pagError) {
      console.error('Erro ao inserir pagamento:', pagError);
      return NextResponse.json({ 
        error: `Erro ao registrar pagamento: ${pagError.message}`,
        details: pagError 
      }, { status: 500 });
    }

    for (const item of cart) {
      const oscId = perfilLogado?.osc_id ?? getFallbackOscId(item.entidade);
      
      const docMapped: MappedDocs = {
        habilitacao_juridica: {},
        regularidade_fiscal: {},
        qualificacao_economica: {},
        qualificacao_tecnica: {},
        outros_registros: {},
      };

      for (const [key, val] of Object.entries(item.docs ?? {})) {
        const mapping = ID_TO_SECTION_MAP[key];
        if (mapping) {
          docMapped[mapping.section][mapping.id] = val;
        }
      }

      const d = new Date();
      const num = `${Math.floor(Math.random()*900+100)}-${String(d.getDate()).padStart(2,'0')}.${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}/OBGP`;

      // 1. Inserir Relatório de Conformidade
      const relPayload: any = {
        osc_id: oscId,
        numero: num,
        status: 'em_analise',
        dados_entidade: item.entidade ?? {},
        habilitacao_juridica: docMapped.habilitacao_juridica,
        regularidade_fiscal: docMapped.regularidade_fiscal,
        qualificacao_economica: docMapped.qualificacao_economica,
        qualificacao_tecnica: docMapped.qualificacao_tecnica,
        submitted_at: new Date().toISOString(),
        observacao_admin: `[GERADO VIA CHECKOUT] Pagamento PIX enviado. Comprovante: ${comprovantePath}`
      };

      // Adiciona outros_registros apenas se houver dados, para evitar erro se a coluna não existir no DB
      if (Object.keys(docMapped.outros_registros).length > 0) {
        relPayload.outros_registros = docMapped.outros_registros;
      }

      const { data: relData, error: relError } = await supabaseAdmin
        .from('relatorios_conformidade')
        .insert(relPayload)
        .select('id')
        .single();

      if (relError) {
        console.error('Erro ao inserir relatório:', relError);
        return NextResponse.json({ 
          error: `Erro ao inserir relatório: ${relError.message}`,
          details: relError 
        }, { status: 500 });
      }

      // 2. Atualizar ou Criar Perfil da OSC
      const perfilPayload = buildPerfilUpsert(oscId, item.entidade, user?.id);
      const { error: perfilError } = await supabaseAdmin
        .from('osc_perfis')
        .upsert(perfilPayload, { onConflict: 'osc_id' });

      if (perfilError) {
        console.error('Erro ao publicar perfil da OSC:', perfilError);
        return NextResponse.json({ 
          error: `Erro ao publicar perfil: ${perfilError.message}`,
          details: perfilError 
        }, { status: 500 });
      }

      // 3. Notificar Admin
      const { error: notifError } = await supabaseAdmin
        .from('notificacoes')
        .insert({
          osc_id: oscId,
          destinatario: 'admin',
          tipo: 'novo_relatorio',
          titulo: 'Novo relatório (via checkout)',
          mensagem: `A OSC ${item.entidade?.razao_social || oscId} enviou um novo relatório.`,
          metadata: {
            relatorio_id: relData?.id,
            osc_id: oscId,
            valor: valorTotal
          }
        });

      if (notifError) console.error('Erro ao notificar admin:', notifError);
    }

    return NextResponse.json({ ok: true });
  } catch (error: unknown) {
    console.error('Checkout API erro fatal:', error);
    const message = error instanceof Error ? error.message : 'Erro interno no checkout';
    const details = error instanceof Error ? error.stack : error;
    return NextResponse.json({ error: message, details }, { status: 500 });
  }
}
