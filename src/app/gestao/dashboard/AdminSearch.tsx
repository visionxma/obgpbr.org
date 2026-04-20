'use client';
import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  LayoutDashboard,
  Settings,
  Eye,
  Users,
  Clock,
  BarChart3,
  Moon,
  Zap,
  Bell,
  Globe,
  Shield,
  ArrowRight,
  Trash2,
} from 'lucide-react';

/* ── Tipo de cada item buscável ─────────────── */
interface SearchItem {
  id: string;
  title: string;
  description: string;
  keywords: string[];      // termos extras para matching
  path: string;            // rota de destino
  breadcrumb: string;      // ex: "Dashboard > Visão Geral"
  icon: any;
  category: 'Navegação' | 'Ação Rápida' | 'Funcionalidade' | 'Configuração';
}

/* ── Índice completo de tudo que é buscável ── */
const SEARCH_INDEX: SearchItem[] = [
  // ─── Navegação ──────────────────────────────
  {
    id: 'nav-dashboard',
    title: 'Visão Geral',
    description: 'Painel principal com KPIs, gráficos e atividades recentes',
    keywords: ['dashboard', 'inicio', 'home', 'resumo', 'kpi', 'métricas', 'overview', 'painel'],
    path: '/gestao/dashboard',
    breadcrumb: 'Dashboard › Visão Geral',
    icon: LayoutDashboard,
    category: 'Navegação',
  },
  {
    id: 'nav-settings',
    title: 'Configurações',
    description: 'Preferências do sistema, tema e conta do usuário',
    keywords: ['configurações', 'settings', 'preferências', 'conta', 'perfil', 'sistema'],
    path: '/gestao/dashboard/settings',
    breadcrumb: 'Dashboard › Configurações',
    icon: Settings,
    category: 'Navegação',
  },
  {
    id: 'nav-oscs',
    title: 'Gestão de OSCs',
    description: 'Gerenciar Organizações da Sociedade Civil, validar documentos e selos',
    keywords: ['osc', 'oscs', 'gestão', 'entidades', 'organizações', 'validar', 'documentos', 'selo'],
    path: '/gestao/dashboard/oscs',
    breadcrumb: 'Dashboard › Gestão › OSCs',
    icon: Users,
    category: 'Navegação',
  },
  {
    id: 'nav-lixeira',
    title: 'Lixeira de OSCs',
    description: 'Restaurar ou excluir permanentemente registros de OSCs',
    keywords: ['lixeira', 'trash', 'excluídos', 'restaurar', 'deletados', 'limpar'],
    path: '/gestao/dashboard/oscs/lixeira',
    breadcrumb: 'Dashboard › Gestão › Lixeira',
    icon: Trash2,
    category: 'Navegação',
  },

  // ─── Funcionalidades (Dashboard) ───────────
  {
    id: 'feat-kpi-views',
    title: 'Visualizações',
    description: 'Métricas de visualizações e tráfego do portal',
    keywords: ['visualizações', 'views', 'tráfego', 'visitas', 'acessos', 'analytics'],
    path: '/gestao/dashboard',
    breadcrumb: 'Dashboard › Visão Geral › KPI',
    icon: Eye,
    category: 'Funcionalidade',
  },
  {
    id: 'feat-kpi-leads',
    title: 'Leads Capturados',
    description: 'Quantidade de leads e contatos captados',
    keywords: ['leads', 'contatos', 'captação', 'formulário', 'conversão'],
    path: '/gestao/dashboard',
    breadcrumb: 'Dashboard › Visão Geral › KPI',
    icon: Users,
    category: 'Funcionalidade',
  },
  {
    id: 'feat-activity',
    title: 'Atividades Recentes',
    description: 'Feed de ações recentes no painel administrativo',
    keywords: ['atividades', 'recentes', 'feed', 'histórico', 'log', 'ações'],
    path: '/gestao/dashboard',
    breadcrumb: 'Dashboard › Visão Geral › Feed',
    icon: Clock,
    category: 'Funcionalidade',
  },
  {
    id: 'feat-traffic',
    title: 'Tráfego Semanal',
    description: 'Gráfico de visitantes da última semana',
    keywords: ['tráfego', 'semanal', 'gráfico', 'chart', 'visitantes', 'semana', 'barras'],
    path: '/gestao/dashboard',
    breadcrumb: 'Dashboard › Visão Geral › Gráfico',
    icon: BarChart3,
    category: 'Funcionalidade',
  },
  {
    id: 'feat-quick-actions',
    title: 'Ações de Produção',
    description: 'Painel de atalhos rápidos para criação de conteúdo',
    keywords: ['ações', 'produção', 'atalhos', 'rápido', 'quick actions'],
    path: '/gestao/dashboard',
    breadcrumb: 'Dashboard › Visão Geral › Ações',
    icon: Zap,
    category: 'Funcionalidade',
  },

  // ─── Configurações ─────────────────────────
  {
    id: 'config-theme',
    title: 'Tema Visual',
    description: 'Alternar entre modo Claro e Escuro',
    keywords: ['tema', 'dark mode', 'modo escuro', 'claro', 'aparência', 'visual', 'light', 'dark'],
    path: '/gestao/dashboard/settings',
    breadcrumb: 'Dashboard › Configurações › Tema',
    icon: Moon,
    category: 'Configuração',
  },
  {
    id: 'config-profile',
    title: 'Perfil do Usuário',
    description: 'Informações da conta e sessão ativa',
    keywords: ['perfil', 'usuário', 'conta', 'email', 'sessão', 'login', 'autenticação'],
    path: '/gestao/dashboard/settings',
    breadcrumb: 'Dashboard › Configurações › Perfil',
    icon: Shield,
    category: 'Configuração',
  },
  {
    id: 'config-notifications',
    title: 'Notificações por Email',
    description: 'Configurar resumos semanais de atividade',
    keywords: ['notificações', 'email', 'alertas', 'resumo', 'semanal'],
    path: '/gestao/dashboard/settings',
    breadcrumb: 'Dashboard › Configurações › Notificações',
    icon: Bell,
    category: 'Configuração',
  },
  {
    id: 'config-language',
    title: 'Idioma do Painel',
    description: 'Definir o idioma principal da administração',
    keywords: ['idioma', 'linguagem', 'português', 'language', 'tradução'],
    path: '/gestao/dashboard/settings',
    breadcrumb: 'Dashboard › Configurações › Idioma',
    icon: Globe,
    category: 'Configuração',
  },
];

/* ── Categoria → cor ───────────────────────── */
const CATEGORY_COLORS: Record<string, string> = {
  'Navegação': 'var(--admin-primary)',
  'Ação Rápida': 'var(--admin-success)',
  'Funcionalidade': 'var(--admin-warning)',
  'Configuração': 'var(--admin-info)',
};

/* ── Componente ────────────────────────────── */
export default function AdminSearch() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  /* Normalizar string para busca (remove acentos) */
  const normalize = (str: string) =>
    str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

  /* Filtrar resultados */
  const results = query.trim().length > 0
    ? SEARCH_INDEX.filter((item) => {
        const q = normalize(query);
        return (
          normalize(item.title).includes(q) ||
          normalize(item.description).includes(q) ||
          item.keywords.some((kw) => normalize(kw).includes(q))
        );
      }).slice(0, 8) // max 8 resultados
    : [];

  /* Reset selection quando resultados mudam */
  useEffect(() => {
    setSelectedIdx(0);
  }, [query]);

  /* Fechar ao clicar fora */
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  /* Atalho global Ctrl+K */
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, []);

  /* Navegar ao clicar */
  const navigateTo = useCallback((item: SearchItem) => {
    setQuery('');
    setFocused(false);
    router.push(item.path);
  }, [router]);

  /* Teclado: ↑ ↓ Enter Escape */
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIdx((prev) => Math.min(prev + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIdx((prev) => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && results[selectedIdx]) {
      e.preventDefault();
      navigateTo(results[selectedIdx]);
    } else if (e.key === 'Escape') {
      setFocused(false);
      inputRef.current?.blur();
    }
  };

  const showDropdown = focused && (results.length > 0 || query.trim().length > 0);

  /* Agrupar resultados por categoria */
  const grouped = results.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, SearchItem[]>);

  return (
    <div ref={dropdownRef} style={{ position: 'relative' }}>
      {/* ── Input ──────────────────────────── */}
      <div
        className="admin-header-search"
        style={{
          width: focused ? 360 : 280,
          transition: 'all 0.25s cubic-bezier(0.22, 1, 0.36, 1)',
          borderColor: focused ? 'var(--admin-primary)' : undefined,
          boxShadow: focused ? '0 0 0 3px var(--admin-primary-glow)' : undefined,
        }}
      >
        <Search size={16} className="admin-header-search-icon" />
        <input
          ref={inputRef}
          type="text"
          placeholder="Buscar no painel..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onKeyDown={handleKeyDown}
        />
        {!focused && (
          <kbd
            style={{
              fontSize: '0.65rem',
              fontWeight: 600,
              color: 'var(--admin-text-tertiary)',
              background: 'var(--admin-bg)',
              padding: '2px 6px',
              borderRadius: 4,
              border: '1px solid var(--admin-border)',
              fontFamily: 'inherit',
              whiteSpace: 'nowrap',
            }}
          >
            Ctrl+K
          </kbd>
        )}
      </div>

      {/* ── Dropdown de Resultados ─────────── */}
      {showDropdown && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 10px)',
            left: 0,
            right: 0,
            width: 420,
            maxHeight: 440,
            overflowY: 'auto',
            background: 'var(--admin-surface)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            border: '1px solid var(--admin-border)',
            borderRadius: 'var(--admin-radius-lg)',
            boxShadow: 'var(--admin-shadow-glass)',
            padding: '8px',
            zIndex: 200,
            animation: 'adminScaleIn 0.18s cubic-bezier(0.22, 1, 0.36, 1)',
          }}
        >
          {results.length === 0 ? (
            <div
              style={{
                padding: '28px 16px',
                textAlign: 'center',
                color: 'var(--admin-text-tertiary)',
                fontSize: '0.82rem',
              }}
            >
              <Search size={20} style={{ marginBottom: 8, opacity: 0.4 }} />
              <div>Nenhum resultado para "<strong style={{ color: 'var(--admin-text-secondary)' }}>{query}</strong>"</div>
            </div>
          ) : (
            Object.entries(grouped).map(([category, items]) => (
              <div key={category}>
                {/* Category header */}
                <div
                  style={{
                    padding: '8px 12px 4px',
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    color: CATEGORY_COLORS[category] || 'var(--admin-text-tertiary)',
                  }}
                >
                  {category}
                </div>

                {/* Items */}
                {items.map((item) => {
                  const globalIdx = results.indexOf(item);
                  const isSelected = globalIdx === selectedIdx;
                  const Icon = item.icon;

                  return (
                    <button
                      key={item.id}
                      onClick={() => navigateTo(item)}
                      onMouseEnter={() => setSelectedIdx(globalIdx)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: 'var(--admin-radius-md)',
                        border: 'none',
                        background: isSelected ? 'var(--admin-primary-subtle)' : 'transparent',
                        cursor: 'pointer',
                        transition: 'all 0.12s ease',
                        textAlign: 'left',
                        color: 'inherit',
                        fontFamily: 'inherit',
                      }}
                    >
                      {/* Icon */}
                      <div
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 'var(--admin-radius-sm)',
                          background: isSelected
                            ? 'var(--admin-primary)'
                            : 'var(--admin-bg)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: isSelected
                            ? 'white'
                            : (CATEGORY_COLORS[category] || 'var(--admin-text-secondary)'),
                          flexShrink: 0,
                          transition: 'all 0.12s ease',
                        }}
                      >
                        <Icon size={16} strokeWidth={2} />
                      </div>

                      {/* Text */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            fontSize: '0.85rem',
                            fontWeight: 600,
                            color: isSelected ? 'var(--admin-primary)' : 'var(--admin-text-primary)',
                            marginBottom: 2,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {item.title}
                        </div>
                        <div
                          style={{
                            fontSize: '0.7rem',
                            color: 'var(--admin-text-tertiary)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                          }}
                        >
                          {item.breadcrumb}
                        </div>
                      </div>

                      {/* Arrow indicator */}
                      {isSelected && (
                        <ArrowRight
                          size={14}
                          style={{ color: 'var(--admin-primary)', flexShrink: 0 }}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            ))
          )}

          {/* Footer hint */}
          {results.length > 0 && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 16,
                padding: '8px 12px 4px',
                borderTop: '1px solid var(--admin-border)',
                marginTop: 4,
                fontSize: '0.65rem',
                color: 'var(--admin-text-tertiary)',
                fontWeight: 500,
              }}
            >
              <span><kbd style={{ fontSize: '0.6rem', padding: '1px 4px', borderRadius: 3, border: '1px solid var(--admin-border)', background: 'var(--admin-bg)' }}>↑↓</kbd> navegar</span>
              <span><kbd style={{ fontSize: '0.6rem', padding: '1px 4px', borderRadius: 3, border: '1px solid var(--admin-border)', background: 'var(--admin-bg)' }}>Enter</kbd> abrir</span>
              <span><kbd style={{ fontSize: '0.6rem', padding: '1px 4px', borderRadius: 3, border: '1px solid var(--admin-border)', background: 'var(--admin-bg)' }}>Esc</kbd> fechar</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
