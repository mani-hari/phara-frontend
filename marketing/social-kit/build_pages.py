# Builds the local, offline setup pages for PariharaOnline's social and ads accounts.
# Open marketing/social-kit/index.html in a browser. Re-run: python3 build_pages.py
import html, json, os
HERE = os.path.dirname(os.path.abspath(__file__))
SITE = "https://www.pariharaonline.com"
def utm(src, camp="profile", path="/"): return f"{SITE}{path}?utm_source={src}&utm_medium=organic&utm_campaign={camp}"

CONTACT_PHONE = "+91 97432 44501"
CONTACT_EMAIL = "hello@pariharaonline.com"
HOURS = "Mon–Sat, 9 AM–6 PM IST"
IG_BIO = "Temple poojas and Vedic homams, performed in your family's name. Prasadam delivered worldwide. Since 2009."
FB_INTRO = "Temple poojas and Vedic homams performed by our priests with sankalpam in your family's name, at renowned temples and our yagasala. Prasadam delivered worldwide. Serving families in India and abroad since 2009."
YT_DESC = f"""PariharaOnline performs temple poojas and Vedic homams in your family's name, with sankalpam taken by our priests, and delivers prasadam worldwide. On this channel: real homam films from our yagasala, the meaning of the mantras, festival guides (what to do and when), and stories from the Puranas.

Book a pooja or homam: {utm('youtube','channel')}
Light a lamp in our Digital Aarti: {utm('youtube','channel','/aarti')}
WhatsApp: {CONTACT_PHONE} · {CONTACT_EMAIL}"""

PAGES = [
 {"file":"1-youtube.html","title":"YouTube channel","status":"Already exists: @Pariharaonline",
  "why":"Your channel already exists (the homam videos on the website come from it). We only need the company Google account to manage it, then I refresh its look and description.",
  "where":"https://studio.youtube.com",
  "fields":[("Channel name","PariharaOnline"),("Handle","@Pariharaonline"),("Channel description",YT_DESC),("Links: Website",utm('youtube','channel')),("Links: Digital Aarti",utm('youtube','channel','/aarti')),("Contact email",CONTACT_EMAIL)],
  "images":[("Profile picture","profile-1080.png","Upload as the channel picture (shown as a circle)."),("Banner","youtube-banner-2560x1440.jpg","Upload as the banner. Text sits in the safe centre area, so it shows on phones, desktop and TV.")],
  "steps":["Open YouTube Studio signed in with the account that owns @Pariharaonline.","Settings → Permissions: if harkarmallp@gmail.com is not there, Invite → harkarmallp@gmail.com → role Manager.","Accept the invite from the harkarmallp@gmail.com inbox.","Tell me it's done: I update the picture, banner, description and links (or paste them yourself from this page under Customisation → Branding / Basic info)."]},
 {"file":"2-facebook-page.html","title":"Facebook Page","status":"To create",
  "why":"The business's public page on Facebook. Meta only allows Pages to be created from a personal Facebook profile (yours). The Page shows only the business name, never your personal profile.",
  "where":"https://www.facebook.com/pages/create",
  "fields":[("Page name","PariharaOnline"),("Category","Religious organization"),("Bio / Intro (255 max)",FB_INTRO),("Website",utm('facebook')),("Phone / WhatsApp",CONTACT_PHONE),("Email",CONTACT_EMAIL),("Hours",HOURS),("Username (if offered)","pariharaonline")],
  "images":[("Profile picture","profile-1080.png","Shown as a circle."),("Cover photo","facebook-cover-1640x624.jpg","Phones crop the sides; the logo and text are in the middle.")],
  "steps":["Log in to Facebook with your personal profile.","Open the 'Create a Page' link above (or Menu → Pages → Create new Page).","Page name: PariharaOnline. Category: Religious organization (add 'Website' as a second category if offered). Bio: copy from below. Create Page.","Add the profile picture and cover photo from this page.","Fill contact details: website, phone/WhatsApp, email, hours (copy from below).","Settings → Page setup → Username: pariharaonline (if available).","Skip 'invite friends' if you prefer. Tell me when done."]},
 {"file":"3-instagram.html","title":"Instagram (professional)","status":"To create or convert",
  "why":"The business's Instagram, switched to a professional (Business) account so it can show stats, run ads and be posted to from Meta's tools.",
  "where":"https://www.instagram.com/accounts/emailsignup/",
  "fields":[("Username","pariharaonline"),("Backup username","pariharaonline.official"),("Name","PariharaOnline"),("Bio (150 max)",IG_BIO),("Link in bio",utm('instagram')),("Category","Religious organization"),("Email",CONTACT_EMAIL),("Phone",CONTACT_PHONE)],
  "images":[("Profile picture","profile-1080.png","Shown as a circle.")],
  "steps":["If @pariharaonline already exists, log in to it. Otherwise sign up with hello@pariharaonline.com or harkarmallp@gmail.com.","Username: pariharaonline (backup: pariharaonline.official). Name: PariharaOnline.","Profile → Edit profile: picture, bio and link from this page.","Settings → Account type and tools → Switch to professional account → Business → category Religious organization.","When asked, connect it to the PariharaOnline Facebook Page (or later from the Page: Settings → Linked accounts → Instagram).","Tell me when done."]},
 {"file":"4-meta-business.html","title":"Meta Business portfolio","status":"To create",
  "why":"A private 'owner' folder (Meta Business Suite) that holds the Facebook Page, Instagram, the ad account and the Pixel, and controls who on your team has access. Customers never see it.",
  "where":"https://business.facebook.com/overview",
  "fields":[("Business portfolio name","PariharaOnline"),("Your name","(your own name)"),("Business email",CONTACT_EMAIL),("Website",SITE),("Legal name (only if Meta asks, for business verification)","Harkarma LLP")],
  "images":[],
  "steps":["Open business.facebook.com signed in with your personal Facebook profile.","Create a business portfolio → name PariharaOnline, your name, business email.","Settings (Business settings) → Accounts → Pages → Add → the PariharaOnline Page.","Settings → Accounts → Instagram accounts → Add → @pariharaonline.","Keep the legal name (Harkarma LLP) only in private verification fields; never on the public Page.","Tell me when done."]},
 {"file":"5-meta-ads.html","title":"Meta ad account","status":"To create (inside the portfolio)",
  "why":"Where Facebook/Instagram ad budgets and your card live. Created inside the Business portfolio. No ads run until you approve a first campaign and budget.",
  "where":"https://business.facebook.com/settings/ad-accounts",
  "fields":[("Ad account name","PariharaOnline Ads"),("Time zone","Asia/Kolkata (GMT+05:30)"),("Currency","INR – Indian Rupee"),("Monthly spending limit (proposed)","6000")],
  "images":[],
  "steps":["Business settings → Accounts → Ad accounts → Add → Create a new ad account.","Name: PariharaOnline Ads. Time zone: Asia/Kolkata. Currency: INR. These two can NEVER be changed later. INR works for US NRI ads too.","'This ad account will be used for': My business (PariharaOnline).","Add yourself with full control.","Payment settings → add your card (only you can do this).","Payment settings → Account spending limit → set the agreed monthly cap (proposed ₹6,000 to start; we confirm before any ad runs).","Tell me when done: I then create the Meta Pixel (dataset) and install it on the website with Conversions API."]},
 {"file":"6-google-ads.html","title":"Google Ads","status":"To create",
  "why":"Google's ad account, for search ads (first target: NRI families in the US searching for things like Garbharakshambigai ghee or online homams). Linked to Google Analytics so we can see which ads bring sales.",
  "where":"https://ads.google.com/",
  "fields":[("Google account to use","harkarmallp@gmail.com"),("Business name","PariharaOnline"),("Website",SITE),("Billing country","India"),("Time zone","(GMT+05:30) India Standard Time"),("Currency","INR – Indian Rupee")],
  "images":[],
  "steps":["Open ads.google.com signed in with harkarmallp@gmail.com.","When it starts the guided campaign: choose 'Switch to Expert Mode' (small link at the bottom).","Choose 'Create an account without a campaign'.","Billing country India, time zone India, currency INR (permanent). Submit.","Billing → add your card (only you can do this). No campaign runs yet.","Tell me when done: I link it to Google Analytics (purchases and WhatsApp clicks become conversions)."]},
]

CSS = """
:root{--paper:#faf6ee;--card:#fffdf7;--ink:#1a1410;--ink2:#4a3f36;--ink3:#7a6e63;--line:#e8dfcf;--accent:#b6442e;--gold:#b88746;--ok:#2f7a4a}
*{box-sizing:border-box}body{margin:0;background:var(--paper);color:var(--ink2);font:16px/1.6 -apple-system,BlinkMacSystemFont,"Segoe UI",Inter,Arial,sans-serif}
.wrap{max-width:860px;margin:0 auto;padding:28px 18px 64px}
a{color:var(--accent)}h1,h2{font-family:Georgia,"Times New Roman",serif;font-weight:400;color:var(--ink);line-height:1.2}
h1{font-size:32px;margin:6px 0 10px}h2{font-size:22px;margin:30px 0 12px}
.eyebrow{font-size:12px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:var(--gold)}
.back{font-size:14px;font-weight:600;text-decoration:none}
.card{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:18px 20px;margin:12px 0}
.status{display:inline-block;font-size:12.5px;font-weight:700;padding:3px 10px;border-radius:99px;background:#f0e2c4;color:#7a5a20}
.open{display:inline-block;margin-top:10px;background:var(--accent);color:#fff;text-decoration:none;font-weight:700;padding:10px 18px;border-radius:9px}
.field{display:grid;grid-template-columns:200px 1fr auto;gap:12px;align-items:start;padding:12px 0;border-top:1px solid var(--line)}
.field:first-child{border-top:0}.label{font-size:13.5px;font-weight:700;color:var(--ink)}
.value{white-space:pre-wrap;word-break:break-word;font-size:14.5px;background:#fff;border:1px solid var(--line);border-radius:8px;padding:8px 10px}
.count{display:block;font-size:12px;color:var(--ink3);margin-top:4px}
button.copy{border:1px solid var(--line);background:#fff;border-radius:8px;padding:8px 12px;font-weight:600;cursor:pointer;color:var(--ink)}
button.copy.done{background:var(--ok);color:#fff;border-color:var(--ok)}
ol.steps{list-style:none;padding:0;margin:0}ol.steps li{display:flex;gap:12px;padding:10px 0;border-top:1px solid var(--line)}ol.steps li:first-child{border-top:0}
ol.steps input{width:20px;height:20px;margin-top:3px;accent-color:var(--ok);flex-shrink:0}ol.steps li.checked span{color:var(--ink3);text-decoration:line-through}
.imgs{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:14px}.imgs img{width:100%;border-radius:10px;border:1px solid var(--line);display:block;background:#fff}
.imgs p{margin:6px 0 0;font-size:13.5px}.note{font-size:14px;color:var(--ink3)}
.grid{display:grid;gap:12px}.item{display:flex;justify-content:space-between;align-items:center;gap:12px;text-decoration:none;color:inherit}
.item strong{color:var(--ink);font-size:17px}.prog{font-size:13px;color:var(--ink3);white-space:nowrap}
@media(max-width:640px){.field{grid-template-columns:1fr}}
"""
JS = """
function copyText(btn,text){const done=()=>{btn.textContent='Copied';btn.classList.add('done');setTimeout(()=>{btn.textContent='Copy';btn.classList.remove('done')},1600)};
 if(navigator.clipboard&&window.isSecureContext!==false){navigator.clipboard.writeText(text).then(done,()=>fallback())}else fallback();
 function fallback(){const t=document.createElement('textarea');t.value=text;document.body.appendChild(t);t.select();try{document.execCommand('copy');done()}catch(e){}t.remove()}}
document.querySelectorAll('button.copy').forEach(b=>b.addEventListener('click',()=>copyText(b,b.dataset.text)));
const key='pp-kit-'+(document.body.dataset.page||'');
function load(){try{return JSON.parse(localStorage.getItem(key)||'{}')}catch(e){return{}}}
function save(s){try{localStorage.setItem(key,JSON.stringify(s))}catch(e){}}
const st=load();document.querySelectorAll('ol.steps input').forEach((c,i)=>{c.checked=!!st[i];c.closest('li').classList.toggle('checked',c.checked);
 c.addEventListener('change',()=>{const s=load();s[i]=c.checked;save(s);c.closest('li').classList.toggle('checked',c.checked)})});
document.querySelectorAll('[data-prog]').forEach(el=>{try{const s=JSON.parse(localStorage.getItem('pp-kit-'+el.dataset.prog)||'{}');const n=+el.dataset.total;const d=Object.values(s).filter(Boolean).length;el.textContent=d?(d>=n?'Done ✓':d+' of '+n+' steps'):'Not started'}catch(e){}});
"""
def head(title, page):
    return f'<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>{html.escape(title)}</title><style>{CSS}</style></head><body data-page="{page}"><div class="wrap">'
FOOT = f'</div><script>{JS}</script></body></html>'

def field_row(label, value):
    count = f'<span class="count">{len(value)} characters</span>' if len(value) > 60 else ""
    return f'<div class="field"><div class="label">{html.escape(label)}</div><div><div class="value">{html.escape(value)}</div>{count}</div><button class="copy" data-text="{html.escape(value, quote=True)}">Copy</button></div>'

for i, p in enumerate(PAGES):
    out = [head(f"{p['title']} · PariharaOnline setup", p['file'])]
    out.append('<a class="back" href="index.html">← All accounts</a>')
    out.append(f'<p class="eyebrow">Step {i+1} of {len(PAGES)}</p><h1>{html.escape(p["title"])}</h1><span class="status">{html.escape(p["status"])}</span>')
    out.append(f'<div class="card"><p style="margin:0">{html.escape(p["why"])}</p><a class="open" href="{p["where"]}" target="_blank" rel="noopener">Open {html.escape(p["where"].split("//")[1].split("/")[0])} →</a></div>')
    out.append('<h2>Steps</h2><div class="card"><ol class="steps">' + "".join(f'<li><input type="checkbox" aria-label="Step {n+1} done"><span>{html.escape(s)}</span></li>' for n, s in enumerate(p["steps"])) + '</ol><p class="note" style="margin:10px 0 0">Ticks are saved in this browser.</p></div>')
    out.append('<h2>Details to paste</h2><div class="card">' + "".join(field_row(l, v) for l, v in p["fields"]) + '</div>')
    if p["images"]:
        out.append('<h2>Images to upload</h2><div class="imgs">' + "".join(f'<div class="card" style="margin:0"><img src="{f}" alt="{html.escape(t)}"><p><strong>{html.escape(t)}</strong> · <a href="{f}" download>download</a><br>{html.escape(n)}</p></div>' for t, f, n in p["images"]) + '</div>')
    nxt = PAGES[i+1] if i + 1 < len(PAGES) else None
    out.append(f'<p style="margin-top:28px">{"Next: <a href=%s>%s →</a>" % (nxt["file"], html.escape(nxt["title"])) if nxt else "<a href=index.html>Back to all accounts →</a>"}</p>')
    out.append(FOOT)
    open(os.path.join(HERE, p["file"]), "w").write("".join(out))

idx = [head("PariharaOnline: social and ads setup", "index")]
idx.append('<p class="eyebrow">PariharaOnline · setup kit</p><h1>Social and ads accounts</h1>')
idx.append('<div class="card"><p style="margin:0">You create each account and sign in (Meta and Google tie accounts to a real person; I can\'t create accounts, enter passwords or card details). Every name, text and image is ready on these pages. When an account exists and you are signed in, tell me and I finish the setup in the browser. <strong>No ads run until you approve a first campaign and budget.</strong></p></div>')
idx.append('<div class="card"><p style="margin:0"><strong>Public name everywhere: PariharaOnline.</strong> Keep the legal name (Harkarma LLP) off public profiles; it belongs only in private verification and billing fields.</p></div>')
idx.append('<h2>In this order (about 20–30 minutes)</h2><div class="grid">')
for i, p in enumerate(PAGES):
    idx.append(f'<a class="card item" href="{p["file"]}"><span><span class="eyebrow">Step {i+1}</span><br><strong>{html.escape(p["title"])}</strong><br><span class="note">{html.escape(p["status"])}</span></span><span class="prog" data-prog="{p["file"]}" data-total="{len(p["steps"])}">Not started</span></a>')
idx.append('</div><h2>Contact details (same everywhere)</h2><div class="card">' + field_row("Phone / WhatsApp", CONTACT_PHONE) + field_row("Email", CONTACT_EMAIL) + field_row("Hours", HOURS) + field_row("Website", SITE) + '</div>')
idx.append(FOOT)
open(os.path.join(HERE, "index.html"), "w").write("".join(idx))
print("built", 1 + len(PAGES), "pages")
