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

### Contact form (Resend + reCAPTCHA)

| Env | Role |
|-----|------|
| `RESEND_API_KEY` | Send alerts to `LEAD_NOTIFY_TO` |
| `LEAD_NOTIFY_TO` | Inbox for new contacts (default `Info@USMAIL.ai`) |
| `LEAD_FROM` | From address (must be a verified Resend domain) |
| `LEAD_ACK` | Set `1` to auto-ack the submitter (default **off** — stops spam relays) |
| `RECAPTCHA_SECRET` | Google reCAPTCHA **secret** (required or `/api/contact` rejects) |
| `RECAPTCHA_SITE_KEY` | Optional; HTML defaults to the mill v2 site key. Add `www.usmail.ai` on that key. |

Contact is capped at **3 posts per IP per hour**. Honeypot + captcha required.
