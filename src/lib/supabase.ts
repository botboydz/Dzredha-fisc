import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

// Lazy-initialize Supabase client only when env vars are configured
let _supabase: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (!_supabase && supabaseUrl && supabaseAnonKey) {
    _supabase = createClient(supabaseUrl, supabaseAnonKey);
  }
  if (!_supabase) {
    throw new Error("Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local");
  }
  return _supabase;
}

// For convenience — use only when you know Supabase is configured
export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : (null as unknown as ReturnType<typeof createClient>);

// Type helpers for our database tables
export interface Company {
  id: string;
  name: string;
  name_ar: string | null;
  nif: string;
  nis: string | null;
  ai: string | null;
  rc: string | null;
  address: string | null;
  wilaya: string | null;
  activity_type: string | null;
  tax_regime: string | null;
  created_at: string;
  updated_at: string;
}

export interface TaxObligation {
  id: string;
  company_id: string;
  tax_type: "TAP" | "TVA" | "IBS" | "IRG";
  period: string;
  rate: number;
  base_amount: number;
  tax_amount: number;
  paid_amount: number;
  status: "pending" | "paid" | "overdue";
  due_date: string;
  paid_at: string | null;
  declaration_number: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Employee {
  id: string;
  company_id: string;
  name: string;
  name_ar: string | null;
  role: string | null;
  salary: number;
  cnas_employer_rate: number;
  cnas_employee_rate: number;
  casnos_rate: number;
  start_date: string | null;
  status: "active" | "inactive";
  created_at: string;
  updated_at: string;
}

export interface SocialContribution {
  id: string;
  company_id: string;
  contribution_type: "CNAS" | "CASNOS";
  period: string;
  total_salary_base: number;
  employer_amount: number;
  employee_amount: number;
  total_amount: number;
  status: "pending" | "paid" | "overdue";
  due_date: string;
  paid_at: string | null;
  bordereau_number: string | null;
  created_at: string;
  updated_at: string;
}

export interface Deadline {
  id: string;
  company_id: string;
  title: string;
  title_ar: string | null;
  deadline_date: string;
  deadline_type: "tax" | "social" | "filing";
  urgency: "overdue" | "urgent" | "soon" | "normal";
  status: "pending" | "done" | "overdue";
  amount: number | null;
  related_obligation_id: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Declaration {
  id: string;
  company_id: string;
  tax_type: string;
  period: string;
  form_data: Record<string, unknown>;
  pdf_url: string | null;
  status: "draft" | "generated" | "submitted";
  created_at: string;
  updated_at: string;
}

// Check if Supabase is configured
export const isSupabaseConfigured = (): boolean => {
  return supabaseUrl.length > 0 && supabaseAnonKey.length > 0;
};

// Re-export browser client from new supabase module for convenience
// Note: Import directly from "@/lib/supabase/client" or "@/lib/supabase/server" as needed.
// Server client uses "next/headers" and must only be imported in server code.
