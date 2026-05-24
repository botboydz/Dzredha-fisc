import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { join } from "path";

/**
 * Serves the comprehensive-seed.sql file for copying to Supabase SQL Editor
 */
export async function GET() {
  try {
    const sqlPath = join(process.cwd(), "supabase", "comprehensive-seed.sql");
    const sql = await readFile(sqlPath, "utf-8");

    return new NextResponse(sql, {
      status: 200,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Content-Disposition": "inline; filename=comprehensive-seed.sql",
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "SQL file not found", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 404 }
    );
  }
}
