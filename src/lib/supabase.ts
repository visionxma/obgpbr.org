import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Supabase: variáveis de ambiente não encontradas. Verifique .env.local.');
}

// createBrowserClient armazena a sessão em cookies (compartilhados com o middleware SSR)
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);
