-- ═══════════════════════════════════════════════════════════════════════
-- OBGP — Cache inteligente de CNPJ
-- Tabela de cache para consultas de CNPJ com TTL automático
-- Executar no Supabase SQL Editor (única vez)
-- ═══════════════════════════════════════════════════════════════════════

-- ── 1. Tabela cnpj_cache ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.cnpj_cache (
  cnpj            text        PRIMARY KEY,          -- 14 dígitos, sem pontuação
  dados           jsonb       NOT NULL,             -- dados normalizados da empresa
  situacao        text,                              -- 'ATIVA', 'BAIXADA', 'INAPTA', etc.
  provedor        text        NOT NULL,             -- 'brasilapi', 'minhareceita'
  tempo_resposta  integer,                           -- tempo em ms da consulta original
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  expires_at      timestamptz NOT NULL              -- calculado: +7d (ativa) ou +30d (inativa)
);

-- Índice para limpeza periódica e consulta de expiração
CREATE INDEX IF NOT EXISTS idx_cnpj_cache_expires ON public.cnpj_cache (expires_at);

-- ── 2. Trigger updated_at (reusa função existente) ──────────────────────
DROP TRIGGER IF EXISTS trg_cnpj_cache_upd ON public.cnpj_cache;
CREATE TRIGGER trg_cnpj_cache_upd
  BEFORE UPDATE ON public.cnpj_cache
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- ── 3. RLS ──────────────────────────────────────────────────────────────
ALTER TABLE public.cnpj_cache ENABLE ROW LEVEL SECURITY;

-- Leitura para qualquer usuário autenticado
DROP POLICY IF EXISTS "cnpj_cache: read auth" ON public.cnpj_cache;
CREATE POLICY "cnpj_cache: read auth"
  ON public.cnpj_cache FOR SELECT
  USING (auth.role() = 'authenticated');

-- Escrita apenas via service_role (server-side)
DROP POLICY IF EXISTS "cnpj_cache: write service" ON public.cnpj_cache;
CREATE POLICY "cnpj_cache: write service"
  ON public.cnpj_cache FOR ALL
  USING (auth.role() = 'service_role');

-- Permitir leitura anônima também (para guests sem login)
DROP POLICY IF EXISTS "cnpj_cache: read anon" ON public.cnpj_cache;
CREATE POLICY "cnpj_cache: read anon"
  ON public.cnpj_cache FOR SELECT
  USING (auth.role() = 'anon');

-- ── 4. Função de limpeza de cache expirado (opcional, rodar via cron) ───
CREATE OR REPLACE FUNCTION public.limpar_cnpj_cache_expirado()
RETURNS integer LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_count integer;
BEGIN
  DELETE FROM public.cnpj_cache WHERE expires_at < now();
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$;

GRANT EXECUTE ON FUNCTION public.limpar_cnpj_cache_expirado TO service_role;
