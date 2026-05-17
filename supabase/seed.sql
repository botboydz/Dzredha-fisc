-- ============================================================
--  DZ-Fisc Seed Data — Demo Company
-- ============================================================

-- Insert demo company
INSERT INTO companies (id, name, name_ar, nif, nis, ai, rc, address, wilaya, activity_type, tax_regime)
VALUES (
  'c0000000-0000-0000-0000-000000000001',
  'SARL TechAlger',
  'ش.ذ.م.م تيك ألجير',
  '001216000123456',
  '16-2020-0001234',
  '16240112345',
  '16/00-0012345 B21',
  'Rue Didouche Mourad, Alger Centre',
  'Alger',
  'services',
  'réel'
) ON CONFLICT (nif) DO NOTHING;

-- Insert tax obligations
INSERT INTO tax_obligations (company_id, tax_type, period, rate, base_amount, tax_amount, paid_amount, status, due_date) VALUES
  ('c0000000-0000-0000-0000-000000000001', 'TAP', '2026-05', 1.00, 14500000, 145000, 0, 'pending', '2026-05-20'),
  ('c0000000-0000-0000-0000-000000000001', 'TVA', '2026-05', 19.00, 14500000, 2755000, 0, 'pending', '2026-05-20'),
  ('c0000000-0000-0000-0000-000000000001', 'IRG', '2026-05', 0.00, 575000, 89000, 0, 'pending', '2026-05-20'),
  ('c0000000-0000-0000-0000-000000000001', 'IBS', '2026-Q1', 19.00, 9737000, 1850000, 1850000, 'paid', '2026-04-30'),
  ('c0000000-0000-0000-0000-000000000001', 'TAP', '2026-04', 1.00, 13200000, 132000, 132000, 'paid', '2026-04-20'),
  ('c0000000-0000-0000-0000-000000000001', 'TVA', '2026-04', 19.00, 13053000, 2480000, 2480000, 'paid', '2026-04-20');

-- Insert employees
INSERT INTO employees (company_id, name, name_ar, role, salary, cnas_employer_rate, cnas_employee_rate) VALUES
  ('c0000000-0000-0000-0000-000000000001', 'محمد بن أحمد', 'محمد بن أحمد', 'Ingénieur', 85000, 26.00, 9.00),
  ('c0000000-0000-0000-0000-000000000001', 'Karim Bouzid', 'كريم بوزيد', 'Comptable', 65000, 26.00, 9.00),
  ('c0000000-0000-0000-0000-000000000001', 'فاطمة الزهراء', 'فاطمة الزهراء', 'Responsable RH', 75000, 26.00, 9.00),
  ('c0000000-0000-0000-0000-000000000001', 'Amine Khelifi', 'أمين خليفي', 'Développeur', 95000, 26.00, 9.00),
  ('c0000000-0000-0000-0000-000000000001', 'سعاد مرابط', 'سعاد مرابط', 'Assistante', 45000, 26.00, 9.00),
  ('c0000000-0000-0000-0000-000000000001', 'ياسين حداد', 'ياسين حداد', 'Chef de projet', 110000, 26.00, 9.00);

-- Insert social contributions
INSERT INTO social_contributions (company_id, contribution_type, period, total_salary_base, employer_amount, employee_amount, total_amount, status, due_date) VALUES
  ('c0000000-0000-0000-0000-000000000001', 'CNAS', '2026-05', 575000, 149500, 51750, 201250, 'pending', '2026-05-31'),
  ('c0000000-0000-0000-0000-000000000001', 'CNAS', '2026-04', 575000, 149500, 51750, 201250, 'paid', '2026-04-30');

-- Insert deadlines
INSERT INTO deadlines (company_id, title, title_ar, deadline_date, deadline_type, urgency, status, amount) VALUES
  ('c0000000-0000-0000-0000-000000000001', 'Déclaration TAP — Mai 2026', 'تصريح ض.م.م — ماي 2026', '2026-05-20', 'tax', 'urgent', 'pending', 145000),
  ('c0000000-0000-0000-0000-000000000001', 'Déclaration TVA — Mai 2026', 'تصريح ر.ق — ماي 2026', '2026-05-20', 'tax', 'urgent', 'pending', 2755000),
  ('c0000000-0000-0000-0000-000000000001', 'Déclaration IRG — Mai 2026', 'تصريح ض.د.ع — ماي 2026', '2026-05-20', 'tax', 'urgent', 'pending', 89000),
  ('c0000000-0000-0000-0000-000000000001', 'Cotisations CNAS — Mai 2026', 'اشتراكات ص.و.ت.ش — ماي 2026', '2026-05-31', 'social', 'soon', 'pending', 201250),
  ('c0000000-0000-0000-0000-000000000001', 'Versement IBS — T2 2026', 'أداء ض.أ.ش — ت2 2026', '2026-06-30', 'tax', 'normal', 'pending', 1850000),
  ('c0000000-0000-0000-0000-000000000001', 'Liasse fiscale annuelle 2025', 'الملف الجبائي السنوي 2025', '2026-04-30', 'filing', 'overdue', 'overdue', NULL),
  ('c0000000-0000-0000-0000-000000000001', 'Déclaration TVA — Juin 2026', 'تصريح ر.ق — جوان 2026', '2026-06-20', 'tax', 'normal', 'pending', 2500000);
