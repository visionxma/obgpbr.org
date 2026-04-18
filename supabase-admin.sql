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
