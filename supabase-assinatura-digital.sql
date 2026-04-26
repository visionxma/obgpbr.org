-- ═══════════════════════════════════════════════════════════════════
-- OBGP — Módulo de Assinatura Digital (.pfx)
-- Executar no Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════════════

-- 1. Tabela de Certificados Digitais
CREATE TABLE IF NOT EXISTS public.osc_certificados (
  id                uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           uuid        NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  osc_id            text        NOT NULL,
  arquivo_path      text        NOT NULL, -- Caminho no Storage
  arquivo_nome      text        NOT NULL,
  senha_hash        text,                 -- Opcional: para criptografia adicional
  status            text        NOT NULL DEFAULT 'ativo',
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now(),
  
  -- Garante apenas um certificado ativo por OSC
  CONSTRAINT unique_active_cert UNIQUE (osc_id)
);

-- 2. Segurança (RLS)
ALTER TABLE public.osc_certificados ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso
DROP POLICY IF EXISTS "user: manage own certificate" ON public.osc_certificados;
CREATE POLICY "user: manage own certificate"
  ON public.osc_certificados FOR ALL
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "admin: view all certificates" ON public.osc_certificados;
CREATE POLICY "admin: view all certificates"
  ON public.osc_certificados FOR SELECT
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- 3. Trigger para updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_updated_at ON public.osc_certificados;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.osc_certificados
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- 4. Grants
GRANT ALL ON public.osc_certificados TO authenticated;
GRANT ALL ON public.osc_certificados TO service_role;

-- ═══════════════════════════════════════════════════════════════════
-- NOTA: O Webhook de pagamentos utiliza a função 'confirmar_pagamento'
-- que já deve estar presente no seu banco (conforme supabase-certificacao.sql).
-- ═══════════════════════════════════════════════════════════════════
