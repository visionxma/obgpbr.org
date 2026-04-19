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
  4: 'Qualificação Econômico-Financeira',
  5: 'Qualificação Técnica',
};

function renderTable(itens: RelItem[]) {
  const rows = itens.map(i => {
    const bg  = i.is_header ? '#dce8f0' : '';
    const fw  = i.is_header ? 'bold' : 'normal';
    const fs  = i.is_header ? 'italic' : 'normal';
    const sta = i.is_header ? '' : ({
      conforme:     '<span style="color:#16a34a;font-weight:700">Conforme</span>',
      nao_conforme: '<span style="color:#dc2626;font-weight:700">Não Conforme</span>',
      nao_aplicavel:'<span style="color:#6b7280">N/A</span>',
      pendente:     '<span style="color:#f59e0b">Pendente</span>',
    }[i.status] ?? i.status);
    return `
      <tr style="background:${bg}">
        <td style="font-family:monospace;font-weight:bold;white-space:nowrap;padding:5px 8px;border:1px solid #ccc">${i.codigo}</td>
        <td style="font-weight:${fw};font-style:${fs};padding:5px 8px;border:1px solid #ccc">${i.descricao}</td>
        <td style="text-align:center;padding:5px 8px;border:1px solid #ccc">${i.codigo_controle ?? '—'}</td>
        <td style="text-align:center;white-space:nowrap;padding:5px 8px;border:1px solid #ccc">${fmtDate(i.data_emissao)}</td>
        <td style="text-align:center;white-space:nowrap;padding:5px 8px;border:1px solid #ccc">${fmtDate(i.data_validade)}</td>
        <td style="padding:5px 8px;border:1px solid #ccc">${i.analise_atual ?? '—'}</td>
        <td style="text-align:center;padding:5px 8px;border:1px solid #ccc">${sta}</td>
      </tr>`;
  }).join('');

  return `
    <table style="width:100%;border-collapse:collapse;font-size:11px;margin-bottom:20px">
      <thead>
        <tr style="background:#0D364F;color:#fff">
          <th style="padding:6px 8px;border:1px solid #0D364F;text-align:left">Código</th>
          <th style="padding:6px 8px;border:1px solid #0D364F;text-align:left">Descrição do Documento</th>
          <th style="padding:6px 8px;border:1px solid #0D364F">Cód. Controle</th>
          <th style="padding:6px 8px;border:1px solid #0D364F">Data Emissão</th>
          <th style="padding:6px 8px;border:1px solid #0D364F">Data Validade</th>
          <th style="padding:6px 8px;border:1px solid #0D364F">Análise Situação Atual</th>
          <th style="padding:6px 8px;border:1px solid #0D364F">Status</th>
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
  const secSummary = [2,3,4,5].map(s => {
    const sit  = nonHeaders.filter(i => i.secao === s);
    const conf = sit.filter(i => i.status === 'conforme').length;
    return { secao:s, label: SECAO_LABELS[s], pct: sit.length > 0 ? Math.round(conf/sit.length*100) : 0 };
  });

  // Signature blocks
  const rtSign   = assinaturas.find(a => a.role === 'admin_rt');
  const contSign = assinaturas.find(a => a.role === 'contador');

  function sigBlock(title: string, name: string | undefined, cred: string | undefined, dt: string | undefined) {
    return `
      <div style="border:1px solid #ccc;border-radius:6px;padding:14px 18px;min-width:220px;flex:1">
        <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:#6b7280;margin-bottom:6px">${title}</div>
        ${name
          ? `<div style="font-weight:700;font-size:12px">${name}</div>
             ${cred ? `<div style="font-size:11px;color:#6b7280">${cred}</div>` : ''}
             <div style="font-size:10px;color:#9ca3af;margin-top:4px">Assinado em ${fmtDate(dt??null)}</div>
             <div style="margin-top:8px;padding:6px;background:#f0faf4;border:1px solid rgba(22,163,74,.2);border-radius:4px;font-size:10px;color:#15803d">✓ Assinatura registrada</div>`
          : `<div style="color:#9ca3af;font-size:11px;font-style:italic">Aguardando assinatura</div>`
        }
      </div>`;
  }

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
    .section-title { font-size: 13px; font-weight: 800; color: #0D364F; text-transform: uppercase; letter-spacing: .05em; margin: 20px 0 10px; padding: 8px 12px; background: #f0f4f8; border-left: 4px solid #0D364F; border-radius: 0 6px 6px 0; }
    .dados-grid { display: grid; grid-template-columns: repeat(auto-fit,minmax(200px,1fr)); gap: 8px 20px; margin-bottom: 20px; }
    .dados-field { margin-bottom: 4px; }
    .dados-label { font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: .06em; color: #9ca3af; margin-bottom: 2px; }
    .dados-value { font-size: 12px; font-weight: 600; color: #1f2937; }
    .summary-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 10px; margin: 20px 0; }
    .summary-card { text-align: center; padding: 10px; border: 1px solid #e5e7eb; border-radius: 6px; }
    .summary-pct { font-size: 20px; font-weight: 900; color: #0D364F; }
    .summary-label { font-size: 9px; color: #9ca3af; font-weight: 600; text-transform: uppercase; margin-top: 2px; }
    .conclusion { background: #f8fafc; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px 20px; margin: 20px 0; line-height: 1.7; }
    .sign-row { display: flex; gap: 16px; flex-wrap: wrap; margin-top: 24px; }
    .footer { margin-top: 32px; padding-top: 16px; border-top: 1px solid #e5e7eb; text-align: center; font-size: 10px; color: #9ca3af; line-height: 1.6; }
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

  <!-- Header -->
  <div class="header">
    <div>
      <div class="header-brand">OBG<span>P</span></div>
      <div style="font-size:9px;font-weight:700;color:#6b7280;letter-spacing:.08em">ORGANIZAÇÃO BRASIL GESTÃO DE PARCERIAS</div>
    </div>
    <div class="header-info">
      Av. L, N.º 10 D, Quadra 32, Bairro Morada do Sol, Paço do Lumiar/MA, CEP 65130-000<br/>
      contato.org.obgp@gmail.com &nbsp;|&nbsp; (98) 9 8710-0001 &nbsp;|&nbsp; obgpbr.org
    </div>
  </div>

  <!-- Title -->
  <div class="title-block">
    <h1>Relatório de Conformidade</h1>
    <div class="subtitle">
      N.º ${rel.numero ?? '—'} &nbsp;|&nbsp; OSC: ${rel.osc_id}
      ${perfil?.certificado_numero ? ` &nbsp;|&nbsp; Código: <strong>${perfil.certificado_numero}</strong>` : ''}
    </div>
    <div style="font-size:10px;color:#9ca3af;margin-top:4px">
      Emitido em: ${fmtDate(rel.reviewed_at ?? rel.created_at)} &nbsp;|&nbsp; Status: ${({
        em_preenchimento:'Em Preenchimento', em_analise:'Em Análise',
        aprovado:'APROVADO', reprovado:'REPROVADO',
      })[rel.status as string] ?? rel.status}
    </div>
  </div>

  <!-- Section 1 — Dados da Entidade -->
  <div class="section-title">1 — Dados da Entidade</div>
  <div class="dados-grid">
    ${[
      ['CNPJ',              dados.cnpj],
      ['Natureza Jurídica', dados.natureza_juridica],
      ['Razão Social',      dados.razao_social],
      ['Nome Fantasia',     dados.nome_fantasia],
      ['Endereço',          dados.logradouro],
      ['Data Abertura CNPJ',dados.data_abertura_cnpj],
      ['E-mail',            dados.email_osc],
      ['Telefone',          dados.telefone],
    ].map(([l,v]) => `
      <div class="dados-field">
        <div class="dados-label">${l}</div>
        <div class="dados-value">${v || '—'}</div>
      </div>`).join('')}
  </div>

  <!-- Sections 2–5 -->
  ${[2,3,4,5].map(s => {
    const sit = itens.filter(i => i.secao === s);
    if (!sit.length) return '';
    return `<div class="section-title">${s} — ${SECAO_LABELS[s]}</div>${renderTable(sit)}`;
  }).join('')}

  <!-- Summary -->
  <div class="section-title">6 — Conclusão</div>
  <div class="summary-grid">
    ${secSummary.map(s => `
      <div class="summary-card">
        <div class="summary-pct">${s.pct}%</div>
        <div class="summary-label">${s.label}</div>
      </div>`).join('')}
  </div>

  <div class="conclusion">
    <strong>Após análise documental</strong>, constata-se que a organização <strong>${dados.razao_social || rel.osc_id}</strong>,
    CNPJ <strong>${dados.cnpj || '—'}</strong>, apresenta a seguinte conformidade aos requisitos para gestão de parcerias:<br/><br/>
    ${secSummary.map(s => `&nbsp;&nbsp;${s.secao}. ${s.label} — <strong>${s.pct}% conforme</strong>`).join('<br/>')}
    <br/><br/>
    ${secSummary.every(s => s.pct === 100)
      ? '<strong>Portanto, recomenda-se para certificação independente através do "SELO OSC GESTÃO DE PARCERIAS".</strong>'
      : 'Pendências identificadas — a certificação será emitida após a regularização dos itens não conformes.'}
  </div>

  <!-- Assinaturas -->
  <div class="section-title" style="margin-top:24px">Assinaturas Eletrônicas / Trilha de Auditoria</div>
  <div class="sign-row">
    ${sigBlock(
      'Responsável Técnico (RT)',
      rtSign?.nome_assinante,
      rtSign?.credencial ?? undefined,
      rtSign?.signed_at
    )}
    ${sigBlock(
      'Contador Responsável Técnico',
      contSign?.nome_assinante,
      contSign?.credencial ?? undefined,
      contSign?.signed_at
    )}
  </div>

  <!-- Verification -->
  ${perfil?.certificado_numero ? `
  <div class="verification" style="margin-top:20px">
    Código de verificação: <span>${perfil.certificado_numero}</span><br/>
    <span style="font-size:10px;color:#6b7280">
      Verifique em: <a href="https://obgpbr.org/verificar?codigo=${perfil.certificado_numero}" style="color:#0D364F">https://obgpbr.org/verificar</a>
    </span>
  </div>` : ''}

  <!-- Footer -->
  <div class="footer">
    ORGANIZAÇÃO BRASIL GESTÃO DE PARCERIAS — OBGP<br/>
    Av. L, N.º 10 D, Quadra 32, Bairro Morada do Sol, Paço do Lumiar/MA, CEP 65130-000<br/>
    contato.org.obgp@gmail.com &nbsp;|&nbsp; (98) 9 8710-0001 &nbsp;|&nbsp; obgpbr.org<br/>
    <em>Art. 11 da Lei nº 13.019/2014 — Portal de Transparência OBGP</em>
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
