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
- **Nội dung (bản 1.6):** Chủ đề 4 theo giáo trình HCM202, Chương IV, mục II. **Bộ câu hỏi 55 câu do nhóm biên soạn và chịu trách nhiệm** (`docs/CAU-HOI-GAME.md`, bảng 8 cột theo mẫu `docs/CAU-HOI-GAME.mau.md`): Q-01 → Q-12 là 12 câu khởi đầu (từ `QUIZ-KIEN-THUC.md`), Q-13 → Q-55 từ `Câu hỏi.docx` của nhóm; 18 / 19 / 18 câu theo độ khó. **Không có** trụ cột, giải thích, nguồn, xác minh, hiện vật. Mỗi ô câu hỏi (kể cả Đích) rút ngẫu nhiên một câu từ toàn bộ kho — các mức trộn lẫn suốt ván (mục 5). Câu hỏi thử chỉ lấp độ khó còn dưới 2 câu (hiện không dùng).
- **Dữ liệu chép từ nhánh web:** `artifacts.json`, `mindmap.json`, `pillars.json` **đã gỡ ở bản 1.6**; font giữ; `docs/nguon/` giữ làm hồ sơ — nguồn gốc ghi ở `src/data/NGUON.md`.

### Luật cốt lõi (đã chốt — không đổi, mục 2 và 20)
1. Chơi theo lượt, mỗi lượt tung xúc xắc.
2. Ai về đích trước thắng.
3. Trên đường có ô power-up và ô bẫy; các ô còn lại là ô câu hỏi.
4. Xúc xắc chỉ tới ô câu hỏi → đúng thì nhảy lên, sai thì đứng yên.

Cũng đã chốt: **không có đá ngựa** · **bàn 6 nhánh**, phòng tối đa 5 người · **giới hạn mặc định 10 phút** · **Đoán cùng tắt mặc định** · **thẻ bẫy chỉ "mất lượt" hoặc "lùi ngẫu nhiên 1–3 ô"**.

### Đã chốt ở G0 (bản 1.5, mục 20 — bảng "Quyết định G0 đã ghi vào tài liệu")
> **Bản 1.6** (đầu mục 20 "Thay đổi bản 1.6") ưu tiên hơn: D1, D3, N1, N2, phần trụ cột của D2 / D6, quy tắc giải thích và hai lời giải thích Q-02 / Q-11 **đã bỏ**. Câu hỏi rút ngẫu nhiên từ toàn bộ kho; sau khi chốt chỉ hiện Đúng / Sai và đáp án đúng (3 giây).
- ~~**D1** Trụ cột của nhánh *i* = trụ cột thứ ((*i* − 1) mod số trụ cột) + 1 theo thứ tự `mindmap.json` → nhánh 1–6: dân chủ, pháp quyền, trong sạch, dân chủ, pháp quyền, trong sạch.~~ *(đã bỏ ở 1.6)*
- **D2** Mỗi nhánh [cổng, ô 2, ô 3]; power-up ở ô 3 nhánh 1 và 5; bẫy ở ô 3 nhánh 3 và 6 → 8 ô câu hỏi vòng chung; cổng của màu trống = ô câu hỏi (phần trụ cột / độ khó *(đã bỏ ở 1.6)*).
- ~~**D3** Đường về đích 4 ô độ khó 2, 2, 3, 3; trụ cột xoay vòng bắt đầu từ trụ cột của nhánh có cổng; Đích độ khó 3, trụ cột theo seed.~~ *(đã bỏ ở 1.6)* — đường về đích 4 ô câu hỏi + Đích, câu rút ngẫu nhiên.
- **D4** Bố cục Dài: vòng 24 ô = 6 cổng + 3 power-up + 3 bẫy + 12 câu hỏi; đường về đích 5 ô.
- **D5** Quãng đường 22 bước: cổng (0) → 17 ô vòng chung → rẽ ở ô ngay trước cổng → 4 ô về đích → Đích (22). Bố cục Dài 29.
- **D6** Ngựa 6 màu tươi, mỗi màu một ký hiệu; cổng và đường về đích mang màu ngựa; ô câu hỏi đồng nhất (phần trụ cột *(đã bỏ ở 1.6)*).
- **L1** Hiệu ứng đẩy không bao giờ đưa ngựa vào Đích (Tiến 3 ô dừng tối đa ở ô cuối đường về đích). Bẫy lùi theo đường của người đó, có thể từ đường về đích ra vòng chung, không quá cổng.
- **L2** 50:50 loại tới khi còn 2 đáp án (4 → 2, 3 → 2); câu 2 đáp án: nút mờ, không mất power-up.
- **L3** Luật ra 6 xét mặt xúc xắc trước khi nhân đôi (Xúc xắc ×2).
- **L4** Thử thách cá nhân: giới hạn mặc định 10 phút; kỷ lục (ít lượt nhất) chỉ lưu khi về đích; hết giờ báo số ô còn lại.
- **L5** Chấp nhận đáp án nằm trong mã trang (bản online đóng gói `questions.json`); state vẫn không chứa đáp án trước khi chốt; ẩn nút Kho câu hỏi khi đang ở trong phòng.
- **T1** Giới hạn 5 / 7 / 10 / 15 phút / không giới hạn, mặc định 10; trên lớp chọn 5 hoặc 7; hết giờ xếp theo khoảng cách, người dẫn đầu được tôn vinh như người thắng; mô phỏng ở 20 s và 25 s/lượt.
- ~~**N1** Thẻ hiện vật trong game: mã, ngày, tên, trụ cột, câu chuyện, trích dẫn + `quote.cite`, ghi chú ngữ cảnh; không ảnh, không "Ngày nay", không nguồn APA; hiện vật `hidden` không hiện chip.~~ *(đã bỏ ở 1.6)*
- ~~**N2** Mục tiêu mỗi trụ cột ≥ 10 / 6 / 4 câu độ khó 1 / 2 / 3; trụ cột trong sạch được ít hơn 20 câu. Tổ hợp không có câu: lấy cùng trụ cột ở độ khó gần nhất, rồi trụ cột khác cùng độ khó (mục 8).~~ *(đã bỏ ở 1.6)*
- **N3** `fillQuote`: đúng một chỗ trống `___`.
- **N4** Nhãn thẻ bẫy trung tính: "Bẫy — mất lượt" · "Bẫy — lùi {n} ô".
- **12 câu khởi đầu** Q-01 → Q-12 giữ nguyên văn `docs/nguon/QUIZ-KIEN-THUC.md` ở câu hỏi, đáp án, đáp án đúng (test kiểm). Độ khó đã duyệt: 1 = Q-05, 06, 07, 09, 11 · 2 = Q-01, 04, 10, 12 · 3 = Q-02, 03, 08. Vẫn trộn đáp án khi hiện (mục 8). (Giải thích và quy tắc chữ cái phương án *(đã bỏ ở 1.6)*.)
- **Deployment Protection** Chỉ tên miền chính mở công khai; khi chơi thật luôn mở game, tạo QR và link mời từ tên miền chính; thử trên điện thoại dùng Shareable Links (mục 15.6).

## Quy ước (mục 15.8 tài liệu thiết kế)
- Trả lời và viết nội dung bằng **tiếng Việt**; commit message ngắn gọn bằng tiếng Việt.
- `docs/THIET-KE-GAME.md` là nguồn chuẩn duy nhất cho game; thay đổi đã được nhóm duyệt thì **cập nhật tài liệu trước rồi mới code**. Chỗ thiết kế thiếu, mâu thuẫn hoặc không khả thi: nêu ra kèm phương án đề xuất và hỏi nhóm, không tự quyết lặng lẽ.
- **Không tự viết hay sửa nội dung câu hỏi** về tư tưởng Hồ Chí Minh — bộ câu hỏi do nhóm biên soạn và chịu trách nhiệm (mục 13); chỉ báo lỗi định dạng, câu trùng. Câu hỏi thử (mục 13.3) chỉ hỏi về luật chơi: id `TEST-`, `"test": true`, nhãn `[Câu hỏi thử]`.
- Không tự thêm sự kiện, số liệu, trích dẫn vào chữ giao diện.
- Nhãn thẻ bẫy trung tính (N4); power-up và thẻ bẫy mô tả hiệu ứng bằng lời trung tính.
- Khi nhóm gửi bản mới `docs/CAU-HOI-GAME.md`: chạy `npm run import:questions`, báo lỗi định dạng và câu trùng — **không tự sửa nội dung**; câu hỏi thử tự lấp độ khó còn thiếu; chạy lại test và mô phỏng.
- Không tự lấy ảnh trên mạng khi chưa rõ bản quyền; không tự vẽ chân dung Bác.
- Nội dung nằm trong `src/data/*.json`, không viết cứng trong component.
- **Không gắn thống kê.** Tài nguyên bên ngoài duy nhất được phép: Vercel Functions + Redis (Vercel Marketplace) cho phòng chơi. Bản offline không có request mạng nào. Không icon font, không CDN, không Google Fonts.
- **Không commit lên nhánh web**; không import mã hay dữ liệu từ nhánh web; không đồng bộ dữ liệu lại với web.
- Không sao chép mã, giao diện, tên, đồ họa, âm thanh của game tham khảo (Phụ lục A).
- Cập nhật `CLAUDE.md` này và mục 18 tài liệu thiết kế sau mỗi mốc.
- **Kiểm tra sau mỗi mốc:** chỉ chạy kiểm tra tự động (test, build, build offline, lint; thêm `npm run e2e` khi đổi giao diện). Không rà soát bằng sub agent sau từng mốc.
- **Rà soát bằng sub agent:** chỉ một lần trước phát hành (G6), hoặc khi nhóm yêu cầu. Mỗi lần dùng **tối đa 6 sub agent**, tính cả người rà soát lẫn người phản biện; sub agent không tạo thêm sub agent; chỉ giao phần cần góc nhìn độc lập (vd. đối chiếu nội dung với nguồn, rà soát mã server).
- **Dừng sau mỗi mốc G:** xong một mốc thì chạy kiểm tra tự động, commit, push, cập nhật `CLAUDE.md` và mục 18, báo cáo ngắn (đã làm gì, chi tiết tự chọn, cần nhóm làm gì), rồi dừng chờ nhóm cho phép làm mốc tiếp theo. Không tự sang mốc mới. Trong một mốc chỉ dừng giữa chừng khi: cần nhóm quyết; cần tài khoản hoặc quyền mạng cho việc không làm cục bộ được; kiểm tra cho thấy không đạt yêu cầu trong tài liệu. Phiên quá dài thì dừng ở chỗ hợp lý, ghi tiến độ vào `CLAUDE.md`.
- Kiểm tra trước khi commit (từ G1): `npm run test && npm run build && npm run build:offline && npm run lint` ở gốc nhánh. Từ G2, khi đổi giao diện: thêm `npm run e2e` (Chromium thật ở `/opt/pw-browsers/chromium` hoặc `CHROMIUM_PATH`; `--motion` để bật hiệu ứng, `--shots <thư mục>` để chụp màn hình).

## Cấu trúc thư mục

**Hiện tại (sau G5):**
```
/
├── CLAUDE.md, README.md, .gitignore, .oxlintrc.json, .env.example (biến Redis), vercel.json
├── package.json, package-lock.json      ← Vite 8 + React 19 + TS 6 + Tailwind 4 + Vitest 5 + oxlint; tsx chạy script TS;
│                                          lucide-react (biểu tượng SVG); playwright-core + axe-core (chỉ để chạy thử)
├── vite.config.ts                       ← mode "offline": vite-plugin-singlefile → dist-offline/index.html, define __OFFLINE__
├── tsconfig.json, tsconfig.app.json (src), tsconfig.node.json (vite.config, scripts, tests; allowJs),
│   tsconfig.server.json (server, api, src/net)
├── api/[...path].ts                     ← lớp mỏng Vercel Functions: mọi /api/* → server/; WebSocket bằng experimental_upgradeWebSocket
├── server/                              ← lõi server (test được không cần Vercel): rooms (phòng, hành động, polling, kết nối),
│                                          store (giao diện kho) + memoryStore + redisStore (Lua, pub/sub), presence (trạng thái
│                                          kết nối, chuyển chủ phòng), auth (mã phòng, token), http (API kiểu Web), socket + hub
│                                          (WebSocket), context (chọn kho theo biến môi trường), node + dev (server Node cục bộ), data, errors
├── index.html                           ← favicon SVG nhúng sẵn, meta robots noindex
├── docs/
│   ├── THIET-KE-GAME.md                 ← tài liệu thiết kế (bản 1.5 + kết quả G1)
│   ├── CAU-HOI-GAME.md                  ← bộ câu hỏi của nhóm: 12 câu khởi đầu Q-01 → Q-12
│   ├── CAU-HOI-GAME.mau.md              ← mẫu + hướng dẫn điền (mục 13.4)
│   ├── HUONG-DAN-VERCEL.md              ← từng bước tạo project Vercel thứ hai + gắn Upstash (nhóm làm)
│   └── nguon/THIET-KE-WEB-APP.md, nguon/QUIZ-KIEN-THUC.md   ← bản sao nguồn tham chiếu (không sửa; mã băm trong NGUON.md)
├── public/robots.txt                    ← chặn máy tìm kiếm (kèm meta robots, header X-Robots-Tag trong vercel.json)
├── scripts/
│   ├── import-questions.mjs             ← CAU-HOI-GAME.md → questions.json; báo dòng sai, không ghi đè khi lỗi; lấp câu hỏi thử
│   ├── simulate.ts                      ← mô phỏng cân bằng (npm run simulate)
│   ├── e2e-local.mjs                    ← chạy thử "Chơi trên một máy" trong Chromium (npm run e2e, sau build:offline)
│   ├── e2e-online.ts                    ← chạy thử 3 máy chơi qua phòng (npm run e2e:online, sau npm run build;
│   │                                      -- --url <deploy> chạy trên bản deploy, E2E_PROXY_CA = CA của proxy chặn TLS nếu có)
│   ├── load-sim.ts                      ← mô phỏng tải 10 × 5 + 20 × 1 qua HTTP/WebSocket thật (npm run sim:load [-- --guess] [-- --redis])
│   ├── check-deploy.ts                  ← kiểm bản deploy thật: health, WebSocket, polling, đóng/nối lại 300 s (npm run check:deploy -- <url> --long)
│   ├── check-offline.mjs                ← bản offline không chứa mã mạng (chạy trong build:offline)
│   └── lib/question-table.mjs, lib/quiz-source.mjs   ← đọc bảng câu hỏi, mẫu chữ cái phương án; đọc QUIZ-KIEN-THUC.md
├── src/
│   ├── data/                            ← board, rules, powerups, traps, bots, tokens, site, questions (sinh từ script),
│   │                                      test-questions (kho câu hỏi thử), NGUON.md (artifacts / mindmap / pillars đã gỡ ở 1.6)
│   ├── engine/                          ← types, rng (mulberry32), data, board (hình học, đường đi), questions (chọn câu),
│   │                                      reducer (luật), bot, ranking, history (hoàn tác), view (state gửi client), index
│   ├── online/                          ← session (phiên phòng, biệt danh), useRoom
│   ├── screens/online/                  ← màn chơi qua phòng (chỉ bản online)
│   ├── net/                             ← client phòng chơi: api (fetch), clock (lệch đồng hồ), connection (WebSocket →
│   │                                      polling, thay kết nối ~280 s, TICK khi quá hạn) — bản offline không nạp
│   ├── game/                            ← local.ts (lưu / tiếp tục / hoàn tác / kỷ lục), useLocalGame (hành động, tạm dừng,
│   │                                      tự động khi quá hạn), useBoardAnimation (xúc xắc lăn, ngựa đi từng ô, âm thanh,
│   │                                      pháo giấy), review (Sổ ôn tập), useShortcuts (phím tắt, tắt tiếng, toàn màn hình)
│   ├── components/                      ← Board (+ BoardLegend, cellLegendItems), Dice, Countdown, Sheet (giữ tiêu điểm),
│   │                                      QuestionPanel, TurnPanels, PlayerStrip, EndPanel (thống kê, ôn câu sai, chia sẻ),
│   │                                      Practice (ôn tập), GameMenu (loa, Menu), Confetti, ArtifactCard, PillarChip, …
│   ├── screens/                         ← Home, LocalSetup, LocalGame, Rules (Luật chơi), QuestionBank (Kho câu hỏi), Settings
│   ├── lib/                             ← gameData (nạp JSON → GameData), boardLayout (toạ độ SVG), eventText (nhật ký),
│   │                                      storage (localStorage có try/catch), text (fill, clock, biệt danh), hooks,
│   │                                      settings (cài đặt trên máy, data-theme/motion/text trên <html>), sound (Web Audio)
│   ├── assets/fonts.css, assets/fonts/  ← Be Vietnam Pro 400/400i/600/700, Noto Serif 700/400i + OFL
│   ├── index.css, main.tsx, App.tsx     ← token màu sáng/tối, lớp nút/thẻ; App chuyển màn + ErrorBoundary
│   └── vite-env.d.ts
└── tests/                               ← helpers, data, questions, engine, local, server (lõi), server-net (HTTP + WebSocket thật),
                                           store (kho bộ nhớ + redis-server cục bộ), vercel-api (Node ESM như Vercel, cả rewrite
                                           __p), g5 (cài đặt, Sổ ôn tập, phím tắt, thống kê, âm thanh), netHelpers
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
    ├── data/                 ← mục 14 (board, rules, powerups, traps, questions, test-questions, bots, tokens, site, NGUON.md)
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
| **G1 — Nền móng** | Dự án Vite, JSON + kiểu, 12 câu khởi đầu + câu hỏi thử lấp chỗ thiếu, script nhập câu hỏi, test dữ liệu, engine + bot + unit test, mô phỏng cân bằng ở 20 s và 25 s/lượt | ☑ Xong 03/10/2026 — 120 test; mô phỏng đạt mục tiêu (mục 11) |
| **G2 — Chơi trên một máy** | Bàn cờ SVG, xúc xắc, ngựa, ô, power-up, bẫy, bot, thử thách cá nhân, lưu/tiếp tục, hoàn tác | ☑ Xong 03/10/2026 — 131 test; `npm run e2e` đạt ở 360 × 780 sáng và 1366 × 768 tối (axe không lỗi) |
| **G3 — Server** | Phòng, sức chứa, màu, hành động, bot, Redis, pub/sub, WebSocket + polling, nối lại, chủ phòng, `/api/health`, test, mô phỏng tải | ☑ Xong 03/10/2026 — 170 test; mô phỏng tải đạt (kho bộ nhớ và redis-server thật, có/không Đoán cùng); chờ nhóm tạo project để kiểm trên Vercel |
| **G4 — Chơi qua phòng** | Trang chủ, tạo/vào phòng (mã, QR, link), phòng chờ, chơi qua mạng, trạng thái kết nối, kết thúc, chơi lại, Đoán cùng | ☑ Xong 03/10/2026 (e2e 3 máy cục bộ); kiểm trên Vercel ở đầu G5 |
| **G5 — Hoàn thiện** | Ôn câu sai, thống kê, Kho câu hỏi, Luật chơi, Cài đặt, âm thanh, phím tắt, giao diện, reduced motion | ☑ Xong 03/10/2026 — 178 test; `npm run e2e` đạt; deploy thật: sửa catch-all `/api/*`, `check:deploy --long` + phòng 3 máy trên deploy đạt |
| **Đ1.6 — Đơn giản hóa câu hỏi** | Bảng câu hỏi 8 cột + script nhập, 55 câu, rút ngẫu nhiên từ toàn bộ kho; bỏ trụ cột, giải thích, nguồn, xác minh, hiện vật; hiện đáp án 3 giây; mô phỏng lại | ☑ Xong 04/10/2026 — 157 test; mô phỏng đạt; `npm run e2e` đạt; deploy: `check:deploy` + phòng 3 máy đạt. **Dừng — chờ nhóm cho phép G6** |
| **G6 — Phát hành** | Hướng dẫn tạo project Vercel + Redis (nhóm làm), deploy preview, diễn tập, `check:release`, bản offline, README | ☐ |

## Ghi chú nền tảng (G0, chi tiết ở mục 15.4–15.5)
- Vite (giao diện tĩnh) + `api/` (Vercel Functions Node.js, handler kiểu Web), **không cần framework**. WebSocket: `experimental_upgradeWebSocket()` của `@vercel/functions` (cần `ws`), chỉ chạy trong runtime Vercel → chạy cục bộ/test bằng server Node riêng + Redis giả lập.
- Hobby: kết nối WebSocket tối đa 300 giây; 2 GB / 1 vCPU cố định; **tối đa 12 function mỗi deployment** → dùng một function `api/[...path].ts` chuyển vào `server/`.
- Hạn mức chặt nhất là số lệnh Upstash (500.000/tháng): ~30.000 lệnh mỗi buổi bình thường, ~66.000 khi mọi máy dùng polling. Vượt hạn mức Hobby → project bị dừng tới hết chu kỳ 30 ngày.
- Nhánh được đẩy đúng tên `game` (môi trường cho phép), không cần tên thay thế.

## Ghi chú engine (G1)
- `applyAction(data, state, action)` thuần, không sửa state cũ (structuredClone), trả `{ ok, state }` hoặc `{ ok: false, error }` (mã lỗi → chữ ở `site.json` → `errors`). Mọi hành động mang `now`; engine không đọc đồng hồ, hạn thời gian nằm ở `state.deadline`.
- Pha: `roll` → (`chooseHorse`) → `question` | thẳng `reveal` → (`discard`) → `reveal` → NEXT_TURN → tung thêm (ra 6 / Thêm lượt) hoặc lượt sau. `ended` khi kết thúc.
- `pendingAutoAction(state, now)`: hành động bất kỳ máy nào gửi khi quá hạn (BOT_STEP / SKIP_TURN / AUTO_ROLL / TIMEOUT / NEXT_TURN).
- RNG trong `state.rng` (seed lưu `state.seed`); `clientView(state, viewerId)` bỏ seed/rng và lựa chọn Đoán cùng của người khác.
- Đường đi: bước 0 = cổng, 1…17 vòng chung, 18…21 về đích, 22 = Đích (Ngắn); ô không gắn trụ cột hay độ khó (bản 1.6).
- Chọn câu (bản 1.6): rút ngẫu nhiên từ toàn bộ kho, không lặp tới hết kho, trộn lại vòng mới (câu vừa hỏi không ra ngay), ưu tiên câu chưa gặp.
- Kết quả mô phỏng (chạy lại ở Đ1.6) và các chi tiết tự chọn ở G1 (mặc định "dừng ngay", Đổi câu đặt lại đồng hồ…; hiện đáp án nay 3 s) ghi ở mục 11 và 20 tài liệu thiết kế.
- `npm audit` báo `braces` (qua `vite-plugin-singlefile` → `micromatch`): chỉ là công cụ build, không vào mã chạy.

## Ghi chú server (G3, chi tiết ở mục 15.4, 20)
- G4: phần chơi qua phòng ở `src/screens/online/` (OnlineApp, CreateRoom, JoinRoom, Lobby, OnlineGame, RoomScreen, RoomSettings) + `src/online/` (session: phiên + biệt danh trong localStorage; useRoom: bọc RoomConnection). `App.tsx` nạp `OnlineApp` bằng `lazy()` trong nhánh `__OFFLINE__ ? null : …` để bản offline bỏ hẳn. Hạn giờ server đổi sang giờ máy (`localGame` trong OnlineGame) trước khi đưa vào các thành phần dùng chung với "Chơi trên một máy".
- `npm run e2e` = e2e một máy (bản offline) + build + `e2e:online` (3 trang trình duyệt, server cục bộ hạn rút ngắn: tạo / vào bằng link và mã, mất mạng rồi nối lại, tải lại trang, kết thúc, Chơi lại, chuyển chủ phòng).
- Lệnh: `npm run server` (cổng 8787, kho bộ nhớ; có `REDIS_URL` thì Redis thật) · `npm run dev` (Vite chuyển `/api` sang 8787) · `npm run serve` (build + phục vụ `dist/`) · `npm run sim:load` · `npm run check:deploy -- <url>`.
- Mọi import tương đối trong `server/`, `api/`, `src/engine/` **phải ghi đuôi `.js`**; JSON trong server nạp bằng `with { type: 'json' }` (`server/data.ts`). Vercel biên dịch từng file sang Node ESM, không sửa đường dẫn — `tests/vercel-api.test.ts` kiểm điều này. `src/net/` và giao diện dùng import không đuôi như cũ (Vite).
- Phòng = một khối JSON `Room` (server/types.ts), có `game: GameState`. Ghi qua `mutate()`: đọc (đệm/kho) → rà kết nối → sửa → `store.put(room, version cũ)` (Lua: kiểm version + ghi + hạn + publish) → xung đột thì đọc lại, thử lại. Lỗi phát hiện trên bản đệm có thể cũ → đọc lại kho trước khi báo (lỗi tìm ra nhờ mô phỏng tải).
- Hành động tự động: máy gửi `TICK`, server chạy `pendingAutoAction(game, giờ server)`. Hạn luôn theo giờ server; client đo lệch đồng hồ.
- Trạng thái kết nối: `links` (WebSocket đang mở, quá 320 s coi là chết) + `lastSeen` (lần ghi do chính người đó) + hash poll (tối đa 10 s/lần) → vắng 20 s thì `connected = false` (đồng bộ SET_CONNECTED sang engine) ở lần ghi kế tiếp; chủ phòng mất kết nối / rời → chuyển cho người vào sớm nhất còn kết nối.
- **Tiến độ phiên:** Đ1.6 xong và đã commit; **dừng chờ nhóm cho phép G6**. Deploy thật đã kiểm (mục 15.4); còn huy hiệu "Trực tiếp" trên máy thật (diễn tập G6).
- **Vercel:** `api/[...path].ts` ngoài Next.js chỉ khớp một cấp → `vercel.json` có rewrite `/api/(.*)` → `/api/[...path]?__p=$1`; `api/` khôi phục đường gốc từ `__p`. Đừng bỏ rewrite này.
- Chromium trong môi trường Claude Code đi qua proxy chặn TLS: cần `E2E_PROXY_CA=/root/.ccr/agent-proxy-ca.crt` để chạy `e2e:online -- --url`, và WebSocket của Chromium bị proxy làm mất `Upgrade` (dùng polling) — không phải lỗi game.
- Sub agent rà soát phải được dặn rõ CHỈ ĐỌC; ở G3 một sub agent vẫn sửa mã sau khi bị ngắt giữa chừng (đã đọc lại và kiểm toàn bộ trước khi commit).
- Test Redis thật: `tests/store.test.ts` tự bật `redis-server` cục bộ ở cổng trống (bỏ qua nếu máy không có).

## Ghi chú giao diện (G2)
- Mọi chữ giao diện ở `site.json` (kể cả nhãn nút, lỗi, nhật ký); component chỉ ghép dấu câu.
- Bàn cờ luôn nền sáng (lớp `.board-light` đặt lại biến màu); trang theo chế độ sáng/tối của máy. Màu chữ trên nền vàng: `--on-gold`; chữ nhấn: `--accent-text`.
- `useBoardAnimation` diễn tuần tự theo `state.log` (seq > seq đã diễn); `busy` = đang diễn hoặc còn sự kiện chưa diễn → cửa sổ chưa mở, hành động tự động chờ. `idleAt` = lúc diễn xong; `autoActionAt(state, idleAt)` = lúc tự gửi hành động (cửa sổ kết quả hiện đủ `revealMs` / `noticeMs` sau khi diễn xong).
- `useLocalGame`: `apply(action, human)`; `act(make)` chọn người thao tác (lượt của máy → người ngồi cùng); `setPaused` dời hạn pha + giới hạn ván khi chạy tiếp; ghi dấu "lần cuối thấy" mỗi 2 giây (`SEEN_KEY`) để `resumeLocal` không hoàn giờ khi tải lại.
- Khóa localStorage: `local.v1` (ván), `local.seen.v1`, `local.setup.v1` (thiết lập lần trước — đọc lại qua `sanitize`), `records.v1` (kỷ lục thử thách cá nhân). Đọc/ghi luôn trong try/catch; ván lưu hỏng / không hợp lệ (`isUsableSave`) thì bỏ.
- Sheet: `data-autofocus` được ưu tiên, Tab vòng trong cửa sổ, đóng thì trả tiêu điểm; nội dung đổi (câu hỏi → giải thích) thì tiêu điểm sang nút `data-autofocus` mới.
- Chạy thử: `page.clock` giả lập giờ (chạy nhanh); axe chờ hiệu ứng có hạn chạy xong mới kiểm.

## Ghi chú giao diện (G5, chi tiết ở mục 20)
- Cài đặt: `lib/settings.ts` (store + `useSettings`), khóa `settings.v1`; `applySettings` đặt `data-theme` / `data-motion` / `data-text` trên `<html>` (CSS dark mode: `@media` có `:root:not([data-theme='light'])` + `:root[data-theme='dark']`). `useReducedMotion()` = cài đặt "Hiệu ứng" kết hợp `prefers-reduced-motion`.
- Âm thanh: `lib/sound.ts` (oscillator, không file); `useBoardAnimation` phát theo sự kiện (`segmentsOf` → `cue`) và trả `burst` cho `Confetti`. `Confetti` luôn là phần tử thứ hai của Fragment ở cả nhánh ván và nhánh kết thúc để không chạy lại.
- Phím tắt: `shortcutOf` (thuần, có test) + `useShortcuts(handlers, enabled)`; màn chơi tự kiểm điều kiện như nút trên màn.
- Sổ ôn tập: `game/review.ts`, khóa `review.v1`; ghi khi ván kết thúc (một máy: `onEnded`; phòng: effect một lần mỗi ván theo `startedAt`).
- Chữ mới trong `site.json`: `practice`, `bank`, `rules` (luật chơi — chỉ luật, không nội dung tư tưởng), `settings`.
- `e2e-local` kiểm thêm: Luật chơi, Kho câu hỏi (ẩn đáp án, lọc, Sổ ôn tập, ôn tập bằng phím), Cài đặt (đổi giao diện, chữ lớn, nhớ sau tải lại), Menu trong ván, phím M / Space / 1, thống kê, làm lại câu sai; Đ1.6: không còn giải thích / nguồn / trụ cột trong cửa sổ câu hỏi và Kho câu hỏi, lọc theo độ khó.

## Ghi chú dữ liệu (bản 1.6)
- `questions.json` **sinh bởi** `npm run import:questions` từ `docs/CAU-HOI-GAME.md` (bảng 8 cột: id · độ khó · câu hỏi · đáp án A–D · đúng) — không sửa tay. Mỗi câu chỉ có `id, difficulty, type, question, answers, correct` (+ `test`). Loại câu tự suy ra: có `___` → `fillQuote`; đáp án đúng là "Đúng", "Sai" → `truefalse`; còn lại `single`.
- Hiện: 55 câu, 18 / 19 / 18 theo độ khó; 51 `single` + 4 `fillQuote` (Q-14, Q-27, Q-42, Q-44); không câu hỏi thử. Script báo lỗi câu trùng lời câu hỏi, cảnh báo khi ba mức chênh nhau quá 3.
- `test-questions.json`: 17 câu hỏi thử (chỉ luật chơi), chỉ lấp độ khó còn dưới 2 câu chính thức.
- Engine: `pickQuestion(data, ctx, player, excludeId?)` rút từ toàn bộ kho (seed), không lặp tới hết kho; `ActiveQuestion` chỉ còn `difficulty` (nhãn, bot) + `isFinish`; `board.json` mỗi bố cục có `homeLength` (không còn độ khó theo ô). `GameState.schema` = 2, `Room.schema` = 2: ván lưu / phòng định dạng cũ bị bỏ.
- Đã gỡ `artifacts.json`, `mindmap.json`, `pillars.json`, `ArtifactCard`, `PillarChip`, `stats.byPillar`. Bàn cờ: ô câu hỏi một màu (`QUESTION_STROKE`).
- `revealMs` = 3000 (chỉ hiện Đúng / Sai + đáp án đúng, `data-correct-answer` trong giao diện).

## TODO (mục 20 tài liệu thiết kế)

**Nhóm cần quyết:**
- [ ] Tên chính thức của game — để sau, không chặn các mốc.

**Nội dung (nhóm cung cấp):**
- [x] Bộ câu hỏi 55 câu (bản 1.6). Thêm câu thì giữ ba mức độ khó gần bằng nhau (mục 13.4); nhóm tự lưu bản gốc `Câu hỏi.docx` (có nguồn) làm hồ sơ.

**Hạ tầng (cần tài khoản nhóm — làm theo `docs/HUONG-DAN-VERCEL.md`):**
- [x] Tạo project Vercel thứ hai (https://hcm-202-web-omega.vercel.app) — G5 đã kiểm: trang chủ là game, Production Branch = `game`.
- [x] Gắn **Upstash for Redis** — G5: `/api/health` trả `"store":"redis"`.
- [x] Điền `siteUrl` của game: `https://hcm-202-web-omega.vercel.app` (đã xác nhận đúng project game).
- [ ] Kiểm tra Deployment Protection: thử trên điện thoại dùng Shareable Links; trước buổi học, tên miền chính mở được mà không cần đăng nhập Vercel.

**Cần xác minh:**
- [ ] Upstash có tính mỗi tin pub/sub nhận được là một lệnh không — **chưa xác minh được** (upstash.com bị chặn; bằng chứng gián tiếp: không tính). Ước lượng chi phí đang tính **trường hợp xấu** (có tính).
- [x] Tên biến môi trường Redis — xác minh một phần: server đọc `REDIS_URL` → `KV_URL` → `UPSTASH_REDIS_URL` (TCP `rediss://`); chỉ có biến REST thì `/api/health` báo thiếu.
- [x] Trên bản deploy thật (G5, mục 15.4): `check:deploy --long` đạt (WebSocket, đóng 300 s + tự nối lại, polling, mọi `/api/*` sau khi thêm rewrite); phòng 3 máy trên deploy đạt.
- [ ] Huy hiệu "Trực tiếp" (WebSocket) trong trình duyệt trên máy thật — kiểm ở diễn tập G6 (Chromium của môi trường Claude Code bị proxy chặn TLS làm mất `Upgrade`).

*Mỗi lần sửa mục 20 tài liệu thiết kế thì sửa phần TODO này cùng lúc.*
