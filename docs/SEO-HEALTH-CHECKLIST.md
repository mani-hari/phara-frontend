# SEO and discoverability health checklist

Checked on every SEO report run (every two days) so basics never slip again. Each line is pass / fail / changed.
Origin: on 22 Oct 2026 we found the sitemap had never been submitted to Search Console and the Digital Aarti
pages were still noindex; nobody had a standing check for either.

## Accounts and setup
- [ ] Search Console verified for `sc-domain:pariharaonline.com`, linked to GA4
- [ ] Sitemap `https://www.pariharaonline.com/sitemap.xml` submitted, status Success, last read within 7 days;
      discovered count roughly matches the live sitemap's URL count
- [ ] Bing Webmaster Tools verified and sitemap submitted (IndexNow key file live at /c19d6c00f7142b246af7427e6b8ab828.txt)
- [ ] robots.txt reachable; allows Googlebot, Bingbot and AI agents (GPTBot, ClaudeBot, PerplexityBot, ChatGPT-User,
      OAI-SearchBot, Google-Extended); blocks only /api, /admin, /account, /checkout, /cart

## Live checks (sample 8 URLs from the sitemap each run: home, 2 products, 2 blog posts, /aarti, a landing page, /calendar)
- [ ] HTTP 200 (not a redirect chain)
- [ ] no `noindex` unless intended
- [ ] canonical points to the clean (prefix-free) URL of itself
- [ ] title and meta description present and not duplicated
- [ ] og:image present (WhatsApp previews)
- [ ] any new page type added since the last run is in the sitemap and indexable

## Search Console signals
- [ ] Indexed pages: trend up or flat; flag any drop
- [ ] Not-indexed reasons: flag any NEW 404s (propose redirects in src/middleware.ts GHOST_REDIRECTS), new noindex,
      new duplicates without canonical, new "blocked by robots"
- [ ] Performance (day / 7d / 28d vs previous): clicks, impressions, CTR, position; top query and page movers
- [ ] Core Web Vitals: any URLs Poor / Needs improvement
- [ ] Manual actions / security issues: none

## GA4
- [ ] Organic Search sessions (real visitors, bots excluded) day / week trend
- [ ] Top organic landing pages and their engagement
