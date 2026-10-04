// Server Node cục bộ (mục 15.4): cùng lõi `server/` với Vercel, chạy không cần tài khoản.
// - /api/* → handleApi (Request/Response kiểu Web)
// - /api/ws → WebSocket (`ws`), giả lập giới hạn 300 s của Vercel Hobby (client phải tự nối lại)
// - phần còn lại → file tĩnh trong `staticDir` (bản build `dist/`), đường dẫn lạ → index.html (vd. /p/ABCDE)

import { createReadStream, existsSync, statSync } from 'node:fs'
import { createServer, type IncomingMessage, type Server, type ServerResponse } from 'node:http'
import { extname, join, normalize, resolve } from 'node:path'
import { WebSocketServer } from 'ws'
import type { ServerContext } from './context.js'
import { handleApi, MAX_BODY } from './http.js'
import { attachSocket, SOCKET_MAX_PAYLOAD } from './socket.js'

export interface LocalServerOptions {
  port?: number
  host?: string
  ctx: ServerContext | null
  missing?: string[]
  staticDir?: string
  /** đóng kết nối WebSocket sau chừng này (mặc định 300 s như Vercel Hobby; 0 = không giới hạn) */
  socketMaxLifeMs?: number
}

export interface LocalServer {
  url: string
  port: number
  server: Server
  /** cắt đột ngột mọi kết nối WebSocket (test: giả lập mất mạng / Vercel đóng kết nối) */
  dropSockets(): number
  close(): Promise<void>
}

const TYPES: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
  '.webmanifest': 'application/manifest+json',
}

function remoteIp(req: IncomingMessage): string {
  const xf = req.headers['x-forwarded-for']
  if (typeof xf === 'string' && xf) return xf.split(',')[0]!.trim()
  return req.socket.remoteAddress ?? 'local'
}

async function readBody(req: IncomingMessage): Promise<Buffer | null> {
  if (req.method === 'GET' || req.method === 'HEAD') return null
  const chunks: Buffer[] = []
  let size = 0
  for await (const c of req) {
    size += (c as Buffer).length
    if (size > MAX_BODY * 2) break
    chunks.push(c as Buffer)
  }
  return Buffer.concat(chunks)
}

async function toWebRequest(req: IncomingMessage, base: string): Promise<Request> {
  const headers = new Headers()
  for (const [k, v] of Object.entries(req.headers)) {
    if (Array.isArray(v)) for (const x of v) headers.append(k, x)
    else if (v !== undefined) headers.set(k, v)
  }
  const body = await readBody(req)
  return new Request(new URL(req.url ?? '/', base), { method: req.method, headers, body: body && body.length > 0 ? new Uint8Array(body) : undefined })
}

async function sendWeb(res: ServerResponse, r: Response): Promise<void> {
  const headers: Record<string, string> = {}
  r.headers.forEach((v, k) => (headers[k] = v))
  res.writeHead(r.status, headers)
  if (r.body) res.end(Buffer.from(await r.arrayBuffer()))
  else res.end()
}

function serveStatic(res: ServerResponse, root: string, urlPath: string): void {
  let decoded: string
  try {
    decoded = decodeURIComponent(urlPath.split('?')[0]!)
  } catch {
    res.writeHead(400)
    res.end()
    return
  }
  const clean = normalize(decoded).replace(/^(\.\.[/\\])+/, '')
  let file = join(root, clean)
  if (!file.startsWith(root) || !existsSync(file) || statSync(file).isDirectory()) file = join(root, 'index.html')
  if (!existsSync(file)) {
    res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' })
    res.end('Chưa có bản build — chạy npm run build')
    return
  }
  const headers: Record<string, string> = { 'content-type': TYPES[extname(file)] ?? 'application/octet-stream', 'x-robots-tag': 'noindex, nofollow' }
  if (file.includes('/assets/')) headers['cache-control'] = 'public, max-age=31536000, immutable'
  res.writeHead(200, headers)
  createReadStream(file).pipe(res)
}

export function startLocalServer(o: LocalServerOptions): Promise<LocalServer> {
  const host = o.host ?? '127.0.0.1'
  const staticRoot = o.staticDir ? resolve(o.staticDir) : null
  const maxLife = o.socketMaxLifeMs ?? 300_000
  let base = ''

  const server = createServer((req, res) => {
    const path = (req.url ?? '/').split('?')[0]!
    if (path.startsWith('/api/') || path === '/api') {
      void (async () => {
        try {
          const wr = await toWebRequest(req, base)
          await sendWeb(res, await handleApi(o.ctx, wr, remoteIp(req), o.missing))
        } catch (e) {
          console.error('[server] lỗi', e)
          if (!res.headersSent) res.writeHead(500)
          res.end()
        }
      })()
      return
    }
    if (staticRoot) serveStatic(res, staticRoot, path)
    else {
      res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' })
      res.end('Không có trang tĩnh (chạy kèm --static dist)')
    }
  })

  const wss = new WebSocketServer({ noServer: true, maxPayload: SOCKET_MAX_PAYLOAD })
  server.on('upgrade', (req, socket, head) => {
    const path = (req.url ?? '/').split('?')[0]
    if (path !== '/api/ws' || !o.ctx) {
      socket.destroy()
      return
    }
    const ctx = o.ctx
    wss.handleUpgrade(req, socket, head, (ws) => attachSocket(ws, ctx, { maxLifeMs: maxLife || undefined, ip: remoteIp(req) }))
  })

  return new Promise((ok) => {
    server.listen(o.port ?? 0, host, () => {
      const addr = server.address()
      const port = typeof addr === 'object' && addr ? addr.port : (o.port ?? 0)
      base = `http://${host === '0.0.0.0' ? '127.0.0.1' : host}:${port}`
      ok({
        url: base,
        port,
        server,
        dropSockets: () => {
          let n = 0
          for (const c of wss.clients) {
            c.terminate()
            n += 1
          }
          return n
        },
        close: () =>
          new Promise<void>((done) => {
            for (const c of wss.clients) c.terminate()
            wss.close()
            server.closeAllConnections?.()
            server.close(() => done())
          }),
      })
    })
  })
}
