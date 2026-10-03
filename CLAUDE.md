# CLAUDE.md — Con đường tư tưởng HCM (nhánh `game`)

File này lưu bối cảnh, quy ước và tiến độ của **nhánh `game`** để Claude (Claude Code / Claude chat) hiểu nhanh khi làm việc. Nguồn chuẩn duy nhất cho game là **`docs/THIET-KE-GAME.md`**.

## Tổng quan
- **Repo:** `plmkoi0/HCM202` · **Nhánh:** `game` — nhánh mồ côi, không chung lịch sử, không chung mã với nhánh web (bảo tàng số). App nằm ở gốc nhánh.
- **Môn:** HCM202 · **Sản phẩm sáng tạo thứ hai** của nhóm, độc lập với bảo tàng số.
- **Chủ đề 4:** Tư tưởng Hồ Chí Minh về Nhà nước của nhân dân, do nhân dân, vì nhân dân.
- **Tên tạm:** **Con đường tư tưởng HCM** (đặt trong `site.json`, đổi được — tên chính thức để sau, không chặn các mốc).
- **Thể loại:** board game đua kiểu cờ cá ngựa, theo lượt, tung xúc xắc; bàn 6 nhánh.
- **Người chơi:** chơi đơn, mỗi người một máy; phòng 1–5 người (vào bằng mã 5 ký tự, QR, link `/p/ABCDE`); có máy chơi cùng (bot).
- **Chế độ:** Chơi qua phòng (online, server trên Vercel Functions + Redis Marketplace) · Chơi trên một máy (1–5 người thay phiên, không cần mạng; cũng là bản offline một file).
- **Thông điệp:** **"Chủ nhân không đứng ngoài"**.
- **Đối tượng:** sinh viên đại học; dùng làm mini game cuối buổi thuyết trình (chủ phòng chọn mốc 5 hoặc 7 phút).
- **Nguồn nội dung:** Giáo trình HCM202, Chương IV, mục II (tr. 83–95) và *Hồ Chí Minh Toàn tập* (Nxb Chính trị quốc gia, 2011). **Bộ câu hỏi do nhóm biên soạn** (`docs/CAU-HOI-GAME.md`, theo mẫu `docs/CAU-HOI-GAME.mau.md`), bắt đầu bằng 12 câu kiến thức nhóm đã duyệt (chép từ `QUIZ-KIEN-THUC.md` của web, mục 13.1); câu hỏi thử chỉ lấp tổ hợp trụ cột × độ khó còn dưới 2 câu (mục 13.3).
- **Dữ liệu khởi đầu** (hiện vật, sơ đồ tư duy, màu trụ cột, font) chép một lần từ nhánh web — nguồn gốc ghi ở `src/data/NGUON.md`; từ đó thuộc về game, không đồng bộ lại.

### Luật cốt lõi (đã chốt — không đổi, mục 2 và 20)
1. Chơi theo lượt, mỗi lượt tung xúc xắc.
2. Ai về đích trước thắng.
3. Trên đường có ô power-up và ô bẫy; các ô còn lại là ô câu hỏi.
4. Xúc xắc chỉ tới ô câu hỏi → đúng thì nhảy lên, sai thì đứng yên.

Cũng đã chốt: **không có đá ngựa** · **bàn 6 nhánh**, phòng tối đa 5 người · **giới hạn mặc định 10 phút** · **Đoán cùng tắt mặc định** · **thẻ bẫy chỉ "mất lượt" hoặc "lùi ngẫu nhiên 1–3 ô"**.

### Đã chốt ở G0 (bản 1.5, mục 20 — bảng "Quyết định G0 đã ghi vào tài liệu")
- **D1** Trụ cột của nhánh *i* = trụ cột thứ ((*i* − 1) mod số trụ cột) + 1 theo thứ tự `mindmap.json` → nhánh 1–6: dân chủ, pháp quyền, trong sạch, dân chủ, pháp quyền, trong sạch.
- **D2** Mỗi nhánh [cổng, ô 2, ô 3]; power-up ở ô 3 nhánh 1 và 5; bẫy ở ô 3 nhánh 3 và 6 → ô câu hỏi vòng chung (độ khó 1): dân chủ 3, pháp quyền 3, trong sạch 2. Cổng của màu trống = ô câu hỏi độ khó 1 của trụ cột nhánh đó.
- **D3** Đường về đích 4 ô độ khó 2, 2, 3, 3; trụ cột xoay vòng bắt đầu từ trụ cột của nhánh có cổng; Đích độ khó 3, trụ cột theo seed.
- **D4** Bố cục Dài: vòng 24 ô = 6 cổng + 3 power-up + 3 bẫy + 12 câu hỏi; đường về đích 5 ô độ khó 2, 2, 3, 3, 3.
- **D5** Quãng đường 22 bước: cổng (0) → 17 ô vòng chung → rẽ ở ô ngay trước cổng → 4 ô về đích → Đích (22). Bố cục Dài 29.
- **D6** Ngựa 6 màu tươi khác hẳn đỏ son / xanh mực / vàng đồng, mỗi màu một ký hiệu; cổng và đường về đích mang màu ngựa; ô câu hỏi hiện trụ cột bằng viền màu + biểu tượng + chữ viết tắt.
- **L1** Hiệu ứng đẩy không bao giờ đưa ngựa vào Đích (Tiến 3 ô dừng tối đa ở ô cuối đường về đích). Bẫy lùi theo đường của người đó, có thể từ đường về đích ra vòng chung, không quá cổng.
- **L2** 50:50 loại tới khi còn 2 đáp án (4 → 2, 3 → 2); câu 2 đáp án: nút mờ, không mất power-up.
- **L3** Luật ra 6 xét mặt xúc xắc trước khi nhân đôi (Xúc xắc ×2).
- **L4** Thử thách cá nhân: giới hạn mặc định 10 phút; kỷ lục (ít lượt nhất) chỉ lưu khi về đích; hết giờ báo số ô còn lại.
- **L5** Chấp nhận đáp án nằm trong mã trang (bản online đóng gói `questions.json`); state vẫn không chứa đáp án trước khi chốt; ẩn nút Kho câu hỏi khi đang ở trong phòng.
- **T1** Giới hạn 5 / 7 / 10 / 15 phút / không giới hạn, mặc định 10; trên lớp chọn 5 hoặc 7; hết giờ xếp theo khoảng cách, người dẫn đầu được tôn vinh như người thắng; mô phỏng ở 20 s và 25 s/lượt.
- **N1** Thẻ hiện vật trong game: mã, ngày, tên, trụ cột, câu chuyện, trích dẫn + `quote.cite`, ghi chú ngữ cảnh; không ảnh, không "Ngày nay", không nguồn APA; hiện vật `hidden` không hiện chip.
- **N2** Mục tiêu mỗi trụ cột ≥ 10 / 6 / 4 câu độ khó 1 / 2 / 3; trụ cột trong sạch được ít hơn 20 câu. Tổ hợp không có câu: lấy cùng trụ cột ở độ khó gần nhất, rồi trụ cột khác cùng độ khó (mục 8).
- **N3** `fillQuote`: đúng một chỗ trống `___`.
- **N4** Nhãn thẻ bẫy trung tính: "Bẫy — mất lượt" · "Bẫy — lùi {n} ô".
- **12 câu khởi đầu** Q-01 → Q-12 giữ nguyên văn `docs/nguon/QUIZ-KIEN-THUC.md`, trừ giải thích Q-02, Q-11 theo bản nhóm sửa (mục 13.1). Độ khó đã duyệt: 1 = Q-05, 06, 07, 09, 11 · 2 = Q-01, 04, 10, 12 · 3 = Q-02, 03, 08. **Giải thích không nhắc chữ cái phương án** — script nhập và test báo lỗi (mục 13.4, 17). Vẫn trộn đáp án khi hiện (mục 8).
- **Deployment Protection** Chỉ tên miền chính mở công khai; khi chơi thật luôn mở game, tạo QR và link mời từ tên miền chính; thử trên điện thoại dùng Shareable Links (mục 15.6).

## Quy ước (mục 15.8 tài liệu thiết kế)
- Trả lời và viết nội dung bằng **tiếng Việt**; commit message ngắn gọn bằng tiếng Việt.
- `docs/THIET-KE-GAME.md` là nguồn chuẩn duy nhất cho game; thay đổi đã được nhóm duyệt thì **cập nhật tài liệu trước rồi mới code**. Chỗ thiết kế thiếu, mâu thuẫn hoặc không khả thi: nêu ra kèm phương án đề xuất và hỏi nhóm, không tự quyết lặng lẽ.
- **Không tự thêm** sự kiện, số liệu, trích dẫn ngoài các nguồn ở mục 13; trường nào thiếu thì ghi `TODO`.
- **Không tự viết câu hỏi nội dung** về tư tưởng Hồ Chí Minh — bộ câu hỏi do nhóm cung cấp; trước đó chỉ dùng câu hỏi thử (mục 13.3: hỏi về luật chơi hoặc giữ chỗ, id `TEST-`, `"test": true`, `source.ref` = `"Câu hỏi thử"`, `verified: false`, nhãn `[Câu hỏi thử]`).
- Nhãn thẻ bẫy trung tính (N4); power-up và thẻ bẫy mô tả hiệu ứng bằng lời trung tính.
- Khi nhóm gửi bản mới `docs/CAU-HOI-GAME.md`: chạy script nhập, đối chiếu nguồn mục 13.2, báo câu thiếu nguồn / sai định dạng / nghi sai nội dung — **không tự sửa nội dung**; bỏ câu hỏi thử ở tổ hợp đã đủ; chạy lại test và mô phỏng.
- Nội dung về tư tưởng Hồ Chí Minh phải chính xác, có nguồn kèm số trang.
- Không tự lấy ảnh trên mạng khi chưa rõ bản quyền; không tự vẽ chân dung Bác.
- Nội dung nằm trong `src/data/*.json`, không viết cứng trong component.
- **Không gắn thống kê.** Tài nguyên bên ngoài duy nhất được phép: Vercel Functions + Redis (Vercel Marketplace) cho phòng chơi. Bản offline không có request mạng nào. Không icon font, không CDN, không Google Fonts.
- **Không commit lên nhánh web**; không import mã hay dữ liệu từ nhánh web; không đồng bộ dữ liệu lại với web.
- Không sao chép mã, giao diện, tên, đồ họa, âm thanh của game tham khảo (Phụ lục A).
- Cập nhật `CLAUDE.md` này và mục 18 tài liệu thiết kế sau mỗi mốc.
- Kiểm tra trước khi commit (từ G1): `npm run test && npm run build && npm run build:offline && npm run lint` ở gốc nhánh.

## Cấu trúc thư mục

**Hiện tại (sau G0):**
```
/
├── CLAUDE.md                     ← file này
├── .gitignore
├── docs/
│   ├── THIET-KE-GAME.md          ← tài liệu thiết kế (nguồn chuẩn)
│   ├── CAU-HOI-GAME.mau.md       ← mẫu để nhóm soạn câu hỏi (mục 13.4)
│   └── nguon/THIET-KE-WEB-APP.md ← bản sao nguồn tham chiếu (chép từ nhánh web)
└── src/
    ├── data/
    │   ├── artifacts.json        ← 13 hiện vật (chép từ web)
    │   ├── mindmap.json          ← 3 trụ cột (chép từ web)
    │   ├── pillars.json          ← id, tên, màu trụ cột
    │   └── NGUON.md              ← nguồn gốc dữ liệu khởi đầu
    └── assets/fonts/             ← Be Vietnam Pro 400/400i/600/700, Noto Serif 700/400i (woff2, latin + vietnamese) + OFL
```

**Đích (mục 15.1):**
```
/
├── CLAUDE.md                 ← quy ước và tiến độ riêng của game
├── README.md                 ← chạy, sửa câu hỏi, deploy Vercel, bản offline
├── vercel.json
├── package.json, vite.config.ts, tsconfig…, index.html
├── docs/
│   ├── THIET-KE-GAME.md      ← tài liệu thiết kế
│   ├── CAU-HOI-GAME.mau.md   ← mẫu để nhóm soạn câu hỏi
│   ├── CAU-HOI-GAME.md       ← bộ câu hỏi nhóm cung cấp (sau)
│   └── nguon/THIET-KE-WEB-APP.md   ← bản sao nguồn tham chiếu
├── public/                   ← favicon, robots.txt
├── api/                      ← lớp mỏng Vercel Functions
├── server/                   ← kho phòng, token, pub/sub, xử lý hành động
├── scripts/                  ← nhập câu hỏi, mô phỏng cân bằng, mô phỏng tải, đóng gói offline
└── src/
    ├── data/                 ← mục 14 (board, rules, powerups, traps, questions, bots, tokens, site, artifacts, mindmap, pillars, NGUON.md)
    ├── engine/               ← reducer thuần + bot
    ├── net/                  ← WebSocket + polling, đo lệch đồng hồ
    ├── components/, screens/
    ├── assets/fonts/         ← font tự host + giấy phép OFL
    └── lib/
```

## Tiến độ (mục 18 tài liệu thiết kế)

| Mốc | Nội dung | Trạng thái |
|---|---|---|
| **G0 — Nhánh và rà soát** | Nhánh mồ côi, chép dữ liệu + `NGUON.md`, `CLAUDE.md`, đối chiếu thiết kế với dữ liệu, xác minh Vercel, ước lượng chi phí, mẫu câu hỏi, cập nhật mục 20 | ☑ Xong, nhóm duyệt 03/10/2026 (bản thiết kế 1.5) |
| **G1 — Nền móng** | Dự án Vite, JSON + kiểu, 12 câu khởi đầu + câu hỏi thử lấp chỗ thiếu, script nhập câu hỏi, test dữ liệu, engine + bot + unit test, mô phỏng cân bằng ở 20 s và 25 s/lượt | ☐ Tiếp theo |
| **G2 — Chơi trên một máy** | Bàn cờ SVG, xúc xắc, ngựa, ô, power-up, bẫy, bot, thử thách cá nhân, lưu/tiếp tục, hoàn tác | ☐ |
| **G3 — Server** | Phòng, sức chứa, màu, hành động, bot, Redis, pub/sub, WebSocket + polling, nối lại, chủ phòng, `/api/health`, test, mô phỏng tải | ☐ |
| **G4 — Chơi qua phòng** | Trang chủ, tạo/vào phòng (mã, QR, link), phòng chờ, chơi qua mạng, trạng thái kết nối, kết thúc, chơi lại, Đoán cùng | ☐ |
| **G5 — Hoàn thiện** | Ôn câu sai, thống kê, Kho câu hỏi, Luật chơi, Cài đặt, âm thanh, phím tắt, giao diện, reduced motion | ☐ |
| **G6 — Phát hành** | Hướng dẫn tạo project Vercel + Redis (nhóm làm), deploy preview, diễn tập, `check:release`, bản offline, README | ☐ |

## Ghi chú nền tảng (G0, chi tiết ở mục 15.4–15.5)
- Vite (giao diện tĩnh) + `api/` (Vercel Functions Node.js, handler kiểu Web), **không cần framework**. WebSocket: `experimental_upgradeWebSocket()` của `@vercel/functions` (cần `ws`), chỉ chạy trong runtime Vercel → chạy cục bộ/test bằng server Node riêng + Redis giả lập.
- Hobby: kết nối WebSocket tối đa 300 giây; 2 GB / 1 vCPU cố định; **tối đa 12 function mỗi deployment** → dùng một function `api/[...path].ts` chuyển vào `server/`.
- Hạn mức chặt nhất là số lệnh Upstash (500.000/tháng): ~30.000 lệnh mỗi buổi bình thường, ~66.000 khi mọi máy dùng polling. Vượt hạn mức Hobby → project bị dừng tới hết chu kỳ 30 ngày.
- Nhánh được đẩy đúng tên `game` (môi trường cho phép), không cần tên thay thế.

## Ghi chú dữ liệu
- 3 trụ cột: `dan-chu` (Đỏ son `#A4262C`), `phap-quyen` (Xanh mực `#23395B`), `trong-sach` (Vàng đồng `#B8892B`; chữ trên nền sáng dùng `#7A5A17` để đạt WCAG AA). Tên trụ cột đọc từ dữ liệu, không viết cứng.
- 13 hiện vật, mọi hiện vật `verified: true`, không hiện vật nào `hidden`: dân chủ 5 (HV-02, 04, 05, 07, 12), pháp quyền 4 (HV-01, 03, 08, 09), trong sạch 4 (HV-06, 10, 11, 13). Chưa có ảnh (chỉ `image.src` trỏ tới file chưa tồn tại). `sourceIds` trỏ tới `sources.json` của web — không chép sang game; thẻ hiện vật không hiện nguồn APA (N1).
- `mindmap.json`: trụ cột `trong-sach` có `todo` — giáo trình thiếu tr. 92–93.

## TODO (mục 20 tài liệu thiết kế)

**Nhóm cần quyết:**
- [ ] Tên chính thức của game — để sau, không chặn các mốc.

**Nội dung (nhóm cung cấp):**
- [ ] Soạn tiếp `docs/CAU-HOI-GAME.md` (đã có 12 câu khởi đầu) theo mẫu: mục tiêu ≥ 60 câu, mỗi câu có nguồn kèm số trang. Ưu tiên trụ cột trong sạch (mới có 2 câu) và câu độ khó 2–3; thêm vài câu `truefalse`, `fillQuote`, `situation`; nhớ giáo trình tr. 92–93.

**Hạ tầng (cần tài khoản nhóm):**
- [ ] Tạo project Vercel thứ hai, nối repo `HCM202`, Production Branch = `game`, Root Directory = gốc nhánh, Fluid Compute bật (mặc định).
- [ ] Gắn **Upstash for Redis** (gói Free) từ Vercel Marketplace — không dùng Redis Cloud Free (30 kết nối, 100 lệnh/giây).
- [ ] Điền `siteUrl` của game.
- [ ] Đề xuất: deploy preview ngay sau G3 để thử WebSocket thật sớm.
- [ ] Kiểm tra Deployment Protection: thử trên điện thoại dùng Shareable Links; trước buổi học, tên miền chính mở được mà không cần đăng nhập Vercel.

**Cần xác minh:**
- [ ] Trước G3: Upstash có tính mỗi tin pub/sub nhận được là một lệnh không; tên biến môi trường Marketplace đặt cho Redis (`REDIS_URL` / `KV_URL`…).
- [ ] Trên deploy preview: WebSocket qua `experimental_upgradeWebSocket` chạy được, đóng sau 300 giây, client tự nối lại.
