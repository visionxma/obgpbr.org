'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FolderOpen, Calendar, Clock, CheckCircle2, AlertCircle, Plus, ArrowRight, Trash2, X, Download } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { usePainel } from '../PainelContext';
import { Skeleton } from '@/components/ui/Skeleton';

type Processo = {
  id: string;
  numero: string | null;
  status: string;
  created_at: string;
  submitted_at: string | null;
  reviewed_at?: string | null;
  observacao_admin?: string | null;
  certificado_numero?: string | null;
  certificado_emitido_at?: string | null;
  dados_entidade: {
    razao_social?: string;
    cnpj?: string;
  } | null;
  documento_final_path?: string | null;
};

const STATUS_META: Record<string, { label: string; icon: React.ReactNode; bg: string; color: string }> = {
  em_preenchimento: { label: 'Em Preenchimento', icon: <Clock size={16} />, bg: 'rgba(37,99,235,0.1)', color: '#2563eb' },
  em_analise: { label: 'Em Análise', icon: <Clock size={16} />, bg: 'rgba(245,158,11,0.1)', color: '#b45309' },
  aprovado: { label: 'Aprovado', icon: <CheckCircle2 size={16} />, bg: 'rgba(22,163,74,0.1)', color: '#16a34a' },
  reprovado: { label: 'Reprovado', icon: <AlertCircle size={16} />, bg: 'rgba(220,38,38,0.1)', color: '#dc2626' },
  rejeitado: { label: 'Rejeitado', icon: <AlertCircle size={16} />, bg: 'rgba(220,38,38,0.1)', color: '#dc2626' },
  pendente: { label: 'Pendência', icon: <AlertCircle size={16} />, bg: 'rgba(220,38,38,0.1)', color: '#dc2626' },
};

export default function ProcessosPage() {
  const router = useRouter();
  const { user, perfil, loading: painelLoading } = usePainel();
  const [trackedProcesses, setTrackedProcesses] = useState<Processo[]>([]);
  const [loadingProcessos, setLoadingProcessos] = useState(true);
  const [loadError, setLoadError] = useState('');
  
  // Controle de exclusão
  const [processToDelete, setProcessToDelete] = useState<Processo | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteProcess = async () => {
    if (!processToDelete || !perfil) return;
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('relatorios_conformidade')
        .delete()
        .eq('id', processToDelete.id)
        .eq('osc_id', perfil.osc_id);

      if (error) throw error;
      
      setTrackedProcesses(prev => prev.filter(p => p.id !== processToDelete.id));
      setProcessToDelete(null);
    } catch (err: any) {
      alert('Erro ao excluir processo: ' + err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  useEffect(() => {
    let active = true;

    async function loadProcessos() {
      await Promise.resolve();
      if (!active || painelLoading) return;

      if (!user || !perfil) {
        setTrackedProcesses([]);
        setLoadError('');
        setLoadingProcessos(false);
        return;
      }

      setLoadingProcessos(true);
      setLoadError('');

      const { data, error } = await supabase
        .from('relatorios_conformidade')
        .select('*')
        .eq('osc_id', perfil.osc_id)
        .order('created_at', { ascending: false });

      if (!active) return;
      if (error) {
        console.error('Erro ao carregar processos:', error);
        setLoadError('Não foi possível carregar seus processos agora.');
        setTrackedProcesses([]);
      } else {
        setTrackedProcesses((data ?? []) as Processo[]);
      }
      setLoadingProcessos(false);
    }

    void loadProcessos();

    const channel = user && perfil
      ? supabase
          .channel(`relatorios-conformidade:${perfil.osc_id}`)
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'relatorios_conformidade', filter: `osc_id=eq.${perfil.osc_id}` },
            () => { void loadProcessos(); }
          )
          .subscribe()
      : null;

    return () => {
      active = false;
      if (channel) void supabase.removeChannel(channel);
    };
  }, [user, perfil, painelLoading]);

  return (
    <div style={{ flex: 1, padding: '40px 20px', maxWidth: 900, margin: '0 auto', width: '100%', minHeight: 'calc(100vh - 120px)', animation: 'panelPageIn .3s ease' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--site-primary)', fontFamily: 'var(--font-heading)', margin: 0 }}>Meus Processos</h2>
          <p style={{ color: 'var(--site-text-secondary)', margin: '4px 0 0' }}>Acompanhe o status dos seus relatórios de conformidade.</p>
        </div>
        <button
          onClick={() => {
            localStorage.removeItem('obgp_processo_state');
            localStorage.removeItem('obgp_guest_entidade');
            localStorage.removeItem('obgp_guest_docs');
            localStorage.removeItem('obgp_guest_step');
            router.push('/painel/processo');
          }}
          style={{ background: 'var(--site-primary)', color: '#fff', border: 'none', display: 'flex', alignItems: 'center', gap: 8, padding: '12px 24px', borderRadius: 'var(--site-radius-full)', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 14px rgba(13,54,79,0.2)', transition: 'all .2s' }}
          onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(13,54,79,0.3)'; }}
          onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(13,54,79,0.2)'; }}
        >
          <Plus size={16} /> Novo Relatório
        </button>
      </div>
      
      {!painelLoading && !user ? (
        <div style={{ textAlign: 'center', padding: '80px 40px', background: '#fff', borderRadius: 24, border: '1px solid rgba(13,54,79,0.06)', boxShadow: '0 10px 40px rgba(0,0,0,0.03)' }}>
          <FolderOpen size={48} style={{ color: 'var(--site-gold)', marginBottom: 20, opacity: 0.8 }} />
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--site-primary)', marginBottom: 8 }}>Acesso restrito</div>
          <p style={{ color: 'var(--site-text-secondary)', fontSize: '0.95rem', maxWidth: 400, margin: '0 auto 24px' }}>Entre na sua conta para acompanhar os relatórios de conformidade vinculados à sua OSC.</p>
          <button
            onClick={() => router.push('/login')}
            style={{ background: '#fff', color: 'var(--site-primary)', border: '1px solid var(--site-border)', display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 24px', borderRadius: 'var(--site-radius-full)', fontWeight: 700, cursor: 'pointer', transition: 'all .2s' }}
            onMouseOver={(e) => { e.currentTarget.style.borderColor = 'var(--site-primary)'; }}
            onMouseOut={(e) => { e.currentTarget.style.borderColor = 'var(--site-border)'; }}
          >
            Entrar <ArrowRight size={16} />
          </button>
        </div>
      ) : loadingProcessos ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
           <Skeleton height="130px" borderRadius="20px" />
           <Skeleton height="130px" borderRadius="20px" />
           <Skeleton height="130px" borderRadius="20px" />
        </div>
      ) : loadError ? (
        <div style={{ textAlign: 'center', padding: '80px 40px', background: '#fff', borderRadius: 24, border: '1px solid rgba(220,38,38,0.16)', boxShadow: '0 10px 40px rgba(0,0,0,0.03)' }}>
          <AlertCircle size={48} style={{ color: '#dc2626', marginBottom: 20, opacity: 0.8 }} />
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--site-primary)', marginBottom: 8 }}>Erro ao carregar</div>
          <p style={{ color: 'var(--site-text-secondary)', fontSize: '0.95rem', maxWidth: 400, margin: '0 auto' }}>{loadError}</p>
        </div>
      ) : trackedProcesses.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 40px 70px', background: '#fff', borderRadius: 24, border: '1px solid rgba(13,54,79,0.06)', boxShadow: '0 10px 40px rgba(0,0,0,0.03)' }}>
          <img
            src="/img/mascote-selo.webp"
            alt=""
            aria-hidden="true"
            width={200}
            height={200}
            className="mascote mascote-float"
            style={{ width: 'clamp(160px, 22vw, 220px)', height: 'auto', margin: '0 auto 22px' }}
          />
          <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--site-primary)', marginBottom: 10 }}>Vamos começar sua certificação?</div>
          <p style={{ color: 'var(--site-text-secondary)', fontSize: '0.95rem', maxWidth: 460, margin: '0 auto 28px', lineHeight: 1.65 }}>Você ainda não tem processos por aqui. Inicie seu Relatório de Conformidade — é rápido, e eu te acompanho em cada etapa.</p>
          <button
            onClick={() => {
              localStorage.removeItem('obgp_processo_state');
              localStorage.removeItem('obgp_guest_entidade');
              localStorage.removeItem('obgp_guest_docs');
              localStorage.removeItem('obgp_guest_step');
              router.push('/painel/processo');
            }}
            style={{ background: 'var(--site-primary)', color: '#fff', border: 'none', display: 'inline-flex', alignItems: 'center', gap: 8, padding: '14px 28px', borderRadius: 'var(--site-radius-full)', fontWeight: 800, cursor: 'pointer', transition: 'all .2s', boxShadow: '0 8px 24px rgba(13,54,79,0.18)' }}
            onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(13,54,79,0.24)'; }}
            onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(13,54,79,0.18)'; }}
          >
            Iniciar Relatório <ArrowRight size={16} />
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {trackedProcesses.map(p => {
            const status = STATUS_META[p.status] ?? STATUS_META.pendente;
            const entidade = p.dados_entidade?.razao_social || perfil?.razao_social || p.dados_entidade?.cnpj || perfil?.osc_id || 'OSC';
            const dataProcesso = p.submitted_at || p.created_at;
            return (
              <div key={p.id} style={{ background: '#fff', borderRadius: 20, border: '1px solid rgba(13,54,79,0.06)', padding: 28, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 20, boxShadow: '0 4px 20px rgba(0,0,0,0.02)', transition: 'transform .2s, box-shadow .2s' }} onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.04)'; }} onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.02)'; }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--site-primary)', background: 'rgba(13,54,79,0.06)', padding: '4px 10px', borderRadius: 6, letterSpacing: '.04em' }}>Protocolo: {(p.numero || p.id.slice(-6)).toUpperCase()}</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--site-text-secondary)', fontWeight: 600 }}><Calendar size={13} style={{ display: 'inline', marginRight: 4, transform: 'translateY(-2px)' }}/> {new Date(dataProcesso).toLocaleDateString('pt-BR')}</span>
                  </div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--site-primary)' }}>{entidade}</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--site-text-secondary)', marginTop: 4 }}>Relatório de Conformidade MROSC</div>
                  {p.certificado_numero && (
                    <div style={{ fontSize: '0.78rem', color: '#15803d', marginTop: 6, fontWeight: 800 }}>
                      Selo: {p.certificado_numero}
                    </div>
                  )}
                  {p.status === 'reprovado' && p.observacao_admin && (
                    <div style={{ fontSize: '0.78rem', color: '#991b1b', marginTop: 6, maxWidth: 520 }}>
                      {p.observacao_admin}
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                  <div style={{
                    padding: '10px 20px', borderRadius: 999, fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 8, letterSpacing: '.02em',
                    background: status.bg,
                    color: status.color
                  }}>
                    {status.icon}
                    {status.label}
                  </div>
                  <button
                    onClick={() => router.push(`/painel/relatorio-conformidade?relatorio=${p.id}`)}
                    style={{ background: p.status === 'pendente' || p.status === 'em_preenchimento' ? 'var(--site-primary)' : '#fff', color: p.status === 'pendente' || p.status === 'em_preenchimento' ? '#fff' : 'var(--site-primary)', border: '1px solid var(--site-border)', display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 16px', borderRadius: 999, fontWeight: 800, cursor: 'pointer', transition: 'all 0.2s', boxShadow: p.status === 'pendente' || p.status === 'em_preenchimento' ? '0 4px 14px rgba(13,54,79,0.15)' : 'none' }}
                  >
                    {p.status === 'pendente' ? 'Resolver Pendência' : p.status === 'em_preenchimento' ? 'Continuar Relatório' : 'Acompanhar Processo'} <ArrowRight size={15} />
                  </button>
                  {p.status === 'aprovado' && !p.documento_final_path && (
                    <button
                      onClick={() => window.open(`/api/relatorio/pdf/${p.id}`, '_blank', 'noopener,noreferrer')}
                      style={{ background: 'var(--site-primary)', color: '#fff', border: 'none', display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderRadius: 999, fontWeight: 800, cursor: 'pointer' }}
                      title="Baixar rascunho de aprovação do sistema"
                    >
                      PDF / Selo
                    </button>
                  )}
                  {p.documento_final_path && (
                    <button
                      onClick={async () => {
                        const { data } = await supabase.storage.from('osc-docs').createSignedUrl(p.documento_final_path!, 3600);
                        if (data?.signedUrl) window.open(data.signedUrl, '_blank');
                        else alert('Documento temporariamente indisponível.');
                      }}
                      style={{ background: 'var(--site-gold)', color: '#fff', border: 'none', display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 16px', borderRadius: 999, fontWeight: 800, cursor: 'pointer', boxShadow: '0 4px 14px rgba(204,153,51,0.2)' }}
                      title="Baixar versão oficial final com o Selo OSC"
                    >
                      <Download size={15} /> Baixar Certificação
                    </button>
                  )}
                  <button
                    onClick={() => setProcessToDelete(p)}
                    style={{ background: '#fff', color: '#dc2626', border: '1px solid #dc2626', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 38, height: 38, borderRadius: '50%', cursor: 'pointer', transition: 'all 0.2s' }}
                    title="Excluir Processo"
                    onMouseOver={(e) => { e.currentTarget.style.background = '#fef2f2'; }}
                    onMouseOut={(e) => { e.currentTarget.style.background = '#fff'; }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de Confirmação de Exclusão */}
      {processToDelete && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(13,54,79,0.4)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: 20 }}>
          <div style={{ background: '#fff', borderRadius: 24, width: '100%', maxWidth: 420, padding: 32, boxShadow: '0 20px 40px rgba(0,0,0,0.1)', animation: 'panelPageIn 0.2s ease-out' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
              <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(220,38,38,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#dc2626' }}>
                <AlertCircle size={24} />
              </div>
              <button onClick={() => setProcessToDelete(null)} disabled={isDeleting} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--site-text-tertiary)' }}>
                <X size={20} />
              </button>
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--site-primary)', margin: '0 0 10px' }}>Excluir Processo?</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--site-text-secondary)', lineHeight: 1.6, margin: '0 0 24px' }}>
              Tem certeza que deseja excluir o processo <strong>{(processToDelete.numero || processToDelete.id.slice(-6)).toUpperCase()}</strong>? 
              Todos os dados preenchidos serão perdidos permanentemente e essa ação não pode ser desfeita.
            </p>
            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={() => setProcessToDelete(null)} disabled={isDeleting} style={{ flex: 1, padding: '12px', background: '#f8fafc', color: 'var(--site-text-secondary)', border: '1px solid var(--site-border)', borderRadius: 999, fontWeight: 700, cursor: 'pointer' }}>
                Cancelar
              </button>
              <button onClick={handleDeleteProcess} disabled={isDeleting} style={{ flex: 1, padding: '12px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: 999, fontWeight: 700, cursor: isDeleting ? 'not-allowed' : 'pointer', opacity: isDeleting ? 0.7 : 1 }}>
                {isDeleting ? 'Excluindo...' : 'Sim, excluir'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
