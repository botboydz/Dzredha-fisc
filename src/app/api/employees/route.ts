import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { validateOrigin, sanitizeBody } from "@/lib/api-security";
import { validateInput, employeeCreateSchema, employeeUpdateSchema } from "@/lib/validations";
import { withRateLimit } from "@/lib/rate-limit";

const ALLOWED_FIELDS = [
  'name', 'name_ar', 'role', 'salary',
  'cnas_employer_rate', 'cnas_employee_rate', 'casnos_rate',
  'start_date', 'status',
];

export async function GET(request: Request) {
  // Rate limit check
  const rateLimit = withRateLimit(request, "api");
  if (!rateLimit.allowed) return rateLimit.response;

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

    const { data, error } = await supabase
      .from("employees")
      .select("*")
      .eq("company_id", profile.company_id)
      .eq("status", "active")
      .order("name", { ascending: true });

    if (error) {
      console.error("Database error:", error);
      return NextResponse.json({ error: "An internal error occurred" }, { status: 500 });
    }

    const response = NextResponse.json({ data });
    rateLimit.headers.forEach((value, key) => response.headers.set(key, value));
    return response;
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  // Rate limit check (stricter for write operations)
  const rateLimit = withRateLimit(request, "write");
  if (!rateLimit.allowed) return rateLimit.response;

  // CSRF check
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

    // Input validation with Zod
    const validation = validateInput(employeeCreateSchema, body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.errors },
        { status: 400 }
      );
    }

    // Sanitize to only allowed fields (defense in depth)
    const sanitizedData = sanitizeBody(validation.data, ALLOWED_FIELDS);
    const insertData = {
      ...sanitizedData,
      company_id: profile.company_id,
    };

    const { data, error } = await supabase
      .from("employees")
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error("Database error:", error);
      return NextResponse.json({ error: "An internal error occurred" }, { status: 500 });
    }

    const response = NextResponse.json({ data }, { status: 201 });
    rateLimit.headers.forEach((value, key) => response.headers.set(key, value));
    return response;
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  // Rate limit check
  const rateLimit = withRateLimit(request, "write");
  if (!rateLimit.allowed) return rateLimit.response;

  // CSRF check
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
    const { id, ...updateFields } = body;

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    // Input validation with Zod
    const validation = validateInput(employeeUpdateSchema, updateFields);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.errors },
        { status: 400 }
      );
    }

    // Sanitize and scope to company
    const sanitizedData = sanitizeBody(validation.data, ALLOWED_FIELDS);

    const { data, error } = await supabase
      .from("employees")
      .update(sanitizedData)
      .eq("id", id)
      .eq("company_id", profile.company_id)
      .select()
      .single();

    if (error) {
      console.error("Database error:", error);
      return NextResponse.json({ error: "An internal error occurred" }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ error: "Record not found" }, { status: 404 });
    }

    const response = NextResponse.json({ data });
    rateLimit.headers.forEach((value, key) => response.headers.set(key, value));
    return response;
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
