# Hướng dẫn đưa game lên Vercel (cho người chưa dùng Vercel)

Game **Con đường tư tưởng HCM** chạy trên một **project Vercel thứ hai**, tách khỏi project của bảo tàng số. Phần giao diện là trang tĩnh. Phòng chơi online dùng Vercel Functions (thư mục `api/`) và cần một kho Redis miễn phí (**Upstash for Redis**, gói Free) gắn từ Vercel Marketplace.

Toàn bộ các bước dưới đây dùng **gói miễn phí** (Vercel Hobby + Upstash Free), không cần thẻ thanh toán. Thời gian khoảng 20–30 phút.

> Các trang Vercel / Upstash đổi giao diện khá thường xuyên. Nếu tên nút hơi khác, tìm mục có ý nghĩa tương tự. Tài liệu gốc: vercel.com/docs (mục Projects, Git, Functions, Marketplace, Deployment Protection) và upstash.com/docs/redis.

## Hiện trạng (04/10/2026)

Các bước 1–3 **đã xong** (mục 15.4 tài liệu thiết kế). Phần dưới giữ để tham khảo khi cần tạo lại project.

| Mục | Hiện trạng |
|---|---|
| Project game | https://hcm-202-web-omega.vercel.app — Production Branch = `game`, Root Directory = `./` |
| Redis | Upstash for Redis (Free) đã gắn — `/api/health` trả `"store":"redis"` |
| Đường `/api/*` | `vercel.json` có rewrite `/api/(.*)` → `/api/[...path]?__p=$1` (Vercel chỉ cho `[...path]` khớp một cấp ngoài Next.js). **Không xóa rewrite này** |
| Kiểm tra | `npm run check:deploy -- https://hcm-202-web-omega.vercel.app --long` đạt; phòng 3 máy trên bản deploy (`npm run e2e:online -- --url …`) đạt |
| Còn lại | Bước 4 (Deployment Protection, thử trên điện thoại) và bước 5 (xem Usage) — làm trong buổi diễn tập, ghi vào `docs/DIEN-TAP.md` |

---

## 0. Chuẩn bị

- **Tài khoản GitHub** có quyền với repo `plmkoi0/HCM202`. Nếu repo thuộc người khác, người đó phải cấp quyền, hoặc tự làm các bước này.
- **Tài khoản Vercel** gói **Hobby**: vào vercel.com → **Sign Up** → **Continue with GitHub**. Gói Hobby chỉ dùng cho mục đích cá nhân, phi thương mại, phù hợp với bài tập môn học.
- Nếu nhóm đã có project Vercel cho bảo tàng số thì giữ nguyên, **không sửa gì project đó**. Game là một project mới.

---

## 1. Tạo project thứ hai nối repo HCM202

1. Vào vercel.com/dashboard → **Add New…** → **Project**.
2. Ở **Import Git Repository**, chọn repo **HCM202** → **Import**. Nếu không thấy repo, bấm **Adjust GitHub App Permissions** và cho Vercel quyền đọc repo này.
3. Màn **Configure Project**:
   - **Project Name**: đặt tên dễ nhớ, ví dụ `con-duong-tu-tuong-hcm`. Tên này thành địa chỉ `https://con-duong-tu-tuong-hcm.vercel.app`.
   - **Framework Preset**: **Vite**.
   - **Root Directory**: để **`./`** (gốc nhánh). Không chọn thư mục con nào.
   - **Build Command**: `npm run build` (mặc định). **Output Directory**: `dist` (mặc định). **Install Command**: mặc định.
   - **Environment Variables**: chưa cần thêm gì (Redis thêm ở bước 2).
4. Bấm **Deploy**.
   - Lần deploy đầu lấy **nhánh mặc định** của repo, không phải nhánh `game`, nên có thể **báo lỗi**. Đó là chuyện bình thường, cứ làm tiếp bước 5.
5. Đặt nhánh chính là `game`: vào project vừa tạo → **Settings** → **Git** (hoặc **Environments** → **Production**) → **Production Branch** → gõ **`game`** → **Save**.
6. Kiểm tra **Fluid Compute** đang bật: **Settings** → **Functions** → **Fluid Compute** = **Enabled**. Project tạo sau 04/2025 bật sẵn. WebSocket trên Vercel cần mục này.
7. *(Nên làm)* **Vùng chạy function** gần Việt Nam: **Settings** → **Functions** → **Function Region** → **Singapore (sin1)** → **Save**. Nếu gói Hobby không cho đổi thì để mặc định; game vẫn chạy, chỉ chậm hơn một chút.
8. *(Nên làm — tránh build thừa)* Hai project cùng nối một repo nên mỗi lần đẩy code lên **bất kỳ nhánh nào**, cả hai project đều thử build. Ở project game, vào **Settings** → **Git** → **Ignored Build Step** → chọn **Custom** và dán lệnh:
   ```
   if [ "$VERCEL_GIT_COMMIT_REF" = "game" ]; then exit 1; else exit 0; fi
   ```
   Lệnh này chỉ build khi đẩy lên nhánh `game`. Theo quy ước của Vercel: thoát mã 1 = build, mã 0 = bỏ qua.
   - Nếu muốn, làm điều ngược lại ở project bảo tàng số: bỏ qua khi nhánh là `game`. Việc này chỉ là cài đặt trên Vercel, **không sửa mã nhánh web**.
9. Deploy lại nhánh `game`: **Deployments** → bấm **⋯** ở bản deploy gần nhất → **Redeploy**. Hoặc đẩy một commit mới lên nhánh `game`.
   - Mở địa chỉ `https://<tên-project>.vercel.app`: thấy trang chủ game là đúng.
   - "Chơi trên một máy" đã chơi được ngay, không cần Redis.

---

## 2. Gắn Upstash for Redis (gói Free) từ Marketplace

1. Trong project game → tab **Storage** (hoặc vercel.com/marketplace) → tìm **Upstash** → chọn **Upstash for Redis** (nhà cung cấp Upstash).
   - **Không chọn "Redis Cloud"**: gói Free của Redis Cloud chỉ cho 30 kết nối và 100 lệnh/giây, không đủ cho cả lớp (mục 15.4).
2. **Install** / **Create** → chọn:
   - **Plan**: **Free** (500.000 lệnh/tháng, 256 MB).
   - **Primary Region**: gần vùng function — **Singapore (ap-southeast-1)** nếu đã chọn sin1 ở bước 1.7; nếu không đổi vùng function thì chọn **US East (us-east-1)**.
   - Tên database: ví dụ `hcm202-game`.
3. **Connect Project**: chọn project game; môi trường chọn cả **Production**, **Preview**, **Development** → **Connect**.
4. **Kiểm biến môi trường**: project → **Settings** → **Environment Variables**. Phải thấy các biến Upstash tự thêm, thường là:
   - `KV_URL` — bắt đầu bằng `rediss://`; **server dùng biến này** khi không có `REDIS_URL`;
   - `KV_REST_API_URL`, `KV_REST_API_TOKEN`, `KV_REST_API_READ_ONLY_TOKEN` — server không dùng tới;
   - có thể có thêm `REDIS_URL` (cũng `rediss://…`).

   Server đọc lần lượt `REDIS_URL` → `KV_URL` → `UPSTASH_REDIS_URL` và lấy biến đầu tiên có giá trị `rediss://…` (xem `.env.example`).
   - Nếu chỉ có các biến `KV_REST_*` mà **không có biến nào bắt đầu bằng `rediss://`**: mở database trên Upstash (**Storage** → database → **Open in Upstash**), chép **Redis URL** dạng `rediss://default:…@….upstash.io:6379`. Thêm biến `REDIS_URL` với giá trị đó cho cả 3 môi trường.
   - **Không** chép giá trị các biến này vào file trong repo. Thông tin Redis chỉ nằm trong cài đặt Vercel.
5. **Deploy lại** (biến môi trường chỉ có hiệu lực ở bản deploy mới): **Deployments** → **⋯** → **Redeploy**.

---

## 3. Deploy và kiểm tra `/api/health`

1. Sau khi Redeploy xong (dấu ✓ xanh), mở:
   `https://<tên-project>.vercel.app/api/health`
2. Kết quả đúng (chữ thường, không định dạng):
   ```
   {"ok":true,"store":"redis","pingMs":3,"serverNow":…}
   ```
3. Nếu thấy:
   - `"store":"none"` và `"missing":[…]` → chưa có biến Redis, hoặc chưa deploy lại sau khi gắn → làm lại bước 2.4–2.5.
   - `"store":"redis"` mà `"ok":false` (kèm `"error"`) → Redis không kết nối được. Kiểm giá trị biến có bắt đầu bằng `rediss://` không. Thử **Redeploy**.
   - Trang 404 → nhánh deploy chưa phải `game`. Xem lại bước 1.5 và tab **Deployments** (cột Branch phải là `game`).
4. **Báo lại cho Claude Code địa chỉ project.** Claude Code sẽ chạy:
   ```
   npm run check:deploy -- https://<tên-project>.vercel.app --long
   ```
   Lệnh kiểm:
   - WebSocket chạy trên Vercel;
   - Vercel đóng kết nối sau ~300 giây và client tự nối lại;
   - polling dự phòng chạy.

   Kết quả ghi vào mục 15.4 tài liệu thiết kế. Nhóm cũng tự chạy được nếu máy có Node 22: `npm install` rồi chạy lệnh trên ở thư mục nhánh `game`.

**Bản deploy thử (preview):**
- Mỗi lần đẩy lên nhánh `game` là deploy **chính** (production), theo tên miền chính.
- Muốn thử thay đổi trước khi đưa lên tên miền chính: đẩy lên một nhánh khác, ví dụ `game-thu`. Vercel tạo **bản deploy thử** với link riêng.
- Nếu đã làm bước 1.8 thì sửa lệnh thành `if [ "$VERCEL_GIT_COMMIT_REF" = "game" ] || [ "$VERCEL_GIT_COMMIT_REF" = "game-thu" ]; then exit 1; else exit 0; fi`.

---

## 4. Thử trên điện thoại và kiểm tên miền chính (mục 15.6)

**Deployment Protection** (mặc định "Standard Protection"):
- **Tên miền chính** `https://<tên-project>.vercel.app` mở công khai.
- **Mọi link khác** (link riêng của từng bản deploy, link bản deploy thử) đòi đăng nhập Vercel.

1. **Thử trên điện thoại một bản deploy thử** → dùng **Shareable Links**:
   - mở bản deploy trong tab **Deployments** → nút **Share** (biểu tượng chia sẻ) → **Create Shareable Link** (hoặc **Copy link**);
   - gửi link đó qua Zalo / Messenger. Người nhận mở được mà không cần tài khoản Vercel; link có hạn dùng.
2. **Khi chơi thật** (trên lớp): luôn mở game bằng **tên miền chính** và tạo mã QR, link mời từ tên miền chính.
3. **Kiểm trước buổi học**: mở tên miền chính trong **cửa sổ ẩn danh** (hoặc trên điện thoại chưa đăng nhập Vercel), rồi mở `/api/health`.
   - Phải vào thẳng được, **không** hiện trang đăng nhập Vercel.
   - Nếu hiện trang đăng nhập: **Settings** → **Deployment Protection** → kiểm mục **Vercel Authentication** đang là "Standard Protection" (bảo vệ mọi thứ trừ tên miền chính), không phải "All Deployments".

---

## 5. Xem mức dùng (Usage) — trước và sau buổi chơi

Vượt hạn mức miễn phí của Vercel Hobby thì project **bị tạm dừng tới hết chu kỳ 30 ngày** (mục 15.5).

- **Vercel**: dashboard → chọn team/tài khoản → tab **Usage**. Xem:
  - **Function Invocations** (hạn mức 1.000.000/tháng);
  - **Active CPU** (4 giờ);
  - **Provisioned Memory** (360 GB-giờ);
  - **Fast Data Transfer** (100 GB).
- **Upstash**: project → **Storage** → database → **Open in Upstash** (hoặc console.upstash.com). Tab **Usage** / **Details** xem:
  - **Commands** (hạn mức 500.000/tháng, là hạn mức chặt nhất);
  - **Bandwidth**;
  - **Storage**.
- Ước lượng (mục 15.5): một buổi trên lớp 40 người + 20 người chơi một mình dùng khoảng **vài nghìn tới vài chục nghìn lệnh Redis**. Một tháng đủ cho nhiều buổi.
  - **Buổi tập nên dùng ít máy.**
  - Trước buổi chính, xem số lệnh đã dùng trong tháng.
- **Đo số lệnh Redis của một ván** (để xác minh ước lượng mục 15.5): trên Upstash ghi số **Commands** ngay trước khi tạo phòng, chơi một ván 3 người tới hết, chờ 1–2 phút rồi ghi lại số **Commands**. Gửi hai số (và số người, số phút) cho Claude Code để cập nhật mục 15.5.
- Dự phòng nếu server có sự cố: luôn còn **"Chơi trên một máy"** và **bản offline** (`phat-hanh/HCM202-Con-duong-tu-tuong.zip`).

---

## Tóm tắt việc nhóm cần làm

- [x] Bước 1: tạo project, Production Branch = `game`, Root Directory = `./`, Fluid Compute bật.
- [x] Bước 2: gắn Upstash for Redis (Free), kiểm biến `rediss://…`, Redeploy.
- [x] Bước 3: `/api/health` trả `"ok":true,"store":"redis"` → báo Claude Code địa chỉ project.
- [ ] Bước 4: kiểm tên miền chính mở không cần đăng nhập; thử Shareable Link trên điện thoại.
- [ ] Bước 5: biết chỗ xem Usage của Vercel và Upstash.
