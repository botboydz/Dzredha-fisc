"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getSupabase,
  isSupabaseConfigured,
  type TaxObligation,
  type Employee,
  type Deadline,
} from "@/lib/supabase";

/* ------------------------------------------------------------------ */
/*  Mock data fallback (used when Supabase is not connected)           */
/* ------------------------------------------------------------------ */

const mockTaxObligations: TaxObligation[] = [
  {
    id: "TAP-2026-M05",
    company_id: "demo",
    tax_type: "TAP",
    period: "Mai 2026",
    rate: 1.0,
    base_amount: 14500000,
    tax_amount: 145000,
    paid_amount: 0,
    status: "pending",
    due_date: "2026-05-20",
    paid_at: null,
    declaration_number: null,
    notes: null,
    created_at: "",
    updated_at: "",
  },
  {
    id: "TVA-2026-M05",
    company_id: "demo",
    tax_type: "TVA",
    period: "Mai 2026",
    rate: 19.0,
    base_amount: 14500000,
    tax_amount: 2755000,
    paid_amount: 0,
    status: "pending",
    due_date: "2026-05-20",
    paid_at: null,
    declaration_number: null,
    notes: null,
    created_at: "",
    updated_at: "",
  },
  {
    id: "IBS-2026-Q1",
    company_id: "demo",
    tax_type: "IBS",
    period: "T1 2026",
    rate: 19.0,
    base_amount: 9737000,
    tax_amount: 1850000,
    paid_amount: 1850000,
    status: "paid",
    due_date: "2026-04-30",
    paid_at: "2026-04-28T00:00:00Z",
    declaration_number: null,
    notes: null,
    created_at: "",
    updated_at: "",
  },
  {
    id: "IRG-2026-M05",
    company_id: "demo",
    tax_type: "IRG",
    period: "Mai 2026",
    rate: 0,
    base_amount: 575000,
    tax_amount: 89000,
    paid_amount: 0,
    status: "pending",
    due_date: "2026-05-20",
    paid_at: null,
    declaration_number: null,
    notes: null,
    created_at: "",
    updated_at: "",
  },
  {
    id: "TAP-2026-M04",
    company_id: "demo",
    tax_type: "TAP",
    period: "Avril 2026",
    rate: 1.0,
    base_amount: 13200000,
    tax_amount: 132000,
    paid_amount: 132000,
    status: "paid",
    due_date: "2026-04-20",
    paid_at: "2026-04-19T00:00:00Z",
    declaration_number: null,
    notes: null,
    created_at: "",
    updated_at: "",
  },
  {
    id: "TVA-2026-M04",
    company_id: "demo",
    tax_type: "TVA",
    period: "Avril 2026",
    rate: 19.0,
    base_amount: 13053000,
    tax_amount: 2480000,
    paid_amount: 2480000,
    status: "paid",
    due_date: "2026-04-20",
    paid_at: "2026-04-19T00:00:00Z",
    declaration_number: null,
    notes: null,
    created_at: "",
    updated_at: "",
  },
];

const mockEmployees: Employee[] = [
  { id: "E001", company_id: "demo", name: "محمد بن أحمد", name_ar: "محمد بن أحمد", role: "Ingénieur", salary: 85000, cnas_employer_rate: 26, cnas_employee_rate: 9, casnos_rate: 0, start_date: null, status: "active", created_at: "", updated_at: "" },
  { id: "E002", company_id: "demo", name: "Karim Bouzid", name_ar: "كريم بوزيد", role: "Comptable", salary: 65000, cnas_employer_rate: 26, cnas_employee_rate: 9, casnos_rate: 0, start_date: null, status: "active", created_at: "", updated_at: "" },
  { id: "E003", company_id: "demo", name: "فاطمة الزهراء", name_ar: "فاطمة الزهراء", role: "Responsable RH", salary: 75000, cnas_employer_rate: 26, cnas_employee_rate: 9, casnos_rate: 0, start_date: null, status: "active", created_at: "", updated_at: "" },
  { id: "E004", company_id: "demo", name: "Amine Khelifi", name_ar: "أمين خليفي", role: "Développeur", salary: 95000, cnas_employer_rate: 26, cnas_employee_rate: 9, casnos_rate: 0, start_date: null, status: "active", created_at: "", updated_at: "" },
  { id: "E005", company_id: "demo", name: "سعاد مرابط", name_ar: "سعاد مرابط", role: "Assistante", salary: 45000, cnas_employer_rate: 26, cnas_employee_rate: 9, casnos_rate: 0, start_date: null, status: "active", created_at: "", updated_at: "" },
  { id: "E006", company_id: "demo", name: "ياسين حداد", name_ar: "ياسين حداد", role: "Chef de projet", salary: 110000, cnas_employer_rate: 26, cnas_employee_rate: 9, casnos_rate: 0, start_date: null, status: "active", created_at: "", updated_at: "" },
];

const mockDeadlines: Deadline[] = [
  { id: "D1", company_id: "demo", title: "Déclaration TAP — Mai 2026", title_ar: "تصريح ض.م.م — ماي 2026", deadline_date: "2026-05-20", deadline_type: "tax", urgency: "urgent", status: "pending", amount: 145000, related_obligation_id: null, notes: null, created_at: "", updated_at: "" },
  { id: "D2", company_id: "demo", title: "Déclaration TVA — Mai 2026", title_ar: "تصريح ر.ق — ماي 2026", deadline_date: "2026-05-20", deadline_type: "tax", urgency: "urgent", status: "pending", amount: 2755000, related_obligation_id: null, notes: null, created_at: "", updated_at: "" },
  { id: "D3", company_id: "demo", title: "Déclaration IRG — Mai 2026", title_ar: "تصريح ض.د.ع — ماي 2026", deadline_date: "2026-05-20", deadline_type: "tax", urgency: "urgent", status: "pending", amount: 89000, related_obligation_id: null, notes: null, created_at: "", updated_at: "" },
  { id: "D4", company_id: "demo", title: "Cotisations CNAS — Mai 2026", title_ar: "اشتراكات ص.و.ت.ش — ماي 2026", deadline_date: "2026-05-31", deadline_type: "social", urgency: "soon", status: "pending", amount: 201250, related_obligation_id: null, notes: null, created_at: "", updated_at: "" },
  { id: "D5", company_id: "demo", title: "Versement IBS — T2 2026", title_ar: "أداء ض.أ.ش — ت2 2026", deadline_date: "2026-06-30", deadline_type: "tax", urgency: "normal", status: "pending", amount: 1850000, related_obligation_id: null, notes: null, created_at: "", updated_at: "" },
  { id: "D6", company_id: "demo", title: "Liasse fiscale annuelle 2025", title_ar: "الملف الجبائي السنوي 2025", deadline_date: "2026-04-30", deadline_type: "filing", urgency: "overdue", status: "overdue", amount: null, related_obligation_id: null, notes: null, created_at: "", updated_at: "" },
  { id: "D7", company_id: "demo", title: "Déclaration TVA — Juin 2026", title_ar: "تصريح ر.ق — جوان 2026", deadline_date: "2026-06-20", deadline_type: "tax", urgency: "normal", status: "pending", amount: 2500000, related_obligation_id: null, notes: null, created_at: "", updated_at: "" },
];

/* ------------------------------------------------------------------ */
/*  Custom Hook: useDZFiscData                                         */
/*  Fetches data from Supabase if configured, else uses mock data      */
/* ------------------------------------------------------------------ */

const DEMO_COMPANY_ID = "c0000000-0000-0000-0000-000000000001";

export function useDZFiscData() {
  const [taxObligations, setTaxObligations] = useState<TaxObligation[]>(mockTaxObligations);
  const [employees, setEmployees] = useState<Employee[]>(mockEmployees);
  const [deadlines, setDeadlines] = useState<Deadline[]>(mockDeadlines);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const fetchData = useCallback(async () => {
    if (!isSupabaseConfigured()) {
      setIsConnected(false);
      return;
    }

    setIsLoading(true);
    try {
      const [taxRes, empRes, dlRes] = await Promise.all([
        getSupabase()
          .from("tax_obligations")
          .select("*")
          .eq("company_id", DEMO_COMPANY_ID)
          .order("due_date", { ascending: false }),
        getSupabase()
          .from("employees")
          .select("*")
          .eq("company_id", DEMO_COMPANY_ID)
          .eq("status", "active"),
        getSupabase()
          .from("deadlines")
          .select("*")
          .eq("company_id", DEMO_COMPANY_ID)
          .order("deadline_date", { ascending: true }),
      ]);

      if (taxRes.error) throw taxRes.error;
      if (empRes.error) throw empRes.error;
      if (dlRes.error) throw dlRes.error;

      if (taxRes.data && taxRes.data.length > 0) setTaxObligations(taxRes.data);
      if (empRes.data && empRes.data.length > 0) setEmployees(empRes.data);
      if (dlRes.data && dlRes.data.length > 0) setDeadlines(dlRes.data);

      setIsConnected(true);
    } catch (err) {
      console.error("Supabase fetch error, using mock data:", err);
      setIsConnected(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Mark a tax obligation as paid
  const markAsPaid = useCallback(
    async (id: string) => {
      // Optimistic update
      setTaxObligations((prev) =>
        prev.map((t) =>
          t.id === id
            ? { ...t, status: "paid" as const, paid_amount: t.tax_amount, paid_at: new Date().toISOString() }
            : t
        )
      );

      if (isSupabaseConfigured()) {
        try {
          const { error } = await getSupabase()
            .from("tax_obligations")
            .update({
              status: "paid",
              paid_amount: 0, // will be set from current tax_amount
              paid_at: new Date().toISOString(),
            })
            .eq("id", id);

          if (error) throw error;
        } catch (err) {
          console.error("Failed to update in Supabase:", err);
          // Revert optimistic update
          fetchData();
        }
      }
    },
    [fetchData]
  );

  // Mark a deadline as done
  const markDeadlineDone = useCallback(
    async (id: string) => {
      setDeadlines((prev) =>
        prev.map((d) => (d.id === id ? { ...d, status: "done" as const } : d))
      );

      if (isSupabaseConfigured()) {
        try {
          const { error } = await getSupabase()
            .from("deadlines")
            .update({ status: "done" })
            .eq("id", id);

          if (error) throw error;
        } catch (err) {
          console.error("Failed to update in Supabase:", err);
          fetchData();
        }
      }
    },
    [fetchData]
  );

  return {
    taxObligations,
    employees,
    deadlines,
    isConnected,
    isLoading,
    markAsPaid,
    markDeadlineDone,
    refetch: fetchData,
  };
}
