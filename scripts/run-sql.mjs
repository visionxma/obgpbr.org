#!/usr/bin/env node
/**
 * Executa um arquivo SQL no Supabase via connection string.
 *
 * Uso:
 *   node scripts/run-sql.mjs supabase-sqls/arquivo.sql
 *   node scripts/run-sql.mjs supabase-sqls/*.sql
 *
 * Pré-requisitos:
 *   1. .env.local na raiz do projeto contendo:
 *      SUPABASE_DB_URL=postgresql://postgres.<ref>:<senha>@<host>:<port>/postgres?sslmode=require
 *      (encontrar em Supabase Dashboard → Settings → Database → Connection string → URI)
 *   2. npm install pg dotenv (já configurado neste projeto se rodar npm install)
 */
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { config as loadEnv } from 'dotenv';
import pg from 'pg';

// carrega .env.local
loadEnv({ path: resolve(process.cwd(), '.env.local') });

const url = process.env.SUPABASE_DB_URL;
if (!url) {
  console.error('❌ Defina SUPABASE_DB_URL no arquivo .env.local');
  console.error('   Veja .env.local.example para o formato.');
  process.exit(1);
}

const files = process.argv.slice(2);
if (files.length === 0) {
  console.error('Uso: node scripts/run-sql.mjs <arquivo.sql> [outro.sql ...]');
  process.exit(1);
}

const client = new pg.Client({ connectionString: url });
await client.connect();

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
  try {
    await client.query(sql);
    console.log('✅');
    okCount++;
  } catch (err) {
    console.log('❌');
    console.error(`   ${err.message}`);
    failCount++;
  }
}

await client.end();

console.log(`\n${okCount} sucesso(s), ${failCount} falha(s).`);
process.exit(failCount > 0 ? 1 : 0);
