/**
 * OBGP — Orquestrador de Consulta CNPJ
 * Cache-first → Fallback automático → Zero erros expostos
 *
 * Fluxo:
 *   1. Supabase cache (hit válido?) → retorna
 *   2. BrasilAPI (3s timeout) → normaliza → salva cache → retorna
 *   3. Minha Receita (3s timeout) → normaliza → salva cache → retorna
 *   4. Cache expirado existe? → retorna dados antigos (melhor que nada)
 *   5. Tudo falhou → throw (tratado na rota como mensagem controlada)
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import { logCNPJQuery, type CNPJLogEntry } from './cnpj-monitor';

// ── Tipo normalizado ────────────────────────────────────────────────────
export type Empresa = {
  cnpj: string;
  razao_social: string;
  nome_fantasia: string;
  situacao: string;
  data_inicio_atividade: string;
  natureza_juridica: string;
  atividade_principal: string;
  logradouro: string;
  numero: string;
  bairro: string;
  municipio: string;
  uf: string;
  cep: string;
  ddd_telefone_1: string;
  email: string;
  qsa: Array<{ nome_socio: string; qualificacao_socio: string }>;
};

// ── Providers ───────────────────────────────────────────────────────────
const PROVIDERS = [
  {
    name: 'brasilapi',
    url: (cnpj: string) => `https://brasilapi.com.br/api/cnpj/v1/${cnpj}`,
    normalize: normalizeFromBrasilAPI,
  },
  {
    name: 'minhareceita',
    url: (cnpj: string) => `https://minhareceita.org/${cnpj}`,
    normalize: normalizeFromMinhaReceita,
  },
] as const;

const PROVIDER_TIMEOUT_MS = 3000;
const TTL_ATIVA_DAYS = 7;
const TTL_INATIVA_DAYS = 30;

// ── Normalizers ─────────────────────────────────────────────────────────

function normalizeFromBrasilAPI(raw: Record<string, any>): Empresa {
  const ativPrincipal = raw.cnae_fiscal_descricao
    || (raw.cnaes_secundarios?.[0]?.descricao)
    || '';

  return {
    cnpj: raw.cnpj?.toString() || '',
    razao_social: raw.razao_social || '',
    nome_fantasia: raw.nome_fantasia || '',
    situacao: raw.descricao_situacao_cadastral || raw.situacao_cadastral?.toString() || '',
    data_inicio_atividade: raw.data_inicio_atividade || '',
    natureza_juridica: raw.natureza_juridica || '',
    atividade_principal: ativPrincipal,
    logradouro: raw.logradouro || '',
    numero: raw.numero || '',
    bairro: raw.bairro || '',
    municipio: raw.municipio || '',
    uf: raw.uf || '',
    cep: raw.cep?.toString().replace(/\D/g, '') || '',
    ddd_telefone_1: raw.ddd_telefone_1?.toString().replace(/\D/g, '') || '',
    email: raw.email || '',
    qsa: Array.isArray(raw.qsa)
      ? raw.qsa.map((s: any) => ({
          nome_socio: s.nome_socio || s.nome || '',
          qualificacao_socio: s.qualificacao_socio || s.qual || '',
        }))
      : [],
  };
}

function normalizeFromMinhaReceita(raw: Record<string, any>): Empresa {
  // Minha Receita tem schema similar à ReceitaWS
  const ativPrincipal = raw.atividade_principal?.[0]?.text
    || raw.cnae_fiscal_descricao
    || '';

  // Data pode vir como DD/MM/YYYY
  let dataAbertura = raw.data_inicio_atividade || raw.abertura || '';
  if (dataAbertura.includes('/')) {
    dataAbertura = dataAbertura.split('/').reverse().join('-');
  }

  return {
    cnpj: raw.cnpj?.toString().replace(/\D/g, '') || '',
    razao_social: raw.razao_social || raw.nome || '',
    nome_fantasia: raw.nome_fantasia || raw.fantasia || '',
    situacao: raw.descricao_situacao_cadastral || raw.situacao || '',
    data_inicio_atividade: dataAbertura,
    natureza_juridica: raw.natureza_juridica || '',
    atividade_principal: ativPrincipal,
    logradouro: raw.logradouro || '',
    numero: raw.numero || '',
    bairro: raw.bairro || '',
    municipio: raw.municipio || '',
    uf: raw.uf || '',
    cep: raw.cep?.toString().replace(/\D/g, '') || '',
    ddd_telefone_1: (raw.ddd_telefone_1 || raw.telefone || '').toString().replace(/\D/g, ''),
    email: raw.email || '',
    qsa: Array.isArray(raw.qsa)
      ? raw.qsa.map((s: any) => ({
          nome_socio: s.nome_socio || s.nome || '',
          qualificacao_socio: s.qualificacao_socio || s.qual || '',
        }))
      : [],
  };
}

// ── Cache functions ─────────────────────────────────────────────────────

function calcExpiresAt(situacao: string): string {
  const isAtiva = !situacao || situacao.toUpperCase().includes('ATIVA');
  const days = isAtiva ? TTL_ATIVA_DAYS : TTL_INATIVA_DAYS;
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

type CacheResult = {
  dados: Empresa;
  expired: boolean;
  provedor: string;
};

async function getCachedCNPJ(
  cnpj: string,
  supabaseAdmin: SupabaseClient,
): Promise<CacheResult | null> {
  try {
    const { data, error } = await supabaseAdmin
      .from('cnpj_cache')
      .select('dados, situacao, provedor, expires_at')
      .eq('cnpj', cnpj)
      .maybeSingle();

    if (error || !data) return null;

    const expired = new Date(data.expires_at) < new Date();
    return {
      dados: data.dados as Empresa,
      expired,
      provedor: data.provedor,
    };
  } catch {
    return null;
  }
}

async function saveCNPJCache(
  cnpj: string,
  dados: Empresa,
  provedor: string,
  tempoMs: number,
  supabaseAdmin: SupabaseClient,
): Promise<void> {
  try {
    const situacao = dados.situacao || 'ATIVA';
    await supabaseAdmin
      .from('cnpj_cache')
      .upsert({
        cnpj,
        dados,
        situacao,
        provedor,
        tempo_resposta: tempoMs,
        expires_at: calcExpiresAt(situacao),
        updated_at: new Date().toISOString(),
      }, { onConflict: 'cnpj' });
  } catch (err) {
    // Falha silenciosa — cache é otimização, não obrigação
    console.warn('[CNPJ Cache] Erro ao salvar:', err);
  }
}

// ── Fetch from external providers ───────────────────────────────────────

async function fetchFromProviders(cnpj: string): Promise<{
  data: Empresa;
  provider: string;
  timeMs: number;
}> {
  for (const provider of PROVIDERS) {
    const start = Date.now();
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), PROVIDER_TIMEOUT_MS);

      const res = await fetch(provider.url(cnpj), {
        signal: controller.signal,
        headers: { Accept: 'application/json' },
        cache: 'no-store',
      });

      clearTimeout(timeout);

      if (!res.ok) {
        const elapsed = Date.now() - start;
        logCNPJQuery({
          cnpj,
          provider: provider.name,
          success: false,
          responseTimeMs: elapsed,
          cacheHit: false,
          timestamp: new Date().toISOString(),
          error: `HTTP ${res.status}`,
        });
        continue;
      }

      const raw = await res.json();
      const normalized = provider.normalize(raw);
      const elapsed = Date.now() - start;

      logCNPJQuery({
        cnpj,
        provider: provider.name,
        success: true,
        responseTimeMs: elapsed,
        cacheHit: false,
        timestamp: new Date().toISOString(),
      });

      return { data: normalized, provider: provider.name, timeMs: elapsed };
    } catch (err: any) {
      const elapsed = Date.now() - start;
      logCNPJQuery({
        cnpj,
        provider: provider.name,
        success: false,
        responseTimeMs: elapsed,
        cacheHit: false,
        timestamp: new Date().toISOString(),
        error: err.name === 'AbortError' ? 'Timeout (3s)' : err.message,
      });
      continue;
    }
  }

  throw new Error('ALL_PROVIDERS_FAILED');
}

// ── Função principal ────────────────────────────────────────────────────

/**
 * Consulta CNPJ com estratégia cache-first + fallback automático.
 *
 * Ordem:
 *   1. Cache Supabase válido → retorna imediatamente
 *   2. APIs externas (BrasilAPI → Minha Receita) → salva cache → retorna
 *   3. Cache expirado → retorna dados antigos como último recurso
 *   4. Nada → throw (tratado na rota como mensagem amigável)
 */
export async function consultarCNPJ(
  cnpj: string,
  supabaseAdmin: SupabaseClient,
): Promise<Empresa> {
  const startTotal = Date.now();

  // 1. Tentar cache
  const cached = await getCachedCNPJ(cnpj, supabaseAdmin);

  if (cached && !cached.expired) {
    const elapsed = Date.now() - startTotal;
    logCNPJQuery({
      cnpj,
      provider: `cache:${cached.provedor}`,
      success: true,
      responseTimeMs: elapsed,
      cacheHit: true,
      timestamp: new Date().toISOString(),
    });
    return cached.dados;
  }

  // 2. Tentar APIs externas
  try {
    const result = await fetchFromProviders(cnpj);

    // Salvar no cache (fire-and-forget)
    saveCNPJCache(cnpj, result.data, result.provider, result.timeMs, supabaseAdmin);

    return result.data;
  } catch {
    // 3. Fallback: cache expirado (melhor que nada)
    if (cached) {
      const elapsed = Date.now() - startTotal;
      logCNPJQuery({
        cnpj,
        provider: `cache-expired:${cached.provedor}`,
        success: true,
        responseTimeMs: elapsed,
        cacheHit: true,
        cacheExpired: true,
        timestamp: new Date().toISOString(),
      });
      return cached.dados;
    }

    // 4. Falha total
    logCNPJQuery({
      cnpj,
      provider: 'none',
      success: false,
      responseTimeMs: Date.now() - startTotal,
      cacheHit: false,
      timestamp: new Date().toISOString(),
      error: 'Falha total: sem cache e sem API disponível',
    });

    throw new Error('CNPJ_LOOKUP_FAILED');
  }
}
