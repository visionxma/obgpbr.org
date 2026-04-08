-- ============================================================
-- INSTITUTO GÊNESIS EDUCACIONAL — Supabase Setup SQL
-- Execute este arquivo no SQL Editor do Supabase:
-- Dashboard → SQL Editor → New Query → Cole e execute
-- ============================================================

-- 1. Cria a tabela de registros de transparência
CREATE TABLE IF NOT EXISTS transparency_records (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  proponente      text,
  parlamentar     text,
  modalidade      text,
  objeto          text,
  orgao_concedente text,
  num_instrumento  text,
  num_emenda       text,
  ano_emenda       text,
  valor            text,
  valor_emenda     text,
  prestacao_contas text,
  pdf_url          text,
  created_at       timestamptz DEFAULT now()
);

-- Se a tabela já existe, adicione a coluna pdf_url:
ALTER TABLE transparency_records ADD COLUMN IF NOT EXISTS pdf_url text;

-- 2. Habilita RLS
ALTER TABLE transparency_records ENABLE ROW LEVEL SECURITY;

-- 2b. Cria o bucket 'documents' para armazenar PDFs
INSERT INTO storage.buckets (id, name, public) VALUES ('documents', 'documents', true) ON CONFLICT (id) DO NOTHING;

-- Política de leitura pública para o bucket documents
DROP POLICY IF EXISTS "Public read documents" ON storage.objects;
CREATE POLICY "Public read documents"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'documents');

-- Política de upload para usuários autenticados
DROP POLICY IF EXISTS "Authenticated upload documents" ON storage.objects;
CREATE POLICY "Authenticated upload documents"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'documents');

-- Política de delete para usuários autenticados
DROP POLICY IF EXISTS "Authenticated delete documents" ON storage.objects;
CREATE POLICY "Authenticated delete documents"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'documents');

-- 3. Qualquer visitante pode LER (página pública)
DROP POLICY IF EXISTS "Public read transparency_records" ON transparency_records;
CREATE POLICY "Public read transparency_records"
  ON transparency_records FOR SELECT
  USING (true);

-- 4. Apenas usuários autenticados (admin) podem ESCREVER
DROP POLICY IF EXISTS "Authenticated write transparency_records" ON transparency_records;
CREATE POLICY "Authenticated write transparency_records"
  ON transparency_records FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ============================================================
-- 5. Tabela: experiences (Nossas Experiências)
-- ============================================================
CREATE TABLE IF NOT EXISTS experiences (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title         text NOT NULL,
  description   text,
  image_url     text,
  location      text,
  date          text,
  is_published  boolean DEFAULT true,
  created_at    timestamptz DEFAULT now()
);

ALTER TABLE experiences ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read experiences" ON experiences;
CREATE POLICY "Public read experiences"
  ON experiences FOR SELECT
  USING (is_published = true);

DROP POLICY IF EXISTS "Authenticated read all experiences" ON experiences;
CREATE POLICY "Authenticated read all experiences"
  ON experiences FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Authenticated write experiences" ON experiences;
CREATE POLICY "Authenticated write experiences"
  ON experiences FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);
