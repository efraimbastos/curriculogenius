// src/lib/supabaseClient.ts
import { createBrowserClient } from '@supabase/ssr'

// Define a function to create a Supabase client for client-side operations
export function createClient() {
  // Pass Supabase URL and anonymous key from environment variables
  // IMPORTANT: These variables need to be exposed client-side
  // In Next.js, prefix them with NEXT_PUBLIC_
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

