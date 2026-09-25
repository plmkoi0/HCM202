import publicImages from 'virtual:public-images'
import { isTodo } from '../../lib/data'
import type { Artifact } from '../../types'

/** Ảnh tư liệu, hoặc khung SVG giữ chỗ khi nhóm chưa cung cấp ảnh (mục 4). */
export default function ImageFrame({ image }: { image: Artifact['image'] }) {
  if (image.src) {
    // Bản offline: ảnh đã nhúng base64; bản online: lấy từ public/
    const src = publicImages[image.src.replace(/^\.?\//, '')] ?? image.src
    return (
      <figure>
        <img
          src={src}
          alt={isTodo(image.alt) ? '' : image.alt}
          className="w-full rounded-sm border border-line object-cover"
          loading="lazy"
        />
        <figcaption className="mt-1 text-xs text-ink-soft">
          Nguồn ảnh: {isTodo(image.credit) ? 'TODO' : image.credit}
        </figcaption>
      </figure>
    )
  }
  return (
    <figure role="img" aria-label="Ảnh tư liệu — đang bổ sung">
      <svg viewBox="0 0 320 180" className="w-full text-ink-soft" aria-hidden="true">
        <rect x="4" y="4" width="312" height="172" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="6 5" rx="3" />
        <path d="M130 108l22-26 18 20 12-12 22 18z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <circle cx="192" cy="70" r="7" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <text x="160" y="140" textAnchor="middle" fontSize="13" fill="currentColor" fontFamily="Be Vietnam Pro, system-ui, sans-serif">
          Ảnh tư liệu — đang bổ sung
        </text>
      </svg>
    </figure>
  )
}
