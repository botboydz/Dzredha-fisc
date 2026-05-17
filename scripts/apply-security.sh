#!/bin/bash
# ============================================================
# DZ-Fisc Security Migration Runner
# Applies the security hardening SQL to your Supabase database
# ============================================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}  DZ-Fisc Security Migration Runner${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

if [ ! -f .env.local ]; then
  echo -e "${RED}Error: .env.local not found${NC}"
  exit 1
fi

source .env.local 2>/dev/null || true

if [ -z "$SUPABASE_SERVICE_ROLE_KEY" ] || [ "$SUPABASE_SERVICE_ROLE_KEY" = "your_service_role_key_here" ]; then
  echo -e "${YELLOW}⚠ SUPABASE_SERVICE_ROLE_KEY not found in .env.local${NC}"
  echo ""
  echo -e "To get your service_role key:"
  echo -e "  1. Go to: ${CYAN}https://supabase.com/dashboard/project/htwxqoklsnyezddgmika/settings/api${NC}"
  echo -e "  2. Copy the '${YELLOW}service_role${NC}' (secret) key"
  echo -e "  3. Add to .env.local:"
  echo -e "     ${GREEN}SUPABASE_SERVICE_ROLE_KEY=your-key-here${NC}"
  echo ""
  echo -e "Then re-run: ${CYAN}bash scripts/apply-security.sh${NC}"
  exit 1
fi

SUPABASE_URL="${NEXT_PUBLIC_SUPABASE_URL:-https://htwxqoklsnyezddgmika.supabase.co}"
MIGRATION_FILE="supabase/migrations/02_security_hardening.sql"

if [ ! -f "$MIGRATION_FILE" ]; then
  echo -e "${RED}Error: Migration file not found: $MIGRATION_FILE${NC}"
  exit 1
fi

echo -e "Project: ${CYAN}${SUPABASE_URL}${NC}"
echo -e "Migration: ${CYAN}${MIGRATION_FILE}${NC}"
echo ""

MIGRATION_SQL=$(cat "$MIGRATION_FILE")

echo -e "${YELLOW}Applying security migration...${NC}"
echo ""

# Try the Supabase SQL API
ESCAPED_SQL=$(python3 -c "import sys,json; print(json.dumps(open('$MIGRATION_FILE').read()))")

HTTP_STATUS=$(curl -s -o /tmp/migration_result.json -w "%{http_code}" \
  -X POST "${SUPABASE_URL}/rest/v1/rpc/exec_sql" \
  -H "apikey: ${SUPABASE_SERVICE_ROLE_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_SERVICE_ROLE_KEY}" \
  -H "Content-Type: application/json" \
  -d "{\"sql\": ${ESCAPED_SQL}}")

if [ "$HTTP_STATUS" = "200" ]; then
  echo -e "${GREEN}✓ Migration applied successfully via RPC!${NC}"
  cat /tmp/migration_result.json
  echo ""
else
  echo -e "${YELLOW}RPC method failed (HTTP $HTTP_STATUS). Trying direct SQL API...${NC}"
  
  HTTP_STATUS=$(curl -s -o /tmp/migration_result.json -w "%{http_code}" \
    -X POST "${SUPABASE_URL}/pg/query" \
    -H "apikey: ${SUPABASE_SERVICE_ROLE_KEY}" \
    -H "Authorization: Bearer ${SUPABASE_SERVICE_ROLE_KEY}" \
    -H "Content-Type: application/json" \
    -d "{\"query\": ${ESCAPED_SQL}}")
  
  if [ "$HTTP_STATUS" = "200" ]; then
    echo -e "${GREEN}✓ Migration applied successfully via SQL API!${NC}"
    cat /tmp/migration_result.json
    echo ""
  else
    echo -e "${RED}✗ Automated migration failed (HTTP $HTTP_STATUS)${NC}"
    echo ""
    echo -e "${YELLOW}Please apply manually:${NC}"
    echo -e "  1. Open: ${CYAN}https://supabase.com/dashboard/project/htwxqoklsnyezddgmika/sql/new${NC}"
    echo -e "  2. Paste contents of: ${CYAN}${MIGRATION_FILE}${NC}"
    echo -e "  3. Click '${GREEN}Run${NC}'"
    echo ""
    cat /tmp/migration_result.json 2>/dev/null
    exit 1
  fi
fi

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}  Security Migration Complete!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "What was applied:"
echo -e "  ${GREEN}✓${NC} Removed all anonymous access policies"
echo -e "  ${GREEN}✓${NC} Created company-scoped RLS policies"
echo -e "  ${GREEN}✓${NC} Added audit_logs table with triggers"
echo -e "  ${GREEN}✓${NC} Enabled RLS on all tables"
echo ""
echo -e "Next: Remove the service_role key for security"
echo -e "  ${YELLOW}sed -i '/SUPABASE_SERVICE_ROLE_KEY/d' .env.local${NC}"

rm -f /tmp/migration_result.json
