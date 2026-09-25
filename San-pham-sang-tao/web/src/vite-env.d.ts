/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** "true" khi build bản offline một file (npm run build:offline) */
  readonly VITE_OFFLINE?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare module 'virtual:public-images' {
  /** Ảnh trong public/images đã nhúng base64 (chỉ có ở bản offline) */
  const images: Record<string, string>
  export default images
}
