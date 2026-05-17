-- ============================================================
-- DZ-FISC SECURITY HARDENING
-- Removes all anonymous access, enforces company-scoped data isolation
-- Run this in Supabase SQL Editor
-- ============================================================

-- Step 1: Drop ALL permissive anonymous policies
-- This is the most critical security fix: remove public read/write access

DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT schemaname, tablename, policyname
    FROM pg_policies
    WHERE schemaname = 'public'
    AND (policyname ILIKE '%anon%' OR policyname ILIKE '%public%' OR policyname ILIKE '%enable%')
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', r.policyname, r.schemaname, r.tablename);
    RAISE NOTICE 'Dropped policy: % on %.%', r.policyname, r.schemaname, r.tablename;
  END LOOP;
END $$;

-- Step 2: Disable anonymous access entirely on public tables
-- Revoke all privileges from anon role
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM anon;

-- Step 3: Grant authenticated users basic access
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Step 4: Create company-scoped RLS policies
-- Each user can only access data belonging to their company (via profiles.company_id)

-- ── Companies table ──────────────────────────────────────
CREATE POLICY "authed_select_companies" ON companies
  FOR SELECT USING (
    id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "authed_update_companies" ON companies
  FOR UPDATE USING (
    id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
  );

-- No INSERT on companies from API — created via server-side only
-- No DELETE on companies — soft delete only

-- ── Profiles table ───────────────────────────────────────
CREATE POLICY "authed_select_own_profile" ON profiles
  FOR SELECT USING (id = auth.uid());

CREATE POLICY "authed_update_own_profile" ON profiles
  FOR UPDATE USING (id = auth.uid());

-- Profile creation is handled by trigger on auth.users

-- ── Employees table ──────────────────────────────────────
CREATE POLICY "authed_select_employees" ON employees
  FOR SELECT USING (
    company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "authed_insert_employees" ON employees
  FOR INSERT WITH CHECK (
    company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "authed_update_employees" ON employees
  FOR UPDATE USING (
    company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "authed_delete_employees" ON employees
  FOR DELETE USING (
    company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
  );

-- ── Tax Obligations table ────────────────────────────────
CREATE POLICY "authed_select_tax_obligations" ON tax_obligations
  FOR SELECT USING (
    company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "authed_insert_tax_obligations" ON tax_obligations
  FOR INSERT WITH CHECK (
    company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "authed_update_tax_obligations" ON tax_obligations
  FOR UPDATE USING (
    company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "authed_delete_tax_obligations" ON tax_obligations
  FOR DELETE USING (
    company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
  );

-- ── Social Contributions table ───────────────────────────
CREATE POLICY "authed_select_social_contributions" ON social_contributions
  FOR SELECT USING (
    company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "authed_insert_social_contributions" ON social_contributions
  FOR INSERT WITH CHECK (
    company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "authed_update_social_contributions" ON social_contributions
  FOR UPDATE USING (
    company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "authed_delete_social_contributions" ON social_contributions
  FOR DELETE USING (
    company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
  );

-- ── Deadlines table ──────────────────────────────────────
CREATE POLICY "authed_select_deadlines" ON deadlines
  FOR SELECT USING (
    company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "authed_insert_deadlines" ON deadlines
  FOR INSERT WITH CHECK (
    company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "authed_update_deadlines" ON deadlines
  FOR UPDATE USING (
    company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "authed_delete_deadlines" ON deadlines
  FOR DELETE USING (
    company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
  );

-- ── Declarations table ───────────────────────────────────
CREATE POLICY "authed_select_declarations" ON declarations
  FOR SELECT USING (
    company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "authed_insert_declarations" ON declarations
  FOR INSERT WITH CHECK (
    company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "authed_update_declarations" ON declarations
  FOR UPDATE USING (
    company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "authed_delete_declarations" ON declarations
  FOR DELETE USING (
    company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
  );

-- Step 5: Create audit log table for tracking data changes
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
  action TEXT NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
  table_name TEXT NOT NULL,
  record_id UUID,
  old_data JSONB,
  new_data JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on audit_logs
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Users can only see their own company's audit logs
CREATE POLICY "authed_select_audit_logs" ON audit_logs
  FOR SELECT USING (
    company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
  );

-- Only system can insert audit logs (via service role or triggers)
CREATE POLICY "service_insert_audit_logs" ON audit_logs
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

-- Create index for fast queries
CREATE INDEX IF NOT EXISTS idx_audit_logs_company_id ON audit_logs(company_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_table_name ON audit_logs(table_name);

-- Step 6: Add trigger functions for automatic audit logging
CREATE OR REPLACE FUNCTION audit_trigger_func()
RETURNS TRIGGER AS $$
DECLARE
  current_user_id UUID;
  current_company_id UUID;
BEGIN
  current_user_id := auth.uid();

  -- Try to get company_id from the record being changed
  IF TG_OP = 'DELETE' THEN
    current_company_id := OLD.company_id;
  ELSE
    current_company_id := NEW.company_id;
  END IF;

  IF TG_OP = 'INSERT' THEN
    INSERT INTO audit_logs (user_id, company_id, action, table_name, record_id, new_data)
    VALUES (current_user_id, current_company_id, 'INSERT', TG_TABLE_NAME, NEW.id, to_jsonb(NEW));
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO audit_logs (user_id, company_id, action, table_name, record_id, old_data, new_data)
    VALUES (current_user_id, current_company_id, 'UPDATE', TG_TABLE_NAME, NEW.id, to_jsonb(OLD), to_jsonb(NEW));
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO audit_logs (user_id, company_id, action, table_name, record_id, old_data)
    VALUES (current_user_id, current_company_id, 'DELETE', TG_TABLE_NAME, OLD.id, to_jsonb(OLD));
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Attach audit triggers to key tables
DROP TRIGGER IF EXISTS audit_tax_obligations ON tax_obligations;
CREATE TRIGGER audit_tax_obligations
  AFTER INSERT OR UPDATE OR DELETE ON tax_obligations
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

DROP TRIGGER IF EXISTS audit_employees ON employees;
CREATE TRIGGER audit_employees
  AFTER INSERT OR UPDATE OR DELETE ON employees
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

DROP TRIGGER IF EXISTS audit_deadlines ON deadlines;
CREATE TRIGGER audit_deadlines
  AFTER INSERT OR UPDATE OR DELETE ON deadlines
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

DROP TRIGGER IF EXISTS audit_social_contributions ON social_contributions;
CREATE TRIGGER audit_social_contributions
  AFTER INSERT OR UPDATE OR DELETE ON social_contributions
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

DROP TRIGGER IF EXISTS audit_declarations ON declarations;
CREATE TRIGGER audit_declarations
  AFTER INSERT OR UPDATE OR DELETE ON declarations
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

-- Step 7: Add password strength requirement via Supabase Auth hook
-- (Configured in Supabase Dashboard > Authentication > Auth Hooks)
-- For now, we enforce it at the application level in the signup form

-- Step 8: Verify all tables have RLS enabled
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename != 'audit_logs'
  LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', r.tablename);
    RAISE NOTICE 'RLS enabled on: %', r.tablename;
  END LOOP;
END $$;
