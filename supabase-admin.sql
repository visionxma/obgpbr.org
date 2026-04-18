-- ═══════════════════════════════════════════════
-- OBGP — Admin Panel (Etapa 3)
-- Execute no Supabase SQL Editor
-- ═══════════════════════════════════════════════

-- ── 1. Defina o role=admin para o usuário admin ─

-- Substitua o email abaixo pelo email do administrador
-- UPDATE auth.users
-- SET raw_app_meta_data = raw_app_meta_data || '{"role": "admin"}'::jsonb
-- WHERE email = 'seu-admin@email.com';

-- ── 2. Políticas de leitura total para admin ────

-- osc_perfis
CREATE POLICY IF NOT EXISTS "admin: select all osc_perfis"
  ON public.osc_perfis FOR SELECT
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

CREATE POLICY IF NOT EXISTS "admin: update all osc_perfis"
  ON public.osc_perfis FOR UPDATE
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- osc_documentos
CREATE POLICY IF NOT EXISTS "admin: select all osc_documentos"
  ON public.osc_documentos FOR SELECT
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

CREATE POLICY IF NOT EXISTS "admin: update all osc_documentos"
  ON public.osc_documentos FOR UPDATE
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- osc_prestacao_contas
CREATE POLICY IF NOT EXISTS "admin: select all osc_prestacao_contas"
  ON public.osc_prestacao_contas FOR SELECT
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

CREATE POLICY IF NOT EXISTS "admin: update all osc_prestacao_contas"
  ON public.osc_prestacao_contas FOR UPDATE
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- osc_formularios
CREATE POLICY IF NOT EXISTS "admin: select all osc_formularios"
  ON public.osc_formularios FOR SELECT
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- ── 3. Verifique roles existentes (diagnóstico) ─

-- SELECT id, email,
--   raw_app_meta_data ->> 'role' AS role,
--   raw_user_meta_data ->> 'role'  AS user_role
-- FROM auth.users;
