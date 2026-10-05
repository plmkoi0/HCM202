# Con đường tư tưởng HCM

Board game kiểu cờ cá ngựa về Chủ đề 4 — *Tư tưởng Hồ Chí Minh về Nhà nước của nhân dân, do nhân dân, vì nhân dân* (HCM202, sản phẩm sáng tạo thứ hai). Muốn tiến phải hiểu bài: mỗi bước tới ô câu hỏi là một câu hỏi, đúng thì nhảy lên, sai thì đứng yên. Ai về đích trước thắng. Thông điệp: **"Chủ nhân không đứng ngoài"**.

Thiết kế (nguồn chuẩn): [`docs/THIET-KE-GAME.md`](docs/THIET-KE-GAME.md) · Diễn tập và kịch bản trên lớp: [`docs/DIEN-TAP.md`](docs/DIEN-TAP.md)

## Chơi online

**https://hcm-202-web-omega.vercel.app**

<img src="docs/phat-hanh/qr-game.png" alt="Mã QR mở game" width="200">

- **Tạo phòng** (1–5 người, có máy chơi cùng) → mời bạn bằng **mã 5 ký tự**, **mã QR** hoặc **link** `/p/ABCDE`.
- **Vào phòng** bằng mã, hoặc quét QR / mở link mời.
- **Chơi trên một máy**: 1–5 người thay phiên trên cùng thiết bị; 1 người và 0 máy = thử thách cá nhân.
- Trên lớp: chủ phòng chọn mốc **5 hoặc 7 phút**. Ảnh QR để đặt lên slide: [`docs/phat-hanh/qr-game.png`](docs/phat-hanh/qr-game.png).

## Bản offline (không cần mạng)

- Tải gói [`phat-hanh/HCM202-Con-duong-tu-tuong.zip`](phat-hanh/HCM202-Con-duong-tu-tuong.zip) (trên GitHub: mở file → **Download raw file**).
- Giải nén, mở `index.html` bằng trình duyệt (Chrome, Edge, Firefox, Safari). Hướng dẫn ngắn ở `HUONG-DAN.txt` trong gói.
- Chỉ có **"Chơi trên một máy"** (kèm Luật chơi, Cài đặt); không có chơi qua phòng. Bản offline không gửi request mạng nào.

## Dự phòng khi mất mạng

1. Server phòng chơi lỗi nhưng trang vẫn mở được → dùng **"Chơi trên một máy"** ngay trên trang đó (không cần server), chiếu lên máy chiếu cho cả lớp.
2. Không vào được trang → mở **bản offline** (gói zip ở trên) trên máy chiếu hoặc laptop.
3. Đang chơi qua phòng mà rớt mạng → game tự chuyển sang chế độ dự phòng / tự nối lại; tải lại trang vẫn về đúng phòng.

Chi tiết từng tình huống trên lớp: [`docs/DIEN-TAP.md`](docs/DIEN-TAP.md).

## Sửa bộ câu hỏi

Bộ câu hỏi do nhóm biên soạn và chịu trách nhiệm (55 câu, 18 / 19 / 18 theo độ khó 1 / 2 / 3).

1. Sửa hoặc thêm dòng vào bảng 8 cột trong [`docs/CAU-HOI-GAME.md`](docs/CAU-HOI-GAME.md) theo [`docs/CAU-HOI-GAME.mau.md`](docs/CAU-HOI-GAME.mau.md): id · độ khó · câu hỏi · đáp án A–D · đúng (id mới từ `Q-56`; giữ ba mức độ khó gần bằng nhau).
2. `npm run import:questions` — script tự suy ra loại câu, báo rõ dòng sai và câu trùng, **không ghi đè** `src/data/questions.json` khi còn lỗi.
3. `npm run test && npm run simulate`.
4. `npm run package:offline` (gói offline mang theo câu hỏi mới), `npm run check:release`, rồi commit và đẩy lên nhánh `game` — Vercel tự deploy lại.

## Deploy (Vercel + Redis)

Project Vercel riêng của game (Production Branch = `game`, Root Directory = gốc nhánh) và kho **Upstash for Redis** (gói Free) đã được tạo. Hướng dẫn từng bước và hiện trạng: [`docs/HUONG-DAN-VERCEL.md`](docs/HUONG-DAN-VERCEL.md).

- Mỗi lần đẩy lên nhánh `game` là Vercel deploy bản chính tại tên miền trên.
- Biến môi trường Redis chỉ nằm trong cài đặt Vercel (xem `.env.example`); không commit `.env`.
- `vercel.json` có rewrite `/api/(.*)` cho function chung `api/[...path].ts` — không xóa.

## Lệnh

Cần Node.js ≥ 22.12. Lần đầu: `npm install` (`npm audit` báo lỗi ở `braces` qua `vite-plugin-singlefile` — chỉ là công cụ build, không vào mã chạy). Các lệnh `e2e` cần Chrome / Chromium: đặt `CHROMIUM_PATH=<đường dẫn trình duyệt>` (mặc định `/opt/pw-browsers/chromium`).

| Lệnh | Việc |
|---|---|
| `npm run dev` + `npm run server` | Chạy thử giao diện ở http://localhost:5173 với server phòng chơi cục bộ (cổng 8787, kho trong bộ nhớ) |
| `npm run serve` | Build rồi phục vụ `dist/` cùng server phòng chơi ở cổng 8787 (giống bản deploy) |
| `npm run build` | Bản online → `dist/` (Vercel chạy lệnh này) |
| `npm run build:offline` | Bản offline một file → `dist-offline/index.html` (kiểm luôn không có mã mạng) |
| `npm run package:offline` | Build offline rồi đóng gói `phat-hanh/HCM202-Con-duong-tu-tuong.zip` (index.html + HUONG-DAN.txt) |
| `npm run qr` | Tạo lại `docs/phat-hanh/qr-game.png` từ `siteUrl` trong `src/data/site.json` (không gọi mạng) |
| `npm run import:questions` | Nhập `docs/CAU-HOI-GAME.md` → `src/data/questions.json` |
| `npm run test` | Toàn bộ test (engine, dữ liệu, câu hỏi, server, kho Redis, lớp Vercel) |
| `npm run lint` | Kiểm tra mã (oxlint) |
| `npm run e2e` | Chạy thử trong Chromium: chơi trên một máy (bản offline, chạy `build:offline` trước) + 3 máy chơi qua phòng (server cục bộ) |
| `npm run e2e:local` | Chỉ phần chơi trên một máy |
| `npm run e2e:online -- --url <địa chỉ>` | Chạy thử 3 máy trên bản deploy thật |
| `npm run check:deploy -- <địa chỉ> [--long]` | Kiểm bản deploy: `/api/health`, WebSocket, polling, (`--long`) đóng / nối lại ở 300 s |
| `npm run check:release` | Kiểm trước phát hành: không còn câu hỏi thử, `questions.json` khớp file câu hỏi, bản offline không có mã mạng, `siteUrl`, ảnh QR và gói zip mới nhất |
| `npm run simulate` | Mô phỏng cân bằng 1.000 ván bot mỗi cấu hình (mục 11) |
| `npm run sim:load` | Mô phỏng tải 10 phòng × 5 + 20 phòng 1 người qua HTTP / WebSocket thật |

**Trước khi commit:** `npm run test && npm run build && npm run build:offline && npm run lint && npm run check:release`, thêm `npm run e2e` khi đổi giao diện.

**Sau khi đẩy lên `game`:** `npm run check:deploy -- https://hcm-202-web-omega.vercel.app` (và `npm run e2e:online -- --url …` nếu đổi phần chơi qua phòng).

## Cấu trúc

- `src/engine/` — luật chơi (reducer thuần, chạy cả trên server và trình duyệt), RNG có seed, máy chơi cùng.
- `src/data/` — dữ liệu JSON: bàn cờ, luật, power-up, bẫy, câu hỏi, máy chơi cùng, màu ngựa, chữ giao diện. Nguồn gốc dữ liệu từng chép từ bảo tàng số và việc gỡ ở bản 1.6: `src/data/NGUON.md`.
- `src/components/`, `src/screens/` — giao diện React; `src/net/` — kết nối phòng chơi (chỉ bản online).
- `server/` — phòng chơi, kho Redis / bộ nhớ, WebSocket; `api/` — lớp mỏng Vercel Functions.
- `scripts/` — nhập câu hỏi, mô phỏng, chạy thử, kiểm tra phát hành, đóng gói offline, tạo QR.
- `tests/` — Vitest. `phat-hanh/` — gói offline đã đóng.
