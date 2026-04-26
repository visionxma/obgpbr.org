/**
 * OBGP — Monitor de Consultas CNPJ
 * Logs estruturados + métricas por provedor
 */

export type CNPJLogEntry = {
  cnpj: string;
  provider: string;
  success: boolean;
  responseTimeMs: number;
  cacheHit: boolean;
  cacheExpired?: boolean;
  timestamp: string;
  error?: string;
};

// Métricas acumuladas em memória (por instância do servidor)
const metrics: Record<string, {
  totalRequests: number;
  successCount: number;
  failCount: number;
  totalTimeMs: number;
  cacheHits: number;
  cacheMisses: number;
}> = {};

function ensureProvider(provider: string) {
  if (!metrics[provider]) {
    metrics[provider] = {
      totalRequests: 0,
      successCount: 0,
      failCount: 0,
      totalTimeMs: 0,
      cacheHits: 0,
      cacheMisses: 0,
    };
  }
}

/**
 * Registra uma consulta CNPJ nos logs e métricas
 */
export function logCNPJQuery(entry: CNPJLogEntry): void {
  const provider = entry.provider || 'unknown';
  ensureProvider(provider);

  const m = metrics[provider];
  m.totalRequests++;
  if (entry.success) m.successCount++;
  else m.failCount++;
  m.totalTimeMs += entry.responseTimeMs;
  if (entry.cacheHit) m.cacheHits++;
  else m.cacheMisses++;

  // Log estruturado
  const logData = {
    level: entry.success ? 'info' : 'warn',
    service: 'cnpj-consulta',
    ...entry,
  };

  if (entry.success) {
    console.log(`[CNPJ] ✓ ${entry.cnpj} via ${provider} (${entry.responseTimeMs}ms) ${entry.cacheHit ? '[CACHE]' : '[API]'}`, JSON.stringify(logData));
  } else {
    console.warn(`[CNPJ] ✗ ${entry.cnpj} via ${provider} (${entry.responseTimeMs}ms) — ${entry.error}`, JSON.stringify(logData));
  }
}

/**
 * Retorna métricas agregadas por provider
 */
export function getMetrics() {
  const result: Record<string, {
    totalRequests: number;
    successRate: string;
    failRate: string;
    avgResponseMs: string;
    cacheHitRate: string;
  }> = {};

  for (const [provider, m] of Object.entries(metrics)) {
    const total = m.totalRequests || 1;
    result[provider] = {
      totalRequests: m.totalRequests,
      successRate: ((m.successCount / total) * 100).toFixed(1) + '%',
      failRate: ((m.failCount / total) * 100).toFixed(1) + '%',
      avgResponseMs: (m.totalTimeMs / total).toFixed(0) + 'ms',
      cacheHitRate: ((m.cacheHits / total) * 100).toFixed(1) + '%',
    };
  }

  return result;
}

/**
 * Reseta métricas (útil para testes)
 */
export function resetMetrics(): void {
  for (const key of Object.keys(metrics)) {
    delete metrics[key];
  }
}
