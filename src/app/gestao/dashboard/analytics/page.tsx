'use client';
import { BarChart3, TrendingUp, Download, Eye, Users, MousePointer2, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function AnalyticsPage() {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('6m'); // '7d', '30d', '6m', '1y'

  const [totals, setTotals] = useState({ views: 0, users: 0, time: 0 });
  const [chartData, setChartData] = useState<{label: string, views: number}[]>([]);

  useEffect(() => {
    setMounted(true);
    async function loadData() {
      setLoading(true);
      
      const now = new Date();
      let startDate = new Date();
      
      if (timeRange === '7d') startDate.setDate(now.getDate() - 7);
      else if (timeRange === '30d') startDate.setDate(now.getDate() - 30);
      else if (timeRange === '6m') startDate.setMonth(now.getMonth() - 6);
      else if (timeRange === '1y') startDate.setFullYear(now.getFullYear() - 1);

      const { data: visits, error } = await supabase
        .from('page_visits')
        .select('session_id, duration_seconds, created_at')
        .gte('created_at', startDate.toISOString());
      
      if (error || !visits) {
        setLoading(false);
        setChartData([{ label: 'Sem dados', views: 0 }]);
        return;
      }

      const views = visits.length;
      const uniqueSessions = new Set();
      let totalTime = 0;
      
      visits.forEach((v: any) => {
        uniqueSessions.add(v.session_id);
        totalTime += v.duration_seconds || 0;
      });
      
      const users = uniqueSessions.size;
      const time = views > 0 ? Math.floor(totalTime / views) : 0;
      
      setTotals({ views, users, time });
      
      const chartMap = new Map();
      
      if (timeRange === '7d' || timeRange === '30d') {
        const days = timeRange === '7d' ? 7 : 30;
        for(let i = days - 1; i >= 0; i--) {
          const d = new Date();
          d.setDate(now.getDate() - i);
          const key = d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
          chartMap.set(key, { label: key, views: 0 });
        }
        
        visits.forEach((v: any) => {
          const key = new Date(v.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
          if (chartMap.has(key)) chartMap.get(key).views += 1;
        });
      } else {
        const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
        const months = timeRange === '6m' ? 6 : 12;
        
        for(let i = months - 1; i >= 0; i--) {
          const d = new Date();
          d.setMonth(now.getMonth() - i);
          const key = `${d.getFullYear()}-${d.getMonth()}`;
          chartMap.set(key, { label: monthNames[d.getMonth()], views: 0 });
        }
        
        visits.forEach((v: any) => {
          const d = new Date(v.created_at);
          const key = `${d.getFullYear()}-${d.getMonth()}`;
          if (chartMap.has(key)) chartMap.get(key).views += 1;
        });
      }
      
      setChartData(Array.from(chartMap.values()));
      setLoading(false);
    }

    loadData();
  }, [timeRange]);

  const maxViews = Math.max(5, ...chartData.map((d: any) => d.views)); // Min 5 p/ barra não estourar no zero

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
  };

  return (
    <div className="admin-animate-in" style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      
      {/* Header de Ações */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--admin-text-primary)' }}>
            Métricas e Analytics
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--admin-text-secondary)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: 'var(--admin-success)' }}></span> Tracking Ativo (Ao vivo)
          </p>
        </div>
        
        <div style={{ display: 'flex', gap: 12 }}>
          <select 
            value={timeRange} 
            onChange={(e) => setTimeRange(e.target.value)}
            className="admin-btn" 
            style={{ background: 'var(--admin-surface)', border: '1px solid var(--admin-border)', color: 'var(--admin-text-primary)', outline: 'none', cursor: 'pointer' }}
          >
            <option value="7d">Últimos 7 dias</option>
            <option value="30d">Últimos 30 dias</option>
            <option value="6m">Últimos 6 meses</option>
            <option value="1y">Último ano</option>
          </select>
          <button className="admin-btn admin-btn-primary">
            <Download size={16} />
            Exportar Relatório
          </button>
        </div>
      </div>

      {/* Cards de Resumo */}
      <div className="stats-grid">
        {[
          { label: 'Total Visualizações (Geral)', value: loading ? <Loader2 className="spin" size={20}/> : totals.views.toLocaleString('pt-BR'), trend: 'Verificado', icon: Eye, color: 'var(--admin-primary)' },
          { label: 'Visitantes Únicos', value: loading ? <Loader2 className="spin" size={20}/> : totals.users.toLocaleString('pt-BR'), trend: 'Sessões', icon: Users, color: 'var(--admin-success)' },
          { label: 'Sessões Ativas', value: loading ? <Loader2 className="spin" size={20}/> : (totals.users > 0 ? '1' : '0'), trend: 'Ao Vivo', icon: MousePointer2, color: 'var(--admin-warning)' },
          { label: 'Tempo Médio Nativos', value: loading ? <Loader2 className="spin" size={20}/> : formatTime(totals.time), trend: 'Média/URL', icon: TrendingUp, color: 'var(--admin-info)' },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className={`glass-card admin-animate-in-delay-${i + 1}`} style={{ padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div style={{ 
                  width: 40, height: 40, borderRadius: 'var(--admin-radius-md)', 
                  background: `${stat.color}15`, color: stat.color,
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <Icon size={20} strokeWidth={2.5} />
                </div>
                <div className="stat-card-badge up" style={{ fontSize: '0.75rem', background: 'var(--admin-bg)', color: 'var(--admin-text-secondary)', border: '1px solid var(--admin-border)' }}>
                  {stat.trend}
                </div>
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--admin-text-secondary)', fontWeight: 600, marginBottom: 4 }}>
                {stat.label}
              </div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--admin-text-primary)', fontFamily: 'Outfit, sans-serif' }}>
                {stat.value}
              </div>
            </div>
          );
        })}
      </div>


      {/* Gráfico Principal Expansivo */}
      <div className="glass-card admin-animate-in-delay-3" style={{ padding: 24, minHeight: 400 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 30 }}>
          <BarChart3 size={20} color="var(--admin-primary)" />
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--admin-text-primary)' }}>
            Evolução de {timeRange === '7d' || timeRange === '30d' ? 'Visitas (Diário)' : 'Acesso'}
          </h2>
        </div>

        {loading ? (
           <div style={{ height: 280, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
             <Loader2 size={32} style={{ animation: 'spin 1s linear infinite', color: 'var(--admin-primary)' }} />
           </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16, height: 280, paddingBottom: 20, borderBottom: '1px solid var(--admin-border)' }}>
            {chartData.map((data: any, i: number) => (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, height: '100%', justifyContent: 'flex-end' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: data.views > 0 ? 'var(--admin-primary)' : 'var(--admin-text-tertiary)' }}>{data.views}</span>
                <div style={{ position: 'relative', width: '100%', display: 'flex', justifyContent: 'center', height: '100%', alignItems: 'flex-end' }}>
                  <div 
                    title={`${data.views} views`}
                    style={{ 
                      width: '40%', 
                      background: data.views > 0 ? 'var(--admin-primary)' : 'var(--admin-border)', 
                      borderRadius: 'var(--admin-radius-sm) var(--admin-radius-sm) 0 0',
                      height: mounted ? `${(data.views / maxViews) * 100}%` : '0%',
                      transition: 'height 1s cubic-bezier(0.22, 1, 0.36, 1)',
                      transitionDelay: `${i * 0.05}s`,
                      minHeight: data.views === 0 ? 4 : 10
                    }} 
                  />
                </div>
                <span style={{ fontSize: '0.65rem', fontWeight: 600, color: 'var(--admin-text-secondary)', textAlign: 'center' }}>{data.label}</span>
              </div>
            ))}
          </div>
        )}
        
        <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginTop: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.8rem', color: 'var(--admin-text-secondary)' }}>
            <span style={{ width: 12, height: 12, borderRadius: 2, background: 'var(--admin-primary)' }}></span> Visualizações Reais
          </div>
        </div>
      </div>
    </div>
  );
}
