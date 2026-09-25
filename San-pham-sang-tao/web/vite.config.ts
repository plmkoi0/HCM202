import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// base './': đường dẫn tương đối, chạy được trên Vercel và khi mở trực tiếp file
export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss()],
})
