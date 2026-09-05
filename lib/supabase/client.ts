import { createBrowserClient } from '@supabase/ssr'

/**
 * Supabase client for use in Client Components ('use client').
 * Creates one instance per call — call this inside components/hooks.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
