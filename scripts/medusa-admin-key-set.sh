#!/usr/bin/env bash
#
# medusa-admin-key-set.sh — store/rotate the Medusa admin secret key in the
# macOS Keychain. Run this once at setup, or again to rotate the key.
# The key is entered interactively (hidden) and never written to disk or git.
#
# Usage:  npm run medusa:key:set
#
set -euo pipefail
SERVICE="parihara-medusa-admin"
ACCOUNT="medusa-admin"

printf "Paste Medusa admin secret key (sk_...), then Enter: "
read -r -s KEY
echo
[ -n "$KEY" ] || { echo "No key entered — aborted." >&2; exit 1; }

security add-generic-password -U -s "$SERVICE" -a "$ACCOUNT" -w "$KEY"
echo "✅ Stored in macOS Keychain (service: $SERVICE)."
echo "   It is NOT in .env.local, the repo, or the app env."
echo "   Remember to revoke any old key in Medusa Admin after rotating."
