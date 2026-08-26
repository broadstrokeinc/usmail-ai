# AGENTS.md — USMail.ai

This is **its own static microsite** (`~/dev/usmail-ai`). Do **not** generate it from `template-microsite` or `template-microsite-lighter`.

## Product

Nationwide **AI print-to-mail** platform. Operated by **Broadstroke, Inc.** Upload → AI proposes → human approves → print / insert / postage → USPS handoff. **USMail.ai stands alone** — do not name other production brands on www.

**Not** the U.S. Postal Service. **Not** a Wichita shop. **Not** EDDM. **Not** a billing/core-banking statement generator.

## Voice

Sage + operator. Short sentences. Second person. Present tense.

**Brand — three seats. Do not collapse them.** Docs pages use `Docs` under the logo.

| Job | Line | This quarter |
|-----|------|----------------|
| Category / lockup | `AI print to mail` | Wired under the logo |
| Comprehension | `Print to mail, made easy` | Reserved. Never H1, OG, or footer. Optional support only if a surface needs “what is this?” |
| Trust / slogan | `You upload. You approve. We produce.` | Wired on hero, footer, OG, schema |

Occupancy is **trust-first** (same as the product app). Do not promote comprehension into the slogan seat. Do not delete it from the model. Do not ship two H1s.
- No invented prices, hours-saved numbers, or USPS transit promises.
- Contrast pairs: production not a tool; upload not author; proof ≠ tracing; IMB ≠ Certified.
- Identity noun: **nationwide AI print-to-mail platform**. Compare may say we print (not a catalog, not a shop). Do **not** say “plant path.” Do not use “mail house” as the identity noun.
- Generic mail is **documents and postcards**. Letter is a USPS format (size), not the product noun. Keep “letter” only for size rules (First-Class letter, letter paper) or a named document type (demand letter).
- We **deliver** pieces to USPS. Do not write “enter them into the USPS network.”
- “Reclaim hours weekly” / “eliminate mailroom” — benefit language only.

## AEO / SEO (critical)

Answer engines must be able to **cite one definition**. Keep these identical in meaning:

1. Visible FAQ on a page
2. `FAQPage` JSON-LD on that page
3. `public/llms.txt` (“Canonical definition” + Direct answers)

**Official definition** (same seven facts; no semicolons). Visible home/About FAQ uses bullets. JSON-LD, schema descriptions, and `llms.txt` Direct answers use period sentences. `llms.txt` Canonical definition uses the same bullets in Markdown.

USMail.ai is a nationwide AI print-to-mail platform. You upload documents. AI proposes setup. You approve. We print, insert, apply postage, and hand the pieces to USPS. Online Certified Mail and statement or invoice jobs use the same path. USMail.ai is not the United States Postal Service.

**Category definition (verbatim for “What is AI print to mail?” on home FAQ, `/ai-print-to-mail` FAQ, JSON-LD, DefinedTerm, and `llms.txt` Direct answers):** AI print to mail means you upload documents and postcards. Software proposes setup. You approve. We print, apply postage, and deliver the pieces to USPS. USMail.ai does that nationwide.

**Heritage (About only, plus `llms.txt` Who runs it pointing at About):** A team of experienced print-to-mail experts with more than 50 years of combined expertise, now providing print-to-mail innovation through AI. Never on home.

The noun is **nationwide AI print-to-mail platform**. Do not swap it for “mail house” as the identity. Mail house is only contrast language (we print) on `/compare`. Speakable `.lead` is the page’s answer. Official definition is home/About/`/ai-print-to-mail` FAQ + JSON-LD + `llms.txt` — not a cite dump in every lander lead.

Do **not** paste that paragraph in a hero cite box on every lander. Other pages answer their own question in the lead and FAQ. Speakable is `.lead`.

### Required on every HTML page

Title, meta description, canonical, Open Graph, Twitter, JSON-LD, sitemap entry (except 404).

`public/llms.txt` is discovered via `/llms.txt`, `robots.txt`, and the sitemap. **Do not** put `<link rel="alternate" type="text/plain" href="/llms.txt">` on HTML pages — crawlers that omit `Accept: text/html` then fetch `llms.txt` instead of the page (and miss `/compare`).

### Commercial / AEO pages

Question-shaped H2/FAQ. BreadcrumbList. Speakable: `.lead`. Official definition is **not** a sitewide hero.

| URL | Job |
|-----|-----|
| `/` | Category + 6-section IA |
| `/ai-print-to-mail` | Definition of “AI print to mail” |
| `/print-and-mail` | Commercial print-and-mail phrase |
| `/features` | USPs and product features |
| `/certified-mail` | Online Certified Mail (`/online-certified-mail` 301s here) |
| `/statements-invoices` | Recurring uploaded statements/invoices |
| `/mailroom` | Eliminate mailroom logistics |
| `/address-verification` | Reduce returned mail — no transit SLA |
| `/how-it-works` | Five steps + cutoffs |
| `/about` | Product stands alone: experienced print-to-mail team, 50+ years combined expertise, AI innovation. Wichita command center. Legal entity in About footer |
| `/compare` | Platform vs online catalog vs walk-in shop vs USPS |
| `/industries/collections` | Debt collection mail |
| `/industries/healthcare` | Healthcare notices |
| `/industries/utilities` | Utility bills / notices |
| `/industries/legal` | Legal correspondence |
| `/industries/storage` | Storage / facility notices |

### Local / Wichita

Only on **About**, privacy/terms address, Organization schema `PostalAddress`, and the print-and-mail FAQ that **rejects** “mailing services Wichita.” Never in home H1, title, or hero pills.

### Do not claim

See `public/llms.txt` § Do not claim. Highlights: free postage, EDDM, fixed hours saved, USPS delivery days, USMail.ai = USPS, unauthenticated public MCP, generating statements inside a bank/ERP, USMail.ai printing business cards or promo.

`/other-print` is a noindex handoff to Broadstroke (broadstrokeinc.com). Not in nav, sitemap, or `llms.txt` Direct answers.

Platform is **open**. Do not write “coming soon.” CTA: **Get started**. MCP requires an account + prepaid meter.

## Homepage IA (exactly 6 sections)

See `docs/IA_HOME.md`. Do not re-add dual hero dumps, 11-item FAQ, formats grid, or Wichita on home.

Nav: How it works · Features · Print & mail · Certified Mail · Industries · Get started. Footer: Features and Compare.

Primary CTA: Get started → `https://app.usmail.ai/` (redirect, never iframe). Phone `888-667-5322` lives in the footer, About contact, home Get started, and legal/security pages. Not on heroes, mobile docks, or every Get started band. `316` is About / legal only.

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

1. Add `public/<slug>.html` with full AEO head + page-specific FAQ = JSON-LD (do not paste the company definition as a hero box)
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

Do not edit generated sites in `template-microsite`. Reflections → `docs/` if needed. Do not invent a second stack for this brand. USMail.ai stands alone on www — do not name sibling production brands.
