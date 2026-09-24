import type { Quote } from '../../types'

interface Props {
  quote: Quote
  className?: string
  size?: 'md' | 'lg'
}

/** Trích dẫn luôn hiển thị kèm nguồn (số tập, số trang). */
export default function QuoteBlock({ quote, className = '', size = 'md' }: Props) {
  const textSize = size === 'lg' ? 'text-xl sm:text-2xl' : 'text-lg'
  return (
    <figure className={className}>
      <blockquote className={`font-serif ${textSize} leading-relaxed`}>
        {quote.lead && <span className="text-ink-soft">{quote.lead} </span>}
        {quote.paraphrase ? <span>{quote.text}</span> : <q className="italic">{quote.text}</q>}
      </blockquote>
      <figcaption className="mt-2 text-sm font-medium text-ink-soft">({quote.cite})</figcaption>
    </figure>
  )
}
