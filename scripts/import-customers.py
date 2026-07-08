#!/usr/bin/env python3
"""Import Shopify customers into Medusa with lifetime-value metadata, and put
high-value / repeat buyers into customer groups for targeting.

Dry-run by default (parse + show group sizes/thresholds). --apply to write.
Reads the admin key from macOS Keychain; run inside an armed window.

  python3 scripts/import-customers.py            # dry run
  python3 scripts/import-customers.py --apply     # create + group for real
"""
import csv, json, subprocess, sys, base64, urllib.request, urllib.error, os, statistics, ssl

import re
try:
    import certifi
    SSL_CTX = ssl.create_default_context(cafile=certifi.where())
except Exception:
    SSL_CTX = ssl._create_unverified_context()

# Postgres rejects NULL bytes / C0 control chars in text/jsonb.
_BAD = re.compile(r"[\x00-\x08\x0b\x0c\x0e-\x1f]")
def scrub(v):
    if isinstance(v, str):
        return _BAD.sub("", v)
    if isinstance(v, list):
        return [scrub(x) for x in v]
    if isinstance(v, dict):
        return {k: scrub(x) for k, x in v.items()}
    return v

HOST = os.environ.get("MEDUSA_HOST", "https://pariharaonline.medusajs.app")
CSV_PATH = os.path.join(os.path.dirname(__file__), "..", "customer_data", "customers_export.csv")
APPLY = "--apply" in sys.argv
REPEAT_MIN_ORDERS = 2

def admin_key():
    return subprocess.check_output(
        ["security", "find-generic-password", "-s", "parihara-medusa-admin", "-a", "medusa-admin", "-w"]
    ).decode().strip()

AUTH = None
def api(method, path, body=None):
    data = json.dumps(body).encode() if body is not None else None
    req = urllib.request.Request(HOST + path, data=data, method=method,
        headers={"Authorization": f"Basic {AUTH}", "Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(req, context=SSL_CTX) as r:
            return json.loads(r.read().decode() or "{}"), None
    except urllib.error.HTTPError as e:
        return None, (e.code, e.read().decode()[:200])

def to_float(s):
    try:
        return float(str(s).replace(",", "").strip() or 0)
    except ValueError:
        return 0.0

def parse():
    rows = []
    with open(CSV_PATH, newline="", encoding="utf-8") as f:
        for r in csv.DictReader(f):
            email = (r.get("Email") or "").strip().lower()
            if not email:
                continue  # Medusa customers require an email
            rows.append({
                "email": email,
                "first_name": (r.get("First Name") or "").strip() or None,
                "last_name": (r.get("Last Name") or "").strip() or None,
                "phone": (r.get("Phone") or r.get("Default Address Phone") or "").strip() or None,
                "company_name": (r.get("Default Address Company") or "").strip() or None,
                "total_spent": (r.get("Total Spent") or "").strip(),
                "total_orders": (r.get("Total Orders") or "").strip(),
                "raw": r,
            })
    return rows

def main():
    rows = parse()
    spends = [to_float(r["total_spent"]) for r in rows if to_float(r["total_spent"]) > 0]
    vip_threshold = round(statistics.quantiles(spends, n=10)[-1], 2) if len(spends) > 10 else (max(spends) if spends else 0)
    vip = [r for r in rows if to_float(r["total_spent"]) >= vip_threshold and vip_threshold > 0]
    repeat = [r for r in rows if to_float(r["total_orders"]) >= REPEAT_MIN_ORDERS]

    print(f"Customers with email: {len(rows)}")
    print(f"Buyers (spend>0): {len(spends)}")
    print(f"VIP threshold (90th pct spend): {vip_threshold} → {len(vip)} customers")
    print(f"Repeat buyers (>= {REPEAT_MIN_ORDERS} orders): {len(repeat)} customers")

    if not APPLY:
        print("\nDry run — nothing written. Re-run with --apply.")
        return

    global AUTH
    AUTH = base64.b64encode((admin_key() + ":").encode()).decode()

    # existing email -> id
    existing = {}
    off = 0
    while True:
        res, err = api("GET", f"/admin/customers?limit=1000&offset={off}&fields=id,email")
        if err or not res:
            break
        for c in res.get("customers", []):
            if c.get("email"):
                existing[c["email"].lower()] = c["id"]
        if off + 1000 >= res.get("count", 0):
            break
        off += 1000
    print(f"Existing customers in Medusa: {len(existing)}")

    email_to_id = dict(existing)
    created = skipped = failed = 0
    for r in rows:
        if r["email"] in email_to_id:
            skipped += 1
            continue
        body = {
            "email": r["email"],
            "first_name": r["first_name"],
            "last_name": r["last_name"],
            "phone": r["phone"],
            "company_name": r["company_name"],
            "metadata": {
                "shopify_total_spent": r["total_spent"],
                "shopify_total_orders": r["total_orders"],
                "shopify_raw": r["raw"],
            },
        }
        res, err = api("POST", "/admin/customers", scrub({k: v for k, v in body.items() if v is not None}))
        if err:
            failed += 1
            if failed <= 5:
                print("  create failed:", r["email"], err)
        else:
            email_to_id[r["email"]] = res["customer"]["id"]
            created += 1
            if created % 250 == 0:
                print(f"  created {created}…")
    print(f"Created {created}, skipped {skipped} (existing), failed {failed}")

    # groups
    def ensure_group(name):
        res, _ = api("GET", f"/admin/customer-groups?name={urllib.parse.quote(name)}")
        for g in (res or {}).get("customer_groups", []):
            if g.get("name") == name:
                return g["id"]
        res, err = api("POST", "/admin/customer-groups", {"name": name})
        return res["customer_group"]["id"] if not err else None

    import urllib.parse
    for label, members in [(f"VIP – High Value (>= {vip_threshold})", vip),
                           (f"Repeat Buyers ({REPEAT_MIN_ORDERS}+ orders)", repeat)]:
        gid = ensure_group(label)
        ids = [email_to_id[m["email"]] for m in members if m["email"] in email_to_id]
        n = 0
        for i in range(0, len(ids), 200):
            _, err = api("POST", f"/admin/customer-groups/{gid}/customers", {"add": ids[i:i+200]})
            if not err:
                n += len(ids[i:i+200])
        print(f"Group '{label}': assigned {n}")

    print("\n✓ Customer import complete.")

if __name__ == "__main__":
    main()
