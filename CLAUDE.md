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
- **Hình thức:** Web app chạy offline bằng một file `index.html`, mở trên trình duyệt, không cần mạng; dùng để demo trên lớp. Một trang cuộn dài: Bảo tàng số (dòng thời gian hiện vật) → Quiz kiến thức "Bạn hiểu Nhà nước của dân đến đâu?" → Chia sẻ kết quả
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
    ├── NOI-DUNG-BO-SUNG.md          ← nội dung nhóm duyệt (câu chuyện, ngày nay, nguồn web); chỉ nhập mục "Duyệt: [x]"
    ├── QUIZ-KIEN-THUC.md            ← quiz kiến thức nhóm duyệt (10 câu chính + 2 câu dự phòng, mức xếp loại)
    └── web/                         ← Vite + React + TypeScript + Tailwind CSS v4 + Vitest
        ├── index.html               ← khung trang: tiêu đề, meta description, theme-color
        ├── vite.config.ts           ← base './'; vite-plugin-singlefile; plugin embedAssets nhúng ảnh
        │                              public/images (module ảo virtual:public-images) + favicon; publicDir: false
        ├── README.md                ← chạy dev, sửa nội dung, build, đóng gói, mở file, mẹo trình chiếu
        ├── scripts/
        │   ├── package.mjs          ← nén dist/HCM202-San-pham-sang-tao.zip (không cần công cụ zip)
        │   └── HUONG-DAN-CHAY.txt   ← hướng dẫn chạy kèm file zip
        ├── public/                  ← chỉ là nguồn để nhúng, không chép ra dist
        │   ├── favicon.svg
        │   └── images/artifacts/    ← ảnh tư liệu (chưa có ảnh)
        └── src/
            ├── data/                ← artifacts, quiz, sources, team, mindmap (mục 2), site.json (chữ giao diện)
            ├── assets/
            │   ├── fonts.css        ← @font-face Noto Serif + Be Vietnam Pro (tự host, nhúng khi build)
            │   └── fonts/           ← woff2 subset latin + vietnamese, chỉ weight đang dùng + giấy phép OFL
            ├── components/
            │   ├── Nav, Hero, Intro, Bridge, MindMap, Sources, Team (.tsx)
            │   ├── Museum/          ← Museum, PillarFilter, ProgressBar, Timeline, ArtifactCard,
            │   │                      ArtifactModal, ArtifactViewerProvider (modal dùng chung)
            │   ├── Quiz/            ← Quiz, QuestionCard, Result, Review, RelatedChips,
            │   │                      ShareActions (tải thẻ PNG), ShareCard
            │   └── ui/              ← QuoteBlock, Todo, PillarChip, VerifyBadge, ImageFrame, Reference (APA7)
            ├── lib/                 ← data, site, pillars, pillarStyles, useReveal,
            │                          artifactViewer (context mở modal theo id), format,
            │                          scoring (điểm, mức xếp loại; + scoring.test.ts), card (khổ thẻ PNG),
            │                          quizStart (nút ngoài vào thẳng câu 1),
            │                          data.test.ts (ẩn hiện vật, tối thiểu 8 hiện vật hiển thị),
            │                          sources (sắp xếp nguồn theo tác giả, tra theo id)
            ├── vite-env.d.ts        ← kiểu cho virtual:public-images
            ├── types.ts             ← kiểu dữ liệu cho các file JSON
            ├── index.css            ← màu, phiếu răng cưa, con dấu, hiệu ứng (mục 7)
            ├── App.tsx
            └── main.tsx
```
## Cách build
Chạy trong `San-pham-sang-tao/web/` (lần đầu: `npm install`).

| Lệnh | Kết quả | Ghi chú |
|---|---|---|
| `npm run dev` | http://localhost:5173 | Phát triển, tự tải lại khi sửa |
| `npm run build` | `dist/index.html` (≈ 0,70 MB) | Một file duy nhất đã nhúng JS, CSS, font, ảnh, favicon; bấm đúp để mở (file://), không cần mạng |
| `npm run package` | `dist/HCM202-San-pham-sang-tao.zip` (≈ 0,38 MB) | Build rồi nén `index.html` + `HUONG-DAN-CHAY.txt`; đây là file nộp bài |

Kiểm tra trước khi commit: `npm run test && npm run build && npm run package && npm run lint`. Thư mục `dist/` không commit.

## Tiến độ (theo mục 10 tài liệu thiết kế)
- [x] **M1** — Vite + React + TypeScript + Tailwind CSS v4 + Vitest; dữ liệu JSON trong `src/data/`; màu và font theo mục 7 (Noto Serif, Be Vietnam Pro tự host)
- [x] **M2** — Bảo tàng số
  - Hero (con dấu đỏ), lời dẫn, cầu nối; menu neo Bảo tàng · Quiz · Nguồn (· Nhóm khi `team.json` có thành viên)
  - Bộ lọc 3 trụ cột (trên điện thoại: một hàng cuộn ngang, khối dính cao 77px ở 360px), thanh tiến độ "Bạn đã xem x/13 hiện vật" (localStorage, có try/catch)
  - Dòng thời gian 13 phiếu hiện vật; cửa sổ chi tiết `<dialog>` gồm Câu chuyện · Bác nói gì · Ngày nay, nút Trước/Sau, Esc để đóng
  - Nội dung hiện vật, lời dẫn và 19 nguồn web lấy từ `NOI-DUNG-BO-SUNG.md` (mọi mục đã duyệt); ghi chú ngữ cảnh (`quoteNote`) theo giáo trình
  - Trường tùy chọn `hidden` để ẩn hiện vật chưa sẵn sàng (hiện không ẩn hiện vật nào)
- [x] **M3** — Quiz kiến thức "Bạn hiểu Nhà nước của dân đến đâu?" (nội dung `QUIZ-KIEN-THUC.md`)
  - 10 câu chính (Câu 11, 12 dự phòng không đưa vào web); "Câu x/10", nhãn trụ cột; đáp án trộn mỗi lượt, giữ cố định trong lượt
  - Chọn xong khóa câu: "Đúng"/"Chưa đúng" trong vùng aria-live, ✓/✗ kèm nhãn chữ, giải thích, chip hiện vật liên quan (mở cửa sổ hiện vật, tính vào tiến độ "đã xem"); không có nút quay lại câu trước
  - "Làm quiz ngay" (hero) và "Bắt đầu quiz" (cầu nối) vào thẳng câu 1
  - Kết quả: điểm x/10, mức + lời nhắn, "Chủ nhân không đứng ngoài", danh sách câu chưa đúng, "Xem lại tất cả", "Làm lại"
  - `scoring.ts` (điểm, mức theo `levels`) có unit test
- [x] **M4** — Thẻ kết quả PNG 1080×1920 / 1080×1080 (html-to-image), sơ đồ tư duy 3 trụ cột (mở/đóng), trang Nguồn tham khảo APA7 (xếp theo tác giả, URL mở tab mới), mục Nhóm (ẩn khi `team.json` rỗng)
- [x] **M5** — Đóng gói một file, kiểm tra trên máy
  - `npm run build` → `dist/index.html`, `npm run package` → file zip kèm `HUONG-DAN-CHAY.txt`
  - Kiểm thử Playwright mở `file://…/dist/index.html` khi chặn mạng ở 360×780, 1280×720, 1920×1080: bảo tàng, bộ lọc, cửa sổ hiện vật, ảnh (khung giữ chỗ; ảnh thêm vào `public/images` được nhúng và hiển thị đúng), quiz đủ 10 câu bằng chuột và bàn phím, tải thẻ PNG có dấu tiếng Việt đúng, axe không lỗi, không lỗi console, không request ra ngoài, không cuộn ngang
  - Còn lại: thử trên máy tính và máy chiếu thật ở lớp (xem TODO)

## Ghi chú dữ liệu
- `verified: true` cho cả 13 hiện vật (nhóm đã duyệt `NOI-DUNG-BO-SUNG.md`), nên hiện không có nhãn `[Chờ xác minh]`.
- `eventSource` chép nguyên dòng "Nguồn sự kiện" (bảng mục 4 / `NOI-DUNG-BO-SUNG.md`).
- `quote.lead` là phần dẫn nằm ngoài ngoặc kép (vd. HV-05, kiểu A). `quote.paraphrase: true` là tóm ý, không phải trích nguyên văn (HV-13).
- `hidden: true` (tùy chọn, mặc định không ẩn hiện vật nào) ẩn hiện vật khỏi dòng thời gian, số đếm bộ lọc, tổng tiến độ, nút Trước/Sau và chip "Hiện vật liên quan". Lọc một lần ở `lib/data.ts` (`artifacts` chỉ gồm hiện vật đang hiển thị, `isVisibleArtifact`). Tiến độ "đã xem" chỉ giữ id đang hiển thị (id cũ trong localStorage bị bỏ). Test `data.test.ts` yêu cầu tối thiểu 8 hiện vật hiển thị (mục 4).
- Nhãn `[Chờ xác minh]` hiện trên phiếu và cửa sổ chi tiết khi `verified: false`. Trường `TODO` hiện thành ô viền đứt "TODO".
- Chữ giao diện nằm hết trong `site.json` (menu `nav`, `skipLink`, `museum` gồm tiêu đề, bộ lọc, tiến độ `{x}/{n}`, phiếu, cửa sổ chi tiết, ghi chú ô TODO; `pillars` nhãn trụ cột; `quiz`, `share` (tải thẻ), `mindmap`, `sources`); câu hỏi, mức xếp loại, `closing` trong `quiz.json`. Component chỉ còn ký hiệu (—, “ ”, ✓, ·, +/−).
- Thẻ kết quả PNG (`ShareCard`): tiêu đề quiz, điểm x/10, tên mức, closing, tên web; tên file `cua-dan-do-dan-vi-dan-<id mức>-<rộng>x<cao>.png`.
- `sources.json`: nguồn web có `apa` (chuỗi APA7, `*…*` là chữ nghiêng) + `url`; `author` dùng để sắp xếp. Nguồn TODO (`todo: true`) xếp cuối. *Toàn tập* là một mục APA7 chung cho bộ nhiều tập (`hcm-tt`, Tập 1–15); trích dẫn trong bài vẫn ghi tập và trang (vd. t.4, tr.64–65).
- `mindmap.json` chép nguyên mục 2 tài liệu thiết kế; lưu ý thiếu tr. 92–93 nằm ở `todo` của trụ cột 3.
- `team.json` đang để `{"members": []}` (tạm hoãn) nên mục Nhóm bị ẩn.
- `quiz.json` (quiz kiến thức): `questions[]` { id, pillar, title, prompt, options[4], correctIndex, explain, relatedArtifacts[] }, `levels[]` { id, min, max, name, message }, `closing`. Chép nguyên văn 10 câu chính từ `QUIZ-KIEN-THUC.md`.
  - `correctIndex` theo thứ tự gốc (trong file mọi đáp án đúng đều là A, nên việc trộn thứ tự mỗi lượt là bắt buộc). Lựa chọn hiển thị không đánh chữ A–D.
  - Mức: `am-hieu` 9–10, `dang-hoc` 6–8, `ghe-bao-tang` 0–5; `levelFor` đọc ngưỡng từ `levels`, không viết cứng. Test: các mốc 0/5/6/8/9/10, levels phủ kín 0–10 không chồng lấn, 4 lựa chọn + `correctIndex` hợp lệ, `relatedArtifacts` tồn tại.
- Font tự host trong `src/assets/fonts` (không dùng Google Fonts) để html-to-image nhúng được font vào thẻ PNG. Noto Serif: 400, 400 nghiêng, 600, 700, 700 nghiêng, 800. Be Vietnam Pro: 400, 400 nghiêng, 500, 600, 700. Thêm weight mới thì cập nhật `fonts.css`.
- Ảnh hiện vật: đặt trong `public/images/…`, `image.src` ghi đường dẫn tương đối (vd. `images/artifacts/HV-07.jpg`). Khi build, mọi ảnh trong `public/images` được nhúng base64 vào `dist/index.html`. Chỉ file ảnh (jpg, jpeg, png, webp, gif, avif, svg) được nhúng; file khác như `.gitkeep` bị bỏ qua. **Thêm ảnh mới vào `public/images` khi đang chạy `npm run dev` thì phải khởi động lại `npm run dev`** để ảnh được nạp.
- Màu chữ vàng đồng dùng `#7A5A17` (nền sáng) để đạt WCAG AA; `#B8892B` giữ cho nền nhãn, đường kẻ.

## TODO còn lại (nội dung — nhóm cung cấp)
- [ ] Nguồn APA7 của giáo trình (`sources.json` → `giao-trinh`; file PDF không có trang bìa) và bổ sung giáo trình **tr. 92–93**
- [ ] Ảnh tư liệu + `alt` + nguồn ảnh (và giấy phép nếu lấy trên mạng) cho cả 13 hiện vật
- [ ] HV-13 (tóm ý, GT tr.82) chưa có số tập/số trang *Toàn tập*. HV-12 đang dẫn gián tiếp "dẫn theo GT tr. 83"
- [ ] Đối chiếu mọi trích dẫn với bản gốc *Toàn tập* — đặc biệt HV-05: GT tr. 85 ghi "gánh **vác** việc chung cho dân", bài Chu Đức Tính (2020) ghi "gánh việc chung cho dân"; web đang theo giáo trình
- [ ] HV-07 "Ngày nay": số liệu bầu cử 2026 là số sơ bộ (21/3/2026); thay số và nguồn nếu có báo cáo chính thức
- [ ] Câu 2 quiz: phần giải thích có cụm "Phương án B là nội dung của "dân làm chủ"", nhưng lựa chọn được trộn và không đánh chữ nên "B" không chỉ đúng phương án. Nhóm nên sửa câu chữ trong `QUIZ-KIEN-THUC.md` (vd. nêu thẳng nội dung phương án) rồi nhập lại
- [ ] Nếu hiện vật nào chưa kịp hoàn thiện khi nộp: đặt `"hidden": true` (vẫn phải còn ≥ 8 hiện vật; mục 4 ưu tiên HV-02, 03, 05, 07, 08, 09, 11, 13)
- [ ] Build lại (`npm run package`) sau khi có ảnh và sửa nội dung, rồi mới chép file zip để demo
- [ ] Thử `index.html` trên máy tính và máy chiếu thật ở lớp (Chrome/Edge, F11 toàn màn hình) và trên Firefox; hiện mới kiểm tra bằng Chromium headless
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
- Web chạy hoàn toàn trên trình duyệt từ một file `index.html`: mọi tài nguyên (font, ảnh, favicon) nhúng sẵn, **không có request mạng nào**.
- Commit message ngắn gọn bằng tiếng Việt, mô tả rõ thay đổi.
- Cập nhật file này sau mỗi giai đoạn (tiến độ, cấu trúc thư mục, TODO).
