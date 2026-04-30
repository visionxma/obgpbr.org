import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

interface RelItem {
  secao: number; codigo: string; descricao: string; is_header: boolean; ordem: number;
  codigo_controle: string | null; data_emissao: string | null; data_validade: string | null;
  analise_atual: string | null; status: string;
}

interface Assinatura {
  role: string; nome_assinante: string; credencial: string | null; signed_at: string;
}

function fmtDate(iso: string | null) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('pt-BR', { day:'2-digit', month:'2-digit', year:'numeric' });
}

const SECAO_LABELS: Record<number, string> = {
  2: 'Habilitação Jurídica',
  3: 'Regularidade Fiscal, Social e Trabalhista',
  4: 'Qualificação Econômico-financeira',
  5: 'Qualificação Técnica',
  6: 'Outros Registros',
};

function renderTable(itens: RelItem[]) {
  const rows = itens.map(i => {
    const bg  = i.is_header ? '#f8fafc' : '';
    const fw  = i.is_header ? 'bold' : 'normal';
    const fs  = i.is_header ? 'italic' : 'normal';
    const sta = i.is_header ? '' : ({
      conforme:     '<span style="color:#16a34a;font-weight:700">Conforme</span>',
      nao_conforme: '<span style="color:#dc2626;font-weight:700">Não Conforme</span>',
      nao_aplicavel:'<span style="color:#6b7280">N/A</span>',
      pendente:     '<span style="color:#f59e0b">Pendente</span>',
    }[i.status] ?? i.status);
    
    const analiseHtml = i.is_header ? '' : `${sta}${i.analise_atual ? `<br/><span style="font-size:9px;color:#6b7280">${i.analise_atual}</span>` : ''}`;

    return `
      <tr style="background:${bg}">
        <td style="font-weight:${fw};font-style:${fs};padding:6px 8px;border:1px solid #e5e7eb">${i.codigo ? `${i.codigo}. ` : ''}${i.descricao}</td>
        <td style="text-align:center;padding:6px 8px;border:1px solid #e5e7eb">${i.codigo_controle ?? '—'}</td>
        <td style="text-align:center;white-space:nowrap;padding:6px 8px;border:1px solid #e5e7eb">${fmtDate(i.data_emissao)}</td>
        <td style="text-align:center;white-space:nowrap;padding:6px 8px;border:1px solid #e5e7eb">${fmtDate(i.data_validade)}</td>
        <td style="padding:6px 8px;border:1px solid #e5e7eb">${analiseHtml}</td>
      </tr>`;
  }).join('');

  return `
    <table style="width:100%;border-collapse:collapse;font-size:10px;margin-bottom:24px">
      <thead>
        <tr style="background:#f0f4f8;color:#0D364F;font-weight:bold;text-align:left">
          <th style="padding:8px;border:1px solid #e5e7eb;width:35%">Descrição documento</th>
          <th style="padding:8px;border:1px solid #e5e7eb;text-align:center">Código controle documento<br/><span style="font-size:8px;font-weight:normal">(se houver)</span></th>
          <th style="padding:8px;border:1px solid #e5e7eb;text-align:center">Data emissão<br/>documento</th>
          <th style="padding:8px;border:1px solid #e5e7eb;text-align:center">Data validade<br/>documento<br/><span style="font-size:8px;font-weight:normal">(se houver)</span></th>
          <th style="padding:8px;border:1px solid #e5e7eb">Análise conformidade atual</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>`;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '',
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new NextResponse('Não autenticado', { status: 401 });

  // Load relatorio
  const { data: rel } = await supabase
    .from('relatorios_conformidade').select('*').eq('id', id).single();
  if (!rel) return new NextResponse('Relatório não encontrado', { status: 404 });

  // Access check
  const role = user.app_metadata?.role as string | undefined;
  if (!role || role === 'user') {
    const { data: perfil } = await supabase
      .from('osc_perfis').select('osc_id').eq('user_id', user.id).single();
    if (!perfil || perfil.osc_id !== rel.osc_id) {
      return new NextResponse('Acesso negado', { status: 403 });
    }
  }

  // Load itens + assinaturas + osc_perfil
  const [itensRes, assRes, perfRes] = await Promise.all([
    supabase.from('relatorio_itens').select('*').eq('relatorio_id', id).order('secao').order('ordem'),
    supabase.from('relatorio_assinaturas').select('*').eq('relatorio_id', id).order('signed_at'),
    supabase.from('osc_perfis').select('*').eq('osc_id', rel.osc_id).single(),
  ]);

  const itens:       RelItem[]      = (itensRes.data ?? []) as RelItem[];
  const assinaturas: Assinatura[]   = (assRes.data   ?? []) as Assinatura[];
  const perfil                      = perfRes.data;
  const dados: Record<string,string> = rel.dados_entidade ?? {};

  // Conformity summary
  const nonHeaders = itens.filter(i => !i.is_header);
  const secSummary = [2,3,4,5,6].map(s => {
    const sit  = nonHeaders.filter(i => i.secao === s);
    const conf = sit.filter(i => i.status === 'conforme').length;
    return { secao:s, label: SECAO_LABELS[s], pct: sit.length > 0 ? Math.round(conf/sit.length*100) : 0 };
  }); // Sempre exibe todas as 5 seções conforme modelo PDF

  // Signature blocks
  const rtSign   = assinaturas.find(a => a.role === 'admin_rt');
  const contSign = assinaturas.find(a => a.role === 'contador');



  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>Relatório de Conformidade ${rel.numero ?? ''}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Arial, Helvetica, sans-serif; font-size: 12px; color: #1f2937; background: #fff; }
    .page { max-width: 900px; margin: 0 auto; padding: 30px 40px; }
    .header { display: flex; align-items: center; gap: 20px; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 3px solid #0D364F; }
    .header-brand { font-size: 22px; font-weight: 900; color: #0D364F; letter-spacing: .06em; }
    .header-brand span { color: #C5AB76; }
    .header-info { font-size: 10px; color: #6b7280; line-height: 1.6; }
    .title-block { text-align: center; margin: 24px 0; padding: 20px; background: #f8fafc; border: 1px solid #e5e7eb; border-radius: 8px; }
    .title-block h1 { font-size: 15px; font-weight: 900; color: #0D364F; text-transform: uppercase; letter-spacing: .08em; margin-bottom: 4px; }
    .title-block .subtitle { font-size: 12px; color: #6b7280; }
    .section-title { font-size: 13px; font-weight: 800; color: #0D364F; text-transform: uppercase; letter-spacing: .05em; margin: 24px 0 12px; border-bottom: 2px solid #e5e7eb; padding-bottom: 6px; }
    .dados-grid { display: grid; grid-template-columns: repeat(2,1fr); gap: 6px 20px; margin-bottom: 20px; }
    .dados-field { margin-bottom: 4px; display: flex; gap: 8px; align-items: baseline; }
    .dados-label { font-size: 10px; font-weight: bold; text-transform: uppercase; color: #1f2937; }
    .dados-value { font-size: 11px; color: #1f2937; }
    .conclusion { margin: 20px 0; line-height: 1.6; font-size: 12px; }
    .sign-row { display: flex; justify-content: space-around; margin-top: 60px; text-align: center; }
    .footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #000; text-align: center; font-size: 10px; font-weight: bold; color: #000; line-height: 1.4; }
    .verification { background: #f0f4f8; border: 1px solid #dce8f0; border-radius: 6px; padding: 10px 16px; margin-top: 16px; font-size: 11px; }
    .verification span { font-family: monospace; font-weight: 800; color: #0D364F; font-size: 13px; }
    @media print {
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .no-print { display: none !important; }
      .page { padding: 15px 20px; }
    }
  </style>
</head>
<body>
<div class="page">

  <!-- Print button (no-print) -->
  <div class="no-print" style="text-align:right;margin-bottom:16px">
    <button onclick="window.print()"
      style="padding:9px 22px;background:#0D364F;color:#fff;border:none;border-radius:8px;font-weight:700;cursor:pointer;font-size:13px">
      🖨 Imprimir / Salvar PDF
    </button>
  </div>

  <!-- Header (PDF Style) -->
  <div style="text-align:center; margin-bottom: 30px; line-height: 1.5;">
    <img src="/logo.png" alt="OBGP" style="height:90px; margin: 0 auto 10px; display:block;" />
    <div style="font-size:14px; font-weight:bold; color:#0D364F">ORGANIZAÇÃO BRASIL GESTAO DE PARCERIAS - OBGP</div>
    <div style="font-size:11px; color:#1f2937">Avenida L, N.º 10 D, Quadra 32, Bairro Morada do Sol, Município Paço do Lumiar/MA, CEP 65130-000</div>
    <div style="font-size:11px; color:#1f2937">E-mail: contato.org.obgp@gmail.com, Contato: (98)9 8710-0001</div>
    <div style="font-size:13px; font-weight:bold; margin-top: 12px; color:#0D364F">RELATÓRIO DE CONFORMIDADE N.º ${rel.numero || 'ANO.MES.DIA'}/OBGP</div>
  </div>

  <!-- Section 1 — Dados da Entidade -->
  <div class="section-title">1. Dados da Entidade</div>
  <div class="dados-grid">
    ${[
      ['CNPJ:',              dados.cnpj],
      ['NATUREZA JURÍDICA:', dados.natureza_juridica],
      ['RAZÃO SOCIAL:',      dados.razao_social],
      ['NOME FANTASIA:',     dados.nome_fantasia],
      ['ENDEREÇO:',          dados.logradouro],
      ['DATA ABERTURA CNPJ:',dados.data_abertura_cnpj],
      ['E-MAIL:',            dados.email_osc],
      ['TELEFONE:',          dados.telefone],
    ].map(([l,v]) => `
      <div class="dados-field">
        <div class="dados-label">${l}</div>
        <div class="dados-value">${v || '—'}</div>
      </div>`).join('')}
  </div>

  <!-- Sections 2–6 -->
  ${[2,3,4,5,6].map(s => {
    const sit = itens.filter(i => i.secao === s);
    if (!sit.length) return '';
    return `<div class="section-title">${s}. ${SECAO_LABELS[s]}</div>${renderTable(sit)}`;
  }).join('')}

  <!-- Conclusion -->
  <div class="conclusion">
    <strong>1. Conclusão</strong><br/><br/>
    Após análise documental, constata-se que a ORGANIZAÇÃO DA SOCIEDADE CIVIL, CNPJ ${dados.cnpj || 'XX.XXX.XXX/XXXX-XX'} apresenta a seguinte conformidade aos requisitos para gestão de parcerias:<br/><br/>
    ${secSummary.map((s, idx) => `&nbsp;&nbsp;${idx + 1}. ${s.label} - ${s.pct}% conforme`).join('<br/>')}
    <br/><br/>
    Portanto recomenda-se para certificação independente através do "SELO OSC GESTÃO DE PARCERIAS".
    <br/><br/>
    A autenticidade do documento pode ser conferida através do website: https://obgpbr.org/selo-osc, código de verificação e controle: ${perfil?.certificado_numero || 'RCN.º-ANO.MES.DIA/OBGP'}.
    <br/><br/>
    Paço do Lumiar/MA, ${new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}.
  </div>

  <!-- Assinaturas (PDF Style) -->
  <div class="sign-row">
    <div>
      <div style="border-top: 1px solid #000; padding-top: 6px; font-weight: bold; font-size: 11px;">${rtSign?.nome_assinante || 'Carlos Eduardo dos Santos Coelho'}</div>
      <div style="font-size: 10px;">Administrador Responsável Técnico para Gestão de Parcerias</div>
      <div style="font-size: 10px;">CRAMA-4816</div>
      ${rtSign?.signed_at ? `<div style="font-size: 9px; color: #16a34a; margin-top: 4px;">Assinado Eletronicamente em ${fmtDate(rtSign.signed_at)}</div>` : ''}
    </div>
    <div>
      <div style="border-top: 1px solid #000; padding-top: 6px; font-weight: bold; font-size: 11px;">${contSign?.nome_assinante || 'Rodolfo Meneses Costa'}</div>
      <div style="font-size: 10px;">Contador Responsável Técnico para Gestão de Parcerias</div>
      <div style="font-size: 10px;">CRCMA-005916/O-3</div>
      ${contSign?.signed_at ? `<div style="font-size: 9px; color: #16a34a; margin-top: 4px;">Assinado Eletronicamente em ${fmtDate(contSign.signed_at)}</div>` : ''}
    </div>
  </div>

  ${(perfil?.certificacao_liberada || perfil?.certificado_numero) ? `
  <!-- Selo de Assinatura Digital OBGP -->
  <div style="margin-top: 24px; padding: 16px; border: 2px solid #C5AB76; border-radius: 12px; background: rgba(197,171,118,0.03); display: flex; align-items: center; gap: 20px;">
    <div style="width: 50px; height: 50px; border-radius: 50%; background: #C5AB76; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 24px; font-weight: 900;">✓</div>
    <div style="flex: 1">
      <div style="font-size: 11px; font-weight: 800; color: #0D364F; text-transform: uppercase; letter-spacing: .05em; margin-bottom: 2px;">Documento Assinado Digitalmente</div>
      <div style="font-size: 10px; color: #6b7280; line-height: 1.4;">
        Este relatório foi validado via <strong>Certificado Digital (.pfx)</strong> em conformidade com as normas do <strong>ICP-Brasil</strong> e o Marco Regulatório das OSCs (Lei 13.019/2014).
      </div>
    </div>
    <div style="text-align: right">
       <div style="font-size: 9px; font-weight: 700; color: #9ca3af; text-transform: uppercase;">ID de Validação</div>
       <div style="font-family: monospace; font-size: 13px; font-weight: 800; color: #0D364F;">${perfil.certificado_numero || 'PENDENTE'}</div>
    </div>
  </div>
  ` : ''}

  <!-- Verification -->
  ${(perfil?.certificacao_liberada || perfil?.certificado_numero) ? `
  <div class="verification" style="margin-top:20px">
    Código de verificação: <span>${perfil.certificado_numero || 'AGUARDANDO LIBERAÇÃO'}</span><br/>
    <span style="font-size:10px;color:#6b7280">
      Verifique em: <a href="https://obgpbr.org/verificar?codigo=${perfil.certificado_numero}" style="color:#0D364F">https://obgpbr.org/verificar</a>
    </span>
  </div>` : ''}

  <!-- Footer (PDF Style) -->
  <div class="footer">
    ORGANIZAÇÃO BRASIL GESTAO DE PARCERIAS - OBGP<br/>
    Avenida L, N.º 10 D, Quadra 32, Bairro Morada do Sol, Município Paço do Lumiar/MA, CEP 65130-000<br/>
    E-mail: contato.org.obgp@gmail.com, Contato: (98)9 8710-0001
  </div>
</div>
<script>
  // Auto-print when opened directly as print target
  if (window.location.search.includes('print=1')) window.print();
</script>
</body>
</html>`;

  return new NextResponse(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}
