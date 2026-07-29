import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const publicDir = path.join(__dirname, 'public')
const dataDir = path.join(__dirname, 'data')
const leadsFile = path.join(dataDir, 'early-access.jsonl')
const port = Number(process.env.PORT) || 3000

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

function send(res, status, body, headers = {}) {
  const payload = body == null ? '' : body
  res.writeHead(status, { ...SECURITY, ...headers })
  res.end(payload)
}

function sendJson(res, status, obj) {
  send(res, status, JSON.stringify(obj), {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
  })
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

async function handleEarlyAccess(req, res) {
  if (req.method === 'OPTIONS') {
    return send(res, 204, '', {
      'Access-Control-Allow-Origin': 'null',
      'Access-Control-Allow-Methods': 'POST',
      'Access-Control-Allow-Headers': 'Content-Type',
    })
  }
  if (req.method !== 'POST') {
    return sendJson(res, 405, { ok: false, error: 'method_not_allowed' })
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
      return sendJson(res, 200, { ok: true })
    }

    const email = sanitizeLine(data.email, 200).toLowerCase()
    const name = sanitizeLine(data.name, 120)
    const interest = sanitizeLine(data.interest || data.note || '', 400)

    if (!isValidEmail(email)) {
      return sendJson(res, 400, { ok: false, error: 'invalid_email' })
    }

    fs.mkdirSync(dataDir, { recursive: true })
    const row = {
      at: new Date().toISOString(),
      email,
      name: name || null,
      interest: interest || null,
      ip: (req.headers['x-forwarded-for'] || '').toString().split(',')[0].trim() || null,
      ua: sanitizeLine(req.headers['user-agent'], 200) || null,
    }
    fs.appendFileSync(leadsFile, `${JSON.stringify(row)}\n`, 'utf8')
    console.log('[early-access]', row.email)
    return sendJson(res, 200, { ok: true })
  } catch (err) {
    if (err && err.message === 'payload_too_large') {
      return sendJson(res, 413, { ok: false, error: 'payload_too_large' })
    }
    console.error('[early-access] error', err)
    return sendJson(res, 400, { ok: false, error: 'bad_request' })
  }
}

const server = http.createServer(async (req, res) => {
  const urlPath = decodeURIComponent((req.url || '/').split('?')[0])

  if (urlPath === '/api/early-access' || urlPath === '/api/early-access/') {
    return handleEarlyAccess(req, res)
  }

  if (req.method !== 'GET' && req.method !== 'HEAD') {
    return send(res, 405, 'Method not allowed')
  }

  let rel = urlPath === '/' ? '/index.html' : urlPath
  const filePath = path.normalize(path.join(publicDir, rel))
  if (!filePath.startsWith(publicDir)) {
    return send(res, 403, 'Forbidden')
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      // Hard 404 — do not soft-serve homepage for unknown paths (SEO hygiene)
      return send(res, 404, 'Not found', {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-store',
      })
    }
    const ext = path.extname(filePath).toLowerCase()
    const immutable = ['.png', '.jpg', '.jpeg', '.webp', '.svg', '.ico', '.js', '.css'].includes(ext)
    send(res, 200, req.method === 'HEAD' ? '' : data, {
      'Content-Type': MIME[ext] || 'application/octet-stream',
      'Cache-Control':
        ext === '.html'
          ? 'no-cache'
          : immutable
            ? 'public, max-age=604800, immutable'
            : 'public, max-age=86400',
    })
  })
})

server.listen(port, '0.0.0.0', () => {
  console.log(`USMail.AI listening on http://0.0.0.0:${port}`)
})
