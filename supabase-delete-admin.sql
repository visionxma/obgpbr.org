-- ═══════════════════════════════════════════════
-- OBGP — Admin Delete Policies
-- Permite que administradores operem o "Esvaziar Lixeira"
-- ou excluir individualmente sem serem bloqueados pelo RLS.
-- Execute no Supabase SQL Editor
-- ═══════════════════════════════════════════════

-- Políticas de DELETE para admin nas tabelas dependentes
DROP POLICY IF EXISTS "admin: delete all osc_documentos" ON public.osc_documentos;
CREATE POLICY "admin: delete all osc_documentos" ON public.osc_documentos FOR DELETE USING ((auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin', 'superadmin'));

DROP POLICY IF EXISTS "admin: delete all notificacoes" ON public.notificacoes;
CREATE POLICY "admin: delete all notificacoes" ON public.notificacoes FOR DELETE USING ((auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin', 'superadmin'));

DROP POLICY IF EXISTS "admin: delete all certificacao_pagamentos" ON public.certificacao_pagamentos;
CREATE POLICY "admin: delete all certificacao_pagamentos" ON public.certificacao_pagamentos FOR DELETE USING ((auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin', 'superadmin'));

DROP POLICY IF EXISTS "admin: delete all relatorios_conformidade" ON public.relatorios_conformidade;
CREATE POLICY "admin: delete all relatorios_conformidade" ON public.relatorios_conformidade FOR DELETE USING ((auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin', 'superadmin'));

DROP POLICY IF EXISTS "admin: delete all osc_prestacao_contas" ON public.osc_prestacao_contas;
CREATE POLICY "admin: delete all osc_prestacao_contas" ON public.osc_prestacao_contas FOR DELETE USING ((auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin', 'superadmin'));

DROP POLICY IF EXISTS "admin: delete all osc_formularios" ON public.osc_formularios;
CREATE POLICY "admin: delete all osc_formularios" ON public.osc_formularios FOR DELETE USING ((auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin', 'superadmin'));

-- Por fim, permissão de exclusão da raiz
DROP POLICY IF EXISTS "admin: delete all osc_perfis" ON public.osc_perfis;
CREATE POLICY "admin: delete all osc_perfis" ON public.osc_perfis FOR DELETE USING ((auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin', 'superadmin'));
