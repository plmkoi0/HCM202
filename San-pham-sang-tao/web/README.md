# Web app "Của dân · Do dân · Vì dân — Bảo tàng số"

Thiết kế: [`../THIET-KE-WEB-APP.md`](../THIET-KE-WEB-APP.md).

Web gồm **một file `index.html`**, mở trên trình duyệt và chạy không cần mạng; dùng để demo trên lớp.

## Chạy khi phát triển

```bash
npm install
npm run dev      # mở http://localhost:5173, tự tải lại khi sửa
npm run test     # unit test (Vitest)
npm run lint
```

## Sửa nội dung (không cần sửa code)

| File | Nội dung |
|---|---|
| `src/data/artifacts.json` | Hiện vật HV-01 → HV-13 |
| `src/data/quiz.json` | Quiz kiến thức: 10 câu hỏi và các mức xếp loại (xem dưới) |
| `src/data/sources.json` | Nguồn tham khảo APA7 |
| `src/data/team.json` | Thành viên nhóm |
| `src/data/site.json` | Chữ giao diện |
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
- `levels`: mỗi mức một khoảng điểm `min`–`max` (tính cả hai đầu). Các khoảng phải phủ kín 0–10 và không chồng lấn. `id` dùng trong tên file thẻ kết quả PNG, chỉ gồm chữ thường, số, dấu gạch ngang.
- Sửa xong chạy `npm run test`: test kiểm tra 4 lựa chọn mỗi câu, `correctIndex` hợp lệ, hiện vật liên quan tồn tại và levels phủ kín 0–10.

- Trường còn thiếu ghi `TODO`. Web hiển thị các trường này dưới dạng "đang bổ sung".
- Hiện vật có `"verified": false` hiện nhãn **[Chờ xác minh]**. Đổi thành `true` sau khi nhóm xác minh và ghi nguồn.
- **Ẩn hiện vật chưa sẵn sàng** (phương án dự phòng khi nộp): thêm `"hidden": true` vào hiện vật đó trong `artifacts.json`, rồi build lại. Hiện vật ẩn biến mất khỏi dòng thời gian, số đếm bộ lọc, tổng tiến độ, nút Trước/Sau và chip "Hiện vật liên quan" của quiz. Xóa trường này (hoặc đặt `false`) để hiện lại. Phải còn tối thiểu 8 hiện vật hiển thị; `npm run test` sẽ báo lỗi nếu ít hơn.
- `team.json` rỗng thì mục "Nhóm" tự ẩn.
- Ảnh: đặt vào `public/images/artifacts/HV-xx.jpg`, rồi điền `image.src` = `"images/artifacts/HV-xx.jpg"`, `image.alt` và `image.credit`. Khi `src` rỗng, web dùng khung giữ chỗ "Ảnh tư liệu — đang bổ sung".

## Build và đóng gói

```bash
npm run build    # kiểm tra kiểu + tạo dist/index.html (một file duy nhất)
npm run package  # build rồi nén dist/HCM202-San-pham-sang-tao.zip
```

- `dist/index.html`: toàn bộ web trong **một file**. JS, CSS, font (Noto Serif, Be Vietnam Pro), ảnh trong `public/images/` và favicon đều được nhúng base64; web không gửi request nào ra ngoài.
- `dist/HCM202-San-pham-sang-tao.zip`: file nộp bài, gồm `index.html` và `HUONG-DAN-CHAY.txt` (mẫu ở `scripts/HUONG-DAN-CHAY.txt`).
- Kết quả quiz lưu thành **thẻ PNG** (1080×1920 và 1080×1080) bằng nút tải thẻ.
- **Build lại** (`npm run package`) mỗi khi sửa nội dung hoặc thêm ảnh. Thư mục `dist/` không được commit (đã có trong `.gitignore`).

## Mở file

1. Giải nén file zip ra một thư mục (không mở trực tiếp bên trong file zip).
2. Bấm đúp `index.html`. Nên dùng Google Chrome hoặc Microsoft Edge.
3. Không cần mạng Internet, không cần cài đặt.

## Mẹo trình chiếu

- **F11**: xem toàn màn hình (nhấn lại để thoát).
- **Ctrl +** / **Ctrl −**: phóng to / thu nhỏ chữ cho cả lớp nhìn rõ; **Ctrl 0**: về cỡ mặc định.
- Màn hình máy chiếu 1280×720 hoặc 1920×1080 đều hiển thị đủ, không cuộn ngang.
- Tiến độ "đã xem" của bảo tàng lưu trong trình duyệt của máy đang dùng; muốn bắt đầu lại từ 0/13 thì mở cửa sổ ẩn danh.
