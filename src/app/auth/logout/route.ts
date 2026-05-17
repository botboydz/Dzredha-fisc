import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  // Validate origin for CSRF protection
  const origin = request.headers.get("origin") || "";
  const allowedOrigins = [process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"];
  if (origin && !allowedOrigins.includes(origin)) {
    return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  }

  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();

  return NextResponse.redirect(new URL("/login", process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"));
}
