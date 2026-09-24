import { artifacts, quiz, sources, team } from './lib/data'
import { PILLARS } from './lib/pillars'

// M1: khung dự án, kiểm tra dữ liệu đã nạp. Giao diện đầy đủ ở M2.
export default function App() {
  return (
    <main className="paper-texture mx-auto min-h-screen max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold text-son-text">Của dân · Do dân · Vì dân — Bảo tàng số</h1>
      <p className="mt-2 font-serif text-lg italic">Chủ nhân không đứng ngoài</p>
      <ul className="mt-8 space-y-1">
        <li>{artifacts.length} hiện vật</li>
        <li>
          {quiz.questions.length} câu hỏi · {quiz.types.length} kiểu công dân
        </li>
        <li>{sources.references.length} nguồn tham khảo</li>
        <li>{team.members.length} thành viên</li>
      </ul>
      <ul className="mt-6 flex flex-wrap gap-2">
        {PILLARS.map((p) => (
          <li key={p.id} className="rounded-full border border-line px-3 py-1 text-sm">
            {p.name}: {artifacts.filter((a) => a.pillar === p.id).length}
          </li>
        ))}
      </ul>
    </main>
  )
}
