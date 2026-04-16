// Supabase client wrapper
// Configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error(
    '[Supabase] Variáveis de ambiente ausentes!\n' +
    'Crie um arquivo .env na raiz do projeto com:\n' +
    '  VITE_SUPABASE_URL=https://seu-projeto.supabase.co\n' +
    '  VITE_SUPABASE_ANON_KEY=sua-chave-anon'
  )
}

export const supabase = createClient(SUPABASE_URL ?? 'http://localhost', SUPABASE_ANON_KEY ?? 'placeholder')

// Note: keep keys safe; for production use a proper server-side auth.