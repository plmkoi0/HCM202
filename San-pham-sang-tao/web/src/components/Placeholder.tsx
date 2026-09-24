interface Props {
  id: string
  title: string
  stage: string
}

/** Mục sẽ được dựng ở giai đoạn sau; giữ để menu neo hoạt động. */
export default function Placeholder({ id, title, stage }: Props) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="px-4 py-16">
      <div className="mx-auto max-w-3xl rounded-sm border border-dashed border-line p-6 text-center">
        <h2 id={`${id}-title`} className="text-2xl font-bold">
          {title}
        </h2>
        <p className="mt-2 text-sm text-ink-soft">Đang xây dựng — {stage}.</p>
      </div>
    </section>
  )
}
