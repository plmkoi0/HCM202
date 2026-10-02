import { readdirSync, readFileSync, statSync } from 'node:fs'
import { extname, join, relative, sep } from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'
import { viteSingleFile } from 'vite-plugin-singlefile'

const PUBLIC_DIR = 'public'
const IMAGE_TYPES: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.avif': 'image/avif',
  '.svg': 'image/svg+xml',
}

function dataUri(file: string) {
  const mime = IMAGE_TYPES[extname(file).toLowerCase()]
  return mime ? `data:${mime};base64,${readFileSync(file).toString('base64')}` : null
}

function listFiles(dir: string): string[] {
  try {
    return readdirSync(dir).flatMap((name) => {
      const p = join(dir, name)
      return statSync(p).isDirectory() ? listFiles(p) : [p]
    })
  } catch {
    return []
  }
}

/**
 * Module ảo `virtual:public-images`: bảng { "images/artifacts/HV-07.jpg": "data:…" }.
 * Bản offline nhúng mọi ảnh trong public/images; bản online để trống (ảnh lấy từ public/).
 * Bản offline cũng nhúng favicon vào index.html.
 */
function offlineAssets(offline: boolean): Plugin {
  const id = 'virtual:public-images'
  const resolved = '\0' + id
  return {
    name: 'hcm202-offline-assets',
    resolveId: (source) => (source === id ? resolved : undefined),
    load(loadId) {
      if (loadId !== resolved) return
      const map: Record<string, string> = {}
      if (offline) {
        for (const file of listFiles(join(PUBLIC_DIR, 'images'))) {
          const uri = dataUri(file)
          if (uri) map[relative(PUBLIC_DIR, file).split(sep).join('/')] = uri
          this.addWatchFile(file)
        }
      }
      return `export default ${JSON.stringify(map)}`
    },
    transformIndexHtml(html) {
      if (!offline) return html
      const icon = dataUri(join(PUBLIC_DIR, 'favicon.svg'))
      return icon ? html.replace('href="./favicon.svg"', `href="${icon}"`) : html
    },
  }
}

// base './': đường dẫn tương đối, chạy được trên Vercel và khi mở trực tiếp file
export default defineConfig(({ mode }) => {
  const offline = mode === 'offline'
  return {
    base: './',
    // Bản offline chỉ có một file index.html; ảnh và favicon đã được nhúng
    publicDir: offline ? false : PUBLIC_DIR,
    plugins: [react(), tailwindcss(), offlineAssets(offline), ...(offline ? [viteSingleFile()] : [])],
    build: offline ? { outDir: 'dist-offline', emptyOutDir: true } : {},
  }
})
