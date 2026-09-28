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
├── vercel.json                      ← deploy Vercel: build web/, output dist, header X-Robots-Tag noindex
└── San-pham-sang-tao/
    ├── THIET-KE-WEB-APP.md          ← tài liệu thiết kế
    └── web/                         ← Vite + React + TypeScript + Tailwind CSS v4 + Vitest
        ├── index.html               ← meta robots noindex, Open Graph, Twitter card
        ├── vite.config.ts           ← base './'; mode "offline": vite-plugin-singlefile, nhúng ảnh
        │                              public/images + favicon (module ảo virtual:public-images)
        ├── .env.offline             ← VITE_OFFLINE=true (chỉ dùng khi build bản offline)
        ├── README.md                ← cách chạy, sửa nội dung, deploy Vercel, bản offline
        ├── scripts/
        │   ├── package-offline.mjs  ← nén dist-offline/HCM202-San-pham-sang-tao.zip (không cần công cụ zip)
        │   └── HUONG-DAN-CHAY.txt   ← mẫu hướng dẫn chạy kèm file zip
        ├── public/
        │   ├── favicon.svg, robots.txt (Disallow: /)
        │   └── images/artifacts/    ← ảnh tư liệu (chưa có ảnh)
        └── src/
            ├── data/                ← artifacts, quiz, sources, team, mindmap (mục 2),
            │                          site.json (chữ giao diện, siteUrl, ghi chú bản offline)
            ├── assets/
            │   ├── fonts.css        ← @font-face Noto Serif + Be Vietnam Pro (tự host)
            │   └── fonts/           ← woff2 subset latin + vietnamese, chỉ weight đang dùng + giấy phép OFL
            ├── components/
            │   ├── Nav, Hero, Intro, Bridge, MindMap, Sources, Team (.tsx)
            │   ├── Museum/          ← Museum, PillarFilter, ProgressBar, Timeline, ArtifactCard,
            │   │                      ArtifactModal, ArtifactViewerProvider (modal dùng chung)
            │   ├── Quiz/            ← Quiz, QuestionCard, Result, Review, ShareActions, ShareCard
            │   └── ui/              ← QuoteBlock, Todo, PillarChip, VerifyBadge, ImageFrame
            ├── lib/                 ← data, site, pillars, pillarStyles, useReveal,
            │                          artifactViewer (context mở modal theo id), format,
            │                          scoring (+ scoring.test.ts), share (siteUrl, khổ thẻ, sao chép),
            │                          offline (cờ OFFLINE)
            ├── vite-env.d.ts        ← kiểu cho VITE_OFFLINE và virtual:public-images
            ├── types.ts             ← kiểu dữ liệu cho các file JSON
            ├── index.css            ← màu, phiếu răng cưa, con dấu, hiệu ứng (mục 7)
            ├── App.tsx
            └── main.tsx
```
Chạy: `cd San-pham-sang-tao/web && npm install && npm run dev`.
Kiểm tra: `npm run test && npm run build && npm run build:offline && npm run lint`.

## Cách build hai bản
| Bản | Lệnh | Kết quả | Ghi chú |
|---|---|---|---|
| Online | `npm run build` (Vercel tự chạy theo `vercel.json`) | `dist/` | Không liệt kê công khai: meta robots, header `X-Robots-Tag`, `robots.txt`. Không gắn thống kê. Hướng dẫn kết nối Vercel trong `web/README.md` |
| Offline | `npm run build:offline` | `dist-offline/index.html` | Một file duy nhất, mở bằng file:// khi không có mạng; không có request ra ngoài |
| Gói nộp bài | `npm run package:offline` | `dist-offline/HCM202-San-pham-sang-tao.zip` | Gồm `index.html` + `HUONG-DAN-CHAY.txt` |

- Bản offline (`VITE_OFFLINE=true`): ẩn nút Web Share; giữ "Tải thẻ" và "Sao chép link" (trỏ tới `siteUrl`); chân trang có "Bản offline — xem bản online tại [siteUrl]".
- `dist/`, `dist-offline/` không commit.

## Tiến độ (theo mục 10 tài liệu thiết kế)
- [x] **M1** — Khởi tạo Vite + React + TS + Tailwind; 4 file JSON từ mục 4, 5, 9; màu và font theo mục 7
- [x] **M2** — Hero, bộ lọc, dòng thời gian, phiếu và cửa sổ chi tiết hiện vật, thanh tiến độ
  - Cửa sổ chi tiết dùng `<dialog>` (Esc để đóng, nút Trước/Sau); tiến độ "đã xem" lưu ở localStorage
  - Mục Quiz, Nguồn, Nhóm hiện là khung giữ chỗ để menu neo hoạt động
- [x] **M3** — Quiz 8 câu, `scoring.ts` có unit test, trang kết quả, xem lại giải thích
  - Mỗi màn hình một câu, "Câu x/8", nút quay lại; đáp án trộn một lần mỗi lượt chơi
  - Chip "Hiện vật liên quan" mở đúng ArtifactModal (qua `ArtifactViewerProvider`), tính vào tiến độ "đã xem"
- [x] **M4** — Thẻ kết quả PNG, link `?kq=`, Web Share, Open Graph, sơ đồ tư duy, trang nguồn
  - `?kq=A|B|C|D` mở trang kết quả kèm nút "Làm quiz của bạn"; giá trị khác bị bỏ qua
  - Thẻ PNG 1080×1920 và 1080×1080 (html-to-image + qrcode), đã kiểm tra dấu tiếng Việt trong ảnh
  - Mục "Nhóm" và mục menu tương ứng tự ẩn khi `team.json` rỗng
- [x] **M5** — Deploy và bản nộp bài (**thay đổi so với mục 10**: không dùng GitHub Pages công khai, không gắn thống kê)
  - Bản online: cấu hình Vercel không liệt kê công khai (`vercel.json`, meta robots, `robots.txt`)
  - Bản offline một file (`build:offline`, `package:offline`): đã kiểm tra bằng Chromium headless qua file:// khi chặn mạng — không có request, không lỗi console, bảo tàng, quiz, `?kq=B`, tải thẻ PNG có dấu đúng; index.html ≈ 0,71 MB
  - Đã kiểm tra giao diện 360px và 1440px cho cả hai bản

## Ghi chú dữ liệu
- `verified: true` chỉ đặt cho hiện vật có cột "Nguồn sự kiện" chỉ ghi GT (HV-03, HV-07, HV-12, HV-13). Các hiện vật còn lại có mục "cần xác minh" nên để `false`.
- `eventSource` chép nguyên cột "Nguồn sự kiện" để nhóm biết cần xác minh gì.
- `quote.lead` là phần dẫn nằm ngoài ngoặc kép (vd. HV-05, kiểu A). `quote.paraphrase: true` là tóm ý, không phải trích nguyên văn (HV-13).
- Nhãn `[Chờ xác minh]` hiện trên phiếu và cửa sổ chi tiết khi `verified: false`. Trường `TODO` hiện thành ô viền đứt "TODO".
- Chữ giao diện (tiêu đề, nút, thông báo) nằm trong `site.json`; câu hỏi, kiểu công dân, `closing` trong `quiz.json`.
- `site.json` → `siteUrl` đang là `TODO` (điền link Vercel sau khi deploy). Link chia sẻ và mã QR = `siteUrl + ?kq=X`.
  Khi còn `TODO`: bản online dùng địa chỉ đang mở; bản offline khóa nút "Sao chép link" và thẻ PNG không có mã QR.
- `mindmap.json` chép nguyên mục 2 tài liệu thiết kế; lưu ý thiếu tr. 92–93 nằm ở `todo` của trụ cột 3.
- `team.json` đang để `{"members": []}` (tạm hoãn) nên mục Nhóm bị ẩn.
- Tỉ lệ phần trăm tính bằng phương pháp phần dư lớn nhất (phần dư bằng nhau thì theo `tieBreak`), nên tổng luôn bằng 100%; có test duyệt đủ 165 tổ hợp 8 câu.
- Font tự host trong `src/assets/fonts` (không dùng Google Fonts) để html-to-image nhúng được font vào thẻ PNG. Noto Serif: 400, 400 nghiêng, 600, 700, 700 nghiêng, 800. Be Vietnam Pro: 400, 400 nghiêng, 500, 600, 700. Thêm weight mới thì cập nhật `fonts.css`.
- Ảnh hiện vật: đặt trong `public/images/…`, `image.src` ghi đường dẫn tương đối (vd. `images/artifacts/HV-07.jpg`). Bản offline tự nhúng base64 mọi ảnh trong `public/images`.
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
- [ ] `public/og-image.png` (1200×630) và thẻ `og:image` trong `index.html`
- [ ] Deploy Vercel theo `San-pham-sang-tao/web/README.md` (kết nối repo riêng tư, kiểm tra Production Branch và Deployment Protection)
- [ ] Điền `siteUrl` trong `site.json` bằng link Vercel và thêm `og:url` trong `index.html`
- [ ] Build lại bản offline (`npm run package:offline`) sau khi có `siteUrl` và ảnh, rồi mới nộp file zip
- [ ] Thử bản offline trên Firefox và Edge thật (mới kiểm tra bằng Chromium headless)
- [ ] _(tạm hoãn)_ `team.json`: tên và vai trò thành viên
- [ ] _(tạm hoãn)_ Hạn nộp

## Mốc thời gian
- Hạn nộp: _(cập nhật)_

## Quy ước khi Claude làm việc với repo
- Trả lời và viết nội dung bằng **tiếng Việt**.
- **Không tự thêm sự kiện, số liệu, trích dẫn ngoài tài liệu thiết kế** (`San-pham-sang-tao/THIET-KE-WEB-APP.md`). Trường nào thiếu thì ghi `TODO`.
- Nội dung về tư tưởng Hồ Chí Minh phải chính xác, có trích dẫn nguồn kèm số tập và số trang.
- Không tự lấy ảnh trên mạng khi chưa rõ bản quyền; không tự vẽ chân dung Bác.
- Nội dung nằm trong `web/src/data/*.json`, không viết cứng trong component.
- Không gắn dịch vụ thống kê hay tài nguyên bên ngoài; bản offline không được có request mạng nào.
- Commit message ngắn gọn bằng tiếng Việt, mô tả rõ thay đổi.
- Cập nhật file này sau mỗi giai đoạn (tiến độ, cấu trúc thư mục, TODO).
