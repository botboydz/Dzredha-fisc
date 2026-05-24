import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://htwxqoklsnyezddgmika.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh0d3hxb2tsc255ZXpkZGdtaWthIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTA1NTg3NywiZXhwIjoyMDk0NjMxODc3fQ.M3MH4rlzonGlJIzjD32wm9nMg7R6eEN1EPIyAr0suHU';

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const COMPANY_ID = 'c0000000-0000-0000-0000-000000000001';
const COMPANY_2_ID = 'c0000000-0000-0000-0000-000000000002';

async function seed() {
  console.log('🌱 Starting comprehensive DZ-Fisc database seed...\n');

  // ========== 1. COMPANIES ==========
  console.log('📦 Seeding companies...');
  
  const { error: c1err } = await supabase.from('companies').upsert({
    id: COMPANY_ID,
    name: 'SARL TechAlger',
    name_ar: 'ش.م.م تك الجزائر',
    nif: '001216000123456',
    nis: '16-2020-0001234',
    ai: '16250123456',
    rc: '16/00-0012345 B18',
    address: 'Lot 12, Zone Industrielle Oued Smar',
    wilaya: 'Alger',
    activity_type: 'services',
    tax_regime: 'réel'
  }, { onConflict: 'id' });
  if (c1err) console.log('  ⚠️ Company 1:', c1err.message);
  else console.log('  ✅ SARL TechAlger');

  const { error: c2err } = await supabase.from('companies').upsert({
    id: COMPANY_2_ID,
    name: 'EURL Oran Services',
    name_ar: 'ش.ذ.م.م وهران سيرفيس',
    nif: '001216000654321',
    nis: '31-2021-0005678',
    ai: '31250165432',
    rc: '31/00-0056789 B12',
    address: "Boulevard de l'ALN, Oran",
    wilaya: 'Oran',
    activity_type: 'commerce',
    tax_regime: 'simplifié'
  }, { onConflict: 'id' });
  if (c2err) console.log('  ⚠️ Company 2:', c2err.message);
  else console.log('  ✅ EURL Oran Services');

  // ========== 2. EMPLOYEES ==========
  console.log('\n👥 Seeding employees...');
  const employees = [
    { company_id: COMPANY_ID, name: 'Karim Bouzid', name_ar: 'كريم بوزيد', role: 'Directeur Général', salary: 150000, cnas_employer_rate: 26, cnas_employee_rate: 9, casnos_rate: 0, start_date: '2020-06-01', status: 'active' },
    { company_id: COMPANY_ID, name: 'Amina Cherif', name_ar: 'أمينة شريف', role: 'Responsable Comptable', salary: 95000, cnas_employer_rate: 26, cnas_employee_rate: 9, casnos_rate: 0, start_date: '2021-03-15', status: 'active' },
    { company_id: COMPANY_ID, name: 'Youcef Meddour', name_ar: 'يوسف مدور', role: 'Ingénieur Informatique', salary: 85000, cnas_employer_rate: 26, cnas_employee_rate: 9, casnos_rate: 0, start_date: '2022-01-10', status: 'active' },
    { company_id: COMPANY_ID, name: 'Samira Hadj', name_ar: 'سميرة حاج', role: 'Secrétaire Comptable', salary: 55000, cnas_employer_rate: 26, cnas_employee_rate: 9, casnos_rate: 0, start_date: '2022-09-01', status: 'active' },
    { company_id: COMPANY_ID, name: 'Nabil Benahmed', name_ar: 'نبيل بن أحمد', role: 'Technicien Maintenance', salary: 48000, cnas_employer_rate: 26, cnas_employee_rate: 9, casnos_rate: 0, start_date: '2023-05-20', status: 'active' },
    { company_id: COMPANY_ID, name: 'Fatima Zohra Khalil', name_ar: 'فاطمة الزهراء خليل', role: 'Assistante Administrative', salary: 42000, cnas_employer_rate: 26, cnas_employee_rate: 9, casnos_rate: 0, start_date: '2024-01-15', status: 'active' },
    { company_id: COMPANY_ID, name: 'عبد الرحمن بلقاسم', name_ar: 'عبد الرحمن بلقاسم', role: 'Comptable Senior', salary: 78000, cnas_employer_rate: 26, cnas_employee_rate: 9, casnos_rate: 0, start_date: '2023-01-10', status: 'active' },
    { company_id: COMPANY_ID, name: 'Leila Mansouri', name_ar: 'ليلى منصوري', role: 'Chargée de Clientèle', salary: 52000, cnas_employer_rate: 26, cnas_employee_rate: 9, casnos_rate: 0, start_date: '2023-08-01', status: 'inactive' },
    { company_id: COMPANY_ID, name: 'Mourad Tlemcani', name_ar: 'مراد تلمساني', role: 'Agent Commercial', salary: 45000, cnas_employer_rate: 26, cnas_employee_rate: 9, casnos_rate: 0, start_date: '2024-06-01', status: 'active' },
    { company_id: COMPANY_ID, name: 'بلال زروال', name_ar: 'بلال زروال', role: 'Technicien Réseau', salary: 60000, cnas_employer_rate: 26, cnas_employee_rate: 9, casnos_rate: 0, start_date: '2025-09-01', status: 'active' },
  ];
  
  for (const emp of employees) {
    const { error } = await supabase.from('employees').upsert(emp, { onConflict: 'id' });
    if (error) console.log('  ⚠️', emp.name, error.message);
  }
  console.log('  ✅ 10 employees seeded');

  // ========== 3. TAX OBLIGATIONS ==========
  console.log('\n💰 Seeding tax obligations...');
  const taxObligations = [
    // Jan 2026 - All Paid
    { company_id: COMPANY_ID, tax_type: 'TAP', period: '2026-01', rate: 1, base_amount: 12500000, tax_amount: 125000, paid_amount: 125000, status: 'paid', due_date: '2026-01-20', paid_at: '2026-01-19', declaration_number: 'DEC-2026-001' },
    { company_id: COMPANY_ID, tax_type: 'TVA', period: '2026-01', rate: 19, base_amount: 12500000, tax_amount: 2375000, paid_amount: 2375000, status: 'paid', due_date: '2026-01-20', paid_at: '2026-01-19', declaration_number: 'DEC-2026-002' },
    { company_id: COMPANY_ID, tax_type: 'IRG', period: '2026-01', rate: 0, base_amount: 575000, tax_amount: 89000, paid_amount: 89000, status: 'paid', due_date: '2026-01-20', paid_at: '2026-01-19', declaration_number: 'DEC-2026-003' },
    // Feb 2026 - All Paid
    { company_id: COMPANY_ID, tax_type: 'TAP', period: '2026-02', rate: 1, base_amount: 11800000, tax_amount: 118000, paid_amount: 118000, status: 'paid', due_date: '2026-02-20', paid_at: '2026-02-19', declaration_number: 'DEC-2026-004' },
    { company_id: COMPANY_ID, tax_type: 'TVA', period: '2026-02', rate: 19, base_amount: 11800000, tax_amount: 2242000, paid_amount: 2242000, status: 'paid', due_date: '2026-02-20', paid_at: '2026-02-19', declaration_number: 'DEC-2026-005' },
    { company_id: COMPANY_ID, tax_type: 'IRG', period: '2026-02', rate: 0, base_amount: 575000, tax_amount: 89000, paid_amount: 89000, status: 'paid', due_date: '2026-02-20', paid_at: '2026-02-19', declaration_number: 'DEC-2026-006' },
    // Mar 2026 - All Paid
    { company_id: COMPANY_ID, tax_type: 'TAP', period: '2026-03', rate: 1, base_amount: 13200000, tax_amount: 132000, paid_amount: 132000, status: 'paid', due_date: '2026-03-20', paid_at: '2026-03-19', declaration_number: 'DEC-2026-007' },
    { company_id: COMPANY_ID, tax_type: 'TVA', period: '2026-03', rate: 19, base_amount: 13200000, tax_amount: 2508000, paid_amount: 2508000, status: 'paid', due_date: '2026-03-20', paid_at: '2026-03-19', declaration_number: 'DEC-2026-008' },
    { company_id: COMPANY_ID, tax_type: 'IRG', period: '2026-03', rate: 0, base_amount: 575000, tax_amount: 89000, paid_amount: 89000, status: 'paid', due_date: '2026-03-20', paid_at: '2026-03-19', declaration_number: 'DEC-2026-009' },
    // Q1 2026 IBS
    { company_id: COMPANY_ID, tax_type: 'IBS', period: '2026-Q1', rate: 19, base_amount: 9737000, tax_amount: 1850000, paid_amount: 1850000, status: 'paid', due_date: '2026-04-30', paid_at: '2026-04-28', declaration_number: 'DEC-2026-010' },
    // Apr 2026 - Paid
    { company_id: COMPANY_ID, tax_type: 'TAP', period: '2026-04', rate: 1, base_amount: 14500000, tax_amount: 145000, paid_amount: 145000, status: 'paid', due_date: '2026-04-20', paid_at: '2026-04-19', declaration_number: 'DEC-2026-011' },
    { company_id: COMPANY_ID, tax_type: 'TVA', period: '2026-04', rate: 19, base_amount: 14500000, tax_amount: 2755000, paid_amount: 2755000, status: 'paid', due_date: '2026-04-20', paid_at: '2026-04-19', declaration_number: 'DEC-2026-012' },
    { company_id: COMPANY_ID, tax_type: 'IRG', period: '2026-04', rate: 0, base_amount: 575000, tax_amount: 89000, paid_amount: 89000, status: 'paid', due_date: '2026-04-20', paid_at: '2026-04-19', declaration_number: 'DEC-2026-013' },
    // May 2026 - Pending (current month)
    { company_id: COMPANY_ID, tax_type: 'TAP', period: '2026-05', rate: 1, base_amount: 13800000, tax_amount: 138000, paid_amount: 0, status: 'pending', due_date: '2026-05-20', paid_at: null, declaration_number: null },
    { company_id: COMPANY_ID, tax_type: 'TVA', period: '2026-05', rate: 19, base_amount: 13800000, tax_amount: 2622000, paid_amount: 0, status: 'pending', due_date: '2026-05-20', paid_at: null, declaration_number: null },
    { company_id: COMPANY_ID, tax_type: 'IRG', period: '2026-05', rate: 0, base_amount: 575000, tax_amount: 89000, paid_amount: 0, status: 'pending', due_date: '2026-05-20', paid_at: null, declaration_number: null },
    // Overdue - March TAP paid late
    { company_id: COMPANY_ID, tax_type: 'TAP', period: '2026-02', rate: 1, base_amount: 11800000, tax_amount: 118000, paid_amount: 118000, status: 'paid', due_date: '2026-02-20', paid_at: '2026-02-25', declaration_number: 'DEC-2026-014' },
    // June 2026 - Future pending
    { company_id: COMPANY_ID, tax_type: 'TAP', period: '2026-06', rate: 1, base_amount: 15200000, tax_amount: 152000, paid_amount: 0, status: 'pending', due_date: '2026-06-20', paid_at: null, declaration_number: null },
    { company_id: COMPANY_ID, tax_type: 'TVA', period: '2026-06', rate: 19, base_amount: 15200000, tax_amount: 2888000, paid_amount: 0, status: 'pending', due_date: '2026-06-20', paid_at: null, declaration_number: null },
    { company_id: COMPANY_ID, tax_type: 'IRG', period: '2026-06', rate: 0, base_amount: 575000, tax_amount: 89000, paid_amount: 0, status: 'pending', due_date: '2026-06-20', paid_at: null, declaration_number: null },
    // Q2 2026 IBS
    { company_id: COMPANY_ID, tax_type: 'IBS', period: '2026-Q2', rate: 19, base_amount: 10200000, tax_amount: 1938000, paid_amount: 0, status: 'pending', due_date: '2026-07-30', paid_at: null, declaration_number: null },
    // Overdue obligation
    { company_id: COMPANY_ID, tax_type: 'TAP', period: '2026-05', rate: 1, base_amount: 5000000, tax_amount: 50000, paid_amount: 0, status: 'overdue', due_date: '2026-05-15', paid_at: null, declaration_number: null },
    // Company 2 obligations
    { company_id: COMPANY_2_ID, tax_type: 'TAP', period: '2026-04', rate: 1, base_amount: 7800000, tax_amount: 78000, paid_amount: 78000, status: 'paid', due_date: '2026-04-20', paid_at: '2026-04-19', declaration_number: 'DEC-ORAN-001' },
    { company_id: COMPANY_2_ID, tax_type: 'TVA', period: '2026-04', rate: 19, base_amount: 7800000, tax_amount: 1482000, paid_amount: 1482000, status: 'paid', due_date: '2026-04-20', paid_at: '2026-04-19', declaration_number: 'DEC-ORAN-002' },
    { company_id: COMPANY_2_ID, tax_type: 'TAP', period: '2026-05', rate: 1, base_amount: 8500000, tax_amount: 85000, paid_amount: 0, status: 'pending', due_date: '2026-05-20', paid_at: null, declaration_number: null },
    { company_id: COMPANY_2_ID, tax_type: 'TVA', period: '2026-05', rate: 19, base_amount: 8500000, tax_amount: 1615000, paid_amount: 0, status: 'pending', due_date: '2026-05-20', paid_at: null, declaration_number: null },
  ];

  for (const tax of taxObligations) {
    const { error } = await supabase.from('tax_obligations').upsert(tax, { onConflict: 'id' });
    if (error && !error.message.includes('duplicate')) console.log('  ⚠️', tax.tax_type, tax.period, error.message);
  }
  console.log('  ✅ 26 tax obligations seeded');

  // ========== 4. SOCIAL CONTRIBUTIONS ==========
  console.log('\n🏥 Seeding social contributions...');
  const socialContributions = [
    { company_id: COMPANY_ID, contribution_type: 'CNAS', period: '2026-01', total_salary_base: 575000, employer_amount: 149500, employee_amount: 51750, total_amount: 201250, status: 'paid', due_date: '2026-01-31', paid_at: '2026-01-30', bordereau_number: 'BOR-2026-001' },
    { company_id: COMPANY_ID, contribution_type: 'CNAS', period: '2026-02', total_salary_base: 575000, employer_amount: 149500, employee_amount: 51750, total_amount: 201250, status: 'paid', due_date: '2026-02-28', paid_at: '2026-02-27', bordereau_number: 'BOR-2026-002' },
    { company_id: COMPANY_ID, contribution_type: 'CNAS', period: '2026-03', total_salary_base: 575000, employer_amount: 149500, employee_amount: 51750, total_amount: 201250, status: 'paid', due_date: '2026-03-31', paid_at: '2026-03-30', bordereau_number: 'BOR-2026-003' },
    { company_id: COMPANY_ID, contribution_type: 'CNAS', period: '2026-04', total_salary_base: 575000, employer_amount: 149500, employee_amount: 51750, total_amount: 201250, status: 'paid', due_date: '2026-04-30', paid_at: '2026-04-29', bordereau_number: 'BOR-2026-004' },
    { company_id: COMPANY_ID, contribution_type: 'CNAS', period: '2026-05', total_salary_base: 575000, employer_amount: 149500, employee_amount: 51750, total_amount: 201250, status: 'pending', due_date: '2026-05-31', paid_at: null, bordereau_number: null },
    { company_id: COMPANY_ID, contribution_type: 'CASNOS', period: '2026-Q1', total_salary_base: 0, employer_amount: 0, employee_amount: 0, total_amount: 35000, status: 'paid', due_date: '2026-04-30', paid_at: '2026-04-28', bordereau_number: 'CAS-2026-Q1' },
    { company_id: COMPANY_ID, contribution_type: 'CASNOS', period: '2026-Q2', total_salary_base: 0, employer_amount: 0, employee_amount: 0, total_amount: 35000, status: 'pending', due_date: '2026-07-31', paid_at: null, bordereau_number: null },
  ];

  for (const sc of socialContributions) {
    const { error } = await supabase.from('social_contributions').upsert(sc, { onConflict: 'id' });
    if (error && !error.message.includes('duplicate')) console.log('  ⚠️', sc.contribution_type, sc.period, error.message);
  }
  console.log('  ✅ 7 social contributions seeded');

  // ========== 5. DEADLINES ==========
  console.log('\n📅 Seeding deadlines...');
  const deadlines = [
    // Upcoming
    { company_id: COMPANY_ID, title: 'Déclaration TAP — Mai 2026', title_ar: 'تصريح ض.م.م — ماي 2026', deadline_date: '2026-05-20', deadline_type: 'tax', urgency: 'urgent', status: 'pending', amount: 138000, notes: null },
    { company_id: COMPANY_ID, title: 'Déclaration TVA — Mai 2026', title_ar: 'تصريح ر.ق — ماي 2026', deadline_date: '2026-05-20', deadline_type: 'tax', urgency: 'urgent', status: 'pending', amount: 2622000, notes: null },
    { company_id: COMPANY_ID, title: 'Déclaration IRG — Mai 2026', title_ar: 'تصريح ض.د.ع — ماي 2026', deadline_date: '2026-05-20', deadline_type: 'tax', urgency: 'urgent', status: 'pending', amount: 89000, notes: null },
    { company_id: COMPANY_ID, title: 'Cotisations CNAS — Mai 2026', title_ar: 'اشتراكات ص.و.ت.ش — ماي 2026', deadline_date: '2026-05-31', deadline_type: 'social', urgency: 'soon', status: 'pending', amount: 201250, notes: null },
    { company_id: COMPANY_ID, title: 'Déclaration TAP — Juin 2026', title_ar: 'تصريح ض.م.م — جوان 2026', deadline_date: '2026-06-20', deadline_type: 'tax', urgency: 'normal', status: 'pending', amount: 152000, notes: null },
    { company_id: COMPANY_ID, title: 'Déclaration TVA — Juin 2026', title_ar: 'تصريح ر.ق — جوان 2026', deadline_date: '2026-06-20', deadline_type: 'tax', urgency: 'normal', status: 'pending', amount: 2888000, notes: null },
    { company_id: COMPANY_ID, title: 'Cotisations CNAS — Juin 2026', title_ar: 'اشتراكات ص.و.ت.ش — جوان 2026', deadline_date: '2026-06-30', deadline_type: 'social', urgency: 'normal', status: 'pending', amount: 201250, notes: null },
    { company_id: COMPANY_ID, title: 'Cotisations CASNOS — Q2 2026', title_ar: 'اشتراكات ص.ح.غ — ت2 2026', deadline_date: '2026-07-31', deadline_type: 'social', urgency: 'normal', status: 'pending', amount: 35000, notes: null },
    { company_id: COMPANY_ID, title: 'Versement IBS — T3 2026', title_ar: 'أداء ض.أ.ش — ت3 2026', deadline_date: '2026-10-30', deadline_type: 'tax', urgency: 'normal', status: 'pending', amount: 1938000, notes: null },
    // Overdue
    { company_id: COMPANY_ID, title: 'Bilan comptable annuel 2025', title_ar: 'الميزانية السنوية 2025', deadline_date: '2026-04-30', deadline_type: 'filing', urgency: 'overdue', status: 'overdue', amount: null, notes: 'En retard — pénalités possibles' },
    { company_id: COMPANY_ID, title: 'Liasse fiscale 2025', title_ar: 'الملف الجبائي 2025', deadline_date: '2026-04-30', deadline_type: 'filing', urgency: 'overdue', status: 'overdue', amount: null, notes: 'Documents complémentaires requis' },
    // Completed
    { company_id: COMPANY_ID, title: 'Déclaration TAP — Janvier 2026', title_ar: 'تصريح ض.م.م — يناير 2026', deadline_date: '2026-01-20', deadline_type: 'tax', urgency: 'normal', status: 'done', amount: 125000, notes: null },
    { company_id: COMPANY_ID, title: 'Déclaration TVA — Janvier 2026', title_ar: 'تصريح ر.ق — يناير 2026', deadline_date: '2026-01-20', deadline_type: 'tax', urgency: 'normal', status: 'done', amount: 2375000, notes: null },
    { company_id: COMPANY_ID, title: 'Déclaration TAP — Février 2026', title_ar: 'تصريح ض.م.م — فيفري 2026', deadline_date: '2026-02-20', deadline_type: 'tax', urgency: 'normal', status: 'done', amount: 118000, notes: null },
    { company_id: COMPANY_ID, title: 'Déclaration TVA — Février 2026', title_ar: 'تصريح ر.ق — فيفري 2026', deadline_date: '2026-02-20', deadline_type: 'tax', urgency: 'normal', status: 'done', amount: 2242000, notes: null },
    { company_id: COMPANY_ID, title: 'Déclaration TAP — Mars 2026', title_ar: 'تصريح ض.م.م — مارس 2026', deadline_date: '2026-03-20', deadline_type: 'tax', urgency: 'normal', status: 'done', amount: 132000, notes: null },
    { company_id: COMPANY_ID, title: 'Déclaration TVA — Mars 2026', title_ar: 'تصريح ر.ق — مارس 2026', deadline_date: '2026-03-20', deadline_type: 'tax', urgency: 'normal', status: 'done', amount: 2508000, notes: null },
    { company_id: COMPANY_ID, title: 'Déclaration TAP — Avril 2026', title_ar: 'تصريح ض.م.م — أفريل 2026', deadline_date: '2026-04-20', deadline_type: 'tax', urgency: 'normal', status: 'done', amount: 145000, notes: null },
    { company_id: COMPANY_ID, title: 'Déclaration TVA — Avril 2026', title_ar: 'تصريح ر.ق — أفريل 2026', deadline_date: '2026-04-20', deadline_type: 'tax', urgency: 'normal', status: 'done', amount: 2755000, notes: null },
  ];

  for (const dl of deadlines) {
    const { error } = await supabase.from('deadlines').upsert(dl, { onConflict: 'id' });
    if (error && !error.message.includes('duplicate')) console.log('  ⚠️', dl.title, error.message);
  }
  console.log('  ✅ 18 deadlines seeded');

  // ========== 6. DECLARATIONS ==========
  console.log('\n📝 Seeding declarations...');
  const declarations = [
    // Draft
    { company_id: COMPANY_ID, tax_type: 'TAP', period: '2026-05', form_data: { nif: '001216000123456', nis: '16-2020-0001234', raison_sociale: 'SARL TechAlger', periode: 'Mai 2026', chiffre_affaires: 13800000, taux: 1, montant_tap: 138000, wilaya: 'Alger', activite: 'services' }, status: 'draft' },
    { company_id: COMPANY_ID, tax_type: 'TVA', period: '2026-05', form_data: { nif: '001216000123456', nis: '16-2020-0001234', raison_sociale: 'SARL TechAlger', periode: 'Mai 2026', chiffre_affaires_ht: 11596639, tva_collectee: 2622000, tva_deductible: 420000, tva_nette: 2202000, taux_normal: 19 }, status: 'draft' },
    { company_id: COMPANY_ID, tax_type: 'IRG', period: '2026-05', form_data: { nif: '001216000123456', raison_sociale: 'SARL TechAlger', periode: 'Mai 2026', nombre_salaries: 9, masse_salariale: 575000, irg_retenu: 89000, deductions: 0 }, status: 'draft' },
    // Generated
    { company_id: COMPANY_ID, tax_type: 'IBS', period: '2026-Q1', form_data: { nif: '001216000123456', raison_sociale: 'SARL TechAlger', periode: 'T1 2026', benefice_fiscal: 9737000, taux_ibs: 19, montant_ibs: 1850000, acomptes_versee: 1500000, solde_a_payer: 350000 }, status: 'generated' },
    // Submitted
    { company_id: COMPANY_ID, tax_type: 'TAP', period: '2026-04', form_data: { nif: '001216000123456', raison_sociale: 'SARL TechAlger', periode: 'Avril 2026', chiffre_affaires: 14500000, montant_tap: 145000 }, status: 'submitted' },
    { company_id: COMPANY_ID, tax_type: 'TVA', period: '2026-04', form_data: { nif: '001216000123456', raison_sociale: 'SARL TechAlger', periode: 'Avril 2026', tva_nette: 2755000 }, status: 'submitted' },
    { company_id: COMPANY_ID, tax_type: 'IRG', period: '2026-04', form_data: { nif: '001216000123456', raison_sociale: 'SARL TechAlger', periode: 'Avril 2026', nombre_salaries: 9, masse_salariale: 575000, irg_retenu: 89000 }, status: 'submitted' },
    { company_id: COMPANY_ID, tax_type: 'TAP', period: '2026-03', form_data: { nif: '001216000123456', raison_sociale: 'SARL TechAlger', periode: 'Mars 2026', chiffre_affaires: 13200000, montant_tap: 132000 }, status: 'submitted' },
    { company_id: COMPANY_ID, tax_type: 'TVA', period: '2026-03', form_data: { nif: '001216000123456', raison_sociale: 'SARL TechAlger', periode: 'Mars 2026', tva_nette: 2508000 }, status: 'submitted' },
    { company_id: COMPANY_ID, tax_type: 'TAP', period: '2026-02', form_data: { nif: '001216000123456', raison_sociale: 'SARL TechAlger', periode: 'Février 2026', chiffre_affaires: 11800000, montant_tap: 118000 }, status: 'submitted' },
    { company_id: COMPANY_ID, tax_type: 'TVA', period: '2026-02', form_data: { nif: '001216000123456', raison_sociale: 'SARL TechAlger', periode: 'Février 2026', tva_nette: 2242000 }, status: 'submitted' },
    { company_id: COMPANY_ID, tax_type: 'TAP', period: '2026-01', form_data: { nif: '001216000123456', raison_sociale: 'SARL TechAlger', periode: 'Janvier 2026', chiffre_affaires: 12500000, montant_tap: 125000 }, status: 'submitted' },
    { company_id: COMPANY_ID, tax_type: 'TVA', period: '2026-01', form_data: { nif: '001216000123456', raison_sociale: 'SARL TechAlger', periode: 'Janvier 2026', tva_nette: 2375000 }, status: 'submitted' },
    { company_id: COMPANY_ID, tax_type: 'IRG', period: '2026-03', form_data: { nif: '001216000123456', raison_sociale: 'SARL TechAlger', periode: 'Mars 2026', irg_retenu: 89000 }, status: 'submitted' },
    { company_id: COMPANY_ID, tax_type: 'IRG', period: '2026-02', form_data: { nif: '001216000123456', raison_sociale: 'SARL TechAlger', periode: 'Février 2026', irg_retenu: 89000 }, status: 'submitted' },
    { company_id: COMPANY_ID, tax_type: 'IRG', period: '2026-01', form_data: { nif: '001216000123456', raison_sociale: 'SARL TechAlger', periode: 'Janvier 2026', irg_retenu: 89000 }, status: 'submitted' },
  ];

  for (const dec of declarations) {
    const { error } = await supabase.from('declarations').upsert(dec, { onConflict: 'id' });
    if (error && !error.message.includes('duplicate')) console.log('  ⚠️', dec.tax_type, dec.period, error.message);
  }
  console.log('  ✅ 16 declarations seeded');

  // ========== 7. AUDIT LOGS ==========
  console.log('\n🔒 Seeding audit logs...');
  const auditLogs = [
    { user_id: null, company_id: COMPANY_ID, action: 'INSERT', table_name: 'tax_obligations', record_id: null, old_data: null, new_data: { note: 'Déclaration TAP Mai 2026 créée' }, ip_address: '192.168.1.100' },
    { user_id: null, company_id: COMPANY_ID, action: 'UPDATE', table_name: 'tax_obligations', record_id: null, old_data: { status: 'pending' }, new_data: { note: 'IBS Q1 marqué comme payé', status: 'paid' }, ip_address: '192.168.1.100' },
    { user_id: null, company_id: COMPANY_ID, action: 'INSERT', table_name: 'declarations', record_id: null, old_data: null, new_data: { note: 'Nouvelle déclaration TVA créée' }, ip_address: '192.168.1.101' },
    { user_id: null, company_id: COMPANY_ID, action: 'UPDATE', table_name: 'deadlines', record_id: null, old_data: { status: 'pending' }, new_data: { note: 'Liasse fiscale marquée en retard', status: 'overdue' }, ip_address: '192.168.1.100' },
    { user_id: null, company_id: COMPANY_ID, action: 'INSERT', table_name: 'employees', record_id: null, old_data: null, new_data: { note: 'Nouvel employé ajouté: Mourad Tlemcani' }, ip_address: '192.168.1.102' },
    { user_id: null, company_id: COMPANY_ID, action: 'LOGIN', table_name: 'auth', record_id: null, old_data: null, new_data: { note: 'Connexion réussie depuis Alger' }, ip_address: '192.168.1.100' },
    { user_id: null, company_id: COMPANY_ID, action: 'UPDATE', table_name: 'social_contributions', record_id: null, old_data: { status: 'pending' }, new_data: { note: 'CNAS Avril payée', status: 'paid' }, ip_address: '192.168.1.101' },
    { user_id: null, company_id: COMPANY_ID, action: 'INSERT', table_name: 'declarations', record_id: null, old_data: null, new_data: { note: 'Déclaration IRG Avril soumise' }, ip_address: '192.168.1.100' },
  ];

  for (const log of auditLogs) {
    const { error } = await supabase.from('audit_logs').upsert(log, { onConflict: 'id' });
    if (error && !error.message.includes('duplicate')) console.log('  ⚠️ Audit log:', error.message);
  }
  console.log('  ✅ 8 audit logs seeded');

  // ========== VERIFY ==========
  console.log('\n📊 Verifying data counts...');
  const tables = ['companies', 'employees', 'tax_obligations', 'social_contributions', 'deadlines', 'declarations', 'audit_logs'];
  for (const table of tables) {
    const { count, error } = await supabase.from(table).select('*', { count: 'exact', head: true });
    if (error) console.log(`  ❌ ${table}: ${error.message}`);
    else console.log(`  ✅ ${table}: ${count} records`);
  }

  console.log('\n🎉 DZ-Fisc database seed complete!');
}

seed().catch(err => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
