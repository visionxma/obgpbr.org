'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FolderOpen, Calendar, Clock, CheckCircle2, AlertCircle, Plus, ArrowRight } from 'lucide-react';

export default function ProcessosPage() {
  const router = useRouter();
  const [trackedProcesses, setTrackedProcesses] = useState<{id: string, data: string, status: string, entidade: string}[]>([]);

  useEffect(() => {
    const savedTracking = localStorage.getItem('obgp_guest_tracking');
    if (savedTracking) {
      setTrackedProcesses(JSON.parse(savedTracking));
    }
  }, []);

  return (
    <div style={{ flex: 1, padding: '40px 20px', maxWidth: 900, margin: '0 auto', width: '100%', minHeight: 'calc(100vh - 120px)', animation: 'panelPageIn .3s ease' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--site-primary)', fontFamily: 'var(--font-heading)', margin: 0 }}>Meus Processos</h2>
          <p style={{ color: 'var(--site-text-secondary)', margin: '4px 0 0' }}>Acompanhe o status dos seus relatórios de conformidade.</p>
        </div>
        <button 
          onClick={() => router.push('/painel/processo')} 
          style={{ background: 'var(--site-primary)', color: '#fff', border: 'none', display: 'flex', alignItems: 'center', gap: 8, padding: '12px 24px', borderRadius: 'var(--site-radius-full)', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 14px rgba(13,54,79,0.2)', transition: 'all .2s' }}
          onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(13,54,79,0.3)'; }}
          onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(13,54,79,0.2)'; }}
        >
          <Plus size={16} /> Novo Relatório
        </button>
      </div>
      
      {trackedProcesses.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 40px', background: '#fff', borderRadius: 24, border: '1px solid rgba(13,54,79,0.06)', boxShadow: '0 10px 40px rgba(0,0,0,0.03)' }}>
          <FolderOpen size={48} style={{ color: 'var(--site-gold)', marginBottom: 20, opacity: 0.8 }} />
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--site-primary)', marginBottom: 8 }}>Nenhum processo em andamento</div>
          <p style={{ color: 'var(--site-text-secondary)', fontSize: '0.95rem', maxWidth: 400, margin: '0 auto 24px' }}>Você ainda não enviou nenhum relatório para análise. Inicie um novo processo para obter sua certificação.</p>
          <button 
            onClick={() => router.push('/painel/processo')} 
            style={{ background: '#fff', color: 'var(--site-primary)', border: '1px solid var(--site-border)', display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 24px', borderRadius: 'var(--site-radius-full)', fontWeight: 700, cursor: 'pointer', transition: 'all .2s' }}
            onMouseOver={(e) => { e.currentTarget.style.borderColor = 'var(--site-primary)'; }}
            onMouseOut={(e) => { e.currentTarget.style.borderColor = 'var(--site-border)'; }}
          >
            Iniciar Relatório <ArrowRight size={16} />
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {trackedProcesses.map(p => (
            <div key={p.id} style={{ background: '#fff', borderRadius: 20, border: '1px solid rgba(13,54,79,0.06)', padding: 28, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 20, boxShadow: '0 4px 20px rgba(0,0,0,0.02)', transition: 'transform .2s, box-shadow .2s' }} onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.04)'; }} onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.02)'; }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--site-primary)', background: 'rgba(13,54,79,0.06)', padding: '4px 10px', borderRadius: 6, letterSpacing: '.04em' }}>Protocolo: {p.id.slice(-6).toUpperCase()}</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--site-text-secondary)', fontWeight: 600 }}><Calendar size={13} style={{ display: 'inline', marginRight: 4, transform: 'translateY(-2px)' }}/> {new Date(p.data).toLocaleDateString('pt-BR')}</span>
                </div>
                <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--site-primary)' }}>{p.entidade}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--site-text-secondary)', marginTop: 4 }}>Relatório de Conformidade MROSC</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ 
                  padding: '10px 20px', borderRadius: 999, fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 8, letterSpacing: '.02em',
                  background: p.status === 'em_analise' ? 'rgba(245,158,11,0.1)' : p.status === 'aprovado' ? 'rgba(22,163,74,0.1)' : 'rgba(220,38,38,0.1)',
                  color: p.status === 'em_analise' ? '#b45309' : p.status === 'aprovado' ? '#16a34a' : '#dc2626'
                }}>
                  {p.status === 'em_analise' ? <Clock size={16} /> : p.status === 'aprovado' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                  {p.status === 'em_analise' ? 'Em Análise' : p.status === 'aprovado' ? 'Aprovado' : 'Pendência'}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
