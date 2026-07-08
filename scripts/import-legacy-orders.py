#!/usr/bin/env python3
"""Import historical Shopify orders into the Medusa `legacy_order` archive.

Reads customer_data/orders_export_1.csv (Shopify line-item-per-row format),
groups rows by order name, and POSTs lossless records to the deployed backend's
/admin/legacy-orders route. Dry-run by default; pass --apply to write.

Auth: reads the admin key from macOS Keychain (same as scripts/medusa-admin.sh).
Run inside an armed window (npm run medusa:unlock).

  python3 scripts/import-legacy-orders.py            # dry run (parse + summary)
  python3 scripts/import-legacy-orders.py --apply     # wipe + import for real
"""
import csv, json, subprocess, sys, base64, urllib.request, os

HOST = os.environ.get("MEDUSA_HOST", "https://pariharaonline.medusajs.app")
CSV_PATH = os.path.join(os.path.dirname(__file__), "..", "customer_data", "orders_export_1.csv")
APPLY = "--apply" in sys.argv
BATCH = 100

def admin_key():
    return subprocess.check_output(
        ["security", "find-generic-password", "-s", "parihara-medusa-admin", "-a", "medusa-admin", "-w"]
    ).decode().strip()

AUTH = None
def api(method, path, body=None):
    data = json.dumps(body).encode() if body is not None else None
    req = urllib.request.Request(HOST + path, data=data, method=method,
        headers={"Authorization": f"Basic {AUTH}", "Content-Type": "application/json"})
    with urllib.request.urlopen(req) as r:
        return json.loads(r.read().decode() or "{}")

def addr(row, prefix):
    keys = ["Name","Street","Address1","Address2","Company","City","Zip","Province","Province Name","Country","Phone"]
    a = {k.lower().replace(" ","_"): (row.get(f"{prefix} {k}") or "").strip() for k in keys}
    return a if any(a.values()) else None

def main():
    # Group line-item rows by order name.
    orders = {}
    with open(CSV_PATH, newline="", encoding="utf-8") as f:
        for row in csv.DictReader(f):
            name = (row.get("Name") or "").strip()
            if not name:
                continue
            o = orders.setdefault(name, {"order_number": name, "rows": [], "line_items": []})
            o["rows"].append(row)
            li_name = (row.get("Lineitem name") or "").strip()
            if li_name:
                o["line_items"].append({
                    "quantity": (row.get("Lineitem quantity") or "").strip(),
                    "name": li_name,
                    "price": (row.get("Lineitem price") or "").strip(),
                    "compare_at_price": (row.get("Lineitem compare at price") or "").strip(),
                    "sku": (row.get("Lineitem sku") or "").strip(),
                    "requires_shipping": (row.get("Lineitem requires shipping") or "").strip(),
                    "taxable": (row.get("Lineitem taxable") or "").strip(),
                    "fulfillment_status": (row.get("Lineitem fulfillment status") or "").strip(),
                    "discount": (row.get("Lineitem discount") or "").strip(),
                })

    records = []
    for name, o in orders.items():
        # Order-level fields come from the first row that carries a Total.
        head = next((r for r in o["rows"] if (r.get("Total") or "").strip()), o["rows"][0])
        g = lambda k: (head.get(k) or "").strip() or None
        records.append({
            "order_number": name,
            "shopify_id": g("Id"),
            "email": (g("Email") or "").lower() or None,
            "customer_name": g("Billing Name") or g("Shipping Name"),
            "order_date": g("Created at"),
            "financial_status": g("Financial Status"),
            "fulfillment_status": g("Fulfillment Status"),
            "currency": g("Currency"),
            "subtotal": g("Subtotal"),
            "shipping": g("Shipping"),
            "taxes": g("Taxes"),
            "total": g("Total"),
            "discount_code": g("Discount Code"),
            "discount_amount": g("Discount Amount"),
            "refunded_amount": g("Refunded Amount"),
            "payment_method": g("Payment Method"),
            "tags": g("Tags"),
            "notes": g("Notes"),
            "cancelled_at": g("Cancelled at"),
            "shipping_address": addr(head, "Shipping"),
            "billing_address": addr(head, "Billing"),
            "line_items": o["line_items"],
            "raw": o["rows"],
        })

    print(f"Parsed {len(records)} orders ({sum(len(r['line_items']) for r in records)} line items).")
    print("Sample:", json.dumps({k: records[0][k] for k in ("order_number","email","order_date","total","currency")}, indent=2))
    print(f"  line items in sample: {len(records[0]['line_items'])}")

    if not APPLY:
        print("\nDry run — nothing written. Re-run with --apply.")
        return

    global AUTH
    AUTH = base64.b64encode((admin_key() + ":").encode()).decode()
    print("\nWiping existing archive…")
    print("  deleted:", api("DELETE", "/admin/legacy-orders").get("deleted"))
    total = 0
    for i in range(0, len(records), BATCH):
        chunk = records[i:i+BATCH]
        res = api("POST", "/admin/legacy-orders", {"orders": chunk})
        total += res.get("created", 0)
        print(f"  imported {total}/{len(records)}")
    print(f"\n✓ Imported {total} legacy orders.")

if __name__ == "__main__":
    main()
