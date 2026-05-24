"use client";

import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

// Singleton browser client — prevents "Multiple GoTrueClient instances" warning
let _client: ReturnType<typeof createBrowserClient> | null = null;

export function getSupabaseBrowserClient() {
  if (!_client && supabaseUrl && supabaseAnonKey) {
    _client = createBrowserClient(supabaseUrl, supabaseAnonKey);
  }
  return _client;
}

// For convenience — alias
export const createClient = getSupabaseBrowserClient;

export function isSupabaseConfigured(): boolean {
  return supabaseUrl.length > 0 && supabaseAnonKey.length > 0;
}
