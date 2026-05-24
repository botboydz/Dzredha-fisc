import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/**
 * Seed API Route — Populates the database with realistic test data
 *
 * Usage:
 *   POST /api/seed
 *   Headers: { "x-service-role-key": "<your-service-role-key>" }
 *
 * Or set SUPABASE_SERVICE_ROLE_KEY in .env.local
 *
 * Get the service_role key from:
 *   Supabase Dashboard → Settings → API → service_role key
 */

export async function POST(request: Request) {
  try {
    // Get service_role key from header or env
    const headerKey = request.headers.get("x-service-role-key");
    const envKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const serviceRoleKey = headerKey || envKey;

    if (!serviceRoleKey) {
      return NextResponse.json({
        error: "Service role key required",
        instructions: {
          method1: "Add SUPABASE_SERVICE_ROLE_KEY to .env.local",
          method2: "Pass via header: x-service-role-key",
          method3: "Run supabase/comprehensive-seed.sql in Supabase SQL Editor",
          dashboard: "Supabase Dashboard → Settings → API → service_role key",
        },
      }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://htwxqoklsnyezddgmika.supabase.co";

    // Create admin Supabase client with service_role key
    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const results: Record<string, unknown> = {};

    // Step 1: Clean up duplicate data
    const { error: dedupError } = await supabase.rpc("exec_sql", {
      sql: `
        DELETE FROM tax_obligations a USING tax_obligations b
        WHERE a.id > b.id AND a.company_id = b.company_id
        AND a.tax_type = b.tax_type AND a.period = b.period AND a.due_date = b.due_date;
      `,
    });

    // If RPC doesn't exist, we'll use REST API approach instead
    if (dedupError) {
      results.dedup_note = "RPC not available — dedup skipped, using REST approach";
    }

    // Step 2: Read existing data to check for duplicates before inserting
    const { data: existingTax } = await supabase
      .from("tax_obligations")
      .select("company_id, tax_type, period, due_date")
      .eq("company_id", "c0000000-0000-0000-0000-000000000001");

    const existingSet = new Set(
      (existingTax || []).map((t) => `${t.tax_type}|${t.period}|${t.due_date}`)
    );

    // Step 3: Insert new tax obligations (only if not duplicate)
    const newTaxObligations = [
      // January 2026
      { company_id: "c0000000-0000-0000-0000-000000000001", tax_type: "TAP", period: "2026-01", rate: 1.0, base_amount: 12500000, tax_amount: 125000, paid_amount: 125000, status: "paid", due_date: "2026-01-20", paid_at: "2026-01-19T00:00:00Z", declaration_number: "DEC-2026-001" },
      { company_id: "c0000000-0000-0000-0000-000000000001", tax_type: "TVA", period: "2026-01", rate: 19.0, base_amount: 12500000, tax_amount: 2375000, paid_amount: 2375000, status: "paid", due_date: "2026-01-20", paid_at: "2026-01-19T00:00:00Z", declaration_number: "DEC-2026-002" },
      { company_id: "c0000000-0000-0000-0000-000000000001", tax_type: "IRG", period: "2026-01", rate: 0, base_amount: 575000, tax_amount: 89000, paid_amount: 89000, status: "paid", due_date: "2026-01-20", paid_at: "2026-01-19T00:00:00Z", declaration_number: "DEC-2026-003" },
      // February 2026
      { company_id: "c0000000-0000-0000-0000-000000000001", tax_type: "TAP", period: "2026-02", rate: 1.0, base_amount: 11800000, tax_amount: 118000, paid_amount: 118000, status: "paid", due_date: "2026-02-20", paid_at: "2026-02-19T00:00:00Z", declaration_number: "DEC-2026-004" },
      { company_id: "c0000000-0000-0000-0000-000000000001", tax_type: "TVA", period: "2026-02", rate: 19.0, base_amount: 11800000, tax_amount: 2242000, paid_amount: 2242000, status: "paid", due_date: "2026-02-20", paid_at: "2026-02-19T00:00:00Z", declaration_number: "DEC-2026-005" },
      { company_id: "c0000000-0000-0000-0000-000000000001", tax_type: "IRG", period: "2026-02", rate: 0, base_amount: 575000, tax_amount: 89000, paid_amount: 89000, status: "paid", due_date: "2026-02-20", paid_at: "2026-02-19T00:00:00Z", declaration_number: "DEC-2026-006" },
      // March 2026
      { company_id: "c0000000-0000-0000-0000-000000000001", tax_type: "TAP", period: "2026-03", rate: 1.0, base_amount: 13200000, tax_amount: 132000, paid_amount: 132000, status: "paid", due_date: "2026-03-20", paid_at: "2026-03-19T00:00:00Z", declaration_number: "DEC-2026-007" },
      { company_id: "c0000000-0000-0000-0000-000000000001", tax_type: "TVA", period: "2026-03", rate: 19.0, base_amount: 13200000, tax_amount: 2508000, paid_amount: 2508000, status: "paid", due_date: "2026-03-20", paid_at: "2026-03-19T00:00:00Z", declaration_number: "DEC-2026-008" },
      { company_id: "c0000000-0000-0000-0000-000000000001", tax_type: "IRG", period: "2026-03", rate: 0, base_amount: 575000, tax_amount: 89000, paid_amount: 89000, status: "paid", due_date: "2026-03-20", paid_at: "2026-03-19T00:00:00Z", declaration_number: "DEC-2026-009" },
      // June 2026 (pending)
      { company_id: "c0000000-0000-0000-0000-000000000001", tax_type: "TAP", period: "2026-06", rate: 1.0, base_amount: 15200000, tax_amount: 152000, paid_amount: 0, status: "pending", due_date: "2026-06-20" },
      { company_id: "c0000000-0000-0000-0000-000000000001", tax_type: "TVA", period: "2026-06", rate: 19.0, base_amount: 15200000, tax_amount: 2888000, paid_amount: 0, status: "pending", due_date: "2026-06-20" },
      { company_id: "c0000000-0000-0000-0000-000000000001", tax_type: "IRG", period: "2026-06", rate: 0, base_amount: 575000, tax_amount: 89000, paid_amount: 0, status: "pending", due_date: "2026-06-20" },
      // Q2 2026 IBS
      { company_id: "c0000000-0000-0000-0000-000000000001", tax_type: "IBS", period: "2026-Q2", rate: 19.0, base_amount: 10200000, tax_amount: 1938000, paid_amount: 0, status: "pending", due_date: "2026-07-30" },
    ].filter((t) => !existingSet.has(`${t.tax_type}|${t.period}|${t.due_date}`));

    if (newTaxObligations.length > 0) {
      const { error: taxError } = await supabase.from("tax_obligations").insert(newTaxObligations);
      results.tax_obligations_inserted = taxError ? `Error: ${taxError.message}` : newTaxObligations.length;
    } else {
      results.tax_obligations_inserted = "0 (all already exist)";
    }

    // Step 4: Insert declarations
    const { data: existingDec } = await supabase
      .from("declarations")
      .select("tax_type, period")
      .eq("company_id", "c0000000-0000-0000-0000-000000000001");

    const existingDecSet = new Set(
      (existingDec || []).map((d) => `${d.tax_type}|${d.period}`)
    );

    const newDeclarations = [
      { company_id: "c0000000-0000-0000-0000-000000000001", tax_type: "TAP", period: "2026-05", form_data: { nif: "001216000123456", chiffre_affaires: 14500000, montant_tap: 145000 }, status: "draft" },
      { company_id: "c0000000-0000-0000-0000-000000000001", tax_type: "TVA", period: "2026-05", form_data: { nif: "001216000123456", tva_collectee: 2755000, tva_deductible: 450000, tva_nette: 2305000 }, status: "draft" },
      { company_id: "c0000000-0000-0000-0000-000000000001", tax_type: "IRG", period: "2026-05", form_data: { nif: "001216000123456", masse_salariale: 575000, irg_retenu: 89000 }, status: "draft" },
      { company_id: "c0000000-0000-0000-0000-000000000001", tax_type: "IBS", period: "2026-Q1", form_data: { nif: "001216000123456", benefice_fiscal: 9737000, montant_ibs: 1850000 }, status: "generated" },
      { company_id: "c0000000-0000-0000-0000-000000000001", tax_type: "TAP", period: "2026-04", form_data: { nif: "001216000123456", chiffre_affaires: 13200000, montant_tap: 132000 }, status: "submitted" },
      { company_id: "c0000000-0000-0000-0000-000000000001", tax_type: "TVA", period: "2026-04", form_data: { nif: "001216000123456", tva_nette: 2480000 }, status: "submitted" },
      { company_id: "c0000000-0000-0000-0000-000000000001", tax_type: "TAP", period: "2026-03", form_data: { nif: "001216000123456", chiffre_affaires: 13200000, montant_tap: 132000 }, status: "submitted" },
      { company_id: "c0000000-0000-0000-0000-000000000001", tax_type: "TVA", period: "2026-03", form_data: { nif: "001216000123456", tva_nette: 2508000 }, status: "submitted" },
      { company_id: "c0000000-0000-0000-0000-000000000001", tax_type: "TAP", period: "2026-02", form_data: { nif: "001216000123456", chiffre_affaires: 11800000, montant_tap: 118000 }, status: "submitted" },
      { company_id: "c0000000-0000-0000-0000-000000000001", tax_type: "TVA", period: "2026-02", form_data: { nif: "001216000123456", tva_nette: 2242000 }, status: "submitted" },
      { company_id: "c0000000-0000-0000-0000-000000000001", tax_type: "TAP", period: "2026-01", form_data: { nif: "001216000123456", chiffre_affaires: 12500000, montant_tap: 125000 }, status: "submitted" },
      { company_id: "c0000000-0000-0000-0000-000000000001", tax_type: "TVA", period: "2026-01", form_data: { nif: "001216000123456", tva_nette: 2375000 }, status: "submitted" },
    ].filter((d) => !existingDecSet.has(`${d.tax_type}|${d.period}`));

    if (newDeclarations.length > 0) {
      const { error: decError } = await supabase.from("declarations").insert(newDeclarations);
      results.declarations_inserted = decError ? `Error: ${decError.message}` : newDeclarations.length;
    } else {
      results.declarations_inserted = "0 (all already exist)";
    }

    // Step 5: Insert additional employees
    const { data: existingEmp } = await supabase
      .from("employees")
      .select("name")
      .eq("company_id", "c0000000-0000-0000-0000-000000000001");

    const existingEmpNames = new Set((existingEmp || []).map((e) => e.name));

    const newEmployees = [
      { company_id: "c0000000-0000-0000-0000-000000000001", name: "Nadia Benmoussa", name_ar: "نادية بن موسى", role: "Secrétaire", salary: 42000, cnas_employer_rate: 26, cnas_employee_rate: 9, casnos_rate: 0, start_date: "2024-03-15", status: "active" },
      { company_id: "c0000000-0000-0000-0000-000000000001", name: "عبد الرحمن بلقاسم", name_ar: "عبد الرحمن بلقاسم", role: "Comptable Senior", salary: 78000, cnas_employer_rate: 26, cnas_employee_rate: 9, casnos_rate: 0, start_date: "2023-01-10", status: "active" },
      { company_id: "c0000000-0000-0000-0000-000000000001", name: "Samira Hadj", name_ar: "سميرة حاج", role: "Directrice Générale", salary: 150000, cnas_employer_rate: 26, cnas_employee_rate: 9, casnos_rate: 0, start_date: "2020-06-01", status: "active" },
      { company_id: "c0000000-0000-0000-0000-000000000001", name: "بلال زروال", name_ar: "بلال زروال", role: "Technicien", salary: 55000, cnas_employer_rate: 26, cnas_employee_rate: 9, casnos_rate: 0, start_date: "2025-09-01", status: "active" },
    ].filter((e) => !existingEmpNames.has(e.name));

    if (newEmployees.length > 0) {
      const { error: empError } = await supabase.from("employees").insert(newEmployees);
      results.employees_inserted = empError ? `Error: ${empError.message}` : newEmployees.length;
    } else {
      results.employees_inserted = "0 (all already exist)";
    }

    // Step 6: Insert additional social contributions
    const { data: existingSC } = await supabase
      .from("social_contributions")
      .select("contribution_type, period")
      .eq("company_id", "c0000000-0000-0000-0000-000000000001");

    const existingSCSet = new Set(
      (existingSC || []).map((s) => `${s.contribution_type}|${s.period}`)
    );

    const newSocialContributions = [
      { company_id: "c0000000-0000-0000-0000-000000000001", contribution_type: "CNAS", period: "2026-01", total_salary_base: 575000, employer_amount: 149500, employee_amount: 51750, total_amount: 201250, status: "paid", due_date: "2026-01-31", paid_at: "2026-01-30T00:00:00Z", bordereau_number: "BOR-2026-001" },
      { company_id: "c0000000-0000-0000-0000-000000000001", contribution_type: "CNAS", period: "2026-02", total_salary_base: 575000, employer_amount: 149500, employee_amount: 51750, total_amount: 201250, status: "paid", due_date: "2026-02-28", paid_at: "2026-02-27T00:00:00Z", bordereau_number: "BOR-2026-002" },
      { company_id: "c0000000-0000-0000-0000-000000000001", contribution_type: "CNAS", period: "2026-03", total_salary_base: 575000, employer_amount: 149500, employee_amount: 51750, total_amount: 201250, status: "paid", due_date: "2026-03-31", paid_at: "2026-03-30T00:00:00Z", bordereau_number: "BOR-2026-003" },
      { company_id: "c0000000-0000-0000-0000-000000000001", contribution_type: "CNAS", period: "2026-06", total_salary_base: 575000, employer_amount: 149500, employee_amount: 51750, total_amount: 201250, status: "pending", due_date: "2026-06-30" },
      { company_id: "c0000000-0000-0000-0000-000000000001", contribution_type: "CASNOS", period: "2026-Q1", total_salary_base: 0, employer_amount: 0, employee_amount: 0, total_amount: 35000, status: "paid", due_date: "2026-04-30", paid_at: "2026-04-28T00:00:00Z", bordereau_number: "CAS-2026-Q1" },
      { company_id: "c0000000-0000-0000-0000-000000000001", contribution_type: "CASNOS", period: "2026-Q2", total_salary_base: 0, employer_amount: 0, employee_amount: 0, total_amount: 35000, status: "pending", due_date: "2026-07-31" },
    ].filter((s) => !existingSCSet.has(`${s.contribution_type}|${s.period}`));

    if (newSocialContributions.length > 0) {
      const { error: scError } = await supabase.from("social_contributions").insert(newSocialContributions);
      results.social_contributions_inserted = scError ? `Error: ${scError.message}` : newSocialContributions.length;
    } else {
      results.social_contributions_inserted = "0 (all already exist)";
    }

    // Step 7: Insert additional deadlines
    const { data: existingDL } = await supabase
      .from("deadlines")
      .select("title, deadline_date")
      .eq("company_id", "c0000000-0000-0000-0000-000000000001");

    const existingDLSet = new Set(
      (existingDL || []).map((d) => `${d.title}|${d.deadline_date}`)
    );

    const newDeadlines = [
      { company_id: "c0000000-0000-0000-0000-000000000001", title: "Déclaration TAP — Juin 2026", title_ar: "تصريح ض.م.م — جوان 2026", deadline_date: "2026-06-20", deadline_type: "tax", urgency: "normal", status: "pending", amount: 152000 },
      { company_id: "c0000000-0000-0000-0000-000000000001", title: "Déclaration TVA — Juin 2026", title_ar: "تصريح ر.ق — جوان 2026", deadline_date: "2026-06-20", deadline_type: "tax", urgency: "normal", status: "pending", amount: 2888000 },
      { company_id: "c0000000-0000-0000-0000-000000000001", title: "Déclaration IRG — Juin 2026", title_ar: "تصريح ض.د.ع — جوان 2026", deadline_date: "2026-06-20", deadline_type: "tax", urgency: "normal", status: "pending", amount: 89000 },
      { company_id: "c0000000-0000-0000-0000-000000000001", title: "Cotisations CNAS — Juin 2026", title_ar: "اشتراكات ص.و.ت.ش — جوان 2026", deadline_date: "2026-06-30", deadline_type: "social", urgency: "normal", status: "pending", amount: 201250 },
      { company_id: "c0000000-0000-0000-0000-000000000001", title: "Versement IBS — T3 2026", title_ar: "أداء ض.أ.ش — ت3 2026", deadline_date: "2026-10-30", deadline_type: "tax", urgency: "normal", status: "pending", amount: 1938000 },
      { company_id: "c0000000-0000-0000-0000-000000000001", title: "Cotisations CASNOS — Q2 2026", title_ar: "اشتراكات ص.ح.غ — ت2 2026", deadline_date: "2026-07-31", deadline_type: "social", urgency: "normal", status: "pending", amount: 35000 },
      { company_id: "c0000000-0000-0000-0000-000000000001", title: "Bilan comptable annuel 2025", title_ar: "الميزانية السنوية 2025", deadline_date: "2026-04-30", deadline_type: "filing", urgency: "overdue", status: "overdue", amount: null, notes: "En retard — pénalités possibles" },
    ].filter((d) => !existingDLSet.has(`${d.title}|${d.deadline_date}`));

    if (newDeadlines.length > 0) {
      const { error: dlError } = await supabase.from("deadlines").insert(newDeadlines);
      results.deadlines_inserted = dlError ? `Error: ${dlError.message}` : newDeadlines.length;
    } else {
      results.deadlines_inserted = "0 (all already exist)";
    }

    // Step 8: Insert second company for admin view
    const { error: companyError } = await supabase.from("companies").upsert({
      id: "c0000000-0000-0000-0000-000000000002",
      name: "EURL Oran Services",
      name_ar: "ش.ذ.م.م وهران سيرفيس",
      nif: "001216000654321",
      nis: "31-2021-0005678",
      ai: "31250165432",
      rc: "31/00-0056789 B12",
      address: "Boulevard de l'ALN, Oran",
      wilaya: "Oran",
      activity_type: "commerce",
      tax_regime: "simplifié",
    }, { onConflict: "nif" });

    results.company2 = companyError ? `Error: ${companyError.message}` : "upserted";

    // Add tax obligations for second company
    const { data: existingTax2 } = await supabase
      .from("tax_obligations")
      .select("tax_type, period")
      .eq("company_id", "c0000000-0000-0000-0000-000000000002");

    const existingTax2Set = new Set(
      (existingTax2 || []).map((t) => `${t.tax_type}|${t.period}`)
    );

    const newTax2 = [
      { company_id: "c0000000-0000-0000-0000-000000000002", tax_type: "TAP", period: "2026-05", rate: 1.0, base_amount: 8500000, tax_amount: 85000, paid_amount: 0, status: "pending", due_date: "2026-05-20" },
      { company_id: "c0000000-0000-0000-0000-000000000002", tax_type: "TVA", period: "2026-05", rate: 19.0, base_amount: 8500000, tax_amount: 1615000, paid_amount: 0, status: "pending", due_date: "2026-05-20" },
      { company_id: "c0000000-0000-0000-0000-000000000002", tax_type: "TAP", period: "2026-04", rate: 1.0, base_amount: 7800000, tax_amount: 78000, paid_amount: 78000, status: "paid", due_date: "2026-04-20", paid_at: "2026-04-19T00:00:00Z" },
      { company_id: "c0000000-0000-0000-0000-000000000002", tax_type: "TVA", period: "2026-04", rate: 19.0, base_amount: 7800000, tax_amount: 1482000, paid_amount: 1482000, status: "paid", due_date: "2026-04-20", paid_at: "2026-04-19T00:00:00Z" },
    ].filter((t) => !existingTax2Set.has(`${t.tax_type}|${t.period}`));

    if (newTax2.length > 0) {
      const { error: tax2Error } = await supabase.from("tax_obligations").insert(newTax2);
      results.company2_tax = tax2Error ? `Error: ${tax2Error.message}` : newTax2.length;
    }

    // Step 9: Create demo user (admin@dzfisc.dz)
    const { data: userData, error: userError } = await supabase.auth.admin.createUser({
      email: "admin@dzfisc.dz",
      password: "Admin2026!DZ",
      email_confirm: true,
      user_metadata: {
        full_name: "Administrateur TechAlger",
      },
    });

    if (userError) {
      results.demo_user = `Error: ${userError.message}`;
    } else if (userData?.user) {
      // Create profile for the demo user
      const { error: profileError } = await supabase.from("profiles").upsert({
        id: userData.user.id,
        email: "admin@dzfisc.dz",
        full_name: "Administrateur TechAlger",
        company_id: "c0000000-0000-0000-0000-000000000001",
        role: "admin",
      }, { onConflict: "id" });

      results.demo_user = profileError
        ? `User created but profile error: ${profileError.message}`
        : `Created: admin@dzfisc.dz / Admin2026!DZ`;
    }

    // Step 10: Insert audit logs
    const { error: auditError } = await supabase.from("audit_logs").insert([
      { user_id: null, company_id: "c0000000-0000-0000-0000-000000000001", action: "INSERT", table_name: "tax_obligations", new_data: { note: "Déclaration TAP Mai 2026 créée" }, ip_address: "192.168.1.100" },
      { user_id: null, company_id: "c0000000-0000-0000-0000-000000000001", action: "UPDATE", table_name: "tax_obligations", new_data: { note: "IBS Q1 marqué comme payé" }, ip_address: "192.168.1.100" },
      { user_id: null, company_id: "c0000000-0000-0000-0000-000000000001", action: "INSERT", table_name: "declarations", new_data: { note: "Nouvelle déclaration TVA créée" }, ip_address: "192.168.1.101" },
      { user_id: null, company_id: "c0000000-0000-0000-0000-000000000001", action: "UPDATE", table_name: "deadlines", new_data: { note: "Liasse fiscale marquée en retard" }, ip_address: "192.168.1.100" },
      { user_id: null, company_id: "c0000000-0000-0000-0000-000000000001", action: "INSERT", table_name: "employees", new_data: { note: "Nouvel employé ajouté" }, ip_address: "192.168.1.102" },
    ]);

    results.audit_logs = auditError ? `Error: ${auditError.message}` : "5 entries inserted";

    // Final counts
    const { count: taxCount } = await supabase.from("tax_obligations").select("*", { count: "exact", head: true });
    const { count: empCount } = await supabase.from("employees").select("*", { count: "exact", head: true });
    const { count: decCount } = await supabase.from("declarations").select("*", { count: "exact", head: true });
    const { count: dlCount } = await supabase.from("deadlines").select("*", { count: "exact", head: true });
    const { count: scCount } = await supabase.from("social_contributions").select("*", { count: "exact", head: true });
    const { count: compCount } = await supabase.from("companies").select("*", { count: "exact", head: true });

    results.final_counts = {
      companies: compCount,
      tax_obligations: taxCount,
      employees: empCount,
      declarations: decCount,
      deadlines: dlCount,
      social_contributions: scCount,
    };

    return NextResponse.json({ success: true, results });
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json({
      error: "Seed execution failed",
      details: error instanceof Error ? error.message : "Unknown error",
    }, { status: 500 });
  }
}
