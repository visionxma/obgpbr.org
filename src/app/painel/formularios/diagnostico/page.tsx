'use client';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  ShieldCheck, ShieldAlert, AlertTriangle, CheckCircle2, XCircle,
  MinusCircle, ChevronLeft, ChevronRight, Loader2, FileBarChart2,
  AlertCircle, CheckCheck, Printer, RotateCcw,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { usePainel } from '../../PainelContext';
import {
  IRREGULARIDADES, EIXOS, EIXO_ORDER, calcularRelatorio,
  type Eixo, type StatusItem, type RespostasMap,
} from '@/lib/diagnostico-osc';

const RISCO_LABEL: Record<string, string> = { critico: 'Crítico', alto: 'Alto', medio: 'Médio' };
const RISCO_COLOR: Record<string, string> = { critico: '#dc2626', alto: '#d97706', medio: '#0d9488' };
const RISCO_BG: Record<string, string> = { critico: '#fef2f2', alto: '#fffbeb', medio: '#f0fdfa' };

export default function DiagnosticoConformidade() {
  const { user, perfil } = usePainel();
  const router = useRouter();

  const [step, setStep] = useState<number>(0); // 0 = intro, 1-5 = eixos, 6 = relatorio
  const [respostas, setRespostas] = useState<RespostasMap>({});
  const [recordId, setRecordId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!perfil) { setLoading(false); return; }
    (async () => {
      const { data } = await supabase
        .from('osc_formularios')
        .select('id, dados')
        .eq('osc_id', perfil.osc_id)
        .eq('tipo', 'diagnostico_conformidade')
        .maybeSingle();
      if (data) {
        setRecordId(data.id);
        setRespostas((data.dados as RespostasMap) ?? {});
      }
      setLoading(false);
    })();
  }, [perfil]);

  const save = useCallback(async (finalizar = false) => {
    if (!perfil || !user) return;
    setSaving(true);
    const payload = {
      user_id: user.id,
      osc_id: perfil.osc_id,
      titulo: 'Diagnóstico de Conformidade — Selo OSC',
      tipo: 'diagnostico_conformidade',
      dados: respostas,
      status: finalizar ? 'concluido' : 'em_andamento',
      updated_at: new Date().toISOString(),
    };
    if (recordId) {
      await supabase.from('osc_formularios').update(payload).eq('id', recordId);
    } else {
      const { data } = await supabase.from('osc_formularios').insert(payload).select('id').single();
      if (data) setRecordId(data.id);
    }
    setSaving(false);
  }, [perfil, user, respostas, recordId]);

  const handleNext = async () => {
    await save(false);
    setStep(s => s + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBack = () => {
    setStep(s => Math.max(0, s - 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const marcar = (id: number, status: StatusItem) => {
    setRespostas(prev => ({ ...prev, [id]: prev[id] === status ? '' : status }));
  };

  const eixoAtual: Eixo | null = step >= 1 && step <= 5 ? EIXO_ORDER[step - 1] : null;
  const itensEixo = eixoAtual ? IRREGULARIDADES.filter(i => i.eixo === eixoAtual) : [];
  const eixoInfo = eixoAtual ? EIXOS[eixoAtual] : null;

  const respondidosNoEixo = eixoAtual
    ? itensEixo.filter(i => respostas[i.id] && respostas[i.id] !== '').length
    : 0;

  const relatorio = calcularRelatorio(respostas);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300, gap: 12 }}>
        <Loader2 size={28} style={{ animation: 'spin 1s linear infinite' }} />
        <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="panel-empty">
        <p>Faça login para acessar o diagnóstico de conformidade.</p>
      </div>
    );
  }

  /* ── BARRA DE PROGRESSO SUPERIOR ── */
  const StepBar = () => (
    <div style={{
      background: 'var(--site-primary)', borderRadius: 'var(--site-radius-xl)',
      padding: '20px 28px', marginBottom: 28, color: '#fff',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>
            Diagnóstico de Conformidade — Selo OSC
          </div>
          <div style={{ fontSize: '1rem', fontWeight: 800, marginTop: 4, color: '#fff' }}>
            {step === 0 ? 'Introdução' : step <= 5 ? `Eixo ${step}/5 — ${EIXOS[EIXO_ORDER[step - 1]].label}` : 'Relatório de Conformidade'}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.6)', fontWeight: 700, textTransform: 'uppercase' }}>Respostas</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--site-gold)' }}>
            {Object.values(respostas).filter(v => Boolean(v)).length}<span style={{ fontSize: '0.9rem', opacity: 0.7 }}>/{IRREGULARIDADES.length}</span>
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 6 }}>
        {(['intro', ...EIXO_ORDER, 'relatorio'] as string[]).map((s, i) => {
          const done = step > i;
          const active = step === i;
          return (
            <div key={s} style={{
              flex: 1, height: 6, borderRadius: 3,
              background: done ? 'var(--site-gold)' : (active ? 'rgba(197,171,118,0.5)' : 'rgba(255,255,255,0.15)'),
              transition: 'background 0.3s',
            }} />
          );
        })}
      </div>
    </div>
  );

  /* ── BOTÕES DE NAVEGAÇÃO ── */
  const NavButtons = ({ isLast = false }: { isLast?: boolean }) => (
    <div style={{ display: 'flex', justifyContent: step === 0 ? 'flex-end' : 'space-between', marginTop: 24, gap: 12, flexWrap: 'wrap' }}>
      {step > 0 && (
        <button onClick={handleBack} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '11px 22px', borderRadius: 'var(--site-radius-md)', border: '1px solid var(--site-border)', background: 'var(--site-surface-warm)', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 700, color: 'var(--site-text-primary)' }}>
          <ChevronLeft size={16} /> Voltar
        </button>
      )}
      {!isLast && (
        <button onClick={handleNext} disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '11px 24px', borderRadius: 'var(--site-radius-md)', background: 'var(--site-gold)', border: 'none', cursor: saving ? 'not-allowed' : 'pointer', fontSize: '0.9rem', fontWeight: 800, color: 'var(--site-primary)', opacity: saving ? 0.7 : 1 }}>
          {saving ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Salvando...</> : <>{step === 5 ? <><FileBarChart2 size={16} /> Ver Relatório</> : <>{step === 0 ? 'Iniciar Diagnóstico' : 'Salvar e Avançar'} <ChevronRight size={16} /></>}</>}
        </button>
      )}
      {isLast && (
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button onClick={() => window.print()} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '11px 22px', borderRadius: 'var(--site-radius-md)', border: '1px solid var(--site-border)', background: '#fff', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 700 }}>
            <Printer size={16} /> Imprimir / PDF
          </button>
          <button onClick={() => { setStep(1); window.scrollTo({ top: 0, behavior: 'smooth' }); }} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '11px 22px', borderRadius: 'var(--site-radius-md)', border: '1px solid var(--site-border)', background: 'var(--site-surface-warm)', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 700 }}>
            <RotateCcw size={16} /> Revisar Respostas
          </button>
          <button onClick={() => save(true).then(() => router.push('/painel/formularios'))} disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '11px 24px', borderRadius: 'var(--site-radius-md)', background: 'var(--site-primary)', border: 'none', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 800, color: '#fff' }}>
            <CheckCheck size={16} /> Concluir e Salvar
          </button>
        </div>
      )}
    </div>
  );

  /* ════════════════════════════════════
     STEP 0 — INTRODUÇÃO
  ════════════════════════════════════ */
  if (step === 0) return (
    <div style={{ maxWidth: 820, fontFamily: 'var(--font-sans)' }}>
      <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
      <StepBar />
      <div style={{ background: '#fff', border: '1px solid var(--site-border)', borderRadius: 'var(--site-radius-xl)', overflow: 'hidden' }}>
        <div style={{ background: 'var(--site-primary)', padding: '28px 32px', display: 'flex', gap: 16, alignItems: 'flex-start' }}>
          <ShieldCheck size={40} color="var(--site-gold)" style={{ flexShrink: 0, marginTop: 2 }} />
          <div>
            <h1 style={{ color: '#fff', margin: 0, fontSize: '1.4rem', fontWeight: 900 }}>Diagnóstico de Conformidade Institucional</h1>
            <p style={{ color: 'rgba(255,255,255,0.75)', margin: '8px 0 0', fontSize: '0.95rem', lineHeight: 1.6 }}>
              Avaliação técnica estruturada em 5 eixos com base na Lei Federal nº 13.019/2014 (MROSC) e no Decreto nº 8.726/2016.
            </p>
          </div>
        </div>
        <div style={{ padding: '28px 32px' }}>
          <p style={{ color: 'var(--site-text-secondary)', lineHeight: 1.7, fontSize: '0.95rem', marginBottom: 20 }}>
            Este diagnóstico mapeia <strong style={{ color: 'var(--site-text-primary)' }}>33 irregularidades técnicas</strong> organizadas em 5 eixos de conformidade. Para cada item, você indicará se a entidade está <strong>Conforme</strong>, <strong>Irregular</strong> ou se o item <strong>Não se Aplica</strong> à realidade da organização.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12, marginBottom: 24 }}>
            {EIXO_ORDER.map((e, i) => {
              const info = EIXOS[e];
              return (
                <div key={e} style={{ display: 'flex', gap: 12, padding: '14px 16px', borderRadius: 'var(--site-radius-md)', border: '1px solid var(--site-border)', background: info.bg }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: info.cor, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 800, flexShrink: 0 }}>{i + 1}</div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.85rem', color: info.cor }}>{info.label}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--site-text-secondary)', lineHeight: 1.4, marginTop: 2 }}>{info.descricao}</div>
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ background: 'rgba(197,171,118,0.1)', border: '1px solid rgba(197,171,118,0.3)', borderRadius: 'var(--site-radius-md)', padding: '14px 18px', marginBottom: 24 }}>
            <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--site-gold-dark)', marginBottom: 4 }}>⚠ Itens com impacto direto no Selo OSC</div>
            <p style={{ fontSize: '0.85rem', color: 'var(--site-text-secondary)', margin: 0, lineHeight: 1.6 }}>
              Irregularidades classificadas como <strong>Críticas</strong> e marcadas como irregulares <strong>impedem automaticamente</strong> a obtenção do Selo OSC. O relatório final indicará os bloqueios e o plano de ação prioritário.
            </p>
          </div>

          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
            {[
              { icon: CheckCircle2, color: '#16a34a', bg: 'rgba(22,163,74,0.08)', label: 'Conforme', desc: 'Exigência atendida e documentada' },
              { icon: XCircle,      color: '#dc2626', bg: 'rgba(220,38,38,0.08)',  label: 'Irregular', desc: 'Exigência não atendida ou pendente' },
              { icon: MinusCircle,  color: '#64748b', bg: 'rgba(100,116,139,0.08)',label: 'Não se Aplica', desc: 'Item irrelevante para esta entidade' },
            ].map(({ icon: Icon, color, bg, label, desc }) => (
              <div key={label} style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '10px 14px', borderRadius: 'var(--site-radius-md)', background: bg, flex: 1, minWidth: 200 }}>
                <Icon size={20} color={color} style={{ flexShrink: 0 }} />
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.8rem', color }}>{label}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--site-text-secondary)' }}>{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <NavButtons />
    </div>
  );

  /* ════════════════════════════════════
     STEPS 1–5 — EIXOS
  ════════════════════════════════════ */
  if (step >= 1 && step <= 5 && eixoInfo) return (
    <div style={{ maxWidth: 820, fontFamily: 'var(--font-sans)' }}>
      <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
      <StepBar />

      {/* Cabeçalho do eixo */}
      <div style={{ background: eixoInfo.cor, borderRadius: 'var(--site-radius-xl)', padding: '20px 28px', marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.65)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.08em' }}>Eixo {step}</div>
          <h2 style={{ color: '#fff', margin: '4px 0 6px', fontSize: '1.2rem', fontWeight: 900 }}>{eixoInfo.label}</h2>
          <p style={{ color: 'rgba(255,255,255,0.8)', margin: 0, fontSize: '0.85rem' }}>{eixoInfo.descricao}</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.65)', textTransform: 'uppercase', fontWeight: 700 }}>Respondidos</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#fff', lineHeight: 1 }}>{respondidosNoEixo}<span style={{ fontSize: '1rem', opacity: 0.7 }}>/{itensEixo.length}</span></div>
        </div>
      </div>

      {/* Itens */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {itensEixo.map((item) => {
          const resposta = respostas[item.id] || '';
          const riscoCor = RISCO_COLOR[item.risco];
          const riscoBg = RISCO_BG[item.risco];

          return (
            <div key={item.id} style={{ background: '#fff', border: `1px solid ${resposta === 'irregular' ? '#fca5a5' : resposta === 'conforme' ? '#bbf7d0' : 'var(--site-border)'}`, borderRadius: 'var(--site-radius-lg)', overflow: 'hidden', transition: 'border-color 0.2s' }}>
              <div style={{ padding: '18px 20px' }}>
                {/* Header item */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap', marginBottom: 10 }}>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', flex: 1 }}>
                    <div style={{ background: 'rgba(0,0,0,0.05)', padding: '3px 7px', borderRadius: 5, fontSize: '0.7rem', fontWeight: 700, color: 'var(--site-text-secondary)', flexShrink: 0, marginTop: 2 }}>#{item.id}</div>
                    <h3 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 800, color: 'var(--site-text-primary)', lineHeight: 1.4 }}>{item.titulo}</h3>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                    {item.bloqueia_selo && (
                      <span style={{ fontSize: '0.65rem', fontWeight: 700, padding: '3px 7px', borderRadius: 20, background: '#fef2f2', color: '#dc2626', border: '1px solid #fca5a5', whiteSpace: 'nowrap' }}>
                        ⛔ Bloqueia Selo
                      </span>
                    )}
                    <span style={{ fontSize: '0.65rem', fontWeight: 700, padding: '3px 8px', borderRadius: 20, background: riscoBg, color: riscoCor, border: `1px solid ${riscoCor}30`, whiteSpace: 'nowrap' }}>
                      {RISCO_LABEL[item.risco]}
                    </span>
                  </div>
                </div>

                {/* Descrição */}
                <p style={{ margin: '0 0 14px', fontSize: '0.82rem', color: 'var(--site-text-secondary)', lineHeight: 1.6 }}>{item.descricao}</p>

                {/* Fundamento legal */}
                <div style={{ fontSize: '0.72rem', color: 'var(--site-text-tertiary)', marginBottom: 14, fontStyle: 'italic' }}>
                  📋 {item.fundamento}
                </div>

                {/* Botões de resposta */}
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {([
                    { value: 'conforme' as StatusItem,      icon: CheckCircle2, label: 'Conforme',      color: '#16a34a', bg: 'rgba(22,163,74,0.08)',   activeBg: '#16a34a', activeTxt: '#fff' },
                    { value: 'irregular' as StatusItem,     icon: XCircle,      label: 'Irregular',     color: '#dc2626', bg: 'rgba(220,38,38,0.08)',  activeBg: '#dc2626', activeTxt: '#fff' },
                    { value: 'nao_se_aplica' as StatusItem, icon: MinusCircle,  label: 'Não se Aplica', color: '#64748b', bg: 'rgba(100,116,139,0.08)', activeBg: '#64748b', activeTxt: '#fff' },
                  ] as const).map(({ value, icon: Icon, label, color, bg, activeBg, activeTxt }) => {
                    const active = resposta === value;
                    return (
                      <button key={value} onClick={() => marcar(item.id, value)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 'var(--site-radius-md)', border: `1.5px solid ${active ? activeBg : color + '40'}`, background: active ? activeBg : bg, color: active ? activeTxt : color, fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s', flex: '1 0 auto' }}>
                        <Icon size={15} /> {label}
                      </button>
                    );
                  })}
                </div>

                {/* Ação corretiva — só exibe se marcado irregular */}
                {resposta === 'irregular' && (
                  <div style={{ marginTop: 12, padding: '12px 14px', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 'var(--site-radius-md)' }}>
                    <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#92400e', textTransform: 'uppercase', marginBottom: 4, letterSpacing: '0.04em' }}>Ação Corretiva Recomendada</div>
                    <p style={{ margin: 0, fontSize: '0.82rem', color: '#78350f', lineHeight: 1.6 }}>{item.acao_corretiva}</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <NavButtons />
    </div>
  );

  /* ════════════════════════════════════
     STEP 6 — RELATÓRIO
  ════════════════════════════════════ */
  if (step === 6) {
    const { por_eixo, bloqueios_criticos, itens_alto_risco, itens_medio_risco, conformidade_geral, pode_obter_selo } = relatorio;

    return (
      <div style={{ maxWidth: 820, fontFamily: 'var(--font-sans)' }}>
        <style>{`@keyframes spin { 100% { transform: rotate(360deg); } } @media print { .no-print { display: none !important; } }`}</style>
        <StepBar />

        {/* Resultado geral */}
        <div style={{ background: pode_obter_selo ? 'var(--site-primary)' : '#7f1d1d', borderRadius: 'var(--site-radius-xl)', padding: '28px 32px', marginBottom: 20, display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: pode_obter_selo ? 'var(--site-gold)' : '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            {pode_obter_selo ? <ShieldCheck size={32} color="#fff" /> : <ShieldAlert size={32} color="#fff" />}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.65)', textTransform: 'uppercase', fontWeight: 700 }}>Resultado do Diagnóstico</div>
            <h2 style={{ color: '#fff', margin: '4px 0 6px', fontSize: '1.3rem', fontWeight: 900 }}>
              {pode_obter_selo ? 'Sem bloqueios críticos identificados' : `${bloqueios_criticos.length} impedimento${bloqueios_criticos.length > 1 ? 's' : ''} crítico${bloqueios_criticos.length > 1 ? 's' : ''} detectado${bloqueios_criticos.length > 1 ? 's' : ''}`}
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.8)', margin: 0, fontSize: '0.88rem' }}>
              {pode_obter_selo
                ? 'A entidade pode avançar para a etapa de certificação, sujeita à análise documental formal.'
                : 'A obtenção do Selo OSC está impedida até a regularização dos itens críticos abaixo.'}
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.65)', textTransform: 'uppercase', fontWeight: 700 }}>Conformidade Geral</div>
            <div style={{ fontSize: '3rem', fontWeight: 900, color: 'var(--site-gold)', lineHeight: 1 }}>{conformidade_geral}%</div>
          </div>
        </div>

        {/* Conformidade por eixo */}
        <div style={{ background: '#fff', border: '1px solid var(--site-border)', borderRadius: 'var(--site-radius-xl)', padding: '24px 28px', marginBottom: 16 }}>
          <h3 style={{ margin: '0 0 20px', fontSize: '1rem', fontWeight: 800, color: 'var(--site-text-primary)' }}>Conformidade por Eixo</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {por_eixo.map(r => {
              const info = EIXOS[r.eixo];
              const pct = r.nao_respondidos === r.total ? null : r.percentual;
              return (
                <div key={r.eixo}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <div style={{ width: 10, height: 10, borderRadius: '50%', background: info.cor, flexShrink: 0 }} />
                      <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--site-text-primary)' }}>{info.label}</span>
                      {r.nao_respondidos > 0 && <span style={{ fontSize: '0.7rem', color: 'var(--site-text-tertiary)' }}>({r.nao_respondidos} não respondido{r.nao_respondidos > 1 ? 's' : ''})</span>}
                    </div>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                      <span style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: 600 }}>✓ {r.conformes + r.nao_aplicaveis}</span>
                      <span style={{ fontSize: '0.75rem', color: '#dc2626', fontWeight: 600 }}>✗ {r.irregulares}</span>
                      <span style={{ fontSize: '0.9rem', fontWeight: 800, color: pct === null ? 'var(--site-text-tertiary)' : pct >= 80 ? '#16a34a' : pct >= 50 ? '#d97706' : '#dc2626', minWidth: 44, textAlign: 'right' }}>
                        {pct === null ? '—' : `${pct}%`}
                      </span>
                    </div>
                  </div>
                  <div style={{ height: 8, borderRadius: 4, background: 'var(--site-border)' }}>
                    <div style={{ height: '100%', borderRadius: 4, width: `${pct ?? 0}%`, background: pct === null ? 'transparent' : pct >= 80 ? '#16a34a' : pct >= 50 ? '#d97706' : '#dc2626', transition: 'width 0.5s ease' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bloqueios críticos */}
        {bloqueios_criticos.length > 0 && (
          <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 'var(--site-radius-xl)', padding: '24px 28px', marginBottom: 16 }}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 16 }}>
              <AlertTriangle size={20} color="#dc2626" />
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#991b1b' }}>Impedimentos Críticos — Bloqueiam o Selo OSC</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {bloqueios_criticos.map(item => (
                <div key={item.id} style={{ background: '#fff', border: '1px solid #fca5a5', borderRadius: 'var(--site-radius-md)', padding: '14px 16px' }}>
                  <div style={{ fontWeight: 800, fontSize: '0.88rem', color: '#991b1b', marginBottom: 4 }}>#{item.id} — {item.titulo}</div>
                  <div style={{ fontSize: '0.8rem', color: '#7f1d1d', lineHeight: 1.6, marginBottom: 8 }}>{item.descricao}</div>
                  <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 6, padding: '10px 12px' }}>
                    <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#92400e', textTransform: 'uppercase', marginBottom: 3 }}>Ação Corretiva Prioritária</div>
                    <div style={{ fontSize: '0.8rem', color: '#78350f', lineHeight: 1.6 }}>{item.acao_corretiva}</div>
                    <div style={{ fontSize: '0.7rem', color: '#a16207', marginTop: 6, fontStyle: 'italic' }}>📋 {item.fundamento}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Itens de alto risco */}
        {itens_alto_risco.length > 0 && (
          <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 'var(--site-radius-xl)', padding: '24px 28px', marginBottom: 16 }}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 16 }}>
              <AlertCircle size={20} color="#d97706" />
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#92400e' }}>Irregularidades de Alto Risco ({itens_alto_risco.length})</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {itens_alto_risco.map(item => (
                <div key={item.id} style={{ background: '#fff', border: '1px solid #fde68a', borderRadius: 'var(--site-radius-md)', padding: '12px 16px' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#92400e', marginBottom: 3 }}>#{item.id} — {item.titulo}</div>
                  <div style={{ fontSize: '0.8rem', color: '#78350f', lineHeight: 1.5, marginBottom: 6 }}>{item.acao_corretiva}</div>
                  <div style={{ fontSize: '0.7rem', color: '#a16207', fontStyle: 'italic' }}>📋 {item.fundamento}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Roadmap de regularização */}
        {(bloqueios_criticos.length + itens_alto_risco.length + itens_medio_risco.length) > 0 && (
          <div style={{ background: '#fff', border: '1px solid var(--site-border)', borderRadius: 'var(--site-radius-xl)', padding: '24px 28px', marginBottom: 16 }}>
            <h3 style={{ margin: '0 0 6px', fontSize: '1rem', fontWeight: 800 }}>Roadmap de Regularização Proativa</h3>
            <p style={{ margin: '0 0 20px', fontSize: '0.85rem', color: 'var(--site-text-secondary)' }}>Sequência recomendada de ações corretivas, ordenada por criticidade e impacto na elegibilidade da entidade.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {[
                ...bloqueios_criticos.map((i, idx) => ({ ...i, fase: 1, ordem: idx + 1, label: 'FASE 1 — CRÍTICO', cor: '#dc2626', bgFase: '#fef2f2' })),
                ...itens_alto_risco.map((i, idx) => ({ ...i, fase: 2, ordem: bloqueios_criticos.length + idx + 1, label: 'FASE 2 — ALTO', cor: '#d97706', bgFase: '#fffbeb' })),
                ...itens_medio_risco.map((i, idx) => ({ ...i, fase: 3, ordem: bloqueios_criticos.length + itens_alto_risco.length + idx + 1, label: 'FASE 3 — MÉDIO', cor: '#0d9488', bgFase: '#f0fdfa' })),
              ].map((item, idx, arr) => {
                const isFirst = idx === 0 || (arr[idx - 1] as any).fase !== item.fase;
                return (
                  <div key={item.id}>
                    {isFirst && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 0 6px', marginTop: idx > 0 ? 16 : 0 }}>
                        <div style={{ height: 1, flex: 1, background: item.cor + '40' }} />
                        <span style={{ fontSize: '0.65rem', fontWeight: 800, color: item.cor, textTransform: 'uppercase', letterSpacing: '0.08em', whiteSpace: 'nowrap' }}>{item.label}</span>
                        <div style={{ height: 1, flex: 1, background: item.cor + '40' }} />
                      </div>
                    )}
                    <div style={{ display: 'flex', gap: 14, padding: '12px 0', borderBottom: idx < arr.length - 1 ? '1px dashed var(--site-border)' : 'none' }}>
                      <div style={{ width: 28, height: 28, borderRadius: '50%', background: item.cor, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.72rem', fontWeight: 800, flexShrink: 0, marginTop: 1 }}>{item.ordem}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--site-text-primary)', marginBottom: 3 }}>{item.titulo}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--site-text-secondary)', lineHeight: 1.5, marginBottom: 4 }}>{item.acao_corretiva}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--site-text-tertiary)', fontStyle: 'italic' }}>📋 {item.fundamento}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tudo conforme */}
        {bloqueios_criticos.length === 0 && itens_alto_risco.length === 0 && itens_medio_risco.length === 0 && (
          <div style={{ background: 'rgba(22,163,74,0.06)', border: '1px solid #bbf7d0', borderRadius: 'var(--site-radius-xl)', padding: '28px 32px', textAlign: 'center', marginBottom: 16 }}>
            <CheckCheck size={40} color="#16a34a" style={{ marginBottom: 12 }} />
            <h3 style={{ margin: '0 0 8px', color: '#14532d', fontWeight: 800 }}>Diagnóstico sem irregularidades</h3>
            <p style={{ margin: 0, color: '#166534', fontSize: '0.9rem' }}>Todos os itens avaliados foram marcados como conformes ou não aplicáveis. A entidade está apta a avançar para a certificação formal do Selo OSC.</p>
          </div>
        )}

        <div className="no-print">
          <NavButtons isLast />
        </div>
      </div>
    );
  }

  return null;
}
