#!/usr/bin/env python3
"""
Unified blog scheduler — merges the not-yet-published remainder of batch one
with all of batch two into ONE pool, re-sequenced by festival relevance and
series-completion value, then re-dated at a 3/day -> 2/day -> 1/day cadence.

Supersedes scripts/blog-schedule.mjs (archived, batch-one-only).
Owner decision, 2026-10-03: don't keep batches separate; merge, re-rank by
upcoming festivals, kill the old per-batch schedule, "properly upload it."

Run:  python3 scripts/blog-schedule-unified.py [--dry]
Already-published posts (publishedAt <= today) are NEVER touched: their files,
dates, and content stay exactly as they are, since they are live and indexed.
"""
import json, os, re, shutil, sys
from datetime import date, timedelta
import yaml  # pip install pyyaml if missing; fallback below handles it

DRY = "--dry" in sys.argv
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TODAY = date(2026, 10, 3)  # today, per the session's confirmed system clock
START = TODAY + timedelta(days=1)  # tomorrow — today's 3 are already live

BLOG_DIR = os.path.join(ROOT, "content/blog")
BATCH2_DIR = os.path.join(ROOT, "content/blog-batch2")
BATCH2_IMG = os.path.join(BATCH2_DIR, "images")
PUBLIC_IMG = os.path.join(ROOT, "public/blog")
PLAN1 = os.path.join(ROOT, "content/blog-plan/plan.json")
PLAN2 = os.path.join(ROOT, "content/blog-plan-2/plan.json")

# ---------------------------------------------------------------------------
# 1. Load both plans, tag with their origin and whether the post is already live.
# ---------------------------------------------------------------------------
plan1 = json.load(open(PLAN1))
plan2 = json.load(open(PLAN2))
posts1 = plan1["posts"] + plan1.get("extras", [])
posts2 = plan2["posts"]

def read_frontmatter(path):
    text = open(path, encoding="utf-8").read()
    m = re.match(r"^---\n(.*?)\n---\n(.*)$", text, re.S)
    assert m, f"no frontmatter in {path}"
    fm = yaml.safe_load(m.group(1))
    return fm, m.group(2)

pool = []  # posts still to be (re)scheduled
frozen = 0
for p in posts1:
    f = os.path.join(BLOG_DIR, p["slug"] + ".md")
    if not os.path.exists(f):
        continue  # shouldn't happen, but don't crash the run over it
    fm, _ = read_frontmatter(f)
    pubd = str(fm.get("publishedAt", "9999-99-99"))[:10]
    if pubd <= TODAY.isoformat() and fm.get("draft") is not True:
        frozen += 1
        continue  # already live — never touch
    pool.append({**p, "origin": "batch1", "path": f})

for p in posts2:
    src_md = os.path.join(BATCH2_DIR, p["slug"] + ".md")
    assert os.path.exists(src_md), f"missing batch2 file {p['slug']}"
    pool.append({**p, "origin": "batch2", "path": src_md})

print(f"Already live (untouched): {frozen}")
print(f"Pool to (re)schedule: {len(pool)}  (expect ~{100}+300={400})")

# ---------------------------------------------------------------------------
# 2. Deadlines — merged cluster map (lead time baked into the date chosen),
#    covering both batches. Verified dates from the festival-calendar skill
#    file; a few winter/spring 2027 dates are reasonable estimates (noted),
#    which only affects scheduling order, never what the evergreen post says.
# ---------------------------------------------------------------------------
CLUSTER_DEADLINE = {
    # batch one
    "navratri-meaning": "2026-10-08", "navratri-usa": "2026-10-08",
    "exams-education": "2026-10-13",       # Saraswati Puja 17 Oct
    "diwali-meaning": "2026-11-01", "diwali-in-usa": "2026-11-01",
    "murugan-skanda": "2026-11-01",        # Kanda Sashti starts 10 Nov
    "karthigai-deepam": "2026-11-10",
    "ekadashi-fasting": "2026-12-05",      # Vaikunta Ekadashi 20 Dec
    "pongal-sankranti": "2027-01-01",
    "maha-shivaratri": "2027-02-01", "holi": "2027-02-20",
    # batch two
    "festivals-winter-guru": "2026-11-20",  # see per-slug overrides below
}
# Per-slug overrides where a cluster mixes near-term and far-off festivals.
SLUG_DEADLINE = {
    # festivals-winter-guru: split by actual festival
    "kartik-purnima-significance": "2026-11-10",
    "tulsi-vivah-meaning": "2026-11-05",
    "arudra-darshan-meaning": "2026-12-20",
    "guru-purnima-meaning": None,            # passed 2026, next Jul 2027 — evergreen
    "ratha-saptami-significance": "2027-01-15",   # ~early Feb 2027, estimated
    "vasant-panchami-saraswati": "2027-01-10",    # ~early Feb 2027, estimated
    # festival-prasadam: only the Margazhi/Pongal-season recipes are time-bound
    "thiruvathirai-kali-recipe": "2026-12-15",
    "ellu-urundai-sesame-balls": "2026-12-25",
    "karadaiyan-nombu-adai": "2027-02-20",  # Tamil month-end ritual, ~mid-Mar 2027
    # everything else in festivals-aadi-monsoon / festivals-krishna-ganesha /
    # festivals-new-year / festivals-summer / the rest of festival-prasadam
    # already passed its 2026 occurrence or is 6+ months out — evergreen,
    # no deadline, scheduled by importance tier instead.
}

def deadline_of(p):
    if p["slug"] in SLUG_DEADLINE:
        return SLUG_DEADLINE[p["slug"]]
    return CLUSTER_DEADLINE.get(p["cluster"])

# ---------------------------------------------------------------------------
# 3. Priority tiers for everything without a hard deadline.
#    0 = has a deadline (sorted by deadline ascending — handled separately)
#    1 = nakshatra / rasi series — finish fast for AEO completeness
#    2 = hub-worthy evergreen: major named topics, commercial-intent, temples
#    3 = general evergreen (mythology, practice, seeker, remaining festivals)
# ---------------------------------------------------------------------------
TIER2_CLUSTERS = {
    "puja-at-home", "homam-explained", "online-puja-usa", "prasadam-usa",
    "marriage-delay", "conceiving-pregnancy", "health-longevity",
    "griha-pravesh", "pitru-ancestors", "sade-sati", "navagraha-rahu-ketu",
    "temples-devotees-ask", "our-temples", "satyanarayan-puja",
}

def tier_of(p):
    if p["cluster"] in ("birth-stars", "rasis"):
        return 1
    if p["cluster"] in TIER2_CLUSTERS:
        return 2
    return 3

NAK_ORDER = ["ashwini","bharani","krittika","rohini","mrigashira","ardra",
    "punarvasu","pushya","ashlesha","magha","purva-phalguni","uttara-phalguni",
    "hasta","chitra","swati","vishakha","anuradha","jyeshtha","mula",
    "purva-ashadha","uttara-ashadha","shravana","dhanishta","shatabhisha",
    "purva-bhadrapada","uttara-bhadrapada","revati"]
RASI_ORDER = ["mesha","rishabha","mithuna","kataka","simha","kanya","tula",
    "vrischika","dhanu","makara","kumbha","meena"]
def series_rank(p):
    for i, n in enumerate(NAK_ORDER):
        if p["slug"].startswith(n + "-nakshatra"): return i
    for i, n in enumerate(RASI_ORDER):
        if p["slug"].startswith(n + "-rasi"): return 100 + i
    return 200

# ---------------------------------------------------------------------------
# 4. Sort: deadline posts first (earliest deadline first), then tier 1
#    (series, in natural order), then tier 2, then tier 3 (stable by cluster
#    name then slug, so related evergreen posts land near each other without
#    being identical-cluster clumps every single day).
# ---------------------------------------------------------------------------
for p in pool:
    p["_deadline"] = deadline_of(p)
    p["_tier"] = 0 if p["_deadline"] else tier_of(p)

deadline_posts = sorted([p for p in pool if p["_deadline"]], key=lambda p: (p["_deadline"], p["cluster"], p["slug"]))
tier1 = sorted([p for p in pool if not p["_deadline"] and p["_tier"] == 1], key=series_rank)
tier2 = sorted([p for p in pool if not p["_deadline"] and p["_tier"] == 2], key=lambda p: (p["cluster"], p["slug"]))
tier3 = sorted([p for p in pool if not p["_deadline"] and p["_tier"] == 3], key=lambda p: (p["cluster"], p["slug"]))

# Interleave tier1 series posts early (within the first ~5 weeks) rather than
# dumping them all consecutively — alternate a nakshatra/rasi post with a
# deadline post where both queues are still running, for daily variety.
ordered = []
d_q, s_q, t2_q, t3_q = list(deadline_posts), list(tier1), list(tier2), list(tier3)
while d_q or s_q or t2_q or t3_q:
    if d_q: ordered.append(d_q.pop(0))
    if s_q: ordered.append(s_q.pop(0))
    if d_q: ordered.append(d_q.pop(0))
    if t2_q: ordered.append(t2_q.pop(0))
    if t3_q: ordered.append(t3_q.pop(0))

assert len(ordered) == len(pool), f"{len(ordered)} != {len(pool)}"

# ---------------------------------------------------------------------------
# 5. Assign dates at 3/day (6 weeks) -> 2/day (6 weeks) -> 1/day (rest).
# ---------------------------------------------------------------------------
PHASE1_DAYS, PHASE1_RATE = 42, 3
PHASE2_DAYS, PHASE2_RATE = 42, 2
dated = []
d = START
idx = 0
day_n = 0
while idx < len(ordered):
    rate = PHASE1_RATE if day_n < PHASE1_DAYS else (PHASE2_RATE if day_n < PHASE1_DAYS + PHASE2_DAYS else 1)
    for _ in range(rate):
        if idx >= len(ordered): break
        dated.append((d, ordered[idx])); idx += 1
    d += timedelta(days=1); day_n += 1

end_date = dated[-1][0]
print(f"Last scheduled date: {end_date.isoformat()}  ({day_n} days of content)")

# Safety check: no deadline post lands after its deadline.
late = [(dd, p) for dd, p in dated if p["_deadline"] and dd.isoformat() > p["_deadline"]]
if late:
    print(f"WARNING: {len(late)} posts land after their deadline:")
    for dd, p in late[:10]:
        print(f"  {p['slug']}: scheduled {dd}, deadline {p['_deadline']}")
else:
    print("All deadline-bound posts land on or before their deadline. Good.")

# ---------------------------------------------------------------------------
# 6. Write it: update frontmatter in place for batch-1 posts; move + update
#    frontmatter + move hero image for batch-2 posts.
# ---------------------------------------------------------------------------
if DRY:
    print("\n--dry run, nothing written. First 20 assignments:")
    for dd, p in dated[:20]:
        print(f"  {dd}  {p['origin']:7s} {p['cluster']:22s} {p['slug']}")
    sys.exit(0)

os.makedirs(PUBLIC_IMG, exist_ok=True)
moved_images = 0
for dd, p in dated:
    iso = dd.isoformat()
    fm, body = read_frontmatter(p["path"])
    fm["publishedAt"] = iso
    fm["updatedAt"] = iso
    new_yaml = yaml.safe_dump(fm, sort_keys=False, allow_unicode=True, width=100)
    new_text = f"---\n{new_yaml}---\n{body}"

    if p["origin"] == "batch1":
        open(p["path"], "w", encoding="utf-8").write(new_text)
    else:  # batch2 — move into the live content/blog dir
        dest = os.path.join(BLOG_DIR, p["slug"] + ".md")
        open(dest, "w", encoding="utf-8").write(new_text)
        src_img = os.path.join(BATCH2_IMG, p["slug"] + ".webp")
        dest_img = os.path.join(PUBLIC_IMG, p["slug"] + ".webp")
        if os.path.exists(src_img) and not os.path.exists(dest_img):
            shutil.copy2(src_img, dest_img)
            moved_images += 1
        os.remove(p["path"])  # remove from blog-batch2 now that it's live in content/blog

print(f"Wrote {len(dated)} posts, moved {moved_images} hero images into public/blog/")

# ---------------------------------------------------------------------------
# 7. Human-readable unified schedule record.
# ---------------------------------------------------------------------------
rows = [f"| {dd.isoformat()} | {p['origin']} | {p['cluster']} | [{p.get('title','')}](/blog/{p['slug']}) |" for dd, p in dated]
out = os.path.join(ROOT, "content/blog-plan/UNIFIED-SCHEDULE.md")
with open(out, "w", encoding="utf-8") as f:
    f.write(f"""# Unified publish schedule (batch one remainder + batch two merged)

Generated {TODAY.isoformat()} by scripts/blog-schedule-unified.py. Supersedes the
separate batch-one and batch-two schedules — owner decision, 2026-10-03: merge
both pools, re-rank by upcoming-festival relevance, finish the nakshatra/rasi
series early, then run 3/day for 6 weeks, 2/day for 6 weeks, 1/day thereafter.

{frozen} posts already live before {START.isoformat()} are untouched.
Last scheduled date: **{end_date.isoformat()}**.

| Date | Batch | Cluster | Post |
|---|---|---|---|
{chr(10).join(rows)}
""")
print(f"Wrote {out}")
