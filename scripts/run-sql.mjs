#!/usr/bin/env node
/**
 * Executa um arquivo SQL no Supabase via service_role key + função RPC exec_sql.
 *
 * Uso:
 *   node scripts/run-sql.mjs supabase-sqls/arquivo.sql
 *   node scripts/run-sql.mjs supabase-sqls/*.sql
 *
 * Pré-requisitos:
 *   1. .env.local na raiz com NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY
 *      (rode `vercel env pull .env.local` para baixar do Vercel)
 *   2. Função exec_sql criada uma vez via Supabase SQL Editor
 *      (rode `supabase-sqls/_setup-exec-sql.sql` lá uma única vez)
 */
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { config as loadEnv } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

loadEnv({ path: resolve(process.cwd(), '.env.local') });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error('❌ Defina NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY em .env.local');
  console.error('   Rode: vercel env pull .env.local');
  process.exit(1);
}

const files = process.argv.slice(2);
if (files.length === 0) {
  console.error('Uso: node scripts/run-sql.mjs <arquivo.sql> [outro.sql ...]');
  process.exit(1);
}

const supabase = createClient(url, key, {
  auth: { autoRefreshToken: false, persistSession: false },
});

let okCount = 0;
let failCount = 0;

for (const file of files) {
  const path = resolve(process.cwd(), file);
  if (!existsSync(path)) {
    console.error(`⚠️  Arquivo não encontrado: ${file}`);
    failCount++;
    continue;
  }
  const sql = readFileSync(path, 'utf8');
  process.stdout.write(`▶  Executando ${file} ... `);

  const { error } = await supabase.rpc('exec_sql', { query: sql });

  if (error) {
    console.log('❌');
    if (error.message?.includes('exec_sql') || error.code === 'PGRST202') {
      console.error('   A função exec_sql ainda não existe no banco.');
      console.error('   Rode UMA VEZ o SQL em: supabase-sqls/_setup-exec-sql.sql');
      console.error('   pelo SQL Editor do Supabase Dashboard, depois tente novamente.');
    } else {
      console.error(`   ${error.message}`);
    }
    failCount++;
  } else {
    console.log('✅');
    okCount++;
  }
}

console.log(`\n${okCount} sucesso(s), ${failCount} falha(s).`);
process.exit(failCount > 0 ? 1 : 0);
