import { Fragment } from 'react'

/** Hiện *chữ nghiêng* (tên tác phẩm trong dữ liệu hiện vật) — không dùng HTML thô */
export function RichText({ text }: { text: string }) {
  const parts = text.split(/(\*[^*]+\*)/g)
  return (
    <>
      {parts.map((p, i) => (p.startsWith('*') && p.endsWith('*') && p.length > 2 ? <em key={i}>{p.slice(1, -1)}</em> : <Fragment key={i}>{p}</Fragment>))}
    </>
  )
}
