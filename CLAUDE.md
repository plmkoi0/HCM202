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
- **Hình thức:** Web app tĩnh, một trang cuộn dài, chạy tốt trên điện thoại. Bảo tàng số (dòng thời gian hiện vật) → Quiz kiến thức "Bạn hiểu Nhà nước của dân đến đâu?" → Chia sẻ kết quả
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
    ├── NOI-DUNG-BO-SUNG.md          ← nội dung nhóm duyệt (câu chuyện, ngày nay, nguồn web); chỉ nhập mục "Duyệt: [x]"
    ├── QUIZ-KIEN-THUC.md            ← quiz kiến thức nhóm duyệt (10 câu chính + 2 câu dự phòng, mức xếp loại)
    └── web/                         ← Vite + React + TypeScript + Tailwind CSS v4 + Vitest
        ├── index.html               ← meta robots noindex, Open Graph, Twitter card
        ├── vite.config.ts           ← base './'; mode "offline": vite-plugin-singlefile, nhúng ảnh
        │                              public/images + favicon (module ảo virtual:public-images);
        │                              chèn og:url/og:image từ siteUrl lúc build (bản online)
        ├── .env.offline             ← VITE_OFFLINE=true (chỉ dùng khi build bản offline)
        ├── README.md                ← cách chạy, sửa nội dung, deploy Vercel, bản offline
        ├── scripts/
        │   ├── package-offline.mjs  ← nén dist-offline/HCM202-San-pham-sang-tao.zip (không cần công cụ zip)
        │   └── HUONG-DAN-CHAY.txt   ← mẫu hướng dẫn chạy kèm file zip
        ├── public/
        │   ├── favicon.svg, robots.txt (Disallow: /), og-image.png (1200×630)
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
            │   ├── Quiz/            ← Quiz, QuestionCard, Result, Review, RelatedChips, ShareActions, ShareCard
            │   └── ui/              ← QuoteBlock, Todo, PillarChip, VerifyBadge, ImageFrame, Reference (APA7)
            ├── lib/                 ← data, site, pillars, pillarStyles, useReveal,
            │                          artifactViewer (context mở modal theo id), format,
            │                          scoring (điểm, mức xếp loại; + scoring.test.ts), share (siteUrl, khổ thẻ, sao chép),
            │                          offline (cờ OFFLINE), quizStart (nút ngoài vào thẳng câu 1),
            │                          data.test.ts (ẩn hiện vật, tối thiểu 8 hiện vật hiển thị),
            │                          sources (sắp xếp nguồn theo tác giả, tra theo id)
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
- [x] **M3** — Quiz 8 câu, `scoring.ts` có unit test, trang kết quả, xem lại giải thích _(quiz tính cách, đã thay bằng quiz kiến thức ngày 2/10/2026 — xem dưới)_
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
- [x] **Rà soát sau M5**
  - Ghi chú ngữ cảnh (`quoteNote`) cho HV-02, 06, 07, 08, 09, 10 và nguồn giáo trình, lấy từ giáo trình (nhóm đã đối chiếu PDF); cột "Ghi chú ngữ cảnh" ở bảng mục 4 tài liệu thiết kế
  - Tỉ lệ phần trăm luôn đủ 100% (phần dư lớn nhất)
  - Bộ lọc dính trên điện thoại: một hàng cuộn ngang, khối dính cao 77px ở 360px
  - Trường `hidden` để ẩn hiện vật chưa sẵn sàng (mặc định không ẩn); đã thử với HV-04 rồi trả lại
  - *Toàn tập* gộp một mục APA7 (`hcm-tt`, Tập 1–15)
  - "Làm quiz ngay" (hero) và "Bắt đầu quiz" (cầu nối) vào thẳng câu 1; đang làm dở thì chỉ cuộn tới
  - Chữ giao diện còn viết cứng đã chuyển vào `site.json`
- [x] **Nhập nội dung đã duyệt** (`NOI-DUNG-BO-SUNG.md`, mọi mục đều "Duyệt: [x]")
  - Lời dẫn; Câu chuyện, Ngày nay, câu hỏi gợi mở, nguồn sự kiện cho 13 hiện vật (HV-07 giữ câu chuyện cũ); mọi hiện vật `verified: true`
  - HV-04 dùng lại trích dẫn HV-03 kèm ghi chú; ghi chú ngữ cảnh mới cho HV-02
  - 19 nguồn web APA7 trong `sources.json`; trang Nguồn xếp theo tác giả (`localeCompare('vi')`), URL mở tab mới
  - `og-image.png` + og:image/twitter:image chèn lúc build khi `siteUrl` đã điền
- [x] **Quiz kiến thức** "Bạn hiểu Nhà nước của dân đến đâu?" (2/10/2026, nội dung `QUIZ-KIEN-THUC.md`, thay quiz tính cách)
  - 10 câu chính (không đưa Câu 11, 12 dự phòng), "Câu x/10", đáp án trộn mỗi lượt; chọn xong khóa câu, hiện Đúng/Chưa đúng (aria-live), ✓/✗ + nhãn chữ, giải thích, chip hiện vật; không có "Câu trước"
  - Kết quả: điểm x/10, mức + lời nhắn, closing, danh sách câu chưa đúng, "Xem lại tất cả", "Làm lại"
  - Thẻ PNG: tiêu đề quiz, điểm, mức, closing, tên web, QR; `?kq=<id mức>` hiện thẻ mức (không điểm)
  - `og-image.png` thay bằng ảnh mới của nhóm (tiêu đề quiz kiến thức); og/twitter description đổi tên quiz
  - Kiểm thử Playwright qua file:// khi chặn mạng ở 360px và 1440px: làm hết quiz bằng chuột (10/10 → "Chủ nhân am hiểu") và bằng bàn phím (0/10 → "Hãy ghé thêm bảo tàng"), chip mở đúng hiện vật, `?kq=`, tải thẻ PNG, axe không lỗi, không lỗi console, không request ra ngoài, không cuộn ngang

## Ghi chú dữ liệu
- `verified: true` cho cả 13 hiện vật sau khi nhóm duyệt `NOI-DUNG-BO-SUNG.md` (nên hiện không còn nhãn `[Chờ xác minh]`).
- `eventSource` chép nguyên dòng "Nguồn sự kiện" (bảng mục 4 / `NOI-DUNG-BO-SUNG.md`).
- `quote.lead` là phần dẫn nằm ngoài ngoặc kép (vd. HV-05, kiểu A). `quote.paraphrase: true` là tóm ý, không phải trích nguyên văn (HV-13).
- `hidden: true` (tùy chọn, mặc định không ẩn hiện vật nào) ẩn hiện vật khỏi dòng thời gian, số đếm bộ lọc, tổng tiến độ, nút Trước/Sau và chip "Hiện vật liên quan". Lọc một lần ở `lib/data.ts` (`artifacts` chỉ gồm hiện vật đang hiển thị, `isVisibleArtifact`). Tiến độ "đã xem" chỉ giữ id đang hiển thị (id cũ trong localStorage bị bỏ). Test `data.test.ts` yêu cầu tối thiểu 8 hiện vật hiển thị (mục 4).
- Nhãn `[Chờ xác minh]` hiện trên phiếu và cửa sổ chi tiết khi `verified: false`. Trường `TODO` hiện thành ô viền đứt "TODO".
- Chữ giao diện nằm hết trong `site.json` (menu `nav`, `skipLink`, `museum` gồm tiêu đề, bộ lọc, tiến độ `{x}/{n}`, phiếu, cửa sổ chi tiết, ghi chú ô TODO; `pillars` nhãn trụ cột; `quiz`, `share`, `mindmap`, `sources`, `offline`); câu hỏi, mức xếp loại, `closing` trong `quiz.json`. Component chỉ còn ký hiệu (—, “ ”, ✓, ·, +/−).
- `site.json` → `siteUrl` đang là `TODO` (điền link Vercel sau khi deploy). Link chia sẻ và mã QR = `siteUrl + ?kq=<id mức>`.
  Khi còn `TODO`: bản online dùng địa chỉ đang mở; bản offline khóa nút "Sao chép link" và thẻ PNG không có mã QR; không chèn og:url/og:image.
- `sources.json`: nguồn web có `apa` (chuỗi APA7, `*…*` là chữ nghiêng) + `url`; `author` dùng để sắp xếp. Nguồn TODO (`todo: true`) xếp cuối. *Toàn tập* là một mục APA7 chung cho bộ nhiều tập (`hcm-tt`, Tập 1–15); trích dẫn trong bài vẫn ghi tập và trang (vd. t.4, tr.64–65).
- `mindmap.json` chép nguyên mục 2 tài liệu thiết kế; lưu ý thiếu tr. 92–93 nằm ở `todo` của trụ cột 3.
- `team.json` đang để `{"members": []}` (tạm hoãn) nên mục Nhóm bị ẩn.
- `quiz.json` (quiz kiến thức): `questions[]` { id, pillar, title, prompt, options[4], correctIndex, explain, relatedArtifacts[] }, `levels[]` { id, min, max, name, message }, `closing`. Chép nguyên văn 10 câu chính từ `QUIZ-KIEN-THUC.md`.
  - `correctIndex` theo thứ tự gốc (trong file mọi đáp án đúng đều là A, nên việc trộn thứ tự mỗi lượt là bắt buộc). Lựa chọn hiển thị không đánh chữ A–D.
  - Mức: `am-hieu` 9–10, `dang-hoc` 6–8, `ghe-bao-tang` 0–5; `levelFor` đọc ngưỡng từ `levels`, không viết cứng. Test: các mốc 0/5/6/8/9/10, levels phủ kín 0–10 không chồng lấn, 4 lựa chọn + `correctIndex` hợp lệ, `relatedArtifacts` tồn tại.
  - Đã bỏ 4 kiểu công dân, `tieBreak`, tỉ lệ phần trăm 4 kiểu cùng code của quiz cũ.
- Font tự host trong `src/assets/fonts` (không dùng Google Fonts) để html-to-image nhúng được font vào thẻ PNG. Noto Serif: 400, 400 nghiêng, 600, 700, 700 nghiêng, 800. Be Vietnam Pro: 400, 400 nghiêng, 500, 600, 700. Thêm weight mới thì cập nhật `fonts.css`.
- Ảnh hiện vật: đặt trong `public/images/…`, `image.src` ghi đường dẫn tương đối (vd. `images/artifacts/HV-07.jpg`). Bản offline tự nhúng base64 mọi ảnh trong `public/images`.
- Màu chữ vàng đồng dùng `#7A5A17` (nền sáng) để đạt WCAG AA; `#B8892B` giữ cho nền nhãn, đường kẻ.

## TODO còn lại (nội dung — nhóm cung cấp)
- [ ] Nguồn APA7 của giáo trình (`sources.json` → `giao-trinh`; file PDF không có trang bìa) và bổ sung giáo trình **tr. 92–93**
- [ ] Ảnh tư liệu + `alt` + nguồn ảnh (và giấy phép nếu lấy trên mạng) cho cả 13 hiện vật
- [ ] HV-13 (tóm ý, GT tr.82) chưa có số tập/số trang *Toàn tập*. HV-12 đang dẫn gián tiếp "dẫn theo GT tr. 83"
- [ ] Đối chiếu mọi trích dẫn với bản gốc *Toàn tập* — đặc biệt HV-05: GT tr. 85 ghi "gánh **vác** việc chung cho dân", bài Chu Đức Tính (2020) ghi "gánh việc chung cho dân"; web đang theo giáo trình
- [ ] HV-07 "Ngày nay": số liệu bầu cử 2026 là số sơ bộ (21/3/2026); thay số và nguồn nếu có báo cáo chính thức
- [ ] Câu 2 quiz: phần giải thích có cụm "Phương án B là nội dung của "dân làm chủ"", nhưng lựa chọn được trộn và không đánh chữ nên "B" không chỉ đúng phương án. Nhóm nên sửa câu chữ trong `QUIZ-KIEN-THUC.md` (vd. nêu thẳng nội dung phương án) rồi nhập lại
- [ ] Deploy Vercel theo `San-pham-sang-tao/web/README.md` (kết nối repo riêng tư, kiểm tra Production Branch và Deployment Protection)
- [ ] Điền `siteUrl` trong `site.json` bằng link Vercel (og:url, og:image tự chèn khi build)
- [ ] Nếu hiện vật nào chưa kịp hoàn thiện khi nộp: đặt `"hidden": true` (vẫn phải còn ≥ 8 hiện vật; mục 4 ưu tiên HV-02, 03, 05, 07, 08, 09, 11, 13)
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
