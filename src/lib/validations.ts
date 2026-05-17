/**
 * DZ-Fisc Input Validation Schemas
 * Uses Zod to validate all API inputs before processing
 * Prevents injection attacks, malformed data, and mass assignment
 */

import { z } from "zod";

// ── Common validators ─────────────────────────────────────

const uuidSchema = z.string().uuid();
const positiveNumber = z.number().positive().finite();
const nonNegativeNumber = z.number().nonnegative().finite();
const dateString = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD format");
const safeString = z.string().trim().min(1).max(500);
const safeText = z.string().trim().max(5000);
const optionalString = z.string().trim().max(500).nullable().optional();

// Tax types allowed in Algeria
const TAX_TYPES = z.enum(["TAP", "TVA", "IBS", "IRG"]);
const OBLIGATION_STATUS = z.enum(["pending", "paid", "overdue"]);
const DEADLINE_TYPE = z.enum(["tax", "social", "filing"]);
const DEADLINE_URGENCY = z.enum(["overdue", "urgent", "soon", "normal"]);
const DEADLINE_STATUS = z.enum(["pending", "done", "overdue"]);
const EMPLOYEE_STATUS = z.enum(["active", "inactive"]);
const CONTRIBUTION_TYPE = z.enum(["CNAS", "CASNOS"]);
const DECLARATION_STATUS = z.enum(["draft", "generated", "submitted"]);

// ── Tax Obligation Schema ─────────────────────────────────

export const taxObligationCreateSchema = z.object({
  tax_type: TAX_TYPES,
  period: z.string().trim().min(1).max(50),
  rate: positiveNumber.max(100, "Rate cannot exceed 100%"),
  base_amount: nonNegativeNumber,
  tax_amount: nonNegativeNumber,
  paid_amount: nonNegativeNumber.default(0),
  status: OBLIGATION_STATUS.default("pending"),
  due_date: dateString,
  paid_at: dateString.nullable().optional(),
  declaration_number: z.string().trim().max(100).nullable().optional(),
  notes: safeText.nullable().optional(),
});

export const taxObligationUpdateSchema = taxObligationCreateSchema.partial();

// ── Employee Schema ───────────────────────────────────────

export const employeeCreateSchema = z.object({
  name: safeString.min(2, "Employee name must be at least 2 characters"),
  name_ar: z.string().trim().max(500).nullable().optional(),
  role: z.string().trim().max(200).nullable().optional(),
  salary: positiveNumber,
  cnas_employer_rate: nonNegativeNumber.max(100).default(26),
  cnas_employee_rate: nonNegativeNumber.max(100).default(9),
  casnos_rate: nonNegativeNumber.max(100).default(0),
  start_date: dateString.nullable().optional(),
  status: EMPLOYEE_STATUS.default("active"),
});

export const employeeUpdateSchema = employeeCreateSchema.partial();

// ── Deadline Schema ───────────────────────────────────────

export const deadlineCreateSchema = z.object({
  title: safeString.min(2, "Title must be at least 2 characters"),
  title_ar: z.string().trim().max(500).nullable().optional(),
  deadline_date: dateString,
  deadline_type: DEADLINE_TYPE,
  urgency: DEADLINE_URGENCY.default("normal"),
  status: DEADLINE_STATUS.default("pending"),
  amount: nonNegativeNumber.nullable().optional(),
  related_obligation_id: uuidSchema.nullable().optional(),
  notes: safeText.nullable().optional(),
});

export const deadlineUpdateSchema = deadlineCreateSchema.partial();

// ── Social Contribution Schema ────────────────────────────

export const socialContributionCreateSchema = z.object({
  contribution_type: CONTRIBUTION_TYPE,
  period: z.string().trim().min(1).max(50),
  total_salary_base: nonNegativeNumber,
  employer_amount: nonNegativeNumber,
  employee_amount: nonNegativeNumber,
  total_amount: nonNegativeNumber,
  status: OBLIGATION_STATUS.default("pending"),
  due_date: dateString,
  paid_at: dateString.nullable().optional(),
  bordereau_number: z.string().trim().max(100).nullable().optional(),
});

export const socialContributionUpdateSchema = socialContributionCreateSchema.partial();

// ── Declaration Schema ────────────────────────────────────

export const declarationCreateSchema = z.object({
  tax_type: TAX_TYPES,
  period: z.string().trim().min(1).max(50),
  form_data: z.record(z.unknown()).default({}),
  status: DECLARATION_STATUS.default("draft"),
});

export const declarationUpdateSchema = declarationCreateSchema.partial();

// ── Auth Schemas ──────────────────────────────────────────

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const signupSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  full_name: safeString.min(2, "Full name must be at least 2 characters"),
});

// ── Helper function ───────────────────────────────────────

export function validateInput<T>(schema: z.ZodSchema<T>, data: unknown): {
  success: true;
  data: T;
} | {
  success: false;
  errors: Record<string, string[]>;
} {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  const errors: Record<string, string[]> = {};
  for (const issue of result.error.issues) {
    const path = issue.path.join(".");
    if (!errors[path]) errors[path] = [];
    errors[path].push(issue.message);
  }
  return { success: false, errors };
}
