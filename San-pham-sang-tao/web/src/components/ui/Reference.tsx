import type { Reference } from '../../types'

/** Chuỗi APA: đoạn nằm giữa *…* hiển thị nghiêng. */
function Italics({ text }: { text: string }) {
  return text.split(/\*([^*]+)\*/).map((part, i) => (i % 2 ? <i key={i}>{part}</i> : part))
}

/** Một mục tham khảo APA7: sách (author/year/title…) hoặc nguồn web (apa + url). */
export default function ReferenceText({ r }: { r: Reference }) {
  if (r.apa) {
    return (
      <>
        <Italics text={r.apa} />{' '}
        {r.url && (
          <a href={r.url} target="_blank" rel="noopener noreferrer" className="break-all underline hover:text-son-text">
            {r.url}
          </a>
        )}
      </>
    )
  }
  return (
    <>
      {r.author}. ({r.year}). <i>{r.title}</i> ({r.detail}). {r.publisher}.
    </>
  )
}
