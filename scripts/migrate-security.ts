/**
 * DZ-Fisc Security Migration Runner
 * 
 * Usage:
 *   npx tsx scripts/migrate-security.ts
 * 
 * Requires one of these in .env.local:
 *   SUPABASE_SERVICE_ROLE_KEY  (preferred - get from Supabase Dashboard → Settings → API)
 *   SUPABASE_DB_PASSWORD       (your database password from project creation)
 * 
 * This script:
 * 1. Connects to your Supabase database
 * 2. Drops all permissive anonymous RLS policies
 * 3. Creates company-scoped policies (users can only see their own company's data)
 * 4. Creates audit_logs table with automatic triggers
 * 5. Verifies all changes were applied
 */

import { readFileSync } from 'fs';
import { join } from 'path';

// ── Configuration ──────────────────────────────────────

const PROJECT_REF = 'htwxqoklsnyezddgmika';
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || `https://${PROJECT_REF}.supabase.co`;
const MIGRATION_FILE = join(process.cwd(), 'supabase/migrations/02_security_hardening.sql');

// ── Main ───────────────────────────────────────────────

async function main() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  DZ-Fisc Security Migration Runner');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log();

  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const dbPassword = process.env.SUPABASE_DB_PASSWORD;

  if (serviceRoleKey && serviceRoleKey !== 'your_service_role_key_here') {
    console.log('Using SUPABASE_SERVICE_ROLE_KEY...');
    await migrateWithServiceKey(serviceRoleKey);
  } else if (dbPassword) {
    console.log('Using SUPABASE_DB_PASSWORD...');
    await migrateWithDirectConnection(dbPassword);
  } else {
    console.log('❌ No credentials found!');
    console.log();
    console.log('Add one of these to .env.local:');
    console.log();
    console.log('  Option 1 - Service Role Key (preferred):');
    console.log('    1. Go to: https://supabase.com/dashboard/project/' + PROJECT_REF + '/settings/api');
    console.log('    2. Copy the "service_role" (secret) key');
    console.log('    3. Add: SUPABASE_SERVICE_ROLE_KEY=your-key-here');
    console.log();
    console.log('  Option 2 - Database Password:');
    console.log('    1. Use the password you set when creating the Supabase project');
    console.log('    2. Add: SUPABASE_DB_PASSWORD=your-password-here');
    console.log();
    console.log('Then re-run: npx tsx scripts/migrate-security.ts');
    process.exit(1);
  }
}

// ── Method 1: Service Role Key ─────────────────────────

async function migrateWithServiceKey(serviceRoleKey: string) {
  const migrationSQL = readFileSync(MIGRATION_FILE, 'utf-8');

  console.log(`Project: ${SUPABASE_URL}`);
  console.log(`Migration: ${MIGRATION_FILE}`);
  console.log();
  console.log('Applying security migration...');

  // Try the Supabase SQL API endpoint
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'apikey': serviceRoleKey,
        'Authorization': `Bearer ${serviceRoleKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sql: migrationSQL }),
    });

    if (response.ok) {
      const result = await response.json();
      console.log('✅ Migration applied successfully via RPC!');
      console.log(JSON.stringify(result, null, 2));
      printSummary();
      return;
    }

    console.log(`RPC method returned ${response.status}. Trying pg/query endpoint...`);
  } catch (err) {
    console.log('RPC method failed. Trying pg/query endpoint...');
  }

  // Try the pg/query endpoint
  try {
    const response = await fetch(`${SUPABASE_URL}/pg/query`, {
      method: 'POST',
      headers: {
        'apikey': serviceRoleKey,
        'Authorization': `Bearer ${serviceRoleKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: migrationSQL }),
    });

    if (response.ok) {
      const result = await response.json();
      console.log('✅ Migration applied successfully via SQL API!');
      console.log(JSON.stringify(result, null, 2));
      printSummary();
      return;
    }

    const errorText = await response.text();
    console.log(`❌ SQL API also failed (${response.status}): ${errorText}`);
    printFallbackInstructions();
    process.exit(1);
  } catch (err) {
    console.log('❌ SQL API request failed:', err);
    printFallbackInstructions();
    process.exit(1);
  }
}

// ── Method 2: Direct Database Connection ───────────────

async function migrateWithDirectConnection(dbPassword: string) {
  // Try common Supabase regions
  const regions = [
    'eu-west-3',  // Paris (common for .dz projects)
    'eu-west-1',  // Ireland
    'eu-west-2',  // London
    'eu-central-1', // Frankfurt
    'us-east-1',  // N. Virginia
    'us-west-1',  // N. California
    'ap-southeast-1', // Singapore
  ];

  const { Client } = await import('pg');

  for (const region of regions) {
    const connectionStr = `postgresql://postgres.${PROJECT_REF}:${dbPassword}@aws-0-${region}.pooler.supabase.com:6543/postgres`;
    
    console.log(`Trying region: ${region}...`);
    
    const client = new Client({ connectionString: connectionStr, ssl: true as any });
    
    try {
      await client.connect();
      console.log(`✅ Connected to ${region}!`);
      
      const migrationSQL = readFileSync(MIGRATION_FILE, 'utf-8');
      
      console.log('Applying security migration...');
      await client.query(migrationSQL);
      
      console.log('✅ Migration applied successfully!');
      
      // Verify
      const { rows } = await client.query(`
        SELECT tablename, policyname 
        FROM pg_policies 
        WHERE schemaname = 'public'
        ORDER BY tablename, policyname
      `);
      
      console.log('\n📋 Current RLS Policies:');
      for (const row of rows) {
        console.log(`  ${row.tablename}: ${row.policyname}`);
      }
      
      await client.end();
      printSummary();
      return;
    } catch (err: any) {
      await client.end().catch(() => {});
      if (err.code === 'ECONNREFUSED' || err.code === 'ENOTFOUND' || err.code === 'ETIMEDOUT') {
        continue; // Try next region
      }
      console.log(`❌ Connection to ${region} failed: ${err.message}`);
      continue;
    }
  }

  console.log('❌ Could not connect to any Supabase region.');
  console.log('Please check your database password and try the Dashboard method.');
  printFallbackInstructions();
  process.exit(1);
}

// ── Helpers ────────────────────────────────────────────

function printSummary() {
  console.log();
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  ✅ Security Migration Complete!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log();
  console.log('What was applied:');
  console.log('  ✅ Removed all anonymous access policies');
  console.log('  ✅ Created company-scoped RLS policies');
  console.log('  ✅ Added audit_logs table with triggers');
  console.log('  ✅ Enabled RLS on all tables');
  console.log();
  console.log('⚠️  For security, remove the service_role key from .env.local:');
  console.log('    sed -i \'/SUPABASE_SERVICE_ROLE_KEY/d\' .env.local');
}

function printFallbackInstructions() {
  console.log();
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  Manual Migration Required');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log();
  console.log('Please apply the migration manually:');
  console.log();
  console.log('  1. Open: https://supabase.com/dashboard/project/' + PROJECT_REF + '/sql/new');
  console.log('  2. Click "New query"');
  console.log('  3. Paste the contents of: supabase/migrations/02_security_hardening.sql');
  console.log('  4. Click "Run"');
  console.log();
  console.log('This will lock down all data access to authenticated users only.');
}

// ── Run ────────────────────────────────────────────────

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
