-- ═══════════════════════════════════════════════════════════════
--  RELATÓRIO DE CONFORMIDADE — OBGP
--  Execute este script no Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════════

-- ─── 1. Extend osc_perfis with new fields ───────────────────────
ALTER TABLE public.osc_perfis
  ADD COLUMN IF NOT EXISTS natureza_juridica  text,
  ADD COLUMN IF NOT EXISTS logradouro         text,
  ADD COLUMN IF NOT EXISTS numero_endereco    text,
  ADD COLUMN IF NOT EXISTS bairro             text,
  ADD COLUMN IF NOT EXISTS cep                text,
  ADD COLUMN IF NOT EXISTS email_osc          text,
  ADD COLUMN IF NOT EXISTS data_abertura_cnpj date;

-- ─── 2. Relatórios de Conformidade ──────────────────────────────
CREATE TABLE IF NOT EXISTS public.relatorios_conformidade (
  id                     uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
  osc_id                 text         NOT NULL,
  numero                 text,
  status                 text         NOT NULL DEFAULT 'em_preenchimento',
  -- JSONB sections
  dados_entidade         jsonb        NOT NULL DEFAULT '{}'::jsonb,
  habilitacao_juridica   jsonb        NOT NULL DEFAULT '[]'::jsonb,
  regularidade_fiscal    jsonb        NOT NULL DEFAULT '[]'::jsonb,
  qualificacao_economica jsonb        NOT NULL DEFAULT '[]'::jsonb,
  qualificacao_tecnica   jsonb        NOT NULL DEFAULT '[]'::jsonb,
  -- Admin review
  observacao_admin       text,
  submitted_at           timestamptz,
  reviewed_at            timestamptz,
  created_at             timestamptz  NOT NULL DEFAULT now(),
  updated_at             timestamptz  NOT NULL DEFAULT now()
);

-- ─── 3. RLS ─────────────────────────────────────────────────────
ALTER TABLE public.relatorios_conformidade ENABLE ROW LEVEL SECURITY;

-- OSC owner: full CRUD on their own report
DROP POLICY IF EXISTS "relatorio_owner_crud" ON public.relatorios_conformidade;
CREATE POLICY "relatorio_owner_crud" ON public.relatorios_conformidade
  FOR ALL TO authenticated
  USING (
    osc_id = (
      SELECT osc_id FROM public.osc_perfis WHERE user_id = auth.uid() LIMIT 1
    )
  )
  WITH CHECK (
    osc_id = (
      SELECT osc_id FROM public.osc_perfis WHERE user_id = auth.uid() LIMIT 1
    )
  );

-- Admin: full access to all reports
DROP POLICY IF EXISTS "relatorio_admin_all" ON public.relatorios_conformidade;
CREATE POLICY "relatorio_admin_all" ON public.relatorios_conformidade
  FOR ALL TO authenticated
  USING (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  )
  WITH CHECK (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

-- ─── 4. Updated_at trigger ──────────────────────────────────────
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

DROP TRIGGER IF EXISTS relatorios_conformidade_updated_at ON public.relatorios_conformidade;
CREATE TRIGGER relatorios_conformidade_updated_at
  BEFORE UPDATE ON public.relatorios_conformidade
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
