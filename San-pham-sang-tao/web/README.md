# Web app "Của dân · Do dân · Vì dân — Bảo tàng số"

Thiết kế: [`../THIET-KE-WEB-APP.md`](../THIET-KE-WEB-APP.md).

## Chạy trên máy

```bash
npm install
npm run dev      # mở http://localhost:5173
npm run build    # kiểm tra kiểu + đóng gói vào dist/
npm run lint
```

## Sửa nội dung (không cần sửa code)

| File | Nội dung |
|---|---|
| `src/data/artifacts.json` | Hiện vật HV-01 → HV-13 |
| `src/data/quiz.json` | 8 câu hỏi, 4 kiểu công dân, thứ tự hòa điểm |
| `src/data/sources.json` | Nguồn tham khảo APA7 |
| `src/data/team.json` | Thành viên nhóm |
| `src/data/site.json` | Chữ ở hero, lời dẫn, cầu nối, chân trang |

- Trường còn thiếu ghi `TODO`. Web hiển thị các trường này dưới dạng "đang bổ sung".
- Hiện vật có `"verified": false` hiện nhãn **[Chờ xác minh]**. Đổi thành `true` sau khi nhóm xác minh và ghi nguồn.
- Ảnh: đặt vào `public/images/artifacts/HV-xx.jpg`, rồi điền `image.src` = `"images/artifacts/HV-xx.jpg"`, `image.alt` và `image.credit`. Khi `src` rỗng, web dùng khung giữ chỗ "Ảnh tư liệu — đang bổ sung".
