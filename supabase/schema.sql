-- ============================================================
--  DZ-Fisc Database Schema for Supabase (PostgreSQL)
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ========================================
--  COMPANIES (the businesses using DZ-Fisc)
-- ========================================
CREATE TABLE companies (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  name_ar TEXT,
  nif TEXT NOT NULL UNIQUE,              -- Numéro d'Identification Fiscale
  nis TEXT,                               -- Numéro d'Identification Statistique
  ai TEXT,                                -- Article d'Imposition
  rc TEXT,                                -- Registre de Commerce
  address TEXT,
  wilaya TEXT,
  activity_type TEXT,                     -- Type d'activité (production, commerce, services)
  tax_regime TEXT DEFAULT 'réel',         -- Régime d'imposition: réel, simplifié
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================
--  TAX OBLIGATIONS (TAP, TVA, IBS, IRG)
-- ========================================
CREATE TABLE tax_obligations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  tax_type TEXT NOT NULL CHECK (tax_type IN ('TAP', 'TVA', 'IBS', 'IRG')),
  period TEXT NOT NULL,                   -- e.g. "2026-05" or "2026-Q1"
  rate DECIMAL(5,2) NOT NULL,
  base_amount DECIMAL(14,2) NOT NULL DEFAULT 0,  -- taxable base
  tax_amount DECIMAL(14,2) NOT NULL DEFAULT 0,    -- calculated tax
  paid_amount DECIMAL(14,2) DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue')),
  due_date DATE NOT NULL,
  paid_at TIMESTAMPTZ,
  declaration_number TEXT,                -- numéro de déclaration DGI
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================
--  EMPLOYEES (for CNAS/CASNOS calculations)
-- ========================================
CREATE TABLE employees (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  name_ar TEXT,
  role TEXT,
  salary DECIMAL(12,2) NOT NULL DEFAULT 0,
  cnas_employer_rate DECIMAL(5,2) DEFAULT 26.00,  -- % part patronale
  cnas_employee_rate DECIMAL(5,2) DEFAULT 9.00,    -- % part salariale
  casnos_rate DECIMAL(5,2) DEFAULT 0,              -- % for non-salaried workers
  start_date DATE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================
--  SOCIAL CONTRIBUTIONS (CNAS/CASNOS monthly records)
-- ========================================
CREATE TABLE social_contributions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  contribution_type TEXT NOT NULL CHECK (contribution_type IN ('CNAS', 'CASNOS')),
  period TEXT NOT NULL,                   -- e.g. "2026-05"
  total_salary_base DECIMAL(14,2) NOT NULL DEFAULT 0,
  employer_amount DECIMAL(14,2) NOT NULL DEFAULT 0,
  employee_amount DECIMAL(14,2) NOT NULL DEFAULT 0,
  total_amount DECIMAL(14,2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue')),
  due_date DATE NOT NULL,
  paid_at TIMESTAMPTZ,
  bordereau_number TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================
--  DEADLINES (all tax and social deadlines)
-- ========================================
CREATE TABLE deadlines (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  title_ar TEXT,
  deadline_date DATE NOT NULL,
  deadline_type TEXT NOT NULL CHECK (deadline_type IN ('tax', 'social', 'filing')),
  urgency TEXT NOT NULL DEFAULT 'normal' CHECK (urgency IN ('overdue', 'urgent', 'soon', 'normal')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'done', 'overdue')),
  amount DECIMAL(14,2),
  related_obligation_id UUID,             -- optional link to tax_obligations
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================
--  GENERATED DECLARATIONS
-- ========================================
CREATE TABLE declarations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  tax_type TEXT NOT NULL,
  period TEXT NOT NULL,
  form_data JSONB NOT NULL DEFAULT '{}',  -- pre-filled form data
  pdf_url TEXT,                            -- generated PDF URL (stored in Supabase Storage)
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'generated', 'submitted')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================
--  INDEXES for performance
-- ========================================
CREATE INDEX idx_tax_obligations_company ON tax_obligations(company_id);
CREATE INDEX idx_tax_obligations_status ON tax_obligations(status);
CREATE INDEX idx_tax_obligations_due_date ON tax_obligations(due_date);
CREATE INDEX idx_employees_company ON employees(company_id);
CREATE INDEX idx_social_contributions_company ON social_contributions(company_id);
CREATE INDEX idx_deadlines_company ON deadlines(company_id);
CREATE INDEX idx_deadlines_date ON deadlines(deadline_date);
CREATE INDEX idx_deadlines_urgency ON deadlines(urgency);
CREATE INDEX idx_declarations_company ON declarations(company_id);

-- ========================================
--  ROW LEVEL SECURITY (RLS)
-- ========================================
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE tax_obligations ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_contributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE deadlines ENABLE ROW LEVEL SECURITY;
ALTER TABLE declarations ENABLE ROW LEVEL SECURITY;

-- NOTE: RLS policies are managed via Supabase dashboard/migrations, not in this file.
-- For production, implement company-scoped policies that restrict data access
-- to rows where company_id matches the authenticated user's company.
-- Example policy pattern:
--   CREATE POLICY "Users can only see their company data" ON table_name
--     FOR ALL USING (company_id = (SELECT company_id FROM profiles WHERE id = auth.uid()));
--
-- The permissive policies below are for development/MVP only and should be
-- replaced with proper company-scoped policies before production deployment.
CREATE POLICY "Allow all for authenticated users" ON companies FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for authenticated users" ON tax_obligations FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for authenticated users" ON employees FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for authenticated users" ON social_contributions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for authenticated users" ON deadlines FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for authenticated users" ON declarations FOR ALL USING (true) WITH CHECK (true);
