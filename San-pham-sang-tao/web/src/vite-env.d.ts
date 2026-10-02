/// <reference types="vite/client" />

declare module 'virtual:public-images' {
  /** Ảnh trong public/images đã nhúng base64 */
  const images: Record<string, string>
  export default images
}
