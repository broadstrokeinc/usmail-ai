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
  // Allow self + Google Fonts + Lucide CDN (icons only)
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' https://unpkg.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com data:",
    "img-src 'self' data: https:",
    "connect-src 'self'",
    "frame-ancestors 'self'",
    "base-uri 'self'",
    "form-action 'self' mailto:",
  ].join('; '),
}

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
  (process.env.LEAD_FROM || 'USMail.AI <onboarding@resend.dev>').trim()
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
    'New USMail.AI early-access request',
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
    subject: `[USMail.AI] Waitlist · ${interest} · ${row.email}`,
    text,
    replyTo: row.email,
  })

  let ack = null
  if (LEAD_ACK) {
    ack = await resendSend({
      to: row.email,
      subject: 'We received your USMail.AI early-access request',
      text: [
        row.name ? `Hi ${row.name},` : 'Hi,',
        '',
        'Thanks for joining the USMail.AI waitlist. We will notify you when access opens and can schedule a demo if you asked for one.',
        '',
        'Questions now? Call 888-667-5322 or reply to this email.',
        '',
        '— USMail.AI',
        'https://usmail.ai',
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

  if (urlPath === '/health' || urlPath === '/healthz') {
    return sendJson(res, 200, { ok: true, service: 'usmail-ai' }, req)
  }

  if (urlPath === '/api/early-access' || urlPath === '/api/early-access/') {
    return handleEarlyAccess(req, res)
  }

  if (req.method !== 'GET' && req.method !== 'HEAD') {
    return send(res, 405, 'Method not allowed', {}, req)
  }

  const CLEAN = {
    '/': '/index.html',
    '/privacy': '/privacy.html',
    '/certified-mail': '/certified-mail.html',
    '/mcp': '/mcp.html',
    '/how-it-works': '/how-it-works.html',
    '/industries': '/industries.html',
  }

  // Canonical clean URLs only — 301 bare .html away from duplicate surface
  const HTML_TO_CLEAN = {
    '/index.html': '/',
    '/privacy.html': '/privacy',
    '/certified-mail.html': '/certified-mail',
    '/mcp.html': '/mcp',
    '/how-it-works.html': '/how-it-works',
    '/industries.html': '/industries',
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

  const filePath = path.normalize(path.join(publicDir, rel))
  if (!filePath.startsWith(publicDir)) {
    return send(res, 403, 'Forbidden', {}, req)
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      // Hard 404 — do not soft-serve homepage for unknown paths (SEO hygiene)
      return send(
        res,
        404,
        'Not found',
        {
          'Content-Type': 'text/plain; charset=utf-8',
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
        'Content-Type': MIME[ext] || 'application/octet-stream',
        'Cache-Control':
          ext === '.html'
            ? 'no-cache'
            : immutable
              ? 'public, max-age=604800, immutable'
              : 'public, max-age=86400',
      },
      req,
    )
  })
})

server.listen(port, '0.0.0.0', () => {
  console.log(`USMail.AI listening on http://0.0.0.0:${port}`)
})
