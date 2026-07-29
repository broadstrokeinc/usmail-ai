# USMail.AI microsite

Public microsite for **USMail.AI** — simplified from-your-desk physical mailing.

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
