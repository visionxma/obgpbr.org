-- =============================================================
-- SETUP ÚNICO — habilita execução automática de SQL via service_role
-- Execute este arquivo UMA VEZ no Supabase SQL Editor.
-- Depois disso, `npm run db:exec arquivo.sql` funcionará automaticamente.
-- =============================================================

-- Função que executa SQL arbitrário com privilégios de superusuário.
-- ⚠️ Acessível apenas pela role 'service_role' (não pela anon nem authenticated).
CREATE OR REPLACE FUNCTION public.exec_sql(query text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  EXECUTE query;
END;
$$;

-- Revoga acesso público e libera apenas para o service_role
REVOKE ALL ON FUNCTION public.exec_sql(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.exec_sql(text) FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.exec_sql(text) TO service_role;

COMMENT ON FUNCTION public.exec_sql(text) IS
  'Executa SQL arbitrário. Acesso restrito ao service_role (server-side apenas).';
