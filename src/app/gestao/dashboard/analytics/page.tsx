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


      {/* Gráfico Principal — Evolução de Acesso */}
      <div className="glass-card admin-animate-in-delay-3" style={{ overflow: 'visible' }}>

        {/* Card Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '24px 28px 0',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'var(--admin-gold-light)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <BarChart3 size={18} color="var(--admin-gold-dark)" strokeWidth={2.2} />
            </div>
            <div>
              <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--admin-text-primary)', margin: 0 }}>
                Evolução de Acesso
              </h2>
              <p style={{ fontSize: '0.75rem', color: 'var(--admin-text-tertiary)', margin: 0, marginTop: 2 }}>
                {timeRange === '7d' ? 'Últimos 7 dias' : timeRange === '30d' ? 'Últimos 30 dias' : timeRange === '6m' ? 'Últimos 6 meses' : 'Último ano'} · Visualizações por período
              </p>
            </div>
          </div>

          {/* Range Selector inline */}
          <div style={{ display: 'flex', gap: 4, background: 'var(--admin-bg)', borderRadius: 10, padding: 4, border: '1px solid var(--admin-border)' }}>
            {(['7d','30d','6m','1y'] as const).map(r => (
              <button key={r} onClick={() => setTimeRange(r)} style={{
                padding: '6px 14px', borderRadius: 8, border: 'none', cursor: 'pointer',
                fontSize: '0.75rem', fontWeight: 600,
                background: timeRange === r ? 'var(--admin-gold)' : 'transparent',
                color: timeRange === r ? '#0D1F2D' : 'var(--admin-text-secondary)',
                transition: 'all 0.15s ease',
              }}>
                {r === '7d' ? '7D' : r === '30d' ? '30D' : r === '6m' ? '6M' : '1A'}
              </button>
            ))}
          </div>
        </div>

        {/* Chart Body */}
        <div style={{ padding: '24px 28px 28px', position: 'relative' }}>
          {loading ? (
            <div style={{ height: 300, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
              <Loader2 size={28} style={{ animation: 'spin 1s linear infinite', color: 'var(--admin-gold)' }} />
              <span style={{ fontSize: '0.8rem', color: 'var(--admin-text-tertiary)' }}>Carregando dados...</span>
            </div>
          ) : (
            <>
              {/* Chart area com eixo Y + barras */}
              <div style={{ display: 'flex', gap: 0, height: 300 }}>

                {/* Eixo Y */}
                <div style={{
                  width: 44, flexShrink: 0,
                  display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                  paddingBottom: 36, paddingRight: 8,
                }}>
                  {[maxViews, Math.round(maxViews * 0.75), Math.round(maxViews * 0.5), Math.round(maxViews * 0.25), 0].map((v, i) => (
                    <span key={i} style={{
                      fontSize: '0.65rem', fontWeight: 600,
                      color: 'var(--admin-text-tertiary)',
                      textAlign: 'right', lineHeight: 1,
                    }}>{v}</span>
                  ))}
                </div>

                {/* Área do gráfico */}
                <div style={{ flex: 1, position: 'relative', display: 'flex', flexDirection: 'column' }}>

                  {/* Grid lines horizontais */}
                  <div style={{ position: 'absolute', inset: '0 0 36px 0', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', pointerEvents: 'none' }}>
                    {[0,1,2,3,4].map(i => (
                      <div key={i} style={{ height: 1, background: i === 4 ? 'var(--admin-border-hover)' : 'var(--admin-border)', width: '100%' }} />
                    ))}
                  </div>

                  {/* Barras */}
                  <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', gap: chartData.length > 20 ? 3 : chartData.length > 10 ? 6 : 10, paddingBottom: 0 }}>
                    {chartData.map((data: any, i: number) => {
                      const pct = maxViews > 0 ? (data.views / maxViews) * 100 : 0;
                      const hasData = data.views > 0;
                      return (
                        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end', gap: 0 }}>
                          {/* Valor acima da barra */}
                          <span style={{
                            fontSize: '0.62rem', fontWeight: 700, marginBottom: 4,
                            color: hasData ? 'var(--admin-gold-dark)' : 'transparent',
                            transition: 'color 0.3s',
                            whiteSpace: 'nowrap',
                          }}>
                            {hasData ? data.views : ''}
                          </span>
                          {/* Barra */}
                          <div style={{
                            width: '100%', maxWidth: 40,
                            height: mounted ? `${Math.max(pct, hasData ? 3 : 1)}%` : '0%',
                            background: hasData
                              ? 'linear-gradient(180deg, var(--admin-gold) 0%, var(--admin-gold-dark) 100%)'
                              : 'var(--admin-border)',
                            borderRadius: '5px 5px 2px 2px',
                            transition: `height 0.8s cubic-bezier(0.22, 1, 0.36, 1) ${i * 0.04}s`,
                            boxShadow: hasData ? '0 2px 8px var(--admin-gold-glow)' : 'none',
                            cursor: hasData ? 'pointer' : 'default',
                            position: 'relative',
                            minHeight: 4,
                          }} title={hasData ? `${data.label}: ${data.views} visualizações` : data.label} />
                        </div>
                      );
                    })}
                  </div>

                  {/* Eixo X — labels */}
                  <div style={{
                    height: 36, display: 'flex', alignItems: 'flex-end',
                    gap: chartData.length > 20 ? 3 : chartData.length > 10 ? 6 : 10,
                    paddingBottom: 4, borderTop: '2px solid var(--admin-border-hover)',
                    marginTop: 0,
                  }}>
                    {chartData.map((data: any, i: number) => (
                      <div key={i} style={{ flex: 1, textAlign: 'center' }}>
                        <span style={{
                          fontSize: chartData.length > 15 ? '0.55rem' : '0.65rem',
                          fontWeight: 600, color: 'var(--admin-text-tertiary)',
                          display: 'block', marginTop: 6,
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        }}>
                          {/* Mostrar somente alguns labels se muitos */}
                          {chartData.length <= 12 || i % Math.ceil(chartData.length / 12) === 0 ? data.label : ''}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Footer do gráfico */}
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--admin-border)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 14, height: 14, borderRadius: 3, background: 'linear-gradient(135deg, var(--admin-gold), var(--admin-gold-dark))', display: 'inline-block', flexShrink: 0 }} />
                  <span style={{ fontSize: '0.78rem', color: 'var(--admin-text-secondary)', fontWeight: 500 }}>Visualizações Reais</span>
                </div>
                <div style={{ display: 'flex', gap: 20 }}>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '0.68rem', color: 'var(--admin-text-tertiary)', display: 'block' }}>Total no período</span>
                    <span style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--admin-text-primary)', fontFamily: 'Outfit, sans-serif' }}>
                      {chartData.reduce((s: number, d: any) => s + d.views, 0).toLocaleString('pt-BR')}
                    </span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '0.68rem', color: 'var(--admin-text-tertiary)', display: 'block' }}>Pico do período</span>
                    <span style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--admin-gold-dark)', fontFamily: 'Outfit, sans-serif' }}>
                      {maxViews <= 5 && chartData.every((d: any) => d.views === 0) ? '—' : Math.max(...chartData.map((d: any) => d.views)).toLocaleString('pt-BR')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Estado vazio elegante */}
              {chartData.every((d: any) => d.views === 0) && (
                <div style={{
                  position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center', gap: 10, pointerEvents: 'none',
                  background: 'rgba(var(--admin-bg), 0.0)',
                }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: 14,
                    background: 'var(--admin-gold-light)', display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                  }}>
                    <BarChart3 size={22} color="var(--admin-gold)" />
                  </div>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--admin-text-secondary)' }}>Nenhum acesso registrado</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--admin-text-tertiary)' }}>Os dados aparecerão aqui conforme os visitantes acessam o site</span>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
