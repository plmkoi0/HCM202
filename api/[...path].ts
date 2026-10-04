// Lớp mỏng Vercel Functions (mục 15.4): một function bắt mọi đường /api/* (gói Hobby giới hạn
// 12 function mỗi deployment) chuyển vào `server/`. Chỉ ở đây mới gọi API WebSocket còn thử
// nghiệm của Vercel — khi Vercel đổi tên hàm, chỉ sửa file này.

import { experimental_upgradeWebSocket } from '@vercel/functions'
import { getContext } from '../server/context.js'
import { clientIp, errorResponse, handleApi } from '../server/http.js'
import { attachSocket, SOCKET_MAX_PAYLOAD } from '../server/socket.js'

/**
 * Ngoài Next.js, Vercel chỉ cho `[...path]` khớp một cấp (/api/health, /api/rooms) — đường nhiều cấp
 * (/api/rooms/ABCDE/join) đi qua rewrite `/api/(.*)` → function này kèm `__p=$1` (vercel.json).
 * Khôi phục đường gốc từ `__p`, dù Vercel đưa vào URL gốc hay URL đích; bỏ `__p` khỏi truy vấn.
 */
function originalUrl(request: Request): URL {
  const url = new URL(request.url)
  const p = url.searchParams.get('__p')
  if (p === null) return url
  url.searchParams.delete('__p')
  url.pathname = `/api/${p.replace(/^\/+/, '')}`
  return url
}

async function handle(request: Request): Promise<Response> {
  const { ctx, missing } = getContext()
  const url = originalUrl(request)
  const path = url.pathname
  if (path === '/api/ws' && request.headers.get('upgrade')?.toLowerCase() === 'websocket') {
    if (!ctx) return errorResponse('SERVER_NOT_READY', 503)
    // Vercel tự đóng kết nối sau 300 s (Hobby) — client nối lại trước mốc đó
    try {
      return await experimental_upgradeWebSocket((ws) => attachSocket(ws, ctx, { ip: clientIp(request) }), { maxPayload: SOCKET_MAX_PAYLOAD })
    } catch (e) {
      // môi trường không hỗ trợ WebSocket → client tự dùng polling
      console.error('[api] không nâng cấp được WebSocket', e instanceof Error ? e.message : e)
      return errorResponse('SERVER_NOT_READY', 501)
    }
  }
  return handleApi(ctx, request, clientIp(request), missing, url)
}

export function GET(request: Request): Promise<Response> {
  return handle(request)
}

export function POST(request: Request): Promise<Response> {
  return handle(request)
}

export function HEAD(request: Request): Promise<Response> {
  return handle(request)
}
