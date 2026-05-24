"use client";

import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

// Singleton browser client — prevents "Multiple GoTrueClient instances" warning
let _client: ReturnType<typeof createBrowserClient> | null = null;

export function getSupabaseBrowserClient() {
  if (!_client && isSupabaseConfigured()) {
    _client = createBrowserClient(supabaseUrl, supabaseAnonKey);
  }
  return _client;
}

// For convenience — alias
export const createClient = getSupabaseBrowserClient;

export function isSupabaseConfigured(): boolean {
  // Must have a non-empty URL that actually looks like a Supabase project URL
  // and a key that's long enough to be a real JWT (placeholder keys are short)
  const urlValid = supabaseUrl.length > 0 && supabaseUrl.includes(".supabase.co");
  const keyValid = supabaseAnonKey.length > 80 && supabaseAnonKey.startsWith("eyJ");
  return urlValid && keyValid;
}
