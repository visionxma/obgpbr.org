-- ═══════════════════════════════════════════════
-- OBGP — Admin Panel (Etapa 3)
-- Execute no Supabase SQL Editor
-- ═══════════════════════════════════════════════

-- ── Políticas de leitura total para admin ────

-- osc_perfis
DROP POLICY IF EXISTS "admin: select all osc_perfis" ON public.osc_perfis;
CREATE POLICY "admin: select all osc_perfis"
  ON public.osc_perfis FOR SELECT
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

DROP POLICY IF EXISTS "admin: update all osc_perfis" ON public.osc_perfis;
CREATE POLICY "admin: update all osc_perfis"
  ON public.osc_perfis FOR UPDATE
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- osc_documentos
DROP POLICY IF EXISTS "admin: select all osc_documentos" ON public.osc_documentos;
CREATE POLICY "admin: select all osc_documentos"
  ON public.osc_documentos FOR SELECT
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

DROP POLICY IF EXISTS "admin: update all osc_documentos" ON public.osc_documentos;
CREATE POLICY "admin: update all osc_documentos"
  ON public.osc_documentos FOR UPDATE
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- osc_prestacao_contas
DROP POLICY IF EXISTS "admin: select all osc_prestacao_contas" ON public.osc_prestacao_contas;
CREATE POLICY "admin: select all osc_prestacao_contas"
  ON public.osc_prestacao_contas FOR SELECT
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

DROP POLICY IF EXISTS "admin: update all osc_prestacao_contas" ON public.osc_prestacao_contas;
CREATE POLICY "admin: update all osc_prestacao_contas"
  ON public.osc_prestacao_contas FOR UPDATE
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- osc_formularios
DROP POLICY IF EXISTS "admin: select all osc_formularios" ON public.osc_formularios;
CREATE POLICY "admin: select all osc_formularios"
  ON public.osc_formularios FOR SELECT
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- ── Políticas públicas — Lei 13.019/2014, Art. 11 (Portal da Transparência) ────

-- Perfis de OSCs aprovadas são visíveis publicamente para controle social
DROP POLICY IF EXISTS "public: select approved osc_perfis" ON public.osc_perfis;
CREATE POLICY "public: select approved osc_perfis"
  ON public.osc_perfis FOR SELECT
  USING (status_selo = 'aprovado');

-- Formulários concluídos (cadastramento e relatório de atividades) de OSCs aprovadas são públicos
DROP POLICY IF EXISTS "public: select osc_formularios concluidos" ON public.osc_formularios;
CREATE POLICY "public: select osc_formularios concluidos"
  ON public.osc_formularios FOR SELECT
  USING (
    status = 'concluido'
    AND tipo IN ('cadastramento', 'relatorio_atividades')
    AND EXISTS (
      SELECT 1 FROM public.osc_perfis p
      WHERE p.osc_id = osc_formularios.osc_id
        AND p.status_selo = 'aprovado'
    )
  );

-- Prestações de contas aprovadas de OSCs certificadas são públicas
DROP POLICY IF EXISTS "public: select osc_prestacao_contas aprovadas" ON public.osc_prestacao_contas;
CREATE POLICY "public: select osc_prestacao_contas aprovadas"
  ON public.osc_prestacao_contas FOR SELECT
  USING (
    status = 'aprovada'
    AND EXISTS (
      SELECT 1 FROM public.osc_perfis p
      WHERE p.osc_id = osc_prestacao_contas.osc_id
        AND p.status_selo = 'aprovado'
    )
  );
