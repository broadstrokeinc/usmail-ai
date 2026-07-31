# Design tokens — usmail.ai ← postalocity-ai

**Source of truth for product UI language:** `postalocity-ai`  
(`tailwind.config.ts` `postal.*` + `src/index.css` components)

Marketing site (`usmail-ai`) **consumes the same tokens** via `public/tokens.css` + `public/styles.css`.

## Colors (exact app hex)

| Token | Hex | App name | Use |
|-------|-----|----------|-----|
| `--postal-primary` | `#1a2b63` | `postal.primary` | Brand, links, primary type accents |
| `--postal-dark` | `#142352` | `postal.dark` | Hover / deeper navy |
| `--postal-deeper` | `#0e1a3d` | `postal.deeper` | Hero deep accents |
| `--postal-light` | `#e8ecf5` | `postal.light` | Tinted soft backgrounds |
| `--postal-accent` | `#2563eb` | `postal.accent` | Gradient end, highlights |
| `--postal-accent-light` | `#93c5fd` | `postal.accentLight` | Light accent text on dark |
| `--postal-surface` | `#0f172a` | `postal.surface` | Dark hero / premium surface |
| `--postal-surface-light` | `#1e293b` | `postal.surfaceLight` | Secondary dark |
| `--postal-border` | `#e2e8f0` | `postal.border` / slate-200 | Borders |
| `--page-bg` | `#f8fafc` | `bg-slate-50` | Page canvas |
| `--ink` | `#0f172a` | `text-slate-900` | Body text |
| `--muted` | `#64748b` | slate-500 | Secondary text |
| `--white` | `#ffffff` | — | Cards |
| `--flag-red` | `#e11d2e` | BRAND.md | Rare emphasis only |

Legacy aliases: `--navy` → primary, `--navy-deep` → dark, `--sky` → light, `--line` → border, `--slate` → muted.

## Typography

| Role | Family |
|------|--------|
| Body / UI | **Inter** |
| Headings (h1–h6, display) | **Plus Jakarta Sans** |

## Radius

| Token | Value | App |
|-------|-------|-----|
| `--radius-control` | `12px` | `rounded-xl` (buttons, inputs) |
| `--radius-card` | `16px` | `rounded-2xl` (cards) |
| `--radius-pill` | `999px` | chips / nav pills only |

## Shadows

| Token | Value | App |
|-------|-------|-----|
| `--shadow-sm` | `0 1px 2px rgba(15, 23, 42, 0.05)` | `shadow-sm` |
| `--shadow-md` | `0 4px 12px rgba(15, 23, 42, 0.08)` | `shadow-md` |
| `--shadow-btn` | `0 10px 24px rgba(26, 43, 99, 0.25)` | primary hover glow |

## Primary button (`.btn-primary` = `.postal-btn`)

- Fill: `linear-gradient(90deg, #1a2b63 0%, #2563eb 100%)`
- Radius: `12px` (not full pill)
- Weight: 600
- Hover: slight scale + navy-tinted shadow
- Active: scale 0.98

## Cards (`.postal-card` language)

- Background white
- Border `1px solid rgba(226, 232, 240, 0.9)`
- Radius `16px`
- Shadow sm → md on hover

## What stays marketing-only

- Multi-section landing content, FAQ, SEO/JSON-LD
- Sticky mobile dock (styled with same buttons)
- Static HTML pages (no React chat chrome)

## Sync rule

When changing product brand colors in `postalocity-ai/tailwind.config.ts` or `public/BRAND.md`, update **`usmail-ai/public/tokens.css`** in the same change set.
