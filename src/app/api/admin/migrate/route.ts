import { NextResponse } from "next/server";

/**
 * Admin Migration Runner
 * Executes the security hardening SQL migration on the Supabase database.
 * Requires SUPABASE_SERVICE_ROLE_KEY in .env.local
 */

export async function POST(request: Request) {
  try {
    const { adminToken } = await request.json();

    if (!adminToken || adminToken !== process.env.MIGRATION_ADMIN_TOKEN) {
      return NextResponse.json({ error: "Unauthorized — invalid admin token" }, { status: 403 });
    }

    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

    if (!serviceRoleKey || serviceRoleKey === "your_service_role_key_here") {
      return NextResponse.json({
        error: "SUPABASE_SERVICE_ROLE_KEY not configured. Add it to .env.local",
        hint: "Get it from: Supabase Dashboard → Settings → API → service_role key",
      }, { status: 500 });
    }

    // Read the migration SQL
    const fs = await import("fs/promises");
    const path = await import("path");
    const migrationPath = path.join(process.cwd(), "supabase/migrations/02_security_hardening.sql");
    const migrationSQL = await fs.readFile(migrationPath, "utf-8");

    // Execute via Supabase SQL API (try pg/query endpoint)
    const sqlResponse = await fetch(`${supabaseUrl}/pg/query`, {
      method: "POST",
      headers: {
        "apikey": serviceRoleKey,
        "Authorization": `Bearer ${serviceRoleKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query: migrationSQL }),
    });

    if (!sqlResponse.ok) {
      const errorText = await sqlResponse.text();

      // Fallback: try splitting SQL into individual statements and running via REST
      // Try the /rest/v1/rpc approach
      const rpcResponse = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
        method: "POST",
        headers: {
          "apikey": serviceRoleKey,
          "Authorization": `Bearer ${serviceRoleKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ sql: migrationSQL }),
      });

      if (!rpcResponse.ok) {
        return NextResponse.json({
          error: "Could not execute migration via API",
          details: errorText,
          fallback: "Please run the SQL manually in Supabase Dashboard → SQL Editor",
          sqlFile: "supabase/migrations/02_security_hardening.sql",
        }, { status: 500 });
      }

      const result = await rpcResponse.json();
      return NextResponse.json({ success: true, method: "rpc", result });
    }

    const result = await sqlResponse.json();
    return NextResponse.json({ success: true, method: "pg_query", result });

  } catch (error) {
    console.error("Migration error:", error);
    return NextResponse.json({
      error: "Migration execution failed",
      details: error instanceof Error ? error.message : "Unknown error",
    }, { status: 500 });
  }
}
