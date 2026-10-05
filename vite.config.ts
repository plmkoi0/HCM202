/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { viteSingleFile } from 'vite-plugin-singlefile'
import { createHash } from 'node:crypto'

// Hai bản build (mục 15.6):
// - online  (`vite build`)                → dist/          giao diện + api/ trên Vercel
// - offline (`vite build --mode offline`) → dist-offline/  một file index.html, chỉ "Chơi trên một máy", không request mạng
// Chỉ khi chạy thử (`npm run e2e:local` đặt BANK_TEST_CODE): Kho câu hỏi khóa bằng mã thử thay cho
// src/data/bank-lock.json. Bản build thường không có biến này → dùng khóa trong file.
function testBankLock(code: string | undefined) {
  if (!code) return null
  const salt = 'e2e-test'
  const hash = createHash('sha256').update(`${salt}:${code.normalize('NFC').trim().toLowerCase()}`, 'utf8').digest('hex')
  return { salt, hash }
}

export default defineConfig(({ mode }) => {
  const offline = mode === 'offline'
  return {
    base: offline ? './' : '/',
    plugins: [react(), tailwindcss(), ...(offline ? [viteSingleFile()] : [])],
    define: {
      __OFFLINE__: JSON.stringify(offline),
      __BANK_LOCK_TEST__: JSON.stringify(testBankLock(process.env.BANK_TEST_CODE)),
    },
    publicDir: offline ? false : 'public',
    build: {
      outDir: offline ? 'dist-offline' : 'dist',
      emptyOutDir: true,
      // bản offline một file: không cần polyfill tải trước module (có dùng fetch)
      modulePreload: offline ? false : { polyfill: true },
    },
    // `npm run dev` + `npm run server`: chuyển /api (cả WebSocket) sang server cục bộ
    server: {
      proxy: { '/api': { target: 'http://127.0.0.1:8787', ws: true } },
    },
    test: {
      environment: 'node',
      include: ['tests/**/*.test.ts', 'src/**/*.test.ts'],
      testTimeout: 20_000,
    },
  }
})
