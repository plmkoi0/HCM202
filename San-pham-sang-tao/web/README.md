# Web app "Của dân · Do dân · Vì dân — Bảo tàng số"

Thiết kế: [`../THIET-KE-WEB-APP.md`](../THIET-KE-WEB-APP.md).

## Chạy trên máy

```bash
npm install
npm run dev      # mở http://localhost:5173
npm run test     # unit test (Vitest)
npm run build    # kiểm tra kiểu + đóng gói bản online vào dist/
npm run lint
npm run build:offline    # bản offline một file: dist-offline/index.html
npm run package:offline  # build offline + nén dist-offline/HCM202-San-pham-sang-tao.zip
```

## Sửa nội dung (không cần sửa code)

| File | Nội dung |
|---|---|
| `src/data/artifacts.json` | Hiện vật HV-01 → HV-13 |
| `src/data/quiz.json` | Quiz kiến thức: 10 câu hỏi và các mức xếp loại (xem dưới) |
| `src/data/sources.json` | Nguồn tham khảo APA7 |
| `src/data/team.json` | Thành viên nhóm |
| `src/data/site.json` | Chữ giao diện, `siteUrl` |
| `src/data/mindmap.json` | Sơ đồ tư duy 3 trụ cột (mục 2) |

### Cấu trúc `quiz.json` (quiz kiến thức "Bạn hiểu Nhà nước của dân đến đâu?")

Nội dung lấy nguyên văn từ `../QUIZ-KIEN-THUC.md` (nhóm đã duyệt). Chỉ dùng 10 câu chính; Câu 11, 12 dự phòng không đưa vào web.

```json
{
  "closing": "Chủ nhân không đứng ngoài",
  "levels": [
    { "id": "am-hieu", "min": 9, "max": 10, "name": "Chủ nhân am hiểu", "message": "…" }
  ],
  "questions": [
    {
      "id": "q1",
      "pillar": "dan-chu",
      "title": "Bản chất nhà nước",
      "prompt": "…",
      "options": ["…", "…", "…", "…"],
      "correctIndex": 0,
      "explain": "… (GT tr. 83).",
      "relatedArtifacts": ["HV-12"]
    }
  ]
}
```

- `pillar`: `dan-chu`, `phap-quyen` hoặc `trong-sach` (hiện thành nhãn trụ cột).
- `options`: đúng 4 lựa chọn theo thứ tự gốc; `correctIndex` là vị trí đáp án đúng trong thứ tự này (0–3). Web tự trộn thứ tự khi hiển thị, nên không cần xáo trong file. Lựa chọn không đánh chữ A–D, vì vậy giải thích không nên viết "Phương án B".
- `relatedArtifacts`: id hiện vật có trong `artifacts.json` (chip mở cửa sổ hiện vật).
- `levels`: mỗi mức một khoảng điểm `min`–`max` (tính cả hai đầu). Các khoảng phải phủ kín 0–10 và không chồng lấn. `id` dùng cho link chia sẻ `?kq=<id>`, chỉ gồm chữ thường, số, dấu gạch ngang.
- Sửa xong chạy `npm run test`: test kiểm tra 4 lựa chọn mỗi câu, `correctIndex` hợp lệ, hiện vật liên quan tồn tại và levels phủ kín 0–10.

- Trường còn thiếu ghi `TODO`. Web hiển thị các trường này dưới dạng "đang bổ sung".
- Hiện vật có `"verified": false` hiện nhãn **[Chờ xác minh]**. Đổi thành `true` sau khi nhóm xác minh và ghi nguồn.
- **Ẩn hiện vật chưa sẵn sàng** (phương án dự phòng khi nộp): thêm `"hidden": true` vào hiện vật đó trong `artifacts.json`, rồi build lại. Hiện vật ẩn biến mất khỏi dòng thời gian, số đếm bộ lọc, tổng tiến độ, nút Trước/Sau và chip "Hiện vật liên quan" của quiz. Xóa trường này (hoặc đặt `false`) để hiện lại. Phải còn tối thiểu 8 hiện vật hiển thị; `npm run test` sẽ báo lỗi nếu ít hơn.
- `team.json` rỗng thì mục "Nhóm" tự ẩn.
- Ảnh: đặt vào `public/images/artifacts/HV-xx.jpg`, rồi điền `image.src` = `"images/artifacts/HV-xx.jpg"`, `image.alt` và `image.credit`. Khi `src` rỗng, web dùng khung giữ chỗ "Ảnh tư liệu — đang bổ sung".

## Bản offline để nộp bài (một file HTML)

```bash
npm run package:offline
```

Lệnh này build bản offline rồi tạo `dist-offline/HCM202-San-pham-sang-tao.zip`, gồm:

- `index.html`: toàn bộ web trong **một file**. JS, CSS, font (Noto Serif, Be Vietnam Pro), ảnh trong `public/images/` và favicon đều được nhúng base64. Mở bằng cách bấm đúp, không cần mạng, không gửi request nào ra ngoài.
- `HUONG-DAN-CHAY.txt`: hướng dẫn ngắn cho người chấm (mẫu ở `scripts/HUONG-DAN-CHAY.txt`).

Khác biệt so với bản online (bật bằng `VITE_OFFLINE=true` trong `.env.offline`):

- Không có nút **Chia sẻ** (Web Share). Chỉ còn **Tải thẻ** 1080×1920 / 1080×1080 và **Sao chép link**.
- **Sao chép link** và mã QR trên thẻ trỏ tới `siteUrl` online. Khi `siteUrl` còn `TODO`, nút sao chép bị khóa và thẻ PNG không có mã QR.
- Chân trang có dòng "Bản offline — xem bản online tại …".

**Build lại bản offline** mỗi khi sửa nội dung, thêm ảnh hoặc điền `siteUrl`. Thư mục `dist-offline/` không được commit (đã có trong `.gitignore`).
