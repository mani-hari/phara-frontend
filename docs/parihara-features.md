# PariharaOnline Storefront - Feature Documentation

## Stack
- **Framework:** Next.js 14 (App Router) + TypeScript
- **E-commerce Backend:** Medusa v2 (Cloud hosted)
- **Styling:** Tailwind CSS with custom brand theme
- **Icons:** lucide-react
- **Payments:** Razorpay (India/INR) + PayPal (International/USD)
- **Analytics:** Google Analytics 4 + Microsoft Clarity

---

## Core Features

### 1. Brand Theme (Tailwind)
- Custom `brand` color palette (amber/orange #f59e0b primary)
- Custom `warm` palette for gradients and backgrounds
- Consistent amber-tinted design language across all pages
- Design inspiration: sarvam.ai (warm Indian heritage) + base44.com (orange tint)

### 2. Region Detection & Routing
- Binary region system: India (INR) vs International (USD)
- IP-based auto-detection via Vercel `x-vercel-ip-country` header
- Routes: `/in/` for India, `/us/` for International
- No manual region switcher — fully automatic

### 3. Navigation & Layout
- **Header:** Amber-gradient top bar with PariharaOnline branding, desktop nav links (Services, How It Works, About, FAQ), user/cart icons
- **Mobile Menu:** Slide-out with 9 items: Home, Services, How It Works, Astrology, About, FAQ, Contact, Account, Cart
- **Footer:** 4-column dark footer with Brand+Contact, Services (dynamic from collections), Information links, Policy links, WhatsApp/phone/email

### 4. Homepage
Six sections:
1. Hero gradient with "Ancient Rituals, Modern Convenience" + dual CTAs
2. Features grid (4 cards): Authentic Rituals, Worldwide Delivery, Secure Payments, Personalized Service
3. Services preview (3 gradient cards linking to collections)
4. Trust stats (4 counters): 15+ Years, 50+ Countries, 10,000+ Pujas, 24/7 Support
5. How It Works (4-step visual flow)
6. Amber CTA banner

### 5. Multi-Devotee Puja Form
- Supports 1-4 devotee entries per booking
- Fields: Name, Nakshatram (27 options with Tamil transliterations), Rasi (12 options with Tamil), Gothram
- Shared fields: Date preference, Special prayer/notes
- Data stored as JSON in cart line item metadata
- Displayed in cart with devotee names

### 6. Payment Integration
- **Razorpay** (India/INR): Dynamic script loading, order creation via API route, HMAC SHA256 signature verification
- **PayPal** (International/USD): OAuth token-based order creation, capture endpoint
- **API Routes:** `/api/payments/razorpay/create-order`, `/api/payments/razorpay/verify`, `/api/payments/paypal/create-order`, `/api/payments/paypal/capture-order`
- Checkout UI wired for Razorpay, PayPal, Stripe, and manual payment

### 7. FAQ System (10 Categories, ~68 Questions)
- Static TypeScript data in `src/lib/data/faq-data.ts`
- Master index page: `/faq/` with category grid and popular questions
- Individual category pages: `/faq/[slug]/` with expandable Q&A
- JSON-LD FAQPage schema on each category page for rich snippets
- `generateStaticParams` for build-time static generation
- Categories: Hindu Pujas, Astrology, Nakshatram & Rasi, Festival Calendar, Temple Services, Prasad Delivery, Payment & Ordering, Parihara Remedies, Marriage Compatibility, Health & Wellness

### 8. Static Pages (under `[countryCode]/(main)/`)
- **About** (`/about/`) — Company story, trust stats, temple scholars, contact
- **How It Works** (`/how-it-works/`) — 4-step process with details and "What to Expect"
- **Astrology** (`/astrology/`) — Landing page with 3 service cards (Ask Astrologer, Health Report, Career Analysis), how it works, deliverables
- **Contact** (`/contact/`) — WhatsApp, Phone, Email, Response Time, Registered Office
- **Terms** (`/terms/`) — 9-section Terms of Service
- **Privacy** (`/privacy/`) — 9-section Privacy Policy
- **Refund** (`/refund/`) — 8-section Refund & Cancellation Policy

### 9. Analytics
- Google Analytics 4 via `next/script` (env: `NEXT_PUBLIC_GA4_ID`)
- Microsoft Clarity via `next/script` (env: `NEXT_PUBLIC_CLARITY_ID`)
- Scripts load with `afterInteractive` strategy

### 10. SEO & AI Optimization
- Organization JSON-LD schema in root layout
- FAQPage JSON-LD schema on each FAQ category page
- `/llms.txt` for AI agent access — complete service catalog, pricing, FAQ topics, contact
- SEO metadata on every page (title, description)

### 11. Cart Bug Fixes
- Added `+items.product_title, +items.product_handle, +items.variant_title` to cart query fields
- Fallback chains for product title, handle, thumbnail in cart item display
- Puja devotee info displayed in cart from metadata

### 12. Product Catalog (32 Products in Medusa)
- Dual pricing: INR + USD for every product
- 6 Collections: Homam & Fire Rituals, Temple Pujas & Abhishekam, Astrology Services, Sacred Items & Prasad, Festival Specials, Mantra & Chanting
- All linked to default sales channel
- Organized by collection for easy browsing

---

## Environment Variables Required
```
# Medusa
NEXT_PUBLIC_MEDUSA_BACKEND_URL=
NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=

# Razorpay (India payments)
NEXT_PUBLIC_RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=

# PayPal (International payments)
NEXT_PUBLIC_PAYPAL_CLIENT_ID=
PAYPAL_CLIENT_SECRET=

# Analytics
NEXT_PUBLIC_GA4_ID=
NEXT_PUBLIC_CLARITY_ID=
```

## Key File Paths
- Theme: `tailwind.config.js`
- Homepage: `src/modules/home/components/hero/index.tsx`
- Nav: `src/modules/layout/templates/nav/index.tsx`
- Footer: `src/modules/layout/templates/footer/index.tsx`
- Puja Form: `src/modules/puja/components/puja-details-form/index.tsx`
- FAQ Data: `src/lib/data/faq-data.ts`
- Payment Libs: `src/lib/payments/razorpay.ts`, `src/lib/payments/paypal.ts`
- Payment APIs: `src/app/api/payments/`
- Static Pages: `src/app/[countryCode]/(main)/`
- Cart Fix: `src/modules/cart/components/item/index.tsx`, `src/lib/data/cart.ts`
