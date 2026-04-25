-- ═══════════════════════════════════════════════════════════════════════
-- OBGP v2 — Certificação completa
-- Relatório normalizado, assinaturas, notificações, cert code único,
-- storage privado, funções de automação
-- Executar no Supabase SQL Editor (única vez)
-- ═══════════════════════════════════════════════════════════════════════

-- ── 1. Sequência para número único de certificado ──────────────────────
CREATE SEQUENCE IF NOT EXISTS public.cert_numero_seq START 1 INCREMENT 1 MINVALUE 1 NO CYCLE;

-- ── 2. relatorio_itens — modelo normalizado por item/subitem ───────────
CREATE TABLE IF NOT EXISTS public.relatorio_itens (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  relatorio_id    uuid        NOT NULL REFERENCES public.relatorios_conformidade(id) ON DELETE CASCADE,
  secao           smallint    NOT NULL CHECK (secao IN (2, 3, 4, 5)),
  codigo          text        NOT NULL,
  descricao       text        NOT NULL,
  is_header       boolean     NOT NULL DEFAULT false,
  ordem           smallint    NOT NULL DEFAULT 0,
  -- Preenchido pela OSC
  codigo_controle text,
  data_emissao    date,
  data_validade   date,
  analise_atual   text,
  -- Status
  status          text        NOT NULL DEFAULT 'pendente'
                  CHECK (status IN ('pendente','conforme','nao_conforme','nao_aplicavel')),
  -- Arquivo (storage privado)
  arquivo_path    text,
  arquivo_nome    text,
  arquivo_hash    text,
  arquivo_tamanho bigint,
  -- Observações do analista
  observacao      text,
  -- Timestamps
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE (relatorio_id, codigo)
);

CREATE INDEX IF NOT EXISTS idx_relatorio_itens_rel  ON public.relatorio_itens (relatorio_id);
CREATE INDEX IF NOT EXISTS idx_relatorio_itens_sec  ON public.relatorio_itens (relatorio_id, secao);

-- ── 3. Assinaturas / trilha de auditoria ──────────────────────────────
CREATE TABLE IF NOT EXISTS public.relatorio_assinaturas (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  relatorio_id    uuid        NOT NULL REFERENCES public.relatorios_conformidade(id) ON DELETE CASCADE,
  user_id         uuid        NOT NULL REFERENCES auth.users(id),
  role            text        NOT NULL CHECK (role IN ('admin_rt','contador','superadmin')),
  nome_assinante  text        NOT NULL,
  credencial      text,
  documento_hash  text        NOT NULL,
  ip_address      text,
  signed_at       timestamptz NOT NULL DEFAULT now(),
  valida          boolean     NOT NULL DEFAULT true,
  UNIQUE (relatorio_id, role)
);

-- ── 4. Notificações ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.notificacoes (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid        REFERENCES auth.users(id),
  osc_id          text,
  destinatario    text        NOT NULL DEFAULT 'osc'
                  CHECK (destinatario IN ('osc','admin','ambos')),
  tipo            text        NOT NULL,
  titulo          text        NOT NULL,
  mensagem        text        NOT NULL,
  metadata        jsonb,
  lida            boolean     NOT NULL DEFAULT false,
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notif_user  ON public.notificacoes (user_id, lida);
CREATE INDEX IF NOT EXISTS idx_notif_osc   ON public.notificacoes (osc_id, lida);
CREATE INDEX IF NOT EXISTS idx_notif_admin ON public.notificacoes (destinatario) WHERE destinatario IN ('admin','ambos');

-- ── 5. RLS ─────────────────────────────────────────────────────────────

-- relatorio_itens
ALTER TABLE public.relatorio_itens ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "osc: own itens"   ON public.relatorio_itens;
CREATE POLICY "osc: own itens"
  ON public.relatorio_itens FOR ALL
  USING (
    relatorio_id IN (
      SELECT r.id FROM public.relatorios_conformidade r
      JOIN  public.osc_perfis p ON p.osc_id = r.osc_id
      WHERE p.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "staff: all itens" ON public.relatorio_itens;
CREATE POLICY "staff: all itens"
  ON public.relatorio_itens FOR ALL
  USING ((auth.jwt()->'app_metadata'->>'role') IN ('admin','admin_rt','contador'));

-- relatorio_assinaturas
ALTER TABLE public.relatorio_assinaturas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "staff: all assinaturas" ON public.relatorio_assinaturas;
CREATE POLICY "staff: all assinaturas"
  ON public.relatorio_assinaturas FOR ALL
  USING ((auth.jwt()->'app_metadata'->>'role') IN ('admin','admin_rt','contador'));

DROP POLICY IF EXISTS "osc: view assinaturas" ON public.relatorio_assinaturas;
CREATE POLICY "osc: view assinaturas"
  ON public.relatorio_assinaturas FOR SELECT
  USING (
    relatorio_id IN (
      SELECT r.id FROM public.relatorios_conformidade r
      JOIN  public.osc_perfis p ON p.osc_id = r.osc_id
      WHERE p.user_id = auth.uid()
    )
  );

-- notificacoes
ALTER TABLE public.notificacoes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "user: own notifs"   ON public.notificacoes;
CREATE POLICY "user: own notifs"
  ON public.notificacoes FOR SELECT
  USING (
    user_id = auth.uid()
    OR (destinatario IN ('admin','ambos') AND (auth.jwt()->'app_metadata'->>'role') IN ('admin','admin_rt','contador'))
    OR osc_id IN (SELECT osc_id FROM public.osc_perfis WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "user: mark read"   ON public.notificacoes;
CREATE POLICY "user: mark read"
  ON public.notificacoes FOR UPDATE
  USING (
    user_id = auth.uid()
    OR osc_id IN (SELECT osc_id FROM public.osc_perfis WHERE user_id = auth.uid())
    OR (auth.jwt()->'app_metadata'->>'role') IN ('admin','admin_rt','contador')
  );

DROP POLICY IF EXISTS "service: insert notifs" ON public.notificacoes;
CREATE POLICY "service: insert notifs"
  ON public.notificacoes FOR INSERT WITH CHECK (true);

-- ── 6. Trigger updated_at ──────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

DROP TRIGGER IF EXISTS trg_rel_itens_upd ON public.relatorio_itens;
CREATE TRIGGER trg_rel_itens_upd
  BEFORE UPDATE ON public.relatorio_itens
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- ── 7. Função: seed itens do relatório ────────────────────────────────
CREATE OR REPLACE FUNCTION public.seed_relatorio_itens(p_relatorio_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.relatorio_itens (relatorio_id, secao, codigo, descricao, is_header, ordem)
  VALUES
    -- Seção 2 — Habilitação Jurídica
    (p_relatorio_id,2,'2.1',  'Cartão CNPJ',                                                                             false, 1),
    (p_relatorio_id,2,'2.2',  'QSA — Quadro de Sócios e Administradores (Cartão CNPJ)',                                   false, 2),
    (p_relatorio_id,2,'2.3',  'Cadastro de Contribuinte Municipal/Estadual',                                              false, 3),
    (p_relatorio_id,2,'2.4',  'Alvará de Licença e Funcionamento',                                                       false, 4),
    (p_relatorio_id,2,'2.5',  'Estatuto Social',                                                                         false, 5),
    (p_relatorio_id,2,'2.6',  'Ata de Constituição/Fundação',                                                            false, 6),
    (p_relatorio_id,2,'2.7',  'Ata de Eleição e Posse atual',                                                            false, 7),
    (p_relatorio_id,2,'2.8',  'Relação de Membros atual',                                                                false, 8),
    (p_relatorio_id,2,'2.9',  'Comprovante de endereço da entidade',                                                     false, 9),
    (p_relatorio_id,2,'2.10', 'RG/CPF do representante legal',                                                           false,10),
    (p_relatorio_id,2,'2.11', 'Comprovante de endereço do representante legal',                                          false,11),
    -- Seção 3 — Regularidade Fiscal, Social e Trabalhista
    (p_relatorio_id,3,'3.1','CND Federal (Receita Federal + Dívida Ativa da União)',                                      false,1),
    (p_relatorio_id,3,'3.2','CND Estadual',                                                                               false,2),
    (p_relatorio_id,3,'3.3','CNDA Estadual',                                                                              false,3),
    (p_relatorio_id,3,'3.4','CND Municipal',                                                                              false,4),
    (p_relatorio_id,3,'3.5','CR FGTS (Caixa Econômica Federal)',                                                          false,5),
    (p_relatorio_id,3,'3.6','CND Trabalhista (TST — Tribunal Superior do Trabalho)',                                      false,6),
    (p_relatorio_id,3,'3.7','CND Estadual de Débitos Ambientais (CAEMA ou equivalente estadual)',                         false,7),
    -- Seção 4 — Qualificação Econômico-Financeira
    (p_relatorio_id,4,'4.1',  'Certidão de Falência e Concordata',                                                        false, 1),
    (p_relatorio_id,4,'4.2',  'Registro e Regularidade do Contador responsável',                                          false, 2),
    (p_relatorio_id,4,'4.3',  'Demonstrações Financeiras — Balanço Social dos últimos dois exercícios (ITG 2002)',         true,  3),
    (p_relatorio_id,4,'4.3.1','Termo de Abertura',                                                                        false, 4),
    (p_relatorio_id,4,'4.3.2','Balanço Patrimonial',                                                                      false, 5),
    (p_relatorio_id,4,'4.3.3','Demonstração do Superavit e Déficit',                                                      false, 6),
    (p_relatorio_id,4,'4.3.4','Demonstração das Mutações do Patrimônio Líquido',                                          false, 7),
    (p_relatorio_id,4,'4.3.5','Demonstração dos Fluxos de Caixa',                                                         false, 8),
    (p_relatorio_id,4,'4.3.6','Notas Explicativas dos dois últimos exercícios sociais',                                   false, 9),
    (p_relatorio_id,4,'4.3.7','Termo de Encerramento',                                                                    false,10),
    (p_relatorio_id,4,'4.4',  'Ata aprovando prestação de contas com parecer do conselho fiscal (últimos 2 exercícios)',  false,11),
    -- Seção 5 — Qualificação Técnica (fixos; instrumentos são adicionados dinamicamente)
    (p_relatorio_id,5,'5.1','Registro e Regularidade da Entidade em Conselho de Classe (se houver)',                      false,1),
    (p_relatorio_id,5,'5.2','Registro e Regularidade do Profissional RT em Conselho de Classe (se houver)',               false,2),
    (p_relatorio_id,5,'6.10','Utilidade Pública Municipal',                                                               false,3)
  ON CONFLICT (relatorio_id, codigo) DO NOTHING;
END;
$$;

GRANT EXECUTE ON FUNCTION public.seed_relatorio_itens TO authenticated;

-- ── 8. Função: assinar relatório (dois níveis) ─────────────────────────
CREATE OR REPLACE FUNCTION public.assinar_relatorio(
  p_relatorio_id   uuid,
  p_role           text,
  p_nome_assinante text,
  p_credencial     text,
  p_documento_hash text,
  p_ip_address     text DEFAULT NULL
)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_rt_ok   boolean;
  v_cont_ok boolean;
  v_osc_id  text;
BEGIN
  -- Validação de papel
  IF p_role NOT IN ('admin_rt','contador','superadmin') THEN
    RETURN jsonb_build_object('ok',false,'erro','Papel inválido');
  END IF;

  -- Inserir ou atualizar assinatura
  INSERT INTO public.relatorio_assinaturas
    (relatorio_id, user_id, role, nome_assinante, credencial, documento_hash, ip_address)
  VALUES
    (p_relatorio_id, auth.uid(), p_role, p_nome_assinante, p_credencial, p_documento_hash, p_ip_address)
  ON CONFLICT (relatorio_id, role) DO UPDATE SET
    user_id        = auth.uid(),
    nome_assinante = p_nome_assinante,
    credencial     = p_credencial,
    documento_hash = p_documento_hash,
    ip_address     = p_ip_address,
    signed_at      = now(),
    valida         = true;

  -- Verifica ambas assinaturas
  SELECT
    bool_or(role = 'admin_rt'  AND valida),
    bool_or(role = 'contador'  AND valida)
  INTO v_rt_ok, v_cont_ok
  FROM public.relatorio_assinaturas
  WHERE relatorio_id = p_relatorio_id;

  -- Busca osc_id
  SELECT osc_id INTO v_osc_id FROM public.relatorios_conformidade WHERE id = p_relatorio_id;

  IF v_rt_ok AND v_cont_ok THEN
    -- Aprova o relatório
    UPDATE public.relatorios_conformidade
    SET status = 'aprovado', reviewed_at = now()
    WHERE id = p_relatorio_id;

    -- Atualiza status do selo na OSC
    UPDATE public.osc_perfis
    SET status_selo        = 'aprovado',
        certificado_emitido_at = COALESCE(certificado_emitido_at, now()),
        updated_at         = now()
    WHERE osc_id = v_osc_id;

    -- Notificação para OSC
    INSERT INTO public.notificacoes (osc_id, destinatario, tipo, titulo, mensagem)
    VALUES (v_osc_id,'osc','aprovado',
      'Certificação aprovada!',
      'Seu Relatório de Conformidade foi aprovado. O Selo OSC Gestão de Parcerias foi emitido.');
  END IF;

  RETURN jsonb_build_object(
    'ok', true,
    'resultado', CASE WHEN v_rt_ok AND v_cont_ok THEN 'aprovado' ELSE 'parcial' END,
    'rt', COALESCE(v_rt_ok,false),
    'contador', COALESCE(v_cont_ok,false)
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.assinar_relatorio TO authenticated;

-- ── 9. Corrige confirmar_pagamento: código único com sequência ─────────
CREATE OR REPLACE FUNCTION public.confirmar_pagamento(
  p_payment_id text,
  p_osc_id     text,
  p_metodo     text DEFAULT NULL
)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_seq  bigint;
  v_cert text;
BEGIN
  v_seq  := nextval('public.cert_numero_seq');
  v_cert := 'RC' || v_seq::text || to_char(now(),'DDMMYYYY') || 'OBGP';

  UPDATE public.certificacao_pagamentos
  SET status           = 'pago',
      payment_id       = p_payment_id,
      metodo_pagamento = p_metodo,
      paid_at          = now()
  WHERE osc_id = p_osc_id
    AND status IN ('pendente','aguardando_pagamento');

  UPDATE public.osc_perfis
  SET certificacao_liberada  = true,
      certificacao_paga_at   = now(),
      certificado_numero     = COALESCE(certificado_numero, v_cert),
      certificado_emitido_at = COALESCE(certificado_emitido_at, now()),
      updated_at             = now()
  WHERE osc_id = p_osc_id;

  -- Notificação OSC
  INSERT INTO public.notificacoes (osc_id, destinatario, tipo, titulo, mensagem)
  VALUES (p_osc_id,'osc','pagamento_aprovado',
    'Pagamento confirmado!',
    'Acesse o painel e preencha o Relatório de Conformidade para iniciar sua certificação.');

  -- Notificação admin
  INSERT INTO public.notificacoes (osc_id, destinatario, tipo, titulo, mensagem)
  VALUES (p_osc_id,'admin','novo_processo',
    'Novo processo de certificação',
    'OSC ' || p_osc_id || ' realizou pagamento e aguarda análise.');
END;
$$;

GRANT EXECUTE ON FUNCTION public.confirmar_pagamento TO service_role;

-- ── 10. Notificação quando OSC submeter relatório ──────────────────────
CREATE OR REPLACE FUNCTION public.notificar_relatorio_enviado()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF NEW.status = 'em_analise' AND OLD.status = 'em_preenchimento' THEN
    INSERT INTO public.notificacoes (osc_id, destinatario, tipo, titulo, mensagem)
    VALUES (NEW.osc_id, 'admin', 'relatorio_enviado',
      'Relatório enviado para análise',
      'OSC ' || NEW.osc_id || ' enviou o Relatório de Conformidade ' || COALESCE(NEW.numero,'') || '.');
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_relatorio_enviado ON public.relatorios_conformidade;
CREATE TRIGGER trg_relatorio_enviado
  AFTER UPDATE ON public.relatorios_conformidade
  FOR EACH ROW EXECUTE FUNCTION public.notificar_relatorio_enviado();

-- ── 11. Storage bucket privado osc-docs ───────────────────────────────
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'osc-docs', 'osc-docs', false, 10485760,
  ARRAY['application/pdf','image/jpeg','image/png','image/webp',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
)
ON CONFLICT (id) DO UPDATE SET public = false, file_size_limit = 10485760;

-- Políticas do storage privado
DROP POLICY IF EXISTS "osc-docs: upload auth"  ON storage.objects;
CREATE POLICY "osc-docs: upload auth"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'osc-docs' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "osc-docs: read auth"    ON storage.objects;
CREATE POLICY "osc-docs: read auth"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'osc-docs' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "osc-docs: delete auth"  ON storage.objects;
CREATE POLICY "osc-docs: delete auth"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'osc-docs' AND auth.role() = 'authenticated');

-- ── 12. Constraint unique no código de certificado ─────────────────────
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'uq_osc_perfis_certificado_numero'
  ) THEN
    ALTER TABLE public.osc_perfis
      ADD CONSTRAINT uq_osc_perfis_certificado_numero UNIQUE (certificado_numero);
  END IF;
END;
$$;

-- ── 13. Status aprovado no relatorio -> seal no osc_perfis ─────────────
-- (já coberto pela função assinar_relatorio, mas também para aprovações manuais)
CREATE OR REPLACE FUNCTION public.sync_selo_on_relatorio_aprovado()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF NEW.status = 'aprovado' AND OLD.status <> 'aprovado' THEN
    UPDATE public.osc_perfis
    SET status_selo        = 'aprovado',
        certificado_emitido_at = COALESCE(certificado_emitido_at, now()),
        updated_at         = now()
    WHERE osc_id = NEW.osc_id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_selo ON public.relatorios_conformidade;
CREATE TRIGGER trg_sync_selo
  AFTER UPDATE ON public.relatorios_conformidade
  FOR EACH ROW EXECUTE FUNCTION public.sync_selo_on_relatorio_aprovado();
