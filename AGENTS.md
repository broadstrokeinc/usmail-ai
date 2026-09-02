# AGENTS.md — USMail.ai

Static microsite in `~/dev/usmail-ai`. Do **not** generate it from `template-microsite`. Do **not** name sibling production brands on www.

## Product

Nationwide AI print-to-mail. Broadstroke, Inc. operates it. Human approves, then print / insert / postage / deliver to USPS.

**Not** USPS. **Not** a Wichita shop. **Not** EDDM. **Not** a statement generator.

## Voice

Sage + operator. Short sentences. Second person. Present tense.

**Three seats. Do not collapse them.**

| Job | Line | Where |
|-----|------|--------|
| Lockup | `AI print to mail` | Under the logo |
| Comprehension | `Print to mail, made easy` | Reserved. Never H1, OG, or footer |
| Slogan | `You upload. You approve. We produce.` | Hero H1, footer, OG, schema |

- Repeat a fact **twice** on a page max (owner section + FAQ). A third time is a link.
- Hero lead is value, not a second title. Do not echo the slogan. Do not open with the wordmark.
- No invented prices, hours saved, or USPS transit days.
- Documents and postcards. “Letter” is a USPS size, or a named document type.
- **Deliver** to USPS. USPS delivers nationwide. Do not write “to USPS nationwide,” or collapse the two jobs. Do not write “enter into the USPS network” or “plant path.”
- CTA: **Get started** → `https://app.usmail.ai/` (never iframe). Phone `888-667-5322` in footer, About, home Get started, `/contact`, legal/security. `316` is About / contact / legal only.
- Contact form on home (Get started section) and `/contact`. Footer email stays. Do not plaster the form on landers.

## AEO

One meaning across: visible FAQ, `FAQPage` JSON-LD on that page, `public/llms.txt`.

**Official definition** (home FAQ, About FAQ, those JSON-LDs, `llms.txt`). Visible FAQ: bullets. JSON-LD and Direct answers: periods.

USMail.ai is a nationwide AI print-to-mail platform. You upload documents and postcards. AI proposes setup. You approve. We print, insert, apply postage, and deliver the pieces to USPS. Online Certified Mail and statement or invoice jobs use the same path. USMail.ai is not the United States Postal Service.

**Category** (“What is AI print to mail?” — home FAQ, `/ai-print-to-mail`, JSON-LD, DefinedTerm, `llms.txt`): AI print to mail means you upload documents and postcards. Software proposes setup. You approve. We print, apply postage, and deliver the pieces to USPS. USPS delivers nationwide.

**Heritage** (About only; `llms.txt` Who runs it points at About): experienced print-to-mail experts with more than 50 years of combined expertise, innovation through AI. Never on home.

Do not paste the official definition in a hero cite box. Speakable is `.lead` (that page’s answer).

Every HTML page: title, meta, canonical, OG, Twitter, JSON-LD, sitemap (except 404). Discover `llms.txt` via `/llms.txt`, `robots.txt`, sitemap — **never** `<link rel="alternate" type="text/plain" href="/llms.txt">` on HTML.

Wichita: About, privacy/terms, Organization `PostalAddress`, and the print-and-mail FAQ that **rejects** “mailing services Wichita.” Never home H1, title, or hero.

Do not claim: see `public/llms.txt`. Platform is open. Do not write “coming soon.” MCP: account + prepaid meter; env login + short session token; human approves on the app.

`/other-print` is noindex, Broadstroke handoff. Not in nav, sitemap, or `llms.txt` Direct answers.

Home: exactly 6 sections. Contract: `docs/IA_HOME.md`.

Nav: How it works · Features · Print & mail · Certified Mail · Industries · Get started. Footer includes Features, Compare, and Contact.

## Repo

| Path | Role |
|------|------|
| `public/*.html` | Pages (clean URLs in `server.mjs`) |
| `public/llms.txt` | AI citation map |
| `public/sitemap.xml` | Indexable URLs |
| `server.mjs` | Routes, `.html` 301s |
| `docs/IA_HOME.md` | Home IA |

New page: HTML with AEO head + FAQ = JSON-LD; register `CLEAN` / `HTML_TO_CLEAN`; sitemap; link it. Do not orphan.

```bash
cd ~/dev/usmail-ai && node server.mjs
```

Railway: `railway up --detach`, poll SUCCESS. This app is `public/` + `server.mjs`.
