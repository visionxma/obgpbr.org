'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import {
  Users, Clock, CheckCircle, AlertCircle,
  FileText, BarChart3, Sparkles, ShieldCheck,
  ArrowRight, Loader2,
} from 'lucide-react';

interface Stats {
  total: number;
  pendente: number;
  em_analise: number;
  aprovado: number;
  rejeitado: number;
  docsPendentes: number;
}

interface RecentOsc {
  id: string;
  osc_id: string;
  responsavel: string | null;
  razao_social: string | null;
  status_selo: string;
  created_at: string;
}

const STATUS_LABEL: Record<string, string> = {
  pendente: 'Pendente', em_analise: 'Em Análise', aprovado: 'Aprovado', rejeitado: 'Rejeitado',
};

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export default function DashboardOverview() {
  const [stats, setStats] = useState<Stats>({ total: 0, pendente: 0, em_analise: 0, aprovado: 0, rejeitado: 0, docsPendentes: 0 });
  const [recent, setRecent] = useState<RecentOsc[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [perfisRes, docsRes, recentRes] = await Promise.all([
        supabase.from('osc_perfis').select('status_selo'),
        supabase.from('osc_documentos').select('id', { count: 'exact', head: true }).eq('status', 'enviado'),
        supabase.from('osc_perfis').select('id, osc_id, responsavel, razao_social, status_selo, created_at').order('created_at', { ascending: false }).limit(5),
      ]);

      const perfis = (perfisRes.data ?? []) as { status_selo: string }[];
      setStats({
        total:        perfis.length,
        pendente:     perfis.filter(p => p.status_selo === 'pendente').length,
        em_analise:   perfis.filter(p => p.status_selo === 'em_analise').length,
        aprovado:     perfis.filter(p => p.status_selo === 'aprovado').length,
        rejeitado:    perfis.filter(p => p.status_selo === 'rejeitado').length,
        docsPendentes: docsRes.count ?? 0,
      });
      setRecent((recentRes.data ?? []) as RecentOsc[]);
      setLoading(false);
    };
    load();
  }, []);

  const statCards = [
    { label: 'OSCs Cadastradas',  value: stats.total,       icon: Users,        colorClass: 'primary', href: '/admin/dashboard/oscs' },
    { label: 'Aguardando',        value: stats.pendente,    icon: Clock,        colorClass: 'info',    href: '/admin/dashboard/oscs?status=pendente' },
    { label: 'Em Análise',        value: stats.em_analise,  icon: AlertCircle,  colorClass: 'warning', href: '/admin/dashboard/oscs?status=em_analise' },
    { label: 'Aprovadas',         value: stats.aprovado,    icon: CheckCircle,  colorClass: 'success', href: '/admin/dashboard/oscs?status=aprovado' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>

      {/* KPI Cards */}
      <section className="stats-grid">
        {statCards.map((s, i) => {
          const Icon = s.icon;
          return (
            <Link key={s.label} href={s.href} className={`stat-card admin-animate-in-delay-${i + 1}`} style={{ textDecoration: 'none', cursor: 'pointer' }}>
              <div className="stat-card-header">
                <div className={`stat-card-icon ${s.colorClass}`}>
                  <Icon size={20} strokeWidth={2} />
                </div>
              </div>
              <div className="stat-card-label">{s.label}</div>
              <div className="stat-card-value">
                {loading ? <Loader2 size={20} style={{ animation: 'spin 1s linear infinite', opacity: .4 }} /> : s.value}
              </div>
              <div className="stat-card-progress">
                <div className={`stat-card-progress-bar ${s.colorClass}`} style={{ width: loading ? '0%' : '100%' }} />
              </div>
            </Link>
          );
        })}
      </section>

      {/* Content grid */}
      <div className="content-grid cols-2" style={{ alignItems: 'start' }}>

        {/* Recent OSCs */}
        <div className="glass-card admin-animate-in-delay-3">
          <div className="glass-card-header">
            <span className="glass-card-title">
              <span className="glass-card-title-icon"><Users size={16} /></span>
              OSCs Recentes
            </span>
            <Link href="/admin/dashboard/oscs" className="glass-card-action">
              Ver todas <ArrowRight size={13} />
            </Link>
          </div>
          <div className="glass-card-body" style={{ padding: '12px 28px 24px' }}>
            {loading ? (
              <div style={{ padding: '24px 0', display: 'flex', justifyContent: 'center' }}>
                <Loader2 size={20} style={{ animation: 'spin 1s linear infinite', opacity: .4 }} />
              </div>
            ) : recent.length === 0 ? (
              <div className="admin-empty-state" style={{ padding: '32px 0' }}>
                <div className="admin-empty-state-icon"><Users size={24} /></div>
                <div className="admin-empty-state-text">Nenhuma OSC cadastrada</div>
              </div>
            ) : (
              <div className="activity-feed">
                {recent.map(osc => (
                  <div key={osc.id} className="activity-item">
                    <div className={`activity-dot ${osc.status_selo === 'aprovado' ? 'success' : osc.status_selo === 'em_analise' ? 'warning' : 'primary'}`} />
                    <div className="activity-content">
                      <div className="activity-title">{osc.responsavel ?? osc.razao_social ?? osc.osc_id}</div>
                      <div className="activity-meta">{osc.osc_id} · {fmtDate(osc.created_at)}</div>
                    </div>
                    <span className={`adm-badge ${osc.status_selo}`}>{STATUS_LABEL[osc.status_selo]}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick actions */}
        <div className="quick-actions-panel admin-animate-in-delay-4">
          <div className="quick-actions-title">Ações Rápidas</div>
          <p className="quick-actions-desc">
            Gerencie OSCs, conteúdo e visualize métricas.
            {stats.docsPendentes > 0 && (
              <span style={{ display: 'block', marginTop: 6, color: '#fbbf24', fontWeight: 600 }}>
                ⚡ {stats.docsPendentes} documento{stats.docsPendentes > 1 ? 's' : ''} aguardando revisão
              </span>
            )}
          </p>
          <div className="quick-actions-list">
            <Link href="/admin/dashboard/oscs" className="quick-action-btn primary">
              <Users size={17} /> Gestão de OSCs
            </Link>
            <Link href="/admin/dashboard/oscs?status=em_analise" className="quick-action-btn ghost">
              <AlertCircle size={17} /> OSCs em Análise
            </Link>
            <Link href="/admin/dashboard/experiencias" className="quick-action-btn ghost">
              <Sparkles size={17} /> Experiências
            </Link>
            <Link href="/admin/dashboard/transparencia" className="quick-action-btn ghost">
              <ShieldCheck size={17} /> Transparência
            </Link>
            <Link href="/admin/dashboard/analytics" className="quick-action-btn ghost">
              <BarChart3 size={17} /> Analytics
            </Link>
          </div>
        </div>
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
