"use client";

import { createBrowserClient } from "@supabase/ssr";

// Real Supabase project credentials as fallbacks
// The anon key is safe to include in client-side code (it's a NEXT_PUBLIC_ variable)
const FALLBACK_SUPABASE_URL = "https://htwxqoklsnyezddgmika.supabase.co";
const FALLBACK_SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh0d3hxb2tsc255ZXpkZGdtaWthIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkwNTU4NzcsImV4cCI6MjA5NDYzMTg3N30.NVw6PlG3gc3ISTlvv2xnEU1XksVTBqQELaT0m4A8oHA";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || FALLBACK_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || FALLBACK_SUPABASE_ANON_KEY;

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
