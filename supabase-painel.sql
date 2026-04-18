-- ═══════════════════════════════════════════════
-- OBGP — Painel do Usuário (Etapa 2)
-- Execute no Supabase SQL Editor
-- ═══════════════════════════════════════════════

-- ── Perfil da OSC (um por usuário) ──────────────

create table if not exists public.osc_perfis (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid references auth.users(id) on delete cascade unique not null,
  osc_id         text unique not null,
  razao_social   text,
  cnpj           text,
  responsavel    text,
  telefone       text,
  municipio      text,
  estado         char(2),
  status_selo    text not null default 'pendente'
                   check (status_selo in ('pendente','em_analise','aprovado','rejeitado')),
  observacao_selo text,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

alter table public.osc_perfis enable row level security;

drop policy if exists "osc_perfis: user select own" on public.osc_perfis;
drop policy if exists "osc_perfis: user insert own" on public.osc_perfis;
drop policy if exists "osc_perfis: user update own" on public.osc_perfis;

create policy "osc_perfis: user select own"
  on public.osc_perfis for select using (auth.uid() = user_id);

create policy "osc_perfis: user insert own"
  on public.osc_perfis for insert with check (auth.uid() = user_id);

create policy "osc_perfis: user update own"
  on public.osc_perfis for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ── Documentos da OSC ───────────────────────────

create table if not exists public.osc_documentos (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid references auth.users(id) on delete cascade not null,
  osc_id         text not null,
  nome           text not null,
  tipo           text not null default 'outro',
  arquivo_url    text,
  tamanho_bytes  bigint,
  status         text not null default 'enviado'
                   check (status in ('enviado','aprovado','rejeitado','pendente')),
  observacao     text,
  created_at     timestamptz not null default now()
);

alter table public.osc_documentos enable row level security;

drop policy if exists "osc_documentos: user manage own" on public.osc_documentos;

create policy "osc_documentos: user manage own"
  on public.osc_documentos for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ── Prestação de Contas ─────────────────────────

create table if not exists public.osc_prestacao_contas (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid references auth.users(id) on delete cascade not null,
  osc_id         text not null,
  titulo         text not null,
  periodo        text,
  valor_total    numeric(15,2),
  arquivo_url    text,
  status         text not null default 'pendente'
                   check (status in ('pendente','em_analise','aprovada','rejeitada')),
  observacao     text,
  created_at     timestamptz not null default now()
);

alter table public.osc_prestacao_contas enable row level security;

drop policy if exists "osc_prestacao_contas: user manage own" on public.osc_prestacao_contas;

create policy "osc_prestacao_contas: user manage own"
  on public.osc_prestacao_contas for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ── Formulários ─────────────────────────────────

create table if not exists public.osc_formularios (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid references auth.users(id) on delete cascade not null,
  osc_id         text not null,
  titulo         text not null,
  tipo           text not null,
  status         text not null default 'nao_iniciado'
                   check (status in ('nao_iniciado','em_andamento','concluido')),
  dados          jsonb not null default '{}',
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

alter table public.osc_formularios enable row level security;

drop policy if exists "osc_formularios: user manage own" on public.osc_formularios;

create policy "osc_formularios: user manage own"
  on public.osc_formularios for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ── Storage: caminho para uploads de usuários ───
-- Bucket 'documents' já existe.
-- O path seguirá: osc/{osc_id}/{tipo}/{timestamp}.ext
-- Nenhuma nova policy de storage é necessária (autenticados já podem fazer upload).
