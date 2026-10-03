# Con đường tư tưởng HCM

Board game kiểu cờ cá ngựa về Chủ đề 4 — *Tư tưởng Hồ Chí Minh về Nhà nước của nhân dân, do nhân dân, vì nhân dân* (HCM202, sản phẩm sáng tạo thứ hai). Thiết kế: [`docs/THIET-KE-GAME.md`](docs/THIET-KE-GAME.md).

> Đang làm theo lộ trình mục 18 của tài liệu thiết kế. Hiện xong **G1** (engine, dữ liệu, bộ câu hỏi, mô phỏng); giao diện bàn cờ có ở G2, phòng chơi online ở G3–G4. Phần deploy Vercel và bản offline hoàn chỉnh viết ở G6.

## Chạy

Cần Node.js ≥ 22.12. Lần đầu: `npm install`.

| Lệnh | Việc |
|---|---|
| `npm run dev` | Chạy thử giao diện ở http://localhost:5173 |
| `npm run test` | Chạy toàn bộ test (engine, dữ liệu, bộ câu hỏi, script nhập) |
| `npm run build` | Bản online → `dist/` |
| `npm run build:offline` | Bản offline một file → `dist-offline/index.html` (không request mạng) |
| `npm run lint` | Kiểm tra mã (oxlint) |
| `npm run import:questions` | Nhập `docs/CAU-HOI-GAME.md` → `src/data/questions.json` |
| `npm run simulate` | Mô phỏng cân bằng 1.000 ván bot mỗi cấu hình (mục 11) |

Kiểm tra trước khi commit: `npm run test && npm run build && npm run build:offline && npm run lint`.

## Sửa bộ câu hỏi

1. Thêm dòng vào bảng trong [`docs/CAU-HOI-GAME.md`](docs/CAU-HOI-GAME.md) theo hướng dẫn ở [`docs/CAU-HOI-GAME.mau.md`](docs/CAU-HOI-GAME.mau.md) (id `Q-13` trở đi; mỗi câu có nguồn kèm số trang; giải thích không nhắc chữ cái phương án).
2. Chạy `npm run import:questions`. Script báo rõ dòng sai và **không ghi đè** `questions.json` khi còn lỗi. Câu hỏi thử (`TEST-…`, chỉ hỏi về luật chơi) tự lấp những tổ hợp trụ cột × độ khó còn dưới 2 câu chính thức.
3. Chạy `npm run test` và `npm run simulate`.

## Cấu trúc

- `src/engine/` — reducer thuần (chạy được trên server và trình duyệt), RNG có seed, bot.
- `src/data/` — dữ liệu JSON (bàn cờ, luật, power-up, bẫy, câu hỏi, bot, màu ngựa, chữ giao diện, hiện vật, trụ cột). Nguồn gốc dữ liệu chép từ bảo tàng số: `src/data/NGUON.md`.
- `scripts/` — nhập câu hỏi, mô phỏng cân bằng.
- `tests/` — Vitest.
