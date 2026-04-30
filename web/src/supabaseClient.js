import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.SUPABASE_URL ?? import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.SUPABASE_ANON_KEY ?? import.meta.env.VITE_SUPABASE_ANON_KEY

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)

export const supabaseConfigurationError = isSupabaseConfigured
  ? ''
  : 'Supabase is not configured. Set SUPABASE_URL and SUPABASE_ANON_KEY in your frontend environment.'

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
      },
    })
  : null
