import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { validateOrigin, sanitizeBody } from "@/lib/api-security";

const ALLOWED_FIELDS = [
  'tax_type', 'period', 'rate', 'base_amount', 'tax_amount',
  'paid_amount', 'status', 'due_date', 'paid_at',
  'declaration_number', 'notes',
];

export async function GET() {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's company_id from profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("company_id")
      .eq("id", user.id)
      .single();

    if (!profile?.company_id) {
      return NextResponse.json({ error: "No company associated" }, { status: 403 });
    }

    const { data, error } = await supabase
      .from("tax_obligations")
      .select("*")
      .eq("company_id", profile.company_id)
      .order("due_date", { ascending: false });

    if (error) {
      console.error("Database error:", error);
      return NextResponse.json({ error: "An internal error occurred" }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!validateOrigin(request)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("company_id")
      .eq("id", user.id)
      .single();

    if (!profile?.company_id) {
      return NextResponse.json({ error: "No company associated" }, { status: 403 });
    }

    const body = await request.json();
    const sanitizedData = sanitizeBody(body, ALLOWED_FIELDS);
    const insertData = {
      ...sanitizedData,
      company_id: profile.company_id,
    };

    const { data, error } = await supabase
      .from("tax_obligations")
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error("Database error:", error);
      return NextResponse.json({ error: "An internal error occurred" }, { status: 500 });
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
