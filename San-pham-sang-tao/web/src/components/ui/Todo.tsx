/** Ô giữ chỗ cho trường còn thiếu trong tài liệu thiết kế. */
export default function Todo({ note }: { note?: string }) {
  return (
    <p className="rounded-md border border-dashed border-line px-3 py-2 text-sm text-ink-soft">
      <span className="mr-1 font-semibold tracking-wide">TODO</span>
      {note ?? 'Nhóm đang bổ sung nội dung.'}
    </p>
  )
}
