-- ═══════════════════════════════════════════════════════════════════
-- OBGP — Certificação Selo OSC: Pagamento + Colunas adicionais
-- Executar no Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════════════

-- ── 1. Colunas adicionais em osc_perfis ─────────────────────────────
ALTER TABLE public.osc_perfis
  ADD COLUMN IF NOT EXISTS certificacao_liberada   boolean      NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS certificacao_solicitada_at timestamptz,
  ADD COLUMN IF NOT EXISTS certificacao_paga_at    timestamptz,
  ADD COLUMN IF NOT EXISTS certificado_numero      text,
  ADD COLUMN IF NOT EXISTS certificado_emitido_at  timestamptz,
  ADD COLUMN IF NOT EXISTS certificado_url         text;

-- ── 2. Tabela de pagamentos ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.certificacao_pagamentos (
  id                uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           uuid        NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  osc_id            text        NOT NULL,
  valor             numeric(10,2) NOT NULL DEFAULT 350.00,
  status            text        NOT NULL DEFAULT 'pendente'
                    CHECK (status IN ('pendente','aguardando_pagamento','pago','cancelado','reembolsado')),
  payment_provider  text        NOT NULL DEFAULT 'mercadopago',
  payment_id        text,           -- ID retornado pelo provedor
  preference_id     text,           -- ID da preferência MP
  payment_url       text,           -- init_point (URL de checkout)
  metodo_pagamento  text,           -- pix | credit_card | boleto
  paid_at           timestamptz,
  expires_at        timestamptz,
  created_at        timestamptz NOT NULL DEFAULT now()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_cert_pag_user    ON public.certificacao_pagamentos (user_id);
CREATE INDEX IF NOT EXISTS idx_cert_pag_osc     ON public.certificacao_pagamentos (osc_id);
CREATE INDEX IF NOT EXISTS idx_cert_pag_status  ON public.certificacao_pagamentos (status);
CREATE INDEX IF NOT EXISTS idx_cert_pag_pay_id  ON public.certificacao_pagamentos (payment_id);

-- ── 3. RLS ──────────────────────────────────────────────────────────
ALTER TABLE public.certificacao_pagamentos ENABLE ROW LEVEL SECURITY;

-- Usuário vê apenas seus próprios pagamentos
DROP POLICY IF EXISTS "user: select own payments" ON public.certificacao_pagamentos;
CREATE POLICY "user: select own payments"
  ON public.certificacao_pagamentos FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "user: insert own payment" ON public.certificacao_pagamentos;
CREATE POLICY "user: insert own payment"
  ON public.certificacao_pagamentos FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Admin vê e atualiza todos
DROP POLICY IF EXISTS "admin: all payments" ON public.certificacao_pagamentos;
CREATE POLICY "admin: all payments"
  ON public.certificacao_pagamentos FOR ALL
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- Service role (webhook) pode atualizar sem restrição de auth
-- Configurar no Supabase: criar uma Row Security Policy para service_role ou
-- usar supabase.auth.admin no webhook com SUPABASE_SERVICE_KEY

-- ── 4. Função: confirmar pagamento e liberar certificação ────────────
CREATE OR REPLACE FUNCTION public.confirmar_pagamento(
  p_payment_id   text,
  p_osc_id       text,
  p_metodo       text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_cert_numero text;
BEGIN
  -- Atualiza pagamento
  UPDATE public.certificacao_pagamentos
  SET
    status            = 'pago',
    payment_id        = p_payment_id,
    metodo_pagamento  = p_metodo,
    paid_at           = now()
  WHERE osc_id = p_osc_id
    AND status IN ('pendente', 'aguardando_pagamento');

  -- Gera número do certificado: RC{DDMMYYYY}OBGP + 3 dígitos aleatórios
  v_cert_numero := 'RC' || to_char(now(), 'DDMMYYYY') || 'OBGP';

  -- Libera certificação no perfil
  UPDATE public.osc_perfis
  SET
    certificacao_liberada      = true,
    certificacao_paga_at       = now(),
    certificado_numero         = v_cert_numero,
    updated_at                 = now()
  WHERE osc_id = p_osc_id;
END;
$$;

-- ── 5. Grants ────────────────────────────────────────────────────────
GRANT SELECT, INSERT ON public.certificacao_pagamentos TO authenticated;
GRANT EXECUTE ON FUNCTION public.confirmar_pagamento TO service_role;
