import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Validação básica para evitar erros silenciosos
const isConfigured = supabaseUrl && supabaseAnonKey;

if (!isConfigured) {
  console.warn("⚠️ Supabase Client: Chaves não detectadas no .env. Verifique sua configuração em .env ou .env.local.");
}

// Inicializa o cliente apenas se houver chaves para evitar crashes
export const supabase = isConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : { auth: { signInWithPassword: () => { throw new Error("Supabase não configurado. Adicione NEXT_PUBLIC_SUPABASE_URL no seu .env.local") } } } as any;
