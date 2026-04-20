-- ═══════════════════════════════════════════════
-- OBGP — Atualização de Colunas do Relatório Contínuo
-- Execute no seu Supabase SQL Editor
-- ═══════════════════════════════════════════════

-- Adicionando a coluna `arquivo_docx_path` se não existir para vincular os relatórios DOCX gerados
-- à nuvem oficial (Storage 'osc-docs')
ALTER TABLE public.relatorios_conformidade 
ADD COLUMN IF NOT EXISTS arquivo_docx_path text;

-- Garanta que Storage policy para inserção permita uploads ao diretório do Supabase `osc-docs`
-- Caso ainda não exista:
INSERT INTO storage.buckets (id, name, public) 
VALUES ('osc-docs', 'osc-docs', true) 
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public access to osc-docs" ON storage.objects;
CREATE POLICY "Public access to osc-docs" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'osc-docs');

DROP POLICY IF EXISTS "Authenticated users upload directly to osc-docs" ON storage.objects;
CREATE POLICY "Authenticated users upload directly to osc-docs" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'osc-docs' AND auth.role() = 'authenticated');
