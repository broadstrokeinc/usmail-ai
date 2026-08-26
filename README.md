# USMail.ai microsite

Public microsite for **USMail.ai** — nationwide AI print-to-mail (its own site, not the template generator).

Agent rules (voice, AEO, IA, do-not-claim): [`AGENTS.md`](AGENTS.md).

## Design

Visual language is **retro-ported from the product app**:

| File | Role |
|------|------|
| [`public/tokens.css`](public/tokens.css) | Color / type / radius / shadow tokens (= app `postal.*`) |
| [`public/styles.css`](public/styles.css) | Marketing layout using those tokens |
| [`docs/DESIGN_TOKENS.md`](docs/DESIGN_TOKENS.md) | Contract + sync rules |

When product brand colors change, update `tokens.css` in the same change set.

## Source

- Wires letter: `USMail AI wires letter.docx` (announcement copy, how it works, benefits, contact)
- Logo: `USmail AI Logo.pdf` → `public/logo.png`

## Local

```bash
node server.mjs
# → http://localhost:3000
```

## Deploy (Railway)

```bash
railway up --new --name usmail-ai -y
# or from this directory after link:
railway up --detach
```

Uses `PORT` from Railway. Health check: `/`.
