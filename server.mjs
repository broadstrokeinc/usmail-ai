import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const publicDir = path.join(__dirname, 'public')
const dataDir = path.join(__dirname, 'data')
const leadsFile = path.join(dataDir, 'early-access.jsonl')
const port = Number(process.env.PORT) || 3000
const CANONICAL_HOST = (process.env.CANONICAL_HOST || 'usmail.ai').toLowerCase()

/** Simple per-IP rate limit for early-access (memory; resets on restart) */
const leadHits = new Map()
const LEAD_WINDOW_MS = 60 * 60 * 1000
const LEAD_MAX = 8

function clientIp(req) {
  return (
    (req.headers['x-forwarded-for'] || '').toString().split(',')[0].trim() ||
    req.socket?.remoteAddress ||
    'unknown'
  )
}

function allowLead(ip) {
  const now = Date.now()
  const row = leadHits.get(ip) || { n: 0, t: now }
  if (now - row.t > LEAD_WINDOW_MS) {
    row.n = 0
    row.t = now
  }
  row.n += 1
  leadHits.set(ip, row)
  return row.n <= LEAD_MAX
}

function requestHost(req) {
  return (req.headers['x-forwarded-host'] || req.headers.host || '')
    .toString()
    .split(',')[0]
    .trim()
    .toLowerCase()
    .replace(/:\d+$/, '')
}

/** Until custom domain is live, don't index Railway hostnames */
function hostExtraHeaders(req) {
  const host = requestHost(req)
  if (!host) return {}
  if (host === CANONICAL_HOST || host === `www.${CANONICAL_HOST}`) return {}
  if (host.includes('railway.app') || host.includes('localhost') || host.startsWith('127.')) {
    return { 'X-Robots-Tag': 'noindex, nofollow' }
  }
  return {}
}

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
}

const SECURITY = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'SAMEORIGIN',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Cross-Origin-Opener-Policy': 'same-origin',
  // HTTPS only on production hosts (Railway / custom domains terminate TLS)
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
  // Allow self + Google Fonts + Lucide CDN (icons only)
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' https://unpkg.com https://www.googletagmanager.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com data:",
    "img-src 'self' data: https:",
    "connect-src 'self' https://www.google-analytics.com https://analytics.google.com https://www.googletagmanager.com https://*.google-analytics.com https://*.analytics.google.com",
    "frame-ancestors 'self'",
    "base-uri 'self'",
    "form-action 'self' mailto:",
  ].join('; '),
}

const NOT_FOUND_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="robots" content="noindex, follow" />
  <title>Page not found | USMail.ai</title>
  <link rel="stylesheet" href="/tokens.css?v=20260731ux2" />
  <link rel="stylesheet" href="/styles.css?v=20260731ux2" />
</head>
<body>
  <main class="wrap" style="padding:4rem 1.25rem;max-width:40rem">
    <p class="eyebrow">404</p>
    <h1>Page not found</h1>
    <p class="lead">That URL is not on USMail.ai. Try the home page or docs.</p>
    <p style="display:flex;flex-wrap:wrap;gap:0.75rem;margin-top:1.5rem">
      <a class="btn btn-primary" href="/">Home</a>
      <a class="btn btn-ghost" href="/docs">Docs</a>
      <a class="btn btn-ghost" href="/how-it-works">How it works</a>
      <a class="btn btn-ghost" href="/docs/mcp">MCP docs</a>
    </p>
  </main>
</body>
</html>
`

function send(res, status, body, headers = {}, req = null) {
  const payload = body == null ? '' : body
  const hostHdrs = req ? hostExtraHeaders(req) : {}
  res.writeHead(status, { ...SECURITY, ...hostHdrs, ...headers })
  res.end(payload)
}

function sendJson(res, status, obj, req = null) {
  send(
    res,
    status,
    JSON.stringify(obj),
    {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
    },
    req,
  )
}

function readBody(req, limit = 12_000) {
  return new Promise((resolve, reject) => {
    const chunks = []
    let size = 0
    req.on('data', (chunk) => {
      size += chunk.length
      if (size > limit) {
        reject(new Error('payload_too_large'))
        req.destroy()
        return
      }
      chunks.push(chunk)
    })
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')))
    req.on('error', reject)
  })
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 200
}

function sanitizeLine(s, max = 500) {
  return String(s || '')
    .replace(/[\r\n\t]+/g, ' ')
    .trim()
    .slice(0, max)
}

const RESEND_API_KEY = (process.env.RESEND_API_KEY || '').trim()
const LEAD_NOTIFY_TO = (process.env.LEAD_NOTIFY_TO || 'Info@USMAIL.ai')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean)
const LEAD_FROM =
  (process.env.LEAD_FROM || 'USMail.ai <onboarding@resend.dev>').trim()
const LEAD_ACK = (process.env.LEAD_ACK || '1') !== '0'

async function resendSend({ to, subject, text, replyTo }) {
  if (!RESEND_API_KEY) {
    console.warn('[resend] RESEND_API_KEY not set — skip send')
    return { skipped: true }
  }
  const body = {
    from: LEAD_FROM,
    to: Array.isArray(to) ? to : [to],
    subject,
    text,
  }
  if (replyTo) body.reply_to = replyTo

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })
  const payload = await res.text()
  if (!res.ok) {
    console.error('[resend] send failed', res.status, payload)
    return { ok: false, status: res.status, payload }
  }
  return { ok: true, payload }
}

async function notifyLead(row) {
  const interest = row.interest || 'general'
  const utmLine = row.utm
    ? `UTM: source=${row.utm.source || '-'} medium=${row.utm.medium || '-'} campaign=${row.utm.campaign || '-'}`
    : 'UTM: —'
  const text = [
    'New USMail.ai early-access request',
    '',
    `Email: ${row.email}`,
    `Name: ${row.name || '—'}`,
    `Interest: ${interest}`,
    `When: ${row.at}`,
    utmLine,
    `IP: ${row.ip || '—'}`,
    '',
    'Reply to this message to contact the lead (Reply-To set).',
  ].join('\n')

  const alert = await resendSend({
    to: LEAD_NOTIFY_TO,
    subject: `[USMail.ai] Get started · ${interest} · ${row.email}`,
    text,
    replyTo: row.email,
  })

  let ack = null
  if (LEAD_ACK) {
    ack = await resendSend({
      to: row.email,
      subject: 'We received your USMail.ai early-access request',
      text: [
        row.name ? `Hi ${row.name},` : 'Hi,',
        '',
        'Thanks for getting started with USMail.ai. We will follow up about your account and can schedule a demo if you asked for one.',
        '',
        'Questions now? Call 888-667-5322 or 316-247-5300, or reply to this email.',
        '',
        '— USMail.ai',
        'https://www.usmail.ai',
      ].join('\n'),
      replyTo: LEAD_NOTIFY_TO[0] || 'Info@USMAIL.ai',
    })
  }

  return { alert, ack }
}

async function handleEarlyAccess(req, res) {
  if (req.method === 'OPTIONS') {
    return send(
      res,
      204,
      '',
      {
        'Access-Control-Allow-Origin': 'null',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
      req,
    )
  }
  if (req.method !== 'POST') {
    return sendJson(res, 405, { ok: false, error: 'method_not_allowed' }, req)
  }

  const ip = clientIp(req)
  if (!allowLead(ip)) {
    return sendJson(res, 429, { ok: false, error: 'rate_limited' }, req)
  }

  try {
    const raw = await readBody(req)
    let data
    const ctype = req.headers['content-type'] || ''
    if (ctype.includes('application/json')) {
      data = JSON.parse(raw || '{}')
    } else {
      data = Object.fromEntries(new URLSearchParams(raw))
    }

    // Honeypot
    if (data.company_website || data.website) {
      return sendJson(res, 200, { ok: true }, req)
    }

    const email = sanitizeLine(data.email, 200).toLowerCase()
    const name = sanitizeLine(data.name, 120)
    const interest = sanitizeLine(data.interest || data.note || '', 400)
    const utm = {
      source: sanitizeLine(data.utm_source, 80) || null,
      medium: sanitizeLine(data.utm_medium, 80) || null,
      campaign: sanitizeLine(data.utm_campaign, 120) || null,
    }

    if (!isValidEmail(email)) {
      return sendJson(res, 400, { ok: false, error: 'invalid_email' }, req)
    }

    fs.mkdirSync(dataDir, { recursive: true })
    const row = {
      at: new Date().toISOString(),
      email,
      name: name || null,
      interest: interest || null,
      utm: utm.source || utm.medium || utm.campaign ? utm : null,
      ip: ip === 'unknown' ? null : ip,
      ua: sanitizeLine(req.headers['user-agent'], 200) || null,
    }
    fs.appendFileSync(leadsFile, `${JSON.stringify(row)}\n`, 'utf8')
    console.log('[early-access]', row.email, row.interest || '-')

    // Fire-and-continue: do not fail the form if mail provider is down
    try {
      const mail = await notifyLead(row)
      console.log(
        '[early-access] mail',
        mail.alert?.ok || mail.alert?.skipped ? 'alert-ok' : 'alert-fail',
        mail.ack?.ok || mail.ack?.skipped || !LEAD_ACK ? 'ack-ok' : 'ack-fail',
      )
    } catch (mailErr) {
      console.error('[early-access] mail error', mailErr)
    }

    return sendJson(res, 200, { ok: true }, req)
  } catch (err) {
    if (err && err.message === 'payload_too_large') {
      return sendJson(res, 413, { ok: false, error: 'payload_too_large' }, req)
    }
    console.error('[early-access] error', err)
    return sendJson(res, 400, { ok: false, error: 'bad_request' }, req)
  }
}

const server = http.createServer(async (req, res) => {
  const urlPath = decodeURIComponent((req.url || '/').split('?')[0])
  const host = requestHost(req)

  // Prefer www as the indexable host (apex is often a registrar 301)
  if (host === CANONICAL_HOST) {
    const qs = (req.url || '/').includes('?') ? '?' + (req.url || '').split('?')[1] : ''
    return send(
      res,
      301,
      '',
      {
        Location: `https://www.${CANONICAL_HOST}${urlPath === '/' ? '/' : urlPath}${qs}`,
        'Cache-Control': 'public, max-age=3600',
      },
      req,
    )
  }

  if (urlPath === '/health' || urlPath === '/healthz') {
    return sendJson(res, 200, { ok: true, service: 'usmail-ai' }, req)
  }

  if (urlPath === '/api/early-access' || urlPath === '/api/early-access/') {
    return handleEarlyAccess(req, res)
  }

  if (req.method !== 'GET' && req.method !== 'HEAD') {
    return send(res, 405, 'Method not allowed', {}, req)
  }

  const ALIAS = {
    '/online-certified-mail': '/certified-mail',
    '/online-certified-mail/': '/certified-mail',
  }
  if (ALIAS[urlPath]) {
    return send(
      res,
      301,
      '',
      { Location: ALIAS[urlPath], 'Cache-Control': 'public, max-age=86400' },
      req,
    )
  }

  const CLEAN = {
    '/': '/index.html',
    '/privacy': '/privacy.html',
    '/about': '/about.html',
    '/terms': '/terms.html',
    '/security': '/security.html',
    '/certified-mail': '/certified-mail.html',
    '/print-and-mail': '/print-and-mail.html',
    '/features': '/features.html',
    '/ai-print-to-mail': '/ai-print-to-mail.html',
    '/statements-invoices': '/statements-invoices.html',
    '/mailroom': '/mailroom.html',
    '/address-verification': '/address-verification.html',
    '/mcp': '/mcp.html',
    '/how-it-works': '/how-it-works.html',
    '/industries': '/industries.html',
    '/industries/credit-repair': '/industries/credit-repair.html',
    '/industries/banks': '/industries/banks.html',
    '/industries/government': '/industries/government.html',
    '/industries/collections': '/industries/collections.html',
    '/industries/healthcare': '/industries/healthcare.html',
    '/industries/utilities': '/industries/utilities.html',
    '/industries/legal': '/industries/legal.html',
    '/industries/storage': '/industries/storage.html',
    '/compare': '/compare.html',
    '/sitemap.xml': '/sitemap.xml',
    '/docs': '/docs/index.html',
    '/docs/': '/docs/index.html',
    '/docs/mcp': '/docs/mcp/index.html',
    '/docs/mcp/': '/docs/mcp/index.html',
    '/docs/mcp/getting-started': '/docs/mcp/getting-started.html',
    '/docs/mcp/auth-and-billing': '/docs/mcp/auth-and-billing.html',
    '/docs/mcp/tools': '/docs/mcp/tools.html',
    '/llms.txt': '/llms.txt',
  }

  // Canonical clean URLs only — 301 bare .html away from duplicate surface
  const HTML_TO_CLEAN = {
    '/index.html': '/',
    '/privacy.html': '/privacy',
    '/about.html': '/about',
    '/terms.html': '/terms',
    '/security.html': '/security',
    '/certified-mail.html': '/certified-mail',
    '/print-and-mail.html': '/print-and-mail',
    '/features.html': '/features',
    '/ai-print-to-mail.html': '/ai-print-to-mail',
    '/online-certified-mail.html': '/certified-mail',
    '/statements-invoices.html': '/statements-invoices',
    '/mailroom.html': '/mailroom',
    '/address-verification.html': '/address-verification',
    '/mcp.html': '/mcp',
    '/how-it-works.html': '/how-it-works',
    '/industries.html': '/industries',
    '/industries/credit-repair.html': '/industries/credit-repair',
    '/industries/banks.html': '/industries/banks',
    '/industries/government.html': '/industries/government',
    '/industries/collections.html': '/industries/collections',
    '/industries/healthcare.html': '/industries/healthcare',
    '/industries/utilities.html': '/industries/utilities',
    '/industries/legal.html': '/industries/legal',
    '/industries/storage.html': '/industries/storage',
    '/compare.html': '/compare',
    '/docs/index.html': '/docs',
    '/docs/mcp/index.html': '/docs/mcp',
    '/docs/mcp/getting-started.html': '/docs/mcp/getting-started',
    '/docs/mcp/auth-and-billing.html': '/docs/mcp/auth-and-billing',
    '/docs/mcp/tools.html': '/docs/mcp/tools',
  }
  if (HTML_TO_CLEAN[urlPath]) {
    return send(
      res,
      301,
      '',
      {
        Location: HTML_TO_CLEAN[urlPath],
        'Cache-Control': 'public, max-age=86400',
      },
      req,
    )
  }

  let rel = CLEAN[urlPath] || urlPath
  // Strip trailing slash for non-root (except already mapped)
  if (!CLEAN[urlPath] && urlPath.length > 1 && urlPath.endsWith('/')) {
    const noSlash = urlPath.replace(/\/+$/, '')
    if (CLEAN[noSlash]) {
      return send(
        res,
        301,
        '',
        { Location: noSlash, 'Cache-Control': 'public, max-age=86400' },
        req,
      )
    }
  }

  // HTML routes always return that page. Never swap in /llms.txt.
  if (urlPath !== '/llms.txt' && String(rel).endsWith('llms.txt')) {
    rel = CLEAN[urlPath] || urlPath
  }

  let filePath = path.normalize(path.join(publicDir, rel))
  if (!filePath.startsWith(publicDir)) {
    return send(res, 403, 'Forbidden', {}, req)
  }

  try {
    if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
      filePath = path.join(filePath, 'index.html')
    }
  } catch {
    /* fall through to readFile 404 */
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      // Hard 404 — do not soft-serve homepage for unknown paths (SEO hygiene)
      const wantsHtml =
        req.method === 'GET' &&
        String(req.headers.accept || '').includes('text/html')
      return send(
        res,
        404,
        req.method === 'HEAD' ? '' : wantsHtml ? NOT_FOUND_HTML : 'Not found',
        {
          'Content-Type': wantsHtml
            ? 'text/html; charset=utf-8'
            : 'text/plain; charset=utf-8',
          'Cache-Control': 'no-store',
        },
        req,
      )
    }
    const ext = path.extname(filePath).toLowerCase()
    const immutable = ['.png', '.jpg', '.jpeg', '.webp', '.svg', '.ico', '.js', '.css'].includes(ext)
    send(
      res,
      200,
      req.method === 'HEAD' ? '' : data,
      {
        'Content-Type':
          MIME[ext] ||
          (ext === '.txt' ? 'text/plain; charset=utf-8' : 'application/octet-stream'),
        'Cache-Control':
          ext === '.html'
            ? 'public, max-age=0, must-revalidate'
            : immutable
              ? 'public, max-age=604800, immutable'
              : 'public, max-age=86400',
      },
      req,
    )
  })
})

server.listen(port, '0.0.0.0', () => {
  console.log(`USMail.ai listening on http://0.0.0.0:${port}`)
})
