import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const publicDir = path.join(__dirname, 'public')
const port = Number(process.env.PORT) || 3000

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml',
}

function send(res, status, body, headers = {}) {
  res.writeHead(status, headers)
  res.end(body)
}

const server = http.createServer((req, res) => {
  const urlPath = decodeURIComponent((req.url || '/').split('?')[0])
  let rel = urlPath === '/' ? '/index.html' : urlPath
  // prevent path escape
  const filePath = path.normalize(path.join(publicDir, rel))
  if (!filePath.startsWith(publicDir)) {
    return send(res, 403, 'Forbidden')
  }
  fs.readFile(filePath, (err, data) => {
    if (err) {
      if (urlPath !== '/' && !path.extname(urlPath)) {
        // SPA-ish fallback to index for clean paths
        return fs.readFile(path.join(publicDir, 'index.html'), (e2, html) => {
          if (e2) return send(res, 404, 'Not found')
          send(res, 200, html, { 'Content-Type': MIME['.html'] })
        })
      }
      return send(res, 404, 'Not found')
    }
    const ext = path.extname(filePath).toLowerCase()
    send(res, 200, data, {
      'Content-Type': MIME[ext] || 'application/octet-stream',
      'Cache-Control': ext === '.html' ? 'no-cache' : 'public, max-age=86400',
    })
  })
})

server.listen(port, '0.0.0.0', () => {
  console.log(`USMail.AI listening on http://0.0.0.0:${port}`)
})
