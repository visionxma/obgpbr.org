import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const ID_TO_SECTION_MAP: Record<string, { section: string, id: string }> = {
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
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder_key'
    );

    const formData = await req.formData();
    const cartStr = formData.get('cart') as string;
    const file = formData.get('comprovante') as File | null;

    if (!cartStr || !file) {
      return NextResponse.json({ error: 'Carrinho ou comprovante faltando' }, { status: 400 });
    }

    const cart = JSON.parse(cartStr);
    if (!Array.isArray(cart) || cart.length === 0) {
      return NextResponse.json({ error: 'Carrinho vazio' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    let comprovanteUrl = '';
    const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.\-_]/g, '')}`;
    
    const { error: uploadError } = await supabaseAdmin
      .storage
      .from('comprovantes')
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false
      });

    if (uploadError) {
      console.warn('Falha no upload do comprovante (bucket pode não existir). Fazendo fallback para Base64.', uploadError);
      const base64 = buffer.toString('base64');
      comprovanteUrl = `data:${file.type};base64,${base64}`;
    } else {
      const { data: publicUrlData } = supabaseAdmin.storage.from('comprovantes').getPublicUrl(fileName);
      comprovanteUrl = publicUrlData.publicUrl;
    }

    const mainOscId = cart[0].entidade.cnpj ? `OBGP-${cart[0].entidade.cnpj.replace(/\D/g, '').slice(-8)}` : `GUEST-${Date.now()}`;
    const valorTotal = 389.96;

    const { error: pagError } = await supabaseAdmin
      .from('certificacao_pagamentos')
      .insert({
        osc_id: mainOscId,
        valor: valorTotal,
        status: 'aguardando_pagamento',
        metodo_pagamento: 'pix',
        payment_url: comprovanteUrl,
      })
      .select('id')
      .single();

    if (pagError) {
      console.error('Erro ao inserir pagamento:', pagError);
    }

    for (const item of cart) {
      const oscId = item.entidade.cnpj ? `OBGP-${item.entidade.cnpj.replace(/\D/g, '').slice(-8)}` : `GUEST-${Date.now()}`;
      
      const docMapped: any = {
        habilitacao_juridica: {},
        regularidade_fiscal: {},
        qualificacao_economica: {},
        qualificacao_tecnica: {},
        outros_registros: {},
      };

      for (const [key, val] of Object.entries(item.docs)) {
        const mapping = ID_TO_SECTION_MAP[key];
        if (mapping) {
          docMapped[mapping.section][mapping.id] = val;
        }
      }
      
      const d = new Date();
      const num = `${Math.floor(Math.random()*900+100)}-${String(d.getDate()).padStart(2,'0')}.${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}/OBGP`;

      const { error: relError } = await supabaseAdmin
        .from('relatorios_conformidade')
        .insert({
          osc_id: oscId,
          numero: num,
          status: 'em_analise',
          dados_entidade: item.entidade,
          habilitacao_juridica: docMapped.habilitacao_juridica,
          regularidade_fiscal: docMapped.regularidade_fiscal,
          qualificacao_economica: docMapped.qualificacao_economica,
          qualificacao_tecnica: docMapped.qualificacao_tecnica,
          outros_registros: docMapped.outros_registros,
          observacao_admin: `[GERADO VIA CHECKOUT] Pagamento PIX enviado. Comprovante: ${comprovanteUrl.substring(0, 100)}...`
        });
        
      if (relError) {
        console.error('Erro ao inserir relatório:', relError);
      }
    }

    return NextResponse.json({ success: true, message: 'Checkout realizado com sucesso!' });
  } catch (error: any) {
    console.error('Checkout API erro:', error);
    return NextResponse.json({ error: error.message || 'Erro interno no checkout' }, { status: 500 });
  }
}

