# Nguồn gốc dữ liệu khởi đầu

> **Bản 1.6 (04/10/2026) — đã gỡ:** `src/data/artifacts.json`, `src/data/mindmap.json`, `src/data/pillars.json` và mọi mã dùng chúng (trụ cột, thẻ / chip hiện vật). Bộ câu hỏi không còn trụ cột, giải thích, nguồn, xác minh, hiện vật (thiết kế mục 13, 20). `docs/nguon/` (`THIET-KE-WEB-APP.md`, `QUIZ-KIEN-THUC.md`) **giữ lại** làm hồ sơ nguồn gốc 12 câu khởi đầu; không dùng khi chạy game. Bảng và mã băm dưới đây là ghi chép lúc chép (03/10/2026), giữ làm lịch sử.

Các file dưới đây được **chép một lần** từ nhánh web (bảo tàng số) lúc tạo nhánh `game`. Đây chỉ là ghi nguồn gốc: sau khi chép, dữ liệu **thuộc về game**, sửa trực tiếp trên nhánh `game` khi cần và **không đồng bộ lại với web**. Game không import mã hay dữ liệu từ nhánh web khi chạy hoặc build.

- **Repo:** `plmkoi0/HCM202`
- **Nhánh web:** `claude/zen-fermi-bg6som` (nhánh mặc định của repo; nhánh làm việc `claude/kind-keller-ds1gdx` cùng commit)
- **Commit nguồn:** `2bda3971b27cf005680f32c6d0772fe851100587` — "Chuyển CLAUDE.md vào San-pham-sang-tao/web"
- **Ngày chép:** 03/10/2026 (giờ Việt Nam)
- **Cách chép:** `git show <commit>:<đường dẫn>` (file đã commit, chép nguyên byte)

## Danh sách file đã chép

| Nguồn (nhánh web, commit trên) | Đích (nhánh `game`) | Ghi chú |
|---|---|---|
| `San-pham-sang-tao/THIET-KE-WEB-APP.md` | `docs/nguon/THIET-KE-WEB-APP.md` | Nguồn tham chiếu (mục 13.2), nhất là mục 2 và mục 4 |
| `San-pham-sang-tao/QUIZ-KIEN-THUC.md` | `docs/nguon/QUIZ-KIEN-THUC.md` | 12 câu kiến thức nhóm đã duyệt (10 câu chính + 2 câu dự phòng), nguồn của bộ câu hỏi khởi đầu Q-01 → Q-12 (mục 13.1). Chép ngày 03/10/2026 (giờ Việt Nam), sau G0 |
| `San-pham-sang-tao/web/src/data/artifacts.json` | `src/data/artifacts.json` | 13 hiện vật HV-01 → HV-13, nguyên bản — **đã gỡ ở bản 1.6** |
| `San-pham-sang-tao/web/src/data/mindmap.json` | `src/data/mindmap.json` | 3 trụ cột, nguyên bản (gồm `todo` tr. 92–93) — **đã gỡ ở bản 1.6** |
| `San-pham-sang-tao/web/src/lib/pillars.ts` (id) + `web/src/data/site.json` → `pillars` (nhãn, tên) + `web/src/lib/pillarStyles.ts` → token trong `web/src/index.css` (màu) | `src/data/pillars.json` | Chỉ lấy giá trị, không chép mã — **đã gỡ ở bản 1.6** |
| `San-pham-sang-tao/web/src/assets/fonts/LICENSE-be-vietnam-pro.txt`, `LICENSE-noto-serif.txt` | `src/assets/fonts/` | Giấy phép SIL OFL 1.1 |
| `San-pham-sang-tao/web/src/assets/fonts/be-vietnam-pro-{latin,vietnamese}-{400-normal,400-italic,600-normal,700-normal}.woff2` | `src/assets/fonts/` | Be Vietnam Pro: chữ nội dung (400), nghiêng cho tên tác phẩm (400 nghiêng), nút/nhãn (600), số và tiêu đề nhỏ (700) |
| `San-pham-sang-tao/web/src/assets/fonts/noto-serif-{latin,vietnamese}-{700-normal,400-italic}.woff2` | `src/assets/fonts/` | Noto Serif: tiêu đề (700), trích dẫn trong câu `fillQuote` (400 nghiêng) |

Không chép: `sources.json`, `quiz.json` (bộ câu hỏi lấy từ `QUIZ-KIEN-THUC.md`, không lấy từ `quiz.json`), `site.json`, `team.json`, ảnh, mã nguồn web; các weight font khác (Be Vietnam Pro 500; Noto Serif 400, 600, 700 nghiêng, 800).

Từ bản 1.6, `docs/CAU-HOI-GAME.md` không còn cột giải thích; Q-01 → Q-12 giữ nguyên câu hỏi, đáp án, đáp án đúng so với `docs/nguon/QUIZ-KIEN-THUC.md` (test kiểm).

## Mã băm SHA-256 lúc chép

```
19465cc7ca4ee4f325558e8715440b2394eafe3ee3c4bed4da56f049b91b25aa  src/data/artifacts.json
3f61fbd13650fb937a92fb0146f297d79af9957f93e13843ebaf66ad7fae4052  src/data/mindmap.json
a1540a3ed32bca5fde9fa292b3813c76d93858bd5fa041a076cc23be1a3aa1ea  docs/nguon/THIET-KE-WEB-APP.md
1bb5aa3e10cb108e62781310921499b53657282dd9504b9b9df492ffb4f108d8  docs/nguon/QUIZ-KIEN-THUC.md
```
