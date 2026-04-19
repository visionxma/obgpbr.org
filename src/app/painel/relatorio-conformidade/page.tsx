'use client';
import { useEffect, useState, useRef, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import {
  ShieldCheck, ChevronDown, ChevronUp, Upload, ExternalLink,
  Save, Send, Lock, CheckCircle, XCircle, AlertCircle, FileText,
  Plus, Trash2,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { usePainel } from '../PainelContext';
import Link from 'next/link';

/* ── Types ─────────────────────────────────────────────────────────── */
interface RelatorioItem {
  id: string;
  relatorio_id: string;
  secao: 2 | 3 | 4 | 5;
  codigo: string;
  descricao: string;
  is_header: boolean;
  ordem: number;
  codigo_controle: string | null;
  data_emissao: string | null;
  data_validade: string | null;
  analise_atual: string | null;
  status: 'pendente' | 'conforme' | 'nao_conforme' | 'nao_aplicavel';
  arquivo_path: string | null;
  arquivo_nome: string | null;
  arquivo_hash: string | null;
  arquivo_tamanho: number | null;
  observacao: string | null;
}

interface Relatorio {
  id: string;
  osc_id: string;
  numero: string | null;
  status: 'em_preenchimento' | 'em_analise' | 'aprovado' | 'reprovado';
  dados_entidade: Record<string, string>;
  observacao_admin: string | null;
  submitted_at: string | null;
  reviewed_at: string | null;
  created_at: string;
}

/* ── Helpers ───────────────────────────────────────────────────────── */
const MIME_ALLOWED = [
  'application/pdf','image/jpeg','image/png','image/webp',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];
const MIME_EXT: Record<string,string> = {
  'application/pdf':'pdf','image/jpeg':'jpg','image/png':'png','image/webp':'webp',
  'application/msword':'doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document':'docx',
};
const MAX_BYTES = 10 * 1024 * 1024;

async function computeHash(file: File): Promise<string> {
  const buf = await file.arrayBuffer();
  const h   = await crypto.subtle.digest('SHA-256', buf);
  return Array.from(new Uint8Array(h)).map(b=>b.toString(16).padStart(2,'0')).join('');
}

const SECAO_LABELS: Record<number,string> = {
  2: 'Habilitação Jurídica',
  3: 'Regularidade Fiscal, Social e Trabalhista',
  4: 'Qualificação Econômico-Financeira',
  5: 'Qualificação Técnica',
};

const STATUS_LABELS: Record<string,string> = {
  pendente:'Pendente', conforme:'Conforme',
  nao_conforme:'Não Conforme', nao_aplicavel:'N/A',
};

const DADOS_FIELDS = [
  { key:'razao_social',         label:'Razão Social' },
  { key:'cnpj',                 label:'CNPJ' },
  { key:'natureza_juridica',    label:'Natureza Jurídica' },
  { key:'nome_fantasia',        label:'Nome Fantasia' },
  { key:'logradouro',           label:'Endereço' },
  { key:'data_abertura_cnpj',   label:'Data Abertura CNPJ' },
  { key:'email_osc',            label:'E-mail' },
  { key:'telefone',             label:'Telefone' },
];

function fmtBytes(b: number | null) {
  if (!b) return '';
  return b < 1048576 ? `${(b/1024).toFixed(0)} KB` : `${(b/1048576).toFixed(1)} MB`;
}

const TH: React.CSSProperties = {
  padding:'10px 12px', fontSize:'0.63rem', fontWeight:700,
  textTransform:'uppercase', letterSpacing:'.06em',
  color:'var(--site-text-tertiary,#9ca3af)', textAlign:'center', whiteSpace:'nowrap',
};
const TD: React.CSSProperties = { padding:'10px 12px', verticalAlign:'middle' };

/* ── Main component ─────────────────────────────────────────────────── */
function RelatorioContent() {
  const { user, perfil } = usePainel();
  const router = useRouter();

  const [loading, setLoading]         = useState(true);
  const [gated, setGated]             = useState(false);
  const [relatorio, setRelatorio]     = useState<Relatorio | null>(null);
  const [itens, setItens]             = useState<RelatorioItem[]>([]);
  const [dados, setDados]             = useState<Record<string,string>>({});
  const [openSecao, setOpenSecao]     = useState<number>(2);
  const [expandedId, setExpandedId]   = useState<string | null>(null);
  const [saving, setSaving]           = useState<string | null>(null);
  const [uploading, setUploading]     = useState<string | null>(null);
  const [submitting, setSubmitting]   = useState(false);
  const [msg, setMsg]                 = useState('');
  const [instrDesc, setInstrDesc]     = useState('');
  const fileRef                       = useRef<HTMLInputElement>(null);
  const uploadItemId                  = useRef<string | null>(null);

  const readonly = relatorio?.status === 'em_analise' || relatorio?.status === 'aprovado';

  /* ── Load ── */
  useEffect(() => {
    if (!user || !perfil) return;
    (async () => {
      // Gate
      const { data: pf } = await supabase
        .from('osc_perfis').select('certificacao_liberada').eq('id', perfil.id).single();
      if (!pf?.certificacao_liberada) { setGated(true); setLoading(false); return; }

      // Load or create relatorio
      let rel: Relatorio | null = null;
      const { data: ex } = await supabase
        .from('relatorios_conformidade').select('*')
        .eq('osc_id', perfil.osc_id)
        .order('created_at', { ascending: false }).limit(1).maybeSingle();

      if (ex) {
        rel = ex as Relatorio;
      } else {
        const d   = new Date();
        const num = `${Math.floor(Math.random()*900+100)}-${String(d.getDate()).padStart(2,'0')}.${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}/OBGP`;
        const { data: cr } = await supabase
          .from('relatorios_conformidade')
          .insert({ osc_id: perfil.osc_id, numero: num, status:'em_preenchimento',
            dados_entidade:{}, habilitacao_juridica:[], regularidade_fiscal:[],
            qualificacao_economica:[], qualificacao_tecnica:[] })
          .select().single();
        rel = cr as Relatorio;
      }
      if (!rel) { setLoading(false); return; }
      setRelatorio(rel);

      // Seed itens
      const { data: existing } = await supabase
        .from('relatorio_itens').select('id').eq('relatorio_id', rel.id).limit(1);
      if (!existing?.length) {
        await supabase.rpc('seed_relatorio_itens', { p_relatorio_id: rel.id });
      }

      // Load itens
      const { data: its } = await supabase
        .from('relatorio_itens').select('*')
        .eq('relatorio_id', rel.id)
        .order('secao').order('ordem');
      setItens((its ?? []) as RelatorioItem[]);

      // Dados da entidade (pré-preenche do perfil)
      const base = rel.dados_entidade ?? {};
      setDados({
        razao_social:      base.razao_social       ?? (perfil as unknown as Record<string,string>).razao_social       ?? '',
        cnpj:              base.cnpj               ?? (perfil as unknown as Record<string,string>).cnpj               ?? '',
        natureza_juridica: base.natureza_juridica  ?? (perfil as unknown as Record<string,string>).natureza_juridica  ?? '',
        nome_fantasia:     base.nome_fantasia       ?? '',
        logradouro:        base.logradouro          ?? (perfil as unknown as Record<string,string>).logradouro         ?? '',
        data_abertura_cnpj:base.data_abertura_cnpj ?? (perfil as unknown as Record<string,string>).data_abertura_cnpj ?? '',
        email_osc:         base.email_osc           ?? (perfil as unknown as Record<string,string>).email_osc          ?? '',
        telefone:          base.telefone             ?? (perfil as unknown as Record<string,string>).telefone           ?? '',
      });

      setLoading(false);
    })();
  }, [user, perfil]);

  const saveDados = async () => {
    if (!relatorio) return;
    setSaving('dados');
    await supabase.from('relatorios_conformidade').update({ dados_entidade: dados }).eq('id', relatorio.id);
    setSaving(null);
  };

  const updateItem = (id: string, field: keyof RelatorioItem, value: string | null) =>
    setItens(prev => prev.map(i => i.id === id ? { ...i, [field]: value } as RelatorioItem : i));

  const saveItem = async (item: RelatorioItem) => {
    setSaving(item.id);
    await supabase.from('relatorio_itens').update({
      codigo_controle: item.codigo_controle || null,
      data_emissao:    item.data_emissao    || null,
      data_validade:   item.data_validade   || null,
      analise_atual:   item.analise_atual   || null,
      observacao:      item.observacao      || null,
    }).eq('id', item.id);
    setSaving(null);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const iid  = uploadItemId.current;
    if (!file || !iid || !perfil || !relatorio) return;
    e.target.value = '';
    if (!MIME_ALLOWED.includes(file.type)) { setMsg('error:Tipo não permitido.'); return; }
    if (file.size > MAX_BYTES)             { setMsg('error:Máx 10 MB.');           return; }
    setUploading(iid);
    try {
      const hash = await computeHash(file);
      const ext  = MIME_EXT[file.type] ?? 'bin';
      const item = itens.find(i => i.id === iid)!;
      const path = `osc/${perfil.osc_id}/cert/${relatorio.id}/${item.secao}/${item.codigo}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from('osc-docs').upload(path, file, { upsert:true, contentType:file.type });
      if (upErr) { setMsg('error:Erro no upload.'); setUploading(null); return; }
      await supabase.from('relatorio_itens').update({
        arquivo_path: path, arquivo_nome: file.name,
        arquivo_hash: hash, arquivo_tamanho: file.size, status: 'conforme',
      }).eq('id', iid);
      setItens(prev => prev.map(i => i.id === iid
        ? { ...i, arquivo_path:path, arquivo_nome:file.name, arquivo_hash:hash, arquivo_tamanho:file.size, status:'conforme' as const }
        : i));
      setMsg('ok:Arquivo enviado com sucesso.');
    } catch { setMsg('error:Erro inesperado.'); }
    setUploading(null);
  };

  const viewFile = async (path: string) => {
    const { data } = await supabase.storage.from('osc-docs').createSignedUrl(path, 3600);
    if (data?.signedUrl) window.open(data.signedUrl, '_blank');
  };

  const removeFile = async (item: RelatorioItem) => {
    if (!item.arquivo_path) return;
    await supabase.storage.from('osc-docs').remove([item.arquivo_path]);
    await supabase.from('relatorio_itens').update({
      arquivo_path:null, arquivo_nome:null, arquivo_hash:null, arquivo_tamanho:null, status:'pendente',
    }).eq('id', item.id);
    setItens(prev => prev.map(i => i.id === item.id
      ? { ...i, arquivo_path:null, arquivo_nome:null, arquivo_hash:null, arquivo_tamanho:null, status:'pendente' as const }
      : i));
  };

  const addInstrument = async () => {
    if (!relatorio || !instrDesc.trim()) return;
    const sec5   = itens.filter(i => i.secao === 5 && i.codigo.startsWith('5.1.'));
    const codigo = `5.1.${sec5.length + 1}`;
    const { data } = await supabase.from('relatorio_itens').insert({
      relatorio_id: relatorio.id, secao:5, codigo, descricao: instrDesc.trim(),
      is_header: false, ordem: 10 + sec5.length + 1,
    }).select().single();
    if (data) { setItens(prev => [...prev, data as RelatorioItem]); setInstrDesc(''); }
  };

  const handleSubmit = async () => {
    if (!relatorio) return;
    const pend = itens.filter(i => !i.is_header && i.secao < 5 && i.status === 'pendente');
    if (pend.length) { setMsg(`error:${pend.length} item(ns) pendentes. Envie os documentos antes.`); return; }
    await saveDados();
    setSubmitting(true);
    const { error } = await supabase.from('relatorios_conformidade')
      .update({ status:'em_analise', submitted_at: new Date().toISOString() }).eq('id', relatorio.id);
    if (error) setMsg('error:Erro ao enviar.');
    else { setRelatorio(p => p ? { ...p, status:'em_analise' } : p); setMsg('ok:Relatório enviado para análise!'); }
    setSubmitting(false);
  };

  /* ── Render ── */
  if (loading) return (
    <div style={{ textAlign:'center', padding:'60px 0' }}>
      <div style={{ width:32, height:32, border:'3px solid var(--site-border,#e5e7eb)', borderTopColor:'var(--site-primary,#0D364F)', borderRadius:'50%', animation:'spin 1s linear infinite', margin:'0 auto 12px' }}/>
      <style>{`@keyframes spin{100%{transform:rotate(360deg)}}`}</style>
    </div>
  );

  if (gated) return (
    <div style={{ textAlign:'center', padding:'60px 24px' }}>
      <Lock size={40} style={{ color:'#9ca3af', margin:'0 auto 16px', display:'block' }}/>
      <h3 style={{ fontWeight:800, marginBottom:8, color:'var(--site-primary,#0D364F)' }}>Acesso Bloqueado</h3>
      <p style={{ color:'#6b7280', marginBottom:20, lineHeight:1.6 }}>
        O Relatório de Conformidade está disponível somente após a confirmação do pagamento da certificação.
      </p>
      <Link href="/painel/certificacao"
        style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'10px 24px',
          background:'var(--site-primary,#0D364F)', color:'#fff', borderRadius:10, fontWeight:700, textDecoration:'none', fontSize:'0.9rem' }}>
        Solicitar Certificação
      </Link>
    </div>
  );

  if (!relatorio) return null;

  const secoes: (2|3|4|5)[] = [2,3,4,5];
  const totalItens = itens.filter(i => !i.is_header).length;
  const conformes  = itens.filter(i => i.status === 'conforme').length;
  const progPct    = totalItens > 0 ? Math.round((conformes/totalItens)*100) : 0;

  const STATUS_COLORS: Record<string,[string,string]> = {
    pendente:     ['#f59e0b','rgba(245,158,11,.1)'],
    conforme:     ['#16a34a','rgba(22,163,74,.1)'],
    nao_conforme: ['#dc2626','rgba(220,38,38,.08)'],
    nao_aplicavel:['#6b7280','rgba(107,114,128,.1)'],
  };
  function Badge({ s }: { s: string }) {
    const [c,bg] = STATUS_COLORS[s] ?? ['#6b7280','rgba(107,114,128,.1)'];
    return <span style={{ display:'inline-block', padding:'2px 8px', borderRadius:6, fontSize:'0.68rem', fontWeight:700, color:c, background:bg, whiteSpace:'nowrap' }}>{STATUS_LABELS[s]??s}</span>;
  }

  function Msg() {
    if (!msg) return null;
    const ok = msg.startsWith('ok:'); const txt = msg.replace(/^(ok:|error:)/,'');
    return <div style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 14px', borderRadius:10, marginBottom:16, background: ok?'rgba(22,163,74,.08)':'rgba(220,38,38,.07)', color: ok?'#15803d':'#dc2626', border:`1px solid ${ok?'rgba(22,163,74,.2)':'rgba(220,38,38,.2)'}`, fontSize:'0.85rem', fontWeight:500 }}>
      {ok ? <CheckCircle size={14}/> : <AlertCircle size={14}/>} {txt}
    </div>;
  }

  return (
    <div>
      {/* Summary cards */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))', gap:14, marginBottom:24 }}>
        {[
          { label:'Relatório N.º',    value: relatorio.numero ?? '—', mono:true },
          { label:'Status',           value: ({em_preenchimento:'Em Preenchimento',em_analise:'Em Análise',aprovado:'Aprovado',reprovado:'Reprovado'})[relatorio.status] },
          { label:'Conformes',        value: `${conformes} / ${totalItens}` },
          { label:'Progresso',        value: `${progPct}%` },
        ].map(({ label, value, mono }) => (
          <div key={label} style={{ background:'#fff', borderRadius:12, padding:'14px 18px', border:'1px solid var(--site-border,#e5e7eb)', boxShadow:'0 1px 4px rgba(0,0,0,.04)' }}>
            <div style={{ fontSize:'0.6rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'.08em', color:'#9ca3af', marginBottom:3 }}>{label}</div>
            <div style={{ fontWeight:800, fontSize:'1rem', color:'var(--site-primary,#0D364F)', fontFamily: mono?'monospace':undefined }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div style={{ background:'#fff', borderRadius:12, padding:'14px 18px', border:'1px solid var(--site-border,#e5e7eb)', marginBottom:22 }}>
        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6, fontSize:'0.78rem', fontWeight:600, color:'#6b7280' }}>
          <span>Preenchimento</span><span>{progPct}%</span>
        </div>
        <div style={{ height:7, background:'#e5e7eb', borderRadius:4, overflow:'hidden' }}>
          <div style={{ height:'100%', width:`${progPct}%`, background:'var(--site-primary,#0D364F)', borderRadius:4, transition:'width .4s' }}/>
        </div>
      </div>

      <Msg />

      {/* Status banners */}
      {relatorio.status === 'em_analise' && (
        <div style={{ background:'rgba(59,130,246,.06)', border:'1px solid rgba(59,130,246,.2)', borderRadius:12, padding:'12px 16px', marginBottom:20, display:'flex', alignItems:'center', gap:10 }}>
          <AlertCircle size={16} style={{ color:'#2563eb', flexShrink:0 }}/>
          <span style={{ fontSize:'0.82rem', color:'#1e40af', fontWeight:500 }}>
            Enviado em {relatorio.submitted_at ? new Date(relatorio.submitted_at).toLocaleDateString('pt-BR') : '—'}. Aguardando análise OBGP.
          </span>
        </div>
      )}
      {relatorio.status === 'aprovado' && (
        <div style={{ background:'rgba(22,163,74,.06)', border:'1px solid rgba(22,163,74,.2)', borderRadius:12, padding:'12px 16px', marginBottom:20, display:'flex', alignItems:'center', gap:10 }}>
          <CheckCircle size={16} style={{ color:'#16a34a', flexShrink:0 }}/>
          <span style={{ fontSize:'0.82rem', color:'#15803d', fontWeight:700 }}>Relatório APROVADO. Selo OSC emitido.</span>
        </div>
      )}
      {relatorio.status === 'reprovado' && (
        <div style={{ background:'rgba(220,38,38,.06)', border:'1px solid rgba(220,38,38,.2)', borderRadius:12, padding:'12px 16px', marginBottom:20 }}>
          <div style={{ fontSize:'0.82rem', fontWeight:700, color:'#dc2626', marginBottom:3 }}>Reprovado</div>
          {relatorio.observacao_admin && <div style={{ fontSize:'0.82rem', color:'#7f1d1d' }}>{relatorio.observacao_admin}</div>}
        </div>
      )}

      {/* Section 1 — Dados da Entidade */}
      <div style={{ background:'#fff', borderRadius:14, border:'1px solid var(--site-border,#e5e7eb)', marginBottom:16, boxShadow:'0 1px 5px rgba(0,0,0,.04)' }}>
        <button onClick={() => setOpenSecao(openSecao===1?0:1)}
          style={{ width:'100%', display:'flex', justifyContent:'space-between', alignItems:'center', padding:'15px 20px', background:'none', border:'none', cursor:'pointer' }}>
          <span style={{ fontWeight:800, fontSize:'0.92rem', color:'var(--site-primary,#0D364F)' }}>1 — Dados da Entidade</span>
          {openSecao===1 ? <ChevronUp size={15}/> : <ChevronDown size={15}/>}
        </button>
        {openSecao===1 && (
          <div style={{ padding:'0 20px 20px', borderTop:'1px solid var(--site-border,#e5e7eb)' }}>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:10, marginTop:14 }}>
              {DADOS_FIELDS.map(({ key, label }) => (
                <div key={key}>
                  <label style={{ display:'block', fontSize:'0.63rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'.06em', color:'#9ca3af', marginBottom:3 }}>{label}</label>
                  <input type="text" value={dados[key]??''} disabled={readonly}
                    onChange={e => setDados(p => ({ ...p, [key]: e.target.value }))}
                    onBlur={saveDados}
                    style={{ width:'100%', padding:'7px 10px', border:'1.5px solid var(--site-border,#e5e7eb)', borderRadius:8, fontSize:'0.83rem', outline:'none', background: readonly?'#f8fafc':'#fafafa', boxSizing:'border-box' }}
                  />
                </div>
              ))}
            </div>
            {!readonly && (
              <button onClick={saveDados} disabled={saving==='dados'}
                style={{ marginTop:12, padding:'7px 16px', background:'var(--site-primary,#0D364F)', color:'#fff', border:'none', borderRadius:8, fontWeight:700, cursor:'pointer', fontSize:'0.8rem', display:'inline-flex', alignItems:'center', gap:5 }}>
                <Save size={12}/>{saving==='dados'?'Salvando...':'Salvar Dados'}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Sections 2–5 */}
      {secoes.map(secao => {
        const secItens = itens.filter(i => i.secao===secao).sort((a,b) => a.ordem-b.ordem);
        const secConf  = secItens.filter(i => !i.is_header && i.status==='conforme').length;
        const secTotal = secItens.filter(i => !i.is_header).length;

        return (
          <div key={secao} style={{ background:'#fff', borderRadius:14, border:'1px solid var(--site-border,#e5e7eb)', marginBottom:16, boxShadow:'0 1px 5px rgba(0,0,0,.04)' }}>
            <button onClick={() => setOpenSecao(openSecao===secao?0:secao)}
              style={{ width:'100%', display:'flex', justifyContent:'space-between', alignItems:'center', padding:'15px 20px', background:'none', border:'none', cursor:'pointer' }}>
              <span style={{ fontWeight:800, fontSize:'0.92rem', color:'var(--site-primary,#0D364F)' }}>
                {secao} — {SECAO_LABELS[secao]}
              </span>
              <span style={{ display:'flex', alignItems:'center', gap:10 }}>
                <span style={{ fontSize:'0.73rem', color:'#9ca3af', fontWeight:600 }}>{secConf}/{secTotal}</span>
                {openSecao===secao ? <ChevronUp size={15}/> : <ChevronDown size={15}/>}
              </span>
            </button>

            {openSecao===secao && (
              <div style={{ borderTop:'1px solid var(--site-border,#e5e7eb)' }}>
                <div style={{ overflowX:'auto' }}>
                  <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'0.82rem' }}>
                    <thead>
                      <tr style={{ background:'#f8fafc' }}>
                        <th style={TH}>Código</th>
                        <th style={{...TH,textAlign:'left',minWidth:200}}>Documento</th>
                        <th style={TH}>Cód. Controle</th>
                        <th style={TH}>Emissão</th>
                        <th style={TH}>Validade</th>
                        <th style={TH}>Status</th>
                        <th style={TH}>Arquivo</th>
                        {!readonly && <th style={TH}>Ação</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {secItens.map(item => {
                        const exp = expandedId === item.id;
                        return (
                          <>
                            <tr key={item.id}
                              onClick={() => !item.is_header && !readonly && setExpandedId(exp ? null : item.id)}
                              style={{ borderTop:'1px solid var(--site-border,#e5e7eb)', background: item.is_header?'#f0f4f8': exp?'rgba(13,54,79,.03)':'transparent', cursor: !item.is_header&&!readonly?'pointer':'default' }}>
                              <td style={{ ...TD, fontFamily:'monospace', fontWeight:700, color:'var(--site-primary,#0D364F)', whiteSpace:'nowrap' }}>{item.codigo}</td>
                              <td style={{ ...TD, fontWeight: item.is_header?700:500, color: item.is_header?'var(--site-primary,#0D364F)':'#1f2937', fontStyle: item.is_header?'italic':undefined }}>{item.descricao}</td>
                              <td style={{ ...TD, color:'#6b7280', textAlign:'center' }}>{item.codigo_controle||'—'}</td>
                              <td style={{ ...TD, color:'#6b7280', textAlign:'center', whiteSpace:'nowrap' }}>
                                {item.data_emissao ? new Date(item.data_emissao+'T12:00:00').toLocaleDateString('pt-BR') : '—'}
                              </td>
                              <td style={{ ...TD, color:'#6b7280', textAlign:'center', whiteSpace:'nowrap' }}>
                                {item.data_validade ? new Date(item.data_validade+'T12:00:00').toLocaleDateString('pt-BR') : '—'}
                              </td>
                              <td style={{ ...TD, textAlign:'center' }}>{!item.is_header && <Badge s={item.status}/>}</td>
                              <td style={{ ...TD, textAlign:'center' }}>
                                {item.arquivo_nome && (
                                  <button onClick={e=>{e.stopPropagation();viewFile(item.arquivo_path!)}}
                                    style={{ background:'none', border:'none', cursor:'pointer', color:'var(--site-primary,#0D364F)', display:'inline-flex', alignItems:'center', gap:3, fontSize:'0.73rem', fontWeight:600 }}>
                                    <ExternalLink size={11}/>{fmtBytes(item.arquivo_tamanho)}
                                  </button>
                                )}
                              </td>
                              {!readonly && (
                                <td style={{ ...TD, textAlign:'center' }} onClick={e=>e.stopPropagation()}>
                                  {!item.is_header && (
                                    <div style={{ display:'flex', gap:4, justifyContent:'center' }}>
                                      <button disabled={uploading===item.id} title="Upload"
                                        onClick={() => { uploadItemId.current=item.id; fileRef.current?.click(); }}
                                        style={{ padding:'3px 8px', border:'1.5px solid var(--site-primary,#0D364F)', borderRadius:6, background:'none', cursor:'pointer', color:'var(--site-primary,#0D364F)', fontSize:'0.7rem', fontWeight:700, display:'inline-flex', alignItems:'center', gap:3 }}>
                                        {uploading===item.id?'...':<><Upload size={10}/>Upload</>}
                                      </button>
                                      {item.arquivo_path && (
                                        <button title="Remover" onClick={()=>removeFile(item)}
                                          style={{ padding:'3px 6px', border:'1.5px solid rgba(220,38,38,.3)', borderRadius:6, background:'none', cursor:'pointer', color:'#dc2626', display:'inline-flex', alignItems:'center' }}>
                                          <Trash2 size={10}/>
                                        </button>
                                      )}
                                    </div>
                                  )}
                                </td>
                              )}
                            </tr>

                            {/* Expanded editing row */}
                            {exp && !item.is_header && (
                              <tr key={`${item.id}-exp`} style={{ background:'rgba(13,54,79,.02)' }}>
                                <td colSpan={readonly?7:8} style={{ padding:'14px 20px', borderTop:'1px dashed var(--site-border,#e5e7eb)' }}>
                                  <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))', gap:10 }}>
                                    {[
                                      { f:'codigo_controle', label:'Código de Controle', type:'text',  ph:'ex: 3AA3.704B.578E.7710' },
                                      { f:'data_emissao',    label:'Data de Emissão',    type:'date',  ph:'' },
                                      { f:'data_validade',   label:'Data de Validade',   type:'date',  ph:'' },
                                    ].map(({ f, label, type, ph }) => (
                                      <div key={f}>
                                        <label style={{ display:'block', fontSize:'0.6rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'.05em', color:'#9ca3af', marginBottom:3 }}>{label}</label>
                                        <input type={type}
                                          value={(item as unknown as Record<string,string>)[f] ?? ''}
                                          onChange={e => updateItem(item.id, f as keyof RelatorioItem, e.target.value||null)}
                                          placeholder={ph}
                                          style={{ width:'100%', padding:'7px 9px', border:'1.5px solid var(--site-border,#e5e7eb)', borderRadius:7, fontSize:'0.82rem', outline:'none', background:'#fafafa', boxSizing:'border-box' }}
                                        />
                                      </div>
                                    ))}
                                    <div style={{ gridColumn:'1/-1' }}>
                                      <label style={{ display:'block', fontSize:'0.6rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'.05em', color:'#9ca3af', marginBottom:3 }}>Análise / Situação Atual</label>
                                      <input type="text"
                                        value={item.analise_atual??''}
                                        onChange={e => updateItem(item.id,'analise_atual',e.target.value||null)}
                                        placeholder="Descreva a situação atual do documento..."
                                        style={{ width:'100%', padding:'7px 9px', border:'1.5px solid var(--site-border,#e5e7eb)', borderRadius:7, fontSize:'0.82rem', outline:'none', background:'#fafafa', boxSizing:'border-box' }}
                                      />
                                    </div>
                                  </div>
                                  <button onClick={() => saveItem(item)} disabled={saving===item.id}
                                    style={{ marginTop:10, padding:'7px 15px', background:'var(--site-primary,#0D364F)', color:'#fff', border:'none', borderRadius:8, fontWeight:700, cursor:'pointer', fontSize:'0.78rem', display:'inline-flex', alignItems:'center', gap:5 }}>
                                    <Save size={12}/>{saving===item.id?'Salvando...':'Salvar'}
                                  </button>
                                </td>
                              </tr>
                            )}
                          </>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Add instrument — Section 5 only */}
                {secao===5 && !readonly && (
                  <div style={{ padding:'12px 18px', borderTop:'1px solid var(--site-border,#e5e7eb)', display:'flex', gap:8, alignItems:'center', flexWrap:'wrap' }}>
                    <FileText size={13} style={{ color:'#9ca3af', flexShrink:0 }}/>
                    <input type="text" value={instrDesc} onChange={e=>setInstrDesc(e.target.value)}
                      placeholder="Descrição do instrumento (ex: Termo de Fomento Prefeitura de X/UF)"
                      style={{ flex:1, minWidth:200, padding:'7px 10px', border:'1.5px solid var(--site-border,#e5e7eb)', borderRadius:7, fontSize:'0.82rem', outline:'none', background:'#fafafa' }}
                    />
                    <button onClick={addInstrument} disabled={!instrDesc.trim()}
                      style={{ padding:'7px 14px', background:'var(--site-primary,#0D364F)', color:'#fff', border:'none', borderRadius:7, fontWeight:700, cursor:'pointer', fontSize:'0.78rem', display:'inline-flex', alignItems:'center', gap:4, opacity: instrDesc.trim()?1:.5 }}>
                      <Plus size={12}/>Adicionar Instrumento
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}

      {/* Submit */}
      {!readonly && (
        <div style={{ background:'#fff', borderRadius:14, border:'1px solid var(--site-border,#e5e7eb)', padding:'18px 22px', marginTop:6, display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:14 }}>
          <div>
            <div style={{ fontWeight:700, fontSize:'0.88rem', color:'var(--site-primary,#0D364F)', marginBottom:2 }}>Enviar para Análise</div>
            <div style={{ fontSize:'0.78rem', color:'#6b7280', lineHeight:1.5 }}>
              Após envio, o relatório ficará bloqueado para edição até o retorno da análise.
            </div>
          </div>
          <button onClick={handleSubmit} disabled={submitting}
            style={{ padding:'11px 26px', background:'var(--site-primary,#0D364F)', color:'#fff', border:'none', borderRadius:10, fontWeight:800, cursor: submitting?'wait':'pointer', fontSize:'0.88rem', display:'flex', alignItems:'center', gap:8 }}>
            {submitting?'Enviando...':<><Send size={15}/>Enviar para Análise</>}
          </button>
        </div>
      )}

      {/* PDF */}
      {(relatorio.status === 'aprovado' || relatorio.status === 'em_analise') && (
        <div style={{ textAlign:'center', marginTop:14 }}>
          <a href={`/api/relatorio/pdf/${relatorio.id}`} target="_blank" rel="noopener noreferrer"
            style={{ display:'inline-flex', alignItems:'center', gap:6, fontSize:'0.82rem', fontWeight:600, color:'var(--site-primary,#0D364F)', textDecoration:'none' }}>
            <ShieldCheck size={13}/>Visualizar / Imprimir Relatório de Conformidade
          </a>
        </div>
      )}

      {/* Hidden file input */}
      <input ref={fileRef} type="file" style={{ display:'none' }}
        accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx" onChange={handleUpload}/>

      <style>{`@keyframes spin{100%{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

export default function RelatorioConformidadePage() {
  return (
    <Suspense fallback={<div/>}>
      <RelatorioContent/>
    </Suspense>
  );
}
