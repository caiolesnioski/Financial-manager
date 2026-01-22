// Supabase client wrapper
// Configure SUPABASE_URL and SUPABASE_ANON_KEY in .env.local
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || ''
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// Note: keep keys safe; for production use a proper server-side auth.