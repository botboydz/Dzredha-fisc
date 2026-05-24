-- ============================================================
--  DZ-Fisc Comprehensive Seed Data
--  Run this in Supabase SQL Editor or via the /api/seed route
-- ============================================================

-- Step 0: Create profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
  role TEXT DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles (if not already exist)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'authed_select_own_profile') THEN
    CREATE POLICY "authed_select_own_profile" ON profiles FOR SELECT USING (id = auth.uid());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'authed_update_own_profile') THEN
    CREATE POLICY "authed_update_own_profile" ON profiles FOR UPDATE USING (id = auth.uid());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'authed_insert_own_profile') THEN
    CREATE POLICY "authed_insert_own_profile" ON profiles FOR INSERT WITH CHECK (id = auth.uid());
  END IF;
END $$;

-- Create trigger to auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, company_id, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    'c0000000-0000-0000-0000-000000000001',
    'admin'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if any, then create
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Grant anon access for demo mode (so the app can read data without auth)
-- This is needed for the demo mode to work
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;

-- Step 1: Clean up duplicate data (keep only the first occurrence of each unique record)
-- Delete duplicate tax_obligations (same company_id, tax_type, period, due_date)
DELETE FROM tax_obligations a USING tax_obligations b
WHERE a.id > b.id
  AND a.company_id = b.company_id
  AND a.tax_type = b.tax_type
  AND a.period = b.period
  AND a.due_date = b.due_date;

-- Delete duplicate employees (same company_id, name, role)
DELETE FROM employees a USING employees b
WHERE a.id > b.id
  AND a.company_id = b.company_id
  AND a.name = b.name
  AND a.role = b.role;

-- Delete duplicate deadlines (same company_id, title, deadline_date)
DELETE FROM deadlines a USING deadlines b
WHERE a.id > b.id
  AND a.company_id = b.company_id
  AND a.title = b.title
  AND a.deadline_date = b.deadline_date;

-- Delete duplicate social_contributions
DELETE FROM social_contributions a USING social_contributions b
WHERE a.id > b.id
  AND a.company_id = b.company_id
  AND a.contribution_type = b.contribution_type
  AND a.period = b.period;

-- Step 2: Add more varied tax obligations (historical data for richer charts)
INSERT INTO tax_obligations (company_id, tax_type, period, rate, base_amount, tax_amount, paid_amount, status, due_date, paid_at, declaration_number) VALUES
  -- January 2026
  ('c0000000-0000-0000-0000-000000000001', 'TAP', '2026-01', 1.00, 12500000, 125000, 125000, 'paid', '2026-01-20', '2026-01-19', 'DEC-2026-001'),
  ('c0000000-0000-0000-0000-000000000001', 'TVA', '2026-01', 19.00, 12500000, 2375000, 2375000, 'paid', '2026-01-20', '2026-01-19', 'DEC-2026-002'),
  ('c0000000-0000-0000-0000-000000000001', 'IRG', '2026-01', 0.00, 575000, 89000, 89000, 'paid', '2026-01-20', '2026-01-19', 'DEC-2026-003'),
  -- February 2026
  ('c0000000-0000-0000-0000-000000000001', 'TAP', '2026-02', 1.00, 11800000, 118000, 118000, 'paid', '2026-02-20', '2026-02-19', 'DEC-2026-004'),
  ('c0000000-0000-0000-0000-000000000001', 'TVA', '2026-02', 19.00, 11800000, 2242000, 2242000, 'paid', '2026-02-20', '2026-02-19', 'DEC-2026-005'),
  ('c0000000-0000-0000-0000-000000000001', 'IRG', '2026-02', 0.00, 575000, 89000, 89000, 'paid', '2026-02-20', '2026-02-19', 'DEC-2026-006'),
  -- March 2026
  ('c0000000-0000-0000-0000-000000000001', 'TAP', '2026-03', 1.00, 13200000, 132000, 132000, 'paid', '2026-03-20', '2026-03-19', 'DEC-2026-007'),
  ('c0000000-0000-0000-0000-000000000001', 'TVA', '2026-03', 19.00, 13200000, 2508000, 2508000, 'paid', '2026-03-20', '2026-03-19', 'DEC-2026-008'),
  ('c0000000-0000-0000-0000-000000000001', 'IRG', '2026-03', 0.00, 575000, 89000, 89000, 'paid', '2026-03-20', '2026-03-19', 'DEC-2026-009'),
  -- Q1 2026 IBS already exists from original seed

  -- June 2026 (future - pending)
  ('c0000000-0000-0000-0000-000000000001', 'TAP', '2026-06', 1.00, 15200000, 152000, 0, 'pending', '2026-06-20', NULL, NULL),
  ('c0000000-0000-0000-0000-000000000001', 'TVA', '2026-06', 19.00, 15200000, 2888000, 0, 'pending', '2026-06-20', NULL, NULL),
  ('c0000000-0000-0000-0000-000000000001', 'IRG', '2026-06', 0.00, 575000, 89000, 0, 'pending', '2026-06-20', NULL, NULL),

  -- Q2 2026 IBS (future - pending)
  ('c0000000-0000-0000-0000-000000000001', 'IBS', '2026-Q2', 19.00, 10200000, 1938000, 0, 'pending', '2026-07-30', NULL, NULL),

  -- An overdue obligation (March TAP was late)
  ('c0000000-0000-0000-0000-000000000001', 'TAP', '2026-02', 1.00, 11800000, 118000, 118000, 'paid', '2026-02-20', '2026-02-25', 'DEC-2026-010')
ON CONFLICT DO NOTHING;

-- Step 3: Add more varied employees
INSERT INTO employees (company_id, name, name_ar, role, salary, cnas_employer_rate, cnas_employee_rate, casnos_rate, start_date, status) VALUES
  ('c0000000-0000-0000-0000-000000000001', 'Nadia Benmoussa', 'نادية بن موسى', 'Secrétaire', 42000, 26.00, 9.00, 0, '2024-03-15', 'active'),
  ('c0000000-0000-0000-0000-000000000001', 'عبد الرحمن بلقاسم', 'عبد الرحمن بلقاسم', 'Comptable Senior', 78000, 26.00, 9.00, 0, '2023-01-10', 'active'),
  ('c0000000-0000-0000-0000-000000000001', 'Samira Hadj', 'سميرة حاج', 'Directrice Générale', 150000, 26.00, 9.00, 0, '2020-06-01', 'active'),
  ('c0000000-0000-0000-0000-000000000001', 'بلال زروال', 'بلال زروال', 'Technicien', 55000, 26.00, 9.00, 0, '2025-09-01', 'active'),
  ('c0000000-0000-0000-0000-000000000001', 'Amina Cherif', 'أمينة شريف', 'Assistante Comptable', 52000, 26.00, 9.00, 0, '2024-11-15', 'inactive')
ON CONFLICT DO NOTHING;

-- Step 4: Add more social contributions (historical)
INSERT INTO social_contributions (company_id, contribution_type, period, total_salary_base, employer_amount, employee_amount, total_amount, status, due_date, paid_at, bordereau_number) VALUES
  ('c0000000-0000-0000-0000-000000000001', 'CNAS', '2026-01', 575000, 149500, 51750, 201250, 'paid', '2026-01-31', '2026-01-30', 'BOR-2026-001'),
  ('c0000000-0000-0000-0000-000000000001', 'CNAS', '2026-02', 575000, 149500, 51750, 201250, 'paid', '2026-02-28', '2026-02-27', 'BOR-2026-002'),
  ('c0000000-0000-0000-0000-000000000001', 'CNAS', '2026-03', 575000, 149500, 51750, 201250, 'paid', '2026-03-31', '2026-03-30', 'BOR-2026-003'),
  ('c0000000-0000-0000-0000-000000000001', 'CNAS', '2026-06', 575000, 149500, 51750, 201250, 'pending', '2026-06-30', NULL, NULL),
  ('c0000000-0000-0000-0000-000000000001', 'CASNOS', '2026-Q1', 0, 0, 0, 35000, 'paid', '2026-04-30', '2026-04-28', 'CAS-2026-Q1'),
  ('c0000000-0000-0000-0000-000000000001', 'CASNOS', '2026-Q2', 0, 0, 0, 35000, 'pending', '2026-07-31', NULL, NULL)
ON CONFLICT DO NOTHING;

-- Step 5: Add more deadlines
INSERT INTO deadlines (company_id, title, title_ar, deadline_date, deadline_type, urgency, status, amount, notes) VALUES
  ('c0000000-0000-0000-0000-000000000001', 'Déclaration TAP — Juin 2026', 'تصريح ض.م.م — جوان 2026', '2026-06-20', 'tax', 'normal', 'pending', 152000, NULL),
  ('c0000000-0000-0000-0000-000000000001', 'Déclaration TVA — Juin 2026', 'تصريح ر.ق — جوان 2026', '2026-06-20', 'tax', 'normal', 'pending', 2888000, NULL),
  ('c0000000-0000-0000-0000-000000000001', 'Déclaration IRG — Juin 2026', 'تصريح ض.د.ع — جوان 2026', '2026-06-20', 'tax', 'normal', 'pending', 89000, NULL),
  ('c0000000-0000-0000-0000-000000000001', 'Cotisations CNAS — Juin 2026', 'اشتراكات ص.و.ت.ش — جوان 2026', '2026-06-30', 'social', 'normal', 'pending', 201250, NULL),
  ('c0000000-0000-0000-0000-000000000001', 'Versement IBS — T3 2026', 'أداء ض.أ.ش — ت3 2026', '2026-10-30', 'tax', 'normal', 'pending', 1938000, NULL),
  ('c0000000-0000-0000-0000-000000000001', 'Cotisations CASNOS — Q2 2026', 'اشتراكات ص.ح.غ — ت2 2026', '2026-07-31', 'social', 'normal', 'pending', 35000, NULL),
  ('c0000000-0000-0000-0000-000000000001', 'Bilan comptable annuel 2025', 'الميزانية السنوية 2025', '2026-04-30', 'filing', 'overdue', 'overdue', NULL, 'En retard — pénalités possibles'),
  -- Completed deadlines
  ('c0000000-0000-0000-0000-000000000001', 'Déclaration TAP — Janvier 2026', 'تصريح ض.م.م — يناير 2026', '2026-01-20', 'tax', 'normal', 'done', 125000, NULL),
  ('c0000000-0000-0000-0000-000000000001', 'Déclaration TVA — Janvier 2026', 'تصريح ر.ق — يناير 2026', '2026-01-20', 'tax', 'normal', 'done', 2375000, NULL),
  ('c0000000-0000-0000-0000-000000000001', 'Déclaration TAP — Février 2026', 'تصريح ض.م.م — فيفري 2026', '2026-02-20', 'tax', 'normal', 'done', 118000, NULL),
  ('c0000000-0000-0000-0000-000000000001', 'Déclaration TVA — Février 2026', 'تصريح ر.ق — فيفري 2026', '2026-02-20', 'tax', 'normal', 'done', 2242000, NULL),
  ('c0000000-0000-0000-0000-000000000001', 'Déclaration TAP — Mars 2026', 'تصريح ض.م.م — مارس 2026', '2026-03-20', 'tax', 'normal', 'done', 132000, NULL),
  ('c0000000-0000-0000-0000-000000000001', 'Déclaration TVA — Mars 2026', 'تصريح ر.ق — مارس 2026', '2026-03-20', 'tax', 'normal', 'done', 2508000, NULL)
ON CONFLICT DO NOTHING;

-- Step 6: Add declarations (linked to tax obligations)
INSERT INTO declarations (company_id, tax_type, period, form_data, status, created_at, updated_at) VALUES
  -- Draft declarations
  ('c0000000-0000-0000-0000-000000000001', 'TAP', '2026-05',
   '{"nif": "001216000123456", "nis": "16-2020-0001234", "raison_sociale": "SARL TechAlger", "periode": "Mai 2026", "chiffre_affaires": 14500000, "taux": 1, "montant_tap": 145000, "wilaya": "Alger", "activite": "services"}'::jsonb,
   'draft', '2026-05-15T10:30:00Z', '2026-05-15T10:30:00Z'),

  ('c0000000-0000-0000-0000-000000000001', 'TVA', '2026-05',
   '{"nif": "001216000123456", "nis": "16-2020-0001234", "raison_sociale": "SARL TechAlger", "periode": "Mai 2026", "chiffre_affaires_ht": 12184874, "tva_collectee": 2755000, "tva_deductible": 450000, "tva_nette": 2305000, "taux_normal": 19}'::jsonb,
   'draft', '2026-05-16T09:15:00Z', '2026-05-16T09:15:00Z'),

  ('c0000000-0000-0000-0000-000000000001', 'IRG', '2026-05',
   '{"nif": "001216000123456", "raison_sociale": "SARL TechAlger", "periode": "Mai 2026", "nombre_salaries": 6, "masse_salariale": 575000, "irg_retenu": 89000, "deductions": 0}'::jsonb,
   'draft', '2026-05-17T14:00:00Z', '2026-05-17T14:00:00Z'),

  -- Generated (PDF ready) declarations
  ('c0000000-0000-0000-0000-000000000001', 'IBS', '2026-Q1',
   '{"nif": "001216000123456", "raison_sociale": "SARL TechAlger", "periode": "T1 2026", "benefice_fiscal": 9737000, "taux_ibs": 19, "montant_ibs": 1850000, "acomptes_versee": 1500000, "solde_a_payer": 350000}'::jsonb,
   'generated', '2026-04-25T11:00:00Z', '2026-04-28T09:00:00Z'),

  -- Submitted declarations (historical)
  ('c0000000-0000-0000-0000-000000000001', 'TAP', '2026-04',
   '{"nif": "001216000123456", "raison_sociale": "SARL TechAlger", "periode": "Avril 2026", "chiffre_affaires": 13200000, "montant_tap": 132000}'::jsonb,
   'submitted', '2026-04-18T08:30:00Z', '2026-04-19T10:00:00Z'),

  ('c0000000-0000-0000-0000-000000000001', 'TVA', '2026-04',
   '{"nif": "001216000123456", "raison_sociale": "SARL TechAlger", "periode": "Avril 2026", "tva_nette": 2480000}'::jsonb,
   'submitted', '2026-04-18T09:00:00Z', '2026-04-19T11:00:00Z'),

  ('c0000000-0000-0000-0000-000000000001', 'TAP', '2026-03',
   '{"nif": "001216000123456", "raison_sociale": "SARL TechAlger", "periode": "Mars 2026", "chiffre_affaires": 13200000, "montant_tap": 132000}'::jsonb,
   'submitted', '2026-03-18T08:30:00Z', '2026-03-19T09:00:00Z'),

  ('c0000000-0000-0000-0000-000000000001', 'TVA', '2026-03',
   '{"nif": "001216000123456", "raison_sociale": "SARL TechAlger", "periode": "Mars 2026", "tva_nette": 2508000}'::jsonb,
   'submitted', '2026-03-18T09:00:00Z', '2026-03-19T10:00:00Z'),

  ('c0000000-0000-0000-0000-000000000001', 'TAP', '2026-02',
   '{"nif": "001216000123456", "raison_sociale": "SARL TechAlger", "periode": "Février 2026", "chiffre_affaires": 11800000, "montant_tap": 118000}'::jsonb,
   'submitted', '2026-02-18T08:30:00Z', '2026-02-19T09:00:00Z'),

  ('c0000000-0000-0000-0000-000000000001', 'TVA', '2026-02',
   '{"nif": "001216000123456", "raison_sociale": "SARL TechAlger", "periode": "Février 2026", "tva_nette": 2242000}'::jsonb,
   'submitted', '2026-02-18T09:00:00Z', '2026-02-19T10:00:00Z'),

  ('c0000000-0000-0000-0000-000000000001', 'TAP', '2026-01',
   '{"nif": "001216000123456", "raison_sociale": "SARL TechAlger", "periode": "Janvier 2026", "chiffre_affaires": 12500000, "montant_tap": 125000}'::jsonb,
   'submitted', '2026-01-18T08:30:00Z', '2026-01-19T09:00:00Z'),

  ('c0000000-0000-0000-0000-000000000001', 'TVA', '2026-01',
   '{"nif": "001216000123456", "raison_sociale": "SARL TechAlger", "periode": "Janvier 2026", "tva_nette": 2375000}'::jsonb,
   'submitted', '2026-01-18T09:00:00Z', '2026-01-19T10:00:00Z')
ON CONFLICT DO NOTHING;

-- Step 7: Add second company for admin view
INSERT INTO companies (id, name, name_ar, nif, nis, ai, rc, address, wilaya, activity_type, tax_regime) VALUES
  ('c0000000-0000-0000-0000-000000000002',
   'EURL Oran Services',
   'ش.ذ.م.م وهران سيرفيس',
   '001216000654321',
   '31-2021-0005678',
   '31250165432',
   '31/00-0056789 B12',
   'Boulevard de l''ALN, Oran',
   'Oran',
   'commerce',
   'simplifié')
ON CONFLICT (nif) DO NOTHING;

-- Add tax obligations for second company
INSERT INTO tax_obligations (company_id, tax_type, period, rate, base_amount, tax_amount, paid_amount, status, due_date) VALUES
  ('c0000000-0000-0000-0000-000000000002', 'TAP', '2026-05', 1.00, 8500000, 85000, 0, 'pending', '2026-05-20'),
  ('c0000000-0000-0000-0000-000000000002', 'TVA', '2026-05', 19.00, 8500000, 1615000, 0, 'pending', '2026-05-20'),
  ('c0000000-0000-0000-0000-000000000002', 'TAP', '2026-04', 1.00, 7800000, 78000, 78000, 'paid', '2026-04-20'),
  ('c0000000-0000-0000-0000-000000000002', 'TVA', '2026-04', 19.00, 7800000, 1482000, 1482000, 'paid', '2026-04-20')
ON CONFLICT DO NOTHING;

-- Step 8: Add audit log entries (demo data for security page)
INSERT INTO audit_logs (user_id, company_id, action, table_name, record_id, new_data, ip_address) VALUES
  (NULL, 'c0000000-0000-0000-0000-000000000001', 'INSERT', 'tax_obligations', NULL, '{"note": "Déclaration TAP Mai 2026 créée"}'::jsonb, '192.168.1.100'),
  (NULL, 'c0000000-0000-0000-0000-000000000001', 'UPDATE', 'tax_obligations', NULL, '{"note": "IBS Q1 marqué comme payé", "status": "paid"}'::jsonb, '192.168.1.100'),
  (NULL, 'c0000000-0000-0000-0000-000000000001', 'INSERT', 'declarations', NULL, '{"note": "Nouvelle déclaration TVA créée"}'::jsonb, '192.168.1.101'),
  (NULL, 'c0000000-0000-0000-0000-000000000001', 'UPDATE', 'deadlines', NULL, '{"note": "Liasse fiscale marquée en retard"}'::jsonb, '192.168.1.100'),
  (NULL, 'c0000000-0000-0000-0000-000000000001', 'INSERT', 'employees', NULL, '{"note": "Nouvel employé ajouté"}'::jsonb, '192.168.1.102')
ON CONFLICT DO NOTHING;

-- Step 9: Create the demo user (admin@dzfisc.dz / Admin2026!DZ)
-- This uses the admin API which requires the service_role key
-- If running manually, use: supabase auth admin create-user --email admin@dzfisc.dz --password 'Admin2026!DZ' --email-confirm
-- Or create via the Supabase Dashboard → Authentication → Users → Add User

-- Step 10: Verify data counts
DO $$
DECLARE
  c_count INTEGER;
  t_count INTEGER;
  e_count INTEGER;
  d_count INTEGER;
  dec_count INTEGER;
  sc_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO c_count FROM companies;
  SELECT COUNT(*) INTO t_count FROM tax_obligations;
  SELECT COUNT(*) INTO e_count FROM employees;
  SELECT COUNT(*) INTO d_count FROM deadlines;
  SELECT COUNT(*) INTO dec_count FROM declarations;
  SELECT COUNT(*) INTO sc_count FROM social_contributions;

  RAISE NOTICE '=== DZ-Fisc Seed Complete ===';
  RAISE NOTICE 'Companies: %', c_count;
  RAISE NOTICE 'Tax Obligations: %', t_count;
  RAISE NOTICE 'Employees: %', e_count;
  RAISE NOTICE 'Deadlines: %', d_count;
  RAISE NOTICE 'Declarations: %', dec_count;
  RAISE NOTICE 'Social Contributions: %', sc_count;
END $$;
