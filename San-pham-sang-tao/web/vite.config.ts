import { readdirSync, readFileSync, statSync } from 'node:fs'
import { extname, join, relative, resolve, sep } from 'node:path'
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
 * Module ảo `virtual:public-images`: bảng { "images/artifacts/HV-07.jpg": "data:…" }
 * gồm mọi ảnh trong public/images, nhúng base64 vào file index.html duy nhất.
 * Favicon cũng được nhúng vào index.html.
 */
function embedAssets(): Plugin {
  const id = 'virtual:public-images'
  const resolved = '\0' + id
  return {
    name: 'hcm202-embed-assets',
    resolveId: (source) => (source === id ? resolved : undefined),
    load(loadId) {
      if (loadId !== resolved) return
      const map: Record<string, string> = {}
      for (const file of listFiles(join(PUBLIC_DIR, 'images'))) {
        const uri = dataUri(file)
        // Bỏ qua file không phải ảnh (vd. .gitkeep)
        if (!uri) continue
        map[relative(PUBLIC_DIR, file).split(sep).join('/')] = uri
        this.addWatchFile(resolve(file))
      }
      return `export default ${JSON.stringify(map)}`
    },
    transformIndexHtml(html) {
      const icon = dataUri(join(PUBLIC_DIR, 'favicon.svg'))
      return icon ? html.replace('href="./favicon.svg"', `href="${icon}"`) : html
    },
  }
}

/**
 * Một bản build duy nhất: dist/index.html chứa toàn bộ JS, CSS, font, ảnh, favicon
 * (vite-plugin-singlefile), mở bằng cách bấm đúp (file://) khi không có mạng.
 * public/ chỉ là nơi để ảnh nguồn; không chép ra dist.
 */
export default defineConfig({
  base: './',
  publicDir: false,
  plugins: [react(), tailwindcss(), embedAssets(), viteSingleFile()],
})
