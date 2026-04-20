-- ═══════════════════════════════════════════════════════════════════
-- OBGP — Comprovante PIX: colunas + função admin de confirmação
-- + limpeza de vestígios MercadoPago (nunca implementado)
-- Executar no Supabase SQL Editor (única vez)
-- ═══════════════════════════════════════════════════════════════════

-- ── 0. Remoção dos vestígios MercadoPago ────────────────────────────
-- Colunas exclusivas do fluxo MP que nunca foram usadas em produção
ALTER TABLE public.certificacao_pagamentos
  DROP COLUMN IF EXISTS payment_provider,
  DROP COLUMN IF EXISTS payment_id,
  DROP COLUMN IF EXISTS preference_id,
  DROP COLUMN IF EXISTS payment_url,
  DROP COLUMN IF EXISTS expires_at;

-- Função antiga restrita a service_role (webhook MP que nunca existiu)
DROP FUNCTION IF EXISTS public.confirmar_pagamento(text, text, text);

-- ── 1. Colunas de comprovante em certificacao_pagamentos ────────────
ALTER TABLE public.certificacao_pagamentos
  ADD COLUMN IF NOT EXISTS arquivo_comprovante_path text,
  ADD COLUMN IF NOT EXISTS arquivo_comprovante_nome text,
  ADD COLUMN IF NOT EXISTS arquivo_comprovante_at   timestamptz;

-- ── 2. Política UPDATE para OSC cancelar rows próprias ─────────────
-- (necessário para a OSC poder atualizar linha existente ao reenviar)
DROP POLICY IF EXISTS "user: update own pending payment" ON public.certificacao_pagamentos;
CREATE POLICY "user: update own pending payment"
  ON public.certificacao_pagamentos FOR UPDATE
  USING (auth.uid() = user_id AND status IN ('pendente','aguardando_pagamento'))
  WITH CHECK (auth.uid() = user_id);

-- ── 3. Função admin: confirmar pagamento e liberar certificação ─────
CREATE OR REPLACE FUNCTION public.confirmar_pagamento_admin(
  p_pagamento_id uuid,
  p_osc_id       text
)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_seq  bigint;
  v_cert text;
  v_role text;
BEGIN
  v_role := (auth.jwt()->'app_metadata'->>'role');
  IF v_role NOT IN ('admin','superadmin') THEN
    RETURN jsonb_build_object('ok', false, 'erro', 'Acesso negado');
  END IF;

  v_seq  := nextval('public.cert_numero_seq');
  v_cert := 'RC' || v_seq::text || to_char(now(), 'DDMMYYYY') || 'OBGP';

  -- Marca pagamento como pago
  UPDATE public.certificacao_pagamentos
  SET status           = 'pago',
      paid_at          = now(),
      metodo_pagamento = COALESCE(metodo_pagamento, 'pix')
  WHERE id = p_pagamento_id;

  -- Libera certificação no perfil
  UPDATE public.osc_perfis
  SET certificacao_liberada  = true,
      certificacao_paga_at   = now(),
      certificado_numero     = COALESCE(certificado_numero, v_cert),
      updated_at             = now()
  WHERE osc_id = p_osc_id;

  -- Notificação para a OSC
  INSERT INTO public.notificacoes (osc_id, destinatario, tipo, titulo, mensagem)
  VALUES (
    p_osc_id, 'osc', 'pagamento_aprovado',
    'Pagamento confirmado!',
    'Seu comprovante PIX foi validado pela equipe OBGP. Acesse o painel e preencha o Relatório de Conformidade para dar início à sua certificação.'
  );

  RETURN jsonb_build_object('ok', true, 'certificado_numero', v_cert);
END;
$$;

GRANT EXECUTE ON FUNCTION public.confirmar_pagamento_admin TO authenticated;
