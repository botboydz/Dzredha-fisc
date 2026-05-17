# Security Vulnerability Fixes - Task Complete

## Summary
All 10 security vulnerabilities have been fixed across the DZ-Fisc codebase.

## Changes Made

### 1. Input Validation / Field Whitelisting (C-4 + H-1)
- Created `src/lib/api-security.ts` with shared `sanitizeBody()` and `validateOrigin()` helpers
- Updated all 6 API route files to whitelist allowed fields and filter out `id`, `created_at`, `updated_at`, `company_id`
- Files: tax-obligations, employees, deadlines (both root and [id] routes)

### 2. Open Redirect Fixes (H-2 + H-5)
- `src/app/auth/callback/route.ts`: Validates `next` param starts with `/` and not `//`
- `src/app/login/page.tsx`: Validates `redirect` param starts with `/` and not `//`

### 3. Removed GET Logout Handler (H-3)
- `src/app/auth/logout/route.ts`: Removed GET handler, kept only POST with origin validation

### 4. Client-Side Write Fixes (H-4)
- `src/lib/use-dzfisc-data.ts`: Fixed `markAsPaid` to use `paid_amount: taxAmount` instead of `paid_amount: 0`
- Both `markAsPaid` and `markDeadlineDone` now only execute Supabase writes when `companyId` is provided
- Added `taxObligations` to the dependency array of `markAsPaid` for correct tax_amount lookup

### 5. Error Message Sanitization (M-3)
- All API routes now use `console.error("Database error:", error)` + generic `"An internal error occurred"` response

### 6. CSRF Origin Checks (M-5)
- All POST/PATCH/DELETE handlers in API routes now validate origin using `validateOrigin()` from `src/lib/api-security.ts`

### 7. Password Policy (M-2)
- `src/app/signup/page.tsx`: Changed from 6-char minimum to 8-char + uppercase + digit requirement

### 8. Security Headers (L-4)
- `src/lib/supabase/middleware.ts`: Added X-Frame-Options, X-Content-Type-Options, Referrer-Policy, X-XSS-Protection, Permissions-Policy

### 9. Demo Mode Data Isolation (L-2 + L-3)
- `src/lib/use-dzfisc-data.ts`: When no `companyId` is provided, always uses mock data (never fetches real data)
- Removed `DEMO_COMPANY_ID` fallback constant
- `fetchData` now takes `companyIdParam` as argument and checks it before querying Supabase

### 10. Schema.sql Documentation (documentation)
- `supabase/schema.sql`: Added comment noting RLS policies are managed via Supabase dashboard/migrations, with example policy pattern for production

## Verification
- ESLint: All checks passed (no errors or warnings)
- Dev server: Compiling and serving pages successfully
