'use client';
import { useEffect, useState, useRef, useCallback, Suspense } from 'react';
import {
  ShieldCheck, Upload, ExternalLink,
  Save, Send, Lock, CheckCircle, AlertCircle, FileText,
  Plus, Trash2, Clock, Key
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { usePainel } from '../PainelContext';
import Link from 'next/link';
import { maskCNPJ, maskTelefone, maskCEP } from '@/lib/brasil-masks';

/* ── Types ─────────────────────────────────────────────────────────── */
interface RelatorioItem {
  id: string; relatorio_id: string;
  secao: 2 | 3 | 4 | 5; codigo: string; descricao: string;
  is_header: boolean; ordem: number;
  codigo_controle: string | null; data_emissao: string | null;
  data_validade: string | null; analise_atual: string | null;
  status: 'pendente' | 'conforme' | 'nao_conforme' | 'nao_aplicavel';
  arquivo_path: string | null; arquivo_nome: string | null;
  arquivo_hash: string | null; arquivo_tamanho: number | null;
  observacao: string | null;
}
interface Relatorio {
  id: string; osc_id: string; numero: string | null;
  status: 'em_preenchimento' | 'em_analise' | 'aprovado' | 'reprovado';
  dados_entidade: Record<string, string>;
  observacao_admin: string | null; submitted_at: string | null; created_at: string;
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
  return Array.from(new Uint8Array(h)).map(b => b.toString(16).padStart(2,'0')).join('');
}

const SECAO_LABELS: Record<number,string> = {
  1: 'Dados da Entidade',
  2: 'Habilitação Jurídica',
  3: 'Regularidade Fiscal, Social e Trabalhista',
  4: 'Qualificação Econômico-Financeira',
  5: 'Qualificação Técnica',
  6: 'Conclusão',
};
const STATUS_LABELS: Record<string,string> = {
  pendente:'Pendente', conforme:'Conforme',
  nao_conforme:'Não Conforme', nao_aplicavel:'N/A',
};
const DADOS_FIELDS = [
  { key:'razao_social',      label:'Razão Social' },
  { key:'cnpj',              label:'CNPJ/PIX' },
  { key:'natureza_juridica', label:'Natureza Jurídica' },
  { key:'nome_fantasia',     label:'Nome Fantasia' },
  { key:'logradouro',        label:'Endereço' },
  { key:'data_abertura_cnpj',label:'Data Abertura CNPJ' },
  { key:'banco',             label:'Banco' },
  { key:'agencia',           label:'Agência' },
  { key:'conta_corrente',    label:'Conta Corrente' },
  { key:'email_osc',         label:'E-mail' },
  { key:'telefone',          label:'Telefone' },
];


function fmtBytes(b: number | null) {
  if (!b) return '';
  return b < 1048576 ? `${(b/1024).toFixed(0)} KB` : `${(b/1048576).toFixed(1)} MB`;
}
function fmtHora(iso: string) {
  return new Date(iso).toLocaleTimeString('pt-BR', { hour:'2-digit', minute:'2-digit' });
}

function DateInput({ value, onChange, style }: {
  value: string | null;
  onChange: (v: string | null) => void;
  style?: React.CSSProperties;
}) {
  function toDisplay(iso: string | null) {
    if (!iso) return '';
    const [y, m, d] = iso.split('-');
    return (d && m && y) ? `${d}/${m}/${y}` : '';
  }
  const [display, setDisplay] = useState(toDisplay(value));
  useEffect(() => { setDisplay(toDisplay(value)); }, [value]);

  function handle(e: React.ChangeEvent<HTMLInputElement>) {
    const digits = e.target.value.replace(/\D/g, '').slice(0, 8);
    let fmt = digits;
    if (digits.length > 2) fmt = digits.slice(0,2) + '/' + digits.slice(2);
    if (digits.length > 4) fmt = digits.slice(0,2) + '/' + digits.slice(2,4) + '/' + digits.slice(4);
    setDisplay(fmt);
    if (digits.length === 8) {
      const iso = `${digits.slice(4)}-${digits.slice(2,4)}-${digits.slice(0,2)}`;
      if (!isNaN(new Date(iso).getTime())) onChange(iso);
    } else if (digits.length === 0) {
      onChange(null);
    }
  }
  return (
    <input type="text" inputMode="numeric" maxLength={10}
      value={display} onChange={handle} placeholder="dd/mm/aaaa"
      style={style}
    />
  );
}

const TH: React.CSSProperties = {
  padding:'9px 12px', fontSize:'0.62rem', fontWeight:700,
  textTransform:'uppercase', letterSpacing:'.06em',
  color:'#9ca3af', textAlign:'center', whiteSpace:'nowrap',
};
const TD: React.CSSProperties = { padding:'9px 12px', verticalAlign:'middle' };

/* ── Toast ─────────────────────────────────────────────────────────── */
function Toast({ msg, onClose }: { msg: string; onClose: () => void }) {
  const ok = msg.startsWith('ok:');
  const txt = msg.replace(/^(ok:|error:)/,'');
  useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t); }, [msg]);
  return (
    <div style={{
      position:'fixed', bottom:24, right:24, zIndex:999,
      display:'flex', alignItems:'center', gap:10, padding:'12px 18px',
      borderRadius:12, boxShadow:'0 4px 20px rgba(0,0,0,.15)',
      background: ok ? '#15803d' : '#dc2626', color:'#fff',
      fontSize:'0.85rem', fontWeight:600, minWidth:220, maxWidth:360,
      animation:'slideUp .25s ease',
    }}>
      {ok ? <CheckCircle size={16}/> : <AlertCircle size={16}/>}
      <span style={{ flex:1 }}>{txt}</span>
      <button onClick={onClose} style={{ background:'none', border:'none', color:'rgba(255,255,255,.7)', cursor:'pointer', padding:0 }}>✕</button>
    </div>
  );
}

/* ── Section header ─────────────────────────────────────────────────── */
function SecaoHeader({ num, label, conf, total, pend, readonly }: {
  num: number; label: string; conf: number; total: number; pend: number; readonly: boolean;
}) {
  const done = total > 0 && conf === total;
  return (
    <div style={{
      padding:'14px 20px', borderBottom:'1px solid #e5e7eb',
      display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:8,
      background: done ? 'rgba(22,163,74,.03)' : undefined,
    }}>
      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
        <div style={{
          width:28, height:28, borderRadius:'50%',
          background: done ? '#16a34a' : 'var(--site-primary,#0D364F)',
          color:'#fff', display:'flex', alignItems:'center', justifyContent:'center',
          fontSize:'0.75rem', fontWeight:800, flexShrink:0,
        }}>
          {done ? <CheckCircle size={13}/> : num}
        </div>
        <span style={{ fontWeight:800, fontSize:'0.9rem', color:'var(--site-primary,#0D364F)' }}>
          {num} — {label}
        </span>
      </div>
      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
        {pend > 0 && !readonly && (
          <span style={{ fontSize:'0.68rem', color:'#f59e0b', fontWeight:700, background:'rgba(245,158,11,.1)', padding:'2px 8px', borderRadius:6 }}>
            {pend} pendente{pend>1?'s':''}
          </span>
        )}
        {total > 0 && (
          <span style={{ fontSize:'0.72rem', color: done ? '#16a34a' : '#9ca3af', fontWeight:700 }}>
            {done ? '✅ Concluído' : `${conf}/${total} conformes`}
          </span>
        )}
      </div>
    </div>
  );
}

/* ── Badge ──────────────────────────────────────────────────────────── */
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

/* ── Main component ─────────────────────────────────────────────────── */
function RelatorioContent() {
  const { user, perfil } = usePainel();

  const [loading, setLoading]       = useState(true);
  const [gated, setGated]           = useState(false);
  const [forceGating, setForceGating] = useState(false);
  const [relatorio, setRelatorio]   = useState<Relatorio | null>(null);
  const [itens, setItens]           = useState<RelatorioItem[]>([]);
  const [dados, setDados]           = useState<Record<string,string>>({});
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [saving, setSaving]         = useState<string | null>(null);
  const [uploading, setUploading]   = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast]           = useState('');
  const [dadosSalvos, setDadosSalvos] = useState(false);
  const [dadosSalvoAt, setDadosSalvoAt] = useState('');
  const [instrDesc, setInstrDesc]   = useState('');
  
  const [showSignModal, setShowSignModal] = useState(false);
  const [pfxFile, setPfxFile] = useState<File | null>(null);
  const [pfxPassword, setPfxPassword] = useState('');
  const [signing, setSigning] = useState(false);

  const fileRef        = useRef<HTMLInputElement>(null);
  const uploadItemId   = useRef<string | null>(null);
  const dadosDebounce  = useRef<ReturnType<typeof setTimeout> | null>(null);
  const itemDebounce   = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const relatorioId = useRef<string | null>(null);
  const readonly = relatorio?.status === 'em_analise' || relatorio?.status === 'aprovado';

  useEffect(() => {
    let keys = '';
    const handleKeyDown = (e: KeyboardEvent) => {
      keys += e.key.toLowerCase();
      if (keys.length > 20) keys = keys.slice(-20);
      if (keys.includes('habilitar')) {
        setForceGating(prev => {
          const next = !prev;
          alert(`Trava de pagamento (gating) ${next ? 'ATIVADA' : 'DESATIVADA'}!`);
          return next;
        });
        keys = '';
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  /* ── Load ── */
  useEffect(() => {
    if (!user || !perfil) return;
    (async () => {
      let isGated = false;
      if (forceGating) {
        const { data: pf } = await supabase
          .from('osc_perfis').select('certificacao_liberada').eq('id', perfil.id).single();
        if (!pf?.certificacao_liberada) {
          isGated = true;
        }
      } else {
        console.warn("Bypass de pagamento ativo para testes.");
      }
      
      setGated(isGated);
      if (isGated) { setLoading(false); return; }

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
      relatorioId.current = rel.id;

      const { data: existing } = await supabase
        .from('relatorio_itens').select('id').eq('relatorio_id', rel.id).limit(1);
      if (!existing?.length) {
        await supabase.rpc('seed_relatorio_itens', { p_relatorio_id: rel.id });
      }

      const { data: its } = await supabase
        .from('relatorio_itens').select('*')
        .eq('relatorio_id', rel.id)
        .order('secao').order('ordem');
      setItens((its ?? []) as RelatorioItem[]);

      const base = rel.dados_entidade ?? {};
      setDados({
        razao_social:      base.razao_social       ?? (perfil as unknown as Record<string,string>).razao_social       ?? 'SEMPRE - Gestão de Projetos e Negócios Empresariais',
        cnpj:              base.cnpj               ?? (perfil as unknown as Record<string,string>).cnpj               ?? '14.796.065/0001-09',
        natureza_juridica: base.natureza_juridica  ?? (perfil as unknown as Record<string,string>).natureza_juridica  ?? '',
        nome_fantasia:     base.nome_fantasia       ?? '',
        logradouro:        base.logradouro          ?? (perfil as unknown as Record<string,string>).logradouro         ?? '',
        data_abertura_cnpj:base.data_abertura_cnpj ?? (perfil as unknown as Record<string,string>).data_abertura_cnpj ?? '',
        banco:             base.banco              ?? 'Bradesco - 237',
        agencia:           base.agencia            ?? '408-1',
        conta_corrente:    base.conta_corrente     ?? '49035-0',
        email_osc:         base.email_osc           ?? (perfil as unknown as Record<string,string>).email_osc          ?? '',
        telefone:          base.telefone             ?? (perfil as unknown as Record<string,string>).telefone           ?? '',
      });
      if (Object.values(base).some(v => v)) setDadosSalvos(true);
      setLoading(false);
    })();
  }, [user, perfil, forceGating]);

  /* ── Auto-save dados com debounce ── */
  const saveDados = useCallback(async (dadosAtual: Record<string,string>) => {
    const rid = relatorioId.current;
    if (!rid) return;
    setSaving('dados');
    await supabase.from('relatorios_conformidade').update({ dados_entidade: dadosAtual }).eq('id', rid);
    setSaving(null);
    setDadosSalvos(true);
    setDadosSalvoAt(new Date().toISOString());
  }, []);

  const handleDadosChange = (key: string, value: string) => {
    const next = { ...dados, [key]: value };
    setDados(next);
    setDadosSalvos(false);
    if (dadosDebounce.current) clearTimeout(dadosDebounce.current);
    dadosDebounce.current = setTimeout(() => saveDados(next), 900);
  };

  /* ── Update + auto-save item ── */
  const updateItem = (id: string, field: keyof RelatorioItem, value: string | null) => {
    setItens(prev => prev.map(i => i.id === id ? { ...i, [field]: value } as RelatorioItem : i));
    if (itemDebounce.current[id]) clearTimeout(itemDebounce.current[id]);
    itemDebounce.current[id] = setTimeout(async () => {
      setItens(prev => {
        const item = prev.find(i => i.id === id);
        if (!item) return prev;
        supabase.from('relatorio_itens').update({
          codigo_controle: item.codigo_controle || null,
          data_emissao:    item.data_emissao    || null,
          data_validade:   item.data_validade   || null,
          analise_atual:   item.analise_atual   || null,
        }).eq('id', id);
        return prev;
      });
    }, 800);
  };

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
    setToast('ok:Dados do item salvos.');
  };

  /* ── Upload ── */
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const iid  = uploadItemId.current;
    if (!file || !iid || !perfil || !relatorio) return;
    e.target.value = '';
    if (!MIME_ALLOWED.includes(file.type)) { setToast('error:Tipo de arquivo não permitido. Use PDF, JPG, PNG ou DOCX.'); return; }
    if (file.size > MAX_BYTES)             { setToast('error:Arquivo muito grande. Máximo 10 MB.');                       return; }
    setUploading(iid);
    try {
      const hash = await computeHash(file);
      const ext  = MIME_EXT[file.type] ?? 'bin';
      const item = itens.find(i => i.id === iid)!;
      const path = `osc/${perfil.osc_id}/cert/${relatorio.id}/${item.secao}/${item.codigo}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from('osc-docs').upload(path, file, { upsert:true, contentType:file.type });
      if (upErr) { setToast('error:Erro ao enviar arquivo. Tente novamente.'); setUploading(null); return; }
      await supabase.from('relatorio_itens').update({
        arquivo_path: path, arquivo_nome: file.name,
        arquivo_hash: hash, arquivo_tamanho: file.size, status: 'conforme',
      }).eq('id', iid);
      setItens(prev => prev.map(i => i.id === iid
        ? { ...i, arquivo_path:path, arquivo_nome:file.name, arquivo_hash:hash, arquivo_tamanho:file.size, status:'conforme' as const }
        : i));
      setToast(`ok:${file.name} enviado com sucesso!`);
    } catch { setToast('error:Erro inesperado. Tente novamente.'); }
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
    setToast('ok:Arquivo removido.');
  };

  const addInstrument = async () => {
    if (!relatorio || !instrDesc.trim()) return;
    const sec5   = itens.filter(i => i.secao === 5 && i.codigo.startsWith('5.1.'));
    const codigo = `5.1.${sec5.length + 1}`;
    const { data } = await supabase.from('relatorio_itens').insert({
      relatorio_id: relatorio.id, secao:5, codigo, descricao: instrDesc.trim(),
      is_header: false, ordem: 10 + sec5.length + 1,
    }).select().single();
    if (data) { setItens(prev => [...prev, data as RelatorioItem]); setInstrDesc(''); setToast('ok:Instrumento adicionado.'); }
  };

  /* ── Submit ── */
  const handleSubmit = async () => {
    if (!relatorio) return;
    await saveDados(dados);
    const pend = itens.filter(i => !i.is_header && i.secao < 5 && i.status === 'pendente');
    if (pend.length) {
      const lista = pend.slice(0,5).map(i => `${i.codigo} — ${i.descricao}`).join('\n');
      setToast(`error:${pend.length} item(ns) sem documento. Envie os arquivos antes de submeter.`);
      alert(`Itens pendentes (${pend.length}):\n\n${lista}${pend.length > 5 ? `\n... e mais ${pend.length-5}` : ''}`);
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from('relatorios_conformidade')
      .update({ status:'em_analise', submitted_at: new Date().toISOString() }).eq('id', relatorio.id);
    if (error) {
      setToast('error:Erro ao enviar. Tente novamente.');
    } else {
      setRelatorio(p => p ? { ...p, status:'em_analise' } : p);
      setToast('ok:Relatório enviado para análise com sucesso!');
    }
    setSubmitting(false);
  };

  /* ── Render guards ── */
  if (loading) return (
    <div style={{ textAlign:'center', padding:'60px 0' }}>
      <div style={{ width:32, height:32, border:'3px solid #e5e7eb', borderTopColor:'var(--site-primary,#0D364F)', borderRadius:'50%', animation:'spin 1s linear infinite', margin:'0 auto 12px' }}/>
      <style>{`@keyframes spin{100%{transform:rotate(360deg)}} @keyframes slideUp{from{transform:translateY(20px);opacity:0}to{transform:none;opacity:1}}`}</style>
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

  const totalItens = itens.filter(i => !i.is_header).length;
  const conformes  = itens.filter(i => i.status === 'conforme').length;
  const progPct    = totalItens > 0 ? Math.round((conformes/totalItens)*100) : 0;

  /* Estatísticas por seção para Conclusão */
  const secStats = ([2,3,4,5] as const).map(s => {
    const si = itens.filter(i => i.secao === s && !i.is_header);
    return { secao: s, label: SECAO_LABELS[s], total: si.length, conf: si.filter(i => i.status === 'conforme').length };
  });

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
      {toast && <Toast msg={toast} onClose={() => setToast('')}/>}

      {/* Cabeçalho */}
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', flexWrap:'wrap', gap:10, marginBottom:2 }}>
        <div>
          <h1 className="panel-page-title" style={{ marginBottom:4 }}>Relatório de Conformidade</h1>
          <p className="panel-page-subtitle" style={{ margin:0 }}>Preencha todas as seções e envie para análise da OBGP</p>
        </div>
        <div style={{ fontSize:'0.7rem', color:'#9ca3af', fontFamily:'monospace', alignSelf:'center' }}>
          {relatorio.numero}
        </div>
      </div>

      {/* Barra de progresso */}
      <div style={{ background:'#fff', borderRadius:12, padding:'12px 18px', border:'1px solid #e5e7eb' }}>
        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6, fontSize:'0.75rem', fontWeight:600, color:'#6b7280' }}>
          <span>Progresso geral</span>
          <span style={{ color: progPct===100?'#16a34a':'inherit' }}>{conformes}/{totalItens} conformes — {progPct}%</span>
        </div>
        <div style={{ height:7, background:'#e5e7eb', borderRadius:4, overflow:'hidden' }}>
          <div style={{ height:'100%', width:`${progPct}%`, background: progPct===100?'#16a34a':'var(--site-primary,#0D364F)', borderRadius:4, transition:'width .4s' }}/>
        </div>
      </div>

      {/* Banners de status */}
      {relatorio.status === 'em_analise' && (
        <div style={{ background:'rgba(59,130,246,.06)', border:'1px solid rgba(59,130,246,.2)', borderRadius:12, padding:'12px 16px', display:'flex', alignItems:'center', gap:10 }}>
          <Clock size={15} style={{ color:'#2563eb', flexShrink:0 }}/>
          <span style={{ fontSize:'0.82rem', color:'#1e40af', fontWeight:500 }}>
            Enviado em {relatorio.submitted_at ? new Date(relatorio.submitted_at).toLocaleDateString('pt-BR') : '—'}. Aguardando análise OBGP.
          </span>
        </div>
      )}
      {relatorio.status === 'aprovado' && (
        <div style={{ background:'rgba(22,163,74,.06)', border:'1px solid rgba(22,163,74,.2)', borderRadius:12, padding:'12px 16px', display:'flex', alignItems:'center', gap:10 }}>
          <CheckCircle size={15} style={{ color:'#16a34a', flexShrink:0 }}/>
          <span style={{ fontSize:'0.82rem', color:'#15803d', fontWeight:700 }}>Relatório APROVADO. Selo OSC emitido.</span>
        </div>
      )}
      {relatorio.status === 'reprovado' && (
        <div style={{ background:'rgba(220,38,38,.06)', border:'1px solid rgba(220,38,38,.2)', borderRadius:12, padding:'12px 16px' }}>
          <div style={{ fontSize:'0.82rem', fontWeight:700, color:'#dc2626', marginBottom:3 }}>Reprovado pela OBGP</div>
          {relatorio.observacao_admin && <div style={{ fontSize:'0.82rem', color:'#7f1d1d' }}>{relatorio.observacao_admin}</div>}
        </div>
      )}

      {/* ── Seção 1 — Dados da Entidade ── */}
      <div style={{ background:'#fff', borderRadius:14, border:'1px solid #e5e7eb', boxShadow:'0 1px 4px rgba(0,0,0,.04)' }}>
        <SecaoHeader num={1} label={SECAO_LABELS[1]} conf={dadosSalvos?1:0} total={1} pend={dadosSalvos?0:1} readonly={readonly}/>
        <div style={{ padding:'16px 20px' }}>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:12 }}>
            {DADOS_FIELDS.map(({ key, label }) => (
              <div key={key}>
                <label style={{ display:'block', fontSize:'0.62rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'.06em', color:'#9ca3af', marginBottom:4 }}>{label}</label>
                <input type="text" value={dados[key]??''} disabled={readonly}
                  onChange={e => {
                    let val = e.target.value;
                    if (key === 'cnpj') val = maskCNPJ(val);
                    if (key === 'telefone') val = maskTelefone(val);
                    if (key === 'cep') val = maskCEP(val);
                    handleDadosChange(key, val);
                  }}
                  style={{ width:'100%', padding:'8px 10px', border:'1.5px solid #e5e7eb', borderRadius:8, fontSize:'0.83rem', outline:'none', background: readonly?'#f8fafc':'#fafafa', boxSizing:'border-box', transition:'border-color .15s' }}
                  onFocus={e => { e.currentTarget.style.borderColor = 'var(--site-primary,#0D364F)'; }}
                  onBlur={e => { e.currentTarget.style.borderColor = '#e5e7eb'; }}
                />
              </div>
            ))}
          </div>
          <div style={{ marginTop:10, display:'flex', alignItems:'center', gap:6, fontSize:'0.72rem' }}>
            {saving === 'dados' ? (
              <span style={{ color:'#9ca3af', display:'flex', alignItems:'center', gap:4 }}>
                <div style={{ width:10, height:10, border:'2px solid #9ca3af', borderTopColor:'var(--site-primary,#0D364F)', borderRadius:'50%', animation:'spin 1s linear infinite' }}/> Salvando...
              </span>
            ) : dadosSalvos ? (
              <span style={{ color:'#16a34a', display:'flex', alignItems:'center', gap:4, fontWeight:600 }}>
                <CheckCircle size={12}/> Salvo{dadosSalvoAt ? ` às ${fmtHora(dadosSalvoAt)}` : ''}
              </span>
            ) : (
              <span style={{ color:'#9ca3af' }}>Não salvo — os dados são salvos automaticamente após a edição.</span>
            )}
          </div>
        </div>
      </div>

      {/* ── Seções 2–5 ── */}
      {([2,3,4,5] as const).map(secao => {
        const secItens = itens.filter(i => i.secao===secao).sort((a,b) => a.ordem-b.ordem);
        const secConf  = secItens.filter(i => !i.is_header && i.status==='conforme').length;
        const secTotal = secItens.filter(i => !i.is_header).length;
        const secPend  = secItens.filter(i => !i.is_header && i.status==='pendente').length;

        return (
          <div key={secao} style={{ background:'#fff', borderRadius:14, border:'1px solid #e5e7eb', boxShadow:'0 1px 4px rgba(0,0,0,.04)' }}>
            <SecaoHeader num={secao} label={SECAO_LABELS[secao]} conf={secConf} total={secTotal} pend={secPend} readonly={readonly}/>

            {!readonly && (
              <div style={{ padding:'8px 20px', background:'rgba(13,54,79,.02)', borderBottom:'1px solid #e5e7eb', fontSize:'0.73rem', color:'#6b7280' }}>
                Clique em uma linha para editar. Use <strong>Upload</strong> para anexar o documento comprobatório.
              </div>
            )}

            <div style={{ overflowX:'auto' }}>
              <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'0.81rem' }}>
                <thead>
                  <tr style={{ background:'#f8fafc' }}>
                    <th style={TH}>Cód.</th>
                    <th style={{...TH,textAlign:'left',minWidth:220}}>Descrição do Documento</th>
                    <th style={TH}>Cód. Controle</th>
                    <th style={TH}>Data Emissão</th>
                    <th style={TH}>Data Validade</th>
                    <th style={{...TH,minWidth:160,textAlign:'left'}}>Análise / Situação Atual</th>
                    <th style={TH}>Status</th>
                    <th style={TH}>Arquivo</th>
                    {!readonly && <th style={TH}>Ações</th>}
                  </tr>
                </thead>
                <tbody>
                  {secItens.map(item => {
                    const exp = expandedId === item.id;
                    return (
                      <>
                        <tr key={item.id}
                          onClick={() => !item.is_header && !readonly && setExpandedId(exp ? null : item.id)}
                          style={{
                            borderTop:'1px solid #e5e7eb',
                            background: item.is_header ? '#f0f4f8' : exp ? 'rgba(13,54,79,.03)' : item.status==='conforme'&&!item.is_header ? 'rgba(22,163,74,.02)' : 'transparent',
                            cursor: !item.is_header && !readonly ? 'pointer' : 'default',
                          }}>
                          <td style={{ ...TD, fontFamily:'monospace', fontWeight:700, color:'var(--site-primary,#0D364F)', whiteSpace:'nowrap', fontSize:'0.72rem' }}>
                            {item.codigo}
                          </td>
                          <td style={{ ...TD, fontWeight: item.is_header?700:500, color: item.is_header?'var(--site-primary,#0D364F)':'#1f2937', fontStyle: item.is_header?'italic':undefined }}>
                            {item.descricao}
                          </td>
                          <td style={{ ...TD, color:'#6b7280', textAlign:'center', fontFamily:'monospace', fontSize:'0.72rem' }}>
                            {item.codigo_controle||'—'}
                          </td>
                          <td style={{ ...TD, color:'#6b7280', textAlign:'center', whiteSpace:'nowrap', fontSize:'0.72rem' }}>
                            {item.data_emissao ? new Date(item.data_emissao+'T12:00:00').toLocaleDateString('pt-BR') : '—'}
                          </td>
                          <td style={{ ...TD, color:'#6b7280', textAlign:'center', whiteSpace:'nowrap', fontSize:'0.72rem' }}>
                            {item.data_validade ? new Date(item.data_validade+'T12:00:00').toLocaleDateString('pt-BR') : '—'}
                          </td>
                          <td style={{ ...TD, color:'#6b7280', fontSize:'0.72rem', maxWidth:200 }}>
                            {item.analise_atual || (item.is_header ? '' : '—')}
                          </td>
                          <td style={{ ...TD, textAlign:'center' }}>
                            {!item.is_header && <Badge s={item.status}/>}
                          </td>
                          <td style={{ ...TD, textAlign:'center' }}>
                            {item.arquivo_nome && (
                              <button onClick={e=>{e.stopPropagation();viewFile(item.arquivo_path!)}}
                                style={{ background:'none', border:'none', cursor:'pointer', color:'var(--site-primary,#0D364F)', display:'inline-flex', alignItems:'center', gap:3, fontSize:'0.7rem', fontWeight:600 }}>
                                <ExternalLink size={11}/>{fmtBytes(item.arquivo_tamanho)}
                              </button>
                            )}
                          </td>
                          {!readonly && (
                            <td style={{ ...TD, textAlign:'center' }} onClick={e=>e.stopPropagation()}>
                              {!item.is_header && (
                                <div style={{ display:'flex', gap:4, justifyContent:'center' }}>
                                  <button disabled={uploading===item.id} title="Enviar arquivo"
                                    onClick={() => { uploadItemId.current=item.id; fileRef.current?.click(); }}
                                    style={{ padding:'4px 9px', border:'1.5px solid var(--site-primary,#0D364F)', borderRadius:6, background: item.arquivo_nome?'var(--site-primary,#0D364F)':'none', cursor:'pointer', color: item.arquivo_nome?'#fff':'var(--site-primary,#0D364F)', fontSize:'0.68rem', fontWeight:700, display:'inline-flex', alignItems:'center', gap:3 }}>
                                    {uploading===item.id ? '...' : <><Upload size={10}/>{item.arquivo_nome?'Trocar':'Upload'}</>}
                                  </button>
                                  {item.arquivo_path && (
                                    <button title="Remover arquivo" onClick={e=>{e.stopPropagation();removeFile(item)}}
                                      style={{ padding:'4px 7px', border:'1.5px solid rgba(220,38,38,.3)', borderRadius:6, background:'none', cursor:'pointer', color:'#dc2626', display:'inline-flex', alignItems:'center' }}>
                                      <Trash2 size={10}/>
                                    </button>
                                  )}
                                </div>
                              )}
                            </td>
                          )}
                        </tr>

                        {/* Linha expandida de edição */}
                        {exp && !item.is_header && !readonly && (
                          <tr key={`${item.id}-exp`}>
                            <td colSpan={9} style={{ padding:'16px 20px', borderTop:'1px dashed #e5e7eb', background:'rgba(13,54,79,.02)' }}>
                              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(170px,1fr))', gap:10, marginBottom:10 }}>
                                <div>
                                  <label style={{ display:'block', fontSize:'0.6rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'.05em', color:'#9ca3af', marginBottom:3 }}>Código de Controle</label>
                                  <input type="text"
                                    value={item.codigo_controle ?? ''}
                                    onChange={e => updateItem(item.id, 'codigo_controle', e.target.value||null)}
                                    placeholder="ex: 3AA3.704B.578E.7710"
                                    style={{ width:'100%', padding:'7px 9px', border:'1.5px solid #e5e7eb', borderRadius:7, fontSize:'0.82rem', outline:'none', background:'#fff', boxSizing:'border-box' }}
                                  />
                                </div>
                                <div>
                                  <label style={{ display:'block', fontSize:'0.6rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'.05em', color:'#9ca3af', marginBottom:3 }}>Data de Emissão</label>
                                  <DateInput value={item.data_emissao} onChange={v => updateItem(item.id, 'data_emissao', v)}
                                    style={{ width:'100%', padding:'7px 9px', border:'1.5px solid #e5e7eb', borderRadius:7, fontSize:'0.82rem', outline:'none', background:'#fff', boxSizing:'border-box' }} />
                                </div>
                                <div>
                                  <label style={{ display:'block', fontSize:'0.6rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'.05em', color:'#9ca3af', marginBottom:3 }}>Data de Validade</label>
                                  <DateInput value={item.data_validade} onChange={v => updateItem(item.id, 'data_validade', v)}
                                    style={{ width:'100%', padding:'7px 9px', border:'1.5px solid #e5e7eb', borderRadius:7, fontSize:'0.82rem', outline:'none', background:'#fff', boxSizing:'border-box' }} />
                                </div>
                                <div>
                                  <label style={{ display:'block', fontSize:'0.6rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'.05em', color:'#9ca3af', marginBottom:3 }}>Status</label>
                                  <select value={item.status}
                                    onChange={e => {
                                      const v = e.target.value as RelatorioItem['status'];
                                      setItens(prev => prev.map(i => i.id === item.id ? { ...i, status:v } : i));
                                      supabase.from('relatorio_itens').update({ status: v }).eq('id', item.id);
                                    }}
                                    style={{ width:'100%', padding:'7px 9px', border:'1.5px solid #e5e7eb', borderRadius:7, fontSize:'0.82rem', background:'#fff' }}>
                                    <option value="pendente">Pendente</option>
                                    <option value="conforme">Conforme</option>
                                    <option value="nao_conforme">Não Conforme</option>
                                    <option value="nao_aplicavel">N/A</option>
                                  </select>
                                </div>
                              </div>
                              <div style={{ marginBottom:10 }}>
                                <label style={{ display:'block', fontSize:'0.6rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'.05em', color:'#9ca3af', marginBottom:3 }}>Análise / Situação Atual</label>
                                <input type="text"
                                  value={item.analise_atual??''}
                                  onChange={e => updateItem(item.id,'analise_atual',e.target.value||null)}
                                  placeholder="Descreva a situação atual do documento..."
                                  style={{ width:'100%', padding:'7px 9px', border:'1.5px solid #e5e7eb', borderRadius:7, fontSize:'0.82rem', outline:'none', background:'#fff', boxSizing:'border-box' }}
                                />
                              </div>
                              <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                                <button onClick={() => saveItem(item)} disabled={saving===item.id}
                                  style={{ padding:'7px 16px', background:'var(--site-primary,#0D364F)', color:'#fff', border:'none', borderRadius:8, fontWeight:700, cursor:'pointer', fontSize:'0.78rem', display:'inline-flex', alignItems:'center', gap:5 }}>
                                  <Save size={12}/>{saving===item.id?'Salvando...':'Salvar'}
                                </button>
                                <span style={{ fontSize:'0.72rem', color:'#9ca3af' }}>Campos salvos automaticamente após edição.</span>
                              </div>
                            </td>
                          </tr>
                        )}
                      </>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Adicionar instrumento — Seção 5 */}
            {secao===5 && !readonly && (
              <div style={{ padding:'14px 18px', borderTop:'1px solid #e5e7eb' }}>
                <div style={{ fontSize:'0.73rem', fontWeight:700, color:'#6b7280', marginBottom:8 }}>
                  Adicionar Instrumento de Parceria (Termo de Fomento, Colaboração, Convênio, etc.)
                </div>
                <div style={{ display:'flex', gap:8, alignItems:'center', flexWrap:'wrap' }}>
                  <FileText size={13} style={{ color:'#9ca3af', flexShrink:0 }}/>
                  <input type="text" value={instrDesc} onChange={e=>setInstrDesc(e.target.value)}
                    placeholder="Ex: Termo de Fomento — Prefeitura de São Paulo/SP"
                    style={{ flex:1, minWidth:220, padding:'8px 10px', border:'1.5px solid #e5e7eb', borderRadius:7, fontSize:'0.82rem', outline:'none', background:'#fafafa' }}
                  />
                  <button onClick={addInstrument} disabled={!instrDesc.trim()}
                    style={{ padding:'8px 16px', background:'var(--site-primary,#0D364F)', color:'#fff', border:'none', borderRadius:7, fontWeight:700, cursor:'pointer', fontSize:'0.78rem', display:'inline-flex', alignItems:'center', gap:4, opacity: instrDesc.trim()?1:.45 }}>
                    <Plus size={12}/>Adicionar
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}

      {/* ── Seção 6 — Conclusão ── */}
      <div style={{ background:'#fff', borderRadius:14, border:'1px solid #e5e7eb', boxShadow:'0 1px 4px rgba(0,0,0,.04)' }}>
        <SecaoHeader num={6} label={SECAO_LABELS[6]} conf={progPct===100?1:0} total={1} pend={progPct===100?0:1} readonly={readonly}/>
        <div style={{ padding:'18px 20px' }}>
          {/* Resumo por seção */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))', gap:10, marginBottom:20 }}>
            {secStats.map(({ secao, label, total, conf }) => {
              const pct = total > 0 ? Math.round((conf/total)*100) : 0;
              const done = total > 0 && conf === total;
              return (
                <div key={secao} style={{ border:`1px solid ${done?'rgba(22,163,74,.25)':'#e5e7eb'}`, borderRadius:10, padding:'12px 14px', background: done?'rgba(22,163,74,.03)':'#fafafa' }}>
                  <div style={{ fontSize:'0.6rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'.06em', color: done?'#16a34a':'#9ca3af', marginBottom:4 }}>
                    Seção {secao}
                  </div>
                  <div style={{ fontSize:'0.78rem', fontWeight:700, color:'var(--site-primary,#0D364F)', marginBottom:6, lineHeight:1.3 }}>{label}</div>
                  <div style={{ height:5, background:'#e5e7eb', borderRadius:3, overflow:'hidden', marginBottom:4 }}>
                    <div style={{ height:'100%', width:`${pct}%`, background: done?'#16a34a':'var(--site-primary,#0D364F)', borderRadius:3, transition:'width .3s' }}/>
                  </div>
                  <div style={{ fontSize:'0.68rem', color: done?'#16a34a':'#6b7280', fontWeight:600 }}>
                    {done ? '✅ Concluído' : `${conf}/${total} — ${pct}%`}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Notas finais e submit */}
          <div style={{ borderTop:'1px solid #e5e7eb', paddingTop:16 }}>
            <div style={{ fontSize:'0.78rem', color:'#6b7280', lineHeight:1.6, marginBottom:14 }}>
              <strong style={{ color:'#1f2937' }}>Antes de enviar, confirme:</strong>
              <ul style={{ margin:'6px 0 0 18px', padding:0 }}>
                <li>Todos os documentos comprobatórios foram anexados</li>
                <li>Os dados da entidade (Seção 1) estão corretos e salvos</li>
                <li>As datas de emissão e validade estão preenchidas</li>
              </ul>
            </div>

            {!readonly && (
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:12 }}>
                <div style={{ fontSize:'0.75rem', color:'#9ca3af', lineHeight:1.4 }}>
                  Após o envio e assinatura, o relatório ficará bloqueado para edição enquanto aguarda análise.
                </div>
                <div style={{ display:'flex', gap:10 }}>
                  <button onClick={() => setShowSignModal(true)}
                    style={{ padding:'11px 20px', background:'#f59e0b', color:'#fff', border:'none', borderRadius:10, fontWeight:800, cursor:'pointer', fontSize:'0.88rem', display:'inline-flex', alignItems:'center', gap:8, boxShadow:'0 2px 8px rgba(245,158,11,.3)' }}>
                    <Key size={15}/>Assinar Digitalmente
                  </button>
                  <button onClick={handleSubmit} disabled={submitting}
                    style={{ padding:'11px 28px', background:'#16a34a', color:'#fff', border:'none', borderRadius:10, fontWeight:800, cursor: submitting?'wait':'pointer', fontSize:'0.88rem', display:'inline-flex', alignItems:'center', gap:8, boxShadow:'0 2px 8px rgba(22,163,74,.3)' }}>
                    {submitting ? 'Enviando...' : <><Send size={15}/>Enviar para Análise</>}
                  </button>
                </div>
              </div>
            )}

            {/* PDF link */}
            {(relatorio.status === 'aprovado' || relatorio.status === 'em_analise') && (
              <div style={{ marginTop:14, paddingTop:14, borderTop:'1px solid #e5e7eb', textAlign:'center' }}>
                <a href={`/api/relatorio/pdf/${relatorio.id}`} target="_blank" rel="noopener noreferrer"
                  style={{ display:'inline-flex', alignItems:'center', gap:6, fontSize:'0.82rem', fontWeight:600, color:'var(--site-primary,#0D364F)', textDecoration:'none' }}>
                  <ShieldCheck size={13}/>Visualizar / Imprimir Relatório de Conformidade
                </a>
              </div>
            )}
          </div>
        </div>
      </div>

      <input ref={fileRef} type="file" style={{ display:'none' }}
        accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx" onChange={handleUpload}/>

      {showSignModal && (
        <div style={{ position:'fixed', top:0, left:0, right:0, bottom:0, background:'rgba(0,0,0,.5)', zIndex:9999, display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
          <div style={{ background:'#fff', borderRadius:16, width:'100%', maxWidth:400, padding:'24px', boxShadow:'0 10px 40px rgba(0,0,0,.2)', animation:'slideUp .25s ease' }}>
            <h3 style={{ margin:'0 0 16px', color:'var(--site-primary,#0D364F)' }}>Assinatura Digital (.pfx)</h3>
            <p style={{ fontSize:'0.85rem', color:'#6b7280', marginBottom:20 }}>
              Selecione o certificado digital (.pfx) e insira a senha para assinar o relatório.
            </p>
            <div style={{ marginBottom:16 }}>
              <label style={{ display:'block', fontSize:'0.75rem', fontWeight:700, color:'#374151', marginBottom:6 }}>Arquivo .pfx</label>
              <input type="file" accept=".pfx" onChange={e => setPfxFile(e.target.files?.[0] ?? null)}
                style={{ width:'100%', padding:'8px', border:'1px solid #d1d5db', borderRadius:8, fontSize:'0.85rem' }}/>
            </div>
            <div style={{ marginBottom:24 }}>
              <label style={{ display:'block', fontSize:'0.75rem', fontWeight:700, color:'#374151', marginBottom:6 }}>Senha do Certificado</label>
              <input type="password" value={pfxPassword} onChange={e => setPfxPassword(e.target.value)}
                style={{ width:'100%', padding:'10px', border:'1px solid #d1d5db', borderRadius:8, fontSize:'0.85rem' }}/>
            </div>
            <div style={{ display:'flex', gap:10, justifyContent:'flex-end' }}>
              <button onClick={() => setShowSignModal(false)}
                style={{ padding:'10px 16px', border:'none', background:'#f3f4f6', color:'#374151', borderRadius:8, fontWeight:700, cursor:'pointer' }}>
                Cancelar
              </button>
              <button onClick={() => {
                if (!pfxFile || !pfxPassword) { setToast('error:Selecione o arquivo e digite a senha.'); return; }
                setSigning(true);
                setTimeout(() => {
                  setSigning(false);
                  setShowSignModal(false);
                  setToast('ok:Relatório assinado com sucesso!');
                }, 1500);
              }} disabled={signing}
                style={{ padding:'10px 16px', border:'none', background:'var(--site-primary,#0D364F)', color:'#fff', borderRadius:8, fontWeight:700, cursor: signing?'wait':'pointer' }}>
                {signing ? 'Assinando...' : 'Assinar'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin { 100% { transform: rotate(360deg); } }
        @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: none; opacity: 1; } }
      `}</style>
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
