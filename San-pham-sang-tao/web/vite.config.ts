import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// base './' để build chạy được trong thư mục con (GitHub Pages)
export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss()],
})
