// Vercel biên dịch từng file TypeScript sang JavaScript rồi chạy bằng Node ESM, không gom gói và
// không sửa đường dẫn import (mục 15.4). Test này làm y như vậy: tsc → thư mục tạm → nạp
// api/[...path].js bằng Node thuần, gọi thử health / tạo phòng / WebSocket (không có runtime Vercel).
import { execFileSync } from 'node:child_process'
import { mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const root = join(import.meta.dirname, '..')
const out = join(root, 'node_modules', '.tmp', 'api-esm-check')

describe('Lớp api/ chạy được bằng Node ESM thuần (như Vercel)', () => {
  it('biên dịch từng file, nạp và gọi được', () => {
    rmSync(out, { recursive: true, force: true })
    mkdirSync(out, { recursive: true })
    const tsconfig = join(out, 'tsconfig.json')
    writeFileSync(
      tsconfig,
      JSON.stringify({
        extends: join(root, 'tsconfig.server.json'),
        compilerOptions: { noEmit: false, outDir: join(out, 'build'), rootDir: root, declaration: false, sourceMap: false, tsBuildInfoFile: join(out, 'tsbuildinfo') },
        include: [join(root, 'api'), join(root, 'server')],
      }),
    )
    execFileSync(process.execPath, [join(root, 'node_modules', 'typescript', 'bin', 'tsc'), '-p', tsconfig], { cwd: root, stdio: 'pipe' })
    // package.json "type": "module" để Node coi .js là ESM (như ở gốc dự án)
    writeFileSync(join(out, 'build', 'package.json'), '{"type":"module"}')
    const script = `
      const m = await import(${JSON.stringify(join(out, 'build', 'api', '[...path].js'))})
      const h = await m.GET(new Request('http://x/api/health'))
      const c = await m.POST(new Request('http://x/api/rooms', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ name: 'Lan', color: 1, capacity: 3 }) }))
      const created = await c.json()
      const s = await m.GET(new Request('http://x/api/rooms/' + created.code + '/state', { headers: { authorization: 'Bearer ' + created.playerId + '.' + created.token } }))
      const w = await m.GET(new Request('http://x/api/ws', { headers: { upgrade: 'websocket' } }))
      // đường nhiều cấp qua rewrite của vercel.json: Vercel đưa URL đích hoặc URL gốc, kèm __p
      const auth = { authorization: 'Bearer ' + created.playerId + '.' + created.token }
      const r1 = await m.GET(new Request('http://x/api/[...path]?__p=rooms/' + created.code + '/state&since=' + created.state.version, { headers: auth }))
      const r2 = await m.GET(new Request('http://x/api/rooms/' + created.code + '?__p=rooms/' + created.code))
      const r3 = await m.GET(new Request('http://x/api/[...path]?__p=ws', { headers: { upgrade: 'websocket' } }))
      console.log(JSON.stringify({ health: [h.status, await h.json()], create: c.status, code: created.code, state: s.status, ws: w.status, rewritten: [r1.status, r2.status, (await r2.json()).code, r3.status] }))
    `
    const res = execFileSync(process.execPath, ['--input-type=module', '-e', script], { cwd: root, env: { ...process.env, VERCEL: '', REDIS_URL: '', KV_URL: '' }, stdio: ['ignore', 'pipe', 'pipe'] }).toString()
    const r = JSON.parse(res.trim().split('\n').pop()!)
    expect(r.health[0]).toBe(200)
    expect(r.health[1]).toMatchObject({ ok: true, store: 'memory' })
    expect(r.create).toBe(201)
    expect(r.code).toMatch(/^[A-Z2-9]{5}$/)
    expect(r.state).toBe(200)
    // ngoài runtime Vercel không nâng cấp được WebSocket → báo lỗi, client tự dùng polling
    expect(r.ws).toBe(501)
    // since = version hiện tại → 204; xem trước phòng → 200; WebSocket qua rewrite vẫn tới đúng chỗ
    expect(r.rewritten).toEqual([204, 200, r.code, 501])
  }, 60_000)

  it('trên Vercel mà chưa gắn Redis: /api/health báo thiếu biến nào, API phòng trả 503', () => {
    const script = `
      const { contextFromEnv } = await import(${JSON.stringify(join(out, 'build', 'server', 'context.js'))})
      const { handleApi } = await import(${JSON.stringify(join(out, 'build', 'server', 'http.js'))})
      const e = contextFromEnv({ VERCEL: '1', KV_REST_API_URL: 'https://x.upstash.io' })
      const h = await handleApi(e.ctx, new Request('http://x/api/health'), 'ip', e.missing)
      const c = await handleApi(e.ctx, new Request('http://x/api/rooms', { method: 'POST', body: '{}' }), 'ip', e.missing)
      const ok = contextFromEnv({ VERCEL: '1', KV_URL: 'rediss://default:x@y.upstash.io:6379' })
      console.log(JSON.stringify({ health: [h.status, await h.json()], create: [c.status, (await c.json()).error], redis: ok.ctx?.service.store.kind }))
    `
    const res = execFileSync(process.execPath, ['--input-type=module', '-e', script], { cwd: root, stdio: ['ignore', 'pipe', 'pipe'] }).toString()
    const r = JSON.parse(res.trim().split('\n').pop()!)
    expect(r.health[0]).toBe(503)
    expect(r.health[1].missing[0]).toContain('KV_URL')
    expect(r.health[1].missing[0]).toContain('REST')
    expect(r.create).toEqual([503, 'SERVER_NOT_READY'])
    expect(r.redis).toBe('redis')
  })
})
