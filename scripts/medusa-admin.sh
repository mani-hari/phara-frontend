#!/usr/bin/env bash
#
# medusa-admin.sh — gated Medusa v2 Admin API caller.
#
# Security model:
#   - The admin secret key lives ONLY in the macOS Keychain (never in .env.local,
#     never in the repo, never in the app env). It is read into memory only for
#     the duration of one call.
#   - Access is default-DENY: this script refuses unless an unexpired "armed"
#     marker exists. Arm a 30-min window with `npm run medusa:unlock`.
#   - Every call is appended to .medusa-admin/audit.log (gitignored).
#
# Usage:
#   scripts/medusa-admin.sh <METHOD> <PATH> [JSON_BODY]
# Examples:
#   scripts/medusa-admin.sh GET  "/admin/products?limit=1&fields=id,handle"
#   scripts/medusa-admin.sh POST "/admin/products/prod_123" '{"handle":"new-slug"}'
#
set -euo pipefail

SERVICE="parihara-medusa-admin"      # Keychain service name
ACCOUNT="medusa-admin"               # Keychain account name
BACKEND="https://pariharaonline.medusajs.app"

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ARM_FILE="$ROOT/.medusa-admin.armed"
AUDIT_DIR="$ROOT/.medusa-admin"
AUDIT="$AUDIT_DIR/audit.log"

die() { echo "$1" >&2; exit "${2:-1}"; }

# 1) Toggle gate — must be armed and not expired.
[ -f "$ARM_FILE" ] || die "🔒 Medusa admin is LOCKED. Run:  npm run medusa:unlock" 3
EXP="$(cat "$ARM_FILE" 2>/dev/null || echo 0)"
NOW="$(date +%s)"
if ! [[ "$EXP" =~ ^[0-9]+$ ]] || [ "$NOW" -ge "$EXP" ]; then
  rm -f "$ARM_FILE"
  die "🔒 Admin window expired (auto-locked). Run:  npm run medusa:unlock" 3
fi

# 2) Fetch key from Keychain (in-memory only).
KEY="$(security find-generic-password -s "$SERVICE" -a "$ACCOUNT" -w 2>/dev/null || true)"
[ -n "$KEY" ] || die "❌ No admin key in Keychain ($SERVICE). Run:  npm run medusa:key:set" 4
BASIC="$(printf '%s:' "$KEY" | base64)"

# 3) Args + audit.
METHOD="${1:-GET}"
REQ_PATH="${2:-/admin/products?limit=1}"
BODY="${3:-}"
mkdir -p "$AUDIT_DIR"
printf '%s  %s %s\n' "$(date -u +%FT%TZ)" "$METHOD" "$REQ_PATH" >> "$AUDIT"

# 4) Call (key never echoed).
if [ -n "$BODY" ]; then
  curl -sS --max-time 60 -X "$METHOD" "$BACKEND$REQ_PATH" \
    -H "Authorization: Basic $BASIC" -H "Content-Type: application/json" -d "$BODY"
else
  curl -sS --max-time 60 -X "$METHOD" "$BACKEND$REQ_PATH" \
    -H "Authorization: Basic $BASIC"
fi
