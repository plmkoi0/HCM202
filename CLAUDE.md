# CLAUDE.md — HCM202

File này lưu thông tin về repo để Claude (Claude Code / Claude chat) hiểu nhanh bối cảnh khi làm việc.

## Tổng quan
- **Tên repo:** HCM202
- **Môn học:** HCM202 — Tư tưởng Hồ Chí Minh
- **Mục đích:** Lưu trữ và phát triển sản phẩm sáng tạo của nhóm cho môn HCM202.
- **Chủ repo:** plmkoi0
- **Tài liệu thiết kế (nguồn chuẩn duy nhất cho nội dung web):** `San-pham-sang-tao/THIET-KE-WEB-APP.md`

## Nội dung sản phẩm (theo mục 1 tài liệu thiết kế)
- **Tên sản phẩm:** Của dân · Do dân · Vì dân — Bảo tàng số
- **Chủ đề:** Chủ đề 4 — Tư tưởng Hồ Chí Minh về Nhà nước của nhân dân, do nhân dân, vì nhân dân
- **Hình thức:** Web app tĩnh, một trang cuộn dài, chạy tốt trên điện thoại. Bảo tàng số (dòng thời gian hiện vật) → Quiz "Bạn là công dân kiểu gì?" → Chia sẻ kết quả
- **Thông điệp xuyên suốt:** "Chủ nhân không đứng ngoài"
- **Đối tượng:** Sinh viên đại học
- **Nguồn chuẩn:** Giáo trình HCM202, Chương IV, mục II (tr. 83–95) và *Hồ Chí Minh Toàn tập* (Nxb Chính trị quốc gia, 2011)

## Thành viên nhóm
- _(cập nhật — cũng điền vào `San-pham-sang-tao/web/src/data/team.json`)_

## Cấu trúc thư mục
```
HCM202/
├── CLAUDE.md
└── San-pham-sang-tao/
    ├── THIET-KE-WEB-APP.md          ← tài liệu thiết kế
    └── web/                         ← Vite + React + TypeScript + Tailwind CSS v4
        ├── index.html               ← font Noto Serif + Be Vietnam Pro (Google Fonts)
        ├── vite.config.ts           ← base './' (để deploy GitHub Pages)
        ├── README.md                ← cách chạy, cách sửa nội dung
        ├── public/
        │   ├── favicon.svg
        │   └── images/artifacts/    ← ảnh tư liệu (chưa có ảnh)
        └── src/
            ├── data/                ← artifacts.json, quiz.json, sources.json, team.json,
            │                          site.json (chữ ở hero, lời dẫn, cầu nối, chân trang)
            ├── components/
            │   ├── Nav.tsx, Hero.tsx, Intro.tsx, Bridge.tsx
            │   ├── Placeholder.tsx  ← giữ chỗ cho Quiz / Nguồn / Nhóm (M3, M4)
            │   ├── Museum/          ← Museum, PillarFilter, ProgressBar, Timeline,
            │   │                      ArtifactCard, ArtifactModal
            │   └── ui/              ← QuoteBlock, Todo, PillarChip, VerifyBadge, ImageFrame
            ├── lib/                 ← data.ts, site.ts, pillars.ts, pillarStyles.ts, useReveal.ts
            ├── types.ts             ← kiểu dữ liệu cho các file JSON
            ├── index.css            ← màu, font, phiếu răng cưa, con dấu, hiệu ứng (mục 7)
            ├── App.tsx
            └── main.tsx
```
Chạy: `cd San-pham-sang-tao/web && npm install && npm run dev`. Kiểm tra: `npm run build && npm run lint`.

## Tiến độ (theo mục 10 tài liệu thiết kế)
- [x] **M1** — Khởi tạo Vite + React + TS + Tailwind; 4 file JSON từ mục 4, 5, 9; màu và font theo mục 7
- [x] **M2** — Hero, bộ lọc, dòng thời gian, phiếu và cửa sổ chi tiết hiện vật, thanh tiến độ
  - Cửa sổ chi tiết dùng `<dialog>` (Esc để đóng, nút Trước/Sau); tiến độ "đã xem" lưu ở localStorage
  - Mục Quiz, Nguồn, Nhóm hiện là khung giữ chỗ để menu neo hoạt động
- [ ] **M3** — Quiz 8 câu, `scoring.ts` có unit test, trang kết quả, xem lại giải thích
- [ ] **M4** — Thẻ kết quả PNG, link `?kq=`, Web Share, Open Graph, sơ đồ tư duy, trang nguồn và nhóm
- [ ] **M5** — GitHub Actions deploy Pages, thống kê, kiểm tra trên điện thoại

## Ghi chú dữ liệu
- `verified: true` chỉ đặt cho hiện vật có cột "Nguồn sự kiện" chỉ ghi GT (HV-03, HV-07, HV-12, HV-13). Các hiện vật còn lại có mục "cần xác minh" nên để `false`.
- `eventSource` chép nguyên cột "Nguồn sự kiện" để nhóm biết cần xác minh gì.
- `quote.lead` là phần dẫn nằm ngoài ngoặc kép (vd. HV-05, kiểu A). `quote.paraphrase: true` là tóm ý, không phải trích nguyên văn (HV-13).
- Nhãn `[Chờ xác minh]` hiện trên phiếu và cửa sổ chi tiết khi `verified: false`. Trường `TODO` hiện thành ô viền đứt "TODO".
- Màu chữ vàng đồng dùng `#7A5A17` (nền sáng) để đạt WCAG AA; `#B8892B` giữ cho nền nhãn, đường kẻ.

## TODO còn lại (nội dung — nhóm cung cấp)
- [ ] Nguồn APA7 của giáo trình (`sources.json` → `giao-trinh`) và bổ sung giáo trình **tr. 92–93**
- [ ] Ảnh tư liệu + `alt` + nguồn ảnh cho cả 13 hiện vật
- [ ] "Câu chuyện" cho 12 hiện vật (đã có HV-07)
- [ ] "Ngày nay" cho 13 hiện vật (HV-07 có sẵn câu hỏi gợi mở)
- [ ] Xác minh và ghi nguồn APA7 cho mục "cần xác minh": HV-01, 02, 04, 05, 06, 08, 09, 10, 11
- [ ] HV-04: chọn dùng lại trích dẫn HV-03 hay để trống
- [ ] HV-12 (Hiến pháp 1959, Lời nói đầu) và HV-13 (tóm ý, GT tr.82) chưa có số tập/số trang *Toàn tập*; cần nguồn APA7 cho Hiến pháp 1959
- [ ] Đối chiếu mọi trích dẫn với bản gốc *Toàn tập*
- [ ] `site.json` → `intro.paragraph`: đoạn lời dẫn ngắn (§1; tài liệu chỉ có câu trích)
- [ ] `team.json`: tên và vai trò thành viên
- [ ] Hạn nộp

## Mốc thời gian
- Hạn nộp: _(cập nhật)_

## Quy ước khi Claude làm việc với repo
- Trả lời và viết nội dung bằng **tiếng Việt**.
- **Không tự thêm sự kiện, số liệu, trích dẫn ngoài tài liệu thiết kế** (`San-pham-sang-tao/THIET-KE-WEB-APP.md`). Trường nào thiếu thì ghi `TODO`.
- Nội dung về tư tưởng Hồ Chí Minh phải chính xác, có trích dẫn nguồn kèm số tập và số trang.
- Không tự lấy ảnh trên mạng khi chưa rõ bản quyền; không tự vẽ chân dung Bác.
- Nội dung nằm trong `web/src/data/*.json`, không viết cứng trong component.
- Commit message ngắn gọn bằng tiếng Việt, mô tả rõ thay đổi.
- Cập nhật file này sau mỗi giai đoạn (tiến độ, cấu trúc thư mục, TODO).
