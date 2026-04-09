'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import {
  ShieldCheck,
  Zap,
  BarChart3,
  Loader2,
  Sparkles,
} from 'lucide-react';

export default function DashboardOverview() {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);

  const [docCount, setDocCount] = useState(0);

  useEffect(() => {
    setMounted(true);
    async function fetchData() {
      const [docsRes] = await Promise.all([
        supabase.from('transparency_records').select('*', { count: 'exact', head: true }),
      ]);

      setDocCount(docsRes.count ?? 0);
      setLoading(false);
    }
    fetchData();
  }, []);

  const stats = [
    { label: 'Documentos', value: docCount, icon: ShieldCheck, colorClass: 'info', href: '/admin/dashboard/transparencia' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>

      {/* KPI Cards */}
      <section className="stats-grid">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Link
              key={stat.label}
              href={stat.href}
              className={`stat-card admin-animate-in-delay-${index + 1}`}
              style={{ textDecoration: 'none', cursor: 'pointer' }}
            >
              <div className="stat-card-header">
                <div className={`stat-card-icon ${stat.colorClass}`}>
                  <Icon size={22} strokeWidth={2} />
                </div>
              </div>
              <div className="stat-card-label">{stat.label}</div>
              <div className="stat-card-value">
                {loading
                  ? <Loader2 size={20} style={{ animation: 'spin 1s linear infinite', opacity: 0.4 }} />
                  : stat.value
                }
              </div>
              <div className="stat-card-progress">
                <div className={`stat-card-progress-bar ${stat.colorClass}`} style={{ width: mounted && !loading ? '100%' : '0%' }} />
              </div>
            </Link>
          );
        })}
      </section>

      {/* Ações Rápidas */}
      <div className="quick-actions-panel admin-animate-in-delay-3">
        <div className="quick-actions-title">
          <Zap size={18} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 6 }} />
          Ações Rápidas
        </div>
        <p className="quick-actions-desc">
          Gerencie o portal da OBGP.
        </p>
        <div className="quick-actions-list">
          <Link href="/admin/dashboard/experiencias" className="quick-action-btn primary">
            <Sparkles size={18} /> Experiências
          </Link>
          <Link href="/admin/dashboard/transparencia" className="quick-action-btn ghost">
            <ShieldCheck size={18} /> Documentos Públicos
          </Link>
          <Link href="/admin/dashboard/analytics" className="quick-action-btn ghost">
            <BarChart3 size={18} /> Analytics
          </Link>
        </div>
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
