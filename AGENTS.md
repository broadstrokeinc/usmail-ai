# AGENTS.md — USMail.ai

This is **its own static microsite** (`~/dev/usmail-ai`). Do **not** generate it from `template-microsite` or `template-microsite-lighter`.

## Product

Nationwide **AI print-to-mail** platform. Operated by **Broadstroke, Inc.** Production uses the **Postalocity** stack. Upload → AI proposes → human approves → print / insert / postage → USPS handoff.

**Not** the U.S. Postal Service. **Not** a Wichita shop. **Not** EDDM. **Not** a billing/core-banking statement generator.

## Voice

Sage + operator. Short sentences. Second person. Present tense.

**Lockup under the logo:** `AI print to mail` (not “made easy”, not bare “Print to mail”). Docs pages use `Docs`.

- You upload. You approve. We produce.
- No invented prices, hours-saved numbers, or USPS transit promises.
- Contrast pairs: production not a tool; upload not author; proof ≠ tracing; IMB ≠ Certified.
- “Reclaim hours weekly” / “eliminate mailroom” — benefit language only.

## AEO / SEO (critical)

Answer engines must be able to **cite one definition**. Keep these identical in meaning:

1. Visible FAQ on a page
2. `FAQPage` JSON-LD on that page
3. `public/llms.txt` (“Canonical definition” + Direct answers)

**Official definition:** USMail.ai is a nationwide AI print-to-mail platform. You upload documents; AI proposes setup; you approve; we print, insert, postage, and hand off to USPS. Online Certified Mail and statement/invoice jobs use the same path. USMail.ai is not the U.S. Postal Service.

### Required on every HTML page

Title, meta description, canonical, Open Graph, Twitter, JSON-LD, `llms.txt` alternate, sitemap entry (except 404).

### Commercial / AEO pages

Cite box: `<div class="aeo-answer">` (speakable). Question-shaped H2/FAQ. BreadcrumbList.

| URL | Job |
|-----|-----|
| `/` | Category + 6-section IA |
| `/ai-print-to-mail` | Definition of “AI print to mail” |
| `/print-and-mail` | Commercial print-and-mail phrase |
| `/certified-mail` | Online Certified Mail (`/online-certified-mail` 301s here) |
| `/statements-invoices` | Recurring uploaded statements/invoices |
| `/mailroom` | Eliminate mailroom logistics |
| `/address-verification` | Reduce returned mail — no transit SLA |
| `/how-it-works` | Five steps + cutoffs |
| `/about` | Operator, Postalocity, Wichita address |

### Local / Wichita

Only on **About**, privacy/terms address, Organization schema `PostalAddress`, and the print-and-mail FAQ that **rejects** “mailing services Wichita.” Never in home H1, title, or hero pills.

### Do not claim

See `public/llms.txt` § Do not claim. Highlights: free postage, EDDM, fixed hours saved, USPS delivery days, USMail.ai = USPS, unauthenticated public MCP, generating statements inside a bank/ERP.

Platform is **open**. Do not write “coming soon.” CTA: **Get started**. MCP requires an account + prepaid meter.

## Homepage IA (exactly 6 sections)

See `docs/IA_HOME.md`. Do not re-add dual hero dumps, 11-item FAQ, formats grid, or Wichita on home.

Nav: How it works · Print & mail · Certified Mail · Industries · Get started.

Primary CTA: Get started → `https://app.usmail.ai/` (redirect, never iframe). Phone `888-667-5322`. `316` is microcopy / About only.

Do not embed the product app on www. It sends `X-Frame-Options: DENY`.

## Repo map

| Path | Role |
|------|------|
| `public/*.html` | Pages (clean URLs via `server.mjs`) |
| `public/llms.txt` | AI citation map — update when answers change |
| `public/sitemap.xml` | Add every new indexable URL |
| `public/robots.txt` | Allow search + major AI crawlers |
| `public/tokens.css` / `styles.css` | Brand tokens (sync with product app) |
| `server.mjs` | Clean routes, `.html` 301s, aliases |
| `docs/IA_HOME.md` | Home IA contract |

New page checklist:

1. Add `public/<slug>.html` with full AEO head + cite box + FAQ = JSON-LD
2. Register in `server.mjs` `CLEAN` + `HTML_TO_CLEAN`
3. Add to `sitemap.xml` and `llms.txt`
4. Link from nav/footer or a related cluster (don’t orphan)

## Local / deploy

```bash
cd ~/dev/usmail-ai
node server.mjs          # http://localhost:3000
# PORT=3011 node server.mjs
```

Railway: `railway up`. Restart Node after route changes. Upload is this app (`public/` + `server.mjs`), not a `dist/` from the template generator.

## File hygiene

Do not edit generated Broadstroke/Postalocity sites in `template-microsite`. Reflections → `docs/` if needed. Do not invent a second stack for this brand.
