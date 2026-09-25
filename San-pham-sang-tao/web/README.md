# Web app "Của dân · Do dân · Vì dân — Bảo tàng số"

Thiết kế: [`../THIET-KE-WEB-APP.md`](../THIET-KE-WEB-APP.md).

## Chạy trên máy

```bash
npm install
npm run dev      # mở http://localhost:5173
npm run test     # unit test (Vitest)
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
| `src/data/site.json` | Chữ giao diện, `siteUrl` |
| `src/data/mindmap.json` | Sơ đồ tư duy 3 trụ cột (mục 2) |

- Trường còn thiếu ghi `TODO`. Web hiển thị các trường này dưới dạng "đang bổ sung".
- Hiện vật có `"verified": false` hiện nhãn **[Chờ xác minh]**. Đổi thành `true` sau khi nhóm xác minh và ghi nguồn.
- `team.json` rỗng thì mục "Nhóm" tự ẩn.
- Ảnh: đặt vào `public/images/artifacts/HV-xx.jpg`, rồi điền `image.src` = `"images/artifacts/HV-xx.jpg"`, `image.alt` và `image.credit`. Khi `src` rỗng, web dùng khung giữ chỗ "Ảnh tư liệu — đang bổ sung".

## Bản online trên Vercel (không liệt kê công khai)

Bản online **không** được công cụ tìm kiếm liệt kê. Có ba lớp chặn: thẻ `<meta name="robots" content="noindex, nofollow">` trong `index.html`, header `X-Robots-Tag: noindex, nofollow` (khai báo trong `vercel.json` ở gốc repo) và `public/robots.txt` (`Disallow: /`). Ai có link vẫn mở được. Web không gắn dịch vụ thống kê nào.

`vercel.json` đã khai báo sẵn lệnh cài đặt, lệnh build (`San-pham-sang-tao/web`) và thư mục kết quả (`San-pham-sang-tao/web/dist`), nên trên Vercel không cần đổi Root Directory hay lệnh build.

### Kết nối Vercel với repo riêng tư (làm một lần, trên trình duyệt)

1. Vào <https://vercel.com>, chọn **Continue with GitHub** và đăng nhập bằng tài khoản GitHub sở hữu repo `plmkoi0/HCM202`. Gói **Hobby** (miễn phí) dùng được với repo riêng tư của tài khoản cá nhân. Repo nằm trong GitHub Organization thì cần gói trả phí.
2. Bấm **Add New… → Project**.
3. Ở **Import Git Repository**, nếu chưa thấy `HCM202` (repo riêng tư nên Vercel chưa được cấp quyền):
   - bấm **Adjust GitHub App Permissions** (hoặc *Configure GitHub App*);
   - trên trang GitHub vừa mở, ở **Repository access**, chọn **Only select repositories**, thêm `HCM202`, bấm **Save**;
   - quay lại Vercel, bấm **Import** cạnh `HCM202`.
4. Màn hình **Configure Project**:
   - **Project Name**: tên ngắn, không dấu (vd. `hcm202-cua-dan`). Tên này tạo ra địa chỉ `https://<tên>.vercel.app`, nên tránh tên dễ đoán nếu không muốn người lạ gõ trúng.
   - **Framework Preset**: *Other*.
   - **Root Directory**: để nguyên `./`.
   - **Build and Output Settings**, **Environment Variables**: để trống (đã có trong `vercel.json`).
   - Bấm **Deploy** và chờ build xong (khoảng 1 phút).
5. Vào **Settings → Git**, kiểm tra **Production Branch** là nhánh chứa code web. Hiện code nằm ở nhánh `claude/zen-fermi-bg6som`; nếu nhóm gộp vào `main` thì chọn `main`. Mỗi lần push lên nhánh này, Vercel tự build lại. Push lên nhánh khác sẽ tạo bản *Preview*.
6. Chia sẻ **địa chỉ Production** (`https://<tên>.vercel.app`), không chia sẻ link riêng của từng lần deploy (có chuỗi ký tự ngẫu nhiên). Nếu người khác mở link mà bị yêu cầu đăng nhập Vercel, vào **Settings → Deployment Protection** và bảo đảm **Vercel Authentication** không áp dụng cho Production (chọn *Standard Protection* hoặc tắt).
7. Điền link vào `src/data/site.json` → `siteUrl` (dạng `https://<tên>.vercel.app/`). Thêm `<meta property="og:url" content="…">` trong `index.html`. Commit và push, Vercel sẽ tự build lại. Sau đó build lại bản offline (mục dưới) để link và mã QR trong bản offline trỏ đúng.

Khi `siteUrl` còn là `TODO`, bản online tự dùng địa chỉ đang mở để tạo link chia sẻ và mã QR.

Kiểm tra sau khi deploy: mở `https://<tên>.vercel.app/robots.txt` phải thấy `Disallow: /`.
